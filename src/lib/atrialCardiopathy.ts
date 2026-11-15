/**
 * Atrial cardiopathy checklist.
 * Wording is the supplied checklist text. Thresholds are only the three cutoffs named there.
 * Nothing is stored or sent: callers keep answers in memory.
 */

export const ATRIAL_CARDIOPATHY_TITLE = "Atrial cardiopathy checklist";

export const ATRIAL_CARDIOPATHY_SUBTITLE =
  "Post-stroke evaluation for cryptogenic ischaemic stroke and embolic stroke of undetermined source (ESUS).";

export const WORKUP_LEAD =
  "Tick each confirmed finding or completed review. Record the stroke classification after considering competing causes.";

export const BIOMARKERS_LEAD =
  "Enter the values from your ECG, lab and echo reports. If a report gives only the raw measurements, open the relevant calculator. The checklist flags any of the three measurements that meets its threshold.";

export const ABOUT_THRESHOLDS =
  "About the thresholds. PTFV1 and NT-proBNP use the ARCADIA trial cutoffs. This checklist uses LAVI >34 mL/m² for echocardiographic left atrial enlargement. ARCADIA used the left atrial diameter index. The adapted checklist cannot establish stroke causality.";

export const PTFV1_CALCULATOR_NOTE =
  "In sinus rhythm, multiply the absolute depth of the terminal negative P-wave component by the time from baseline crossing to return to baseline. At 10 mm/mV, 1 mm equals 100 µV. At 25 mm/s, 1 small horizontal box equals 40 ms. A depth of 1 mm and duration of 40 ms give 4,000 µV·ms. If entered, the reported PTFV1 takes precedence and its absolute magnitude is used.";

export const LAVI_CALCULATOR_NOTE =
  "Divide the unindexed left atrial volume (mL) by body surface area (m²). If entered, the reported LAVI takes precedence.";

export const FINDINGS_LEAD =
  "Document supportive findings and competing cardiac sources. The biomarker summary uses only the three measurements above.";

export const MONITORING_NOTE =
  "Offer 2–4 weeks of external monitoring after ESUS when AF detection would change treatment. Consider an implantable monitor in selected patients with a higher likelihood of AF, including after unrevealing external monitoring.";

export const ANTICOAGULATION_NOTE =
  "Atrial cardiopathy biomarkers alone do not justify empiric anticoagulation. In ARCADIA, recurrent stroke occurred at 4.4% per year with both apixaban and aspirin. Reassess the prevention plan if AF, intracardiac thrombus or another independent indication is identified.";

export const LOCAL_NOTE =
  "The checklist runs locally. Entries clear on reload. Use the print view to keep a copy.";

export const REFERENCES = [
  "ARCADIA randomized clinical trial",
  "ACC consensus on arrhythmia monitoring after stroke",
  "ASE/EACVI chamber quantification guideline",
  "Consensus on P-wave measurements",
] as const;

export const PTF_DIAGRAM_CAPTION = "P terminal force = Pt duration × Pt amplitude";
export const PTFV1_LEAD_CAPTION = "Terminal P-wave depth (a) and duration (d) in lead V1.";
export const LAVI_DIAGRAM_CAPTION = "LA volume = (0.85 × A1 × A2) ÷ L";

/** Flag when the absolute PTFV1 is greater than this value, in µV·ms. */
export const PTFV1_THRESHOLD = 5000;
/** Flag when NT-proBNP is greater than this value, in pg/mL. */
export const NT_PROBNP_THRESHOLD = 250;
/** Flag when LAVI is greater than this value, in mL/m². */
export const LAVI_THRESHOLD = 34;
/** 10 mm/mV: 1 mm of terminal depth equals 100 µV. */
export const PTFV1_UV_PER_MM = 100;

export const PTFV1_THRESHOLD_LABEL = ">5,000 µV·ms";
export const NT_PROBNP_THRESHOLD_LABEL = ">250 pg/mL";
export const LAVI_THRESHOLD_LABEL = ">34 mL/m²";
export const PTFV1_UNIT = "µV·ms";
export const NT_PROBNP_UNIT = "pg/mL";
export const LAVI_UNIT = "mL/m²";

export const PTFV1_HEADING = "P-wave terminal force in V1 (PTFV1)";
export const NT_PROBNP_HEADING = "Serum NT-proBNP";
export const LAVI_HEADING = "Left atrial volume index (LAVI)";

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly note?: string;
}

