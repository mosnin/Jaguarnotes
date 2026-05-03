import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runCommandAgent } from "@/agents/command-agent";

const VALID_COMMANDS = ["table", "diagram", "explain", "brainstorm", "outline"] as const;
type Command = typeof VALID_COMMANDS[number];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { command, topic } = body;

  if (!VALID_COMMANDS.includes(command as Command)) {
    return NextResponse.json({ error: "Invalid command" }, { status: 400 });
  }

  if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }

  try {
    const content = await runCommandAgent(command as Command, topic.trim().slice(0, 300));
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Command agent error:", err);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}
