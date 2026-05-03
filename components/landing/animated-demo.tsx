"use client";

import { useEffect, useRef, useState } from "react";

const PHRASE = "transformer architecture";
const EXPANSION =
  "A transformer is a neural network architecture that uses self-attention to process sequences in parallel — enabling models to weigh every token against every other token simultaneously, regardless of distance. This makes it orders of magnitude faster to train than recurrent networks and far more capable at capturing long-range dependencies in language.";

const COMMANDS = [
  { label: "/brainstorm", output: "1. Agent-native workspaces\n2. Real-time knowledge graphs\n3. AI-authored documentation\n4. Contextual memory layers\n5. Collaborative reasoning chains" },
  { label: "/compress",   output: "The core value is speed of thought — removing every step between an idea and its structured form." },
  { label: "/premortem",  output: "Failure mode #1: Users never discover the AI.\nFailure mode #2: Latency breaks the feeling of flow.\nFailure mode #3: Output quality is too generic to trust." },
];

type Phase =
  | "typing-phrase"
  | "tab-pressed"
  | "streaming-autocomplete"
  | "autocomplete-done"
  | "slash"
  | "streaming-command"
  | "command-done"
  | "resetting";

export function AnimatedDemo() {
  const [phase, setPhase] = useState<Phase>("typing-phrase");
  const [typed, setTyped] = useState("");
  const [streamed, setStreamed] = useState("");
  const [commandIdx, setCommandIdx] = useState(0);
  const [slashLabel, setSlashLabel] = useState(COMMANDS[0].label);
  const frameRef = useRef<ReturnType<typeof setTimeout>>();

  const cmd = COMMANDS[commandIdx % COMMANDS.length];

  function schedule(fn: () => void, delay: number) {
    frameRef.current = setTimeout(fn, delay);
  }

  useEffect(() => {
    return () => clearTimeout(frameRef.current);
  }, []);

  // Drive the animation state machine
  useEffect(() => {
    if (phase === "typing-phrase") {
      if (typed.length < PHRASE.length) {
        schedule(() => setTyped(PHRASE.slice(0, typed.length + 1)), 60);
      } else {
        schedule(() => setPhase("tab-pressed"), 700);
      }
    }

    if (phase === "tab-pressed") {
      schedule(() => setPhase("streaming-autocomplete"), 300);
    }

    if (phase === "streaming-autocomplete") {
      if (streamed.length < EXPANSION.length) {
        // Stream 3-6 chars at a time for a natural feel
        const chunk = Math.floor(Math.random() * 4) + 3;
        schedule(
          () => setStreamed(EXPANSION.slice(0, streamed.length + chunk)),
          18 + Math.random() * 20
        );
      } else {
        schedule(() => setPhase("autocomplete-done"), 1200);
      }
    }

    if (phase === "autocomplete-done") {
      schedule(() => {
        setSlashLabel(cmd.label);
        setStreamed("");
        setPhase("slash");
      }, 800);
    }

    if (phase === "slash") {
      schedule(() => setPhase("streaming-command"), 600);
    }

    if (phase === "streaming-command") {
      const output = cmd.output;
      if (streamed.length < output.length) {
        const chunk = Math.floor(Math.random() * 3) + 2;
        schedule(() => setStreamed(output.slice(0, streamed.length + chunk)), 22 + Math.random() * 18);
      } else {
        schedule(() => setPhase("command-done"), 1800);
      }
    }

    if (phase === "command-done") {
      schedule(() => setPhase("resetting"), 600);
    }

    if (phase === "resetting") {
      setTyped("");
      setStreamed("");
      setCommandIdx((i) => i + 1);
      schedule(() => setPhase("typing-phrase"), 200);
    }
  }, [phase, typed, streamed, cmd]);

  const showTabHint = phase === "typing-phrase" && typed.length === PHRASE.length;
  const showAutocomplete = ["tab-pressed", "streaming-autocomplete", "autocomplete-done"].includes(phase);
  const showSlashCmd = ["slash", "streaming-command", "command-done"].includes(phase);

  return (
    <div className="relative mx-auto mt-20 w-full max-w-4xl select-none">
      {/* Outer glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/20 via-transparent to-transparent" />

      <div className="relative overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex-1 rounded-md bg-[#1a1a1a] px-3 py-1 text-center text-xs text-[#333]">
            jaguarnotes.com/notes/research
          </div>
        </div>

        {/* Editor content */}
        <div className="px-10 py-10 md:px-16 md:py-12">
          <div className="mb-1 text-[10px] uppercase tracking-widest text-[#2a2a2a]">Note</div>
          <h2 className="mb-8 text-2xl font-bold text-white">AI Research Notes</h2>

          <div className="space-y-6 text-[15px] leading-relaxed text-[#888]">
            <p>Core concepts to understand before the lecture:</p>

            {/* Typing line */}
            <div className="flex items-center gap-0">
              <span className="text-white">{typed}</span>
              {phase === "typing-phrase" && (
                <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-indigo-400" />
              )}
              {showTabHint && (
                <span className="ml-2 inline-flex items-center gap-1 rounded border border-indigo-500/20 bg-indigo-500/5 px-1.5 py-0.5 text-[10px] text-indigo-400/60 animate-in fade-in duration-200">
                  Tab
                  <span className="text-indigo-400/40">→ expand</span>
                </span>
              )}
            </div>

            {/* Autocomplete overlay */}
            {showAutocomplete && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] shadow-xl animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-3 py-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      phase === "autocomplete-done"
                        ? "bg-emerald-400 shadow-[0_0_6px_#4ade80]"
                        : "animate-pulse bg-indigo-400 shadow-[0_0_6px_#818cf8]"
                    }`}
                  />
                  <span className="text-[10px] uppercase tracking-widest text-[#444]">
                    {phase === "autocomplete-done" ? "Ready to insert" : "AI thinking..."}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm leading-relaxed text-[#d4d4d4]">
                    {streamed}
                    {phase === "streaming-autocomplete" && (
                      <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-indigo-400" />
                    )}
                  </p>
                </div>
                {phase === "autocomplete-done" && (
                  <div className="border-t border-[#1a1a1a] p-2">
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400">
                        Insert <span className="opacity-50">↵</span>
                      </div>
                      <div className="rounded-lg px-3 py-1.5 text-xs text-[#333]">Dismiss</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Slash command */}
            {showSlashCmd && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-[#555]">
                  <span className="font-mono text-indigo-400">{slashLabel}</span>
                </div>
                <div className="rounded-xl border border-indigo-500/20 bg-[#0f0f0f] shadow-xl">
                  <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-3 py-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        phase === "command-done"
                          ? "bg-emerald-400 shadow-[0_0_6px_#4ade80]"
                          : "animate-pulse bg-indigo-400 shadow-[0_0_6px_#818cf8]"
                      }`}
                    />
                    <span className="text-[10px] uppercase tracking-widest text-[#444]">
                      {phase === "command-done" ? "Ready to insert" : "AI generating..."}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#d4d4d4]">
                      {streamed}
                      {phase === "streaming-command" && (
                        <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-indigo-400" />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
