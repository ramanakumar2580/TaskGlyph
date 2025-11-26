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
  BoltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { bentoCardVariant, whyContainerVariant } from "@/lib/animations";

// Define what features to show for each upsell
const tierUpsells = {
  free: {
    heroTitle: "Unlock Your Full Potential",
    heroDescription:
      "You're currently on the Free plan. Remove all limits, unlock AI insights, and sync across all your devices.",
    heroButton: "Unlock Pro Features",
    featuresTitle: "Why Upgrade?",
    features: [
      {
        id: 1,
        icon: SparklesIcon,
        name: "AI Weekly Insights",
        description: "Get smart summaries of your productivity habits.",
        colSpan: "lg:col-span-2",
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-100",
      },
      {
        id: 2,
        icon: CheckCircleIcon,
        name: "Unlimited Tasks",
        description: "Never hit a limit again.",
        colSpan: "lg:col-span-1",
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
      },
      {
        id: 3,
        icon: PhotoIcon,
        name: "Media Attachments",
        description: "Add images to your notes.",
        colSpan: "lg:col-span-1",
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
      },
      {
        id: 4,
        icon: DevicePhoneMobileIcon,
        name: "Multi-Device Sync",
        description: "Seamlessly sync up to 5 devices.",
        colSpan: "lg:col-span-2",
        bg: "bg-sky-50",
        text: "text-sky-600",
        border: "border-sky-100",
      },
    ],
  },
  basic: {
    heroTitle: "Experience True Power",
    heroDescription:
      "You're on Basic. Upgrade to Pro for AI insights, priority support, and extended history.",
    heroButton: "Upgrade to Pro",
    featuresTitle: "Pro Features:",
    features: [
      {
        id: 1,
        icon: SparklesIcon,
        name: "AI Intelligence",
        description: "Deep dive analytics into your work.",
        colSpan: "lg:col-span-2",
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-100",
      },
      {
        id: 2,
        icon: BoltIcon,
        name: "Priority Support",
        description: "Skip the line, get help fast.",
        colSpan: "lg:col-span-1",
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
      },
      {
        id: 3,
        icon: DevicePhoneMobileIcon,
        name: "5 Devices",
        description: "Sync your phone, tablet, and laptop.",
        colSpan: "lg:col-span-3",
        bg: "bg-sky-50",
        text: "text-sky-600",
        border: "border-sky-100",
      },
    ],
  },
  pro: {
    heroTitle: "Go Beyond Limits",
    heroDescription:
      "You're a Pro. Now become Ultra. Unlimited everything, collaboration features, and 24/7 support.",
    heroButton: "Get Ultra Plan",
    featuresTitle: "Ultra Exclusives:",
    features: [
      {
        id: 1,
        icon: CheckCircleIcon,
        name: "Forever History",
        description: "Access your entire productivity archive.",
        colSpan: "lg:col-span-1",
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
      },
      {
        id: 2,
        icon: ShieldCheckIcon,
        name: "Collaboration",
        description: "Share projects with your team.",
        colSpan: "lg:col-span-2",
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-100",
      },
      {
        id: 3,
        icon: SparklesIcon,
        name: "Advanced AI",
        description: "Next-gen AI models for insights.",
        colSpan: "lg:col-span-3",
        bg: "bg-fuchsia-50",
        text: "text-fuchsia-600",
        border: "border-fuchsia-100",
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
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* 1. HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl shadow-indigo-500/20"
      >
        {/* Animated Background Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/30 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 blur-[100px] rounded-full" />

        <div className="relative z-10 p-10 md:p-14 text-center">
          <div className="inline-flex p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-inner ring-1 ring-white/20">
            <SparklesIcon className="h-8 w-8 text-yellow-300" />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            {upsell.heroTitle}
          </h2>

          <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
            {upsell.heroDescription}
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/app/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300"
            >
              <ArrowUpCircleIcon className="h-5 w-5" />
              {upsell.heroButton}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 2. BENTO GRID */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-slate-400" />{" "}
            {upsell.featuresTitle}
          </h2>
        </div>

        <motion.div
          variants={whyContainerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[180px]"
        >
          {/* Dynamic Features */}
          {upsell.features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={bentoCardVariant}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`relative flex flex-col justify-between rounded-3xl p-6 ${feature.colSpan} ${feature.bg} border ${feature.border} shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div
                    className={`p-3 bg-white/60 backdrop-blur-sm rounded-2xl w-fit shadow-sm`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.text}`} />
                  </div>
                </div>
                <div>
                  <h3
                    className={`text-lg font-bold ${feature.text.replace(
                      "600",
                      "800"
                    )}`}
                  >
                    {feature.name}
                  </h3>
                  <p
                    className={`text-sm font-medium ${feature.text} opacity-80 mt-1`}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Static Offline Card (Always present) */}
          <motion.div
            variants={bentoCardVariant}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative flex flex-col justify-between rounded-3xl p-6 md:col-span-1 bg-slate-800 text-white border border-slate-700 shadow-xl"
          >
            <div className="flex flex-col h-full justify-between">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl w-fit">
                <WifiIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Offline First</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Works perfectly without internet.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
