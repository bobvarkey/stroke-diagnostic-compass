import { describe, it, expect } from "vitest";
import { subscriptionStatus, trialDaysLeft } from "@/lib/entitlementStatus";
import { isEntitlementActive, type Entitlement } from "@/hooks/useEntitlement";

const now = Date.parse("2026-10-10T00:00:00Z");
const base = { plan_code: null, amount_minor: null, currency: null };
const at = (kind: string, status: string, expires_at: string | null): Entitlement => ({ ...base, kind, status, expires_at });

const live = "2026-11-01T00:00:00Z";
const gone = "2026-10-01T00:00:00Z";

describe("subscription status badge", () => {
  it("says so when there is nothing on the account", () => {
    expect(subscriptionStatus([], now)).toEqual({ label: "No plan", detail: "No trial or subscription yet", tone: "none" });
  });

  it("reports an active subscription and when it renews", () => {
    const b = subscriptionStatus([at("subscription", "active", live)], now);
    expect(b.tone).toBe("active");
    expect(b.label).toBe("Active");
    expect(b.detail).toMatch(/^Renews /);
  });

  it("keeps a cancelled subscription active until the period ends, and says it won't renew", () => {
    const b = subscriptionStatus([at("subscription", "cancelled", live)], now);
    expect(b.tone).toBe("active");
    expect(b.detail).toMatch(/won't renew/);
  });

  it("reads halted and paused as Paused, not Active", () => {
    for (const status of ["halted", "paused"]) {
      const b = subscriptionStatus([at("subscription", status, live)], now);
      expect(b.tone).toBe("paused");
      expect(b.label).toBe("Paused");
    }
  });

  it("reports an elapsed subscription as Expired", () => {
    expect(subscriptionStatus([at("subscription", "active", gone)], now).tone).toBe("expired");
    expect(subscriptionStatus([at("subscription", "completed", gone)], now).tone).toBe("expired");
  });

  it("counts down a live trial", () => {
    const b = subscriptionStatus([at("trial", "active", "2026-10-12T00:00:00Z")], now);
    expect(b).toEqual({ label: "Trial", detail: "2 days left", tone: "active" });
  });

  it("reports a spent trial as Expired", () => {
    expect(subscriptionStatus([at("trial", "active", gone)], now)).toEqual({ label: "Expired", detail: "Trial ended", tone: "expired" });
  });

  it("shows permanent developer access", () => {
    expect(subscriptionStatus([at("developer", "active", null)], now)).toEqual({ label: "Developer", detail: "Permanent access", tone: "active" });
  });

  it("shows a seat on someone else's Enterprise plan as Active, and says whose it is", () => {
    const b = subscriptionStatus([at("enterprise_member", "active", live)], now);
    expect(b.tone).toBe("active");
    expect(b.label).toBe("Active");
    expect(b.detail).toMatch(/Enterprise seat/);
  });

  it("reports a lapsed Enterprise seat as Expired", () => {
    expect(subscriptionStatus([at("enterprise_member", "active", gone)], now)).toEqual({
      label: "Expired", detail: "Enterprise seat ended", tone: "expired",
    });
  });

  it("prefers a member's own subscription over the Enterprise seat it sits on", () => {
    const ents = [at("enterprise_member", "active", live), at("subscription", "active", live)];
    expect(subscriptionStatus(ents, now).tone).toBe("active");
    expect(subscriptionStatus(ents, now).detail).toMatch(/^Renews /);
  });

  it("prefers a live trial over a lapsed subscription rather than calling the account expired", () => {
    const ents = [at("subscription", "completed", gone), at("trial", "active", live)];
    expect(subscriptionStatus(ents, now).label).toBe("Trial");
  });

  it("never disagrees with the access gate: tone is active exactly when access is granted", () => {
    const cases: Entitlement[][] = [
      [],
      [at("subscription", "active", live)],
      [at("subscription", "active", gone)],
      [at("subscription", "cancelled", live)],
      [at("subscription", "cancelled", gone)],
      [at("subscription", "halted", live)],
      [at("subscription", "paused", live)],
      [at("subscription", "completed", gone)],
      [at("trial", "active", live)],
      [at("trial", "active", gone)],
      [at("developer", "active", null)],
      [at("demo", "active", live)],
      [at("enterprise_member", "active", live)],
      [at("enterprise_member", "active", gone)],
      [at("subscription", "completed", gone), at("trial", "active", live)],
      [at("subscription", "active", live), at("trial", "active", live)],
    ];
    for (const ents of cases) {
      const hasAccess = ents.some((e) => isEntitlementActive(e, now));
      expect(subscriptionStatus(ents, now).tone === "active", JSON.stringify(ents)).toBe(hasAccess);
    }
  });
});

describe("trial countdown for the in-app bar", () => {
  it("counts whole days left on a live trial", () => {
    expect(trialDaysLeft([at("trial", "active", "2026-10-12T00:00:00Z")], now)).toBe(2);
  });

  it("rounds a part-day up, so an hour left still reads as a day", () => {
    expect(trialDaysLeft([at("trial", "active", "2026-10-10T06:00:00Z")], now)).toBe(1);
  });

  it("says nothing when the account has no entitlements", () => {
    expect(trialDaysLeft([], now)).toBeNull();
  });

  it("says nothing once the trial has lapsed", () => {
    expect(trialDaysLeft([at("trial", "active", gone)], now)).toBeNull();
  });

  it("stays out of the way for a paying subscriber who also holds a trial", () => {
    const ents = [at("subscription", "active", live), at("trial", "active", "2026-10-12T00:00:00Z")];
    expect(trialDaysLeft(ents, now)).toBeNull();
  });

  it("stays out of the way for a permanent developer grant", () => {
    const ents = [at("developer", "active", null), at("trial", "active", "2026-10-12T00:00:00Z")];
    expect(trialDaysLeft(ents, now)).toBeNull();
  });

  it("stays out of the way for a seat on someone else's Enterprise plan", () => {
    const ents = [at("enterprise_member", "active", live), at("trial", "active", "2026-10-12T00:00:00Z")];
    expect(trialDaysLeft(ents, now)).toBeNull();
  });

  it("still counts a live trial that outlives a lapsed subscription", () => {
    const ents = [at("subscription", "completed", gone), at("trial", "active", "2026-10-12T00:00:00Z")];
    expect(trialDaysLeft(ents, now)).toBe(2);
  });

  it("counts from the caller's clock, not the wall clock", () => {
    const ents = [at("trial", "active", "2026-10-12T00:00:00Z")];
    expect(trialDaysLeft(ents, Date.parse("2026-10-11T00:00:00Z"))).toBe(1);
  });
});
