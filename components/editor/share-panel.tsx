"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { scaleIn, useMotionVariants, springSnap, buttonTap } from "@/lib/motion";
import { toast } from "@/lib/toast";

interface SharePanelProps {
  noteId: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
}

export function SharePanel({ noteId, anchorRef, onDismiss }: SharePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const motionProps = useMotionVariants(scaleIn);
  const [copied, setCopied] = useState<"idle" | "copied">("idle");

  const shareRecord = useQuery(api.shares.listForNote, { noteId: noteId as Id<"notes"> });
  const createShare = useMutation(api.shares.create);
  const updatePermission = useMutation(api.shares.updatePermission);
  const revokeShare = useMutation(api.shares.revoke);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
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

  async function handleCreate(permission: "view" | "edit") {
    await createShare({ noteId: noteId as Id<"notes">, permission });
    toast.success("Share link created");
  }

  async function handleCopy() {
    if (!shareRecord) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied("copied");
    toast.copy("Link copied!");
    setTimeout(() => setCopied("idle"), 2000);
  }

  async function handlePermChange(permission: "view" | "edit") {
    if (!shareRecord) return;
    await updatePermission({ shareId: shareRecord._id, permission });
  }

  async function handleRevoke() {
    await revokeShare({ noteId: noteId as Id<"notes"> });
    toast.success("Access removed");
  }

  const shareUrl = shareRecord ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${shareRecord.token}` : "";

  const currentPerm = shareRecord?.permission ?? "view";

  return (
    <motion.div
      ref={panelRef}
      {...motionProps}
      role="dialog"
      aria-modal="true"
      aria-label="Share note"
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 60 }}
      className="w-72 rounded-2xl border border-line-2 bg-surface p-4 shadow-none neu-card"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-ai" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-sm font-bold text-ink-1">Share</span>
        </div>
        <button
          onClick={onDismiss}
          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-4 hover:bg-hover hover:text-ink-2 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {shareRecord === undefined ? (
        <div className="text-xs text-ink-4">Loading…</div>
      ) : shareRecord === null ? (
        // No share exists — create one
        <div>
          <p className="mb-3 text-xs text-ink-3">Choose access level to generate a share link</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleCreate("view")}
              className="flex-1 rounded-lg border border-line-2 px-3 py-2 text-xs text-ink-2 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-1"
            >
              Can view
            </button>
            <button
              onClick={() => handleCreate("edit")}
              className="flex-1 rounded-lg border border-ai/30 bg-ai-dim px-3 py-2 text-xs font-medium text-ai transition-colors hover:bg-ai-dim/80"
            >
              Can edit
            </button>
          </div>
        </div>
      ) : (
        // Share exists — show URL + controls
        <div>
          {/* Share URL display */}
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-line-2 bg-raised px-3 py-2 neu-inset">
            <svg className="h-3.5 w-3.5 shrink-0 text-ink-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="flex-1 truncate font-mono text-[10px] text-ink-3">{shareUrl}</span>
          </div>

          {/* Copy button */}
          <motion.button
            {...buttonTap}
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: "#2563EB" }}
          >
            <AnimatePresence mode="wait">
              {copied === "copied" ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={springSnap}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={springSnap}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
            {copied === "copied" ? "Copied!" : "Copy link"}
          </motion.button>

          {/* Permission toggle */}
          <div className="flex rounded-lg p-0.5 neu-inset mt-3">
            {(["view", "edit"] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePermChange(p)}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-all ${
                  currentPerm === p ? "text-white" : "text-ink-3"
                }`}
                style={currentPerm === p ? { backgroundColor: "#2563EB" } : {}}
              >
                {p === "view" ? "👁 View" : "✏️ Edit"}
              </button>
            ))}
          </div>

          {/* Revoke */}
          <button
            onClick={handleRevoke}
            className="mt-3 w-full text-xs text-error transition-colors hover:text-error/80"
          >
            Remove access
          </button>
        </div>
      )}
    </motion.div>
  );
}
