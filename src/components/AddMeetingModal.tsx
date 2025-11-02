"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, LinkIcon } from "@heroicons/react/24/outline";
import StylishButton from "./StylishButton";
import CustomTimeInput from "./CustomTimeInput";
import { Task } from "@/lib/db/clientDb"; // <-- Import Task type

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: {
    title: string;
    description: string;
    meetLink: string;
    meetingTime: Date;
  }) => void;
  // --- [NEW] ---
  selectedDate: Date | null; // For adding a new meeting
  existingMeeting: Task | null; // For editing an existing one
}

export default function AddMeetingModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingMeeting, // <-- [NEW]
}: AddMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [meetingTime, setMeetingTime] = useState(new Date());

  const isEditMode = !!existingMeeting;

  // This effect now fills the form when the modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && existingMeeting) {
        // --- EDIT MODE ---
        // Fill form with existing data
        setTitle(existingMeeting.title);
        setDescription(existingMeeting.notes || "");
        setMeetLink(existingMeeting.meetLink || "");
        setMeetingTime(new Date(existingMeeting.dueDate!));
      } else if (selectedDate) {
        // --- ADD MODE ---
        // Set date from calendar and default the time
        const newMeetingTime = new Date(selectedDate);
        const now = new Date();
        newMeetingTime.setHours(now.getHours() + 1);
        newMeetingTime.setMinutes(0);
        newMeetingTime.setSeconds(0);
        setMeetingTime(newMeetingTime);

        // Reset fields
        setTitle("");
        setDescription("");
        setMeetLink("");
      }
    }
  }, [isOpen, existingMeeting, selectedDate, isEditMode]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
      meetLink,
      meetingTime: meetingTime,
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {/* --- [NEW] Dynamic Title --- */}
                    {isEditMode ? "Edit Meeting" : "Add New Meeting"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Meeting Name
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5"
                      placeholder="e.g., Team Sync"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label
                      htmlFor="time"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Time
                    </label>
                    <CustomTimeInput
                      value={meetingTime}
                      onChange={setMeetingTime}
                    />
                  </div>

                  {/* Meet Link */}
                  <div>
                    <label
                      htmlFor="link"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Meeting Link (Optional)
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LinkIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        type="text"
                        id="link"
                        value={meetLink}
                        onChange={(e) => setMeetLink(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10"
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Meeting agenda, notes..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <StylishButton variant="secondary" onClick={onClose}>
                    Cancel
                  </StylishButton>
                  <StylishButton variant="primary" onClick={handleSave}>
                    {/* --- [NEW] Dynamic Button Text --- */}
                    {isEditMode ? "Save Changes" : "Save Meeting"}
                  </StylishButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
