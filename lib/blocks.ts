import type { PartialBlock, Block } from "@blocknote/core";

/**
 * Converts AI-generated text into appropriate BlockNote block types.
 * Brainstorm/question → bulletListItems. Outline → headings + bullets.
 * Everything else → paragraph(s), split on double newlines.
 */
export function textToBlocks(text: string, command: string): PartialBlock[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  if (["brainstorm", "question"].includes(command)) {
    const blocks = lines.map((line) => {
      const cleaned = line.replace(/^[\d]+\.\s*|^[-•*]\s*/, "").trim();
      if (!cleaned) return null;
      return {
        type: "bulletListItem" as const,
        content: [{ type: "text" as const, text: cleaned, styles: {} }],
      };
    }).filter((b): b is PartialBlock => b !== null);
    return blocks.length ? blocks : [paragraph(text)];
  }

  if (command === "outline") {
    const blocks = lines.map((line): PartialBlock => {
      const h1 = /^#\s+(.+)/.exec(line);
      const h2 = /^##\s+(.+)/.exec(line);
      const h3 = /^###\s+(.+)/.exec(line);
      const bullet = /^[\s]*[-•*\d.]+\s+(.+)/.exec(line);
      if (h1) return { type: "heading", props: { level: 1 }, content: [{ type: "text", text: h1[1].trim(), styles: {} }] };
      if (h2) return { type: "heading", props: { level: 2 }, content: [{ type: "text", text: h2[1].trim(), styles: {} }] };
      if (h3) return { type: "heading", props: { level: 3 }, content: [{ type: "text", text: h3[1].trim(), styles: {} }] };
      if (bullet) return { type: "bulletListItem", content: [{ type: "text", text: bullet[1].trim(), styles: {} }] };
      return paragraph(line);
    });
    return blocks.length ? blocks : [paragraph(text)];
  }

  // Multi-paragraph commands — split on double newlines
  const paras = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paras.length > 1) return paras.map(paragraph);

  return [paragraph(text)];
}

function paragraph(text: string): PartialBlock {
  return { type: "paragraph", content: [{ type: "text", text, styles: {} }] };
}

/** Serialize BlockNote blocks to Markdown for export. */
export function blocksToMarkdown(blocks: Block[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    const text = extractText(block);
    if (!text && block.type !== "table") continue;

    switch (block.type) {
      case "heading": {
        const level = (block.props as { level?: number }).level ?? 1;
        lines.push("#".repeat(level) + " " + text);
        break;
      }
      case "bulletListItem":
        lines.push("- " + text);
        break;
      case "numberedListItem":
        lines.push("1. " + text);
        break;
      case "checkListItem":
        lines.push("- [ ] " + text);
        break;
      case "codeBlock":
        lines.push("```\n" + text + "\n```");
        break;
      case "quote":
        lines.push("> " + text);
        break;
      default:
        if (text) lines.push(text);
    }
  }

  return lines.join("\n\n");
}

function extractText(block: Block): string {
  const content = block.content;
  if (!content || typeof content === "string") return "";
  if (Array.isArray(content)) {
    return content
      .filter((i) => i.type === "text")
      .map((i) => (i as { text: string }).text)
      .join("");
  }
  return "";
}
