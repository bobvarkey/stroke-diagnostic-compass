import { supabase } from "@/integrations/supabase/client";

export type PlanCode = "stroke_monthly" | "stroke_yearly";

/** Display-only catalog. Real plan ids and charged amounts live on the server. */
export const PLAN_DISPLAY: Record<PlanCode, { name: string; inr: string; usd: string; period: string }> = {
  stroke_monthly: { name: "Stroke Monthly", inr: "₹500", usd: "$5", period: "month" },
  stroke_yearly: { name: "Stroke Yearly", inr: "₹5,000", usd: "$50", period: "year" },
};

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
    key: key_id, subscription_id, name: "Stroke Companion", description: label,
    handler: async (r: Record<string, string>) => {
      try { const v = await invoke<{ verified: boolean }>("billing-verify", r); onDone(v.verified); } catch { onDone(false); }
    },
    theme: { color: "#f97316" },
  }).open();
}
