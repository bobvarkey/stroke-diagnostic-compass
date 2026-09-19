import { describe, it, expect } from "vitest";
import {
  MINOR_NON_DISABLING_STROKE,
  formatAbbreviations,
  formatIvtClassEvidence,
} from "@/lib/minorNonDisablingStroke";

describe("minor non-disabling stroke slide content", () => {
  const c = MINOR_NON_DISABLING_STROKE;

  it("uses NIHSS < 5 as the framing threshold, not a standalone rule", () => {
    expect(c.nihssThresholdLabel).toBe("NIHSS < 5");
    expect(c.nihssThresholdExclusive).toBe(5);
    expect(c.nihssCaveat).toBe(
      "A low NIHSS score alone does not establish that a stroke is non-disabling.",
    );
  });

  it("defines BATHE as Bathing, Ambulation, Toileting, Hygiene, Eating", () => {
    expect(c.bathe.map((item) => `${item.letter}${item.word}`)).toEqual([
      "BBathing",
      "AAmbulation",
      "TToileting",
      "HHygiene",
      "EEating",
    ]);
  });

  it("asks whether the persisting deficit would block independent ADLs or work", () => {
    expect(c.coreQuestion).toContain("independent daily activities");
    expect(c.coreQuestion).toContain("return to work");
    expect(c.baselineNote).toContain("baseline function");
    expect(c.baselineNote).toContain("usual roles");
  });

  it("limits the 4.5-hour recommendation to mild non-disabling deficits", () => {
    expect(c.guidelineWindowHours).toBe(4.5);
    expect(c.guidelinePopulation).toContain("acute ischemic stroke");
    expect(c.guidelinePopulation).toContain("mild non-disabling deficits");
    expect(c.guidelinePopulation).toContain("4.5 hours");
    expect(c.guidelineExample.toLowerCase()).toContain("isolated sensory syndrome");
  });

  it("records IVT as Class 3 No Benefit (B-R) and DAPT as preferred", () => {
    expect(c.ivt.heading).toMatch(/NOT recommended/i);
    expect(c.ivt.classOfRecommendation).toBe("3");
    expect(c.ivt.classLabel).toBe("No Benefit");
    expect(c.ivt.levelOfEvidence).toBe("B-R");
    expect(c.ivt.rationale).toContain("has not shown superiority over DAPT");
    expect(c.dapt.heading).toMatch(/DAPT is preferred/i);
    expect(c.dapt.statement).toContain("Dual antiplatelet therapy");
    expect(formatIvtClassEvidence()).toBe("Class 3: No Benefit · Level of evidence: B-R");
  });

  it("keeps pretreatment, scope, BATHE limitation, and abbreviations from the slide", () => {
    expect(c.preTreatment).toContain("antiplatelet eligibility");
    expect(c.preTreatment).toContain("exclude hemorrhage");
    expect(c.scope).toContain("non-disabling deficits");
    expect(c.scope).toContain("separate reperfusion assessment");
    expect(c.batheLimitation).toContain("memory aid");
    expect(c.abbreviations.IVT).toBe("intravenous thrombolysis");
    expect(c.abbreviations.DAPT).toBe("dual antiplatelet therapy");
    expect(formatAbbreviations()).toBe(
      "IVT: intravenous thrombolysis · DAPT: dual antiplatelet therapy",
    );
    expect(c.footer).toBe("Recommendation transcribed from supplied guideline slide.");
  });

  it("does not invent unsupported doses, durations, or outcome numbers", () => {
    const serialized = JSON.stringify(c);
    expect(serialized).not.toMatch(/\d+\s*mg/i);
    expect(serialized).not.toMatch(/21[-–]90/);
    expect(serialized).not.toMatch(/NNT/i);
  });
});
