"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import { Id } from "@/convex/_generated/dataModel";

interface PickerNote {
  _id: Id<"notes">;
  title: string;
  emoji?: string;
}

interface NoteLinkPickerProps {
  notes: PickerNote[];
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onSelect: (id: Id<"notes">, title: string) => void;
  onDismiss: () => void;
  onQueryChange?: (query: string) => void;
}

export function NoteLinkPicker({ notes, anchorRef, onSelect, onDismiss, onQueryChange }: NoteLinkPickerProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    inputRef.current?.focus();
  }, [anchorRef]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onDismiss();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onDismiss]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { e.stopPropagation(); onDismiss(); }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onDismiss]);

  const filtered = notes.filter(
    (n) => (n.title || "Untitled").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      ref={panelRef}
      variants={scaleIn}
      initial="hidden"
      animate="show"
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 60 }}
      className="w-72 overflow-hidden rounded-xl border border-line-2 bg-surface neu-card"
    >
      <div className="border-b border-line-1 px-3 py-2.5">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => { setSearch(e.target.value); onQueryChange?.(e.target.value); }}
          placeholder="Search notes…"
          className="w-full bg-transparent text-sm text-ink-1 placeholder-ink-4 outline-none"
        />
      </div>
      <div className="max-h-64 overflow-y-auto py-1">
        {filtered.length === 0 && (
          <p className="px-3 py-3 text-xs text-ink-4">
            {search ? `No notes match "${search}"` : "No other notes yet"}
          </p>
        )}
        {filtered.map((n) => (
          <button
            key={n._id}
            onClick={() => onSelect(n._id, n.title || "Untitled")}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-3 transition-colors hover:bg-raised hover:text-ink-1"
          >
            {n.emoji && <span className="shrink-0">{n.emoji}</span>}
            <span className="truncate">{n.title || "Untitled"}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
