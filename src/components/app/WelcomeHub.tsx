// src/components/app/WelcomeHub.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  WifiIcon,
  ArrowRightIcon,
  BoltIcon,
  CheckCircleIcon, // Icon for Speed
} from "@heroicons/react/24/outline";
// ✅ 1. Import the CORRECT variant names
import { whyContainerVariant, itemVariant } from "@/lib/animations";

export default function WelcomeHub() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      // ✅ 2. Use the correct variant name
      variants={whyContainerVariant}
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-8 md:p-12 shadow-xl"
    >
      {/* 1. "Flowing Color" Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgb(224 242 254 / 0.6), transparent 40%), radial-gradient(circle at 90% 80%, rgb(233 213 255 / 0.6), transparent 40%)",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgb(224 242 254), transparent 40%)",
        }}
        animate={{
          transform: [
            "translateX(0%) translateY(0%)",
            "translateX(50%) translateY(50%)",
            "translateX(0%) translateY(0%)",
          ],
        }}
        transition={{
          duration: 25,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* 2. Main Content */}
      <div className="relative z-10">
        <motion.h2
          variants={itemVariant}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          This is Your <span className="text-blue-600">Focus Hub</span>
        </motion.h2>
        <motion.p
          variants={itemVariant}
          className="text-lg text-gray-600 max-w-3xl mb-12 leading-relaxed"
        >
          TaskGlyph is built on one simple idea:{" "}
          <strong>your tool should never break your flow.</strong>
          <br />
          Here, your work is always fast, always available, and always yours.
        </motion.p>

        {/* 3. The "Why It's Best" Cards (Glassmorphism) */}
        <motion.div
          // ✅ 3. Use the correct variant name here too
          variants={whyContainerVariant}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Card 1: Offline-First */}
          <motion.div
            variants={itemVariant}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex gap-x-5 p-6 bg-white/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/30"
          >
            <div className="flex-shrink-0 p-3 bg-green-100 text-green-700 rounded-lg h-fit">
              <WifiIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Always Available, Offline-First
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your work is saved locally. No internet? No problem. It syncs
                automatically when you&apos;re back.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Unified Workspace */}
          <motion.div
            variants={itemVariant}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex gap-x-5 p-6 bg-white/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/30"
          >
            <div className="flex-shrink-0 p-3 bg-blue-100 text-blue-700 rounded-lg h-fit">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                A Unified Workspace
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Stop juggling apps. Your Tasks, Notes, Diary, and Pomodoro timer
                are all here, in one place.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Instant & Focused (NEW) */}
          <motion.div
            variants={itemVariant}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex gap-x-5 p-6 bg-white/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/30"
          >
            <div className="flex-shrink-0 p-3 bg-purple-100 text-purple-700 rounded-lg h-fit">
              <BoltIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Instant & Focused
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                No spinners, no loading screens. The UI is instant, so you never
                lose your train of thought.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* 4. Actionable "What's Next" Card */}
        <motion.div variants={itemVariant} className="mt-10">
          <div className="bg-white/70 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/30 flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                What&apos;s next?
              </h3>
              <p className="text-sm text-gray-600 mt-1 mb-4 sm:mb-0">
                You&apos;re all set. Start by creating your first task or
                writing a note.
              </p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <Link
                href="/app/tasks"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
              >
                Go to Tasks <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/app/notes"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 bg-gray-200 text-gray-800 font-semibold text-sm rounded-lg hover:bg-gray-300 transition-all"
              >
                Write a Note
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
