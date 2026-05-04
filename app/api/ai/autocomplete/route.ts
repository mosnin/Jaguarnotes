import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamAutocompleteAgent } from "@/agents/autocomplete-agent";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const canProceed = await convex.mutation(api.rateLimits.check, {
    userId,
    endpoint: "autocomplete",
    max: 30,
    windowMs: 60_000,
  });
  if (!canProceed) {
    return new Response("Rate limit exceeded. Try again in a minute.", { status: 429 });
  }

  const body = await req.json();
  const { context } = body;

  if (!context || typeof context !== "string" || context.trim().length < 2) {
    return new Response("Invalid context", { status: 400 });
  }

  const stream = await streamAutocompleteAgent(context.trim().slice(0, 200));

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
