"use client";

import { useState, useEffect } from "react";
import { useDiary } from "@/lib/db/useDiary";

export default function DiaryPage() {
  // ✅ 1. Get the deleteDiaryEntry function
  const { entries, saveTodayEntry, deleteDiaryEntry } = useDiary();
  const [content, setContent] = useState("");
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const todaysEntry = entries.find((entry) => entry.entryDate === today);

  // Load today's content if it exists
  useEffect(() => {
    if (todaysEntry) {
      setContent(todaysEntry.content);
    } else {
      // ✅ If today's entry is deleted, clear the box
      setContent("");
    }
  }, [todaysEntry, today]);

  // This effect formats the date
  useEffect(() => {
    const todayElement = document.getElementById("today-date");
    if (todayElement) {
      todayElement.textContent = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  }, []);

  const handleSave = () => {
    if (content.trim()) {
      saveTodayEntry(content.trim());
      // ✅ 2. Clear the text box after saving
      setContent("");
    }
  };

  // ✅ 3. Add a generic delete handler
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this diary entry?")) {
      deleteDiaryEntry(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Personal Diary
        </h1>

        {/* Today's Entry */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Today, <span id="today-date">Loading...</span>
          </h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts for today..."
            rows={8}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 mb-4"
          />
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {todaysEntry ? "Update Entry" : "Save Entry"}
          </button>

          {/* ✅ 4. Add delete button for today's entry */}
          {todaysEntry && (
            <button
              onClick={() => handleDelete(todaysEntry.id)}
              className="ml-2 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
            >
              Delete Entry
            </button>
          )}
        </div>

        {/* Past Entries */}
        {entries.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Past Entries
            </h2>
            <div className="space-y-4">
              {[...entries]
                .filter((entry) => entry.entryDate !== today)
                .sort(
                  (a, b) =>
                    new Date(b.entryDate).getTime() -
                    new Date(a.entryDate).getTime()
                )
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    {/* ✅ 5. Add flex and delete button for past entries */}
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-gray-900">
                        {new Date(entry.entryDate).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "UTC",
                          }
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                      {entry.content}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
