"use client";

import { useEffect, useRef, useState } from "react";
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
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-10">
      <AnimatePresence mode="wait">

        {/* ── LIST ── */}
        {phase === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="py-2"
          >
            <p className="mb-6 text-base text-ink-3">Tell me what you're thinking.</p>

            <div className="flex flex-col gap-1.5">
              {QUICK_STARTS.map((q) => (
                <motion.button
                  key={q.command}
                  {...buttonTap}
                  onClick={() => { setActive(q.command); setPhase("input"); }}
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
        )}

        {/* ── INPUT ── */}
        {phase === "input" && (
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
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runStream();
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
                  if (e.key === "Enter") runStream();
                  if (e.key === "Escape") handleBack();
                }}
                placeholder={activeItem?.placeholder}
                className="w-full rounded-lg border border-line-1 bg-transparent px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-line-2"
              />
            )}

            <div className="mt-3 flex items-center gap-4">
              <motion.button
                {...buttonTap}
                onClick={runStream}
                disabled={!topic.trim()}
                className="text-lg text-ink-1 transition-opacity hover:opacity-60 disabled:opacity-25"
              >
                →
              </motion.button>
              <button onClick={handleBack} className="text-xs text-ink-4 transition-colors hover:text-ink-3">
                Back
              </button>
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
            className="overflow-hidden rounded-xl border border-line-2"
          >
            {/* Status header */}
            <div className="flex items-center gap-2 border-b border-line-1 px-4 py-2.5">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                  phase === "done" && !error
                    ? "bg-ok shadow-[0_0_6px_#30d158]"
                    : phase === "done" && error
                    ? "bg-error"
                    : "animate-pulse bg-ai shadow-[0_0_6px_#7474ff]"
                }`}
              />
              <span className="text-[10px] uppercase tracking-widest text-ink-3">
                {phase === "done" && !error
                  ? "Ready to insert"
                  : phase === "done" && error
                  ? "Something went wrong"
                  : `${activeItem?.label ?? "AI"} generating…`}
              </span>
            </div>

            {/* Streamed content */}
            <div className="min-h-[48px] px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                {streamedText}
                {phase === "streaming" && (
                  <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-ai" />
                )}
              </p>
            </div>

            {/* Actions — only when done */}
            {phase === "done" && (
              <div className="flex gap-2 border-t border-line-1 p-2">
                {!error && (
                  <button
                    onClick={() => { onInsert(streamedText); onDismiss(); }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ai-dim px-3 py-2 text-xs font-medium text-ai transition-colors hover:bg-ai-dim/80"
                  >
                    Insert into note
                  </button>
                )}
                <button
                  onClick={handleBack}
                  className="rounded-lg px-3 py-2 text-xs text-ink-3 transition-colors hover:bg-raised hover:text-ink-1"
                >
                  {error ? "Try again" : "Back"}
                </button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
