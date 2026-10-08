import type { PlanStep } from "./strokePlan";

export const HISTORY_NOTES_KEY = "strokePatientHistoryNotes";
export const HISTORY_NOTES_EVENT = "stroke-history-notes-updated";

export interface Reference { label: string; url: string }

const R = {
  ais2019: { label: "Powers et al. AHA/ASA Acute Ischemic Stroke Guideline 2019 (Stroke)", url: "https://www.ahajournals.org/doi/10.1161/STR.0000000000000211" },
  ich2022: { label: "Greenberg et al. AHA/ASA Spontaneous ICH Guideline 2022 (Stroke)", url: "https://www.ahajournals.org/doi/10.1161/STR.0000000000000407" },
  diagram: { label: "van Asch et al. DIAGRAM: CTA, MRI and catheter angiography in ICH (BMJ 2015)", url: "https://www.bmj.com/content/351/bmj.h5762" },
  sich: { label: "Delgado Almandoz et al. Secondary ICH score (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Delgado+Almandoz+secondary+intracerebral+hemorrhage+score" },
  wakeup: { label: "Thomalla et al. WAKE-UP: MRI DWI-FLAIR mismatch-guided IVT (NEJM 2018)", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1804355" },
  dawn: { label: "Nogueira et al. DAWN: thrombectomy 6–24 h (NEJM 2018)", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1706442" },
  defuse3: { label: "Albers et al. DEFUSE 3: CT/MR perfusion-selected thrombectomy (NEJM 2018)", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1713973" },
  tia2009: { label: "Easton et al. AHA/ASA Definition & Evaluation of TIA 2009 (Stroke)", url: "https://www.ahajournals.org/doi/10.1161/STROKEAHA.108.192218" },
  prev2021: { label: "Kleindorfer et al. AHA/ASA Secondary Prevention Guideline 2021 (Stroke)", url: "https://www.ahajournals.org/doi/10.1161/STR.0000000000000375" },
};

/** Imaging-related Plan steps (CT, MRI, CTA, catheter angiogram) and their supporting sources. */
export const STEP_REFERENCES: Record<string, Reference[]> = {
  "sich-cta": [R.ich2022, R.diagram, R.sich],
  "sich-dsa": [R.ich2022, R.diagram, R.sich],
  "ich-imaging": [R.ich2022, R.diagram],
  "ivt-eligibility": [R.ais2019, R.wakeup],
  "ivt-aftercare": [R.ais2019],
  "evt-selection": [R.ais2019, R.dawn, R.defuse3],
  "abcd2-workup": [R.tia2009, R.ais2019],
  "prevention-carotid": [R.prev2021],
  "prevention-mechanism": [R.prev2021],
};

interface HistoryRule { label: string; pattern: RegExp; steps: string[]; note: string }

const RULES: HistoryRule[] = [
  { label: "Anticoagulant use", pattern: /\b(warfarin|acenocoumarol|vka|apixaban|rivaroxaban|edoxaban|dabigatran|doac|noac|heparin|enoxaparin|anticoag\w*)\b/i, steps: ["ivt-eligibility", "ich-reversal", "prevention-antithrombotic"], note: "History mentions anticoagulant use — confirm agent, last dose time and levels before IVT; record it in the reversal planner if hemorrhage." },
  { label: "Antiplatelet use", pattern: /\b(aspirin|clopidogrel|ticagrelor|prasugrel|antiplatelet|dapt)\b/i, steps: ["ich-reversal", "prevention-antithrombotic"], note: "History mentions antiplatelet use — consider in reversal and prevention choices." },
  { label: "Atrial fibrillation", pattern: /\b(af|atrial fibrillation|afib|a-fib)\b/i, steps: ["prevention-mechanism", "prevention-antithrombotic"], note: "History mentions AF — cardioembolic mechanism likely; plan anticoagulation timing." },
  { label: "Cancer", pattern: /\b(cancer|malignan\w*|carcinoma|lymphoma|metasta\w*|chemotherapy)\b/i, steps: ["occult5"], note: "History mentions cancer — OCCULT-5 is for occult cancer; if active cancer is known, assess cancer-associated stroke instead." },
  { label: "Prior ICH / bleeding", pattern: /\b(prior|previous|old|history of)\s+(ich|intracranial (hemorrhage|haemorrhage|bleed)|brain bleed|bleed\w*)/i, steps: ["ivt-eligibility", "prevention-antithrombotic"], note: "History mentions prior bleeding — check IVT contraindications and bleeding risk." },
  { label: "Recent surgery / trauma", pattern: /\b(surgery|operation|trauma|head injury|fall)\b/i, steps: ["ivt-eligibility"], note: "History mentions surgery/trauma — check timing against IVT contraindications." },
  { label: "Seizure at onset", pattern: /\b(seizure|fit|convuls\w*|epilep\w*)\b/i, steps: ["ivt-eligibility", "ich-seizures"], note: "History mentions seizure — consider stroke mimic; vascular imaging helps confirm." },
  { label: "Hypertension", pattern: /\b(hypertension|htn|high blood pressure)\b/i, steps: ["prevention-bp", "sich-cta"], note: "History mentions hypertension — relevant to BP targets and to sICH probability." },
  { label: "Diabetes", pattern: /\b(diabetes|dm|t2dm|insulin)\b/i, steps: ["prevention-lifestyle"], note: "History mentions diabetes — check glucose and include in risk-factor plan." },
  { label: "Pregnancy / postpartum", pattern: /\b(pregnan\w*|postpartum|post-partum|puerper\w*)\b/i, steps: ["ivt-eligibility", "sich-cta"], note: "History mentions pregnancy/postpartum — specialist input; consider CVT and venous imaging." },
  { label: "Renal impairment", pattern: /\b(ckd|renal (failure|impairment)|dialysis|kidney disease)\b/i, steps: ["sich-cta", "evt-selection"], note: "History mentions renal impairment — weigh contrast load and adjust renally cleared drugs." },
  { label: "Contrast allergy", pattern: /\bcontrast allerg\w*|allerg\w* to contrast\b/i, steps: ["sich-cta", "sich-dsa", "evt-selection"], note: "History mentions contrast allergy — premedicate or consider MRA per protocol." },
];

export interface HistoryFlag { label: string; steps: string[]; note: string }

export function historyFlags(text: string): HistoryFlag[] {
  if (!text.trim()) return [];
  return RULES.filter((r) => r.pattern.test(text)).map(({ label, steps, note }) => ({ label, steps, note }));
}

export type EnrichedStep = PlanStep & { references: Reference[]; historyNotes: string[] };

export function enrichPlan(plan: PlanStep[], notes: string): EnrichedStep[] {
  const flags = historyFlags(notes);
  return plan.map((s) => {
    const key = s.id === "reperfusion" || s.id === "ivt-preparation" ? "ivt-eligibility" : s.id;
    return { ...s, references: STEP_REFERENCES[key] ?? STEP_REFERENCES[s.id] ?? [], historyNotes: flags.filter((f) => f.steps.includes(s.id) || f.steps.includes(key)).map((f) => f.note) };
  });
}
