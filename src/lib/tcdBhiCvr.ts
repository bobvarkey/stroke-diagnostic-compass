import { labelFromId } from "@/lib/protocolStatus";

export const TCD_BHI_SECTION_ID = "tcd-bhi-cvr";
export const TCD_BHI_TITLE = "Cerebrovascular reactivity by transcranial Doppler breath-holding index";
export const TCD_BHI_STATUS = "draft_for_local_adoption";
export const TCD_BHI_STATUS_LABEL = labelFromId(TCD_BHI_STATUS);

export const TCD_SCOPE = {
  population: "Cooperative, clinically stable adults referred for cerebrovascular hemodynamic assessment, particularly in carotid steno-occlusive disease.",
  stimulus: "Voluntary breath-hold after a normal inspiration",
  primaryVessel: "Middle cerebral artery (MCA), M1 segment",
  measurement: "Change in MCA mean flow velocity (MFV) during a breath-hold challenge, expressed as percent change per second of apnea.",
  modalityNote: "TCD BHI measures a velocity response to breath-holding. ASL acetazolamide CVR measures a tissue perfusion response to a pharmacologic stimulus. Report the methods and values independently.",
} as const;

export const TCD_HEADER_NOTES = [
  TCD_SCOPE.population,
  TCD_SCOPE.stimulus,
  TCD_SCOPE.primaryVessel,
  TCD_SCOPE.measurement,
  TCD_SCOPE.modalityNote,
] as const;

export const TCD_STEP_IDS = [
  "screen_and_prepare",
  "insonate_and_record_baseline",
  "perform_breath_hold",
  "measure_response_and_repeat",
  "calculate_and_interpret",
  "report",
] as const;

export const TCD_STEP_TITLES = TCD_STEP_IDS.map((id) => labelFromId(id));

export const SCREEN_ACTIONS = [
  "Confirm clinical stability, the indication, the side and severity of known stenosis or occlusion, baseline neurological status, and ability to understand and perform the maneuver.",
  "Defer elective testing if the patient has evolving neurological symptoms, cardiorespiratory instability, or cannot safely cooperate.",
  "Rest for at least 5 minutes in a quiet room. Use a comfortable supine or semirecumbent position and keep it constant throughout.",
  "Record recent caffeine, nicotine and vasoactive medication exposure. Any medication adjustment requires direction from the treating clinician.",
  "Record baseline blood pressure, heart rate and oxygen saturation. Use continuous beat-to-beat blood pressure when available to assess pressure-related effects on MFV.",
] as const;

export const SCREEN_SOURCE_IDS = ["aium", "silvestrini", "esmeraldo"] as const;

export const PROBE_FREQUENCY_MHZ = 2;
export const ACOUSTIC_WINDOW = "transtemporal";
export const M1_STARTING_DEPTH_MM = { min: 50, max: 55 } as const;
export const PREFERRED_RECORDING = "Simultaneous bilateral MCA with fixed probes in a headframe";
export const BASELINE_DURATION_SECONDS = 60;

export const BASELINE_ACTIONS = [
  "Identify each M1 signal by depth, flow direction and vessel tracking. Document side, depth and signal quality. Keep sample location and probe settings fixed through each trial.",
  "If only one MCA can be monitored, report the available side and mark the other as unassessable. If sides are recorded sequentially, document the separate maneuvers and any differences in stimulus or systemic response.",
  "Record stable MFV continuously during quiet breathing. Use the mean over the 60-second baseline immediately preceding each maneuver.",
  "If respiratory monitoring is available, mark apnea onset and release. Record baseline end-tidal CO2 and recovery values when interpretable. End-tidal CO2 requires an expired breath.",
] as const;

export const BASELINE_SOURCE_IDS = ["aium", "silvestrini", "esmeraldo"] as const;

export const TARGET_BREATH_HOLD_SECONDS = 30;
export const PATIENT_INSTRUCTION =
  "Breathe normally. After an ordinary breath in, hold your breath without straining. Keep your head still. Resume normal breathing when asked, or sooner if uncomfortable.";
export const BREATH_HOLD_ACTIONS = [
  "Demonstrate the maneuver and verify that the patient avoids deep inspiration, preparatory hyperventilation and Valsalva straining.",
  "Mark the actual start and release times and record MFV continuously before, during and after the hold.",
  "Stop immediately for new focal symptoms, presyncope, chest pain, significant dyspnea or physiological instability. Assess the patient promptly and activate the local emergency pathway as indicated.",
] as const;
export const BREATH_HOLD_SOURCE_IDS = ["aium", "silvestrini", "esmeraldo"] as const;

export const RESPONSE_WINDOW_ANCHOR = "breath hold release";
export const RESPONSE_WINDOW_START_SECONDS = 0;
export const RESPONSE_WINDOW_DURATION_SECONDS = 4;
export const RESPONSE_VALUE = "Mean MCA MFV across the immediate 4-second post-release window";
export const MEASUREMENT_NOTE =
  "Average a prespecified window consistently. Record the convention if the lab uses an end-apnea sample. Use reference values appropriate to that convention.";

