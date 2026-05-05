"use client";

import { useEffect, useRef, useState } from "react";
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

  // Demo animation state (step 3)
  const [demoPhase, setDemoPhase] = useState<DemoPhase>("typing");
  const [typed, setTyped] = useState("");
  const [streamed, setStreamed] = useState("");
  const frameRef = useRef<ReturnType<typeof setTimeout>>();

  function schedule(fn: () => void, delay: number) {
    frameRef.current = setTimeout(fn, delay);
  }
  useEffect(() => () => clearTimeout(frameRef.current), []);

  // Start demo when entering step 3
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-app px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ai/[0.06] blur-[120px]" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Step dots */}
        <div className="mb-10 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                s === step ? "bg-ai w-4" : "bg-raised"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Role ─────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springStd}
            >
              <h1 className="mb-8 text-center text-2xl font-bold text-ink-1">
                What best describes you?
              </h1>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ id, label, caption }) => (
                  <motion.button
                    key={id}
                    {...buttonTap}
                    onClick={() => selectRole(id)}
                    className={`rounded-2xl border p-5 text-left transition-all ${
                      role === id
                        ? "border-ai/60 bg-ai-dim shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                        : "border-line-2 bg-surface hover:border-line-3 neu-sm"
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink-1">{label}</p>
                    <p className="mt-1 text-xs text-ink-4">{caption}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Use cases ─────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springStd}
            >
              <h1 className="mb-8 text-center text-2xl font-bold text-ink-1">
                What will you use it for?
              </h1>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {USE_CASES.map((uc) => {
                  const checked = useCases.includes(uc);
                  return (
                    <motion.button
                      key={uc}
                      {...buttonTap}
                      onClick={() => toggleUseCase(uc)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                        checked
                          ? "border-ai/60 bg-ai-dim"
                          : "border-line-2 bg-surface hover:border-line-3 neu-sm"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                          checked ? "border-ai bg-ai" : "border-line-1 bg-transparent"
                        }`}
                      >
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm text-ink-2">{uc}</span>
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                {...buttonTap}
                disabled={useCases.length === 0}
                onClick={() => setStep(3)}
                className="w-full rounded-xl neu-btn py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#2563EB" }}
              >
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 3: Demo animation ────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springStd}
            >
              <motion.div
                className="overflow-hidden rounded-2xl border border-line-2 bg-surface neu-card"
              >
                <div className="flex items-center gap-1.5 border-b border-line-1 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-line-2" />
                  <div className="h-2.5 w-2.5 rounded-full bg-line-2" />
                  <div className="h-2.5 w-2.5 rounded-full bg-line-2" />
                </div>
                <div className="px-8 py-8">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-ink-4">New note</p>
                  <p className="mb-6 text-xl font-bold text-ink-1">Mental Models</p>
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
                          className="inline-flex items-center gap-1.5 rounded border border-ai/20 bg-ai-hint px-2 py-0.5 text-[11px] text-ai"
                        >
                          <kbd className="font-mono">Tab</kbd>
                          <span className="text-ai/50">expand with AI</span>
                        </motion.span>
                      )}
                    </div>
                    <AnimatePresence>
                      {(demoPhase === "streaming" || demoPhase === "resolving" || demoPhase === "done") && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={springStd}
                          className="rounded-xl border border-ai/20 p-4"
                          style={{
                            borderLeft: "2px solid rgba(37,99,235,0.5)",
                            background: "linear-gradient(90deg, rgba(37,99,235,0.04) 0%, transparent 60%)",
                          }}
                        >
                          <div className="mb-2 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-ai/50" />
                            <span className="text-[10px] uppercase tracking-widest text-ai/40">AI</span>
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
                      className="w-full rounded-xl neu-btn py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#2563EB" }}
                    >
                      Open my workspace →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {demoPhase !== "resolving" && demoPhase !== "done" && (
                <div className="mt-6 flex justify-center">
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
