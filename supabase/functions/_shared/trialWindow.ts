/**
 * The free trial runs for three days from ACCOUNT CREATION — not from the moment the button is
 * pressed. Anchoring it here is what stops a device from handing itself a fresh three days on
 * demand: an account that signed up long ago has spent its trial whether or not it ever took it.
 *
 * Dependency-free on purpose (no npm:/Deno imports) so the repo's vitest suite can exercise the
 * decision directly; the edge function that consumes it cannot be run in the app's test runtime.
 * Imported with an explicit `.ts` extension because Deno requires one.
 */

/** Length of the free trial, in days. */
export const TRIAL_DAYS = 3;

const DAY_MS = 86_400_000;

/**
 * When the free trial for an account created at `createdAt` runs out.
 *
 * The result may already be in the past. That is not an error: it means the account is older than
 * the window and has no trial time left to take.
 */
export function trialExpiry(createdAt: string): string {
  return new Date(Date.parse(createdAt) + TRIAL_DAYS * DAY_MS).toISOString();
}

/**
 * Whether trial time is still available on an account created at `createdAt`.
 *
 * Closed exactly at the expiry instant, so the window is three full days and no part of a fourth.
 */
export function trialWindowOpen(createdAt: string, now = Date.now()): boolean {
  return Date.parse(trialExpiry(createdAt)) > now;
}
