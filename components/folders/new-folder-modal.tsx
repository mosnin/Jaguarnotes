"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scaleIn } from "@/lib/motion";

const EMOJI_OPTIONS = ["📁", "🚀", "💡", "🔬", "📝", "🎯", "⚡", "🌟", "🧠", "🛠️", "🎨", "📊"];

const COLOR_OPTIONS = [
  { hex: "#EDE8FF", label: "Lavender" },
  { hex: "#FFE8DF", label: "Peach" },
  { hex: "#E3F5E1", label: "Mint" },
  { hex: "#FFF5DC", label: "Honey" },
  { hex: "#DBEAFE", label: "Sky" },
  { hex: "#FFE4F0", label: "Rose" },
  { hex: "#E8F8FF", label: "Aqua" },
  { hex: "#F5F0FF", label: "Violet" },
];

interface NewFolderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; emoji: string; color: string }) => Promise<void>;
  /** If provided, modal is in edit mode */
  initial?: { name: string; emoji: string; color: string };
  title?: string;
}

export function NewFolderModal({
  open,
  onClose,
  onSubmit,
  initial,
  title = "New folder",
}: NewFolderModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "📁");
  const [color, setColor] = useState(initial?.color ?? COLOR_OPTIONS[0].hex);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setEmoji(initial?.emoji ?? "📁");
      setColor(initial?.color ?? COLOR_OPTIONS[0].hex);
      setLoading(false);
      // Auto-focus after animation frame
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, initial?.name, initial?.emoji, initial?.color]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), emoji, color });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.28)", backdropFilter: "blur(6px)" }}
          onClick={handleBackdropClick}
        >
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-line-1 bg-surface shadow-2xl"
            style={{ boxShadow: "0 24px 64px rgba(27,54,82,0.18), 0 4px 16px rgba(27,54,82,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 border-b border-line-1"
              style={{ background: color, transition: "background 0.2s ease" }}
            >
              <span className="text-2xl leading-none select-none">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink-1">{title}</p>
                <p className="text-xs text-ink-4 truncate">{name || "Unnamed folder"}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-black/10 hover:text-ink-1"
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Name input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-3 uppercase tracking-widest">
                  Folder name
                </label>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Research, Projects, Ideas"
                  maxLength={48}
                  className="w-full rounded-xl border border-line-2 bg-raised px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-all focus:border-ai/60 focus:bg-surface neu-inset"
                />
              </div>

              {/* Emoji picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-3 uppercase tracking-widest">
                  Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                        emoji === e
                          ? "scale-110 ring-2 ring-ai/60 neu-xs"
                          : "hover:bg-raised hover:scale-105"
                      }`}
                      style={emoji === e ? { background: color } : {}}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-3 uppercase tracking-widest">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      title={c.label}
                      className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all hover:scale-110"
                      style={{
                        background: c.hex,
                        borderColor: color === c.hex ? "#2563EB" : "transparent",
                        boxShadow: color === c.hex
                          ? "0 0 0 2px #2563EB40, inset 0 1px 2px rgba(0,0,0,0.08)"
                          : "inset 0 1px 2px rgba(0,0,0,0.08), 1px 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      {color === c.hex && (
                        <svg className="h-3 w-3 text-ai" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-line-2 px-4 py-2.5 text-sm font-medium text-ink-3 transition-all hover:border-line-3 hover:text-ink-1 neu-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || loading}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 neu-btn"
                  style={{ background: "#2563EB" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </span>
                  ) : title === "New folder" ? "Create folder" : "Save changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