export const TARGET_VALID_TRIALS_PER_SIDE = 2;
export const USUAL_ATTEMPTS = { min: 2, max: 3 } as const;
export const MINIMUM_RECOVERY_RECORDING_SECONDS = 30;
export const MINIMUM_INTERVAL_FROM_RELEASE_SECONDS = 120;
export const REPEAT_WHEN =
  "Repeat only after symptoms resolve, MFV and systemic observations return to a stable baseline, and a new usable baseline is available.";
export const AGGREGATION =
  "Take the arithmetic mean of valid, comparable BHI results separately for each side. Document discordant trials and reassess signal and effort before assigning a category.";
export const PROTOCOL_CHOICE_NOTE = "Repeat count and intertrial interval are proposed lab defaults.";

export const INVALID_FOR_BHI = [
  "Unreliable baseline or response-window MFV due to signal loss, motion or probe displacement",
  "Valsalva straining, preparatory hyperventilation, uncertain breath-hold timing, or premature release followed by an unreliable response window",
] as const;
export const LIMITS_CATEGORICAL_INTERPRETATION = [
  "A substantially shorter hold or suspected weak stimulus",
  "A marked concurrent change in blood pressure or breathing pattern",
  "Poor repeatability across otherwise usable trials",
] as const;
export const SHORT_HOLD_HANDLING =
  "If technically sound, record actual duration and descriptive BHI with a limitation. Apply a categorical cutoff only if duration and stimulus meet the lab reference protocol.";
export const INCOMPLETE_HANDLING =
  "If no valid trial is available, report unassessable and give the reason. If only one valid trial is available, report it with limited reproducibility.";
export const MEASURE_SOURCE_IDS = ["silvestrini", "esmeraldo", "asn"] as const;
export const MEASURE_NOTES = [
  MEASUREMENT_NOTE,
  PROTOCOL_CHOICE_NOTE,
  SHORT_HOLD_HANDLING,
  INCOMPLETE_HANDLING,
  ...MEASURE_SOURCE_IDS,
] as const;

export const PERCENT_MFV_FORMULA = "100 * (mfv_response_cm_s - mfv_baseline_cm_s) / mfv_baseline_cm_s";
export const BHI_FORMULA = "percent_mfv_change / actual_breath_hold_seconds";
export const BHI_INVALID_IF = [
  "Required input is missing or nonfinite",
  "Baseline MFV is zero or negative",
  "Response MFV is negative under the unsigned velocity convention",
  "Actual breath-hold duration is zero or negative",
  "Trial quality is invalid",
] as const;
export const TRIAL_QUALITY_INVALID = "Trial quality is invalid";

export const WORKED_EXAMPLE = {
  mfvBaselineCmS: 50,
  mfvResponseCmS: 65,
  actualBreathHoldSeconds: 30,
  percentMfvChange: 30,
  bhiPercentPerSecond: 1.0,
} as const;

export const HISTORICAL_CUTOFF_PERCENT_PER_SECOND = 0.69;
export const BELOW_CUTOFF = "Reduced reactivity";
export const AT_OR_ABOVE_CUTOFF = "Preserved reactivity by this reference";
export const CUTOFF_APPLICABILITY =
  "Historical threshold derived from healthy reference subjects and applied to adults with severe asymptomatic carotid stenosis. Use with a comparable maneuver and sampling method, or apply locally validated reference data.";
export const NEGATIVE_RESPONSE =
  "A reproducible fall in MFV may reflect a paradoxical response. Review probe stability, effort, blood pressure and adequacy of the CO2 stimulus before attributing it to hemodynamic steal.";
export const INDETERMINATE =
  "Use when limited stimulus, systemic confounding or discordance prevents interpretation. Consider a validated controlled CO2 or perfusion-based CVR study when the result will influence management.";
export const INTERPRETATION_SOURCE_IDS = ["aium", "markus", "silvestrini"] as const;

export const CALCULATION_NOTES = [
  PERCENT_MFV_FORMULA,
  BHI_FORMULA,
  ...BHI_INVALID_IF,
  "mfv_baseline_cm_s: 50",
  "mfv_response_cm_s: 65",
  "actual_breath_hold_seconds: 30",
  "percent_mfv_change: 30",
  "bhi_percent_per_second: 1.0",
  "0.69 %/s",
  BELOW_CUTOFF,
  AT_OR_ABOVE_CUTOFF,
  CUTOFF_APPLICABILITY,
  NEGATIVE_RESPONSE,
  INDETERMINATE,
  ...INTERPRETATION_SOURCE_IDS,
] as const;

export const REPORT_FIELDS = [
  "Indication, vascular diagnosis and side of disease",
  "Position, acoustic windows, vessels, insonation depths and simultaneous or sequential recording",
  "Baseline and response-window MFV, actual breath-hold duration, percent MFV change and BHI for each trial and side",
  "Number of valid trials and mean BHI for each side",
  "Blood pressure, heart rate, oxygen saturation, respiratory monitoring and end-tidal CO2 where available",
  "Signal quality, maneuver adequacy, symptoms, relevant confounders and any unassessable side",
  "Side-specific impression and reference cutoff if applied",
] as const;

