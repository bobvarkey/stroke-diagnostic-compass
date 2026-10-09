import { corsHeaders, json, admin, hmacHex, safeEqual } from "../_shared/billing.ts";

/** Statuses that mean the subscription is over until Razorpay explicitly revives it. */
const TERMINAL = new Set(["cancelled", "halted", "completed"]);
/** Events that legitimately revive a terminal subscription. A late `charged` must NOT. */
const REVIVING = new Set(["subscription.activated", "subscription.resumed"]);

/** The subset of a Razorpay webhook body this function reads. */
interface RazorpayEvent {
  event?: string;
  payload?: {
    subscription?: { entity?: { id?: string; current_end?: number; notes?: { user_id?: string; plan_code?: string } } };
    payment?: { entity?: { amount?: number; currency?: string } };
  };
}

/** Public Razorpay webhook. Signature over the raw body is the only trust anchor. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Not configured" }, 503);
  const raw = await req.text();
  const sig = req.headers.get("X-Razorpay-Signature") ?? "";
  if (!safeEqual(await hmacHex(secret, raw), sig)) return json({ error: "Bad signature" }, 400);

  let evt: RazorpayEvent;
  try { evt = JSON.parse(raw) as RazorpayEvent; } catch { return json({ error: "Bad JSON" }, 400); }

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

  // Digest of the raw body: identical retries collapse to one id, distinct events never do.
  const eventId = req.headers.get("X-Razorpay-Event-Id")
    ?? `body:${(await hmacHex("event-id", raw)).slice(0, 40)}`;
  const db = admin();

  // Claim the event only once we are certain it is new. A recorded event whose write failed
  // would be silently swallowed on Razorpay's retry — so the reservation happens last.
  const { data: seen } = await db.from("razorpay_webhook_events").select("event_id").eq("event_id", eventId).maybeSingle();
  if (seen) return json({ ok: true, duplicate: true });

  // Ordering guard: a late `charged` must not resurrect a cancelled/halted subscription.
  const { data: current } = await db.from("user_entitlements")
    .select("status").eq("user_id", userId).eq("kind", "subscription").maybeSingle();
  if (current && TERMINAL.has(current.status) && !REVIVING.has(evt.event)) {
    return json({ ok: true, stale: true });
  }

  const pay = evt.payload?.payment?.entity;
  const expires = sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null;
  const { error } = await db.from("user_entitlements").upsert({
    user_id: userId, kind: "subscription", status,
    plan_code: sub.notes?.plan_code ?? null, razorpay_subscription_id: sub.id,
    amount_minor: pay?.amount ?? null, currency: pay?.currency ?? null,
    expires_at: status === "active" ? expires : (expires ?? new Date().toISOString()),
  }, { onConflict: "user_id,kind" });
  if (error) {
    // No dedupe row written — Razorpay's retry will land here again and can still succeed.
    console.error("entitlement upsert failed", error.message);
    return json({ error: "store failed" }, 500);
  }

  const { error: dupErr } = await db.from("razorpay_webhook_events").insert({ event_id: eventId, event_type: String(evt.event ?? "") });
  // 23505 = unique violation: a concurrent duplicate already recorded it. Any other error is
  // logged but not fatal — the entitlement is already stored, which is what matters.
  if (dupErr && dupErr.code !== "23505") console.error("event record failed", dupErr.message);

  return json({ ok: true });
});
