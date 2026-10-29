import { describe, it, expect } from "vitest";
import { buildDoacRecurrencePlan } from "@/lib/recurrentDoacPathway";

describe("recurrent stroke on DOAC pathway", () => {
  it("inadequate exposure leads with dose correction", () => {
    const p = buildDoacRecurrencePlan({ doac: "rivaroxaban", exposure: "inadequate", mechanism: "undetermined", antiplatelet: "none_taken" });
    expect(p[1].title).toBe("Correct Rivaroxaban exposure");
    expect(p[1].detail).toContain("with food");
  });
  it("antiplatelet for prior stroke only is stopped", () => {
    const p = buildDoacRecurrencePlan({ doac: "apixaban", exposure: "adequate", mechanism: "cardioembolic", antiplatelet: "prior_stroke_only" });
    expect(p.some((s) => s.title === "Stop the antiplatelet")).toBe(true);
  });
  it("other mechanism recommends warfarin for triple-positive APS", () => {
    const p = buildDoacRecurrencePlan({ doac: "dabigatran", exposure: "adequate", mechanism: "other", antiplatelet: "none_taken" });
    expect(p.find((s) => s.title === "Other mechanism")?.detail).toContain("warfarin");
  });
});

import { buildDoacRecurrencePlan as plan2 } from "@/lib/recurrentDoacPathway";
describe("apixaban + antiplatelet, adequate, undetermined", () => {
  it("gives provisional plan, asks why antiplatelet, forbids switching", () => {
    const t = plan2({ doac: "apixaban", exposure: "adequate", mechanism: "undetermined", antiplatelet: "yes_reason_unknown" }).map(p => p.title + " " + p.detail).join("\n");
    expect(t).toContain("Provisional plan for this scenario");
    expect(t).toContain("Find out why the antiplatelet was started");
    expect(t).toContain("Do not add aspirin");
    expect(t).not.toContain("Correct Apixaban exposure");
  });
});
