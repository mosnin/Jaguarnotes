"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { springStd } from "@/lib/motion";

/* ─── Types ────────────────────────────────────────────────────────── */

type NoteStatus = "draft" | "active" | "archived";

interface LinkedNote {
  _id: string;
  title?: string;
  emoji?: string;
}

interface ChildNote {
  _id: string;
  title?: string;
  emoji?: string;
}

interface NotePropertiesPanelProps {
  // Info
  createdAt?: number;
  updatedAt?: number;
  wordCount: number;

  // Tags
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;

  // Connections
  linkedNotes: LinkedNote[];
  backlinks: LinkedNote[];
  onLinkNote: () => void;

  // Sub-notes
  childNotes: ChildNote[];
  canAddSubNote: boolean;
  onNewSubNote: () => void;

  // Status
  status?: NoteStatus;
  onStatusChange: (status: NoteStatus) => void;
}

/* ─── Section wrapper ──────────────────────────────────────────────── */

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line-1 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-3 hover:text-ink-2 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ─── Main panel ─────────────────────────────────────────────────────── */

export function NotePropertiesPanel({
  createdAt,
  updatedAt,
  wordCount,
  tags,
  onAddTag,
  onRemoveTag,
  linkedNotes,
  backlinks,
  onLinkNote,
  childNotes,
  canAddSubNote,
  onNewSubNote,
  status,
  onStatusChange,
}: NotePropertiesPanelProps) {
  const [tagInput, setTagInput] = useState("");

  const readingTimeMin = Math.max(1, Math.round(wordCount / 200));
  const readingLabel =
    readingTimeMin < 2 ? "~1 min" : `~${readingTimeMin} min`;

  const noteStatus = status ?? "active";

  function formatDate(ts: number | undefined) {
    if (!ts) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(ts));
  }

  function handleAddTag() {
    const tag = tagInput.trim().toLowerCase().replace(/,/g, "");
    if (!tag || tags.includes(tag)) {
      setTagInput("");
      return;
    }
    onAddTag(tag);
    setTagInput("");
  }

  const createdDate = formatDate(createdAt);
  const modifiedDate = formatDate(updatedAt);

  return (
    <motion.aside
      initial={{ x: 260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 260, opacity: 0 }}
      transition={springStd}
      className="hidden md:flex w-64 shrink-0 flex-col overflow-y-auto border-l border-line-1 bg-surface"
      aria-label="Note properties"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-1">
        <span className="text-sm font-bold text-ink-1">Properties</span>
      </div>

      {/* ── Info section ──────────────────────────────────────────────── */}
      <Section title="Info">
        <div className="px-4 py-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-4">Words</span>
            <span className="text-[10px] font-semibold text-ink-2">
              {wordCount > 0 ? wordCount.toLocaleString() : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-4">Read time</span>
            <span className="text-[10px] font-semibold text-ink-2">
              {wordCount > 0 ? readingLabel : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-4">Created</span>
            <span className="text-[10px] font-semibold text-ink-2">{createdDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-4">Modified</span>
            <span className="text-[10px] font-semibold text-ink-2">{modifiedDate}</span>
          </div>
        </div>
      </Section>

      {/* ── Status section ────────────────────────────────────────────── */}
      <Section title="Status">
        <div className="mx-4 mb-3 flex rounded-lg p-0.5 neu-inset">
          {(["draft", "active", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`flex-1 rounded-md py-1.5 text-[10px] font-semibold capitalize transition-all ${
                noteStatus === s ? "text-white" : "text-ink-3 hover:text-ink-2"
              }`}
              style={
                noteStatus === s
                  ? {
                      backgroundColor: "#2563EB",
                      boxShadow: "1px 1px 3px rgba(37,99,235,0.3)",
                    }
                  : {}
              }
            >
              {s}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Tags section ──────────────────────────────────────────────── */}
      <Section title="Tags">
        <div className="px-4 pb-3">
          {tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-raised px-2 py-0.5 text-[10px] font-medium text-ink-2 neu-xs"
                >
                  {tag}
                  <button
                    onClick={() => onRemoveTag(tag)}
                    className="h-3 w-3 text-ink-4 hover:text-error transition-colors leading-none"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value.replace(",", ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                handleAddTag();
              }
              if (e.key === "Backspace" && !tagInput && tags.length > 0) {
                onRemoveTag(tags[tags.length - 1]);
              }
            }}
            onBlur={handleAddTag}
            placeholder="Add tag…"
            className="rounded-lg border border-dashed border-line-2 px-2 py-1 text-[11px] text-ink-2 bg-transparent outline-none focus:border-ai/40 w-full mt-1.5 placeholder-ink-4"
          />
        </div>
      </Section>

      {/* ── Connections section ───────────────────────────────────────── */}
      <Section title="Connections" defaultOpen={false}>
        <div className="pb-3">
          {linkedNotes.length > 0 && (
            <div className="mb-3">
              <p className="px-4 mb-1.5 text-[9px] uppercase tracking-wide text-ink-4">
                Links to
              </p>
              <div className="flex flex-col gap-0.5 px-2">
                {linkedNotes.map((link) => (
                  <Link
                    key={link._id}
                    href={`/notes/${link._id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-hover hover:text-ink-1 transition-colors"
                  >
                    <span className="text-sm">{link.emoji ?? "📝"}</span>
                    <span className="truncate">{link.title || "Untitled"}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {backlinks.length > 0 && (
            <div className="mb-3">
              <p className="px-4 mb-1.5 text-[9px] uppercase tracking-wide text-ink-4">
                Linked from
              </p>
              <div className="flex flex-col gap-0.5 px-2">
                {backlinks.map((link) => (
                  <Link
                    key={link._id}
                    href={`/notes/${link._id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-hover hover:text-ink-1 transition-colors"
                  >
                    <span className="text-sm">{link.emoji ?? "📝"}</span>
                    <span className="truncate">{link.title || "Untitled"}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {linkedNotes.length === 0 && backlinks.length === 0 && (
            <p className="px-4 mb-2 text-[11px] text-ink-4">No connections yet.</p>
          )}

          <div className="px-4">
            <button
              onClick={onLinkNote}
              className="flex w-full items-center gap-1.5 rounded-md border border-line-1 px-2.5 py-1.5 text-[10px] text-ink-4 transition-colors hover:border-line-2 hover:bg-hover hover:text-ink-2 neu-xs"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
              Link note
            </button>
          </div>
        </div>
      </Section>

      {/* ── Sub-notes section ─────────────────────────────────────────── */}
      <Section title="Sub-notes" defaultOpen={false}>
        <div className="pb-3">
          {childNotes.length > 0 && (
            <div className="mb-2 flex flex-col gap-0.5 px-2">
              {childNotes.map((child) => (
                <Link
                  key={child._id}
                  href={`/notes/${child._id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-hover hover:text-ink-1 transition-colors"
                >
                  <span className="text-sm">{child.emoji ?? "📝"}</span>
                  <span className="truncate">{child.title || "Untitled"}</span>
                </Link>
              ))}
            </div>
          )}

          {childNotes.length === 0 && (
            <p className="px-4 mb-2 text-[11px] text-ink-4">No sub-notes yet.</p>
          )}

          {canAddSubNote && (
            <div className="px-4">
              <button
                onClick={onNewSubNote}
                className="flex w-full items-center gap-1.5 rounded-md border border-line-1 px-2.5 py-1.5 text-[10px] text-ink-4 transition-colors hover:border-line-2 hover:bg-hover hover:text-ink-2 neu-xs"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New sub-note
              </button>
            </div>
          )}
        </div>
      </Section>
    </motion.aside>
  );
}
