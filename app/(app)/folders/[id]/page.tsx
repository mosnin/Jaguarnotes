"use client";

import { memo, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { buttonTap, staggerContainer, staggerItem, scaleIn } from "@/lib/motion";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

/* ─── Design tokens ──────────────────────────────────────────────────── */

const CARD_COLORS = [
  { bg: "#EDE8FF", border: "#CFC6F7", dot: "#8B7CF6" },
  { bg: "#FFE8DF", border: "#F5C9B8", dot: "#F07048" },
  { bg: "#E3F5E1", border: "#B8E8B4", dot: "#4CAF50" },
  { bg: "#FFF5DC", border: "#F5DFA0", dot: "#D4A017" },
  { bg: "#DCF0FF", border: "#A8D8F5", dot: "#2563EB" },
  { bg: "#FFE4F0", border: "#F5B8D0", dot: "#D64F8B" },
];

/* ─── Note Card ──────────────────────────────────────────────────────── */

const NoteCard = memo(function NoteCard({
  note,
  colorIndex,
  onClick,
}: {
  note: {
    _id: string;
    _creationTime: number;
    title: string;
    preview?: string;
    emoji?: string;
    tags?: string[];
    pinned?: boolean;
  };
  colorIndex: number;
  onClick: () => void;
}) {
  const color = CARD_COLORS[colorIndex];
  const previewLines = note.preview
    ? note.preview
        .split(/[.\n]/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 30 } }}
      whileTap={{ scale: 0.98 }}
      className="relative flex h-52 w-full flex-col overflow-hidden rounded-2xl text-left transition-shadow neu-card"
      style={{ background: "#EDF4FF" }}
    >
      {/* Colored header band */}
      <div
        className="flex shrink-0 flex-col gap-0.5 px-3.5 py-3"
        style={{ background: color.bg, borderBottom: `1px solid ${color.border}` }}
      >
        <div className="flex items-center gap-1.5">
          {note.emoji && <span className="shrink-0 text-sm leading-none">{note.emoji}</span>}
          <p className="truncate text-sm font-bold text-ink-1">{note.title || "Untitled"}</p>
        </div>
        <p className="mt-0.5 text-[10px] font-medium" style={{ color: color.dot, opacity: 0.8 }}>
          {new Date(note._creationTime).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Preview lines */}
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-2.5">
        {previewLines.length > 0 ? (
          previewLines.slice(0, 3).map((line, i) => (
            <p key={i} className="truncate text-xs leading-relaxed text-ink-3">
              {line}
            </p>
          ))
        ) : (
          <p className="text-xs italic text-ink-4">No content yet</p>
        )}
      </div>

      {/* Edit button */}
      <div className="flex justify-end px-3 pb-3">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ background: color.dot }}
        >
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
      </div>
    </motion.button>
  );
});

/* ─── Empty State ────────────────────────────────────────────────────── */

