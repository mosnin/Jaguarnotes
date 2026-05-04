"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BlockNoteEditor } from "@blocknote/core";
import { scaleIn } from "@/lib/motion";
import { textToBlocks } from "@/lib/blocks";

const COMMANDS = [
  // Generate
  { id: "table",     icon: "⊞", label: "Table",      desc: "Generate a populated table",               placeholder: "Topic...",                       group: "Generate" },
  { id: "diagram",   icon: "◈", label: "Diagram",    desc: "Generate a Mermaid diagram",               placeholder: "Concept...",                     group: "Generate" },
  { id: "explain",   icon: "◎", label: "Explain",    desc: "Insert a structured explanation",          placeholder: "Term or concept...",             group: "Generate" },
  { id: "brainstorm",icon: "✦", label: "Brainstorm", desc: "Generate a bulleted idea list",            placeholder: "Topic...",                       group: "Generate" },
  { id: "outline",   icon: "≡", label: "Outline",    desc: "Generate a document outline",              placeholder: "Subject...",                     group: "Generate" },
  { id: "research",  icon: "⌖", label: "Research",   desc: "Search the web and synthesize",            placeholder: "What do you want to research?",  group: "Generate" },
  // Think
  { id: "compress",  icon: "◉", label: "Compress",   desc: "Distill writing to its essential truth",   placeholder: "Paste or describe your text...", group: "Think" },
  { id: "punch",     icon: "⚡", label: "Punch",      desc: "Make writing harder, faster, direct",      placeholder: "Paste the text to sharpen...",   group: "Think" },
  { id: "counter",   icon: "⇄", label: "Counter",    desc: "Steel-man the opposing argument",          placeholder: "Your argument or plan...",        group: "Think" },
  { id: "sowhat",    icon: "→", label: "So What",    desc: "Surface the real implication",             placeholder: "Paste your note or idea...",      group: "Think" },
  { id: "assume",    icon: "?", label: "Assume",     desc: "List every buried assumption",             placeholder: "Your plan, idea, or argument...", group: "Think" },
  { id: "question",  icon: "✺", label: "Question",   desc: "5 questions you should be asking",        placeholder: "Topic or what you've written...", group: "Think" },
  { id: "premortem", icon: "☠", label: "Pre-mortem", desc: "Imagine failure — find out how and why",  placeholder: "Your plan or decision...",        group: "Think" },
  { id: "brief",     icon: "▤", label: "Brief",      desc: "Collapse into a one-page executive brief", placeholder: "Paste your note or idea...",      group: "Think" },
] as const;

type CommandId = typeof COMMANDS[number]["id"];
type Phase = "list" | "input" | "streaming" | "done" | "error";
type ErrorType = "timeout" | "server" | null;

interface SlashCommandMenuProps {
  query: string;
  editor: BlockNoteEditor;
  onInserted: (blockId: string) => void;
  onDismiss: () => void;
  initialCommand?: string;
  initialTopic?: string;
}

