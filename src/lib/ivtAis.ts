import source from "@/content/iv-thrombolysis-ais.md?raw";

/**
 * Clinical source of truth: src/content/iv-thrombolysis-ais.md
 * Parse structure only. Do not rewrite, drop, or add clinical wording.
 */

export type TextRun = { text: string; strong?: boolean };

export type IvtBlock =
  | { kind: "title"; text: string }
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; runs: TextRun[] }
  | { kind: "list"; items: TextRun[][] }
  | { kind: "table"; headers: TextRun[][]; rows: TextRun[][][] };

const H2 = new Set([
  "Initial assessment and treatment windows",
  "Contraindications highlighted in the slides",
  "IV thrombolysis after recent DOAC intake",
  "Assess residual anticoagulant activity",
  "Reperfusion decision and documentation",
]);

const H3 = new Set(["Absolute contraindications", "Relative contraindications"]);

export const IVT_AIS_SECTION_ID = "ivt-ais";

function parseRuns(input: string): TextRun[] {
  const parts = input.split("**");
  if (parts.length % 2 === 0) {
    throw new Error(`Unbalanced bold markers: ${input}`);
  }
  const runs: TextRun[] = [];
  parts.forEach((part, index) => {
    if (part === "") return;
    runs.push(index % 2 === 1 ? { text: part, strong: true } : { text: part });
  });
  return runs;
}

function parseRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    throw new Error(`IVT table row is not closed: ${trimmed}`);
  }
  const cells = trimmed.slice(1, -1).split("|").map((cell) => cell.trim());
  if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) return null;
  return cells;
}

function parseTable(block: string): { headers: TextRun[][]; rows: TextRun[][][] } {
  const parsed = block
    .split("\n")
    .map(parseRow)
    .filter((row): row is string[] => row !== null);
  if (parsed.length < 2) {
    throw new Error("IVT table is missing a header or body row");
  }
  const [headers, ...rows] = parsed;
  if (rows.some((row) => row.length !== headers.length)) {
    throw new Error("IVT table row does not match the header column count");
  }
  return {
    headers: headers.map(parseRuns),
    rows: rows.map((row) => row.map(parseRuns)),
  };
}

function parseList(block: string): TextRun[][] {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (!line.startsWith("• ")) {
        throw new Error(`IVT list item is missing its bullet: ${line}`);
      }
      return parseRuns(line.slice(2));
    });
}

export function parseIvtAis(markdown: string): IvtBlock[] {
  const blocks = markdown.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return blocks.map((raw, index) => {
    const block = raw.trim();
    if (block.startsWith("|")) {
      return { kind: "table", ...parseTable(block) };
    }
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.every((line) => line.startsWith("• "))) {
      return { kind: "list", items: parseList(block) };
    }
    if (index === 0) {
      return { kind: "title", text: block };
    }
    if (H3.has(block)) {
      return { kind: "heading", level: 3, text: block };
    }
    if (H2.has(block)) {
      return { kind: "heading", level: 2, text: block };
    }
    return { kind: "paragraph", runs: parseRuns(block) };
  });
}

function runsText(runs: TextRun[]): string {
  return runs.map((run) => run.text).join("");
}

/** Visible clinical text in document order, with markdown markers removed. */
export function ivtAisVisibleText(blocks: IvtBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.kind) {
        case "title":
        case "heading":
          return block.text;
        case "paragraph":
          return runsText(block.runs);
        case "list":
          return block.items.map(runsText).join("\n");
        case "table":
          return [block.headers, ...block.rows]
            .map((row) => row.map(runsText).join("\t"))
            .join("\n");
      }
    })
    .join("\n\n");
}

export const IVT_AIS_SOURCE = source;
export const IVT_AIS_BLOCKS = parseIvtAis(source);
