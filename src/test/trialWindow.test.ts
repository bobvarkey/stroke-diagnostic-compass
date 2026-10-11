import { describe, it, expect } from "vitest";
import { TRIAL_DAYS, trialExpiry, trialWindowOpen } from "../../supabase/functions/_shared/trialWindow.ts";

const DAY = 86_400_000;
const signup = "2026-10-01T09:00:00Z";
const at = (ms: number) => Date.parse(signup) + ms;

/**
 * The trial window is anchored to account creation, so these are the cases the edge function leans
 * on. `trialWindowOpen` is pure on purpose: the server function that uses it cannot be run here
 * (Deno, and no test runtime in the repo), so all the decision-making lives in this module.
 */
describe("trial window", () => {
  it("runs for three days from account creation", () => {
    expect(TRIAL_DAYS).toBe(3);
    expect(trialExpiry(signup)).toBe("2026-10-04T09:00:00.000Z");
  });

  it("is open the moment the account is created", () => {
    expect(trialWindowOpen(signup, at(0))).toBe(true);
  });

  it("is still open two days in, with a day left to take", () => {
    expect(trialWindowOpen(signup, at(2 * DAY))).toBe(true);
  });

  it("is closed exactly at the end of the third day, not a moment later", () => {
    expect(trialWindowOpen(signup, at(3 * DAY))).toBe(false);
    expect(trialWindowOpen(signup, at(3 * DAY + 1))).toBe(false);
  });

  it("is closed for an account that signed up long ago and never took the trial", () => {
    expect(trialWindowOpen(signup, at(30 * DAY))).toBe(false);
  });

  it("measures against the caller's clock, never the real one", () => {
    const created = new Date(Date.now() - 60_000).toISOString();
    expect(trialWindowOpen(created, Date.now())).toBe(true);
    expect(trialWindowOpen(created, Date.now() + 3 * DAY)).toBe(false);
  });
});
