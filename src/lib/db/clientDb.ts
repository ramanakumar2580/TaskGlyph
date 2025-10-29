import Dexie from "dexie";

// Create a subclass of Dexie for type safety
class TaskGlyphDB extends Dexie {
  tasks!: Dexie.Table<Task, string>;
  notes!: Dexie.Table<Note, string>;
  diaryEntries!: Dexie.Table<DiaryEntry, string>;
  pomodoroSessions!: Dexie.Table<PomodoroSession, string>;
  syncOutbox!: Dexie.Table<SyncOperation, string>;
  userMetadata!: Dexie.Table<UserMetadata, string>;

  constructor() {
    super("TaskGlyphDB");

    // ✅ 1. Bump the database version
    this.version(2).stores({
      userMetadata: "userId",
      tasks: "id, title, completed, createdAt, updatedAt",
      notes: "id, title, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      // ✅ 2. Add 'type' to the pomodoroSessions table
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
    });

    // This was your old version 1, we keep it for migrations
    this.version(1).stores({
      userMetadata: "userId",
      tasks: "id, title, completed, createdAt, updatedAt",
      notes: "id, title, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt",
      syncOutbox: "id, entityType, operation, timestamp",
    });
  }
}
export interface UserMetadata {
  userId: string;
  trialStartedAt: number; // timestamp
  tier: "free" | "basic" | "pro" | "ultra_pro";
}
// Define TypeScript interfaces for your data
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface DiaryEntry {
  id: string;
  entryDate: string; // YYYY-MM-DD
  content: string;
  createdAt: number;
}

// ✅ 3. Add the 'type' field to the interface
export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  completedAt: number;
  type: "work" | "break"; // New field
}

export type EntityType = "task" | "note" | "diary" | "pomodoro";
export type OperationType = "create" | "update" | "delete";

export interface SyncOperation {
  id: string;
  entityType: EntityType;
  operation: OperationType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: number; // client-side timestamp in milliseconds
}

// Export a singleton instance
const db = new TaskGlyphDB();

export default db;
