/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "@/lib/db/clientDb";

let isPushing = false;
let isPulling = false;
const SYNC_TRIGGER_EVENT = "taskglyph-sync-trigger";
const LAST_PULL_KEY = "taskglyph_last_pull";
const LAST_USER_KEY = "taskglyph_user_id"; // ✅ Stores which user owns the local DB

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
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SYNC_TRIGGER_EVENT));
  }
}

export function isOnline(): boolean {
  return typeof window !== "undefined" && navigator.onLine;
}

/**
 * ✅ CRITICAL FIX: Initialize Session
 * Checks if the current user matches the stored user.
 * If not, it WIPES the local database to prevent data mixing.
 */
export async function initializeUserSession(userId: string) {
  const storedUserId = localStorage.getItem(LAST_USER_KEY);

  if (storedUserId && storedUserId !== userId) {
    console.warn(
      "⚠️ User changed! Wiping local database to prevent data mixing..."
    );

    // 1. Delete the entire database
    await db.delete();

    // 2. Clear sync timestamp
    localStorage.removeItem(LAST_PULL_KEY);

    // 3. Re-open the database (creates fresh tables)
    await db.open();
    console.log("✅ Local DB wiped and re-initialized for new user.");
  }

  // Save the current user ID
  localStorage.setItem(LAST_USER_KEY, userId);
}

export async function pushChangesToServer(): Promise<void> {
  if (!isOnline()) return;

  if (isPushing) {
    pushNeededAfterCurrent = true;
    return;
  }

  isPushing = true;

  try {
    const outbox = await db.syncOutbox.toArray();
    if (outbox.length === 0) return;

    // ✅ Priority Sorting (Folders before Notes)
    const priorityMap: Record<string, number> = {
      project: 1,
      folder: 1,
      task: 2,
      note: 2,
      diary: 3,
      pomodoro: 3,
      notification: 3,
    };

    outbox.sort((a, b) => {
      const pA = priorityMap[a.entityType] || 99;
      const pB = priorityMap[b.entityType] || 99;
      if (pA !== pB) return pA - pB;
      return a.timestamp - b.timestamp;
    });

    console.log(`📤 PUSH: Flushing ${outbox.length} operations...`);

    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operations: outbox }),
    });

    if (response.ok) {
      const result = await response.json();
      const successIds = result.results
        .filter((r: any) => r.success)
        .map((r: any) => r.id);
      if (successIds.length > 0) {
        await db.syncOutbox.bulkDelete(successIds);
      }
    }
  } catch (error) {
    console.error("❌ PUSH Error:", error);
  } finally {
    isPushing = false;
    if (pushNeededAfterCurrent) {
      pushNeededAfterCurrent = false;
      setTimeout(pushChangesToServer, 50);
    }
  }
}

