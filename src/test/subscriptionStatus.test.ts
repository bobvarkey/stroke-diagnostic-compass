import { describe, it, expect } from "vitest";
import { subscriptionStatus } from "@/components/SubscriptionStatusBadge";

const now = Date.parse("2026-10-11T00:00:00Z");
const e = (kind: string, status: string, expires_at: string | null) => ({ kind, status, expires_at, plan_code: "stroke_monthly", amount_minor: null, currency: null });

describe("subscriptionStatus", () => {
  it("active subscription", () => expect(subscriptionStatus([e("subscription", "active", "2026-11-01T00:00:00Z")], now).status).toBe("active"));
  it("halted subscription shows paused", () => expect(subscriptionStatus([e("subscription", "halted", "2026-11-01T00:00:00Z")], now).status).toBe("paused"));
  it("past-end subscription shows expired", () => expect(subscriptionStatus([e("subscription", "active", "2026-10-01T00:00:00Z")], now).status).toBe("expired"));
  it("no entitlements shows none", () => expect(subscriptionStatus([], now).status).toBe("none"));
});
