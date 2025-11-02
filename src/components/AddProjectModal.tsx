// src/components/AddProjectModal.tsx
"use client";

import { useState, FormEvent } from "react";
import Modal from "./Modal"; // Import the reusable modal shell
import { useProjects } from "@/lib/db/useProjects";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProjectModal({
  isOpen,
  onClose,
}: AddProjectModalProps) {
  const [title, setTitle] = useState("");
  const { addProject } = useProjects();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project name cannot be empty.");
      return;
    }

    addProject(title.trim());

    setError(null);
    setTitle("");
    onClose();
  };

  const handleClose = () => {
    setError(null);
    setTitle("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-700"
          >
            Project Name
          </label>
          {/* ✅ (Point 1) Polished input field */}
          <input
            type="text"
            id="projectName"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 bg-white/70 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Q4 Marketing Plan"
            autoFocus
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        {/* ✅ (Point 1) Polished buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
}
