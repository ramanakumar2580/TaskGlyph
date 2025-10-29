"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import db, { UserMetadata } from "./clientDb";

export function useTier() {
  const { data: session } = useSession();
  const [tier, setTier] = useState<UserMetadata["tier"] | null>(null);

  useEffect(() => {
    const fetchTier = async () => {
      if (!session?.user?.id) {
        setTier(null);
        return;
      }

      const userId = session.user.id;
      const userMeta = await db.userMetadata.get(userId);

      if (userMeta) {
        setTier(userMeta.tier);
      } else {
        // This should not happen in production (user should exist in DB)
        setTier("free");
      }
    };

    fetchTier();
  }, [session?.user?.id]);

  return tier;
}
