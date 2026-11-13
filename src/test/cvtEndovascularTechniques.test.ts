import { describe, it, expect } from "vitest";
import {
  CVT_ENDOVASCULAR_ATTRIBUTION,
  CVT_ENDOVASCULAR_LABELS,
  CVT_ENDOVASCULAR_PANELS,
  CVT_ENDOVASCULAR_TECHNIQUES,
  CVT_ENDOVASCULAR_TITLE,
  CVT_FOGARTY_BALLOON,
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

  it("keeps the Fogarty balloon notes to the supplied lines", () => {
    expect(CVT_FOGARTY_BALLOON.title).toBe("Balloon thrombectomy (Fogarty catheter)");
    expect([...CVT_FOGARTY_BALLOON.points]).toEqual([
      "4 F Fogarty requires a 5 Fr short sheath",
      "Cheaper (only 5000 Rs for catheter)",
    ]);
    expect(CVT_FOGARTY_BALLOON.spec).toBe(
      "4 Fr catheter / 80 cm usable length / 9 mm inflated balloon",
    );
    expect(CVT_FOGARTY_BALLOON.model).toBe("12TLW804F");
    expect(CVT_FOGARTY_BALLOON.warning).toBe(
      "Edwards' instructions warn against use of this catheter in the venous system.",
    );
    expect(CVT_FOGARTY_BALLOON.figure).toBe(
      "Balloon-assisted cerebral venous sinus thrombectomy: Edwards Fogarty Thru-Lumen embolectomy catheter, over-the-wire models and manufacturer specifications.",
    );
  });
});
