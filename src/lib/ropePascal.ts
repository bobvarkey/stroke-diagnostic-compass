/**
 * Combined RoPE and extended PASCAL.
 * Labels and the reference table are the owner's checklist wording.
 *
 * The checklist records a large shunt as present, absent, or unknown. It does
 * not ask shunt size on its own. A shunt that is not large (large shunt
 * absent) with atrial septal aneurysm absent is the Low row,
 * "Small shunt without ASA".
 */

export const ROPE_PASCAL_TITLE = "Combined RoPE and extended PASCAL";

export const ROPE_PASCAL_INTRO =
  "Use this checklist in adults with cryptogenic ischemic stroke and a confirmed patent foramen ovale (PFO). Calculate the RoPE score first, then use the PFO findings and thromboembolic history to classify how likely the PFO was related to the stroke.";

export const ROPE_PASCAL_CLOSING =
  "The original RoPE recurrence estimates describe group-level risk. For closure decisions, the pooled randomized-trial analysis evaluated the simplified three-category PASCAL system (unlikely, possible, probable). The trials did not collect the straddling-thrombus and peri-stroke DVT or PE findings used in the extended version.";

export const ROPE_SCORING_NOTE =
  "Award 1 point for each confirmed item. Add the points for one age band.";

export const PASCAL_FEATURES_NOTE =
  "Mark each finding as present, absent, or unknown.";

export const PASCAL_ASSIGNMENT_NOTE =
  "Use the highest applicable row and read across to the patient\u2019s RoPE band. The high-risk row requires both a qualifying PFO feature and temporally related DVT or PE.";

export const ROPE_STEP_TITLE = "1. Calculate the RoPE score";
export const PASCAL_FEATURES_TITLE = "2. Document the extended PASCAL features";
export const PASCAL_CATEGORY_TITLE = "3. Assign the extended PASCAL category";

export const FINDINGS_UNKNOWN_MESSAGE =
  "Cannot assign because a finding that decides the row is unknown";

export const ROPE_BAND_MISSING_MESSAGE =
  "Cannot assign until an age band sets the RoPE score";

export const AGE_BAND_NOT_SELECTED = "Age band not selected";

export const QUALIFYING_NOT_ASSIGNED = "Not assigned";

export const LOW_SHUNT_WITHOUT_ASA = "Small shunt without ASA";

export const ROPE_ITEMS = [
  { id: "noHypertension", label: "No history of hypertension" },
  { id: "noDiabetes", label: "No history of diabetes" },
  { id: "noPriorStrokeTia", label: "No prior stroke or transient ischemic attack (TIA)" },
  { id: "nonsmoker", label: "Nonsmoker" },
  { id: "corticalInfarct", label: "Cortical infarct on brain imaging" },
] as const;

export const AGE_BANDS = [
  { id: "18-29", label: "18\u201329", points: 5 },
  { id: "30-39", label: "30\u201339", points: 4 },
  { id: "40-49", label: "40\u201349", points: 3 },
  { id: "50-59", label: "50\u201359", points: 2 },
  { id: "60-69", label: "60\u201369", points: 1 },
  { id: "70-plus", label: "\u226570", points: 0 },
] as const;

export const PASCAL_FINDINGS = [
  { id: "straddlingThrombus", label: "Thrombus straddling the PFO" },
  { id: "asa", label: "Atrial septal aneurysm (ASA)" },
  { id: "largeShunt", label: "Large right-to-left shunt through the PFO" },
  {
    id: "dvtPe",
    label:
      "Deep vein thrombosis (DVT) or pulmonary embolism (PE) shortly before or at the time of the index stroke",
  },
] as const;

export const TRI_LABEL = {
  present: "Present",
  absent: "Absent",
  unknown: "Unknown",
} as const;

export const PASCAL_TABLE = [
  {
    grade: "Very high",
    findings: "Thrombus straddling the PFO",
    low: "Definite",
    high: "Definite",
  },
  {
    grade: "High",
    findings: "ASA or large shunt, plus DVT or PE around the index stroke",
    low: "Probable",
    high: "Highly probable",
  },
  {
    grade: "Medium",
    findings: "ASA or large shunt",
    low: "Possible",
    high: "Probable",
  },
  {
    grade: "Low",
    findings: LOW_SHUNT_WITHOUT_ASA,
    low: "Unlikely",
    high: "Possible",
  },
] as const;

export const LOW_ROPE_HEADER = "Low RoPE (0\u20136)";
export const HIGH_ROPE_HEADER = "High RoPE (7\u201310)";

export type RopeItemId = (typeof ROPE_ITEMS)[number]["id"];
export type AgeBandId = (typeof AGE_BANDS)[number]["id"];
export type PascalFindingId = (typeof PASCAL_FINDINGS)[number]["id"];
export type TriState = keyof typeof TRI_LABEL;
export type RopeBand = "Low" | "High";
export type PascalGrade = (typeof PASCAL_TABLE)[number]["grade"];
export type PascalInterpretation =
  | (typeof PASCAL_TABLE)[number]["low"]
  | (typeof PASCAL_TABLE)[number]["high"];

