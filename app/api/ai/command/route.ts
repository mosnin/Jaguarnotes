import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamCommandAgent } from "@/agents/command-agent";

// Per-process sliding window rate limiter (best-effort on serverless)
const rl = new Map<string, number[]>();
function allowed(uid: string, max = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const ts = (rl.get(uid) ?? []).filter((t) => now - t < windowMs);
  if (ts.length >= max) return false;
  ts.push(now);
  rl.set(uid, ts);
  return true;
}

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
  if (!allowed(userId)) {
    return new Response("Rate limit exceeded. Try again in a minute.", { status: 429 });
  }

  const body = await req.json();
  const { command, topic } = body;

  if (!VALID_COMMANDS.includes(command as Command)) {
    return new Response("Invalid command", { status: 400 });
  }

  if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
    return new Response("Invalid topic", { status: 400 });
  }

  const stream = await streamCommandAgent(command as Command, topic.trim().slice(0, 2000));

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
