import { corsHeaders, json, requireUser, admin, razorpayAuth } from "../_shared/billing.ts";

/** Cancels the caller's own subscription at the end of the current period. Webhook updates status. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const userId = await requireUser(req);
  if (!userId) return json({ error: "Sign in required" }, 401);
  const auth = razorpayAuth();
  if (!auth) return json({ error: "Billing is not configured yet" }, 503);
  const { data } = await admin().from("user_entitlements").select("razorpay_subscription_id").eq("user_id", userId).eq("kind", "subscription").maybeSingle();
  const subId = data?.razorpay_subscription_id;
  if (!subId) return json({ error: "No subscription found" }, 404);
  const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(subId)}/cancel`, {
    method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" }, body: JSON.stringify({ cancel_at_cycle_end: 1 }),
  });
  if (!res.ok) return json({ error: "Could not cancel" }, 502);
  return json({ ok: true });
});