export interface RopePascalAnswers {
  rope: Partial<Record<RopeItemId, boolean>>;
  ageBand: AgeBandId | null;
  findings: Partial<Record<PascalFindingId, TriState>>;
}

export interface RopePascalResult {
  points: number;
  band: RopeBand | null;
  grade: PascalGrade | null;
  interpretation: PascalInterpretation | null;
  qualifying: readonly string[];
}

const FINDING_LABEL: Record<PascalFindingId, string> = {
  straddlingThrombus: PASCAL_FINDINGS[0].label,
  asa: PASCAL_FINDINGS[1].label,
  largeShunt: PASCAL_FINDINGS[2].label,
  dvtPe: PASCAL_FINDINGS[3].label,
};

export function emptyRopePascalAnswers(): RopePascalAnswers {
  return { rope: {}, ageBand: null, findings: {} };
}

export function ropePoints(answers: RopePascalAnswers): { points: number; band: RopeBand | null } {
  const itemPoints = ROPE_ITEMS.reduce((sum, item) => sum + (answers.rope[item.id] ? 1 : 0), 0);
  const age = AGE_BANDS.find((band) => band.id === answers.ageBand);
  const points = itemPoints + (age ? age.points : 0);
  if (!age) return { points, band: null };
  return { points, band: points >= 7 ? "High" : "Low" };
}

function finding(answers: RopePascalAnswers, id: PascalFindingId): TriState | null {
  return answers.findings[id] ?? null;
}

function interpretationFor(grade: PascalGrade, band: RopeBand | null): PascalInterpretation | null {
  const row = PASCAL_TABLE.find((entry) => entry.grade === grade);
  if (!row) return null;
  if (band === "Low") return row.low;
  if (band === "High") return row.high;
  return row.low === row.high ? row.low : null;
}

function resultFor(
  points: number,
  band: RopeBand | null,
  grade: PascalGrade,
  qualifying: readonly string[],
): RopePascalResult {
  return {
    points,
    band,
    grade,
    interpretation: interpretationFor(grade, band),
    qualifying,
  };
}

function presentFeatureLabels(asa: TriState | null, large: TriState | null, includeDvt: boolean): string[] {
  const labels: string[] = [];
  if (asa === "present") labels.push(FINDING_LABEL.asa);
  if (large === "present") labels.push(FINDING_LABEL.largeShunt);
  if (includeDvt) labels.push(FINDING_LABEL.dvtPe);
  return labels;
}

export function classifyRopePascal(answers: RopePascalAnswers): RopePascalResult {
  const { points, band } = ropePoints(answers);
  const thrombus = finding(answers, "straddlingThrombus");
  const asa = finding(answers, "asa");
  const large = finding(answers, "largeShunt");
  const dvt = finding(answers, "dvtPe");

  if (thrombus === "present") {
    return resultFor(points, band, "Very high", [FINDING_LABEL.straddlingThrombus]);
  }

  if (thrombus !== "absent") {
    return { points, band, grade: null, interpretation: null, qualifying: [] };
  }

  const asaOrLarge = asa === "present" || large === "present";
  const neitherPfoFeature = asa === "absent" && large === "absent";

  if (asaOrLarge && dvt === "present") {
    return resultFor(points, band, "High", presentFeatureLabels(asa, large, true));
  }

  if (asaOrLarge && dvt === "absent") {
    return resultFor(points, band, "Medium", presentFeatureLabels(asa, large, false));
  }

  if (neitherPfoFeature) {
    return resultFor(points, band, "Low", [LOW_SHUNT_WITHOUT_ASA]);
  }

  return { points, band, grade: null, interpretation: null, qualifying: [] };
}

export function highlightedColumns(result: RopePascalResult): Array<"low" | "high"> {
  if (!result.grade) return [];
  if (result.band === "Low") return ["low"];
  if (result.band === "High") return ["high"];
  const row = PASCAL_TABLE.find((entry) => entry.grade === result.grade);
  if (row && row.low === row.high) return ["low", "high"];
  return [];
}

export function formatRopePascalCopy(answers: RopePascalAnswers): string {
  const result = classifyRopePascal(answers);
  const age = AGE_BANDS.find((band) => band.id === answers.ageBand);
  const lines = [ROPE_PASCAL_TITLE];

  for (const item of ROPE_ITEMS) {
    if (answers.rope[item.id]) lines.push(`${item.label}: Yes`);
  }
  if (age) lines.push(`Age: ${age.label}`);

  for (const item of PASCAL_FINDINGS) {
    const value = answers.findings[item.id];
    if (value) lines.push(`${item.label}: ${TRI_LABEL[value]}`);
  }

  lines.push(`RoPE: ${result.points} / 10 (${result.band ?? AGE_BAND_NOT_SELECTED})`);
  lines.push(`Extended PASCAL: ${result.grade ?? FINDINGS_UNKNOWN_MESSAGE}`);
  lines.push(
    `Qualifying findings: ${result.grade ? result.qualifying.join("; ") : QUALIFYING_NOT_ASSIGNED}`,
  );
  lines.push(
    `Interpretation: ${
      result.interpretation ??
      (result.grade ? ROPE_BAND_MISSING_MESSAGE : FINDINGS_UNKNOWN_MESSAGE)
    }`,
  );

  return lines.join("\n");
}
