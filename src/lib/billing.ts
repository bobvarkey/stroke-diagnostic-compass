import { supabase } from "@/integrations/supabase/client";
import type { PlanCode } from "@/lib/planCatalog";

/** The price list lives in a dependency-free module so it can be tested without a Supabase client. */
export {
  PLAN_DISPLAY, plansFor, monthlyPlan, yearlyPlan, ENTERPRISE_PLAN, STROKE_ENTERPRISE, ENTERPRISE_SEATS,
  annualSavingPercent, currencyForRegion, preferredCurrency,
} from "@/lib/planCatalog";
export type { PlanCode, Currency, PlanDisplay } from "@/lib/planCatalog";

/** Formats a server-recorded charge. Amounts are stored in minor units (paise/cents). */
export function formatMoney(amountMinor: number, currency: string): string {
  try { return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency }).format(amountMinor / 100); }
  catch { return `${(amountMinor / 100).toFixed(2)} ${currency}`; }
}

/** Null-tolerant wrapper for records that may not carry a charge yet. */
export function formatAmount(minor: number | null, currency: string | null): string | null {
  if (minor === null || !currency) return null;
  return formatMoney(minor, currency);
}

async function invoke<T>(name: string, body?: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body: body ?? {} });
  if (error) {
    let msg = error.message;
    try { const ctx = (error as { context?: Response }).context; if (ctx) msg = (await ctx.json()).error ?? msg; } catch { /* keep msg */ }
    throw new Error(msg);
  }
  return data as T;
}

export const startTrial = () => invoke<{ expires_at: string }>("billing-start-trial");
export const cancelSubscription = () => invoke<{ ok: boolean }>("billing-cancel");

/** Admin-only, server-side grant of permanent developer access. The server checks the caller's
 *  role; nothing here can grant access on its own. */
export const grantDeveloper = (userId: string) => invoke<{ ok: boolean }>("billing-grant-developer", { user_id: userId });

declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void } } }

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(); s.onerror = () => rej(new Error("Could not load checkout"));
    document.body.appendChild(s);
  });
}

/** Opens Razorpay Standard Checkout. Access is granted only when the server webhook confirms payment. */
export async function subscribe(plan: PlanCode, onDone: (verified: boolean) => void) {
  const { subscription_id, key_id, label } = await invoke<{ subscription_id: string; key_id: string; label: string }>("billing-create-subscription", { plan });
  await loadCheckout();
  new window.Razorpay!({
    key: key_id, subscription_id, name: "StrokeSuite ID", description: label,
    handler: async (r: Record<string, string>) => {
      try { const v = await invoke<{ verified: boolean }>("billing-verify", r); onDone(v.verified); } catch { onDone(false); }
    },
    theme: { color: "#f97316" },
  }).open();
}
