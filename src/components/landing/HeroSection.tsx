// src/components/landing/HeroSection.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

const IMAGES = [
  "/Images/shot-1.png",
  "/Images/shot-2.png",
  "/Images/shot-3.png",
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();
  const [scrollDistance, setScrollDistance] = useState(0);
  const [duration, setDuration] = useState(14);
  const [isHovering, setIsHovering] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  // Measure heights after images load or window resize
  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      const stack = stackRef.current;
      if (!container || !stack) return;

      const containerH = container.clientHeight;
      const stackH = stack.scrollHeight;

      const distance = Math.max(0, stackH - containerH);
      setScrollDistance(distance);

      // duration scales with distance so it feels natural
      const base = 10;
      const comp = Math.min(
        36,
        Math.max(6, Math.round((distance / 600) * base + 6))
      );
      setDuration(comp);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [loadedCount]);

  // Start/stop animation
  useEffect(() => {
    if (!containerRef.current || !stackRef.current) return;

    if (scrollDistance <= 2) {
      controls.set({ y: 0 });
      return;
    }
    if (isHovering) {
      controls.stop();
      return;
    }

    controls.start({
      y: [0, -scrollDistance, 0],
      transition: {
        duration: duration,
        ease: "linear",
        times: [0, 0.5, 1],
        repeat: Infinity,
      },
    });
  }, [scrollDistance, duration, isHovering, controls]);

  function handleImgLoad() {
    setLoadedCount((c) => c + 1);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/50 to-white pt-28 pb-28 md:pt-44 md:pb-32">
      {/* small header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900">
          Never Lose Your Flow,
          <br />
          <span className="text-blue-600">Even When You&apos;re Offline.</span>
        </h1>
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          Demo — auto-scrolling screenshots inside a laptop mockup. Hover to
          pause.
        </p>
        <div className="mt-6">
          <Link
            href="/auth/signin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow"
          >
            Try TaskGlyph Free
          </Link>
        </div>
      </div>

      {/* laptop mockup */}
      <div className="relative mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* bezel */}
        <div
          className="mx-auto rounded-2xl bg-gray-900 border-[8px] border-gray-800 overflow-hidden relative"
          style={{ width: "100%", maxWidth: 800, height: 500 }}
        >
          {/* screen mask */}
          <div
            ref={containerRef}
            className="w-full h-full bg-[#f4f5f7] relative overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* stacked screenshots */}
            <motion.div
              ref={stackRef}
              animate={controls}
              className="w-full flex flex-col items-stretch"
              style={{ willChange: "transform" }}
            >
              {IMAGES.map((src, idx) => (
                <div
                  key={idx}
                  className="w-full"
                  // slight overlap to hide seams
                  style={{ marginTop: idx === 0 ? 0 : -6 }}
                >
                  {/* REVERTED TO STANDARD IMG TAG FOR LAYOUT SAFETY */}
                  <img
                    src={src}
                    alt={`screenshot-${idx + 1}`}
                    onLoad={handleImgLoad}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%", // Ensures it fills the frame height exactly
                      display: "block",
                      objectFit: "cover", // Ensures no stretching; crops if necessary
                      borderRadius: 6,
                      boxShadow: "0 8px 30px rgba(6,8,15,0.06)",
                    }}
                  />
                </div>
              ))}
            </motion.div>

            {/* top & bottom gradient masks */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                pointerEvents: "none",
                background:
                  "linear-gradient(180deg, rgba(244,245,247,1) 0%, rgba(244,245,247,0) 85%)",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 56,
                pointerEvents: "none",
                background:
                  "linear-gradient(0deg, rgba(244,245,247,1) 0%, rgba(244,245,247,0) 85%)",
              }}
            />

            {/* subtle inner rim */}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/6" />
          </div>
        </div>

        {/* laptop base */}
        <div
          className="mx-auto bg-gray-700 rounded-b-2xl mt-4"
          style={{ height: 28, maxWidth: 800 }}
        >
          <div
            className="relative w-full"
            style={{ maxWidth: 800, margin: "0 auto" }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-b-lg"
              style={{
                width: 120,
                height: 10,
                backgroundColor: "#2b3440",
                top: -10,
              }}
            />
          </div>
        </div>

        <div className="mt-3 text-center text-sm text-gray-500">
          Auto-scrolling demo — hover to pause
        </div>
      </div>
    </section>
  );
}
