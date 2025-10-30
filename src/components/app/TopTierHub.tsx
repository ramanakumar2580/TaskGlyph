// src/components/app/TopTierHub.tsx
"use client";

import Link from "next/link";
import {
  ListBulletIcon,
  PencilIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  PhotoIcon,
  DevicePhoneMobileIcon,
  UsersIcon, // For Collaboration
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import {
  itemVariant,
  sectionVariant,
  bentoCardVariant,
} from "@/lib/animations";

export default function TopTierHub() {
  const allFeatures = [
    { name: "Unlimited Tasks", icon: ListBulletIcon },
    { name: "Unlimited Notes", icon: PencilIcon },
    { name: "Personal Diary", icon: BookOpenIcon },
    { name: "Unlimited Pomodoro", icon: ClockIcon },
    { name: "Full Year+ History", icon: CheckCircleIcon },
    { name: "Unlimited Image Uploads", icon: PhotoIcon },
    { name: "Unlimited Device Sync", icon: DevicePhoneMobileIcon },
    { name: "AI Weekly Insights", icon: SparklesIcon },
    { name: "Collaborative Sharing", icon: UsersIcon },
  ];

  const quickLinks = [
    {
      name: "Go to Tasks",
      href: "/app/tasks",
      icon: ListBulletIcon,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      name: "Write a Note",
      href: "/app/notes",
      icon: PencilIcon,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    {
      name: "Start Timer",
      href: "/app/pomodoro",
      icon: ClockIcon,
      bg: "bg-red-50",
      text: "text-red-600",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. "Glassmorphism" Hero Card */}
      <motion.div
        variants={itemVariant}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/70 p-8 shadow-2xl backdrop-blur-lg"
      >
        {/* Flowing Gradient */}
        <motion.div
          className="absolute -top-1/2 -left-1/4 -z-10 h-[200%] w-[200%]"
          style={{
            background:
              "radial-gradient(circle at 10% 20%, rgb(224 242 254), transparent 30%), radial-gradient(circle at 90% 80%, rgb(233 213 255), transparent 30%)",
          }}
          animate={{
            transform: ["translateX(0%)", "translateX(20%)", "translateX(0%)"],
          }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
        />

        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-700">
            Ultra Pro
          </span>
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          You have unlocked every feature TaskGlyph has to offer. Thank you for
          your support.
        </p>
      </motion.div>

      {/* 2. Quick Access Links (More Visual) */}
      <motion.div
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {quickLinks.map((link) => (
          <motion.div
            key={link.name}
            variants={bentoCardVariant}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              href={link.href}
              className={`group flex items-center justify-between p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all duration-300`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`p-3 rounded-full inline-flex ${link.bg} group-hover:bg-blue-100 transition-colors`}
                >
                  <link.icon
                    className={`h-6 w-6 ${link.text} group-hover:text-blue-600 transition-colors`}
                  />
                </span>
                <h3 className="text-md font-semibold text-gray-900">
                  {link.name}
                </h3>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. "Your Unlocked Features" List */}
      <motion.div
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-5">
          Your Activated Power-Ups
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {allFeatures.map((feature) => (
            <div
              key={feature.name}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
