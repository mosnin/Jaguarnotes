"use client";

import { useEffect, useRef, useState } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";

const COMMANDS = [
  { id: "table", icon: "⊞", label: "Table", desc: "Generate a populated table", placeholder: "Topic..." },
  { id: "diagram", icon: "◈", label: "Diagram", desc: "Generate a Mermaid diagram", placeholder: "Concept..." },
  { id: "explain", icon: "◎", label: "Explain", desc: "Insert a structured explanation", placeholder: "Term..." },
  { id: "brainstorm", icon: "✦", label: "Brainstorm", desc: "Generate a bulleted idea list", placeholder: "Topic..." },
  { id: "outline", icon: "≡", label: "Outline", desc: "Generate a document outline", placeholder: "Subject..." },
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
  const inputRef = useRef<HTMLInputElement>(null);
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

      // Insert as a paragraph block with the AI content
      const blocks: PartialBlock[] = [
        {
          type: "paragraph",
          content: [{ type: "text", text: `✦ ${data.content}`, styles: {} }],
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
    top: Math.min(pos.top, window.innerHeight - 320),
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
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => runCommand(selected, input)}
              disabled={!input.trim() || loading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20 disabled:opacity-30"
            >
              {loading ? (
                <div className="h-3 w-3 animate-spin rounded-full border border-[#333] border-t-indigo-500" />
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
        <div className="py-1">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#333]">AI Commands</div>
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => setSelected(cmd.id)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#1a1a1a]"
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
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-[#333]">No commands match "{query}"</p>
          )}
        </div>
      )}
    </div>
  );
}
