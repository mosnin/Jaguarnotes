import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runAutocompleteAgent } from "@/agents/autocomplete-agent";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { context } = body;

  if (!context || typeof context !== "string" || context.trim().length < 2) {
    return NextResponse.json({ error: "Invalid context" }, { status: 400 });
  }

  try {
    const text = await runAutocompleteAgent(context.trim().slice(0, 200));
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Autocomplete agent error:", err);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}
