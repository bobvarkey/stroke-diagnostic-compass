import { labelFromId } from "@/lib/protocolStatus";

export const ASL_CVR_SECTION_ID = "acetazolamide-asl-cvr";
export const ASL_CVR_TITLE = "Cerebrovascular reserve with 3D pCASL MRI and oral acetazolamide";
export const ASL_CVR_STATUS = "draft_for_local_validation";
export const ASL_CVR_STATUS_LABEL = labelFromId(ASL_CVR_STATUS);
export const REQUIRES_LOCAL_VALIDATION = "requires local validation";
export const SUPPLIED_WORKFLOW_PARAMETER = "supplied workflow parameter";

export const ASL_CVR_PURPOSE =
  "Measure regional cerebral blood flow (CBF) before and after a vasodilator challenge in patients evaluated for cerebrovascular steno-occlusive disease.";
export const ASL_CVR_EVIDENCE_SCOPE =
  "The ACR–ACNM–SNMMI–SPR parameter describes an IV acetazolamide challenge for SPECT. ASL acquisition guidance and oral acetazolamide evidence are cited separately.";
export const ASL_CVR_LOCAL_PARAMETERS = [
  "Oral formulation, adult dose, pediatric eligibility and dosing, and whether tablets may be crushed",
  "Post-dose acquisition window and any serial sampling schedule",
  "Scanner-specific ASL settings, adequacy criteria and regional CVR reference ranges",
] as const;

export const ASL_CVR_HEADER_NOTES = [
  ASL_CVR_PURPOSE,
  ASL_CVR_EVIDENCE_SCOPE,
  ...ASL_CVR_LOCAL_PARAMETERS,
] as const;

export const SCREENING_ITEMS = [
  "Known acetazolamide hypersensitivity",
  "Marked renal or hepatic dysfunction, including cirrhosis",
  "Hyponatremia or hypokalemia",
  "Hyperchloremic acidosis",
  "Adrenal insufficiency",
] as const;

export const WITHHOLD_ACTION = "Withhold acetazolamide if a labeled contraindication applies.";
export const WITHHOLD_SOURCE_IDS = ["dailymed"] as const;

export const SCREENING_ACTIONS = [
  {
    text: "Document the culprit drug and reaction. Review against the local challenge policy, especially after a severe reaction. The ACR SPECT parameter lists known sulfa allergy as a contraindication.",
    sourceIds: ["acr_spect", "dailymed"],
  },
  {
    text: "Flag acute stroke or recent TIA within 3 days for deferral and specialist review, consistent with the ACR SPECT parameter. Flag recent intracranial hemorrhage separately for specialist review.",
    sourceIds: ["acr_spect"],
  },
  {
    text: "Document pregnancy status when relevant. If pregnant, obtain clinician assessment of maternal benefit and fetal risk before any challenge.",
    sourceIds: ["dailymed"],
  },
  {
    text: "Review migraine history and concurrent medications, including high-dose aspirin. Complete standard MRI safety screening.",
    sourceIds: ["acr_spect", "dailymed"],
  },
] as const;

export const AVOID = ["caffeine", "nicotine", "heavy meals"] as const;
export const AVOIDANCE_INTERVAL_HOURS = { min: 4, max: 6 } as const;
export const BASELINE_OBSERVATIONS = ["resting blood pressure", "heart rate", "neurological status"] as const;
export const VOID_BEFORE_IMAGING = "Void before imaging";

export const RESTING_CONDITIONS = [
  "quiet and dim environment when feasible",
  "eyes closed if tolerated",
  "avoid talking and head movement",
] as const;

export const ANATOMICAL_SEQUENCES = [
  { name: "3D T1-weighted MRI", purpose: "registration and tissue segmentation" },
  { name: "3D time-of-flight MRA", purpose: "characterize steno-occlusive anatomy and visible collateral pathways" },
] as const;

export const PCASL_SEQUENCE = "3D pseudo-continuous arterial spin labeling";
export const EXAMPLE_LABELING_DURATION_MS = { min: 1500, max: 1800 } as const;
export const EXAMPLE_SINGLE_PLD_MS = 2000;
export const ACQUIRE_M0 = "Acquire M0 calibration as required by quantification";
export const DELAYED_TRANSIT_STRATEGY =
  "Consider multi-PLD when arterial transit is prolonged, particularly in severe steno-occlusive disease or moyamoya. A locally validated long-label, long-PLD acquisition is an alternative when multi-PLD is unavailable.";
export const PCASL_SOURCE_IDS = ["asl_guidance", "moyamoya_asl_pet"] as const;

