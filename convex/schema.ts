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
  })
    .index("by_user", ["userId"])
    .index("by_user_pinned", ["userId", "pinned"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    useCases: v.optional(v.array(v.string())),
    onboarded: v.optional(v.boolean()),
  }).index("by_clerk_id", ["clerkId"]),
});
