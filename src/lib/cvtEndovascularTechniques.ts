/**
 * Endovascular techniques for cerebral venous thrombosis.
 * Teaching content adapted from a slide by Prof. Shakir Husain.
 */

export const CVT_ENDOVASCULAR_TITLE = "Endovascular Techniques for Cerebral Venous Thrombosis";

export const CVT_ENDOVASCULAR_ATTRIBUTION =
  "Adapted from a slide by Prof. Shakir Husain. Educational reference only — not a procedural manual.";

export const CVT_ENDOVASCULAR_LABELS = [
  { abbr: "GC", definition: "Guiding Catheter" },
  { abbr: "DAC", definition: "Distal Access Catheter" },
  { abbr: "NC balloon", definition: "non-compliant balloon" },
] as const;

export const CVT_ENDOVASCULAR_TECHNIQUES = [
  {
    id: "venoplasty",
    number: 1,
    name: "Venoplasty",
    summary: "Balloon dilatation of an occluded or stenosed cerebral venous sinus to restore outflow.",
    detail:
      "A balloon is advanced through the guiding and distal-access catheters into the thrombosed sinus (often the superior sagittal sinus) and inflated to open the lumen. Used when mechanical recanalization of the sinus is required as part of endovascular therapy for progressive CVT.",
  },
  {
    id: "dental-floss",
    number: 2,
    name: "Dental floss technique",
    summary: "A wire is controlled from both ends so the balloon or catheter can be worked through thrombus like floss.",
    detail:
      "After distal wire purchase in the sinus, the operator maintains two-ended control of the rail. The balloon or intermediate catheter is then advanced and withdrawn along that rail to disrupt and clear clot while remaining on a stable track.",
  },
  {
    id: "balloon-anchor",
    number: 3,
    name: "Balloon anchor with mobile aspiration",
    summary: "A distal balloon anchors the system while the aspiration catheter is moved to ingest clot.",
    detail:
      "The balloon is inflated distally (panel A–B starting position) to stabilize the construct. The distal access catheter is then moved relative to that anchor so aspiration can be applied along the sinus as the balloon oscillates or the DAC is advanced.",
  },
  {
    id: "pipeline-pigging",
    number: 4,
    name: "Pipeline pigging technique",
    summary: "A balloon is swept along the sinus like a pipeline pig to push and clear thrombus toward the aspiration catheter.",
    detail:
      "With the balloon at or beyond the clot, the operator draws or walks it along a longer sinus trajectory (panels C–D). The balloon acts as a pig, mobilizing thrombus back toward the DAC for aspiration. Panel D uses a non-compliant (NC) balloon across the sinus roof.",
  },
] as const;

export const CVT_ENDOVASCULAR_PANELS = [
  {
    id: "A",
    title: "Initial positioning",
    labels: ["GC", "DAC", "Guidewire", "Balloon"],
    description:
      "Access via the jugular into the cerebral venous sinuses. The guiding catheter, distal access catheter, and guidewire are positioned with the balloon at the distal superior sagittal sinus.",
  },
  {
    id: "B",
    title: "Balloon oscillation",
    labels: ["GC", "DAC", "Guidewire", "Balloon"],
    description:
      "The balloon is moved back and forth (double-headed arrow) within the sinus to disrupt thrombus while the GC/DAC construct remains in the neck–sinus axis.",
  },
  {
    id: "C",
    title: "Long sinus trajectory",
    labels: ["GC", "DAC", "Guidewire", "Balloon"],
    description:
      "A longer balloon path along the sinus (dotted trajectory) with an upward vector near the DAC tip as the system is worked more proximally or the pigging sweep is lengthened.",
  },
  {
    id: "D",
    title: "NC balloon across the sinus roof",
    labels: ["GC", "DAC", "Guidewire", "NC balloon"],
    description:
      "Similar long trajectory with a non-compliant (NC) balloon seated across the sinus roof for a more rigid sweep or venoplasty of a resistant segment.",
  },
] as const;

export type CvtEndovascularTechniqueId = (typeof CVT_ENDOVASCULAR_TECHNIQUES)[number]["id"];

export function getCvtEndovascularTechnique(id: CvtEndovascularTechniqueId) {
  return CVT_ENDOVASCULAR_TECHNIQUES.find((t) => t.id === id) ?? CVT_ENDOVASCULAR_TECHNIQUES[0];
}
