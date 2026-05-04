"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { AIAutocompleteOverlay } from "./ai-autocomplete-overlay";
import { SlashCommandMenu } from "./slash-command-menu";
import { AIWelcome } from "./ai-welcome";
import { useSidebar } from "@/components/app/sidebar-context";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const note = useQuery(api.notes.get, { id: noteId as Id<"notes"> });
  const updateNote = useMutation(api.notes.update);
  const { toggle: toggleSidebar } = useSidebar();

  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [autocomplete, setAutocomplete] = useState<{
    context: string;
    position: { top: number; left: number };
  } | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ query: string } | null>(null);
  const [aiBlockIds, setAiBlockIds] = useState<Set<string>>(new Set());

  // One-time first-note hint — localStorage gated, fades on first keydown
  const [showHint, setShowHint] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("jn_hint_seen");
  });

  useEffect(() => {
    if (!showHint) return;
    function dismiss() {
      setShowHint(false);
      localStorage.setItem("jn_hint_seen", "1");
    }
    document.addEventListener("keydown", dismiss, { once: true });
    return () => document.removeEventListener("keydown", dismiss);
  }, [showHint]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useCreateBlockNote({
    initialContent: note?.content ? JSON.parse(note.content) : undefined,
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "Untitled");
      const hasContent = !!note.content && note.content !== "[]";
      setIsEmpty(!hasContent);
    }
  }, [note?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSave = useCallback(
    (content: string, newTitle?: string) => {
      clearTimeout(saveTimeoutRef.current);
      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(async () => {
        const blocks = editor.document;
        const preview = blocks
          .flatMap((b) => {
            const c = b.content;
            if (!c || typeof c === "string") return [];
            return Array.isArray(c)
              ? c.filter((i) => i.type === "text").map((i) => (i as { text: string }).text)
              : [];
          })
          .join(" ")
          .slice(0, 150);

        await updateNote({
          id: noteId as Id<"notes">,
          title: newTitle ?? title,
          content,
          preview,
        });
        setIsSaving(false);
      }, 800);
    },
    [noteId, title, editor, updateNote]
  );

  function handleEditorChange() {
    const content = JSON.stringify(editor.document);
    const hasContent =
      editor.document.length > 0 &&
      editor.document.some((b) => {
        const c = b.content;
        return Array.isArray(c) && c.some((i) => i.type === "text" && (i as { text: string }).text.length > 0);
      });
    setIsEmpty(!hasContent);
    scheduleSave(content);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    scheduleSave(JSON.stringify(editor.document), value);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAutocomplete(null);
        setSlashMenu(null);
        return;
      }

      if (e.key === "Tab" && !e.shiftKey && !autocomplete && !slashMenu) {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const range = sel.getRangeAt(0);
        const text = range.startContainer.textContent ?? "";
        const before = text.slice(0, range.startOffset).trim();
        if (before.length < 2) return;
        const context = before.split(/\s+/).slice(-5).join(" ");
        if (!context) return;
        e.preventDefault();
        const rect = range.getBoundingClientRect();
        setAutocomplete({ context, position: { top: rect.bottom + 8, left: rect.left } });
        return;
      }

      if (e.key === "/" && !autocomplete && !slashMenu) {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const before = (sel.getRangeAt(0).startContainer.textContent ?? "")
          .slice(0, sel.getRangeAt(0).startOffset);
        if (before.trim() !== "" && !before.endsWith(" ")) return;
        setTimeout(() => setSlashMenu({ query: "" }), 10);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [autocomplete, slashMenu]);

  function handleAutocompleteInsert(text: string) {
    editor.insertInlineContent([{ type: "text", text: " " + text, styles: {} }]);
    setAutocomplete(null);
    handleEditorChange();
  }

  function handleAIBlockInserted(blockId: string) {
    setAiBlockIds((prev) => new Set([...prev, blockId]));
    handleEditorChange();
  }

  // AI block marker: left border only — one clean signal
  const aiBlockStyles = [...aiBlockIds]
    .map(
      (id) => `
      [data-id="${id}"] {
        border-left: 2px solid rgba(116, 116, 255, 0.45) !important;
        padding-left: 14px !important;
        margin-left: -16px !important;
      }
    `
    )
    .join("");

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-raised border-t-ink-1/30" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {aiBlockStyles && <style>{aiBlockStyles}</style>}

      {/* Minimal top bar — sidebar toggle · save pulse · AI trigger */}
      <div className="flex h-10 shrink-0 items-center px-4">
        <button
          onClick={toggleSidebar}
          className="group flex h-7 w-7 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-raised hover:text-ink-2"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Save indicator */}
        <span
          className={`ml-3 h-1.5 w-1.5 rounded-full bg-ink-1/20 transition-opacity duration-700 ${
            isSaving ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Persistent AI command trigger — always visible, always one tap away */}
        <button
          onClick={() => setSlashMenu({ query: "" })}
          className="ml-auto flex items-center gap-1 rounded border border-line-1 px-2 py-1 text-[11px] text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-2"
          aria-label="AI commands"
        >
          <span className="font-mono">/</span>
          <span>AI</span>
        </button>
      </div>

      {/* Full-bleed editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 pb-32 pt-8 md:px-12 md:pt-14">
          {/* Title — large and owning the space */}
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="mb-10 w-full bg-transparent text-[2.75rem] font-bold leading-tight tracking-tight text-ink-1 placeholder-ink-4 outline-none md:text-5xl"
          />

          {/* First-note hint — ghost text, fades on first keydown, never returns */}
          {isEmpty && showHint && (
            <p className="mb-6 animate-in fade-in text-sm text-ink-4 duration-700 select-none">
              Press / for AI commands · Tab to expand any concept
            </p>
          )}

          {isEmpty && (
            <AIWelcome
              onCommand={(cmd, topic) => {
                setSlashMenu(null);
                void fetch("/api/ai/command", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ command: cmd, topic }),
                });
              }}
              onDismiss={() => setIsEmpty(false)}
            />
          )}

          <div className={isEmpty ? "pointer-events-none opacity-0 h-0 overflow-hidden" : ""}>
            <BlockNoteView editor={editor} onChange={handleEditorChange} theme="dark" />
          </div>
          {isEmpty && (
            <div className="hidden">
              <BlockNoteView editor={editor} onChange={handleEditorChange} theme="dark" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile floating AI button */}
      <button
        onClick={() => setSlashMenu({ query: "" })}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-ink-1 text-app shadow-lg transition-transform active:scale-95 md:hidden"
        aria-label="AI commands"
      >
        <span className="text-lg font-bold">/</span>
      </button>

      {autocomplete && (
        <AIAutocompleteOverlay
          context={autocomplete.context}
          position={autocomplete.position}
          onInsert={handleAutocompleteInsert}
          onDismiss={() => setAutocomplete(null)}
          editor={editor}
        />
      )}

      {slashMenu && (
        <SlashCommandMenu
          query={slashMenu.query}
          editor={editor}
          onInserted={handleAIBlockInserted}
          onDismiss={() => setSlashMenu(null)}
        />
      )}
    </div>
  );
}
