import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Command = "table" | "diagram" | "explain" | "brainstorm" | "outline";

const SYSTEM_PROMPTS: Record<Command, string> = {
  table: `You are a table generator for a note-taking app.
Generate a well-structured, populated markdown table on the requested topic.
Include 4-6 columns and 5-8 rows of real, accurate data.
Output ONLY the markdown table. No intro, no explanation.`,

  diagram: `You are a diagram generator for a note-taking app.
Generate a Mermaid.js diagram for the requested concept.
Choose the most appropriate diagram type (flowchart, sequence, graph, etc.).
Output ONLY the Mermaid code block. No intro, no explanation.`,

  explain: `You are an explanation engine for a note-taking app.
Generate a structured explanation of the requested term or concept.
Format: Definition, then Key Points (3-5 bullet points), then a one-line Why It Matters.
Be precise, expert-level, no fluff.`,

  brainstorm: `You are a brainstorming assistant for a note-taking app.
Generate 8-12 sharp, creative, non-obvious ideas related to the requested topic.
Format as a numbered list. Each idea in one line — specific, actionable, interesting.
No explanations. Just ideas.`,

  outline: `You are a document outline generator for a note-taking app.
Generate a structured document outline for the requested subject.
Format: Main sections (H2 level) with 3-4 subsections each (H3 level).
Be comprehensive but focused. Output clean markdown headings only.`,
};

export async function runCommandAgent(command: Command, topic: string): Promise<string> {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    instructions: SYSTEM_PROMPTS[command],
    input: topic,
  });

  return response.output_text.trim();
}
