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

  // Custom Resize Handle Component for better UX
  const ResizeHandle = ({ className = "" }: { className?: string }) => (
    <PanelResizeHandle
      // CHANGED: z-50 -> z-20 to ensure it stays behind modals/overlays
      className={`w-[2px] bg-transparent hover:bg-blue-400 transition-all duration-300 hover:w-[3px] cursor-col-resize relative group outline-none z-20 ${className}`}
    >
      {/* Visual Indicator line inside the grab area */}
      <div className="absolute inset-y-0 left-1/2 w-[1px] bg-gray-200 group-hover:bg-blue-400 transition-colors h-full" />
    </PanelResizeHandle>
  );

  return (
    <div className="flex overflow-hidden bg-gray-50/30 text-black fixed top-[60px] left-0 right-0 bottom-0 z-40">
      <PanelGroup direction="horizontal" className="w-full h-full">
        {/* Pane 1: Folder Sidebar */}
        <Panel
          ref={sidebarPanelRef}
          collapsible={true}
          defaultSize={18}
          minSize={15}
          maxSize={25}
          className="h-full bg-gray-50/50 border-r border-gray-100"
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

        {/* Handle 1 */}
        <ResizeHandle />

        {/* Pane 2: Note List */}
        <Panel
          defaultSize={25}
          minSize={20}
          maxSize={35}
          className="h-full bg-white/80 backdrop-blur-sm"
        >
          <NoteList
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            selectedView={selectedView}
            activeNoteId={activeNoteId}
            setActiveNoteId={setActiveNoteId}
          />
        </Panel>

        {/* Handle 2 */}
        <ResizeHandle />

        {/* Pane 3: Editor (Main Area) */}
        <Panel
          defaultSize={57}
          minSize={30}
          // Added shadow and z-index to make it pop slightly above the list
          className="h-full bg-white shadow-[-5px_0_15px_-3px_rgba(0,0,0,0.02)] z-10 relative"
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
