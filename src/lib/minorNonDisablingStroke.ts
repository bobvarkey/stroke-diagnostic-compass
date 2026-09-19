/**
 * Minor non-disabling stroke definition and treatment guidance.
 * Wording follows the supplied guideline slide (source of truth).
 * Do not add doses, durations, or outcome numbers that are not on the slide.
 */

export const MINOR_NON_DISABLING_STROKE = {
  title: "Minor Non-Disabling Stroke",
  nihssThresholdLabel: "NIHSS < 5",
  nihssThresholdExclusive: 5,
  nihssCaveat:
    "A low NIHSS score alone does not establish that a stroke is non-disabling.",
  assessEverydayFunctionHeading: "Assess everyday function",
  coreQuestion:
    "Would the persisting deficit prevent independent daily activities or return to work?",
  baselineNote: "Assess disability relative to baseline function and usual roles.",
  bathe: [
    { letter: "B", word: "Bathing" },
    { letter: "A", word: "Ambulation" },
    { letter: "T", word: "Toileting" },
    { letter: "H", word: "Hygiene" },
    { letter: "E", word: "Eating" },
  ],
  guidelineHeading: "Guideline recommendation: within 4.5 hours",
  guidelineWindowHours: 4.5,
  guidelinePopulation:
    "Eligible adults with acute ischemic stroke and mild non-disabling deficits, within 4.5 hours of symptom onset or last known well.",
  guidelineExample: "Isolated sensory syndrome in many cases.",
  ivt: {
    heading: "IV thrombolysis is NOT recommended",
    rationale:
      "It has not shown superiority over DAPT in improving functional outcomes.",
    classOfRecommendation: "3",
    classLabel: "No Benefit",
    levelOfEvidence: "B-R",
  },
  dapt: {
    heading: "DAPT is preferred",
    statement:
      "Dual antiplatelet therapy is preferred for eligible patients with minor non-disabling stroke.",
  },
  preTreatment:
    "Confirm antiplatelet eligibility and exclude hemorrhage before treatment.",
  scope:
    "This recommendation applies to non-disabling deficits. Mild but disabling deficits require a separate reperfusion assessment.",
  batheLimitation: "BATHE is a memory aid, not a complete disability assessment.",
  abbreviations: {
    IVT: "intravenous thrombolysis",
    DAPT: "dual antiplatelet therapy",
  },
  footer: "Recommendation transcribed from supplied guideline slide.",
} as const;

export type BatheItem = (typeof MINOR_NON_DISABLING_STROKE.bathe)[number];

export function formatIvtClassEvidence(
  ivt: Pick<
    typeof MINOR_NON_DISABLING_STROKE.ivt,
    "classOfRecommendation" | "classLabel" | "levelOfEvidence"
  > = MINOR_NON_DISABLING_STROKE.ivt,
): string {
  return `Class ${ivt.classOfRecommendation}: ${ivt.classLabel} · Level of evidence: ${ivt.levelOfEvidence}`;
}

export function formatAbbreviations(
  abbreviations: Record<string, string> = MINOR_NON_DISABLING_STROKE.abbreviations,
): string {
  return Object.entries(abbreviations)
    .map(([abbr, expansion]) => `${abbr}: ${expansion}`)
    .join(" · ");
}
