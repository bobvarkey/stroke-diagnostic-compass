/**
 * Cerebral venous thrombosis evaluation and management pathway.
 * Wording follows the supplied SNIF flowchart (source of truth).
 * Recommendations are transcribed, not independently verified.
 */

export const CVT_PATHWAY_TITLE =
  "Cerebral Venous Thrombosis Evaluation and Management";

export const CVT_ANTICOAG_NOTE =
  "Intracranial hemorrhage caused by CVT is not a contraindication to anticoagulation.";

export const CVT_ALTERNATIVE_DIAGNOSES = [
  "Arterial stroke",
  "Idiopathic intracranial hypertension",
  "Meningitis",
  "Brain abscess",
  "Brain neoplasm",
  "Mitochondrial disorder",
] as const;

export const CVT_ETIOLOGY = {
  clinical: {
    title: "Clinical assessment",
    items: [
      "Otitis",
      "Mastoiditis",
      "Facial infection",
      "Dehydration",
      "Head trauma",
      "Behçet’s syndrome",
      "Sarcoidosis",
      "Ulcerative colitis",
      "Malignancy",
      "Rheumatological conditions",
    ],
  },
  exposures: {
    title: "Exposure history",
    items: [
      "Oral contraceptive pills",
      "Chemotherapeutic agents",
      "COVID-19 vaccination",
    ],
  },
  initialLabs: {
    title: "Initial laboratory tests",
    items: [
      "Hematocrit",
      "Complete blood count",
      "Renal function",
      "Urinalysis",
      "Pregnancy test",
      "Prothrombin time",
      "Activated partial thromboplastin time",
    ],
  },
  additionalLabs: {
    title: "Additional tests as indicated",
    items: [
      "ESR",
      "D-dimer",
      "Iron studies",
      "Hypercoagulation panel",
      "Antiphospholipid panel",
      "COVID-19 infection testing",
      "MTHFR gene mutation testing",
      "Homocysteine",
      "Serum protein electrophoresis",
    ],
  },
} as const;

export const CVT_ABBREVIATIONS = [
  { abbr: "CVT", definition: "cerebral venous thrombosis" },
  { abbr: "MRV", definition: "MR venography" },
  { abbr: "CTV", definition: "CT venography" },
  { abbr: "LMWH", definition: "low-molecular-weight heparin" },
  { abbr: "VTE", definition: "venous thromboembolism" },
] as const;

export const CVT_DISCLAIMER =
  "Adapted from the supplied SNIF flowchart. Recommendations are transcribed for bedside reference and have not been independently verified. Clinical judgment and institutional guidelines supersede this tool.";

export const CVT_STABLE_DURATION = {
  transient: "Transient predisposing factors: 3–12 months",
  highRisk: "High-risk thrombophilia or recurrent VTE: Indefinite anticoagulation",
  pregnancy: "Pregnancy: LMWH preferred",
} as const;

export type CvtImagingResult = "pending" | "no-cvt" | "confirmed";
export type CvtMassEffect = "pending" | "present" | "absent";
export type CvtCourse = "pending" | "stable" | "progression";

export interface CvtPathwayState {
  imaging: CvtImagingResult;
  massEffect: CvtMassEffect;
  course: CvtCourse;
}

export const INITIAL_CVT_PATHWAY_STATE: CvtPathwayState = {
  imaging: "pending",
  massEffect: "pending",
  course: "pending",
};

export type CvtGuidanceTone = "neutral" | "info" | "urgent" | "action" | "stable" | "progression";

export interface CvtPathwayGuidance {
  tone: CvtGuidanceTone;
  title: string;
  detail: string;
}

/**
 * Next-step guidance for the interactive CVT pathway.
 * Mass-effect and anticoagulation are parallel after confirmation (not mutually exclusive).
 */
export function getCvtPathwayGuidance(state: CvtPathwayState): CvtPathwayGuidance {
  if (state.imaging === "pending") {
    return {
      tone: "neutral",
      title: "Clinical suspicion for CVT",
      detail:
        "Obtain brain and cerebral venous imaging: MRI with T2* and MRV, or head CT with CTV.",
    };
  }

  if (state.imaging === "no-cvt") {
    return {
      tone: "info",
      title: "No evidence of CVT",
      detail: `Consider alternative diagnoses: ${CVT_ALTERNATIVE_DIAGNOSES.join(", ")}.`,
    };
  }

  if (state.massEffect === "present") {
    return {
      tone: "urgent",
      title: "Mass effect with midline shift or signs of herniation",
      detail: `Consider decompressive hemicraniectomy. Still initiate parenteral anticoagulation — ${CVT_ANTICOAG_NOTE}`,
    };
  }

  if (state.course === "progression") {
    return {
      tone: "progression",
      title: "Clinical or imaging progression",
      detail:
        "Consider endovascular therapy: intrasinus thrombolysis or endovascular thrombectomy.",
    };
  }

  if (state.course === "stable") {
    return {
      tone: "stable",
      title: "Clinically and radiologically stable",
      detail: `Transition to oral anticoagulation (DOAC or warfarin). ${CVT_STABLE_DURATION.transient}. ${CVT_STABLE_DURATION.highRisk}. ${CVT_STABLE_DURATION.pregnancy}.`,
    };
  }

  return {
    tone: "action",
    title: "CVT confirmed — initiate parenteral anticoagulation",
    detail: `Subcutaneous LMWH (preferred) or IV unfractionated heparin. ${CVT_ANTICOAG_NOTE} Complete etiological evaluation in parallel.`,
  };
}
