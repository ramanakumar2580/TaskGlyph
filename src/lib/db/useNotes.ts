"use client";

import { useLiveQuery } from "dexie-react-hooks";
import db, { Note, OperationType, EntityType, Folder } from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService";
import { deleteFromS3 } from "@/lib/deleteFromS3"; // [NEW] Import delete S3

// --- 1. Notes Hook ---
export function useNotes() {
  const tier = useTier();
  const canSync = !!tier;

  // Live Query
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
        triggerSync();
      }
    }
  };

  const addNote = async (payload: {
    title: string;
    content: string;
    folderId?: string | null;
    isQuickNote?: boolean;
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
      triggerSync();
    }
    return newNote;
  };

  const addQuickNote = async (payload: { title: string; content: string }) => {
    return addNote({ ...payload, isQuickNote: true });
  };

  // Soft Delete (Files stay in S3 for recovery)
  const deleteNote = async (id: string) => {
    console.log(`🗑️ Moving note to trash: ${id}`);
    return updateNote(id, { deletedAt: Date.now(), isPinned: false });
  };

  // [FIX] Hard Delete + S3 Cleanup
  const deleteNotePermanently = async (id: string) => {
    console.log(`🔥 Permanently deleting note: ${id}`);

    // 1. Get the note content to find attachments
    const note = await db.notes.get(id);

    if (note && note.content) {
      try {
        // Parse HTML to find media
        const parser = new DOMParser();
        const doc = parser.parseFromString(note.content, "text/html");

        // Find images, videos, audio, and file links (anchors)
        const mediaElements = doc.querySelectorAll("img, video, audio, a");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deletePromises: Promise<any>[] = [];

        mediaElements.forEach((el) => {
          const src = el.getAttribute("src") || el.getAttribute("href");
          // Check if it looks like a cloud storage URL (basic check)
          if (src && src.startsWith("http")) {
            console.log("Deleting attachment from S3:", src);
            deletePromises.push(deleteFromS3(src));
          }
        });

        // Wait for all S3 deletions
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
      } catch (error) {
        console.error("Error cleaning up S3 attachments:", error);
      }
    }

    // 2. Delete from Dexie
    await db.notes.delete(id);

    // 3. Sync deletion
    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "note" as EntityType,
        operation: "delete" as OperationType,
        payload: { id },
        timestamp: Date.now(),
      };
      await db.syncOutbox.add(syncOp);
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

// --- 2. Trash Hook ---
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

// --- 3. Folders Hook ---
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

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "folder" as EntityType,
        operation: "create" as OperationType,
        payload: newFolder,
        timestamp: now,
      };
      await db.syncOutbox.add(syncOp);
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

  const deleteFolder = async (id: string) => {
    const notesToMove = await db.notes.where("folderId").equals(id).toArray();

    await db.transaction("rw", db.notes, db.folders, async () => {
      const now = Date.now();
      if (notesToMove.length > 0) {
        const noteUpdates = notesToMove.map((note) => {
          return db.notes.update(note.id, { folderId: null, updatedAt: now });
        });
        await Promise.all(noteUpdates);
      }
      await db.folders.delete(id);
    });

    if (canSync) {
      const now = Date.now();
      for (const note of notesToMove) {
        const updatedNote = await db.notes.get(note.id);
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

      const folderSyncOp = {
        id: uuidv4(),
        entityType: "folder" as EntityType,
        operation: "delete" as OperationType,
        payload: { id },
        timestamp: now,
      };
      await db.syncOutbox.add(folderSyncOp);
      triggerSync();
    }
  };

  return {
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
  };
}

// --- 4. Tags Hook ---
export function useNoteTags() {
  const allTags = useLiveQuery(async () => {
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

// --- 5. User Metadata Hook ---
export function useUserMetadata() {
  const metadata = useLiveQuery(() => db.userMetadata.limit(1).first(), []);
  return {
    metadata,
  };
}
