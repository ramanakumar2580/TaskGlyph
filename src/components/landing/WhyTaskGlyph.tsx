// src/components/landing/WhyTaskGlyph.tsx
"use client";

import { motion } from "framer-motion";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
// ✅ 1. Import variants from the new file
import {
  sectionVariant,
  whyContainerVariant,
  itemVariantXLeft,
  itemVariantXRight,
} from "@/lib/animations";

export default function WhyTaskGlyph() {
  // Data (keep this)
  const problems = [
    "Apps useless without internet",
    "Juggling multiple tools drains focus",
    "Data locked in vendor silos",
    "Losing work during sync issues",
    "Subscription fatigue & forced upgrades",
  ];
  const solutions = [
    "Seamless offline-first workflow",
    "Tasks, Notes, Diary, Timer - Unified",
    "Your data, locally stored & controlled",
    "Reliable, automatic background sync",
    "Generous free forever plan",
  ];

  return (
    <motion.section
      id="why-us"
      // ✅ 2. Use imported variants
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-24 bg-white relative overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl lg:text-5xl">
            Tired of Productivity <span className="text-red-500">Friction</span>
            ?
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            Traditional tools often get in your way. TaskGlyph is designed from
            the ground up for focus and reliability.
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <motion.div
          // ✅ 3. Use imported variants
          variants={whyContainerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-center"
        >
          {/* Column 1: Problems */}
          <div className="space-y-4">
            <h3 className="text-center text-xl font-semibold text-red-600 mb-6 md:text-left">
              Common Frustrations
            </h3>
            {problems.map((problem, index) => (
              <motion.div
                key={`problem-${index}`}
                // ✅ 4. Use imported variants
                variants={itemVariantXLeft}
                className="flex items-center p-4 bg-red-50 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 text-sm sm:text-base">
                  {problem}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Column 2: Central Graphic/Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "backOut" }}
            className="hidden md:flex justify-center items-center py-10"
          >
            <div className="p-6 bg-blue-600 rounded-full shadow-lg transform transition-transform hover:scale-110 duration-300">
              {/* Sparkle Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-16 h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>
            </div>
          </motion.div>

          {/* Column 3: Solutions */}
          <div className="space-y-4">
            <h3 className="text-center text-xl font-semibold text-green-600 mb-6 md:text-left">
              The TaskGlyph Solution
            </h3>
            {solutions.map((solution, index) => (
              <motion.div
                key={`solution-${index}`}
                // ✅ 5. Use imported variants
                variants={itemVariantXRight}
                className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 text-sm sm:text-base">
                  {solution}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
