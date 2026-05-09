import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Helper — throws if not authenticated
async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

/** List all folders for the current user, ordered by sortOrder asc */
export const list = query({
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    return ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

/** Create a new folder */
export const create = mutation({
  args: {
    name: v.string(),
    emoji: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return ctx.db.insert("folders", {
      userId,
      name: args.name,
      emoji: args.emoji,
      color: args.color,
      sortOrder: existing.length,
    });
  },
});

/** Rename / update emoji and color of a folder */
export const rename = mutation({
  args: {
    id: v.id("folders"),
    name: v.string(),
    emoji: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      name: args.name,
      emoji: args.emoji,
      color: args.color,
    });
  },
});

/** Delete a folder; unlinks all notes that were in it */
export const remove = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) throw new Error("Not found");
    // Unlink all notes from this folder
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", args.id)
      )
      .collect();
    await Promise.all(notes.map((n) => ctx.db.patch(n._id, { folderId: undefined })));
    await ctx.db.delete(args.id);
  },
});

/** Move a note into (or out of) a folder */
export const moveNote = mutation({
  args: {
    noteId: v.id("notes"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.noteId, { folderId: args.folderId });
  },
});

/** List all notes inside a folder */
export const listNotes = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    return ctx.db
      .query("notes")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", args.folderId)
      )
      .order("desc")
      .collect();
  },
});

/** Count notes per folder — returns a map folderId -> count */
export const noteCounts = query({
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const counts: Record<string, number> = {};
    await Promise.all(
      folders.map(async (f) => {
        const notes = await ctx.db
          .query("notes")
          .withIndex("by_user_folder", (q) =>
            q.eq("userId", userId).eq("folderId", f._id)
          )
          .collect();
        counts[f._id] = notes.length;
      })
    );
    return counts;
  },
});
