import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runAutocompleteAgent(context: string): Promise<string> {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    instructions: `You are an AI autocomplete engine for a note-taking app.
The user has typed a concept or phrase. Expand it with a concise, accurate, and sharp definition or explanation — 1-3 sentences maximum.
Do NOT add a heading. Do NOT repeat the input phrase. Output only the expansion text.
Be authoritative, specific, and clear. No filler words.`,
    input: `Concept to expand: ${context}`,
  });

  return response.output_text.trim();
}
