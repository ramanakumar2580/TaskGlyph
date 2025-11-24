"use client";

import { useLiveQuery } from "dexie-react-hooks";
import db, { Note, OperationType, EntityType, Folder } from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService";

export function useNotes() {
  const tier = useTier();
  const canSync = !!tier;

  const notes = useLiveQuery(async () => {
    const activeNotes = await db.notes
      .filter((note) => note.deletedAt === null)
      .sortBy("updatedAt");
    activeNotes.reverse();
    return activeNotes.sort(
      (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
    );
  }, []);

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const now = Date.now();
    const updatedFields = { ...updates, updatedAt: now };

    await db.notes.update(id, updatedFields);

    if (canSync) {
      const updatedNote = await db.notes.get(id);
      if (updatedNote) {
        const syncOp = {
          id: uuidv4(),
          entityType: "note" as EntityType,
          operation: "update" as OperationType,
          payload: updatedNote,
          timestamp: now,
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added UPDATE note to sync outbox:", updatedNote.id);
        triggerSync();
      }
    }
  };

  const addNote = async (payload: {
    title: string;
    content: string;
    folderId?: string | null;
    isQuickNote?: boolean; // [FIX #3] Accept the quick note flag
  }) => {
    const now = Date.now();
    const newNote: Note = {
      id: uuidv4(),
      title: payload.title,
      content: payload.content,
      createdAt: now,
      updatedAt: now,
      folderId: payload.folderId || null,
      isPinned: false,
      isLocked: false,
      // [FIX #3] Use the value passed from the UI
      isQuickNote: payload.isQuickNote || false,
      deletedAt: null,
      tags: [],
    };

    await db.notes.add(newNote);

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "note" as EntityType,
        operation: "create" as OperationType,
        payload: newNote,
        timestamp: now,
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added CREATE note to sync outbox:", newNote.id);
      triggerSync();
    }
    return newNote;
  };

  // [FIX #3] This function is now redundant, but we keep it
  // in case you use it elsewhere. addNote() now does both jobs.
  const addQuickNote = async (payload: { title: string; content: string }) => {
    const now = Date.now();
    const newNote: Note = {
      id: uuidv4(),
      title: payload.title,
      content: payload.content,
      createdAt: now,
      updatedAt: now,
      folderId: null,
      isPinned: false,
      isLocked: false,
      isQuickNote: true,
      deletedAt: null,
      tags: [],
    };

    await db.notes.add(newNote);

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "note" as EntityType,
        operation: "create" as OperationType,
        payload: newNote,
        timestamp: now,
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added CREATE (Quick) note to sync outbox:", newNote.id);
      triggerSync();
    }
    return newNote;
  };

  const deleteNote = async (id: string) => {
    console.log(`🗑️ Moving note to trash: ${id}`);
    return updateNote(id, { deletedAt: Date.now(), isPinned: false });
  };

  const deleteNotePermanently = async (id: string) => {
    console.log(`🔥 Permanently deleting note: ${id}`);

    await db.notes.delete(id);

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "note" as EntityType,
        operation: "delete" as OperationType,
        payload: { id },
        timestamp: Date.now(),
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added DELETE note to sync outbox:", id);
      triggerSync();
    }
  };

  const recoverNote = async (id: string) => {
    console.log(`♻️ Recovering note from trash: ${id}`);
    return updateNote(id, { deletedAt: null });
  };

  const pinNote = (id: string) => updateNote(id, { isPinned: true });
  const unpinNote = (id: string) => updateNote(id, { isPinned: false });

  const lockNote = (id: string) => updateNote(id, { isLocked: true });
  const unlockNote = (id: string) => updateNote(id, { isLocked: false });

  const moveNoteToFolder = (id: string, folderId: string | null) =>
    updateNote(id, { folderId });

  const addTagToNote = async (id: string, tag: string) => {
    const note = await db.notes.get(id);
    if (!note) return;

    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !(note.tags || []).includes(cleanTag)) {
      return updateNote(id, { tags: [...(note.tags || []), cleanTag] });
    }
  };

  const removeTagFromNote = async (id: string, tag: string) => {
    const note = await db.notes.get(id);
    if (!note) return;

    const cleanTag = tag.trim().toLowerCase();
    const newTags = (note.tags || []).filter((t) => t !== cleanTag);
    return updateNote(id, { tags: newTags });
  };

  return {
    notes,
    addNote,
    addQuickNote,
    updateNote,
    deleteNote,
    deleteNotePermanently,
    recoverNote,
    pinNote,
    unpinNote,
    lockNote,
    unlockNote,
    moveNoteToFolder,
    addTagToNote,
    removeTagFromNote,
  };
}

