import { describe, it, expect } from "vitest";
import {
  PLAN_DISPLAY, plansFor, monthlyPlan, yearlyPlan, annualSavingPercent,
  currencyForRegion, ENTERPRISE_PLAN, type Currency, type PlanCode,
} from "@/lib/planCatalog";

const CURRENCIES: Currency[] = ["INR", "USD"];

describe("currency by region", () => {
  it("prices India in rupees, from the clock or the language tag", () => {
    expect(currencyForRegion({ timeZone: "Asia/Kolkata" })).toBe("INR");
    expect(currencyForRegion({ timeZone: "Asia/Calcutta" })).toBe("INR");
    expect(currencyForRegion({ timeZone: "Europe/Berlin", languages: ["en-IN"] })).toBe("INR");
  });

  it("prices everywhere else in dollars", () => {
    expect(currencyForRegion({ timeZone: "America/New_York", languages: ["en-US"] })).toBe("USD");
    expect(currencyForRegion({ timeZone: "Europe/London", languages: ["en-GB"] })).toBe("USD");
  });

  it("does not read a non-Indian tag as Indian, or a missing signal as rupees-by-accident", () => {
    expect(currencyForRegion({ languages: ["en-GB"] })).toBe("USD");
    expect(currencyForRegion({ languages: ["hi"] })).toBe("USD");
    expect(currencyForRegion({})).toBe("USD");
    expect(currencyForRegion({ languages: [undefined] })).toBe("USD");
  });
});

describe("plan catalog", () => {
  it("offers the annual plan first in both currencies", () => {
    for (const c of CURRENCIES) {
      expect(plansFor(c)).toEqual([yearlyPlan(c), monthlyPlan(c)]);
      expect(PLAN_DISPLAY[plansFor(c)[0]].period).toBe("year");
    }
  });

  it("keeps every code's declared currency consistent across both helpers", () => {
    expect(plansFor("INR").every((code) => PLAN_DISPLAY[code].currency === "INR")).toBe(true);
    expect(plansFor("USD").every((code) => PLAN_DISPLAY[code].currency === "USD")).toBe(true);
    expect(plansFor("INR")).not.toContain(monthlyPlan("USD"));
  });

  it("never shows a rupee amount on a plan declared in dollars, or the reverse", () => {
    const symbol: Record<Currency, string> = { INR: "₹", USD: "$" };
    for (const code of Object.keys(PLAN_DISPLAY) as PlanCode[]) {
      const plan = PLAN_DISPLAY[code];
      expect(plan.amount.startsWith(symbol[plan.currency]), `${code} shows ${plan.amount}`).toBe(true);
    }
  });

  it("offers Enterprise in dollars to every region, without displacing the individual pair", () => {
    const ent = PLAN_DISPLAY[ENTERPRISE_PLAN];
    expect(ent.currency).toBe("USD");
    expect(ent.amount).toBe("$1,000");
    expect(ent.period).toBe("year");
    for (const c of CURRENCIES) {
      expect(plansFor(c)).not.toContain(ENTERPRISE_PLAN);
      expect(plansFor(c)).toHaveLength(2);
    }
  });

  it("advertises the same saving in both currencies, and only one that is true", () => {
    for (const c of CURRENCIES) {
      const pct = annualSavingPercent(c);
      expect(pct).toBe(17);
      const m = Number(PLAN_DISPLAY[monthlyPlan(c)].amount.replace(/[^\d]/g, ""));
      const y = Number(PLAN_DISPLAY[yearlyPlan(c)].amount.replace(/[^\d]/g, ""));
      expect(Math.round((1 - y / (m * 12)) * 100)).toBe(pct);
    }
  });
});
