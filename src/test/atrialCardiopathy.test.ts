import { describe, expect, it } from "vitest";
import {
  LAVI_THRESHOLD,
  NT_PROBNP_THRESHOLD,
  PTFV1_THRESHOLD,
  REFERENCES,
  biomarkerSummary,
  biomarkerValues,
  emptyAnswers,
  formatAtrialCardiopathyCopy,
  laviFromVolume,
  meetsLaviThreshold,
  meetsNtProBnpThreshold,
  meetsPtfv1Threshold,
  ptfv1FromTracing,
  resolveLavi,
  resolveNtProBnp,
  resolvePtfv1,
} from "@/lib/atrialCardiopathy";

describe("PTFV1", () => {
  it("multiplies depth in mm by 100 µV/mm and duration in ms", () => {
    expect(ptfv1FromTracing(1, 40)).toBe(4000);
    expect(ptfv1FromTracing(1.5, 40)).toBe(6000);
  });

  it("stays blank for missing, nonfinite, or ≤0 inputs", () => {
    expect(ptfv1FromTracing(null, 40)).toBeNull();
    expect(ptfv1FromTracing(1, null)).toBeNull();
    expect(ptfv1FromTracing(Number.NaN, 40)).toBeNull();
    expect(ptfv1FromTracing(1, Number.POSITIVE_INFINITY)).toBeNull();
    expect(ptfv1FromTracing(0, 40)).toBeNull();
    expect(ptfv1FromTracing(-1, 40)).toBeNull();
    expect(ptfv1FromTracing(1, 0)).toBeNull();
    expect(ptfv1FromTracing(1, -40)).toBeNull();
  });

  it("uses a directly entered value and its absolute magnitude ahead of the calculator", () => {
    expect(resolvePtfv1("-6,000", "1", "40")).toBe(6000);
    expect(resolvePtfv1("1000", "2", "40")).toBe(1000);
    expect(resolvePtfv1("0", "1", "40")).toBe(0);
    expect(resolvePtfv1("", "1", "40")).toBe(4000);
    expect(resolvePtfv1("   ", "1", "40")).toBe(4000);
    expect(resolvePtfv1("not a number", "1", "40")).toBe(4000);
  });

  it("flags only an absolute value above 5,000 µV·ms", () => {
    expect(PTFV1_THRESHOLD).toBe(5000);
    expect(meetsPtfv1Threshold(5000)).toBe(false);
    expect(meetsPtfv1Threshold(5000.1)).toBe(true);
    expect(meetsPtfv1Threshold(resolvePtfv1("-5001", "", ""))).toBe(true);
    expect(meetsPtfv1Threshold(resolvePtfv1("-5000", "", ""))).toBe(false);
    expect(meetsPtfv1Threshold(null)).toBe(false);
  });
});

describe("LAVI", () => {
  it("divides LA volume by body surface area", () => {
    expect(laviFromVolume(80, 2)).toBe(40);
    expect(laviFromVolume(68, 2)).toBe(34);
  });

  it("stays blank for missing, nonfinite, or ≤0 inputs", () => {
    expect(laviFromVolume(null, 2)).toBeNull();
    expect(laviFromVolume(80, null)).toBeNull();
    expect(laviFromVolume(Number.NaN, 2)).toBeNull();
    expect(laviFromVolume(80, Number.NaN)).toBeNull();
    expect(laviFromVolume(0, 2)).toBeNull();
    expect(laviFromVolume(-80, 2)).toBeNull();
    expect(laviFromVolume(80, 0)).toBeNull();
    expect(laviFromVolume(80, -1.8)).toBeNull();
  });

  it("uses a directly entered LAVI ahead of volume and BSA", () => {
    expect(resolveLavi("30", "80", "2")).toBe(30);
    expect(resolveLavi("0", "80", "2")).toBe(0);
    expect(resolveLavi("-5", "80", "2")).toBe(-5);
    expect(resolveLavi("", "80", "2")).toBe(40);
    expect(resolveLavi("abc", "80", "2")).toBe(40);
    expect(resolveLavi("", "", "2")).toBeNull();
  });

  it("flags only a value above 34 mL/m²", () => {
    expect(LAVI_THRESHOLD).toBe(34);
    expect(meetsLaviThreshold(34)).toBe(false);
    expect(meetsLaviThreshold(34.1)).toBe(true);
    expect(meetsLaviThreshold(resolveLavi("30", "80", "2"))).toBe(false);
    expect(meetsLaviThreshold(resolveLavi("", "80", "2"))).toBe(true);
    expect(meetsLaviThreshold(null)).toBe(false);
  });
});

