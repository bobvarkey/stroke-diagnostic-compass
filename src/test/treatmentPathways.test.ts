import { describe, expect, it } from "vitest";
import { EMPTY_PATHWAYS, evtSteps, ichCareSteps, ivtCareSteps, preventionSteps } from "@/lib/treatmentPathways";
import { buildPlan } from "@/lib/strokePlan";
import { ivtDecision, type IvtTreeInput } from "@/lib/ivtPlan";
import { getTabForSection } from "@/lib/sectionTabs";
const tree: IvtTreeInput = { ischemicOnCT: "yes", window: "lt4_5", disabling: "yes", lvo: "no", mismatch: "", evtAvailable: "" };
const checked = { status: "eligible" as const, absolute: [], relative: [] };
const p = EMPTY_PATHWAYS;
describe("connected treatment pathways", () => {
  it("does not recommend IVT without a completed contraindications assessment", () => {
    expect(ivtDecision(tree, null).kind).toBe("incomplete");
    expect(ivtDecision(tree, { ...checked, status: "incomplete" }).kind).toBe("incomplete");
  });
  it("absolute contraindication holds IVT treatment even when BP and glucose are ready", () => {
    expect(ivtCareSteps({ ...p.ivt, bpReady: "yes", glucoseChecked: "yes" }, tree, { ...checked, absolute: ["intracranial bleeding"] })[0].status).toBe("pending");
  });
  it("IVT preparation requires BP and glucose checks", () => {
    expect(ivtCareSteps(p.ivt, tree, checked)[0].status).toBe("pending");
    expect(ivtCareSteps({ ...p.ivt, bpReady: "yes", glucoseChecked: "yes" }, tree, checked)[0].status).toBe("action");
  });
  it("documented IVT activates post-treatment surveillance", () => {
    expect(ivtCareSteps({ ...p.ivt, given: "yes", followupScan: "no" }, tree, checked)[1].status).toBe("action");
    expect(ivtCareSteps({ ...p.ivt, given: "yes", followupScan: "yes" }, tree, checked)[1].status).toBe("done");
  });
  it("a generic 9–24h mismatch is not automatic IVT eligibility", () => {
    expect(ivtDecision({ ...tree, window: "9to24", mismatch: "yes" }, checked).kind).toBe("no-ivt");
  });
  it("EVT remains actionable despite an absolute IVT contraindication", () => {
    const state = { ...p, strokeType: "ischemic" as const, evt: { ...p.evt, vessel: "anterior" as const, within24: "yes" as const, imagingReviewed: "yes" as const } };
    const plan = buildPlan(null, null, null, { ...checked, absolute: ["recent surgery"] }, tree, null, state);
    expect(plan.find(s => s.id === "reperfusion")?.status).toBe("pending");
    expect(plan.find(s => s.id === "evt-selection")?.status).toBe("action");
  });
  it("transfer requires team acceptance and availability", () => {
    expect(evtSteps({ ...p.evt, teamAccepted: "no", onsite: "no" }, tree)[1].status).toBe("pending");
    expect(evtSteps({ ...p.evt, vessel: "anterior", within24: "yes", imagingReviewed: "yes", teamAccepted: "yes", onsite: "no" }, tree)[1].status).toBe("action");
  });
  it("medium/distal and beyond-24h occlusions do not automatically trigger EVT", () => {
    expect(evtSteps({ ...p.evt, vessel: "medium" }, tree)[0].status).toBe("info");
    expect(evtSteps({ ...p.evt, vessel: "anterior", within24: "no" }, tree)[0].status).toBe("info");
  });
  it("hemorrhage blocks ischemic EVT selection", () => {
    expect(evtSteps({ ...p.evt, vessel: "anterior", within24: "yes", imagingReviewed: "yes" }, { ...tree, ischemicOnCT: "no" })[0].status).toBe("info");
    expect(evtSteps({ ...p.evt, vessel: "anterior", within24: "yes", imagingReviewed: "yes", teamAccepted: "yes", onsite: "no" }, { ...tree, ischemicOnCT: "no" })[1].status).toBe("pending");
  });
  it("invalid BP values cannot activate the ICH BP step", () => {
    for (const sbp of ["0", "301", "NaN", ""]) expect(ichCareSteps({ ...p.ich, confirmed: "yes", mildModerate: "yes", sbp })[1].status).toBe("pending");
  });
  it("ICH BP plan is pending without severity and SBP", () => {
    expect(ichCareSteps({ ...p.ich, confirmed: "yes", sbp: "170" })[1].status).toBe("pending");
    expect(ichCareSteps({ ...p.ich, confirmed: "yes", sbp: "170", mildModerate: "yes" })[1].status).toBe("action");
  });
  it("seizures trigger treatment, absent seizures do not trigger prophylaxis", () => {
    expect(ichCareSteps({ ...p.ich, confirmed: "yes", seizure: "yes" })[3].status).toBe("action");
    expect(ichCareSteps({ ...p.ich, confirmed: "yes", seizure: "no" })[3].status).toBe("info");
  });
  it("post-IVT antithrombotics stay pending until the 24-hour scan is confirmed", () => {
    const prevention = { ...p.prevention, mechanism: "af" as const, bleedingExcluded: "yes" as const, recentIvt: "yes" as const };
    expect(preventionSteps(prevention, "ischemic")[1].status).toBe("pending");
    expect(preventionSteps({ ...prevention, scan24: "yes" }, "ischemic")[1].status).toBe("action");
  });
  it("shared IVT administration overrides a contradictory no-IVT prevention answer", () => {
    const state = { ...p, ivt: { ...p.ivt, given: "yes" as const }, prevention: { ...p.prevention, mechanism: "af" as const, bleedingExcluded: "yes" as const, recentIvt: "no" as const } };
    expect(buildPlan(null, null, null, checked, tree, null, state).find(s => s.id === "prevention-antithrombotic")?.status).toBe("pending");
  });
  it("ICH does not automatically start an ischemic antithrombotic strategy", () => {
    expect(preventionSteps({ ...p.prevention, mechanism: "af", bleedingExcluded: "yes", recentIvt: "no" }, "ich")[1].status).toBe("info");
  });
  it("stroke type filters mutually exclusive treatment pathways", () => {
    const ich = buildPlan(null, null, null, null, null, null, { ...p, strokeType: "ich" });
    expect(ich.some(s => s.id === "reperfusion")).toBe(false);
    expect(ich.some(s => s.id === "ich-bp")).toBe(true);
    const ischemic = buildPlan(null, null, null, null, null, null, { ...p, strokeType: "ischemic" });
    expect(ischemic.some(s => s.id === "ich-bp")).toBe(false);
    expect(ischemic.some(s => s.id === "evt-selection")).toBe(true);
  });
  it("all new Plan next actions resolve to the owning condition tab", () => {
    for (const s of [...ivtCareSteps(p.ivt, null, null), ...evtSteps(p.evt, null), ...ichCareSteps(p.ich), ...preventionSteps(p.prevention, "")]) {
      expect(getTabForSection(s.sectionId)).toBe(s.sectionId === "ich-care-pathway" ? "hemorrhagic" : "ischemic");
    }
  });
});