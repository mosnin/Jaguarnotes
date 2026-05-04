import { v, paginationOptsValidator } from "convex/values";
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
      .take(100);
  },
});

export const paginateNotes = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    return ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
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
    const cappedIds = ids.slice(0, 50);
    const results = await Promise.all(cappedIds.map((id) => ctx.db.get(id)));
    return results.filter(
      (n): n is NonNullable<typeof n> => n !== null && n.userId === userId
    );
  },
});

export const listChildren = query({
  args: { parentId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    return ctx.db
      .query("notes")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentId", args.parentId)
      )
      .collect();
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

    // Fast path: indexed lookup via junction table (populated on new accepts)
    const junctionRows = await (ctx.db as any)
      .query("collaboratorNotes")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const fastNoteIds = new Set(junctionRows.map((r: any) => r.noteId as string));

    // Legacy path: scan reduced to 100 for users who accepted before junction table existed
    const legacyShares = await ctx.db.query("shares").take(100);
    const legacyMine = legacyShares.filter(
      (s) => !fastNoteIds.has(s.noteId as string) && (s.collaboratorIds ?? []).includes(userId)
    );

    const fastNotes = await Promise.all(junctionRows.map((r: any) => ctx.db.get(r.noteId)));
    const legacyNotes = await Promise.all(legacyMine.map((s) => ctx.db.get(s.noteId)));

    return [...fastNotes, ...legacyNotes].filter(
      (n): n is NonNullable<typeof n> => n !== null
    );
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
      version: 0,
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
      if (share.expiresAt && share.expiresAt < Date.now()) {
        throw new Error("Share link has expired");
      }
    }

    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(args.id, { ...patch, updatedAt: Date.now(), version: (note.version ?? 0) + 1 });
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
