"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { AIAutocompleteOverlay } from "./ai-autocomplete-overlay";
import { SlashCommandMenu } from "./slash-command-menu";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const note = useQuery(api.notes.get, { id: noteId as Id<"notes"> });
  const updateNote = useMutation(api.notes.update);

  const [title, setTitle] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteContext, setAutocompleteContext] = useState("");
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const titleRef = useRef<HTMLInputElement>(null);

  const editor = useCreateBlockNote({
    initialContent: note?.content ? JSON.parse(note.content) : undefined,
  });

  // Load note data
  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "Untitled");
    }
  }, [note?._id]);

  // Auto-save on content change
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

  function handleTitleChange(value: string) {
    setTitle(value);
    const content = JSON.stringify(editor.document);
    scheduleSave(content, value);
  }

  function handleEditorChange() {
    const content = JSON.stringify(editor.document);
    scheduleSave(content);
  }

  // Handle Tab for AI autocomplete
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab" && !e.shiftKey) {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        const text = container.textContent ?? "";

        // Get the word/phrase before cursor
        const cursorPos = range.startOffset;
        const textBefore = text.slice(0, cursorPos).trim();
        if (textBefore.length < 2) return;

        // Get the last meaningful phrase (up to 5 words)
        const words = textBefore.split(/\s+/);
        const context = words.slice(-5).join(" ");

        if (context) {
          e.preventDefault();
          const rect = range.getBoundingClientRect();
          setAutocompleteContext(context);
          setAutocompletePosition({ top: rect.bottom + 8, left: rect.left });
          setShowAutocomplete(true);
        }
      }

      if (e.key === "Escape") {
        setShowAutocomplete(false);
        setShowSlashMenu(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleAutocompleteInsert(text: string) {
    editor.insertInlineContent([{ type: "text", text: " " + text, styles: {} }]);
    setShowAutocomplete(false);
    handleEditorChange();
  }

  function handleSlashCommand(command: string, query: string) {
    setShowSlashMenu(false);
    // The slash command menu handles insertion directly
  }

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#333] border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-6 py-3">
        <div className="flex items-center gap-3 text-xs text-[#333]">
          <span
            className={`transition-opacity ${isSaving ? "opacity-100" : "opacity-0"}`}
          >
            Saving...
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#333]">
          <kbd className="rounded border border-[#1e1e1e] bg-[#111] px-1.5 py-0.5 font-mono text-[10px]">Tab</kbd>
          <span>AI autocomplete</span>
          <span className="mx-2 text-[#1e1e1e]">·</span>
          <kbd className="rounded border border-[#1e1e1e] bg-[#111] px-1.5 py-0.5 font-mono text-[10px]">/</kbd>
          <span>Commands</span>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-8 py-12">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="mb-8 w-full bg-transparent text-4xl font-bold text-white placeholder-[#222] outline-none"
          />

          {/* BlockNote editor */}
          <div className="blocknote-wrapper">
            <BlockNoteView
              editor={editor}
              onChange={handleEditorChange}
              theme="dark"
            />
          </div>
        </div>
      </div>

      {/* AI Autocomplete overlay */}
      {showAutocomplete && (
        <AIAutocompleteOverlay
          context={autocompleteContext}
          position={autocompletePosition}
          onInsert={handleAutocompleteInsert}
          onDismiss={() => setShowAutocomplete(false)}
          editor={editor}
        />
      )}

      {/* Slash command menu */}
      {showSlashMenu && (
        <SlashCommandMenu
          query={slashQuery}
          editor={editor}
          onCommand={handleSlashCommand}
          onDismiss={() => setShowSlashMenu(false)}
          noteId={noteId}
          onSave={handleEditorChange}
        />
      )}
    </div>
  );
}
