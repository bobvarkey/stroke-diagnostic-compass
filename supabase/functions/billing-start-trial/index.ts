import { corsHeaders, json, requireUser, admin } from "../_shared/billing.ts";
import { trialExpiry, trialWindowOpen } from "../_shared/trialWindow.ts";

/** One trial per account, recorded server-side only, and anchored to the account's creation date
 *  rather than to the moment this runs — so no device can hand itself a fresh three days. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const userId = await requireUser(req);
  if (!userId) return json({ error: "Sign in required" }, 401);
  const db = admin();
  const { data: existing } = await db.from("user_entitlements").select("id").eq("user_id", userId).eq("kind", "trial").maybeSingle();
  if (existing) return json({ error: "Your free trial has already been used" }, 409);

  // The anchor is the account record, which the caller cannot influence.
  const { data: account, error: accountError } = await db.auth.admin.getUserById(userId);
  if (accountError || !account?.user) return json({ error: "Could not read your account" }, 500);

  const createdAt = account.user.created_at;
  const now = Date.now();
  const expires = trialExpiry(createdAt);
  const open = trialWindowOpen(createdAt, now);

  // Record the window even when it has already closed. An account older than the three days has
  // spent its trial, and recording that is what retires the "Start 3-day free trial" button —
  // without it every press would fail the same way and the offer could never be cleared.
  const { error } = await db.from("user_entitlements").insert({ user_id: userId, kind: "trial", status: "active", plan_code: "trial_3d", expires_at: expires });
  if (error) return json({ error: "Could not start trial" }, 500);

  if (!open) {
    return json({ error: "Your free trial window has ended — the 3-day trial runs from the day you signed up." }, 409);
  }
  return json({ ok: true, expires_at: expires });
});
