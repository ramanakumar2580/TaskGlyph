"use client";

import { useCallback, useMemo } from "react";
import db, {
  Task,
  OperationType,
  EntityType,
  Priority,
  RecurringSchedule,
} from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService";
import { useLiveQuery } from "dexie-react-hooks"; // For real-time updates

// [UPDATED] Added meetLink to the creation options
type TaskCreationOptions = {
  projectId?: string | null;
  parentId?: string | null;
  notes?: string | null;
  dueDate?: number | null;
  priority?: Priority;
  tags?: string[];
  recurringSchedule?: RecurringSchedule;
  reminderAt?: number | null;
  meetLink?: string | null; // <-- [NEW] Add meetLink
};

export function useTasks() {
  const allTasks = useLiveQuery(() => db.tasks.toArray(), []);

  // ✅ 2. STABILIZE the 'tasks' array with useMemo
  // This prevents all child hooks (addTask, etc.) from re-rendering
  const tasks = useMemo(() => allTasks || [], [allTasks]);

  const tier = useTier();
  const canSync = !!tier;

  /**
   * Creates a new task and (if free tier) checks 21-task limit.
   */
  const addTask = useCallback(
    async (title: string, options: TaskCreationOptions = {}) => {
      // 1. ENFORCE 21-TASK LIMIT
      if (tier === "free") {
        // Use allTasks.length here to get the most current count
        const count = allTasks?.length || 0;
        if (count >= 21) {
          alert(
            "Free Plan Limit Reached\n\nYou have reached the 21-task limit for the free plan. Please upgrade for unlimited tasks."
          );
          return; // Stop execution
        }
      }

      // 2. CREATE THE FULL TASK OBJECT
      const now = Date.now();
      const newTask: Task = {
        id: uuidv4(),
        title: title.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now,
        projectId: options.projectId || null,
        parentId: options.parentId || null,
        notes: options.notes || null,
        dueDate: options.dueDate || null,
        priority: options.priority || "none",
        tags: options.tags || [],
        recurringSchedule: options.recurringSchedule || "none",
        reminderAt: options.reminderAt || null,

        // --- [NEW] Add defaults for reminder fields ---
        meetLink: options.meetLink || null,
        reminder_30_sent: false,
        reminder_20_sent: false,
        reminder_10_sent: false,
      };

      // Add to local DB (useLiveQuery will auto-update state)
      await db.tasks.add(newTask);

      // Add to sync outbox
      if (canSync) {
        const syncOp = {
          id: uuidv4(),
          entityType: "task" as EntityType,
          operation: "create" as OperationType,
          payload: newTask, // Send the full task object
          timestamp: now,
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added CREATE task to sync outbox", syncOp);
        triggerSync(); // Poke the sync service
      }
      return newTask;
    },
    [canSync, tier, allTasks] // Use allTasks for dependency
  );

  /**
   * Deletes a task AND all its subtasks (recursively).
   */
  const deleteTask = useCallback(
    async (taskId: string) => {
      // CASCADING DELETE
      const idsToDelete: string[] = [taskId];
      const findChildren = (parentId: string) => {
        // ✅ Use 'tasks' (memoized) or 'allTasks' here
        const children = (allTasks || []).filter(
          (t: Task) => t.parentId === parentId
        );
        for (const child of children) {
          idsToDelete.push(child.id);
          findChildren(child.id); // Recurse
        }
      };
      findChildren(taskId); // Find all descendants

      // Delete from local DB (useLiveQuery will auto-update state)
      await db.tasks.bulkDelete(idsToDelete);

      // Add ALL deletes to sync outbox
      // --- [FIXED] Corrected typo from 'canSunc' to 'canSync' ---
      if (canSync) {
        const now = Date.now();
        const syncOps = idsToDelete.map((id) => ({
          id: uuidv4(),
          entityType: "task" as EntityType,
          operation: "delete" as OperationType,
          payload: { id }, // Only need ID for delete
          timestamp: now,
        }));
        await db.syncOutbox.bulkAdd(syncOps);
        console.log(
          `📤 Added ${idsToDelete.length} DELETE tasks to sync outbox`
        );
        triggerSync();
      }
    },
    [canSync, allTasks] // Use allTasks for dependency
  );

  /**
   * Updates any field(s) on a task.
   */
  const updateTask = useCallback(
    async (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
      const updatedAt = Date.now();
      const finalUpdates = { ...updates, updatedAt };

      // Update local DB (useLiveQuery will auto-update state)
      await db.tasks.update(id, finalUpdates);

      // Add to sync outbox
      if (canSync) {
        // We MUST send the full task object to the API
        const existingTask = (allTasks || []).find((t: Task) => t.id === id);
        if (existingTask) {
          const updatedTask: Task = { ...existingTask, ...finalUpdates };
          const syncOp = {
            id: uuidv4(),
            entityType: "task" as EntityType,
            operation: "update" as OperationType,
            payload: updatedTask, // Send the *full* updated task
            timestamp: updatedAt,
          };
          await db.syncOutbox.add(syncOp);
          console.log("📤 Added UPDATE task to sync outbox", syncOp);
          triggerSync();
        }
      }
    },
    [canSync, allTasks] // Use allTasks for dependency
  );

  // Return the live tasks array and the new C-U-D functions
  return {
    tasks, // Return the memoized 'tasks' for the UI
    addTask,
    updateTask,
    deleteTask,
  };
}
