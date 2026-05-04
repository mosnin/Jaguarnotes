import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper — throws if not authenticated
async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

export const list = query({
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    return ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const note = await ctx.db.get(args.id);
    if (!note) return null;
    if (note.userId === userId) return note;
    // Check collaborator access
    const share = await ctx.db
      .query("shares")
      .withIndex("by_note", (q) => q.eq("noteId", args.id))
      .first();
    if (share && (share.collaboratorIds ?? []).includes(userId)) return note;
    return null;
  },
});

export const getBacklinks = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    // Use the backlinkIds field for O(1) lookup when available
    const note = await ctx.db.get(args.noteId);
    if (!note) return [];
    const ids = note.backlinkIds ?? [];
    if (ids.length === 0) return [];
    const results = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return results.filter(
      (n): n is NonNullable<typeof n> => n !== null && n.userId === userId
    );
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    if (!args.query.trim()) return [];
    return ctx.db
      .query("notes")
      .withSearchIndex("search_notes", (q) =>
        q.search("title", args.query).eq("userId", userId)
      )
      .take(20);
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

export const create = mutation({
  args: { title: v.string(), parentId: v.optional(v.id("notes")) },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    return ctx.db.insert("notes", {
      userId,
      title: args.title,
      content: undefined,
      preview: undefined,
      pinned: false,
      updatedAt: Date.now(),
      ...(args.parentId ? { parentId: args.parentId } : {}),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    preview: v.optional(v.string()),
    emoji: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
    aiBlockIds: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    linkedNoteIds: v.optional(v.array(v.id("notes"))),
    backlinkIds: v.optional(v.array(v.id("notes"))),
    parentId: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const note = await ctx.db.get(args.id);
    if (!note) throw new Error("Not found");

    if (note.userId !== userId) {
      // Check collaborator edit access
      const share = await ctx.db
        .query("shares")
        .withIndex("by_note", (q) => q.eq("noteId", args.id))
        .first();
      if (!share || !(share.collaboratorIds ?? []).includes(userId) || share.permission !== "edit") {
        throw new Error("Not authorized");
      }
    }

    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(args.id, { ...patch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
