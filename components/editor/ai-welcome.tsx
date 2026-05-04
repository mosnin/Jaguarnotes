"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { buttonTap, fadeUp } from "@/lib/motion";

const QUICK_STARTS = [
  { command: "brainstorm", label: "Brainstorm ideas",  placeholder: "What topic?" },
  { command: "outline",    label: "Build an outline",  placeholder: "What subject?" },
  { command: "explain",    label: "Explain a concept", placeholder: "What concept?" },
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

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="mb-10"
    >
      {!active ? (
        <div className="py-2">
          {/* AI presence indicator — indigo here is correct, AI is present */}
          <div className="mb-5 flex items-center gap-2">
            <span className="h-1 w-1 animate-pulse rounded-full bg-ai/60" />
            <p className="text-xs text-ink-4">AI is ready</p>
          </div>

          <p className="mb-5 text-ink-4">Start writing, or let the AI begin.</p>

          <div className="flex flex-wrap gap-2">
            {QUICK_STARTS.map((q) => (
              <motion.button
                key={q.command}
                {...buttonTap}
                onClick={() => setActive(q.command)}
                className="rounded-lg border border-line-1 px-3.5 py-2 text-sm text-ink-3 transition-colors hover:border-line-2 hover:text-ink-1"
              >
                {q.label}
              </motion.button>
            ))}
            <button
              onClick={onDismiss}
              className="rounded-lg px-3.5 py-2 text-sm text-ink-4 transition-colors hover:text-ink-3"
            >
              Just write
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.9 }}
        >
          <p className="mb-3 text-sm font-medium text-ink-1">{activeItem?.label}</p>
          <input
            autoFocus
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
              if (e.key === "Escape") setActive(null);
            }}
            placeholder={activeItem?.placeholder}
            className="w-full rounded-lg border border-line-1 bg-transparent px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-line-2"
          />
          <div className="mt-3 flex gap-3">
            <motion.button
              {...buttonTap}
              onClick={handleStart}
              disabled={!topic.trim()}
              className="rounded-lg bg-ink-1 px-4 py-2 text-sm font-semibold text-app transition-opacity hover:opacity-85 disabled:opacity-30"
            >
              Generate
            </motion.button>
            <button
              onClick={() => setActive(null)}
              className="text-sm text-ink-3 transition-colors hover:text-ink-1"
            >
              Back
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
