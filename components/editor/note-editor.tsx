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

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const note = useQuery(api.notes.get, { id: noteId as Id<"notes"> });
  const updateNote = useMutation(api.notes.update);

  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // AI autocomplete state
  const [autocomplete, setAutocomplete] = useState<{
    context: string;
    position: { top: number; left: number };
  } | null>(null);

  // Slash command state
  const [slashMenu, setSlashMenu] = useState<{ query: string } | null>(null);

  // AI-generated block IDs — drives visual markers
  const [aiBlockIds, setAiBlockIds] = useState<Set<string>>(new Set());

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useCreateBlockNote({
    initialContent: note?.content ? JSON.parse(note.content) : undefined,
  });

  // Sync title and isEmpty on note load
  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "Untitled");
      const hasContent = !!note.content && note.content !== "[]";
      setIsEmpty(!hasContent);
    }
  }, [note?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save
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

  // Tab → AI autocomplete; / → slash menu
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Escape closes any overlay
      if (e.key === "Escape") {
        setAutocomplete(null);
        setSlashMenu(null);
        return;
      }

      // Tab → autocomplete
      if (e.key === "Tab" && !e.shiftKey && !autocomplete && !slashMenu) {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const range = sel.getRangeAt(0);
        const text = range.startContainer.textContent ?? "";
        const before = text.slice(0, range.startOffset).trim();
        if (before.length < 2) return;

        const words = before.split(/\s+/);
        const context = words.slice(-5).join(" ");
        if (!context) return;

        e.preventDefault();
        const rect = range.getBoundingClientRect();
        setAutocomplete({ context, position: { top: rect.bottom + 8, left: rect.left } });
        return;
      }

      // / → slash menu (only when at start of content or after whitespace)
      if (e.key === "/" && !autocomplete && !slashMenu) {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const range = sel.getRangeAt(0);
        const before = (range.startContainer.textContent ?? "").slice(0, range.startOffset);
        if (before.trim() !== "" && !before.endsWith(" ")) return;

        // Slight delay so "/" character registers first
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

  function handleWelcomeCommand(command: string, topic: string) {
    setSlashMenu(null);
    // Trigger the slash menu with the pre-filled command
    void fetch("/api/ai/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, topic }),
    });
  }

  // Dynamic CSS for AI-generated blocks
  const aiBlockStyles = [...aiBlockIds]
    .map(
      (id) => `
    [data-id="${id}"] {
      border-left: 2px solid rgba(99, 102, 241, 0.35) !important;
      padding-left: 12px !important;
      background: linear-gradient(90deg, rgba(99,102,241,0.04) 0%, transparent 100%) !important;
      border-radius: 0 4px 4px 0 !important;
      position: relative;
    }
    [data-id="${id}"]::before {
      content: "✦";
      position: absolute;
      left: -18px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 8px;
      color: rgba(99, 102, 241, 0.5);
      line-height: 1;
    }
  `
    )
    .join("");

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a1a1a] border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* AI block styles */}
      {aiBlockStyles && <style>{aiBlockStyles}</style>}

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-6 py-3">
        <span
          className={`text-xs text-[#2a2a2a] transition-opacity duration-500 ${
            isSaving ? "opacity-100" : "opacity-0"
          }`}
        >
          Saving...
        </span>
        <div className="flex items-center gap-2 text-[10px] text-[#2a2a2a]">
          <kbd className="rounded border border-[#1e1e1e] bg-[#111] px-1.5 py-0.5 font-mono">Tab</kbd>
          <span>autocomplete</span>
          <span className="mx-2 opacity-30">·</span>
          <kbd className="rounded border border-[#1e1e1e] bg-[#111] px-1.5 py-0.5 font-mono">/</kbd>
          <span>commands</span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-8 py-12">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="mb-8 w-full bg-transparent text-4xl font-bold text-white placeholder-[#1e1e1e] outline-none"
          />

          {/* Empty state — AI shows up unprompted */}
          {isEmpty && (
            <AIWelcome
              onCommand={handleWelcomeCommand}
              onDismiss={() => setIsEmpty(false)}
            />
          )}

          <div className={isEmpty ? "opacity-0 h-0 overflow-hidden" : ""}>
            <BlockNoteView
              editor={editor}
              onChange={handleEditorChange}
              theme="dark"
            />
          </div>

          {/* BlockNote always mounted so it stays ready */}
          {isEmpty && (
            <div className="hidden">
              <BlockNoteView editor={editor} onChange={handleEditorChange} theme="dark" />
            </div>
          )}
        </div>
      </div>

      {/* Autocomplete overlay */}
      {autocomplete && (
        <AIAutocompleteOverlay
          context={autocomplete.context}
          position={autocomplete.position}
          onInsert={handleAutocompleteInsert}
          onDismiss={() => setAutocomplete(null)}
          editor={editor}
        />
      )}

      {/* Slash command menu */}
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
