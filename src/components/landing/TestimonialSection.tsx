// src/components/landing/TestimonialSection.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/outline";

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role?: string;
  location?: string;
  rating?: number;
  tags?: string[];
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "TaskGlyph changed how I work on trains and planes. Offline-first syncing means I never lose train-of-thought, and the minimal UI helps me focus.",
    name: "Ananya R",
    role: "Product Designer",
    location: "Bengaluru",
    rating: 5,
    tags: ["Focused", "Remote"],
  },
  {
    id: "t2",
    quote:
      "Simple, fast and reliable. The Pomodoro integration kept my productivity steady — and the diary helped me reflect weekly.",
    name: "Karthik S",
    role: "Full-stack Engineer",
    location: "Chennai",
    rating: 5,
    tags: ["Developer", "Focus"],
  },
  {
    id: "t3",
    quote:
      "I switched from four apps to TaskGlyph — tasks, notes, and a timer in one clean place. The offline mode saved me multiple times during travel.",
    name: "Meera P",
    role: "Freelancer",
    location: "Hyderabad",
    rating: 5,
    tags: ["Freelance", "Offline"],
  },
  {
    id: "t4",
    quote:
      "For team leads, TaskGlyph is simple to adopt. Great UX, low friction and the sync works perfectly when people come back online.",
    name: "Ravi D",
    role: "Engineering Manager",
    location: "Pune",
    rating: 4,
    tags: ["Manager", "Team"],
  },
  {
    id: "t5",
    quote:
      "I love the notes. Clean markdown support and fast search — my writing flow never stops even when my Wi-Fi does.",
    name: "Sana K",
    role: "Writer",
    location: "Delhi",
    rating: 5,
    tags: ["Notes", "Writer"],
  },
];

