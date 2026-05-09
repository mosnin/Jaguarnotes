import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

// List all active keys for user (never returns the actual key)
export const list = query({
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return keys
      .filter((k) => !k.revokedAt)
      .map((k) => ({
        _id: k._id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
      }));
  },
});

// Create a new API key — returns the full key ONCE
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    // Generate: jn_sk_ + 32 random hex chars
    const rawKey = "jn_sk_" + randomHex(16);
    const keyHash = await hashKey(rawKey);
    // "jn_sk_" is 6 chars, take 6 more for a 12-char prefix like "jn_sk_XXXXXX"
    const keyPrefix = rawKey.slice(0, 12);
    await ctx.db.insert("apiKeys", {
      userId,
      name: args.name,
      keyHash,
      keyPrefix,
      createdAt: Date.now(),
    });
    return { key: rawKey, keyPrefix }; // Only time the full key is returned
  },
});

// Revoke a key
export const revoke = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const key = await ctx.db.get(args.id);
    if (!key || key.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { revokedAt: Date.now() });
  },
});

// Validate a raw key hash — returns userId + keyId if valid (used by MCP server)
export const validateKey = query({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", args.keyHash))
      .first();
    if (!apiKey || apiKey.revokedAt) return null;
    return { userId: apiKey.userId, keyId: apiKey._id };
  },
});

// Record last-used timestamp (called fire-and-forget from MCP server)
export const recordKeyUsage = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastUsedAt: Date.now() });
  },
});
