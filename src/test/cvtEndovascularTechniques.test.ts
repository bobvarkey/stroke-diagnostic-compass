import { describe, it, expect } from "vitest";
import {
  CVT_ENDOVASCULAR_ATTRIBUTION,
  CVT_ENDOVASCULAR_LABELS,
  CVT_ENDOVASCULAR_PANELS,
  CVT_ENDOVASCULAR_TECHNIQUES,
  CVT_ENDOVASCULAR_TITLE,
  getCvtEndovascularTechnique,
} from "@/lib/cvtEndovascularTechniques";

describe("CVT endovascular techniques content", () => {
  it("uses the teaching-slide title", () => {
    expect(CVT_ENDOVASCULAR_TITLE).toBe("Endovascular Techniques for Cerebral Venous Thrombosis");
  });

  it("lists the four techniques in slide order", () => {
    expect(CVT_ENDOVASCULAR_TECHNIQUES.map((t) => t.name)).toEqual([
      "Venoplasty",
      "Dental floss technique",
      "Balloon anchor with mobile aspiration",
      "Pipeline pigging technique",
    ]);
  });

  it("includes labeled A–D sinus-access panels", () => {
    expect(CVT_ENDOVASCULAR_PANELS.map((p) => p.id)).toEqual(["A", "B", "C", "D"]);
    expect(CVT_ENDOVASCULAR_PANELS[0].description).toMatch(/superior sagittal sinus/i);
    expect(CVT_ENDOVASCULAR_PANELS[1].description).toMatch(/back and forth/i);
    expect(CVT_ENDOVASCULAR_PANELS[3].labels).toContain("NC balloon");
  });

  it("defines GC, DAC, and NC balloon", () => {
    expect(CVT_ENDOVASCULAR_LABELS.map((l) => l.abbr)).toEqual(["GC", "DAC", "NC balloon"]);
    expect(CVT_ENDOVASCULAR_LABELS[0].definition).toMatch(/Guiding Catheter/i);
    expect(CVT_ENDOVASCULAR_LABELS[1].definition).toMatch(/Distal Access Catheter/i);
  });

  it("attributes the slide to Prof. Shakir Husain", () => {
    expect(CVT_ENDOVASCULAR_ATTRIBUTION).toMatch(/Shakir Husain/);
  });

  it("returns the selected technique and falls back to venoplasty", () => {
    expect(getCvtEndovascularTechnique("pipeline-pigging").name).toBe("Pipeline pigging technique");
    expect(getCvtEndovascularTechnique("venoplasty").number).toBe(1);
  });
});
