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
  Video,
  Link,
  // HelpCircle, // [FIX] Removed HelpCircle
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";

// (TooltipButtonWrapper component is unchanged)
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
  // onHelpClick: () => void; // [FIX] Removed Help prop
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
  // onHelpClick, // [FIX] Removed Help prop
  onRecordAudioClick,
  isLocked,
  onToggleLock,
  onDeleteNote,
}: Props) {
  if (!editor) {
    // (Disabled toolbar)
    return (
      <div className="flex items-center gap-2 p-3 h-[44px] box-border border-b border-gray-200 opacity-50">
        <Bold className="w-4 h-4" />
        <Italic className="w-4 h-4" />
        <Link className="w-4 h-4" />
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        <Heading1 className="w-4 h-4" />
        <Heading2 className="w-4 h-4" />
        <Heading3 className="w-4 h-4" />
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        <List className="w-4 h-4" />
        <ListOrdered className="w-4 h-4" />
        <ListChecks className="w-4 h-4" />
        <Paperclip className="w-4 h-4" />
        <Lock className="w-4 h-4" />
        <Trash2 className="w-4 h-4" />
        <div className="flex-grow"></div>
        {/* <HelpCircle className="w-4 h-4" /> // [FIX] Removed Help icon */}
      </div>
    );
  }

  // (Button component is unchanged)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Button = ({ onClick, isActive, children, label }: any) => (
    <TooltipButtonWrapper label={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={!editor.isEditable && !isLocked}
        className={`p-2 rounded-md disabled:opacity-50 ${
          isActive
            ? "bg-gray-300 text-black"
            : "text-gray-600 hover:bg-gray-200"
        }`}
      >
        {children}
      </button>
    </TooltipButtonWrapper>
  );

  return (
    <div className="flex items-center gap-2 p-3 h-[44px] box-border border-b border-gray-200">
      <>
        {/* (All format buttons are unchanged) */}
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

        {/* Attachment Dropdown Menu (unchanged) */}
        <Tooltip.Provider delayDuration={100}>
          <DropdownMenu.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
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
                className="bg-white rounded-md shadow-lg p-2 z-50 border border-gray-200"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  onSelect={() => mediaInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <Image className="w-4 h-4" />
                  <Video className="w-4 h-4" />
                  Choose Photo or Video
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={onRecordAudioClick}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <Mic className="w-4 h-4" />
                  Record Audio
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => docInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <File className="w-4 h-4" />
                  Attach Document
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Tooltip.Provider>

        {/* Lock Button (unchanged) */}
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

        {/* Delete Button (unchanged) */}
        <Button onClick={onDeleteNote} isActive={false} label="Move to Trash">
          <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
        </Button>
      </>
    </div>
  );
}
