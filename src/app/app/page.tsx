// src/app/app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useTier } from "@/lib/db/useTier";

// Import ALL the hub components
import WelcomeHub from "@/components/app/WelcomeHub"; // ✅ 1. Re-imported WelcomeHub
import UpgradeHub from "@/components/app/UpgradeHub";
import TopTierHub from "@/components/app/TopTierHub";

// Loading Skeleton Component
function HubSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-10 w-2/3 bg-gray-200 rounded-lg"></div>
      <div className="h-40 w-full bg-gray-200 rounded-lg"></div>
      <div className="h-8 w-1/3 bg-gray-200 rounded-lg"></div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-36 bg-gray-200 rounded-lg"></div>
        <div className="h-36 bg-gray-200 rounded-lg"></div>
        <div className="h-36 bg-gray-200 rounded-lg"></div>
        <div className="h-36 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

// Main Page Component
export default function AppHomePage() {
  const { data: session } = useSession();
  const tier = useTier();

  // Show loading skeleton while tier is being determined
  if (!tier) {
    return <HubSkeleton />;
  }

  // Determine which hub to show
  const isTopTier = tier === "ultra_pro";
  const currentTier = tier as "free" | "basic" | "pro";

  return (
    <div className="space-y-12">
      {" "}
      {/* Increased main spacing */}
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
        </h1>
      </div>
      {/* ✅ 2. New "Welcome Hub" - Shows for EVERYONE */}
      <WelcomeHub />
      {/* ✅ 3. Tier-Specific Hub - Shows Upgrade or Pro */}
      {isTopTier ? <TopTierHub /> : <UpgradeHub currentTier={currentTier} />}
    </div>
  );
}
