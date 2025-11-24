// src/app/tasks/page.tsx

"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/lib/db/useTasks";
import { useProjects } from "@/lib/db/useProjects";
import { Task, Project } from "@/lib/db/clientDb";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import TaskCard from "@/components/TaskCard";
import ProjectCard from "@/components/ProjectCard";
import AddProjectModal from "@/components/AddProjectModal";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import TaskCalendar from "@/components/TaskCalendar";

export default function TaskPageContent() {
  const { tasks, addTask } = useTasks();
  const { projects } = useProjects();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- 1. SEARCH LOGIC FIX (Deep Search) ---
  const filteredTasks = tasks.filter((task: Task) => {
    const term = searchTerm.toLowerCase();
    const inTitle = task.title.toLowerCase().includes(term);
    // Check if notes exist and contain the term
    const inNotes = task.notes
      ? task.notes.toLowerCase().includes(term)
      : false;

    return inTitle || inNotes;
  });

  // --- 2. SUBTASK VISIBILITY FIX ---
  const standaloneTasks = filteredTasks
    .filter((task: Task) => {
      // If user is searching, SHOW EVERYTHING (Subtasks, Project tasks, etc.)
      // We want to find the item regardless of where it lives.
      if (searchTerm.trim().length > 0) return true;

      // If NOT searching, keep the view clean (Only standalone, root tasks)
      return !task.projectId && !task.parentId;
    })
    .sort((a, b) => a.createdAt - b.createdAt);

  const filteredProjects = projects.filter((project: Project) => {
    const term = searchTerm.toLowerCase();
    const inName = project.name.toLowerCase().includes(term);
    const inDesc = project.description
      ? project.description.toLowerCase().includes(term)
      : false;
    return inName || inDesc;
  });

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  const handleAddProject = () => setIsModalOpen(true);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      console.log("Drag end:", active.id, "over", over.id);
      // alert("Drag-and-drop feature coming soon!");
    }
  };

  // Auto-focus when search becomes visible
  useEffect(() => {
    if (isSearchVisible) searchInputRef.current?.focus();
  }, [isSearchVisible]);

  return (
    <>
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="bg-gray-100/50 min-h-screen p-6">
          <main className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Tasks & Projects
              </h1>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative flex items-center h-10">
                  <AnimatePresence>
                    {isSearchVisible && (
                      <motion.input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search title, notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onBlur={() => !searchTerm && setIsSearchVisible(false)} // Only close if empty
                        className="pl-10 pr-4 py-2 w-48 sm:w-64 bg-white/70 border-none rounded-lg shadow-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.button
                    layout
                    onClick={() => setIsSearchVisible(true)}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-full"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-200 p-1 rounded-lg">
                  <button
                    className={`px-3 py-1 text-sm rounded-md flex items-center gap-1.5 ${
                      viewMode === "list" ? "bg-white shadow" : "text-gray-600"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <ListBulletIcon className="w-4 h-4" /> List
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md flex items-center gap-1.5 ${
                      viewMode === "calendar"
                        ? "bg-white shadow"
                        : "text-gray-600"
                    }`}
                    onClick={() => setViewMode("calendar")}
                  >
                    <CalendarDaysIcon className="w-4 h-4" /> Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {viewMode === "list" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Projects */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Projects
                    </h2>
                    <button
                      onClick={handleAddProject}
                      className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="w-4 h-4" />
                      New Project
                    </button>
                  </div>

                  {projects.length === 0 ? (
                    <div className="text-center p-8 bg-white/70 backdrop-blur-md rounded-lg shadow-sm border border-gray-100">
                      <p className="text-gray-500">You have no projects.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Click “New Project” to create one.
                      </p>
                    </div>
                  ) : (
                    // [FIX #3] Removed 'layout' prop to stop ugly jumping animation
                    <div className="space-y-6">
                      <AnimatePresence>
                        {filteredProjects.map((project) => (
                          <ProjectCard key={project.id} project={project} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Standalone Tasks */}
                <div className="lg:col-span-1 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {searchTerm ? "Search Results" : "Standalone Tasks"}
                  </h2>

                  <form
                    onSubmit={handleAddTask}
                    className="flex gap-2 flex-shrink-0"
                  >
                    <input
                      type="text"
                      name="taskTitle"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a standalone task..."
                      className="flex-1 bg-white/70 rounded-lg px-3 py-1.5 text-sm placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-none backdrop-blur-md"
                    />
                    <button
                      type="submit"
                      className="flex-shrink-0 p-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                      title="Add task"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </form>

                  {standaloneTasks.length === 0 ? (
                    <div className="text-center p-6 bg-white/70 backdrop-blur-md rounded-lg shadow-sm border border-gray-100">
                      <p className="text-gray-500 text-sm">
                        {searchTerm
                          ? "No tasks found."
                          : "No standalone tasks."}
                      </p>
                    </div>
                  ) : (
                    // [FIX #3] Removed 'layout' prop from motion.ul
                    <ul className="space-y-2">
                      <AnimatePresence>
                        {standaloneTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              // --- Calendar View ---
              <TaskCalendar tasks={tasks} />
            )}
          </main>
        </div>
      </DndContext>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
