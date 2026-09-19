/**
 * Spectrum of cerebral vessel occlusion — teaching content for LVO / MeVO / SVO / perforator.
 * Labels and approximate diameters follow the source teaching slide.
 */

export const VESSEL_OCCLUSION_SPECTRUM_TITLE = "Spectrum of Cerebral Vessel Occlusion";

export const VESSEL_OCCLUSION_SPECTRUM_FOOTER =
  "Approximate vessel diameters as shown on the source slide.";

export const VESSEL_OCCLUSION_SPECTRUM_CATEGORIES = [
  {
    id: "lvo",
    acronym: "LVO",
    name: "Large Vessel Occlusion",
    diameter: "3–6 mm",
    note: "Proximal arterial tree (e.g. ICA, M1, dominant M2, basilar).",
  },
  {
    id: "mevo",
    acronym: "MeVO",
    name: "Medium Vessel Occlusion",
    diameter: "1–3 mm",
    note: "PCA segments P1–P4 may be labeled on the source figure.",
  },
  {
    id: "svo",
    acronym: "SVO",
    name: "Small Vessel Occlusion",
    diameter: "<1 mm",
    note: "Distal cortical branches beyond typical EVT targets.",
  },
  {
    id: "perforator",
    acronym: "Perforator",
    name: "Perforator Occlusion",
    diameter: "50–500 μm",
    note: "Deep penetrating arteries; lacunar / small-vessel subtype.",
  },
] as const;

export const VESSEL_OCCLUSION_SPECTRUM_TAKEAWAYS = [
  "Location of occlusion in the vascular tree influences stroke extent.",
  "Underlying mechanisms and treatment approaches differ across stroke subtypes.",
] as const;

export type VesselOcclusionSpectrumId =
  (typeof VESSEL_OCCLUSION_SPECTRUM_CATEGORIES)[number]["id"];

export function getVesselOcclusionSpectrumCategory(id: VesselOcclusionSpectrumId) {
  return (
    VESSEL_OCCLUSION_SPECTRUM_CATEGORIES.find((c) => c.id === id) ??
    VESSEL_OCCLUSION_SPECTRUM_CATEGORIES[0]
  );
}
