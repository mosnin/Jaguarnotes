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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { AIAutocompleteOverlay } from "./ai-autocomplete-overlay";
import { SlashCommandMenu } from "./slash-command-menu";
import { AIWelcome } from "./ai-welcome";
import { SelectionToolbar } from "./selection-toolbar";
import { NoteLinkPicker } from "./note-link-picker";
import { OverflowMenu } from "./overflow-menu";
import { SharePanel } from "./share-panel";
import { PresenceAvatars } from "./presence-avatars";
import { useSidebar } from "@/components/app/sidebar-context";
import { blocksToMarkdown } from "@/lib/blocks";
import { toast } from "@/lib/toast";
import { trackError } from "@/lib/telemetry";

const EMOJIS = ["📝","💡","🎯","🔍","📊","✅","🚀","💬","📌","⚡","🌟","🎨","📅","🧠","💭","🔑","📈","🗒️","🔗","📋","🏗️","🧪","🎤","📣","🌱"];

interface NoteEditorProps {
  noteId: string;
  initialCmd?: string;
  initialTopic?: string;
}

type SaveStatus = "idle" | "saving" | "saved";

export function NoteEditor({ noteId, initialCmd, initialTopic }: NoteEditorProps) {
  const router = useRouter();
  const { user } = useUser();

  // linkQuery must be declared before the useQuery that depends on it
  const [linkQuery, setLinkQuery] = useState("");

  const note = useQuery(api.notes.get, { id: noteId as Id<"notes"> });
  // allNotes is kept for two purposes: (1) resolving outgoing linkedNoteIds to titles in the
  // "Links to" panel, and (2) looking up a target note's existing backlinkIds in handleLinkNote.
  // Children and the link picker now use targeted queries instead.
  const allNotes = useQuery(api.notes.list) ?? [];
  const childrenNotes = useQuery(api.notes.listChildren, { parentId: noteId as Id<"notes"> }) ?? [];
  const linkResults = useQuery(
    api.notes.search,
    linkQuery.trim().length >= 1 ? { query: linkQuery } : "skip"
  ) ?? [];
  const backlinksQuery = useQuery(api.notes.getBacklinks, { noteId: noteId as Id<"notes"> });
  const updateNote = useMutation(api.notes.update);
  const createNote = useMutation(api.notes.create);
  const removeNote = useMutation(api.notes.remove);
  const { toggle: toggleSidebar } = useSidebar();

  // Fetch parent note when this is a child note
  const parentNote = useQuery(
    api.notes.get,
    note?.parentId ? { id: note.parentId } : "skip"
  );

  // Derived: backlinks via targeted query; children via listChildren targeted query
  const backlinks = backlinksQuery ?? [];
  const children = childrenNotes;

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isEmpty, setIsEmpty] = useState(true);
  const [emoji, setEmoji] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
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

  const linkButtonRef = useRef<HTMLButtonElement>(null);
  const overflowButtonRef = useRef<HTMLButtonElement>(null);
  const saveAttemptRef = useRef(0);

  // One-time hint — dismisses only when user actually uses Tab autocomplete
  const [showHint, setShowHint] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("jn_hint_seen");
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useCreateBlockNote({
    initialContent: note?.content ? JSON.parse(note.content) : undefined,
  });

  // Load note state on mount
  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "Untitled");
      const hasContent = !!note.content && note.content !== "[]";
      setIsEmpty(!hasContent);
      if (note.aiBlockIds?.length) setAiBlockIds(new Set(note.aiBlockIds));
      setTags(note.tags ?? []);
      setEmoji(note.emoji ?? "");
    }
  }, [note?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-trigger from URL params
  useEffect(() => {
    if (initialCmd && initialTopic && note) {
      setSlashMenu({ query: "", initialCommand: initialCmd, initialTopic });
    }
  }, [note?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const attemptSave = useCallback(
    async (patch: Parameters<typeof updateNote>[0], attempt = 0): Promise<void> => {
      try {
        await updateNote(patch);
        setSaveStatus("saved");
        saveAttemptRef.current = 0;
        clearTimeout(saveStatusTimerRef.current);
        saveStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message === "Unauthenticated" || message.includes("Unauthenticated")) {
          router.push("/sign-in");
          return;
        }
        if (attempt < 2) {
          const delay = attempt === 0 ? 2_000 : 6_000;
          await new Promise((r) => setTimeout(r, delay));
          return attemptSave(patch, attempt + 1);
        }
        setSaveStatus("idle");
        toast.error("Save failed — check your connection.");
        trackError("scheduleSave", err);
      }
    },
    [updateNote]
  );

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
        await attemptSave({ id: noteId as Id<"notes">, title: newTitle ?? title, content, preview });
      }, 800);
    },
    [noteId, title, editor, attemptSave]
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

  async function addTag() {
    const tag = tagInput.trim().toLowerCase().replace(/,/g, "");
    if (!tag || tags.includes(tag)) { setTagInput(""); return; }
    const next = [...tags, tag];
    setTags(next);
    setTagInput("");
    try {
      await updateNote({ id: noteId as Id<"notes">, tags: next });
    } catch {
      toast.error("Failed to update tags");
    }
  }

  async function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    try {
      await updateNote({ id: noteId as Id<"notes">, tags: next });
    } catch {
      toast.error("Failed to update tags");
    }
  }

  async function pickEmoji(e: string) {
    const next = emoji === e ? "" : e;
    setEmoji(next);
    setShowEmojiPicker(false);
    await updateNote({ id: noteId as Id<"notes">, emoji: next });
    toast.success("Emoji updated");
  }

  function togglePin() {
    updateNote({ id: noteId as Id<"notes">, pinned: !note?.pinned });
  }

  function handleExport() {
    const markdown = blocksToMarkdown(editor.document as Parameters<typeof blocksToMarkdown>[0]);
    const content = `# ${title}\n\n${markdown}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "note").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLinkNote(selectedId: Id<"notes">, selectedTitle: string) {
    const current = note?.linkedNoteIds ?? [];
    if ((current as string[]).includes(selectedId)) { setShowLinkPicker(false); return; }
    updateNote({ id: noteId as Id<"notes">, linkedNoteIds: [...current, selectedId] });
    // Maintain backlinkIds on the target note so getBacklinks is O(k) not O(n)
    const target = (allNotes as Array<{ _id: Id<"notes">; backlinkIds?: Id<"notes">[] }>)
      .find((n) => n._id === selectedId);
    const existingBacklinks = target?.backlinkIds ?? [];
    if (!existingBacklinks.includes(noteId as Id<"notes">)) {
      updateNote({ id: selectedId, backlinkIds: [...existingBacklinks, noteId as Id<"notes">] });
    }
    const refBlock: PartialBlock = {
      type: "paragraph",
      content: [{ type: "text", text: `→ ${selectedTitle}`, styles: {} }],
    };
    editor.insertBlocks([refBlock], editor.getTextCursorPosition().block, "after");
    handleEditorChange();
    setShowLinkPicker(false);
    toast.success("Note linked");
  }

  async function handleNewSubNote() {
    const id = await createNote({ title: "Untitled", parentId: noteId as Id<"notes"> });
    router.push(`/notes/${id}`);
  }

  async function handleDelete() {
    await removeNote({ id: noteId as Id<"notes"> });
    toast.error("Note deleted");
    router.push("/dashboard");
  }

  // Unsaved-changes guard — warn if tab is closed while a save is in flight
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (saveStatus === "saving") {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // BottomNav AI tab
  useEffect(() => {
    function onOpenSlash() { setSlashMenu({ query: "" }); }
    document.addEventListener("jn:open-slash", onOpenSlash as EventListener);
    return () => document.removeEventListener("jn:open-slash", onOpenSlash as EventListener);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAutocomplete(null);
        setSlashMenu(null);
        setSelectionToolbar(null);
        setShowEmojiPicker(false);
        setShowLinkPicker(false);
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
        // Dismiss hint when user actually triggers autocomplete
        setShowHint(false);
        localStorage.setItem("jn_hint_seen", "1");
        return;
      }

      // Slash command — line-start or after space only
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

  // Selection toolbar
  useEffect(() => {
    function onMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) { setSelectionToolbar(null); return; }
      const text = sel.toString().trim();
      if (text.length < 10) { setSelectionToolbar(null); return; }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelectionToolbar({ text, position: { top: rect.top - 44, left: rect.left + rect.width / 2 } });
    }
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  // Undo / Redo
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      // Only intercept when not inside an input/textarea (title field, tag input, etc.)
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      }
      if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        editor.redo();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [editor]);

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
      updateNote({ id: noteId as Id<"notes">, aiBlockIds: [...next] });
      return next;
    });
    handleEditorChange();
  }

  const aiBlockStyles = [...aiBlockIds]
    .map((id) => `[data-id="${id}"] { border-left: 2px solid rgba(37,99,235,0.5) !important; padding-left: 14px !important; margin-left: -16px !important; }`)
    .join("");

  if (note === undefined) {
    // Still loading
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-4 border-t-transparent" />
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-ink-3">This note was deleted or you no longer have access.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg bg-raised px-4 py-2 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink-1"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {aiBlockStyles && <style>{aiBlockStyles}</style>}

      {/* Top bar */}
      <div className="flex h-10 shrink-0 items-center gap-1 px-4 pt-[env(safe-area-inset-top)]">
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-raised hover:text-ink-2"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb — visible when this is a child note */}
        {parentNote && (
          <Link
            href={`/notes/${parentNote._id}`}
            className="ml-2 flex items-center gap-1 text-[11px] text-ink-4 transition-colors hover:text-ink-2"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="max-w-[120px] truncate">{parentNote.title || "Untitled"}</span>
          </Link>
        )}

        {/* Save status */}
        <AnimatePresence mode="wait">
          {saveStatus === "saving" && (
            <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="ml-2 h-1.5 w-1.5 rounded-full bg-ink-1/20 animate-pulse" />
          )}
          {saveStatus === "saved" && (
            <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="ml-2 text-[10px] text-ink-4">Saved</motion.span>
          )}
        </AnimatePresence>

        <div className="ml-auto flex items-center gap-1.5">
          {user && (
            <PresenceAvatars
              noteId={noteId}
              currentUserId={user.id}
              currentUserName={user.fullName ?? user.firstName ?? "User"}
              currentUserImageUrl={user.imageUrl}
            />
          )}

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => (editor as any).undo()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-raised hover:text-ink-2"
              aria-label="Undo"
              title="Undo (⌘Z)"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 14L4 9l5-5M4 9h10.5a6.5 6.5 0 0 1 0 13H11" />
              </svg>
            </button>
            <button
              onClick={() => (editor as any).redo()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-raised hover:text-ink-2"
              aria-label="Redo"
              title="Redo (⌘Y)"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 14l5-5-5-5m5 5H9.5a6.5 6.5 0 0 0 0 13H13" />
              </svg>
            </button>
          </div>

          {/* AI trigger */}
          <button
            onClick={() => setSlashMenu({ query: "" })}
            className="flex items-center gap-1 rounded border border-line-1 px-2 py-1 text-[11px] text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-2 min-h-[44px] md:min-h-[28px]"
            aria-label="AI commands"
          >
            <span className="font-mono">/</span>
            <span>AI</span>
          </button>

          {/* Overflow menu */}
          <button
            ref={overflowButtonRef}
            onClick={() => setShowOverflowMenu((v) => !v)}
            className={`flex items-center justify-center rounded-md text-lg transition-colors hover:bg-raised min-h-[44px] min-w-[44px] md:min-h-[28px] md:min-w-[28px] md:h-7 md:w-7 ${showOverflowMenu ? "text-ink-1 bg-raised" : "text-ink-4 hover:text-ink-2"}`}
            aria-label="More options"
          >
            ···
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-8 md:px-12 md:pb-32 md:pt-14">

          {/* Emoji + Title row */}
          <div className="mb-3 flex items-start gap-3">
            {/* Emoji picker */}
            <div className="relative mt-2 shrink-0">
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-raised"
                title="Set emoji"
              >
                {emoji || <span className="text-sm text-ink-4">○</span>}
              </button>
              {showEmojiPicker && (
                <div className="absolute left-0 top-10 z-50 grid w-56 grid-cols-5 gap-1 rounded-xl border border-line-2 bg-surface p-2 neu-card">
                  {emoji && (
                    <button onClick={() => pickEmoji("")} className="col-span-5 mb-1 rounded-md px-2 py-1 text-left text-[10px] text-ink-4 hover:bg-raised hover:text-ink-2">
                      Remove emoji
                    </button>
                  )}
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => pickEmoji(e)}
                      className={`flex items-center justify-center rounded-md p-1.5 text-base transition-colors hover:bg-raised ${emoji === e ? "bg-raised" : ""}`}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled"
              className="flex-1 cursor-text border-b border-transparent bg-transparent text-[2.75rem] font-bold leading-tight tracking-tight text-ink-1 placeholder-ink-4 outline-none transition-colors hover:border-line-1 focus:border-transparent md:text-5xl"
            />
          </div>

          {/* Tags */}
          <div className="mb-8 flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full border border-line-1 px-2.5 py-0.5 text-xs text-ink-3">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-0.5 text-ink-4 transition-colors hover:text-ink-2">×</button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value.replace(",", ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
                if (e.key === "Backspace" && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1]);
              }}
              onBlur={addTag}
              placeholder={tags.length === 0 ? "Add tags…" : ""}
              className="min-w-[70px] bg-transparent text-xs text-ink-3 placeholder-ink-4 outline-none"
            />
          </div>

          {/* First-note hint */}
          {isEmpty && showHint && (
            <p className="mb-6 animate-in fade-in text-sm text-ink-4 duration-700 select-none">
              Press / for AI commands · Tab to expand any concept
            </p>
          )}

          {isEmpty && (
            <AIWelcome onInsert={handleAIInsert} onDismiss={() => setIsEmpty(false)} />
          )}

          {/* Single BlockNoteView — always mounted so ProseMirror has one DOM binding.
              When the AIWelcome is active we hide it visually but keep it in the DOM
              so editor.insertBlocks() works for AI insertions. */}
          <div className={isEmpty ? "opacity-0 h-0 overflow-hidden" : ""}>
            <BlockNoteView editor={editor} onChange={handleEditorChange} theme="dark" />
          </div>

          {/* Sub-notes — always rendered, Norman's affordance fix */}
          <div className="mt-12 border-t border-line-1 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-ink-4">Sub-notes</span>
              {/* Only root notes can have sub-notes (2-level max) */}
              {!note.parentId && (
                <button
                  onClick={handleNewSubNote}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-4 transition-colors hover:bg-raised hover:text-ink-2"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  New sub-note
                </button>
              )}
            </div>
            {children.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {children.map((child) => (
                  <Link
                    key={child._id}
                    href={`/notes/${child._id}`}
                    className="flex items-center gap-2 rounded-lg border border-line-1 px-3 py-2 text-sm text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-1"
                  >
                    {child.emoji && <span className="shrink-0">{child.emoji}</span>}
                    <span className="truncate">{child.title || "Untitled"}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Connections panel — symmetric: shows both outgoing and incoming */}
          <div className="mt-8 border-t border-line-1 pb-16 pt-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-ink-4">Connections</span>
              {(backlinks.length + (note.linkedNoteIds?.length ?? 0)) > 0 && (
                <span className="rounded-full bg-raised px-1.5 py-0.5 text-[9px] text-ink-3">
                  {backlinks.length + (note.linkedNoteIds?.length ?? 0)}
                </span>
              )}
            </div>

            {/* Links to — outgoing */}
            {(note.linkedNoteIds?.length ?? 0) > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[10px] text-ink-4">Links to</p>
                <div className="flex flex-col gap-1.5">
                  {(note.linkedNoteIds ?? []).map((lid) => {
                    const linked = allNotes.find((n) => n._id === lid);
                    if (!linked) return null;
                    return (
                      <Link
                        key={lid}
                        href={`/notes/${lid}`}
                        className="flex items-center gap-2 rounded-lg border border-line-1 px-3 py-2 text-sm text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-1"
                      >
                        {linked.emoji && <span className="shrink-0">{linked.emoji}</span>}
                        <span className="truncate">{linked.title || "Untitled"}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-ink-4">→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Linked from — incoming backlinks */}
            {backlinks.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[10px] text-ink-4">Linked from</p>
                <div className="flex flex-col gap-1.5">
                  {backlinks.map((bl) => (
                    <Link
                      key={bl._id}
                      href={`/notes/${bl._id}`}
                      className="flex items-center gap-2 rounded-lg border border-line-1 px-3 py-2 text-sm text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink-1"
                    >
                      {bl.emoji && <span className="shrink-0">{bl.emoji}</span>}
                      <span className="truncate">{bl.title || "Untitled"}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-ink-4">←</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state — only when both sections are empty */}
            {backlinks.length === 0 && (note.linkedNoteIds?.length ?? 0) === 0 && (
              <p className="text-xs text-ink-4">
                No connections yet.{" "}
                <button
                  onClick={() => setShowLinkPicker(true)}
                  className="text-ink-3 underline decoration-ink-4 underline-offset-2 transition-colors hover:text-ink-1"
                >
                  Link another note
                </button>{" "}
                to build a knowledge graph.
              </p>
            )}
          </div>
        </div>
      </div>

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

      {showLinkPicker && (
        <NoteLinkPicker
          notes={linkResults.filter((n) => n._id !== noteId)}
          anchorRef={linkButtonRef}
          onSelect={handleLinkNote}
          onDismiss={() => { setShowLinkPicker(false); setLinkQuery(""); }}
          onQueryChange={setLinkQuery}
        />
      )}

      {showOverflowMenu && (
        <OverflowMenu
          noteId={noteId}
          note={{ pinned: note.pinned }}
          anchorRef={overflowButtonRef}
          onDismiss={() => setShowOverflowMenu(false)}
          onLinkNote={() => { setShowOverflowMenu(false); setShowLinkPicker(true); }}
          onShare={() => { setShowOverflowMenu(false); setShowSharePanel(true); }}
          onPin={() => { setShowOverflowMenu(false); togglePin(); }}
          onExport={() => { setShowOverflowMenu(false); handleExport(); }}
          onDelete={() => { setShowOverflowMenu(false); handleDelete(); }}
        />
      )}

      {showSharePanel && (
        <SharePanel
          noteId={noteId}
          anchorRef={overflowButtonRef}
          onDismiss={() => setShowSharePanel(false)}
        />
      )}
    </div>
  );
}
