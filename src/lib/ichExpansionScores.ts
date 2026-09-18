/**
 * Hematoma-expansion imaging scores for spontaneous ICH.
 * Wording and point values follow SNIF teaching slides (source of truth).
 */

export const HEMATOMA_EXPANSION_DEFINITION = {
  summary:
    "Growth of hematoma volume on follow-up imaging compared with the baseline CT.",
  absoluteIncreaseMl: 6,
  relativeIncreasePercent: 33,
  timing:
    "Occurs between baseline CT and a repeat scan, typically within 24 hours of onset.",
} as const;

export const NCCT_EXPANSION_SIGNS = [
  {
    sign: "Blend sign",
    feature: "Hypodensity touching hematoma margin, >18 HU difference",
    sensitivity: "~39–43%",
  },
  {
    sign: "Black hole sign",
    feature: "Hypodensity fully encapsulated within hematoma",
    sensitivity: "~30–39%",
  },
  {
    sign: "Island sign",
    feature: "≥3 separate satellite hematomas or ≥4 bubble protrusions",
    sensitivity: "~22–52%",
  },
  {
    sign: "Swirl sign",
    feature: "Unretracted low-attenuation blood within the clot",
    sensitivity: "Variable — mainly studied in trauma",
  },
  {
    sign: "Fluid level sign",
    feature: "Gravity-dependent density layering",
    sensitivity: "Case-based; linked to coagulopathy",
  },
] as const;

export const NCCT_SIGNS_NOTE =
  "Specificity for most NCCT signs is high (often >85–95%), but sensitivity is more modest — best used to rule in high-risk patients, not to rule out risk.";

/** CTA spot-sign composite: 0–3 points (one point per high-risk feature). */
export type SpotCountCategory = "none" | "one" | "twoOrMore";
export type SpotSizeCategory = "lt5" | "gte5";
export type SpotAttenuationCategory = "lt180" | "gte180";

export interface SpotSignScoreInput {
  spotCount: SpotCountCategory | null;
  maxAxialDimension: SpotSizeCategory | null;
  maxAttenuation: SpotAttenuationCategory | null;
}

export function calculateSpotSignScore(input: SpotSignScoreInput): number | null {
  if (input.spotCount === null) return null;
  if (input.spotCount === "none") return 0;
  if (input.maxAxialDimension === null || input.maxAttenuation === null) return null;

  let score = 0;
  if (input.spotCount === "twoOrMore") score += 1;
  if (input.maxAxialDimension === "gte5") score += 1;
  if (input.maxAttenuation === "gte180") score += 1;
  return score;
}

export function interpretSpotSignScore(score: number | null): string {
  if (score === null) return "Select CTA spot-sign features to score.";
  if (score === 0) {
    return "Score 0/3 — lowest composite CTA risk (no spot, or a single small, less dense spot).";
  }
  if (score === 1) {
    return "Score 1/3 — intermediate CTA risk features.";
  }
  return `Score ${score}/3 — highest risk of in-hospital mortality and poor outcome among survivors.`;
}

/** BRAIN score: 0–24 points predicting ICH growth at 24 hours. */
export type BrainVolumeCategory = "le10" | "from10to20" | "gt20";
export type BrainHoursToCtCategory = "gt5" | "from4to5" | "from3to4" | "from2to3" | "from1to2" | "le1";

export interface BrainScoreInput {
  baselineVolume: BrainVolumeCategory | null;
  recurrentIch: boolean | null;
  warfarinAtOnset: boolean | null;
  intraventricularExtension: boolean | null;
  hoursToBaselineCt: BrainHoursToCtCategory | null;
}

export const BRAIN_VOLUME_POINTS: Record<BrainVolumeCategory, number> = {
  le10: 0,
  from10to20: 5,
  gt20: 7,
};

/**
 * Hours from onset to baseline CT: slide shows >5 h → 0 points through ≤1 h → 5 points.
 * Intermediate 1-hour bins are the published BRAIN cut-points that produce that 0→5 range.
 */
export const BRAIN_HOURS_POINTS: Record<BrainHoursToCtCategory, number> = {
  gt5: 0,
  from4to5: 1,
  from3to4: 2,
  from2to3: 3,
  from1to2: 4,
  le1: 5,
};

export const BRAIN_RECURRENT_ICH_POINTS = 4;
export const BRAIN_WARFARIN_POINTS = 6;
export const BRAIN_IVH_POINTS = 2;
export const BRAIN_MAX_SCORE = 24;

/** Slide-stated endpoints: 3.4% at score 0, 85.8% at score 24. */
export const BRAIN_GROWTH_PROBABILITY_AT_0 = 3.4;
export const BRAIN_GROWTH_PROBABILITY_AT_24 = 85.8;

export function calculateBrainScore(input: BrainScoreInput): number | null {
  if (
    input.baselineVolume === null ||
    input.recurrentIch === null ||
    input.warfarinAtOnset === null ||
    input.intraventricularExtension === null ||
    input.hoursToBaselineCt === null
  ) {
    return null;
  }

  return (
    BRAIN_VOLUME_POINTS[input.baselineVolume] +
    (input.recurrentIch ? BRAIN_RECURRENT_ICH_POINTS : 0) +
    (input.warfarinAtOnset ? BRAIN_WARFARIN_POINTS : 0) +
    (input.intraventricularExtension ? BRAIN_IVH_POINTS : 0) +
    BRAIN_HOURS_POINTS[input.hoursToBaselineCt]
  );
}

function logit(p: number): number {
  return Math.log(p / (1 - p));
}

/**
 * Logistic interpolation anchored to the slide endpoints (3.4% at 0, 85.8% at 24).
 * Returns a percentage rounded to 1 decimal place.
 */
export function predictedBrainGrowthPercent(score: number): number {
  const p0 = BRAIN_GROWTH_PROBABILITY_AT_0 / 100;
  const p24 = BRAIN_GROWTH_PROBABILITY_AT_24 / 100;
  const intercept = logit(p0);
  const slope = (logit(p24) - intercept) / BRAIN_MAX_SCORE;
  const p = 1 / (1 + Math.exp(-(intercept + slope * score)));
  return Math.round(p * 1000) / 10;
}

export function interpretBrainScore(score: number | null): string {
  if (score === null) return "Complete all BRAIN components to estimate 24-hour growth risk.";
  const pct = predictedBrainGrowthPercent(score);
  return `BRAIN ${score}/${BRAIN_MAX_SCORE} — predicted probability of ICH growth at 24 hours ≈ ${pct}%.`;
}
