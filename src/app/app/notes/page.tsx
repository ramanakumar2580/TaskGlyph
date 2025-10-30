"use client";

import { useState } from "react";
import { useNotes } from "@/lib/db/useNotes";

export default function NotesPage() {
  // ✅ 1. Get updateNote and deleteNote
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (title.trim()) {
      addNote(title.trim(), content);
      // These lines already clear the inputs, which is perfect
      setTitle("");
      setContent("");
    }
  };

  // ✅ 2. Add handlers for Edit and Delete
  const handleEdit = (
    id: string,
    currentTitle: string,
    currentContent: string
  ) => {
    const newTitle = prompt("Enter new title:", currentTitle);
    if (newTitle === null) return; // User cancelled

    const newContent = prompt("Enter new content:", currentContent);
    if (newContent === null) return; // User cancelled

    updateNote(id, { title: newTitle.trim(), content: newContent });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notes</h1>

        {/* Add Note Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Note</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-gray-800"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in Markdown..."
            rows={6}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 mb-4"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Note
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-6">
          {notes
            // Sort by most recently updated
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* ✅ 3. Add flex row for Title and buttons */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {note.title}
                  </h3>
                  {/* ✅ 4. Add Edit/Delete button group */}
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleEdit(note.id, note.title, note.content)
                      }
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* Note content */}
                <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">
                  {note.content}
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Updated: {new Date(note.updatedAt).toLocaleString()}
                </div>
              </div>
            ))}
        </div>

        {notes.length === 0 && (
          <p className="text-gray-500 text-center mt-8">
            No notes yet. Create one above!
          </p>
        )}
      </div>
    </div>
  );
}
