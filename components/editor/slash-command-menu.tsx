"use client";

import { useEffect, useRef, useState } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";

const COMMANDS = [
  // Generate
  { id: "table",     icon: "⊞", label: "Table",      desc: "Generate a populated table",        placeholder: "Topic...",                    group: "Generate" },
  { id: "diagram",   icon: "◈", label: "Diagram",    desc: "Generate a Mermaid diagram",         placeholder: "Concept...",                  group: "Generate" },
  { id: "explain",   icon: "◎", label: "Explain",    desc: "Insert a structured explanation",    placeholder: "Term or concept...",          group: "Generate" },
  { id: "brainstorm",icon: "✦", label: "Brainstorm", desc: "Generate a bulleted idea list",      placeholder: "Topic...",                    group: "Generate" },
  { id: "outline",   icon: "≡", label: "Outline",    desc: "Generate a document outline",        placeholder: "Subject...",                  group: "Generate" },
  // Think
  { id: "compress",  icon: "◉", label: "Compress",   desc: "Distill writing to its essential truth",    placeholder: "Paste or describe your text...", group: "Think" },
  { id: "punch",     icon: "⚡", label: "Punch",      desc: "Make writing harder, faster, direct",       placeholder: "Paste the text to sharpen...",   group: "Think" },
  { id: "counter",   icon: "⇄", label: "Counter",    desc: "Steel-man the opposing argument",           placeholder: "Your argument or plan...",        group: "Think" },
  { id: "sowhat",    icon: "→", label: "So What",    desc: "Surface the real implication",              placeholder: "Paste your note or idea...",      group: "Think" },
  { id: "assume",    icon: "?", label: "Assume",     desc: "List every buried assumption",              placeholder: "Your plan, idea, or argument...", group: "Think" },
  { id: "question",  icon: "✺", label: "Question",   desc: "5 questions you should be asking",         placeholder: "Topic or what you've written...", group: "Think" },
  { id: "premortem", icon: "☠", label: "Pre-mortem", desc: "Imagine failure — find out how and why",   placeholder: "Your plan or decision...",        group: "Think" },
  { id: "brief",     icon: "▤", label: "Brief",      desc: "Collapse into a one-page executive brief",  placeholder: "Paste your note or idea...",      group: "Think" },
] as const;

type CommandId = typeof COMMANDS[number]["id"];

interface SlashCommandMenuProps {
  query: string;
  editor: BlockNoteEditor;
  onCommand: (command: string, query: string) => void;
  onDismiss: () => void;
  noteId: string;
  onSave: () => void;
}

export function SlashCommandMenu({
  query,
  editor,
  onCommand,
  onDismiss,
  noteId,
  onSave,
}: SlashCommandMenuProps) {
  const [selected, setSelected] = useState<CommandId | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = COMMANDS.filter(
    (c) =>
      !query ||
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.id.includes(query.toLowerCase())
  );

  useEffect(() => {
    if (selected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selected]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onDismiss();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onDismiss]);

  async function runCommand(commandId: CommandId, topic: string) {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandId, topic }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      const blocks: PartialBlock[] = [
        {
          type: "paragraph",
          content: [{ type: "text", text: data.content, styles: {} }],
        },
      ];

      editor.insertBlocks(blocks, editor.getTextCursorPosition().block, "after");
      onSave();
      onCommand(commandId, topic);
    } catch {
      // Insert error placeholder
      editor.insertBlocks(
        [{ type: "paragraph", content: [{ type: "text", text: "⚠ Failed to generate. Try again.", styles: {} }] }],
        editor.getTextCursorPosition().block,
        "after"
      );
      onDismiss();
    } finally {
      setLoading(false);
    }
  }

  // Position below current cursor
  const [pos, setPos] = useState({ top: 200, left: 100 });
  useEffect(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, []);

  const style: React.CSSProperties = {
    position: "fixed",
    top: Math.min(pos.top, window.innerHeight - 480),
    left: Math.min(pos.left, window.innerWidth - 300),
    zIndex: 50,
  };

  return (
    <div ref={menuRef} style={style} className="w-72 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111] shadow-2xl shadow-black/60">
      {selected ? (
        // Input mode
        <div className="p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm">{COMMANDS.find(c => c.id === selected)?.icon}</span>
            <span className="text-sm font-medium text-white">
              {COMMANDS.find(c => c.id === selected)?.label}
            </span>
          </div>
          {COMMANDS.find(c => c.id === selected)?.group === "Think" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runCommand(selected, input);
                if (e.key === "Escape") setSelected(null);
              }}
              placeholder={COMMANDS.find(c => c.id === selected)?.placeholder}
              rows={4}
              className="w-full resize-none rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#333] outline-none focus:border-indigo-500"
            />
          ) : (
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runCommand(selected, input);
                if (e.key === "Escape") setSelected(null);
              }}
              placeholder={COMMANDS.find(c => c.id === selected)?.placeholder}
              className="w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#333] outline-none focus:border-indigo-500"
            />
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => runCommand(selected, input)}
              disabled={!input.trim() || loading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20 disabled:opacity-30"
            >
              {loading ? (
                <div className="h-3 w-3 animate-spin rounded-full border border-[#333] border-t-indigo-500" />
              ) : COMMANDS.find(c => c.id === selected)?.group === "Think" ? (
                <>Generate <span className="opacity-50">⌘↵</span></>
              ) : (
                <>Generate</>
              )}
            </button>
            <button
              onClick={() => setSelected(null)}
              className="rounded-lg px-3 text-xs text-[#444] transition-colors hover:bg-[#1a1a1a] hover:text-[#888]"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        // Command list
        <div className="max-h-[420px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-[#333]">No commands match &quot;{query}&quot;</p>
          )}
          {(["Generate", "Think"] as const).map((group) => {
            const cmds = filtered.filter((c) => c.group === group);
            if (cmds.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-widest text-[#333]">
                  {group}
                </div>
                {cmds.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => setSelected(cmd.id)}
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
    </div>
  );
}
