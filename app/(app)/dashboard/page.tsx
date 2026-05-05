"use client";

import { Suspense, useState, memo, useMemo, useEffect } from "react";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "@/lib/utils";
import { staggerContainer, staggerItem, cardHover, buttonTap } from "@/lib/motion";
import { useSidebar } from "@/components/app/sidebar-context";
import { NoteCardSkeleton } from "@/components/ui/note-card-skeleton";

const ROLE_ACTIONS: Record<string, Array<{ label: string; sub: string; cmd?: string; title: string }>> = {
  researcher: [
    { label: "Outline", sub: "Structure your thinking", cmd: "outline", title: "Outline" },
    { label: "Research", sub: "Synthesize from the web", cmd: "research", title: "Research" },
    { label: "Brainstorm", sub: "Turn a seed into ideas", cmd: "brainstorm", title: "Brainstorm" },
  ],
  founder: [
    { label: "Brainstorm", sub: "Turn a seed into ideas", cmd: "brainstorm", title: "Brainstorm" },
    { label: "Brief", sub: "Collapse to exec brief", cmd: "brief", title: "Brief" },
    { label: "Pre-mortem", sub: "Find failure before it finds you", cmd: "premortem", title: "Pre-mortem" },
  ],
  writer: [
    { label: "Punch", sub: "Make your words hit harder", cmd: "punch", title: "Punch" },
    { label: "Outline", sub: "Structure from scratch", cmd: "outline", title: "Outline" },
    { label: "Brainstorm", sub: "Turn a seed into ideas", cmd: "brainstorm", title: "Brainstorm" },
  ],
  student: [
    { label: "Explain", sub: "Deep-dive any concept", cmd: "explain", title: "Explain" },
    { label: "Outline", sub: "Structure your study notes", cmd: "outline", title: "Outline" },
    { label: "Brainstorm", sub: "Turn a seed into ideas", cmd: "brainstorm", title: "Brainstorm" },
  ],
};

