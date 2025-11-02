// src/components/TaskCalendar.tsx

"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg, EventInput } from "@fullcalendar/core";
import { Task } from "@/lib/db/clientDb";
import { useTasks } from "@/lib/db/useTasks";
import AddMeetingModal from "./AddMeetingModal";

// Note: We removed useTaskDetail, we don't need it here anymore

interface TaskCalendarProps {
  tasks: Task[];
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  // [UPDATED] Get updateTask from the hook
  const { tasks: allTasks, addTask, updateTask } = useTasks();

  // --- State for the modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // --- [NEW] State to hold the task we are editing ---
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Convert tasks to calendar events
  const calendarEvents = useMemo(() => {
    return tasks
      .filter((task) => !!task.dueDate)
      .map(
        (task) =>
          ({
            id: task.id,
            title: task.title,
            start: new Date(task.dueDate!),
          } as EventInput)
      );
  }, [tasks]);

  // --- [THIS IS THE FIX] ---
  // When you click an *existing* task on the calendar...
  const handleEventClick = (clickInfo: EventClickArg) => {
    const taskId = clickInfo.event.id;
    const task = allTasks.find((t: Task) => t.id === taskId);
    if (task) {
      // Set the task to edit and open the modal
      setEditingTask(task);
      setSelectedDate(null); // Ensure we're not in 'add' mode
      setIsModalOpen(true);
    }
  };

  // When you click on a *date*
  const handleDateClick = (clickInfo: DateClickArg) => {
    setSelectedDate(clickInfo.date); // Save the date they clicked
    setEditingTask(null); // Ensure we're not in 'edit' mode
    setIsModalOpen(true); // Open the modal
  };

  // [UPDATED] This function now handles BOTH adding and updating
  const handleSaveMeeting = async (meeting: {
    title: string;
    description: string;
    meetLink: string;
    meetingTime: Date;
  }) => {
    if (editingTask) {
      // --- UPDATE LOGIC ---
      await updateTask(editingTask.id, {
        title: meeting.title,
        notes: meeting.description,
        meetLink: meeting.meetLink,
        dueDate: meeting.meetingTime.getTime(),
        reminderAt: meeting.meetingTime.getTime(), // Also update reminder time
        // Reset flags so reminders send again
        reminder_30_sent: false,
        reminder_20_sent: false,
        reminder_10_sent: false,
      });
    } else {
      // --- ADD LOGIC ---
      await addTask(meeting.title, {
        notes: meeting.description,
        meetLink: meeting.meetLink,
        dueDate: meeting.meetingTime.getTime(),
        reminderAt: meeting.meetingTime.getTime(),
      });
    }

    // Close and reset modal state
    setIsModalOpen(false);
    setEditingTask(null);
    setSelectedDate(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setSelectedDate(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          events={calendarEvents}
          eventClick={handleEventClick} // <-- This now opens the edit modal
          dateClick={handleDateClick} // <-- This opens the add modal
          selectable={true}
          height="auto"
          eventColor="#2563eb"
        />
      </div>

      {/* --- [UPDATED] Render the modal --- */}
      <AddMeetingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMeeting}
        selectedDate={selectedDate}
        existingMeeting={editingTask}
      />
    </>
  );
}
