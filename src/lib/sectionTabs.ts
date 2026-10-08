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
  "ich-antithrombotic": "hemorrhagic",
  "ich-reversal-planner": "hemorrhagic",
  "stroke-plan": "plan",
  "nihss-calculator": "ischemic",
  "abcd2-score": "ischemic",
  "thrive-score": "ischemic",
  "mrs-scale": "ischemic",
  "secondary-ich-score": "hemorrhagic",
  "sich-cta": "hemorrhagic",
  "sich-dsa": "hemorrhagic",
  "tpa-eligibility": "ischemic",
  "ivt-decision-tree": "ischemic",
  "ivt-care-pathway": "ischemic",
  "evt-pathway": "ischemic",
  "ich-care-pathway": "hemorrhagic",
  "secondary-prevention-pathway": "ischemic",
  "lvo-dashboard": "ischemic",
  "aspects-calculator": "ischemic",
  "ctp-penumbra": "ischemic",
  "lipid-risk": "ischemic",
  "thrombolytics-anticoag": "ischemic",
  "lab-investigations": "ischemic",
  "d-dimer-stroke": "ischemic",
  "cancer-stroke-risk": "ischemic",
  "occult-cancer-screening": "ischemic",
  "treatment-recommender": "ischemic",
  "recurrent-dapt": "ischemic",
  "anticoagulant-reversal": "ischemic",
  "ischemic-ich-options": "ischemic",
  "ich-expansion": "hemorrhagic",
  "ich-score": "hemorrhagic",
  "func-score": "hemorrhagic",
  "sah-grading": "hemorrhagic",
  "fisher-scale": "hemorrhagic",
};

const LAZY_PARENT: Record<string, string> = {
  "ivt-care-pathway": "ivt-care-pathway",
  "evt-pathway": "evt-pathway",
  "ich-care-pathway": "ich-care-pathway",
  "secondary-prevention-pathway": "secondary-prevention-pathway",
  "sich-cta": "secondary-ich-score",
  "sich-dsa": "secondary-ich-score",
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
