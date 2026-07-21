import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { xmlEscape } from "./_utils.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/stroke-code-caller`;

function call(body: unknown, authHeader?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  };
  if (authHeader) headers['Authorization'] = authHeader;
  return fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

// ---------- xmlEscape unit tests (TwiML injection protection) ----------

Deno.test("xmlEscape escapes < and > to prevent breaking out of <Say>", () => {
  const evil = `</Say><Dial>+1900555</Dial><Say>`;
  const escaped = xmlEscape(evil);
  assertEquals(escaped, "&lt;/Say&gt;&lt;Dial&gt;+1900555&lt;/Dial&gt;&lt;Say&gt;");
  // Ensure no raw TwiML tag can appear in the output
  assertEquals(escaped.includes("<"), false);
  assertEquals(escaped.includes(">"), false);
});

Deno.test("xmlEscape escapes ampersands, quotes and apostrophes", () => {
  assertEquals(xmlEscape(`Tom & "Jerry" 'go'`), "Tom &amp; &quot;Jerry&quot; &apos;go&apos;");
});

Deno.test("xmlEscape leaves benign text untouched", () => {
  assertEquals(xmlEscape("Code Stroke at ER"), "Code Stroke at ER");
});

Deno.test("xmlEscape handles null/undefined safely", () => {
  assertEquals(xmlEscape(null as unknown as string), "");
  assertEquals(xmlEscape(undefined as unknown as string), "");
});

Deno.test("xmlEscape escapes & before other entities (no double-escape of < etc.)", () => {
  // A raw '&' must become '&amp;' and a raw '<' must become '&lt;',
  // but the '&' in '&lt;' must not be re-escaped to '&amp;lt;'.
  assertEquals(xmlEscape("<a>&b</a>"), "&lt;a&gt;&amp;b&lt;/a&gt;");
});

// ---------- HTTP authorization / role check tests ----------

Deno.test("rejects request with no Authorization header (401)", async () => {
  const res = await call({ activationId: "00000000-0000-0000-0000-000000000000", codeLevel: "code_1" });
  const bodyText = await res.text();
  assertEquals(res.status, 401);
  assertStringIncludes(bodyText, "Authentication required");
});

Deno.test("rejects request with malformed Authorization header (401)", async () => {
  const res = await call(
    { activationId: "00000000-0000-0000-0000-000000000000", codeLevel: "code_1" },
    "NotBearer abc",
  );
  const bodyText = await res.text();
  assertEquals(res.status, 401);
  assertStringIncludes(bodyText, "Authentication required");
});

Deno.test("rejects request with invalid bearer token (401)", async () => {
  const res = await call(
    { activationId: "00000000-0000-0000-0000-000000000000", codeLevel: "code_1" },
    "Bearer not.a.real.jwt",
  );
  const bodyText = await res.text();
  assertEquals(res.status, 401);
  assertStringIncludes(bodyText.toLowerCase(), "unauthorized");
});

// ---------- Ownership / admin-role scoping ----------
// We can't mint a non-admin JWT without a test account, but we can assert
// the endpoint refuses anonymous/anon-key calls (which is the primary
// abuse vector for the OPEN_ENDPOINTS finding).

Deno.test("rejects call authenticated only with anon publishable key (no user)", async () => {
  const res = await call(
    { activationId: "00000000-0000-0000-0000-000000000000", codeLevel: "code_1" },
    `Bearer ${SUPABASE_ANON_KEY}`,
  );
  const bodyText = await res.text();
  // anon key has no `sub` claim for a real user -> either 401 (invalid) or 403 (not admin)
  assertEquals(res.status === 401 || res.status === 403, true, `expected 401/403, got ${res.status}: ${bodyText}`);
});
