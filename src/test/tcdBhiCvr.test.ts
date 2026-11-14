import { describe, expect, it } from "vitest";
import { labelFromId } from "@/lib/protocolStatus";
import {
  AT_OR_ABOVE_CUTOFF,
  BELOW_CUTOFF,
  BHI_INVALID_IF,
  HISTORICAL_CUTOFF_PERCENT_PER_SECOND,
  TCD_BHI_STATUS_LABEL,
  TCD_BHI_TITLE,
  TCD_HEADER_NOTES,
  TCD_REFERENCES,
  TCD_SCOPE,
  TCD_STEP_IDS,
  TCD_STEP_TITLES,
  WORKED_EXAMPLE,
  calculateBhi,
  formatBhi,
  formatPercentMfvChange,
  formatTcdBhiCopy,
  parseNumericInput,
} from "@/lib/tcdBhiCvr";

describe("TCD BHI calculation", () => {
  it("uses the worked example: 30% MFV change and BHI 1 %/s", () => {
    const result = calculateBhi(
      WORKED_EXAMPLE.mfvBaselineCmS,
      WORKED_EXAMPLE.mfvResponseCmS,
      WORKED_EXAMPLE.actualBreathHoldSeconds,
    );
    expect(result).toEqual({
      percentMfvChange: WORKED_EXAMPLE.percentMfvChange,
      bhiPercentPerSecond: WORKED_EXAMPLE.bhiPercentPerSecond,
    });
    expect(formatPercentMfvChange(result!.percentMfvChange)).toBe("30");
    expect(formatBhi(result!.bhiPercentPerSecond)).toBe("1");
  });

  it("computes percent change per second, including a fall and a zero response", () => {
    expect(calculateBhi(50, 40, 20)).toEqual({ percentMfvChange: -20, bhiPercentPerSecond: -1 });
    expect(calculateBhi(40, 40, 30)).toEqual({ percentMfvChange: 0, bhiPercentPerSecond: 0 });
    expect(calculateBhi(50, 0, 30)).toEqual({ percentMfvChange: -100, bhiPercentPerSecond: -100 / 30 });
    expect(formatBhi(-100 / 30)).toBe("-3.33");
    expect(formatBhi(0.69)).toBe("0.69");
  });

  it("returns blank for missing, nonfinite, non-positive baseline, negative response, or non-positive duration", () => {
    expect(calculateBhi(null, 65, 30)).toBeNull();
    expect(calculateBhi(50, undefined, 30)).toBeNull();
    expect(calculateBhi(50, 65, null)).toBeNull();
    expect(calculateBhi(Number.NaN, 65, 30)).toBeNull();
    expect(calculateBhi(50, Number.POSITIVE_INFINITY, 30)).toBeNull();
    expect(calculateBhi(50, 65, Number.NEGATIVE_INFINITY)).toBeNull();
    expect(calculateBhi(0, 65, 30)).toBeNull();
    expect(calculateBhi(-5, 65, 30)).toBeNull();
    expect(calculateBhi(50, -1, 30)).toBeNull();
    expect(calculateBhi(50, 65, 0)).toBeNull();
    expect(calculateBhi(50, 65, -10)).toBeNull();
    expect(calculateBhi(50, 65, 30, true)).toBeNull();
    expect(parseNumericInput("")).toBeNull();
    expect(parseNumericInput(" ")).toBeNull();
    expect(parseNumericInput("abc")).toBeNull();
    expect(parseNumericInput("Infinity")).toBeNull();
    expect(calculateBhi(parseNumericInput("50"), parseNumericInput(""), parseNumericInput("30"))).toBeNull();
  });

  it("does not grade from the historical cutoff", () => {
    expect(HISTORICAL_CUTOFF_PERCENT_PER_SECOND).toBe(0.69);
    expect(BHI_INVALID_IF).toContain("Trial quality is invalid");
    const low = calculateBhi(50, 55, 30);
    expect(low?.bhiPercentPerSecond).toBeCloseTo(10 / 30);
    expect(low).not.toHaveProperty("grade");
    const text = formatTcdBhiCopy({
      checked: [],
      baselineCmS: 50,
      responseCmS: 55,
      breathHoldSeconds: 30,
      trialQualityInvalid: false,
    });
    expect(text).toContain("BHI: 0.33 %/s");
    expect(text).not.toContain(BELOW_CUTOFF);
    expect(text).not.toContain(AT_OR_ABOVE_CUTOFF);
  });

  it("copies the scale name, checked items, answered inputs, and BHI", () => {
    const text = formatTcdBhiCopy({
      checked: ["Rest for at least 5 minutes in a quiet room. Use a comfortable supine or semirecumbent position and keep it constant throughout."],
      baselineCmS: 50,
      responseCmS: 65,
      breathHoldSeconds: 30,
      trialQualityInvalid: false,
    });
    expect(text).toBe(
      [
        TCD_BHI_TITLE,
        "Rest for at least 5 minutes in a quiet room. Use a comfortable supine or semirecumbent position and keep it constant throughout.: Yes",
        "MFV baseline: 50 cm/s",
        "MFV response: 65 cm/s",
        "Breath-hold: 30 seconds",
        "MFV change: 30%",
        "BHI: 1 %/s",
      ].join("\n"),
    );
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toMatch(/[*_`#]/);
    expect(text).not.toContain(TCD_SCOPE.modalityNote);
  });

  it("omits a blank BHI and still records an invalid trial", () => {
    expect(formatTcdBhiCopy({
      checked: [],
      baselineCmS: null,
      responseCmS: null,
      breathHoldSeconds: null,
      trialQualityInvalid: false,
    })).toBe(TCD_BHI_TITLE);

    expect(formatTcdBhiCopy({
      checked: [],
      baselineCmS: 50,
      responseCmS: 65,
      breathHoldSeconds: 30,
      trialQualityInvalid: true,
    })).toBe(
      [
        TCD_BHI_TITLE,
        "Trial quality is invalid: Yes",
        "MFV baseline: 50 cm/s",
        "MFV response: 65 cm/s",
        "Breath-hold: 30 seconds",
      ].join("\n"),
    );
  });

  it("keeps the modality note, status, step names, and reference URLs", () => {
    expect(TCD_BHI_STATUS_LABEL).toBe("Draft for local adoption");
    expect(TCD_HEADER_NOTES).toContain(TCD_SCOPE.modalityNote);
    expect(TCD_SCOPE.modalityNote).toBe(
      "TCD BHI measures a velocity response to breath-holding. ASL acetazolamide CVR measures a tissue perfusion response to a pharmacologic stimulus. Report the methods and values independently.",
    );
    expect(TCD_STEP_TITLES).toEqual(TCD_STEP_IDS.map((id) => labelFromId(id)));
    expect(TCD_REFERENCES.map((reference) => reference.url)).toEqual([
      "https://doi.org/10.1002/jum.16234",
      "https://pubmed.ncbi.nlm.nih.gov/1579964/",
      "https://jamanetwork.com/journals/jama/fullarticle/192630",
      "https://doi.org/10.1148/rg.250182",
      "https://www.asnweb.org/files/AR_BASICS_TCD__2021.pdf",
    ]);
  });
});
