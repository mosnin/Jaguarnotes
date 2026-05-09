"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { scaleIn, useMotionVariants } from "@/lib/motion";

interface ShortcutsModalProps {
  onDismiss: () => void;
}

const SECTIONS = [
  {
    label: "Editor",
    rows: [
      { key: "Tab", desc: "AI autocomplete" },
      { key: "/", desc: "AI slash commands" },
      { key: "Esc", desc: "Dismiss menu" },
    ],
  },
  {
    label: "AI Commands",
    rows: [
      { key: "↵", desc: "Run command" },
      { key: "⌘↵", desc: "Run (Think mode)" },
      { key: "Esc", desc: "Back to command list" },
    ],
  },
  {
    label: "Navigation",
    rows: [
      { key: "⌘K", desc: "Search all notes" },
      { key: "?", desc: "Show this help" },
    ],
  },
  {
    label: "Note",
    rows: [
      { key: "⌘S", desc: "Save (auto-saves continuously)" },
    ],
  },
] as const;

export function ShortcutsModal({ onDismiss }: ShortcutsModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const motionProps = useMotionVariants(scaleIn);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "?") onDismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  // Focus the panel on mount so keyboard users can interact immediately
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Focus trap: cycle Tab / Shift+Tab within the panel
  function onPanelKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: "rgba(237, 244, 255, 0.65)" }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
    >
      <motion.div
        ref={panelRef}
        {...motionProps}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-line-2 bg-surface neu-card"
      >
        <div className="border-b border-line-1 px-5 py-4">
          <p id="shortcuts-title" className="text-sm font-semibold text-ink-1">Keyboard shortcuts</p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {SECTIONS.map((section) => (
            <div key={section.label} className="mb-5 last:mb-0">
              <p className="mb-2 text-[10px] uppercase tracking-widest text-ink-4">{section.label}</p>
              <div className="flex flex-col gap-1.5">
                {section.rows.map((row) => (
                  <div key={row.key} className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <span className="text-sm text-ink-2">{row.desc}</span>
                    <kbd className="rounded border border-line-2 bg-raised px-1.5 py-0.5 text-[11px] font-mono text-ink-3">
                      {row.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-line-1 px-5 py-3">
          <p className="text-xs text-ink-4">Press <kbd className="rounded border border-line-2 bg-raised px-1 py-0.5 text-[10px] font-mono">?</kbd> or <kbd className="rounded border border-line-2 bg-raised px-1 py-0.5 text-[10px] font-mono">Esc</kbd> to close</p>
        </div>
      </motion.div>
    </div>
  );
}
