/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
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

import tippy, { Instance as TippyInstance } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";

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
  Trash2,
} from "lucide-react";
import { uploadToS3 } from "@/lib/uploadToS3";
import { deleteFromS3 } from "@/lib/deleteFromS3";
import { AudioRecorder } from "./AudioRecorder";
import {
  CreateNotePasswordModal,
  VerifyNotePasswordModal,
} from "./NotePasswordModals";

// --- Module Declaration ---
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
    audio: {
      setAudio: (options: { src: string }) => ReturnType;
    };
    file: {
      setFile: (options: { src: string; name: string }) => ReturnType;
    };
  }
}

// --- Custom Hooks ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// --- Helper Functions ---
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

// --- Components ---

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

// --- Custom Video/Audio/File Extensions ---

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
    return [
      "div",
      {
        class:
          "media-node video-player my-4 mx-auto rounded-xl overflow-hidden shadow-sm border border-gray-200",
        "data-media-wrapper": "true",
        style:
          "width: fit-content; max-width: 400px; display: table; margin-left: auto; margin-right: auto;",
      },
      [
        "video",
        mergeAttributes(HTMLAttributes, {
          class: "block",
          style:
            "max-width: 100%; height: auto; max-height: 350px; object-fit: contain; background-color: #000;",
        }),
      ],
    ];
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
      {
        class:
          "media-node audio-player my-4 mx-auto max-w-md p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors",
        "data-media-wrapper": "true",
      },
      ["audio", mergeAttributes(HTMLAttributes, { class: "w-full" })],
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

const CustomFile = TiptapNode.create({
  name: "file",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      name: { default: "Attachment" },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-file-attachment]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        class: "media-node file-attachment my-3 mx-auto max-w-sm",
        "data-media-wrapper": "true",
        "data-file-attachment": "true",
      },
      [
        "a",
        {
          href: HTMLAttributes.src,
          target: "_blank",
          rel: "noopener noreferrer",
          class:
            "flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all no-underline group cursor-pointer",
        },
        [
          "div",
          {
            class:
              "p-2 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors",
          },
          [
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              "path",
              {
                d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",
              },
            ],
            ["polyline", { points: "14 2 14 8 20 8" }],
          ],
        ],
        [
          "div",
          { class: "flex flex-col overflow-hidden" },
          [
            "span",
            {
              class:
                "text-sm font-medium text-gray-700 truncate block max-w-[200px]",
            },
            HTMLAttributes.name,
          ],
          [
            "span",
            { class: "text-[10px] text-gray-400 uppercase" },
            "Document",
          ],
        ],
      ],
    ];
  },
  addCommands() {
    return {
      setFile:
        (options: { src: string; name: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({ type: this.name, attrs: options });
        },
    };
  },
});

