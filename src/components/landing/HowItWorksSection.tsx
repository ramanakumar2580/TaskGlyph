// src/components/landing/HowItWorksSection.tsx
"use client";

import { motion } from "framer-motion";
import { sectionVariant, itemVariant } from "@/lib/animations"; // Import variants

export default function HowItWorksSection() {
  return (
    <motion.section
      id="how-it-works" // ID for navbar link
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="py-24 bg-white border-t border-gray-100"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-16">
          Get Productive in 3 Simple Steps
        </h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ staggerChildren: 0.15 }} // Stagger steps
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {/* Step 1 */}
          <motion.div
            variants={itemVariant}
            className="flex flex-col items-center p-8 bg-gray-50 rounded-lg border border-gray-100 shadow hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-blue-100 text-blue-700 rounded-full h-16 w-16 flex items-center justify-center font-bold text-2xl mb-6 shadow-md">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Sign Up Free</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create your account instantly via Google. No credit card needed.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            variants={itemVariant}
            className="flex flex-col items-center p-8 bg-gray-50 rounded-lg border border-gray-100 shadow hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-blue-100 text-blue-700 rounded-full h-16 w-16 flex items-center justify-center font-bold text-2xl mb-6 shadow-md">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Start Working Anywhere
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Use TaskGlyph immediately on any device, online or completely
              offline.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            variants={itemVariant}
            className="flex flex-col items-center p-8 bg-gray-50 rounded-lg border border-gray-100 shadow hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-blue-100 text-blue-700 rounded-full h-16 w-16 flex items-center justify-center font-bold text-2xl mb-6 shadow-md">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Sync Automatically</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your changes sync seamlessly in the background when you reconnect.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
