/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useDiary } from "@/lib/db/useDiary";
import {
  format,
  subDays,
  addDays,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isSameMonth,
  getDay,
  isFuture,
  isToday,
} from "date-fns";
import { uploadToS3 } from "@/lib/uploadToS3";
import { deleteFromS3 } from "@/lib/deleteFromS3";
import {
  Cloud,
  Sun,
  MapPin,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Save,
  Trash2,
  Calendar as CalendarIcon,
  Zap,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List,
  ListOrdered,
  Image as ImageIcon,
  Mic,
  Loader2,
  CheckCircle2,
  Eye,
  Type,
  ChevronDown,
  Minimize2,
  Maximize2,
  PenLine,
  Clock,
} from "lucide-react";

// Tippy for manual floating menu
import tippy, { Instance as TippyInstance } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";

// Tiptap Core
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
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { AudioRecorder } from "@/components/AudioRecorder";

/* --------------------
   Custom Components
   -------------------- */

// 1. Toolbar Button
const ToolbarBtn = ({
  onClick,
  isActive = false,
  icon: Icon,
  label,
  className = "",
}: {
  onClick: () => void;
  isActive?: boolean;
  icon: any;
  label: string;
  className?: string;
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className={`group relative p-2 rounded transition-all duration-200 ${
      isActive
        ? "bg-blue-100 text-blue-600 ring-1 ring-blue-200"
        : "text-gray-500 hover:bg-gray-100 hover:text-blue-600"
    } ${className}`}
  >
    <Icon size={18} />
    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-100 text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
      {label}
      <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></span>
    </span>
  </button>
);

// 2. Custom Audio Node
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
          "audio-player my-4 w-full flex justify-center items-center bg-gray-50/50 rounded-lg py-2 cursor-pointer",
        "data-audio-wrapper": "true",
      },
      ["audio", mergeAttributes(HTMLAttributes)],
    ];
  },
  addCommands() {
    return {
      setAudio:
        (options: { src: string }) =>
        ({ commands }: any) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },
});

/* --------------------
   Config
   -------------------- */
const MOODS = [
  { label: "Amazing", emoji: "🤩" },
  { label: "Happy", emoji: "🙂" },
  { label: "Neutral", emoji: "😐" },
  { label: "Tired", emoji: "😴" },
  { label: "Sad", emoji: "😢" },
  { label: "Stressed", emoji: "😫" },
  { label: "Angry", emoji: "😡" },
];

const FONTS = [
  { name: "Default", value: "Inter, sans-serif" },
  { name: "Serif", value: "'Lora', serif" },
  { name: "Handwritten", value: "'Dancing Script', cursive" },
  { name: "Casual", value: "'Patrick Hand', cursive" },
  { name: "Mono", value: "'JetBrains Mono', monospace" },
];

const caretStorageKey = (dateStr: string) => `diary-caret-${dateStr}`;

