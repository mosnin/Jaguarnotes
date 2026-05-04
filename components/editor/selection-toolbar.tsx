"use client";

import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";

const COMMANDS = [
  { id: "compress", label: "Make it shorter" },
  { id: "punch",    label: "Make it sharper"  },
  { id: "explain",  label: "Expand this"      },
] as const;

interface SelectionToolbarProps {
  text: string;
  position: { top: number; left: number };
  onCommand: (command: string, text: string) => void;
}

export function SelectionToolbar({ text, position, onCommand }: SelectionToolbarProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
        zIndex: 50,
      }}
      className="flex items-center gap-1 rounded-full border border-line-2 bg-surface px-3 py-1.5 shadow-lg shadow-black/50"
    >
      {COMMANDS.map((cmd, i) => (
        <span key={cmd.id} className="flex items-center gap-1">
          {i > 0 && <span className="select-none text-ink-4">·</span>}
          <button
            onMouseDown={(e) => {
              e.preventDefault(); // don't clear selection
              onCommand(cmd.id, text);
            }}
            className="text-xs text-ink-2 transition-colors hover:text-ink-1"
          >
            {cmd.label}
          </button>
        </span>
      ))}
    </motion.div>
  );
}
