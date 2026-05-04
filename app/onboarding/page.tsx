"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { springStd, buttonTap } from "@/lib/motion";

const DEMO_PHRASE = "second-order thinking";
const DEMO_EXPANSION =
  "Second-order thinking means asking not just 'what happens next?' but 'and then what?' — tracing consequences through time to surface effects that are non-obvious, delayed, or counterintuitive. Most decisions fail not at the first step, but at the second.";

type Phase = "intro" | "typing" | "tab-hint" | "streaming" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [typed, setTyped] = useState("");
  const [streamed, setStreamed] = useState("");
  const frameRef = useRef<ReturnType<typeof setTimeout>>();

  function schedule(fn: () => void, delay: number) {
    frameRef.current = setTimeout(fn, delay);
  }

  useEffect(() => () => clearTimeout(frameRef.current), []);

  useEffect(() => {
    if (phase === "intro") {
      schedule(() => setPhase("typing"), 1000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "typing") {
      if (typed.length < DEMO_PHRASE.length) {
        schedule(() => setTyped(DEMO_PHRASE.slice(0, typed.length + 1)), 65);
      } else {
        schedule(() => setPhase("tab-hint"), 600);
      }
    }

    if (phase === "tab-hint") {
      schedule(() => setPhase("streaming"), 900);
    }

    if (phase === "streaming") {
      if (streamed.length < DEMO_EXPANSION.length) {
        const chunk = Math.floor(Math.random() * 4) + 3;
        schedule(() => setStreamed(DEMO_EXPANSION.slice(0, streamed.length + chunk)), 18 + Math.random() * 16);
      } else {
        schedule(() => setPhase("done"), 400);
      }
    }
  }, [phase, typed, streamed]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-app px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ai/[0.06] blur-[120px]" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7474ff] to-violet-500">
              <span className="text-sm font-bold text-white">J</span>
            </div>
            <span className="text-base font-semibold text-ink-1">Jaguarnotes</span>
          </div>
        </div>

        {/* Pre-demo headline */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={springStd}
              className="mb-8 text-center"
            >
              <h1 className="text-3xl font-bold text-ink-1">This is different.</h1>
              <p className="mt-2 text-ink-3">Watch.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo editor */}
        {phase !== "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springStd}
            className="overflow-hidden rounded-2xl border border-line-2 bg-surface shadow-2xl"
          >
            {/* Chrome */}
            <div className="flex items-center gap-1.5 border-b border-line-1 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-raised" />
              <div className="h-2.5 w-2.5 rounded-full bg-raised" />
              <div className="h-2.5 w-2.5 rounded-full bg-raised" />
            </div>

            <div className="px-8 py-8">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-ink-4">New note</p>
              <p className="mb-6 text-xl font-bold text-ink-1">Mental Models</p>

              <div className="space-y-4 text-[15px]">
                <p className="text-ink-3">Key concepts for this week:</p>

                {/* Typing line */}
                <div className="flex items-center gap-2 min-h-[24px]">
                  <span className="text-ink-1">{typed}</span>
                  {phase === "typing" && (
                    <span className="inline-block h-4 w-px animate-pulse bg-ai" />
                  )}
                  {phase === "tab-hint" && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="inline-flex items-center gap-1.5 rounded border border-ai/20 bg-ai-hint px-2 py-0.5 text-[11px] text-ai"
                    >
                      <kbd className="font-mono">Tab</kbd>
                      <span className="text-ai/50">expand with AI</span>
                    </motion.span>
                  )}
                </div>

                {/* Streaming result */}
                <AnimatePresence>
                  {(phase === "streaming" || phase === "done") && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={springStd}
                      className="rounded-xl border border-ai/20 p-4"
                      style={{
                        borderLeft: "2px solid rgba(116,116,255,0.45)",
                        background: "linear-gradient(90deg, rgba(116,116,255,0.04) 0%, transparent 60%)",
                      }}
                    >
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-ai/50" />
                        <span className="text-[10px] uppercase tracking-widest text-ai/40">AI</span>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-2">
                        {streamed}
                        {phase === "streaming" && (
                          <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-ai" />
                        )}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springStd}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <p className="text-sm text-ink-3">That&apos;s it. Tab expands anything. / generates everything.</p>
              <motion.button
                {...buttonTap}
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-xl bg-ink-1 py-3.5 text-sm font-semibold text-app transition-opacity hover:opacity-85"
              >
                Open my workspace →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip */}
        {phase !== "intro" && phase !== "done" && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs text-ink-4 transition-colors hover:text-ink-3"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
