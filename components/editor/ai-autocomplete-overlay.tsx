"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BlockNoteEditor } from "@blocknote/core";
import { scaleIn } from "@/lib/motion";

interface AIAutocompleteOverlayProps {
  context: string;
  position: { top: number; left: number };
  onInsert: (text: string) => void;
  onDismiss: () => void;
  editor: BlockNoteEditor;
}

export function AIAutocompleteOverlay({
  context,
  position,
  onInsert,
  onDismiss,
}: AIAutocompleteOverlayProps) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    async function stream() {
      try {
        const res = await fetch("/api/ai/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) throw new Error("Failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          const chunk = decoder.decode(value, { stream: true });
          setText((prev) => prev + chunk);
        }

        setDone(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(true);
      }
    }

    stream();

    return () => controller.abort();
  }, [context]);

  // Click outside to dismiss — but not while streaming (would silently discard content)
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        if (!done) return;
        onDismiss();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onDismiss, done]);

  // Keyboard: Enter to insert, Escape to dismiss
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && done) { e.preventDefault(); onInsert(text); }
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [done, text, onInsert, onDismiss]);

  const style: React.CSSProperties = {
    position: "fixed",
    top: Math.min(position.top, window.innerHeight - 160),
    left: Math.min(position.left, window.innerWidth - 360),
    zIndex: 50,
  };

  return (
    <motion.div
      ref={overlayRef}
      style={style}
      variants={scaleIn}
      initial="hidden"
      animate="show"
      className="w-88 max-w-sm rounded-xl border border-line-2 bg-surface neu-card"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-line-1 px-3 py-2">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
            done
              ? "bg-ok shadow-[0_0_6px_#30d158]"
              : "animate-pulse bg-ai shadow-[0_0_6px_#2563EB]"
          }`}
        />
        <span className="text-[10px] uppercase tracking-widest text-ink-3">
          {done ? "Ready to insert" : "AI thinking..."}
        </span>
        <span className="ml-auto max-w-[120px] truncate text-[10px] text-ink-4">&ldquo;{context}&rdquo;</span>
      </div>

      {/* Streaming text */}
      <div className="min-h-[48px] px-4 py-3">
        {error ? (
          <p className="text-xs text-error">Something went wrong. Try again.</p>
        ) : (
          <p className="text-sm leading-relaxed text-ink-2">
            {text}
            {!done && (
              <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-ai" />
            )}
          </p>
        )}
      </div>

      {/* Actions — only shown when done */}
      {done && !error && (
        <div className="flex items-center gap-2 border-t border-line-1 p-2">
          <button
            onClick={() => onInsert(text)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ai-dim px-3 py-2 text-xs font-medium text-ai transition-colors hover:bg-ai-dim/80"
          >
            Insert
            <kbd className="rounded border border-ai/20 bg-ai-hint px-1 py-0.5 text-[9px] font-mono">↵</kbd>
          </button>
          <button
            onClick={onDismiss}
            className="rounded-lg px-3 py-2 text-xs text-ink-4 transition-colors hover:bg-raised hover:text-ink-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
}
