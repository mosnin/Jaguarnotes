"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { springStd, buttonTap } from "@/lib/motion";
import { Logo } from "@/components/ui/logo";

const DEMO_PHRASE = "second-order thinking";
const DEMO_EXPANSION =
  "Second-order thinking means asking not just 'what happens next?' but 'and then what?' — tracing consequences through time to surface effects that are non-obvious, delayed, or counterintuitive. Most decisions fail not at the first step, but at the second.";

type DemoPhase = "typing" | "tab-hint" | "streaming" | "resolving" | "done";

const ROLES = [
  { id: "researcher", label: "Researcher", caption: "Synthesize ideas from sources" },
  { id: "founder",    label: "Founder",    caption: "Capture and move fast" },
  { id: "writer",     label: "Writer",     caption: "Draft, outline, and refine" },
  { id: "student",    label: "Student",    caption: "Learn and retain concepts" },
] as const;

const USE_CASES = [
  "Capture ideas fast",
  "Research and synthesis",
  "Writing and drafting",
  "Meeting notes",
  "Planning and strategy",
  "Learning new concepts",
];

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<string>("");
  const [useCases, setUseCases] = useState<string[]>([]);

  const [demoPhase, setDemoPhase] = useState<DemoPhase>("typing");
  const [typed, setTyped] = useState("");
  const [streamed, setStreamed] = useState("");
  const frameRef = useRef<ReturnType<typeof setTimeout>>();

  function schedule(fn: () => void, delay: number) {
    frameRef.current = setTimeout(fn, delay);
  }
  useEffect(() => () => clearTimeout(frameRef.current), []);

  useEffect(() => {
    if (step !== 3) return;
    setDemoPhase("typing");
    setTyped("");
    setStreamed("");
  }, [step]);

  useEffect(() => {
    if (step !== 3) return;
    if (demoPhase === "typing") {
      if (typed.length < DEMO_PHRASE.length) {
        schedule(() => setTyped(DEMO_PHRASE.slice(0, typed.length + 1)), 65);
      } else {
        schedule(() => setDemoPhase("tab-hint"), 600);
      }
    }
    if (demoPhase === "tab-hint") {
      schedule(() => setDemoPhase("streaming"), 900);
    }
    if (demoPhase === "streaming") {
      if (streamed.length < DEMO_EXPANSION.length) {
        const chunk = Math.floor(Math.random() * 4) + 3;
        schedule(() => setStreamed(DEMO_EXPANSION.slice(0, streamed.length + chunk)), 18 + Math.random() * 16);
      } else {
        schedule(() => setDemoPhase("resolving"), 400);
      }
    }
    if (demoPhase === "resolving") {
      schedule(() => setDemoPhase("done"), 2000);
    }
  }, [step, demoPhase, typed, streamed]); // eslint-disable-line react-hooks/exhaustive-deps

  async function finish() {
    await completeOnboarding({ role: role || "other", useCases });
    router.push("/dashboard");
  }

  function toggleUseCase(uc: string) {
    setUseCases((prev) =>
      prev.includes(uc) ? prev.filter((x) => x !== uc) : [...prev, uc]
    );
  }

  function selectRole(id: string) {
    setRole(id);
    setTimeout(() => setStep(2), 300);
  }

  return (
    <div className="relative min-h-screen w-full bg-app flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step >= s ? "bg-ai text-white" : "bg-line-1 text-ink-4"
                }`}
              >
                {step > s ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {i < 2 && (
                <div
                  className="h-0.5 flex-1 rounded-full transition-all"
                  style={{ background: step > s ? "#2563EB" : "var(--color-line-2)" }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Role ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl bg-surface border border-line-2 p-6 shadow-sm"
            >
              <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-ink-1">
                What best describes you?
              </h1>
              <p className="mb-6 text-center text-sm text-ink-3">This personalizes your AI experience.</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ id, label, caption }) => {
                  const selected = role === id;
                  return (
                    <motion.button
                      key={id}
                      {...buttonTap}
                      onClick={() => selectRole(id)}
                      className={`relative rounded-xl border p-5 text-left transition-all duration-150 ${
                        selected
                          ? "border-ai/40 bg-ai/[0.04]"
                          : "border-line-2 bg-surface hover:border-line-3 hover:bg-raised"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-ai">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </span>
                      )}
                      <p className={`text-sm font-semibold ${selected ? "text-ai" : "text-ink-1"}`}>{label}</p>
                      <p className="mt-1 text-xs text-ink-3">{caption}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Use cases ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-ink-1">
                What will you use it for?
              </h1>
              <p className="mb-6 text-center text-sm text-ink-3">Select all that apply.</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {USE_CASES.map((uc) => {
                  const checked = useCases.includes(uc);
                  return (
                    <motion.button
                      key={uc}
                      {...buttonTap}
                      onClick={() => toggleUseCase(uc)}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ${
                        checked
                          ? "border-ai/40 bg-ai/[0.04]"
                          : "border-line-2 bg-surface hover:border-line-3 hover:bg-raised"
                      }`}
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all"
                        style={
                          checked
                            ? { backgroundColor: "#2563EB", borderColor: "#2563EB" }
                            : { borderColor: "var(--color-line-3)", backgroundColor: "transparent" }
                        }
                      >
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-sm font-medium ${checked ? "text-ai" : "text-ink-2"}`}>
                        {uc}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink-1"
                >
                  <span>←</span>
                  <span>Back</span>
                </button>
                <motion.button
                  {...buttonTap}
                  disabled={useCases.length === 0}
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-xl bg-ai px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Demo ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div className="overflow-hidden rounded-2xl border border-line-2 bg-surface shadow-sm">
                <div className="flex items-center gap-1.5 border-b border-line-1 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-line-2" />
                  <div className="h-2.5 w-2.5 rounded-full bg-line-2" />
                  <div className="h-2.5 w-2.5 rounded-full bg-line-2" />
                </div>
                <div className="px-8 py-8">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-ink-4">New note</p>
                  <p className="mb-6 text-xl font-bold tracking-tight text-ink-1">Mental Models</p>
                  <div className="space-y-4 text-[15px]">
                    <p className="text-ink-3">Key concepts for this week:</p>
                    <div className="flex items-center gap-2 min-h-[24px]">
                      <span className="text-ink-1">{typed}</span>
                      {demoPhase === "typing" && (
                        <span className="inline-block h-4 w-px animate-pulse bg-ai" />
                      )}
                      {demoPhase === "tab-hint" && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="inline-flex items-center gap-1.5 rounded border border-ai/20 bg-ai/[0.04] px-2 py-0.5 text-[11px] text-ai"
                        >
                          <kbd className="font-mono">Tab</kbd>
                          <span className="opacity-60">expand with AI</span>
                        </motion.span>
                      )}
                    </div>
                    <AnimatePresence>
                      {(demoPhase === "streaming" || demoPhase === "resolving" || demoPhase === "done") && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={springStd}
                          className="rounded-xl border border-ai/15 p-4"
                          style={{
                            borderLeft: "2px solid rgba(37,99,235,0.4)",
                            background: "rgba(37,99,235,0.03)",
                          }}
                        >
                          <div className="mb-2 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-ai/50" />
                            <span className="text-[10px] uppercase tracking-widest text-ai/50">AI</span>
                          </div>
                          <p className="text-sm leading-relaxed text-ink-2">
                            {streamed}
                            {demoPhase === "streaming" && (
                              <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-ai" />
                            )}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {demoPhase === "resolving" && (
                  <motion.p
                    key="resolving"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={springStd}
                    className="mt-8 text-center text-sm text-ink-3"
                  >
                    That&apos;s your editor.
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {demoPhase === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springStd}
                    className="mt-8 flex flex-col items-center gap-3"
                  >
                    <p className="text-sm text-ink-3">Every concept expanded. Every idea sharpened. One keystroke away.</p>
                    <motion.button
                      {...buttonTap}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springStd, delay: 0.65 }}
                      onClick={finish}
                      className="w-full rounded-xl bg-ai px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Open my workspace →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {demoPhase !== "resolving" && demoPhase !== "done" && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink-1"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                  <button
                    onClick={finish}
                    className="text-xs text-ink-4 transition-colors hover:text-ink-3"
                  >
                    Skip
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
