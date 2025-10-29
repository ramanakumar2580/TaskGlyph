/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "@/lib/db/clientDb";

// ✅ ADDED: A "lock" to prevent multiple syncs at once
let isSyncing = false;
// ✅ ADDED: A timer for debouncing sync pokes
let syncTimeout: NodeJS.Timeout | null = null;
// ✅ ADDED: A custom event name to "poke" the sync service
const SYNC_TRIGGER_EVENT = "taskglyph-sync-trigger";

// ✅ ADDED: A new function to call from your hooks (useTasks, etc.)
export function triggerSync() {
  console.log("Poking sync service...");
  window.dispatchEvent(new Event(SYNC_TRIGGER_EVENT));
}

// Check if user is online
export function isOnline(): boolean {
  return typeof window !== "undefined" && navigator.onLine;
}

// Get user tier from IndexedDB
async function getUserTier(userId: string): Promise<string> {
  const userMeta = await db.userMetadata.get(userId);
  return userMeta?.tier || "free";
}

// Flush sync outbox to server
export async function flushSyncOutbox(userId: string): Promise<void> {
  // ✅ ADDED: Check online status and sync lock
  if (!isOnline()) {
    console.log("Offline, flush aborted.");
    return;
  }
  if (isSyncing) {
    console.log("Sync already in progress, skipping flush request.");
    return;
  }
  isSyncing = true;

  // ✅ ALL TIERS SYNC NOW — including Free (with limits enforced on server)
  const outbox = await db.syncOutbox.toArray();
  if (outbox.length === 0) {
    console.log("✅ Sync outbox is empty");
    isSyncing = false; // ✅ Release lock
    return;
  }

  console.log(`📤 Flushing ${outbox.length} operations to server...`);

  try {
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
      console.log(`❌ Sync failed: ${errorText}`);
      return; // Do not delete operations, try again next time
    }

    const result = await response.json();
    console.log("✅ Sync result:", result);

    // Remove successfully synced operations
    const successIds = result.results
      .filter((r: any) => r.success)
      .map((r: any) => r.id);

    if (successIds.length > 0) {
      await db.syncOutbox.bulkDelete(successIds);
      console.log(
        `🗑️ Removed ${successIds.length} synced operations from outbox`
      );
    }
  } catch (error) {
    console.error("❌ Network error during sync:", error);
  } finally {
    // ✅ ADDED: Always release the lock
    isSyncing = false;
  }
}

// Start background sync (call this on app load)
export function startBackgroundSync(userId: string): () => void {
  // 1. Sync immediately if online
  if (isOnline()) {
    flushSyncOutbox(userId);
  }

  // 2. Listen for online events (sync immediately)
  const handleOnline = () => {
    console.log("🌐 Back online — triggering sync");
    flushSyncOutbox(userId);
  };
  window.addEventListener("online", handleOnline);

  // 3. ✅ ADDED: Listen for pokes (debounced sync)
  const handleSyncTrigger = () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    console.log("Sync poke received, debouncing...");
    syncTimeout = setTimeout(() => {
      flushSyncOutbox(userId);
    }, 1500); // 1.5 second debounce
  };
  window.addEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);

  // 4. Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    // ✅ ADDED: Cleanup for new listener and timeout
    window.removeEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
  };
}
