"use client";

import { useEffect, useRef, useState } from "react";
import { BlockNoteEditor } from "@blocknote/core";

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

  // Click outside to dismiss
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onDismiss();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onDismiss]);

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
    <div
      ref={overlayRef}
      style={style}
      className="w-88 max-w-sm rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] shadow-2xl shadow-black/70 animate-in fade-in slide-in-from-bottom-1 duration-150"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-3 py-2">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
            done ? "bg-emerald-400 shadow-[0_0_6px_#4ade80]" : "animate-pulse bg-indigo-400 shadow-[0_0_6px_#818cf8]"
          }`}
        />
        <span className="text-[10px] uppercase tracking-widest text-[#444]">
          {done ? "Ready to insert" : "AI thinking..."}
        </span>
        <span className="ml-auto max-w-[120px] truncate text-[10px] text-[#2a2a2a]">"{context}"</span>
      </div>

      {/* Streaming text */}
      <div className="min-h-[48px] px-4 py-3">
        {error ? (
          <p className="text-xs text-red-400">Something went wrong. Try again.</p>
        ) : (
          <p className="text-sm leading-relaxed text-[#d4d4d4]">
            {text}
            {!done && (
              <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-indigo-400" />
            )}
          </p>
        )}
      </div>

      {/* Actions — only shown when done */}
      {done && !error && (
        <div className="flex items-center gap-2 border-t border-[#1a1a1a] p-2">
          <button
            onClick={() => onInsert(text)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
          >
            Insert
            <kbd className="rounded border border-indigo-500/20 bg-indigo-500/5 px-1 py-0.5 text-[9px] font-mono">↵</kbd>
          </button>
          <button
            onClick={onDismiss}
            className="rounded-lg px-3 py-2 text-xs text-[#444] transition-colors hover:bg-[#1a1a1a] hover:text-[#888]"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
