import type { PartialBlock, Block } from "@blocknote/core";

type StyledTextRun = { type: "text"; text: string; styles: Record<string, boolean | string> };

/**
 * Parse a single line of inline markdown (bold/italic/code/strike/links) into
 * styled BlockNote text runs. Handles nesting like ***bold italic***.
 *
 * Supported tokens:
 *   **text** → bold
 *   *text* | _text_ → italic
 *   `text` → code
 *   ~~text~~ → strike
 *   [text](url) → link
 */
export function parseInlineMarkdown(input: string): StyledTextRun[] {
  const runs: StyledTextRun[] = [];

  function emit(text: string, styles: Record<string, boolean | string>) {
    if (!text) return;
    // Merge with previous run if styles match exactly.
    const last = runs[runs.length - 1];
    if (last && JSON.stringify(last.styles) === JSON.stringify(styles)) {
      last.text += text;
    } else {
      runs.push({ type: "text", text, styles });
    }
  }

  function walk(text: string, styles: Record<string, boolean | string>) {
    let i = 0;
    while (i < text.length) {
      const rest = text.slice(i);

      // Link: [text](url)
      const linkMatch = /^\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(rest);
      if (linkMatch) {
        // BlockNote text styles support link via "link" style with the URL value.
        walk(linkMatch[1], { ...styles, link: linkMatch[2] });
        i += linkMatch[0].length;
        continue;
      }

      // Bold: **text**
      if (rest.startsWith("**")) {
        const end = rest.indexOf("**", 2);
        if (end !== -1) {
          walk(rest.slice(2, end), { ...styles, bold: true });
          i += end + 2;
          continue;
        }
      }

      // Strike: ~~text~~
      if (rest.startsWith("~~")) {
        const end = rest.indexOf("~~", 2);
        if (end !== -1) {
          walk(rest.slice(2, end), { ...styles, strike: true });
          i += end + 2;
          continue;
        }
      }

      // Inline code: `text`
      if (rest.startsWith("`")) {
        const end = rest.indexOf("`", 1);
        if (end !== -1) {
          // Code spans don't nest other markdown.
          emit(rest.slice(1, end), { ...styles, code: true });
          i += end + 1;
          continue;
        }
      }

      // Italic: *text* or _text_  (single marker, not part of **)
      const ital = /^([*_])(?!\1)([^*_\n][^\n]*?[^*_\\])\1(?!\1)/.exec(rest);
      if (ital) {
        walk(ital[2], { ...styles, italic: true });
        i += ital[0].length;
        continue;
      }

      // Plain run — accumulate up to the next potential marker.
      let plainEnd = 1;
      while (plainEnd < rest.length) {
        const ch = rest[plainEnd];
        if (ch === "*" || ch === "_" || ch === "`" || ch === "~" || ch === "[") break;
        plainEnd++;
      }
      emit(rest.slice(0, plainEnd), styles);
      i += plainEnd;
    }
  }

  walk(input, {});
  return runs.length > 0 ? runs : [{ type: "text", text: input, styles: {} }];
}

function textBlock(text: string, type: "paragraph" | "bulletListItem" | "numberedListItem" | "quote"): PartialBlock {
  return { type, content: parseInlineMarkdown(text) } as PartialBlock;
}

function headingBlock(text: string, level: 1 | 2 | 3): PartialBlock {
  return { type: "heading", props: { level }, content: parseInlineMarkdown(text) } as PartialBlock;
}

function paragraph(text: string): PartialBlock {
  return textBlock(text, "paragraph");
}

/**
 * Converts AI-generated text into appropriate BlockNote block types.
 * Brainstorm/question → bulletListItems. Outline → headings + bullets.
 * Everything else → paragraph(s), split on double newlines.
 *
 * Inline markdown (bold/italic/code/strike/links) is parsed inside each block.
 */
export function textToBlocks(text: string, command: string): PartialBlock[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  if (["brainstorm", "question"].includes(command)) {
    const blocks = lines.map((line) => {
      const cleaned = line.replace(/^[\d]+\.\s*|^[-•*]\s*/, "").trim();
      if (!cleaned) return null;
      return textBlock(cleaned, "bulletListItem");
    }).filter((b): b is PartialBlock => b !== null);
    return blocks.length ? blocks : [paragraph(text)];
  }

  if (command === "outline") {
    const blocks = lines.map((line): PartialBlock => {
      const h1 = /^#\s+(.+)/.exec(line);
      const h2 = /^##\s+(.+)/.exec(line);
      const h3 = /^###\s+(.+)/.exec(line);
      const bullet = /^[\s]*[-•*\d.]+\s+(.+)/.exec(line);
      if (h1) return headingBlock(h1[1].trim(), 1);
      if (h2) return headingBlock(h2[1].trim(), 2);
      if (h3) return headingBlock(h3[1].trim(), 3);
      if (bullet) return textBlock(bullet[1].trim(), "bulletListItem");
      return paragraph(line);
    });
    return blocks.length ? blocks : [paragraph(text)];
  }

  // Everything else — multi-line aware. Split on blank lines, then within each
  // chunk handle headings / bullets line by line so AI markdown comes out right.
  const chunks = text.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  const blocks: PartialBlock[] = [];
  for (const chunk of chunks) {
    const chunkLines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of chunkLines) {
      const h1 = /^#\s+(.+)/.exec(line);
      const h2 = /^##\s+(.+)/.exec(line);
      const h3 = /^###\s+(.+)/.exec(line);
      const numbered = /^(\d+)\.\s+(.+)/.exec(line);
      const bullet = /^[-•*]\s+(.+)/.exec(line);
      const quote = /^>\s*(.+)/.exec(line);
      if (h1) blocks.push(headingBlock(h1[1].trim(), 1));
      else if (h2) blocks.push(headingBlock(h2[1].trim(), 2));
      else if (h3) blocks.push(headingBlock(h3[1].trim(), 3));
      else if (numbered) blocks.push(textBlock(numbered[2].trim(), "numberedListItem"));
      else if (bullet) blocks.push(textBlock(bullet[1].trim(), "bulletListItem"));
      else if (quote) blocks.push(textBlock(quote[1].trim(), "quote"));
      else blocks.push(paragraph(line));
    }
  }
  return blocks.length > 0 ? blocks : [paragraph(text)];
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
      .map((i) => {
        const item = i as { text: string; styles?: Record<string, boolean> };
        let t = item.text;
        const s = item.styles ?? {};
        if (s.bold) t = `**${t}**`;
        if (s.italic) t = `*${t}*`;
        if (s.code) t = `\`${t}\``;
        if (s.strike) t = `~~${t}~~`;
        return t;
      })
      .join("");
  }
  return "";
}
