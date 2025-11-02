import Dexie from "dexie";

// Create a subclass of Dexie for type safety
class TaskGlyphDB extends Dexie {
  tasks!: Dexie.Table<Task, string>;
  projects!: Dexie.Table<Project, string>;
  notes!: Dexie.Table<Note, string>;
  diaryEntries!: Dexie.Table<DiaryEntry, string>;
  pomodoroSessions!: Dexie.Table<PomodoroSession, string>;
  syncOutbox!: Dexie.Table<SyncOperation, string>;
  userMetadata!: Dexie.Table<UserMetadata, string>;
  // [NEW] Add the new notifications table
  notifications!: Dexie.Table<Notification, string>;

  constructor() {
    super("TaskGlyphDB");

    // [NEW] BUMPED TO VERSION 4 for reminder/notification schema
    this.version(4).stores({
      userMetadata: "userId",
      // [UPDATED] Added new fields for querying reminders and meetings
      tasks:
        // --- THIS LINE IS THE FIX ---
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
      projects: "id, name, createdAt, updatedAt",
      notes: "id, title, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
      // [NEW] Added notifications table
      notifications: "id, userId, read, createdAt",
    });

    // This was your old version 3, we keep it for migrations
    this.version(3).stores({
      userMetadata: "userId",
      tasks:
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule",
      projects: "id, name, createdAt, updatedAt",
      notes: "id, title, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
    });

    // This was your old version 2
    this.version(2).stores({
      userMetadata: "userId",
      tasks: "id, title, completed, createdAt, updatedAt",
      notes: "id, title, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
    });

    // This was your old version 1
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

export interface Project {
  id: string;
  name: string; // "title" from your spec
  description: string | null; // "rich-text description"
  accentColor: string | null; // "accent color"
  createdAt: number;
  updatedAt: number;
}

export type Priority = "none" | "low" | "medium" | "high";
export type RecurringSchedule = "none" | "daily" | "weekly" | "monthly";

// [UPDATED] Task interface with meeting link and reminder flags
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;

  // --- HIERARCHY FIELDS ---
  projectId: string | null; // Null if standalone
  parentId: string | null; // Null if top-level task

  // --- FEATURE FIELDS ---
  notes: string | null; // "optional notes"
  dueDate: number | null; // Store as timestamp
  priority: Priority;
  tags: string[]; // "comma-separated tags"
  recurringSchedule: RecurringSchedule;
  reminderAt: number | null; // Store as timestamp

  // --- [NEW] Fields for Meetings & Reminders ---
  meetLink: string | null;
  reminder_30_sent: boolean;
  reminder_20_sent: boolean;
  reminder_10_sent: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string; // This is the separate "Markdown Note" feature
  createdAt: number;
  updatedAt: number;
}

export interface DiaryEntry {
  id: string;
  entryDate: string; // YYYY-MM-DD
  content: string;
  createdAt: number;
}

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  completedAt: number;
  type: "work" | "break";
}

// [NEW] Interface for In-App Notifications
export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string | null; // e.g., to the task/meeting ID
  read: boolean;
  createdAt: number;
}

// [UPDATED] Entity Type to include 'notification' and 'project'
export type EntityType =
  | "task"
  | "project"
  | "note"
  | "diary"
  | "pomodoro"
  | "notification";
export type OperationType = "create" | "update" | "delete";

export interface SyncOperation {
  id: string;
  entityType: EntityType;
  operation: OperationType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: number;
}

// Export a singleton instance
const db = new TaskGlyphDB();

export default db;
