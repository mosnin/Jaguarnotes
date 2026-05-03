"use client";

import { useEffect, useRef, useState } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";

const COMMANDS = [
  // Generate
  { id: "table",     icon: "⊞", label: "Table",      desc: "Generate a populated table",               placeholder: "Topic...",                       group: "Generate" },
  { id: "diagram",   icon: "◈", label: "Diagram",    desc: "Generate a Mermaid diagram",               placeholder: "Concept...",                     group: "Generate" },
  { id: "explain",   icon: "◎", label: "Explain",    desc: "Insert a structured explanation",          placeholder: "Term or concept...",             group: "Generate" },
  { id: "brainstorm",icon: "✦", label: "Brainstorm", desc: "Generate a bulleted idea list",            placeholder: "Topic...",                       group: "Generate" },
  { id: "outline",   icon: "≡", label: "Outline",    desc: "Generate a document outline",              placeholder: "Subject...",                     group: "Generate" },
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
type Phase = "list" | "input" | "streaming" | "done";

interface SlashCommandMenuProps {
  query: string;
  editor: BlockNoteEditor;
  onInserted: (blockId: string) => void;
  onDismiss: () => void;
}

export function SlashCommandMenu({ query, editor, onInserted, onDismiss }: SlashCommandMenuProps) {
  const [selected, setSelected] = useState<CommandId | null>(null);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("list");
  const [streamedText, setStreamedText] = useState("");
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filtered = COMMANDS.filter(
    (c) => !query || c.label.toLowerCase().includes(query.toLowerCase()) || c.id.includes(query.toLowerCase())
  );
  const selectedCmd = COMMANDS.find((c) => c.id === selected);

  useEffect(() => {
    if (selected && phase === "input" && inputRef.current) inputRef.current.focus();
  }, [selected, phase]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onDismiss();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onDismiss]);

  // Clean up stream on unmount
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  async function runStream() {
    if (!selected || !input.trim()) return;
    setPhase("streaming");
    setStreamedText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: selected, topic: input }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setStreamedText((prev) => prev + decoder.decode(value, { stream: true }));
      }

      setPhase("done");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setStreamedText("Something went wrong. Try again.");
        setPhase("done");
      }
    }
  }

  function insertContent() {
    const blockId = `ai-${crypto.randomUUID()}`;
    const block: PartialBlock = {
      id: blockId,
      type: "paragraph",
      content: [{ type: "text", text: streamedText, styles: {} }],
    };
    editor.insertBlocks([block], editor.getTextCursorPosition().block, "after");
    onInserted(blockId);
    onDismiss();
  }

  // Position below cursor
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
    <div
      ref={menuRef}
      style={style}
      className="w-80 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] shadow-2xl shadow-black/70 animate-in fade-in slide-in-from-bottom-1 duration-150"
    >
      {/* ── LIST ── */}
      {phase === "list" && (
        <div className="max-h-[440px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-[#333]">No commands match &quot;{query}&quot;</p>
          )}
          {(["Generate", "Think"] as const).map((group) => {
            const cmds = filtered.filter((c) => c.group === group);
            if (!cmds.length) return null;
            return (
              <div key={group}>
                <p className="px-3 pb-1 pt-2.5 text-[10px] uppercase tracking-widest text-[#333]">{group}</p>
                {cmds.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => { setSelected(cmd.id); setPhase("input"); }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[#1a1a1a]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1a1a1a] text-sm text-indigo-400">
                      {cmd.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{cmd.label}</p>
                      <p className="text-xs text-[#444]">{cmd.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── INPUT ── */}
      {phase === "input" && selectedCmd && (
        <div className="p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1a1a1a] text-sm text-indigo-400">
              {selectedCmd.icon}
            </span>
            <span className="text-sm font-medium text-white">{selectedCmd.label}</span>
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
              className="w-full resize-none rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#2a2a2a] outline-none transition-colors focus:border-indigo-500/50"
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
              className="w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#2a2a2a] outline-none transition-colors focus:border-indigo-500/50"
            />
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={runStream}
              disabled={!input.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20 disabled:opacity-30"
            >
              Generate
              {selectedCmd.group === "Think" && (
                <kbd className="rounded border border-indigo-500/20 bg-indigo-500/5 px-1 text-[9px] font-mono">⌘↵</kbd>
              )}
            </button>
            <button
              onClick={() => { setSelected(null); setPhase("list"); }}
              className="rounded-lg px-3 text-xs text-[#444] transition-colors hover:bg-[#1a1a1a] hover:text-[#888]"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* ── STREAMING / DONE ── */}
      {(phase === "streaming" || phase === "done") && selectedCmd && (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-3 py-2">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                phase === "done"
                  ? "bg-emerald-400 shadow-[0_0_6px_#4ade80]"
                  : "animate-pulse bg-indigo-400 shadow-[0_0_6px_#818cf8]"
              }`}
            />
            <span className="text-[10px] uppercase tracking-widest text-[#444]">
              {phase === "done" ? "Ready to insert" : `${selectedCmd.label}...`}
            </span>
          </div>

          {/* Streamed content */}
          <div className="max-h-64 overflow-y-auto px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#d4d4d4]">
              {streamedText}
              {phase === "streaming" && (
                <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-indigo-400" />
              )}
            </p>
          </div>

          {/* Insert action */}
          {phase === "done" && (
            <div className="flex gap-2 border-t border-[#1a1a1a] p-2">
              <button
                onClick={insertContent}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
              >
                Insert into note
              </button>
              <button
                onClick={() => { setPhase("input"); setStreamedText(""); }}
                className="rounded-lg px-3 text-xs text-[#444] transition-colors hover:bg-[#1a1a1a] hover:text-[#888]"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
