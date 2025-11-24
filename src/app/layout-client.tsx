"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { startBackgroundSync } from "@/lib/sync/syncService";
import db from "@/lib/db/clientDb"; // Import your Dexie db

// A simple loading spinner component
function InitialSyncLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#111",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <p>Syncing your data...</p>
    </div>
  );
}

// We create a new component that *contains* the sync logic
// because we can only call useSession() inside a <SessionProvider>.
function SyncManager({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isInitialSyncing, setIsInitialSyncing] = useState(true);
  const [isSyncLogicDone, setIsSyncLogicDone] = useState(false);

  useEffect(() => {
    // Prevent this effect from running more than once
    if (!session?.user?.id || isSyncLogicDone) {
      if (!session?.user?.id) {
        setIsInitialSyncing(false); // Not logged in, so not syncing
      }
      return;
    }

    // Mark that we've run the logic
    setIsSyncLogicDone(true);

    const checkAndFetchData = async () => {
      try {
        console.log("Checking local database...");
        // Check if the main tables are empty
        const noteCount = await db.notes.count();
        const taskCount = await db.tasks.count();
        const projectCount = await db.projects.count();

        // If all are 0, it's a fresh (or cleared) database
        if (noteCount === 0 && taskCount === 0 && projectCount === 0) {
          console.log("Local database is empty. Checking online status...");

          // ✅ --- [THE FIX] ---
          // Only attempt to fetch from the server if we are ONLINE.
          // If we are offline, we just skip this and the app will
          // load in an empty state, which is correct.
          if (navigator.onLine) {
            console.log("Online. Fetching from server...");

            // Call our new GET endpoint
            const res = await fetch("/api/sync");
            if (!res.ok) {
              throw new Error(`Server error: ${res.statusText}`);
            }

            const data = await res.json();
            console.log("Got data from server, populating local database...");

            localStorage.setItem("taskglyph_last_pull", data.timestamp);

            // Use a Dexie transaction to add all data at once
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
                // Use 'bulkPut' for all tables (idempotent)
                await db.userMetadata.bulkPut(data.userMetadata);
                await db.projects.bulkPut(data.projects);
                await db.tasks.bulkPut(data.tasks);
                await db.notes.bulkPut(data.notes);
                await db.folders.bulkPut(data.folders);
                await db.diaryEntries.bulkPut(data.diaryEntries);
                await db.pomodoroSessions.bulkPut(data.pomodoroSessions);
                await db.notifications.bulkPut(data.notifications);
              }
            );
            console.log("Local database populated successfully.");
          } else {
            console.log("Offline. Skipping server fetch. App will load empty.");
          }
          // ✅ --- END OF FIX ---
        } else {
          console.log(
            "Local database already has data. Skipping initial fetch."
          );
        }
      } catch (error) {
        console.error("Failed during initial sync:", error);
      } finally {
        // This will now run even if we are offline,
        // hiding the loading spinner.
        setIsInitialSyncing(false);
      }
    };

    checkAndFetchData();

    // Start background sync for ongoing changes
    console.log("Starting global background sync...");
    const cleanup = startBackgroundSync();

    return cleanup; // Clean up event listener on unmount
  }, [session?.user?.id, isSyncLogicDone]);

  // Show a loading screen *only* during the initial data fetch
  if (isInitialSyncing) {
    return <InitialSyncLoading />;
  }

  return <>{children}</>;
}

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SyncManager>{children}</SyncManager>
    </SessionProvider>
  );
}
