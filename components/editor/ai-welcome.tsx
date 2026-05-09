"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springSnap, springStd, buttonTap } from "@/lib/motion";

const QUICK_STARTS = [
  {
    command: "brainstorm",
    emoji: "💡",
    label: "Brainstorm ideas",
    placeholder: "What topic do you want to explore?",
    multiline: false,
  },
  {
    command: "outline",
    emoji: "📋",
    label: "Create an outline",
    placeholder: "What do you want to structure?",
    multiline: false,
  },
  {
    command: "premortem",
    emoji: "🔍",
    label: "Stress-test a plan",
    placeholder: "What plan or decision should we pressure-test?",
    multiline: false,
  },
  {
    command: "compress",
    emoji: "✂️",
    label: "Sharpen writing",
    placeholder: "Paste text to compress and clarify…",
    multiline: true,
  },
] as const;

type Phase = "list" | "input" | "streaming" | "done";

interface AIWelcomeProps {
  onInsert: (text: string) => void;
  onDismiss: () => void;
}

export function AIWelcome({ onInsert, onDismiss }: AIWelcomeProps) {
  const [phase, setPhase] = useState<Phase>("list");
  const [active, setActive] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const activeItem = QUICK_STARTS.find((q) => q.command === active);

  async function runStream() {
    if (!active || !topic.trim()) return;
    setPhase("streaming");
    setStreamedText("");
    setError(false);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: active, topic: topic.trim() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setStreamedText((prev) => prev + decoder.decode(value, { stream: true }));
      }

      setPhase("done");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(true);
        setPhase("done");
      }
    }
  }

  function handleBack() {
    abortRef.current?.abort();
    setActive(null);
    setTopic("");
    setStreamedText("");
    setError(false);
    setPhase("list");
  }

  return (
    <div className="mb-10">
      <AnimatePresence mode="wait">

        {/* ── LIST ── */}
        {phase === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={springStd}
          >
            {/* AI quick-start header */}
            <div className="mb-5 flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm"
                style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}
              >
                ⚡
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-1">Start with AI</p>
                <p className="text-xs text-ink-4">Pick a quick-start or just write below</p>
              </div>
            </div>

            {/* Quick-start grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_STARTS.map((q) => (
                <motion.button
                  key={q.command}
                  {...buttonTap}
                  onClick={() => { setActive(q.command); setPhase("input"); }}
                  className="group flex flex-col gap-2 rounded-xl border border-line-1 bg-surface p-3 text-left transition-all hover:border-line-2 hover:bg-hover neu-sm"
                >
                  <span className="text-xl">{q.emoji}</span>
                  <span className="text-xs font-medium leading-tight text-ink-2 group-hover:text-ink-1">{q.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Divider with "or" */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line-1" />
              <span className="text-[10px] uppercase tracking-widest text-ink-4">or</span>
              <div className="h-px flex-1 bg-line-1" />
            </div>

            {/* Just write CTA */}
            <motion.button
              {...buttonTap}
              onClick={onDismiss}
              className="flex w-full items-center justify-between rounded-xl border border-line-1 bg-surface px-4 py-3 text-left transition-all hover:border-line-2 hover:bg-hover neu-sm"
            >
              <span className="text-sm font-medium text-ink-2">Start writing freely</span>
              <span className="flex items-center gap-1.5 text-xs text-ink-4">
                <kbd className="rounded border border-line-2 bg-raised px-1.5 py-0.5 text-[9px] font-mono">/</kbd>
                <span>for AI commands</span>
                <span className="mx-1 opacity-40">·</span>
                <kbd className="rounded border border-line-2 bg-raised px-1.5 py-0.5 text-[9px] font-mono">Tab</kbd>
                <span>to expand</span>
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* ── INPUT ── */}
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={springStd}
            className="rounded-xl border border-line-2 bg-surface neu-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-line-1 px-4 py-3">
              <span className="text-base">{activeItem?.emoji}</span>
              <span className="text-sm font-semibold text-ink-1">{activeItem?.label}</span>
              <button onClick={handleBack} className="ml-auto text-xs text-ink-4 transition-colors hover:text-ink-2">Cancel</button>
            </div>

            <div className="p-4">
              {activeItem?.multiline ? (
                <textarea
                  autoFocus
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runStream();
                    if (e.key === "Escape") handleBack();
                  }}
                  placeholder={activeItem?.placeholder}
                  rows={4}
                  className="w-full resize-none bg-transparent text-sm text-ink-1 placeholder-ink-4 outline-none leading-relaxed"
                />
              ) : (
                <input
                  autoFocus
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runStream();
                    if (e.key === "Escape") handleBack();
                  }}
                  placeholder={activeItem?.placeholder}
                  className="w-full bg-transparent text-sm text-ink-1 placeholder-ink-4 outline-none"
                />
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-line-1 px-4 py-2.5">
              <motion.button
                {...buttonTap}
                onClick={runStream}
                disabled={!topic.trim()}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-30"
                style={{ background: "#2563EB" }}
              >
                Generate <span className="opacity-70">↵</span>
              </motion.button>
              <span className="text-[10px] text-ink-4">
                {activeItem?.multiline ? "⌘↵ to generate" : "↵ to generate · Esc to cancel"}
              </span>
            </div>
          </motion.div>
        )}

        {/* ── STREAMING / DONE ── */}
        {(phase === "streaming" || phase === "done") && (
          <motion.div
            key="streaming"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={springStd}
            className="overflow-hidden rounded-xl border border-line-2 bg-surface neu-sm"
          >
            <div className="flex items-center gap-2 border-b border-line-1 px-4 py-2.5">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                  phase === "done" && !error
                    ? "bg-ok"
                    : phase === "done" && error
                    ? "bg-error"
                    : "animate-pulse bg-ai"
                }`}
              />
              <span className="text-[10px] uppercase tracking-widest text-ink-3">
                {phase === "done" && !error
                  ? "Ready — insert into note"
                  : phase === "done" && error
                  ? "Something went wrong"
                  : `${activeItem?.label ?? "AI"} generating…`}
              </span>
            </div>

            <div className="min-h-[56px] px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                {streamedText}
                {phase === "streaming" && (
                  <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-ai" />
                )}
              </p>
            </div>

            {phase === "done" && (
              <div className="flex gap-2 border-t border-line-1 p-2">
                {!error && (
                  <motion.button
                    {...buttonTap}
                    onClick={() => { onInsert(streamedText); onDismiss(); }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "#2563EB" }}
                  >
                    Insert into note
                  </motion.button>
                )}
                <button
                  onClick={handleBack}
                  className="rounded-lg px-3 py-2 text-xs text-ink-3 transition-colors hover:bg-hover hover:text-ink-1"
                >
                  {error ? "Try again" : "Try something else"}
                </button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
