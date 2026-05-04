"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// The demo plays once, then the user enters their workspace.
// No questionnaire. No friction. Just the magic moment.

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

  // Start the demo after a beat
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0a] px-4">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/8 blur-[120px]" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <span className="text-sm font-bold text-white">J</span>
            </div>
            <span className="text-base font-semibold text-white">Jaguarnotes</span>
          </div>
        </div>

        {/* Pre-demo headline */}
        <div
          className={`mb-8 text-center transition-all duration-500 ${
            phase === "intro" ? "opacity-100" : "opacity-0 h-0 overflow-hidden mb-0"
          }`}
        >
          <h1 className="text-3xl font-bold text-white">This is different.</h1>
          <p className="mt-2 text-[#555]">Watch.</p>
        </div>

        {/* Demo editor */}
        {phase !== "intro" && (
          <div className="overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Chrome */}
            <div className="flex items-center gap-1.5 border-b border-[#1a1a1a] px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#1e1e1e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#1e1e1e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#1e1e1e]" />
            </div>

            <div className="px-8 py-8">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-[#2a2a2a]">New note</p>
              <p className="mb-6 text-xl font-bold text-white">Mental Models</p>

              <div className="space-y-4 text-[15px]">
                <p className="text-[#555]">Key concepts for this week:</p>

                {/* Typing line */}
                <div className="flex items-center gap-2 min-h-[24px]">
                  <span className="text-white">{typed}</span>
                  {(phase === "typing") && (
                    <span className="inline-block h-4 w-px animate-pulse bg-indigo-400" />
                  )}
                  {phase === "tab-hint" && (
                    <span className="inline-flex items-center gap-1.5 rounded border border-indigo-500/20 bg-indigo-500/5 px-2 py-0.5 text-[11px] text-indigo-400 animate-in fade-in duration-200">
                      <kbd className="font-mono">Tab</kbd>
                      <span className="text-indigo-400/50">expand with AI</span>
                    </span>
                  )}
                </div>

                {/* Streaming result */}
                {(phase === "streaming" || phase === "done") && (
                  <div
                    className="rounded-xl border border-indigo-500/20 bg-[#0a0a0a] p-4 animate-in fade-in duration-300"
                    style={{
                      borderLeft: "2px solid rgba(99,102,241,0.4)",
                      background: "linear-gradient(90deg, rgba(99,102,241,0.04) 0%, transparent 60%)",
                    }}
                  >
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-indigo-400/50" />
                      <span className="text-[10px] uppercase tracking-widest text-indigo-400/40">AI</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#ccc]">
                      {streamed}
                      {phase === "streaming" && (
                        <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-indigo-400" />
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA — appears after demo finishes */}
        {phase === "done" && (
          <div className="mt-8 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-1 duration-500">
            <p className="text-sm text-[#555]">That&apos;s it. Tab expands anything. / generates everything.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-85"
            >
              Open my workspace →
            </button>
          </div>
        )}

        {/* Skip — only during demo, not after */}
        {phase !== "intro" && phase !== "done" && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs text-[#2a2a2a] transition-colors hover:text-[#444]"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
