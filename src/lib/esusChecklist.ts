/**
 * Verbatim ESUS slide transcription and clinical checklist.
 * Wording, figures, and citations stay here so the section can render them without rewriting.
 * The source file ended after source_verification_notes and did not include a reference bibliography.
 */

export const ESUS_TITLE =
  "Embolic stroke of undetermined source (ESUS): slide transcription and clinical checklist";

export const ESUS_SCOPE =
  "Clinical text, captions and citations visible on the eight supplied slides, in the order supplied. Line wraps and spacing are normalized. Study figures and thresholds in this section reflect the slides.";

export const ESUS_PURPOSE =
  "Document whether the minimum ESUS criteria are met and record candidate embolic sources for clinician review.";

export const ESUS_INTERPRETATION =
  "Candidate findings can coexist. Reassess the working classification if further evaluation identifies an established cause. ESUS alone and atrial cardiopathy without AF are insufficient indications for empiric anticoagulation.";

export const ESUS_RESPONSE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "uncertain", label: "Uncertain" },
  { value: "not_assessed", label: "Not assessed" },
  { value: "not_applicable", label: "Not applicable" },
] as const;

export type EsusResponse = (typeof ESUS_RESPONSE_OPTIONS)[number]["value"];

export const ESUS_DEFAULT_RESPONSE: EsusResponse = "not_assessed";

export type EsusBullet =
  | string
  | { readonly text: string; readonly sub_bullets: readonly string[] };

export interface EsusSlide {
  readonly id: string;
  readonly title: string | null;
  readonly bullets: readonly EsusBullet[];
  readonly figure_caption?: string;
  readonly additional_citation?: string;
  readonly article_label?: string;
  readonly article_title?: string;
  readonly citation?: string;
}

export const ESUS_SLIDES: readonly EsusSlide[] = [
  {
    id: "S1",
    title: "Putative mechanisms of ESUS",
    bullets: [
      "Cardiogenic sources",
      "Supracardiac /atherosclerotic sources",
      "Systemic sources – cancers/other procoagulant states",
    ],
  },
  {
    id: "S2",
    title: "Cardiogenic causes",
    bullets: [
      "1 or more of these sources may be present in 50% or more of ESUS",
      "Atrial cardiopathy – 30–40% of ESUS",
      "Biomarkers – Elevated NT-proBNP, ECG markers – abnormal P wave indices/Echo-LAE >4.6 cm",
      "PFO – up to 40–45% of cryptogenic strokes <60 years of age, especially with high risk features",
      "Subclinical AF – detected on prolonged rhythm monitoring >30 days/ILR/device interrogation – 10–16% at 3 months – higher stroke risk",
    ],
  },
  {
    id: "S3",
    title: "Supracardiac/atherosclerotic sources",
    bullets: [
      {
        text: "Carotid stenosis <50% – with high-risk features – 5 times more common in ESUS in the ipsilateral vessel.",
        sub_bullets: [
          "Intraplaque hemorrhage",
          "Thin fibrous cap",
          "Lipid rich necrotic core",
          "Ulcerated plaque",
          "Soft plaque thickness >3 mm",
        ],
      },
      "Aortic arch plaques/atheromas",
    ],
  },
  {
    id: "S4",
    title: "Aortic arch plaques",
    bullets: [
      "Complex plaques >4 mm – 9 times odds for having ischemic stroke",
      "28% of cryptogenic strokes had aortic arch plaques (Amarenco et al, NEJM 1994)",
    ],
    figure_caption:
      "Figure 1: Axial CT angiogram of aortic arch showing plaques of varying morphology. (a) Plaque >4 mm thickness. (b) Ulcerated plaque over the anterior wall of aorta. (c) Protruding plaque over the anterolateral wall of aorta",
    additional_citation:
      "Arun K, et al. Prevalence of Aortic Plaques in Cryptogenic Ischemic Stroke: Correlation to Vascular Risk Factors and Future Events. Neurol India 2022;70:182–7.",
  },
  {
    id: "S5",
    title: "Cardiogenic sources",
    bullets: [
      "Structural heart diseases",
      { text: "LA diseases", sub_bullets: ["left atrial spontaneous echo-contrast/Cor-triatriatum/Atrial cardiopathy-LAE"] },
      { text: "LV diseases", sub_bullets: ["LV dyskinetic scar/aneurysm/non-compaction/restrictive cardiomyopathy/HCM/LV dysfunction"] },
      { text: "Valvular HD", sub_bullets: ["mitral and aortic valve calcifications"] },
      { text: "Arrhythmias", sub_bullets: ["AHRE /subclinical or device detected AF"] },
      { text: "Shunts", sub_bullets: ["PFO with high-risk features – ASA/large shunt"] },
    ],
  },
  {
    id: "S6",
    title: null,
    bullets: [
      "Clues",
      "Fewer risk factors",
      "Multiple territory infarcts – 3 territory sign",
      "Elevated D-dimer >2500 ng/ml in some series",
      "Anemia, thrombocytopenia, hypoalbuminemia",
    ],
  },
  {
    id: "S7",
    title: "Cancer and ESUS",
    bullets: [
      "Mechanisms",
      "hypercoagulable processes such as non-bacterial thrombotic endocarditis (NBTE) and intravascular coagulation",
      "direct vascular injury such as tumour emboli and external compression, and",
      "treatment complications such as radiation vasculopathy and chemotherapy-induced cardiomyopathy",
      "14% of strokes in US had a prior or active malignancy",
      "50% of cancer associated strokes are grouped as ESUS",
    ],
  },
  {
    id: "S8",
    title: "Are atrial cardiopathy subgroup different?",
    article_label: "JAMA | Original Investigation",
    article_title:
      "Apixaban to Prevent Recurrence After Cryptogenic Stroke in Patients With Atrial Cardiopathy: The ARCADIA Randomized Clinical Trial",
    bullets: [
      "1015 participants with cryptogenic stroke and evidence of atrial cardiopathy",
      "apixaban did not significantly reduce recurrent stroke risk compared with aspirin",
    ],
    citation: "Kamel et al. JAMA. 2024;331(7):573–581.",
  },
];

