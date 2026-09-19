import { describe, it, expect } from "vitest";
import {
  CVT_ABBREVIATIONS,
  CVT_ALTERNATIVE_DIAGNOSES,
  CVT_ANTICOAG_NOTE,
  CVT_DISCLAIMER,
  CVT_ETIOLOGY,
  CVT_PATHWAY_TITLE,
  CVT_STABLE_DURATION,
  INITIAL_CVT_PATHWAY_STATE,
  getCvtPathwayGuidance,
} from "@/lib/cvtEvaluationPathway";

describe("CVT evaluation pathway content", () => {
  it("uses the SNIF flowchart title", () => {
    expect(CVT_PATHWAY_TITLE).toBe(
      "Cerebral Venous Thrombosis (CVT) Evaluation and Management",
    );
  });

  it("lists the six alternative diagnoses from the slide", () => {
    expect([...CVT_ALTERNATIVE_DIAGNOSES]).toEqual([
      "Arterial stroke",
      "Idiopathic intracranial hypertension",
      "Meningitis",
      "Brain abscess",
      "Brain neoplasm",
      "Mitochondrial disorder",
    ]);
  });

  it("keeps ICH-from-CVT anticoagulation wording", () => {
    expect(CVT_ANTICOAG_NOTE).toMatch(/not a contraindication to anticoagulation/i);
    expect(CVT_ANTICOAG_NOTE).toMatch(/Intracranial hemorrhage caused by CVT/i);
  });

  it("includes the four etiological workup columns with slide items", () => {
    expect(CVT_ETIOLOGY.clinical.items).toEqual(
      expect.arrayContaining([
        "Otitis",
        "Mastoiditis",
        "Behçet’s syndrome",
        "Ulcerative colitis",
        "Rheumatological conditions",
      ]),
    );
    expect(CVT_ETIOLOGY.exposures.items).toEqual([
      "Oral contraceptive pills",
      "Chemotherapeutic agents",
      "COVID-19 vaccination",
    ]);
    expect(CVT_ETIOLOGY.initialLabs.items).toEqual([
      "Hematocrit",
      "CBC",
      "Renal function",
      "Urinalysis",
      "Pregnancy test",
      "PT",
      "aPTT",
    ]);
    expect(CVT_ETIOLOGY.additionalLabs.items).toEqual(
      expect.arrayContaining([
        "ESR",
        "D-dimer",
        "Hypercoagulation panel",
        "Antiphospholipid panel",
        "MTHFR gene mutation testing",
        "Serum protein electrophoresis",
      ]),
    );
  });

  it("defines CVT, MRV, CTV, LMWH, and VTE once", () => {
    expect(CVT_ABBREVIATIONS.map((a) => a.abbr)).toEqual(["CVT", "MRV", "CTV", "LMWH", "VTE"]);
    expect(CVT_ABBREVIATIONS.find((a) => a.abbr === "LMWH")?.definition).toMatch(/low-molecular-weight heparin/i);
  });

  it("includes a transcribed-not-verified disclaimer", () => {
    expect(CVT_DISCLAIMER).toMatch(/SNIF/);
    expect(CVT_DISCLAIMER).toMatch(/not independently verified/i);
  });

  it("encodes stable-course duration rules", () => {
    expect(CVT_STABLE_DURATION.transient).toMatch(/3–12 months/);
    expect(CVT_STABLE_DURATION.highRisk).toMatch(/Indefinite anticoagulation/);
    expect(CVT_STABLE_DURATION.pregnancy).toMatch(/LMWH preferred/);
  });
});

describe("getCvtPathwayGuidance", () => {
  it("starts at imaging after clinical suspicion", () => {
    const g = getCvtPathwayGuidance(INITIAL_CVT_PATHWAY_STATE);
    expect(g.tone).toBe("neutral");
    expect(g.detail).toMatch(/MRI with T2\*/);
    expect(g.detail).toMatch(/CTV/);
  });

  it("lists alternative diagnoses when imaging is negative", () => {
    const g = getCvtPathwayGuidance({
      imaging: "no-cvt",
      massEffect: "pending",
      course: "pending",
    });
    expect(g.tone).toBe("info");
    expect(g.title).toMatch(/No evidence of CVT/);
    expect(g.detail).toContain("Mitochondrial disorder");
  });

  it("prioritizes decompressive surgery when mass effect is present", () => {
    const g = getCvtPathwayGuidance({
      imaging: "confirmed",
      massEffect: "present",
      course: "pending",
    });
    expect(g.tone).toBe("urgent");
    expect(g.detail).toMatch(/decompressive hemicraniectomy/i);
    expect(g.detail).toMatch(/not a contraindication/i);
  });

  it("recommends parenteral anticoagulation after confirmation", () => {
    const g = getCvtPathwayGuidance({
      imaging: "confirmed",
      massEffect: "absent",
      course: "pending",
    });
    expect(g.tone).toBe("action");
    expect(g.detail).toMatch(/LMWH/);
    expect(g.detail).toMatch(/etiological evaluation/i);
  });

  it("recommends oral anticoagulation duration when stable", () => {
    const g = getCvtPathwayGuidance({
      imaging: "confirmed",
      massEffect: "absent",
      course: "stable",
    });
    expect(g.tone).toBe("stable");
    expect(g.detail).toMatch(/DOAC or warfarin/);
    expect(g.detail).toMatch(/3–12 months/);
  });

  it("recommends endovascular therapy on progression", () => {
    const g = getCvtPathwayGuidance({
      imaging: "confirmed",
      massEffect: "absent",
      course: "progression",
    });
    expect(g.tone).toBe("progression");
    expect(g.detail).toMatch(/intrasinus thrombolysis/i);
    expect(g.detail).toMatch(/endovascular thrombectomy/i);
  });

  it("keeps mass-effect urgency above later course selection", () => {
    const g = getCvtPathwayGuidance({
      imaging: "confirmed",
      massEffect: "present",
      course: "stable",
    });
    expect(g.tone).toBe("urgent");
  });
});
