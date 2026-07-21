import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildContactTwiml,
  buildNsaTwiml,
  placeTwilioCall,
} from "./_utils.ts";

/**
 * Integration tests: mock the Twilio REST API via a fake fetch impl and
 * verify placeTwilioCall correctly parses TwiML/JSON responses, both on
 * success and failure paths.
 */

const ACCOUNT_SID = "ACtest_account_sid_0000000000000000";
const AUTH_TOKEN = "test_auth_token";
const FROM = "+15005550006"; // Twilio magic test number
const TO = "+15551234567";

function makeMockFetch(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const safeInit = init ?? {};
    calls.push({ url, init: safeInit });
    return await handler(url, safeInit);
  }) as unknown as typeof fetch;
  return { impl, calls };
}

// ---------- TwiML builders ----------

Deno.test("buildContactTwiml embeds facility/codeLevel and escapes injection", () => {
  const twiml = buildContactTwiml(
    `Hi</Say><Dial>+1900555</Dial><Say>`,
    "ER-1 & ICU",
    "code_1",
  );
  assertStringIncludes(twiml, "Code 1 emergency");
  // Injection attempt is escaped, not left as raw tags
  assertEquals(twiml.includes("<Dial>"), false);
  assertStringIncludes(twiml, "&lt;/Say&gt;&lt;Dial&gt;");
  assertStringIncludes(twiml, "ER-1 &amp; ICU");
  // Well-formed TwiML envelope
  assertStringIncludes(twiml, "<Response>");
  assertStringIncludes(twiml, "</Response>");
});

Deno.test("buildNsaTwiml includes timestamp and code_2 label", () => {
  const ts = "2026-07-21T12:34:56.000Z";
  const twiml = buildNsaTwiml("MAIN", "code_2", ts);
  assertStringIncludes(twiml, "Code 2");
  assertStringIncludes(twiml, ts);
  assertStringIncludes(twiml, "MAIN");
});

// ---------- placeTwilioCall integration (mocked Twilio) ----------

Deno.test("placeTwilioCall posts form-encoded body to Twilio and parses SID", async () => {
  const { impl, calls } = makeMockFetch(async (_url, init) => {
    const body = init.body as URLSearchParams;
    assertEquals(body.get('To'), TO);
    assertEquals(body.get('From'), FROM);
    assertEquals(body.get('Timeout'), '30');
    assertStringIncludes(String(body.get('Twiml')), "<Response>");
    return new Response(
      JSON.stringify({ sid: "CA1234567890abcdef1234567890abcdef", status: "queued" }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  });

  const result = await placeTwilioCall({
    to: TO,
    from: FROM,
    twiml: buildContactTwiml("Test message", "ER1", "code_1"),
    accountSid: ACCOUNT_SID,
    authToken: AUTH_TOKEN,
    fetchImpl: impl,
  });

  assertEquals(result.ok, true);
  assertEquals(result.status, 201);
  assertEquals(result.sid, "CA1234567890abcdef1234567890abcdef");
  assertEquals(calls.length, 1);
  assertStringIncludes(calls[0].url, `Accounts/${ACCOUNT_SID}/Calls.json`);
  const authHeader = (calls[0].init.headers as Record<string, string>)['Authorization'];
  assertStringIncludes(authHeader, "Basic ");
  // Verify basic auth is base64(SID:TOKEN)
  const expected = 'Basic ' + btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);
  assertEquals(authHeader, expected);
});

Deno.test("placeTwilioCall surfaces Twilio JSON error messages on 4xx", async () => {
  const { impl } = makeMockFetch(async () => new Response(
    JSON.stringify({
      code: 21211,
      message: "The 'To' number is not a valid phone number.",
      status: 400,
    }),
    { status: 400, headers: { 'Content-Type': 'application/json' } },
  ));

  const result = await placeTwilioCall({
    to: "not-a-number",
    from: FROM,
    twiml: buildContactTwiml("x", "ER1", "code_1"),
    accountSid: ACCOUNT_SID,
    authToken: AUTH_TOKEN,
    fetchImpl: impl,
  });

  assertEquals(result.ok, false);
  assertEquals(result.status, 400);
  assertStringIncludes(String(result.errorMessage), "not a valid phone number");
});

Deno.test("placeTwilioCall handles 401 auth failure without throwing", async () => {
  const { impl } = makeMockFetch(async () => new Response(
    JSON.stringify({ code: 20003, message: "Authentication Error" }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  ));

  const result = await placeTwilioCall({
    to: TO,
    from: FROM,
    twiml: "<Response/>",
    accountSid: ACCOUNT_SID,
    authToken: "wrong",
    fetchImpl: impl,
  });

  assertEquals(result.ok, false);
  assertEquals(result.status, 401);
  assertStringIncludes(String(result.errorMessage), "Authentication Error");
});

Deno.test("placeTwilioCall handles 500 with non-JSON body gracefully", async () => {
  const { impl } = makeMockFetch(async () => new Response(
    "<html>Twilio down</html>",
    { status: 500, headers: { 'Content-Type': 'text/html' } },
  ));

  const result = await placeTwilioCall({
    to: TO,
    from: FROM,
    twiml: "<Response/>",
    accountSid: ACCOUNT_SID,
    authToken: AUTH_TOKEN,
    fetchImpl: impl,
  });

  assertEquals(result.ok, false);
  assertEquals(result.status, 500);
  // Falls back to generic message when body is not JSON
  assertEquals(result.errorMessage, "Twilio call failed");
});

Deno.test("placeTwilioCall sequences multiple calls independently (contact fan-out)", async () => {
  const responses = [
    { status: 201, body: { sid: "CAaaa", status: "queued" } },
    { status: 201, body: { sid: "CAbbb", status: "queued" } },
    { status: 400, body: { message: "Blocked destination" } },
  ];
  let i = 0;
  const { impl, calls } = makeMockFetch(async () => {
    const r = responses[i++];
    return new Response(JSON.stringify(r.body), {
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  const contacts = ["+15550000001", "+15550000002", "+15550000003"];
  const results = [];
  for (const to of contacts) {
    results.push(await placeTwilioCall({
      to,
      from: FROM,
      twiml: buildContactTwiml("Stroke alert", "ER1", "code_1"),
      accountSid: ACCOUNT_SID,
      authToken: AUTH_TOKEN,
      fetchImpl: impl,
    }));
  }

  assertEquals(calls.length, 3);
  assertEquals(results[0].ok, true);
  assertEquals(results[0].sid, "CAaaa");
  assertEquals(results[1].ok, true);
  assertEquals(results[1].sid, "CAbbb");
  assertEquals(results[2].ok, false);
  assertStringIncludes(String(results[2].errorMessage), "Blocked destination");
});