export interface EsusChecklistItem {
  readonly id: string;
  readonly prompt: string;
  readonly required_response?: "yes" | "no";
  readonly note?: string;
  readonly record?: readonly string[];
  readonly sources?: readonly string[];
}

export interface EsusChecklistSection {
  readonly id: string;
  readonly title: string;
  readonly reference_ids: readonly string[];
  readonly slide_ids?: readonly string[];
  readonly items: readonly EsusChecklistItem[];
}

export const ESUS_SECTIONS: readonly EsusChecklistSection[] = [
  {
    id: "minimum_evaluation",
    title: "Minimum evaluation",
    reference_ids: ["hart_2014", "arcadia_2024"],
    items: [
      { id: "brain_imaging", prompt: "Brain CT or MRI reviewed", record: ["modality", "date", "infarct location and distribution"] },
      { id: "arterial_imaging", prompt: "Intracranial and extracranial arteries supplying the infarct assessed", record: ["modality", "territory", "stenosis percentage", "plaque features"] },
      { id: "ecg", prompt: "12-lead ECG reviewed" },
      { id: "echo", prompt: "TTE reviewed. Add TEE if indicated.", record: ["modality", "LVEF", "LA size", "valvular findings", "suspected embolic source"] },
      { id: "initial_rhythm_monitoring", prompt: "≥24 h of continuous rhythm monitoring", record: ["method", "hours monitored", "rhythm findings"] },
      { id: "clinical_review", prompt: "History, exam and targeted tests reviewed" },
    ],
  },
  {
    id: "classification",
    title: "ESUS criteria",
    reference_ids: ["hart_2014", "arcadia_2024"],
    items: [
      { id: "nonlacunar_infarct", prompt: "Imaging confirms nonlacunar infarct", required_response: "yes" },
      { id: "relevant_stenosis", prompt: "No ≥50% atherosclerotic stenosis in a supplying artery", required_response: "yes" },
      { id: "major_cardioembolic_source", prompt: "No major-risk cardioembolic source (e.g. AF, thrombus, mechanical valve, LVEF <30%, infective endocarditis)", required_response: "yes" },
      { id: "other_specific_cause", prompt: "No other cause (e.g. dissection, vasculitis)", required_response: "yes" },
    ],
  },
  {
    id: "cardiac",
    title: "Cardiac and paradoxical sources",
    slide_ids: ["S2", "S5", "S8"],
    reference_ids: ["esc_2024", "acc_monitoring_2024", "arcadia_2024"],
    items: [
      {
        id: "occult_af_monitoring",
        prompt: "Occult AF: 2–4 weeks of monitoring if AF would change treatment. Consider an implantable monitor in selected cases.",
        note: "When AF detection would change treatment, consider external monitoring for 2–4 weeks and an implantable monitor in selected patients.",
        record: ["monitor type", "duration", "result or follow-up date"],
      },
      {
        id: "device_detected_arrhythmia",
        prompt: "Atrial high-rate episodes / device AF: review tracing, burden and timing",
        note: "Review the tracing and clinical context before assigning a mechanism.",
        record: ["device", "tracing reviewed", "longest episode", "burden", "timing relative to stroke"],
      },
      {
        id: "atrial_cardiopathy",
        prompt: "Atrial cardiopathy: NT-proBNP, ECG P-wave indices and LA size",
        record: ["NT-proBNP and units", "ECG P-wave indices", "LA diameter and/or indexed measure"],
        note: "LA diameter >4.6 cm is a marker cited on the slide. ARCADIA used separate, prespecified criteria.",
      },
      { id: "other_la_disease", prompt: "LA spontaneous echo contrast or cor triatriatum" },
      {
        id: "lv_disease",
        prompt: "LV scar, aneurysm, cardiomyopathy, dysfunction or thrombus",
        record: ["LVEF", "wall motion", "thrombus present or absent"],
      },
      { id: "valvular_disease", prompt: "Mitral or aortic valve abnormalities" },
      {
        id: "pfo",
        prompt: "PFO / right-to-left shunt: shunt size, atrial septal aneurysm, DVT/PE clues",
        record: ["test used", "shunt size", "atrial septal aneurysm", "recent DVT/PE if clinically suspected", "competing mechanisms"],
        note: "A large shunt or atrial septal aneurysm increases the likelihood that a PFO is relevant. Interpret with age, infarct pattern and other possible causes.",
      },
      { id: "targeted_cardiac_imaging", prompt: "Targeted TEE or cardiac CT/MRI for suspected cardiac or aortic sources" },
    ],
  },
  {
    id: "arterial",
    title: "Arterial and aortic sources",
    slide_ids: ["S3", "S4"],
    reference_ids: ["esc_2024", "amarenco_1994"],
    items: [
      {
        id: "nonstenotic_carotid_plaque",
        prompt: "Ipsilateral carotid plaque <50%: haemorrhage, thin cap, lipid core, ulceration or soft plaque >3 mm",
        record: ["side and territory", "intraplaque haemorrhage", "thin or ruptured fibrous cap", "lipid-rich necrotic core", "ulceration", "soft plaque thickness in mm"],
        note: "The slide flags soft plaque thickness >3 mm. Interpret plaque morphology with the imaging modality and vascular territory.",
      },
      {
        id: "aortic_arch_plaque",
        prompt: "Aortic arch plaque: ≥4 mm, ulceration, protrusion or mobile component",
        record: ["modality", "location", "maximum thickness in mm", "ulceration", "protrusion", "mobile component"],
        note: "The original Amarenco study used ≥4 mm. Record thickness and morphology.",
      },
    ],
  },
  {
    id: "systemic",
    title: "Cancer and procoagulant states",
    slide_ids: ["S1", "S6", "S7"],
    reference_ids: ["esc_2024", "aha_cancer_2026"],
    items: [
      {
        id: "malignancy_context",
        prompt: "Cancer history, symptoms or therapy.",
        record: ["cancer type, status and stage if known", "symptoms", "vascular risk factors", "relevant cancer therapy"],
      },
      { id: "few_vascular_risk_factors", prompt: "Few conventional vascular risk factors." },
      {
        id: "multiterritory_infarcts",
        prompt: "Multiterritory infarcts, incl. three territories",
        record: ["left anterior circulation", "right anterior circulation", "posterior circulation"],
      },
      {
        id: "d_dimer",
        prompt: "D-dimer: record assay, units and context",
        record: ["value", "units", "FEU or DDU", "reference range", "competing explanations such as acute DVT/PE"],
        note: ">2500 ng/mL is a clue cited in selected series. Interpret it with the assay, units and clinical context. A single value cannot establish cancer-associated stroke.",
      },
      {
        id: "supporting_labs",
        prompt: "Anaemia, low platelets or low albumin",
        record: ["haemoglobin", "platelet count", "albumin"],
      },
      {
        id: "cancer_mechanism",
        prompt: "NBTE, coagulopathy, tumour embolism, vascular compression or therapy effects",
        note: "If valve vegetations are found, evaluate for infective endocarditis before attributing them to NBTE.",
      },
      {
        id: "other_procoagulant_state",
        prompt: "Other procoagulant states (e.g. APS)",
        note: "Use targeted testing when the result could clarify the mechanism or change management.",
      },
      {
        id: "targeted_cancer_review",
        prompt: "When suspicion is raised, has an individualised plan for cancer evaluation been documented?",
        record: ["age-appropriate screening status", "targeted tests or referrals", "follow-up"],
      },
      {
        id: "fdg_pet",
        prompt: "Consider whole-body FDG PET/CT if occult cancer is suspected",
        note: "Occult cancer imaging: Review age-appropriate screening. If the clinical picture raises suspicion (e.g. multiterritory acute infarcts or markedly elevated, otherwise unexplained D-dimer), consider contrast-enhanced body CT or whole-body FDG PET/CT based on the clinical context. PET/CT is a targeted investigation outside the minimum ESUS evaluation. Whether earlier detection improves stroke outcomes remains uncertain.",
        sources: [
          "García-Cabo et al. Detection rate of FDG-PET/CT for occult cancer in patients with cryptogenic ischaemic stroke. Eur J Nucl Med Mol Imaging. 2026. https://pubmed.ncbi.nlm.nih.gov/40944722/",
        ],
      },
    ],
  },
];

