"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { buttonTap } from "@/lib/motion";
import { toast } from "@/lib/toast";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeDate(ts: number | undefined | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function maskKey(prefix: string): string {
  // prefix is like "jn_sk_XXXXXX" (12 chars), pad the rest with bullets
  return prefix + "••••••••••••••••••••";
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ value, className = "" }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  return (
    <motion.button
      {...buttonTap}
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
        copied
          ? "bg-ok/10 text-ok"
          : "bg-raised text-ink-3 hover:bg-hover hover:text-ink-1"
      } ${className}`}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
          Copy
        </>
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// One-time key reveal modal
// ---------------------------------------------------------------------------

function KeyRevealModal({
  rawKey,
  keyName,
  onClose,
}: {
  rawKey: string;
  keyName: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg rounded-2xl bg-surface p-6 neu-card"
      >
        {/* Header */}
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ok/10 text-ok">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-ink-1">API key created</h2>
            <p className="mt-0.5 text-sm text-ink-3">
              <span className="font-medium text-ink-2">{keyName}</span> is ready.
            </p>
          </div>
        </div>

        {/* Warning banner */}
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
          <svg className="mt-px h-4 w-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs font-medium text-amber-300">
            Save this key now — it will not be shown again. If you lose it, you will need to create a new key.
          </p>
        </div>

        {/* Key display */}
        <div className="mb-4 rounded-xl border border-line-1 bg-base p-4 neu-inset">
          <div className="flex items-start justify-between gap-3">
            <code className="break-all font-mono text-sm font-medium text-ai leading-relaxed select-all">
              {rawKey}
            </code>
            <CopyButton value={rawKey} className="ml-2 shrink-0" />
          </div>
        </div>

        {/* Quick-start hint */}
        <p className="mb-5 text-xs text-ink-4">
          Add this key as your <code className="rounded bg-raised px-1 py-0.5 font-mono text-ink-3">Authorization: Bearer &lt;key&gt;</code> header when connecting MCP clients.
        </p>

        <motion.button
          {...buttonTap}
          onClick={onClose}
          className="w-full rounded-xl bg-ai px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          I've saved my key
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Create key modal
// ---------------------------------------------------------------------------

function CreateKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (key: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const createKey = useMutation(api.apiKeys.create);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const result = await createKey({ name: trimmed });
      onCreated(result.key, trimmed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key");
      setCreating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !creating) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl bg-surface p-6 neu-card"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink-1">New API key</h2>
            <p className="mt-0.5 text-sm text-ink-3">Give it a name so you can identify it later.</p>
          </div>
          <motion.button
            {...buttonTap}
            onClick={onClose}
            disabled={creating}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:bg-hover hover:text-ink-1 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-2">
              Key name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cursor IDE, Claude Desktop, Home laptop"
              className="w-full rounded-xl border border-line-2 bg-surface px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-all focus:border-ai/50 focus:ring-2 focus:ring-ai/10 neu-inset"
              autoFocus
              maxLength={64}
              disabled={creating}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <motion.button
              {...buttonTap}
              type="submit"
              disabled={!name.trim() || creating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ai px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating…
                </>
              ) : (
                "Create key →"
              )}
            </motion.button>
            <motion.button
              {...buttonTap}
              type="button"
              onClick={onClose}
              disabled={creating}
              className="rounded-xl border border-line-2 px-4 py-2.5 text-sm font-medium text-ink-3 transition-all hover:border-line-3 hover:text-ink-1 disabled:opacity-40 neu-btn"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Setup card — MCP config instructions
// ---------------------------------------------------------------------------

function SetupCard() {
  const [origin, setOrigin] = useState("");
  // Safely get window.location.origin only on client
  useState(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  });
  const mcpUrl = `${origin || "https://your-app.vercel.app"}/api/mcp`;

  const claudeConfig = `{
  "mcpServers": {
    "jaguarnotes": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-client-http"],
      "env": {
        "MCP_SERVER_URL": "${mcpUrl}",
        "MCP_API_KEY": "jn_sk_your_key_here"
      }
    }
  }
}`;

  const cursorConfig = `{
  "mcp": {
    "servers": {
      "jaguarnotes": {
        "url": "${mcpUrl}",
        "headers": {
          "Authorization": "Bearer jn_sk_your_key_here"
        }
      }
    }
  }
}`;

  return (
    <div className="rounded-2xl bg-surface p-6 neu-card">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-dim text-ai">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <h2 className="text-sm font-bold text-ink-1">MCP server</h2>
      </div>

      {/* Server URL */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold text-ink-2">Server URL</p>
        <div className="flex items-center gap-2 rounded-xl border border-line-1 bg-base px-4 py-2.5 neu-inset">
          <code className="flex-1 truncate font-mono text-sm text-ai">{mcpUrl}</code>
          <CopyButton value={mcpUrl} />
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        {/* Claude Desktop */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ai" />
            Claude Desktop
          </p>
          <p className="mb-2 text-xs text-ink-4">
            Add to your <code className="rounded bg-raised px-1 py-0.5 font-mono text-ink-3">claude_desktop_config.json</code>:
          </p>
          <div className="relative rounded-xl border border-line-1 bg-base neu-inset">
            <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed text-ink-3">
              <code>{claudeConfig}</code>
            </pre>
            <div className="absolute right-2 top-2">
              <CopyButton value={claudeConfig} />
            </div>
          </div>
        </div>

        {/* Cursor */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ai" />
            Cursor
          </p>
          <p className="mb-2 text-xs text-ink-4">
            Add to your <code className="rounded bg-raised px-1 py-0.5 font-mono text-ink-3">.cursor/mcp.json</code>:
          </p>
          <div className="relative rounded-xl border border-line-1 bg-base neu-inset">
            <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed text-ink-3">
              <code>{cursorConfig}</code>
            </pre>
            <div className="absolute right-2 top-2">
              <CopyButton value={cursorConfig} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Revoke confirm row
// ---------------------------------------------------------------------------

function KeyRow({
  id,
  name,
  keyPrefix,
  createdAt,
  lastUsedAt,
}: {
  id: Id<"apiKeys">;
  name: string;
  keyPrefix: string;
  createdAt: number;
  lastUsedAt?: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const revokeKey = useMutation(api.apiKeys.revoke);

  async function handleRevoke() {
    setRevoking(true);
    try {
      await revokeKey({ id });
      toast.success(`"${name}" revoked`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke key");
      setRevoking(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 border-b border-line-1 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      {/* Name + prefix */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-ink-1">{name}</span>
        <code className="font-mono text-xs text-ink-4">{maskKey(keyPrefix)}</code>
      </div>

      {/* Dates */}
      <div className="flex shrink-0 items-center gap-6 text-xs text-ink-4">
        <div className="hidden sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-4 opacity-60">Created</p>
          <p>{relativeDate(createdAt)}</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-4 opacity-60">Last used</p>
          <p>{relativeDate(lastUsedAt)}</p>
        </div>
      </div>

      {/* Revoke action */}
      <div className="flex shrink-0 items-center gap-2">
        <AnimatePresence mode="wait">
          {confirming ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-ink-3">Revoke this key?</span>
              <motion.button
                {...buttonTap}
                onClick={handleRevoke}
                disabled={revoking}
                className="flex items-center gap-1 rounded-lg bg-error/90 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {revoking ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Revoke"
                )}
              </motion.button>
              <motion.button
                {...buttonTap}
                onClick={() => setConfirming(false)}
                disabled={revoking}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-3 hover:text-ink-1 disabled:opacity-40"
              >
                Cancel
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="idle"
              {...buttonTap}
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-line-2 px-3 py-1.5 text-xs font-medium text-ink-3 transition-all hover:border-error/40 hover:text-error neu-btn"
            >
              Revoke
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type ApiKey = {
  _id: Id<"apiKeys">;
  name: string;
  keyPrefix: string;
  createdAt: number;
  lastUsedAt?: number;
};

export default function ApiKeysPage() {
  const keys = useQuery(api.apiKeys.list) as ApiKey[] | undefined;

  const [showCreate, setShowCreate] = useState(false);
  const [revealKey, setRevealKey] = useState<{ key: string; name: string } | null>(null);

  const handleCreated = useCallback((key: string, name: string) => {
    setShowCreate(false);
    setRevealKey({ key, name });
  }, []);

  const loading = keys === undefined;

  return (
    <>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink-1">API Keys</h1>
            <p className="mt-1 text-sm text-ink-3">
              Connect Jaguarnotes to Claude Desktop, Cursor, and other MCP-compatible tools.
            </p>
          </div>
          <motion.button
            {...buttonTap}
            onClick={() => setShowCreate(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-ai px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 neu-btn"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New API key
          </motion.button>
        </div>

        {/* Setup card */}
        <SetupCard />

        {/* Keys table */}
        <div className="rounded-2xl bg-surface neu-card overflow-hidden">
          {/* Table header */}
          <div className="hidden border-b border-line-1 px-6 py-3 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink-4">Name</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink-4">Created</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink-4">Last used</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink-4">Actions</span>
          </div>

          <div className="px-6">
            {loading ? (
              // Skeleton
              <div className="space-y-4 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-40 animate-pulse rounded-md bg-line-1" />
                      <div className="h-3 w-28 animate-pulse rounded-md bg-line-1" />
                    </div>
                    <div className="h-3 w-16 animate-pulse rounded-md bg-line-1" />
                    <div className="h-3 w-16 animate-pulse rounded-md bg-line-1" />
                    <div className="h-7 w-16 animate-pulse rounded-lg bg-line-1" />
                  </div>
                ))}
              </div>
            ) : keys.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-raised text-ink-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-2">No API keys yet</p>
                  <p className="mt-0.5 text-xs text-ink-4">Create one to connect MCP clients.</p>
                </div>
                <motion.button
                  {...buttonTap}
                  onClick={() => setShowCreate(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-xl border border-line-2 px-4 py-2 text-sm font-medium text-ink-2 transition-all hover:border-ai/40 hover:text-ai neu-btn"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create your first key
                </motion.button>
              </div>
            ) : (
              // Key rows
              <AnimatePresence initial={false}>
                {keys.map((k) => (
                  <motion.div
                    key={k._id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.2 }}
                  >
                    <KeyRow
                      id={k._id}
                      name={k.name}
                      keyPrefix={k.keyPrefix}
                      createdAt={k.createdAt}
                      lastUsedAt={k.lastUsedAt}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Security note */}
        <p className="text-xs text-ink-4">
          API keys grant full read/write access to your notes. Treat them like passwords — never share them or commit them to source control. Revoke any key you no longer need.
        </p>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateKeyModal
            key="create"
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
        {revealKey && (
          <KeyRevealModal
            key="reveal"
            rawKey={revealKey.key}
            keyName={revealKey.name}
            onClose={() => setRevealKey(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
