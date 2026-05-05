"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { scaleIn, useMotionVariants } from "@/lib/motion";
import { Id } from "@/convex/_generated/dataModel";

interface NoteResult {
  _id: Id<"notes">;
  title: string;
  emoji?: string;
  preview?: string;
}

interface SearchModalProps {
  onDismiss: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function SearchModal({ onDismiss, triggerRef }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 280);
    return () => clearTimeout(t);
  }, [query]);

  const results = (useQuery(api.notes.search, { query: debouncedQuery }) ?? []) as NoteResult[];
  const motionProps = useMotionVariants(scaleIn);

  useEffect(() => { setCursor(0); }, [debouncedQuery]);

  function openNote(id: string) {
    router.push(`/notes/${id}`);
    onDismiss();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && results[cursor]) { openNote(results[cursor]._id); }
    if (e.key === "Escape") { triggerRef?.current?.focus(); onDismiss(); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center backdrop-blur-sm pt-[15vh]"
      style={{ backgroundColor: "rgba(237, 244, 255, 0.65)" }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
    >
      <motion.div
        {...motionProps}
        role="dialog"
        aria-modal="true"
        aria-label="Search notes"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line-2 bg-surface neu-card"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-line-1 px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-ink-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search notes..."
            role="combobox"
            aria-expanded={results.length > 0}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-activedescendant={cursor >= 0 && results.length > 0 ? `search-result-${cursor}` : undefined}
            className="flex-1 bg-transparent text-sm text-ink-1 placeholder-ink-4 outline-none"
          />
          <kbd className="rounded border border-line-2 bg-raised px-1.5 py-0.5 text-[10px] font-mono text-ink-4">Esc</kbd>
        </div>

        {/* Results */}
        <div role="listbox" aria-label="Search results" className="max-h-[360px] overflow-y-auto py-1">
          {!debouncedQuery && (
            <p className="px-4 py-6 text-center text-xs text-ink-4">Type to search all notes</p>
          )}
          {debouncedQuery && results.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-ink-4">No notes match &ldquo;{debouncedQuery}&rdquo;</p>
          )}
          {results.map((note, i) => (
            <button
              key={note._id}
              id={`search-result-${i}`}
              onPointerDown={() => openNote(note._id)}
              role="option"
              aria-selected={i === cursor}
              className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                i === cursor ? "bg-raised" : "hover:bg-raised"
              }`}
            >
              <span className="mt-0.5 text-base leading-none">{note.emoji ?? "📝"}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-1">{note.title || "Untitled"}</p>
                {note.preview && (
                  <p className="mt-0.5 truncate text-xs text-ink-4">{note.preview}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
