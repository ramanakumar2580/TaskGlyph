"use client";

import React, { useRef, useState } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { NotesSidebar } from "@/components/NotesSidebar";
import { NoteList } from "@/components/NoteList";
import { NoteEditor } from "@/components/NoteEditor";

export default function NotesPage() {
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedView, setSelectedView] = useState("all");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const toggleSidebar = () => {
    const panel = sidebarPanelRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  };

  return (
    // [FIX] Removed 'rounded-lg' from this container div
    <div
      className="flex overflow-hidden bg-white text-black fixed top-[60px] left-0 right-0 bottom-0 z-40 
                 border-t border-gray-200 shadow-sm"
    >
      <PanelGroup
        direction="horizontal"
        // 'overflow-hidden' here clips the corners
        className="overflow-hidden"
      >
        {/* Pane 1: Folder Sidebar */}
        <Panel
          ref={sidebarPanelRef}
          collapsible={true}
          defaultSize={20}
          minSize={15}
          maxSize={30}
          // [FIX] 'rounded-tl-lg' gives you the top-left curve
          className="h-full box-border bg-gray-50 rounded-tl-lg"
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
        >
          <NotesSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleClick={toggleSidebar}
            selectedView={selectedView}
            setSelectedView={setSelectedView}
          />
        </Panel>

        {/* Resize Handle 1 */}
        <PanelResizeHandle
          className="w-px bg-gray-200 cursor-col-resize transition-colors 
                     data-[active=true]:bg-gray-800 data-[active=true]:w-[2px] 
                     hover:bg-gray-800 hover:w-[2px]"
        />

        {/* Pane 2: Note List */}
        <Panel
          defaultSize={30}
          minSize={20}
          maxSize={40}
          className="h-full box-border bg-gray-100"
        >
          <NoteList
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            selectedView={selectedView}
            activeNoteId={activeNoteId}
            setActiveNoteId={setActiveNoteId}
          />
        </Panel>

        {/* Resize Handle 2 */}
        <PanelResizeHandle
          className="w-px bg-gray-200 cursor-col-resize transition-colors 
                     data-[active=true]:bg-gray-800 data-[active=true]:w-[2px] 
                     hover:bg-gray-800 hover:w-[2px]"
        />

        {/* Pane 3: Editor */}
        <Panel
          defaultSize={50}
          minSize={30}
          // [FIX] 'rounded-tr-lg' gives you the top-right curve
          className="h-full box-border bg-white rounded-tr-lg"
        >
          <NoteEditor
            activeNoteId={activeNoteId}
            setActiveNoteId={setActiveNoteId}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
