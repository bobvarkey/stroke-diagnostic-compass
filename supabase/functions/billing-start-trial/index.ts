import { corsHeaders, json, requireUser, admin } from "../_shared/billing.ts";

/** One 3-day trial per account, recorded server-side only. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const userId = await requireUser(req);
  if (!userId) return json({ error: "Sign in required" }, 401);
  const db = admin();
  const { data: existing } = await db.from("user_entitlements").select("id").eq("user_id", userId).eq("kind", "trial").maybeSingle();
  if (existing) return json({ error: "Your free trial has already been used" }, 409);
  const expires = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
  const { error } = await db.from("user_entitlements").insert({ user_id: userId, kind: "trial", status: "active", plan_code: "trial_3d", expires_at: expires });
  if (error) return json({ error: "Could not start trial" }, 500);
  return json({ ok: true, expires_at: expires });
});
