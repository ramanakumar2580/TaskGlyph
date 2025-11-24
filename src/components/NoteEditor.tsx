/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
// [FIX] Rename Tiptap's 'Node' to 'TiptapNode' to avoid conflict
import {
  useEditor,
  EditorContent,
  Node as TiptapNode,
  mergeAttributes,
} from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import History from "@tiptap/extension-history";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import HardBreak from "@tiptap/extension-hard-break";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Strike from "@tiptap/extension-strike";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import { useNotes, useUserMetadata } from "@/lib/db/useNotes";
import db, { type Note } from "@/lib/db/clientDb";
import { EditorToolbar } from "./EditorToolbar";
import * as Tooltip from "@radix-ui/react-tooltip";

import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Loader2,
  Save,
  Lock,
  Eye,
  EyeOff,
  Search as SearchIcon,
  FileText,
} from "lucide-react";
import { uploadToS3 } from "@/lib/uploadToS3";
import { AudioRecorder } from "./AudioRecorder";
import {
  CreateNotePasswordModal,
  VerifyNotePasswordModal,
} from "./NotePasswordModals";

// (Module declaration is unchanged)
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
    audio: {
      setAudio: (options: { src: string }) => ReturnType;
    };
  }
}

// (Debounce hook is unchanged)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// (Snippet generator is unchanged)
function getSnippet(content: string, term: string) {
  const el = document.createElement("div");
  el.innerHTML = content;
  const text = el.textContent || "";
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();

  const index = lowerText.indexOf(lowerTerm);
  if (index === -1) {
    return text.substring(0, 100);
  }

  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + lowerTerm.length + 70);

  let snippet = text.substring(start, end);

  if (start > 0) snippet = "... " + snippet;
  if (end < text.length) snippet = snippet + " ...";

  snippet = snippet.replace(
    new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi"),
    (match) => `<strong class="bg-yellow-200">${match}</strong>`
  );

  return snippet;
}

// --- AddLinkModal (No changes) ---
function AddLinkModal({
  editor,
  onClose,
  initialName,
  initialUrl,
}: {
  editor: any;
  onClose: () => void;
  initialName: string;
  initialUrl: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [name, setName] = useState(initialName);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }
    const { from, to, empty } = editor.state.selection;
    const linkName = name.trim() || url;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (empty) {
      const textToInsert = linkName;
      editor
        .chain()
        .focus()
        .insertContentAt(from, textToInsert)
        .setTextSelection({ from, to: from + textToInsert.length })
        .setLink({ href: url })
        .setTextSelection(from + textToInsert.length)
        .run();
    } else {
      if (linkName && linkName !== selectedText) {
        editor
          .chain()
          .focus()
          .deleteRange(editor.state.selection)
          .insertContent(linkName)
          .setTextSelection({ from, to: from + linkName.length })
          .setLink({ href: url })
          .setTextSelection(from + linkName.length)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    }
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-96 p-5"
      >
        <h3 className="text-lg font-semibold mb-4 text-center">Add Link</h3>
        <label htmlFor="url" className="text-sm font-medium text-gray-700">
          Link to
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL or note title"
          className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 mb-3 focus:outline-none focus:ring-2 focus:ring-black"
          autoFocus
        />
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Text to display (optional)"
          className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <div className="flex justify-end gap-3 mt-6">
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

// --- Custom Video/Audio Extensions (Unchanged) ---
const CustomVideo = TiptapNode.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null }, controls: { default: true } };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes)];
  },
  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({ type: this.name, attrs: options });
        },
    };
  },
});
const CustomAudio = TiptapNode.create({
  name: "audio",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null }, controls: { default: true } };
  },
  parseHTML() {
    return [{ tag: "audio[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "audio-player" },
      ["audio", mergeAttributes(HTMLAttributes)],
    ];
  },
  addCommands() {
    return {
      setAudio:
        (options: { src: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({ type: this.name, attrs: options });
        },
    };
  },
});

// --- LockedNoteScreen (Unchanged) ---
function LockedNoteScreen({
  onUnlockSubmit,
  error,
}: {
  onUnlockSubmit: (password: string) => void;
  error: string;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlockSubmit(password);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
      <Lock className="w-16 h-16 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Note Locked</h2>
      <p className="mb-4 text-center">
        This note is locked. Enter your notes password to view it.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="relative mb-2">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

// --- Custom Tiptap Extensions (Unchanged) ---
const CustomListItem = ListItem.extend({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor;
        const { $from } = state.selection;
        if (
          $from.parent.type.name === "listItem" &&
          $from.parent.content.size === 0
        ) {
          return this.editor.commands.liftListItem("listItem");
        }
        return this.editor.commands.splitListItem("listItem");
      },
      Backspace: (props) => {
        const { state } = this.editor;
        const { $from } = state.selection;
        if (
          $from.parent.type.name === "listItem" &&
          $from.parent.content.size === 0 &&
          $from.parentOffset === 0
        ) {
          return this.editor.commands.liftListItem("listItem");
        }
        return this.parent?.()?.Backspace?.(props);
      },
    };
  },
});

