"use client";

import { useState, useEffect } from "react";
import db, { DiaryEntry, OperationType, EntityType } from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService"; // ✅ 1. Import the trigger

export function useDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const tier = useTier();
  const canSync = !!tier;
  // Load diary entries from IndexedDB on mount
  useEffect(() => {
    const fetchEntries = async () => {
      const allEntries = await db.diaryEntries.toArray();
      const sorted = allEntries.sort(
        (a, b) =>
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      );
      setEntries(sorted);
    };
    fetchEntries();
  }, []);

  // Add or update today's entry
  const saveTodayEntry = async (content: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const existing = entries.find((entry) => entry.entryDate === today);
    const now = Date.now();

    if (existing) {
      // Update existing
      await db.diaryEntries.update(existing.id, { content, createdAt: now });
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === existing.id
            ? { ...entry, content, createdAt: now }
            : entry
        )
      );

      // Add to sync outbox if paid user
      if (canSync) {
        const updatedEntry = { ...existing, content, createdAt: now };
        const syncOp = {
          id: uuidv4(),
          entityType: "diary" as EntityType,
          operation: "update" as OperationType,
          payload: updatedEntry,
          timestamp: now,
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added UPDATE diary entry to sync outbox");
        triggerSync(); // Poke the sync service
      }
    } else {
      // Create new
      const newEntry: DiaryEntry = {
        id: uuidv4(),
        entryDate: today,
        content,
        createdAt: now,
      };
      await db.diaryEntries.add(newEntry);
      setEntries((prev) => [newEntry, ...prev]);

      // Add to sync outbox if paid user
      if (canSync) {
        const syncOp = {
          id: uuidv4(),
          entityType: "diary" as EntityType,
          operation: "create" as OperationType,
          payload: newEntry,
          timestamp: now,
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added CREATE diary entry to sync outbox");
        triggerSync(); // Poke the sync service
      }
    }
  };

  // ✅ --- NEW FUNCTION: Delete Diary Entry ---
  const deleteDiaryEntry = async (id: string) => {
    await db.diaryEntries.delete(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "diary" as EntityType,
        operation: "delete" as OperationType,
        payload: { id }, // For a delete, we only need the ID
        timestamp: Date.now(),
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added DELETE diary entry to sync outbox");
      triggerSync();
    }
  };

  return {
    entries,
    saveTodayEntry,
    deleteDiaryEntry, // ✅ Export the new function
  };
}
