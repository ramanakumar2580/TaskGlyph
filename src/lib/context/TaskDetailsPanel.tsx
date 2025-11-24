/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Fragment, useState, useEffect, FormEvent, useMemo } from "react";
import { Dialog, Transition, Popover } from "@headlessui/react";
import {
  XMarkIcon,
  FlagIcon,
  ChatBubbleBottomCenterTextIcon,
  TagIcon,
  ViewColumnsIcon as SubtaskIcon,
  BellIcon,
  ArrowPathIcon, // For recurring
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XCircleIcon,
  CheckIcon,
  ArrowDownOnSquareIcon, // For Save
  ArrowUturnLeftIcon, // For Reset
  CalendarIcon, // For Due Date
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskDetail } from "@/lib/context/TaskSidebarContext";
import { useTasks } from "@/lib/db/useTasks";
import { Task, Priority, RecurringSchedule } from "@/lib/db/clientDb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/components/DatePicker.css"; // Your custom styles

// Import the new components
import StylishButton from "@/components/StylishButton"; // Corrected Path
import SubtaskItem from "@/components/SubtaskItem"; // Corrected Path
import { format } from "date-fns";

// A type for the task properties we want to edit locally
type LocalTaskDetails = Pick<
  Task,
  "title" | "priority" | "dueDate" | "reminderAt"
> & {
  // ✅ FIX 2: Rename 'recurring' to 'recurringSchedule' to match the db
  recurringSchedule: RecurringSchedule;
};

// --- Main Panel ---
type RecurringOption = RecurringSchedule;

