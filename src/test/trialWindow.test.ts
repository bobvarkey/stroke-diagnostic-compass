import { describe, it, expect } from "vitest";
import {
  TRIAL_DAYS, GRANDFATHER_FROM, trialExpiry, trialWindowOpen,
} from "../../supabase/functions/_shared/trialWindow.ts";

const DAY = 86_400_000;
const CUTOFF = Date.parse(GRANDFATHER_FROM);

/** Signed up after the changeover: anchored to its own creation date. */
const after = "2026-10-20T09:00:00Z";
/** Signed up long before the changeover: would otherwise find its window already spent. */
const before = "2026-06-01T09:00:00Z";

/**
 * The trial window is anchored to account creation so a device cannot hand itself a fresh three
 * days. `trialWindowOpen` and `trialExpiry` are pure on purpose: the edge function that uses them
 * cannot run here (Deno, and no test runtime in the repo), so every decision lives in this module.
 */
describe("trial window", () => {
  it("runs for three days from a post-changeover account's creation", () => {
    expect(TRIAL_DAYS).toBe(3);
    expect(trialExpiry(after)).toBe("2026-10-23T09:00:00.000Z");
  });

  it("is open the moment a post-changeover account is created", () => {
    expect(trialWindowOpen(after, Date.parse(after))).toBe(true);
  });

  it("is still open two days in, with a day left to take", () => {
    expect(trialWindowOpen(after, Date.parse(after) + 2 * DAY)).toBe(true);
  });

  it("is closed exactly at the end of the third day, not a moment later", () => {
    expect(trialWindowOpen(after, Date.parse(after) + 3 * DAY)).toBe(false);
    expect(trialWindowOpen(after, Date.parse(after) + 3 * DAY + 1)).toBe(false);
  });

  it("gives a pre-changeover account its three days from the changeover, not from its sign-up", () => {
    expect(trialExpiry(before)).toBe("2026-10-14T00:00:00.000Z");
  });

  it("leaves a pre-changeover account open across the changeover, and closes it three days later", () => {
    expect(trialWindowOpen(before, CUTOFF)).toBe(true);
    expect(trialWindowOpen(before, CUTOFF + 2 * DAY)).toBe(true);
    expect(trialWindowOpen(before, CUTOFF + 3 * DAY)).toBe(false);
  });

  it("does not hand a post-changeover account a bonus window for signing up earlier", () => {
    // The clamp can only move an anchor forward, never back — otherwise it would re-open the hole.
    expect(trialExpiry(after)).toBe(new Date(Date.parse(after) + 3 * DAY).toISOString());
    expect(Date.parse(trialExpiry(after))).toBeGreaterThan(CUTOFF + 3 * DAY);
  });

  it("treats an unreadable creation date as a pre-changeover account rather than throwing", () => {
    expect(() => trialExpiry("not-a-date")).not.toThrow();
    expect(trialExpiry("not-a-date")).toBe("2026-10-14T00:00:00.000Z");
  });

  it("measures against the caller's clock, never the real one", () => {
    const now = Date.now();
    const created = new Date(now - 60_000).toISOString();
    expect(trialWindowOpen(created, now)).toBe(true);
    expect(trialWindowOpen(created, now + 3 * DAY)).toBe(false);
  });
});
