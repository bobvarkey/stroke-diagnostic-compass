import { corsHeaders, json, admin, hmacHex, safeEqual } from "../_shared/billing.ts";

/** Public Razorpay webhook. Signature over the raw body is the only trust anchor. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Not configured" }, 503);
  const raw = await req.text();
  const sig = req.headers.get("X-Razorpay-Signature") ?? "";
  if (!safeEqual(await hmacHex(secret, raw), sig)) return json({ error: "Bad signature" }, 400);

  let evt: any;
  try { evt = JSON.parse(raw); } catch { return json({ error: "Bad JSON" }, 400); }
  const eventId = req.headers.get("X-Razorpay-Event-Id") ?? `${evt.event}:${evt.created_at}:${evt.payload?.subscription?.entity?.id}`;
  const db = admin();
  const { error: dupErr } = await db.from("razorpay_webhook_events").insert({ event_id: eventId, event_type: String(evt.event ?? "") });
  if (dupErr) return json({ ok: true, duplicate: true });

  const sub = evt.payload?.subscription?.entity;
  const userId = sub?.notes?.user_id;
  if (!sub || !userId) return json({ ok: true, ignored: true });

  const map: Record<string, string> = {
    "subscription.activated": "active", "subscription.charged": "active", "subscription.resumed": "active",
    "subscription.cancelled": "cancelled", "subscription.halted": "halted", "subscription.completed": "completed",
    "subscription.paused": "paused",
  };
  const status = map[evt.event];
  if (!status) return json({ ok: true, ignored: true });

  const pay = evt.payload?.payment?.entity;
  const expires = sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null;
  const { error } = await db.from("user_entitlements").upsert({
    user_id: userId, kind: "subscription", status,
    plan_code: sub.notes?.plan_code ?? null, razorpay_subscription_id: sub.id,
    amount_minor: pay?.amount ?? null, currency: pay?.currency ?? null,
    expires_at: status === "active" ? expires : (expires ?? new Date().toISOString()),
  }, { onConflict: "user_id,kind" });
  if (error) { console.error("entitlement upsert failed", error.message); return json({ error: "store failed" }, 500); }
  return json({ ok: true });
});
