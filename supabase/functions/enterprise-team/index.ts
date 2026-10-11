import { z } from "npm:zod@3";
import { corsHeaders, json, requireUser, admin } from "../_shared/billing.ts";

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("invite"), email: z.string().trim().toLowerCase().email().max(255), redirectTo: z.string().url().max(500) }),
  z.object({ action: z.literal("remove"), id: z.string().uuid() }),
]);

/** Enterprise owner admin: list members with sign-in activity, invite by email, remove. Owner-only. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const ownerId = await requireUser(req);
  if (!ownerId) return json({ error: "Sign in required" }, 401);
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "Invalid request" }, 400);
  const db = admin();
  const { data: active } = await db.rpc("has_active_enterprise", { _user_id: ownerId });
  const body = parsed.data;

  if (body.action === "remove") {
    await db.from("enterprise_members").delete().eq("id", body.id).eq("owner_id", ownerId);
    return json({ ok: true });
  }
  if (!active) return json({ error: "An active Enterprise plan is required" }, 403);

  if (body.action === "invite") {
    const { error } = await db.from("enterprise_members").insert({ owner_id: ownerId, email: body.email });
    if (error && !error.message.includes("duplicate")) return json({ error: error.message.includes("50") ? "Your plan allows up to 50 people." : "Could not add member" }, 400);
    const { error: invErr } = await db.auth.admin.inviteUserByEmail(body.email, { redirectTo: body.redirectTo });
    // Existing accounts can't be re-invited; they just sign in.
    return json({ ok: true, emailed: !invErr, existing: !!invErr });
  }

  const { data: members } = await db.from("enterprise_members").select("id,email,created_at").eq("owner_id", ownerId).order("created_at");
  const users = new Map<string, { id: string; confirmed: boolean; last_sign_in_at: string | null }>();
  for (let page = 1; page <= 20; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    for (const u of data?.users ?? []) if (u.email) users.set(u.email.toLowerCase(), { id: u.id, confirmed: !!u.email_confirmed_at, last_sign_in_at: u.last_sign_in_at ?? null });
    if ((data?.users?.length ?? 0) < 1000) break;
  }
  const rows = await Promise.all((members ?? []).map(async (m) => {
    const u = users.get(m.email);
    let records = 0, last_record_at: string | null = null;
    if (u) {
      const { data: p, count } = await db.from("patients").select("updated_at", { count: "exact" }).eq("created_by", u.id).order("updated_at", { ascending: false }).limit(1);
      records = count ?? 0; last_record_at = p?.[0]?.updated_at ?? null;
    }
    const status = !u ? "invited" : !u.confirmed ? "pending_confirmation" : "active";
    return { id: m.id, email: m.email, added_at: m.created_at, status, last_sign_in_at: u?.last_sign_in_at ?? null, records, last_record_at };
  }));
  return json({ members: rows, seats: 50, active: !!active });
});