export default function TaskDetailsPanel() {
  const { selectedTask: selectedTaskFromContext, selectTask } = useTaskDetail();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  const selectedTask = useMemo(() => {
    if (!selectedTaskFromContext) return null;
    return (
      tasks?.find((t: Task) => t.id === selectedTaskFromContext.id) || null
    );
  }, [tasks, selectedTaskFromContext]);

  // --- LOCAL STATE ---
  const [localTask, setLocalTask] = useState<LocalTaskDetails | null>(null);
  const [notes, setNotes] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const subtasks = useMemo(() => {
    if (!selectedTask) return [];
    return tasks
      .filter((t: Task) => t.parentId === selectedTask.id)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [tasks, selectedTask]);

  // EFFECT: Load task data into local state when task changes
  useEffect(() => {
    if (selectedTask) {
      setLocalTask({
        title: selectedTask.title,
        priority: selectedTask.priority,
        dueDate: selectedTask.dueDate,
        reminderAt: selectedTask.reminderAt,
        // ✅ FIX 2: Read from 'recurringSchedule'
        recurringSchedule: selectedTask.recurringSchedule || "none",
      });
      setNotes(selectedTask.notes || "");
    } else {
      setLocalTask(null);
      setNotes("");
    }
  }, [selectedTask]);

  if (!selectedTask || !localTask) return null; // Wait for state to be ready

  // --- LOCAL Handlers (updates state) ---
  const handleClose = () => selectTask(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLocalTask({ ...localTask, title: e.target.value });

  const cyclePriority = () => {
    const priorities: Priority[] = ["none", "low", "medium", "high"];
    const idx = priorities.indexOf(localTask.priority);
    const next = priorities[(idx + 1) % priorities.length];
    setLocalTask({ ...localTask, priority: next });
  };

  const handleSetDueDate = (date: Date | null) =>
    setLocalTask({ ...localTask, dueDate: date ? date.getTime() : null });

  const handleSetReminder = (date: Date | null) =>
    setLocalTask({ ...localTask, reminderAt: date ? date.getTime() : null });

  const handleSetRecurring = (option: RecurringOption) =>
    // ✅ FIX 2: Update 'recurringSchedule'
    setLocalTask({ ...localTask, recurringSchedule: option });

  // --- SAVE Handlers (updates DB) ---

  const handleSaveNotes = async () => {
    if (notes !== (selectedTask.notes || "")) {
      await updateTask(selectedTask.id, { notes });
    }
  };

  const handleSaveDetails = async () => {
    if (!localTask) return;
    setIsSavingDetails(true);

    // ✅ FIX 2: We can now spread localTask, as its shape matches the db
    await updateTask(selectedTask.id, {
      ...localTask,
      title: localTask.title.trim() || "Untitled Task",
    });

    setTimeout(() => setIsSavingDetails(false), 1000);
  };

  const handleResetDetails = () => {
    setLocalTask({
      title: selectedTask.title,
      priority: selectedTask.priority,
      dueDate: selectedTask.dueDate,
      reminderAt: selectedTask.reminderAt,
      // ✅ FIX 2: Read from 'recurringSchedule'
      recurringSchedule: selectedTask.recurringSchedule || "none",
    });
    setNotes(selectedTask.notes || "");
  };

  const handleAddTag = (e: FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim();
    if (tag && !selectedTask.tags.includes(tag))
      updateTask(selectedTask.id, { tags: [...selectedTask.tags, tag] });
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) =>
    updateTask(selectedTask.id, {
      tags: selectedTask.tags.filter((t) => t !== tag),
    });

  const handleAddSubtask = (e: FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addTask(newSubtaskTitle, {
      parentId: selectedTask.id,
      projectId: selectedTask.projectId,
    });
    setNewSubtaskTitle("");
  };

  const handleDeleteTask = () => {
    if (confirm("Delete this task and all its subtasks?")) {
      deleteTask(selectedTask.id);
      handleClose();
    }
  };

  // ✅ FIX 1: Wrap 'localTask.reminderAt' (which is a string) with Number()
  const reminderDate = localTask.reminderAt
    ? new Date(Number(localTask.reminderAt))
    : null;

  const recurringOptions: RecurringOption[] = [
    "none",
    "daily",
    "weekly",
    "monthly",
  ];
  // ✅ FIX 2: Read from 'recurringSchedule'
  const currentRecurring = localTask.recurringSchedule || "none";

  const detailsChanged =
    localTask.title !== selectedTask.title ||
    localTask.priority !== selectedTask.priority ||
    localTask.dueDate !== selectedTask.dueDate ||
    localTask.reminderAt !== selectedTask.reminderAt ||
    // ✅ FIX 2: Compare 'recurringSchedule'
    localTask.recurringSchedule !== (selectedTask.recurringSchedule || "none");

  const notesChanged = notes !== (selectedTask.notes || "");

  // --- Helper for styling Popover buttons ---
  const PopoverButton = ({
    icon: Icon,
    label,
    value,
    onClick,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
    onClick?: () => void;
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
      >
        <Icon
          className={`w-4 h-4 ${value ? "text-gray-700" : "text-gray-400"}`}
        />
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || `Set ${label}`}
        </span>
      </button>
    </div>
  );

  return (
    <Transition.Root show={!!selectedTask} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Overlay - No blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* Drawer on Right */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full justify-end">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                {/* --- CORRECT ARCHITECTURE --- */}
                <Dialog.Panel className="pointer-events-auto flex flex-col">
                  <motion.div
                    animate={{
                      width: isExpanded ? "36rem" : "24rem", // 576px / 384px
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    // --- Scroll is on the CONTENT, not the panel ---
                    className="flex h-full flex-col bg-white shadow-2xl ring-1 ring-gray-900/5"
                  >
                    {/* Header */}
                    <div className="bg-white p-4 flex items-center justify-between flex-shrink-0">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronRightIcon className="w-5 h-5" />
                        ) : (
                          <ChevronLeftIcon className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={handleClose}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content - overflow-y-auto is here */}
                    <div className="flex-1 px-6 pt-2 space-y-5 pb-6 overflow-y-auto">
                      {/* Title Section */}
                      <div className="py-2">
                        <input
                          type="text"
                          name="title"
                          value={localTask.title}
                          onChange={handleTitleChange}
                          className="w-full text-3xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 focus:border-transparent p-0 placeholder-gray-400"
                          placeholder="Task Title"
                        />
                      </div>

                      <hr className="border-gray-100" />

                      {/* --- PROPERTY GRID --- */}
                      <div
                        className={`grid ${
                          isExpanded ? "grid-cols-2" : "grid-cols-1"
                        } gap-x-6 gap-y-3 py-3`}
                      >
                        {/* Col 1 */}
                        <div className="space-y-3">
                          <PopoverButton
                            label="Priority"
                            icon={FlagIcon}
                            value={localTask.priority}
                            onClick={cyclePriority}
                          />

                          {/* --- RECURRING POPOVER --- */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Recurring
                            </span>
                            <Popover className="relative">
                              {({ close }) => (
                                <>
                                  <Popover.Button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                    <ArrowPathIcon
                                      className={`w-4 h-4 ${
                                        currentRecurring !== "none"
                                          ? "text-gray-700"
                                          : "text-gray-400"
                                      }`}
                                    />
                                    <span
                                      className={
                                        currentRecurring !== "none"
                                          ? "text-gray-900 capitalize"
                                          : "text-gray-500"
                                      }
                                    >
                                      {currentRecurring === "none"
                                        ? "Set Recurring"
                                        : currentRecurring}
                                    </span>
                                  </Popover.Button>
                                  {/* --- Removed the broken Popover.Portal --- */}
                                  <Transition
                                    as={Fragment}
                                    enter="transition duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                  >
                                    <Popover.Panel className="absolute z-10 mt-3 w-48 left-0">
                                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 bg-white">
                                        <div className="relative flex flex-col p-1">
                                          {recurringOptions.map((option) => (
                                            <button
                                              key={option}
                                              onClick={() => {
                                                handleSetRecurring(option);
                                                close();
                                              }}
                                              className={`w-full text-left px-3 py-2 rounded text-sm capitalize flex items-center justify-between ${
                                                currentRecurring === option
                                                  ? "bg-gray-900 text-white"
                                                  : "text-gray-900 hover:bg-gray-100 transition-colors"
                                              }`}
                                            >
                                              {option === "none"
                                                ? "No Repeat"
                                                : option}
                                              {currentRecurring === option && (
                                                <CheckIcon className="w-4 h-4" />
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </Popover.Panel>
                                  </Transition>
                                </>
                              )}
                            </Popover>
                          </div>
                        </div>
                        {/* Col 2 */}
                        <div className="space-y-3">
                          {/* --- "DUE DATE" --- */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Due Date
                            </span>
                            <Popover className="relative">
                              {({ close }) => (
                                <>
                                  <Popover.Button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                    <CalendarIcon
                                      className={`w-4 h-4 ${
                                        localTask.dueDate
                                          ? "text-gray-700"
                                          : "text-gray-400"
                                      }`}
                                    />
                                    <span
                                      className={
                                        localTask.dueDate
                                          ? "text-gray-900"
                                          : "text-gray-500"
                                      }
                                    >
                                      {/* ✅ FIX 1: Wrap 'localTask.dueDate' (string) with Number() */}
                                      {localTask.dueDate
                                        ? format(
                                            Number(localTask.dueDate),
                                            "MMM d"
                                          )
                                        : "Set date"}
                                    </span>
                                  </Popover.Button>
                                  {/* --- Removed the broken Popover.Portal --- */}
                                  <Transition
                                    as={Fragment}
                                    enter="transition duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                  >
                                    <Popover.Panel className="absolute z-10 mt-3 right-0">
                                      <div className="bg-white p-3 shadow-lg rounded-lg ring-1 ring-black/5">
                                        <DatePicker
                                          // ✅ FIX 1: Wrap 'localTask.dueDate' (string) with Number()
                                          selected={
                                            localTask.dueDate
                                              ? new Date(
                                                  Number(localTask.dueDate)
                                                )
                                              : null
                                          }
                                          onChange={(date) => {
                                            handleSetDueDate(date);
                                            close();
                                          }}
                                          inline
                                          portalId="root" // <-- FIX: Add portal
                                          calendarClassName={
                                            !isExpanded
                                              ? "datepicker-collapsed"
                                              : ""
                                          }
                                        />
                                      </div>
                                    </Popover.Panel>
                                  </Transition>
                                </>
                              )}
                            </Popover>
                          </div>

                          {/* --- "REMINDER" --- */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Reminder
                            </span>
                            <Popover className="relative">
                              <Popover.Button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                <BellIcon
                                  className={`w-4 h-4 ${
                                    reminderDate
                                      ? "text-gray-700"
                                      : "text-gray-400"
                                  }`}
                                />
                                <span
                                  className={
                                    reminderDate
                                      ? "text-gray-900"
                                      : "text-gray-500"
                                  }
                                >
                                  {/* This line (476) is now fixed because 'reminderDate' is created correctly */}
                                  {reminderDate
                                    ? format(reminderDate, "MMM d, p")
                                    : "Add Reminder"}
                                </span>
                              </Popover.Button>
                              {/* --- Removed the broken Popover.Portal --- */}
                              <Transition
                                as={Fragment}
                                enter="transition duration-200"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition duration-150"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                              >
                                {/* --- FIX: Alignment fix --- */}
                                <Popover.Panel className="absolute z-10 mt-3 right-0">
                                  <div className="bg-white p-3 shadow-lg rounded-lg ring-1 ring-black/5">
                                    <DatePicker
                                      selected={reminderDate}
                                      onChange={handleSetReminder}
                                      showTimeSelect
                                      inline
                                      portalId="root" // <-- FIX: Add portal
                                      calendarClassName={
                                        !isExpanded
                                          ? "datepicker-collapsed"
                                          : ""
                                      }
                                    />
                                  </div>
                                </Popover.Panel>
                              </Transition>
                            </Popover>
                          </div>
                        </div>
                      </div>

                      <hr className="border-gray-100" />

                      {/* Notes Section */}
                      <div className="pt-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2.5 mb-2">
                          <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-500" />
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          onBlur={handleSaveNotes} // Auto-saves on blur
                          placeholder="Add details, links, or anything else..."
                          className="w-full text-sm p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 resize-y outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors placeholder-gray-500"
                          rows={6}
                        />
                      </div>

                      <hr className="border-gray-100" />

                      {/* Tags Section */}
                      <div className="pt-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2.5 mb-3">
                          <TagIcon className="w-5 h-5 text-gray-500" />
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedTask.tags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full shadow-sm"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-red-500 transition-colors"
                                title="Remove tag"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <form
                          onSubmit={handleAddTag}
                          className="flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-gray-900 transition-all"
                        >
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag..."
                            className="flex-1 text-sm p-3 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                          />
                          <button
                            type="submit"
                            className="p-3 text-gray-400 hover:text-gray-900 transition-colors"
                            title="Add tag"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </form>
                      </div>

                      <hr className="border-gray-100" />

                      {/* Subtasks Section */}
                      <div className="pt-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2.5 mb-3">
                          <SubtaskIcon className="w-5 h-5 text-gray-500" />
                          Subtasks
                        </label>
                        <ul className="mb-3 -mx-6">
                          <AnimatePresence initial={false}>
                            {subtasks.map((t) => (
                              <SubtaskItem key={t.id} task={t} />
                            ))}
                          </AnimatePresence>
                        </ul>
                        <form
                          onSubmit={handleAddSubtask}
                          className="flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-gray-900 transition-all"
                        >
                          <input
                            type="text"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            placeholder="Add a subtask..."
                            className="flex-1 text-sm p-3 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                          />
                          <button
                            type="submit"
                            className="p-3 text-gray-400 hover:text-gray-900 transition-colors"
                            title="Add subtask"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </form>
                      </div>

                      <hr className="border-gray-100" />

                      {/* Delete Section */}
                      <div className="pt-3">
                        <button
                          onClick={handleDeleteTask}
                          className="flex items-center gap-2 text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                          Delete this task
                        </button>
                      </div>
                    </div>

                    {/* --- STICKY FOOTER (sibling to content) --- */}
                    <motion.div
                      animate={{
                        width: isExpanded ? "36rem" : "24rem", // 576px / 384px
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 28,
                      }}
                      className="w-full p-4 bg-white border-t border-gray-200 flex justify-end gap-3 z-10 flex-shrink-0"
                    >
                      <StylishButton
                        onClick={handleResetDetails}
                        variant="secondary"
                        disabled={!detailsChanged && !notesChanged}
                        icon={ArrowUturnLeftIcon}
                      >
                        Reset
                      </StylishButton>
                      <StylishButton
                        onClick={handleSaveDetails}
                        variant="primary"
                        disabled={!detailsChanged || isSavingDetails}
                        icon={ArrowDownOnSquareIcon}
                      >
                        {isSavingDetails ? "Saving..." : "Save Changes"}
                      </StylishButton>
                    </motion.div>
                  </motion.div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
