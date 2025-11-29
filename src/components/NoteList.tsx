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
} from "@/components/NotePasswordModals";
import { TagsModal } from "./TagsModal";

// --- Date Grouping Logic ---
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

// --- Helper Components ---

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
    if (note.isLocked) return "Note is locked";
    if (!note.content) return "No additional text";

    const el = document.createElement("div");
    el.innerHTML = note.content;
    const fullText = el.textContent || "";

    const lines = fullText.split("\n").filter((line) => line.trim() !== "");
    const firstLine = lines[0] || "No additional text";

    if (firstLine.length > 30) {
      return firstLine.substring(0, 30) + "...";
    }
    return firstLine;
  }, [note.content, note.isLocked]);

  const title = note.title || "New Note";

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          onClick={onClick}
          // ✅ FIX: Added 'select-none' to prevent blue text highlighting
          className={`relative p-4 border-b border-gray-100 cursor-pointer group transition-all duration-200 select-none ${
            isActive
              ? "bg-blue-50 border-l-4 border-l-blue-500"
              : "hover:bg-gray-50 border-l-4 border-l-transparent"
          }`}
        >
          <button
            onClick={onTogglePin}
            className={`absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-black transition-opacity duration-200
              ${
                note.isPinned
                  ? "opacity-100 text-blue-500"
                  : "opacity-0 group-hover:opacity-100"
              }`}
          >
            <Pin
              className={`w-3.5 h-3.5 ${
                note.isPinned ? "fill-blue-500 text-blue-500" : "fill-none"
              }`}
            />
          </button>

          <div className="flex items-center gap-2 mb-1.5 pr-6">
            {note.isLocked && (
              <Lock className="w-3 h-3 flex-shrink-0 text-gray-400" />
            )}
            <h3
              className={`font-semibold text-sm truncate ${
                isActive ? "text-blue-900" : "text-gray-800"
              }`}
            >
              {title}
            </h3>
          </div>

          <p
            className={`text-xs truncate ${
              note.isLocked ? "italic text-gray-400" : "text-gray-500"
            }`}
          >
            {preview}
          </p>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="bg-white border border-gray-200 w-48 rounded-lg shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <ContextMenu.Item
            onSelect={() => onTogglePin(new MouseEvent("click") as any)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 outline-none text-gray-700"
          >
            <Pin className="w-4 h-4" />
            {note.isPinned ? "Unpin Note" : "Pin Note"}
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={note.isLocked ? onUnlock : onLock}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 outline-none text-gray-700"
          >
            <Lock className="w-4 h-4" />
            {note.isLocked ? "Unlock Note" : "Lock Note"}
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={onTags}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 outline-none text-gray-700"
          >
            <Tag className="w-4 h-4" />
            Tags
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-gray-100 my-1" />
          <ContextMenu.Item
            onSelect={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-red-50 outline-none text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete Note
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

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
    if (note.isLocked) return "Note is locked";
    if (!note.content) return "No additional text";

    const el = document.createElement("div");
    el.innerHTML = note.content;
    const fullText = el.textContent || "";

    const lines = fullText.split("\n").filter((line) => line.trim() !== "");
    const firstLine = lines[0] || "No additional text";

    if (firstLine.length > 60) {
      return firstLine.substring(0, 60) + "...";
    }
    return firstLine;
  }, [note.content, note.isLocked]);

  const title = note.title || "New Note";

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          onClick={onClick}
          // ✅ FIX: Added 'select-none'
          className={`relative h-40 flex flex-col p-4 border rounded-xl cursor-pointer group transition-all duration-200 select-none
            ${
              isActive
                ? "bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100"
                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
        >
          <button
            onClick={onTogglePin}
            className={`absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-black transition-all
              ${
                note.isPinned
                  ? "opacity-100 text-blue-500"
                  : "opacity-0 group-hover:opacity-100"
              }`}
          >
            <Pin
              className={`w-3.5 h-3.5 ${
                note.isPinned ? "fill-blue-500" : "fill-none"
              }`}
            />
          </button>

          <div className="flex items-center gap-2 mb-2 pr-6">
            {note.isLocked && (
              <Lock className="w-3 h-3 flex-shrink-0 text-gray-400" />
            )}
            <h3 className="font-bold text-sm truncate text-gray-800 w-full">
              {title}
            </h3>
          </div>

          <p
            className={`text-xs flex-grow overflow-hidden leading-relaxed ${
              note.isLocked ? "italic text-gray-400" : "text-gray-500"
            }`}
          >
            {preview}
          </p>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="bg-white border border-gray-200 w-48 rounded-lg shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <ContextMenu.Item
            onSelect={() => onTogglePin(new MouseEvent("click") as any)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 outline-none text-gray-700"
          >
            <Pin className="w-4 h-4" />
            {note.isPinned ? "Unpin Note" : "Pin Note"}
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={note.isLocked ? onUnlock : onLock}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 outline-none text-gray-700"
          >
            <Lock className="w-4 h-4" />
            {note.isLocked ? "Unlock Note" : "Lock Note"}
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={onTags}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 outline-none text-gray-700"
          >
            <Tag className="w-4 h-4" />
            Tags
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-gray-100 my-1" />
          <ContextMenu.Item
            onSelect={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-red-50 outline-none text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete Note
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

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
    <div className="relative p-4 border-b border-gray-200 group bg-gray-50/50 hover:bg-gray-50 transition-colors select-none">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-sm truncate pr-6 text-gray-600 line-through opacity-70">
          {title}
        </h3>
      </div>
      <p className="text-xs text-gray-400 truncate mb-3">
        Deleted: {deletedDate}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onRecover}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Recover
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete Forever
        </button>
      </div>
    </div>
  );
}

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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-96 p-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-50 p-3 rounded-full mb-4 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <Dialog.Title className="text-lg font-bold mb-2 text-gray-900">
              Empty Trash?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-6 leading-relaxed">
              This will permanently delete all notes in the trash. This action
              cannot be undone.
            </Dialog.Description>
          </div>
          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              Delete All
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const TooltipButton = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <Tooltip.Provider delayDuration={300}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-gray-900 text-white px-2 py-1 rounded text-[10px] font-medium shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100"
          sideOffset={5}
        >
          {label}
          <Tooltip.Arrow className="fill-gray-900" />
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
    const isQuickNote = selectedView === "quick";
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
      isQuickNote: isQuickNote,
    });

    setActiveNoteId(newNote.id);
  };

  const viewTitle = useMemo(() => {
    if (selectedView === "all") return "All Notes";
    if (selectedView === "quick") return "Quick Notes";
    if (selectedView === "trash") return "Trash";
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
      lockNote(note.id);
      setPendingActionNote(null);
      setPendingActionType(null);
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
    <div className="flex flex-col h-full relative bg-white">
      {/* Toolbar */}
      <div className="flex justify-between items-center px-4 h-[52px] box-border border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {isSidebarCollapsed && (
            <TooltipButton label="Expand Sidebar">
              <button
                type="button"
                className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
                onClick={onToggleSidebar}
              >
                <PanelRightClose className="w-5 h-5" strokeWidth={2} />
              </button>
            </TooltipButton>
          )}
          <div>
            <h2 className="text-sm font-bold text-gray-800 m-0 leading-none">
              {viewTitle}
            </h2>
            <p className="text-[10px] font-medium text-gray-400 mt-0.5">
              {filteredNotes.length} notes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isTrashView && (
            <TooltipButton label="New Note">
              <button
                type="button"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors"
                onClick={handleNewNote}
              >
                <SquarePen className="w-5 h-5" strokeWidth={2} />
              </button>
            </TooltipButton>
          )}

          {isTrashView && filteredNotes.length > 0 && (
            <TooltipButton label="Empty Trash">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
              >
                <Trash2 className="w-5 h-5" strokeWidth={2} />
              </button>
            </TooltipButton>
          )}

          {!isTrashView && (
            <DropdownMenu.Root>
              <TooltipButton label="View Options">
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" strokeWidth={2} />
                  </button>
                </DropdownMenu.Trigger>
              </TooltipButton>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="bg-white rounded-lg shadow-xl p-1.5 z-50 border border-gray-100 w-48 animate-in fade-in zoom-in-95 duration-100"
                  sideOffset={5}
                  align="end"
                >
                  <DropdownMenu.Item
                    onSelect={() => setViewType("gallery")}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 outline-none text-gray-700"
                  >
                    <GalleryVertical className="w-4 h-4" /> Gallery{" "}
                    {viewType === "gallery" && (
                      <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />
                    )}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => setViewType("list")}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 outline-none text-gray-700"
                  >
                    <List className="w-4 h-4" /> List{" "}
                    {viewType === "list" && (
                      <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />
                    )}
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />

                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 outline-none text-gray-700">
                      <SortAsc className="w-4 h-4" /> Sort by...
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        className="bg-white rounded-lg shadow-xl p-1.5 z-50 border border-gray-100 w-48 animate-in fade-in zoom-in-95 duration-100"
                        sideOffset={5}
                      >
                        <DropdownMenu.Item
                          onSelect={() => setSortOrder("updatedAt")}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 outline-none text-gray-700"
                        >
                          Date Edited
                          {sortOrder === "updatedAt" && (
                            <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />
                          )}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => setSortOrder("createdAt")}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 outline-none text-gray-700"
                        >
                          Date Created
                          {sortOrder === "createdAt" && (
                            <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />
                          )}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => setSortOrder("title")}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 outline-none text-gray-700"
                        >
                          Title
                          {sortOrder === "title" && (
                            <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />
                          )}
                        </DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>

                  <DropdownMenu.Item
                    onSelect={() => setIsGrouped(!isGrouped)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50 outline-none text-gray-700"
                  >
                    <CalendarDays className="w-4 h-4" /> Group by Date{" "}
                    {isGrouped && (
                      <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />
                    )}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {isTrashView ? (
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
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Trash2 size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Trash is empty</p>
              </div>
            )}
          </div>
        ) : viewType === "gallery" ? (
          <div className="grid grid-cols-2 gap-3 p-4">
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
          groupTitles.map((title) => (
            <div key={title}>
              <h4 className="text-[11px] font-bold text-gray-400 px-5 pt-4 pb-2 uppercase tracking-wider bg-white sticky top-0 z-10">
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
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <SquarePen size={40} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">No notes found</p>
            <p className="text-xs mt-1">Create a new note to get started</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showConfirm && (
        <EmptyTrashModal
          onClose={() => setShowConfirm(false)}
          onConfirm={handleEmptyTrash}
        />
      )}
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
      {tagModalNote && (
        <TagsModal
          note={tagModalNote}
          onClose={() => setTagModalNote(null)}
          allTags={allTagsSet}
        />
      )}
    </div>
  );
}
