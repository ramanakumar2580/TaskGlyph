// src/components/app/TopTierHub.tsx
"use client";

import Link from "next/link";
import {
  ListBulletIcon,
  PencilIcon,
  BookOpenIcon,
  ClockIcon,
  CheckBadgeIcon,
  SparklesIcon,
  PhotoIcon,
  DevicePhoneMobileIcon,
  UsersIcon,
  ArrowRightIcon,
  BoltIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// Animation Variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export default function TopTierHub() {
  const activeModules = [
    { name: "Task Engine", status: "Unlimited", icon: ListBulletIcon },
    { name: "Knowledge Base", status: "Unlimited", icon: PencilIcon },
    { name: "Private Diary", status: "Encrypted", icon: BookOpenIcon },
    { name: "Focus Timer", status: "Active", icon: ClockIcon },
    { name: "Time Travel", status: "1 Year+", icon: CheckBadgeIcon },
    { name: "Media Vault", status: "Uncapped", icon: PhotoIcon },
    { name: "Sync Cloud", status: "All Devices", icon: DevicePhoneMobileIcon },
    { name: "Neural AI", status: "Online", icon: SparklesIcon },
    { name: "Team Uplink", status: "Ready", icon: UsersIcon },
  ];

  const quickActions = [
    {
      name: "Create Master Task",
      href: "/app/tasks",
      desc: "Organize your workflow",
      icon: ListBulletIcon,
      color: "text-blue-400",
      gradient: "from-blue-500/20 to-blue-600/5",
      border: "hover:border-blue-500/50",
    },
    {
      name: "Capture Idea",
      href: "/app/notes",
      desc: "Write it down quickly",
      icon: PencilIcon,
      color: "text-amber-400",
      gradient: "from-amber-500/20 to-amber-600/5",
      border: "hover:border-amber-500/50",
    },
    {
      name: "Enter Deep Focus",
      href: "/app/pomodoro",
      desc: "Start a Pomodoro",
      icon: ClockIcon,
      color: "text-rose-400",
      gradient: "from-rose-500/20 to-rose-600/5",
      border: "hover:border-rose-500/50",
    },
  ];

  return (
    <motion.div
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-6xl mx-auto"
    >
      {/* 1. ULTRA HERO CARD */}
      <motion.div
        variants={itemVariant}
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-500/20"
      >
        {/* Animated Glow Background */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/30 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/20 blur-[100px] rounded-full" />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg mb-4">
              <TrophyIcon className="w-4 h-4" /> Ultra Tier Active
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Welcome to the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Command Center
              </span>
            </h1>
            <p className="mt-4 text-slate-400 text-lg max-w-xl leading-relaxed">
              Your workspace is operating at maximum capacity. All limits
              removed. AI systems online. You are ready to build.
            </p>
          </div>

          {/* Abstract Visual Decor */}
          <div className="hidden md:block relative">
            <div className="w-32 h-32 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center transform rotate-12 shadow-2xl">
              <BoltIcon className="w-16 h-16 text-yellow-400" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center transform -rotate-12 shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. QUICK ACTIONS (Bento Grid) */}
      <motion.div variants={itemVariant}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-slate-400" /> Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative h-full p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group transition-all duration-300 ${action.border}`}
              >
                {/* Hover Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div
                      className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors`}
                    >
                      <action.icon className={`w-8 h-8 ${action.color}`} />
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transform group-hover:-rotate-45 transition-all duration-300" />
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900">
                      {action.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{action.desc}</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* 3. SYSTEM STATUS (Features Grid) */}
      <motion.div variants={itemVariant}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckBadgeIcon className="w-5 h-5 text-slate-400" /> System Modules
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
            All Systems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeModules.map((module, i) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                  <module.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">
                    {module.name}
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {module.status}
                  </p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
