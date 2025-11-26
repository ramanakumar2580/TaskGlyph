"use client";

import React from "react";
// Using relative paths to ensure resolution in this environment
import { useTier } from "../../lib/db/useTier";
import WelcomeHub from "../../components/app/WelcomeHub";
import UpgradeHub from "../../components/app/UpgradeHub";
import TopTierHub from "../../components/app/TopTierHub";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AppPage() {
  const tier = useTier();

  // Safe normalization (Handle 'Ultra', 'ultra', 'ultra_pro' etc)
  const currentTier = (tier || "free").toLowerCase();

  // 1. Loading State (Premium Loader)
  if (tier === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-100 opacity-75"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          </div>
          <p className="animate-pulse text-sm font-medium text-gray-400 tracking-wide">
            Syncing Workspace...
          </p>
        </div>
      </div>
    );
  }

  // 2. ULTRA / ULTRA PRO LOGIC (The God Mode View)
  if (currentTier === "ultra" || currentTier === "ultra_pro") {
    return (
      <div className="min-h-screen w-full bg-slate-50/50">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Ultra users get the Command Center */}
            <TopTierHub />
          </motion.div>
        </main>
      </div>
    );
  }

  // 3. STANDARD VIEW (Free / Basic / Pro)
  // Vallaki Welcome Screen + Upgrade Options kanipistayi
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC]">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12 pb-24">
        {/* Welcome Header with Slide-Down Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <WelcomeHub />
        </motion.div>

        {/* Upsell Section with Slide-Up Animation & Delay */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {/* Force type casting if your types are strict */}
          <UpgradeHub currentTier={currentTier as "free" | "basic" | "pro"} />
        </motion.div>
      </main>
    </div>
  );
}
