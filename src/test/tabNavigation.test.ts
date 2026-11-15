import { describe, expect, it } from "vitest";
import {
  backToHomeAction,
  openTabHistoryMode,
  resolveWorkupLocation,
  seedEntriesForDirectTabLoad,
  shouldSeedTabHistory,
  tabPath,
} from "@/lib/tabNavigation";

describe("workup tab routing", () => {
  it("shows home when the URL does not name a tab", () => {
    expect(resolveWorkupLocation("", "")).toEqual({ tab: null, sectionId: null });
    expect(resolveWorkupLocation("?tab=", "")).toEqual({ tab: null, sectionId: null });
    expect(resolveWorkupLocation("?tab=not-a-tab", "")).toEqual({ tab: null, sectionId: null });
  });

  it("reloads a tab URL onto that tab alone", () => {
    expect(resolveWorkupLocation("?tab=ischemic", "")).toEqual({ tab: "ischemic", sectionId: null });
    expect(resolveWorkupLocation("?tab=hemorrhagic", "")).toEqual({ tab: "hemorrhagic", sectionId: null });
    expect(resolveWorkupLocation("?tab=carotid", "")).toEqual({ tab: "carotid", sectionId: null });
    expect(resolveWorkupLocation("", "#plan")).toEqual({ tab: "plan", sectionId: null });
  });

  it("opens a section hash on its own tab", () => {
    expect(resolveWorkupLocation("", "#atrial-cardiopathy")).toEqual({
      tab: "ischemic",
      sectionId: "atrial-cardiopathy",
    });
    expect(resolveWorkupLocation("", "#cor-triatriatum")).toEqual({
      tab: "ischemic",
      sectionId: "cor-triatriatum",
    });
    expect(resolveWorkupLocation("", "#acetazolamide-asl-cvr")).toEqual({
      tab: "carotid",
      sectionId: "acetazolamide-asl-cvr",
    });
  });

  it("lets the section hash choose the tab when the query names a different one", () => {
    expect(resolveWorkupLocation("?tab=ischemic", "#acetazolamide-asl-cvr")).toEqual({
      tab: "carotid",
      sectionId: "acetazolamide-asl-cvr",
    });
  });

  it("round-trips a tab path so a reload opens the same screen", () => {
    expect(tabPath("ischemic")).toBe("/?tab=ischemic");
    expect(tabPath("ischemic", "atrial-cardiopathy")).toBe("/?tab=ischemic#atrial-cardiopathy");
    const path = tabPath("carotid", "acetazolamide-asl-cvr");
    const hashAt = path.indexOf("#");
    expect(resolveWorkupLocation(path.slice(path.indexOf("?"), hashAt), path.slice(hashAt))).toEqual({
      tab: "carotid",
      sectionId: "acetazolamide-asl-cvr",
    });
  });
});

describe("back returns home", () => {
  it("pops the tab entry so the browser back gesture returns home", () => {
    expect(backToHomeAction({ workupNav: "tab" })).toBe("back");
  });

  it("replaces the URL with home when there is no tab entry underneath", () => {
    expect(backToHomeAction(null)).toBe("replace");
    expect(backToHomeAction(undefined)).toBe("replace");
    expect(backToHomeAction({ workupNav: "home" })).toBe("replace");
  });

  it("pushes the first tab and replaces a later tab switch", () => {
    expect(openTabHistoryMode(null)).toBe("push");
    expect(openTabHistoryMode("ischemic")).toBe("replace");
  });

  it("seeds a home entry under a directly opened tab", () => {
    const view = { tab: "ischemic" as const, sectionId: "atrial-cardiopathy" };
    expect(shouldSeedTabHistory(null, view)).toBe(true);
    expect(shouldSeedTabHistory({ workupNav: "tab" }, view)).toBe(false);
    expect(shouldSeedTabHistory(null, { tab: null, sectionId: null })).toBe(false);
    expect(seedEntriesForDirectTabLoad(view)).toEqual({
      replace: "/",
      push: "/?tab=ischemic#atrial-cardiopathy",
    });
    expect(seedEntriesForDirectTabLoad({ tab: "carotid", sectionId: "acetazolamide-asl-cvr" })).toEqual({
      replace: "/",
      push: "/?tab=carotid#acetazolamide-asl-cvr",
    });
    expect(seedEntriesForDirectTabLoad({ tab: null, sectionId: null })).toBeNull();
  });
});
