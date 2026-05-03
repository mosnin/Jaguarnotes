import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamAutocompleteAgent } from "@/agents/autocomplete-agent";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
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
