// src/components/landing/TestimonialSection.tsx
"use client";

import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { sectionVariant, itemVariant } from "@/lib/animations"; // Import variants

export default function TestimonialSection() {
  return (
    <motion.section
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-24 bg-gradient-to-b from-blue-50/50 via-white to-white border-t border-gray-100" // Subtle gradient background
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SparklesIcon className="h-12 w-12 text-yellow-500 mx-auto mb-5" />
        <h2 className="text-3xl font-semibold text-gray-900 mb-8">
          Built for People Who Value Focus
        </h2>
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 bg-white p-10 rounded-lg shadow-xl border border-gray-100 relative max-w-2xl mx-auto"
        >
          {/* Decorative Quote Mark */}
          <div className="absolute top-0 left-0 transform -translate-x-4 -translate-y-4 text-8xl text-blue-100 font-serif opacity-80 z-0">
            “
          </div>
          <p className="text-xl md:text-2xl font-medium text-gray-700 italic leading-relaxed z-10 relative">
            &quot;TaskGlyph finally lets me work without worrying about
            internet. The offline-first approach is a game-changer for my focus
            during travel and commutes.&quot;
          </p>
          <footer className="mt-8">
            <p className="text-base font-semibold text-gray-900">M. Kumar</p>
            <p className="text-sm text-gray-500">
              Software Developer, Hyderabad
            </p>
          </footer>
        </motion.blockquote>

        {/* Logos Section */}
        <div className="mt-24">
          <p className="text-base uppercase text-gray-500 tracking-wider font-semibold">
            Join individuals worldwide who rely on TaskGlyph
          </p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            transition={{ staggerChildren: 0.1 }} // Stagger logo animation
            className="mt-8 flex justify-center items-center space-x-10 opacity-70 flex-wrap gap-6"
          >
            {/* Replace text with actual SVG logos */}
            <motion.span
              variants={itemVariant}
              className="font-medium text-gray-600"
            >
              [Logo Placeholder 1]
            </motion.span>
            <motion.span
              variants={itemVariant}
              className="font-medium text-gray-600"
            >
              [Logo Placeholder 2]
            </motion.span>
            <motion.span
              variants={itemVariant}
              className="font-medium text-gray-600"
            >
              [Logo Placeholder 3]
            </motion.span>
            <motion.span
              variants={itemVariant}
              className="font-medium text-gray-600"
            >
              [Logo Placeholder 4]
            </motion.span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
