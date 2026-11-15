/**
 * Workup navigation: home is the landing view, and each condition tab is its own page.
 * The URL is the source of truth so a reload reopens the same tab, and a tab opened
 * from home pushes one history entry so the browser back gesture returns home.
 */
import { getTabForSection } from "@/lib/sectionTabs";

export const WORKUP_TAB_IDS = [
  "ischemic",
  "hemorrhagic",
  "post-ivt",
  "cvt",
  "carotid",
  "sah",
  "sdh",
  "plan",
] as const;

export type WorkupTabId = (typeof WORKUP_TAB_IDS)[number];

export interface WorkupView {
  tab: WorkupTabId | null;
  sectionId: string | null;
}

const TAB_IDS = new Set<string>(WORKUP_TAB_IDS);

export function isWorkupTab(value: string | null | undefined): value is WorkupTabId {
  return !!value && TAB_IDS.has(value);
}

function decodeHash(hash: string): string {
  const stripped = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!stripped) return "";
  try {
    return decodeURIComponent(stripped);
  } catch {
    return stripped;
  }
}

/** Which screen a URL shows. A section hash selects its own tab. */
export function resolveWorkupLocation(search: string, hash: string): WorkupView {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const queryTab = params.get("tab");
  const rawHash = decodeHash(hash);
  const hashIsTab = isWorkupTab(rawHash);
  const sectionId = rawHash && !hashIsTab ? rawHash : null;
  const tabFromHash = hashIsTab ? rawHash : sectionId ? getTabForSection(sectionId) ?? null : null;
  const tabFromQuery = isWorkupTab(queryTab) ? queryTab : null;
  const tab = (isWorkupTab(tabFromHash) ? tabFromHash : null) ?? tabFromQuery;
  return { tab, sectionId: tab ? sectionId : null };
}

/** Reloadable path for a tab, optionally scrolled to a section anchor. */
export function tabPath(tab: string, sectionId?: string | null): string {
  const base = `/?tab=${encodeURIComponent(tab)}`;
  return sectionId ? `${base}#${encodeURIComponent(sectionId)}` : base;
}

/**
 * Opening the first tab pushes history so Back returns home.
 * Switching tabs replaces that entry so Back still returns home, not the previous tab.
 */
export function openTabHistoryMode(currentTab: string | null): "push" | "replace" {
  return currentTab ? "replace" : "push";
}

/** In-app Back pops the tab entry when one was pushed; otherwise it replaces the URL with home. */
export function backToHomeAction(historyState: unknown): "back" | "replace" {
  if (
    historyState &&
    typeof historyState === "object" &&
    (historyState as { workupNav?: string }).workupNav === "tab"
  ) {
    return "back";
  }
  return "replace";
}

/** A tab URL opened directly (reload, pasted link) has nothing under it until we seed home. */
export function shouldSeedTabHistory(historyState: unknown, view: WorkupView): boolean {
  if (!view.tab) return false;
  return backToHomeAction(historyState) !== "back";
}

export function seedEntriesForDirectTabLoad(view: WorkupView): { replace: string; push: string } | null {
  if (!view.tab) return null;
  return { replace: "/", push: tabPath(view.tab, view.sectionId) };
}
