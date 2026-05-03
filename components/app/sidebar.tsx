"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const notes = useQuery(api.notes.list) ?? [];
  const createNote = useMutation(api.notes.create);
  const [collapsed, setCollapsed] = useState(false);

  async function handleNewNote() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
  }

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-[#1a1a1a] bg-[#0d0d0d] transition-all duration-300 ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <span className="text-xs font-bold text-white">J</span>
            </div>
            <span className="text-sm font-semibold text-white">Jaguarnotes</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-[#444] transition-colors hover:bg-[#1a1a1a] hover:text-[#888]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* New note button */}
      <div className="px-2 pb-2">
        <button
          onClick={handleNewNote}
          className={`flex w-full items-center gap-2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-sm text-[#888] transition-colors hover:bg-[#222] hover:text-white ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          {!collapsed && <span>New note</span>}
        </button>
      </div>

      {/* Nav */}
      <div className="px-2 pb-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/dashboard"
              ? "bg-[#1e1e1e] text-white"
              : "text-[#555] hover:bg-[#1a1a1a] hover:text-[#888]"
          } ${collapsed ? "justify-center px-0" : ""}`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          {!collapsed && <span>All notes</span>}
        </Link>
      </div>

      {/* Notes list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2">
          <p className="px-3 pb-1 pt-4 text-[10px] uppercase tracking-widest text-[#333]">
            Recent
          </p>
          {notes.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[#333]">No notes yet</p>
          ) : (
            notes.slice(0, 20).map((note) => (
              <Link
                key={note._id}
                href={`/notes/${note._id}`}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === `/notes/${note._id}`
                    ? "bg-[#1e1e1e] text-white"
                    : "text-[#555] hover:bg-[#1a1a1a] hover:text-[#888]"
                }`}
              >
                <span className="shrink-0 text-[#333]">📄</span>
                <span className="truncate">{note.title || "Untitled"}</span>
              </Link>
            ))
          )}
        </div>
      )}

      {/* User */}
      <div className={`border-t border-[#1a1a1a] p-3 ${collapsed ? "flex justify-center" : "flex items-center gap-2"}`}>
        <UserButton
          appearance={{
            variables: { colorPrimary: "#6366f1" },
            elements: {
              userButtonAvatarBox: "h-7 w-7",
            },
          }}
        />
        {!collapsed && (
          <span className="truncate text-xs text-[#444]">Account</span>
        )}
      </div>
    </aside>
  );
}
