import { describe, it, expect } from "vitest";
import { enrichPlan, historyFlags } from "@/lib/planEnrichment";
import type { PlanStep } from "@/lib/strokePlan";
const step = (id: string): PlanStep => ({ id, phase: "Investigation", title: id, status: "info", detail: "", actionLabel: "", sectionId: id });
describe("plan enrichment", () => {
  it("anticoagulant in history adds a note to the reversal step", () => {
    const [s] = enrichPlan([step("ich-reversal")], "AF on apixaban");
    expect(s.historyNotes.some((n) => n.includes("anticoagulant"))).toBe(true);
  });
  it("empty history adds no flags", () => expect(historyFlags("  ")).toEqual([]));
  it("CTA and catheter angiogram steps carry references", () => {
    const [cta, dsa] = enrichPlan([step("sich-cta"), step("sich-dsa")], "");
    expect(cta.references.length).toBeGreaterThan(0);
    expect(dsa.references.some((r) => r.url.includes("bmj.com"))).toBe(true);
  });
});
