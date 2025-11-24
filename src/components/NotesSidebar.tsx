"use client";

import React, { useState } from "react";
import {
  useFolders,
  useNotes,
  useTrashNotes,
  useNoteTags,
} from "@/lib/db/useNotes";
import {
  Folder,
  FolderPlus,
  Notebook,
  PanelLeftClose,
  Trash2,
  Zap,
  Tag,
  PanelRightClose,
} from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";

// --- 1. Simple Tooltip Component (No external libraries needed) ---
const SidebarBtnWithTooltip = ({
  onClick,
  icon: Icon,
  label,
  isActive = false,
  className = "",
}: {
  onClick: (e: React.MouseEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  isActive?: boolean;
  className?: string;
}) => (
  <div className="relative group flex justify-center my-1">
    <button
      onClick={onClick}
      className={`
        p-2 rounded-md transition-colors duration-200
        ${
          isActive
            ? "bg-blue-100 text-blue-600"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        }
        ${className}
      `}
    >
      <Icon size={20} strokeWidth={2} />
    </button>
    {/* Tooltip */}
    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
      {label}
      {/* Tiny arrow pointing left */}
      <span className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-gray-900"></span>
    </span>
  </div>
);

// --- 2. New Folder Modal (Kept same) ---
function NewFolderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("New Folder");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onCreate(name.trim());
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-80 p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <h4 className="text-sm font-bold mb-4 text-gray-800">
          Create New Folder
        </h4>
        <label
          htmlFor="folderName"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
        >
          Name
        </label>
        <input
          id="folderName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-b-2 border-gray-200 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          autoFocus
          onFocus={(e) => e.target.select()}
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

// --- 3. Main Sidebar Component ---
export function NotesSidebar({
  isCollapsed,
  onToggleClick,
  selectedView,
  setSelectedView,
}: {
  isCollapsed: boolean;
  onToggleClick: () => void;
  selectedView: string;
  setSelectedView: (view: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { notes } = useNotes();
  const { trashedNotes } = useTrashNotes();
  const { folders, addFolder, deleteFolder } = useFolders();
  const { tags } = useNoteTags();

  const handleCreateFolder = async (folderName: string) => {
    const newFolder = await addFolder(folderName);
    setSelectedView(newFolder.id);
    setIsModalOpen(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm("Delete this folder? Notes inside will be moved to Trash.")) {
      deleteFolder(folderId);
      if (selectedView === folderId) {
        setSelectedView("all");
      }
    }
  };

  // Counts
  const quickNotesCount = notes?.filter((n) => n.isQuickNote).length || 0;
  const allNotesCount = notes?.filter((n) => !n.isQuickNote).length || 0;
  const trashCount = trashedNotes?.length || 0;

  // --- Collapsed View ---
  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full items-center bg-gray-50/50">
        {/* Top Toolbar */}
        <div className="w-full flex justify-center py-3 border-b border-gray-200">
          <SidebarBtnWithTooltip
            onClick={onToggleClick}
            icon={PanelRightClose}
            label="Expand Sidebar"
          />
        </div>

        {/* Scrollable Icons */}
        <div className="flex-1 overflow-y-auto w-full py-2 no-scrollbar">
          <SidebarBtnWithTooltip
            onClick={() => setIsModalOpen(true)}
            icon={FolderPlus}
            label="New Folder"
          />

          <div className="my-2 h-px w-8 bg-gray-200 mx-auto" />

          <SidebarBtnWithTooltip
            onClick={() => setSelectedView("quick")}
            icon={Zap}
            label="Quick Notes"
            isActive={selectedView === "quick"}
          />
          <SidebarBtnWithTooltip
            onClick={() => setSelectedView("all")}
            icon={Notebook}
            label="All Notes"
            isActive={selectedView === "all"}
          />
          <SidebarBtnWithTooltip
            onClick={() => setSelectedView("trash")}
            icon={Trash2}
            label="Trash"
            isActive={selectedView === "trash"}
          />

          <div className="my-2 h-px w-8 bg-gray-200 mx-auto" />

          {/* Folders */}
          {folders?.map((folder) => (
            <SidebarBtnWithTooltip
              key={folder.id}
              onClick={() => setSelectedView(folder.id)}
              icon={Folder}
              label={folder.name}
              isActive={selectedView === folder.id}
            />
          ))}

          {/* Tags */}
          {tags?.map((tag) => (
            <SidebarBtnWithTooltip
              key={tag}
              onClick={() => setSelectedView(`tag-${tag}`)}
              icon={Tag}
              label={`#${tag}`}
              isActive={selectedView === `tag-${tag}`}
            />
          ))}
        </div>

        {isModalOpen && (
          <NewFolderModal
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateFolder}
          />
        )}
      </div>
    );
  }

  // --- Expanded View ---
  const getNavItemClasses = (id: string) => {
    const isActive = selectedView === id;
    return `
      flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg mx-3 my-1 
      text-sm font-medium transition-all duration-200
      ${
        isActive
          ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }
    `;
  };

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50/30">
        {/* Toolbar */}
        <div className="flex items-center px-4 h-[52px] border-b border-gray-200">
          <button
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
            onClick={onToggleClick}
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
          <div className="flex-grow" />
          <button
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            onClick={() => setIsModalOpen(true)}
            title="Create Folder"
          >
            <FolderPlus size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul>
            <li
              className={getNavItemClasses("quick")}
              onClick={() => setSelectedView("quick")}
            >
              <Zap
                size={18}
                className={selectedView === "quick" ? "fill-blue-100" : ""}
              />
              <span>Quick Notes</span>
              <span className="ml-auto text-xs font-bold opacity-60">
                {quickNotesCount}
              </span>
            </li>
            <li
              className={getNavItemClasses("all")}
              onClick={() => setSelectedView("all")}
            >
              <Notebook size={18} />
              <span>All Notes</span>
              <span className="ml-auto text-xs font-bold opacity-60">
                {allNotesCount}
              </span>
            </li>
            <li
              className={getNavItemClasses("trash")}
              onClick={() => setSelectedView("trash")}
            >
              <Trash2 size={18} />
              <span>Trash</span>
              <span className="ml-auto text-xs font-bold opacity-60">
                {trashCount}
              </span>
            </li>
          </ul>

          {/* Custom Folders */}
          <div className="mt-6 mb-2 px-5 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Folders
            </h3>
          </div>
          <ul>
            {folders?.map((folder) => (
              <ContextMenu.Root key={folder.id}>
                <ContextMenu.Trigger>
                  <li
                    className={getNavItemClasses(folder.id)}
                    onClick={() => setSelectedView(folder.id)}
                  >
                    <Folder
                      size={18}
                      className={
                        selectedView === folder.id ? "fill-blue-100" : ""
                      }
                    />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-xs font-bold opacity-60">
                      {notes?.filter((n) => n.folderId === folder.id).length ||
                        0}
                    </span>
                  </li>
                </ContextMenu.Trigger>
                <ContextMenu.Content className="bg-white rounded-lg shadow-xl border border-gray-100 p-1 min-w-[150px] z-50 animate-in fade-in zoom-in-95">
                  <ContextMenu.Item
                    onSelect={() => handleDeleteFolder(folder.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer outline-none"
                  >
                    <Trash2 size={14} />
                    Delete Folder
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Root>
            ))}
          </ul>

          {/* Tags */}
          <div className="mt-6 mb-2 px-5">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Tags
            </h3>
          </div>
          <ul>
            {!tags || tags.length === 0 ? (
              <li className="px-5 py-2 text-xs text-gray-400 italic">
                No tags yet...
              </li>
            ) : (
              tags.map((tag) => (
                <li
                  key={tag}
                  className={getNavItemClasses(`tag-${tag}`)}
                  onClick={() => setSelectedView(`tag-${tag}`)}
                >
                  <Tag size={16} />
                  <span className="truncate">#{tag}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {isModalOpen && (
        <NewFolderModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateFolder}
        />
      )}
    </>
  );
}
