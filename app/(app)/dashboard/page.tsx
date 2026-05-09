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
import { FolderGrid } from "@/components/folders/folder-grid";
import { DragDropWrapper, DraggableNote, DroppableFolder } from "@/components/folders/drag-drop-wrapper";

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

type TimeFilter = "today" | "week" | "month" | "all";

function filterByTime(notes: { _creationTime: number }[], filter: TimeFilter) {
  if (filter === "all") return notes;
  const now = Date.now();
  const cut = { today: 86_400_000, week: 7 * 86_400_000, month: 30 * 86_400_000, all: Infinity }[filter];
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
    { initialNumItems: 40 }
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
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [timeOfDay,  setTimeOfDay]  = useState<string | null>(null);
  useEffect(() => { setTimeOfDay(getTimeOfDay()); }, []);

  const roleActions = (me?.role && ROLE_ACTIONS[me.role.toLowerCase()])
    ? ROLE_ACTIONS[me.role.toLowerCase()]
    : DEFAULT_ACTIONS;

  const rootNotes = useMemo(
    () => notes.filter((n) => !n.parentId && (!activeTag || (n.tags ?? []).includes(activeTag))),
    [notes, activeTag]
  );

  const filteredNotes = useMemo(() => filterByTime(rootNotes, timeFilter), [rootNotes, timeFilter]);

  const allTags = useMemo(() => {
    const freq = new Map<string, number>();
    notes.forEach((n) => (n.tags ?? []).forEach((t: string) => freq.set(t, (freq.get(t) ?? 0) + 1)));
    return [...freq.entries()].sort((a, b) => b[1] - a[1]);
  }, [notes]);

  async function handleNewNote() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
  }

  const firstName = user?.firstName ?? "there";
  const greeting = timeOfDay === "morning" ? "Good morning" : timeOfDay === "afternoon" ? "Good afternoon" : timeOfDay === "evening" ? "Good evening" : "Hello";

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-app">
      {/* ── Top bar ── */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line-1 bg-surface px-6">
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-raised hover:text-ink-1"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <kbd className="hidden rounded border border-line-2 bg-raised px-2 py-0.5 text-[10px] font-mono text-ink-3 md:flex">
            ⌘K
          </kbd>
          <motion.button
            {...buttonTap}
            onClick={handleNewNote}
            className="flex items-center gap-1.5 rounded-md bg-ai px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New note
          </motion.button>
        </div>
      </div>

      <div className="flex-1 pb-24 pt-8">
        {/* ── Greeting ── */}
        <div className="mb-8 px-6 md:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink-1">
            {timeOfDay ? `${greeting}, ${firstName}.` : `Hello, ${firstName}.`}
          </h1>
          <p className="mt-1 text-sm text-ink-3">
            {notes.length === 0
              ? "Create your first note to get started."
              : `${rootNotes.length} note${rootNotes.length === 1 ? "" : "s"}${me?.role ? ` · ${me.role}` : ""}`}
          </p>
        </div>

        {/* ── Quick AI actions ── */}
        <section className="mb-10 px-6 md:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-3">Quick start</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {roleActions.map((item) => (
              <button
                key={item.label}
                onClick={async () => {
                  const id = await createNote({ title: item.title });
                  router.push(item.cmd ? `/notes/${id}?cmd=${item.cmd}` : `/notes/${id}`);
                }}
                className="flex items-start gap-2.5 rounded-lg border border-line-2 bg-surface p-3.5 text-left transition-colors hover:border-line-3 hover:bg-raised"
              >
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: "rgba(37,99,235,0.08)" }}
                >
                  <svg className="h-3.5 w-3.5 text-ai" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-1">{item.label}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-3">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Folders ── */}
        {folders.length > 0 && (
          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between px-6 md:px-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-3">Folders</p>
            </div>
            <div className="px-6 md:px-8">
              <DragDropWrapper>
                <FolderGrid noteCounts={folderNoteCounts} />
              </DragDropWrapper>
            </div>
          </section>
        )}

        {/* ── Notes ── */}
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between px-6 md:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-3">Notes</p>

            {/* Time filter */}
            <div className="flex items-center gap-0.5 rounded-md border border-line-2 bg-surface p-0.5">
              {(["all", "week", "today"] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium transition-all ${
                    timeFilter === f
                      ? "bg-ink-1 text-surface"
                      : "text-ink-3 hover:text-ink-1"
                  }`}
                >
                  {f === "all" ? "All" : f === "week" ? "Week" : "Today"}
                </button>
              ))}
            </div>
          </div>

          {notesStatus === "LoadingFirstPage" ? (
            <div className="grid gap-2 px-6 sm:grid-cols-2 lg:grid-cols-3 md:px-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg border border-line-1 bg-surface" />
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            <DragDropWrapper>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid gap-px px-6 md:px-8"
                style={{ gridTemplateColumns: "repeat(1, 1fr)" }}
              >
                {filteredNotes.map((note) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const n = note as any;
                  return (
                    <DraggableNote key={n._id} note={n}>
                      <NoteRow note={n} onClick={() => router.push(`/notes/${n._id}`)} />
                    </DraggableNote>
                  );
                })}
              </motion.div>
            </DragDropWrapper>
          ) : (
            <div className="px-6 md:px-8">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-2 py-14 text-center">
                <p className="text-sm font-medium text-ink-2">No notes yet</p>
                <p className="text-xs text-ink-3">Create your first note to get started</p>
                <button
                  onClick={handleNewNote}
                  className="mt-1 rounded-md bg-ai px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  + New note
                </button>
              </div>
            </div>
          )}

          {notesStatus === "CanLoadMore" && filteredNotes.length >= 40 && (
            <div className="mt-4 flex justify-center px-6 md:px-8">
              <button
                onClick={() => loadMore(40)}
                className="rounded-md border border-line-2 bg-surface px-4 py-2 text-xs font-medium text-ink-2 transition-colors hover:bg-raised"
              >
                Load more
              </button>
            </div>
          )}
        </section>

        {/* ── Tags ── */}
        {allTags.length > 0 && (
          <section className="mb-10 px-6 md:px-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-3">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => router.push(activeTag === tag ? "/dashboard" : `/dashboard?tag=${encodeURIComponent(tag)}`)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    activeTag === tag
                      ? "border-ai/30 bg-ai/8 text-ai"
                      : "border-line-2 bg-surface text-ink-2 hover:border-line-3 hover:bg-raised"
                  }`}
                >
                  {tag}
                  <span className={`text-[10px] ${activeTag === tag ? "text-ai/60" : "text-ink-3"}`}>{count}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Shared with me ── */}
        {sharedNotes.length > 0 && (
          <section className="mb-10 px-6 md:px-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-3">Shared with me</p>
            <div className="grid gap-px">
              {sharedNotes.map((note) => (
                <NoteRow
                  key={note._id}
                  note={note}
                  onClick={() => router.push(`/notes/${note._id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ── NoteRow — clean list-style note row ── */
const NoteRow = memo(function NoteRow({
  note,
  onClick,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  note: { _id: string; _creationTime: number; title: string; preview?: string; emoji?: string; tags?: string[]; pinned?: boolean; updatedAt?: number; [key: string]: any };
  onClick: () => void;
}) {
  const ts = note.updatedAt ?? note._creationTime;
  const date = new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      className="group flex w-full items-start gap-3 border-b border-line-1 bg-surface px-4 py-3.5 text-left transition-colors hover:bg-raised first:rounded-t-lg last:rounded-b-lg last:border-b-0"
    >
      {/* Emoji or default icon */}
      <span className="mt-0.5 shrink-0 text-base leading-none">
        {note.emoji ?? <span className="text-ink-4">📄</span>}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink-1 group-hover:text-ink-1">
            {note.title || "Untitled"}
          </p>
          {note.pinned && (
            <span className="shrink-0 text-[10px] text-ink-3">pinned</span>
          )}
        </div>
        {note.preview && (
          <p className="mt-0.5 truncate text-xs text-ink-3 leading-relaxed">
            {note.preview}
          </p>
        )}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(note.tags as string[]).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line-1 px-2 py-0.5 text-[10px] font-medium text-ink-3"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Date */}
      <span className="shrink-0 text-[11px] text-ink-3 tabular-nums">{date}</span>
    </motion.button>
  );
});

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
