import Dexie from "dexie";

// --- INTERFACES ---

export interface Folder {
  id: string; // CUID or UUID
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserMetadata {
  userId: string;
  trialStartedAt: number; // timestamp
  tier: "free" | "basic" | "pro" | "ultra_pro";
  hasNotesPassword?: boolean;
  // [SECURITY FIX] Removed notesPasswordHash from client interface
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  accentColor: string | null;
  createdAt: number;
  updatedAt: number;
}

export type Priority = "none" | "low" | "medium" | "high";
export type RecurringSchedule = "none" | "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  projectId: string | null;
  parentId: string | null;
  notes: string | null;
  dueDate: number | null;
  priority: Priority;
  tags: string[];
  recurringSchedule: RecurringSchedule;
  reminderAt: number | null;
  meetLink: string | null;
  reminder_30_sent: boolean;
  reminder_20_sent: boolean;
  reminder_10_sent: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  folderId: string | null;
  isPinned: boolean;
  isLocked: boolean;
  isQuickNote: boolean;
  tags: string[];
  deletedAt: number | null;
}

// --- Diary Interfaces ---

export interface DiaryMedia {
  type: "image" | "audio";
  url: string;
  createdAt: number;
}

export interface DiaryWeather {
  temp: number;
  condition: string;
  city: string;
}

export interface DiaryEntry {
  id: string;
  entryDate: string; // YYYY-MM-DD
  content: string;
  createdAt: number;
  mood?: string;
  energy?: number;
  weather?: DiaryWeather | null;
  location?: string;
  tags?: string[];
  isLocked?: boolean;
  media?: DiaryMedia[];
}

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  completedAt: number;
  // [UPDATED] Added short_break and long_break. Kept 'break' for backward compatibility.
  type: "work" | "break" | "short_break" | "long_break";
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: number;
}

export type EntityType =
  | "task"
  | "project"
  | "note"
  | "diary"
  | "pomodoro"
  | "notification"
  | "folder";

export type OperationType = "create" | "update" | "delete";

export interface SyncOperation {
  id: string;
  entityType: EntityType;
  operation: OperationType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: number;
}

// Create a subclass of Dexie for type safety
class TaskGlyphDB extends Dexie {
  tasks!: Dexie.Table<Task, string>;
  projects!: Dexie.Table<Project, string>;
  diaryEntries!: Dexie.Table<DiaryEntry, string>;
  pomodoroSessions!: Dexie.Table<PomodoroSession, string>;
  syncOutbox!: Dexie.Table<SyncOperation, string>;
  userMetadata!: Dexie.Table<UserMetadata, string>;
  notifications!: Dexie.Table<Notification, string>;
  notes!: Dexie.Table<Note, string>;
  folders!: Dexie.Table<Folder, string>;

  constructor() {
    super("TaskGlyphDB");

    // ✅ VERSION 10: Cleanest version for Production
    // Removed notesPasswordHash from userMetadata for security
    this.version(10).stores({
      userMetadata: "userId, hasNotesPassword",
      tasks:
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
      projects: "id, name, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt, mood, *tags, isLocked",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
      notifications: "id, userId, read, createdAt",
      notes:
        "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
      folders: "id, name",
    });

    // Version 9 (Migration history - kept for safety)
    this.version(9).stores({
      userMetadata: "userId, hasNotesPassword, notesPasswordHash",
      tasks:
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
      projects: "id, name, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
      notifications: "id, userId, read, createdAt",
      notes:
        "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
      folders: "id, name",
    });

    // Older versions...
    this.version(8).stores({
      userMetadata: "userId, hasNotesPassword",
      tasks:
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
      projects: "id, name, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
      notifications: "id, userId, read, createdAt",
      notes:
        "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
      folders: "id, name",
    });
    this.version(7).stores({
      userMetadata: "userId",
      tasks:
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
      projects: "id, name, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
      notifications: "id, userId, read, createdAt",
      notes:
        "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
      folders: "id, name",
    });
    this.version(6).stores({
      userMetadata: "userId",
      tasks:
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
      projects: "id, name, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
      notifications: "id, userId, read, createdAt",
      notes:
        "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
      folders: "id, name",
      noteAttachments: "id, noteId, fileType",
    });
    this.version(5).stores({
      userMetadata: "userId",
      tasks:
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
      projects: "id, name, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
      notifications: "id, userId, read, createdAt",
      notes: "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt",
      folders: "id, name",
      noteAttachments: "id, noteId, fileType",
    });
    this.version(4).stores({
      userMetadata: "userId",
      tasks:
        "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
      projects: "id, name, createdAt, updatedAt",
      notes: "id, title, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
      notifications: "id, userId, read, createdAt",
    });
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
    this.version(2).stores({
      userMetadata: "userId",
      tasks: "id, title, completed, createdAt, updatedAt",
      notes: "id, title, createdAt, updatedAt",
      diaryEntries: "id, entryDate, createdAt",
      pomodoroSessions: "id, durationMinutes, completedAt, type",
      syncOutbox: "id, entityType, operation, timestamp",
    });
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

// Export a singleton instance
const db = new TaskGlyphDB();

export default db;
