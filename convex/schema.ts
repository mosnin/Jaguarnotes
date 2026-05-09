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
    folderId: v.optional(v.id("folders")), // Project folder membership
    coverColor: v.optional(v.string()),     // Hex color for note cover
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    wordCount: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    version: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_pinned", ["userId", "pinned"])
    .index("by_user_parent", ["userId", "parentId"])
    .index("by_user_folder", ["userId", "folderId"])
    .searchIndex("search_notes", {
      searchField: "title",
      filterFields: ["userId"],
    })
    .searchIndex("search_notes_preview", {
      searchField: "preview",
      filterFields: ["userId"],
    }),

  folders: defineTable({
    userId: v.string(),
    name: v.string(),
    emoji: v.optional(v.string()),
    color: v.optional(v.string()),   // Hex color accent
    parentId: v.optional(v.id("folders")), // Nested folders (1 level)
    sortOrder: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentId"]),

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
    expiresAt: v.optional(v.number()),
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

  rateLimits: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    timestamps: v.array(v.number()),
  }).index("by_user_endpoint", ["userId", "endpoint"]),

  collaboratorNotes: defineTable({
    userId: v.string(),
    noteId: v.id("notes"),
  }).index("by_user", ["userId"]),

  noteVersions: defineTable({
    noteId: v.id("notes"),
    userId: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    preview: v.optional(v.string()),
    savedAt: v.number(),
  }).index("by_note_saved", ["noteId", "savedAt"]),

  // MCP API keys — keys are stored hashed; prefix shown in UI for identification
  apiKeys: defineTable({
    userId: v.string(),
    name: v.string(),           // Friendly label e.g. "Cursor MCP"
    keyHash: v.string(),        // bcrypt/SHA-256 hash of the full key
    keyPrefix: v.string(),      // First 8 chars shown in UI: "jn_sk_ab"
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_key_hash", ["keyHash"]),
});
