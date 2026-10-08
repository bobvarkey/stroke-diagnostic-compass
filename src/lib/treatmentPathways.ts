import type { PlanStep } from "./strokePlan";
import type { IvtContraSnapshot, IvtTreeInput } from "./ivtPlan";
import { ivtDecision } from "./ivtPlan";

export const PATHWAYS_KEY = "strokeTreatmentPathways";
export const PATHWAYS_EVENT = "stroke-treatment-pathways-updated";
export type Answer = "" | "yes" | "no";
export interface TreatmentPathways {
  strokeType: "" | "ischemic" | "ich";
  ivt: { bpReady: Answer; glucoseChecked: Answer; given: Answer; followupScan: Answer };
  evt: { vessel: "" | "anterior" | "basilar" | "medium" | "none"; within24: Answer; imagingReviewed: Answer; teamAccepted: Answer; onsite: Answer; performed: Answer; followup: Answer };
  ich: { confirmed: Answer; sbp: string; mildModerate: Answer; deterioration: Answer; hydrocephalus: Answer; cerebellarConcern: Answer; seizure: Answer; repeatScan: Answer; swallow: Answer; stableScan: Answer };
  prevention: { mechanism: "" | "noncardioembolic" | "af" | "valvular" | "esus" | "ich"; bleedingExcluded: Answer; minorHighRisk: Answer; earlyPresentation: Answer; bleedingRisk: Answer; recentIvt: Answer; scan24: Answer; carotid: Answer; bpReviewed: Answer; lipidsReviewed: Answer; lifestyleReviewed: Answer; rehabReviewed: Answer };
}
export const EMPTY_PATHWAYS: TreatmentPathways = {
  strokeType: "",
  ivt: { bpReady: "", glucoseChecked: "", given: "", followupScan: "" },
  evt: { vessel: "", within24: "", imagingReviewed: "", teamAccepted: "", onsite: "", performed: "", followup: "" },
  ich: { confirmed: "", sbp: "", mildModerate: "", deterioration: "", hydrocephalus: "", cerebellarConcern: "", seizure: "", repeatScan: "", swallow: "", stableScan: "" },
  prevention: { mechanism: "", bleedingExcluded: "", minorHighRisk: "", earlyPresentation: "", bleedingRisk: "", recentIvt: "", scan24: "", carotid: "", bpReviewed: "", lipidsReviewed: "", lifestyleReviewed: "", rehabReviewed: "" },
};
const step = (id: string, phase: PlanStep["phase"], title: string, status: PlanStep["status"], detail: string, sectionId: string): PlanStep => ({ id, phase, title, status, detail, sectionId, actionLabel: "Review next action" });
const reviewed = (v: Answer): PlanStep["status"] => v === "yes" ? "done" : v === "no" ? "action" : "pending";

export function ivtCareSteps(p: TreatmentPathways["ivt"], t: IvtTreeInput | null, c: IvtContraSnapshot | null): PlanStep[] {
  const eligible = t && ivtDecision(t, c).kind === "ivt" && c && c.status !== "incomplete" && !c.absolute.length;
  const held = !eligible || p.bpReady !== "yes" || p.glucoseChecked !== "yes";
  return [
    step("ivt-preparation", "Treatment", "IVT preparation & treatment", p.given === "yes" ? "done" : held ? "pending" : "action", p.given === "yes" ? "IVT administration documented; confirm drug, dose and time in the treatment record." : !eligible ? "Complete eligibility and contraindications before treatment. An IVT hold does not exclude thrombectomy." : p.bpReady !== "yes" ? "Confirm BP <185/110 mmHg before IVT; use local BP protocol and reassess eligibility." : p.glucoseChecked !== "yes" ? "Check glucose and correct hypoglycemia / stroke mimics before IVT." : "Stroke-team confirmation required: TNK 0.25 mg/kg (max 25 mg) or alteplase 0.9 mg/kg (max 90 mg; 10% bolus, remainder over 60 minutes). Do not delay EVT.", "ivt-care-pathway"),
    step("ivt-aftercare", "Treatment", "Post-IVT monitoring & 24-hour imaging", p.given !== "yes" ? "pending" : reviewed(p.followupScan), p.given !== "yes" ? "Await documented treatment; monitoring must begin immediately if IVT is given." : "Stroke-unit monitoring, BP <180/105 mmHg for 24 hours; avoid intensive lowering <140. Withhold antithrombotics for 24 hours and obtain CT/MRI before starting. New headache, vomiting or neurological decline: stop ongoing infusion and obtain urgent CT / hemorrhage management.", "ivt-care-pathway"),
  ];
}

