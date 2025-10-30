"use client";

import { useState } from "react";
import { useTasks } from "@/lib/db/useTasks";

export default function OfflineTasksPage() {
  // ✅ 1. Get the update and delete functions
  const { tasks, addTask, toggleTask, updateTaskTitle, deleteTask } =
    useTasks();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      addTask(input.trim());
      setInput("");
    }
  };

  // ✅ 2. Add handlers for Edit and Delete
  const handleEdit = (id: string, currentTitle: string) => {
    const newTitle = prompt("Enter new task title:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      updateTaskTitle(id, newTitle.trim());
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Offline Tasks (Test)
        </h1>

        {/* Add Task Form */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-800"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              // ✅ 3. Update list item layout
              className="flex items-center justify-between gap-3 p-2 border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id, !task.completed)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span
                  className={`flex-1 ${
                    task.completed
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </span>
              </div>
              {/* ✅ 4. Add Edit and Delete buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task.id, task.title)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p className="text-gray-500 text-center mt-4">
            No tasks yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
}
