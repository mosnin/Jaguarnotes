"use client";

import { useState, memo, useMemo, useEffect } from "react";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "@/lib/utils";
import { staggerContainer, staggerItem, buttonTap, springSnap } from "@/lib/motion";
import { useSidebar } from "@/components/app/sidebar-context";
import { NoteCardSkeleton } from "@/components/ui/note-card-skeleton";
import { FolderGrid } from "@/components/folders/folder-grid";
import { DragDropWrapper, DraggableNote, DroppableFolder } from "@/components/folders/drag-drop-wrapper";

/* Pastel header colors cycling per card index */
const CARD_COLORS = [
  { bg: "#EDE8FF", border: "#CFC6F7", dot: "#8B7CF6" },
  { bg: "#FFE8DF", border: "#F5C9B8", dot: "#F07048" },
  { bg: "#E3F5E1", border: "#B8E8B4", dot: "#4CAF50" },
  { bg: "#FFF5DC", border: "#F5DFA0", dot: "#D4A017" },
  { bg: "#DCF0FF", border: "#A8D8F5", dot: "#2563EB" },
  { bg: "#FFE4F0", border: "#F5B8D0", dot: "#D64F8B" },
];

const ROLE_ACTIONS: Record<string, Array<{ label: string; sub: string; cmd?: string; title: string }>> = {
  researcher: [
    { label: "Outline",    sub: "Structure your thinking",    cmd: "outline",    title: "Outline"    },
    { label: "Research",   sub: "Synthesize from the web",    cmd: "research",   title: "Research"   },
    { label: "Brainstorm", sub: "Turn a seed into ideas",     cmd: "brainstorm", title: "Brainstorm" },
  ],
  founder: [
    { label: "Brainstorm", sub: "Turn a seed into ideas",           cmd: "brainstorm", title: "Brainstorm" },
    { label: "Brief",      sub: "Collapse to exec brief",           cmd: "brief",      title: "Brief"      },
    { label: "Pre-mortem", sub: "Find failure before it finds you", cmd: "premortem",  title: "Pre-mortem" },
  ],
  writer: [
    { label: "Punch",      sub: "Make your words hit harder", cmd: "punch",      title: "Punch"      },
    { label: "Outline",    sub: "Structure from scratch",     cmd: "outline",    title: "Outline"    },
    { label: "Brainstorm", sub: "Turn a seed into ideas",     cmd: "brainstorm", title: "Brainstorm" },
  ],
  student: [
    { label: "Explain",    sub: "Deep-dive any concept",      cmd: "explain",    title: "Explain"    },
    { label: "Outline",    sub: "Structure your study notes", cmd: "outline",    title: "Outline"    },
    { label: "Brainstorm", sub: "Turn a seed into ideas",     cmd: "brainstorm", title: "Brainstorm" },
  ],
};

const DEFAULT_ACTIONS = [
  { label: "Brainstorm",    sub: "Turn a seed into a full idea",  cmd: "brainstorm", title: "Brainstorm"    },
  { label: "Outline",       sub: "Structure a thought",           cmd: "outline",    title: "Outline"       },
  { label: "Meeting notes", sub: "Capture it before it's gone",                     title: "Meeting Notes" },
];

type TimeFilter = "today" | "week" | "month";

