/**
 * Verbatim minor-stroke / TIA dual-antiplatelet guidance from the
 * AHA/ASA 2026 and ESO 2021 reference card. Wording, figures, and
 * citations stay here so the section can render them without rewriting.
 */

export const MINOR_STROKE_DAPT = {
  title: "Dual antiplatelet therapy after minor stroke or TIA",
  context:
    "Noncardioembolic events within 24 hours • AHA/ASA 2026 and ESO 2021 expedited guidance",
  whoHeading: "Who should receive each regimen?",
  trialsHeading: "What did the trials show?",
} as const;

export const AHA_DAPT_CITATION =
  "AHA/ASA 2026, section 4.8, recommendations 9 and 12–15 and Table 9. https://doi.org/10.1161/STR.0000000000000513";

export const AHA_TICAGRELOR_DETAIL =
  "The 30-day ticagrelor recommendation is Class 2b, LOE B-R. For TIA, AHA/ASA specifies ABCD₂ ≥6 or ≥50% symptomatic intracranial or extracranial stenosis likely to account for the event. The acute ticagrelor monotherapy Class 3 (No Benefit) recommendation concerns initial ticagrelor versus aspirin in the specified population. CHANCE-2 supports a distinct ticagrelor continuation phase after 21 days of dual therapy.";

export const ESO_DAPT_NOTE =
  "ESO expedited recommendation (2021). https://doi.org/10.1177/23969873211027006 . For ticagrelor plus aspirin, qualifying TIA features are ABCD₂ ≥6 or intracranial atherosclerotic disease or ≥50% internal carotid artery stenosis accounting for the presentation. ESO grades clopidogrel plus aspirin as strong with high-quality evidence and ticagrelor plus aspirin as weak with moderate-quality evidence.";

export const ESO_TICAGRELOR_CRITERIA =
  "For ticagrelor plus aspirin, qualifying TIA features are ABCD₂ ≥6 or intracranial atherosclerotic disease or ≥50% internal carotid artery stenosis accounting for the presentation.";

export const ESO_DAPT_GRADES =
  "ESO grades clopidogrel plus aspirin as strong with high-quality evidence and ticagrelor plus aspirin as weak with moderate-quality evidence.";

export const THALES_NOTE =
  "THALES. https://doi.org/10.1056/NEJMoa1916870 . Exploratory ipsilateral stenosis ≥30% analysis: stroke or death 8.1% vs 10.9%, HR 0.73 (95% CI 0.56–0.96), interaction P=0.245. This subgroup cutoff differs from the AHA/ASA TIA eligibility threshold. https://doi.org/10.1161/STROKEAHA.120.032239";

export const CHANCE2_NOTE =
  "CHANCE-2. https://pubmed.ncbi.nlm.nih.gov/34708996/ . Ticagrelor or clopidogrel was continued through day 90. Both arms received aspirin for the first 21 days. The AHA/ASA genotype-guided recommendation is Class 2b, LOE B-R.";

export const CHANCE2_CONTINUATION =
  "CHANCE-2 supports a distinct ticagrelor continuation phase after 21 days of dual therapy.";

export const TAPIS_NOTE =
  "TAPIS examined early ticagrelor plus aspirin after IV thrombolysis in a separate population (baseline NIHSS 4–10). ESOC 2026 late-breaking abstract LT46. https://pmc.ncbi.nlm.nih.gov/articles/PMC13145187/";

export const TICAGRELOR_LABEL_NOTE =
  "Ticagrelor contraindications include prior intracranial haemorrhage and active pathological bleeding. https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/022433s039lbl.pdf";

