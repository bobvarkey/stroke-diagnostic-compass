import { describe, expect, it } from "vitest";
import {
  getLazyParentSection,
  getTabForSection,
  isCvtSection,
} from "@/lib/sectionTabs";

describe("section tab routing", () => {
  it("routes all new CVT modules onto the CVT tab", () => {
    expect(getTabForSection("cvt-management")).toBe("cvt");
    expect(getTabForSection("cvt-evaluation-pathway")).toBe("cvt");
    expect(getTabForSection("cvt-intraclot-thrombolysis")).toBe("cvt");
    expect(getTabForSection("cvt-procedural-techniques")).toBe("cvt");
    expect(getTabForSection("cvt-endovascular-techniques")).toBe("cvt");
  });

  it("force-mounts the CVT lazy wrapper before scrolling to a submodule", () => {
    expect(getLazyParentSection("cvt-intraclot-thrombolysis")).toBe("cvt-management");
    expect(getLazyParentSection("cvt-endovascular-techniques")).toBe("cvt-management");
  });

  it("does not treat ischemic sections as CVT", () => {
    expect(getTabForSection("acute-algorithm")).toBeUndefined();
    expect(isCvtSection("acute-algorithm")).toBe(false);
    expect(isCvtSection("cvt-procedural-techniques")).toBe(true);
  });
});
