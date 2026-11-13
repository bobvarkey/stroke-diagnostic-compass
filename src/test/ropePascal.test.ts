import { describe, expect, it } from "vitest";
import {
  AGE_BANDS,
  AGE_BAND_NOT_SELECTED,
  FINDINGS_UNKNOWN_MESSAGE,
  HIGH_ROPE_HEADER,
  LOW_ROPE_HEADER,
  LOW_SHUNT_WITHOUT_ASA,
  PASCAL_ASSIGNMENT_NOTE,
  PASCAL_FEATURES_NOTE,
  PASCAL_FINDINGS,
  PASCAL_TABLE,
  QUALIFYING_NOT_ASSIGNED,
  ROPE_BAND_MISSING_MESSAGE,
  ROPE_ITEMS,
  ROPE_PASCAL_CLOSING,
  ROPE_PASCAL_INTRO,
  ROPE_PASCAL_TITLE,
  ROPE_SCORING_NOTE,
  classifyRopePascal,
  formatRopePascalCopy,
  highlightedColumns,
  ropePoints,
  type AgeBandId,
  type PascalFindingId,
  type RopeItemId,
  type RopePascalAnswers,
  type TriState,
} from "@/lib/ropePascal";

const ASA = PASCAL_FINDINGS[1].label;
const LARGE = PASCAL_FINDINGS[2].label;
const DVT = PASCAL_FINDINGS[3].label;
const THROMBUS = PASCAL_FINDINGS[0].label;

function answers(options: {
  checks?: number | RopeItemId[];
  age?: AgeBandId | null;
  findings?: Partial<Record<PascalFindingId, TriState>>;
}): RopePascalAnswers {
  const rope: RopePascalAnswers["rope"] = {};
  if (typeof options.checks === "number") {
    ROPE_ITEMS.slice(0, options.checks).forEach((item) => {
      rope[item.id] = true;
    });
  } else {
    options.checks?.forEach((id) => {
      rope[id] = true;
    });
  }
  return {
    rope,
    ageBand: options.age ?? null,
    findings: options.findings ?? {},
  };
}

describe("RoPE score", () => {
  it("awards 1 point for each confirmed item and the selected age band", () => {
    expect(AGE_BANDS.map((band) => [band.label, band.points])).toEqual([
      ["18\u201329", 5],
      ["30\u201339", 4],
      ["40\u201349", 3],
      ["50\u201359", 2],
      ["60\u201369", 1],
      ["\u226570", 0],
    ]);

    for (const band of AGE_BANDS) {
      expect(ropePoints(answers({ age: band.id })).points).toBe(band.points);
      expect(ropePoints(answers({ checks: 5, age: band.id })).points).toBe(5 + band.points);
    }
  });

  it("bands 0–6 as Low and 7–10 as High, and withholds the band until an age is selected", () => {
    expect(ropePoints(answers({ checks: 5, age: "60-69" }))).toEqual({ points: 6, band: "Low" });
    expect(ropePoints(answers({ checks: 5, age: "50-59" }))).toEqual({ points: 7, band: "High" });
    expect(ropePoints(answers({ checks: 4, age: "50-59" }))).toEqual({ points: 6, band: "Low" });
    expect(ropePoints(answers({ age: "70-plus" }))).toEqual({ points: 0, band: "Low" });
    expect(ropePoints(answers({ checks: 5, age: "18-29" }))).toEqual({ points: 10, band: "High" });
    expect(ropePoints(answers({ checks: 5 }))).toEqual({ points: 5, band: null });
  });
});

