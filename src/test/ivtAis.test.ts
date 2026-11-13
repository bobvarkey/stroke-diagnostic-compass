import { describe, expect, it } from "vitest";
import {
  IVT_AIS_BLOCKS,
  IVT_AIS_SOURCE,
  ivtAisVisibleText,
  type IvtBlock,
} from "@/lib/ivtAis";

/** Independent of the parser: drop markdown syntax and keep clinical characters in order. */
function stripMarkdownSyntax(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      out.push("");
      continue;
    }
    if (trimmed.startsWith("|")) {
      if (!trimmed.endsWith("|")) throw new Error(`unclosed table row: ${trimmed}`);
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim().replace(/\*\*/g, ""));
      if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
      out.push(cells.join("\t"));
      continue;
    }
    let text = trimmed.startsWith("• ") ? trimmed.slice(2) : trimmed;
    text = text.replace(/\*\*/g, "");
    out.push(text);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

describe("IV thrombolysis in acute ischaemic stroke", () => {
  const text = ivtAisVisibleText(IVT_AIS_BLOCKS);

  it("preserves the supplied clinical wording, numbers, and citations", () => {
    expect(text).toBe(stripMarkdownSyntax(IVT_AIS_SOURCE));
    expect(IVT_AIS_SOURCE).toContain("IV thrombolysis in acute ischaemic stroke");
    expect(text).toContain(
      "A clearly disabling deficit can qualify for intravenous thrombolysis (IVT) even when the NIH Stroke Scale (NIHSS) score is low. Exclude acute intracranial haemorrhage with noncontrast CT or MRI before treatment. 2026 AHA/ASA guideline, sections 4.6.1–4.6.3",
    );
    expect(text).toContain(
      "Platelets <100,000/µL, INR >1.7, aPTT >40 seconds, or PT >15 seconds.",
    );
    expect(text).toContain(
      "In Meinel et al.’s retrospective multicentre study, symptomatic intracranial haemorrhage occurred in 2.5% of 832 IVT-treated patients with recent DOAC intake and 4.1% of IVT-treated controls without anticoagulant use (adjusted OR 0.57, 95% CI 0.36–0.92). Selection for treatment limits generalisability. Definitive trials are needed to establish safety. Meinel et al., JAMA Neurology, 2023",
    );
    expect(text).toContain(
      "Normal PT/INR or aPTT, including a routine point-of-care INR, cannot reliably exclude residual DOAC activity. ICSH laboratory guidance · ACC laboratory testing guidance",
    );
    expect(text).toContain(
      "Liquid chromatography–tandem mass spectrometry (LC–MS/MS) is the reference method for measuring plasma drug concentration.",
    );
    expect(text).toContain("This is a proposed application of the guideline’s individual assessment.");
    expect(text).not.toContain("**");
    expect(text).not.toContain("•");
  });

  it("keeps the document structure: windows, contraindications, DOAC, assays, reperfusion", () => {
    const headings = IVT_AIS_BLOCKS.filter(
      (block): block is Extract<IvtBlock, { kind: "heading" }> => block.kind === "heading",
    );
    expect(headings.filter((block) => block.level === 2).map((block) => block.text)).toEqual([
      "Initial assessment and treatment windows",
      "Contraindications highlighted in the slides",
      "IV thrombolysis after recent DOAC intake",
      "Assess residual anticoagulant activity",
      "Reperfusion decision and documentation",
    ]);
    expect(headings.filter((block) => block.level === 3).map((block) => block.text)).toEqual([
      "Absolute contraindications",
      "Relative contraindications",
    ]);
    const tables = IVT_AIS_BLOCKS.filter((block) => block.kind === "table");
    expect(tables).toHaveLength(2);
    expect(IVT_AIS_BLOCKS.filter((block) => block.kind === "list").map((block) => block.kind === "list" ? block.items.length : 0)).toEqual([4, 4, 3]);
    const windowTable = tables[0];
    if (windowTable.kind !== "table") throw new Error("expected table");
    expect(windowTable.rows[1][1].some((run) => run.strong && run.text === "Class 2a.")).toBe(true);
    expect(windowTable.rows[3][1].some((run) => run.strong && run.text === "Class 2b.")).toBe(true);
    expect(windowTable.rows[0][0].map((run) => run.text).join("")).toBe(
      "Within 4.5 hours of onset or last known well",
    );
  });
});
