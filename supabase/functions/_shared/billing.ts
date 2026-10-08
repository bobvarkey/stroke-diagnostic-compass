import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

export { corsHeaders };

/** Server-owned plan catalog. The browser only sends a plan code; ids/prices live here. */
export const PLANS = {
  stroke_monthly: { env: "RAZORPAY_PLAN_MONTHLY", label: "Stroke Monthly", totalCount: 120 },
  stroke_yearly: { env: "RAZORPAY_PLAN_YEARLY", label: "Stroke Yearly", totalCount: 10 },
} as const;
export type PlanCode = keyof typeof PLANS;

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

export const admin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

/** Validates the caller's JWT in code (verify_jwt is off). Returns user id or null. */
export async function requireUser(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } }, auth: { persistSession: false },
  });
  const { data, error } = await client.auth.getUser(auth.slice(7));
  return error || !data.user ? null : data.user.id;
}

export function razorpayAuth(): string | null {
  const id = Deno.env.get("RAZORPAY_KEY_ID"), secret = Deno.env.get("RAZORPAY_KEY_SECRET");
  return id && secret ? "Basic " + btoa(`${id}:${secret}`) : null;
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