// --- Updated LockedNoteScreen ---
function LockedNoteScreen({
  onUnlockSubmit,
  onForgotPassword, // ✅ Prop for Forgot Password
  error,
}: {
  onUnlockSubmit: (password: string) => void;
  onForgotPassword: () => void;
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
      <Lock className="w-16 h-16 mb-4 text-gray-300" />
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Note Locked</h2>
      <p className="mb-6 text-center text-sm text-gray-400">
        This note is protected. Enter your password to view it.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <input
            id="inline_unlock_password"
            name="inline_unlock_password_field" // ✅ Unique name
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password" // ✅ Prevents autofill
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm transition-all"
            placeholder="Enter Master Password"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md"
        >
          Unlock Note
        </button>

        {/* ✅ Forgot Password Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-medium"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Custom Tiptap Extensions ---
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
  // ✅ NEW: State for Modal Mode (Verify vs OTP)
  const [passwordModalMode, setPasswordModalMode] = useState<"verify" | "otp">(
    "verify"
  );
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

  // Media Deletion Refs
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const tippyInstance = useRef<TippyInstance | null>(null);
  const lastSelectedPos = useRef<number | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);

  const [, setUpdateTrigger] = useState({});

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
      CustomListItem,
      History,
      Dropcursor,
      Gapcursor,
      HardBreak,
      HorizontalRule,
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      CustomTaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: true, autolink: true }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg shadow-sm border border-gray-100",
          style:
            "max-width: 400px; max-height: 350px; object-fit: contain; display: block; margin: 1rem auto;",
        },
      }),
      CustomVideo,
      CustomAudio,
      CustomFile,
    ],
    content: "",
    onTransaction: () => {
      setUpdateTrigger({});
    },
    onUpdate: ({ editor }) => {
      setCurrentContent(editor.getHTML());
    },
    editable: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-styles p-6 focus:outline-none prose prose-sm max-w-none min-h-full [&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-blue-500 [&_.media-node.ProseMirror-selectednode]:ring-2 [&_.media-node.ProseMirror-selectednode]:ring-blue-500 [&_.media-node]:outline-none",
      },
    },
    immediatelyRender: false,
  });

  // --- Load Note Logic (FIXED) ---
  useEffect(() => {
    // ✅ CRITICAL FIX: Reset EVERYTHING immediately when activeNoteId changes
    setSessionPassword(null);
    setLockError("");
    setActiveNote(null);
    setTitle("");
    setOriginalTitle("");
    setCurrentContent("");
    setOriginalContent("");
    editor?.commands.clearContent(); // Clear old content
    editor?.setEditable(false);

    if (!activeNoteId) {
      isInitialLoad.current = true;
      return;
    }

    const loadNote = async () => {
      isInitialLoad.current = true;
      const note = await db.notes.get(activeNoteId);
      if (note) {
        setActiveNote(note);

        if (note.isLocked) {
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
  }, [activeNoteId, editor]);

  // --- Media Deletion Logic ---

  useEffect(() => {
    if (typeof document !== "undefined") {
      const container = document.createElement("div");
      container.setAttribute("data-tippy-menu", "true");
      menuContainerRef.current = container;
      document.body.appendChild(container);

      tippyInstance.current = tippy(document.body, {
        content: container,
        trigger: "manual",
        interactive: true,
        placement: "right",
        appendTo: document.body,
        animation: "shift-away",
        zIndex: 9999,
        arrow: true,
        offset: [0, 10],
      });

      return () => {
        tippyInstance.current?.destroy();
        if (menuContainerRef.current?.parentNode) {
          menuContainerRef.current.parentNode.removeChild(
            menuContainerRef.current
          );
        }
      };
    }
  }, []);

  const updateBubble = useCallback(() => {
    if (!editor || !tippyInstance.current) return;
    const { state, view } = editor;
    const { from } = state.selection;
    const node = state.doc.nodeAt(from);

    const isMedia =
      !!node &&
      (node.type.name === "image" ||
        node.type.name === "audio" ||
        node.type.name === "video" ||
        node.type.name === "file");

    if (!isMedia) {
      tippyInstance.current.hide();
      return;
    }

    const domNode = view.nodeDOM(from) as HTMLElement;
    let targetElement = domNode;

    // Handle wrappers
    if (
      node.type.name === "audio" ||
      node.type.name === "video" ||
      node.type.name === "file"
    ) {
      let selector = `[data-media-wrapper] ${node.type.name}[src="${node.attrs.src}"]`;
      if (node.type.name === "file") selector = `[data-file-attachment]`;

      const wrapper = view.dom.querySelector(selector)?.closest(".media-node");

      if (wrapper) {
        targetElement = wrapper as HTMLElement;
      } else if (domNode && domNode.classList.contains("media-node")) {
        targetElement = domNode;
      }
    }

    let rect;
    if (targetElement && targetElement.getBoundingClientRect) {
      rect = targetElement.getBoundingClientRect();
    } else {
      const coords = view.coordsAtPos(from);
      rect = {
        width: 0,
        height: 0,
        top: coords.top,
        bottom: coords.bottom,
        left: coords.left,
        right: coords.right,
      };
    }

    tippyInstance.current.setProps({
      getReferenceClientRect: () => rect as DOMRect,
    });
    tippyInstance.current.show();
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;

    const clickHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      const isImg = target.tagName === "IMG";
      const mediaWrapper = target.closest(".media-node");

      const isControls =
        target.tagName === "AUDIO" ||
        target.tagName === "VIDEO" ||
        target.tagName === "INPUT" ||
        target.className.includes("controls");

      const isMediaClick = isImg || (mediaWrapper && !isControls);

      if (mediaWrapper && isControls) {
        return;
      }

      if (isMediaClick) {
        setTimeout(() => {
          const { from } = editor.state.selection;
          const isReClicking = lastSelectedPos.current === from;

          if (isReClicking) {
            // Toggle Off
            const node = editor.state.doc.nodeAt(from);
            if (node) {
              const afterPos = from + node.nodeSize;
              editor.chain().focus().setTextSelection(afterPos).run();
              tippyInstance.current?.hide();
              lastSelectedPos.current = null;
            }
          } else {
            // Select
            updateBubble();
            lastSelectedPos.current = from;
          }
        }, 50);
      } else {
        tippyInstance.current?.hide();
        lastSelectedPos.current = null;
      }
    };

    dom.addEventListener("click", clickHandler);
    const scrollHandler = () => {
      tippyInstance.current?.hide();
    };
    window.addEventListener("scroll", scrollHandler, true);

    return () => {
      dom.removeEventListener("click", clickHandler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [editor, updateBubble]);

  const deleteSelectedMedia = useCallback(async () => {
    if (!editor) return;
    setIsDeletingMedia(true);
    const { state } = editor;
    const { from } = state.selection;
    const node = state.doc.nodeAt(from);

    if (
      node &&
      (node.type.name === "image" ||
        node.type.name === "audio" ||
        node.type.name === "video" ||
        node.type.name === "file")
    ) {
      const src = node.attrs.src;
      if (src) await deleteFromS3(src);
      editor.chain().focus().deleteSelection().run();
      setCurrentContent(editor.getHTML());

      tippyInstance.current?.hide();
      lastSelectedPos.current = null;
    }
    setIsDeletingMedia(false);
  }, [editor]);

  // --- End Media Deletion Logic ---

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

  const hasChanges = useMemo(() => {
    if (!activeNoteId || !activeNote) return false;
    if (activeNote.isLocked && !sessionPassword) return false;
    return title !== originalTitle || currentContent !== originalContent;
  }, [
    title,
    currentContent,
    originalTitle,
    originalContent,
    activeNoteId,
    activeNote,
    sessionPassword,
  ]);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(currentContent, 500);

  useEffect(() => {
    if (isInitialLoad.current || !activeNoteId || !editor?.isEditable) {
      return;
    }
    if (
      debouncedTitle !== originalTitle ||
      debouncedContent !== originalContent
    ) {
      console.log("Auto-saving...");
      updateNote(activeNoteId, {
        content: debouncedContent,
        title: debouncedTitle,
      });
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

  const handleSave = () => {
    if (!editor || !activeNoteId || !hasChanges) return;
    updateNote(activeNoteId, {
      content: currentContent,
      title: title,
    });
    setOriginalTitle(title);
    setOriginalContent(currentContent);
  };

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
          editor.chain().focus().setFile({ src: url, name: file.name }).run();
        }
      }
    } catch (error) {
      console.error("Failed to upload files:", error);
    }
    setIsUploading(false);
  };

  const handleAddLink = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    setInitialLinkName(selectedText);
    setInitialLinkUrl(editor.getAttributes("link").href || "");
    setIsLinkModalOpen(true);
  }, [editor]);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editor?.commands.focus();
    }
  };

  const handleDeleteNote = () => {
    if (!activeNoteId) return;
    deleteNote(activeNoteId);
    setActiveNoteId(null);
  };

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
    setSessionPassword(null);
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
      setPasswordModalMode("verify"); // Default to verify
      setShowVerifyPasswordModal(true);
    } else {
      setPendingAction("lock");
      if (metadata?.hasNotesPassword) {
        performLock();
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
      // ✅ FIX: Check Offline before API
      if (!navigator.onLine) {
        setLockError("You are offline. Cannot unlock note.");
        return;
      }

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

  const handleSearchResultClick = (noteId: string) => {
    setActiveNoteId(noteId);
    setSearchTerm("");
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!editor || !editor.isEditable) return;
    const editorEl = editor.view.dom;
    const titleEl = e.currentTarget.querySelector(
      'input[placeholder="Note Title"]'
    );
    if (
      editorEl.contains(e.target as Node) ||
      titleEl?.contains(e.target as Node)
    ) {
      return;
    }
    editor
      .chain()
      .focus()
      .setTextSelection(editor.state.doc.content.size)
      .run();
  };

  const floatingMenu = (
    <div className="bg-gray-900 text-white rounded-lg shadow-xl px-3 py-2 flex items-center gap-2 text-xs font-medium">
      <button
        onClick={deleteSelectedMedia}
        className="flex items-center gap-1 hover:text-red-400 transition-colors"
      >
        {isDeletingMedia ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
        <span>Delete</span>
      </button>
    </div>
  );

  return (
    <Tooltip.Provider delayDuration={100}>
      <div className="flex flex-col h-full relative">
        {/* Search bar */}
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

        {/* Editor Toolbar */}
        <EditorToolbar
          editor={editor}
          mediaInputRef={mediaInputRef}
          docInputRef={docInputRef}
          onAddLink={handleAddLink}
          onRecordAudioClick={() => setIsAudioModalOpen(true)}
          isLocked={activeNote?.isLocked || false}
          onToggleLock={handleToggleLock}
          onDeleteNote={handleDeleteNote}
        />

        {/* Content Area */}
        {!activeNoteId || !activeNote ? (
          <div
            className="flex-1 flex items-center justify-center text-gray-500"
            onClick={handleContainerClick}
          >
            Select a note to start editing.
          </div>
        ) : activeNote.isLocked && !sessionPassword ? (
          <LockedNoteScreen
            onUnlockSubmit={handleUnlockSubmit}
            onForgotPassword={() => {
              // ✅ Open VerifyModal in 'otp' mode
              setPasswordModalMode("otp");
              setShowVerifyPasswordModal(true);
            }}
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
                className="text-2xl font-bold w-full p-6 pb-0 focus:outline-none"
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

        {/* ✅ FIX: Use Portals to break Modals out of the Editor Panel */}
        {isLinkModalOpen &&
          createPortal(
            <AddLinkModal
              editor={editor}
              onClose={() => setIsLinkModalOpen(false)}
              initialName={initialLinkName}
              initialUrl={initialLinkUrl}
            />,
            document.body
          )}

        {isAudioModalOpen &&
          createPortal(
            <AudioRecorder
              onClose={() => setIsAudioModalOpen(false)}
              onAdd={(file) => handleFileUpload([file])}
            />,
            document.body
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
            initialMode={passwordModalMode} // ✅ Pass correct mode
            onClose={() => {
              setShowVerifyPasswordModal(false);
              setPendingAction(null);
              setPasswordModalMode("verify"); // Reset for next time
            }}
            onSuccess={onVerifySuccess}
          />
        )}

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

      {/* Render Floating Menu Portal */}
      {menuContainerRef.current &&
        createPortal(floatingMenu, menuContainerRef.current)}
    </Tooltip.Provider>
  );
}
