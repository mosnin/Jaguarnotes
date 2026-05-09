import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { createHash } from "crypto";
import type { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function authenticate(
  req: NextRequest
): Promise<{ userId: string; keyId: Id<"apiKeys"> } | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const rawKey = auth.slice(7).trim();
  if (!rawKey.startsWith("jn_sk_")) return null;
  const keyHash = hashKey(rawKey);
  const result = await convex.query(api.apiKeys.validateKey, { keyHash });
  if (!result) return null;
  return { userId: result.userId, keyId: result.keyId as Id<"apiKeys"> };
}

// ---------------------------------------------------------------------------
// Tool schemas exposed via tools/list
// ---------------------------------------------------------------------------

const TOOL_SCHEMAS = {
  list_notes: {
    name: "list_notes",
    description:
      "List all notes for the authenticated user. Returns id, title, preview, tags, emoji, and creation time.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max results (default 50, max 100)",
          default: 50,
        },
        tag: {
          type: "string",
          description: "Optional tag to filter by",
        },
      },
    },
  },
  get_note: {
    name: "get_note",
    description:
      "Get the full content of a note by ID. Returns title, content, tags, emoji, creation time, and linked notes.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The note ID" },
      },
      required: ["id"],
    },
  },
  create_note: {
    name: "create_note",
    description: "Create a new note with a title and optional plain-text content.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Note title" },
        content: {
          type: "string",
          description: "Note content in plain text or markdown",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags",
        },
        emoji: { type: "string", description: "Optional emoji icon" },
      },
      required: ["title"],
    },
  },
  update_note: {
    name: "update_note",
    description: "Update the title, content, or tags of an existing note.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The note ID to update" },
        title: { type: "string", description: "New title (optional)" },
        content: {
          type: "string",
          description: "New content in plain text (optional)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "New tags — replaces existing (optional)",
        },
      },
      required: ["id"],
    },
  },
  search_notes: {
    name: "search_notes",
    description:
      "Search notes by title. Returns matching notes with id, title, and preview.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  delete_note: {
    name: "delete_note",
    description: "Permanently delete a note by ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The note ID to delete" },
        confirm: {
          type: "boolean",
          description: "Must be true to confirm deletion",
        },
      },
      required: ["id", "confirm"],
    },
  },
} as const;

type ToolName = keyof typeof TOOL_SCHEMAS;

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

async function callTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  switch (toolName as ToolName) {
    case "list_notes": {
      const limit = Math.min(Number(args.limit ?? 50), 100);
      const notes = await convex.query(api.notes.listForMcp, { userId, limit });
      let filtered = notes;
      if (typeof args.tag === "string" && args.tag.trim()) {
        const tag = args.tag.trim().toLowerCase();
        filtered = notes.filter((n) =>
          (n.tags ?? []).some((t) => t.toLowerCase() === tag)
        );
      }
      return filtered.map((n) => ({
        id: n._id,
        title: n.title,
        preview: n.preview ?? "",
        tags: n.tags ?? [],
        emoji: n.emoji ?? "",
        createdAt: new Date(n._creationTime).toISOString(),
        updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : null,
      }));
    }

    case "get_note": {
      if (!args.id) return { error: "id is required" };
      const note = await convex.query(api.notes.getForMcp, {
        id: String(args.id),
        userId,
      });
      if (!note) return { error: "Note not found" };
      return {
        id: note._id,
        title: note.title,
        content: note.preview ?? "",
        tags: note.tags ?? [],
        emoji: note.emoji ?? "",
        pinned: note.pinned ?? false,
        createdAt: new Date(note._creationTime).toISOString(),
        updatedAt: note.updatedAt ? new Date(note.updatedAt).toISOString() : null,
      };
    }

    case "create_note": {
      if (!args.title) return { error: "title is required" };
      const id = await convex.mutation(api.notes.createForMcp, {
        userId,
        title: String(args.title),
        content: args.content ? String(args.content) : undefined,
        tags: Array.isArray(args.tags)
          ? (args.tags as unknown[]).map(String)
          : undefined,
        emoji: args.emoji ? String(args.emoji) : undefined,
      });
      return { id, success: true };
    }

    case "update_note": {
      if (!args.id) return { error: "id is required" };
      await convex.mutation(api.notes.updateForMcp, {
        id: String(args.id),
        userId,
        title: args.title !== undefined ? String(args.title) : undefined,
        content: args.content !== undefined ? String(args.content) : undefined,
        tags: Array.isArray(args.tags)
          ? (args.tags as unknown[]).map(String)
          : undefined,
      });
      return { success: true };
    }

    case "search_notes": {
      if (!args.query) return { error: "query is required" };
      const results = await convex.query(api.notes.searchForMcp, {
        query: String(args.query),
        userId,
      });
      return results;
    }

    case "delete_note": {
      if (!args.id) return { error: "id is required" };
      if (!args.confirm) {
        return { error: "confirm must be true to delete a note" };
      }
      await convex.mutation(api.notes.deleteForMcp, {
        id: String(args.id),
        userId,
      });
      return { success: true };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// ---------------------------------------------------------------------------
// CORS headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonRpcError(
  id: unknown,
  code: number,
  message: string,
  status = 200
) {
  return NextResponse.json(
    { jsonrpc: "2.0", error: { code, message }, id },
    { headers: CORS_HEADERS, status }
  );
}

function jsonRpcResult(id: unknown, result: unknown) {
  return NextResponse.json(
    { jsonrpc: "2.0", result, id },
    { headers: CORS_HEADERS }
  );
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Parse JSON-RPC body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error", 400);
  }

  const { method, params, id } = body as {
    method: string;
    params?: Record<string, unknown>;
    id: unknown;
  };

  if (!method || typeof method !== "string") {
    return jsonRpcError(id ?? null, -32600, "Invalid Request", 400);
  }

  // ── initialize — no auth required ──────────────────────────────────────────
  if (method === "initialize") {
    return jsonRpcResult(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "jaguarnotes-mcp", version: "1.0.0" },
    });
  }

  // ── tools/list — no auth required ─────────────────────────────────────────
  if (method === "tools/list") {
    return jsonRpcResult(id, { tools: Object.values(TOOL_SCHEMAS) });
  }

  // ── All other methods require a valid Bearer API key ───────────────────────
  const authResult = await authenticate(req);
  if (!authResult) {
    return jsonRpcError(
      id,
      -32001,
      "Unauthorized: Invalid or missing API key",
      401
    );
  }

  // Fire-and-forget: record key usage (best effort, don't block response)
  convex
    .mutation(api.apiKeys.recordKeyUsage, { id: authResult.keyId })
    .catch(() => {});

  // ── tools/call ─────────────────────────────────────────────────────────────
  if (method === "tools/call") {
    const toolName = (params as any)?.name as string | undefined;
    const toolArgs = ((params as any)?.arguments ?? {}) as Record<
      string,
      unknown
    >;

    if (!toolName || !(toolName in TOOL_SCHEMAS)) {
      return jsonRpcError(id, -32601, `Tool not found: ${toolName}`);
    }

    try {
      const result = await callTool(toolName, toolArgs, authResult.userId);
      return jsonRpcResult(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Internal error";
      return jsonRpcError(id, -32603, message, 500);
    }
  }

  // ── Unknown method ──────────────────────────────────────────────────────────
  return jsonRpcError(id, -32601, `Method not found: ${method}`);
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
