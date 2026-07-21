// XML/TwiML escape to prevent injection into <Say> tags
export function xmlEscape(input: string): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export type CodeLevel = 'code_1' | 'code_2';

export function buildContactTwiml(
  voiceMessage: string,
  facilityId: string,
  codeLevel: CodeLevel,
): string {
  const safeVoice = xmlEscape(voiceMessage);
  const safeFacility = xmlEscape(facilityId);
  const safeCodeLabel = codeLevel === 'code_1' ? 'Code 1 emergency' : 'Code 2';
  return `<Response><Say voice="alice">${safeVoice}. This is a ${safeCodeLabel} stroke alert for patient at ${safeFacility}. Please respond immediately.</Say><Pause length="1"/><Say voice="alice">Repeat: ${safeVoice}</Say></Response>`;
}

export function buildNsaTwiml(
  facilityId: string,
  codeLevel: CodeLevel,
  isoTimestamp: string,
): string {
  const safeFacility = xmlEscape(facilityId);
  const safeCodeLabel = codeLevel === 'code_1' ? 'Code 1 emergency' : 'Code 2';
  return `<Response><Say voice="alice">This is an automated stroke code notification from ${safeFacility}. A ${safeCodeLabel} stroke alert has been activated. Timestamp: ${xmlEscape(isoTimestamp)}. This message is for National Stroke Association records.</Say></Response>`;
}

export interface TwilioCallInput {
  to: string;
  from: string;
  twiml: string;
  accountSid: string;
  authToken: string;
  fetchImpl?: typeof fetch;
}

export interface TwilioCallResult {
  ok: boolean;
  status: number;
  sid?: string;
  errorMessage?: string;
  raw: unknown;
}

/**
 * Place a Twilio outbound call. Isolated for testability — pass fetchImpl
 * to mock Twilio in integration tests without touching the network.
 */
export async function placeTwilioCall(input: TwilioCallInput): Promise<TwilioCallResult> {
  const { to, from, twiml, accountSid, authToken } = input;
  const fetchImpl = input.fetchImpl ?? fetch;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
  const auth = 'Basic ' + btoa(`${accountSid}:${authToken}`);
  const form = new URLSearchParams();
  form.append('To', to);
  form.append('From', from);
  form.append('Twiml', twiml);
  form.append('Timeout', '30');

  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }

  if (res.ok) {
    const sid = parsed && typeof parsed === 'object' && 'sid' in parsed
      ? String((parsed as Record<string, unknown>).sid ?? '')
      : undefined;
    return { ok: true, status: res.status, sid, raw: parsed };
  }
  const errorMessage = parsed && typeof parsed === 'object' && 'message' in parsed
    ? String((parsed as Record<string, unknown>).message ?? 'Twilio call failed')
    : 'Twilio call failed';
  return { ok: false, status: res.status, errorMessage, raw: parsed };
}