describe("NT-proBNP threshold", () => {
  it("flags only a value above 250 pg/mL", () => {
    expect(NT_PROBNP_THRESHOLD).toBe(250);
    expect(resolveNtProBnp("250")).toBe(250);
    expect(resolveNtProBnp("1,250")).toBe(1250);
    expect(resolveNtProBnp("")).toBeNull();
    expect(resolveNtProBnp("high")).toBeNull();
    expect(meetsNtProBnpThreshold(250)).toBe(false);
    expect(meetsNtProBnpThreshold(250.1)).toBe(true);
    expect(meetsNtProBnpThreshold(0)).toBe(false);
    expect(meetsNtProBnpThreshold(null)).toBe(false);
  });
});

describe("biomarker summary", () => {
  it("counts three pending measurements when nothing has been entered", () => {
    expect(biomarkerSummary({ ptfv1: null, ntProBnp: null, lavi: null })).toBe(
      "Biomarker checklist incomplete. Three measurements pending.",
    );
  });

  it("counts measurements that meet threshold and measurements still pending", () => {
    expect(biomarkerSummary({ ptfv1: 6000, ntProBnp: null, lavi: null })).toBe(
      "Biomarker checklist incomplete. One measurement meets threshold. Two measurements pending.",
    );
    expect(biomarkerSummary({ ptfv1: 6000, ntProBnp: 300, lavi: null })).toBe(
      "Biomarker checklist incomplete. Two measurements meet threshold. One measurement pending.",
    );
    expect(biomarkerSummary({ ptfv1: 4000, ntProBnp: null, lavi: null })).toBe(
      "Biomarker checklist incomplete. Two measurements pending.",
    );
  });

  it("counts how many entered measurements meet threshold once none are pending", () => {
    expect(biomarkerSummary({ ptfv1: 4000, ntProBnp: 100, lavi: 30 })).toBe(
      "Biomarker checklist complete. No measurements meet threshold.",
    );
    expect(biomarkerSummary({ ptfv1: 5000, ntProBnp: 250, lavi: 34 })).toBe(
      "Biomarker checklist complete. No measurements meet threshold.",
    );
    expect(biomarkerSummary({ ptfv1: 6000, ntProBnp: 100, lavi: 40 })).toBe(
      "Biomarker checklist complete. Two measurements meet threshold.",
    );
    expect(biomarkerSummary({ ptfv1: 6000, ntProBnp: 300, lavi: 40 })).toBe(
      "Biomarker checklist complete. Three measurements meet threshold.",
    );
  });
});

describe("plain-text copy", () => {
  it("copies the scale name, answered items, and the biomarker summary", () => {
    const answers = emptyAnswers();
    answers.checks.nonLacunar = true;
    answers.checks.cortical = false;
    answers.classification = "esus";
    answers.monitoringHours = "48";
    answers.ptfv1 = "-6000";
    answers.ptfDepth = "1";
    answers.ptfDuration = "40";
    answers.ntProBnp = "";
    answers.laVolume = "80";
    answers.bsa = "2";
    answers.pacBurden = "frequent";

    const text = formatAtrialCardiopathyCopy(answers);
    expect(text).toBe(
      [
        "Atrial cardiopathy checklist",
        "Non-lacunar infarct on brain CT or MRI: Yes",
        "Stroke classification: ESUS",
        "Initial continuous monitoring (hours): 48",
        "P-wave terminal force in V1 (PTFV1): 6,000 µV·ms",
        "Terminal negative depth (mm): 1",
        "Negative component duration (ms): 40",
        "Left atrial volume index (LAVI): 40 mL/m²",
        "LA volume (mL): 80",
        "Body surface area (m²): 2",
        "PAC burden: frequent",
        "Interpretation: Biomarker checklist incomplete. Two measurements meet threshold. One measurement pending.",
      ].join("\n"),
    );
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toMatch(/[*_`#]/);
    expect(text).not.toContain("Cortical infarct");
    expect(text).not.toContain("Pending");
    expect(biomarkerValues(answers).ptfv1).toBe(6000);
  });

  it("keeps the reference list to the four supplied titles", () => {
    expect(REFERENCES).toEqual([
      "ARCADIA randomized clinical trial",
      "ACC consensus on arrhythmia monitoring after stroke",
      "ASE/EACVI chamber quantification guideline",
      "Consensus on P-wave measurements",
    ]);
    expect(REFERENCES.join("\n")).not.toMatch(/https?:\/\//);
  });
});
