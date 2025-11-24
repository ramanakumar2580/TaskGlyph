"use client";

import { useState, useEffect } from "react";
import db, {
  DiaryEntry,
  OperationType,
  EntityType,
  DiaryWeather,
  DiaryMedia,
} from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService";

// Helper interface for the data passed from the UI
export interface DiaryUpdatePayload {
  content: string;
  mood?: string;
  energy?: number;
  weather?: DiaryWeather | null;
  location?: string;
  tags?: string[];
  isLocked?: boolean;
  media?: DiaryMedia[];
}

export function useDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const tier = useTier();
  const canSync = !!tier;

  // Load diary entries from IndexedDB on mount
  useEffect(() => {
    const fetchEntries = async () => {
      const allEntries = await db.diaryEntries.toArray();
      // Sort: Newest first
      const sorted = allEntries.sort(
        (a, b) =>
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      );
      setEntries(sorted);
    };
    fetchEntries();
  }, []);

  /**
   * Save (Create or Update) an entry.
   * @param data - The content and new fields (mood, weather, etc.)
   * @param dateStr - Optional YYYY-MM-DD string. Defaults to TODAY if omitted.
   */
  const saveEntry = async (data: DiaryUpdatePayload, dateStr?: string) => {
    // Default to today if no specific date provided
    const targetDate = dateStr || format(new Date(), "yyyy-MM-dd");

    const existing = entries.find((entry) => entry.entryDate === targetDate);
    const now = Date.now();

    if (existing) {
      // --- UPDATE EXISTING ---

      // Prepare the update object (merging existing data with new data)
      const updates = {
        content: data.content,
        // We generally keep the original createdAt, but you could add updatedAt if needed
        mood: data.mood,
        energy: data.energy,
        weather: data.weather,
        location: data.location,
        tags: data.tags,
        isLocked: data.isLocked,
        media: data.media,
      };

      // 1. Update in Local DB
      await db.diaryEntries.update(existing.id, updates);

      // 2. Update Local State
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === existing.id ? { ...entry, ...updates } : entry
        )
      );

      // 3. Sync
      if (canSync) {
        const fullUpdatedEntry = { ...existing, ...updates };
        const syncOp = {
          id: uuidv4(),
          entityType: "diary" as EntityType,
          operation: "update" as OperationType,
          payload: fullUpdatedEntry,
          timestamp: now,
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added UPDATE diary entry to sync outbox");
        triggerSync();
      }
    } else {
      // --- CREATE NEW ---

      const newEntry: DiaryEntry = {
        id: uuidv4(),
        entryDate: targetDate,
        content: data.content,
        createdAt: now,
        mood: data.mood,
        energy: data.energy,
        weather: data.weather || null,
        location: data.location,
        tags: data.tags || [],
        isLocked: data.isLocked || false,
        media: data.media || [],
      };

      // 1. Add to Local DB
      await db.diaryEntries.add(newEntry);

      // 2. Update Local State (and re-sort)
      setEntries((prev) => {
        const updated = [newEntry, ...prev];
        return updated.sort(
          (a, b) =>
            new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        );
      });

      // 3. Sync
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
        triggerSync();
      }
    }
  };

  const deleteDiaryEntry = async (id: string) => {
    await db.diaryEntries.delete(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "diary" as EntityType,
        operation: "delete" as OperationType,
        payload: { id },
        timestamp: Date.now(),
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added DELETE diary entry to sync outbox");
      triggerSync();
    }
  };

  return {
    entries,
    saveEntry, // ✅ Renamed to saveEntry (replaces saveTodayEntry)
    deleteDiaryEntry,
  };
}
