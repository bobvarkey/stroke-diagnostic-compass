import { z } from "npm:zod@3";
import { corsHeaders, json, requireUser, hmacHex, safeEqual } from "../_shared/billing.ts";

const Body = z.object({
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_subscription_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(200),
});

/** Confirms the checkout signature. Grants NO lasting access — the webhook is the source of truth. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!(await requireUser(req))) return json({ error: "Sign in required" }, 401);
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "Invalid payload" }, 400);
  const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!secret) return json({ error: "Billing is not configured yet" }, 503);
  const { razorpay_payment_id: p, razorpay_subscription_id: s, razorpay_signature: sig } = parsed.data;
  const expected = await hmacHex(secret, `${p}|${s}`);
  return json({ verified: safeEqual(expected, sig) });
});