export async function pullChangesFromServer(): Promise<void> {
  if (!isOnline()) return;
  if (isPulling) return;
  isPulling = true;

  try {
    let lastPulledAt = localStorage.getItem(LAST_PULL_KEY) || "0";

    // ✅ CRITICAL FIX: "Deleted from Console" Scenario
    if (lastPulledAt !== "0") {
      const taskCount = await db.tasks.count();
      const noteCount = await db.notes.count();
      if (taskCount === 0 && noteCount === 0) {
        console.warn(
          "⚠️ Local DB appears empty but has sync timestamp. Forcing full re-sync."
        );
        lastPulledAt = "0";
      }
    }

    console.log(`🔽 PULL: Fetching changes since ${lastPulledAt}`);

    const response = await fetch(`/api/sync?since=${lastPulledAt}`);
    if (!response.ok) throw new Error("Sync failed");

    const data = await response.json();

    if (lastPulledAt === "0") {
      console.log("🧹 Fresh sync detected: Ensuring clean slate...");
    }

    const hasNewData = [
      data.userMetadata,
      data.projects,
      data.tasks,
      data.notes,
      data.folders,
      data.diaryEntries,
      data.pomodoroSessions,
      data.notifications,
    ].some((arr) => Array.isArray(arr) && arr.length > 0);

    if (!hasNewData) {
      console.log("✅ PULL: No new data.");
      if (data.timestamp) localStorage.setItem(LAST_PULL_KEY, data.timestamp);
      return;
    }

    console.log("🔽 PULL: Applying updates...");

    // ✅ DATA SANITIZATION TRANSACTION
    // We convert strings (from Postgres BIGINT) back to Numbers for Dexie
    await db.transaction("rw", db.tables, async () => {
      // 1. User Metadata
      if (data.userMetadata?.length) {
        await db.userMetadata.bulkPut(data.userMetadata);
      }

      // 2. Projects (Fix Dates)
      if (data.projects?.length) {
        const fixedProjects = data.projects.map((p: any) => ({
          ...p,
          createdAt: Number(p.createdAt),
          updatedAt: Number(p.updatedAt),
        }));
        await db.projects.bulkPut(fixedProjects);
      }

      // 3. Tasks (Fix Dates)
      if (data.tasks?.length) {
        const fixedTasks = data.tasks.map((t: any) => ({
          ...t,
          createdAt: Number(t.createdAt),
          updatedAt: Number(t.updatedAt),
          dueDate: t.dueDate ? Number(t.dueDate) : null,
          reminderAt: t.reminderAt ? Number(t.reminderAt) : null,
        }));
        await db.tasks.bulkPut(fixedTasks);
      }

      // 4. Notes (Fix Dates - especially deletedAt!)
      if (data.notes?.length) {
        const fixedNotes = data.notes.map((n: any) => ({
          ...n,
          createdAt: Number(n.createdAt),
          updatedAt: Number(n.updatedAt),
          deletedAt: n.deletedAt ? Number(n.deletedAt) : null,
        }));
        await db.notes.bulkPut(fixedNotes);
      }

      // 5. Folders (Fix Dates)
      if (data.folders?.length) {
        const fixedFolders = data.folders.map((f: any) => ({
          ...f,
          createdAt: Number(f.createdAt),
          updatedAt: Number(f.updatedAt),
        }));
        await db.folders.bulkPut(fixedFolders);
      }

      // 6. Diary (Fix Dates)
      if (data.diaryEntries?.length) {
        const fixedDiary = data.diaryEntries.map((d: any) => ({
          ...d,
          createdAt: Number(d.createdAt),
        }));
        await db.diaryEntries.bulkPut(fixedDiary);
      }

      // 7. Pomodoro
      if (data.pomodoroSessions?.length) {
        await db.pomodoroSessions.bulkPut(data.pomodoroSessions);
      }

      // 8. Notifications
      if (data.notifications?.length) {
        await db.notifications.bulkPut(data.notifications);
      }
    });

    localStorage.setItem(LAST_PULL_KEY, data.timestamp);
    console.log("✅ PULL Complete.");
  } catch (error) {
    console.error("❌ PULL Error:", error);
  } finally {
    isPulling = false;
  }
}

export function startBackgroundSync(userId: string): () => void {
  console.log(`🔄 Starting sync service for user: ${userId}`);

  // 1. Initialize Session (Wipe DB if user changed)
  initializeUserSession(userId).then(() => {
    // 2. Only after initialization, start sync
    if (isOnline()) {
      pushChangesToServer().then(() => pullChangesFromServer());
    }
  });

  const handleOnline = () => {
    console.log("🌐 Online - Syncing...");
    pushChangesToServer().then(() => pullChangesFromServer());
  };
  const debouncedHandleOnline = debounce(handleOnline, 2000);
  window.addEventListener("online", debouncedHandleOnline);

  const handleSyncTrigger = () => pushChangesToServer();
  window.addEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);

  const pullInterval = setInterval(pullChangesFromServer, 60000);

  return () => {
    window.removeEventListener("online", debouncedHandleOnline);
    window.removeEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);
    clearInterval(pullInterval);
  };
}
