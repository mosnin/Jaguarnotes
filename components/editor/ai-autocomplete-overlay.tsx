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
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAutocomplete() {
      try {
        const res = await fetch("/api/ai/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context }),
        });

        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) {
          setResult(data.text);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchAutocomplete();
    return () => { cancelled = true; };
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

  const style: React.CSSProperties = {
    position: "fixed",
    top: Math.min(position.top, window.innerHeight - 160),
    left: Math.min(position.left, window.innerWidth - 340),
    zIndex: 50,
  };

  return (
    <div ref={overlayRef} style={style} className="w-80 rounded-xl border border-[#2a2a2a] bg-[#111] shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#1e1e1e] px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_#818cf8]" />
        <span className="text-xs text-[#555]">AI autocomplete</span>
        <span className="ml-auto truncate text-xs text-[#333]">"{context}"</span>
      </div>

      {/* Content */}
      <div className="p-3">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#444]">
            <div className="h-3 w-3 animate-spin rounded-full border border-[#333] border-t-indigo-500" />
            Generating...
          </div>
        )}
        {error && (
          <p className="text-xs text-red-400">Failed to generate. Try again.</p>
        )}
        {!loading && !error && (
          <p className="text-sm leading-relaxed text-[#ccc]">{result}</p>
        )}
      </div>

      {/* Actions */}
      {!loading && !error && (
        <div className="flex gap-2 border-t border-[#1e1e1e] p-2">
          <button
            onClick={() => onInsert(result)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Insert
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
