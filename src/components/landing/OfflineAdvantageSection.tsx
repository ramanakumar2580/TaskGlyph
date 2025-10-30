// src/components/landing/OfflineAdvantageSection.tsx
"use client";

import { motion } from "framer-motion";
import { WifiIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { sectionVariant } from "@/lib/animations"; // Import variants

export default function OfflineAdvantageSection() {
  return (
    <motion.section
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-24 bg-gray-800 text-white border-t border-gray-700" // Dark background
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
        {/* Text Content */}
        <div className="md:w-1/2">
          <WifiIcon className="h-12 w-12 text-blue-400 mb-5" />
          <h1 className="text-xl font-extrabold tracking-tight sm:text-3xl mb-6 text-white">
            Work Unstoppable, Online or Offline
          </h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Unlike cloud-only apps that leave you stranded without internet,
            TaskGlyph&apos;s core is built for resilience. Your work is always
            safe and instantly accessible locally.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center text-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
              <span className="text-gray-200">Instant Loading & Speed</span>
            </li>
            <li className="flex items-center text-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
              <span className="text-gray-200">Travel & Commute Ready</span>
            </li>
            <li className="flex items-center text-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
              <span className="text-gray-200">
                Enhanced Focus & Reliability
              </span>
            </li>
            <li className="flex items-center text-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
              <span className="text-gray-200">Seamless Background Sync</span>
            </li>
          </ul>
        </div>

        {/* Visual Placeholder */}
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square bg-gray-700 rounded-lg shadow-lg flex items-center justify-center border border-gray-600 p-8">
              <p className="text-gray-400 text-center text-sm sm:text-base">
                [Graphic illustrating offline device syncing to cloud when
                online] [Image of devices syncing data]
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
