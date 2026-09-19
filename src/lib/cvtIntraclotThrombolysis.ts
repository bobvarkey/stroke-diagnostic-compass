/**
 * Intraclot / local thrombolysis protocol for cerebral venous thrombosis.
 * Transcribed from the supplied source (citations [67] and [8]).
 * Do not invent additional doses or durations beyond this reference.
 */

export const CVT_INTRACLOT_CITATIONS = ["[67]", "[8]"] as const;

export const CVT_INTRACLOT_ATTRIBUTION =
  "Protocol/reference transcribed from the supplied source";

export const CVT_INTRACLOT_ENDPOINT =
  "Continue until functional recanalization of the involved dural venous sinuses is achieved, maximum 3 days";

export const CVT_INTRACLOT_MAX_DURATION = "maximum 3 days";

export const CVT_INTRACLOT_AGENTS = [
  {
    id: "urokinase",
    name: "Urokinase",
    conjunction: "primary",
    bolus: "100,000 IU",
    infusion: "70,000–80,000 IU/h",
  },
  {
    id: "alteplase",
    name: "Alteplase (tPA)",
    conjunction: "or",
    bolus: "10 mg",
    infusion: "1 mg/h",
  },
] as const;

export const CVT_INTRACLOT_MONITORING = {
  bleeding:
    "Appearance of bleeding manifestations → prompt cessation of thrombolytic therapy",
  angiograms: "Check angiograms at 12-hour intervals until termination",
} as const;

export const CVT_INTRACLOT_SOURCE_NOTE =
  "Mechanical thrombectomy was not attempted in any of these patients (study context — not a recommendation against mechanical thrombectomy)";

export const CVT_INTRACLOT_ANTICOAGULATION = {
  heparin:
    "Heparin continued after thrombolytic therapy; dose adjusted to maintain aPTT at 2–3× normal",
  heparinTarget: "aPTT at 2–3× normal",
  warfarin:
    "Subsequently long-term oral anticoagulation (warfarin) with target INR 2–3, continued for 6 months",
  warfarinTarget: "INR 2–3",
  warfarinDuration: "6 months",
} as const;

export const CVT_INTRACLOT_DISCLAIMER =
  "Clinical reference and educational decision support only — not a substitute for individualized judgment. Verify doses, contraindications, and institutional protocols before use. StrokeSuite ID is not a medical device.";
