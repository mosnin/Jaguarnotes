"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import { Id } from "@/convex/_generated/dataModel";

interface OverflowMenuProps {
  noteId: string;
  note: { pinned?: boolean };
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
  onLinkNote: () => void;
  onShare: () => void;
  onPin: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function OverflowMenu({ note, anchorRef, onDismiss, onLinkNote, onShare, onPin, onExport, onDelete }: OverflowMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

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

  return (
    <motion.div
      ref={panelRef}
      variants={scaleIn}
      initial="hidden"
      animate="show"
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 60 }}
      className="w-52 overflow-hidden rounded-xl border border-line-3 bg-surface shadow-2xl shadow-black/70 py-1"
    >
      {showDeleteConfirm ? (
        <div className="px-4 py-3">
          <p className="mb-3 text-sm text-ink-2">Delete this note? This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="flex-1 rounded-lg bg-error/10 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/20"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 rounded-lg px-3 py-1.5 text-xs text-ink-3 transition-colors hover:bg-raised hover:text-ink-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <MenuItem onClick={onLinkNote} icon={<LinkIcon />} label="Link note" />
          <MenuItem onClick={onShare} icon={<ShareIcon />} label="Share" />
          <MenuItem
            onClick={onPin}
            icon={<PinIcon filled={!!note.pinned} />}
            label={note.pinned ? "Unpin" : "Pin"}
            active={!!note.pinned}
          />
          <MenuItem onClick={onExport} icon={<DownloadIcon />} label="Export .md" />
          <div className="my-1 border-t border-line-1" />
          <MenuItem
            onClick={() => setShowDeleteConfirm(true)}
            icon={<TrashIcon />}
            label="Delete"
            danger
          />
        </>
      )}
    </motion.div>
  );
}

function MenuItem({ onClick, icon, label, danger, active }: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-raised ${
        danger ? "text-error" : active ? "text-ai" : "text-ink-2"
      }`}
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
      {label}
    </button>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function PinIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
