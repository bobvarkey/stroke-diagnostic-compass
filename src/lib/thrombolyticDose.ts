/**
 * Weight-based thrombolytic dosing for acute ischaemic stroke.
 *
 * Pure and dependency-free so the weight caps can be tested. The arithmetic is the part a reader
 * cannot check at a glance and the part where an error is dangerous, so it does not live inline in
 * a component.
 *
 * Both regimens cap at 100 kg of body weight, which is not a coincidence: 90 mg ÷ 0.9 mg/kg and
 * 25 mg ÷ 0.25 mg/kg are the same 100 kg. Capping the weight therefore yields each drug's maximum
 * dose, and the cap is applied once rather than as two independently drifting constants.
 */

export const MAX_WEIGHT_KG = 100;

export const ALTEPLASE_MG_PER_KG = 0.9;
export const ALTEPLASE_MAX_MG = 90;

/** The ischaemic-stroke dose. Not the 0.4 mg/kg used in some coronary and trial regimens. */
export const TENECTEPLASE_MG_PER_KG = 0.25;
export const TENECTEPLASE_MAX_MG = 25;

export interface ThrombolyticDose {
  /** Rounded to one decimal, as it is drawn up. */
  total: string;
  bolus: string;
  /** Tenecteplase is a single bolus and has no infusion phase, so this is null for it. */
  infusion: string | null;
}

export interface ThrombolyticDoses {
  alteplase: ThrombolyticDose;
  tenecteplase: ThrombolyticDose;
}

/** Weight outside this range is a data-entry error, not a patient. */
const plausible = (kg: number) => Number.isFinite(kg) && kg > 0 && kg <= 500;

export function alteplaseDose(weightKg: number): ThrombolyticDose | null {
  if (!plausible(weightKg)) return null;
  const total = Math.min(Math.min(weightKg, MAX_WEIGHT_KG) * ALTEPLASE_MG_PER_KG, ALTEPLASE_MAX_MG);
  return {
    total: `${total.toFixed(1)} mg`,
    bolus: `${(total * 0.1).toFixed(1)} mg IV push over 1 min`,
    infusion: `${(total * 0.9).toFixed(1)} mg IV infusion over 60 min`,
  };
}

export function tenecteplaseDose(weightKg: number): ThrombolyticDose | null {
  if (!plausible(weightKg)) return null;
  const total = Math.min(Math.min(weightKg, MAX_WEIGHT_KG) * TENECTEPLASE_MG_PER_KG, TENECTEPLASE_MAX_MG);
  return {
    total: `${total.toFixed(1)} mg`,
    bolus: `${total.toFixed(1)} mg IV bolus over 5–10 s`,
    infusion: null,
  };
}

/** Both options for an IVT-eligible patient, or null when the weight is not usable. */
export function thrombolyticDoses(weightKg: number): ThrombolyticDoses | null {
  const alteplase = alteplaseDose(weightKg);
  const tenecteplase = tenecteplaseDose(weightKg);
  return alteplase && tenecteplase ? { alteplase, tenecteplase } : null;
}
