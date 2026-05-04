"use client";

import { useState } from "react";

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
    <div className="mb-10 animate-in fade-in duration-500">
      {!active ? (
        <div className="py-2">
          {/* AI presence indicator — indigo here is correct, AI is present */}
          <div className="mb-5 flex items-center gap-2">
            <span className="h-1 w-1 animate-pulse rounded-full bg-indigo-400/60" />
            <p className="text-xs text-[#333]">AI is ready</p>
          </div>

          <p className="mb-5 text-[#333]">Start writing, or let the AI begin.</p>

          <div className="flex flex-wrap gap-2">
            {QUICK_STARTS.map((q) => (
              <button
                key={q.command}
                onClick={() => setActive(q.command)}
                className="rounded-lg border border-[#1a1a1a] px-3.5 py-2 text-sm text-[#444] transition-colors hover:border-[#2a2a2a] hover:text-white"
              >
                {q.label}
              </button>
            ))}
            <button
              onClick={onDismiss}
              className="rounded-lg px-3.5 py-2 text-sm text-[#222] transition-colors hover:text-[#444]"
            >
              Just write
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <p className="mb-3 text-sm font-medium text-white">{activeItem?.label}</p>
          <input
            autoFocus
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
              if (e.key === "Escape") setActive(null);
            }}
            placeholder={activeItem?.placeholder}
            className="w-full rounded-lg border border-[#1a1a1a] bg-transparent px-4 py-2.5 text-sm text-white placeholder-[#222] outline-none transition-colors focus:border-[#333]"
          />
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleStart}
              disabled={!topic.trim()}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-85 disabled:opacity-30"
            >
              Generate
            </button>
            <button
              onClick={() => setActive(null)}
              className="text-sm text-[#333] transition-colors hover:text-[#666]"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
