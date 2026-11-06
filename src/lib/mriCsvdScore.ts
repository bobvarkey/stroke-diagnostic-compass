export type Grade = 0 | 1 | 2 | 3 | null;
export interface MriCsvdInputs {
  periventricularFazekas: Grade;
  deepFazekas: Grade;
  studyFazekas: Grade;
  lacunes: number | null;
  gca: Grade;
  epvs: number | null;
  epvsRegion: string;
  epvsProtocolVerified: boolean;
  microbleeds: number | null;
  microbleedDistribution: "none" | "strictly_lobar" | "deep" | "mixed" | "infratentorial" | "unknown";
}
export const emptyMriCsvdInputs: MriCsvdInputs = {
  periventricularFazekas: null, deepFazekas: null, studyFazekas: null,
  lacunes: null, gca: null, epvs: null, epvsRegion: "", epvsProtocolVerified: false,
  microbleeds: null, microbleedDistribution: "unknown",
};
export const markerNames = {
  wmh: "White matter hyperintensities", lacunes: "Chronic lacunes",
  atrophy: "Global cortical atrophy", epvs: "Enlarged perivascular spaces", microbleeds: "Cerebral microbleeds",
};
export const csvdSafety = {
  evtExclusionAllowed: false,
  delayReperfusionAllowed: false,
  absoluteRiskAvailable: false,
  validatedRiskCategories: false,
};
export function calculateMriCsvd(input: MriCsvdInputs) {
  const errors: string[] = [];
  const grade = (value: Grade, label: string) => {
    if (value === null) return null;
    if (![0, 1, 2, 3].includes(value)) { errors.push(`${label}: grade must be 0–3.`); return null; }
    return value >= 2 ? 1 : 0;
  };
  const count = (value: number | null, label: string, threshold: number) => {
    if (value === null) return null;
    if (!Number.isSafeInteger(value) || value < 0) { errors.push(`${label}: count must be a non-negative integer.`); return null; }
    return value >= threshold ? 1 : 0;
  };
  grade(input.periventricularFazekas, "Periventricular Fazekas");
  grade(input.deepFazekas, "Deep Fazekas");
  const epvsPoint = count(input.epvs, "EPVS", 11);
  const components: Record<keyof typeof markerNames, number | null> = {
    wmh: grade(input.studyFazekas, "Study Fazekas"),
    lacunes: count(input.lacunes, "Lacunes", 1),
    atrophy: grade(input.gca, "Pasquier GCA"),
    epvs: input.epvsProtocolVerified && input.epvsRegion.trim() ? epvsPoint : null,
    microbleeds: count(input.microbleeds, "Microbleeds", 1),
  };
  const missing = (Object.keys(components) as (keyof typeof markerNames)[]).filter(key => components[key] === null);
  const observedScore = Object.values(components).reduce<number>((sum, point) => sum + (point ?? 0), 0);
  return { components, missing, observedScore, assessed: 5 - missing.length,
    totalScore: missing.length === 0 && errors.length === 0 ? observedScore : null,
    status: errors.length ? "invalid" : missing.length ? "incomplete" : "complete", errors };
}
export function buildMriCsvdReport(input: MriCsvdInputs) {
  return { scoreId: "GOULART_2026_MRI_CSVD_5", name: "MRI-Defined CSVD Brain Frailty Burden Score",
    generatedAt: new Date().toISOString(), rawInputs: { ...input }, ...calculateMriCsvd(input),
    thresholdVerification: "Provisional thresholds from supplied document; full methods require verification.",
    reference: { doi: "10.1177/17474930261490798", pmid: "42728583" },
    safety: csvdSafety,
    disclaimer: "Research use; external validation required. Never exclude patients from thrombectomy, delay reperfusion or infer futility from this score. No calibrated absolute risk or validated risk strata." };
}
export function mriCsvdReportText(input: MriCsvdInputs) {
  const report = buildMriCsvdReport(input);
  return [report.name, `Status: ${report.status}`,
    report.totalScore === null ? `Incomplete: observed ${report.observedScore} points across ${report.assessed}/5 assessed markers (not a total score).` : `Total CSVD score: ${report.totalScore}/5.`,
    ...Object.entries(report.components).map(([key, point]) => `${markerNames[key as keyof typeof markerNames]}: ${point ?? "not assessed"}`),
    `Missing: ${report.missing.map(key => markerNames[key]).join(", ") || "none"}`,
    `Raw imaging inputs: ${JSON.stringify(input)}`, ...report.errors,
    "Increasing burden reflects chronic cerebral injury; the supplied study reports adjusted odds, not patient-level probabilities.",
    report.thresholdVerification, `DOI: ${report.reference.doi}; PMID: ${report.reference.pmid}`, report.disclaimer].join("\n");
}