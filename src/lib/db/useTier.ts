// src/lib/db/useTier.ts
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "./clientDb";

export function useTier() {
  const { data: session } = useSession();

  const userSettings = useLiveQuery(() => db.userSettings.get("me"));

  useEffect(() => {
    const syncTierFromServer = async () => {
      if (!navigator.onLine) return; // Skip if offline

      try {
        const response = await fetch("/api/user/tier");
        if (response.ok) {
          const data = await response.json();

          if (data.tier) {
            await db.userSettings.put({
              id: "me",
              tier: data.tier,
              email: session?.user?.email || "",
            });

            // Optional: Also sync metadata if you use it elsewhere
            if (session?.user?.id) {
              await db.userMetadata.put({
                userId: session.user.id,
                tier: data.tier,
                trialStartedAt: data.trialStartedAt || Date.now(),
                hasNotesPassword: false, // or fetch actual state
              });
            }
          }
        }
      } catch (error) {
        console.error("Background tier sync failed:", error);
      }
    };

    if (session?.user) {
      syncTierFromServer();
    }
  }, [session]);

  // Return the tier (Default to "free" if loading or not found)
  return userSettings?.tier || "free"; // Changed "Free" to lowercase "free" to match types if needed
}
