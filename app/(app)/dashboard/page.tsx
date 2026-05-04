"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "@/lib/utils";
import { staggerContainer, staggerItem, cardHover, buttonTap } from "@/lib/motion";
import { useSidebar } from "@/components/app/sidebar-context";
import { NoteCardSkeleton } from "@/components/ui/note-card-skeleton";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const notesQuery = useQuery(api.notes.list);
  const notes = notesQuery ?? [];
  const sharedNotes = useQuery(api.notes.listShared) ?? [];
  const createNote = useMutation(api.notes.create);
  const { toggle: toggleSidebar } = useSidebar();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const [quickTopic, setQuickTopic] = useState("");

  // Tag clusters — tags appearing on 3+ notes surface as actionable groups
  const tagFrequency = new Map<string, number>();
  notes.forEach((n) => (n.tags ?? []).forEach((t) => tagFrequency.set(t, (tagFrequency.get(t) ?? 0) + 1)));
  const clusters = [...tagFrequency.entries()].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]);

  async function handleNewNote() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
  }

  async function handleQuickStart(e: React.FormEvent) {
    e.preventDefault();
    if (!quickTopic.trim()) return;
    const id = await createNote({ title: quickTopic.trim() });
    router.push(`/notes/${id}?cmd=brainstorm&topic=${encodeURIComponent(quickTopic.trim())}`);
  }

  const firstName = user?.firstName ?? "there";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Top bar */}
      <div className="flex h-10 shrink-0 items-center justify-between px-6 md:px-8">
        <motion.button
          {...buttonTap}
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-raised hover:text-ink-2"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
        <kbd className="hidden rounded border border-line-1 bg-raised px-2 py-0.5 text-[10px] font-mono text-ink-4 md:block">⌘K search</kbd>
      </div>

      <div className="flex-1 px-6 pb-16 pt-6 md:px-8 md:pt-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.9 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold tracking-tight text-ink-1 md:text-4xl">
            Good {getTimeOfDay()}, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-ink-4">
            {notes.length === 0
              ? "What are you thinking about?"
              : `${notes.filter((n) => !n.parentId).length} note${notes.filter((n) => !n.parentId).length === 1 ? "" : "s"}`}
          </p>
        </motion.div>

        {/* Quick actions — primary + secondary hierarchy */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mb-10 flex flex-col gap-2"
        >
          {/* Primary: New note — owns the space */}
          <motion.button
            variants={staggerItem}
            {...cardHover}
            onClick={handleNewNote}
            className="flex flex-col gap-1.5 rounded-lg border border-line-2 bg-raised p-4 text-left transition-colors hover:border-line-3 hover:bg-hover"
          >
            <p className="text-sm font-medium text-ink-1">New note</p>
            <p className="text-xs text-ink-3">Empty canvas, anything goes</p>
          </motion.button>

          {/* Secondary: AI-powered starting points */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Brainstorm",    sub: "Turn a seed into a full idea",    action: async () => { const id = await createNote({ title: "Brainstorm" }); router.push(`/notes/${id}?cmd=brainstorm`); } },
              { label: "Outline",       sub: "Structure a thought from scratch", action: async () => { const id = await createNote({ title: "Outline" }); router.push(`/notes/${id}?cmd=outline`); } },
              { label: "Meeting notes", sub: "Capture it before it's gone",     action: async () => { const id = await createNote({ title: "Meeting Notes" }); router.push(`/notes/${id}`); } },
            ].map((item) => (
              <motion.button
                key={item.label}
                variants={staggerItem}
                {...cardHover}
                onClick={item.action}
                className="flex flex-col gap-1.5 rounded-lg border border-line-1 bg-surface p-4 text-left transition-colors hover:border-line-2 hover:bg-raised"
              >
                <p className="text-sm font-medium text-ink-1">{item.label}</p>
                <p className="text-xs text-ink-4">{item.sub}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tag clusters — structure from behavior */}
        {clusters.length > 0 && (
          <div className="mb-8">
            <p className="mb-4 text-[10px] uppercase tracking-widest text-ink-4">Clusters</p>
            <div className="flex flex-wrap gap-2">
              {clusters.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => router.push(activeTag === tag ? "/dashboard" : `/dashboard?tag=${encodeURIComponent(tag)}`)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    activeTag === tag
                      ? "border-ai/40 bg-ai-dim text-ai"
                      : "border-line-1 text-ink-3 hover:border-line-2 hover:bg-raised"
                  }`}
                >
                  <span className="font-medium">{count}</span>
                  <span className="text-ink-4">·</span>
                  <span>{tag}</span>
                  <span className="text-ink-4">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pinned notes */}
        {notes.some((n) => n.pinned) && (
          <div className="mb-8">
            <p className="mb-4 text-[10px] uppercase tracking-widest text-ink-4">Pinned</p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {notes.filter((n) => n.pinned).map((note) => (
                <NoteCard key={note._id} note={note} onClick={() => router.push(`/notes/${note._id}`)} />
              ))}
            </motion.div>
          </div>
        )}

        {/* Recent notes grid — skeleton while loading */}
        {notesQuery === undefined ? (
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-widest text-ink-4">Notes</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => <NoteCardSkeleton key={i} />)}
            </div>
          </div>
        ) : notes.filter((n) => !n.pinned && !n.parentId && (!activeTag || (n.tags ?? []).includes(activeTag))).length > 0 ? (
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-widest text-ink-4">
              {activeTag ? activeTag : notes.some((n) => n.pinned) ? "Recent" : "Notes"}
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {notes
                .filter((n) => !n.pinned && !n.parentId && (!activeTag || (n.tags ?? []).includes(activeTag)))
                .map((note) => (
                  <NoteCard key={note._id} note={note} onClick={() => router.push(`/notes/${note._id}`)} />
                ))}
            </motion.div>
          </div>
        ) : null}

        {/* Shared with me */}
        {sharedNotes.length > 0 && (
          <div className="mt-8">
            <p className="mb-4 text-[10px] uppercase tracking-widest text-ink-4">Shared with me</p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {sharedNotes.map((note) => (
                <NoteCard key={note._id} note={note} onClick={() => router.push(`/notes/${note._id}`)} />
              ))}
            </motion.div>
          </div>
        )}

        {/* Empty state — AI-first quick-start input */}
        {notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 32 }}
            className="max-w-lg py-8"
          >
            <form onSubmit={handleQuickStart} className="flex flex-col gap-3">
              <input
                value={quickTopic}
                onChange={(e) => setQuickTopic(e.target.value)}
                placeholder="What do you want to think through?"
                className="w-full rounded-xl border border-line-2 bg-surface px-5 py-4 text-base text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-line-3"
              />
              <p className="text-xs text-ink-4">
                Press Enter to brainstorm —{" "}
                <button
                  type="button"
                  onClick={handleNewNote}
                  className="text-ink-3 transition-colors hover:text-ink-1"
                >
                  or create a blank note
                </button>
                .
              </p>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, onClick }: { note: { _id: string; _creationTime: number; title: string; preview?: string; emoji?: string; tags?: string[]; pinned?: boolean }; onClick: () => void }) {
  return (
    <motion.button
      variants={staggerItem}
      {...cardHover}
      onClick={onClick}
      className="flex flex-col gap-2 rounded-lg border border-line-1 bg-surface p-4 text-left transition-colors hover:border-line-2 hover:bg-raised"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {note.emoji && <span className="shrink-0 text-base leading-none">{note.emoji}</span>}
          <p className="truncate text-sm font-medium text-ink-1">{note.title || "Untitled"}</p>
        </div>
        <span className="shrink-0 text-[10px] text-ink-4">{formatDistanceToNow(note._creationTime)}</span>
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-ink-3">
        {note.preview || "No content yet"}
      </p>
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-line-1 px-2 py-0.5 text-[10px] text-ink-4">
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="rounded-full border border-line-1 px-2 py-0.5 text-[10px] text-ink-4">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
