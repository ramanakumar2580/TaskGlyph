// src/components/landing/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/50 to-white pt-36 pb-24 md:pt-48 md:pb-32">
      {/* Background elements */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[600px] grid grid-cols-2 -space-x-40 opacity-30 pointer-events-none"
      >
        <div className="blur-[120px] h-64 bg-gradient-to-br from-blue-100 to-purple-200"></div>
        <div className="blur-[120px] h-40 bg-gradient-to-r from-cyan-100 to-sky-200 translate-y-20"></div>
      </div>
      {/* Animated Glow Element */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.1, scale: 1.5 }}
        transition={{
          duration: 1.5,
          delay: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl -z-10 pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight"
        >
          Never Loose Your Flow,
          <br />
          <span className="text-blue-600 drop-shadow-sm">
            Even When You&apos;re Offline.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed"
        >
          TaskGlyph is your all-in-one productivity workspace (Tasks, Notes,
          Diary, Pomodoro) designed to work seamlessly offline and sync
          automatically. Stop context switching, start focusing.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <Link
            href="/auth/signin"
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-150 ease-in-out shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1"
          >
            Try TaskGlyph Free
          </Link>
        </motion.div>
      </div>

      {/* Laptop Mockup Visual */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px] lg:h-[344px] lg:max-w-[600px]">
          <div className="rounded-lg overflow-hidden h-[156px] md:h-[278px] lg:h-[328px] bg-white">
            <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
              <p className="text-gray-500 font-medium text-sm md:text-base">
                [TaskGlyph Dashboard Preview]
              </p>
            </div>
          </div>
        </div>
        <div className="relative mx-auto bg-gray-700 rounded-b-xl rounded-t-sm h-[17px] max-w-[351px] md:h-[21px] md:max-w-[597px] lg:h-[25px] lg:max-w-[700px]">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg w-[56px] h-[5px] md:w-[96px] md:h-[8px] lg:w-[120px] lg:h-[10px] bg-gray-800"></div>
        </div>
      </motion.div>
    </section>
  );
}
