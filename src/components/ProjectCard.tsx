// src/components/ProjectCard.tsx
"use client";

import {
  useState,
  useMemo,
  FormEvent,
  FocusEvent,
  KeyboardEvent,
  // ✅ 1. REMOVED Fragment, Popover, and Transition
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/lib/db/useTasks";
import { useProjects } from "@/lib/db/useProjects";
import { Project, Task } from "@/lib/db/clientDb";
import TaskCard from "@/components/TaskCard";
import {
  PlusIcon,
  // ✅ 2. REMOVED EllipsisHorizontalIcon
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function ProjectCard({ project }: { project: Project }) {
  const { tasks, addTask } = useTasks();
  const { updateProject, deleteProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.name);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const projectTasks = useMemo(() => {
    return tasks
      .filter((t: Task) => t.projectId === project.id && !t.parentId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [tasks, project.id]);

  // --- Project Handlers ---
  const handleTitleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    const newTitle = e.target.value.trim();
    if (newTitle && newTitle !== project.name)
      updateProject(project.id, { name: newTitle });
    else setTitle(project.name);
  };
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(project.name);
      e.currentTarget.blur();
    }
  };
  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete "${project.name}" and all its tasks?`
      )
    ) {
      deleteProject(project.id);
    }
  };
  const handleAddTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle.trim(), { projectId: project.id });
    setNewTaskTitle("");
  };

  // ✅ 3. REMOVED Popover wrapper. Added `group` for hover icons.
  return (
    <motion.section
      layout
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      animate="visible"
      className="group relative bg-white/50 backdrop-blur-md rounded-xl shadow-md border border-gray-100 transition-all z-10"
    >
      {/* --- Project Header --- */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
          >
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform duration-200 ${
                isExpanded ? "" : "-rotate-90"
              }`}
            />
          </button>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-lg font-semibold text-gray-900 w-full outline-none ring-2 ring-blue-500 rounded px-1 -mx-1 bg-white"
            />
          ) : (
            <h2
              onClick={() => setIsEditing(true)}
              className="text-lg font-semibold text-gray-900 cursor-text hover:bg-gray-100/50 px-1 -mx-1 rounded"
            >
              {project.name}
            </h2>
          )}
        </div>

        {/* ✅ 4. REPLACED Popover.Button with hover icons */}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            title="Edit project name"
            className="p-1 text-gray-400 hover:text-gray-700 rounded"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete project"
            className="p-1 text-gray-400 hover:text-red-600 rounded"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* --- Collapsible Task List --- */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <ul className="space-y-2">
                <AnimatePresence>
                  {projectTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </ul>

              {/* Polished "Add Task" form */}
              <form onSubmit={handleAddTask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  name="taskTitle"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a task..."
                  className="flex-1 bg-white/70 rounded-lg px-3 py-1.5 text-sm placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 p-1.5 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-700 transition-colors"
                  title="Add task to project"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
