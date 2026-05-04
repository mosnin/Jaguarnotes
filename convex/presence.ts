import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

export const upsert = mutation({
  args: {
    noteId: v.id("notes"),
    userName: v.string(),
    userImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_note", (q) => q.eq("userId", userId).eq("noteId", args.noteId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: Date.now(),
        userName: args.userName,
        userImageUrl: args.userImageUrl,
      });
    } else {
      await ctx.db.insert("presence", {
        noteId: args.noteId,
        userId,
        userName: args.userName,
        userImageUrl: args.userImageUrl,
        lastSeen: Date.now(),
      });
    }

    // Opportunistic cleanup: remove records older than 2 minutes for this note
    const twoMinutesAgo = Date.now() - 120_000;
    const staleRecords = await ctx.db
      .query("presence")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .collect();
    for (const record of staleRecords) {
      if (record.lastSeen < twoMinutesAgo && record.userId !== userId) {
        await ctx.db.delete(record._id);
      }
    }
  },
});

export const getActive = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - 30_000;
    const records = await ctx.db
      .query("presence")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .collect();
    return records.filter((r) => r.lastSeen > cutoff);
  },
});

export const leave = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const record = await ctx.db
      .query("presence")
      .withIndex("by_user_note", (q) => q.eq("userId", userId).eq("noteId", args.noteId))
      .first();
    if (record) await ctx.db.delete(record._id);
  },
});
