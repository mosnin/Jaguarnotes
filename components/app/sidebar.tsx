"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
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
import { NewFolderModal } from "@/components/folders/new-folder-modal";

export function Sidebar() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const notes = useQuery(api.notes.list) ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const folders = (useQuery((api as any).folders.list) ?? []) as Array<{ _id: string; name: string; emoji?: string; color?: string }>;
  const createNote = useMutation(api.notes.create);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createFolder = useMutation((api as any).folders.create);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);

  async function handleNewNote() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
    setOpen(false);
  }

  async function handleCreateFolder(data: { name: string; emoji: string; color: string }) {
    const id = await createFolder(data);
    router.push(`/folders/${id}`);
    setOpen(false);
  }

  return (
    <motion.aside
      initial={false}
      animate={open ? "show" : "hidden"}
      variants={slideLeft}
      className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line-2 bg-surface"
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
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
          style={{ background: "rgba(37,99,235,0.07)", color: "#2563EB" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,0.11)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(37,99,235,0.07)"}
          aria-label="Create new note"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} className="shrink-0 text-ai" />
          <span className="text-ai font-semibold">New note</span>
        </button>
      </div>

      {/* ── Folders section ── */}
      <div className="px-3 pb-1">
        {/* Folders header row */}
        <button
          onClick={() => setFoldersOpen((v) => !v)}
          className="flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-4 transition-colors hover:bg-hover hover:text-ink-2"
        >
          <svg
            className="h-3 w-3 shrink-0 transition-transform"
            style={{ transform: foldersOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Folders
          {folders.length > 0 && (
            <span className="ml-auto shrink-0 rounded-full bg-line-1 px-1.5 py-0.5 text-[9px] font-semibold text-ink-4">
              {folders.length}
            </span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {foldersOpen && (
            <motion.div
              key="folders-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.8 }}
              className="overflow-hidden"
            >
              <div className="pt-0.5 pb-1">
                {folders.length === 0 ? (
                  <p className="px-3 py-1.5 text-xs text-ink-4 italic">No folders yet</p>
                ) : (
                  folders.map((folder) => {
                    const isActive = pathname.startsWith(`/folders/${folder._id}`);
                    return (
                      <Link
                        key={folder._id}
                        href={`/folders/${folder._id}`}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-2 rounded-lg py-1.5 text-xs font-medium transition-all ${
                          isActive
                            ? "neu-xs"
                            : "text-ink-3 hover:bg-hover hover:text-ink-1"
                        }`}
                        style={
                          isActive
                            ? { background: "rgba(37,99,235,0.07)", color: "#2563EB", borderLeft: `3px solid ${folder.color ?? "var(--color-line-3)"}`, paddingLeft: '10px', paddingRight: '12px' }
                            : { borderLeft: '3px solid transparent', paddingLeft: '10px', paddingRight: '12px' }
                        }
                      >
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] leading-none"
                          style={{ background: folder.color ?? "#EDE8FF" }}
                        >
                          {folder.emoji ?? "📁"}
                        </span>
                        <span className="truncate">{folder.name}</span>
                      </Link>
                    );
                  })
                )}

                {/* New folder button */}
                <button
                  onClick={() => setShowNewFolder(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-4 transition-colors hover:bg-hover hover:text-ai"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-dashed border-line-2">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  New folder
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="mx-3 mb-2 border-t border-line-1" />

      {/* Search */}
      {notes.length > 4 && (
        <div className="px-3 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              aria-label="Search notes"
              className="w-full rounded-lg bg-raised pl-8 pr-3 py-2 text-xs text-ink-2 placeholder-ink-4 outline-none transition-all focus:bg-hover neu-inset"
            />
          </div>
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
                className={
                  selectedTag === tag
                    ? "rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-ai transition-all"
                    : "rounded-full border border-line-2 bg-raised px-2.5 py-0.5 text-[10px] font-medium text-ink-3 transition-all hover:border-line-3 hover:text-ink-2 neu-xs"
                }
                style={
                  selectedTag === tag
                    ? { background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)" }
                    : undefined
                }
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
          <div className="mb-1.5 flex items-center gap-2 px-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-4">
              {search || selectedTag ? "Results" : "Recent"}
            </span>
            <div className="flex-1 h-px bg-line-1" />
          </div>
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
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-ai-hint text-ai neu-xs"
                      : "text-ink-3 hover:bg-hover hover:text-ink-1"
                  }`}
                >
                  <span className="shrink-0 text-sm leading-none">{note.emoji ?? "📝"}</span>
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
      <div className="border-t border-line-1 p-4 bg-surface">
        <UserButton
          appearance={{
            variables: { colorPrimary: "#2563EB" },
            elements: { userButtonAvatarBox: "h-7 w-7" },
          }}
        />
      </div>

      {/* New folder modal */}
      <NewFolderModal
        open={showNewFolder}
        onClose={() => setShowNewFolder(false)}
        onSubmit={handleCreateFolder}
        title="New folder"
      />
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
      className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "neu-xs"
          : "text-ink-3 hover:bg-hover hover:text-ink-1"
      }`}
      style={active ? { background: "rgba(37,99,235,0.08)", color: "#2563EB" } : undefined}
    >
      {active && (
        <span
          className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r-full"
          style={{ backgroundColor: '#2563EB' }}
        />
      )}
      <span className={active ? "text-ai" : "text-ink-4"}>{icon}</span>
      {label}
    </Link>
  );
}
