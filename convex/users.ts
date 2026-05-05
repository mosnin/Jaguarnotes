import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string; email?: string; name?: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity;
}

export const getMe = query({
  handler: async (ctx) => {
    const identity = await requireUser(ctx);
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const updatePreferences = mutation({
  args: {
    role: v.optional(v.string()),
    useCases: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!existing) throw new Error("User not found");
    await ctx.db.patch(existing._id, {
      ...(args.role !== undefined && { role: args.role }),
      ...(args.useCases !== undefined && { useCases: args.useCases }),
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    role: v.string(),
    useCases: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        useCases: args.useCases,
        onboarded: true,
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email ?? "",
        name: identity.name,
        role: args.role,
        useCases: args.useCases,
        onboarded: true,
      });
    }
  },
});