export const IMPRESSION_TEMPLATE =
  "TCD breath-hold reactivity was {right_impression} in the right MCA (BHI {right_bhi} %/s) and {left_impression} in the left MCA (BHI {left_bhi} %/s). Technical and physiological limitations: {limitations}.";

export const TCD_REFERENCES = [
  { id: "aium", title: "AIUM Practice Parameter for the Performance of Transcranial Doppler Ultrasound", url: "https://doi.org/10.1002/jum.16234" },
  { id: "markus", title: "Markus and Harrison. Estimation of cerebrovascular reactivity using transcranial Doppler, including the use of breath-holding as the vasodilatory stimulus", url: "https://pubmed.ncbi.nlm.nih.gov/1579964/" },
  { id: "silvestrini", title: "Silvestrini et al. Impaired cerebral vasoreactivity and risk of stroke in patients with asymptomatic carotid artery stenosis", url: "https://jamanetwork.com/journals/jama/fullarticle/192630" },
  { id: "esmeraldo", title: "Esmeraldo et al. Updates on Adult Transcranial Doppler, Gray-Scale, and Contrast-enhanced US Techniques", url: "https://doi.org/10.1148/rg.250182" },
  { id: "asn", title: "American Society of Neuroimaging. Neurosonology Basics: TCD", url: "https://www.asnweb.org/files/AR_BASICS_TCD__2021.pdf" },
] as const;

export type BhiResult = {
  percentMfvChange: number;
  bhiPercentPerSecond: number;
};

export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/**
 * Percent MFV change = 100 * (response - baseline) / baseline.
 * BHI (%/s) = percent MFV change / actual breath-hold seconds.
 * Blank when any required input is missing or nonfinite, baseline is <= 0,
 * response is negative, duration is <= 0, or trial quality is invalid.
 */
export function calculateBhi(
  baselineCmS: number | null | undefined,
  responseCmS: number | null | undefined,
  breathHoldSeconds: number | null | undefined,
  trialQualityInvalid = false,
): BhiResult | null {
  if (trialQualityInvalid) return null;
  if (baselineCmS == null || responseCmS == null || breathHoldSeconds == null) return null;
  if (!Number.isFinite(baselineCmS) || !Number.isFinite(responseCmS) || !Number.isFinite(breathHoldSeconds)) return null;
  if (baselineCmS <= 0) return null;
  if (responseCmS < 0) return null;
  if (breathHoldSeconds <= 0) return null;
  const percentMfvChange = (100 * (responseCmS - baselineCmS)) / baselineCmS;
  const bhiPercentPerSecond = percentMfvChange / breathHoldSeconds;
  if (!Number.isFinite(percentMfvChange) || !Number.isFinite(bhiPercentPerSecond)) return null;
  return { percentMfvChange, bhiPercentPerSecond };
}

export function formatDecimal(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  if (Object.is(rounded, -0)) return "0";
  return String(rounded);
}

export function formatMfv(value: number): string {
  return formatDecimal(value, 3);
}

export function formatPercentMfvChange(value: number): string {
  return formatDecimal(value, 1);
}

export function formatBhi(value: number): string {
  return formatDecimal(value, 2);
}

export type TcdBhiCopyInput = {
  checked: readonly string[];
  baselineCmS: number | null;
  responseCmS: number | null;
  breathHoldSeconds: number | null;
  trialQualityInvalid: boolean;
};

export function formatTcdBhiCopy(input: TcdBhiCopyInput): string {
  const lines = [TCD_BHI_TITLE];
  for (const item of input.checked) lines.push(`${item}: Yes`);
  if (input.trialQualityInvalid) lines.push(`${TRIAL_QUALITY_INVALID}: Yes`);
  if (input.baselineCmS != null && Number.isFinite(input.baselineCmS)) {
    lines.push(`MFV baseline: ${formatMfv(input.baselineCmS)} cm/s`);
  }
  if (input.responseCmS != null && Number.isFinite(input.responseCmS)) {
    lines.push(`MFV response: ${formatMfv(input.responseCmS)} cm/s`);
  }
  if (input.breathHoldSeconds != null && Number.isFinite(input.breathHoldSeconds)) {
    lines.push(`Breath-hold: ${formatMfv(input.breathHoldSeconds)} seconds`);
  }
  const result = calculateBhi(
    input.baselineCmS,
    input.responseCmS,
    input.breathHoldSeconds,
    input.trialQualityInvalid,
  );
  if (result) {
    lines.push(`MFV change: ${formatPercentMfvChange(result.percentMfvChange)}%`);
    lines.push(`BHI: ${formatBhi(result.bhiPercentPerSecond)} %/s`);
  }
  return lines.join("\n");
}

export function items(prefix: string, labels: readonly string[]) {
  return labels.map((label) => ({ id: `${prefix}:${label}`, label }));
}
