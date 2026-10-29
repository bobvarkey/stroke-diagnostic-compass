/** Pure rules: recurrent ischemic stroke despite DOAC therapy (ESC 2024, AHA/ASA 2026, BMJ 2026). */
export type Doac = "dabigatran" | "apixaban" | "rivaroxaban";
export type Exposure = "adequate" | "inadequate" | "unknown";
export type Mechanism = "cardioembolic" | "large_artery" | "lacunar" | "other" | "undetermined";
export type AntiplateletReason =
  | "none_taken" | "prior_stroke_only" | "stable_cad_gt12m" | "recent_pci_acs"
  | "recent_carotid_stent" | "severe_icas" | "no_indication";

export interface DoacInputs {
  doac: Doac;
  exposure: Exposure;
  mechanism: Mechanism;
  antiplatelet: AntiplateletReason;
}

export const DOAC_INFO: Record<Doac, { label: string; standard: string; reduced: string; renal: string; interaction: string; assay: string; reversal: string; note: string }> = {
  dabigatran: { label: "Dabigatran", standard: "150 mg BID", reduced: "110 mg BID (selected jurisdictions; not US AF)", renal: "~80%", interaction: "P-gp", assay: "dTT / ECT", reversal: "Idarucizumab", note: "Heavily renal — recheck Cockcroft-Gault CrCl." },
  apixaban: { label: "Apixaban", standard: "5 mg BID", reduced: "2.5 mg BID only if ≥2 of: age ≥80, weight ≤60 kg, SCr ≥1.5 mg/dL", renal: "~27%", interaction: "CYP3A4 / P-gp", assay: "Calibrated anti-Xa", reversal: "Andexanet alfa (where available)", note: "Inappropriate 2.5 mg reduction is a common cause of underexposure." },
  rivaroxaban: { label: "Rivaroxaban", standard: "20 mg OD", reduced: "15 mg OD for renal adjustment", renal: "~36% unchanged", interaction: "CYP3A4 / P-gp", assay: "Calibrated anti-Xa", reversal: "Andexanet alfa (where available)", note: "15/20 mg AF doses must be taken with food." },
};

export interface PlanStep { title: string; detail: string; tone: "action" | "avoid" | "caution" }

export function buildDoacRecurrencePlan(i: DoacInputs): PlanStep[] {
  const d = DOAC_INFO[i.doac];
  const s: PlanStep[] = [
    { title: "Acute safety first", detail: "If the stroke is recent: exclude haemorrhage, CTA for LVO/stenosis, consider thrombectomy regardless of DOAC; thrombolysis only per protocol and last-dose timing; individualise anticoagulation restart by infarct size and haemorrhagic transformation.", tone: "caution" },
  ];

  if (i.exposure === "inadequate") {
    s.push({ title: `Correct ${d.label} exposure`, detail: `Restore the correct AF dose (${d.standard}; reduced ${d.reduced}), address missed doses/adherence, remove or replace interacting ${d.interaction} inducers${i.doac === "rivaroxaban" ? ", and ensure it is taken with food" : ""}.`, tone: "action" });
  } else if (i.exposure === "unknown") {
    s.push({ title: "Establish drug exposure", detail: `Verify dose against age, weight, creatinine and CrCl; reconcile interactions (${d.interaction}); consider ${d.assay} level. No validated threshold proves stroke protection — a single level only confirms exposure at sampling.`, tone: "action" });
  }

  s.push({ title: "Classify the mechanism", detail: "MRI DWI/ADC/FLAIR/SWI pattern, CTA/MRA head & neck (± carotid duplex, vessel-wall MRI, TCD), TTE, TEE or cardiac CT for LAA thrombus/arch atheroma, rhythm-monitor review. Adequate anticoagulation does not exclude a competing cause.", tone: "action" });

  const mech: Record<Mechanism, PlanStep> = {
    cardioembolic: { title: "True breakthrough cardioembolism", detail: `Continue appropriately dosed ${d.label} once safe. Reassess LAA/LV thrombus and structural heart disease. For repeated events despite verified treatment, multidisciplinary discussion of LAA occlusion (evidence observational). LAA thrombus → specialist, individualised strategy.`, tone: "action" },
    large_artery: { title: "Large-artery mechanism", detail: "Symptomatic carotid stenosis: assess CEA/CAS — AF does not remove the need to treat it; coordinate periprocedural antithrombotics. Intracranial stenosis: intensive LDL/BP management; DAPT data should not be extrapolated to patients needing a DOAC — individualise.", tone: "action" },
    lacunar: { title: "Small-vessel / lacunar", detail: `Continue ${d.label} for AF. Optimise BP, glucose and lipids. Avoid adding antiplatelet therapy for lacunar prevention.`, tone: "action" },
    other: { title: "Other mechanism", detail: "Screen APS (DOACs interfere with lupus anticoagulant assays), malignancy, endocarditis (blood cultures — treat infection, do not intensify anticoagulation), dissection, vasculitis. Triple-positive APS → warfarin generally preferred.", tone: "action" },
    undetermined: { title: "Mechanism undetermined", detail: `Provisional plan: continue appropriately dosed ${d.label} when safe and complete vascular + cardiac work-up before changing long-term therapy.`, tone: "caution" },
  };
  s.push(mech[i.mechanism]);

  const ap: Record<AntiplateletReason, PlanStep | null> = {
    none_taken: null,
    prior_stroke_only: { title: "Stop the antiplatelet", detail: "Prescribed only for prior stroke — generally discontinue after confirming no independent indication (AHA/ASA 2026 III: Harm).", tone: "avoid" },
    stable_cad_gt12m: { title: "DOAC monotherapy", detail: "Stable CAD >12 months after PCI without stent thrombosis — prefer DOAC alone (ACC/AHA 2023 I, B-R).", tone: "avoid" },
    recent_pci_acs: { title: "Time-limited combination", detail: "Recent PCI/ACS — continue DOAC + clopidogrel for an individualised, limited duration. Do not stop abruptly.", tone: "caution" },
    recent_carotid_stent: { title: "Agree duration with interventionist", detail: "Recent carotid stent — set antiplatelet duration with the interventional team; abrupt cessation is hazardous.", tone: "caution" },
    severe_icas: { title: "Individualise", detail: "Severe symptomatic intracranial stenosis — limited evidence for adding antiplatelet to therapeutic DOAC; specialist review.", tone: "caution" },
    no_indication: { title: "DOAC alone", detail: "No documented antiplatelet indication — prefer DOAC monotherapy (ESC III, B).", tone: "avoid" },
  };
  const a = ap[i.antiplatelet];
  if (a) s.push(a);

  s.push({ title: "Do not", detail: `Routinely switch ${d.label} to another DOAC or warfarin (ESC III, B; warfarin switch linked to more recurrence and ICH), or add antiplatelet therapy solely to prevent AF embolism, or escalate to triple therapy.`, tone: "avoid" });
  s.push({ title: "Risk factors & follow-up", detail: "BP <130/80; LDL <70 mg/dL (<55 very-high risk) with statin ± ezetimibe/PCSK9; HbA1c ~≤7%; stop smoking; screen sleep apnoea. Review at 1–2 wk (results, renal, bleeding), 4–12 wk (lipids, BP, adherence), 3 mo (mechanism, regimen), then every 6–12 mo (renal, bleeding risk).", tone: "action" });
  return s;
}