export const MINOR_STROKE_DAPT_REGIMENS = [
  {
    id: "clopidogrel",
    title: "Clopidogrel + aspirin for 21 days",
    grade: "AHA/ASA Class 1 (A) • ESO strong recommendation",
    detail:
      "Stroke NIHSS ≤3 or TIA ABCD₂ ≥4. AHA/ASA specifies no IV thrombolysis. Continue single antiplatelet therapy after day 21.",
    noteLabel: "Clopidogrel plus aspirin guideline details",
    notes: [ESO_DAPT_GRADES, AHA_DAPT_CITATION],
  },
  {
    id: "ticagrelor",
    title: "Ticagrelor + aspirin for 30 days",
    grade: "AHA/ASA Class 2b (B-R) • ESO weak recommendation",
    detail:
      "Stroke NIHSS ≤5 or TIA ABCD₂ ≥6 or qualifying stenosis. AHA/ASA specifies ≥50% symptomatic stenosis for the TIA criterion and no IV thrombolysis. ESO criteria are in the notes.",
    noteLabel: "ESO criteria and AHA/ASA ticagrelor details",
    notes: [ESO_DAPT_NOTE, AHA_TICAGRELOR_DETAIL, TAPIS_NOTE],
  },
  {
    id: "cyp2c19",
    title: "CYP2C19 loss-of-function carriers",
    grade: "AHA/ASA Class 2b (B-R) for NIHSS ≤3 or ABCD₂ ≥4 without IVT.",
    detail:
      "Ticagrelor + aspirin for 21 days, then ticagrelor alone to day 90 as studied in CHANCE-2.",
    noteLabel: "CHANCE-2 genotype-guided details",
    notes: [CHANCE2_CONTINUATION, CHANCE2_NOTE],
  },
] as const;

export const MINOR_STROKE_DAPT_TRIALS = [
  {
    id: "thales",
    title: "THALES · vs aspirin alone",
    outcomeLabel: "30-day stroke or death",
    outcome: "5.5% vs 6.6%",
    hazard: "HR 0.83",
    outcomeLine: "30-day stroke or death: 5.5% vs 6.6% (HR 0.83)",
    extras: ["Severe bleeding: 0.5% vs 0.1%"],
    noteLabel: "THALES notes",
    notes: [THALES_NOTE],
  },
  {
    id: "chance2",
    title: "CHANCE-2 · vs clopidogrel-based therapy",
    outcomeLabel: "90-day stroke in loss-of-function carriers",
    outcome: "6.0% vs 7.6%",
    hazard: "HR 0.77",
    outcomeLine: "90-day stroke in loss-of-function carriers: 6.0% vs 7.6% (HR 0.77)",
    extras: ["Moderate or severe bleeding: 0.3% in both", "Any bleeding: 5.3% vs 2.5%"],
    noteLabel: "CHANCE-2 notes",
    notes: [CHANCE2_NOTE],
  },
] as const;

export const MINOR_STROKE_DAPT_DOSING = {
  title: "30-day ticagrelor regimen",
  caution: "Avoid with prior ICH or active bleeding",
  noteLabel: "Ticagrelor contraindications",
  notes: [TICAGRELOR_LABEL_NOTE],
  steps: [
    { label: "DAY 1 • LOADING", detail: "Ticagrelor 180 mg + aspirin 300–325 mg" },
    { label: "DAYS 2–30 • MAINTENANCE", detail: "Ticagrelor 90 mg twice daily + aspirin 75–100 mg daily" },
    { label: "DAY 31 ONWARD", detail: "Single antiplatelet" },
  ],
} as const;

export const MINOR_STROKE_DAPT_SOURCES = [
  { label: "AHA/ASA 2026 §4.8", href: "https://doi.org/10.1161/STR.0000000000000513" },
  { label: "ESO expedited recommendation 2021", href: "https://doi.org/10.1177/23969873211027006" },
  { label: "THALES (NEJM 2020)", href: "https://doi.org/10.1056/NEJMoa1916870" },
  { label: "CHANCE-2 (NEJM 2021)", href: "https://pubmed.ncbi.nlm.nih.gov/34708996/" },
  {
    label: "Ticagrelor prescribing information",
    href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/022433s039lbl.pdf",
  },
] as const;

export const MINOR_STROKE_DAPT_SOURCES_LINE = `Sources · ${MINOR_STROKE_DAPT_SOURCES.map((source) => source.label).join(" · ")}`;

/** Speaker notes, in deck order, for the references disclosure. */
export const MINOR_STROKE_DAPT_REFERENCES = [
  AHA_DAPT_CITATION,
  AHA_TICAGRELOR_DETAIL,
  ESO_DAPT_NOTE,
  THALES_NOTE,
  CHANCE2_NOTE,
  TAPIS_NOTE,
  TICAGRELOR_LABEL_NOTE,
] as const;

export type NotePart = { type: "text"; value: string } | { type: "link"; value: string };

const URL_PATTERN = /https?:\/\/[^\s]+/g;

/** Split a verbatim note into text and URL parts without dropping characters. */
export function splitNoteLinks(text: string): NotePart[] {
  const parts: NotePart[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ type: "text", value: text.slice(last, index) });
    parts.push({ type: "link", value: match[0] });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  if (parts.length === 0) parts.push({ type: "text", value: text });
  return parts;
}