function FolderEmptyState({
  folderName,
  folderColor,
  onNewNote,
}: {
  folderName: string;
  folderColor: string;
  onNewNote: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 32, delay: 0.1 }}
      className="flex flex-col items-center gap-6 py-20 text-center"
    >
      {/* Illustration */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-3xl text-4xl"
        style={{
          background: folderColor,
          boxShadow: "4px 4px 16px rgba(27,54,82,0.12), -4px -4px 16px rgba(255,255,255,0.8)",
        }}
      >
        📂
      </div>
      <div>
        <p className="text-base font-semibold text-ink-1">{folderName} is empty</p>
        <p className="mt-1 text-sm text-ink-4">
          Add your first note to start organizing your ideas.
        </p>
      </div>
      <motion.button
        {...buttonTap}
        onClick={onNewNote}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white neu-btn"
        style={{ background: "#2563EB" }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
        </svg>
        New note in {folderName}
      </motion.button>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as Id<"folders">;

  const folders = useQuery(api.folders.list) ?? [];
  const notes = useQuery(api.folders.listNotes, { folderId }) ?? [];
  const createNote = useMutation(api.notes.create);
  const moveNote = useMutation(api.folders.moveNote);

  const folder = folders.find((f) => f._id === folderId);

  const [isCreating, setIsCreating] = useState(false);

  async function handleNewNote() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const id = await createNote({ title: "Untitled", folderId });
      router.push(`/notes/${id}`);
    } finally {
      setIsCreating(false);
    }
  }

  // Derived values
  const folderColor = folder?.color ?? "#EDE8FF";
  const folderEmoji = folder?.emoji ?? "📁";
  const folderName = folder?.name ?? "Folder";
  const noteCount = notes.length;

  // Loading state — folder list not fetched yet
  const isLoading = folders === undefined || notes === undefined;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Top bar */}
      <div className="flex h-10 shrink-0 items-center gap-3 px-6 md:px-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium text-ink-4 transition-colors hover:text-ink-2"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>
        <span className="text-[10px] text-ink-4">/</span>
        <span className="text-xs font-medium text-ink-2 truncate max-w-[140px]">{folderName}</span>
      </div>

      <div className="flex-1 pb-20 pt-2 md:pt-6">
        {/* ── Folder header ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.9 }}
          className="mb-8 px-6 md:px-8"
        >
          {/* Folder hero banner */}
          <div
            className="flex items-center gap-4 rounded-2xl px-6 py-5 mb-1"
            style={{
              background: folderColor,
              boxShadow: "4px 4px 16px rgba(27,54,82,0.1), -3px -3px 12px rgba(255,255,255,0.8)",
              border: "1px solid rgba(27,54,82,0.06)",
            }}
          >
            <span className="text-4xl leading-none select-none">{folderEmoji}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-ink-1 truncate md:text-3xl">
                {folderName}
              </h1>
              <p className="mt-0.5 text-sm text-ink-3">
                {isLoading
                  ? "Loading…"
                  : `${noteCount} note${noteCount === 1 ? "" : "s"}`}
              </p>
            </div>

            {/* Add note button */}
            <motion.button
              {...buttonTap}
              onClick={handleNewNote}
              disabled={isCreating}
              className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 neu-btn"
              style={{ background: "#2563EB" }}
            >
              {isCreating ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add note</span>
                  <span className="sm:hidden">Add</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Notes grid ── */}
        <section className="px-6 md:px-8">
          {isLoading ? (
            /* Skeleton grid */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => {
                const color = CARD_COLORS[i % CARD_COLORS.length];
                return (
                  <div
                    key={i}
                    className="h-52 overflow-hidden rounded-2xl neu-card"
                    style={{ background: "#EDF4FF" }}
                  >
                    <div className="h-14 w-full animate-pulse" style={{ background: color.bg }} />
                    <div className="space-y-2 p-3.5">
                      <div
                        className="h-3 w-24 animate-pulse rounded-full"
                        style={{ background: color.bg }}
                      />
                      <div
                        className="h-2.5 w-full animate-pulse rounded-full"
                        style={{ background: color.bg, opacity: 0.6 }}
                      />
                      <div
                        className="h-2.5 w-3/4 animate-pulse rounded-full"
                        style={{ background: color.bg, opacity: 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : notes.length === 0 ? (
            <FolderEmptyState
              folderName={folderName}
              folderColor={folderColor}
              onNewNote={handleNewNote}
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {notes.map((note, i) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  colorIndex={i % CARD_COLORS.length}
                  onClick={() => router.push(`/notes/${note._id}`)}
                />
              ))}

              {/* New note card */}
              <motion.button
                variants={staggerItem}
                {...buttonTap}
                onClick={handleNewNote}
                disabled={isCreating}
                className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-2 text-ink-4 transition-all hover:border-ai/40 hover:text-ai disabled:opacity-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line-2 transition-colors hover:border-ai/40">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-xs">New note</span>
              </motion.button>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
