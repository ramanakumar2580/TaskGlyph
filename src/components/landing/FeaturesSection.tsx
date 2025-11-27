// src/components/landing/FeaturesSection.tsx
"use client";

import { motion } from "framer-motion";
import {
  CheckIcon,
  ListBulletIcon,
  PencilSquareIcon,
  BookOpenIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  sectionVariant,
  itemVariantXLeft,
  itemVariantXRight,
} from "@/lib/animations";

/* eslint-disable @next/next/no-img-element */

export default function FeaturesSection() {
  const features = [
    {
      icon: ListBulletIcon,
      title: "Tasks That Keep Up With You",
      description:
        "From quick to-dos to complex projects, manage everything effortlessly. Add details, set priorities, and never miss a beat, even offline.",
      points: [
        "Simple & nested tasks",
        "Priorities & details",
        "Always available offline",
      ],
      image: "/images/Tasks.png", // Ensure paths start with /
      imageSide: "right",
    },
    {
      icon: PencilSquareIcon,
      title: "Notes That Capture Your Flow",
      description:
        "Capture inspiration instantly with rich Markdown notes. Format your thoughts, embed images (soon!), and keep everything organized.",
      points: [
        "Full Markdown support",
        "Clean & focused writing",
        "Syncs across devices",
      ],
      image: "/images/Notes.png",
      imageSide: "left",
    },
    {
      icon: BookOpenIcon,
      title: "Your Private Digital Diary",
      description:
        "Reflect on your day, track habits, or jot down thoughts privately. Your personal space, synced securely (paid plans).",
      points: [
        "Daily reflection space",
        "Simple & private entry",
        "Secure cloud backup (Paid)",
      ],
      image: "/images/Diary.png",
      imageSide: "right",
    },
    {
      icon: ClockIcon,
      title: "Master Your Focus Time",
      description:
        "Beat procrastination with the built-in Pomodoro timer. Track focus sessions and breaks effortlessly, see your progress over time.",
      points: [
        "Configurable work/break",
        "Persistent across tabs",
        "Session history & stats",
      ],
      image: "/images/Pomodoro.png",
      imageSide: "left",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-white overflow-hidden border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            All Your Tools, Beautifully Integrated
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Focus on your work, not on juggling apps. TaskGlyph provides
            everything you need.
          </p>
        </motion.div>

        {/* Alternating Feature Blocks */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${
                feature.imageSide === "left" ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Text Content */}
              <div className="md:w-1/2 lg:pr-10">
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-3xl font-semibold text-gray-900 mb-5">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-4 text-gray-700">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-center text-lg">
                      <CheckIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Feature Image */}
              <div className="md:w-1/2 w-full">
                <motion.div
                  variants={
                    feature.imageSide === "left"
                      ? itemVariantXLeft
                      : itemVariantXRight
                  }
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7 }}
                >
                  {/* CHANGED: Removed aspect-video and object-cover */}
                  <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 hover:scale-[1.02] transition-transform duration-300 bg-white">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      // CHANGED: w-full h-auto ensures the image fits perfectly without cropping
                      className="w-full h-auto block"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