export function SlashCommandMenu({ query, editor, onInserted, onDismiss, initialCommand, initialTopic }: SlashCommandMenuProps) {
  const [selected, setSelected] = useState<CommandId | null>(() =>
    initialCommand && COMMANDS.some((c) => c.id === initialCommand)
      ? (initialCommand as CommandId)
      : null
  );
  const [input, setInput] = useState(initialTopic ?? "");
  const [phase, setPhase] = useState<Phase>(() =>
    initialCommand && initialTopic ? "input" : "list"
  );
  const [streamedText, setStreamedText] = useState("");
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [showAllThink, setShowAllThink] = useState(false);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filtered = COMMANDS.filter(
    (c) => !query || c.label.toLowerCase().includes(query.toLowerCase()) || c.id.includes(query.toLowerCase())
  );
  const selectedCmd = COMMANDS.find((c) => c.id === selected);

  // Featured Think commands — the 3 most immediately understandable
  const THINK_FEATURED = ["compress", "premortem", "punch"] as const;
  const thinkFiltered = filtered.filter((c) => c.group === "Think");
  const thinkVisible = showAllThink || query
    ? thinkFiltered
    : thinkFiltered.filter((c) => THINK_FEATURED.includes(c.id as typeof THINK_FEATURED[number]));
  const thinkHiddenCount = thinkFiltered.length - thinkVisible.length;

  useEffect(() => {
    if (selected && phase === "input" && inputRef.current) inputRef.current.focus();
  }, [selected, phase]);

  // Auto-run when pre-populated from URL params or selection toolbar
  useEffect(() => {
    if (initialCommand && initialTopic && phase === "input") {
      runStream();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click outside to dismiss — locked during streaming to prevent silent content loss
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (phase === "streaming") return;
        onDismiss();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onDismiss, phase]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  async function runStream() {
    if (!selected || !input.trim()) return;
    setPhase("streaming");
    setStreamedText("");
    setErrorType(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: selected, topic: input }),
        signal: controller.signal,
      });

      if (res.status === 429) {
        setErrorType("server");
        setStreamedText("Rate limit reached. Wait a moment then retry.");
        setPhase("error");
        return;
      }
      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamedText(fullText);
      }

      // Detect error sentinels encoded by the agent
      if (fullText.includes("[Request timed out.")) {
        setErrorType("timeout");
        setPhase("error");
      } else if (fullText.includes("[AI unavailable.") || fullText.includes("[Rate limited.")) {
        setErrorType("server");
        setPhase("error");
      } else {
        setPhase("done");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setErrorType("server");
        setStreamedText("");
        setPhase("error");
      }
    }
  }

  function insertContent() {
    const blocks = textToBlocks(streamedText, selected ?? "");
    // Stamp the first block with an ai- ID so it gets the blue border marker
    const firstId = `ai-${crypto.randomUUID()}`;
    const stamped = blocks.map((b, i) => i === 0 ? { ...b, id: firstId } : b);
    editor.insertBlocks(stamped, editor.getTextCursorPosition().block, "after");
    onInserted(firstId);
    onDismiss();
  }

  const [pos] = useState(() => {
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      return { top: rect.bottom + 8, left: rect.left };
    }
    return { top: 200, left: 100 };
  });

  const style: React.CSSProperties = {
    position: "fixed",
    top: Math.min(pos.top, window.innerHeight - 500),
    left: Math.min(pos.left, window.innerWidth - 320),
    zIndex: 50,
  };

  return (
    <motion.div
      ref={menuRef}
      style={style}
      variants={scaleIn}
      initial="hidden"
      animate="show"
      className="w-80 overflow-hidden rounded-xl border border-line-3 bg-surface shadow-2xl shadow-black/70"
    >
      {/* ── LIST ── */}
      {phase === "list" && (
        <div className="max-h-[440px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-ink-4">No commands match &ldquo;{query}&rdquo;</p>
          )}

          {/* Generate — all 5 always visible */}
          {filtered.filter((c) => c.group === "Generate").length > 0 && (
            <div>
              <p className="px-3 pb-1 pt-2.5 text-[10px] uppercase tracking-widest text-ink-4">Generate</p>
              {filtered.filter((c) => c.group === "Generate").map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => { setSelected(cmd.id); setPhase("input"); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-raised"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-raised text-sm text-ai">
                    {cmd.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-1">{cmd.label}</p>
                    <p className="text-xs text-ink-3">{cmd.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Think — featured 3 by default, expand to all 8 */}
          {thinkVisible.length > 0 && (
            <div>
              <p className="px-3 pb-1 pt-2.5 text-[10px] uppercase tracking-widest text-ink-4">Think</p>
              {thinkVisible.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => { setSelected(cmd.id); setPhase("input"); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-raised"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-raised text-sm text-ai">
                    {cmd.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-1">{cmd.label}</p>
                    <p className="text-xs text-ink-3">{cmd.desc}</p>
                  </div>
                </button>
              ))}
              {thinkHiddenCount > 0 && (
                <button
                  onClick={() => setShowAllThink(true)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-raised"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-raised text-xs text-ink-4">
                    +{thinkHiddenCount}
                  </span>
                  <p className="text-sm text-ink-4">More thinking tools</p>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── INPUT ── */}
      {phase === "input" && selectedCmd && (
        <div className="p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-raised text-sm text-ai">
              {selectedCmd.icon}
            </span>
            <span className="text-sm font-medium text-ink-1">{selectedCmd.label}</span>
          </div>
          {selectedCmd.group === "Think" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runStream();
                if (e.key === "Escape") { setSelected(null); setPhase("list"); }
              }}
              placeholder={selectedCmd.placeholder}
              rows={4}
              className="w-full resize-none rounded-lg border border-line-2 bg-raised px-3 py-2 text-sm text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-ai/50"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runStream();
                if (e.key === "Escape") { setSelected(null); setPhase("list"); }
              }}
              placeholder={selectedCmd.placeholder}
              className="w-full rounded-lg border border-line-2 bg-raised px-3 py-2 text-sm text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-ai/50"
            />
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={runStream}
              disabled={!input.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ai-dim px-3 py-2 text-xs font-medium text-ai transition-colors hover:bg-ai-dim/80 disabled:opacity-30"
            >
              Generate
              {selectedCmd.group === "Think" && (
                <kbd className="rounded border border-ai/20 bg-ai-hint px-1 text-[9px] font-mono">⌘↵</kbd>
              )}
            </button>
            <button
              onClick={() => { setSelected(null); setPhase("list"); }}
              className="rounded-lg px-3 text-xs text-ink-3 transition-colors hover:bg-raised hover:text-ink-1"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* ── STREAMING / DONE / ERROR ── */}
      {(phase === "streaming" || phase === "done" || phase === "error") && selectedCmd && (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-line-1 px-3 py-2">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                phase === "error"
                  ? "bg-error shadow-[0_0_6px_theme(colors.error/60%)]"
                  : phase === "done"
                  ? "bg-ok shadow-[0_0_6px_#30d158]"
                  : "animate-pulse bg-ai shadow-[0_0_6px_#7474ff]"
              }`}
            />
            <span className={`text-[10px] uppercase tracking-widest ${phase === "error" ? "text-error" : "text-ink-3"}`}>
              {phase === "error"
                ? errorType === "timeout" ? "Request timed out" : "AI unavailable"
                : phase === "done"
                ? "Ready to insert"
                : `${selectedCmd.label}...`}
            </span>
          </div>

          {/* Streamed content / error message */}
          <div className="max-h-64 overflow-y-auto px-4 py-3">
            {phase === "error" ? (
              <p className="text-sm text-error/80">
                {errorType === "timeout"
                  ? "The request took too long. Try again — it usually works on the second attempt."
                  : "The AI is temporarily unavailable. Check your connection and retry."}
              </p>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                {streamedText}
                {phase === "streaming" && (
                  <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-ai" />
                )}
              </p>
            )}
          </div>

          {/* Actions */}
          {(phase === "done" || phase === "error") && (
            <div className="flex gap-2 border-t border-line-1 p-2">
              {phase === "done" && (
                <button
                  onClick={insertContent}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ai-dim px-3 py-2 text-xs font-medium text-ai transition-colors hover:bg-ai-dim/80"
                >
                  Insert into note
                </button>
              )}
              <button
                onClick={() => { setPhase("input"); setStreamedText(""); setErrorType(null); }}
                className={`rounded-lg px-3 text-xs transition-colors hover:bg-raised hover:text-ink-1 ${phase === "error" ? "flex-1 py-2 font-medium text-ink-2" : "text-ink-3"}`}
              >
                {phase === "error" ? "Retry" : "Retry"}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
