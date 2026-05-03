"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const notes = useQuery(api.notes.list) ?? [];
  const createNote = useMutation(api.notes.create);

  async function handleNewNote() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
  }

  const firstName = user?.firstName ?? "there";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] px-8 py-6">
        <h1 className="text-2xl font-bold text-white">
          Good {getTimeOfDay()}, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-[#555]">
          {notes.length === 0
            ? "Your workspace is empty. Create your first note."
            : `${notes.length} note${notes.length === 1 ? "" : "s"} in your workspace.`}
        </p>
      </div>

      <div className="flex-1 px-8 py-6">
        {/* Quick actions */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={handleNewNote}
            className="group flex flex-col gap-2 rounded-xl border border-[#1e1e1e] bg-[#111] p-4 text-left transition-all hover:border-indigo-500/30 hover:bg-[#0f0f1a]"
          >
            <span className="text-xl">✦</span>
            <div>
              <p className="text-sm font-medium text-white">New note</p>
              <p className="text-xs text-[#444]">Blank canvas</p>
            </div>
          </button>
          <button
            onClick={async () => {
              const id = await createNote({ title: "Brainstorm" });
              router.push(`/notes/${id}?cmd=brainstorm`);
            }}
            className="group flex flex-col gap-2 rounded-xl border border-[#1e1e1e] bg-[#111] p-4 text-left transition-all hover:border-indigo-500/30 hover:bg-[#0f0f1a]"
          >
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm font-medium text-white">Brainstorm</p>
              <p className="text-xs text-[#444]">AI idea generation</p>
            </div>
          </button>
          <button
            onClick={async () => {
              const id = await createNote({ title: "Research" });
              router.push(`/notes/${id}?cmd=outline`);
            }}
            className="group flex flex-col gap-2 rounded-xl border border-[#1e1e1e] bg-[#111] p-4 text-left transition-all hover:border-indigo-500/30 hover:bg-[#0f0f1a]"
          >
            <span className="text-xl">🔬</span>
            <div>
              <p className="text-sm font-medium text-white">Research</p>
              <p className="text-xs text-[#444]">AI structured outline</p>
            </div>
          </button>
          <button
            onClick={async () => {
              const id = await createNote({ title: "Meeting Notes" });
              router.push(`/notes/${id}`);
            }}
            className="group flex flex-col gap-2 rounded-xl border border-[#1e1e1e] bg-[#111] p-4 text-left transition-all hover:border-indigo-500/30 hover:bg-[#0f0f1a]"
          >
            <span className="text-xl">📋</span>
            <div>
              <p className="text-sm font-medium text-white">Meeting notes</p>
              <p className="text-xs text-[#444]">Fast capture</p>
            </div>
          </button>
        </div>

        {/* Notes grid */}
        {notes.length > 0 && (
          <div>
            <h2 className="mb-4 text-xs uppercase tracking-widest text-[#333]">Recent notes</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {notes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => router.push(`/notes/${note._id}`)}
                  className="group flex flex-col gap-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 text-left transition-all hover:border-[#2a2a2a] hover:bg-[#111]"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-lg">📄</span>
                    <span className="text-[10px] text-[#333]">
                      {formatDistanceToNow(note._creationTime)}
                    </span>
                  </div>
                  <div>
                    <p className="truncate text-sm font-medium text-white">
                      {note.title || "Untitled"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[#444]">
                      {note.preview || "No content yet"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20">
              <span className="text-2xl">✦</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Your workspace is ready.</h3>
            <p className="mt-2 max-w-xs text-sm text-[#555]">
              Create your first note and let the AI work alongside you.
            </p>
            <button
              onClick={handleNewNote}
              className="mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_50px_rgba(99,102,241,0.4)]"
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
