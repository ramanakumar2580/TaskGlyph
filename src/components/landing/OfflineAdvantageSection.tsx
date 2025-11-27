// src/components/landing/OfflineAdvantageSection.tsx
"use client";

import { motion, Variants } from "framer-motion";
import {
  WifiIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  CircleStackIcon,
  ListBulletIcon,
  ServerIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { sectionVariant } from "@/lib/animations";

// --- Variants ---
const flowContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const flowItem: Variants = {
  hidden: { opacity: 0.3, scale: 0.9, filter: "grayscale(100%)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "grayscale(0%)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const connectionLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 4,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

// Helper for centering arrows perfectly
function CenteredArrow({
  direction = "right",
}: {
  direction?: "right" | "left";
}) {
  const Icon = direction === "right" ? ArrowRightIcon : ArrowLeftIcon;
  return (
    <div className="flex-1 flex justify-center items-center px-2">
      <Icon className="h-6 w-6 text-slate-600/50 stroke-2" />
    </div>
  );
}

function AnimatedDiagram() {
  return (
    <div className="relative w-full h-full p-8 py-10 flex flex-col justify-between">
      {/* Decorative Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

      <motion.div
        variants={flowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="relative z-20 flex flex-col h-full justify-between min-h-[420px]"
      >
        {/* --- Top Row --- */}
        <div className="flex justify-between items-center w-full relative z-20">
          <motion.div
            variants={flowItem}
            className="flex flex-col items-center gap-3 w-24 flex-shrink-0 relative z-20"
          >
            <div className="relative">
              <GlobeAltIcon className="h-14 w-14 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.4)]" />
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center font-bold text-sm text-white border-4 border-[#0F172A]">
                X
              </div>
            </div>
            <span className="text-sm text-red-300 font-bold tracking-wider mt-1">
              OFFLINE
            </span>
          </motion.div>

          <CenteredArrow direction="right" />

          <motion.div
            variants={flowItem}
            className="flex flex-col items-center gap-3 w-24 flex-shrink-0 relative z-20"
          >
            <CircleStackIcon className="h-14 w-14 text-slate-300" />
            <span className="text-xs text-slate-300 text-center font-medium">
              DEXIE
              <br />
              <span className="text-slate-500">(IndexedDB)</span>
            </span>
          </motion.div>

          <CenteredArrow direction="right" />

          <motion.div
            variants={flowItem}
            className="flex flex-col items-center gap-3 w-24 flex-shrink-0 relative z-20"
          >
            <ListBulletIcon className="h-14 w-14 text-slate-300" />
            <span className="text-xs text-slate-300 text-center font-medium">
              PENDING
              <br />
              QUEUE
            </span>
          </motion.div>

          <CenteredArrow direction="right" />

          <motion.div
            variants={flowItem}
            className="flex flex-col items-center gap-3 w-24 flex-shrink-0 relative z-20"
          >
            <div className="relative">
              <WifiIcon className="h-14 w-14 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-[#0F172A] flex items-center justify-center">
                <CheckCircleIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="text-sm text-green-300 font-bold tracking-wider mt-1">
              RECONNECT
            </span>
          </motion.div>
        </div>

        {/* --- THE LOOP SVG --- */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="4"
                result="blur1"
              />
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="8"
                result="blur2"
              />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient
              id="blue-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Static Line: Reconnect -> Sync Worker */}
          <path
            d="M 720 120 L 720 200"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          <motion.path
            variants={{
              hidden: { opacity: 0, pathLength: 0 },
              visible: {
                opacity: 1,
                pathLength: 1,
                transition: { duration: 1, delay: 1 },
              },
            }}
            d="M 720 120 L 720 200"
            stroke="#4ade80"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Background Track */}
          <path
            d="M 720 250 L 720 395 Q 720 415 700 415 L 100 415 Q 80 415 80 395 L 80 270 Q 80 250 100 250 L 720 250"
            stroke="#1e293b"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Active Glowing Line */}
          <motion.path
            variants={connectionLine}
            d="M 720 250 L 720 395 Q 720 415 700 415 L 100 415 Q 80 415 80 395 L 80 270 Q 80 250 100 250 L 720 250"
            stroke="url(#blue-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#neon-glow)"
          />
        </svg>

        {/* --- Middle Right: Sync Worker --- */}
        <motion.div
          variants={flowItem}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-30 w-24 pr-4"
        >
          <div className="bg-[#0F172A] p-3 rounded-full border-2 border-cyan-500/30 relative z-30">
            <CloudArrowUpIcon className="h-14 w-14 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
          </div>
          <span className="text-sm text-cyan-300 font-bold tracking-wider bg-[#0F172A] px-2 relative z-30">
            SYNC WORKER
          </span>
        </motion.div>

        {/* --- Bottom Row --- */}
        <div className="flex justify-between items-center w-full relative z-20 mt-auto">
          <motion.div
            variants={flowItem}
            className="flex flex-col items-center gap-3 w-24 flex-shrink-0 relative z-20"
          >
            <div className="relative">
              <div className="w-16 h-12 border-2 border-blue-400/50 rounded-md relative bg-slate-800/80 flex items-center justify-center">
                <CheckCircleIcon className="h-7 w-7 text-green-400" />
              </div>
              <div className="w-20 h-1 bg-slate-700 rounded-b-md mt-0.5 mx-auto"></div>
            </div>
            <span className="text-sm text-white font-bold tracking-wider mt-2">
              CONFIRMATION
            </span>
          </motion.div>

          <CenteredArrow direction="left" />

          <motion.div
            variants={flowItem}
            className="flex flex-col items-center gap-3 w-24 flex-shrink-0 relative z-20"
          >
            <ServerIcon className="h-14 w-14 text-slate-300" />
            <span className="text-xs text-slate-300 font-medium mt-1">
              API / BACKEND
            </span>
          </motion.div>

          <CenteredArrow direction="left" />

          <motion.div
            variants={flowItem}
            className="flex flex-col items-center gap-3 w-24 flex-shrink-0 relative z-20"
          >
            <CircleStackIcon className="h-14 w-14 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)]" />
            <span className="text-xs text-blue-200 font-medium mt-1">
              NEON POSTGRES
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function OfflineAdvantageSection() {
  return (
    <motion.section
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-24 bg-[#0B1120] text-white relative overflow-hidden"
    >
      {/* HERE IS THE FIX:
        I replaced the "bg-[url('/images/noise.png')]" class with a direct inline style 
        using a Data URI. This generates the noise using code, so you don't need a file.
      */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        {/* Text Content */}
        <div className="lg:w-2/5">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-6 backdrop-blur-sm border border-blue-500/20">
            <WifiIcon className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-6 text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Work Unstoppable, <br />
            Online or Offline.
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Unlike cloud-only apps that leave you stranded without internet,
            TaskGlyph&apos;s core is built for resilience. Your work is always
            safe locally and syncs the moment you reconnect.
          </p>
          <ul className="space-y-5">
            {[
              "Instant Loading & Speed (Zero Latency)",
              "Travel & Commute Ready",
              "Enhanced Focus & Reliability",
              "Conflict-Free Background Sync",
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-center text-lg"
              >
                <CheckCircleIcon className="h-7 w-7 text-blue-400 mr-3 flex-shrink-0" />
                <span className="text-slate-200">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Visual Container */}
        <div className="lg:w-3/5 w-full font-sans">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-3xl overflow-hidden border border-slate-700/50 bg-[#0F172A] shadow-[0_0_50px_-10px_rgba(14,165,233,0.15)] min-h-[500px]"
          >
            <AnimatedDiagram />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
