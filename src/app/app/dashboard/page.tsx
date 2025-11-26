"use client";

import React, { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/db/clientDb";
import AIInsightsCard from "@/components/dashboard/AIInsightsCard";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  Tooltip,
  Line,
  ComposedChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
} from "recharts";
import {
  Activity,
  Zap,
  TrendingUp,
  Target,
  Leaf,
  Flame,
  CheckSquare,
  Info,
  Award,
  Briefcase,
  Sunrise,
  Layers,
  HelpCircle,
  Plus,
  Send,
  Moon,
} from "lucide-react";
import {
  format,
  subDays,
  isSameDay,
  getHours,
  differenceInDays,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { motion } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

// --- COLORS ---
const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6"];
const WB_COLORS = ["#4f46e5", "#2dd4bf"];

// --- TYPES ---
type HeatmapView = "daily" | "weekly" | "monthly";

export default function DashboardPage() {
  const [heatmapView, setHeatmapView] = useState<HeatmapView>("daily");
  const [quickTask, setQuickTask] = useState("");

  // --- 1. DATA FETCHING ---
  const rawTasks = useLiveQuery(() => db.tasks.toArray());
  const tasks = useMemo(() => rawTasks ?? [], [rawTasks]);

  const rawSessions = useLiveQuery(() => db.pomodoroSessions.toArray());
  const sessions = useMemo(() => rawSessions ?? [], [rawSessions]);

  const rawDiaryEntries = useLiveQuery(() => db.diaryEntries.toArray());
  const diaryEntries = useMemo(() => rawDiaryEntries ?? [], [rawDiaryEntries]);

  const rawNotes = useLiveQuery(() => db.notes.toArray());
  const notes = useMemo(() => rawNotes ?? [], [rawNotes]);

  const rawProjects = useLiveQuery(() => db.projects.toArray());
  const projects = useMemo(() => rawProjects ?? [], [rawProjects]);

  // --- 2. DATA PROCESSING ---

  // A. Dynamic Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // B. Real Streak Calculation
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = subDays(today, i);
      let hasActivity = false;

      if (
        tasks.some(
          (t) =>
            t.completed && t.updatedAt && isSameDay(new Date(t.updatedAt), d)
        )
      )
        hasActivity = true;
      else if (
        sessions.some(
          (s) => s.completedAt && isSameDay(new Date(s.completedAt), d)
        )
      )
        hasActivity = true;
      else if (
        diaryEntries.some(
          (e) => e.createdAt && isSameDay(new Date(e.createdAt), d)
        )
      )
        hasActivity = true;

      if (hasActivity) {
        streak++;
      } else if (i === 0 && !hasActivity) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  }, [tasks, sessions, diaryEntries]);

  // C. Flow State Score
  const flowScore = useMemo(() => {
    const today = new Date();
    const tasksToday = tasks.filter(
      (t) =>
        t.completed && t.updatedAt && isSameDay(new Date(t.updatedAt), today)
    ).length;
    const focusMinutesToday = sessions
      .filter(
        (s) =>
          s.completedAt &&
          isSameDay(new Date(s.completedAt), today) &&
          s.type === "work"
      )
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const focusHours = focusMinutesToday / 60;
    const hasDiary = diaryEntries.some(
      (d) => d.createdAt && isSameDay(new Date(d.createdAt), today)
    );
    const overdueCount = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < Date.now()
    ).length;

    let score =
      tasksToday * 10 +
      focusHours * 10 +
      (hasDiary ? 20 : 0) -
      overdueCount * 5;
    if (score > 100) score = 100;
    if (score < 0) score = 0;
    return Math.round(score);
  }, [tasks, sessions, diaryEntries]);

  // D. Mood vs Focus
  const moodVsFocusData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "EEE");
      const focusMins = sessions
        .filter(
          (s) =>
            s.completedAt &&
            isSameDay(new Date(s.completedAt), d) &&
            s.type === "work"
        )
        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const entries = diaryEntries.filter(
        (e) => e.createdAt && isSameDay(new Date(e.createdAt), d)
      );
      const avgEnergy = entries.length
        ? entries.reduce((acc, curr) => acc + (curr.energy || 5), 0) /
          entries.length
        : 0;
      data.push({ name: dateStr, focus: focusMins, energy: avgEnergy });
    }
    return data;
  }, [sessions, diaryEntries]);

  // E. Peak Performance
  const peakData = useMemo(() => {
    const buckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    sessions.forEach((s) => {
      if (!s.completedAt) return;
      const hour = getHours(new Date(s.completedAt));
      if (hour >= 5 && hour < 12) buckets.Morning += s.durationMinutes;
      else if (hour >= 12 && hour < 17) buckets.Afternoon += s.durationMinutes;
      else if (hour >= 17 && hour < 21) buckets.Evening += s.durationMinutes;
      else buckets.Night += s.durationMinutes;
    });
    return [
      { subject: "Morning", A: buckets.Morning, fullMark: 150 },
      { subject: "Afternoon", A: buckets.Afternoon, fullMark: 150 },
      { subject: "Evening", A: buckets.Evening, fullMark: 150 },
      { subject: "Night", A: buckets.Night, fullMark: 150 },
    ];
  }, [sessions]);

  // F. Task Health
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < Date.now()
    ).length;
    const dueToday = tasks.filter(
      (t) =>
        !t.completed && t.dueDate && isSameDay(new Date(t.dueDate), new Date())
    ).length;
    return { total, completed, overdue, dueToday };
  }, [tasks]);

  // G. Knowledge Graph
  const knowledgeData = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    notes.forEach((note) => {
      if (note.tags)
        note.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    return Object.entries(tagCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [notes]);

  // H. Echo Timeline
  const timelineData = useMemo(() => {
    const combined = [
      ...tasks
        .filter((t) => t.completed && t.updatedAt)
        .map((t) => ({
          type: "task",
          title: `Completed "${t.title}"`,
          time: t.updatedAt,
        })),
      ...sessions
        .filter((s) => s.completedAt)
        .map((s) => ({
          type: "pomodoro",
          title: `${s.durationMinutes}m Focus Session`,
          time: s.completedAt,
        })),
      ...diaryEntries
        .filter((d) => d.createdAt)
        .map((d) => ({
          type: "diary",
          title: `Diary Log: ${d.mood || "Journal"}`,
          time: d.createdAt,
        })),
      ...notes
        .filter((n) => n.createdAt)
        .map((n) => ({
          type: "note",
          title: `Created note "${n.title}"`,
          time: n.createdAt,
        })),
    ];
    const validItems = combined.filter(
      (item) => item.time && !isNaN(new Date(item.time).getTime())
    );
    return validItems
      .sort((a, b) => (b.time as number) - (a.time as number))
      .slice(0, 10);
  }, [tasks, sessions, diaryEntries, notes]);

  // I. Consistency Heatmap
  const heatmapData = useMemo(() => {
    const today = new Date();
    const data = [];

    const calculateScore = (start: Date, end: Date) => {
      const taskCount = tasks.filter(
        (t) =>
          t.completed &&
          t.updatedAt &&
          isWithinInterval(new Date(t.updatedAt), { start, end })
      ).length;
      const sessionCount = sessions.filter(
        (s) =>
          s.completedAt &&
          isWithinInterval(new Date(s.completedAt), { start, end })
      ).length;
      const diaryCount = diaryEntries.filter(
        (e) =>
          e.createdAt && isWithinInterval(new Date(e.createdAt), { start, end })
      ).length;

      const total = taskCount + sessionCount + diaryCount;

      if (heatmapView === "daily") {
        if (total > 5) return 3;
        if (total > 2) return 2;
        if (total > 0) return 1;
      } else {
        if (total > 15) return 3;
        if (total > 5) return 2;
        if (total > 0) return 1;
      }
      return 0;
    };

    if (heatmapView === "daily") {
      for (let i = 0; i < 60; i++) {
        const d = subDays(today, 59 - i);
        const start = new Date(d.setHours(0, 0, 0, 0));
        const end = new Date(d.setHours(23, 59, 59, 999));
        data.push({
          date: d,
          score: calculateScore(start, end),
          label: format(d, "MMM dd"),
        });
      }
    } else if (heatmapView === "weekly") {
      for (let i = 0; i < 12; i++) {
        const weekEnd = subDays(today, (11 - i) * 7);
        const start = startOfWeek(weekEnd);
        const end = endOfWeek(weekEnd);
        data.push({
          date: start,
          score: calculateScore(start, end),
          label: `W${format(start, "w")}`,
        });
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const monthDate = subMonths(today, 11 - i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        data.push({
          date: start,
          score: calculateScore(start, end),
          label: format(start, "MMM"),
        });
      }
    }
    return data;
  }, [tasks, sessions, diaryEntries, heatmapView]);

  // J. Priority Matrix (Eisenhower)
  const eisenhowerData = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    const now = Date.now();
    return {
      do: pending.filter(
        (t) =>
          t.priority === "high" &&
          t.dueDate &&
          differenceInDays(t.dueDate, now) <= 1
      ),
      schedule: pending.filter(
        (t) =>
          t.priority === "high" &&
          (!t.dueDate || differenceInDays(t.dueDate, now) > 1)
      ),
      delegate: pending.filter(
        (t) =>
          t.priority === "medium" &&
          t.dueDate &&
          differenceInDays(t.dueDate, now) <= 1
      ),
      delete: pending.filter(
        (t) => t.priority === "low" || t.priority === "none"
      ),
    };
  }, [tasks]);

  // K. Project Velocity
  const projectStats = useMemo(() => {
    return projects.slice(0, 6).map((p) => {
      const projectTasks = tasks.filter((t) => t.projectId === p.id);
      const completed = projectTasks.filter((t) => t.completed).length;
      const total = projectTasks.length;
      const percentage =
        total === 0 ? 0 : Math.round((completed / total) * 100);
      return { name: p.name, percentage, color: p.accentColor || "#6366f1" };
    });
  }, [projects, tasks]);

  // L. Work/Break Ratio
  const workBreakData = useMemo(() => {
    const workMins = sessions
      .filter((s) => s.type === "work")
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    const breakMins = sessions
      .filter((s) => s.type !== "work")
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    if (workMins === 0 && breakMins === 0)
      return [{ name: "No Data", value: 1 }];
    return [
      { name: "Work", value: workMins },
      { name: "Break", value: breakMins },
    ];
  }, [sessions]);

  // M. Daily Achievements
  const dailyBadges = useMemo(() => {
    const earned = [];
    const today = new Date();

    const tasksToday = tasks.filter(
      (t) =>
        t.completed && t.updatedAt && isSameDay(new Date(t.updatedAt), today)
    ).length;
    if (tasksToday >= 5)
      earned.push({
        label: "Daily Grinder",
        icon: CheckSquare,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        desc: "5+ Tasks Today",
      });

    const focusToday = sessions
      .filter(
        (s) =>
          s.completedAt &&
          isSameDay(new Date(s.completedAt), today) &&
          s.type === "work"
      )
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    if (focusToday >= 120)
      earned.push({
        label: "Focus Monk",
        icon: Zap,
        color: "text-purple-500",
        bg: "bg-purple-50",
        desc: "2h Focus Today",
      });

    const earlyFinish = tasks.some(
      (t) =>
        t.completed &&
        t.updatedAt &&
        isSameDay(new Date(t.updatedAt), today) &&
        getHours(new Date(t.updatedAt)) < 9
    );
    if (earlyFinish)
      earned.push({
        label: "Early Bird",
        icon: Sunrise,
        color: "text-amber-500",
        bg: "bg-amber-50",
        desc: "Task before 9AM",
      });

    const lateFinish = tasks.some(
      (t) =>
        t.completed &&
        t.updatedAt &&
        isSameDay(new Date(t.updatedAt), today) &&
        getHours(new Date(t.updatedAt)) > 22
    );
    if (lateFinish)
      earned.push({
        label: "Night Owl",
        icon: Moon,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        desc: "Task after 10PM",
      });

    return earned;
  }, [tasks, sessions]);

  // N. Upcoming Tasks
  const upcomingTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((t) => !t.completed && t.dueDate && t.dueDate > now)
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
      .slice(0, 10);
  }, [tasks]);

  // O. Quick Add
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.trim()) return;
    try {
      await db.tasks.add({
        id: crypto.randomUUID(),
        title: quickTask,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        priority: "none",
        tags: [],
        recurringSchedule: "none",
        projectId: null,
        parentId: null,
        notes: null,
        dueDate: null,
        reminderAt: null,
        meetLink: null,
        reminder_30_sent: false,
        reminder_20_sent: false,
        reminder_10_sent: false,
      });
      setQuickTask("");
    } catch (err) {
      console.error("Failed to add quick task", err);
    }
  };

  return (
    <div className="min-h-screen relative p-6 pb-20 overflow-y-auto text-slate-800">
      {/* 🌌 BACKGROUND */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#F3F4F6]">
        <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">
            {greeting}, Ramana.
          </h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <Activity size={16} className="text-indigo-500" /> Your Command
            Center is online.
          </p>
        </div>
        <div className="flex items-center gap-6">
          {dailyBadges.length > 0 && (
            <div className="hidden lg:flex bg-white/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/50 shadow-sm items-center gap-2">
              <Award size={16} className="text-yellow-500" />
              <span className="text-xs font-bold text-gray-600">
                {dailyBadges.length} Badges
              </span>
            </div>
          )}
          <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full text-orange-600">
              <Flame size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Streak
              </p>
              <p className="text-xl font-black text-gray-800">
                {currentStreak} Days
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Productivity
            </p>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span
                className={`w-3 h-3 rounded-full ${
                  flowScore > 70
                    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                    : flowScore > 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></span>
              <span className="font-bold text-gray-800">
                {flowScore > 70
                  ? "Flow State"
                  : flowScore > 40
                  ? "Balanced"
                  : "Needs Focus"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* BENTO GRID - 4 COLUMNS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[180px]"
      >
        {/* ✅ 1. AI INSIGHTS CARD (UPDATED: row-span-4 to increase height) */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 md:col-span-2 lg:col-span-2 row-span-4"
        >
          <AIInsightsCard />
        </motion.div>

        {/* ✅ RIGHT COLUMN - TOP ROW */}

        {/* Daily Flow */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
        >
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-help group/info">
            <HelpCircle size={16} className="text-gray-400" />
            <div className="absolute right-0 top-6 w-40 bg-black/80 text-white text-[10px] p-2 rounded-lg backdrop-blur-md hidden group-hover/info:block z-30">
              Score based on completed tasks, total focus time, and daily diary
              entries.
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 z-10">
            Daily Flow
          </h3>
          <div className="relative z-10">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#f3f4f6"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="url(#scoreGradient)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * flowScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient
                  id="scoreGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={flowScore < 50 ? "#f87171" : "#818cf8"}
                  />
                  <stop
                    offset="100%"
                    stopColor={flowScore < 50 ? "#fbbf24" : "#c084fc"}
                  />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-gray-800 tracking-tighter">
                {flowScore}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Daily Achievements */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col"
        >
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Daily Achievements
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {dailyBadges.length > 0 ? (
              dailyBadges.map((badge, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-xl ${badge.bg}`}
                >
                  <badge.icon size={18} className={badge.color} />
                  <div>
                    <p
                      className={`text-xs font-bold ${badge.color.replace(
                        "text-",
                        "text-opacity-80 "
                      )}`}
                    >
                      {badge.label}
                    </p>
                    <p className="text-[8px] text-gray-500">{badge.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-300 h-full">
                <Award size={24} className="mb-2 opacity-50" />
                <span className="text-[10px]">Start working!</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ✅ RIGHT COLUMN - MIDDLE ROW: Project Velocity */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col"
        >
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Briefcase size={20} className="text-blue-500" /> Project Velocity
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {projectStats.length > 0 ? (
              projectStats.map((p, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">{p.name}</span>
                    <span className="font-bold text-gray-400">
                      {p.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${p.percentage}%`,
                        backgroundColor: p.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No active projects.
              </div>
            )}
          </div>
        </motion.div>

        {/* ✅ RIGHT COLUMN - BOTTOM ROW: Task Pulse & Balance */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col justify-between"
        >
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <CheckSquare size={16} className="text-emerald-500" /> Task Pulse
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-bold text-gray-400">Overdue</span>
              <span className="text-sm font-black text-red-500">
                {taskStats.overdue}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-gray-400">Due Today</span>
              <span className="text-sm font-black text-blue-500">
                {taskStats.dueToday}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${
                    taskStats.total > 0
                      ? (taskStats.completed / taskStats.total) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col"
        >
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Balance
          </h3>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workBreakData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {workBreakData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={WB_COLORS[index % WB_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Layers size={16} className="text-gray-300" />
            </div>
          </div>
        </motion.div>

        {/* ✅ REMOVED Horizon & Quick Capture from here */}

        <motion.div
          variants={itemVariants}
          className="md:col-span-2 row-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col"
        >
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Zap size={20} className="text-amber-500" /> Recent Echoes
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {timelineData.length > 0 ? (
              timelineData.map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 ring-4 ring-white ${
                        item.type === "task"
                          ? "bg-emerald-500"
                          : item.type === "pomodoro"
                          ? "bg-indigo-500"
                          : item.type === "diary"
                          ? "bg-pink-500"
                          : "bg-amber-500"
                      }`}
                    ></div>
                    {i !== timelineData.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-100 my-1 group-hover:bg-gray-200 transition-colors rounded-full"></div>
                    )}
                  </div>
                  <div className="bg-white/50 p-3 rounded-2xl flex-1 border border-transparent group-hover:border-white group-hover:shadow-sm transition-all">
                    <p className="text-sm font-bold text-gray-700">
                      {item.title}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                      {format(new Date(item.time as number), "h:mm a")} •{" "}
                      {item.type}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <Activity size={32} className="text-gray-200 mb-2" />
                <p>Silence...</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="md:col-span-2 row-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col"
        >
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-teal-500" /> Mood & Focus
            Correlation
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={moodVsFocusData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: "bold" }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: "#f3f4f6", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Bar
                  dataKey="focus"
                  barSize={30}
                  fill="url(#barGradient)"
                  radius={[8, 8, 8, 8]}
                  name="Focus (min)"
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#14b8a6"
                  strokeWidth={4}
                  dot={{
                    r: 4,
                    fill: "#fff",
                    stroke: "#14b8a6",
                    strokeWidth: 3,
                  }}
                  name="Energy (1-10)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col group row-span-2"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Peak Hours
            </h3>
            <div className="group/peak relative">
              <Info size={14} className="text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-40 bg-black/80 text-white text-[10px] p-2 rounded-lg backdrop-blur-md hidden group-hover/peak:block z-30">
                Active time analysis
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={peakData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 9, fill: "#6b7280", fontWeight: "bold" }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 150]} hide />
                <Radar
                  name="Focus"
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "12px",
                    border: "none",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col row-span-2"
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
            Knowledge Base
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            <div className="flex flex-wrap gap-2 justify-center content-center h-full">
              {knowledgeData.length > 0 ? (
                knowledgeData.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-3 py-1.5 bg-gray-100 rounded-lg text-gray-500 border border-gray-200"
                    style={{ color: COLORS[i % COLORS.length] }}
                  >
                    #{t.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No tags found.</span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="md:col-span-2 row-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} /> Priority Matrix
            </h3>
            <div className="group relative">
              <Info size={14} className="text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-48 bg-white p-3 rounded-xl shadow-xl text-[10px] text-gray-500 hidden group-hover:block z-20 border border-gray-100">
                <p>
                  <strong>Do:</strong> Urgent & Important
                </p>
                <p>
                  <strong>Plan:</strong> Not Urgent, but Important
                </p>
                <p>
                  <strong>Delegate:</strong> Urgent, Not Important
                </p>
                <p>
                  <strong>Delete:</strong> Neither
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-red-50/80 rounded-2xl p-3 hover:bg-red-100 transition-colors flex flex-col justify-between">
              <span className="text-[10px] font-black text-red-400">DO</span>
              <div className="text-right text-2xl font-black text-red-500">
                {eisenhowerData.do.length}
              </div>
            </div>
            <div className="bg-blue-50/80 rounded-2xl p-3 hover:bg-blue-100 transition-colors flex flex-col justify-between">
              <span className="text-[10px] font-black text-blue-400">PLAN</span>
              <div className="text-right text-2xl font-black text-blue-500">
                {eisenhowerData.schedule.length}
              </div>
            </div>
            <div className="bg-amber-50/80 rounded-2xl p-3 hover:bg-amber-100 transition-colors flex flex-col justify-between">
              <span className="text-[10px] font-black text-amber-400">
                DELEGATE
              </span>
              <div className="text-right text-2xl font-black text-amber-500">
                {eisenhowerData.delegate.length}
              </div>
            </div>
            <div className="bg-gray-50/80 rounded-2xl p-3 hover:bg-gray-100 transition-colors flex flex-col justify-between">
              <span className="text-[10px] font-black text-gray-400">
                DELETE
              </span>
              <div className="text-right text-2xl font-black text-gray-500">
                {eisenhowerData.delete.length}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ✅ MOVED HORIZON HERE */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5 flex flex-col"
        >
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
            <Sunrise size={16} className="text-orange-400" /> Horizon
          </h3>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-white/50 rounded-xl border border-white/20"
                >
                  <div className="w-1 h-6 bg-orange-400 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">
                      {t.title}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      {t.dueDate
                        ? format(new Date(t.dueDate), "MMM dd")
                        : "Soon"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center pt-4">
                Clear skies ahead.
              </div>
            )}
          </div>
        </motion.div>

        {/* ✅ MOVED QUICK CAPTURE HERE */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[32px] shadow-lg text-white flex flex-col"
        >
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <Plus size={16} /> Quick Capture
          </h3>
          <form
            onSubmit={handleQuickAdd}
            className="flex-1 flex flex-col gap-2"
          >
            <textarea
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              placeholder="Brain dump..."
              className="flex-1 bg-white/20 rounded-xl p-3 text-xs text-white placeholder-white/60 border border-white/10 focus:outline-none focus:bg-white/30 resize-none"
            />
            <button
              type="submit"
              className="bg-white text-indigo-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              Add <Send size={12} />
            </button>
          </form>
        </motion.div>

        {/* ROW 5: Heatmap */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-3 lg:col-span-4 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-500/5"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Leaf size={20} className="text-green-500" /> Consistency
            </h3>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(["daily", "weekly", "monthly"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setHeatmapView(v)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all capitalize ${
                    heatmapView === v
                      ? "bg-white shadow-sm text-black"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {heatmapData.map((day, i) => (
              <div
                key={i}
                title={`${day.label}: ${day.score} activity`}
                className={`rounded-md transition-all hover:scale-110 cursor-pointer ${
                  heatmapView === "daily"
                    ? "w-4 h-4"
                    : "w-8 h-8 flex items-center justify-center text-[8px] font-bold text-green-900/50"
                } ${
                  day.score === 0
                    ? "bg-gray-100"
                    : day.score === 1
                    ? "bg-emerald-200"
                    : day.score === 2
                    ? "bg-emerald-400"
                    : "bg-emerald-600"
                }`}
              >
                {heatmapView !== "daily" && day.score > 0 && "✓"}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
