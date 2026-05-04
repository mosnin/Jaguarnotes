"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "@/lib/utils";
import { useSidebar } from "@/components/app/sidebar-context";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const notes = useQuery(api.notes.list) ?? [];
  const createNote = useMutation(api.notes.create);
  const { toggle: toggleSidebar } = useSidebar();

  async function handleNewNote() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
  }

  const firstName = user?.firstName ?? "there";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Top bar — sidebar toggle only */}
      <div className="flex h-10 shrink-0 items-center px-6 md:px-8">
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#2a2a2a] transition-colors hover:bg-[#161616] hover:text-[#666]"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-6 pb-16 pt-6 md:px-8 md:pt-10">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Good {getTimeOfDay()}, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-[#333]">
            {notes.length === 0
              ? "Your workspace is empty."
              : `${notes.length} note${notes.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {/* Quick actions — neutral, no indigo hover */}
        <div className="mb-10 grid gap-2 grid-cols-2 sm:grid-cols-4">
          {[
            { label: "New note",       sub: "Blank canvas",         action: handleNewNote },
            { label: "Brainstorm",     sub: "AI idea generation",   action: async () => { const id = await createNote({ title: "Brainstorm" }); router.push(`/notes/${id}?cmd=brainstorm`); } },
            { label: "Outline",        sub: "AI structured outline", action: async () => { const id = await createNote({ title: "Outline" }); router.push(`/notes/${id}?cmd=outline`); } },
            { label: "Meeting notes",  sub: "Fast capture",          action: async () => { const id = await createNote({ title: "Meeting Notes" }); router.push(`/notes/${id}`); } },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col gap-1.5 rounded-xl border border-[#161616] p-4 text-left transition-colors hover:border-[#222] hover:bg-[#0d0d0d]"
            >
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-[#333]">{item.sub}</p>
            </button>
          ))}
        </div>

        {/* Notes grid */}
        {notes.length > 0 && (
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-widest text-[#2a2a2a]">Recent</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {notes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => router.push(`/notes/${note._id}`)}
                  className="flex flex-col gap-2 rounded-xl border border-[#111] p-4 text-left transition-colors hover:border-[#1e1e1e] hover:bg-[#0d0d0d]"
                >
                  <div className="flex items-start justify-between">
                    <p className="truncate text-sm font-medium text-white">
                      {note.title || "Untitled"}
                    </p>
                    <span className="ml-2 shrink-0 text-[10px] text-[#222]">
                      {formatDistanceToNow(note._creationTime)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-[#333]">
                    {note.preview || "No content yet"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state — confident, no indigo */}
        {notes.length === 0 && (
          <div className="flex flex-col items-start py-10">
            <p className="mb-6 text-[#222]">Nothing here yet.</p>
            <button
              onClick={handleNewNote}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-85"
            >
              Create first note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