function starString(n = 5) {
  return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

export default function TestimonialSection() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const autoplayMs = 5000;
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const dragLockRef = useRef(false);

  // filtered testimonials
  const filtered = TESTIMONIALS.filter((t) => {
    if (filterTag && !t.tags?.includes(filterTag)) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      t.quote.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      (t.role || "").toLowerCase().includes(q)
    );
  });

  // normalize index
  useEffect(() => {
    if (filtered.length === 0) {
      setIndex(0);
    } else if (index >= filtered.length) {
      setIndex(0);
    }
  }, [filtered.length, index]);

  // autoplay via RAF (smooth progress)
  useEffect(() => {
    if (isPaused || filtered.length <= 1) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
      return;
    }

    function tick(ts: number) {
      if (!lastTickRef.current) lastTickRef.current = ts;
      const dt = ts - (lastTickRef.current || ts);
      lastTickRef.current = ts;
      setProgress((p) => {
        const next = p + dt / autoplayMs;
        if (next >= 1) {
          setIndex((i) => (i + 1) % filtered.length);
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = null;
    };
  }, [isPaused, filtered.length]);

  // keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        setIndex(
          (i) => (i - 1 + filtered.length) % Math.max(1, filtered.length)
        );
        setProgress(0);
      }
      if (e.key === "ArrowRight") {
        setIndex((i) => (i + 1) % Math.max(1, filtered.length));
        setProgress(0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered.length]);

  const allTags = Array.from(
    new Set(TESTIMONIALS.flatMap((t) => t.tags || []))
  );

  // copy to clipboard
  const copyQuote = useCallback(async (t: Testimonial | undefined) => {
    if (!t) return;
    try {
      await navigator.clipboard.writeText(`${t.quote}\n— ${t.name}`);
      // small visual cue - prefer non-blocking but user asked for code only — use alert for simplicity
      // In production replace with a toast/snack
      alert("Quote copied to clipboard");
    } catch {
      alert("Unable to copy");
    }
  }, []);

  // native share (fallback to copy)
  const shareQuote = useCallback(
    (t: Testimonial | undefined) => {
      if (!t) return;
      if (navigator.share) {
        navigator
          .share({
            title: `Quote — ${t.name}`,
            text: `${t.quote}\n— ${t.name}, ${t.role || ""}`,
          })
          .catch(() => {});
      } else {
        copyQuote(t);
      }
    },
    [copyQuote]
  );

  // drag end threshold handler
  function handleDragEnd(info: {
    offset: { x: number };
    velocity: { x: number };
  }) {
    const offsetX = info.offset.x;
    const velX = info.velocity.x;
    if (Math.abs(offsetX) > 80 || Math.abs(velX) > 200) {
      if (offsetX < 0) {
        setIndex((i) => (i + 1) % Math.max(1, filtered.length));
      } else {
        setIndex(
          (i) => (i - 1 + filtered.length) % Math.max(1, filtered.length)
        );
      }
      setProgress(0);
      dragLockRef.current = true;
      setTimeout(() => (dragLockRef.current = false), 350);
    }
  }

  useEffect(() => setProgress(0), [index]);

  const current = filtered[index];

  return (
    <section className="relative py-20 bg-gradient-to-b from-blue-50/40 via-white to-white border-t border-gray-100">
      <div
        aria-hidden
        className="pointer-events-none absolute left-6 top-6 text-[160px] text-blue-50 select-none -z-10"
      >
        “
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <SparklesIcon className="h-10 w-10 text-yellow-500 mx-auto" />
          <h2 className="text-3xl font-extrabold text-gray-900 mt-3">
            Voices of Focus — text-first testimonials
          </h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            No photos. Only honest words — discover how people rely on
            TaskGlyph.
          </p>
        </div>

        {/* Top controls row: Filters | search | showing & matches aligned */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 hidden md:block">Filter:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTag(null)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterTag === null
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border border-gray-200"
                }`}
                aria-pressed={filterTag === null}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setFilterTag((prev) => (prev === t ? null : t))
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterTag === t
                      ? "bg-blue-600 text-white shadow"
                      : "bg-white border border-gray-200"
                  }`}
                  aria-pressed={filterTag === t}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              aria-label="Search testimonials"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quotes, names or roles..."
              className="rounded-full border border-gray-200 px-4 py-2 text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            {/* aligned showing & matches */}
            <div className="ml-2 text-sm text-gray-500 whitespace-nowrap">
              <span className="mr-4">
                Matches:{" "}
                <span className="font-semibold text-gray-700">
                  {filtered.length}
                </span>
              </span>
              <span>
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {filtered.length ? index + 1 : 0}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {filtered.length}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Carousel container - arrows positioned left/right outside the card */}
        <div className="relative">
          {/* Left arrow */}
          <button
            aria-label="Previous"
            onClick={() => {
              setIndex(
                (i) => (i - 1 + filtered.length) % Math.max(1, filtered.length)
              );
              setProgress(0);
            }}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 transition"
          >
            <span className="text-lg">‹</span>
          </button>

          {/* Right arrow */}
          <button
            aria-label="Next"
            onClick={() => {
              setIndex((i) => (i + 1) % Math.max(1, filtered.length));
              setProgress(0);
            }}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 transition"
          >
            <span className="text-lg">›</span>
          </button>

          <div
            ref={carouselRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            role="region"
            aria-roledescription="carousel"
            aria-label="User testimonials"
            aria-live="polite"
            tabIndex={0}
            className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 mb-6"
          >
            {/* subtle progress bar */}
            <div className="h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <motion.div
                style={{
                  width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
                }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* meta column */}
              <div className="w-full md:w-1/4 flex-shrink-0">
                <div className="text-sm text-gray-500">Rating</div>
                <div className="text-lg font-semibold text-indigo-600 mt-1">
                  {current ? starString(current.rating ?? 5) : "—"}
                </div>

                <div className="mt-4 text-sm text-gray-500">Author</div>
                <div className="text-base font-semibold text-gray-900">
                  {current?.name ?? "—"}
                </div>
                <div className="text-sm text-gray-500">
                  {current?.role ?? ""}
                </div>
                <div className="text-sm text-gray-400">
                  {current?.location ?? ""}
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  {(current?.tags || []).map((tg) => (
                    <span
                      key={tg}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tg}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() => copyQuote(current)}
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => shareQuote(current)}
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* quote area */}
              <div className="flex-1 min-h-[140px]">
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragStart={() => {
                    setIsPaused(true);
                    dragLockRef.current = true;
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onDragEnd={(e: any, info: any) => {
                    setIsPaused(false);
                    handleDragEnd(info);
                  }}
                  className="cursor-grab"
                >
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {current ? (
                        <motion.blockquote
                          key={current.id}
                          initial={{ opacity: 0, y: 8, scale: 0.995 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.995 }}
                          transition={{ duration: 0.45 }}
                          className="text-lg md:text-xl leading-relaxed text-gray-800 italic select-text"
                        >
                          “{current.quote}”
                        </motion.blockquote>
                      ) : (
                        <motion.p
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          No testimonials found.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* pager + dots */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="mr-2">Showing</span>
                      <span className="font-medium text-gray-700">
                        {filtered.length ? index + 1 : 0}
                      </span>
                      <span className="mx-2">of</span>
                      <span className="font-medium text-gray-700">
                        {filtered.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {filtered.map((_, i) => (
                        <button
                          key={i}
                          aria-label={`Go to testimonial ${i + 1}`}
                          onClick={() => {
                            setIndex(i);
                            setProgress(0);
                          }}
                          className={`w-2 h-2 rounded-full ${
                            i === index ? "bg-indigo-600" : "bg-gray-300"
                          } transition`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* quick scan grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
            >
              <p className="text-gray-700 mb-3 leading-snug">“{t.quote}”</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-500">
                    {t.role} · {t.location}
                  </div>
                </div>
                <div className="text-sm text-indigo-600 font-medium">
                  {starString(t.rating ?? 5)}
                </div>
              </div>
            </motion.blockquote>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => (window.location.href = "/auth/signin")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Try TaskGlyph — free
          </button>
        </div>
      </div>
    </section>
  );
}
