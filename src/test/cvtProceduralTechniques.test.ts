import { describe, expect, it } from "vitest";
import {
  CVT_ACCESS,
  CVT_ALTEPLASE_SOURCE_RANGES,
  CVT_ANGIOJET,
  CVT_ANGIOPLASTY_STENTING,
  CVT_BALLOON_THROMBECTOMY,
  CVT_EVT_GOAL,
  CVT_PERIPROCEDURAL_AC,
  CVT_PHARM_THROMBOLYSIS,
  CVT_TECHNIQUE_ALTEPLASE,
  CVT_TECHNIQUE_LIST,
  CVT_TECHNIQUES_ATTRIBUTION,
  CVT_TECHNIQUES_DISCLAIMER,
} from "@/lib/cvtProceduralTechniques";
import { CVT_INTRACLOT_AGENTS } from "@/lib/cvtIntraclotThrombolysis";

describe("CVT procedural techniques teaching reference", () => {
  it("preserves arterial and venous sheath sizes", () => {
    expect(CVT_ACCESS.arterialSheath).toBe("4F or 5F");
    expect(CVT_ACCESS.venousSheathTypical).toBe("6F");
    expect(CVT_ACCESS.venousSheathLarge).toBe("7F–8F");
    expect(CVT_ACCESS.arterial).toContain("4F or 5F");
    expect(CVT_ACCESS.femoralVenous).toContain("6F");
    expect(CVT_ACCESS.femoralVenous).toContain("7F–8F");
  });

  it("preserves continuous intrasinus alteplase 1–2 mg/h and 12–24 h angio", () => {
    expect(CVT_TECHNIQUE_ALTEPLASE.infusion).toBe("1–2 mg/h");
    expect(CVT_TECHNIQUE_ALTEPLASE.angioInterval).toBe("12–24 h");
    expect(CVT_PHARM_THROMBOLYSIS.alteplaseInfusion).toBe("1–2 mg/h");
    expect(CVT_PHARM_THROMBOLYSIS.angioInterval).toBe("12–24 h");
  });

  it("keeps the intraclot alteplase 1 mg/h protocol distinct from the 1–2 mg/h teaching range", () => {
    expect(CVT_INTRACLOT_AGENTS[1].infusion).toBe("1 mg/h");
    const intraclot = CVT_ALTEPLASE_SOURCE_RANGES.find((r) => r.id === "intraclot-protocol");
    const teaching = CVT_ALTEPLASE_SOURCE_RANGES.find((r) => r.id === "techniques-teaching");
    expect(intraclot?.infusion).toBe("1 mg/h");
    expect(intraclot?.bolus).toBe("10 mg");
    expect(teaching?.infusion).toBe("1–2 mg/h");
    expect(teaching?.angio).toBe("12–24 h");
  });

  it("preserves Fogarty 3F or 4F balloon sizing", () => {
    expect(CVT_BALLOON_THROMBECTOMY.fogarty).toBe("3F or 4F");
    expect(CVT_BALLOON_THROMBECTOMY.fogartyNote).toContain("3F or 4F");
  });

  it("preserves periprocedural ACT 250–300 s", () => {
    expect(CVT_PERIPROCEDURAL_AC.actTarget).toBe("250–300 s");
    expect(CVT_PERIPROCEDURAL_AC.actNote).toContain("250–300 s");
  });

  it("presents AngioJet n=185 as an evidence note, not a prohibition", () => {
    expect(CVT_ANGIOJET.reviewN).toBe(185);
    expect(CVT_ANGIOJET.evidenceNote).toContain("n=185");
    expect(CVT_ANGIOJET.evidenceNote.toLowerCase()).toContain("not an absolute prohibition");
  });

  it("states angioplasty/stenting is rescue and first-line use is unevaluated", () => {
    expect(CVT_ANGIOPLASTY_STENTING.role.toLowerCase()).toContain("rescue");
    expect(CVT_ANGIOPLASTY_STENTING.firstLine.toLowerCase()).toContain("not been evaluated");
  });

  it("states the EVT goal of restoring anterograde venous outflow", () => {
    expect(CVT_EVT_GOAL.toLowerCase()).toContain("anterograde venous outflow");
  });

  it("exposes a compact first-paint technique list including ACT and Fogarty cues", () => {
    const labels = CVT_TECHNIQUE_LIST.map((t) => t.label);
    expect(labels).toEqual([
      "Access",
      "Local lytics",
      "Aspiration",
      "Stent retriever",
      "Balloon",
      "Angioplasty / stent",
      "AngioJet",
      "Periprocedural AC",
    ]);
    expect(CVT_TECHNIQUE_LIST.find((t) => t.id === "act")?.summary).toContain("250–300");
    expect(CVT_TECHNIQUE_LIST.find((t) => t.id === "balloon")?.summary).toContain("3–4F");
  });

  it("labels the block as transcribed teaching material with the app disclaimer", () => {
    expect(CVT_TECHNIQUES_ATTRIBUTION).toContain("transcribed from the supplied source");
    expect(CVT_TECHNIQUES_DISCLAIMER.toLowerCase()).toContain("not a substitute");
    expect(CVT_TECHNIQUES_DISCLAIMER).toContain("not a medical device");
  });
});
