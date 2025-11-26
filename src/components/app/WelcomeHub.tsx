"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  WifiIcon,
  ArrowRightIcon,
  BoltIcon,
  Squares2X2Icon, // Unified
  RocketLaunchIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { whyContainerVariant, itemVariant } from "@/lib/animations";

export default function WelcomeHub() {
  const features = [
    {
      title: "Offline First",
      desc: "No internet? No problem. Your work syncs when you reconnect.",
      icon: WifiIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "group-hover:border-emerald-200",
    },
    {
      title: "Unified Workspace",
      desc: "Tasks, Notes, Diary, and Timer—all in one seamless flow.",
      icon: Squares2X2Icon,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "group-hover:border-blue-200",
    },
    {
      title: "Zero Latency",
      desc: "Instant UI interaction. No spinners, no waiting.",
      icon: BoltIcon,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "group-hover:border-amber-200",
    },
  ];

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={whyContainerVariant}
      className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 md:p-12 shadow-xl"
    >
      {/* --- Ambient Background --- */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        {/* 1. Header */}
        <div className="mb-12 max-w-2xl">
          <motion.div
            variants={itemVariant}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <RocketLaunchIcon className="w-4 h-4" /> Welcome to TaskGlyph
          </motion.div>

          <motion.h2
            variants={itemVariant}
            className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4"
          >
            Your new{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Focus Hub.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariant}
            className="text-lg text-gray-500 leading-relaxed"
          >
            TaskGlyph is built on one simple idea:{" "}
            <strong>tools shouldn&apos;t break your flow.</strong>
            <br /> We&apos;ve stripped away the clutter so you can build what
            matters.
          </motion.p>
        </div>

        {/* 2. Feature Grid */}
        <motion.div
          variants={whyContainerVariant}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feat) => (
            <motion.div
              key={feat.title}
              variants={itemVariant}
              whileHover={{ y: -5 }}
              className={`group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${feat.border}`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feat.icon className={`w-6 h-6 ${feat.color}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {feat.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. Action Card (What's Next) */}
        <motion.div variants={itemVariant}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-10 text-white shadow-2xl shadow-slate-200">
            {/* Decor */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/30 blur-[50px] rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to start?</h3>
                <p className="text-slate-300">
                  Create your first task to get the momentum going, or jot down
                  a quick idea.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link
                  href="/app/tasks"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Go to Tasks <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/app/notes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all border border-slate-600"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Write Note
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
