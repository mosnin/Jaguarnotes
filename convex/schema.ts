import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.optional(v.string()), // JSON-serialized BlockNote blocks
    preview: v.optional(v.string()), // Plain text excerpt for dashboard
    emoji: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
    aiBlockIds: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    linkedNoteIds: v.optional(v.array(v.id("notes"))),
    backlinkIds: v.optional(v.array(v.id("notes"))),
    parentId: v.optional(v.id("notes")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_pinned", ["userId", "pinned"])
    .index("by_user_parent", ["userId", "parentId"])
    .searchIndex("search_notes", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    useCases: v.optional(v.array(v.string())),
    onboarded: v.optional(v.boolean()),
  }).index("by_clerk_id", ["clerkId"]),

  shares: defineTable({
    noteId: v.id("notes"),
    ownerId: v.string(),
    token: v.string(),
    permission: v.union(v.literal("view"), v.literal("edit")),
    collaboratorIds: v.optional(v.array(v.string())),
  })
    .index("by_token", ["token"])
    .index("by_note", ["noteId"])
    .index("by_owner", ["ownerId"]),

  presence: defineTable({
    noteId: v.id("notes"),
    userId: v.string(),
    userName: v.string(),
    userImageUrl: v.optional(v.string()),
    lastSeen: v.number(),
  })
    .index("by_note", ["noteId"])
    .index("by_user_note", ["userId", "noteId"]),
});
