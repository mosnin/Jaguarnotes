"use client";

import { motion, AnimatePresence } from "framer-motion";
import { springSnap } from "@/lib/motion";

interface WordCountPillProps {
  wordCount: number;
  className?: string;
}

export function WordCountPill({ wordCount, className }: WordCountPillProps) {
  const readingTimeMin = Math.max(1, Math.round(wordCount / 200));
  const readingLabel =
    readingTimeMin < 2
      ? "~1 min read"
      : `~${readingTimeMin} min read`;

  return (
    <AnimatePresence>
      {wordCount > 0 && (
        <motion.div
          key="word-pill"
          initial={{ opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 4 }}
          transition={springSnap}
          className={
            className ??
            "fixed bottom-6 right-6 z-20 flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5 text-xs text-ink-3 neu-sm md:bottom-6 md:right-6 bottom-24 right-4"
          }
        >
          <svg
            className="h-3 w-3 shrink-0 text-ink-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
            />
          </svg>
          <span className="font-medium tabular-nums">
            {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
          </span>
          <span className="text-ink-4">·</span>
          <span>{readingLabel}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