export function evtSteps(p: TreatmentPathways["evt"], t: IvtTreeInput | null): PlanStep[] {
  let status: PlanStep["status"] = "pending";
  let detail = "Obtain CTA/MRA and establish vessel, last-known-well, NIHSS, baseline function and infarct burden. Do not wait for IVT response.";
  if (t?.ischemicOnCT === "no") { status = "info"; detail = "Hemorrhage on imaging: acute ICH pathway takes priority; do not pursue ischemic reperfusion from this assessment."; }
  else if (p.vessel === "none" || (t?.lvo === "no" && !p.vessel)) { status = "info"; detail = "No treatable large-vessel occlusion documented. Continue IVT assessment when eligible and medical management; reassess vascular imaging if deterioration occurs."; }
  else if (p.vessel === "medium") { status = "info"; detail = "Medium/distal vessel occlusion: routine EVT is not established; specialist review or an appropriate trial rather than automatic thrombectomy."; }
  else if (p.within24 === "no") { status = "info"; detail = "Beyond 24 hours: not a routine guideline-supported EVT pathway; individualized comprehensive stroke-center review."; }
  else if (p.vessel && p.within24 === "yes") {
    status = p.imagingReviewed === "yes" ? "action" : "pending";
    detail = `${p.vessel === "basilar" ? "Basilar occlusion: assess posterior circulation imaging and severity; selected patients within 24 h, especially NIHSS ≥10, benefit from EVT." : "Anterior proximal LVO within 24 h: assess ASPECTS/core, NIHSS and baseline function; selected large-core patients may benefit. Do not exclude using a score alone."} ${p.imagingReviewed === "yes" ? "Request immediate neurointerventional acceptance." : "Complete stroke-team imaging selection; occlusion alone is not eligibility."}`;
  }
  const transferReady = status === "action" && p.teamAccepted === "yes" && Boolean(p.onsite);
  return [
    step("evt-selection", "Treatment", "Thrombectomy: vessel & imaging selection", status, detail, "evt-pathway"),
    step("evt-transfer", "Treatment", "Thrombectomy: acceptance & transfer", p.performed === "yes" ? "done" : transferReady ? "action" : "pending", p.performed === "yes" ? "Procedure documented; record reperfusion result and complications." : status !== "action" ? "Complete vessel, timing and imaging selection before a procedural transfer recommendation. Urgent specialist referral can proceed in parallel; hemorrhage or conflicting information requires reassessment." : p.teamAccepted !== "yes" ? "Confirm neurointerventional acceptance; urgent referral can proceed while eligibility is assessed. IVT contraindications do not themselves exclude EVT." : p.onsite === "no" ? "Arrange urgent transfer to the accepting EVT center; send imaging, LKW, exam and treatment times. Give IVT first if eligible without delaying transfer." : p.onsite === "yes" ? "Proceed with the accepted EVT plan; do not wait to assess IVT response." : "Confirm on-site availability or transfer destination.", "evt-pathway"),
    step("evt-followup", "Treatment", "Post-thrombectomy care", p.performed === "yes" ? reviewed(p.followup) : "pending", "Document eTICI, serial NIHSS, access-site bleeding and follow-up brain imaging. Individualize BP with the team; avoid routine intensive SBP lowering <140 after successful reperfusion. Antithrombotic timing depends on IVT, hemorrhage and stenting.", "evt-pathway"),
  ];
}

