"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Armchair,
  Timer,
  History,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Square,
  Settings2,
  X,
  RefreshCw,
} from "lucide-react";
import { usePomodoro } from "@/lib/db/usePomodoro";
import { format } from "date-fns";

// --- TYPES & CONFIG ---
type Mode = "work" | "short" | "long";

interface TimerSettings {
  work: number;
  short: number;
  long: number;
}

const MODE_CONFIG = {
  work: {
    label: "Deep Focus",
    color: "text-indigo-600",
    bg: "bg-indigo-500",
    gradient: "from-indigo-500 to-purple-600",
    icon: Brain,
  },
  short: {
    label: "Short Break",
    color: "text-teal-600",
    bg: "bg-teal-500",
    gradient: "from-teal-400 to-emerald-500",
    icon: Coffee,
  },
  long: {
    label: "Long Break",
    color: "text-blue-600",
    bg: "bg-blue-500",
    gradient: "from-blue-400 to-cyan-500",
    icon: Armchair,
  },
};

export default function PomodoroPage() {
  const { addSession, todaySessions } = usePomodoro();

  // --- STATE ---
  const [mode, setMode] = useState<Mode>("work");
  const [settings, setSettings] = useState<TimerSettings>({
    work: 25,
    short: 5,
    long: 15,
  });

  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- REFS (CRITICAL FIX FOR GLITCHES) ---
  // Stores the latest state so event listeners don't use "stale" data
  const modeRef = useRef(mode);
  const settingsRef = useRef(settings);
  const isActiveRef = useRef(isActive);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const initialTimeRef = useRef(settings.work * 60);

  // Sync Refs with State immediately
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // --- HELPER: Switch Mode ---
  const switchMode = useCallback(
    (newMode: Mode) => {
      if (isActiveRef.current) return; // Check ref instead of state
      setMode(newMode);

      // Update Ref immediately for logic safety
      modeRef.current = newMode;

      const newTime = settingsRef.current[newMode] * 60;
      setTimeLeft(newTime);
      initialTimeRef.current = newTime;

      localStorage.setItem("pomodoro_mode", newMode);
      localStorage.removeItem("pomodoro_target_time");
    },
    [] // No dependencies needed because we use refs
  );

  // --- HELPER: Restore Defaults ---
  const handleRestoreDefaults = () => {
    if (confirm("Reset all timer settings to default (25m / 5m / 15m)?")) {
      const defaultSettings = { work: 25, short: 5, long: 15 };
      setSettings(defaultSettings);
      settingsRef.current = defaultSettings; // Update ref
      localStorage.removeItem("pomodoro_settings");

      if (!isActiveRef.current) {
        const currentMode = modeRef.current;
        const newTime = defaultSettings[currentMode] * 60;
        setTimeLeft(newTime);
        initialTimeRef.current = newTime;
      }
    }
  };

  // --- HELPER: Timer Complete ---
  // [FIX] Uses Refs to ensure we save the CORRECT mode, even if tab switched
  const handleTimerComplete = useCallback(
    (shouldPlaySound = true) => {
      setIsActive(false);
      setTimeLeft(0);
      localStorage.removeItem("pomodoro_target_time");

      if (shouldPlaySound) {
        audioRef.current?.play().catch(() => {});
      }

      // Use REF for current mode to avoid "Deep Focus -> Long Break" glitch
      const currentMode = modeRef.current;
      const duration = settingsRef.current[currentMode];

      const sessionType =
        currentMode === "work"
          ? "work"
          : currentMode === "short"
          ? "short_break"
          : "long_break";

      addSession(duration, sessionType);

      // UI Logic for switching
      setTimeout(() => {
        if (currentMode === "work") {
          if (confirm("Focus complete! Start break?")) switchMode("short");
        } else {
          if (confirm("Break over! Start focus?")) switchMode("work");
        }
      }, 500);
    },
    [addSession, switchMode]
  );

  // --- 1. INITIALIZATION & TARGET TIME LOGIC ---
  useEffect(() => {
    audioRef.current = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    // Load Settings
    const savedSettings = localStorage.getItem("pomodoro_settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      settingsRef.current = parsed;
    }

    // [OFFLINE RECOVERY FIX]
    const savedTarget = localStorage.getItem("pomodoro_target_time");
    const savedMode = localStorage.getItem("pomodoro_mode") as Mode;

    if (savedTarget && savedMode) {
      const targetTime = parseInt(savedTarget, 10);
      const now = Date.now();
      const diff = Math.ceil((targetTime - now) / 1000);

      // Update state and ref to the saved mode immediately
      setMode(savedMode);
      modeRef.current = savedMode;

      // Ensure settings are up to date for calculations
      const currentSettings = savedSettings
        ? JSON.parse(savedSettings)
        : settings;

      if (diff > 0) {
        // RESUME
        setTimeLeft(diff);
        setIsActive(true);
        initialTimeRef.current = currentSettings[savedMode] * 60;
      } else {
        // FINISHED WHILE AWAY
        localStorage.removeItem("pomodoro_target_time");
        setTimeLeft(0);
        setIsActive(false);

        // Save the session using the Saved Mode (not default state)
        const duration = currentSettings[savedMode];
        const sessionType =
          savedMode === "work"
            ? "work"
            : savedMode === "short"
            ? "short_break"
            : "long_break";

        addSession(duration, sessionType);

        alert(
          `Your ${
            savedMode === "work" ? "Deep Focus" : "Break"
          } session ended while you were away.`
        );
      }
    } else {
      // FRESH START
      // Default initialization
      const initialDuration =
        (savedSettings ? JSON.parse(savedSettings) : settings).work * 60;
      setTimeLeft(initialDuration);
      initialTimeRef.current = initialDuration;
    }

    // [VISIBILITY SYNC FIX]
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        localStorage.getItem("pomodoro_target_time")
      ) {
        const target = parseInt(
          localStorage.getItem("pomodoro_target_time") || "0",
          10
        );
        const now = Date.now();
        const diff = Math.ceil((target - now) / 1000);

        if (diff <= 0) {
          // Only trigger complete if it was actually active
          if (isActiveRef.current) {
            handleTimerComplete(true);
          }
        } else {
          setTimeLeft(diff);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. TIMER LOOP ---
  useEffect(() => {
    if (isActive) {
      // Ensure target is set
      if (!localStorage.getItem("pomodoro_target_time")) {
        const targetTime = Date.now() + timeLeft * 1000;
        localStorage.setItem("pomodoro_target_time", targetTime.toString());
        localStorage.setItem("pomodoro_mode", mode);
      }

      timerInterval.current = setInterval(() => {
        const targetTime = parseInt(
          localStorage.getItem("pomodoro_target_time") || "0",
          10
        );
        const now = Date.now();
        const diff = Math.ceil((targetTime - now) / 1000);

        if (diff <= 0) {
          handleTimerComplete(true);
        } else {
          setTimeLeft(diff);
          document.title = `${Math.floor(diff / 60)}:${(diff % 60)
            .toString()
            .padStart(2, "0")} - ${MODE_CONFIG[mode].label}`;
        }
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (!isActive && timeLeft !== 0) {
        document.title = "TaskGlyph - Focus";
      }
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [isActive, mode, timeLeft, handleTimerComplete]);

  // --- HANDLERS ---
  const handleStopAndSave = () => {
    if (!isActive && timeLeft === initialTimeRef.current) return;
    setIsActive(false);
    localStorage.removeItem("pomodoro_target_time");

    const timeSpentSeconds = initialTimeRef.current - timeLeft;
    const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);

    if (timeSpentMinutes >= 1) {
      if (confirm(`Save ${timeSpentMinutes} minutes session?`)) {
        const sessionType =
          mode === "work"
            ? "work"
            : mode === "short"
            ? "short_break"
            : "long_break";
        addSession(timeSpentMinutes, sessionType);
      }
    }

    // Reset to current settings
    setTimeLeft(settingsRef.current[mode] * 60);
  };

  const toggleTimer = () => {
    if (!isActive) {
      // Starting
      const targetTime = Date.now() + timeLeft * 1000;
      localStorage.setItem("pomodoro_target_time", targetTime.toString());
      localStorage.setItem("pomodoro_mode", mode);
    } else {
      // Pausing
      localStorage.removeItem("pomodoro_target_time");
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    localStorage.removeItem("pomodoro_target_time");
    setTimeLeft(settings[mode] * 60);
  };

  const saveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    localStorage.setItem("pomodoro_settings", JSON.stringify(newSettings));
    if (!isActive) {
      setTimeLeft(newSettings[mode] * 60);
      initialTimeRef.current = newSettings[mode] * 60;
    }
    setIsSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- VISUALS (NO CHANGES TO DESIGN) ---
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const totalTime = settings[mode] * 60;
  const progress =
    totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * circumference : 0;

  const zenRadius = 240;
  const zenCircumference = 2 * Math.PI * zenRadius;
  const zenProgress =
    totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * zenCircumference : 0;

  const CurrentIcon = MODE_CONFIG[mode].icon;
  const sessionsCount =
    todaySessions?.filter((s) => s.type === "work").length || 0;
  const totalFocusMinutes =
    todaySessions
      ?.filter((s) => s.type === "work")
      .reduce((acc, curr) => acc + curr.durationMinutes, 0) || 0;

  // ZEN MODE RENDER
  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-[9999] w-screen h-screen bg-[#0F1115] flex flex-col items-center justify-center overflow-hidden text-white">
        <div className="absolute top-8 right-8 flex gap-4 z-50">
          <button
            onClick={() => setIsZenMode(false)}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
            title="Exit Zen Mode"
          >
            <Minimize2 size={24} />
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-12">
          <div
            className={`absolute inset-0 rounded-full blur-[100px] opacity-20 bg-gradient-to-tr ${
              MODE_CONFIG[mode].gradient
            } transition-opacity duration-1000 ${isActive ? "opacity-50" : ""}`}
          ></div>

          <div className="relative w-[600px] h-[600px]">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
              <circle
                cx="300"
                cy="300"
                r={zenRadius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="300"
                cy="300"
                r={zenRadius}
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={zenCircumference}
                strokeDashoffset={-zenProgress}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop
                    offset="0%"
                    stopColor={
                      mode === "work"
                        ? "#6366f1"
                        : mode === "short"
                        ? "#14b8a6"
                        : "#3b82f6"
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      mode === "work"
                        ? "#a855f7"
                        : mode === "short"
                        ? "#10b981"
                        : "#06b6d4"
                    }
                  />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-9xl font-bold tracking-tighter font-mono tabular-nums leading-none text-white">
                {formatTime(timeLeft)}
              </span>
              <div className="flex items-center gap-2 mt-8 px-5 py-2 rounded-full bg-white/5 text-white/40">
                <CurrentIcon size={18} />
                <span className="text-sm font-bold uppercase tracking-widest">
                  {isActive ? "Focusing" : "Paused"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-16">
          <button
            onClick={resetTimer}
            className="text-white/20 hover:text-white transition-colors p-4 rounded-full hover:bg-white/5"
            title="Reset"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={toggleTimer}
            className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all bg-gradient-to-tr ${MODE_CONFIG[mode].gradient}`}
          >
            {isActive ? (
              <Pause size={40} fill="currentColor" />
            ) : (
              <Play size={40} fill="currentColor" className="ml-1" />
            )}
          </button>

          <div className="w-14 flex justify-center">
            {timeLeft !== settings[mode] * 60 && (
              <button
                onClick={handleStopAndSave}
                className="text-red-400/40 hover:text-red-400 transition-colors p-4 rounded-full hover:bg-red-500/10"
                title="Finish Early"
              >
                <Square size={24} fill="currentColor" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER NORMAL MODE ---
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#F3F4F6] flex items-center justify-center">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob ${MODE_CONFIG[mode].bg}`}
        ></div>
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-2000 ${MODE_CONFIG[mode].bg}`}
        ></div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 z-10 h-[85vh] max-h-[850px]">
        {/* LEFT: TIMER CARD */}
        <motion.div
          layout
          className="lg:col-span-2 w-full h-full bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/60 p-8 flex flex-col items-center justify-between relative"
        >
          {/* Header */}
          <div className="flex justify-between w-full px-4">
            <div className="flex bg-gray-100/80 p-1 rounded-2xl">
              {(
                Object.keys(MODE_CONFIG) as Array<keyof typeof MODE_CONFIG>
              ).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  disabled={isActive}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    mode === m
                      ? "bg-white shadow-sm text-black"
                      : `text-gray-400 hover:text-gray-600 ${
                          isActive ? "opacity-50 cursor-not-allowed" : ""
                        }`
                  }`}
                >
                  <span className={`${mode === m ? MODE_CONFIG[m].color : ""}`}>
                    {MODE_CONFIG[m].label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRestoreDefaults}
                className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                title="Restore Default Settings"
              >
                <RefreshCw size={20} />
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                title="Settings"
              >
                <Settings2 size={20} />
              </button>
              <button
                onClick={() => setIsZenMode(true)}
                className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                title="Zen Mode"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>

          {/* TIMER CIRCLE */}
          <div className="relative flex items-center justify-center flex-1">
            <div
              className={`absolute inset-0 rounded-full blur-[60px] opacity-30 bg-gradient-to-tr ${
                MODE_CONFIG[mode].gradient
              } transition-opacity duration-700 ${
                isActive ? "opacity-60" : ""
              }`}
            ></div>

            <div className="relative w-[450px] h-[450px] xl:w-[500px] xl:h-[500px]">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-100"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={-progress}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        mode === "work"
                          ? "#6366f1"
                          : mode === "short"
                          ? "#14b8a6"
                          : "#3b82f6"
                      }
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        mode === "work"
                          ? "#a855f7"
                          : mode === "short"
                          ? "#10b981"
                          : "#06b6d4"
                      }
                    />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-8xl font-bold tracking-tighter font-mono tabular-nums leading-none text-gray-900">
                  {formatTime(timeLeft)}
                </span>
                <div className="flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full bg-gray-100 text-gray-500">
                  <CurrentIcon size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {isActive ? "Focusing" : "Paused"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col items-center gap-4 mb-4 w-full">
            <div className="flex items-center justify-center gap-12">
              <button
                onClick={resetTimer}
                className="group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-300 shadow-sm hover:shadow-md bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                title="Reset"
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={toggleTimer}
                className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all bg-gradient-to-tr ${MODE_CONFIG[mode].gradient}`}
              >
                {isActive ? (
                  <Pause size={36} fill="currentColor" />
                ) : (
                  <Play size={36} fill="currentColor" className="ml-1" />
                )}
              </button>
              <div className="w-16 h-16 flex items-center justify-center">
                {timeLeft !== settings[mode] * 60 ? (
                  <button
                    onClick={handleStopAndSave}
                    className="group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-300 shadow-sm hover:shadow-md bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                    title="Finish Early"
                  >
                    <Square size={24} fill="currentColor" />
                  </button>
                ) : (
                  <div className="w-16 h-16" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: STATS */}
        <div className="flex flex-col gap-6 h-full min-h-0">
          <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-lg border border-white/50 p-8 flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Timer size={20} className="text-indigo-500" /> Today&apos;s
              Progress
            </h3>
            <div className="space-y-5">
              <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-4xl font-bold text-indigo-600">
                    {sessionsCount}
                  </span>
                  <span className="text-xs font-bold text-indigo-400 uppercase mb-1">
                    Sessions
                  </span>
                </div>
                <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(sessionsCount * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-teal-50/50 p-5 rounded-3xl border border-teal-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-4xl font-bold text-teal-600">
                    {(totalFocusMinutes / 60).toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-teal-400 uppercase mb-1">
                    Hours
                  </span>
                </div>
                <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{
                      width: `${Math.min((totalFocusMinutes / 60) * 20, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Box */}
          <div className="flex-1 min-h-0 bg-white/80 backdrop-blur-xl rounded-[40px] shadow-lg border border-white/50 p-6 flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 flex-shrink-0">
              <History size={20} className="text-gray-400" /> Activity
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {todaySessions && todaySessions.length > 0 ? (
                [...todaySessions].reverse().map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all flex-shrink-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          session.type === "work"
                            ? "bg-indigo-100 text-indigo-600"
                            : session.type === "long_break"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-teal-100 text-teal-600"
                        }`}
                      >
                        {session.type === "work" ? (
                          <CheckCircle2 size={16} />
                        ) : session.type === "long_break" ? (
                          <Armchair size={16} />
                        ) : (
                          <Coffee size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">
                          {session.type === "work"
                            ? "Deep Focus"
                            : session.type === "short_break"
                            ? "Short Break"
                            : session.type === "long_break"
                            ? "Long Break"
                            : "Break"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {format(new Date(session.completedAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                      {session.durationMinutes}m
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 text-sm">
                  <p>No sessions yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-96 p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800">
                  Timer Settings
                </h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="space-y-6">
                {(["work", "short", "long"] as const).map((settingMode) => (
                  <div key={settingMode}>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      {MODE_CONFIG[settingMode].label} (min)
                    </label>
                    <input
                      type="number"
                      value={settings[settingMode]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [settingMode]: Number(e.target.value),
                        })
                      }
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <button
                  onClick={() => saveSettings(settings)}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
