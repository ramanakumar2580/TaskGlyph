"use client";

import { useLiveQuery } from "dexie-react-hooks";
import db, { PomodoroSession, OperationType, EntityType } from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService";
import { startOfDay, endOfDay } from "date-fns";

export function usePomodoro() {
  const tier = useTier();
  const canSync = !!tier;

  // ✅ 1. Live Query for TODAY'S sessions only (Auto-updates UI)
  const todaySessions = useLiveQuery(async () => {
    const start = startOfDay(new Date()).getTime();
    const end = endOfDay(new Date()).getTime();

    // Get sessions completed between start and end of today
    return await db.pomodoroSessions
      .where("completedAt")
      .between(start, end)
      .toArray();
  }, []);

  // ✅ 2. Add Session (Offline First)
  // [UPDATED] Added support for specific break types
  const addSession = async (
    durationMinutes: number,
    type: "work" | "break" | "short_break" | "long_break"
  ) => {
    const now = Date.now();

    const newSession: PomodoroSession = {
      id: uuidv4(),
      durationMinutes,
      completedAt: now,
      type,
    };

    // Save locally
    await db.pomodoroSessions.add(newSession);
    console.log(`✅ Saved ${type} session locally`);

    // Queue for Sync
    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "pomodoro" as EntityType,
        operation: "create" as OperationType,
        payload: newSession,
        timestamp: now,
      };
      await db.syncOutbox.add(syncOp);
      triggerSync();
    }
  };

  return {
    todaySessions, // Returns array of today's sessions
    addSession, // Function to log new session
  };
}
