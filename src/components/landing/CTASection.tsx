// src/components/landing/CTASection.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { sectionVariant } from "@/lib/animations"; // Import variants

export default function CTASection() {
  return (
    <motion.section
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="py-28 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden" // Rich gradient
    >
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-70 pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
          Experience Seamless Productivity Today.
        </h2>
        <p className="mt-6 text-xl text-blue-100 max-w-xl mx-auto leading-relaxed">
          Stop letting unreliable apps break your focus. Join thousands enjoying
          the power of offline-first productivity with TaskGlyph.
        </p>
        <Link
          href="/auth/signin"
          className="mt-12 inline-block bg-white text-blue-600 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transition duration-150 ease-in-out shadow-xl hover:shadow-2xl transform hover:-translate-y-1" // Enhanced styling
        >
          Start Free - No Card Required
        </Link>
        <p className="mt-5 text-sm text-blue-200">
          Full functionality, generous free plan.
        </p>
      </div>
    </motion.section>
  );
}
