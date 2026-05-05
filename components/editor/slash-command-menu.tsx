"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BlockNoteEditor } from "@blocknote/core";
import { scaleIn, useMotionVariants } from "@/lib/motion";
import { textToBlocks, blocksToMarkdown } from "@/lib/blocks";

const COMMANDS = [
  // Generate — ordered by universal usefulness
  { id: "brainstorm",icon: "✦", label: "Brainstorm", desc: "Generate a bulleted idea list",            placeholder: "Topic...",                       group: "Generate" },
  { id: "outline",   icon: "≡", label: "Outline",    desc: "Generate a document outline",              placeholder: "Subject...",                     group: "Generate" },
  { id: "explain",   icon: "◎", label: "Explain",    desc: "Insert a structured explanation",          placeholder: "Term or concept...",             group: "Generate" },
  { id: "table",     icon: "⊞", label: "Table",      desc: "Generate a populated table",               placeholder: "Topic...",                       group: "Generate" },
  { id: "diagram",   icon: "◈", label: "Diagram",    desc: "Generate a Mermaid diagram",               placeholder: "Concept...",                     group: "Generate" },
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
  const [thinkMode, setThinkMode] = useState(false);
  const [showAllThink, setShowAllThink] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  // Flat ordered list of commands shown in list phase — used for keyboard nav indices
  const generateVisible = filtered.filter((c) => c.group === "Generate");
  const flatListCommands = [...generateVisible, ...thinkVisible];

  const motionProps = useMotionVariants(scaleIn);

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

  // Keyboard navigation for the list phase
  useEffect(() => {
    if (phase !== "list") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatListCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = flatListCommands[selectedIndex];
        if (cmd) { setSelected(cmd.id); setPhase("input"); setThinkMode(false); }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, selectedIndex, flatListCommands.length]);

  // Reset selectedIndex when filtered list changes
  useEffect(() => { setSelectedIndex(0); }, [query, showAllThink]);

  async function runStream(topicOverride?: string, thinkOverride?: boolean) {
    if (!selected) return;
    const topicToUse = topicOverride ?? input;
    if (!topicToUse.trim()) return;
    const useThink = thinkOverride ?? thinkMode;
    setPhase("streaming");
    setStreamedText("");
    setErrorType(null);

    const controller = new AbortController();
    abortRef.current = controller;

    // Convert the user's actual note content to readable markdown so the AI
    // can ground its answer in what's already written. Sending raw JSON blocks
    // (the previous approach) caused the AI to ignore note context entirely.
    let noteContext: string | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blocks = (editor.document ?? []) as any[];
      if (blocks.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const md = blocksToMarkdown(blocks as any);
        if (md.trim().length > 0) noteContext = md.slice(0, 4000);
      }
    } catch { /* ignore */ }

    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: selected, topic: topicToUse, think: useThink, noteContext }),
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

  async function handleRefine() {
    if (!selected || !refineInput.trim()) return;
    const refinedTopic = `${input}\n\nPrevious output:\n${streamedText}\n\nRefinement instruction: ${refineInput}`;
    setRefineInput("");
    await runStream(refinedTopic.slice(0, 2000));
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
      {...motionProps}
      className="w-80 overflow-hidden rounded-xl border border-line-3 bg-surface shadow-2xl shadow-black/70"
    >
      {/* ── LIST ── */}
      {phase === "list" && (
        <div
          role="listbox"
          aria-label="AI commands"
          aria-activedescendant={selectedIndex >= 0 && flatListCommands.length > 0 ? `cmd-option-${selectedIndex}` : undefined}
          className="max-h-[440px] overflow-y-auto py-1"
        >
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-ink-4">No commands match &ldquo;{query}&rdquo;</p>
          )}

          {/* Generate — all 5 always visible */}
          {generateVisible.length > 0 && (
            <div role="group" aria-label="Generate">
              <p className="px-3 pb-1 pt-2.5 text-[10px] uppercase tracking-widest text-ink-4">Generate</p>
              {generateVisible.map((cmd, i) => (
                <button
                  key={cmd.id}
                  id={`cmd-option-${i}`}
                  role="option"
                  aria-selected={selectedIndex === i}
                  onClick={() => { setSelected(cmd.id); setPhase("input"); setThinkMode(false); }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-raised${selectedIndex === i ? " bg-raised" : ""}`}
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
            <div role="group" aria-label="Think">
              <p className="px-3 pb-1 pt-2.5 text-[10px] uppercase tracking-widest text-ink-4">Think</p>
              {thinkVisible.map((cmd, i) => {
                const flatIndex = generateVisible.length + i;
                return (
                  <button
                    key={cmd.id}
                    id={`cmd-option-${flatIndex}`}
                    role="option"
                    aria-selected={selectedIndex === flatIndex}
                    onClick={() => { setSelected(cmd.id); setPhase("input"); setThinkMode(false); }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-raised${selectedIndex === flatIndex ? " bg-raised" : ""}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-raised text-sm text-ai">
                      {cmd.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-1">{cmd.label}</p>
                      <p className="text-xs text-ink-3">{cmd.desc}</p>
                    </div>
                  </button>
                );
              })}
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
          <p id="cmd-desc" className="mb-2 text-xs text-ink-3">{selectedCmd.desc}</p>
          {selectedCmd.group === "Think" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  setThinkMode(true);
                  runStream(undefined, true);
                  return;
                }
                if (e.key === "Escape") { setSelected(null); setPhase("list"); setThinkMode(false); }
              }}
              placeholder={selectedCmd.placeholder}
              aria-label={selectedCmd.placeholder}
              aria-describedby="cmd-desc"
              rows={4}
              className="w-full resize-none rounded-lg border border-line-2 bg-raised px-3 py-2 text-sm text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-ai/50"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  setThinkMode(true);
                  runStream(undefined, true);
                  return;
                }
                if (e.key === "Enter") runStream();
                if (e.key === "Escape") { setSelected(null); setPhase("list"); setThinkMode(false); }
              }}
              placeholder={selectedCmd.placeholder}
              aria-label={selectedCmd.placeholder}
              aria-describedby="cmd-desc"
              className="w-full rounded-lg border border-line-2 bg-raised px-3 py-2 text-sm text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-ai/50"
            />
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => runStream()}
              disabled={!input.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ai-dim px-3 py-2 text-xs font-medium text-ai transition-colors hover:bg-ai-dim/80 disabled:opacity-30"
            >
              Generate
              {selectedCmd.group === "Think" && (
                <kbd
                  className="rounded border border-ai/20 bg-ai-hint px-1 text-[9px] font-mono"
                  title="Think mode: longer, step-by-step reasoning (doubles output length)"
                >⌘↵</kbd>
              )}
            </button>
            <button
              onClick={() => { setSelected(null); setPhase("list"); setThinkMode(false); }}
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
            <span
              role={phase === "error" ? "alert" : undefined}
              className={`text-[10px] uppercase tracking-widest ${phase === "error" ? "text-error" : "text-ink-3"}`}
            >
              {phase === "error"
                ? errorType === "timeout" ? "Request timed out" : "AI unavailable"
                : phase === "done"
                ? "Ready to insert"
                : `${selectedCmd.label}...`}
            </span>
            {thinkMode && (
              <span className="rounded border border-ai/20 bg-ai-hint px-1.5 py-0.5 text-[9px] font-mono text-ai">Think</span>
            )}
          </div>

          {/* Streamed content / error message */}
          <div
            role="status"
            aria-live={phase === "streaming" ? "polite" : "off"}
            className="max-h-64 overflow-y-auto px-4 py-3"
          >
            {phase === "error" ? (
              <p className="text-sm text-error/80">
                {errorType === "timeout"
                  ? "The request took too long. Try again — it usually works on the second attempt."
                  : "The AI is temporarily unavailable. Check your connection and retry."}
              </p>
            ) : (
              <div className="text-sm leading-relaxed text-ink-2">
                <MarkdownPreview text={streamedText} />
                {phase === "streaming" && (
                  <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-ai" />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {(phase === "done" || phase === "error") && (
            <>
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
                  onClick={() => { setPhase("input"); setStreamedText(""); setErrorType(null); setRefineInput(""); setThinkMode(false); }}
                  className={`rounded-lg px-3 text-xs transition-colors hover:bg-raised hover:text-ink-1 ${phase === "error" ? "flex-1 py-2 font-medium text-ink-2" : "text-ink-3"}`}
                >
                  {phase === "error" ? "Retry" : "Retry"}
                </button>
              </div>
              {phase === "done" && (
                <div className="border-t border-line-1 px-3 pb-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={refineInput}
                      onChange={(e) => setRefineInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && refineInput.trim()) handleRefine(); }}
                      placeholder="Refine: make it shorter, add examples..."
                      className="flex-1 rounded-lg border border-line-2 bg-raised px-3 py-1.5 text-xs text-ink-1 placeholder-ink-4 outline-none transition-colors focus:border-ai/50"
                      aria-label="Refinement instruction"
                    />
                    <button
                      onClick={handleRefine}
                      disabled={!refineInput.trim()}
                      className="rounded-lg bg-ai-dim px-3 py-1.5 text-xs font-medium text-ai transition-colors hover:bg-ai-dim/80 disabled:opacity-30"
                    >
                      Refine
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Tiny markdown preview — bold/italic/code/strike/heading/bullet ─── */
function MarkdownPreview({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const h1 = /^#\s+(.+)/.exec(line);
        const h2 = /^##\s+(.+)/.exec(line);
        const h3 = /^###\s+(.+)/.exec(line);
        const bullet = /^[-•*]\s+(.+)/.exec(line);
        const numbered = /^(\d+)\.\s+(.+)/.exec(line);
        const quote = /^>\s*(.+)/.exec(line);
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (h1) return <p key={i} className="text-base font-semibold text-ink-1">{renderInline(h1[1])}</p>;
        if (h2) return <p key={i} className="text-sm font-semibold text-ink-1">{renderInline(h2[1])}</p>;
        if (h3) return <p key={i} className="text-sm font-medium text-ink-1">{renderInline(h3[1])}</p>;
        if (bullet) return <p key={i} className="ml-3"><span className="text-ink-4 mr-2">•</span>{renderInline(bullet[1])}</p>;
        if (numbered) return <p key={i} className="ml-3"><span className="text-ink-4 mr-2">{numbered[1]}.</span>{renderInline(numbered[2])}</p>;
        if (quote) return <p key={i} className="border-l-2 border-line-2 pl-3 text-ink-3 italic">{renderInline(quote[1])}</p>;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Match: **bold**, *italic*, _italic_, `code`, ~~strike~~, [text](url)
  const regex = /(\*\*([^*\n]+?)\*\*)|(\*([^*\n]+?)\*)|(_([^_\n]+?)_)|(`([^`\n]+?)`)|(~~([^~\n]+?)~~)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIdx = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) tokens.push(text.slice(lastIdx, m.index));
    if (m[1]) tokens.push(<strong key={key++} className="font-semibold text-ink-1">{m[2]}</strong>);
    else if (m[3]) tokens.push(<em key={key++}>{m[4]}</em>);
    else if (m[5]) tokens.push(<em key={key++}>{m[6]}</em>);
    else if (m[7]) tokens.push(<code key={key++} className="rounded bg-raised px-1 py-0.5 font-mono text-[0.85em] text-ai">{m[8]}</code>);
    else if (m[9]) tokens.push(<s key={key++}>{m[10]}</s>);
    else if (m[11]) tokens.push(<a key={key++} href={m[13]} target="_blank" rel="noopener" className="text-ai underline-offset-2 hover:underline">{m[12]}</a>);
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) tokens.push(text.slice(lastIdx));
  return tokens.length > 0 ? tokens : [text];
}
