import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function checkRateLimit(
  ctx: { db: { query: Function; insert: Function; patch: Function } },
  userId: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const record = await (ctx.db as any)
    .query("rateLimits")
    .withIndex("by_user_endpoint", (q: any) =>
      q.eq("userId", userId).eq("endpoint", "accept")
    )
    .first();

  if (!record) {
    await (ctx.db as any).insert("rateLimits", {
      userId,
      endpoint: "accept",
      timestamps: [now],
    });
    return true;
  }

  const recent = record.timestamps.filter((t: number) => t > windowStart);
  if (recent.length >= max) return false;
  recent.push(now);
  await (ctx.db as any).patch(record._id, { timestamps: recent });
  return true;
}

async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

export const create = mutation({
  args: { noteId: v.id("notes"), permission: v.union(v.literal("view"), v.literal("edit")) },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) throw new Error("Not found");

    const existing = await ctx.db
      .query("shares")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .first();
    if (existing) return existing.token;

    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    await ctx.db.insert("shares", {
      noteId: args.noteId,
      ownerId: userId,
      token,
      permission: args.permission,
      collaboratorIds: [],
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
    });
    return token;
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("shares")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!share) return null;
    if (share.expiresAt && share.expiresAt < Date.now()) return null;
    const note = await ctx.db.get(share.noteId);
    if (!note) return null;
    return { share, note: { _id: note._id, title: note.title, emoji: note.emoji } };
  },
});

export const accept = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    if (!(await checkRateLimit(ctx, userId, 10, 60_000))) throw new Error("Rate limited");
    const share = await ctx.db
      .query("shares")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!share) throw new Error("Invalid token");

    const collaboratorIds = share.collaboratorIds ?? [];
    if (!collaboratorIds.includes(userId)) {
      await ctx.db.patch(share._id, { collaboratorIds: [...collaboratorIds, userId] });
      // Maintain junction table for efficient listShared queries
      const existing = await (ctx.db as any)
        .query("collaboratorNotes")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();
      if (!existing.some((r: any) => (r.noteId as string) === (share.noteId as string))) {
        await (ctx.db as any).insert("collaboratorNotes", { userId, noteId: share.noteId });
      }
    }
    return share.noteId;
  },
});

export const listForNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) return null;
    return ctx.db
      .query("shares")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .first();
  },
});

export const updatePermission = mutation({
  args: { shareId: v.id("shares"), permission: v.union(v.literal("view"), v.literal("edit")) },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const share = await ctx.db.get(args.shareId);
    if (!share || share.ownerId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.shareId, { permission: args.permission });
  },
});

export const revoke = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const share = await ctx.db
      .query("shares")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .first();
    if (!share || share.ownerId !== userId) throw new Error("Not found");
    await ctx.db.delete(share._id);
  },
});

export const listShared = query({
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const allShares = await ctx.db.query("shares").take(500);
    const mine = allShares.filter((s) => (s.collaboratorIds ?? []).includes(userId));
    const notes = await Promise.all(mine.map((s) => ctx.db.get(s.noteId)));
    return notes.filter((n): n is NonNullable<typeof n> => n !== null);
  },
});
