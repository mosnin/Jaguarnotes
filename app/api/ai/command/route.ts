import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamCommandAgent } from "@/agents/command-agent";

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
