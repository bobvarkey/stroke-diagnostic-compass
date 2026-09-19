import { describe, expect, it } from "vitest";
import {
  CVT_INTRACLOT_AGENTS,
  CVT_INTRACLOT_ANTICOAGULATION,
  CVT_INTRACLOT_ATTRIBUTION,
  CVT_INTRACLOT_CITATIONS,
  CVT_INTRACLOT_DISCLAIMER,
  CVT_INTRACLOT_ENDPOINT,
  CVT_INTRACLOT_MAX_DURATION,
  CVT_INTRACLOT_MONITORING,
  CVT_INTRACLOT_SOURCE_NOTE,
} from "@/lib/cvtIntraclotThrombolysis";

describe("CVT intraclot thrombolysis protocol", () => {
  it("preserves urokinase and alteplase bolus/infusion doses from the supplied source", () => {
    expect(CVT_INTRACLOT_AGENTS).toHaveLength(2);
    expect(CVT_INTRACLOT_AGENTS[0]).toMatchObject({
      id: "urokinase",
      name: "Urokinase",
      bolus: "100,000 IU",
      infusion: "70,000–80,000 IU/h",
    });
    expect(CVT_INTRACLOT_AGENTS[1]).toMatchObject({
      id: "alteplase",
      name: "Alteplase (tPA)",
      conjunction: "or",
      bolus: "10 mg",
      infusion: "1 mg/h",
    });
  });

  it("limits treatment to functional recanalization with a 3-day maximum", () => {
    expect(CVT_INTRACLOT_MAX_DURATION).toBe("maximum 3 days");
    expect(CVT_INTRACLOT_ENDPOINT).toContain("functional recanalization");
    expect(CVT_INTRACLOT_ENDPOINT).toContain("dural venous sinuses");
    expect(CVT_INTRACLOT_ENDPOINT).toContain("maximum 3 days");
  });

  it("includes bleeding cessation and 12-hour angiogram monitoring", () => {
    expect(CVT_INTRACLOT_MONITORING.bleeding).toContain("prompt cessation");
    expect(CVT_INTRACLOT_MONITORING.angiograms).toBe(
      "Check angiograms at 12-hour intervals until termination",
    );
  });

  it("records post-thrombolysis heparin aPTT and warfarin INR/duration", () => {
    expect(CVT_INTRACLOT_ANTICOAGULATION.heparinTarget).toBe("aPTT at 2–3× normal");
    expect(CVT_INTRACLOT_ANTICOAGULATION.warfarinTarget).toBe("INR 2–3");
    expect(CVT_INTRACLOT_ANTICOAGULATION.warfarinDuration).toBe("6 months");
    expect(CVT_INTRACLOT_ANTICOAGULATION.heparin).toContain("Heparin continued");
    expect(CVT_INTRACLOT_ANTICOAGULATION.warfarin).toContain("warfarin");
  });

  it("labels the text as a transcribed protocol with citations [67] and [8]", () => {
    expect(CVT_INTRACLOT_ATTRIBUTION).toContain("transcribed from the supplied source");
    expect(CVT_INTRACLOT_CITATIONS).toEqual(["[67]", "[8]"]);
  });

  it("presents mechanical thrombectomy as a source note, not a recommendation against MT", () => {
    expect(CVT_INTRACLOT_SOURCE_NOTE).toContain("not attempted");
    expect(CVT_INTRACLOT_SOURCE_NOTE.toLowerCase()).toContain("study context");
    expect(CVT_INTRACLOT_SOURCE_NOTE.toLowerCase()).toContain(
      "not a recommendation against mechanical thrombectomy",
    );
  });

  it("includes a clinical-reference disclaimer consistent with the app", () => {
    expect(CVT_INTRACLOT_DISCLAIMER.toLowerCase()).toContain("not a substitute");
    expect(CVT_INTRACLOT_DISCLAIMER).toContain("not a medical device");
  });
});
