"use client";

import { useState } from "react";

const QUICK_STARTS = [
  { command: "brainstorm", topic: "", label: "Brainstorm ideas", icon: "✦", placeholder: "What topic?" },
  { command: "outline",    topic: "", label: "Build an outline",  icon: "≡", placeholder: "What subject?" },
  { command: "explain",    topic: "", label: "Explain a concept", icon: "◎", placeholder: "What concept?" },
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
    <div className="mb-8 animate-in fade-in duration-500">
      {!active ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 shadow-[0_0_6px_#818cf8]" />
            <p className="text-xs uppercase tracking-widest text-[#444]">AI is ready</p>
          </div>

          <p className="mb-5 text-[15px] leading-relaxed text-[#555]">
            Start writing, or let the AI open the page for you.
          </p>

          <div className="flex flex-wrap gap-2">
            {QUICK_STARTS.map((q) => (
              <button
                key={q.command}
                onClick={() => setActive(q.command)}
                className="flex items-center gap-2 rounded-lg border border-[#1e1e1e] bg-[#111] px-3.5 py-2 text-sm text-[#666] transition-all hover:border-indigo-500/30 hover:bg-[#0f0f1a] hover:text-indigo-400"
              >
                <span className="text-indigo-400/60">{q.icon}</span>
                {q.label}
              </button>
            ))}
            <button
              onClick={onDismiss}
              className="rounded-lg px-3.5 py-2 text-sm text-[#333] transition-colors hover:text-[#555]"
            >
              Just write
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-indigo-500/20 bg-[#0d0d0d] p-6 animate-in fade-in duration-200">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm text-indigo-400">{activeItem?.icon}</span>
            <p className="text-sm font-medium text-white">{activeItem?.label}</p>
          </div>
          <input
            autoFocus
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
              if (e.key === "Escape") setActive(null);
            }}
            placeholder={activeItem?.placeholder}
            className="w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-[#2a2a2a] outline-none transition-colors focus:border-indigo-500/50"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleStart}
              disabled={!topic.trim()}
              className="flex-1 rounded-lg bg-indigo-500/10 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20 disabled:opacity-30"
            >
              Generate
            </button>
            <button
              onClick={() => setActive(null)}
              className="rounded-lg px-4 text-sm text-[#444] transition-colors hover:bg-[#1a1a1a] hover:text-[#888]"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