describe("extended PASCAL category", () => {
  const rows = [
    {
      grade: "Very high" as const,
      low: "Definite",
      high: "Definite",
      findings: { straddlingThrombus: "present" as const },
      qualifying: [THROMBUS],
    },
    {
      grade: "High" as const,
      low: "Probable",
      high: "Highly probable",
      findings: { straddlingThrombus: "absent" as const, asa: "present" as const, largeShunt: "absent" as const, dvtPe: "present" as const },
      qualifying: [ASA, DVT],
    },
    {
      grade: "Medium" as const,
      low: "Possible",
      high: "Probable",
      findings: { straddlingThrombus: "absent" as const, asa: "absent" as const, largeShunt: "present" as const, dvtPe: "absent" as const },
      qualifying: [LARGE],
    },
    {
      grade: "Low" as const,
      low: "Unlikely",
      high: "Possible",
      findings: { straddlingThrombus: "absent" as const, asa: "absent" as const, largeShunt: "absent" as const, dvtPe: "absent" as const },
      qualifying: [LOW_SHUNT_WITHOUT_ASA],
    },
  ];

  it("keeps the reference table verbatim", () => {
    expect(PASCAL_TABLE.map((row) => [row.grade, row.findings, row.low, row.high])).toEqual([
      ["Very high", "Thrombus straddling the PFO", "Definite", "Definite"],
      ["High", "ASA or large shunt, plus DVT or PE around the index stroke", "Probable", "Highly probable"],
      ["Medium", "ASA or large shunt", "Possible", "Probable"],
      ["Low", LOW_SHUNT_WITHOUT_ASA, "Unlikely", "Possible"],
    ]);
    expect(LOW_ROPE_HEADER).toBe("Low RoPE (0\u20136)");
    expect(HIGH_ROPE_HEADER).toBe("High RoPE (7\u201310)");
    expect(ROPE_ITEMS.map((item) => item.label)).toEqual([
      "No history of hypertension",
      "No history of diabetes",
      "No prior stroke or transient ischemic attack (TIA)",
      "Nonsmoker",
      "Cortical infarct on brain imaging",
    ]);
    expect(ROPE_PASCAL_INTRO).toBe(
      "Use this checklist in adults with cryptogenic ischemic stroke and a confirmed patent foramen ovale (PFO). Calculate the RoPE score first, then use the PFO findings and thromboembolic history to classify how likely the PFO was related to the stroke.",
    );
    expect(ROPE_PASCAL_CLOSING).toBe(
      "The original RoPE recurrence estimates describe group-level risk. For closure decisions, the pooled randomized-trial analysis evaluated the simplified three-category PASCAL system (unlikely, possible, probable). The trials did not collect the straddling-thrombus and peri-stroke DVT or PE findings used in the extended version.",
    );
    expect(ROPE_SCORING_NOTE).toBe("Award 1 point for each confirmed item. Add the points for one age band.");
    expect(PASCAL_FEATURES_NOTE).toBe("Mark each finding as present, absent, or unknown.");
    expect(PASCAL_ASSIGNMENT_NOTE).toBe(
      "Use the highest applicable row and read across to the patient\u2019s RoPE band. The high-risk row requires both a qualifying PFO feature and temporally related DVT or PE.",
    );
  });

  it.each(rows)("reads $grade across both RoPE bands", (row) => {
    const low = classifyRopePascal(answers({ age: "70-plus", findings: row.findings }));
    expect(low.band).toBe("Low");
    expect(low.grade).toBe(row.grade);
    expect(low.interpretation).toBe(row.low);
    expect(low.qualifying).toEqual(row.qualifying);
    expect(highlightedColumns(low)).toEqual(["low"]);

    const high = classifyRopePascal(answers({ checks: 5, age: "18-29", findings: row.findings }));
    expect(high.points).toBe(10);
    expect(high.band).toBe("High");
    expect(high.grade).toBe(row.grade);
    expect(high.interpretation).toBe(row.high);
    expect(high.qualifying).toEqual(row.qualifying);
    expect(highlightedColumns(high)).toEqual(["high"]);
  });

  it("uses the highest row, and treats a non-large shunt without ASA as the Low row", () => {
    const overridden = classifyRopePascal(answers({
      age: "40-49",
      findings: {
        straddlingThrombus: "present",
        asa: "present",
        largeShunt: "present",
        dvtPe: "present",
      },
    }));
    expect(overridden.grade).toBe("Very high");
    expect(overridden.interpretation).toBe("Definite");
    expect(overridden.qualifying).toEqual([THROMBUS]);

    const bothFeatures = classifyRopePascal(answers({
      checks: 5,
      age: "18-29",
      findings: {
        straddlingThrombus: "absent",
        asa: "present",
        largeShunt: "present",
        dvtPe: "present",
      },
    }));
    expect(bothFeatures.grade).toBe("High");
    expect(bothFeatures.interpretation).toBe("Highly probable");
    expect(bothFeatures.qualifying).toEqual([ASA, LARGE, DVT]);

    const asaOnly = classifyRopePascal(answers({
      age: "70-plus",
      findings: { straddlingThrombus: "absent", asa: "present", largeShunt: "unknown", dvtPe: "absent" },
    }));
    expect(asaOnly.grade).toBe("Medium");
    expect(asaOnly.interpretation).toBe("Possible");
    expect(asaOnly.qualifying).toEqual([ASA]);

    const dvtWithoutPfoFeature = classifyRopePascal(answers({
      checks: 5,
      age: "50-59",
      findings: { straddlingThrombus: "absent", asa: "absent", largeShunt: "absent", dvtPe: "present" },
    }));
    expect(dvtWithoutPfoFeature.points).toBe(7);
    expect(dvtWithoutPfoFeature.grade).toBe("Low");
    expect(dvtWithoutPfoFeature.interpretation).toBe("Possible");
    expect(dvtWithoutPfoFeature.qualifying).toEqual([LOW_SHUNT_WITHOUT_ASA]);

    const lowDespiteUnknownDvt = classifyRopePascal(answers({
      age: "60-69",
      checks: 5,
      findings: { straddlingThrombus: "absent", asa: "absent", largeShunt: "absent", dvtPe: "unknown" },
    }));
    expect(lowDespiteUnknownDvt.points).toBe(6);
    expect(lowDespiteUnknownDvt.grade).toBe("Low");
    expect(lowDespiteUnknownDvt.interpretation).toBe("Unlikely");
  });

  it("does not guess a row when an unknown finding could change it", () => {
    const cases: Array<Partial<Record<PascalFindingId, TriState>>> = [
      {},
      { straddlingThrombus: "unknown", asa: "absent", largeShunt: "absent", dvtPe: "absent" },
      { straddlingThrombus: "absent", asa: "unknown", largeShunt: "absent", dvtPe: "absent" },
      { straddlingThrombus: "absent", asa: "absent", largeShunt: "unknown", dvtPe: "absent" },
      { straddlingThrombus: "absent", asa: "present", largeShunt: "absent", dvtPe: "unknown" },
      { straddlingThrombus: "absent", asa: "unknown", largeShunt: "unknown", dvtPe: "present" },
    ];

    for (const findings of cases) {
      const result = classifyRopePascal(answers({ checks: 5, age: "18-29", findings }));
      expect(result.grade).toBeNull();
      expect(result.interpretation).toBeNull();
      expect(result.qualifying).toEqual([]);
      expect(highlightedColumns(result)).toEqual([]);
    }
  });

  it("still reads Definite for straddling thrombus when the other findings or the age band are unknown", () => {
    const result = classifyRopePascal(answers({
      checks: 2,
      findings: { straddlingThrombus: "present", asa: "unknown", largeShunt: "unknown", dvtPe: "unknown" },
    }));
    expect(result.points).toBe(2);
    expect(result.band).toBeNull();
    expect(result.grade).toBe("Very high");
    expect(result.interpretation).toBe("Definite");
    expect(highlightedColumns(result)).toEqual(["low", "high"]);
  });

  it("keeps the risk grade when the RoPE band is not yet known and the two cells differ", () => {
    const result = classifyRopePascal(answers({
      findings: { straddlingThrombus: "absent", asa: "present", largeShunt: "absent", dvtPe: "present" },
    }));
    expect(result.band).toBeNull();
    expect(result.grade).toBe("High");
    expect(result.interpretation).toBeNull();
    expect(highlightedColumns(result)).toEqual([]);
  });
});

