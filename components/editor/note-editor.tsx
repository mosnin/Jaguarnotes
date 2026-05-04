"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { PartialBlock } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { AIAutocompleteOverlay } from "./ai-autocomplete-overlay";
import { SlashCommandMenu } from "./slash-command-menu";
import { AIWelcome } from "./ai-welcome";
import { SelectionToolbar } from "./selection-toolbar";
import { useSidebar } from "@/components/app/sidebar-context";

interface NoteEditorProps {
  noteId: string;
  initialCmd?: string;
  initialTopic?: string;
}

type SaveStatus = "idle" | "saving" | "saved";

export function NoteEditor({ noteId, initialCmd, initialTopic }: NoteEditorProps) {
  const note = useQuery(api.notes.get, { id: noteId as Id<"notes"> });
  const updateNote = useMutation(api.notes.update);
  const { toggle: toggleSidebar } = useSidebar();

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isEmpty, setIsEmpty] = useState(true);
  const [autocomplete, setAutocomplete] = useState<{
    context: string;
    position: { top: number; left: number };
  } | null>(null);
  const [slashMenu, setSlashMenu] = useState<{
    query: string;
    initialCommand?: string;
    initialTopic?: string;
  } | null>(null);
  const [aiBlockIds, setAiBlockIds] = useState<Set<string>>(new Set());
  const [selectionToolbar, setSelectionToolbar] = useState<{
    text: string;
    position: { top: number; left: number };
  } | null>(null);

  // One-time hint — dismisses only on Tab press or after 90s (not on arbitrary keydown)
  const [showHint, setShowHint] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("jn_hint_seen");
  });

  useEffect(() => {
    if (!showHint) return;

    function dismissOnTab(e: KeyboardEvent) {
      if (e.key === "Tab") {
        setShowHint(false);
        localStorage.setItem("jn_hint_seen", "1");
      }
    }

    const timer = setTimeout(() => {
      setShowHint(false);
      localStorage.setItem("jn_hint_seen", "1");
    }, 90_000);

    document.addEventListener("keydown", dismissOnTab);
    return () => {
      document.removeEventListener("keydown", dismissOnTab);
      clearTimeout(timer);
    };
  }, [showHint]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useCreateBlockNote({
    initialContent: note?.content ? JSON.parse(note.content) : undefined,
  });

  // Load note state on mount (title, isEmpty, persisted AI block IDs)
  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "Untitled");
      const hasContent = !!note.content && note.content !== "[]";
      setIsEmpty(!hasContent);
      if (note.aiBlockIds?.length) {
        setAiBlockIds(new Set(note.aiBlockIds));
      }
    }
  }, [note?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-trigger from URL params (e.g. dashboard quick-start)
  useEffect(() => {
    if (initialCmd && initialTopic && note) {
      setSlashMenu({ query: "", initialCommand: initialCmd, initialTopic });
    }
  }, [note?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSave = useCallback(
    (content: string, newTitle?: string) => {
      clearTimeout(saveTimeoutRef.current);
      setSaveStatus("saving");
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

        setSaveStatus("saved");
        clearTimeout(saveStatusTimerRef.current);
        saveStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
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

  // Keyboard: Escape, Tab-autocomplete, slash-command
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAutocomplete(null);
        setSlashMenu(null);
        setSelectionToolbar(null);
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

      // Slash command — triggers from any cursor position (no line-start constraint)
      if (e.key === "/" && !autocomplete && !slashMenu) {
        setTimeout(() => setSlashMenu({ query: "" }), 10);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [autocomplete, slashMenu]);

  // Selection toolbar — appears on text selection ≥ 10 chars
  useEffect(() => {
    function onMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelectionToolbar(null);
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 10) {
        setSelectionToolbar(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelectionToolbar({
        text,
        position: { top: rect.top - 44, left: rect.left + rect.width / 2 },
      });
    }

    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  function handleAutocompleteInsert(text: string) {
    editor.insertInlineContent([{ type: "text", text: " " + text, styles: {} }]);
    setAutocomplete(null);
    handleEditorChange();
  }

  function handleAIInsert(text: string) {
    const blockId = `ai-${crypto.randomUUID()}`;
    const block: PartialBlock = {
      id: blockId,
      type: "paragraph",
      content: [{ type: "text", text, styles: {} }],
    };
    editor.insertBlocks([block], editor.getTextCursorPosition().block, "after");
    handleAIBlockInserted(blockId);
    setIsEmpty(false);
  }

  function handleAIBlockInserted(blockId: string) {
    setAiBlockIds((prev) => {
      const next = new Set([...prev, blockId]);
      // Persist immediately — don't wait for the debounced content save
      updateNote({ id: noteId as Id<"notes">, aiBlockIds: [...next] });
      return next;
    });
    handleEditorChange();
  }

  // AI block marker: left border — one clean signal, persisted across reloads
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

      {/* Top bar — sidebar toggle · save status · AI trigger */}
      <div className="flex h-10 shrink-0 items-center px-4">
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-raised hover:text-ink-2"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Save status — dot while saving, "Saved" text on completion */}
        <AnimatePresence mode="wait">
          {saveStatus === "saving" && (
            <motion.span
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 h-1.5 w-1.5 rounded-full bg-ink-1/20 animate-pulse"
            />
          )}
          {saveStatus === "saved" && (
            <motion.span
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 text-[10px] text-ink-4"
            >
              Saved
            </motion.span>
          )}
        </AnimatePresence>

        {/* Persistent AI command trigger */}
        <button
          onClick={() => setSlashMenu({ query: "" })}
          className="ml-auto flex items-center gap-1 rounded border border-line-1 px-2 py-1 text-[11px] text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-2"
          aria-label="AI commands"
        >
          <span className="font-mono">/</span>
          <span>AI</span>
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 pb-32 pt-8 md:px-12 md:pt-14">
          {/* Title — hover bottom border signals editability */}
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="mb-10 w-full cursor-text border-b border-transparent bg-transparent text-[2.75rem] font-bold leading-tight tracking-tight text-ink-1 placeholder-ink-4 outline-none transition-colors hover:border-line-1 focus:border-transparent md:text-5xl"
          />

          {/* First-note hint — stays until Tab is pressed or 90s passes */}
          {isEmpty && showHint && (
            <p className="mb-6 animate-in fade-in text-sm text-ink-4 duration-700 select-none">
              Press / for AI commands · Tab to expand any concept
            </p>
          )}

          {isEmpty && (
            <AIWelcome
              onInsert={handleAIInsert}
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
          initialCommand={slashMenu.initialCommand}
          initialTopic={slashMenu.initialTopic}
        />
      )}

      {selectionToolbar && (
        <SelectionToolbar
          text={selectionToolbar.text}
          position={selectionToolbar.position}
          onCommand={(cmd, text) => {
            setSlashMenu({ query: "", initialCommand: cmd, initialTopic: text });
            setSelectionToolbar(null);
          }}
        />
      )}
    </div>
  );
}
