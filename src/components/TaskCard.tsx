// src/components/TaskCard.tsx
"use client";

import {
  useState,
  FocusEvent,
  KeyboardEvent,
  useMemo,
  MouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/lib/db/useTasks";
import { Task, Priority } from "@/lib/db/clientDb";
import {
  TrashIcon,
  CheckIcon,
  PencilIcon,
  FlagIcon,
  CalendarIcon,
  TagIcon,
  ChatBubbleBottomCenterTextIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useTaskDetail } from "@/lib/context/TaskSidebarContext";
import { format, isToday, isTomorrow } from "date-fns";

// --- [INTERNAL] Subtask Component ---
function SubtaskItem({ task }: { task: Task }) {
  const { updateTask, deleteTask } = useTasks();
  const { selectTask } = useTaskDetail();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    updateTask(task.id, { completed: !task.completed, updatedAt: Date.now() });
  };
  const handleTitleBlur = (e: FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsEditing(false);
    const newTitle = e.target.value.trim();
    if (newTitle && newTitle !== task.title)
      updateTask(task.id, { title: newTitle });
    else setTitle(task.title);
  };
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(task.title);
      e.currentTarget.blur();
    }
  };
  const openSubtaskDetails = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    selectTask(task);
  };
  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  return (
    // ✅ 6. Add stopPropagation to the subtask item
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group flex items-center gap-2 pl-8 pr-4 py-1"
      onClick={(e) => e.stopPropagation()} // Stop click from bubbling to parent
    >
      <button
        onClick={handleToggle}
        className={`flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
          task.completed
            ? "bg-blue-600 border-blue-600"
            : "border-gray-400 hover:border-blue-500"
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
            onClick={(e) => e.stopPropagation()} // Stop click
            autoFocus
            className="w-full text-xs font-medium text-gray-800 outline-none ring-1 ring-blue-500 rounded px-1 -mx-1 bg-white"
          />
        ) : (
          <span
            onClick={openSubtaskDetails}
            className={`text-xs text-gray-700 outline-none cursor-pointer rounded px-1 -mx-1 ${
              task.completed
                ? "line-through text-gray-500"
                : "hover:bg-gray-100/50"
            }`}
          >
            {task.title}
          </span>
        )}
      </div>
      <button
        onClick={handleDelete}
        className="p-1 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete subtask"
      >
        <TrashIcon className="h-3 w-3" />
      </button>
    </motion.li>
  );
}
// --- [END] Subtask Component ---

// --- [MAIN] TaskCard Component ---
export default function TaskCard({ task }: { task: Task }) {
  const { tasks, updateTask, deleteTask } = useTasks();
  const { selectTask } = useTaskDetail();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const subtasks = useMemo(
    () =>
      tasks
        .filter((t: Task) => t.parentId === task.id)
        .sort((a, b) => a.createdAt - b.createdAt),
    [tasks, task.id]
  );

  // --- Handlers ---
  const handleTitleBlur = (e: FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsEditing(false);
    const newTitle = e.target.value.trim();
    if (newTitle && newTitle !== task.title)
      updateTask(task.id, { title: newTitle });
    else setTitle(task.title);
  };
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(task.title);
      e.currentTarget.blur();
    }
  };
  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    updateTask(task.id, { completed: !task.completed, updatedAt: Date.now() });
  };
  const cyclePriority = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const priorities: Priority[] = ["none", "low", "medium", "high"];
    const currentIdx = priorities.indexOf(task.priority);
    const nextPriority = priorities[(currentIdx + 1) % priorities.length];
    updateTask(task.id, { priority: nextPriority });
  };
  const handleRemoveTag = (
    e: MouseEvent<HTMLButtonElement>,
    tagToRemove: string
  ) => {
    e.stopPropagation();
    updateTask(task.id, { tags: task.tags.filter((t) => t !== tagToRemove) });
  };

  const openDetailsPanel = () => {
    if (!isEditing) {
      selectTask(task);
    }
  };

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id);
    }
  };

  // --- UI Helpers ---
  const getPriorityClasses = () => {
    switch (task.priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };
  const renderSmartDueDate = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    let label = "";
    let color = "text-gray-500";
    const today = new Date().setHours(0, 0, 0, 0);
    const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
    if (taskDate < today) {
      label = format(date, "MMM d");
      color = "text-red-600 font-medium";
    } else if (isToday(date)) {
      label = "Today";
      color = "text-green-600 font-medium";
    } else if (isTomorrow(date)) {
      label = "Tomorrow";
      color = "text-blue-600";
    } else {
      label = format(date, "MMM d");
    }
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <CalendarIcon className="w-4 h-4" />
        <span>{label}</span>
      </div>
    );
  };

  return (
    // ✅ 6. Main click handler is on the LI
    <motion.li
      layout
      onClick={openDetailsPanel} // Click anywhere on the li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group relative bg-white/60 backdrop-blur-lg rounded-lg shadow-md border border-white/30 transition-all duration-300 cursor-pointer ${
        task.completed
          ? "opacity-60"
          : "opacity-100 hover:shadow-lg hover:-translate-y-0.5"
      }`}
    >
      {/* All content is now in a single div, no z-index needed */}
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={handleToggle} // Has stopPropagation
          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
            task.completed
              ? "bg-blue-600 border-blue-600"
              : "border-gray-400 hover:border-blue-500"
          }`}
          aria-label={
            task.completed ? "Mark as incomplete" : "Mark as complete"
          }
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CheckIcon className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Title & Meta */}
        <div className="flex-1 overflow-hidden">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur} // Has stopPropagation
              onKeyDown={handleTitleKeyDown} // Has stopPropagation
              onClick={(e) => e.stopPropagation()} // Has stopPropagation
              autoFocus
              className="w-full text-sm font-medium text-gray-900 outline-none ring-2 ring-blue-500 rounded px-1 -mx-1 bg-white"
            />
          ) : (
            // The span no longer needs an onClick, the li handles it
            <span
              className={`text-sm font-medium text-gray-900 outline-none rounded px-1 -mx-1 ${
                task.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {task.title}
            </span>
          )}

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
            {renderSmartDueDate()}
            {task.tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => e.stopPropagation()} // Has stopPropagation
                className="flex items-center gap-1 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full"
              >
                <TagIcon className="w-3 h-3" />
                <span>{tag}</span>
                <button
                  onClick={(e) => handleRemoveTag(e, tag)} // Has stopPropagation
                  className="text-gray-500 hover:text-red-600"
                >
                  <XCircleIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            {task.notes && (
              <button
                onClick={(e) => {
                  // Has stopPropagation
                  e.stopPropagation();
                  openDetailsPanel();
                }}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                title="Show notes"
              >
                <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-blue-600" />
              </button>
            )}
          </div>
        </div>

        {/* Priority & Context Menu */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            onClick={cyclePriority} // Has stopPropagation
            className={`w-5 h-5 rounded-full transition-colors ${getPriorityClasses()}`}
            title={`Priority: ${task.priority}`}
          >
            {task.priority === "high" && !task.completed && (
              <span className="absolute w-5 h-5 bg-red-500 rounded-full opacity-75 animate-ping"></span>
            )}
            <FlagIcon className="relative" />
          </button>

          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick} // Has stopPropagation
              title="Edit title"
              className="p-1 text-gray-400 hover:text-gray-700 rounded"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteClick} // Has stopPropagation
              title="Delete task"
              className="p-1 text-gray-400 hover:text-red-600 rounded"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtask Section */}
      <AnimatePresence>
        {subtasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-2 pb-1 border-t border-gray-200/50"
          >
            <ul className="space-y-1">
              <AnimatePresence>
                {subtasks.map((subtask) => (
                  // The SubtaskItem itself handles its own stopPropagation
                  <SubtaskItem key={subtask.id} task={subtask} />
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
