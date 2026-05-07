"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { buttonTap, staggerContainer, staggerItem } from "@/lib/motion";
import { NewFolderModal } from "./new-folder-modal";
import { DroppableFolder } from "./drag-drop-wrapper";
import type { Id } from "@/convex/_generated/dataModel";

const DEFAULT_COLOR = "#EDE8FF";

interface Folder {
  _id: Id<"folders">;
  name: string;
  emoji?: string;
  color?: string;
}

interface FolderGridProps {
  /** Optional: note counts keyed by folder id */
  noteCounts?: Record<string, number>;
}

export function FolderGrid({ noteCounts = {} }: FolderGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const folders = useQuery(api.folders.list) ?? [];
  const createFolder = useMutation(api.folders.create);
  const renameFolder = useMutation(api.folders.rename);
  const removeFolder = useMutation(api.folders.remove);

  const [showCreate, setShowCreate] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [removingId, setRemovingId] = useState<Id<"folders"> | null>(null);

  const handleCreate = useCallback(
    async (data: { name: string; emoji: string; color: string }) => {
      const id = await createFolder(data);
      router.push(`/folders/${id}`);
    },
    [createFolder, router]
  );

  const handleEdit = useCallback(
    async (data: { name: string; emoji: string; color: string }) => {
      if (!editingFolder) return;
      await renameFolder({ id: editingFolder._id, ...data });
    },
    [editingFolder, renameFolder]
  );

  const handleRemove = useCallback(
    async (id: Id<"folders">, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setRemovingId(id);
      try {
        await removeFolder({ id });
        if (pathname === `/folders/${id}`) router.push("/dashboard");
      } finally {
        setRemovingId(null);
      }
    },
    [removeFolder, pathname, router]
  );

  return (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Folder tiles */}
        {folders.map((folder) => {
          const bg = folder.color ?? DEFAULT_COLOR;
          const isActive = pathname === `/folders/${folder._id}`;
          const count = noteCounts[folder._id] ?? 0;

          return (
            <motion.div
              key={folder._id}
              variants={staggerItem}
              className="group relative shrink-0"
            >
              <DroppableFolder folder={folder}>
                <motion.button
                  {...buttonTap}
                  onClick={() => router.push(`/folders/${folder._id}`)}
                  className="relative flex h-24 w-44 shrink-0 flex-col justify-between overflow-hidden rounded-2xl p-3.5 text-left transition-all"
                  style={{
                    background: bg,
                    boxShadow: isActive
                      ? `0 0 0 2px #2563EB, 4px 4px 14px rgba(27,54,82,0.18), -2px -2px 8px rgba(255,255,255,0.85)`
                      : `3px 3px 10px rgba(27,54,82,0.12), -3px -3px 10px rgba(255,255,255,0.8)`,
                    border: isActive ? "2px solid #2563EB" : "1px solid rgba(27,54,82,0.08)",
                  }}
                  whileHover={{
                    y: -3,
                    boxShadow: `0 0 0 ${isActive ? "2px #2563EB," : ""} 6px 16px rgba(27,54,82,0.16), -3px -3px 12px rgba(255,255,255,0.9)`,
                    transition: { type: "spring", stiffness: 400, damping: 30 },
                  }}
                >
                  {/* Emoji */}
                  <span className="text-2xl leading-none">{folder.emoji ?? "📁"}</span>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-1">{folder.name}</p>
                      <p className="text-[10px] text-ink-3">
                        {count} note{count === 1 ? "" : "s"}
                      </p>
                    </div>
                    {isActive && (
                      <div
                        className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
                        style={{ background: "#2563EB" }}
                      >
                        Open
                      </div>
                    )}
                  </div>
                </motion.button>
              </DroppableFolder>

              {/* Context menu: edit + remove */}
              <div className="pointer-events-none absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolder(folder);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-surface/80 text-ink-3 backdrop-blur-sm transition-colors hover:bg-surface hover:text-ink-1"
                  aria-label="Edit folder"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled={removingId === folder._id}
                  onClick={(e) => handleRemove(folder._id, e)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-surface/80 text-ink-3 backdrop-blur-sm transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete folder"
                >
                  {removingId === folder._id ? (
                    <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* New folder tile */}
        <motion.button
          variants={staggerItem}
          {...buttonTap}
          onClick={() => setShowCreate(true)}
          className="flex h-24 w-44 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-2 text-ink-4 transition-all hover:border-ai/40 hover:text-ai"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line-2 transition-colors hover:border-ai/40">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-medium">New folder</span>
        </motion.button>
      </motion.div>

      {/* Create modal */}
      <NewFolderModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        title="New folder"
      />

      {/* Edit modal */}
      <AnimatePresence>
        {editingFolder && (
          <NewFolderModal
            open={!!editingFolder}
            onClose={() => setEditingFolder(null)}
            onSubmit={handleEdit}
            initial={{
              name: editingFolder.name,
              emoji: editingFolder.emoji ?? "📁",
              color: editingFolder.color ?? DEFAULT_COLOR,
            }}
            title="Edit folder"
          />
        )}
      </AnimatePresence>
    </>
  );
}
