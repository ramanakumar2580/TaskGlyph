// src/components/CustomTimeInput.tsx
"use client";

import { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface CustomTimeInputProps {
  value: Date;
  onChange: (newDate: Date) => void;
}

export default function CustomTimeInput({
  value,
  onChange,
}: CustomTimeInputProps) {
  const [is24Hour, setIs24Hour] = useState(false);

  // --- Get values from the date prop ---
  let hours = value.getHours();
  const minutes = value.getMinutes();
  let meridiem = "AM";

  if (!is24Hour) {
    meridiem = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12; // 0 o'clock (midnight) is 12 AM
  }

  // --- Handlers for changing time ---
  const handleChange = (
    newHours: number,
    newMinutes: number,
    newMeridiem?: "AM" | "PM"
  ) => {
    const newDate = new Date(value.getTime());

    if (is24Hour) {
      newDate.setHours(newHours);
    } else {
      let h24 = newHours;
      if (newMeridiem === "PM" && h24 < 12) {
        h24 += 12;
      }
      if (newMeridiem === "AM" && h24 === 12) {
        h24 = 0; // Midnight case
      }
      newDate.setHours(h24);
    }

    newDate.setMinutes(newMinutes);
    onChange(newDate);
  };

  const pad = (num: number) => num.toString().padStart(2, "0");

  const incrementHour = () => {
    const newHours = (value.getHours() + 1) % 24;
    handleChange(newHours, minutes);
  };
  const decrementHour = () => {
    const newHours = (value.getHours() - 1 + 24) % 24;
    handleChange(newHours, minutes);
  };

  const incrementMinute = () => {
    const newMinutes = (value.getMinutes() + 1) % 60;
    let newHours = value.getHours();
    if (newMinutes === 0) {
      // Rolled over
      newHours = (newHours + 1) % 24;
    }
    handleChange(newHours, newMinutes);
  };
  const decrementMinute = () => {
    const newMinutes = (value.getMinutes() - 1 + 60) % 60;
    let newHours = value.getHours();
    if (newMinutes === 59) {
      // Rolled back
      newHours = (newHours - 1 + 24) % 24;
    }
    handleChange(newHours, newMinutes);
  };

  const toggleMeridiem = () => {
    const currentHours = value.getHours();
    const newHours = (currentHours + 12) % 24; // Flip AM/PM
    handleChange(newHours, minutes);
  };

  const handleHourTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHours = parseInt(e.target.value) || 0;
    if (is24Hour) {
      if (newHours > 23) newHours = 23;
    } else {
      if (newHours > 12) newHours = 12;
    }
    if (newHours < 0) newHours = 0;
    handleChange(newHours, minutes, meridiem as "AM" | "PM");
  };

  const handleMinuteTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinutes = parseInt(e.target.value) || 0;
    if (newMinutes > 59) newMinutes = 59;
    if (newMinutes < 0) newMinutes = 0;
    handleChange(hours, newMinutes, meridiem as "AM" | "PM");
  };

  return (
    <div className="w-full">
      {/* 1. 12/24hr format toggle */}
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={() => setIs24Hour(!is24Hour)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {is24Hour ? "Switch to 12-Hour" : "Switch to 24-Hour"}
        </button>
      </div>

      {/* 2. The Time Input Fields */}
      <div className="flex items-center gap-2">
        {/* Hour Input */}
        <div className="flex-1 flex items-center border border-gray-300 rounded-md shadow-sm">
          <input
            type="text"
            inputMode="numeric"
            value={is24Hour ? pad(hours) : hours}
            onChange={handleHourTextChange}
            className="w-full text-center text-lg py-2 border-none rounded-l-md focus:ring-0"
          />
          <div className="flex flex-col border-l border-gray-300">
            <button
              type="button"
              onClick={incrementHour}
              className="p-1 text-gray-500 hover:text-black border-b border-gray-300"
            >
              <ChevronUpIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={decrementHour}
              className="p-1 text-gray-500 hover:text-black"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <span className="font-bold text-lg text-gray-500">:</span>

        {/* Minute Input */}
        <div className="flex-1 flex items-center border border-gray-300 rounded-md shadow-sm">
          <input
            type="text"
            inputMode="numeric"
            value={pad(minutes)}
            onChange={handleMinuteTextChange}
            className="w-full text-center text-lg py-2 border-none rounded-l-md focus:ring-0"
          />
          <div className="flex flex-col border-l border-gray-300">
            <button
              type="button"
              onClick={incrementMinute}
              className="p-1 text-gray-500 hover:text-black border-b border-gray-300"
            >
              <ChevronUpIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={decrementMinute}
              className="p-1 text-gray-500 hover:text-black"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. AM/PM Changer */}
        {!is24Hour && (
          <button
            type="button"
            onClick={toggleMeridiem}
            className="px-4 py-2 text-lg font-medium bg-gray-100 text-gray-800 rounded-md shadow-sm border border-gray-300 hover:bg-gray-200"
          >
            {meridiem}
          </button>
        )}
      </div>
    </div>
  );
}
