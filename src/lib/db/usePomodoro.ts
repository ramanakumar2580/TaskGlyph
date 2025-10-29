"use client";

import { useState, useEffect, useCallback } from "react"; // ✅ 1. Import useCallback
import db, { PomodoroSession, OperationType, EntityType } from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService";

export function usePomodoro() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const tier = useTier();
  const canSync = !!tier;

  // Load Pomodoro sessions from IndexedDB on mount
  useEffect(() => {
    const fetchSessions = async () => {
      const allSessions = await db.pomodoroSessions.toArray();
      const sorted = allSessions.sort((a, b) => b.completedAt - a.completedAt);
      setSessions(sorted);
    };
    fetchSessions();
  }, []); // Empty dependency array is correct here

  const logSession = useCallback(
    async (durationMinutes: number, type: "work" | "break") => {
      const newSession: PomodoroSession = {
        id: uuidv4(),
        durationMinutes,
        completedAt: Date.now(),
        type: type,
      };
      await db.pomodoroSessions.add(newSession);
      setSessions((prev) => [newSession, ...prev]);

      // Add to sync outbox if paid user
      if (canSync) {
        const syncOp = {
          id: uuidv4(),
          entityType: "pomodoro" as EntityType,
          operation: "create" as OperationType,
          payload: newSession,
          timestamp: Date.now(),
        };
        await db.syncOutbox.add(syncOp);
        console.log(`📤 Added CREATE Pomodoro ${type} session to sync outbox`);
        triggerSync(); // Poke the sync service
      }

      return newSession;
    },
    [canSync] // ✅ 3. Add dependencies
  );

  return {
    sessions,
    logSession,
  };
}
