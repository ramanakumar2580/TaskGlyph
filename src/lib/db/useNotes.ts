"use client";

import { useState, useEffect } from "react";
import db, { Note, OperationType, EntityType } from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService"; // ✅ 1. Import the trigger

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const tier = useTier();
  const canSync = !!tier;
  // Load notes from IndexedDB on mount
  useEffect(() => {
    const fetchNotes = async () => {
      const allNotes = await db.notes.toArray();
      setNotes(allNotes);
    };
    fetchNotes();
  }, []);

  // Add a new note
  const addNote = async (title: string, content: string) => {
    const newNote: Note = {
      id: uuidv4(),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.notes.add(newNote);
    setNotes((prev) => [...prev, newNote]);

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "note" as EntityType,
        operation: "create" as OperationType,
        payload: newNote,
        timestamp: Date.now(),
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added CREATE note to sync outbox");
      triggerSync(); // Poke the sync service
    }

    return newNote;
  };

  // Update an existing note
  const updateNote = async (id: string, updates: Partial<Note>) => {
    const now = Date.now();
    const updatedFields = { ...updates, updatedAt: now };
    await db.notes.update(id, updatedFields);
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updatedFields } : note
      )
    );

    if (canSync) {
      // ✅ We find the note *after* updating state for consistency
      const updatedNote = notes
        .map((note) => (note.id === id ? { ...note, ...updatedFields } : note))
        .find((n) => n.id === id);

      if (updatedNote) {
        const syncOp = {
          id: uuidv4(),
          entityType: "note" as EntityType,
          operation: "update" as OperationType,
          payload: updatedNote, // Send the full updated note
          timestamp: Date.now(),
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added UPDATE note to sync outbox");
        triggerSync(); // Poke the sync service
      }
    }
  };

  // ✅ --- NEW FUNCTION: Delete Note ---
  const deleteNote = async (id: string) => {
    await db.notes.delete(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "note" as EntityType,
        operation: "delete" as OperationType,
        payload: { id }, // For a delete, we only need the ID
        timestamp: Date.now(),
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added DELETE note to sync outbox");
      triggerSync();
    }
  };

  return {
    notes,
    addNote,
    updateNote,
    deleteNote, // ✅ Export the new function
  };
}
