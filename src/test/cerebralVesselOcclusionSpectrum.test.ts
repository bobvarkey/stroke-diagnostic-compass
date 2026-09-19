import { describe, it, expect } from "vitest";
import {
  VESSEL_OCCLUSION_SPECTRUM_CATEGORIES,
  VESSEL_OCCLUSION_SPECTRUM_FOOTER,
  VESSEL_OCCLUSION_SPECTRUM_TAKEAWAYS,
  VESSEL_OCCLUSION_SPECTRUM_TITLE,
  getVesselOcclusionSpectrumCategory,
} from "@/lib/cerebralVesselOcclusionSpectrum";

describe("Spectrum of cerebral vessel occlusion content", () => {
  it("uses the teaching-slide title", () => {
    expect(VESSEL_OCCLUSION_SPECTRUM_TITLE).toBe("Spectrum of Cerebral Vessel Occlusion");
  });

  it("lists four occlusion categories in proximal-to-distal order", () => {
    expect(VESSEL_OCCLUSION_SPECTRUM_CATEGORIES.map((c) => c.acronym)).toEqual([
      "LVO",
      "MeVO",
      "SVO",
      "Perforator",
    ]);
    expect(VESSEL_OCCLUSION_SPECTRUM_CATEGORIES.map((c) => c.name)).toEqual([
      "Large Vessel Occlusion",
      "Medium Vessel Occlusion",
      "Small Vessel Occlusion",
      "Perforator Occlusion",
    ]);
  });

  it("records approximate vessel diameters from the source slide", () => {
    expect(VESSEL_OCCLUSION_SPECTRUM_CATEGORIES[0].diameter).toBe("3–6 mm");
    expect(VESSEL_OCCLUSION_SPECTRUM_CATEGORIES[1].diameter).toBe("1–3 mm");
    expect(VESSEL_OCCLUSION_SPECTRUM_CATEGORIES[2].diameter).toBe("<1 mm");
    expect(VESSEL_OCCLUSION_SPECTRUM_CATEGORIES[3].diameter).toBe("50–500 μm");
    expect(VESSEL_OCCLUSION_SPECTRUM_CATEGORIES[1].note).toMatch(/P1–P4/);
  });

  it("includes location and treatment-subtype takeaways", () => {
    expect(VESSEL_OCCLUSION_SPECTRUM_TAKEAWAYS).toHaveLength(2);
    expect(VESSEL_OCCLUSION_SPECTRUM_TAKEAWAYS[0]).toMatch(/vascular tree/i);
    expect(VESSEL_OCCLUSION_SPECTRUM_TAKEAWAYS[1]).toMatch(/treatment approaches/i);
  });

  it("notes that diameters are approximate", () => {
    expect(VESSEL_OCCLUSION_SPECTRUM_FOOTER).toMatch(/Approximate vessel diameters/i);
  });

  it("returns the selected category and falls back to LVO", () => {
    expect(getVesselOcclusionSpectrumCategory("mevo").name).toBe("Medium Vessel Occlusion");
    expect(getVesselOcclusionSpectrumCategory("lvo").acronym).toBe("LVO");
  });
});
