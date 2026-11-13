/** Copy taken from the owner's slide "Asundexian and milvexian". */
export const FACTOR_XIA_SECTION_ID = "factor-xia-inhibitors";

export const FACTOR_XIA_TITLE = "Asundexian and milvexian";

export const FACTOR_XIA_SUBTITLE =
  "Direct, selective oral factor XIa inhibitors studied as add-ons to antiplatelet therapy after stroke or TIA";

export const FACTOR_XIA_CAPTION =
  "Asundexian and milvexian: oral factor XIa inhibitors after stroke or TIA";

export const FACTOR_XIA_COLUMNS = ["Comparison", "Asundexian", "Milvexian"] as const;

export const FACTOR_XIA_ROWS = [
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
] as const;

export const FACTOR_XIA_FOOTNOTE =
  "Results compare asundexian with placebo on background antiplatelet therapy. Median follow-up 19 months.";

export const FACTOR_XIA_CITATIONS =
  "Sharma et al., NEJM 2026  /  NCT05702034, 13 Nov 2026  /  Brase et al. 2024  /  Perera et al. 2022";
