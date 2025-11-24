/* eslint-disable jsx-a11y/alt-text */
"use client";

import React from "react";
import { type Editor } from "@tiptap/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  ListChecks,
  Heading1,
  Heading2,
  Heading3,
  Paperclip,
  Mic,
  File,
  Image,
  Link,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";

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

type Props = {
  editor: Editor | null;
  mediaInputRef: React.RefObject<HTMLInputElement | null>;
  docInputRef: React.RefObject<HTMLInputElement | null>;
  onAddLink: () => void;
  onRecordAudioClick: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
  onDeleteNote: () => void;
};

export function EditorToolbar({
  editor,
  mediaInputRef,
  docInputRef,
  onAddLink,
  onRecordAudioClick,
  isLocked,
  onToggleLock,
  onDeleteNote,
}: Props) {
  if (!editor) {
    return null;
  }

  // [FIX #1] Added onMouseDown={(e) => e.preventDefault()}
  // This prevents the button from stealing focus from the editor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Button = ({ onClick, isActive, children, label }: any) => (
    <TooltipButtonWrapper label={label}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()} // Important for single click
        onClick={onClick}
        disabled={!editor.isEditable && !isLocked}
        className={`p-2 rounded-md transition-colors disabled:opacity-50 ${
          isActive
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-200 hover:text-black"
        }`}
      >
        {children}
      </button>
    </TooltipButtonWrapper>
  );

  return (
    <div className="flex items-center gap-1 p-2 h-[50px] box-border border-b border-gray-200 overflow-x-auto no-scrollbar bg-white sticky top-0 z-10">
      <>
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          label="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          label="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          onClick={onAddLink}
          isActive={editor.isActive("link")}
          label="Add Link (Ctrl+K)"
        >
          <Link className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          label="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          label="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          label="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          label="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          label="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          label="Checklist"
        >
          <ListChecks className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        {/* Attachment Dropdown */}
        <Tooltip.Provider delayDuration={100}>
          <DropdownMenu.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!editor.isEditable}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-black text-white px-2 py-1 rounded text-xs shadow-lg z-50"
                  sideOffset={5}
                >
                  Attach <Tooltip.Arrow className="fill-black" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white rounded-md shadow-lg p-2 z-50 border border-gray-200 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
                sideOffset={5}
                align="start"
              >
                <DropdownMenu.Item
                  onSelect={() => mediaInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <Image className="w-4 h-4" />
                  <span>Photo / Video</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={onRecordAudioClick}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <Mic className="w-4 h-4" />
                  <span>Record Audio</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => docInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <File className="w-4 h-4" />
                  <span>Document</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Tooltip.Provider>

        <div className="flex-grow"></div>

        <Button
          onClick={onToggleLock}
          isActive={isLocked}
          label={isLocked ? "Unlock Note" : "Lock Note"}
        >
          {isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Unlock className="w-4 h-4" />
          )}
        </Button>

        <Button onClick={onDeleteNote} isActive={false} label="Move to Trash">
          <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
        </Button>
      </>
    </div>
  );
}
