"use client";

import { useState, useEffect } from "react";
import db, { Task, OperationType, EntityType } from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { useTier } from "./useTier";
import { triggerSync } from "../sync/syncService"; // ✅ 1. Import the trigger

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const tier = useTier();
  const canSync = !!tier; // All tiers sync now

  // Load tasks from IndexedDB on mount
  useEffect(() => {
    const fetchTasks = async () => {
      const allTasks = await db.tasks.toArray();
      setTasks(allTasks);
    };
    fetchTasks();
  }, []);

  // Add a new task
  const addTask = async (title: string) => {
    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.tasks.add(newTask);
    setTasks((prev) => [...prev, newTask]);

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "task" as EntityType,
        operation: "create" as OperationType,
        payload: newTask,
        timestamp: Date.now(),
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added CREATE task to sync outbox", syncOp);
      triggerSync(); // Poke the sync service
    }

    return newTask;
  };

  // Toggle task completion
  const toggleTask = async (id: string, completed: boolean) => {
    const updatedAt = Date.now();
    await db.tasks.update(id, { completed, updatedAt });
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed, updatedAt } : task
      )
    );

    if (canSync) {
      const existingTask = tasks.find((t) => t.id === id);
      if (existingTask) {
        const updatedTask = { ...existingTask, completed, updatedAt };
        const syncOp = {
          id: uuidv4(),
          entityType: "task" as EntityType,
          operation: "update" as OperationType,
          payload: updatedTask, // Send the *full* updated task
          timestamp: Date.now(),
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added UPDATE task to sync outbox");
        triggerSync(); // Poke the sync service
      }
    }
  };

  // ✅ --- NEW FUNCTION: Update Task Title ---
  const updateTaskTitle = async (id: string, title: string) => {
    const updatedAt = Date.now();
    await db.tasks.update(id, { title, updatedAt });
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, title, updatedAt } : task
      )
    );

    if (canSync) {
      const existingTask = tasks.find((t) => t.id === id);
      if (existingTask) {
        const updatedTask = { ...existingTask, title, updatedAt };
        const syncOp = {
          id: uuidv4(),
          entityType: "task" as EntityType,
          operation: "update" as OperationType,
          payload: updatedTask, // Send the *full* updated task
          timestamp: Date.now(),
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added UPDATE (title) task to sync outbox");
        triggerSync();
      }
    }
  };

  // ✅ --- NEW FUNCTION: Delete Task ---
  const deleteTask = async (id: string) => {
    await db.tasks.delete(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));

    if (canSync) {
      const syncOp = {
        id: uuidv4(),
        entityType: "task" as EntityType,
        operation: "delete" as OperationType,
        payload: { id }, // For a delete, we only need the ID
        timestamp: Date.now(),
      };
      await db.syncOutbox.add(syncOp);
      console.log("📤 Added DELETE task to sync outbox");
      triggerSync();
    }
  };

  return {
    tasks,
    addTask,
    toggleTask,
    updateTaskTitle, // ✅ Export the new function
    deleteTask, // ✅ Export the new function
  };
}