export const DRUG_GENERIC_NAME = "acetazolamide";
export const DRUG_BRAND_EXAMPLE = "Diamox";
export const DRUG_ROUTE = "oral";
export const ADULT_DOSE_MG = { min: 1000, max: 1200 } as const;
export const PEDIATRIC_MG_PER_KG = 14;
export const PEDIATRIC_CAP_CANDIDATES_MG = [1000, 1200] as const;
export const APPROVED_ORAL_PEDIATRIC_DOSE_MG_PER_KG = null;
export const APPROVED_ORAL_PEDIATRIC_CAP_MG = null;
export const DOSE_EVIDENCE_NOTE =
  "The ACR pediatric 14 mg/kg figure refers to IV administration for SPECT. A small oral study evaluated 1000 mg in healthy adults and does not establish the proposed range or pediatric regimen.";
export const DOSE_SOURCE_IDS = ["acr_spect", "oral_cbf_study", "dailymed"] as const;
export const DOSE_NOTES = [DOSE_EVIDENCE_NOTE, ...DOSE_SOURCE_IDS] as const;

export const PREPARATION_METHOD =
  "Crush eligible immediate-release tablets and mix with a small amount of water or juice if pharmacy confirms the specific product can be crushed.";
export const DO_NOT_CRUSH_EXTENDED_RELEASE = "Do not crush extended release";
export const CRUSH_EVIDENCE_NOTE = "The effect of crushing on time to peak CBF response was unverified.";

export const DOSE_RECORD = [
  "actual dose in mg",
  "formulation",
  "preparation",
  "dose completion time",
  "emesis or incomplete dose",
] as const;
export const DOSE_MONITOR = ["blood pressure", "heart rate", "neurological status", "adverse symptoms"] as const;
export const URGENT_ACTION =
  "Stop the procedure and activate the local emergency pathway for a new focal deficit, suspected severe hypersensitivity, or clinical instability.";

export const TIMING_WINDOW_MINUTES = { min: 30, max: 45 } as const;
export const SERIAL_SCAN_MINUTES = [30, 40, 50] as const;
export const TIMING_EVIDENCE_NOTE =
  "The 30–45 minute oral peak was unverified. A study of eight healthy volunteers reported a CBF increase at 180 minutes after 1000 mg orally. That observation does not establish the time of peak response or an oral pCASL acquisition window.";
export const TIMING_SOURCE_IDS = ["oral_cbf_study"] as const;
export const TIMING_NOTES = [TIMING_EVIDENCE_NOTE, ...TIMING_SOURCE_IDS] as const;

export const POST_CHALLENGE_ACQUISITION = [
  "Reproduce baseline head position, labeling plane and resting conditions as closely as feasible.",
  "Repeat 3D pCASL with the same acquisition and calibration settings, including the same PLD or PLDs.",
  "Record the actual post-dose start and end times for each acquisition.",
] as const;

export const ZERO_EVENT = "completion of oral dose";
export const POST_DOSE_UNIT = "minutes";
export const BASELINE_ACQUISITION = "before dose";
export const RECORD_SCAN_TIMES = "Record actual scan start and end";

export const PROCESSING = [
  "Co-register baseline and post-challenge CBF maps to the T1 image.",
  "Inspect motion, alignment, signal quality, arterial transit effects and labeling artifacts.",
  "Calculate CVR for each relevant region or voxel using paired, quality-checked CBF values.",
] as const;

export const CVR_FORMULA = "100 * (cbf_post - cbf_pre) / cbf_pre";
export const CBF_UNIT = "mL/100 g/min";
export const CVR_UNIT = "%";
export const CVR_INVALID_IF = [
  "missing or nonfinite CBF",
  "baseline CBF at or below zero",
  "unreliable baseline or post-challenge CBF estimate",
] as const;
export const CALCULATION_NOTES = [CVR_FORMULA, CBF_UNIT, CVR_UNIT, ...CVR_INVALID_IF] as const;
export const AUTOMATIC_GRADE_ENABLED = false;

export const REPORTABLE_PATTERNS = [
  { label: "Preserved reserve", description: "CBF augmentation consistent with an adequate challenge and local reference data." },
  { label: "Reduced reserve", description: "Blunted CBF augmentation relative to local reference data, with technical and challenge adequacy assessed." },
  { label: "Absent measurable augmentation", description: "No convincing CBF change within measurement uncertainty." },
  { label: "Possible steal", description: "A credible regional CBF decrease after challenge, interpreted in the context of transit effects, motion, systemic hemodynamics and the adequacy of the stimulus." },
  { label: "Indeterminate", description: "Image quality, delayed transit, timing or uncertain stimulus adequacy limits interpretation." },
] as const;

export const ILLUSTRATIVE_REFERENCE_NOTES = [
  "normal 30–60%",
  "reduced cutoff examples 10/20%",
  "illustrative values for review",
] as const;
export const HISTORICAL_TYPE_LABELS =
  "The supplied Type I–III labels are retained as historical context. Published schemes can incorporate resting CBF as well as the response to challenge. Use descriptive patterns and measured CVR for this oral pCASL draft.";
