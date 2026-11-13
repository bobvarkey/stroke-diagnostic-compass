import { describe, expect, it } from "vitest";
import { getTabForSection } from "@/lib/sectionTabs";
import {
  FACTOR_XIA_CAPTION,
  FACTOR_XIA_CITATIONS,
  FACTOR_XIA_COLUMNS,
  FACTOR_XIA_FOOTNOTE,
  FACTOR_XIA_ROWS,
  FACTOR_XIA_SECTION_ID,
  FACTOR_XIA_SUBTITLE,
  FACTOR_XIA_TITLE,
} from "@/lib/factorXIaInhibitors";

describe("factor XIa inhibitor slide", () => {
  it("routes the section to the ischemic tab", () => {
    expect(getTabForSection(FACTOR_XIA_SECTION_ID)).toBe("ischemic");
  });

  it("keeps the slide title, subtitle, footnote, and citations", () => {
    expect(FACTOR_XIA_TITLE).toBe("Asundexian and milvexian");
    expect(FACTOR_XIA_SUBTITLE).toBe(
      "Direct, selective oral factor XIa inhibitors studied as add-ons to antiplatelet therapy after stroke or TIA",
    );
    expect(FACTOR_XIA_CAPTION).toBe(
      "Asundexian and milvexian: oral factor XIa inhibitors after stroke or TIA",
    );
    expect(FACTOR_XIA_FOOTNOTE).toBe(
      "Results compare asundexian with placebo on background antiplatelet therapy. Median follow-up 19 months.",
    );
    expect(FACTOR_XIA_CITATIONS).toBe(
      "Sharma et al., NEJM 2026  /  NCT05702034, 13 Nov 2026  /  Brase et al. 2024  /  Perera et al. 2022",
    );
    expect(FACTOR_XIA_COLUMNS).toEqual(["Comparison", "Asundexian", "Milvexian"]);
  });

  it("keeps the comparison rows as written on the slide", () => {
    expect(FACTOR_XIA_ROWS).toEqual([
      {
        label: "Phase III stroke dose",
        asundexian: ["50 mg once daily"],
        milvexian: ["25 mg twice daily"],
      },
      {
        label: "Time to peak (Tmax)",
        asundexian: ["2–4 hours in phase I"],
        milvexian: ["3 hours (median, fasting)"],
      },
      {
        label: "Phase III stroke trial",
        asundexian: ["OCEANIC-STROKE"],
        milvexian: ["LIBREXIA-STROKE"],
      },
      {
        label: "Phase III stroke results",
        asundexian: [
          "Ischaemic stroke 6.2% vs 8.4%",
          "HR 0.74 (95% CI 0.65–0.84)",
          "Major bleeding 1.9% vs 1.7%",
        ],
        milvexian: ["Enrolment complete", "Public results pending"],
      },
      {
        label: "Pharmacology note",
        asundexian: ["Reversible FXIa inhibition", "Little effect on bleeding time in animals"],
        milvexian: ["Itraconazole increased milvexian exposure 2.5-fold in a phase I study"],
      },
    ]);
  });
});
