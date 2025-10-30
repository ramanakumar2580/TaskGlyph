"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTier } from "@/lib/db/useTier";
import { useTasks } from "@/lib/db/useTasks";
import { useNotes } from "@/lib/db/useNotes";
import { useDiary } from "@/lib/db/useDiary";
import { usePomodoro } from "@/lib/db/usePomodoro";
import { format } from "date-fns";

export default function UnifiedDashboard() {
  const { data: session } = useSession();
  const tier = useTier();
  const isFree = tier === "free";

  // Tasks
  // ✅ 1. Get the new update and delete functions
  const { tasks, addTask, toggleTask, updateTaskTitle, deleteTask } =
    useTasks();
  const [taskInput, setTaskInput] = useState("");

  // Notes
  // ✅ 2. Get the new delete function
  const { notes, addNote, deleteNote } = useNotes();
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Diary (only for paid users)
  // ✅ 3. Get the new delete function
  const {
    entries: diaryEntries,
    saveTodayEntry,
    deleteDiaryEntry,
  } = useDiary();
  const [diaryContent, setDiaryContent] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = diaryEntries.find((entry) => entry.entryDate === today);
  useEffect(() => {
    if (todayEntry && diaryContent === "") {
      setDiaryContent(todayEntry.content);
    }
    // Prevent re-populating if user cleared it
    if (!todayEntry) {
      setDiaryContent("");
    }
  }, [todayEntry, diaryContent]);

  // Pomodoro
  const { sessions: pomodoroSessions } = usePomodoro();

  // Task limit for Free tier
  const taskLimit = isFree ? 21 : Infinity;
  const noteLimit = isFree ? 14 : Infinity;
  const canAddTask = tasks.length < taskLimit;
  const canAddNote = notes.length < noteLimit;

  // Handlers
  const handleAddTask = () => {
    if (taskInput.trim() && canAddTask) {
      addTask(taskInput.trim());
      setTaskInput("");
    }
  };

  // ✅ This function already clears the inputs (lines 74-75)
  const handleAddNote = () => {
    if (noteTitle.trim() && canAddNote) {
      addNote(noteTitle.trim(), noteContent);
      setNoteTitle("");
      setNoteContent("");
    }
  };

  const handleSaveDiary = () => {
    if (!isFree) {
      saveTodayEntry(diaryContent);
      // ✅ 4. Clear the diary content box after saving
      setDiaryContent("");
    }
  };

  // ✅ 5. Add new handlers for edit/delete
  const handleEditTask = (id: string, currentTitle: string) => {
    const newTitle = prompt("Enter new task title:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      updateTaskTitle(id, newTitle.trim());
    }
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
    }
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(id);
    }
  };

  const handleDeleteDiary = (id: string) => {
    if (confirm("Are you sure you want to delete today's diary entry?")) {
      deleteDiaryEntry(id);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900">
        TaskGlyph Dashboard
      </h2>

      {/* Tier Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">
          {isFree ? (
            <span>
              🆓 Free Tier — {taskLimit - tasks.length} tasks left,{" "}
              {noteLimit - notes.length} notes left
            </span>
          ) : (
            <span>
              ✨{" "}
              {tier === "basic"
                ? "Basic"
                : tier === "pro"
                ? "Pro"
                : "Ultra Pro"}{" "}
              Tier — Full access
            </span>
          )}
        </p>
      </div>

      {/* Tasks */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tasks ({tasks.length}/{taskLimit})
        </h3>
        {canAddTask ? (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-800"
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <button
              onClick={handleAddTask}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        ) : (
          <p className="text-gray-500 mb-4">
            Task limit reached. Upgrade to add more.
          </p>
        )}
        <ul className="space-y-2">
          {tasks.map((task) => (
            // ✅ 6. Add flex layout to list item
            <li
              key={task.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id, !task.completed)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span
                  className={
                    task.completed
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  }
                >
                  {task.title}
                </span>
              </div>
              {/* ✅ 7. Add Edit and Delete buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTask(task.id, task.title)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {tasks.length === 0 && <p className="text-gray-500">No tasks yet.</p>}
      </section>

      {/* Notes */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Notes ({notes.length}/{noteLimit})
        </h3>
        {canAddNote ? (
          <>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2 text-gray-800"
            />
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note..."
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-800"
            />
            <button
              onClick={handleAddNote}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Note
            </button>
          </>
        ) : (
          <p className="text-gray-500">
            Note limit reached. Upgrade to add more.
          </p>
        )}
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
          {notes.slice(0, 3).map((note) => (
            // ✅ 8. Add flex layout to note item
            <div
              key={note.id}
              className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
            >
              <span>
                <strong>{note.title}</strong>: {note.content.substring(0, 60)}
                ...
              </span>
              {/* ✅ 9. Add Delete button */}
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="ml-2 text-xs text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        {notes.length === 0 && (
          <p className="text-gray-500 mt-2">No notes yet.</p>
        )}
      </section>

      {/* Diary — ONLY FOR PAID USERS */}
      {!isFree && (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Diary — {format(new Date(), "EEEE, MMMM d, yyyy")}
          </h3>
          <textarea
            value={diaryContent}
            onChange={(e) => setDiaryContent(e.target.value)}
            placeholder="Write your daily thoughts..."
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-800"
          />
          <button
            onClick={handleSaveDiary}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {todayEntry ? "Update Entry" : "Save Entry"}
          </button>
          {/* ✅ 10. Add Delete button for today's entry */}
          {todayEntry && (
            <button
              onClick={() => handleDeleteDiary(todayEntry.id)}
              className="ml-2 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
            >
              Delete Entry
            </button>
          )}
        </section>
      )}

      {/* Pomodoro */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Focus Sessions
        </h3>
        <p className="text-gray-600 mb-4">
          You’ve completed <strong>{pomodoroSessions.length}</strong> sessions.
          {isFree && pomodoroSessions.length >= 21 && (
            <span className="text-red-600 ml-2">Monthly limit reached.</span>
          )}
        </p>
        <a
          href="/pomodoro"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Start Pomodoro Timer
        </a>
      </section>

      {/* User Info */}
      <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
        <p>Signed in as: {session?.user?.email}</p>
        <p className="mt-1">✅ All data syncs to cloud — works offline too!</p>
      </div>
    </div>
  );
}
