import { z } from "npm:zod@3";
import { corsHeaders, json, requireUser, razorpayAuth, PLANS } from "../_shared/billing.ts";

const Body = z.object({ plan: z.enum(["stroke_monthly", "stroke_yearly"]) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const userId = await requireUser(req);
  if (!userId) return json({ error: "Sign in required" }, 401);
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "Unknown plan" }, 400);
  const auth = razorpayAuth();
  const plan = PLANS[parsed.data.plan];
  const planId = Deno.env.get(plan.env);
  if (!auth || !planId) return json({ error: "Billing is not configured yet" }, 503);

  const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planId, total_count: plan.totalCount, customer_notify: 1, notes: { user_id: userId, plan_code: parsed.data.plan } }),
  });
  const data = await res.json();
  if (!res.ok) { console.error("razorpay create failed", data?.error?.description); return json({ error: "Could not start checkout" }, 502); }
  return json({ subscription_id: data.id, key_id: Deno.env.get("RAZORPAY_KEY_ID"), label: plan.label });
});
