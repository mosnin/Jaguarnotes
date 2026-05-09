"use client";

import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";

const COMMANDS = [
  { id: "punch",     label: "Punch",       desc: "Sharper, harder, more direct" },
  { id: "compress",  label: "Compress",    desc: "Distill to one essential paragraph" },
  { id: "counter",   label: "Counter",     desc: "Strongest counter-argument" },
  { id: "sowhat",    label: "So what?",    desc: "Surface the real implication" },
  { id: "assume",    label: "Assumptions", desc: "List every buried assumption" },
  { id: "question",  label: "Questions",   desc: "5 questions you should be asking" },
  { id: "premortem", label: "Pre-mortem",  desc: "How will this fail in 12 months?" },
  { id: "brief",     label: "Brief",       desc: "Collapse into an executive brief" },
  { id: "explain",   label: "Explain",     desc: "Expand and structure" },
] as const;

interface SelectionToolbarProps {
  text: string;
  position: { top: number; left: number };
  onCommand: (command: string, text: string) => void;
  onDismiss: () => void;
}

export function SelectionToolbar({ text, position, onCommand, onDismiss }: SelectionToolbarProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const style: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        left: 8,
        right: 8,
        bottom: "calc(env(safe-area-inset-bottom, 0) + 16px)",
        zIndex: 50,
      }
    : {
        position: "fixed",
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
        zIndex: 50,
      };

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      style={style}
      className="overflow-hidden rounded-xl border border-line-2 bg-surface neu-card"
    >
      <div className="flex items-center justify-between border-b border-line-1 px-3 py-2">
        <span className="truncate text-[10px] uppercase tracking-widest text-ink-3">
          Apply AI to selection
        </span>
        <button
          onMouseDown={(e) => { e.preventDefault(); onDismiss(); }}
          onTouchEnd={(e) => { e.preventDefault(); onDismiss(); }}
          className="text-ink-4 transition-colors hover:text-ink-1"
          aria-label="Close"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div
        className={
          isMobile
            ? "grid max-h-[40vh] grid-cols-2 gap-1 overflow-y-auto p-2"
            : "flex flex-wrap gap-1 p-2 max-w-md"
        }
      >
        {COMMANDS.map((cmd) => (
          <button
            key={cmd.id}
            onMouseDown={(e) => { e.preventDefault(); onCommand(cmd.id, text); }}
            onTouchEnd={(e) => { e.preventDefault(); onCommand(cmd.id, text); }}
            className={
              isMobile
                ? "flex flex-col gap-0.5 rounded-lg p-2 text-left transition-colors hover:bg-raised active:bg-hover"
                : "rounded-md px-2.5 py-1 text-xs text-ink-2 transition-colors hover:bg-raised hover:text-ink-1"
            }
            title={cmd.desc}
          >
            <span className={isMobile ? "text-xs font-medium text-ink-1" : ""}>{cmd.label}</span>
            {isMobile && <span className="text-[10px] text-ink-3">{cmd.desc}</span>}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
