import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const check = mutation({
  args: {
    userId: v.string(),
    endpoint: v.string(),
    max: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - args.windowMs;

    const record = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_endpoint", (q) =>
        q.eq("userId", args.userId).eq("endpoint", args.endpoint)
      )
      .first();

    if (!record) {
      await ctx.db.insert("rateLimits", {
        userId: args.userId,
        endpoint: args.endpoint,
        timestamps: [now],
      });
      return true;
    }

    const recent = record.timestamps.filter((t) => t > windowStart);
    if (recent.length >= args.max) {
      // Still trim stale data even when rate limiting
      if (recent.length < record.timestamps.length) {
        await ctx.db.patch(record._id, { timestamps: recent });
      }
      return false;
    }

    recent.push(now);
    await ctx.db.patch(record._id, { timestamps: recent });
    return true;
  },
});