const DEFAULT_ACTIONS = [
  { label: "Brainstorm", sub: "Turn a seed into a full idea", cmd: "brainstorm", title: "Brainstorm" },
  { label: "Outline", sub: "Structure a thought from scratch", cmd: "outline", title: "Outline" },
  { label: "Meeting notes", sub: "Capture it before it's gone", title: "Meeting Notes" },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
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
  const createNote = useMutation(api.notes.create);
  const { toggle: toggleSidebar } = useSidebar();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const [quickTopic, setQuickTopic] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);
  useEffect(() => { setTimeOfDay(getTimeOfDay()); }, []);

  const roleActions = (me?.role && ROLE_ACTIONS[me.role.toLowerCase()]) ? ROLE_ACTIONS[me.role.toLowerCase()] : DEFAULT_ACTIONS;

  const pinnedNotes = useMemo(() => notes.filter((n) => n.pinned), [notes]);
  const filteredNotes = useMemo(
    () => notes.filter((n) => !n.pinned && !n.parentId && (!activeTag || (n.tags ?? []).includes(activeTag))),
    [notes, activeTag]
  );
  const tagFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    notes.forEach((n) => (n.tags ?? []).forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)));
    return freq;
  }, [notes]);
  const clusters = useMemo(
    () => [...tagFrequency.entries()].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]),
    [tagFrequency]
  );

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
  const noteCount = notes.filter((n) => !n.parentId).length;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Top bar — same on both, but content varies */}
      <div className="flex h-12 shrink-0 items-center justify-between px-4 md:h-14 md:px-8">
        <motion.button
          {...buttonTap}
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-raised hover:text-ink-1"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <kbd className="hidden md:flex">⌘K</kbd>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════╗
          ║          MOBILE — capture tool            ║
          ╚══════════════════════════════════════════╝ */}
      <div className="md:hidden">
        <div className="flex-1 px-5 pb-24 pt-4">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.9 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-ink-1">
              {timeOfDay ? `Good ${timeOfDay}, ${firstName}.` : `Hi, ${firstName}.`}
            </h1>
            <p className="mt-2 text-sm text-ink-3">
              {noteCount === 0 ? "What are you thinking about?" : `${noteCount} note${noteCount === 1 ? "" : "s"}${me?.role ? ` · ${me.role}` : ""}`}
            </p>
          </motion.div>

          {/* Quick actions — primary + secondary */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mb-8 flex flex-col gap-2">
            <motion.button
              variants={staggerItem}
              {...cardHover}
              onClick={handleNewNote}
              className="flex flex-col gap-1.5 rounded-lg border border-line-2 bg-raised p-4 text-left transition-colors hover:border-line-3 hover:bg-hover"
            >
              <p className="text-sm font-medium text-ink-1">New note</p>
              <p className="text-xs text-ink-3">Empty canvas, anything goes</p>
            </motion.button>
            <div className="grid grid-cols-3 gap-2">
              {roleActions.map((item) => (
                <motion.button
                  key={item.label}
                  variants={staggerItem}
                  {...cardHover}
                  onClick={async () => {
                    const id = await createNote({ title: item.title });
                    router.push(item.cmd ? `/notes/${id}?cmd=${item.cmd}` : `/notes/${id}`);
                  }}
                  className="flex flex-col gap-1.5 rounded-lg border border-line-1 bg-surface p-4 text-left transition-colors hover:border-line-2 hover:bg-raised"
                >
                  <p className="text-sm font-medium text-ink-1">{item.label}</p>
                  <p className="text-xs text-ink-3">{item.sub}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Pinned */}
          {pinnedNotes.length > 0 && (
            <div className="mb-6">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-3">Pinned</p>
              <div className="grid gap-2 grid-cols-2">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note._id} note={note} onClick={() => router.push(`/notes/${note._id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Notes — stacked rows on mobile (more readable than cards) */}
          {notesStatus === "LoadingFirstPage" ? (
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-3">Notes</p>
              <div className="grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => <NoteCardSkeleton key={i} />)}
              </div>
            </div>
          ) : filteredNotes.length > 0 ? (
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-3">{activeTag ? activeTag : "Notes"}</p>
              <div className="overflow-hidden rounded-xl border border-line-1 bg-surface">
                {filteredNotes.map((note, i) => (
                  <NoteRow
                    key={note._id}
                    note={note}
                    onClick={() => router.push(`/notes/${note._id}`)}
                    isLast={i === filteredNotes.length - 1}
                  />
                ))}
              </div>
              {notesStatus === "CanLoadMore" && (
                <button
                  onClick={() => loadMore(20)}
                  className="mt-3 w-full rounded-lg border border-line-1 py-2 text-xs text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-1"
                >
                  Load more
                </button>
              )}
            </div>
          ) : null}

          {sharedNotes.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-3">Shared</p>
              <div className="overflow-hidden rounded-xl border border-line-1 bg-surface">
                {sharedNotes.map((note: any, i: number) => (
                  <NoteRow
                    key={note._id}
                    note={note}
                    onClick={() => router.push(`/notes/${note._id}`)}
                    isLast={i === sharedNotes.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile FAB — always-reachable new-note */}
        <button
          onClick={handleNewNote}
          aria-label="New note"
          className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ai text-app shadow-2xl shadow-black/30 transition-transform active:scale-95"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* ╔══════════════════════════════════════════╗
          ║         DESKTOP — workspace               ║
          ╚══════════════════════════════════════════╝ */}
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-3xl px-8 pb-16 pt-6">
          {/* Quiet status line — not a hero */}
          <div className="mb-8 flex items-baseline gap-3">
            <p className="text-sm text-ink-2">
              {timeOfDay ? `Good ${timeOfDay}, ${firstName}` : `Hi, ${firstName}`}
            </p>
            <p className="text-xs text-ink-4">
              {noteCount} note{noteCount === 1 ? "" : "s"}
              {me?.role ? ` · ${me.role}` : ""}
            </p>
          </div>

          {/* The one and only primary affordance — type to think */}
          <form onSubmit={handleQuickStart}>
            <div className="relative">
              <input
                value={quickTopic}
                onChange={(e) => setQuickTopic(e.target.value)}
                placeholder="What are you thinking about?"
                autoFocus
                className="w-full rounded-2xl border border-line-2 bg-surface px-6 py-5 text-base text-ink-1 placeholder-ink-3 outline-none transition-colors focus:border-ai/60"
              />
              {quickTopic && (
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 select-none">↵ brainstorm</kbd>
              )}
            </div>
            <p className="mt-2 ml-1 text-xs text-ink-3">
              Press <kbd>↵</kbd> to brainstorm. Or{" "}
              <button type="button" onClick={handleNewNote} className="underline-offset-2 transition-colors hover:text-ai hover:underline">
                start a blank note
              </button>
              .
            </p>
          </form>

          {/* Pinned — horizontal compact strip */}
          {pinnedNotes.length > 0 && (
            <div className="mt-12">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-3">Pinned</p>
              <div className="flex flex-wrap gap-2">
                {pinnedNotes.map((note) => (
                  <button
                    key={note._id}
                    onClick={() => router.push(`/notes/${note._id}`)}
                    className="group flex items-center gap-2 rounded-md border border-line-1 bg-surface px-3 py-1.5 text-xs text-ink-2 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    {note.emoji && <span className="leading-none">{note.emoji}</span>}
                    <span className="max-w-[160px] truncate">{note.title || "Untitled"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tag clusters — compact pills */}
          {clusters.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-3">Clusters</p>
              <div className="flex flex-wrap gap-2">
                {clusters.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => router.push(activeTag === tag ? "/dashboard" : `/dashboard?tag=${encodeURIComponent(tag)}`)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                      activeTag === tag
                        ? "border-ai/50 bg-ai-dim text-ai"
                        : "border-line-1 text-ink-3 hover:border-line-2 hover:bg-raised hover:text-ink-1"
                    }`}
                  >
                    <span className="font-medium">{count}</span>
                    <span className="text-ink-4">·</span>
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent notes — DENSE list, like an email client */}
          <div className="mt-10">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[10px] uppercase tracking-widest text-ink-3">{activeTag ? activeTag : "Recent"}</p>
              {filteredNotes.length > 0 && (
                <p className="text-[10px] text-ink-4">{filteredNotes.length} shown</p>
              )}
            </div>

            {notesStatus === "LoadingFirstPage" ? (
              <div className="space-y-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-md bg-surface animate-pulse" />
                ))}
              </div>
            ) : filteredNotes.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-xl border border-line-1 bg-surface">
                  {filteredNotes.map((note, i) => (
                    <NoteRow
                      key={note._id}
                      note={note}
                      onClick={() => router.push(`/notes/${note._id}`)}
                      isLast={i === filteredNotes.length - 1}
                      desktop
                    />
                  ))}
                </div>
                {notesStatus === "CanLoadMore" && (
                  <button
                    onClick={() => loadMore(20)}
                    className="mt-3 w-full rounded-md border border-line-1 py-2 text-xs text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-1"
                  >
                    Load more
                  </button>
                )}
              </>
            ) : (
              <p className="rounded-md border border-dashed border-line-2 p-8 text-center text-xs text-ink-3">
                No notes yet. Type above to start one.
              </p>
            )}
          </div>

          {sharedNotes.length > 0 && (
            <div className="mt-10">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-3">Shared with me</p>
              <div className="overflow-hidden rounded-xl border border-line-1 bg-surface">
                {sharedNotes.map((note: any, i: number) => (
                  <NoteRow
                    key={note._id}
                    note={note}
                    onClick={() => router.push(`/notes/${note._id}`)}
                    isLast={i === sharedNotes.length - 1}
                    desktop
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable note row — used on both mobile and desktop ─── */
const NoteRow = memo(function NoteRow({
  note,
  onClick,
  isLast,
  desktop,
}: {
  note: { _id: string; _creationTime: number; title: string; preview?: string; emoji?: string; tags?: string[]; pinned?: boolean };
  onClick: () => void;
  isLast: boolean;
  desktop?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-raised ${
        !isLast ? "border-b border-line-1" : ""
      }`}
    >
      <span className="text-base leading-none shrink-0">{note.emoji || "📝"}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {note.pinned && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-label="Pinned" />}
          <p className="truncate text-sm font-medium text-ink-1">{note.title || "Untitled"}</p>
        </div>
        <p className="truncate text-xs text-ink-3 mt-0.5">{note.preview || "No content yet"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {desktop && note.tags && note.tags.length > 0 && (
          <span className="rounded-full border border-line-1 px-2 py-0.5 text-[10px] text-ink-3">
            {note.tags[0]}
            {note.tags.length > 1 ? ` +${note.tags.length - 1}` : ""}
          </span>
        )}
        <span suppressHydrationWarning className="text-[10px] text-ink-4 shrink-0">
          {formatDistanceToNow(note._creationTime)}
        </span>
      </div>
    </button>
  );
});

/* ─── Note card — used for pinned mobile only ─── */
const NoteCard = memo(function NoteCard({ note, onClick }: { note: { _id: string; _creationTime: number; title: string; preview?: string; emoji?: string; tags?: string[]; pinned?: boolean }; onClick: () => void }) {
  return (
    <motion.button
      variants={staggerItem}
      {...cardHover}
      onClick={onClick}
      className="flex flex-col gap-1.5 rounded-lg border border-line-1 bg-surface p-3 text-left transition-colors hover:border-line-2 hover:bg-raised"
    >
      <div className="flex items-center gap-1.5">
        {note.emoji && <span className="shrink-0 text-base leading-none">{note.emoji}</span>}
        <p className="truncate text-sm font-medium text-ink-1">{note.title || "Untitled"}</p>
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-ink-3">
        {note.preview || "No content yet"}
      </p>
    </motion.button>
  );
});

/* ─── Theme toggle — leopards in light or dark coat ─── */
function ThemeToggle() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem("jn-theme") : null) as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("theme-dark", stored === "dark");
      document.documentElement.classList.toggle("theme-light", stored === "light");
    }
  }, []);

  function cycle() {
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    if (next === "system") {
      localStorage.removeItem("jn-theme");
      document.documentElement.classList.remove("theme-dark", "theme-light");
    } else {
      localStorage.setItem("jn-theme", next);
      document.documentElement.classList.toggle("theme-dark", next === "dark");
      document.documentElement.classList.toggle("theme-light", next === "light");
    }
  }

  return (
    <button
      onClick={cycle}
      className="flex h-8 w-8 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-raised hover:text-ink-1"
      aria-label={`Theme: ${theme}`}
      title={`Theme: ${theme}`}
    >
      {theme === "dark" ? (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
      ) : theme === "light" ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path strokeLinecap="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.73 0l-1.41-1.41M6.34 6.34L4.93 4.93" /></svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 3v18M3 12h18" /></svg>
      )}
    </button>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
