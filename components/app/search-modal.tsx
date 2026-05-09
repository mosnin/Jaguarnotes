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
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
      style={{ backgroundColor: "rgba(237,244,255,0.7)", backdropFilter: "blur(16px)" }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
    >
      <motion.div
        {...motionProps}
        role="dialog"
        aria-modal="true"
        aria-label="Search notes"
        className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-line-2 bg-surface neu-lg"
      >
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-line-1 px-4 py-3.5">
          <svg className="h-4 w-4 shrink-0 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search notes…"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-activedescendant={cursor >= 0 && results.length > 0 ? `search-result-${cursor}` : undefined}
            className="flex-1 bg-transparent text-sm font-medium text-ink-1 placeholder-ink-3 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-hover text-ink-4 hover:text-ink-2 transition-colors"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 rounded-lg border border-line-2 bg-raised px-1.5 py-0.5 text-[10px] font-mono text-ink-4 neu-xs">Esc</kbd>
        </div>

        {/* Results */}
        <div role="listbox" aria-label="Search results" className="max-h-[360px] overflow-y-auto">
          {/* Empty / prompt state */}
          {!debouncedQuery && (
            <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl neu-sm" style={{ background: "rgba(37,99,235,0.06)" }}>
                <svg className="h-5 w-5 text-ai" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-ink-2">Search your notes</p>
              <p className="text-xs text-ink-4">Type a title, keyword, or topic</p>
              <div className="flex items-center gap-1 mt-1">
                <kbd className="rounded-md border border-line-2 bg-raised px-2 py-0.5 text-[10px] font-mono text-ink-3 neu-xs">↑</kbd>
                <kbd className="rounded-md border border-line-2 bg-raised px-2 py-0.5 text-[10px] font-mono text-ink-3 neu-xs">↓</kbd>
                <span className="text-[10px] text-ink-4 ml-1">to navigate</span>
                <span className="mx-1 text-ink-4">·</span>
                <kbd className="rounded-md border border-line-2 bg-raised px-2 py-0.5 text-[10px] font-mono text-ink-3 neu-xs">↵</kbd>
                <span className="text-[10px] text-ink-4 ml-1">to open</span>
              </div>
            </div>
          )}

          {/* No results state */}
          {debouncedQuery && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-medium text-ink-2">No notes found</p>
              <p className="text-xs text-ink-4">Try a different search term</p>
            </div>
          )}

          {/* Result items */}
          <div className="py-1">
            {results.map((note, i) => (
              <button
                key={note._id}
                id={`search-result-${i}`}
                onPointerDown={() => openNote(note._id)}
                role="option"
                aria-selected={i === cursor}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-all ${i === cursor ? "bg-hover" : "hover:bg-raised"}`}
                style={i === cursor ? { borderLeft: "2px solid #2563EB" } : { borderLeft: "2px solid transparent" }}
              >
                <span className="mt-0.5 text-base leading-none">{note.emoji ?? "📝"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-1">{note.title || "Untitled"}</p>
                  {note.preview && <p className="mt-0.5 truncate text-xs text-ink-3 leading-relaxed">{note.preview}</p>}
                </div>
                {i === cursor && (
                  <span className="shrink-0 self-center text-[10px] font-mono text-ai opacity-60">↵</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="border-t border-line-1 px-4 py-2 flex items-center gap-3">
            <span className="text-[10px] text-ink-4">{results.length} result{results.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
