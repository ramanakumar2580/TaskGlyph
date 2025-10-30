// src/components/landing/WhoIsItForSection.tsx
"use client";

import { motion } from "framer-motion";
import {
  CodeBracketIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { sectionVariant, itemVariant } from "@/lib/animations"; // Import variants

export default function WhoIsItForSection() {
  const targetUsers = [
    {
      icon: BriefcaseIcon,
      title: "Freelancers & Solopreneurs",
      text: "Manage clients, projects, and personal tasks in one reliable place.",
    },
    {
      icon: AcademicCapIcon,
      title: "Students & Researchers",
      text: "Organize notes, assignments, and deadlines without distractions.",
    },
    {
      icon: CodeBracketIcon,
      title: "Developers & Creatives",
      text: "Capture ideas quickly, track progress, and stay in flow, online or off.",
    },
    {
      icon: UserGroupIcon,
      title: "Remote & Hybrid Workers",
      text: "Stay productive regardless of your location or internet stability.",
    },
  ];

  return (
    <motion.section
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-20 bg-gray-50 border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-16">
          Designed For Modern Achievers
        </h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ staggerChildren: 0.1 }} // Stagger the cards
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {targetUsers.map((who, index) => (
            <motion.div
              key={index}
              variants={itemVariant} // Use the standard item variant
              className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-100 transform transition-transform hover:-translate-y-2 duration-300"
            >
              <who.icon className="h-12 w-12 text-blue-600 mb-5 mx-auto p-2 bg-blue-50 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">
                {who.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {who.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
