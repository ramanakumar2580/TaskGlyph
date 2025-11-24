/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import React, { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  PanelRightClose,
  SquarePen,
  MoreHorizontal,
  GalleryVertical,
  List,
  SortAsc,
  CalendarDays,
  Pin,
  Lock,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Tag,
  Check,
} from "lucide-react";
import {
  useNotes,
  useTrashNotes,
  useUserMetadata,
  useNoteTags,
} from "@/lib/db/useNotes";
import db, { type Note } from "@/lib/db/clientDb";
import {
  CreateNotePasswordModal,
  VerifyNotePasswordModal,
} from "./NotePasswordModals";
import { TagsModal } from "./TagsModal";

// (Date grouping logic - unchanged)
const now = new Date();
const today = new Date(now.setHours(0, 0, 0, 0)).getTime();
const yesterday = new Date(now.setDate(now.getDate() - 1)).getTime();
const sevenDaysAgo = new Date(now.setDate(now.getDate() - 6)).getTime();
const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 24)).getTime();
const currentYear = new Date().getFullYear();

function getGroupTitle(timestamp: number | undefined) {
  const ts = timestamp || 0;
  if (ts >= today) return "Today";
  if (ts >= yesterday) return "Yesterday";
  if (ts >= sevenDaysAgo) return "Previous 7 Days";
  if (ts >= thirtyDaysAgo) return "Previous 30 Days";

  const date = new Date(ts);
  const year = date.getFullYear();
  if (year < currentYear) {
    return year.toString();
  }
  return date.toLocaleString("default", { month: "long" });
}

function groupNotesByDate(notes: Note[]) {
  return notes.reduce((groups, note) => {
    const title = getGroupTitle(note.updatedAt);
    if (!groups[title]) {
      groups[title] = [];
    }
    groups[title].push(note);
    return groups;
  }, {} as Record<string, Note[]>);
}

