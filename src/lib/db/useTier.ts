// src/lib/db/useTier.ts
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import db, { UserMetadata } from "./clientDb";

export function useTier() {
  const { data: session, status } = useSession();
  const [tier, setTier] = useState<UserMetadata["tier"] | null>(null);

  useEffect(() => {
    // 1. Define an async function to fetch and set tier
    const getAndSetTier = async (userId: string) => {
      // 2. Try getting from local DB first for speed and offline support
      const localMeta = await db.userMetadata.get(userId);
      if (localMeta) {
        setTier(localMeta.tier);
      } else {
        // If nothing is in local, set to 'free' as a default
        setTier("free");
      }

      // 3. --- THIS IS THE FIX ---
      // Only try to fetch from the server if we are ONLINE
      if (navigator.onLine) {
        try {
          const response = await fetch("/api/user/tier");
          if (response.ok) {
            const data = await response.json();
            if (data.tier) {
              // 4. Save the latest info to local DB and update state
              await db.userMetadata.put({
                userId: userId,
                tier: data.tier,
                trialStartedAt: data.trialStartedAt || 0,
              });

              // Only update state if it's different from local
              if (!localMeta || localMeta.tier !== data.tier) {
                setTier(data.tier);
              }
            }
          } else {
            // If fetch fails, we've already set from local, so we're good.
            console.error("Server responded with an error for /api/user/tier");
          }
        } catch (error) {
          console.error("Failed to fetch user tier:", error);
          // If fetch fails, we're still safe because we already set from localMeta
        }
      }
      // If we are OFFLINE, we skip the fetch entirely and just use localMeta
    };

    if (status === "authenticated" && session?.user?.id) {
      getAndSetTier(session.user.id);
    } else if (status === "unauthenticated") {
      setTier(null);
    }
  }, [session, status]);

  return tier;
}
