/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/db/clientDb";
import { useTier } from "@/lib/db/useTier";
import {
  SparklesIcon,
  ArrowPathIcon,
  BoltIcon,
  LockClosedIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  FireIcon,
  Battery50Icon,
  CpuChipIcon,
} from "@heroicons/react/24/solid";
import { Loader2, TrendingUpIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { subDays, isAfter } from "date-fns";

interface AIResponse {
  score: number;
  analysis: string;
  action: string;
  burnout_risk: "Low" | "Medium" | "High";
  peak_hours: string;
  hidden_pattern: string;
  sustainability: string;
  momentum: string;
  work_mode: string;
}

type Timeframe = "weekly" | "monthly" | "yearly";

export default function AIInsightsCard() {
  const tier = useTier();
  const [data, setData] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");

  const currentTier = (tier || "free").toLowerCase();
  const isFeatureLocked = currentTier === "free" || currentTier === "basic";
  const isYearlyLocked =
    currentTier === "pro" || currentTier === "basic" || currentTier === "free";

  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const sessions = useLiveQuery(() => db.pomodoroSessions.toArray()) || [];
  const diaryEntries = useLiveQuery(() => db.diaryEntries.toArray()) || [];

  const generateInsight = useCallback(
    async (selectedTimeframe: Timeframe) => {
      if (isFeatureLocked) return;
      setLoading(true);

      const now = new Date();
      let startDate = subDays(now, 7);
      if (selectedTimeframe === "monthly") startDate = subDays(now, 30);
      if (selectedTimeframe === "yearly") startDate = subDays(now, 365);

      const completedCount = tasks.filter(
        (t) =>
          t.completed &&
          t.updatedAt &&
          isAfter(new Date(t.updatedAt), startDate)
      ).length;
      const overdueCount = tasks.filter(
        (t) => !t.completed && t.dueDate && t.dueDate < Date.now()
      ).length;
      const focusMinutes = sessions
        .filter(
          (s) => s.completedAt && isAfter(new Date(s.completedAt), startDate)
        )
        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const periodEntries = diaryEntries.filter((d) =>
        isAfter(new Date(d.createdAt), startDate)
      );
      const avgEnergy = periodEntries.length
        ? Math.round(
            periodEntries.reduce((acc, curr) => acc + (curr.energy || 5), 0) /
              periodEntries.length
          )
        : 5;
      const dominantMood =
        periodEntries.length > 0
          ? periodEntries[periodEntries.length - 1].mood
          : "Neutral";

      try {
        const res = await fetch("/api/ai/insights", {
          method: "POST",
          body: JSON.stringify({
            timeframe: selectedTimeframe,
            tasks: { completed: completedCount, overdue: overdueCount },
            sessions: { totalMinutes: focusMinutes },
            diary: { mood: dominantMood, energy: avgEnergy },
          }),
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [isFeatureLocked, tasks, sessions, diaryEntries]
  );

  const handleTabChange = (tf: Timeframe) => {
    if (tf === "yearly" && isYearlyLocked) {
      alert("Yearly insights are available on the Ultra plan.");
      return;
    }
    setTimeframe(tf);
    generateInsight(tf);
  };

  // REMOVED: useEffect for auto-refresh

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[32px] bg-[#0B0F19] p-1 shadow-2xl h-full min-h-[600px] flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-30 animate-pulse" />

      <div className="relative flex-1 bg-[#0F1322] rounded-[28px] p-6 flex flex-col overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center z-10 mb-6 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl text-indigo-400 ring-1 ring-indigo-500/30">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight">
                Neural Engine
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                AI Productivity Analyst
              </p>
            </div>
          </div>

          {!isFeatureLocked && (
            <div className="flex bg-[#1A1F2E] p-1 rounded-xl border border-slate-800/50">
              {(["weekly", "monthly", "yearly"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTabChange(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-1
                    ${
                      timeframe === tf
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }
                    ${tf === "yearly" && isYearlyLocked ? "opacity-50" : ""}
                  `}
                >
                  {tf === "yearly" && isYearlyLocked && (
                    <LockClosedIcon className="w-3 h-3" />
                  )}
                  {tf}
                </button>
              ))}
              <button
                onClick={() => generateInsight(timeframe)}
                disabled={loading}
                className="ml-2 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ArrowPathIcon
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex-grow flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {isFeatureLocked ? (
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="p-5 bg-[#1A1F2E] rounded-full mb-4 ring-1 ring-slate-800 shadow-xl">
                  <LockClosedIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h4 className="text-white font-bold text-xl mb-2">
                  Unlock God Mode
                </h4>
                <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
                  Gain access to Weekly, Monthly & Yearly AI analysis with the{" "}
                  <strong>Pro</strong> plan.
                </p>
                <Link
                  href="/app/pricing"
                  className="px-8 py-3 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
                >
                  Upgrade Now
                </Link>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full space-y-4"
              >
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-xs text-indigo-300 font-mono animate-pulse uppercase tracking-widest">
                  Crunching Data...
                </p>
              </motion.div>
            ) : data ? (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-0"
              >
                {/* LEFT COL: Vertical Stack (Score -> Hidden -> Peak -> Work) */}
                <div className="md:col-span-5 flex flex-col gap-4 h-full min-h-0">
                  {/* Score Box */}
                  <div className="h-40 shrink-0 bg-[#1A1F2E]/50 p-5 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="relative z-10 text-center">
                      <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        {data.score}
                      </div>
                      <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-2 border border-indigo-500/30 px-3 py-1 rounded-full bg-indigo-500/10">
                        Productivity Score
                      </div>
                    </div>
                  </div>

                  {/* Hidden Pattern (Expands) */}
                  <div className="flex-1 bg-[#1A1F2E]/80 p-5 rounded-3xl border border-slate-800/50 flex flex-col min-h-0">
                    <div className="flex items-center gap-2 mb-3 shrink-0">
                      <EyeIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Hidden Pattern
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                      <p className="text-xs text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                        {data.hidden_pattern}
                      </p>
                    </div>
                  </div>

                  {/* Peak Hours (Fixed Height) */}
                  <div className="bg-[#1A1F2E] h-[110px] p-3 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center group transition-colors hover:bg-[#1f2433] shrink-0">
                    <ClockIcon className="w-5 h-5 text-emerald-400 mb-2" />
                    <span className="text-[7px] text-slate-500 font-bold uppercase">
                      Peak Hours
                    </span>
                    <span className="text-white text-[8px] font-bold w-full mt-1">
                      {data.peak_hours}
                    </span>
                  </div>

                  {/* Work Mode (Fixed Height) */}
                  <div className="bg-[#1A1F2E] h-[110px] p-3 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center group transition-colors hover:bg-[#1f2433] shrink-0">
                    <CpuChipIcon className="w-5 h-5 text-purple-400 mb-2" />
                    <span className="text-[9px] text-slate-500 font-bold uppercase">
                      Work Mode
                    </span>
                    <span
                      className="text-white text-xs font-bold truncate w-full mt-1 px-1"
                      title={data.work_mode}
                    >
                      {data.work_mode}
                    </span>
                  </div>
                </div>

                {/* RIGHT COL: Analysis (Big), Objective (Fixed Small), Metrics */}
                <div className="md:col-span-7 flex flex-col gap-4 h-full min-h-0">
                  {/* Analysis Text - FLEX-1 (Takes remaining space) */}
                  <div className="flex-1 bg-[#1A1F2E] p-5 rounded-3xl border border-slate-800 flex flex-col min-h-0">
                    <div className="flex items-center gap-2 mb-3 shrink-0">
                      <ChartBarIcon className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                        {timeframe} Analysis
                      </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {data.analysis}
                      </p>
                    </div>
                  </div>

                  {/* Primary Objective - FIXED HEIGHT (140px) - Compact */}
                  <div className="h-[140px] shrink-0 bg-gradient-to-br from-indigo-900/40 to-[#1A1F2E] p-4 rounded-3xl border border-indigo-500/20 relative flex flex-col">
                    <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                      <BoltIcon className="w-12 h-12 text-indigo-400" />
                    </div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase shrink-0">
                      Primary Objective
                    </span>
                    <div className="flex-1 overflow-y-auto mt-1 relative z-10 pr-1 [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                      <p className="text-white text-xs font-bold whitespace-pre-wrap">
                        {data.action}
                      </p>
                    </div>
                  </div>

                  {/* 3-Metric Grid - FIXED HEIGHT (110px) */}
                  <div className="grid grid-cols-3 gap-3 shrink-0 h-[110px]">
                    {/* Burnout Risk */}
                    <div className="bg-[#1A1F2E] rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center group transition-colors hover:bg-[#1f2433] px-2">
                      <FireIcon
                        className={`w-5 h-5 mb-2 ${
                          data.burnout_risk === "High"
                            ? "text-red-500"
                            : "text-orange-400"
                        }`}
                      />
                      <span className="text-[9px] text-slate-500 font-bold uppercase">
                        Burnout
                      </span>
                      <span
                        className={`text-xs font-black w-full truncate mt-1 ${
                          data.burnout_risk === "Low"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {data.burnout_risk}
                      </span>
                    </div>

                    {/* Momentum */}
                    <div className="bg-[#1A1F2E] rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center group transition-colors hover:bg-[#1f2433] px-2">
                      <TrendingUpIcon className="w-5 h-5 text-blue-400 mb-2" />
                      <span className="text-[9px] text-slate-500 font-bold uppercase">
                        Momentum
                      </span>
                      <span className="text-white text-xs font-bold truncate w-full mt-1">
                        {data.momentum}
                      </span>
                    </div>

                    {/* Sustainability */}
                    <div className="bg-[#1A1F2E] rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center group transition-colors hover:bg-[#1f2433] px-2">
                      <Battery50Icon className="w-5 h-5 text-green-400 mb-2" />
                      <span className="text-[9px] text-slate-500 font-bold uppercase">
                        Sustain
                      </span>
                      <span className="text-white text-xs font-bold truncate w-full mt-1">
                        {data.sustainability}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // UPDATED: Start Screen Logic
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="p-4 bg-indigo-500/10 rounded-full mb-4 animate-pulse">
                  <SparklesIcon className="w-8 h-8 text-indigo-500" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">
                  Ready to Analyze
                </h4>
                <p className="text-slate-400 text-xs max-w-[200px] mb-6">
                  Select a timeframe to generate AI-powered productivity
                  insights.
                </p>
                <button
                  onClick={() => generateInsight(timeframe)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <BoltIcon className="w-3 h-3" />
                  Generate{" "}
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}{" "}
                  Report
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