// (NoteListItem - unchanged)
function NoteListItem({
  note,
  isActive,
  onClick,
  onTogglePin,
  onLock,
  onUnlock,
  onDelete,
  onTags,
}: {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onLock: () => void;
  onUnlock: () => void;
  onDelete: () => void;
  onTags: () => void;
}) {
  const preview = useMemo(() => {
    if (!note.content) return "No additional text";
    const el = document.createElement("div");
    el.innerHTML = note.content;
    return (el.textContent || "").substring(0, 100) || "No additional text";
  }, [note.content]);

  const title = note.title || "New Note";

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          onClick={onClick}
          className={`relative p-4 border-b border-gray-200 cursor-pointer group ${
            isActive ? "bg-white shadow-inner" : "hover:bg-gray-200"
          }`}
        >
          <button
            onClick={onTogglePin}
            className={`absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-300 hover:text-black
              ${
                note.isPinned
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
          >
            <Pin
              className={`w-4 h-4 ${
                note.isPinned ? "fill-black" : "fill-none"
              }`}
            />
          </button>

          <div className="flex items-center gap-2">
            {note.isLocked && (
              <Lock className="w-3 h-3 flex-shrink-0 text-gray-500" />
            )}
            <h3 className="font-semibold text-sm truncate pr-6">{title}</h3>
          </div>

          <p className="text-xs text-gray-600 truncate">
            {note.isLocked ? "Note is locked" : preview}
          </p>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content className="glass-morphism w-48 rounded-md shadow-lg p-2 z-50">
        <ContextMenu.Item
          onSelect={() => onTogglePin(new MouseEvent("click") as any)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
        >
          <Pin className="w-4 h-4" />
          {note.isPinned ? "Unpin Note" : "Pin Note"}
        </ContextMenu.Item>
        <ContextMenu.Item
          onSelect={note.isLocked ? onUnlock : onLock}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
        >
          <Lock className="w-4 h-4" />
          {note.isLocked ? "Unlock Note" : "Lock Note"}
        </ContextMenu.Item>
        <ContextMenu.Item
          onSelect={onTags}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
        >
          <Tag className="w-4 h-4" />
          Tags
        </ContextMenu.Item>
        <ContextMenu.Separator className="h-px bg-gray-200 my-1" />
        <ContextMenu.Item
          onSelect={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200 text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Delete Note
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

// (NoteGalleryItem - unchanged)
function NoteGalleryItem({
  note,
  isActive,
  onClick,
  onTogglePin,
  onLock,
  onUnlock,
  onDelete,
  onTags,
}: {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onLock: () => void;
  onUnlock: () => void;
  onDelete: () => void;
  onTags: () => void;
}) {
  const preview = useMemo(() => {
    if (!note.content) return "No additional text";
    const el = document.createElement("div");
    el.innerHTML = note.content;
    return (el.textContent || "").substring(0, 150) || "No additional text";
  }, [note.content]);

  const title = note.title || "New Note";

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          onClick={onClick}
          className={`relative h-48 flex flex-col p-4 border border-gray-200 cursor-pointer group rounded-lg
            ${
              isActive
                ? "bg-white shadow-lg border-gray-300"
                : "bg-white hover:shadow-md"
            }`}
        >
          <button
            onClick={onTogglePin}
            className={`absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-300 hover:text-black
              ${
                note.isPinned
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
          >
            <Pin
              className={`w-4 h-4 ${
                note.isPinned ? "fill-black" : "fill-none"
              }`}
            />
          </button>

          <div className="flex items-center gap-2">
            {note.isLocked && (
              <Lock className="w-3 h-3 flex-shrink-0 text-gray-500" />
            )}
            <h3 className="font-semibold text-sm truncate pr-6">{title}</h3>
          </div>

          <p className="text-xs text-gray-600 mt-2 flex-grow overflow-hidden">
            {note.isLocked ? "Note is locked" : preview}
          </p>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content className="glass-morphism w-48 rounded-md shadow-lg p-2 z-50">
        <ContextMenu.Item
          onSelect={() => onTogglePin(new MouseEvent("click") as any)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
        >
          <Pin className="w-4 h-4" />
          {note.isPinned ? "Unpin Note" : "Pin Note"}
        </ContextMenu.Item>
        <ContextMenu.Item
          onSelect={note.isLocked ? onUnlock : onLock}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
        >
          <Lock className="w-4 h-4" />
          {note.isLocked ? "Unlock Note" : "Lock Note"}
        </ContextMenu.Item>
        <ContextMenu.Item
          onSelect={onTags}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
        >
          <Tag className="w-4 h-4" />
          Tags
        </ContextMenu.Item>
        <ContextMenu.Separator className="h-px bg-gray-200 my-1" />
        <ContextMenu.Item
          onSelect={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200 text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Delete Note
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

// (TrashListItem - unchanged)
function TrashListItem({
  note,
  onRecover,
  onDelete,
}: {
  note: Note;
  onRecover: () => void;
  onDelete: () => void;
}) {
  const title = note.title || "New Note";
  const deletedDate = note.deletedAt
    ? new Date(note.deletedAt).toLocaleDateString()
    : "Recently";

  return (
    <div className="relative p-4 border-b border-gray-200 group">
      <h3 className="font-semibold text-sm truncate pr-6 text-gray-700">
        {title}
      </h3>
      <p className="text-xs text-gray-500 truncate">Deleted: {deletedDate}</p>
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={onRecover}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          Recover
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-xs text-red-600 hover:underline"
        >
          <Trash2 className="w-3 h-3" />
          Delete Permanently
        </button>
      </div>
    </div>
  );
}

// (EmptyTrashModal - unchanged)
function EmptyTrashModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-96 p-6">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
            <Dialog.Title className="text-lg font-semibold mb-2">
              Empty Trash?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete all notes in the
              trash? This action cannot be undone.
            </Dialog.Description>
          </div>
          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
            >
              Delete All
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// (TooltipButton - unchanged)
const TooltipButton = ({
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

// --- Main Note List Component ---
export function NoteList({
  isSidebarCollapsed,
  onToggleSidebar,
  selectedView,
  activeNoteId,
  setActiveNoteId,
}: {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  selectedView: string;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
}) {
  const {
    notes,
    addNote,
    pinNote,
    unpinNote,
    deleteNote,
    lockNote,
    unlockNote,
    deleteNotePermanently,
    recoverNote,
  } = useNotes();
  const { trashedNotes } = useTrashNotes();
  const { metadata } = useUserMetadata();
  const { tags } = useNoteTags();
  const allTagsSet = useMemo(() => new Set(tags || []), [tags]);

  const [showConfirm, setShowConfirm] = useState(false);

  type SortKey = "updatedAt" | "createdAt" | "title";
  const [viewType, setViewType] = useState<"list" | "gallery">("list");
  const [sortOrder, setSortOrder] = useState<SortKey>("updatedAt");
  const [isGrouped, setIsGrouped] = useState(true);

  const [tagModalNote, setTagModalNote] = useState<Note | null>(null);

  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [pendingActionNote, setPendingActionNote] = useState<Note | null>(null);
  const [pendingActionType, setPendingActionType] = useState<
    "lock" | "unlock" | null
  >(null);

  const isTrashView = selectedView === "trash";

  const filteredNotes = useMemo(() => {
    if (!notes || !trashedNotes) return [];
    let baseNotes: Note[] = [];
    if (isTrashView) {
      baseNotes = trashedNotes;
    } else {
      switch (true) {
        case selectedView === "all":
          baseNotes = notes.filter((n) => !n.isQuickNote);
          break;
        case selectedView === "quick":
          baseNotes = notes.filter((n) => n.isQuickNote);
          break;
        case selectedView.startsWith("tag-"):
          const tag = selectedView.replace("tag-", "");
          baseNotes = notes.filter((n) => (n.tags || []).includes(tag));
          break;
        default:
          baseNotes = notes.filter((n) => n.folderId === selectedView);
      }
    }
    return baseNotes;
  }, [notes, trashedNotes, selectedView, isTrashView]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      switch (sortOrder) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "createdAt":
          return (b.createdAt || 0) - (a.createdAt || 0);
        case "updatedAt":
        default:
          return (b.updatedAt || 0) - (a.updatedAt || 0);
      }
    });
  }, [filteredNotes, sortOrder]);

  const groupedNotes = useMemo(
    () => (isTrashView || !isGrouped ? {} : groupNotesByDate(sortedNotes)),
    [sortedNotes, isTrashView, isGrouped]
  );
  const groupTitles = Object.keys(groupedNotes);

  const handleNewNote = async () => {
    // [FIX #3] Check if the current view is 'quick'
    const isQuickNote = selectedView === "quick";

    // [FIX #3] Determine the folderId. Only set if not 'all', 'quick', or 'trash'
    const folderId =
      selectedView !== "all" &&
      selectedView !== "quick" &&
      selectedView !== "trash" &&
      !selectedView.startsWith("tag-")
        ? selectedView
        : null;

    const newNote = await addNote({
      title: "New Note",
      content: "",
      folderId: folderId,
      isQuickNote: isQuickNote, // [FIX #3] Pass the flag to the hook
    });

    setActiveNoteId(newNote.id);
  };

  const viewTitle = useMemo(() => {
    if (selectedView === "all") return "Notes";
    if (selectedView === "quick") return "Quick Notes";
    if (selectedView === "trash") return "Recently Deleted";
    if (selectedView.startsWith("tag-"))
      return `#${selectedView.replace("tag-", "")}`;
    return "Folder";
  }, [selectedView]);

  const handleEmptyTrash = () => {
    trashedNotes?.forEach((note) => {
      deleteNotePermanently(note.id);
    });
    setShowConfirm(false);
  };

  const handleLockNote = (note: Note) => {
    setPendingActionNote(note);
    setPendingActionType("lock");
    if (metadata?.hasNotesPassword) {
      setShowVerifyPasswordModal(true);
    } else {
      setShowCreatePasswordModal(true);
    }
  };

  const handleUnlockNote = (note: Note) => {
    setPendingActionNote(note);
    setPendingActionType("unlock");
    setShowVerifyPasswordModal(true);
  };

  const onVerifySuccess = () => {
    if (pendingActionType === "lock" && pendingActionNote) {
      lockNote(pendingActionNote.id);
    }
    if (pendingActionType === "unlock" && pendingActionNote) {
      unlockNote(pendingActionNote.id);
    }
    setShowVerifyPasswordModal(false);
    setPendingActionNote(null);
  };

  const onCreateSuccess = () => {
    if (pendingActionType === "lock" && pendingActionNote) {
      lockNote(pendingActionNote.id);
    }
    setShowCreatePasswordModal(false);
    setPendingActionNote(null);
    if (metadata) {
      db.userMetadata.update(metadata.userId, { hasNotesPassword: true });
    }
  };

  const handleTags = (note: Note) => {
    setTagModalNote(note);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Pane 2 Toolbar (unchanged) */}
      <div className="flex justify-between items-center p-3 h-[44px] box-border border-b border-gray-200">
        {isSidebarCollapsed && (
          <TooltipButton label="Show Sidebar">
            <button
              type="button"
              className="bg-transparent border-none rounded-md cursor-pointer text-gray-600 p-1 hover:bg-gray-200"
              title="Show Sidebar"
              onClick={onToggleSidebar}
            >
              <PanelRightClose className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </TooltipButton>
        )}
        <div className="flex-grow text-left pl-2">
          <h2 className="text-sm font-semibold m-0">{viewTitle}</h2>
          <p className="text-xs text-gray-500">{filteredNotes.length} Notes</p>
        </div>

        {!isTrashView && (
          <TooltipButton label="New Note">
            <button
              type="button"
              className="bg-transparent border-none rounded-md cursor-pointer text-gray-600 p-1 hover:bg-gray-200"
              onClick={handleNewNote}
            >
              <SquarePen className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </TooltipButton>
        )}

        {isTrashView && filteredNotes.length > 0 && (
          <TooltipButton label="Empty Trash">
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="bg-transparent border-none rounded-md cursor-pointer text-red-600 p-1 hover:bg-gray-200"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </TooltipButton>
        )}

        {/* 3-Dot Menu (Updated) */}
        {!isTrashView && (
          <DropdownMenu.Root>
            <TooltipButton label="View Options">
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="bg-transparent border-none rounded-md cursor-pointer text-gray-600 p-1 hover:bg-gray-200"
                >
                  <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </DropdownMenu.Trigger>
            </TooltipButton>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="glass-morphism bg-white rounded-md shadow-lg p-2 z-50 border border-gray-200 w-56"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  onSelect={() => setViewType("gallery")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <GalleryVertical className="w-4 h-4" />
                  View as Gallery
                  {viewType === "gallery" && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => setViewType("list")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <List className="w-4 h-4" />
                  View as List
                  {viewType === "list" && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                    <SortAsc className="w-4 h-4" />
                    Sort by...
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      className="glass-morphism bg-white rounded-md shadow-lg p-2 z-50 border border-gray-200 w-48"
                      sideOffset={5}
                    >
                      <DropdownMenu.Item
                        onSelect={() => setSortOrder("updatedAt")}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        Date Edited
                        {sortOrder === "updatedAt" && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => setSortOrder("createdAt")}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        Date Created
                        {sortOrder === "createdAt" && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => setSortOrder("title")}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        Title
                        {sortOrder === "title" && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>

                <DropdownMenu.Item
                  onSelect={() => setIsGrouped(!isGrouped)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <CalendarDays className="w-4 h-4" />
                  Group by Date
                  {isGrouped && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      {/* Note List Wrapper (unchanged) */}
      <div
        className="flex-1 overflow-y-auto 
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {isTrashView ? (
          // --- TRASH VIEW ---
          <div>
            {filteredNotes && filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <TrashListItem
                  key={note.id}
                  note={note}
                  onRecover={() => recoverNote(note.id)}
                  onDelete={() => deleteNotePermanently(note.id)}
                />
              ))
            ) : (
              <p className="p-4 text-sm text-center text-gray-500">
                No notes in Recently Deleted.
              </p>
            )}
          </div>
        ) : viewType === "gallery" ? (
          // --- GALLERY VIEW ---
          <div className="grid grid-cols-2 gap-3 p-3">
            {sortedNotes.map((note) => (
              <NoteGalleryItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onClick={() => setActiveNoteId(note.id)}
                onTogglePin={(e) => {
                  e.stopPropagation();
                  note.isPinned ? unpinNote(note.id) : pinNote(note.id);
                }}
                onLock={() => handleLockNote(note)}
                onUnlock={() => handleUnlockNote(note)}
                onDelete={() => deleteNote(note.id)}
                onTags={() => handleTags(note)}
              />
            ))}
          </div>
        ) : isGrouped ? (
          // --- LIST VIEW (GROUPED) ---
          groupTitles.map((title) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-gray-600 px-4 pt-3 pb-1">
                {title}
              </h4>
              {groupedNotes[title].map((note) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  isActive={note.id === activeNoteId}
                  onClick={() => setActiveNoteId(note.id)}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    note.isPinned ? unpinNote(note.id) : pinNote(note.id);
                  }}
                  onLock={() => handleLockNote(note)}
                  onUnlock={() => handleUnlockNote(note)}
                  onDelete={() => deleteNote(note.id)}
                  onTags={() => handleTags(note)}
                />
              ))}
            </div>
          ))
        ) : (
          // --- LIST VIEW (NOT GROUPED) ---
          <div>
            {sortedNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onClick={() => setActiveNoteId(note.id)}
                onTogglePin={(e) => {
                  e.stopPropagation();
                  note.isPinned ? unpinNote(note.id) : pinNote(note.id);
                }}
                onLock={() => handleLockNote(note)}
                onUnlock={() => handleUnlockNote(note)}
                onDelete={() => deleteNote(note.id)}
                onTags={() => handleTags(note)}
              />
            ))}
          </div>
        )}

        {!isTrashView && filteredNotes && filteredNotes.length === 0 && (
          <p className="p-4 text-sm text-center text-gray-500">
            No notes in this view.
          </p>
        )}
      </div>

      {/* Render the confirmation modal */}
      {showConfirm && (
        <EmptyTrashModal
          onClose={() => setShowConfirm(false)}
          onConfirm={handleEmptyTrash}
        />
      )}

      {/* Render Lock Modals */}
      {showCreatePasswordModal && (
        <CreateNotePasswordModal
          onClose={() => {
            setShowCreatePasswordModal(false);
            setPendingActionNote(null);
          }}
          onSuccess={onCreateSuccess}
        />
      )}
      {showVerifyPasswordModal && (
        <VerifyNotePasswordModal
          onClose={() => {
            setShowVerifyPasswordModal(false);
            setPendingActionNote(null);
          }}
          onSuccess={onVerifySuccess}
        />
      )}

      {/* [FIX] Render the new TagsModal */}
      {tagModalNote && (
        <TagsModal
          note={tagModalNote}
          onClose={() => setTagModalNote(null)}
          allTags={allTagsSet} // [FIX] Pass the Set of tags
        />
      )}
    </div>
  );
}
