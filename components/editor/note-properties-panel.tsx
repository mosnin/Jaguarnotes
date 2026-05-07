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

/* ─── Tag color palette ─────────────────────────────────────────────── */

const TAG_COLORS = [
  "bg-[#EDE8FF] text-[#6B46C1] border-[#D4C5FF]",
  "bg-[#DCF0FF] text-[#1D6FA4] border-[#B8DEFF]",
  "bg-[#E3F5E1] text-[#2F7D32] border-[#C8EFC4]",
  "bg-[#FFE4F0] text-[#BE185D] border-[#FFD0E4]",
  "bg-[#FFF5DC] text-[#92400E] border-[#FFE8B0]",
  "bg-[#FFE8DF] text-[#C2410C] border-[#FFC9B0]",
  "bg-[#E0F4F4] text-[#0F766E] border-[#C2ECEC]",
  "bg-[#F4F8FF] text-[#4A6D8C] border-[#D5E4F5]",
];

function tagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length];
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
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-4">
          {title}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-ink-4 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* ─── Status toggle ─────────────────────────────────────────────────── */

const STATUS_OPTIONS: {
  value: NoteStatus;
  label: string;
  dotClass: string;
}[] = [
  { value: "draft", label: "Draft", dotClass: "bg-ink-4" },
  { value: "active", label: "Active", dotClass: "bg-ok" },
  { value: "archived", label: "Archived", dotClass: "bg-warn" },
];

function StatusToggle({
  status,
  onChange,
}: {
  status: NoteStatus | undefined;
  onChange: (s: NoteStatus) => void;
}) {
  const current = status ?? "active";

  return (
    <div className="flex rounded-lg border border-line-1 bg-app overflow-hidden neu-inset">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium transition-all ${
            current === opt.value
              ? "bg-surface text-ink-1 neu-xs"
              : "text-ink-4 hover:text-ink-2"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${opt.dotClass} shrink-0`}
          />
          {opt.label}
        </button>
      ))}
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

  return (
    <motion.aside
      initial={{ x: 260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 260, opacity: 0 }}
      transition={springStd}
      className="hidden md:flex w-[260px] shrink-0 flex-col overflow-y-auto border-l border-line-1 bg-surface"
      aria-label="Note properties"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-line-1 px-4 py-3">
        <span className="text-xs font-semibold text-ink-2">Properties</span>
      </div>

      {/* ── Info section ──────────────────────────────────────────────── */}
      <Section title="Info">
        <dl className="grid grid-cols-2 gap-x-2 gap-y-2.5">
          <div>
            <dt className="mb-0.5 text-[9px] uppercase tracking-wide text-ink-4">
              Created
            </dt>
            <dd className="text-[11px] text-ink-3">{formatDate(createdAt)}</dd>
          </div>
          <div>
            <dt className="mb-0.5 text-[9px] uppercase tracking-wide text-ink-4">
              Modified
            </dt>
            <dd className="text-[11px] text-ink-3">{formatDate(updatedAt)}</dd>
          </div>
          <div>
            <dt className="mb-0.5 text-[9px] uppercase tracking-wide text-ink-4">
              Words
            </dt>
            <dd className="text-[11px] font-medium tabular-nums text-ink-2">
              {wordCount > 0 ? wordCount.toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="mb-0.5 text-[9px] uppercase tracking-wide text-ink-4">
              Read time
            </dt>
            <dd className="text-[11px] text-ink-3">
              {wordCount > 0 ? readingLabel : "—"}
            </dd>
          </div>
        </dl>
      </Section>

      {/* ── Status section ────────────────────────────────────────────── */}
      <Section title="Status">
        <StatusToggle status={status} onChange={onStatusChange} />
      </Section>

      {/* ── Tags section ──────────────────────────────────────────────── */}
      <Section title="Tags">
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={tag}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${tagColor(i)}`}
              >
                {tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
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
          className="w-full rounded-md border border-line-1 bg-app px-2.5 py-1.5 text-[11px] text-ink-3 placeholder-ink-4 outline-none transition-colors focus:border-line-2 focus:bg-surface neu-inset"
        />
      </Section>

      {/* ── Connections section ───────────────────────────────────────── */}
      <Section title="Connections" defaultOpen={false}>
        {linkedNotes.length > 0 && (
          <div className="mb-3">
            <p className="mb-1.5 text-[9px] uppercase tracking-wide text-ink-4">
              Links to
            </p>
            <div className="flex flex-col gap-1">
              {linkedNotes.map((note) => (
                <Link
                  key={note._id}
                  href={`/notes/${note._id}`}
                  className="flex items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-[11px] text-ink-3 transition-colors hover:bg-hover hover:text-ink-1"
                >
                  {note.emoji && (
                    <span className="shrink-0 text-xs">{note.emoji}</span>
                  )}
                  <span className="truncate">{note.title || "Untitled"}</span>
                  <span className="ml-auto shrink-0 text-[9px] text-ink-4">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {backlinks.length > 0 && (
          <div className="mb-3">
            <p className="mb-1.5 text-[9px] uppercase tracking-wide text-ink-4">
              Linked from
            </p>
            <div className="flex flex-col gap-1">
              {backlinks.map((note) => (
                <Link
                  key={note._id}
                  href={`/notes/${note._id}`}
                  className="flex items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-[11px] text-ink-3 transition-colors hover:bg-hover hover:text-ink-1"
                >
                  {note.emoji && (
                    <span className="shrink-0 text-xs">{note.emoji}</span>
                  )}
                  <span className="truncate">{note.title || "Untitled"}</span>
                  <span className="ml-auto shrink-0 text-[9px] text-ink-4">
                    ←
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {linkedNotes.length === 0 && backlinks.length === 0 && (
          <p className="mb-2 text-[11px] text-ink-4">No connections yet.</p>
        )}

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
      </Section>

      {/* ── Sub-notes section ─────────────────────────────────────────── */}
      <Section title="Sub-notes" defaultOpen={false}>
        {childNotes.length > 0 && (
          <div className="mb-2 flex flex-col gap-1">
            {childNotes.map((child) => (
              <Link
                key={child._id}
                href={`/notes/${child._id}`}
                className="flex items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-[11px] text-ink-3 transition-colors hover:bg-hover hover:text-ink-1"
              >
                {child.emoji && (
                  <span className="shrink-0 text-xs">{child.emoji}</span>
                )}
                <span className="truncate">{child.title || "Untitled"}</span>
              </Link>
            ))}
          </div>
        )}

        {childNotes.length === 0 && (
          <p className="mb-2 text-[11px] text-ink-4">No sub-notes yet.</p>
        )}

        {canAddSubNote && (
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
        )}
      </Section>
    </motion.aside>
  );
}