export const WORKUP_CHECKS: readonly ChecklistItem[] = [
  {
    id: "nonLacunar",
    label: "Non-lacunar infarct on brain CT or MRI",
    note: "Record the location and pattern below.",
  },
  { id: "cortical", label: "Cortical infarct" },
  {
    id: "multiTerritory",
    label: "Acute infarcts in multiple vascular territories",
    note: "This pattern supports an embolic mechanism and can occur with several sources.",
  },
  {
    id: "stenosisExcluded",
    label: "Cervical and intracranial vascular imaging excludes ≥50% atherosclerotic stenosis in an artery supplying the infarct.",
  },
  {
    id: "rhythmReviewed",
    label: "12-lead ECG, continuous rhythm monitoring and echocardiography reviewed for AF, intracardiac thrombus and other major-risk cardiac sources.",
    note: "ARCADIA required ≥24 hours of continuous rhythm monitoring in the initial workup.",
  },
];

export const RISK_FACTOR_CHECKS: readonly ChecklistItem[] = [
  { id: "hypertension", label: "Longstanding hypertension" },
  { id: "heartFailure", label: "Heart failure" },
  { id: "valvular", label: "Valvular disease" },
  { id: "diabetes", label: "Diabetes" },
  { id: "obesity", label: "Obesity" },
  { id: "osa", label: "Obstructive sleep apnoea" },
  { id: "ckd", label: "Chronic kidney disease" },
];

export const FINDING_CHECKS: readonly ChecklistItem[] = [
  { id: "atrialTachycardia", label: "Runs of atrial tachycardia or supraventricular tachycardia" },
  { id: "reducedLaaVelocity", label: "Reduced left atrial appendage emptying velocity on transoesophageal echo" },
  { id: "spontaneousContrast", label: "Spontaneous echo contrast" },
  { id: "thrombus", label: "Definite intracardiac thrombus" },
];

export const ALL_CHECKS: readonly ChecklistItem[] = [
  ...WORKUP_CHECKS,
  ...RISK_FACTOR_CHECKS,
  ...FINDING_CHECKS,
];

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export const CLASSIFICATION_PLACEHOLDER = "Select classification";
export const CLASSIFICATION_OPTIONS: readonly SelectOption[] = [
  { value: "esus", label: "ESUS" },
  { value: "cryptogenic_incomplete", label: "Cryptogenic, evaluation incomplete" },
  { value: "cryptogenic_multiple", label: "Cryptogenic, multiple possible causes" },
  { value: "other", label: "Other identified mechanism" },
];

export const AF_PLACEHOLDER = "Select AF status";
export const AF_OPTIONS: readonly SelectOption[] = [
  { value: "not_detected", label: "AF not detected to date" },
  { value: "known", label: "Previously known AF" },
  { value: "new", label: "Newly detected AF" },
  { value: "pending", label: "Evaluation pending" },
];

export const MONITORING_PLACEHOLDER = "Select monitoring plan";
export const MONITORING_OPTIONS: readonly SelectOption[] = [
  { value: "external", label: "External monitor" },
  { value: "implantable", label: "Implantable cardiac monitor" },
  { value: "external_then_implantable", label: "External then consider implantable" },
  { value: "complete", label: "Monitoring complete" },
  { value: "other", label: "Other / deferred" },
];

export const SECTION_NAV = [
  { id: "atrial-cardiopathy-workup", label: "Stroke workup" },
  { id: "atrial-cardiopathy-biomarkers", label: "Biomarkers" },
  { id: "atrial-cardiopathy-findings", label: "Additional findings" },
  { id: "atrial-cardiopathy-follow-up", label: "Follow-up" },
] as const;

export interface AtrialCardiopathyAnswers {
  checks: Record<string, boolean>;
  classification: string;
  monitoringHours: string;
  afStatus: string;
  infarctPattern: string;
  historySymptoms: string;
  ptfv1: string;
  ecgDate: string;
  ptfDepth: string;
  ptfDuration: string;
  ntProBnp: string;
  sampleDate: string;
  lavi: string;
  echoDate: string;
  laVolume: string;
  bsa: string;
  prInterval: string;
  pacBurden: string;
  otherCardiac: string;
  monitoringPlan: string;
  durationDevice: string;
  reviewDate: string;
  clinician: string;
  monitorResult: string;
}