export const INTERPRETATION_SOURCE_IDS = ["cvr_review", "asl_guidance", "moyamoya_asl_pet"] as const;
export const INTERPRETATION_NOTES = [
  ...ILLUSTRATIVE_REFERENCE_NOTES,
  HISTORICAL_TYPE_LABELS,
  ...INTERPRETATION_SOURCE_IDS,
] as const;

export const REPORT_FIELDS = [
  "Oral formulation, dose and actual dose-to-scan interval",
  "ASL acquisition and PLD settings",
  "Baseline and post-challenge CBF and percent CVR by territory and side",
  "Arterial transit time when available",
  "Technical limitations, stimulus adequacy and regional interpretation",
  "Symptoms or adverse events",
] as const;

export const RECOVERY_ACTIONS = [
  "Ask about tingling, lightheadedness, flushing and other symptoms.",
  "Assist the patient when sitting or standing and assess symptoms of postural hypotension.",
  "Document recovery observations and apply local discharge criteria.",
] as const;
export const RECOVERY_SOURCE_IDS = ["acr_spect", "dailymed"] as const;

export const ASL_CVR_REFERENCES = [
  { id: "acr_spect", title: "ACR–ACNM–SNMMI–SPR Practice Parameter for Single-Photon Emission Brain Perfusion Imaging", url: "https://www.acr.org/-/media/ACR/Files/Practice-Parameters/BrainPerf-SPECT.pdf" },
  { id: "dailymed", title: "DailyMed acetazolamide tablet prescribing information", url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c24d31f0-a556-4e53-97a9-4e05e28ca40f" },
  { id: "asl_guidance", title: "Lindner et al. Current state and guidance on arterial spin labeling perfusion MRI in clinical neuroimaging", url: "https://doi.org/10.1002/mrm.29572" },
  { id: "oral_cbf_study", title: "Lassen et al. Effects of acetazolamide on cerebral blood flow and brain tissue oxygenation", url: "https://doi.org/10.1136/pgmj.63.737.185" },
  { id: "cvr_review", title: "Vagal et al. The acetazolamide challenge in the evaluation of chronic cerebral ischemia", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7051638/" },
  { id: "moyamoya_asl_pet", title: "Using arterial spin labeling to measure cerebrovascular reactivity in Moyamoya disease: Insights from simultaneous PET/MRI", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9274857/" },
] as const;

export const ASL_STEP_TITLES = [
  "Pre-scan screening and patient preparation",
  "Baseline MRI before oral dose",
  "Oral acetazolamide administration and observation",
  "Post-challenge pCASL MRI",
  "Post-processing, interpretation and reporting",
  "Post-procedure care",
] as const;

export function parseCbfInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/** CVR % = 100 * (post - pre) / pre. Blank when an input is missing, nonfinite, or baseline is <= 0. */
export function calculateCvrPercent(
  cbfPre: number | null | undefined,
  cbfPost: number | null | undefined,
): number | null {
  if (cbfPre == null || cbfPost == null) return null;
  if (!Number.isFinite(cbfPre) || !Number.isFinite(cbfPost)) return null;
  if (cbfPre <= 0) return null;
  const cvr = (100 * (cbfPost - cbfPre)) / cbfPre;
  return Number.isFinite(cvr) ? cvr : null;
}

export function formatDecimal(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  if (Object.is(rounded, -0)) return "0";
  return String(rounded);
}

export function formatCbf(value: number): string {
  return formatDecimal(value, 3);
}

export function formatCvrPercent(value: number): string {
  return formatDecimal(value, 1);
}

export type AslCvrCopyInput = {
  checkedScreening: readonly string[];
  cbfPre: number | null;
  cbfPost: number | null;
};

export function formatAslCvrCopy(input: AslCvrCopyInput): string {
  const lines = [ASL_CVR_TITLE];
  for (const item of SCREENING_ITEMS) {
    if (input.checkedScreening.includes(item)) lines.push(`${item}: Yes`);
  }
  if (input.cbfPre != null && Number.isFinite(input.cbfPre)) {
    lines.push(`CBF pre: ${formatCbf(input.cbfPre)} ${CBF_UNIT}`);
  }
  if (input.cbfPost != null && Number.isFinite(input.cbfPost)) {
    lines.push(`CBF post: ${formatCbf(input.cbfPost)} ${CBF_UNIT}`);
  }
  const cvr = calculateCvrPercent(input.cbfPre, input.cbfPost);
  if (cvr != null) lines.push(`CVR: ${formatCvrPercent(cvr)}%`);
  return lines.join("\n");
}