describe("copy", () => {
  it("copies the scale name, answered items, and the summary lines", () => {
    const text = formatRopePascalCopy(answers({
      checks: ["noHypertension", "corticalInfarct"],
      age: "40-49",
      findings: {
        straddlingThrombus: "absent",
        asa: "present",
        largeShunt: "absent",
        dvtPe: "present",
      },
    }));

    expect(text).toBe(
      [
        ROPE_PASCAL_TITLE,
        "No history of hypertension: Yes",
        "Cortical infarct on brain imaging: Yes",
        "Age: 40\u201349",
        "Thrombus straddling the PFO: Absent",
        `${ASA}: Present`,
        `${LARGE}: Absent`,
        `${DVT}: Present`,
        "RoPE: 5 / 10 (Low)",
        "Extended PASCAL: High",
        `Qualifying findings: ${ASA}; ${DVT}`,
        "Interpretation: Probable",
      ].join("\n"),
    );
    expect(text).not.toContain("No history of diabetes");
    expect(text).not.toContain("Nonsmoker");
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toMatch(/[*_`#]|[\u{1F300}-\u{1FAFF}]/u);
  });

  it("includes an answered Unknown and says the category cannot be assigned", () => {
    const text = formatRopePascalCopy(answers({
      findings: { straddlingThrombus: "unknown" },
    }));

    expect(text).toBe(
      [
        ROPE_PASCAL_TITLE,
        "Thrombus straddling the PFO: Unknown",
        `RoPE: 0 / 10 (${AGE_BAND_NOT_SELECTED})`,
        `Extended PASCAL: ${FINDINGS_UNKNOWN_MESSAGE}`,
        `Qualifying findings: ${QUALIFYING_NOT_ASSIGNED}`,
        `Interpretation: ${FINDINGS_UNKNOWN_MESSAGE}`,
      ].join("\n"),
    );
  });

  it("names the risk grade and withholds the cell when the age band is missing", () => {
    const text = formatRopePascalCopy(answers({
      checks: 1,
      findings: { straddlingThrombus: "absent", asa: "absent", largeShunt: "present", dvtPe: "absent" },
    }));

    expect(text).toContain("No history of hypertension: Yes");
    expect(text).toContain("RoPE: 1 / 10 (Age band not selected)");
    expect(text).toContain("Extended PASCAL: Medium");
    expect(text).toContain(`Qualifying findings: ${LARGE}`);
    expect(text).toContain(`Interpretation: ${ROPE_BAND_MISSING_MESSAGE}`);
    expect(text.endsWith(`Interpretation: ${ROPE_BAND_MISSING_MESSAGE}`)).toBe(true);
  });
});
