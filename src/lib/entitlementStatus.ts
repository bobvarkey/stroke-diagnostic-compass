import { isEntitlementActive, type Entitlement } from "@/hooks/useEntitlement";

export type StatusTone = "active" | "paused" | "expired" | "none";

export interface StatusBadge {
  label: string;
  detail: string | null;
  tone: StatusTone;
}

/** Razorpay reports a subscription as `halted` after repeated failed charges. To the person paying,
 *  that is "paused" — the API's word for it is not the one that helps them. */
const PAUSED = new Set(["paused", "halted"]);

/** Most specific first: a permanent grant outranks a subscription, which outranks a trial. */
const PRIORITY = ["developer", "subscription", "trial", "demo"] as const;

const DAY_MS = 86_400_000;

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const firstOf = (list: Entitlement[]) =>
  PRIORITY.map((kind) => list.find((e) => e.kind === kind)).find(Boolean) ?? null;

/**
 * Describes the server-recorded entitlements in one line, for display only.
 *
 * This never grants access. `isEntitlementActive` stays the single definition of what counts, and
 * the `active` tone is true exactly when at least one entitlement satisfies it — so the badge can
 * never disagree with the gate. A lapsed subscription alongside a live trial reads "Trial", not
 * "Expired", because the trial is what the person is actually getting.
 */
export function subscriptionStatus(ents: Entitlement[], now = Date.now()): StatusBadge {
  if (ents.length === 0) return { label: "No plan", detail: "No trial or subscription yet", tone: "none" };

  // Prefer something that currently grants access; describe a lapsed record only when nothing does.
  const live = ents.filter((e) => isEntitlementActive(e, now));
  const chosen = firstOf(live) ?? firstOf(ents);
  if (!chosen) return { label: "Expired", detail: null, tone: "expired" };

  const expiry = chosen.expires_at ? Date.parse(chosen.expires_at) : null;
  const isLive = live.includes(chosen);

  if (chosen.kind === "developer") return { label: "Developer", detail: "Permanent access", tone: "active" };

  if (chosen.kind === "subscription") {
    if (isLive && expiry !== null) {
      return chosen.status === "cancelled"
        ? { label: "Active", detail: `Ends ${fmtDate(expiry)} · won't renew`, tone: "active" }
        : { label: "Active", detail: `Renews ${fmtDate(expiry)}`, tone: "active" };
    }
    if (PAUSED.has(chosen.status)) return { label: "Paused", detail: "Payment didn't go through", tone: "paused" };
    return { label: "Expired", detail: expiry !== null ? `Ended ${fmtDate(expiry)}` : null, tone: "expired" };
  }

  if (chosen.kind === "trial") {
    if (isLive && expiry !== null) {
      const days = Math.max(1, Math.ceil((expiry - now) / DAY_MS));
      return { label: "Trial", detail: `${days} day${days === 1 ? "" : "s"} left`, tone: "active" };
    }
    return { label: "Expired", detail: "Trial ended", tone: "expired" };
  }

  if (isLive) return { label: chosen.kind === "demo" ? "Demo" : "Active", detail: null, tone: "active" };
  return { label: "Expired", detail: null, tone: "expired" };
}
