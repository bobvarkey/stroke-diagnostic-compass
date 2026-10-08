import { describe, it, expect } from "vitest";
import { isEntitlementActive } from "@/hooks/useEntitlement";

const now = Date.parse("2026-10-08T00:00:00Z");
const base = { plan_code: null, amount_minor: null, currency: null };

describe("premium access", () => {
  it("3-day trial is active before expiry and not after", () => {
    const e = { ...base, kind: "trial", status: "active", expires_at: "2026-10-11T00:00:00Z" };
    expect(isEntitlementActive(e, now)).toBe(true);
    expect(isEntitlementActive(e, Date.parse("2026-10-11T00:00:01Z"))).toBe(false);
  });
  it("developer access is permanent only with no expiry", () => {
    expect(isEntitlementActive({ ...base, kind: "developer", status: "active", expires_at: null }, now)).toBe(true);
  });
  it("cancelled subscription keeps access until period end", () => {
    expect(isEntitlementActive({ ...base, kind: "subscription", status: "cancelled", expires_at: "2026-11-01T00:00:00Z" }, now)).toBe(true);
  });
  it("halted subscription gives no access", () => {
    expect(isEntitlementActive({ ...base, kind: "subscription", status: "halted", expires_at: "2026-11-01T00:00:00Z" }, now)).toBe(false);
  });
});
