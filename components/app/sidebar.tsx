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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Add01Icon,
  Settings01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

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
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <Logo size="sm" />
        <button
          onClick={() => setOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-hover hover:text-ink-1"
          aria-label="Close sidebar"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Primary nav */}
      <div className="px-3 pb-2">
        <NavItem
          href="/dashboard"
          label="Dashboard"
          active={pathname === "/dashboard"}
          onClick={() => setOpen(false)}
          icon={<HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.5} />}
        />
      </div>

      {/* Divider */}
      <div className="mx-3 mb-2 border-t border-line-1" />

      {/* New note */}
      <div className="px-3 pb-2">
        <button
          onClick={handleNewNote}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:bg-hover hover:text-ink-1 neu-xs"
          aria-label="Create new note"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} className="shrink-0 text-ai" />
          New note
        </button>
      </div>

      {/* Search */}
      {notes.length > 4 && (
        <div className="px-3 pb-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            aria-label="Search notes"
            className="w-full rounded-lg bg-raised px-3 py-2 text-xs text-ink-2 placeholder-ink-4 outline-none transition-all focus:bg-hover neu-inset"
          />
        </div>
      )}

      {/* Tag filter */}
      {(() => {
        const allTags = [...new Set(notes.flatMap((n) => n.tags ?? []))];
        if (allTags.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-1 px-3 pb-2" role="group" aria-label="Filter by tag">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                aria-pressed={selectedTag === tag}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  selectedTag === tag
                    ? "border-ai/40 bg-ai-hint text-ai"
                    : "border-line-2 text-ink-3 hover:border-line-3 hover:text-ink-2"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Notes list — hierarchical tree */}
      <div className="flex-1 overflow-y-auto px-3 pt-2" role="list" aria-label="Notes">
        {notes.length > 0 && (
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-4">
            {search || selectedTag ? "Results" : "Recent"}
          </p>
        )}
        {(() => {
          const childMap = new Map<string, typeof notes>();
          notes.forEach((n) => {
            if (n.parentId) {
              const list = childMap.get(n.parentId) ?? [];
              list.push(n);
              childMap.set(n.parentId, list);
            }
          });

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
            const isActive = pathname === `/notes/${note._id}`;
            return (
              <div key={note._id} role="listitem">
                <Link
                  href={`/notes/${note._id}`}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-ai-hint text-ai neu-xs"
                      : "text-ink-3 hover:bg-hover hover:text-ink-1"
                  }`}
                >
                  {note.emoji && <span className="shrink-0 text-sm leading-none">{note.emoji}</span>}
                  <span className="truncate">{note.title || "Untitled"}</span>
                  {kids.length > 0 && (
                    <span className="ml-auto shrink-0 rounded-full bg-line-1 px-1.5 py-0.5 text-[9px] font-semibold text-ink-4">{kids.length}</span>
                  )}
                </Link>
                {kids.map((child) => {
                  const isChildActive = pathname === `/notes/${child._id}`;
                  return (
                    <Link
                      key={child._id}
                      href={`/notes/${child._id}`}
                      onClick={() => setOpen(false)}
                      aria-current={isChildActive ? "page" : undefined}
                      className={`ml-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isChildActive
                          ? "bg-ai-hint text-ai neu-xs"
                          : "text-ink-4 hover:bg-hover hover:text-ink-2"
                      }`}
                    >
                      {/* Connector line indicator */}
                      <span className="shrink-0" aria-hidden="true">
                        <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                          <path d="M1 0 L1 7 L9 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
                        </svg>
                      </span>
                      {child.emoji && <span className="shrink-0">{child.emoji}</span>}
                      <span className="truncate">{child.title || "Untitled"}</span>
                    </Link>
                  );
                })}
              </div>
            );
          });
        })()}
      </div>

      {/* Settings nav */}
      <div className="mx-3 mt-1 border-t border-line-1 pt-2 pb-1">
        <NavItem
          href="/settings"
          label="Settings"
          active={pathname.startsWith("/settings")}
          onClick={() => setOpen(false)}
          icon={<HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />}
        />
      </div>

      {/* Account */}
      <div className="border-t border-line-1 p-4">
        <UserButton
          appearance={{
            variables: { colorPrimary: "#2563EB" },
            elements: { userButtonAvatarBox: "h-7 w-7" },
          }}
        />
      </div>
    </motion.aside>
  );
}

function NavItem({
  href,
  label,
  active,
  onClick,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-ai-hint text-ai neu-xs"
          : "text-ink-3 hover:bg-hover hover:text-ink-1"
      }`}
    >
      <span className={active ? "text-ai" : "text-ink-4"}>{icon}</span>
      {label}
    </Link>
  );
}
