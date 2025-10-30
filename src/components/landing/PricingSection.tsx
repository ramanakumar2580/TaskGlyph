// src/components/landing/PricingSection.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";
import { sectionVariant } from "@/lib/animations"; // Import variants

export default function PricingSection() {
  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      frequency: "/ forever",
      description: "For individuals starting out.",
      features: [
        "Works Offline",
        "Sync Enabled (Limited)",
        "21 Tasks",
        "14 Notes",
        "21 Pomodoro Sessions / month",
        "1 Device",
        "7-day History",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Basic",
      price: "$5",
      frequency: "/ month",
      description: "For individuals needing more.",
      features: [
        "Everything in Free, plus:",
        "Unlimited Tasks & Notes",
        "Personal Diary",
        "30-day History",
        "2 Devices",
        "10 Images / month",
      ],
      cta: "Choose Basic",
      popular: false,
    },
    {
      name: "Pro",
      price: "$12",
      frequency: "/ month",
      description: "For power users and professionals.",
      features: [
        "Everything in Basic, plus:",
        "90-day History",
        "5 Devices",
        "100 Images / month",
        "AI Weekly Insights",
      ],
      cta: "Choose Pro",
      popular: true,
    },
    {
      name: "Ultra Pro",
      price: "$25",
      frequency: "/ month",
      description: "For advanced users & collaborators.",
      features: [
        "Everything in Pro, plus:",
        "Full Year+ History",
        "Unlimited Devices",
        "Unlimited Images",
        "Advanced AI Features",
        "Collaborative Sharing",
      ],
      cta: "Choose Ultra Pro",
      popular: false,
    },
  ];

  return (
    <motion.section
      id="pricing" // ID for navbar link
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-24 bg-white border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Simple Plans for Every Need
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Start free forever. Upgrade for unlimited features and advanced
            capabilities when you&apos;re ready.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ staggerChildren: 0.1 }} // Stagger card animation
          className="mt-20 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4"
        >
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={{
                // Slightly adjusted item variant for pricing cards
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`relative flex flex-col p-8 bg-white rounded-2xl shadow-xl border ${
                tier.popular
                  ? "border-blue-500 ring-4 ring-blue-500/50" // Enhanced popular ring
                  : "border-gray-200"
              } transform transition-transform hover:scale-[1.03] duration-300`} // Added hover scale
            >
              {tier.popular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-600 text-white shadow">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mt-2">
                {tier.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500 flex-grow min-h-[40px]">
                {tier.description}
              </p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-gray-900">
                  {tier.price}
                </span>
                <span className="text-base font-medium text-gray-500">
                  {tier.frequency}
                </span>
              </div>
              <ul role="list" className="mt-8 space-y-4 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex space-x-3">
                    <CheckIcon
                      className={`flex-shrink-0 h-6 w-6 ${
                        feature.startsWith("Everything")
                          ? "text-gray-400" // Dim 'Everything in...'
                          : "text-green-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-sm ${
                        feature.startsWith("Everything")
                          ? "text-gray-400 italic"
                          : "text-gray-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signin"
                className={`mt-10 block w-full py-3 px-6 border border-transparent rounded-lg text-center text-base font-medium transition-all transform hover:scale-105 ${
                  tier.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/60"
                    : "bg-gray-100 text-blue-700 hover:bg-gray-200"
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
