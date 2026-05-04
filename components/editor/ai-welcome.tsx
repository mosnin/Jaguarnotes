"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, buttonTap, springStd } from "@/lib/motion";

const QUICK_STARTS = [
  {
    command: "brainstorm",
    label: "Explore an idea",
    sub: "Brainstorm",
    placeholder: "What's the idea?",
    multiline: false,
  },
  {
    command: "premortem",
    label: "Challenge a plan",
    sub: "Pre-mortem",
    placeholder: "What's the plan or decision?",
    multiline: false,
  },
  {
    command: "compress",
    label: "Sharpen your writing",
    sub: "Compress",
    placeholder: "Paste what you want to sharpen...",
    multiline: true,
  },
] as const;

interface AIWelcomeProps {
  onCommand: (command: string, topic: string) => void;
  onDismiss: () => void;
}

export function AIWelcome({ onCommand, onDismiss }: AIWelcomeProps) {
  const [active, setActive] = useState<string | null>(null);
  const [topic, setTopic] = useState("");

  const activeItem = QUICK_STARTS.find((q) => q.command === active);

  function handleStart() {
    if (!active || !topic.trim()) return;
    onCommand(active, topic.trim());
    onDismiss();
  }

  function handleBack() {
    setActive(null);
    setTopic("");
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-10">
      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="py-2"
          >
            <p className="mb-6 text-base text-ink-3">Your thinking partner is ready.</p>

            <div className="flex flex-col gap-1.5">
              {QUICK_STARTS.map((q) => (
                <motion.button
                  key={q.command}
                  {...buttonTap}
                  onClick={() => setActive(q.command)}
                  className="group flex items-center justify-between rounded-lg border border-line-1 px-4 py-3 text-left transition-colors hover:border-line-2 hover:bg-raised"
                >
                  <span className="text-sm font-medium text-ink-1">{q.label}</span>
                  <span className="text-xs text-ink-4 transition-colors group-hover:text-ink-3">{q.sub}</span>
                </motion.button>
              ))}
            </div>

            <button
              onClick={onDismiss}
              className="mt-5 text-xs text-ink-4 transition-colors hover:text-ink-3"
            >
              Just write →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={springStd}
          >
            <p className="mb-3 text-sm font-medium text-ink-1">{activeItem?.label}</p>

            {activeItem?.multiline ? (
              <textarea
                autoFocus
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleStart();
                  if (e.key === "Escape") handleBack();
                }}
                placeholder={activeItem?.placeholder}
                rows={4}
                className="w-full resize-none rounded-lg border border-line-1 bg-transparent px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-line-2"
              />
            ) : (
              <input
                autoFocus
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStart();
                  if (e.key === "Escape") handleBack();
                }}
                placeholder={activeItem?.placeholder}
                className="w-full rounded-lg border border-line-1 bg-transparent px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-line-2"
              />
            )}

            <div className="mt-3 flex items-center gap-4">
              <motion.button
                {...buttonTap}
                onClick={handleStart}
                disabled={!topic.trim()}
                className="text-lg text-ink-1 transition-opacity hover:opacity-60 disabled:opacity-25"
              >
                →
              </motion.button>
              <button
                onClick={handleBack}
                className="text-xs text-ink-4 transition-colors hover:text-ink-3"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
