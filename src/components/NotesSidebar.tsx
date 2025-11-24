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
  PanelRightClose, // [FIX] Import icon for expanding
} from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as Tooltip from "@radix-ui/react-tooltip"; // [FIX] Import Tooltip

// (Modal component is unchanged)
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
        className="bg-white rounded-lg shadow-xl w-80 p-5"
      >
        <h4 className="text-xs font-semibold mb-4 text-center">New Folder</h4>
        <label
          htmlFor="folderName"
          className="text-sm font-medium text-gray-700"
        >
          Name:
        </label>
        <input
          id="folderName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-black"
          autoFocus
          onFocus={(e) => e.target.select()}
        />
        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-semibold">Make into Smart Folder</p>
          <p className="text-xs text-gray-500 mt-1">
            Organise using tags and other filters.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none"
          >
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

// [FIX] Add the TooltipButtonWrapper component
const TooltipButtonWrapper = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <Tooltip.Provider delayDuration={100}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-black text-white px-2 py-1 rounded text-xs shadow-lg z-50"
          sideOffset={5}
        >
          {label}
          <Tooltip.Arrow className="fill-black" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

// --- The Main Sidebar Component ---
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
  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleClick();
  };
  const handleNewFolderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };
  const handleDeleteFolder = (folderId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this folder? Notes inside will not be deleted."
      )
    ) {
      deleteFolder(folderId);
      if (selectedView === folderId) {
        setSelectedView("all");
      }
    }
  };

  // --- Calculations (unchanged) ---
  const quickNotesCount = notes?.filter((n) => n.isQuickNote).length || 0;
  const allNotesCount = notes?.filter((n) => !n.isQuickNote).length || 0;
  const trashCount = trashedNotes?.length || 0;

  // --- [FIX] This is the new Collapsed View ---
  if (isCollapsed) {
    // Helper for collapsed item classes
    const getCollapsedNavItemClasses = (id: string) => {
      const isActive = selectedView === id;
      return `
        flex items-center justify-center w-12 h-10 cursor-pointer rounded-md mx-auto my-0.5 
        text-gray-700 hover:bg-gray-200
        ${isActive ? "bg-gray-300 font-semibold text-black" : ""}
      `;
    };

    return (
      <Tooltip.Provider>
        <div className="flex flex-col h-full items-center">
          {/* Top toolbar (collapsed) */}
          <div className="flex items-center p-3 h-[44px] box-border border-b border-gray-200">
            <TooltipButtonWrapper label="Show Sidebar">
              <button
                type="button"
                className="bg-transparent border-none rounded-md cursor-pointer text-gray-600 p-1 hover:bg-gray-200"
                onClick={handleToggleClick}
              >
                <PanelRightClose className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </TooltipButtonWrapper>
          </div>

          {/* Scrolling icon list (collapsed) */}
          <div
            className="flex-1 overflow-y-auto 
                       [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <ul className="list-none p-0 m-0 pt-3">
              <li>
                <TooltipButtonWrapper label="New Folder">
                  <button
                    onClick={handleNewFolderClick}
                    className={getCollapsedNavItemClasses("new-folder-btn")}
                  >
                    <FolderPlus className="h-4 w-4" strokeWidth={2} />
                  </button>
                </TooltipButtonWrapper>
              </li>
              <li>
                <TooltipButtonWrapper label="Quick Notes">
                  <button
                    onClick={() => setSelectedView("quick")}
                    className={getCollapsedNavItemClasses("quick")}
                  >
                    <Zap className="h-4 w-4" strokeWidth={2} />
                  </button>
                </TooltipButtonWrapper>
              </li>
              <li>
                <TooltipButtonWrapper label="Notes">
                  <button
                    onClick={() => setSelectedView("all")}
                    className={getCollapsedNavItemClasses("all")}
                  >
                    <Notebook className="h-4 w-4" strokeWidth={2} />
                  </button>
                </TooltipButtonWrapper>
              </li>
              <li>
                <TooltipButtonWrapper label="Recently Deleted">
                  <button
                    onClick={() => setSelectedView("trash")}
                    className={getCollapsedNavItemClasses("trash")}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </TooltipButtonWrapper>
              </li>
            </ul>
            {/* Collapsed Folders */}
            <div className="border-t border-gray-200 mt-3 pt-3">
              <ul className="list-none p-0 m-0">
                {folders?.map((folder) => (
                  <li key={folder.id}>
                    <TooltipButtonWrapper label={folder.name}>
                      <button
                        onClick={() => setSelectedView(folder.id)}
                        className={getCollapsedNavItemClasses(folder.id)}
                      >
                        <Folder className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </TooltipButtonWrapper>
                  </li>
                ))}
              </ul>
            </div>
            {/* Collapsed Tags */}
            <div className="border-t border-gray-200 mt-3 pt-3">
              <ul className="list-none p-0 m-0">
                {tags?.map((tag) => (
                  <li key={tag}>
                    <TooltipButtonWrapper label={`#${tag}`}>
                      <button
                        onClick={() => setSelectedView(`tag-${tag}`)}
                        className={getCollapsedNavItemClasses(`tag-${tag}`)}
                      >
                        <Tag className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </TooltipButtonWrapper>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Modal (still works when collapsed) */}
        {isModalOpen && (
          <NewFolderModal
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateFolder}
          />
        )}
      </Tooltip.Provider>
    );
  }

  // --- [FIX] This is now the Expanded View (your original code) ---

  // Helper for conditional classes (for expanded view)
  const getNavItemClasses = (id: string) => {
    const isActive = selectedView === id;
    return `
      flex items-center gap-3 px-5 py-2 cursor-pointer rounded-md mx-3 my-0.5 
      text-sm font-medium text-gray-700 hover:bg-gray-200
      ${isActive ? "bg-gray-300 font-semibold text-black" : ""}
    `;
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Sidebar Toolbar */}
        <div
          className="flex items-center p-3 h-[44px] box-border border-b border-gray-200"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* [FIX] This button is now only in the expanded view */}
          <button
            type="button"
            className="bg-transparent border-none rounded-md cursor-pointer text-gray-600 p-1 hover:bg-gray-200"
            title="Hide Sidebar"
            onClick={handleToggleClick}
          >
            <PanelLeftClose className="h-4 w-4" strokeWidth={2.5} />
          </button>

          <div className="flex-grow"></div>

          <TooltipButtonWrapper label="New Folder">
            <button
              type="button"
              className="bg-transparent border-none rounded-md cursor-pointer text-gray-600 p-1 hover:bg-gray-200"
              onClick={handleNewFolderClick}
            >
              <FolderPlus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </TooltipButtonWrapper>
        </div>

        {/* Folder List Wrapper (This has your scrollbar) */}
        <div
          className="flex-1 overflow-y-auto 
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* System Folders */}
          <ul className="list-none p-0 m-0 pt-3">
            <li
              className={getNavItemClasses("quick")}
              onClick={() => setSelectedView("quick")}
            >
              <Zap className="h-4 w-4" strokeWidth={2} />
              <span>Quick Notes</span>
              <span
                className={`ml-auto text-xs ${
                  selectedView === "quick" ? "text-black" : "text-gray-500"
                }`}
              >
                {quickNotesCount}
              </span>
            </li>
            <li
              className={getNavItemClasses("all")}
              onClick={() => setSelectedView("all")}
            >
              <Notebook className="h-4 w-4" strokeWidth={2} />
              <span>Notes</span>
              <span
                className={`ml-auto text-xs ${
                  selectedView === "all" ? "text-black" : "text-gray-500"
                }`}
              >
                {allNotesCount}
              </span>
            </li>
            <li
              className={getNavItemClasses("trash")}
              onClick={() => setSelectedView("trash")}
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
              <span>Recently Deleted</span>
              <span
                className={`ml-auto text-xs ${
                  selectedView === "trash" ? "text-black" : "text-gray-500"
                }`}
              >
                {trashCount}
              </span>
            </li>
          </ul>

          {/* Custom Folders Title */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-5 pt-4 pb-1 mt-3 border-t border-gray-200">
            My Folders
          </h3>

          {/* Custom Folders List */}
          <ul className="list-none p-0 m-0">
            {folders?.map((folder) => (
              <ContextMenu.Root key={folder.id}>
                <ContextMenu.Trigger>
                  <li
                    className={getNavItemClasses(folder.id)}
                    onClick={() => setSelectedView(folder.id)}
                  >
                    <Folder className="h-4 w-4" strokeWidth={2} />
                    <span>{folder.name}</span>
                    <span
                      className={`ml-auto text-xs ${
                        selectedView === folder.id
                          ? "text-black"
                          : "text-gray-500"
                      }`}
                    >
                      {notes?.filter((n) => n.folderId === folder.id).length ||
                        0}
                    </span>
                  </li>
                </ContextMenu.Trigger>
                <ContextMenu.Content className="glass-morphism w-48 rounded-md shadow-lg p-2 z-50">
                  <ContextMenu.Item
                    onSelect={() => handleDeleteFolder(folder.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Folder
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Root>
            ))}
          </ul>

          {/* Tags Section */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-5 pt-4 pb-1 mt-3 border-t border-gray-200">
            Tags
          </h3>
          <ul className="list-none p-0 m-0">
            {!tags || tags.length === 0 ? (
              <li className="flex items-center gap-3 px-5 py-2 text-sm text-gray-500">
                <Tag className="h-4 w-4" strokeWidth={2} />
                <span>No tags yet...</span>
              </li>
            ) : (
              tags.map((tag) => (
                <li
                  key={tag}
                  className={getNavItemClasses(`tag-${tag}`)}
                  onClick={() => setSelectedView(`tag-${tag}`)}
                >
                  <Tag className="h-4 w-4" strokeWidth={2} />
                  <span>{tag}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <NewFolderModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateFolder}
        />
      )}
    </>
  );
}