export function ichCareSteps(p: TreatmentPathways["ich"]): PlanStep[] {
  const confirmed = p.confirmed === "yes";
  const emergency = p.deterioration === "yes" || p.hydrocephalus === "yes" || p.cerebellarConcern === "yes";
  const sbp = Number(p.sbp);
  const validBp = Boolean(p.sbp) && Number.isFinite(sbp) && sbp >= 40 && sbp <= 300;
  const bpDetail = !p.sbp ? "Record SBP and assess severity." : p.mildModerate === "yes" && sbp >= 150 && sbp <= 220 ? "Mild–moderate spontaneous ICH, SBP 150–220: smoothly target 140 and maintain 130–150 mmHg; avoid <130." : "Large/severe ICH, surgical cases or SBP outside 150–220: individualize BP reduction with neurocritical care; avoid hypotension and abrupt variability.";
  return [
    step("ich-stabilize", "Treatment", "ICH: stabilization & neurosurgical triage", !confirmed ? "pending" : "action", !confirmed ? "Confirm spontaneous ICH on CT/MRI. Post-IVT hemorrhage and trauma require their specific protocols." : emergency ? "Urgent neurocritical/neurosurgical assessment for deterioration, hydrocephalus or cerebellar compression. Hydrocephalus with reduced consciousness may need ventricular drainage; cerebellar hemorrhage with deterioration, brainstem compression, hydrocephalus or volume ≥15 mL warrants urgent surgical assessment." : "Assess airway, GCS, pupils and hematoma location/volume; admit to a stroke/neurocritical unit. Severity scores must not be the sole basis for limiting treatment.", "ich-care-pathway"),
    step("ich-bp", "Treatment", "ICH: smooth blood-pressure control", !confirmed || !validBp || !p.mildModerate ? "pending" : "action", !validBp ? "Record a valid SBP (40–300 mmHg) and assess severity; immediately verify extreme readings clinically." : bpDetail, "ich-care-pathway"),
    step("ich-imaging", "Investigation", "ICH: repeat imaging & expansion surveillance", confirmed ? reviewed(p.repeatScan) : "pending", "Serial neurological examination and repeat CT during the first 24 hours per local protocol; immediate CT for deterioration. Review CTA/CTV and sICH-directed vascular investigation without delaying urgent care.", "ich-care-pathway"),
    step("ich-seizures", "Treatment", "ICH: seizure assessment", !confirmed || !p.seizure ? "pending" : p.seizure === "yes" ? "action" : "info", p.seizure === "yes" ? "Treat clinical or electrographic seizures. Consider continuous EEG for unexplained fluctuating mental state or suspected seizures." : "Do not routinely prescribe prophylactic antiseizure medication without seizures; consider EEG when clinically indicated.", "ich-care-pathway"),
    step("ich-supportive", "Treatment", "ICH: swallowing, VTE prevention & rehabilitation", !confirmed ? "pending" : p.swallow === "yes" && p.stableScan === "yes" ? "info" : "pending", "Swallow screen before oral intake; intermittent pneumatic compression from diagnosis. Low-dose UFH/LMWH prophylaxis at 24–48 h may be reasonable after bleeding stability is confirmed, not therapeutic anticoagulation. Start coordinated rehabilitation when medically stable; avoid aggressive mobilization in the first 24 h.", "ich-care-pathway"),
  ];
}

