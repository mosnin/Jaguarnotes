"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { scaleIn, useMotionVariants } from "@/lib/motion";
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
    const url = `${window.location.origin}/invite/${shareRecord.token}`;
    await navigator.clipboard.writeText(url);
    toast.copy("Link copied to clipboard");
  }

  async function handlePermissionChange(permission: "view" | "edit") {
    if (!shareRecord) return;
    await updatePermission({ shareId: shareRecord._id, permission });
  }

  async function handleRevoke() {
    await revokeShare({ noteId: noteId as Id<"notes"> });
    toast.success("Access removed");
  }

  const shareUrl = shareRecord ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${shareRecord.token}` : "";

  return (
    <motion.div
      ref={panelRef}
      {...motionProps}
      role="dialog"
      aria-modal="true"
      aria-label="Share note"
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 60 }}
      className="w-80 overflow-hidden rounded-xl border border-line-2 bg-surface neu-card"
    >
      <div className="border-b border-line-1 px-4 py-3">
        <p className="text-sm font-medium text-ink-1">Share note</p>
        <p className="mt-0.5 text-xs text-ink-4">Anyone with the link can access this note</p>
      </div>

      {shareRecord === undefined ? (
        <div className="px-4 py-4 text-xs text-ink-4">Loading…</div>
      ) : shareRecord === null ? (
        // No share exists — create one
        <div className="p-4">
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
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-line-2 bg-raised px-3 py-2">
            <p className="flex-1 truncate text-xs text-ink-3">{shareUrl}</p>
            <button
              onClick={handleCopy}
              className="shrink-0 text-xs font-medium text-ai transition-colors hover:text-ai/80"
            >
              Copy
            </button>
          </div>

          <div className="mb-4 flex rounded-lg border border-line-2 p-0.5">
            {(["view", "edit"] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePermissionChange(p)}
                className={`flex-1 rounded-md py-1.5 text-xs capitalize transition-colors ${
                  shareRecord.permission === p
                    ? "bg-raised border border-line-2 font-medium text-ink-1"
                    : "text-ink-4 hover:text-ink-2"
                }`}
              >
                Can {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleRevoke}
            className="w-full text-xs text-error transition-colors hover:text-error/80"
          >
            Remove access
          </button>
        </div>
      )}
    </motion.div>
  );
}