export const ESUS_CLASSIFICATION_RULES = [
  { outcome: "esus_criteria_not_met", condition: "Any classification item has a definitive response opposite to its required_response." },
  { outcome: "evaluation_incomplete_or_indeterminate", condition: "Otherwise, any minimum evaluation item lacks a yes response or any classification item lacks its required definitive response." },
  { outcome: "meets_esus_criteria_after_minimum_evaluation", condition: "All minimum evaluation items are yes and all classification items match their required_response." },
] as const;

export type EsusOutcome = (typeof ESUS_CLASSIFICATION_RULES)[number]["outcome"];

export const ESUS_SOURCE_NOTES = [
  {
    slide_id: "S4",
    reference_id: "amarenco_1994",
    note: "The original case-control study used plaque thickness ≥4 mm. Plaques at this threshold were present in 28.2% of patients with brain infarction of no obvious cause. The adjusted odds ratio for ischaemic stroke was 9.1 (95% CI 3.3–25.2) in the case-control analysis.",
  },
  {
    slide_id: "S8",
    reference_id: "arcadia_2024",
    note: "ARCADIA enrolled 1,015 participants with cryptogenic stroke and atrial cardiopathy without AF at randomisation. Atrial cardiopathy eligibility required at least one of the following: P-wave terminal force in V1 >5,000 µV·ms, NT-proBNP >250 pg/mL, or LA diameter index ≥3 cm/m². Annualised recurrent stroke rates were 4.4% in both groups, HR 1.00 (95% CI 0.64–1.55).",
  },
] as const;

