import { describe, expect, it } from "vitest";
import {
  AHA_TICAGRELOR_DETAIL,
  CHANCE2_CONTINUATION,
  CHANCE2_NOTE,
  ESO_DAPT_GRADES,
  ESO_DAPT_NOTE,
  ESO_TICAGRELOR_CRITERIA,
  MINOR_STROKE_DAPT,
  MINOR_STROKE_DAPT_DOSING,
  MINOR_STROKE_DAPT_REFERENCES,
  MINOR_STROKE_DAPT_REGIMENS,
  MINOR_STROKE_DAPT_SOURCES_LINE,
  MINOR_STROKE_DAPT_TRIALS,
  splitNoteLinks,
  THALES_NOTE,
} from "@/lib/minorStrokeDapt";

describe("minor stroke and TIA DAPT card", () => {
  it("keeps the deck title and context verbatim", () => {
    expect(MINOR_STROKE_DAPT.title).toBe("Dual antiplatelet therapy after minor stroke or TIA");
    expect(MINOR_STROKE_DAPT.context).toBe(
      "Noncardioembolic events within 24 hours • AHA/ASA 2026 and ESO 2021 expedited guidance",
    );
    expect(MINOR_STROKE_DAPT.whoHeading).toBe("Who should receive each regimen?");
    expect(MINOR_STROKE_DAPT.trialsHeading).toBe("What did the trials show?");
  });

  it("keeps regimen eligibility and recommendation class verbatim", () => {
    expect(MINOR_STROKE_DAPT_REGIMENS.map((regimen) => regimen.title)).toEqual([
      "Clopidogrel + aspirin for 21 days",
      "Ticagrelor + aspirin for 30 days",
      "CYP2C19 loss-of-function carriers",
    ]);
    expect(MINOR_STROKE_DAPT_REGIMENS[0].grade).toBe("AHA/ASA Class 1 (A) • ESO strong recommendation");
    expect(MINOR_STROKE_DAPT_REGIMENS[0].detail).toBe(
      "Stroke NIHSS ≤3 or TIA ABCD₂ ≥4. AHA/ASA specifies no IV thrombolysis. Continue single antiplatelet therapy after day 21.",
    );
    expect(MINOR_STROKE_DAPT_REGIMENS[1].grade).toBe("AHA/ASA Class 2b (B-R) • ESO weak recommendation");
    expect(MINOR_STROKE_DAPT_REGIMENS[1].detail).toBe(
      "Stroke NIHSS ≤5 or TIA ABCD₂ ≥6 or qualifying stenosis. AHA/ASA specifies ≥50% symptomatic stenosis for the TIA criterion and no IV thrombolysis. ESO criteria are in the notes.",
    );
    expect(MINOR_STROKE_DAPT_REGIMENS[2].grade).toBe(
      "AHA/ASA Class 2b (B-R) for NIHSS ≤3 or ABCD₂ ≥4 without IVT.",
    );
    expect(MINOR_STROKE_DAPT_REGIMENS[2].detail).toBe(
      "Ticagrelor + aspirin for 21 days, then ticagrelor alone to day 90 as studied in CHANCE-2.",
    );
  });

  it("keeps THALES and CHANCE-2 figures verbatim", () => {
    expect(MINOR_STROKE_DAPT_TRIALS[0].title).toBe("THALES · vs aspirin alone");
    expect(MINOR_STROKE_DAPT_TRIALS[0].outcomeLine).toBe("30-day stroke or death: 5.5% vs 6.6% (HR 0.83)");
    expect(MINOR_STROKE_DAPT_TRIALS[0].extras).toEqual(["Severe bleeding: 0.5% vs 0.1%"]);
    expect(MINOR_STROKE_DAPT_TRIALS[1].title).toBe("CHANCE-2 · vs clopidogrel-based therapy");
    expect(MINOR_STROKE_DAPT_TRIALS[1].outcomeLine).toBe(
      "90-day stroke in loss-of-function carriers: 6.0% vs 7.6% (HR 0.77)",
    );
    expect(MINOR_STROKE_DAPT_TRIALS[1].extras).toEqual([
      "Moderate or severe bleeding: 0.3% in both",
      "Any bleeding: 5.3% vs 2.5%",
    ]);
    for (const trial of MINOR_STROKE_DAPT_TRIALS) {
      expect(`${trial.outcomeLabel}: ${trial.outcome} (${trial.hazard})`).toBe(trial.outcomeLine);
    }
  });

  it("keeps the 30-day ticagrelor schedule verbatim", () => {
    expect(MINOR_STROKE_DAPT_DOSING.title).toBe("30-day ticagrelor regimen");
    expect(MINOR_STROKE_DAPT_DOSING.caution).toBe("Avoid with prior ICH or active bleeding");
    expect(MINOR_STROKE_DAPT_DOSING.steps.map((step) => `${step.label}: ${step.detail}`)).toEqual([
      "DAY 1 • LOADING: Ticagrelor 180 mg + aspirin 300–325 mg",
      "DAYS 2–30 • MAINTENANCE: Ticagrelor 90 mg twice daily + aspirin 75–100 mg daily",
      "DAY 31 ONWARD: Single antiplatelet",
    ]);
  });

  it("keeps the source line and speaker notes verbatim", () => {
    expect(MINOR_STROKE_DAPT_SOURCES_LINE).toBe(
      "Sources · AHA/ASA 2026 §4.8 · ESO expedited recommendation 2021 · THALES (NEJM 2020) · CHANCE-2 (NEJM 2021) · Ticagrelor prescribing information",
    );
    expect(ESO_DAPT_NOTE).toContain(ESO_TICAGRELOR_CRITERIA);
    expect(ESO_DAPT_NOTE).toContain(ESO_DAPT_GRADES);
    expect(AHA_TICAGRELOR_DETAIL).toContain(CHANCE2_CONTINUATION);
    expect(THALES_NOTE).toContain("8.1% vs 10.9%, HR 0.73 (95% CI 0.56–0.96), interaction P=0.245");
    expect(CHANCE2_NOTE).toContain("Ticagrelor or clopidogrel was continued through day 90.");
    expect(MINOR_STROKE_DAPT_REFERENCES).toEqual([
      "AHA/ASA 2026, section 4.8, recommendations 9 and 12–15 and Table 9. https://doi.org/10.1161/STR.0000000000000513",
      AHA_TICAGRELOR_DETAIL,
      ESO_DAPT_NOTE,
      THALES_NOTE,
      CHANCE2_NOTE,
      "TAPIS examined early ticagrelor plus aspirin after IV thrombolysis in a separate population (baseline NIHSS 4–10). ESOC 2026 late-breaking abstract LT46. https://pmc.ncbi.nlm.nih.gov/articles/PMC13145187/",
      "Ticagrelor contraindications include prior intracranial haemorrhage and active pathological bleeding. https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/022433s039lbl.pdf",
    ]);
  });

  it("linkifies notes without dropping characters", () => {
    for (const note of MINOR_STROKE_DAPT_REFERENCES) {
      const parts = splitNoteLinks(note);
      expect(parts.map((part) => part.value).join("")).toBe(note);
      expect(parts.some((part) => part.type === "link")).toBe(note.includes("https://"));
    }
  });
});
