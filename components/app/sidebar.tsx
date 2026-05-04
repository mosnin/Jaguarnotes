"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "./sidebar-context";

export function Sidebar() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const notes = useQuery(api.notes.list) ?? [];
  const createNote = useMutation(api.notes.create);

  async function handleNewNote() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
    setOpen(false);
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0d0d0d] transition-transform duration-250 ease-out ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ borderRight: "1px solid #161616" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
            <span className="text-xs font-bold text-white">J</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Jaguarnotes</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-1.5 text-[#333] transition-colors hover:text-[#888]"
          aria-label="Close sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* New note */}
      <div className="px-3 pb-3">
        <button
          onClick={handleNewNote}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#555] transition-colors hover:bg-[#161616] hover:text-white"
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          New note
        </button>
      </div>

      {/* All notes link */}
      <div className="px-3 pb-1">
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/dashboard"
              ? "bg-[#161616] text-white"
              : "text-[#444] hover:bg-[#161616] hover:text-[#888]"
          }`}
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          All notes
        </Link>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 pt-4">
        {notes.length > 0 && (
          <p className="mb-1 px-3 text-[10px] uppercase tracking-widest text-[#2a2a2a]">Recent</p>
        )}
        {notes.slice(0, 20).map((note) => (
          <Link
            key={note._id}
            href={`/notes/${note._id}`}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === `/notes/${note._id}`
                ? "bg-[#161616] text-white"
                : "text-[#3a3a3a] hover:bg-[#161616] hover:text-[#888]"
            }`}
          >
            <span className="truncate">{note.title || "Untitled"}</span>
          </Link>
        ))}
      </div>

      {/* Account */}
      <div className="border-t border-[#111] p-4">
        <UserButton
          appearance={{
            variables: { colorPrimary: "#6366f1" },
            elements: { userButtonAvatarBox: "h-7 w-7" },
          }}
        />
      </div>
    </aside>
  );
}