export const ESUS_REFERENCE_TEXT: Record<string, string> = {
  hart_2014: "Hart RG et al. Embolic strokes of undetermined source: the case for a new clinical construct. Lancet Neurol. 2014. https://doi.org/10.1016/S1474-4422(13)70310-7",
  esc_2024: "Ntaios G et al. ESC clinical consensus statement on ESUS. Eur Heart J. 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC11107123/",
  acc_monitoring_2024: "ACC Expert Consensus Decision Pathway on Practical Approaches for Arrhythmia Monitoring After Stroke. 2024. https://doi.org/10.1016/j.jacc.2024.10.100",
  amarenco_1994: "Amarenco P et al. Atherosclerotic disease of the aortic arch and the risk of ischemic stroke. N Engl J Med. 1994. https://pubmed.ncbi.nlm.nih.gov/7969297/",
  arcadia_2024: "Kamel H et al. The ARCADIA randomized clinical trial. JAMA. 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC10851142/",
  aha_asa_2021: "Kleindorfer DO et al. AHA/ASA guideline for the prevention of stroke in patients with stroke and transient ischemic attack. Stroke. 2021. https://doi.org/10.1161/STR.0000000000000375",
  aha_cancer_2026: "AHA scientific statement on ischaemic stroke in active cancer. https://doi.org/10.1161/STR.0000000000000517",
};

export const ESUS_SLIDE_CLASSIFY =
  "Classify as ESUS when the minimum evaluation is complete and all four criteria are met.";

