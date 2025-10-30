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
      // 2. Try getting from local DB first for speed
      const localMeta = await db.userMetadata.get(userId);
      if (localMeta) {
        setTier(localMeta.tier);
      }

      // 3. Fetch from server to get the *latest* tier info
      // We need to create this API route next
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
            setTier(data.tier);
          }
        } else {
          // If fetch fails, fall back to local or 'free'
          if (!localMeta) setTier("free");
        }
      } catch (error) {
        console.error("Failed to fetch user tier:", error);
        // If fetch fails, fall back to local or 'free'
        if (!localMeta) setTier("free");
      }
    };

    if (status === "authenticated" && session?.user?.id) {
      getAndSetTier(session.user.id);
    } else if (status === "unauthenticated") {
      setTier(null);
    }
  }, [session, status]);

  return tier;
}
