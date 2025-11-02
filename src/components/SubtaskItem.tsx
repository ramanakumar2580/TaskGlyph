"use client";

import { useState } from "react";
import { useTasks } from "@/lib/db/useTasks";
import { Task } from "@/lib/db/clientDb";
import { motion } from "framer-motion";
import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function SubtaskItem({ task }: { task: Task }) {
  const { updateTask, deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleToggle = () =>
    updateTask(task.id, { completed: !task.completed, updatedAt: Date.now() });

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    const newTitle = e.target.value.trim();
    if (newTitle && newTitle !== task.title)
      updateTask(task.id, { title: newTitle });
    else setTitle(task.title);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(task.title);
      e.currentTarget.blur();
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group flex items-center gap-2 py-2 pl-8 pr-4 transition-colors duration-150 hover:bg-gray-50"
    >
      <button
        onClick={handleToggle}
        className={`flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
          task.completed
            ? "bg-gray-900 border-gray-900"
            : "border-gray-400 hover:border-gray-700"
        }`}
      >
        {task.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckIcon className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </button>
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            className="w-full text-sm font-medium text-gray-800 outline-none ring-1 ring-gray-900 rounded px-1 -mx-1 bg-white"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`text-sm outline-none cursor-pointer rounded px-1 -mx-1 transition-colors duration-150 ${
              task.completed
                ? "line-through text-gray-500"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            {task.title}
          </span>
        )}
      </div>
      <button
        onClick={() => deleteTask(task.id)}
        className="p-1 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete subtask"
      >
        <TrashIcon className="h-3 w-3" />
      </button>
    </motion.li>
  );
}