export const ESUS_SLIDE_ANTICOAGULATION =
  "ESUS or atrial cardiopathy alone does not justify empiric anticoagulation.";

export const ESUS_REVIEW_SUMMARY =
  "Working classification, candidate mechanisms, supporting evidence, competing causes, pending tests and follow-up, and clinician-adjudicated aetiology.";

export const ESUS_OUTCOME_LABEL: Record<EsusOutcome, string> = {
  esus_criteria_not_met: "ESUS criteria not met",
  evaluation_incomplete_or_indeterminate: "Evaluation incomplete or indeterminate",
  meets_esus_criteria_after_minimum_evaluation: "Meets ESUS criteria after minimum evaluation",
};

const DEFINITIVE_RESPONSES = new Set<EsusResponse>(["yes", "no"]);

export function esusResponseLabel(value: EsusResponse): string {
  return ESUS_RESPONSE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function responseFor(
  answers: Readonly<Record<string, EsusResponse | undefined>>,
  itemId: string,
): EsusResponse {
  return answers[itemId] ?? ESUS_DEFAULT_RESPONSE;
}

export function classifyEsus(
  answers: Readonly<Record<string, EsusResponse | undefined>>,
): EsusOutcome {
  const classification = ESUS_SECTIONS.find((section) => section.id === "classification");
  const minimum = ESUS_SECTIONS.find((section) => section.id === "minimum_evaluation");
  const opposite = classification?.items.some((item) => {
    const response = responseFor(answers, item.id);
    return Boolean(item.required_response)
      && DEFINITIVE_RESPONSES.has(response)
      && response !== item.required_response;
  }) ?? false;
  if (opposite) return "esus_criteria_not_met";

  const minimumIncomplete = minimum?.items.some((item) => responseFor(answers, item.id) !== "yes") ?? true;
  const classificationIncomplete = classification?.items.some(
    (item) => responseFor(answers, item.id) !== item.required_response,
  ) ?? true;
  if (minimumIncomplete || classificationIncomplete) return "evaluation_incomplete_or_indeterminate";
  return "meets_esus_criteria_after_minimum_evaluation";
}

/** Plain-text copy: checklist name, answered items only, then the classification outcome. */
export function formatEsusChecklistCopy(
  answers: Readonly<Record<string, EsusResponse | undefined>>,
): string {
  const lines = [ESUS_TITLE];
  for (const section of ESUS_SECTIONS) {
    for (const item of section.items) {
      const response = responseFor(answers, item.id);
      if (response === ESUS_DEFAULT_RESPONSE) continue;
      lines.push(`${item.prompt}: ${esusResponseLabel(response)}`);
    }
  }
  lines.push(ESUS_OUTCOME_LABEL[classifyEsus(answers)]);
  return lines.join("\n");
}

export function slideInfoNotes(slideId: string): string[] {
  return ESUS_SOURCE_NOTES.filter((note) => note.slide_id === slideId).map((note) => note.note);
}

export function sectionInfoNotes(section: EsusChecklistSection): string[] {
  const citations = section.reference_ids.flatMap((id) => {
    const text = ESUS_REFERENCE_TEXT[id];
    return text ? [text] : [];
  });
  const notes = ESUS_SOURCE_NOTES
    .filter((note) => section.reference_ids.includes(note.reference_id))
    .map((note) => note.note);
  return [...citations, ...notes];
}

export function itemInfoNotes(item: EsusChecklistItem): string[] {
  return [...(item.note ? [item.note] : []), ...(item.record ?? []), ...(item.sources ?? [])];
}

export function classificationInfoNotes(outcome: EsusOutcome): string[] {
  const rule = ESUS_CLASSIFICATION_RULES.find((entry) => entry.outcome === outcome);
  const interpretationReferences = ["esc_2024", "aha_asa_2021", "arcadia_2024"].flatMap((id) => {
    const text = ESUS_REFERENCE_TEXT[id];
    return text ? [text] : [];
  });
  return [
    ESUS_OUTCOME_LABEL[outcome],
    ...(rule ? [rule.condition] : []),
    ESUS_SLIDE_CLASSIFY,
    ESUS_INTERPRETATION,
    ESUS_SLIDE_ANTICOAGULATION,
    ESUS_REVIEW_SUMMARY,
    ...interpretationReferences,
  ];
}

export const ESUS_ITEM_COUNT = ESUS_SECTIONS.reduce((count, section) => count + section.items.length, 0);
