"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Note {
  _id: string;
  title: string;
  emoji?: string;
  preview?: string;
  folderId?: string;
}

interface Folder {
  _id: string;
  name: string;
  emoji?: string;
  color?: string;
}

/* ─── Draggable Note Card ─────────────────────────────────────────────── */

interface DraggableNoteProps {
  note: Note;
  children: React.ReactNode;
}

export function DraggableNote({ note, children }: DraggableNoteProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note._id,
    data: { type: "note", note },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
    scale: isDragging ? "1.04" : "1",
    zIndex: isDragging ? 50 : undefined,
    transition: isDragging ? "none" : "opacity 0.15s, scale 0.15s",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

/* ─── Droppable Folder Zone ──────────────────────────────────────────── */

interface DroppableFolderProps {
  folder: Folder;
  children: React.ReactNode;
  isOver?: boolean;
}

export function DroppableFolder({ folder, children, isOver }: DroppableFolderProps) {
  const { setNodeRef, isOver: dndIsOver } = useDroppable({
    id: folder._id,
    data: { type: "folder", folder },
  });

  const over = isOver ?? dndIsOver;

  return (
    <div
      ref={setNodeRef}
      className="relative transition-all"
      style={{
        outline: over ? "2px solid #2563EB" : "2px solid transparent",
        outlineOffset: "3px",
        borderRadius: "16px",
        boxShadow: over ? "0 0 0 4px rgba(37,99,235,0.15)" : undefined,
      }}
    >
      {/* Drop target glow ring */}
      {over && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: "rgba(37,99,235,0.08)",
            border: "2px solid rgba(37,99,235,0.4)",
            zIndex: 10,
          }}
        />
      )}
      {children}
    </div>
  );
}

/* ─── Drag Overlay Ghost ─────────────────────────────────────────────── */

function NoteGhost({ note }: { note: Note }) {
  return (
    <div
      className="flex h-52 w-44 flex-col overflow-hidden rounded-2xl border border-line-2 bg-surface text-left shadow-2xl"
      style={{
        transform: "rotate(2deg)",
        boxShadow: "0 20px 60px rgba(27,54,82,0.24), 0 4px 16px rgba(27,54,82,0.14)",
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3.5 py-3"
        style={{ background: "#EDE8FF", borderBottom: "1px solid #CFC6F7" }}
      >
        {note.emoji && <span className="shrink-0 text-sm">{note.emoji}</span>}
        <p className="truncate text-sm font-bold text-ink-1">{note.title || "Untitled"}</p>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-2.5">
        {note.preview ? (
          <p className="truncate text-xs text-ink-3">{note.preview}</p>
        ) : (
          <p className="text-xs italic text-ink-4">No content yet</p>
        )}
      </div>
      {/* "Drop into folder" hint */}
      <div className="flex items-center justify-center gap-1.5 border-t border-line-1 py-2">
        <svg className="h-3 w-3 text-ai" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span className="text-[10px] font-semibold text-ai">Drop into folder</span>
      </div>
    </div>
  );
}

/* ─── DragDropWrapper ────────────────────────────────────────────────── */

interface DragDropWrapperProps {
  children: React.ReactNode;
  /** Called after a successful note→folder drop, so parent can refresh UI */
  onMoved?: (noteId: string, folderId: string) => void;
}

export function DragDropWrapper({ children, onMoved }: DragDropWrapperProps) {
  const moveNote = useMutation(api.folders.moveNote);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require 8px movement before drag starts — prevents accidental drags on click
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "note") setActiveNote(data.note as Note);
  }

  function handleDragOver(event: DragOverEvent) {
    const over = event.over;
    if (over?.data.current?.type === "folder") {
      setOverId(String(over.id));
    } else {
      setOverId(null);
    }
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveNote(null);
      setOverId(null);

      const { active, over } = event;
      if (!over) return;

      const noteData = active.data.current;
      const folderData = over.data.current;

      if (noteData?.type === "note" && folderData?.type === "folder") {
        const noteId = String(active.id) as Id<"notes">;
        const folderId = String(over.id) as Id<"folders">;
        await moveNote({ noteId, folderId });
        onMoved?.(String(active.id), String(over.id));
      }
    },
    [moveNote, onMoved]
  );

  function handleDragCancel() {
    setActiveNote(null);
    setOverId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      {/* Ghost overlay while dragging */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
        {activeNote ? <NoteGhost note={activeNote} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

