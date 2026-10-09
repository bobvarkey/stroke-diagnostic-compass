import { corsHeaders, json, requireUser, admin } from "../_shared/billing.ts";

/** Admin-only grant of permanent developer access, keyed to a real auth user id.
 *  The browser may ask; only an admin caller gets it. No email check, no client flag. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const callerId = await requireUser(req);
  if (!callerId) return json({ error: "Sign in required" }, 401);

  const db = admin();
  const { data: role } = await db.from("user_roles")
    .select("role").eq("user_id", callerId).eq("role", "admin").maybeSingle();
  if (!role) return json({ error: "Admin only" }, 403);

  let body: { user_id?: string };
  try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }
  const target = body.user_id;
  if (!target || !/^[0-9a-f-]{36}$/i.test(target)) return json({ error: "A valid user_id is required" }, 400);

  const { error } = await db.from("user_entitlements").upsert(
    { user_id: target, kind: "developer", status: "active", expires_at: null },
    { onConflict: "user_id,kind" },
  );
  if (error) { console.error("developer grant failed", error.message); return json({ error: "Could not grant access" }, 500); }
  return json({ ok: true });
});