export function preventionSteps(p: TreatmentPathways["prevention"], strokeType: TreatmentPathways["strokeType"]): PlanStep[] {
  const hemorrhage = strokeType === "ich" || p.mechanism === "ich";
  const hold = p.bleedingExcluded !== "yes" || !p.recentIvt || (p.recentIvt === "yes" && p.scan24 !== "yes");
  let status: PlanStep["status"] = "pending";
  let detail = "Establish stroke mechanism, hemorrhage status, timing and bleeding risk before selecting antithrombotic treatment.";
  if (hemorrhage) { status = "info"; detail = "After ICH, do not automatically start antiplatelets or anticoagulation. Reassess indication and recurrent-bleeding risk with specialists; for nonvalvular AF, restarting around 7–8 weeks may be considered, individualized. Mechanical valves require a separate specialist timing decision."; }
  else if (hold) detail = "Antithrombotics on hold pending hemorrhage exclusion and treatment history; after IVT wait ≥24 h and confirm follow-up CT/MRI excludes hemorrhage. Urgent stenting exceptions require specialist protocols.";
  else if (p.mechanism === "af") { status = "action"; detail = "AF-associated stroke: oral anticoagulation rather than antiplatelets alone, when safe. Choose timing from infarct size, severity, hemorrhagic transformation and repeat imaging; DOAC generally preferred in eligible nonvalvular AF. Review renal function and interactions; no routine heparin bridge."; }
  else if (p.mechanism === "valvular") { status = "action"; detail = "Mechanical valve or moderate/severe rheumatic mitral stenosis: specialist-directed VKA anticoagulation, not a DOAC; individualize start/restart and bridging based on thrombotic and intracranial bleeding risk."; }
  else if (p.mechanism === "esus") { status = "info"; detail = "ESUS: antiplatelet treatment while completing vascular imaging, rhythm monitoring and selected echocardiography. Do not empirically prescribe anticoagulation or ticagrelor solely for ESUS or elevated D-dimer."; }
  else if (p.mechanism === "noncardioembolic") {
    status = !p.minorHighRisk || !p.earlyPresentation || !p.bleedingRisk ? "pending" : "action";
    detail = p.minorHighRisk === "yes" && p.earlyPresentation === "yes" && p.bleedingRisk === "no" ? "Selected early minor noncardioembolic stroke (NIHSS ≤3) or high-risk TIA (ABCD² ≥4): aspirin + clopidogrel for 21 days, then single antiplatelet. Confirm timing, diagnosis and exclusions; ticagrelor-based DAPT has separate eligibility and bleeding trade-offs. Do not use long-term DAPT routinely." : "Single antiplatelet is usual for noncardioembolic stroke; assess early presentation, NIHSS/ABCD², symptomatic stenosis and bleeding risk before short-term DAPT. A risk score alone is not treatment eligibility.";
  }
  return [
    step("prevention-mechanism", "Investigation", "Define stroke mechanism", p.mechanism ? "info" : "pending", "Complete head/neck vascular imaging, ECG/telemetry, extended rhythm monitoring when indicated and selected echocardiography. Assess symptomatic carotid/intracranial stenosis and alternative causes; review OCCULT-5 when applicable.", "secondary-prevention-pathway"),
    step("prevention-antithrombotic", "Secondary prevention", "Mechanism-based antithrombotic strategy", status, detail, "secondary-prevention-pathway"),
    step("prevention-carotid", "Secondary prevention", "Symptomatic carotid disease", p.carotid === "yes" ? "action" : p.carotid === "no" ? "info" : "pending", "Symptomatic extracranial carotid stenosis: expedited vascular/stroke-team review for revascularization; assess degree, disability, anatomy and procedural risk. Appropriate non-disabling cases are generally considered within 2 weeks, not automatically from a score.", "secondary-prevention-pathway"),
    step("prevention-bp", "Secondary prevention", "Long-term BP strategy", reviewed(p.bpReviewed), "For most stable stroke survivors, aim <130/80 mmHg if tolerated; individualize for stenosis, frailty and orthostasis. This is not an acute IVT/EVT/ICH BP target.", "secondary-prevention-pathway"),
    step("prevention-lipids", "Secondary prevention", "Lipids, diabetes & vascular risk", reviewed(p.lipidsReviewed), hemorrhage ? "After ICH, statin benefit/risk is uncertain; individualize based on atherosclerotic indication rather than automatic escalation. Review diabetes and other vascular risks." : "Review high-intensity/maximally tolerated statin and LDL target (<70 mg/dL in atherosclerotic stroke per AHA guidance), adding ezetimibe/PCSK9 therapy when indicated; integrate the existing lipid risk module and individualized diabetes care.", "secondary-prevention-pathway"),
    step("prevention-lifestyle", "Secondary prevention", "Lifestyle, adherence & follow-up", reviewed(p.lifestyleReviewed), "Smoking cessation, Mediterranean-style diet, physical activity matched to disability, adherence and bleeding surveillance; arrange stroke follow-up and clear recurrence/emergency advice.", "secondary-prevention-pathway"),
    step("prevention-rehab", "Secondary prevention", "Recovery & discharge plan", reviewed(p.rehabReviewed), "Review mRS, mobility, swallowing, communication, cognition and caregiver support; agree rehabilitation goals and follow-up with the multidisciplinary team.", "secondary-prevention-pathway"),
  ];
}