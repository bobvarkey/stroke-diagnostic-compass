/**
 * Shared Stroke Plan state + pure rules (OCCULT-5, ICH antithrombotic reversal).
 * Scores are stored in localStorage and broadcast via window events so the
 * Plan tab can aggregate them across tabs.
 */
export interface Occult5Snapshot { min: number; max: number; definitive: boolean; notApplicable: boolean }

export type Antithrombotic = "none" | "xa" | "dabigatran" | "vka" | "heparin" | "antiplatelet" | "unknown";
export interface IchReversalInput {
  agent: Antithrombotic;
  neurosurgery: boolean;
  traumatic: boolean;
  reversalAlreadyGiven: boolean;
}

export const ICH_REVERSAL_KEY = "ichReversal";
export const ICH_REVERSAL_EVENT = "ich-reversal-updated";
export const OCCULT5_KEY = "occult5";

export interface Rec { level: "do" | "avoid" | "consider" | "info"; text: string }

export function ichReversalRecommendations(i: IchReversalInput): Rec[] {
  const r: Rec[] = [];
  if (i.reversalAlreadyGiven) r.push({ level: "info", text: "Reversal already documented (e.g. before transfer) — confirm agent, dose and time before giving more." });
  switch (i.agent) {
    case "xa":
      r.push({ level: "do", text: "Factor Xa inhibitor: 4F-PCC preferred (NCS/SCCM conditional recommendation)." });
      r.push({ level: "avoid", text: "Andexanet alfa not preferred (ANNEXA-I: no mortality/functional benefit, more thrombosis). Do not combine andexanet with PCC." });
      break;
    case "dabigatran":
      r.push({ level: "do", text: "Dabigatran: idarucizumab 5 g IV; 4F-PCC if unavailable." });
      break;
    case "vka":
      r.push({ level: "do", text: "Warfarin/VKA: 4F-PCC (INR-based dose) plus vitamin K 10 mg IV." });
      break;
    case "heparin":
      r.push({ level: "do", text: "Unfractionated heparin: protamine sulfate dosed to heparin given in prior 2–3 h." });
      break;
    case "antiplatelet":
      if (i.neurosurgery) r.push({ level: "do", text: "Aspirin + neurosurgery planned: platelet transfusion conditionally recommended." });
      else r.push({ level: "avoid", text: "No platelet transfusion for non-surgical spontaneous IPH on antiplatelets (PATCH)." });
      break;
    case "unknown":
      r.push({ level: "consider", text: "Agent unknown — obtain medication history, last dose time, renal function and drug-specific levels." });
      break;
    default:
      break;
  }
  if (i.agent !== "none") r.push({ level: "info", text: "Desmopressin: no recommendation (insufficient evidence)." });
  if (i.traumatic) r.push({ level: "consider", text: "Traumatic ICH: use viscoelastic assays (TEG/ROTEM) to guide hemostatic therapy." });
  return r;
}

export interface PlanStep {
  id: string;
  phase: "Investigation" | "Treatment" | "Secondary prevention";
  title: string;
  status: "pending" | "action" | "done" | "info";
  detail: string;
  actionLabel: string;
  sectionId: string;
}

export function occult5Step(s: Occult5Snapshot | null): PlanStep {
  const base = { id: "occult5", phase: "Investigation" as const, title: "Occult cancer screen (OCCULT-5)", sectionId: "d-dimer-stroke" };
  if (!s) return { ...base, status: "pending", detail: "Not calculated.", actionLabel: "Calculate OCCULT-5" };
  if (s.notApplicable) return { ...base, status: "info", detail: "Known active cancer — evaluate cancer activity and stroke mechanism.", actionLabel: "Review D-dimer causes" };
  if (s.min >= 3) return { ...base, status: "action", detail: `Score ${s.definitive ? s.min : `${s.min}–${s.max}`} ≥3: consider targeted malignancy assessment (not diagnostic).`, actionLabel: "Open targeted screening", sectionId: "occult-cancer-screening" };
  if (s.max <= 2) return { ...base, status: "done", detail: `Score ${s.definitive ? s.min : `${s.min}–${s.max}`}: below prompt threshold; does not rule out cancer.`, actionLabel: "Review score" };
  return { ...base, status: "pending", detail: `Provisional ${s.min}–${s.max}: complete unknown items / verify assay.`, actionLabel: "Complete OCCULT-5" };
}

export function ichReversalStep(i: IchReversalInput | null): PlanStep {
  const base = { id: "ich-reversal", phase: "Treatment" as const, title: "ICH antithrombotic reversal (NCS/SCCM)", sectionId: "ich-reversal-planner" };
  if (!i) return { ...base, status: "pending", detail: "Antithrombotic exposure not recorded.", actionLabel: "Record antithrombotic" };
  if (i.agent === "none") return { ...base, status: "done", detail: "No antithrombotic — reversal not required.", actionLabel: "Review" };
  const recs = ichReversalRecommendations(i).filter((r) => r.level === "do" || r.level === "avoid");
  return { ...base, status: "action", detail: recs.map((r) => r.text).join(" ") || "Review recommendations.", actionLabel: "Open reversal planner" };
}

export function buildPlan(occult: Occult5Snapshot | null, ich: IchReversalInput | null): PlanStep[] {
  return [
    { id: "nihss", phase: "Investigation", title: "Baseline NIHSS", status: "info", detail: "Document severity to guide reperfusion.", actionLabel: "Open NIHSS", sectionId: "nihss-calculator" },
    { id: "labs", phase: "Investigation", title: "Labs incl. coagulation & D-dimer", status: "info", detail: "CBC, coagulation, renal function, D-dimer.", actionLabel: "Open lab investigations", sectionId: "lab-investigations" },
    occult5Step(occult),
    { id: "reperfusion", phase: "Treatment", title: "Reperfusion decision", status: "info", detail: "IVT / EVT eligibility, Loberamisal (investigational, ≤48 h).", actionLabel: "Open treatment recommender", sectionId: "treatment-recommender" },
    ichReversalStep(ich),
    { id: "ich-mgmt", phase: "Treatment", title: "Acute ICH management", status: "info", detail: "BP, hematoma expansion, neurosurgical review.", actionLabel: "Open ICH tab", sectionId: "acute-ich" },
    { id: "dapt", phase: "Secondary prevention", title: "Antiplatelet strategy", status: "info", detail: "DAPT / recurrent-on-DAPT ticagrelor pathway.", actionLabel: "Open DAPT pathway", sectionId: "recurrent-dapt" },
  ];
}

export function readJSON<T>(key: string): T | null {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}
