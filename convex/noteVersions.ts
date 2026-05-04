import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

export const list = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) return [];
    return ctx.db
      .query("noteVersions")
      .withIndex("by_note_saved", (q) => q.eq("noteId", args.noteId))
      .order("desc")
      .take(20);
  },
});

export const snapshot = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.string(),
    content: v.optional(v.string()),
    preview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) throw new Error("Not found");

    await (ctx.db as any).insert("noteVersions", {
      noteId: args.noteId,
      userId,
      title: args.title,
      content: args.content,
      preview: args.preview,
      savedAt: Date.now(),
    });

    // Prune to last 20 versions
    const versions = await ctx.db
      .query("noteVersions")
      .withIndex("by_note_saved", (q) => q.eq("noteId", args.noteId))
      .order("asc")
      .collect();
    if (versions.length > 20) {
      const toDelete = versions.slice(0, versions.length - 20);
      for (const ver of toDelete) await ctx.db.delete(ver._id);
    }
  },
});

export const restore = mutation({
  args: { versionId: v.id("noteVersions") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const version = await (ctx.db as any).get(args.versionId);
    if (!version || version.userId !== userId) throw new Error("Not found");
    const note = await ctx.db.get(version.noteId);
    if (!note || note.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(version.noteId, {
      title: version.title,
      content: version.content,
      preview: version.preview,
      updatedAt: Date.now(),
    });
    return version.noteId;
  },
});
