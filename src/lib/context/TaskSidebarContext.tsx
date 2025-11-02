// src/lib/context/TaskDetailContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Task } from "@/lib/db/clientDb";

type TaskDetailContextType = {
  selectedTask: Task | null;
  selectTask: (task: Task | null) => void;
};

const TaskDetailContext = createContext<TaskDetailContextType | undefined>(
  undefined
);

export function TaskDetailProvider({ children }: { children: ReactNode }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const selectTask = (task: Task | null) => {
    setSelectedTask(task);
  };

  return (
    <TaskDetailContext.Provider value={{ selectedTask, selectTask }}>
      {children}
    </TaskDetailContext.Provider>
  );
}

export function useTaskDetail() {
  const context = useContext(TaskDetailContext);
  if (!context) {
    throw new Error("useTaskDetail must be used within a TaskDetailProvider");
  }
  return context;
}
