import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamCommandAgent } from "@/agents/command-agent";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const VALID_COMMANDS = [
  "table", "diagram", "explain", "brainstorm", "outline",
  "compress", "punch", "counter", "sowhat", "assume",
  "question", "premortem", "brief", "research",
] as const;

type Command = typeof VALID_COMMANDS[number];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await req.json();
  const { command, topic, think } = body;

  const canProceed = await convex.mutation(api.rateLimits.check, {
    userId,
    endpoint: "command",
    max: 20,
    windowMs: 60_000,
  });
  if (!canProceed) {
    return new Response("Rate limit exceeded. Try again in a minute.", { status: 429 });
  }

  if (!VALID_COMMANDS.includes(command as Command)) {
    return new Response("Invalid command", { status: 400 });
  }

  if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
    return new Response("Invalid topic", { status: 400 });
  }
  if (topic.length > 4000) {
    return new Response("Topic too long (max 4000 characters)", { status: 400 });
  }

  const stream = await streamCommandAgent(command as Command, topic.trim().slice(0, 2000), !!think);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
