"use client";

import { useState, useEffect, useRef } from "react";
import { usePomodoro } from "@/lib/db/usePomodoro";
import { PomodoroSession } from "@/lib/db/clientDb";
import { format } from "date-fns";

// LocalStorage keys for persistence
const STORAGE_KEY = {
  END_TIME: "pomodoro_end_time",
  IS_RUNNING: "pomodoro_is_running",
  MODE: "pomodoro_mode",
  STARTED_DURATION: "pomodoro_started_duration",
};

export default function PomodoroPage() {
  const { sessions, logSession } = usePomodoro();

  // State for configurable times
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRunLoadEffect = useRef(false);

  // Lock to prevent duplicate saves
  const [isLogging, setIsLogging] = useState(false);

  // --- Helper Functions ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Helper to clear all timer storage
  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY.END_TIME);
    localStorage.removeItem(STORAGE_KEY.IS_RUNNING);
    localStorage.removeItem(STORAGE_KEY.MODE);
    localStorage.removeItem(STORAGE_KEY.STARTED_DURATION);
  };

  // --- Timer Effects ---

  // Effect handles "catching up" when you switch tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab is active, let's check the timer
        const storedEndTime = localStorage.getItem(STORAGE_KEY.END_TIME);
        const storedIsRunning =
          localStorage.getItem(STORAGE_KEY.IS_RUNNING) === "true";
        const storedMode = (localStorage.getItem(STORAGE_KEY.MODE) ||
          "work") as "work" | "break";
        const storedDuration = parseInt(
          localStorage.getItem(STORAGE_KEY.STARTED_DURATION) || "0"
        );

        if (storedIsRunning && storedEndTime) {
          const remainingTime = Math.round(
            (parseInt(storedEndTime) - Date.now()) / 1000
          );

          if (remainingTime > 0) {
            // Timer is still running, catch up
            setTimeLeft(remainingTime);
          } else {
            // Timer finished while tab was in background
            setIsRunning(false);
            clearStorage();
            if (!isLogging) {
              setIsLogging(true);
              if (storedMode === "work") {
                logSession(storedDuration, "work").then(() =>
                  setIsLogging(false)
                );
                alert("Focus session finished while you were away!");
              } else {
                logSession(storedDuration, "break").then(() =>
                  setIsLogging(false)
                );
                alert("Break finished while you were away!");
              }
            }
            setMode("work");
            setTimeLeft(workMinutes * 60);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLogging, logSession, workMinutes]);

  // Effect runs ONCE on page load to restore the timer
  useEffect(() => {
    if (hasRunLoadEffect.current) return;
    hasRunLoadEffect.current = true;

    const storedEndTime = localStorage.getItem(STORAGE_KEY.END_TIME);
    const storedIsRunning =
      localStorage.getItem(STORAGE_KEY.IS_RUNNING) === "true";
    const storedMode = (localStorage.getItem(STORAGE_KEY.MODE) || "work") as
      | "work"
      | "break";
    const storedDuration = parseInt(
      localStorage.getItem(STORAGE_KEY.STARTED_DURATION) || "0"
    );

    if (storedIsRunning && storedEndTime) {
      const remainingTime = Math.round(
        (parseInt(storedEndTime) - Date.now()) / 1000
      );

      if (remainingTime > 0) {
        // Timer is still running
        setMode(storedMode);
        setTimeLeft(remainingTime);
        setIsRunning(true);
      } else {
        // Timer finished while user was away
        setIsRunning(false);
        clearStorage();
        if (!isLogging) {
          setIsLogging(true);
          if (storedMode === "work") {
            logSession(storedDuration, "work").then(() => setIsLogging(false));
            alert("Focus session finished while you were away!");
          } else {
            logSession(storedDuration, "break").then(() => setIsLogging(false));
            alert("Break finished while you were away!");
          }
        }
        setMode("work");
        setTimeLeft(workMinutes * 60);
      }
    }
  }, [logSession, workMinutes, isLogging]);

  // Effect is just the countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer finished
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearStorage();

      if (!isLogging) {
        setIsLogging(true);
        if (mode === "work") {
          const duration = parseInt(
            localStorage.getItem(STORAGE_KEY.STARTED_DURATION) ||
              workMinutes.toString()
          );
          logSession(duration, "work").then(() => setIsLogging(false));
          alert("Focus session complete! Click 'Break' to start a break.");
        } else {
          const duration = parseInt(
            localStorage.getItem(STORAGE_KEY.STARTED_DURATION) ||
              breakMinutes.toString()
          );
          logSession(duration, "break").then(() => setIsLogging(false));
          alert("Break's over! Click 'Focus' to start a new session.");
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isRunning,
    timeLeft,
    mode,
    logSession,
    workMinutes,
    breakMinutes,
    isLogging,
  ]);

  // --- Button Handlers ---

  const handleStartPause = () => {
    if (isRunning) {
      // Pausing
      setIsRunning(false);
      localStorage.setItem(STORAGE_KEY.IS_RUNNING, "false");
    } else {
      // Starting
      setIsRunning(true);
      const durationMinutes = mode === "work" ? workMinutes : breakMinutes;
      // Use the *current* timeLeft, not the full time
      const endTime = Date.now() + timeLeft * 1000;

      localStorage.setItem(STORAGE_KEY.END_TIME, endTime.toString());
      localStorage.setItem(STORAGE_KEY.IS_RUNNING, "true");
      localStorage.setItem(STORAGE_KEY.MODE, mode);
      localStorage.setItem(
        STORAGE_KEY.STARTED_DURATION,
        durationMinutes.toString()
      );
    }
  };

  const handleStopAndSave = () => {
    if (!confirm("Stop the timer and save this session?")) {
      return;
    }

    setIsRunning(false);
    const storedDuration = parseInt(
      localStorage.getItem(STORAGE_KEY.STARTED_DURATION) || "0"
    );

    if (mode === "work" && storedDuration > 0) {
      const elapsedSeconds = storedDuration * 60 - timeLeft;
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);

      if (elapsedMinutes > 0) {
        if (!isLogging) {
          setIsLogging(true);
          logSession(elapsedMinutes, "work").then(() => setIsLogging(false));
          alert(`Session saved! You completed ${elapsedMinutes} minutes.`);
        }
      } else {
        alert("Timer reset. No time logged.");
      }
    }
    clearStorage();
    setMode("work");
    setTimeLeft(workMinutes * 60);
  };

  // ✅ --- THE FIX: Updated the check for an active session ---
  const handleModeSwitch = (newMode: "work" | "break") => {
    // Check if trying to switch to a different mode
    if (newMode !== mode) {
      // Check if the timer is *actually* active (running or paused mid-session)
      const fullCurrentTime =
        (mode === "work" ? workMinutes : breakMinutes) * 60;
      const isActuallyActive =
        isRunning || (!isRunning && timeLeft > 0 && timeLeft < fullCurrentTime);

      if (isActuallyActive) {
        alert(
          `You are in an active ${mode} session. Please stop or finish it before switching to ${newMode}.`
        );
        return; // Prevent switching
      }
    }

    // Allow switching if session is finished (timeLeft === 0) or not started
    setIsRunning(false);
    clearStorage();
    setMode(newMode);
    setTimeLeft((newMode === "work" ? workMinutes : breakMinutes) * 60);
  };

  const handleWorkMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    if (minutes > 0) {
      setWorkMinutes(minutes);
      if (mode === "work" && !isRunning) {
        setTimeLeft(minutes * 60);
      }
    }
  };

  const handleBreakMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    if (minutes > 0) {
      setBreakMinutes(minutes);
      if (mode === "break" && !isRunning) {
        setTimeLeft(minutes * 60);
      }
    }
  };

  // --- History Logic (Unchanged) ---
  const groupedSessions = sessions.reduce((acc, session) => {
    const day = format(new Date(session.completedAt), "MMMM d, yyyy");
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(session);
    return acc;
  }, {} as Record<string, PomodoroSession[]>);
  const sortedDays = Object.keys(groupedSessions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Pomodoro Timer
        </h1>

        {/* Mode Switcher Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex gap-2">
          <button
            onClick={() => handleModeSwitch("work")}
            className={`flex-1 p-2 rounded ${
              mode === "work"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => handleModeSwitch("break")}
            className={`flex-1 p-2 rounded ${
              mode === "break"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 text-center">
          <div className="text-8xl font-mono font-bold text-gray-900 mb-6">
            {formatTime(timeLeft)}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleStartPause}
              className={`px-6 py-2 rounded text-white ${
                isRunning
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {/* Change button text based on whether timer is finished */}
              {isRunning ? "Pause" : timeLeft === 0 ? "Start New" : "Start"}
            </button>

            {timeLeft > 0 && timeLeft < workMinutes * 60 && mode === "work" && (
              <button
                onClick={handleStopAndSave}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Stop & Save
              </button>
            )}
          </div>
        </div>

        {/* Time Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Focus (mins)
              </label>
              <input
                type="number"
                value={workMinutes}
                onChange={handleWorkMinutesChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                disabled={isRunning}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break (mins)
              </label>
              <input
                type="number"
                value={breakMinutes}
                onChange={handleBreakMinutesChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
                disabled={isRunning}
              />
            </div>
          </div>
        </div>

        {/* Session History */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Completed Sessions
          </h2>
          {sortedDays.length > 0 ? (
            <div className="space-y-6">
              {sortedDays.map((day) => {
                const daySessions = groupedSessions[day];
                const totalMinutes = daySessions.reduce(
                  (sum, s) => sum + s.durationMinutes,
                  0
                );
                return (
                  <div
                    key={day}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">{day}</h3>
                      <p className="text-sm text-gray-600">
                        {daySessions.length} sessions
                        <span className="mx-2">|</span>
                        {totalMinutes} minutes total
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {daySessions
                        .sort((a, b) => b.completedAt - a.completedAt)
                        .map((session) => (
                          <li
                            key={session.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span
                              className={
                                session.type === "break"
                                  ? "text-green-700"
                                  : "text-gray-800"
                              }
                            >
                              {session.durationMinutes} minute {session.type}{" "}
                              session
                            </span>
                            <span className="text-gray-500">
                              {format(new Date(session.completedAt), "h:mm a")}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-8">
              No sessions yet. Start a timer!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