function filterByTime(notes: { _creationTime: number }[], filter: TimeFilter) {
  const now = Date.now();
  const cut = { today: 86_400_000, week: 7 * 86_400_000, month: 30 * 86_400_000 }[filter];
  return notes.filter((n) => now - n._creationTime <= cut);
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const me = useQuery(api.users.getMe) as { role?: string; onboarded?: boolean } | null | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results: notes, status: notesStatus, loadMore } = usePaginatedQuery(
    api.notes.paginateNotes as any,
    {},
    { initialNumItems: 20 }
  );
  const sharedNotes = useQuery(api.notes.listShared) ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const folders     = (useQuery((api as any).folders.list) ?? []) as Array<{ _id: string; name: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const folderNoteCounts = (useQuery((api as any).folders.noteCounts) ?? {}) as Record<string, number>;
  const createNote  = useMutation(api.notes.create);
  const { toggle: toggleSidebar } = useSidebar();
  const searchParams = useSearchParams();
  const activeTag    = searchParams.get("tag");
  const [quickTopic, setQuickTopic]   = useState("");
  const [timeFilter, setTimeFilter]   = useState<TimeFilter>("week");
  const [tagFilter,  setTagFilter]    = useState<"all" | "recent">("all");
  const [timeOfDay,  setTimeOfDay]    = useState<string | null>(null);
  useEffect(() => { setTimeOfDay(getTimeOfDay()); }, []);

  const roleActions = (me?.role && ROLE_ACTIONS[me.role.toLowerCase()])
    ? ROLE_ACTIONS[me.role.toLowerCase()]
    : DEFAULT_ACTIONS;

  const rootNotes = useMemo(
    () => notes.filter((n) => !n.parentId && (!activeTag || (n.tags ?? []).includes(activeTag))),
    [notes, activeTag]
  );

  const filteredByTime = useMemo(() => filterByTime(rootNotes, timeFilter), [rootNotes, timeFilter]);

  const tagFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    notes.forEach((n) => (n.tags ?? []).forEach((t: string) => freq.set(t, (freq.get(t) ?? 0) + 1)));
    return freq;
  }, [notes]);

  const clusters = useMemo(() => {
    const all = [...tagFrequency.entries()].sort((a, b) => b[1] - a[1]);
    return tagFilter === "recent" ? all.slice(0, 5) : all;
  }, [tagFrequency, tagFilter]);

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

      <div className="flex-1 pb-20 pt-4 md:pt-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.9 }}
          className="mb-8 px-6 md:px-8"
        >
          <h1 className="text-2xl font-bold tracking-tight text-ink-1 md:text-3xl flex items-center gap-2">
            {timeOfDay
              ? `${timeOfDay === "morning" ? "Good morning" : timeOfDay === "afternoon" ? "Good afternoon" : "Good evening"}, ${firstName}.`
              : `Hey, ${firstName}.`}
            <span role="img" aria-label={timeOfDay === "morning" ? "sun" : timeOfDay === "evening" ? "moon" : "wave"}>
              {timeOfDay === "morning" ? "☀️" : timeOfDay === "evening" ? "🌙" : "👋"}
            </span>
          </h1>
          <p className="mt-1 text-sm text-ink-4">
            {notes.length === 0
              ? "What are you thinking about?"
              : `${notes.filter((n) => !n.parentId).length} note${notes.filter((n) => !n.parentId).length === 1 ? "" : "s"}${me?.role ? ` · ${me.role}` : ""}`}
          </p>
        </motion.div>

        {/* ── Folders + My Notes wrapped in single DndContext ── */}
        <DragDropWrapper>
        {/* ── Folders section ── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between px-6 md:px-8">
            <h2 className="text-base font-semibold text-ink-1">Folders</h2>
            <span className="text-xs text-ink-4">
              {folders.length === 0
                ? "Drag notes here to organize"
                : `${folders.length} folder${folders.length === 1 ? "" : "s"} · drag notes to organize`}
            </span>
          </div>
          <div className="px-6 md:px-8">
            <FolderGrid noteCounts={folderNoteCounts} />
          </div>
        </section>

        {/* ── My Notes section ── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between px-6 md:px-8">
            <h2 className="text-base font-semibold text-ink-1">My Notes</h2>
            {/* Time filter pill tabs */}
            <div className="flex items-center gap-1 rounded-full p-1 neu-pressed" style={{ background: "#EDF4FF" }}>
              {(["today", "week", "month"] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                    timeFilter === f
                      ? "font-semibold text-white"
                      : "font-medium text-ink-3 hover:text-ink-2"
                  }`}
                  style={
                    timeFilter === f
                      ? {
                          backgroundColor: "#2563EB",
                          boxShadow: "2px 2px 5px #C5D5E8, -2px -2px 5px #FFFFFF, 0 0 0 1px rgba(37,99,235,0.2)",
                        }
                      : {}
                  }
                >
                  {f === "today" ? "Today" : f === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>
          </div>

          {/* Recent section header */}
          <div className="flex items-center gap-2 mb-2 px-6 md:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-4">
              {filteredByTime.length > 0 ? "Recent" : "Results"}
            </p>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #D5E4F5, transparent)' }} />
          </div>

          {notesStatus === "LoadingFirstPage" ? (
            <div className="flex gap-3 overflow-x-auto px-6 pb-3 md:px-8">
              {Array.from({ length: 4 }).map((_, i) => {
                const color = CARD_COLORS[i % CARD_COLORS.length];
                return (
                  <div key={i} className="h-52 w-44 shrink-0 overflow-hidden rounded-2xl neu-card" style={{ background: "#EDF4FF" }}>
                    <div className="h-14 w-full animate-pulse" style={{ background: color.bg }} />
                    <div className="space-y-2 p-3.5">
                      <div className="h-3 w-24 animate-pulse rounded-full" style={{ background: color.bg }} />
                      <div className="h-2.5 w-full animate-pulse rounded-full" style={{ background: color.bg, opacity: 0.6 }} />
                      <div className="h-2.5 w-3/4 animate-pulse rounded-full" style={{ background: color.bg, opacity: 0.4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : filteredByTime.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto px-6 pb-3 md:px-8 scrollbar-hide"
              style={{ scrollbarWidth: "none" }}>
              {filteredByTime.map((note, i) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const n = note as any;
                return (
                  <DraggableNote key={n._id} note={n}>
                    <NoteCard
                      note={n}
                      colorIndex={i % CARD_COLORS.length}
                      onClick={() => router.push(`/notes/${n._id}`)}
                    />
                  </DraggableNote>
                );
              })}
              {/* New note card at end of carousel */}
              <motion.button
                whileHover={{ y: -3, transition: springSnap }}
                whileTap={{ scale: 0.96, transition: springSnap }}
                onClick={handleNewNote}
                className="flex-shrink-0 h-52 w-40 rounded-xl border-2 border-dashed border-line-2 hover:border-ai/40 flex flex-col items-center justify-center gap-2 text-ink-4 hover:text-ai transition-colors cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ border: '1.5px dashed #C2D5EB' }}>
                  <span className="text-ai text-lg leading-none font-light">+</span>
                </div>
                <span className="text-xs">New note</span>
              </motion.button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto px-6 pb-3 md:px-8">
              <motion.button
                {...buttonTap}
                onClick={handleNewNote}
                className="flex h-52 w-44 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-2 text-ink-4 transition-all hover:border-ai/40 hover:text-ai"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs">No notes yet</span>
              </motion.button>
            </div>
          )}

          {notesStatus === "CanLoadMore" && (
            <div className="px-6 pt-2 md:px-8">
              <button
                onClick={() => loadMore(20)}
                className="text-xs text-ink-4 hover:text-ink-2 transition-colors"
              >
                Load more →
              </button>
            </div>
          )}
        </section>
        </DragDropWrapper>

        {/* ── Quick AI actions ── */}
        <section className="mb-10 px-6 md:px-8">
          <h2 className="mb-4 text-base font-semibold text-ink-1">Quick Start</h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {/* New note — primary */}
            <motion.button
              variants={staggerItem}
              {...buttonTap}
              onClick={handleNewNote}
              className="col-span-2 flex items-center gap-3 rounded-xl px-5 py-2.5 text-left neu-btn sm:col-span-1"
              style={{ backgroundColor: "#2563EB" }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">+ New note</p>
                <p className="truncate text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Empty canvas</p>
              </div>
            </motion.button>

            {roleActions.map((item) => (
              <motion.button
                key={item.label}
                variants={staggerItem}
                {...buttonTap}
                onClick={async () => {
                  const id = await createNote({ title: item.title });
                  router.push(item.cmd ? `/notes/${id}?cmd=${item.cmd}` : `/notes/${id}`);
                }}
                className="flex items-center gap-3 rounded-xl border border-line-1 bg-surface px-4 py-3 text-left transition-all hover:border-line-2 neu-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "#EDE8FF" }}>
                  <svg className="h-3.5 w-3.5" style={{ color: "#8B7CF6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.214.107a2.25 2.25 0 001.357.126l.214-.107A2.25 2.25 0 0019.5 8.818V3.104m-9.75 0A24.255 24.255 0 0112 3" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-1">{item.label}</p>
                  <p className="truncate text-xs text-ink-4">{item.sub}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* ── Tags / Clusters ── */}
        {clusters.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between px-6 md:px-8">
              <h2 className="text-base font-semibold text-ink-1">Tags</h2>
              <div className="flex items-center gap-0 rounded-full p-0.5 neu-pressed" style={{ background: "#EDF4FF" }}>
                {(["all", "recent"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTagFilter(f)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      tagFilter === f
                        ? "text-white neu-btn"
                        : "text-ink-4 hover:text-ink-2"
                    }`}
                    style={tagFilter === f ? { backgroundColor: "#2563EB" } : {}}
                  >
                    {f === "all" ? "All" : "Recent"}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#EDF4FF] to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10" style={{ background: "linear-gradient(to left, #EDF4FF, transparent)" }} />
              <div
                className="flex gap-1.5 overflow-x-auto scrollbar-hide px-6 pb-3 md:px-8"
                style={{ scrollbarWidth: "none" }}
              >
                {clusters.map(([tag, count], i) => (
                  <TagFolder
                    key={tag}
                    tag={tag}
                    count={count}
                    colorIndex={i % CARD_COLORS.length}
                    active={activeTag === tag}
                    onClick={() => router.push(activeTag === tag ? "/dashboard" : `/dashboard?tag=${encodeURIComponent(tag)}`)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Shared with me ── */}
        {sharedNotes.length > 0 && (
          <section className="mb-10 px-6 md:px-8">
            <h2 className="mb-4 text-base font-semibold text-ink-1">Shared with me</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {sharedNotes.map((note, i) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  colorIndex={i % CARD_COLORS.length}
                  onClick={() => router.push(`/notes/${note._id}`)}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* ── Empty state ── */}
        {notes.length === 0 && notesStatus !== "LoadingFirstPage" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 32 }}
            className="px-6 py-2 md:px-8"
          >
            {/* Centered empty state hero */}
            <div className="mb-8 flex flex-col items-center text-center max-w-sm mx-auto py-6">
              <span className="mb-4 text-5xl leading-none" role="img" aria-label="writing">✍️</span>
              <p className="text-base font-bold text-ink-1 mb-1">No notes yet</p>
              <p className="text-sm text-ink-3 mb-6">Create your first note to get started</p>
              <motion.button
                whileTap={{ scale: 0.96, transition: springSnap }}
                whileHover={{ scale: 1.02, transition: springSnap }}
                onClick={handleNewNote}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white neu-btn"
                style={{ backgroundColor: "#2563EB" }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
                </svg>
                + Create your first note
              </motion.button>
            </div>

            {/* Quick-start input */}
            <div className="mb-3">
              <p className="text-xs text-ink-4 mb-4">
                Or type a topic below and let the AI do the heavy lifting.
              </p>
            </div>
            <form onSubmit={handleQuickStart} className="mb-6 flex max-w-lg flex-col gap-2">
              <input
                value={quickTopic}
                onChange={(e) => setQuickTopic(e.target.value)}
                placeholder="What do you want to think through?"
                className="w-full rounded-xl border border-line-2 bg-surface px-5 py-4 text-base text-ink-1 placeholder-ink-4 outline-none transition-all focus:border-ai/50 neu-pressed"
              />
              <p className="text-xs text-ink-4">
                Press Enter to brainstorm —{" "}
                <button
                  type="button"
                  onClick={handleNewNote}
                  className="text-ink-3 underline underline-offset-2 transition-colors hover:text-ink-1"
                >
                  or create a blank note
                </button>
              </p>
            </form>

            {/* Hint cards */}
            <div className="grid max-w-lg gap-3 sm:grid-cols-3">
              {[
                { icon: "⚡", label: "Type / for AI commands", sub: "Table, diagram, outline" },
                { icon: "⌨️", label: "Press Tab to autocomplete", sub: "AI finishes your thought" },
                { icon: "🔗", label: "Link notes together", sub: "Build your second brain" },
              ].map((hint) => (
                <div
                  key={hint.label}
                  className="flex flex-col gap-1.5 rounded-xl border border-line-1 bg-surface p-4 neu-xs"
                >
                  <span className="text-xl leading-none">{hint.icon}</span>
                  <p className="text-xs font-semibold text-ink-2">{hint.label}</p>
                  <p className="text-[10px] text-ink-4">{hint.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── NoteCard — horizontal scroll card with colored header ── */
const NoteCard = memo(function NoteCard({
  note,
  colorIndex,
  onClick,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  note: { _id: string; _creationTime: number; title: string; preview?: string; emoji?: string; tags?: string[]; pinned?: boolean; wordCount?: number; [key: string]: any };
  colorIndex: number;
  onClick: () => void;
}) {
  const color = CARD_COLORS[colorIndex];
  const previewLines = note.preview
    ? note.preview.split(/[.\n]/).map((l) => l.trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      whileHover={{
        y: -3,
        boxShadow: "6px 8px 20px #C5D5E8, -6px -4px 16px #FFFFFF",
        transition: springSnap,
      }}
      whileTap={{ scale: 0.98, transition: springSnap }}
      className="relative flex h-52 w-44 shrink-0 flex-col overflow-hidden rounded-2xl text-left transition-shadow neu-card"
      style={{ background: "#EDF4FF" }}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <span className="absolute top-2 right-2 text-[10px]" role="img" aria-label="pinned">📌</span>
      )}

      {/* Colored header band */}
      <div
        className="flex shrink-0 flex-col gap-0.5 px-3.5 py-3"
        style={{ background: color.bg, borderBottom: `1px solid ${color.border}` }}
      >
        <div className="flex items-center gap-1.5">
          {note.emoji && <span className="shrink-0 text-sm leading-none">{note.emoji}</span>}
          <p className="truncate text-sm font-bold leading-snug text-ink-1">{note.title || "Untitled"}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="text-[10px] font-medium" style={{ color: color.dot, opacity: 0.8 }}>
            {new Date(note._creationTime).toLocaleDateString([], { month: "short", day: "numeric" })}
          </p>
          {note.wordCount != null && note.wordCount > 0 && (
            <span className="text-[9px] text-ink-4">{note.wordCount.toLocaleString()} w</span>
          )}
        </div>
      </div>

      {/* Preview lines */}
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-2.5">
        {previewLines.length > 0 ? (
          previewLines.slice(0, 3).map((line, i) => (
            <p key={i} className="truncate text-xs leading-relaxed text-ink-3">{line}</p>
          ))
        ) : (
          <p className="text-xs italic text-ink-4">No content yet</p>
        )}
      </div>

      {/* Footer row — word count (if not in header) + edit icon */}
      <div className="flex items-center justify-end px-3 pb-3">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ background: color.dot }}
        >
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
});

/* ── TagFolder — folder icon style ── */
function TagFolder({
  tag,
  count,
  colorIndex,
  active,
  onClick,
}: {
  tag: string;
  count: number;
  colorIndex: number;
  active: boolean;
  onClick: () => void;
}) {
  const color = CARD_COLORS[colorIndex];
  const abbr  = tag.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 transition-all"
      style={{ transform: active ? "translateY(-2px)" : undefined }}
    >
      {/* Folder tile */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-xs font-bold transition-all"
        style={{
          backgroundColor: color.bg,
          border: active ? `2px solid ${color.dot}` : `1px solid ${color.border}`,
          color: color.dot,
          boxShadow: active
            ? `0 0 0 3px ${color.dot}22, 2px 2px 8px ${color.dot}30`
            : `2px 2px 6px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)`,
        }}
      >
        <span className="text-sm">{abbr}</span>
      </div>
      <div className="text-center">
        <p className="max-w-[72px] truncate text-xs font-semibold text-ink-2">{tag}</p>
        <p className="text-[10px] text-ink-4">{count} note{count === 1 ? "" : "s"}</p>
      </div>
    </button>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
