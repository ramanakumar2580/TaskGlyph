// src/components/Navbar.tsx
"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import Image from "next/image"; // Import Next.js Image component

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Update navbar style based on scroll position
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-white/80 backdrop-blur-lg shadow-sm border-gray-200"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar height is h-16 (64px). Let's make logo nearly fill it. */}
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="TaskGlyph Homepage"
          >
            <Image
              src="/logo.png" // Use the correct PNG file from /public folder
              alt="TaskGlyph Logo"
              width={240} // Further increased base width (adjust aspect ratio if needed)
              height={60} // Further increased base height (adjust aspect ratio if needed)
              priority
              className="h-45 w-auto transition-transform group-hover:scale-100" // Increased height to h-14 (56px) - nearly fills h-16 navbar
            />
          </Link>

          {/* Nav Links (Centered) */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-8 group">
            {["Features", "Why Us", "Pricing"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="relative text-gray-600 hover:text-blue-600 transition-colors py-1"
              >
                {item}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 origin-center"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className={`text-sm font-medium transition-colors ${
                isScrolled
                  ? "text-gray-600 hover:text-blue-600"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-150 ease-in-out transform hover:scale-105 shadow hover:shadow-md"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