export function emptyAnswers(): AtrialCardiopathyAnswers {
  const checks: Record<string, boolean> = {};
  for (const item of ALL_CHECKS) checks[item.id] = false;
  return {
    checks,
    classification: "",
    monitoringHours: "",
    afStatus: "",
    infarctPattern: "",
    historySymptoms: "",
    ptfv1: "",
    ecgDate: "",
    ptfDepth: "",
    ptfDuration: "",
    ntProBnp: "",
    sampleDate: "",
    lavi: "",
    echoDate: "",
    laVolume: "",
    bsa: "",
    prInterval: "",
    pacBurden: "",
    otherCardiac: "",
    monitoringPlan: "",
    durationDevice: "",
    reviewDate: "",
    clinician: "",
    monitorResult: "",
  };
}

/** A finite number, or null when the field is blank or not a plain number. Thousands commas are accepted. */
export function parseNumeric(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (!trimmed || !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/**
 * depth (mm) × 100 µV/mm × duration (ms).
 * Blank when either input is missing, nonfinite, or ≤ 0.
 */
export function ptfv1FromTracing(depthMm: number | null, durationMs: number | null): number | null {
  if (depthMm === null || durationMs === null) return null;
  if (!Number.isFinite(depthMm) || !Number.isFinite(durationMs)) return null;
  if (depthMm <= 0 || durationMs <= 0) return null;
  return depthMm * PTFV1_UV_PER_MM * durationMs;
}

/**
 * Reported PTFV1 takes precedence. Its absolute magnitude is the value used.
 * Otherwise the tracing calculator is used.
 */
export function resolvePtfv1(direct: string, depth: string, duration: string): number | null {
  const reported = parseNumeric(direct);
  if (reported !== null) return Math.abs(reported);
  return ptfv1FromTracing(parseNumeric(depth), parseNumeric(duration));
}

/** LA volume (mL) ÷ BSA (m²). Blank when either input is missing, nonfinite, or ≤ 0. */
export function laviFromVolume(volumeMl: number | null, bsaM2: number | null): number | null {
  if (volumeMl === null || bsaM2 === null) return null;
  if (!Number.isFinite(volumeMl) || !Number.isFinite(bsaM2)) return null;
  if (volumeMl <= 0 || bsaM2 <= 0) return null;
  return volumeMl / bsaM2;
}

/** Reported LAVI takes precedence over LA volume ÷ BSA. */
export function resolveLavi(direct: string, volume: string, bsa: string): number | null {
  const reported = parseNumeric(direct);
  if (reported !== null) return reported;
  return laviFromVolume(parseNumeric(volume), parseNumeric(bsa));
}

export function resolveNtProBnp(direct: string): number | null {
  return parseNumeric(direct);
}

export function meetsPtfv1Threshold(value: number | null): boolean {
  return value !== null && value > PTFV1_THRESHOLD;
}

export function meetsNtProBnpThreshold(value: number | null): boolean {
  return value !== null && value > NT_PROBNP_THRESHOLD;
}

export function meetsLaviThreshold(value: number | null): boolean {
  return value !== null && value > LAVI_THRESHOLD;
}

export interface BiomarkerValues {
  ptfv1: number | null;
  ntProBnp: number | null;
  lavi: number | null;
}

const COUNT_WORDS = ["No", "One", "Two", "Three"] as const;

function countLabel(count: number, singular: string, plural: string): string {
  const word = COUNT_WORDS[count] ?? String(count);
  return `${word} ${count === 1 ? singular : plural}`;
}

/** Counts measurements over threshold and measurements still pending. No other interpretation. */
export function biomarkerSummary(values: BiomarkerValues): string {
  const pending = [values.ptfv1, values.ntProBnp, values.lavi].filter((value) => value === null).length;
  const meeting = [
    meetsPtfv1Threshold(values.ptfv1),
    meetsNtProBnpThreshold(values.ntProBnp),
    meetsLaviThreshold(values.lavi),
  ].filter(Boolean).length;

  if (pending > 0) {
    const pendingText = countLabel(pending, "measurement pending", "measurements pending");
    if (meeting === 0) return `Biomarker checklist incomplete. ${pendingText}.`;
    const meetingText = countLabel(meeting, "measurement meets threshold", "measurements meet threshold");
    return `Biomarker checklist incomplete. ${meetingText}. ${pendingText}.`;
  }

  const meetingText = countLabel(meeting, "measurement meets threshold", "measurements meet threshold");
  return `Biomarker checklist complete. ${meetingText}.`;
}

/** Grouped display, trimmed to the precision of the value. */
export function formatQuantity(value: number): string {
  const negative = value < 0;
  const rounded = Math.round((Math.abs(value) + Number.EPSILON) * 1000) / 1000;
  const [whole, fraction] = rounded.toString().split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = fraction ? `${grouped}.${fraction}` : grouped;
  return negative ? `-${body}` : body;
}

export function biomarkerValues(answers: AtrialCardiopathyAnswers): BiomarkerValues {
  return {
    ptfv1: resolvePtfv1(answers.ptfv1, answers.ptfDepth, answers.ptfDuration),
    ntProBnp: resolveNtProBnp(answers.ntProBnp),
    lavi: resolveLavi(answers.lavi, answers.laVolume, answers.bsa),
  };
}

function pushText(lines: string[], raw: string, label: string) {
  const value = raw.trim();
  if (value) lines.push(`${label}: ${value}`);
}

function pushSelect(lines: string[], value: string, label: string, options: readonly SelectOption[]) {
  const match = options.find((option) => option.value === value);
  if (match) lines.push(`${label}: ${match.label}`);
}

function pushChecks(lines: string[], answers: AtrialCardiopathyAnswers, items: readonly ChecklistItem[]) {
  for (const item of items) {
    if (answers.checks[item.id]) lines.push(`${item.label}: Yes`);
  }
}

/** Scale name, answered or checked items only, then the biomarker summary. */
export function formatAtrialCardiopathyCopy(answers: AtrialCardiopathyAnswers): string {
  const lines = [ATRIAL_CARDIOPATHY_TITLE];

  pushChecks(lines, answers, WORKUP_CHECKS);
  pushSelect(lines, answers.classification, "Stroke classification", CLASSIFICATION_OPTIONS);
  pushText(lines, answers.monitoringHours, "Initial continuous monitoring (hours)");
  pushSelect(lines, answers.afStatus, "Known or detected AF", AF_OPTIONS);
  pushText(lines, answers.infarctPattern, "Infarct pattern and competing causes");
  pushChecks(lines, answers, RISK_FACTOR_CHECKS);
  pushText(lines, answers.historySymptoms, "Relevant history or symptoms");

  const values = biomarkerValues(answers);
  if (values.ptfv1 !== null) {
    lines.push(`${PTFV1_HEADING}: ${formatQuantity(values.ptfv1)} ${PTFV1_UNIT}`);
  }
  pushText(lines, answers.ecgDate, "ECG date");
  pushText(lines, answers.ptfDepth, "Terminal negative depth (mm)");
  pushText(lines, answers.ptfDuration, "Negative component duration (ms)");

  if (values.ntProBnp !== null) {
    lines.push(`${NT_PROBNP_HEADING}: ${formatQuantity(values.ntProBnp)} ${NT_PROBNP_UNIT}`);
  }
  pushText(lines, answers.sampleDate, "Sample date");

  if (values.lavi !== null) {
    lines.push(`${LAVI_HEADING}: ${formatQuantity(values.lavi)} ${LAVI_UNIT}`);
  }
  pushText(lines, answers.echoDate, "Echo date");
  pushText(lines, answers.laVolume, "LA volume (mL)");
  pushText(lines, answers.bsa, "Body surface area (m²)");

  pushText(lines, answers.prInterval, "PR interval (ms)");
  pushText(lines, answers.pacBurden, "PAC burden");
  pushChecks(lines, answers, FINDING_CHECKS);
  pushText(lines, answers.otherCardiac, "Other cardiac findings");
  pushSelect(lines, answers.monitoringPlan, "Monitoring plan", MONITORING_OPTIONS);
  pushText(lines, answers.durationDevice, "Duration and device");
  pushText(lines, answers.reviewDate, "Review date");
  pushText(lines, answers.clinician, "Responsible clinician");
  pushText(lines, answers.monitorResult, "Monitor result and prevention plan");

  lines.push(`Interpretation: ${biomarkerSummary(values)}`);
  return lines.join("\n");
}
