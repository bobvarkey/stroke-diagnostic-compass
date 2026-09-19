/**
 * Map in-page section IDs to the top-level workup tab that contains them.
 * Inactive Radix TabsContent is unmounted, so sidebar/hash navigation must
 * switch tabs before scrolling or the target is not in the DOM.
 */
export const SECTION_TO_TAB: Record<string, string> = {
  "cvt-management": "cvt",
  "cvt-evaluation-pathway": "cvt",
  "cvt-intraclot-thrombolysis": "cvt",
  "cvt-procedural-techniques": "cvt",
  "cvt-endovascular-techniques": "cvt",
  "cvt-etiological-evaluation": "cvt",

  "post-ivt-hemorrhage": "post-ivt",

  "sah-management": "sah",
  "sdh-management": "sdh",

  "acute-ich": "hemorrhagic",
  "ich-expansion": "hemorrhagic",
  "ich-score": "hemorrhagic",
  "func-score": "hemorrhagic",
  "sah-grading": "hemorrhagic",
  "fisher-scale": "hemorrhagic",
};

const LAZY_PARENT: Record<string, string> = {
  "cvt-evaluation-pathway": "cvt-management",
  "cvt-intraclot-thrombolysis": "cvt-management",
  "cvt-procedural-techniques": "cvt-management",
  "cvt-endovascular-techniques": "cvt-management",
  "cvt-etiological-evaluation": "cvt-management",
};

export const NAVIGATE_SECTION_EVENT = "navigate-section";

export function getTabForSection(sectionId: string): string | undefined {
  return SECTION_TO_TAB[sectionId];
}

export function getLazyParentSection(sectionId: string): string | undefined {
  return LAZY_PARENT[sectionId];
}

export function isCvtSection(sectionId: string): boolean {
  return getTabForSection(sectionId) === "cvt" || sectionId.startsWith("cvt-");
}
