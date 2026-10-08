import { reperfusionStep, ivtDecision } from "@/lib/ivtPlan";
import { describe, expect, it } from "vitest";
import { ichReversalRecommendations, occult5Step, ichReversalStep, abcd2Steps, sichSteps, buildPlan } from "@/lib/strokePlan";
import { getTabForSection } from "@/lib/sectionTabs";

const base = { neurosurgery: false, traumatic: false, reversalAlreadyGiven: false };

describe("stroke plan rules", () => {
  it("sICH 2 prompts CTA with a conditional catheter angiogram step in the plan", () => {
    const score = { score: 2, complete: true, selections: [0, 0, 0, 0] };
    const [cta, dsa] = sichSteps(score);
    expect(cta.status).toBe("action");
    expect(cta.sectionId).toBe("sich-cta");
    expect(dsa.status).toBe("info");
    expect(dsa.sectionId).toBe("sich-dsa");
    expect(buildPlan(null, null, null, null, null, score).some((s) => s.id === "sich-cta" && s.status === "action")).toBe(true);
    expect(getTabForSection(dsa.sectionId)).toBe("hemorrhagic");
  });
  it("sICH 1 does not automatically order vascular imaging", () => {
    expect(sichSteps({ score: 1, complete: true, selections: [0, 0, 0, 0] }).map((s) => s.status)).toEqual(["info", "info"]);
  });
  it("incomplete sICH remains pending even when the partial score is high", () => {
    expect(sichSteps({ score: 2, complete: false, selections: [2, null, null, null] }).map((s) => s.status)).toEqual(["pending", "pending"]);
  });
  it("prefers 4F-PCC and avoids andexanet for Xa inhibitors", () => {
    const r = ichReversalRecommendations({ ...base, agent: "xa" });
    expect(r.find((x) => x.level === "do")?.text).toMatch(/4F-PCC/);
    expect(r.find((x) => x.level === "avoid")?.text).toMatch(/Andexanet/);
  });
  it("avoids platelets in non-surgical antiplatelet IPH but gives them with surgery", () => {
    expect(ichReversalRecommendations({ ...base, agent: "antiplatelet" })[0].level).toBe("avoid");
    expect(ichReversalRecommendations({ ...base, agent: "antiplatelet", neurosurgery: true })[0].level).toBe("do");
  });
  it("adds viscoelastic assays for traumatic ICH", () => {
    expect(ichReversalRecommendations({ ...base, agent: "none", traumatic: true }).some((r) => /TEG/.test(r.text))).toBe(true);
  });
  it("OCCULT-5 ≥3 is an action; known cancer is not applicable", () => {
    expect(occult5Step({ min: 3, max: 3, definitive: true, notApplicable: false }).status).toBe("action");
    expect(occult5Step({ min: 2, max: 2, definitive: true, notApplicable: false }).status).toBe("done");
    expect(occult5Step({ min: 4, max: 4, definitive: true, notApplicable: true }).status).toBe("info");
  });
  it("no antithrombotic means reversal done", () => {
    expect(ichReversalStep({ ...base, agent: "none" }).status).toBe("done");
  });
  it("routes plan targets to their tabs", () => {
    expect(getTabForSection("stroke-plan")).toBe("plan");
    expect(getTabForSection("d-dimer-stroke")).toBe("ischemic");
  });
  it("ABCD2 ≥4 makes workup and DAPT action steps; <4 does not", () => {
    const [inv, tx] = abcd2Steps({ score: 4 });
    expect(inv.status).toBe("action"); expect(inv.phase).toBe("Investigation");
    expect(tx.status).toBe("action"); expect(tx.phase).toBe("Treatment"); expect(tx.detail).toMatch(/21 days/);
    expect(abcd2Steps({ score: 3 }).every((st) => st.status !== "action")).toBe(true);
    expect(abcd2Steps(null)[0].status).toBe("pending");
  });
  it("one absolute IVT contraindication puts reperfusion step on Pending with the reason", () => {
    const st = reperfusionStep({ status: "ineligible", absolute: ["Platelet count <100,000/mm³"], relative: [] }, null);
    expect(st.status).toBe("pending");
    expect(st.detail).toMatch(/Platelet count/);
  });
  it("IVT tree: ≤4.5 h disabling with no contraindication gives IVT; non-disabling without LVO does not", () => {
    const t = { ischemicOnCT: "yes", window: "lt4_5", disabling: "yes", lvo: "no", mismatch: "", evtAvailable: "" } as const;
    const checked = { status: "eligible", absolute: [], relative: [] } as const;
    expect(ivtDecision(t, { ...checked, absolute: [], relative: [] }).kind).toBe("ivt");
    expect(ivtDecision({ ...t, disabling: "no" }, { ...checked, absolute: [], relative: [] }).kind).toBe("no-ivt");
    expect(ivtDecision({ ...t, ischemicOnCT: "no" }, null).kind).toBe("stop");
  });
});