export function useTrashNotes() {
  const notes = useLiveQuery(
    () =>
      db.notes.filter((note) => note.deletedAt !== null).sortBy("deletedAt"),
    []
  );

  return {
    trashedNotes: notes,
  };
}

export function useFolders() {
  const tier = useTier();
  const canSync = !!tier;

  const folders = useLiveQuery(() => db.folders.orderBy("name").toArray(), []);

  const addFolder = async (name: string) => {
    const now = Date.now();
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      createdAt: now,
      updatedAt: now,
    };

    await db.folders.add(newFolder);
    console.log("Folder added to Dexie:", newFolder.id); // [FIX #1] Added log

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "folder" as EntityType,
        operation: "create" as OperationType,
        payload: newFolder,
        timestamp: now,
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added CREATE folder to sync outbox:", newFolder.id); // [FIX #1] Added log
      triggerSync();
    }
    return newFolder;
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    const now = Date.now();
    const updatedFields = { ...updates, updatedAt: now };

    await db.folders.update(id, updatedFields);

    if (canSync) {
      const updatedFolder = await db.folders.get(id);
      if (updatedFolder) {
        const syncOp = {
          id: uuidv4(),
          entityType: "folder" as EntityType,
          operation: "update" as OperationType,
          payload: updatedFolder,
          timestamp: now,
        };
        await db.syncOutbox.add(syncOp);
        triggerSync();
      }
    }
  };

  // [FIX #2] This is the new deleteFolder function you needed
  const deleteFolder = async (id: string) => {
    console.log(`🔥 Deleting folder: ${id}`);
    const notesToMove = await db.notes.where("folderId").equals(id).toArray();

    // Use a transaction to move notes and delete folder together
    await db.transaction("rw", db.notes, db.folders, async () => {
      // 1. Update all notes in this folder to have no folderId
      const now = Date.now();
      if (notesToMove.length > 0) {
        const noteUpdates = notesToMove.map((note) => {
          return db.notes.update(note.id, { folderId: null, updatedAt: now });
        });
        await Promise.all(noteUpdates);
      }
      // 2. Delete the folder
      await db.folders.delete(id);
    });

    // 3. Add operations to sync outbox
    if (canSync) {
      const now = Date.now();
      // Add all note updates to outbox
      for (const note of notesToMove) {
        const updatedNote = await db.notes.get(note.id); // Get the updated note
        if (updatedNote) {
          const noteSyncOp = {
            id: uuidv4(),
            entityType: "note" as EntityType,
            operation: "update" as OperationType,
            payload: updatedNote,
            timestamp: now,
          };
          await db.syncOutbox.add(noteSyncOp);
        }
      }

      // Add the folder delete op to outbox
      const folderSyncOp = {
        id: uuidv4(),
        entityType: "folder" as EntityType,
        operation: "delete" as OperationType,
        payload: { id }, // Just need the ID to delete
        timestamp: now,
      };
      await db.syncOutbox.add(folderSyncOp);
      console.log("📤 Added DELETE folder to sync outbox:", id);
      triggerSync();
    }
  };

  return {
    folders,
    addFolder,
    updateFolder,
    deleteFolder, // [FIX #2] Export the new function
  };
}

export function useNoteTags() {
  const allTags = useLiveQuery(async () => {
    // [FIX] This is a more robust way to get all unique tags
    const notes = await db.notes.toArray();
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      (note.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  return {
    tags: allTags,
  };
}

export function useUserMetadata() {
  const metadata = useLiveQuery(() => db.userMetadata.limit(1).first(), []);

  return {
    metadata,
  };
}
