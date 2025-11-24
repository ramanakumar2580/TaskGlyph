// components/TagsModal.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNotes } from "@/lib/db/useNotes";
import { type Note } from "@/lib/db/clientDb";
import { X, Tag, Plus, Check } from "lucide-react";

export function TagsModal({
  note,
  onClose,
  allTags,
}: {
  note: Note;
  onClose: () => void;
  allTags: Set<string>;
}) {
  const { updateNote } = useNotes();
  const [newTag, setNewTag] = useState("");
  const [currentTags, setCurrentTags] = useState(new Set(note.tags || []));

  // This useEffect fixes the bug where you see the wrong tags for a note
  useEffect(() => {
    setCurrentTags(new Set(note.tags || []));
  }, [note.id, note.tags]);

  const sortedTags = useMemo(() => {
    return Array.from(allTags).sort();
  }, [allTags]);

  // This function handles both ADDING and REMOVING a tag
  const handleToggleTag = (tag: string) => {
    const newTags = new Set(currentTags);
    if (newTags.has(tag)) {
      // --- THIS IS THE REMOVE LOGIC ---
      // If the tag is already added, delete it
      newTags.delete(tag);
    } else {
      // This is the add logic
      newTags.add(tag);
    }
    setCurrentTags(newTags);
    updateNote(note.id, { tags: Array.from(newTags) });
  };

  const handleAddNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedTag = newTag.trim().replace(/\s+/g, "-"); // no spaces
    if (formattedTag && !currentTags.has(formattedTag)) {
      const newTags = new Set(currentTags);
      newTags.add(formattedTag);
      setCurrentTags(newTags);
      updateNote(note.id, { tags: Array.from(newTags) });
      setNewTag(""); // Clear input
    }
  };

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="glass-morphism fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     bg-white rounded-lg shadow-xl w-96 p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Tags for &quot;{note.title || "Untitled Note"}&quot;
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded-full hover:bg-gray-200"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Add New Tag Input */}
          <form onSubmit={handleAddNewTag} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add or create a tag..."
              className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="p-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Tag List */}
          <div className="max-h-60 overflow-y-auto pr-2">
            {sortedTags.length === 0 && currentTags.size === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No tags created yet.
              </p>
            )}
            <ul>
              {/* Show current tags first (the ones with checkmarks) */}
              {Array.from(currentTags)
                .sort()
                .map((tag) => (
                  <li
                    key={tag}
                    // Click this to REMOVE the tag
                    onClick={() => handleToggleTag(tag)}
                    className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-200"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-gray-600" />
                      {tag}
                    </span>
                    <Check className="w-4 h-4 text-black" />
                  </li>
                ))}
              {/* Show other available tags (the ones without checkmarks) */}
              {sortedTags
                .filter((tag) => !currentTags.has(tag))
                .map((tag) => (
                  <li
                    key={tag}
                    // Click this to ADD the tag
                    onClick={() => handleToggleTag(tag)}
                    className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-200"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-gray-600" />
                      {tag}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
