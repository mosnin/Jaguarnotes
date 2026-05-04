"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { slideLeft } from "@/lib/motion";
import { Logo } from "@/components/ui/logo";
import { useSidebar } from "./sidebar-context";

export function Sidebar() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const notes = useQuery(api.notes.list) ?? [];
  const createNote = useMutation(api.notes.create);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  async function handleNewNote() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
    setOpen(false);
  }

  return (
    <motion.aside
      initial={false}
      animate={open ? "show" : "hidden"}
      variants={slideLeft}
      className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-surface border-r border-line-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5">
        <Logo size="sm" />
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-1.5 text-ink-4 transition-colors hover:text-ink-2"
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
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-3 transition-colors hover:bg-hover hover:text-ink-1"
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
              ? "bg-raised text-ink-1"
              : "text-ink-4 hover:bg-hover hover:text-ink-2"
          }`}
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          All notes
        </Link>
      </div>

      {/* Search */}
      {notes.length > 4 && (
        <div className="px-3 pb-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full rounded-md bg-raised px-3 py-1.5 text-xs text-ink-2 placeholder-ink-4 outline-none transition-colors focus:bg-hover"
          />
        </div>
      )}

      {/* Tag filter */}
      {(() => {
        const allTags = [...new Set(notes.flatMap((n) => n.tags ?? []))];
        if (allTags.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-1 px-3 pb-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                  selectedTag === tag
                    ? "border-ai/40 bg-ai-dim text-ai"
                    : "border-line-1 text-ink-4 hover:border-line-2 hover:text-ink-3"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Notes list — hierarchical tree */}
      <div className="flex-1 overflow-y-auto px-3 pt-2">
        {notes.length > 0 && (
          <p className="mb-1 px-3 text-[10px] uppercase tracking-widest text-ink-4">
            {search || selectedTag ? "Results" : "Recent"}
          </p>
        )}
        {(() => {
          // Build child map for tree rendering
          const childMap = new Map<string, typeof notes>();
          notes.forEach((n) => {
            if (n.parentId) {
              const list = childMap.get(n.parentId) ?? [];
              list.push(n);
              childMap.set(n.parentId, list);
            }
          });

          // Root notes matching search/tag filter
          const rootNotes = notes
            .filter((n) => {
              if (n.parentId) return false;
              if (selectedTag && !(n.tags ?? []).includes(selectedTag)) return false;
              if (search && !(n.title || "Untitled").toLowerCase().includes(search.toLowerCase())) return false;
              return true;
            })
            .slice(0, 20);

          return rootNotes.map((note) => {
            const kids = childMap.get(note._id) ?? [];
            return (
              <div key={note._id}>
                <Link
                  href={`/notes/${note._id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    pathname === `/notes/${note._id}`
                      ? "bg-raised text-ink-1"
                      : "text-ink-4 hover:bg-hover hover:text-ink-2"
                  }`}
                >
                  {note.emoji && <span className="shrink-0 text-sm">{note.emoji}</span>}
                  <span className="truncate">{note.title || "Untitled"}</span>
                  {kids.length > 0 && (
                    <span className="ml-auto shrink-0 text-[9px] text-ink-4">{kids.length}</span>
                  )}
                </Link>
                {kids.map((child) => (
                  <Link
                    key={child._id}
                    href={`/notes/${child._id}`}
                    onClick={() => setOpen(false)}
                    className={`ml-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      pathname === `/notes/${child._id}`
                        ? "bg-raised text-ink-1"
                        : "text-ink-4 hover:bg-hover hover:text-ink-2"
                    }`}
                  >
                    <span className="select-none text-ink-4">└</span>
                    {child.emoji && <span className="shrink-0">{child.emoji}</span>}
                    <span className="truncate">{child.title || "Untitled"}</span>
                  </Link>
                ))}
              </div>
            );
          });
        })()}
      </div>

      {/* Account */}
      <div className="border-t border-line-1 p-4">
        <UserButton
          appearance={{
            variables: { colorPrimary: "#7474ff" },
            elements: { userButtonAvatarBox: "h-7 w-7" },
          }}
        />
      </div>
    </motion.aside>
  );
}
