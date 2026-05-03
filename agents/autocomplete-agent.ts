import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an AI autocomplete engine for a note-taking app.
The user has typed a concept or phrase. Expand it with a concise, accurate, and sharp definition or explanation — 1-3 sentences maximum.
Do NOT add a heading. Do NOT repeat the input phrase. Output only the expansion text.
Be authoritative, specific, and clear. No filler words.`;

export async function streamAutocompleteAgent(context: string): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Concept to expand: ${context}` },
          ],
          stream: true,
          max_tokens: 150,
          temperature: 0.7,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });
}
