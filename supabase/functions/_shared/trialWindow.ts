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

/**
 * The day the trial stopped starting at the button press and started running from the account.
 *
 * Accounts created before this would find their window already spent the moment the rule changed,
 * so they are anchored here instead and get their three days from the changeover; accounts created
 * after it are anchored to their own creation date and are unaffected. The clamp only ever moves an
 * anchor forward, so it cannot re-open the hole it exists to close.
 *
 * Set this to the day the change was deployed. Once every account predating it has had its window,
 * this constant and the clamp below can be deleted.
 */
export const GRANDFATHER_FROM = "2026-10-11T00:00:00.000Z";

const DAY_MS = 86_400_000;

/** The instant the trial is measured from: the later of account creation and the changeover. */
function anchorMs(createdAt: string): number {
  const created = Date.parse(createdAt);
  const changeover = Date.parse(GRANDFATHER_FROM);
  // An unreadable creation date is treated as a pre-changeover account: that grants the standard
  // window, where throwing would turn one odd record into a 500 on the trial endpoint.
  return Number.isNaN(created) ? changeover : Math.max(created, changeover);
}

/**
 * When the free trial for an account created at `createdAt` runs out.
 *
 * The result may already be in the past for an account whose window has genuinely been spent.
 */
export function trialExpiry(createdAt: string): string {
  return new Date(anchorMs(createdAt) + TRIAL_DAYS * DAY_MS).toISOString();
}

/**
 * Whether trial time is still available on an account created at `createdAt`.
 *
 * Closed exactly at the expiry instant, so the window is three full days and no part of a fourth.
 */
export function trialWindowOpen(createdAt: string, now = Date.now()): boolean {
  return Date.parse(trialExpiry(createdAt)) > now;
}
