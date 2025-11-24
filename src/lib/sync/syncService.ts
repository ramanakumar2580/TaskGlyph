/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "@/lib/db/clientDb";

let isPushing = false;
let isPulling = false;
const SYNC_TRIGGER_EVENT = "taskglyph-sync-trigger";
const LAST_PULL_KEY = "taskglyph_last_pull";

// ✅ --- [FIX] A new flag to queue a push ---
let pushNeededAfterCurrent = false;

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced as (...args: Parameters<F>) => void;
}

export function triggerSync() {
  console.log("Poking sync service...");
  window.dispatchEvent(new Event(SYNC_TRIGGER_EVENT));
}

export function isOnline(): boolean {
  return typeof window !== "undefined" && navigator.onLine;
}

export async function pushChangesToServer(): Promise<void> {
  if (!isOnline()) {
    console.log("Offline, PUSH aborted.");
    return;
  }

  // ✅ --- [FIX #1] Handle the "deadlock" ---
  // If a push is already running, set a flag to
  // run another one right after it finishes.
  if (isPushing) {
    console.log("PUSH already in progress, queuing another push.");
    pushNeededAfterCurrent = true;
    return;
  }
  // --- End of Fix #1 ---

  isPushing = true;

  try {
    // Get the outbox *inside* the try block
    const outbox = await db.syncOutbox.toArray();

    if (outbox.length === 0) {
      console.log("✅ PUSH: Outbox is empty");
      // Do not return here. Let the 'finally' block run.
    } else {
      console.log(`📤 PUSH: Flushing ${outbox.length} operations to server...`);

      const response = await fetch("/api/sync", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operations: outbox }),
      });

      if (!response.ok) {
        let errorText = "Unknown error";
        try {
          const error = await response.json();
          errorText = JSON.stringify(error, null, 2);
        } catch {
          errorText = await response.text();
        }
        console.log(`❌ PUSH failed: ${errorText}`);
      } else {
        const result = await response.json();
        console.log("✅ PUSH result:", result);

        const successIds = result.results
          .filter((r: any) => r.success)
          .map((r: any) => r.id);

        if (successIds.length > 0) {
          await db.syncOutbox.bulkDelete(successIds);
          console.log(
            `🗑️ PUSH: Removed ${successIds.length} synced operations from outbox`
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ PUSH: Network error during sync:", error);
  } finally {
    isPushing = false; // Release the lock
    console.log("PUSH finished.");

    // Check if another push was requested while this one was running
    if (pushNeededAfterCurrent) {
      console.log("Changes came in during push. Running another push.");
      pushNeededAfterCurrent = false; // Clear the flag
      setTimeout(pushChangesToServer, 50);
    }
    // --- End of Fixes ---
  }
}

export async function pullChangesFromServer(): Promise<void> {
  if (!isOnline()) {
    console.log("Offline, PULL aborted.");
    return;
  }
  if (isPulling) {
    console.log("PULL already in progress, skipping.");
    return;
  }
  isPulling = true;

  try {
    const lastPulledAt = localStorage.getItem(LAST_PULL_KEY) || 0;
    console.log(`🔽 PULL: Fetching changes since ${lastPulledAt}`);

    const response = await fetch(`/api/sync?since=${lastPulledAt}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();

    const dataArrays = [
      data.userMetadata,
      data.projects,
      data.tasks,
      data.notes,
      data.folders,
      data.diaryEntries,
      data.pomodoroSessions,
      data.notifications,
    ];
    const hasNewData = dataArrays.some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );

    if (!hasNewData) {
      console.log("✅ PULL: No new changes from server.");
      isPulling = false;
      return;
    }

    console.log("🔽 PULL: Applying changes from server...");
    await db.transaction(
      "rw",
      [
        db.userMetadata,
        db.projects,
        db.tasks,
        db.notes,
        db.folders,
        db.diaryEntries,
        db.pomodoroSessions,
        db.notifications,
      ],
      async () => {
        if (data.userMetadata.length > 0)
          await db.userMetadata.bulkPut(data.userMetadata);
        if (data.projects.length > 0) await db.projects.bulkPut(data.projects);
        if (data.tasks.length > 0) await db.tasks.bulkPut(data.tasks);
        if (data.notes.length > 0) await db.notes.bulkPut(data.notes);
        if (data.folders.length > 0) await db.folders.bulkPut(data.folders);
        if (data.diaryEntries.length > 0)
          await db.diaryEntries.bulkPut(data.diaryEntries);
        if (data.pomodoroSessions.length > 0)
          await db.pomodoroSessions.bulkPut(data.pomodoroSessions);
        if (data.notifications.length > 0)
          await db.notifications.bulkPut(data.notifications);
      }
    );

    localStorage.setItem(LAST_PULL_KEY, data.timestamp);
    console.log("✅ PULL: Sync complete. New timestamp set to", data.timestamp);
  } catch (error) {
    console.error("❌ PULL: Error fetching changes:", error);
  } finally {
    isPulling = false;
  }
}

export function startBackgroundSync(): () => void {
  console.log("Starting full two-way background sync...");

  if (isOnline()) {
    pushChangesToServer();
  }

  if (isOnline()) {
    pullChangesFromServer();
  }

  const handleOnline = () => {
    console.log("🌐 Back online — triggering PUSH");
    pushChangesToServer();
  };

  const debouncedHandleOnline = debounce(handleOnline, 2000);
  window.addEventListener("online", debouncedHandleOnline);

  // 4. Listen for pokes
  const handleSyncTrigger = () => {
    console.log("Sync poke received, triggering push...");
    // The push function itself will now handle the lock and queue
    pushChangesToServer();
  };
  window.addEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);

  const pullInterval = setInterval(pullChangesFromServer, 60000);

  return () => {
    window.removeEventListener("online", debouncedHandleOnline);
    window.removeEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);
    clearInterval(pullInterval);
  };
}
