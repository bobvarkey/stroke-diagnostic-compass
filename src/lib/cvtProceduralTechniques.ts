/**
 * CVT endovascular procedural techniques — teaching reference.
 * Transcribed/summarized from the supplied source. Do not invent doses.
 */

export const CVT_TECHNIQUES_ATTRIBUTION =
  "Teaching reference transcribed from the supplied source";

export const CVT_TECHNIQUES_DISCLAIMER =
  "Clinical reference and educational decision support only — not a substitute for individualized judgment. Verify doses, contraindications, and institutional protocols before use. StrokeSuite ID is not a medical device.";

export const CVT_EVT_GOAL =
  "Restore anterograde venous outflow in the target sinus(es) to relieve malignant venous congestion/hypertension and its complications";

export const CVT_EVT_GOAL_EVIDENCE =
  "Complete or partial recanalization is associated with better outcomes versus none (limited evidence / small samples)";

export const CVT_ACCESS = {
  arterialSheath: "4F or 5F",
  venousSheathTypical: "6F",
  venousSheathLarge: "7F–8F",
  arterial:
    "4F or 5F sheath is usually enough for diagnostic cerebral angiography; venous (including delayed) phase maps occlusion extent and collaterals",
  femoralVenous:
    "6F long sheath fits most thrombectomy devices; 7F–8F for larger clot / catheter systems",
  guiding:
    "Guiding catheter/sheath often parked in the IJV; can advance to the transverse sinus or torcula if needed. An intermediate catheter through the sheath adds support",
  directIjv:
    "Direct IJV access is an alternative; access-site thrombosis may compromise drainage if the contralateral jugular bulb is inadequate",
} as const;

export const CVT_TECHNIQUE_ALTEPLASE = {
  infusion: "1–2 mg/h",
  angioInterval: "12–24 h",
} as const;

export const CVT_ALTEPLASE_SOURCE_RANGES = [
  {
    id: "intraclot-protocol",
    label: "Intraclot protocol",
    citations: "[67], [8]",
    bolus: "10 mg",
    infusion: "1 mg/h",
    angio: "12-hour intervals",
    other: "Max 3 days; stop if bleeding; urokinase alternative 100,000 IU → 70,000–80,000 IU/h",
  },
  {
    id: "techniques-teaching",
    label: "Procedural techniques teaching reference",
    citations: "this section",
    bolus: "Local intrasinus bolus, then drip (dose not specified beyond infusion)",
    infusion: "1–2 mg/h",
    angio: "12–24 h",
    other: "Extensive CVT: leave microcatheter for continuous drip; may combine with MT",
  },
] as const;

export const CVT_PHARM_THROMBOLYSIS = {
  historical:
    "Historical IV urokinase (Vines & Davis); first local endovascular urokinase (Scott et al., 1988); many later series with good outcomes",
  extensiveCvt:
    "Extensive CVT: local intrasinus bolus → leave microcatheter for continuous drip",
  alteplaseInfusion: CVT_TECHNIQUE_ALTEPLASE.infusion,
  angioInterval: CVT_TECHNIQUE_ALTEPLASE.angioInterval,
  combineWithMt: "Can combine with mechanical thrombectomy techniques",
} as const;

export const CVT_ASPIRATION =
  "Large-bore distal aspiration catheters for direct thrombus aspiration in CVT; used alone or with a stent retriever";

export const CVT_STENT_RETRIEVER = {
  uses: "Alone, with local pharmacological thrombolysis, or as an anchor while the aspiration catheter is worked over the clot",
  combined:
    "Or retrieve stent + clot into the aspiration catheter / proximal guide sheath under continuous aspiration (combined capture)",
} as const;

export const CVT_BALLOON_THROMBECTOMY = {
  sequence:
    "Advance balloon past thrombus → inflate → retract toward the aspiration/guide sheath; can combine with local thrombolysis to aid removal and reduce large PE risk",
  fogarty: "3F or 4F",
  fogartyNote: "Fogarty 3F or 4F often sized for dural sinuses; lower-profile compliant/semicompliant neuro balloons also used",
} as const;

export const CVT_ANGIOPLASTY_STENTING = {
  role: "Rescue when traditional thrombectomy fails",
  firstLine: "First-line angioplasty/stenting for CVT has not been evaluated",
} as const;

export const CVT_ANGIOJET = {
  mechanism:
    "Hydrodynamic thrombolysis via high-velocity saline jets; evacuates debris through the catheter",
  practical:
    "Stiff/bulky — often used for initial partial recanalization only",
  reviewN: 185,
  evidenceNote:
    "Systematic review (n=185): AngioJet linked to lower complete recanalization and fewer good outcomes versus other devices — evidence note, not an absolute prohibition",
} as const;

export const CVT_PERIPROCEDURAL_AC = {
  context:
    "Almost all patients are already on systemic heparin before EVT → serial ACT in the suite; adjust heparin boluses",
  actTarget: "250–300 s",
  actNote: "Target ACT 250–300 s during endovascular therapy",
  reocclusion:
    "Adequate peri- and post-procedural anticoagulation is needed to prevent re-occlusion",
} as const;

export const CVT_TECHNIQUE_LIST = [
  { id: "access", label: "Access", summary: "4–5F arterial · 6F venous (7–8F if needed)" },
  { id: "pharm", label: "Local lytics", summary: "Alteplase 1–2 mg/h · angio 12–24 h" },
  { id: "aspiration", label: "Aspiration", summary: "Large-bore distal catheters ± SR" },
  { id: "stent", label: "Stent retriever", summary: "Alone, lytic adjunct, or combined capture" },
  { id: "balloon", label: "Balloon", summary: "Fogarty 3–4F or neuro balloons" },
  { id: "angioplasty", label: "Angioplasty / stent", summary: "Rescue if thrombectomy fails" },
  { id: "angiojet", label: "AngioJet", summary: "Partial recanalization; n=185 evidence note" },
  { id: "act", label: "Periprocedural AC", summary: "ACT 250–300 s" },
] as const;
