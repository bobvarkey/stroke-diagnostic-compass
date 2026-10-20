import { beforeEach, describe, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({ platform: "web" }));
const invoke = vi.hoisted(() => vi.fn());
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => runtime.platform !== "web" },
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));

import { allowsWebBilling, requireWebBilling } from "@/lib/distribution";
import { subscribe } from "@/lib/billing";

beforeEach(() => { runtime.platform = "web"; invoke.mockReset(); });

describe("store checkout boundary", () => {
  it("keeps website and browser-installed app billing available", () => {
    expect(allowsWebBilling()).toBe(true);
    expect(() => requireWebBilling()).not.toThrow();
  });

  it.each(["ios", "android"])("blocks Razorpay before subscription creation on %s", async (platform) => {
    runtime.platform = platform;
    expect(allowsWebBilling()).toBe(false);
    await expect(subscribe("stroke_enterprise", vi.fn())).rejects.toThrow("Web checkout is unavailable");
    expect(invoke).not.toHaveBeenCalled();
  });
});