const CustomTaskItem = TaskItem.extend({
  content: "paragraph",
});

// --- Main NoteEditor Component ---
export function NoteEditor({
  activeNoteId,
  setActiveNoteId,
}: {
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
}) {
  const { notes, updateNote, lockNote, unlockNote, deleteNote } = useNotes();
  const { metadata } = useUserMetadata();

  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [initialLinkName, setInitialLinkName] = useState("");
  const [initialLinkUrl, setInitialLinkUrl] = useState("");
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"lock" | "unlock" | null>(
    null
  );
  const [lockError, setLockError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // (Search results with snippets logic is unchanged)
  const searchResults = useMemo(() => {
    if (!searchTerm) return null;
    if (!notes) return [];
    const lowerTerm = searchTerm.toLowerCase();
    return notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(lowerTerm) ||
          (note.content || "").toLowerCase().includes(lowerTerm)
      )
      .map((note) => ({
        id: note.id,
        title: note.title || "Untitled Note",
        snippet: getSnippet(note.content || "", searchTerm),
      }));
  }, [searchTerm, notes]);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      CustomListItem, // Use our custom ListItem
      History,
      Dropcursor,
      Gapcursor,
      HardBreak,
      HorizontalRule,
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      CustomTaskItem.configure({ nested: true }), // Use our custom TaskItem
      Link.configure({ openOnClick: true, autolink: true }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      CustomVideo,
      CustomAudio,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setCurrentContent(editor.getHTML());
    },
    editable: false,
    editorProps: {
      attributes: {
        class: "tiptap-styles p-4 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  // (Click outside handler is unchanged)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // (Data loading logic is unchanged)
  useEffect(() => {
    if (!activeNoteId) {
      editor?.setEditable(false);
      editor?.commands.clearContent();
      setTitle("");
      setOriginalTitle("");
      setCurrentContent("");
      setOriginalContent("");
      setActiveNote(null);
      setSessionPassword(null);
      setLockError("");
      isInitialLoad.current = true;
      return;
    }
    const loadNote = async () => {
      isInitialLoad.current = true;
      const note = await db.notes.get(activeNoteId);
      if (note) {
        setActiveNote(note);
        setLockError("");

        if (note.isLocked && !sessionPassword) {
          editor?.commands.clearContent();
          editor?.setEditable(false);
        } else {
          editor?.commands.setContent(note.content, { emitUpdate: false });
          editor?.setEditable(true);
        }

        setTitle(note.title);
        setCurrentContent(note.content);
        setOriginalTitle(note.title);
        setOriginalContent(note.content);

        setTimeout(() => {
          isInitialLoad.current = false;
        }, 500);
      }
    };
    loadNote();
  }, [activeNoteId, editor, sessionPassword]);

  // (hasChanges logic is unchanged)
  const hasChanges = useMemo(() => {
    if (!activeNoteId || !activeNote) return false;
    if (activeNote.isLocked) return false;
    return title !== originalTitle || currentContent !== originalContent;
  }, [
    title,
    currentContent,
    originalTitle,
    originalContent,
    activeNoteId,
    activeNote,
  ]);

  // --- [FIX] Auto-Save Logic ---
  // Changed the delay from 2000ms to 500ms for a faster "auto-save" feel
  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(currentContent, 500);

  useEffect(() => {
    if (isInitialLoad.current || !activeNoteId || !editor?.isEditable) {
      return;
    }
    // Check if the debounced values have changed from the original
    if (
      debouncedTitle !== originalTitle ||
      debouncedContent !== originalContent
    ) {
      console.log("Auto-saving...");
      updateNote(activeNoteId, {
        content: debouncedContent,
        title: debouncedTitle,
      });
      // Update the "original" state so we don't save again
      // until the *next* change.
      setOriginalTitle(debouncedTitle);
      setOriginalContent(debouncedContent);
    }
  }, [
    debouncedTitle,
    debouncedContent,
    activeNoteId,
    editor?.isEditable,
    updateNote,
    originalTitle,
    originalContent,
  ]);
  // --- END OF FIX ---

  // (Manual Save logic is unchanged)
  const handleSave = () => {
    if (!editor || !activeNoteId || !hasChanges) return;
    updateNote(activeNoteId, {
      content: currentContent,
      title: title,
    });
    setOriginalTitle(title);
    setOriginalContent(currentContent);
  };

  // (File Upload logic is unchanged)
  const handleFileUpload = async (files: FileList | File[] | null) => {
    if (!activeNoteId || !files || !editor) return;
    setIsUploading(true);
    const filesToUpload = Array.from(files);
    try {
      for (const file of filesToUpload) {
        const s3Response = await uploadToS3(file, "notes");
        const url = s3Response.url;
        const fileName = file.name.toLowerCase();
        const fileType = file.type;
        if (
          fileType.startsWith("image/") ||
          fileName.endsWith(".png") ||
          fileName.endsWith(".jpg") ||
          fileName.endsWith(".jpeg") ||
          fileName.endsWith(".gif") ||
          fileName.endsWith(".svg")
        ) {
          editor.chain().focus().setImage({ src: url, alt: fileName }).run();
        } else if (
          fileType.startsWith("video/") ||
          fileName.endsWith(".mp4") ||
          fileName.endsWith(".webm") ||
          fileName.endsWith(".mov")
        ) {
          editor.chain().focus().setVideo({ src: url }).run();
        } else if (
          fileType.startsWith("audio/") ||
          fileName.endsWith(".mp3") ||
          fileName.endsWith(".wav") ||
          fileName.endsWith(".ogg")
        ) {
          editor.chain().focus().setAudio({ src: url }).run();
        } else {
          editor
            .chain()
            .focus()
            .insertContent(
              `<a href="${url}" target="_blank" rel="noopener noreferrer">${file.name}</a>`
            )
            .run();
        }
      }
    } catch (error) {
      console.error("Failed to upload files:", error);
    }
    setIsUploading(false);
  };

  // (Add Link logic is unchanged)
  const handleAddLink = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    setInitialLinkName(selectedText);
    setInitialLinkUrl(editor.getAttributes("link").href || "");
    setIsLinkModalOpen(true);
  }, [editor]);

  // (Enter Key logic is unchanged)
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editor?.commands.focus();
    }
  };

  // (Delete Note logic is unchanged)
  const handleDeleteNote = () => {
    if (!activeNoteId) return;
    deleteNote(activeNoteId);
    setActiveNoteId(null);
  };

  // (Password logic is unchanged)
  const onVerifySuccess = (password: string) => {
    setSessionPassword(password);
    setShowVerifyPasswordModal(false);
    setLockError("");
    if (pendingAction === "lock") performLock();
    if (pendingAction === "unlock") performUnlock();
    setPendingAction(null);
  };
  const onCreateSuccess = (password: string) => {
    setSessionPassword(password);
    setShowCreatePasswordModal(false);
    if (metadata) {
      db.userMetadata.update(metadata.userId, { hasNotesPassword: true });
    }
    if (pendingAction === "lock") performLock();
    setPendingAction(null);
  };
  const performLock = () => {
    if (!activeNote) return;
    if (hasChanges) handleSave();
    lockNote(activeNote.id);
    setActiveNote({ ...activeNote, isLocked: true });
    editor?.commands.clearContent();
    editor?.setEditable(false);
  };
  const performUnlock = () => {
    if (!activeNote) return;
    unlockNote(activeNote.id);
    setActiveNote({ ...activeNote, isLocked: false });
    editor?.commands.setContent(originalContent, { emitUpdate: false });
    editor?.setEditable(true);
  };
  const handleToggleLock = () => {
    if (!activeNote) return;
    setLockError("");
    if (activeNote.isLocked) {
      setPendingAction("unlock");
      setShowVerifyPasswordModal(true);
    } else {
      setPendingAction("lock");
      if (metadata?.hasNotesPassword) {
        setShowVerifyPasswordModal(true);
      } else {
        setShowCreatePasswordModal(true);
      }
    }
  };
  const handleUnlockSubmit = async (password: string) => {
    setLockError("");
    if (!password) {
      setLockError("Password cannot be empty.");
      return;
    }
    try {
      const res = await fetch("/api/notes-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", password }),
      });
      if (!res.ok) {
        setLockError("Incorrect password. Please try again.");
      } else {
        setSessionPassword(password);
      }
    } catch {
      setLockError("An error occurred. Please try again.");
    }
  };

  // (Search click logic is unchanged)
  const handleSearchResultClick = (noteId: string) => {
    setActiveNoteId(noteId);
    setSearchTerm("");
  };

  // (Click Anywhere to Edit logic is unchanged)
  const handleContainerClick = (e: React.MouseEvent) => {
    if (!editor || !editor.isEditable) return;

    // Check if the click was on the editor itself or the title input
    const editorEl = editor.view.dom;
    const titleEl = e.currentTarget.querySelector(
      'input[placeholder="Note Title"]'
    );

    if (
      editorEl.contains(e.target as Node) ||
      titleEl?.contains(e.target as Node)
    ) {
      // Click was inside the title or the Tiptap editor, let them handle it
      return;
    }

    // Click was in the empty container space, so focus the editor at the end
    editor
      .chain()
      .focus()
      .setTextSelection(editor.state.doc.content.size)
      .run();
  };

  // --- Render Logic ---

  return (
    <Tooltip.Provider delayDuration={100}>
      <div className="flex flex-col h-full relative">
        {/* Search bar with Tooltip (unchanged) */}
        <div
          className="flex-shrink-0 p-2 border-b border-gray-200 relative"
          ref={searchWrapperRef}
        >
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search all notes..."
                  className="w-full pl-9 p-2 rounded-md bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-black text-white px-2 py-1 rounded text-xs shadow-lg z-50"
                sideOffset={5}
              >
                Search all notes by title or content
                <Tooltip.Arrow className="fill-black" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* Search Results Dropdown with Snippets (unchanged) */}
          {searchResults && (
            <div className="absolute top-full left-2 right-2 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="p-3 text-sm text-gray-500">No results found.</p>
              ) : (
                <ul>
                  {searchResults.map((note) => (
                    <li key={note.id}>
                      <button
                        onClick={() => handleSearchResultClick(note.id)}
                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">
                            {note.title}
                          </p>
                          <p
                            className="text-xs text-gray-500 truncate"
                            dangerouslySetInnerHTML={{ __html: note.snippet }}
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Editor Toolbar (Help props removed) (unchanged) */}
        <EditorToolbar
          editor={editor}
          mediaInputRef={mediaInputRef}
          docInputRef={docInputRef}
          onAddLink={handleAddLink}
          // onHelpClick={() => setIsHelpModalOpen(true)} // Removed
          onRecordAudioClick={() => setIsAudioModalOpen(true)}
          isLocked={activeNote?.isLocked || false}
          onToggleLock={handleToggleLock}
          onDeleteNote={handleDeleteNote}
        />

        {/* Editor Content Area */}
        {!activeNoteId || !activeNote ? (
          // (Unchanged)
          <div
            className="flex-1 flex items-center justify-center text-gray-500"
            onClick={handleContainerClick} // This won't do much as editor is not editable
          >
            Select a note to start editing.
          </div>
        ) : activeNote.isLocked && !sessionPassword ? (
          <LockedNoteScreen
            onUnlockSubmit={handleUnlockSubmit}
            error={lockError}
          />
        ) : (
          <>
            {isUploading && (
              <div className="flex items-center gap-2 p-2 text-xs text-gray-600 border-b border-gray-200">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading files...</span>
              </div>
            )}
            {/* (Unchanged) */}
            <div
              className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              onClick={handleContainerClick}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                placeholder="Note Title"
                className="text-2xl font-bold w-full p-4 focus:outline-none"
                disabled={!editor?.isEditable}
              />
              <EditorContent editor={editor} />
            </div>
            {hasChanges && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleSave}
                    className="absolute bottom-6 right-6 z-10 bg-black text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-800"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-black text-white px-2 py-1 rounded text-xs shadow-lg z-50"
                    sideOffset={5}
                  >
                    Save
                    <Tooltip.Arrow className="fill-black" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )}
          </>
        )}

        {/* Modals (unchanged) */}
        {isLinkModalOpen && (
          <AddLinkModal
            editor={editor}
            onClose={() => setIsLinkModalOpen(false)}
            initialName={initialLinkName}
            initialUrl={initialLinkUrl}
          />
        )}
        {/* [FIX] Removed HelpModal */}
        {isAudioModalOpen && (
          <AudioRecorder
            onClose={() => setIsAudioModalOpen(false)}
            onAdd={(file) => handleFileUpload([file])}
          />
        )}
        {showCreatePasswordModal && (
          <CreateNotePasswordModal
            onClose={() => {
              setShowCreatePasswordModal(false);
              setPendingAction(null);
            }}
            onSuccess={onCreateSuccess}
          />
        )}
        {showVerifyPasswordModal && (
          <VerifyNotePasswordModal
            onClose={() => {
              setShowVerifyPasswordModal(false);
              setPendingAction(null);
            }}
            onSuccess={onVerifySuccess}
          />
        )}

        {/* Hidden file inputs (unchanged) */}
        <input
          type="file"
          ref={mediaInputRef}
          onChange={(e) => {
            handleFileUpload(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
          multiple
          accept="image/*,video/*"
        />
        <input
          type="file"
          ref={docInputRef}
          onChange={(e) => {
            handleFileUpload(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv,audio/*"
        />
      </div>
    </Tooltip.Provider>
  );
}
