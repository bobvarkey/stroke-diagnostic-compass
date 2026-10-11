import { describe, it, expect } from "vitest";
import {
  alteplaseDose, tenecteplaseDose, thrombolyticDoses,
  ALTEPLASE_MAX_MG, TENECTEPLASE_MAX_MG, MAX_WEIGHT_KG,
} from "@/lib/thrombolyticDose";

/** The number a reader cannot verify at a glance, and the one it would be dangerous to get wrong. */
const mg = (s: string) => Number(s.replace(/ mg.*$/, ""));

describe("thrombolytic dosing", () => {
  it("doses both drugs by weight below the cap", () => {
    const d = thrombolyticDoses(60)!;
    expect(d.alteplase.total).toBe("54.0 mg");
    expect(d.tenecteplase.total).toBe("15.0 mg");
  });

  it("splits alteplase 10/90 into bolus and infusion", () => {
    const a = alteplaseDose(60)!;
    expect(mg(a.bolus)).toBeCloseTo(5.4, 1);
    expect(mg(a.infusion)).toBeCloseTo(48.6, 1);
    expect(mg(a.bolus) + mg(a.infusion)).toBeCloseTo(54, 1);
  });

  it("gives tenecteplase as one bolus and no infusion", () => {
    const t = tenecteplaseDose(60)!;
    expect(t.infusion).toBeNull();
    expect(mg(t.bolus)).toBeCloseTo(mg(t.total), 1);
    expect(t.bolus).toMatch(/single|bolus/);
  });

  it("holds each drug at its own maximum above the cap", () => {
    for (const kg of [MAX_WEIGHT_KG, 130, 200]) {
      expect(mg(thrombolyticDoses(kg)!.alteplase.total)).toBe(ALTEPLASE_MAX_MG);
      expect(mg(thrombolyticDoses(kg)!.tenecteplase.total)).toBe(TENECTEPLASE_MAX_MG);
    }
  });

  it("caps both at the same body weight, so one cap governs both drugs", () => {
    expect(ALTEPLASE_MAX_MG / 0.9).toBe(MAX_WEIGHT_KG);
    expect(TENECTEPLASE_MAX_MG / 0.25).toBe(MAX_WEIGHT_KG);
  });

  it("never exceeds either maximum, at any weight", () => {
    for (let kg = 1; kg <= 500; kg++) {
      const d = thrombolyticDoses(kg)!;
      expect(mg(d.alteplase.total), `${kg} kg alteplase`).toBeLessThanOrEqual(ALTEPLASE_MAX_MG);
      expect(mg(d.tenecteplase.total), `${kg} kg tenecteplase`).toBeLessThanOrEqual(TENECTEPLASE_MAX_MG);
    }
  });

  it("refuses a weight that is a data-entry error rather than a patient", () => {
    for (const kg of [NaN, 0, -5, Infinity]) {
      expect(thrombolyticDoses(kg)).toBeNull();
    }
  });

  it("does not use the coronary tenecteplase dose", () => {
    // 0.4 mg/kg would read 24.0 mg at 60 kg; the stroke dose is 0.25 mg/kg.
    expect(tenecteplaseDose(60)!.total).toBe("15.0 mg");
  });
});
