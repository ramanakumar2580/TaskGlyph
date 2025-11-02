// src/lib/db/useNotifications.ts
"use client";

import { useMemo } from "react";
import db from "./clientDb";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Gets all UNREAD notifications for the bell icon
 */
export function useUnreadNotifications() {
  const notifs = useLiveQuery(() =>
    // --- THIS IS THE FIX ---
    // Query for the number 0 (for false) instead of the boolean
    db.notifications.where("read").equals(0).reverse().sortBy("createdAt")
  );

  return useMemo(() => notifs || [], [notifs]);
}
