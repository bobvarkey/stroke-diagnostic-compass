/** Shared IVT contraindication + decision-tree state feeding the Plan tab. */
import type { PlanStep } from "./strokePlan";

export const IVT_CONTRA_KEY = "ivtContra";
export const IVT_CONTRA_EVENT = "ivt-contra-updated";
export const IVT_TREE_KEY = "ivtTree";
export const IVT_TREE_EVENT = "ivt-tree-updated";

export interface IvtContraSnapshot {
  status: "eligible" | "ineligible" | "caution" | "incomplete";
  absolute: string[];
  relative: string[];
}

export type LkwWindow = "lt4_5" | "4_5to9" | "9to24" | "wakeup" | "gt24" | "";
export interface IvtTreeInput {
  ischemicOnCT: "yes" | "no" | "";        // CT/MRI excludes hemorrhage
  window: LkwWindow;
  disabling: "yes" | "no" | "";
  lvo: "yes" | "no" | "";
  mismatch: "yes" | "no" | "";            // DWI-FLAIR or CTP penumbral mismatch
  evtAvailable: "yes" | "no" | "";
}

export type IvtOutcome =
  | { kind: "incomplete"; text: string }
  | { kind: "stop"; text: string }
  | { kind: "ivt"; text: string; plusEvt: boolean }
  | { kind: "no-ivt"; text: string; plusEvt: boolean };

export function publish<T>(key: string, event: string, v: T | null) {
  try { if (v) localStorage.setItem(key, JSON.stringify(v)); else localStorage.removeItem(key); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(event, { detail: v }));
}

export function ivtDecision(t: IvtTreeInput, c: IvtContraSnapshot | null): IvtOutcome {
  if (t.ischemicOnCT === "no") return { kind: "stop", text: "Hemorrhage on imaging — no IVT. Switch to ICH pathway." };
  if (!t.ischemicOnCT || !t.window) return { kind: "incomplete", text: "Answer imaging and time-window questions." };
  const evt = t.lvo === "yes";
  const evtNote = evt ? (t.evtAvailable === "no" ? " Transfer urgently for thrombectomy (drip-and-ship)." : " Proceed to thrombectomy without waiting for IVT response.") : "";
  if (c && c.absolute.length > 0) return { kind: "no-ivt", plusEvt: evt, text: `Absolute contraindication: ${c.absolute.join("; ")}.${evt ? " Thrombectomy alone if eligible." : " Antiplatelet therapy per minor/major stroke pathway."}` };
  if (t.window === "gt24") return { kind: "no-ivt", plusEvt: false, text: "Beyond 24 h — IVT not indicated; secondary prevention pathway." };
  if (!t.disabling) return { kind: "incomplete", text: "Is the deficit disabling?" };
  if (t.disabling === "no" && !evt) return { kind: "no-ivt", plusEvt: false, text: "Minor non-disabling deficit — IVT not recommended (PRISMS/ARAMIS); use DAPT for 21 days." };
  const caution = c && c.relative.length > 0 ? ` Relative contraindications to weigh: ${c.relative.join("; ")}.` : "";
  if (t.window === "lt4_5") return { kind: "ivt", plusEvt: evt, text: `Within 4.5 h, disabling deficit: give IVT — tenecteplase 0.25 mg/kg bolus (max 25 mg) or alteplase 0.9 mg/kg.${caution}${evtNote}` };
  if (!t.mismatch) return { kind: "incomplete", text: "Extended window: is there DWI-FLAIR or CT perfusion mismatch?" };
  if (t.mismatch === "yes") {
    if (t.window === "9to24" && !evt) return { kind: "ivt", plusEvt: false, text: `9–24 h with perfusion mismatch, no LVO: consider tenecteplase (TRACE-III/CHABLIS evidence; individualise).${caution}` };
    return { kind: "ivt", plusEvt: evt, text: `${t.window === "wakeup" ? "Wake-up/unknown onset" : "Extended window"} with imaging mismatch: consider IVT (WAKE-UP / EXTEND).${caution}${evtNote}` };
  }
  return { kind: "no-ivt", plusEvt: evt, text: `No imaging mismatch beyond 4.5 h — IVT not recommended.${evt ? " Assess for thrombectomy (DAWN/DEFUSE-3 criteria)." : ""}` };
}

export function reperfusionStep(c: IvtContraSnapshot | null, t: IvtTreeInput | null): PlanStep {
  const base = { id: "reperfusion", phase: "Treatment" as const, title: "Clot-busting (IVT) / thrombectomy decision", sectionId: "ivt-decision-tree" };
  if (c && c.absolute.length > 0) {
    return { ...base, status: "pending", detail: `IVT on hold — absolute contraindication: ${c.absolute.join("; ")}. Consider thrombectomy alone if LVO.`, actionLabel: "Review contraindications", sectionId: "tpa-eligibility" };
  }
  if (!t) return { ...base, status: "pending", detail: c ? "Contraindication check started — complete the IVT decision tree." : "Complete the tPA/TNK contraindications checklist and IVT decision tree.", actionLabel: "Open IVT decision tree" };
  const o = ivtDecision(t, c);
  if (o.kind === "incomplete") return { ...base, status: "pending", detail: o.text, actionLabel: "Continue decision tree" };
  if (o.kind === "ivt") return { ...base, status: "action", detail: o.text, actionLabel: "Open IVT doses", sectionId: "thrombolytics-anticoag" };
  return { ...base, status: o.plusEvt ? "action" : "info", detail: o.text, actionLabel: "Review decision tree" };
}
