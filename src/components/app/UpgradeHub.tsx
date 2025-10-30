// src/components/app/UpgradeHub.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpCircleIcon,
  SparklesIcon,
  PhotoIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
// Import the animation variants from your lib file
import { bentoCardVariant, whyContainerVariant } from "@/lib/animations";

// Define what features to show for each upsell
const tierUpsells = {
  free: {
    heroTitle: "Unlock Your Full Potential",
    heroDescription:
      "You're on the Free plan. Upgrade to Pro to remove all limits and get powerful AI features.",
    heroButton: "View Pro Plans",
    featuresTitle: "What You're Missing...",
    features: [
      {
        id: 1,
        icon: SparklesIcon,
        name: "AI Weekly Insights",
        description: "Get AI-powered summaries of your productivity.",
        colSpan: "lg:col-span-2",
        rowSpan: "lg:row-span-2",
        bg: "bg-purple-50",
        text: "text-purple-600",
      },
      {
        id: 2,
        icon: CheckCircleIcon,
        name: "Go Unlimited",
        description: "Remove all limits on tasks, notes, and history.",
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        bg: "bg-green-50",
        text: "text-green-600",
      },
      {
        id: 3,
        icon: PhotoIcon,
        name: "Image Uploads",
        description: "Attach images and files to your notes.",
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        bg: "bg-blue-50",
        text: "text-blue-600",
      },
      {
        id: 4,
        icon: DevicePhoneMobileIcon,
        name: "Sync More Devices",
        description: "Keep your workflow in sync across 5 devices.",
        colSpan: "lg:col-span-2",
        rowSpan: "row-span-1",
        bg: "bg-sky-50",
        text: "text-sky-600",
      },
    ],
  },
  basic: {
    heroTitle: "Upgrade to Pro",
    heroDescription:
      "You're on the Basic plan. Get AI insights and more device syncs by upgrading to Pro.",
    heroButton: "Compare Pro Plans",
    featuresTitle: "Unlock Pro Features:",
    features: [
      {
        id: 1,
        icon: SparklesIcon,
        name: "AI Weekly Insights",
        description: "Get AI-powered summaries.",
        colSpan: "lg:col-span-2",
        rowSpan: "lg:row-span-2",
        bg: "bg-purple-50",
        text: "text-purple-600",
      },
      {
        id: 2,
        icon: PhotoIcon,
        name: "More Image Uploads",
        description: "100 images/month (up from 10).",
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        bg: "bg-blue-50",
        text: "text-blue-600",
      },
      {
        id: 3,
        icon: DevicePhoneMobileIcon,
        name: "Sync 5 Devices",
        description: "Up from 2 on Basic.",
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        bg: "bg-sky-50",
        text: "text-sky-600",
      },
    ],
  },
  pro: {
    heroTitle: "Go Ultra Pro",
    heroDescription:
      "You're on the Pro plan. Go Ultra Pro for unlimited everything and collaborative sharing.",
    heroButton: "View Ultra Pro",
    featuresTitle: "Unlock Ultra Pro:",
    features: [
      {
        id: 1,
        icon: CheckCircleIcon,
        name: "Unlimited History",
        description: "Access your complete productivity history.",
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        bg: "bg-green-50",
        text: "text-green-600",
      },
      {
        id: 2,
        icon: DevicePhoneMobileIcon,
        name: "Unlimited Devices",
        description: "Sync every device you own.",
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        bg: "bg-sky-50",
        text: "text-sky-600",
      },
      {
        id: 3,
        icon: SparklesIcon,
        name: "Advanced AI & Sharing",
        description: "Unlock sharing & advanced AI.",
        colSpan: "lg:col-span-2",
        rowSpan: "row-span-1",
        bg: "bg-purple-50",
        text: "text-purple-600",
      },
    ],
  },
};

export default function UpgradeHub({
  currentTier,
}: {
  currentTier: "free" | "basic" | "pro";
}) {
  const upsell = tierUpsells[currentTier] || tierUpsells.free;

  return (
    <div className="space-y-12">
      {/* 1. The Main "Hero" CTA (This part is good) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-tr from-blue-600 to-indigo-700 p-8 md:p-12 shadow-2xl"
      >
        <div
          className="absolute -top-1/2 -left-1/4 w-full h-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <div className="relative z-10 text-center">
          <SparklesIcon className="h-12 w-12 text-white/90 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">
            {upsell.heroTitle}
          </h2>
          <p className="text-lg text-blue-100 max-w-lg mx-auto mb-8">
            {upsell.heroDescription}
          </p>
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Link
              href="/app/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              <ArrowUpCircleIcon className="h-5 w-5" />
              {upsell.heroButton}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 2. "Why Upgrade?" Bento Grid Section (THE FIX) */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {upsell.featuresTitle}
        </h2>

        {/* This is the Bento Grid */}
        <motion.div
          variants={whyContainerVariant} // Use the container variant
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          // This grid setup creates the bento box layout
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[190px]" // Fixed row height
        >
          {/* Map over features */}
          {upsell.features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={bentoCardVariant} // Use the card variant
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              // These colSpan and rowSpan classes create the bento effect
              className={`relative flex flex-col justify-between rounded-xl p-6 ${feature.colSpan} ${feature.rowSpan} ${feature.bg} border border-gray-200 shadow-sm hover:shadow-lg transition-all`}
            >
              <div className="flex flex-col h-full">
                <div className="flex-shrink-0 p-3 bg-white/50 backdrop-blur-md rounded-full inline-flex w-min shadow-sm">
                  <feature.icon
                    className={`h-6 w-6 ${feature.text}`}
                    aria-hidden="true"
                  />
                </div>
                {/* Use flex-grow to push content to bottom */}
                <div className="flex-grow flex flex-col justify-end">
                  <h3 className="text-lg font-semibold text-gray-900 mt-3">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Static "Why TaskGlyph" Card - Common for all upsells */}
          <motion.div
            variants={bentoCardVariant}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative flex flex-col justify-between rounded-xl p-6 col-span-1 row-span-1 bg-gray-800 text-white border border-gray-700 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 p-3 bg-white/10 backdrop-blur-md rounded-full inline-flex w-min shadow-sm">
                <WifiIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex-grow flex flex-col justify-end">
                <h3 className="text-lg font-semibold text-white mt-3">
                  The Offline-First Advantage
                </h3>
                <p className="text-sm text-gray-300">
                  All features work perfectly offline, unlike competitors.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