export default function DiaryPage() {
  const { entries, saveEntry, deleteDiaryEntry } = useDiary();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isZenMode, setIsZenMode] = useState(false);

  // Editor UI state
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number>(5);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved"
  );
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);

  const [, setEditorUpdateTrigger] = useState(0);

  // Calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Context
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    city: string;
  } | null>(null);
  const [locationName, setLocationName] = useState<string>("Locating...");

  // UI flags
  const [isUploading, setIsUploading] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);

  // Privacy & State Management
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false); // For "Hidden for Privacy"
  const [isWriting, setIsWriting] = useState(false); // For "Start Writing" (Empty State)

  const isInitialLoad = useRef(true);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const tippyInstance = useRef<TippyInstance | null>(null);
  const lastSelectedPos = useRef<number | null>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  // --- 1. Editor Setup ---
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      TextStyle,
      FontFamily,
      BulletList,
      OrderedList,
      ListItem,
      History,
      Link.configure({ openOnClick: true, autolink: true }),
      ImageExtension.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Dear Diary..." }),
      BubbleMenuExtension,
      CustomAudio,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[300px] text-gray-800 leading-relaxed [&_img]:max-h-[300px] [&_img]:rounded-lg [&_img]:shadow-md [&_img]:mx-auto [&_img]:cursor-pointer [&_img]:transition-opacity hover:[&_img]:opacity-90 [&_img]:border-2 [&_img]:border-transparent [&_img.ProseMirror-selectednode]:border-blue-500 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
    onTransaction: () => {
      setEditorUpdateTrigger(Date.now());
    },
    onUpdate: () => {
      setSaveStatus("unsaved");
      isInitialLoad.current = false;
      // If typing starts, we are definitely writing
      if (!isWriting) setIsWriting(true);

      try {
        const dateKey = format(selectedDate, "yyyy-MM-dd");
        const pos = editor?.state.selection.from ?? null;
        if (pos !== null)
          localStorage.setItem(caretStorageKey(dateKey), String(pos));
      } catch {}
    },
    immediatelyRender: false,
  });

  const currentDateKey = useCallback(
    () => format(selectedDate, "yyyy-MM-dd"),
    [selectedDate]
  );

  // --- Navigation Helper (Prevents Data Loss) ---
  const safeDateChange = (newDate: Date) => {
    if (saveStatus === "unsaved") {
      if (!confirm("You have unsaved changes. Discard them and leave?")) {
        return;
      }
    }
    setSelectedDate(newDate);
  };

  // --- 2. Privacy & Sync Logic (Fixed for Empty States) ---

  // Reset State on Date Change
  useEffect(() => {
    isInitialLoad.current = true;
    setIsRevealed(false);
    setIsWriting(false); // Default to "Not Writing" (Show Empty State) until checked
    setHasExistingEntry(false);
  }, [selectedDate]);

  useEffect(() => {
    if (!editor) return;
    const dateStr = currentDateKey();
    const existingEntry = entries.find((e) => e.entryDate === dateStr);

    if (existingEntry) {
      // Entry Exists -> Show Privacy Screen
      setHasExistingEntry(true);
      setIsWriting(true); // Content exists, so we are in writing mode (just hidden)

      if (isInitialLoad.current) {
        setIsRevealed(false); // Force hide on load
        isInitialLoad.current = false;

        if (editor.getHTML() !== existingEntry.content) {
          editor.commands.setContent(existingEntry.content);
        }

        setMood(existingEntry.mood || null);
        setEnergy(existingEntry.energy || 5);
        setTags(existingEntry.tags || []);
        if (existingEntry.weather) setWeather(existingEntry.weather);
        if (existingEntry.location) setLocationName(existingEntry.location);
      }
      setSaveStatus("saved");
    } else {
      // No Entry -> Show Empty State
      setHasExistingEntry(false);

      // ✅ FIX: Force Clear Editor Content when switching to a date with no entry
      editor.commands.clearContent();

      // If it's Today, we might want to just let them write immediately (Optional)
      // But keeping it consistent with "Start Writing" is cleaner.
      // Let's auto-start writing ONLY if it's TODAY and user just loaded the app (optional UX).
      // For now, sticking to "Show Empty State" for all dates with no data is consistent.

      setIsWriting(false); // This triggers the "Empty State" UI

      setMood(null);
      setEnergy(5);
      setTags([]);
      setSaveStatus("saved");
      if (!isSameDay(selectedDate, new Date())) {
        setWeather(null);
        setLocationName("");
      }
    }
  }, [editor, entries, currentDateKey, selectedDate]);

  const handleReveal = () => {
    if (!editor) return;
    const dateStr = currentDateKey();
    const existingEntry = entries.find((e) => e.entryDate === dateStr);

    isInitialLoad.current = false;

    if (existingEntry) {
      if (editor.getHTML() !== existingEntry.content) {
        editor.commands.setContent(existingEntry.content);
      }
      try {
        const saved = localStorage.getItem(caretStorageKey(dateStr));
        if (saved) {
          const pos = parseInt(saved);
          if (!isNaN(pos)) {
            setTimeout(() => {
              editor.commands.focus();
              editor.commands.setTextSelection(pos);
            }, 10);
          }
        }
      } catch {}
    }
    setIsRevealed(true);
  };

  const startWriting = () => {
    setIsWriting(true);
    setIsRevealed(true);
    editor?.commands.focus();
  };

  // --- 3. Click Outside Logic ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
      if (
        fontMenuRef.current &&
        !fontMenuRef.current.contains(event.target as Node)
      ) {
        setIsFontMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 4. Tippy Logic ---
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
        offset: [0, 15],
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
      !!node && (node.type.name === "image" || node.type.name === "audio");

    if (!isMedia) {
      tippyInstance.current.hide();
      return;
    }

    const domNode = view.nodeDOM(from) as HTMLElement;
    let targetElement = domNode;

    if (node.type.name === "audio") {
      const wrapper = view.dom
        .querySelector(`[data-audio-wrapper] audio[src="${node.attrs.src}"]`)
        ?.closest(".audio-player");
      if (wrapper) {
        const innerAudio = wrapper.querySelector("audio");
        targetElement = (innerAudio || wrapper) as HTMLElement;
      } else if (domNode && domNode.classList.contains("audio-player")) {
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
      const audioWrapper = target.closest(".audio-player");
      const isMediaClick = isImg || audioWrapper;

      if (isMediaClick) {
        setTimeout(() => {
          const { from } = editor.state.selection;
          const isReClickingSameItem = lastSelectedPos.current === from;
          if (isReClickingSameItem) {
            const node = editor.state.doc.nodeAt(from);
            if (node) {
              const afterPos = from + node.nodeSize;
              editor.chain().focus().setTextSelection(afterPos).run();
              tippyInstance.current?.hide();
              lastSelectedPos.current = null;
            }
          } else {
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
    const scrollHandler = () => tippyInstance.current?.hide();
    window.addEventListener("scroll", scrollHandler, true);
    return () => {
      dom.removeEventListener("click", clickHandler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [editor, updateBubble]);

  // --- 5. Weather ---
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m,weather_code&timezone=auto`
          );
          const data = await res.json();
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            condition: data.current.weather_code > 3 ? "Cloudy" : "Clear",
            city: "Current Location",
          });
          setLocationName(
            `${pos.coords.latitude.toFixed(1)}, ${pos.coords.longitude.toFixed(
              1
            )}`
          );
        } catch (e) {
          console.error(e);
        }
      },
      () => setLocationName("Location denied")
    );
  }, []);

  // --- 6. Handlers ---
  const handleFileUpload = async (files: FileList | File[] | null) => {
    if (!editor || !files) return;
    setIsUploading(true);
    const filesToUpload = Array.from(files);
    try {
      for (const file of filesToUpload) {
        const s3Response = await uploadToS3(file, "diary");
        if (file.type.startsWith("image/")) {
          editor
            .chain()
            .focus()
            .setImage({ src: s3Response.url, alt: file.name })
            .createParagraphNear()
            .insertContent("<p></p>")
            .run();
        } else if (file.type.startsWith("audio/")) {
          editor
            .chain()
            .focus()
            .setAudio({ src: s3Response.url })
            .createParagraphNear()
            .insertContent("<p></p>")
            .run();
        }
      }
      setSaveStatus("unsaved");
    } catch {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteSelectedMedia = useCallback(async () => {
    if (!editor) return;
    setIsDeletingMedia(true);
    const { state } = editor;
    const { from } = state.selection;
    const node = state.doc.nodeAt(from);
    if (node && (node.type.name === "image" || node.type.name === "audio")) {
      const src = node.attrs.src;
      if (src) await deleteFromS3(src);
      editor.chain().focus().deleteSelection().run();
      setSaveStatus("unsaved");
      tippyInstance.current?.hide();
      lastSelectedPos.current = null;
    }
    setIsDeletingMedia(false);
  }, [editor]);

  const handleSave = async () => {
    if (!editor) return;
    setSaveStatus("saving");
    isInitialLoad.current = false;
    await saveEntry(
      {
        content: editor.getHTML(),
        mood: mood || undefined,
        energy,
        tags,
        weather,
        location: locationName,
      },
      currentDateKey()
    );
    setHasExistingEntry(true);
    setTimeout(() => setSaveStatus("saved"), 500);
  };

  const handleDeleteEntry = async () => {
    const dateStr = currentDateKey();
    const entry = entries.find((e) => e.entryDate === dateStr);
    if (!entry) return;
    if (confirm("Delete entry and all attachments?")) {
      setIsDeletingEntry(true);
      const parser = new DOMParser();
      const doc = parser.parseFromString(entry.content, "text/html");
      const mediaElements = doc.querySelectorAll("img, audio");
      const deletePromises: Promise<any>[] = [];
      mediaElements.forEach((el) => {
        const src = el.getAttribute("src");
        if (src && src.includes("amazonaws.com"))
          deletePromises.push(deleteFromS3(src));
      });
      if (deletePromises.length) await Promise.all(deletePromises);
      await deleteDiaryEntry(entry.id);
      editor?.commands.clearContent();
      setMood(null);
      setSaveStatus("saved");
      setHasExistingEntry(false);
      setIsRevealed(true);
      setIsDeletingEntry(false);
      // Reset to Empty State
      setIsWriting(false);
      try {
        localStorage.removeItem(caretStorageKey(dateStr));
      } catch {}
    }
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

  const getEnergyColor = (level: number) => {
    if (level <= 3) return "text-red-500";
    if (level <= 7) return "text-yellow-500";
    return "text-green-500";
  };

  const getEnergyAccent = (level: number) => {
    if (level <= 3) return "accent-red-500";
    if (level <= 7) return "accent-yellow-500";
    return "accent-green-500";
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=JetBrains+Mono:wght@400&family=Lora:ital,wght@0,400..700;1,400..700&family=Patrick+Hand&display=swap");
      `}</style>

      <div
        className={`fixed inset-x-0 bottom-0 top-[64px] bg-[#F3F4F6] overflow-hidden flex flex-col ${
          isZenMode ? "z-50 top-0" : ""
        }`}
      >
        <div
          className={`flex-1 flex gap-4 p-3 w-full h-full ${
            isZenMode ? "max-w-4xl mx-auto p-6" : "max-w-full"
          }`}
        >
          {/* LEFT SIDEBAR */}
          {!isZenMode && (
            <aside className="w-80 h-full flex-shrink-0 hidden lg:flex flex-col gap-4">
              <div className="bg-white rounded-3xl shadow-sm border border-white/50 flex flex-col h-full overflow-hidden">
                <div className="p-5 pb-2 flex justify-between items-center relative">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    History
                  </h3>
                  <div className="relative group">
                    <button
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
                    >
                      <CalendarIcon size={18} />
                    </button>
                    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-100 text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                      Calendar
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></span>
                    </span>
                  </div>

                  {/* Calendar Popup */}
                  {isCalendarOpen && (
                    <div
                      ref={calendarRef}
                      className="absolute top-14 right-0 w-72 bg-white border border-gray-200 shadow-xl rounded-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="flex justify-between items-center mb-4 text-gray-700">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setCalendarViewDate(subYears(calendarViewDate, 1))
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Previous Year"
                          >
                            <ChevronsLeft size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setCalendarViewDate(
                                subMonths(calendarViewDate, 1)
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Previous Month"
                          >
                            <ChevronLeft size={16} />
                          </button>
                        </div>

                        <span className="font-bold text-sm">
                          {format(calendarViewDate, "MMMM yyyy")}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setCalendarViewDate(
                                addMonths(calendarViewDate, 1)
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Next Month"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setCalendarViewDate(addYears(calendarViewDate, 1))
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Next Year"
                          >
                            <ChevronsRight size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 font-medium text-gray-400">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                          <div key={i}>{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {Array.from({
                          length: getDay(startOfMonth(calendarViewDate)),
                        }).map((_, i) => (
                          <div key={`e-${i}`} />
                        ))}
                        {eachDayOfInterval({
                          start: startOfMonth(calendarViewDate),
                          end: endOfMonth(calendarViewDate),
                        }).map((day) => {
                          const dateStr = format(day, "yyyy-MM-dd");
                          const hasEntry = entries.some(
                            (e) => e.entryDate === dateStr
                          );
                          const isSelected = isSameDay(day, selectedDate);
                          const currentMonth = isSameMonth(
                            day,
                            calendarViewDate
                          );
                          return (
                            <button
                              key={dateStr}
                              onClick={() => {
                                // ✅ FIX: Safe Navigation with check
                                safeDateChange(day);
                                setIsCalendarOpen(false);
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center relative 
                                ${
                                  isSelected
                                    ? "bg-black text-white"
                                    : "hover:bg-gray-100"
                                }
                                ${!currentMonth ? "opacity-30" : ""}
                              `}
                            >
                              {format(day, "d")}
                              {hasEntry && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      // ✅ FIX: Safe Navigation
                      onClick={() => safeDateChange(parseISO(entry.entryDate))}
                      className={`p-3 rounded-xl cursor-pointer transition-all border group ${
                        isSameDay(parseISO(entry.entryDate), selectedDate)
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-gray-50/50 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          {format(parseISO(entry.entryDate), "MMM d, yyyy")}
                        </span>
                        <span className="text-lg">{entry.mood}</span>
                      </div>
                      <p className="text-xs text-gray-400 overflow-hidden whitespace-nowrap">
                        {entry.content.replace(/<[^>]*>?/gm, "").slice(0, 12) ||
                          "Media..."}
                        ...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* MAIN EDITOR */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="flex-shrink-0 flex justify-between items-end mb-2 px-2">
              <div>
                <div className="flex items-center gap-3 text-gray-400 text-sm mb-1 font-medium uppercase tracking-wider">
                  {/* ✅ FIX: Safe Navigation Arrows */}
                  <button
                    onClick={() => safeDateChange(subDays(selectedDate, 1))}
                    className="hover:text-blue-600"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>{isToday(selectedDate) ? "Today" : "Time Travel"}</span>
                  <button
                    onClick={() => safeDateChange(addDays(selectedDate, 1))}
                    className="hover:text-blue-600"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight">
                  {format(selectedDate, "EEEE, d MMMM yyyy")}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
                    {weather?.condition === "Clear" ? (
                      <Sun size={12} className="text-orange-400" />
                    ) : (
                      <Cloud size={12} className="text-blue-400" />
                    )}
                    {weather
                      ? `${weather.temp}°C ${weather.condition}`
                      : "No Data"}
                  </span>
                  <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
                    <MapPin size={12} className="text-red-400" /> {locationName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button
                    onClick={() => setIsZenMode(!isZenMode)}
                    className="p-2 bg-white text-gray-500 hover:text-blue-600 rounded-xl shadow-sm border border-gray-100"
                  >
                    {isZenMode ? (
                      <Minimize2 size={20} />
                    ) : (
                      <Maximize2 size={20} />
                    )}
                  </button>
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-100 text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                    {isZenMode ? "Exit Zen Mode" : "Zen Mode"}
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></span>
                  </span>
                </div>
              </div>
            </header>

            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
              <div className="flex-shrink-0 border-b border-gray-50 p-4 flex flex-wrap gap-6 items-center bg-gray-50/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Mood
                  </span>
                  <div className="flex gap-1">
                    {MOODS.map((m) => (
                      <button
                        key={m.label}
                        onClick={() => {
                          setMood(m.emoji);
                          setSaveStatus("unsaved");
                        }}
                        className={`text-xl p-1.5 rounded-lg transition-all hover:scale-110 ${
                          mood === m.emoji
                            ? "bg-white shadow-md scale-110 ring-1 ring-black/5"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                <div className="flex items-center gap-3 flex-1 min-w-[150px]">
                  <div
                    className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${getEnergyColor(
                      energy
                    )}`}
                  >
                    <Zap size={14} /> Energy
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => {
                      setEnergy(parseInt(e.target.value));
                      setSaveStatus("unsaved");
                    }}
                    className={`flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer ${getEnergyAccent(
                      energy
                    )}`}
                  />
                  <span className="text-xs font-medium text-gray-600 w-4">
                    {energy}
                  </span>
                </div>
              </div>

              {/* LOGIC:
                  1. Entry Exists + Not Revealed -> Show Privacy Screen
                  2. No Entry + Not Writing (Empty State) -> Show Empty UI
                  3. Else -> Show Editor
              */}

              {hasExistingEntry && !isRevealed ? (
                <div
                  className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer group"
                  onClick={handleReveal}
                >
                  <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                    <Eye
                      size={32}
                      className="text-gray-400 group-hover:text-blue-500 transition-colors"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Hidden for Privacy
                  </h3>
                  <p className="text-gray-500">Tap to read your thoughts.</p>
                </div>
              ) : !isWriting && !hasExistingEntry ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white text-center p-8">
                  <div className="mb-6 p-6 bg-gray-50 rounded-full">
                    {isFuture(selectedDate) ? (
                      <Clock size={48} className="text-gray-300" />
                    ) : (
                      <PenLine size={48} className="text-gray-300" />
                    )}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">
                    {isFuture(selectedDate)
                      ? "Writing from the future?"
                      : "No entry for this day"}
                  </h3>
                  <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                    {isFuture(selectedDate)
                      ? "This day hasn't happened yet. But hey, if you want to manifest something, go ahead!"
                      : "The pages are empty. Would you like to pen down your thoughts for this day?"}
                  </p>
                  <button
                    onClick={startWriting}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <PenLine size={18} />
                    Start Writing
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-shrink-0 flex items-center gap-1 p-2 border-b border-gray-100 bg-white z-10">
                    <ToolbarBtn
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      isActive={editor?.isActive("bold")}
                      icon={BoldIcon}
                      label="Bold"
                    />
                    <ToolbarBtn
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      isActive={editor?.isActive("italic")}
                      icon={ItalicIcon}
                      label="Italic"
                    />

                    <div className="w-px h-6 bg-gray-200 mx-2" />

                    <div className="relative" ref={fontMenuRef}>
                      <button
                        onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
                        className="group relative p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium"
                      >
                        <Type size={18} />
                        <ChevronDown size={14} />
                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-100 text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                          Fonts
                          <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></span>
                        </span>
                      </button>
                      {isFontMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                          {FONTS.map((font) => (
                            <button
                              key={font.name}
                              onClick={() => {
                                editor
                                  ?.chain()
                                  .focus()
                                  .setFontFamily(font.value)
                                  .run();
                                setIsFontMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-gray-700 hover:text-blue-600"
                              style={{ fontFamily: font.value }}
                            >
                              {font.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-2" />

                    <ToolbarBtn
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      isActive={editor?.isActive("bulletList")}
                      icon={List}
                      label="Bullet List"
                    />
                    <ToolbarBtn
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                      isActive={editor?.isActive("orderedList")}
                      icon={ListOrdered}
                      label="Ordered List"
                    />
                    <div className="w-px h-6 bg-gray-200 mx-2" />

                    <ToolbarBtn
                      onClick={() => fileInputRef.current?.click()}
                      icon={ImageIcon}
                      label="Upload Image"
                    />

                    <ToolbarBtn
                      onClick={() => setIsAudioModalOpen(true)}
                      icon={Mic}
                      label="Record Audio"
                      className="hover:text-red-500"
                    />

                    {isUploading && (
                      <span className="ml-auto text-xs text-blue-500 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" />{" "}
                        Uploading...
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                    <EditorContent editor={editor} className="p-8 h-full" />
                  </div>

                  <div className="flex-shrink-0 p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 w-full sm:flex-1 overflow-hidden">
                      <Hash size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="flex gap-2 overflow-x-auto no-scrollbar items-center flex-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                          >
                            #{tag}{" "}
                            <button
                              onClick={() =>
                                setTags(tags.filter((t) => t !== tag))
                              }
                              className="hover:text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) =>
                            (e.key === "Enter" &&
                              newTag.trim() &&
                              setTags([...tags, newTag])) ||
                            setNewTag("")
                          }
                          placeholder="Add tag..."
                          className="bg-transparent text-sm outline-none min-w-[80px] flex-1 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {hasExistingEntry && (
                        <button
                          onClick={handleDeleteEntry}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Entire Entry"
                        >
                          {isDeletingEntry ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={saveStatus === "saved"}
                        className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
                          saveStatus === "unsaved"
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-green-100 text-green-700 cursor-default"
                        }`}
                      >
                        {saveStatus === "saving" ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : saveStatus === "unsaved" ? (
                          <Save size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        {saveStatus === "saved"
                          ? "Saved"
                          : saveStatus === "saving"
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              handleFileUpload(e.target.files);
              e.target.value = "";
            }}
          />
          {isAudioModalOpen && (
            <AudioRecorder
              onClose={() => setIsAudioModalOpen(false)}
              onAdd={(file) => handleFileUpload([file] as any)}
            />
          )}
        </div>
      </div>

      {menuContainerRef.current &&
        createPortal(floatingMenu, menuContainerRef.current)}
    </>
  );
}
