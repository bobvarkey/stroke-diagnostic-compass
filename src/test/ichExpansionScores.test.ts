import { describe, it, expect } from "vitest";
import {
  NCCT_EXPANSION_SIGNS,
  calculateSpotSignScore,
  interpretSpotSignScore,
  calculateBrainScore,
  predictedBrainGrowthPercent,
  interpretBrainScore,
  BRAIN_GROWTH_PROBABILITY_AT_0,
  BRAIN_GROWTH_PROBABILITY_AT_24,
  BRAIN_MAX_SCORE,
  type SpotSignScoreInput,
  type BrainScoreInput,
} from "@/lib/ichExpansionScores";

describe("NCCT expansion signs", () => {
  it("includes the five SNIF NCCT markers with slide wording", () => {
    expect(NCCT_EXPANSION_SIGNS.map((s) => s.sign)).toEqual([
      "Blend sign",
      "Black hole sign",
      "Island sign",
      "Swirl sign",
      "Fluid level sign",
    ]);
    expect(NCCT_EXPANSION_SIGNS[0].feature).toContain(">18 HU");
    expect(NCCT_EXPANSION_SIGNS[0].sensitivity).toBe("~39–43%");
    expect(NCCT_EXPANSION_SIGNS[1].sensitivity).toBe("~30–39%");
    expect(NCCT_EXPANSION_SIGNS[2].sensitivity).toBe("~22–52%");
    expect(NCCT_EXPANSION_SIGNS[2].feature).toContain("≥3 separate satellite");
  });
});

describe("Spot Sign Score", () => {
  const complete = (
    overrides: Partial<SpotSignScoreInput> = {},
  ): SpotSignScoreInput => ({
    spotCount: "one",
    maxAxialDimension: "lt5",
    maxAttenuation: "lt180",
    ...overrides,
  });

  it("returns null until spot count is selected", () => {
    expect(
      calculateSpotSignScore({
        spotCount: null,
        maxAxialDimension: null,
        maxAttenuation: null,
      }),
    ).toBeNull();
  });

  it("scores 0 when there is no spot sign, without needing size or density", () => {
    expect(
      calculateSpotSignScore({
        spotCount: "none",
        maxAxialDimension: null,
        maxAttenuation: null,
      }),
    ).toBe(0);
  });

  it("returns null for a present spot until size and attenuation are selected", () => {
    expect(
      calculateSpotSignScore({
        spotCount: "one",
        maxAxialDimension: null,
        maxAttenuation: "lt180",
      }),
    ).toBeNull();
  });

  it("awards 0 for a single small hypoattenuating spot", () => {
    expect(calculateSpotSignScore(complete())).toBe(0);
  });

  it("awards 1 for multiple spots only", () => {
    expect(calculateSpotSignScore(complete({ spotCount: "twoOrMore" }))).toBe(1);
  });

  it("awards 1 for a larger single spot only", () => {
    expect(calculateSpotSignScore(complete({ maxAxialDimension: "gte5" }))).toBe(1);
  });

  it("awards 1 for a denser single spot only", () => {
    expect(calculateSpotSignScore(complete({ maxAttenuation: "gte180" }))).toBe(1);
  });

  it("awards 2 for two high-risk features", () => {
    expect(
      calculateSpotSignScore(
        complete({ spotCount: "twoOrMore", maxAxialDimension: "gte5" }),
      ),
    ).toBe(2);
  });

  it("awards 3 when all high-risk features are present", () => {
    expect(
      calculateSpotSignScore(
        complete({
          spotCount: "twoOrMore",
          maxAxialDimension: "gte5",
          maxAttenuation: "gte180",
        }),
      ),
    ).toBe(3);
  });

  it("interprets 2–3 as highest mortality / poor-outcome risk", () => {
    expect(interpretSpotSignScore(2)).toMatch(/highest risk of in-hospital mortality/i);
    expect(interpretSpotSignScore(3)).toMatch(/3\/3/);
  });
});

describe("BRAIN Score", () => {
  const complete = (overrides: Partial<BrainScoreInput> = {}): BrainScoreInput => ({
    baselineVolume: "le10",
    recurrentIch: false,
    warfarinAtOnset: false,
    intraventricularExtension: false,
    hoursToBaselineCt: "gt5",
    ...overrides,
  });

  it("returns null until every component is selected", () => {
    expect(
      calculateBrainScore({
        baselineVolume: "le10",
        recurrentIch: false,
        warfarinAtOnset: false,
        intraventricularExtension: false,
        hoursToBaselineCt: null,
      }),
    ).toBeNull();
  });

  it("scores 0 when every component is in the lowest-risk category", () => {
    expect(calculateBrainScore(complete())).toBe(0);
  });

  it("assigns volume points: ≤10 = 0, 10–20 = 5, >20 = 7", () => {
    expect(calculateBrainScore(complete({ baselineVolume: "le10" }))).toBe(0);
    expect(calculateBrainScore(complete({ baselineVolume: "from10to20" }))).toBe(5);
    expect(calculateBrainScore(complete({ baselineVolume: "gt20" }))).toBe(7);
  });

  it("assigns +4 for recurrent ICH, +6 for warfarin, +2 for IVH", () => {
    expect(calculateBrainScore(complete({ recurrentIch: true }))).toBe(4);
    expect(calculateBrainScore(complete({ warfarinAtOnset: true }))).toBe(6);
    expect(calculateBrainScore(complete({ intraventricularExtension: true }))).toBe(2);
  });

  it("assigns hours-to-CT points from >5 h = 0 through ≤1 h = 5", () => {
    expect(calculateBrainScore(complete({ hoursToBaselineCt: "gt5" }))).toBe(0);
    expect(calculateBrainScore(complete({ hoursToBaselineCt: "from4to5" }))).toBe(1);
    expect(calculateBrainScore(complete({ hoursToBaselineCt: "from3to4" }))).toBe(2);
    expect(calculateBrainScore(complete({ hoursToBaselineCt: "from2to3" }))).toBe(3);
    expect(calculateBrainScore(complete({ hoursToBaselineCt: "from1to2" }))).toBe(4);
    expect(calculateBrainScore(complete({ hoursToBaselineCt: "le1" }))).toBe(5);
  });

  it("sums to 24 at maximum risk", () => {
    expect(
      calculateBrainScore(
        complete({
          baselineVolume: "gt20",
          recurrentIch: true,
          warfarinAtOnset: true,
          intraventricularExtension: true,
          hoursToBaselineCt: "le1",
        }),
      ),
    ).toBe(BRAIN_MAX_SCORE);
  });

  it("maps score 0 to 3.4% and score 24 to 85.8% predicted growth", () => {
    expect(predictedBrainGrowthPercent(0)).toBe(BRAIN_GROWTH_PROBABILITY_AT_0);
    expect(predictedBrainGrowthPercent(24)).toBe(BRAIN_GROWTH_PROBABILITY_AT_24);
  });

  it("increases predicted probability as the score rises", () => {
    const p0 = predictedBrainGrowthPercent(0);
    const p12 = predictedBrainGrowthPercent(12);
    const p24 = predictedBrainGrowthPercent(24);
    expect(p12).toBeGreaterThan(p0);
    expect(p24).toBeGreaterThan(p12);
  });

  it("includes the predicted percent in the interpretation string", () => {
    expect(interpretBrainScore(0)).toContain("3.4%");
    expect(interpretBrainScore(24)).toContain("85.8%");
  });
});
