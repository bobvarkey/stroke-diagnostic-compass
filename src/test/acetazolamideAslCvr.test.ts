import { describe, expect, it } from "vitest";
import {
  APPROVED_ORAL_PEDIATRIC_CAP_MG,
  APPROVED_ORAL_PEDIATRIC_DOSE_MG_PER_KG,
  ASL_CVR_EVIDENCE_SCOPE,
  ASL_CVR_REFERENCES,
  ASL_CVR_STATUS_LABEL,
  ASL_CVR_TITLE,
  AUTOMATIC_GRADE_ENABLED,
  CRUSH_EVIDENCE_NOTE,
  DOSE_EVIDENCE_NOTE,
  HISTORICAL_TYPE_LABELS,
  ILLUSTRATIVE_REFERENCE_NOTES,
  REPORTABLE_PATTERNS,
  SCREENING_ITEMS,
  TIMING_EVIDENCE_NOTE,
  calculateCvrPercent,
  formatAslCvrCopy,
  formatCvrPercent,
  parseCbfInput,
} from "@/lib/acetazolamideAslCvr";

describe("acetazolamide ASL CVR calculation", () => {
  it("computes 100 * (post - pre) / pre", () => {
    expect(calculateCvrPercent(50, 65)).toBe(30);
    expect(calculateCvrPercent(40, 55)).toBe(37.5);
    expect(calculateCvrPercent(40, 40)).toBe(0);
    expect(calculateCvrPercent(40, 30)).toBe(-25);
    expect(calculateCvrPercent(40, 0)).toBe(-100);
    expect(formatCvrPercent(30)).toBe("30");
    expect(formatCvrPercent(37.5)).toBe("37.5");
    expect(formatCvrPercent(-25)).toBe("-25");
  });

  it("returns blank for missing, nonfinite, or non-positive baseline CBF", () => {
    expect(calculateCvrPercent(null, 65)).toBeNull();
    expect(calculateCvrPercent(undefined, 65)).toBeNull();
    expect(calculateCvrPercent(50, null)).toBeNull();
    expect(calculateCvrPercent(50, undefined)).toBeNull();
    expect(calculateCvrPercent(Number.NaN, 65)).toBeNull();
    expect(calculateCvrPercent(50, Number.NaN)).toBeNull();
    expect(calculateCvrPercent(Number.POSITIVE_INFINITY, 65)).toBeNull();
    expect(calculateCvrPercent(50, Number.NEGATIVE_INFINITY)).toBeNull();
    expect(calculateCvrPercent(0, 65)).toBeNull();
    expect(calculateCvrPercent(-1, 65)).toBeNull();
    expect(calculateCvrPercent(-0, 65)).toBeNull();
    expect(parseCbfInput("")).toBeNull();
    expect(parseCbfInput("   ")).toBeNull();
    expect(parseCbfInput("abc")).toBeNull();
    expect(parseCbfInput("NaN")).toBeNull();
    expect(parseCbfInput("Infinity")).toBeNull();
    expect(parseCbfInput("50")).toBe(50);
    expect(calculateCvrPercent(parseCbfInput(""), parseCbfInput("65"))).toBeNull();
    expect(calculateCvrPercent(parseCbfInput("0"), parseCbfInput("65"))).toBeNull();
  });

  it("does not assign an automatic grade", () => {
    expect(AUTOMATIC_GRADE_ENABLED).toBe(false);
    expect(REPORTABLE_PATTERNS).toHaveLength(5);
    expect(calculateCvrPercent(50, 80)).toBe(60);
  });

  it("copies the scale name, answered items, and CVR only", () => {
    const text = formatAslCvrCopy({
      checkedScreening: [SCREENING_ITEMS[0], SCREENING_ITEMS[2]],
      cbfPre: 50,
      cbfPost: 65,
    });
    expect(text).toBe(
      [
        ASL_CVR_TITLE,
        "Known acetazolamide hypersensitivity: Yes",
        "Hyponatremia or hypokalemia: Yes",
        "CBF pre: 50 mL/100 g/min",
        "CBF post: 65 mL/100 g/min",
        "CVR: 30%",
      ].join("\n"),
    );
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toMatch(/[*_`#]/);
    expect(text).not.toContain("Draft");
    expect(text).not.toContain(REPORTABLE_PATTERNS[0].label);
  });

  it("omits unanswered items and a blank CVR", () => {
    expect(formatAslCvrCopy({ checkedScreening: [], cbfPre: null, cbfPost: null })).toBe(ASL_CVR_TITLE);
    expect(formatAslCvrCopy({ checkedScreening: [], cbfPre: 0, cbfPost: 65 })).toBe(
      `${ASL_CVR_TITLE}\nCBF pre: 0 mL/100 g/min\nCBF post: 65 mL/100 g/min`,
    );
    expect(formatAslCvrCopy({ checkedScreening: [SCREENING_ITEMS[4]], cbfPre: 40, cbfPost: null })).toBe(
      `${ASL_CVR_TITLE}\nAdrenal insufficiency: Yes\nCBF pre: 40 mL/100 g/min`,
    );
  });

  it("keeps the protocol evidence notes, status, and reference URLs", () => {
    expect(ASL_CVR_STATUS_LABEL).toBe("Draft for local validation");
    expect(ASL_CVR_EVIDENCE_SCOPE).toContain("ACR–ACNM–SNMMI–SPR");
    expect(DOSE_EVIDENCE_NOTE).toContain("14 mg/kg");
    expect(CRUSH_EVIDENCE_NOTE).toBe("The effect of crushing on time to peak CBF response was unverified.");
    expect(TIMING_EVIDENCE_NOTE).toContain("180 minutes");
    expect(ILLUSTRATIVE_REFERENCE_NOTES).toEqual([
      "normal 30–60%",
      "reduced cutoff examples 10/20%",
      "illustrative values for review",
    ]);
    expect(HISTORICAL_TYPE_LABELS).toContain("Type I–III");
    expect(APPROVED_ORAL_PEDIATRIC_DOSE_MG_PER_KG).toBeNull();
    expect(APPROVED_ORAL_PEDIATRIC_CAP_MG).toBeNull();
    expect(ASL_CVR_REFERENCES.map((reference) => reference.url)).toEqual([
      "https://www.acr.org/-/media/ACR/Files/Practice-Parameters/BrainPerf-SPECT.pdf",
      "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c24d31f0-a556-4e53-97a9-4e05e28ca40f",
      "https://doi.org/10.1002/mrm.29572",
      "https://doi.org/10.1136/pgmj.63.737.185",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC7051638/",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC9274857/",
    ]);
  });
});
