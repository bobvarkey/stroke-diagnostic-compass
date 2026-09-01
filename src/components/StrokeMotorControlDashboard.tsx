import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Activity, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight,
  Copy, FileDown, Footprints, PersonStanding, RotateCcw, Check, Target,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

/* ---------------------------------- data ---------------------------------- */

const NIHSS_ARM = [
  { value: "0", label: "0 — No drift", desc: "Maintains position for 10 seconds." },
  { value: "1", label: "1 — Drift", desc: "Drifts down before 10 s, does not hit support." },
  { value: "2", label: "2 — Some effort against gravity", desc: "Cannot maintain position; drifts to support." },
  { value: "3", label: "3 — No effort against gravity", desc: "Limb falls to bed/support." },
  { value: "4", label: "4 — No movement", desc: "No voluntary movement." },
  { value: "UN", label: "UN — Untestable", desc: "Amputation/joint fusion only; document reason." },
];

const NIHSS_LEG = [
  { value: "0", label: "0 — No drift", desc: "Maintains 30° position for 5 seconds." },
  { value: "1", label: "1 — Drift", desc: "Drifts down before 5 s, does not hit support." },
  { value: "2", label: "2 — Some effort against gravity", desc: "Cannot maintain position; falls to support." },
  { value: "3", label: "3 — No effort against gravity", desc: "Falls immediately to support." },
  { value: "4", label: "4 — No movement", desc: "No voluntary movement." },
  { value: "UN", label: "UN — Untestable", desc: "Amputation/joint fusion only; document reason." },
];

const CMSA_STAGES: Record<string, string> = {
  "1": "Flaccid paralysis. No voluntary movement.",
  "2": "Spasticity present; basic synergy components elicited or minimally performed.",
  "3": "Marked spasticity. Voluntary movement predominantly within obligatory synergy.",
  "4": "Spasticity decreases. Some movements outside synergy possible.",
  "5": "More complex movement combinations; spasticity continues to decline.",
  "6": "Near-normal coordinated movement; spasticity absent or minimal.",
  "7": "Normal motor function.",
};

const MRC = [
  { value: "0", label: "0 — No contraction" },
  { value: "1", label: "1 — Flicker / trace contraction" },
  { value: "2", label: "2 — Movement with gravity eliminated" },
  { value: "3", label: "3 — Movement against gravity" },
  { value: "4", label: "4 — Movement against resistance" },
  { value: "5", label: "5 — Normal power" },
];

const HEAD_CONTROL = [
  { value: "independent", label: "Independent", desc: "Maintains midline/upright head posture unsupported in sitting." },
  { value: "fatigable", label: "Fatigable", desc: "Initially maintains midline control, lost with time/activity/fatigue." },
  { value: "requires_support", label: "Requires support", desc: "Needs pillow, headrest or manual support for safe head position." },
  { value: "absent", label: "Absent", desc: "Unable to maintain head control; continuous support required." },
  { value: "not_assessed", label: "Not assessed", desc: "" },
];

const FAC = [
  { value: "0", label: "FAC 0 — Non-functional ambulation", desc: "Dependent: cannot walk, or needs help of ≥2 people, or walks only in parallel bars / with a harness. Wheelchair or hoist for all mobility." },
  { value: "1", label: "FAC 1 — Dependent, level II (continuous manual contact)", desc: "Dependent: needs continuous firm hands-on support from ONE person who carries body weight AND assists balance. Cannot walk without that physical assistance." },
  { value: "2", label: "FAC 2 — Dependent, level I (intermittent light contact)", desc: "Dependent: needs continuous or intermittent LIGHT touch from one person to assist balance or coordination only — no weight-bearing help required." },
  { value: "3", label: "FAC 3 — Dependent for supervision", desc: "Dependent on a person being present: walks without any physical contact, but needs verbal cueing or standby guarding for safety on level ground." },
  { value: "4", label: "FAC 4 — Independent, level surfaces only", desc: "Independent on level ground; still needs help or supervision for stairs, slopes, kerbs or uneven terrain." },
  { value: "5", label: "FAC 5 — Independent everywhere", desc: "Independent on level and non-level surfaces, stairs and slopes, with or without an aid." },
];

/* TIS subscale score qualifications ------------------------------------- */
const TIS_STATIC = [
  { value: "0", label: "0 — Cannot sit 10 s unsupported", desc: "Falls or needs support within 10 seconds of unsupported sitting (feet on floor, thighs fully on bed/chair). All further static items score 0." },
  { value: "1", label: "1 — Sits 10 s only", desc: "Maintains unsupported sitting 10 s, but cannot keep position when the therapist crosses the unaffected leg over the affected leg." },
  { value: "2", label: "2 — Sits 10 s + therapist-crossed legs", desc: "Holds sitting when the examiner crosses the unaffected over the affected leg, but cannot cross the legs actively." },
  { value: "3", label: "3 — Partial active leg crossing", desc: "Actively crosses the unaffected over affected leg but with trunk displacement >10 cm backward or with hand support." },
  { value: "4", label: "4 — Active leg crossing with minimal displacement", desc: "Crosses legs actively; slight trunk displacement or slow/compensated performance." },
  { value: "5", label: "5 — Good static control", desc: "Sitting 10 s, tolerates crossed legs and actively crosses legs with minor compensation only." },
  { value: "6", label: "6 — Near-normal static control", desc: "All static items achieved; only subtle asymmetry or hesitancy noted." },
  { value: "7", label: "7 — Normal static sitting balance (max)", desc: "Sits 10 s unsupported, tolerates therapist-crossed legs, and actively crosses legs without trunk displacement or hand support." },
];

const TIS_DYNAMIC = [
  { value: "0", label: "0 — No dynamic trunk activity", desc: "Cannot shorten/elongate either hemitrunk, no lateral flexion from elbow toward bed; falls or needs support with any weight shift." },
  { value: "1", label: "1 — Minimal, compensated activity", desc: "Some movement toward the bed on the elbow but shortening/elongation absent, or achieved entirely by compensation (pushing, pulling, upper-limb support)." },
  { value: "2", label: "2 — One side only, with compensation", desc: "Correct hemitrunk shortening on one side only; the opposite side absent or compensated." },
  { value: "3", label: "3 — Both sides with heavy compensation", desc: "Elbow-to-bed movement both sides but consistently compensated and cannot return to start unaided." },
  { value: "4", label: "4 — Both sides, returns with help", desc: "Shortening/elongation both sides; return to upright needs cueing or slight assist." },
  { value: "5", label: "5 — Half of dynamic items correct", desc: "Approximately half the dynamic items performed without compensation; the rest compensated." },
  { value: "6", label: "6 — Majority correct, one clear deficit", desc: "Most items correct; one item clearly compensated (usually affected-side shortening or pelvic lift)." },
  { value: "7", label: "7 — Good dynamic control, mild asymmetry", desc: "Lateral flexion both sides and pelvic lift achieved; mild asymmetry or reduced range on the affected side." },
  { value: "8", label: "8 — Near-normal dynamic control", desc: "All items achieved; occasional slowness or minor compensation only." },
  { value: "9", label: "9 — Dynamic control with subtle deficit", desc: "All items correct and uncompensated except very subtle timing/ range asymmetry." },
  { value: "10", label: "10 — Normal dynamic sitting balance (max)", desc: "Full uncompensated hemitrunk shortening/elongation on both sides and pelvic lifting both sides, returning to start unaided." },
];

const TIS_COORD = [
  { value: "0", label: "0 — No selective rotation", desc: "Upper and lower trunk rotate as one block, or ≤2 of 6 rotation repetitions completed." },
  { value: "1", label: "1 — Upper trunk rotation, asymmetric", desc: "Rotates shoulders 6× in 6 s but asymmetrically; lower trunk rotation absent." },
  { value: "2", label: "2 — Upper trunk rotation symmetric only", desc: "Symmetric upper-trunk (shoulder girdle) rotation 6× in 6 s; pelvic rotation absent or blocked." },
  { value: "3", label: "3 — Upper normal, lower asymmetric", desc: "Upper-trunk rotation normal; pelvic rotation 6× in 6 s but asymmetric or with upper-trunk substitution." },
  { value: "4", label: "4 — Both segments rotate, mild asymmetry", desc: "Selective upper and lower trunk rotation achieved; one segment asymmetric or slower than 6 s." },
  { value: "5", label: "5 — Near-normal coordination", desc: "Selective, symmetric rotation of both segments; slight slowing or effort noted." },
  { value: "6", label: "6 — Normal trunk coordination (max)", desc: "Symmetric upper- and lower-trunk rotation, 6 repetitions each within 6 seconds, without segmental substitution." },
];


const MRS = [
  { value: "0", label: "mRS 0 — No symptoms", desc: "" },
  { value: "1", label: "mRS 1 — No significant disability", desc: "Symptoms present but all usual duties/activities maintained." },
  { value: "2", label: "mRS 2 — Slight disability", desc: "Unable to perform all previous activities; looks after own affairs." },
  { value: "3", label: "mRS 3 — Moderate disability", desc: "Requires some help but walks without assistance." },
  { value: "4", label: "mRS 4 — Moderately severe", desc: "Unable to walk or attend to bodily needs without assistance." },
  { value: "5", label: "mRS 5 — Severe disability", desc: "Bedridden, incontinent, constant nursing care required." },
  { value: "6", label: "mRS 6 — Dead", desc: "" },
];

const TRANSFER_OPTIONS = [
  "independent", "supervision_or_setup", "one_person_assist",
  "two_person_assist", "dependent_or_hoist", "not_assessed",
];

const TIS_OBSERVATIONS = [
  "maintains_midline_sitting", "lateropulsion", "impaired_lateral_weight_shift",
  "impaired_forward_reach_or_return", "poor_pelvic_control",
  "impaired_upper_trunk_rotation", "impaired_lower_trunk_rotation",
  "requires_upper_limb_support", "unsafe_unsupported_sitting",
];

const RED_FLAGS: { key: string; label: string }[] = [
  { key: "new_or_worsening_motor_deficit", label: "New or worsening motor deficit" },
  { key: "reduced_consciousness", label: "Reduced consciousness" },
  { key: "new_pupillary_abnormality", label: "New pupillary abnormality" },
  { key: "new_dysphagia_or_weak_cough", label: "New dysphagia or weak cough" },
  { key: "new_head_drop_or_inability_to_hold_head", label: "New head drop / cannot hold head" },
  { key: "new_visual_symptom", label: "New visual symptom" },
  { key: "new_seizure", label: "New seizure" },
  { key: "severe_headache_or_vomiting", label: "Severe headache or vomiting" },
];

const REHAB_PRIORITIES = [
  "urgent_neurological_reassessment",
  "airway_swallowing_and_positioning_priority",
  "bed_mobility_and_supported_sitting",
  "trunk_control_and_transfer_training",
  "gait_training_and_falls_prevention",
  "upper_limb_selective_motor_recovery",
  "community_mobility_and_independence",
  "pending_clinician_assignment",
];

const STEPS = [
  "1. Assessment Context",
  "2. Acute Motor Severity",
  "3. Limb Motor Recovery",
  "4. Head & Trunk Control",
  "5. Mobility & Function",
  "6. Rehab Goals",
  "7. Clinical Summary",
];

interface RehabGoal {
  domain: "CMSA" | "FAC" | "mRS";
  tier: string;
  timeline: string;
  exercises: string[];
}

const CMSA_GOALS: Record<string, Omit<RehabGoal, "domain" | "tier">> = {
  flaccid: {
    timeline: "Begin within 24–72 h (medically stable); reassess daily; expect slow change over weeks 1–4",
    exercises: [
      "Positioning & supported postures — hemiplegic limb protection, scapular/pelvic alignment; reposition every 2 h",
      "Passive range of motion — full PROM all joints 1–2×/day; extra care at shoulder (support humeral head, no traction)",
      "Facilitation of early activity — tapping, weight-bearing through affected limb, bilateral activities",
      "Tone/flaccidity management — avoid sling traction on shoulder; consider supported arm tray; monitor for subluxation & shoulder pain",
      "Sensory stimulation & family/caregiver education for handling techniques",
    ],
  },
  synergy: {
    timeline: "Weeks 1–6; progress as selective movement emerges; review weekly",
    exercises: [
      "Active-assisted movement — progress from gravity-eliminated to against-gravity",
      "Task-oriented repetitive practice — reaching, grasp-and-release, sit-to-stand repetitions (high dose, ≥300 reps/week target)",
      "Synergy reduction — weight-bearing out of synergy patterns, selective control drills, isolated joint movement practice",
      "Spasticity management — prolonged stretch, positioning, consider botulinum toxin referral if focal spasticity limits function",
      "Mirror therapy & bilateral arm training for upper-limb engagement",
    ],
  },
  selective: {
    timeline: "Weeks 4–24+; outpatient/transition phase; review every 2–4 weeks",
    exercises: [
      "Progressive resisted strengthening — affected limb 2–3×/week, moderate load (50–70% 1RM equivalents)",
      "Fine motor & dexterity — graded manipulation, in-hand skills, handwriting/utensil practice",
      "Constraint-induced movement therapy (CIMT) or modified CIMT if ≥10° wrist + 10° finger extension present",
      "Aerobic conditioning — walking/cycling 20–40 min at 60–80% HR reserve, 3–5×/week",
      "Functional task integration — ADL retraining, return-to-work/leisure simulation",
    ],
  },
};

const FAC_GOALS: Record<string, Omit<RehabGoal, "domain" | "tier">> = {
  dependent: {
    timeline: "Begin 24–48 h if stable; daily sessions; target supervised standing by week 2–4",
    exercises: [
      "Early mobilisation protocol — graded sitting on edge of bed → supported standing, 2×/day as tolerated",
      "Sitting balance & trunk control — unsupported sitting, weight shifts, reaching tasks",
      "Tilt table / standing frame for orthostatic tolerance and lower-limb loading",
      "Assisted transfer training (bed↔chair) with consistent technique; hoist use only until safe manual transfer achieved",
      "Pre-gait activities — weight shifting in standing, stepping in place with support",
    ],
  },
  supervised: {
    timeline: "Weeks 1–8; gait sessions ≥5×/week; wean physical assistance progressively",
    exercises: [
      "Body-weight–supported treadmill training or overground gait with close guarding",
      "Gait quality drills — step symmetry, heel strike, knee control in stance; consider AFO assessment for foot drop",
      "Strength & balance — sit-to-stand repetitions, single-leg stance progression, static/dynamic balance tasks",
      "Walking aid fitting & training (stick/quad stick) with falls-prevention education",
      "Endurance building — increase walking distance 10–20% weekly as tolerated",
    ],
  },
  independent: {
    timeline: "Weeks 4–24+; progress to community ambulation goals; review monthly",
    exercises: [
      "Community ambulation training — uneven surfaces, kerbs, slopes, stairs with/without rails",
      "Dual-task walking — cognitive-motor tasks while walking for automaticity",
      "Speed & endurance — goal ≥0.8–1.0 m/s gait speed; 30-min continuous walking target",
      "Advanced balance — perturbation training, tandem walking, outdoor obstacle courses",
      "Falls-prevention program and home/environmental assessment",
    ],
  },
};

const MRS_GOALS: Record<string, Omit<RehabGoal, "domain" | "tier">> = {
  severe: {
    timeline: "Start within 24–48 h of admission; daily MDT input; caregiver training before discharge",
    exercises: [
      "Early positioning & pressure-area care — 2-hourly repositioning, seating assessment",
      "Chest physiotherapy & assisted mobility as tolerated",
      "Passive/assisted transfers with hoist; train caregivers in safe handling",
      "Seating & postural management — wheelchair prescription with trunk/head support as needed",
      "Swallow-safe feeding positioning (with SLT); spasticity & contracture prevention program",
    ],
  },
  moderate: {
    timeline: "Weeks 1–12; structured inpatient/outpatient program 3–5×/week",
    exercises: [
      "ADL retraining — dressing, grooming, toileting with one-handed techniques & adaptive equipment",
      "Supervised mobility progression — short indoor walks, stair practice with standby assist",
      "Home exercise program — balance, strengthening and walking 30 min/day",
      "Falls-risk mitigation — home assessment, grab rails, review of aids",
      "Graded return to household tasks and social participation",
    ],
  },
  mild: {
    timeline: "Weeks 2–24; transition to self-directed program within 4–8 weeks",
    exercises: [
      "Aerobic conditioning — brisk walking, stationary cycling 30–40 min, 3–5×/week (post cardiac clearance)",
      "Resistance training — whole-body, 2–3×/week, moderate–vigorous intensity",
      "Return-to-work/driving assessment and community reintegration planning",
      "Secondary prevention lifestyle coaching — exercise adherence, BP/diabetes/lipid control support",
      "Fine-tune residual deficits — fatigue management, cognitive-motor integration",
    ],
  },
};

const pretty = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const NA = "—";

/* --------------------------------- helpers -------------------------------- */

type State = Record<string, any>;

const initialState: State = {
  patient_id: "", patient_name: "", age_years: "", sex: "not_recorded",
  assessment_datetime: "", stroke_onset_datetime: "",
  stroke_type: "not_recorded", territory: "unknown", phase_of_care: "acute_stroke_unit",
  assessor_name: "", assessor_role: "",
  nihss_total: "",
  left_arm: "", right_arm: "", left_leg: "", right_leg: "",
  untestable_reason: "",
  flags: {} as Record<string, boolean>,
  flag_action: "",
  cmsa: {} as Record<string, string>,
  affected_side: "not_recorded", spasticity: "not_assessed",
  neck_extension: "", neck_flexion: "", limb_strength_comments: "",
  head_control: "not_assessed", hold30: "not_assessed", hold60: "not_assessed",
  bulbar_concern: false, cervical_concern: false, head_notes: "",
  tis_static: "", tis_dynamic: "", tis_coord: "",
  tis_feasible: "not_assessed", tis_observations: [] as string[],
  fac: "", walking_aid: "not_recorded", distance_m: "", gait_notes: "",
  bed_to_chair: "not_assessed", sit_to_stand: "not_assessed",
  transfer_aid: false, transfer_notes: "",
  mrs: "",
  rehab_priority: "pending_clinician_assignment",
  clinician_notes: "",
};

function LabelledSelect({
  label, value, onChange, options, placeholder = "Select",
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string; desc?: string }[]; placeholder?: string;
}) {
  const sel = options.find((o) => o.value === value);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {sel?.desc ? <p className="text-[11px] leading-snug text-muted-foreground">{sel.desc}</p> : null}
    </div>
  );
}

/* -------------------------------- component ------------------------------- */

const StrokeMotorControlDashboard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [s, setS] = useState<State>(initialState);

  const set = (k: string, v: any) => setS((p) => ({ ...p, [k]: v }));

  const motorSubtotal = useMemo(() => {
    const items = [s.left_arm, s.right_arm, s.left_leg, s.right_leg];
    if (items.some((v) => v === "" || v === "UN")) return null;
    return items.reduce((a, v) => a + Number(v), 0);
  }, [s.left_arm, s.right_arm, s.left_leg, s.right_leg]);

  const tisTotal = useMemo(() => {
    const parts = [s.tis_static, s.tis_dynamic, s.tis_coord];
    if (parts.some((v) => v === "")) return null;
    return parts.reduce((a, v) => a + Number(v), 0);
  }, [s.tis_static, s.tis_dynamic, s.tis_coord]);

  const tisInterpretation = useMemo(() => {
    if (tisTotal === null) return "not_interpreted";
    if (tisTotal <= 7) return "marked_axial_impairment";
    if (tisTotal <= 14) return "moderate_axial_impairment";
    if (tisTotal <= 19) return "mild_axial_impairment";
    return "good_trunk_control";
  }, [tisTotal]);

  const alerts = useMemo(() => {
    const out: { severity: "critical" | "high" | "warning" | "informational"; message: string }[] = [];
    const f = s.flags as Record<string, boolean>;
    if (f.new_or_worsening_motor_deficit || f.reduced_consciousness || f.new_pupillary_abnormality) {
      out.push({ severity: "critical", message: "Possible acute neurological deterioration. Activate the local acute-stroke/neurosurgical escalation pathway and obtain urgent clinician assessment and imaging as appropriate." });
    }
    if (s.head_control === "absent" || s.bulbar_concern || f.new_dysphagia_or_weak_cough) {
      out.push({ severity: "critical", message: "Head-control and/or bulbar safety concern. Assess airway, secretion management, aspiration risk, positioning and swallowing before oral intake; arrange urgent senior review." });
    }
    if (s.tis_feasible === "not_feasible_due_to_medical_or_safety_reason" || s.tis_observations.includes("unsafe_unsupported_sitting")) {
      out.push({ severity: "high", message: "Unsafe unsupported sitting. Use falls precautions and assisted positioning/transfers; involve physiotherapy and occupational therapy." });
    }
    if (s.fac !== "" && Number(s.fac) <= 2) {
      out.push({ severity: "high", message: "Dependent / non-functional ambulation. Document mobility assistance, falls precautions, transfer plan and rehabilitation goals." });
    }
    const cmsaVals = ["left_arm", "right_arm", "left_leg", "right_leg"]
      .map((k) => s.cmsa[k]).filter(Boolean).map(Number);
    if (cmsaVals.some((v) => v <= 3)) {
      out.push({ severity: "informational", message: "Synergy-dominant or flaccid motor recovery stage documented. Focus serial assessment on return of voluntary selective movement, spasticity management, positioning and prevention of complications." });
    }
    if (s.mrs !== "" && Number(s.mrs) <= 3 && s.fac !== "" && Number(s.fac) <= 2) {
      out.push({ severity: "warning", message: "Check internal consistency: mRS 0–3 usually implies ambulation without physical assistance, whereas FAC 0–2 indicates physically assisted/dependent walking." });
    }
    return out;
  }, [s]);

  const rehabGoals = useMemo((): RehabGoal[] => {
    const goals: RehabGoal[] = [];
    // CMSA — use the lowest recorded stage (worst-recovering segment)
    const stages = Object.values(s.cmsa).filter(Boolean).map(Number);
    if (stages.length) {
      const min = Math.min(...stages);
      const key = min <= 2 ? "flaccid" : min <= 4 ? "synergy" : "selective";
      const tier = min <= 2 ? "CMSA 1–2 (flaccid / early synergy)" : min <= 4 ? "CMSA 3–4 (synergy-dominant)" : "CMSA 5–7 (selective movement)";
      goals.push({ domain: "CMSA", tier, ...CMSA_GOALS[key] });
    }
    if (s.fac !== "") {
      const f = Number(s.fac);
      const key = f <= 1 ? "dependent" : f <= 3 ? "supervised" : "independent";
      const tier = f <= 1 ? "FAC 0–1 (non-functional / dependent ambulation)" : f <= 3 ? "FAC 2–3 (assisted or supervised ambulation)" : "FAC 4–5 (independent ambulation)";
      goals.push({ domain: "FAC", tier, ...FAC_GOALS[key] });
    }
    if (s.mrs !== "" && Number(s.mrs) < 6) {
      const m = Number(s.mrs);
      const key = m >= 4 ? "severe" : m === 3 ? "moderate" : "mild";
      const tier = m >= 4 ? "mRS 4–5 (moderately severe–severe disability)" : m === 3 ? "mRS 3 (moderate disability)" : "mRS 0–2 (no-to-slight disability)";
      goals.push({ domain: "mRS", tier, ...MRS_GOALS[key] });
    }
    return goals;
  }, [s.cmsa, s.fac, s.mrs]);

  const report = useMemo(() => {
    const v = (x: any) => (x === "" || x === undefined || x === null ? NA : x);
    return [
      `Stroke motor-control assessment${s.patient_name ? ` — ${s.patient_name}` : ""}${s.assessment_datetime ? ` (${s.assessment_datetime})` : ""}.`,
      `Context: ${pretty(s.stroke_type)}, ${pretty(s.territory)}, phase ${pretty(s.phase_of_care)}.`,
      `NIHSS motor subtotal ${motorSubtotal === null ? NA : motorSubtotal}/16; left arm ${v(s.left_arm)}/4, right arm ${v(s.right_arm)}/4, left leg ${v(s.left_leg)}/4, right leg ${v(s.right_leg)}/4${s.nihss_total ? `; NIHSS total ${s.nihss_total}/42` : ""}.`,
      `CMSA: left arm ${v(s.cmsa.left_arm)}/7, right arm ${v(s.cmsa.right_arm)}/7, left hand ${v(s.cmsa.left_hand)}/7, right hand ${v(s.cmsa.right_hand)}/7, left leg ${v(s.cmsa.left_leg)}/7, right leg ${v(s.cmsa.right_leg)}/7, left foot ${v(s.cmsa.left_foot)}/7, right foot ${v(s.cmsa.right_foot)}/7. Affected side ${pretty(s.affected_side)}; spasticity ${pretty(s.spasticity)}.`,
      `Neck extension MRC ${v(s.neck_extension)}/5; neck flexion MRC ${v(s.neck_flexion)}/5; head control ${pretty(s.head_control)}.`,
      `TIS ${tisTotal === null ? NA : tisTotal}/23 (${pretty(tisInterpretation)}).`,
      `FAC ${v(s.fac)}/5; walking aid ${pretty(s.walking_aid)}. Bed–chair transfer ${pretty(s.bed_to_chair)}; sit-to-stand ${pretty(s.sit_to_stand)}.`,
      `mRS ${v(s.mrs)}/6.`,
      `Rehabilitation priority: ${pretty(s.rehab_priority)}.`,
      ...rehabGoals.map(
        (g) =>
          `Rehab goals (${g.tier}) — timeline: ${g.timeline}. Exercises: ${g.exercises.map((e) => e.replace(/—.*$/, "").trim()).join("; ")}.`,
      ),
      alerts.length ? `Alerts: ${alerts.map((a) => `[${a.severity}] ${a.message}`).join(" ")}` : "",
      s.clinician_notes ? `Notes: ${s.clinician_notes}` : "",
    ].filter(Boolean).join("\n");
  }, [s, motorSubtotal, tisTotal, tisInterpretation, alerts, rehabGoals]);

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 14;
      const maxW = pageW - margin * 2;
      let y = 18;

      const ensure = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 14) {
          doc.addPage();
          y = 18;
        }
      };
      const heading = (text: string) => {
        ensure(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(text, margin, y);
        y += 6;
        doc.setDrawColor(120);
        doc.line(margin, y, pageW - margin, y);
        y += 6;
      };
      const para = (text: string, size = 10, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        for (const line of doc.splitTextToSize(text, maxW) as string[]) {
          ensure(5);
          doc.text(line, margin, y);
          y += 5;
        }
        y += 1.5;
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Stroke Motor Control & Mobility Assessment", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString()} · Stroke Companion`, margin, y);
      y += 9;

      heading("Assessment Report");
      para(report);

      if (alerts.length) {
        heading("Decision Alerts");
        alerts.forEach((a) => para(`[${a.severity.toUpperCase()}] ${a.message}`));
      }

      if (rehabGoals.length) {
        heading("Physiotherapy Goals & Timelines");
        rehabGoals.forEach((g) => {
          para(`${g.domain} — ${g.tier}`, 11, true);
          para(`Timeline: ${g.timeline}`);
          g.exercises.forEach((e) => para(`•  ${e}`, 9));
          y += 2;
        });
      }

      heading("Disclaimer");
      para(
        "Clinical documentation and rehabilitation tracking aid only. Does not replace formal NIHSS certification, validated administration manuals, neurological examination, physiotherapy assessment or local stroke protocols.",
        8,
      );

      const name = s.patient_name ? s.patient_name.replace(/\s+/g, "_") : "patient";
      doc.save(`motor-assessment-${name}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF exported");
    } catch {
      toast.error("PDF export failed");
    }
  };

  const cmsaRow = (key: string, label: string) => (
    <LabelledSelect
      key={key}
      label={label}
      value={s.cmsa[key] ?? ""}
      onChange={(v) => setS((p) => ({ ...p, cmsa: { ...p.cmsa, [key]: v } }))}
      options={Object.entries(CMSA_STAGES).map(([k, d]) => ({ value: k, label: `Stage ${k} — ${d}`, desc: d }))}
      placeholder="Stage"
    />
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen} id="motor-control-dashboard">
      <Card className="bg-medical-section border-medical-header/20">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                <PersonStanding className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg text-foreground">
                  Stroke Motor Control &amp; Mobility Assessment
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  NIHSS motor · CMSA · MRC · Head/trunk control · TIS · FAC · Transfers · mRS
                </p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-5">
            {/* progress */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {STEPS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setStep(i)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      i === step
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow"
                        : "bg-muted/60 text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
            </div>

            {/* live alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 rounded-lg border p-2.5 text-xs leading-snug ${
                      a.severity === "critical"
                        ? "border-red-500/40 bg-red-500/10 text-foreground"
                        : a.severity === "high"
                        ? "border-orange-500/40 bg-orange-500/10 text-foreground"
                        : a.severity === "warning"
                        ? "border-amber-500/40 bg-amber-500/10 text-foreground"
                        : "border-sky-500/40 bg-sky-500/10 text-foreground"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong className="uppercase mr-1">{a.severity}:</strong>{a.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 1 */}
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Patient name / ID</Label>
                  <Input className="h-9" value={s.patient_name} onChange={(e) => set("patient_name", e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Age (years)</Label>
                  <Input className="h-9" type="number" value={s.age_years} onChange={(e) => set("age_years", e.target.value)} />
                </div>
                <LabelledSelect label="Sex" value={s.sex} onChange={(v) => set("sex", v)}
                  options={["female", "male", "other", "not_recorded"].map((v) => ({ value: v, label: pretty(v) }))} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Assessment date/time</Label>
                  <Input className="h-9" type="datetime-local" value={s.assessment_datetime} onChange={(e) => set("assessment_datetime", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Stroke onset date/time</Label>
                  <Input className="h-9" type="datetime-local" value={s.stroke_onset_datetime} onChange={(e) => set("stroke_onset_datetime", e.target.value)} />
                </div>
                <LabelledSelect label="Stroke type" value={s.stroke_type} onChange={(v) => set("stroke_type", v)}
                  options={["acute_ischaemic_stroke", "intracerebral_haemorrhage", "subarachnoid_haemorrhage", "cerebral_venous_thrombosis", "stroke_mimic_or_uncertain", "not_recorded"].map((v) => ({ value: v, label: pretty(v) }))} />
                <LabelledSelect label="Territory / syndrome" value={s.territory} onChange={(v) => set("territory", v)}
                  options={["left_anterior_circulation", "right_anterior_circulation", "posterior_circulation", "brainstem", "cerebellar", "lacunar_or_subcortical", "bilateral_or_multiterritory", "unknown"].map((v) => ({ value: v, label: pretty(v) }))} />
                <LabelledSelect label="Phase of care" value={s.phase_of_care} onChange={(v) => set("phase_of_care", v)}
                  options={["hyperacute", "acute_stroke_unit", "early_rehabilitation", "inpatient_rehabilitation", "outpatient_rehabilitation", "follow_up"].map((v) => ({ value: v, label: pretty(v) }))} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Assessor (name / role)</Label>
                  <Input className="h-9" value={s.assessor_name} onChange={(e) => set("assessor_name", e.target.value)} placeholder="e.g. Dr A, physiotherapist" />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Use the formal NIHSS administration method. Motor arm and motor leg are scored separately for each side; higher scores indicate greater acute motor deficit.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabelledSelect label="Left arm (NIHSS 5a)" value={s.left_arm} onChange={(v) => set("left_arm", v)} options={NIHSS_ARM} />
                  <LabelledSelect label="Right arm (NIHSS 5b)" value={s.right_arm} onChange={(v) => set("right_arm", v)} options={NIHSS_ARM} />
                  <LabelledSelect label="Left leg (NIHSS 6a)" value={s.left_leg} onChange={(v) => set("left_leg", v)} options={NIHSS_LEG} />
                  <LabelledSelect label="Right leg (NIHSS 6b)" value={s.right_leg} onChange={(v) => set("right_leg", v)} options={NIHSS_LEG} />
                </div>
                {[s.left_arm, s.right_arm, s.left_leg, s.right_leg].includes("UN") && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Untestable reason (required)</Label>
                    <Input className="h-9" value={s.untestable_reason} onChange={(e) => set("untestable_reason", e.target.value)} placeholder="e.g. amputation, joint fusion" />
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Motor subtotal</p>
                    <p className="text-2xl font-bold text-foreground">
                      {motorSubtotal === null ? "—" : `${motorSubtotal}/16`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Not calculated if any item is untestable.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">NIHSS total score (optional)</Label>
                    <Input className="h-9" type="number" min={0} max={42} value={s.nihss_total} onChange={(e) => set("nihss_total", e.target.value)} />
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Acute neurological red flags</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {RED_FLAGS.map((f) => (
                      <label key={f.key} className="flex items-start gap-2 text-xs text-foreground cursor-pointer">
                        <Checkbox
                          checked={!!s.flags[f.key]}
                          onCheckedChange={(c) => setS((p) => ({ ...p, flags: { ...p.flags, [f.key]: !!c } }))}
                        />
                        <span className="leading-snug">{f.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Action taken</Label>
                    <Textarea rows={2} value={s.flag_action} onChange={(e) => set("flag_action", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Chedoke-McMaster Stroke Assessment (CMSA) stages recovery from flaccidity through synergy-dominant movement to normal motor function. Stages are ordinal — compare serially within the same limb segment using standardised administration.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {cmsaRow("left_arm", "Left arm")}
                  {cmsaRow("right_arm", "Right arm")}
                  {cmsaRow("left_hand", "Left hand")}
                  {cmsaRow("right_hand", "Right hand")}
                  {cmsaRow("left_leg", "Left leg")}
                  {cmsaRow("right_leg", "Right leg")}
                  {cmsaRow("left_foot", "Left foot")}
                  {cmsaRow("right_foot", "Right foot")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabelledSelect label="Affected side" value={s.affected_side} onChange={(v) => set("affected_side", v)}
                    options={["left", "right", "bilateral", "not_recorded"].map((v) => ({ value: v, label: pretty(v) }))} />
                  <LabelledSelect label="Spasticity pattern" value={s.spasticity} onChange={(v) => set("spasticity", v)}
                    options={["not_assessed", "none", "mild", "moderate", "marked", "variable"].map((v) => ({ value: v, label: pretty(v) }))} />
                </div>
                <Separator />
                <p className="text-xs font-semibold text-foreground">MRC strength (optional)</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabelledSelect label="Neck extension" value={s.neck_extension} onChange={(v) => set("neck_extension", v)} options={MRC} />
                  <LabelledSelect label="Neck flexion" value={s.neck_flexion} onChange={(v) => set("neck_flexion", v)} options={MRC} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Limb strength comments</Label>
                  <Textarea rows={2} value={s.limb_strength_comments} onChange={(e) => set("limb_strength_comments", e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 3 && (
              <div className="space-y-4">
                <LabelledSelect label="Head control" value={s.head_control} onChange={(v) => set("head_control", v)} options={HEAD_CONTROL} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabelledSelect label="Holds midline 30 seconds" value={s.hold30} onChange={(v) => set("hold30", v)}
                    options={["yes", "no", "not_assessed"].map((v) => ({ value: v, label: pretty(v) }))} />
                  <LabelledSelect label="Holds midline 60 seconds" value={s.hold60} onChange={(v) => set("hold60", v)}
                    options={["yes", "no", "not_assessed"].map((v) => ({ value: v, label: pretty(v) }))} />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <Checkbox checked={s.bulbar_concern} onCheckedChange={(c) => set("bulbar_concern", !!c)} />
                    Bulbar or airway concern
                  </label>
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <Checkbox checked={s.cervical_concern} onCheckedChange={(c) => set("cervical_concern", !!c)} />
                    Neck pain / cervical trauma concern
                  </label>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Head control notes</Label>
                  <Textarea rows={2} value={s.head_notes} onChange={(e) => set("head_notes", e.target.value)} />
                </div>

                <Separator />
                <p className="text-xs font-semibold text-foreground">Trunk Impairment Scale (TIS, 0–23)</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  17-item seated trunk-control assessment; higher score indicates better sitting trunk control. It does not assess standing balance, gait independence or isolated neck-extensor strength.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <LabelledSelect label="Static sitting (0–7)" value={s.tis_static} onChange={(v) => set("tis_static", v)} options={TIS_STATIC} />
                  <LabelledSelect label="Dynamic sitting (0–10)" value={s.tis_dynamic} onChange={(v) => set("tis_dynamic", v)} options={TIS_DYNAMIC} />
                  <LabelledSelect label="Coordination (0–6)" value={s.tis_coord} onChange={(v) => set("tis_coord", v)} options={TIS_COORD} />
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">TIS total</p>
                    <p className="text-2xl font-bold text-foreground">{tisTotal === null ? "—" : `${tisTotal}/23`}</p>
                  </div>
                  <Badge variant="secondary" className="text-[11px]">{pretty(tisInterpretation)}</Badge>
                </div>
                <LabelledSelect label="Assessment feasibility" value={s.tis_feasible} onChange={(v) => set("tis_feasible", v)}
                  options={["yes_unsupported_sitting_achieved", "partially_feasible_with_support_or_modification", "not_feasible_due_to_medical_or_safety_reason", "not_assessed"].map((v) => ({ value: v, label: pretty(v) }))} />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Key observations</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TIS_OBSERVATIONS.map((o) => (
                      <label key={o} className="flex items-start gap-2 text-xs text-foreground cursor-pointer">
                        <Checkbox
                          checked={s.tis_observations.includes(o)}
                          onCheckedChange={(c) =>
                            setS((p) => ({
                              ...p,
                              tis_observations: c
                                ? [...p.tis_observations, o]
                                : p.tis_observations.filter((x: string) => x !== o),
                            }))
                          }
                        />
                        <span className="leading-snug">{pretty(o)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-[11px] text-muted-foreground leading-snug">
                  FAC is a 6-level measure of the physical assistance required for ambulation — it assesses walking independence, not gait quality, endurance or fall risk in isolation.
                </p>
                <LabelledSelect label="Functional Ambulation Category" value={s.fac} onChange={(v) => set("fac", v)} options={FAC} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabelledSelect label="Walking aid used" value={s.walking_aid} onChange={(v) => set("walking_aid", v)}
                    options={["none", "single_point_stick", "quad_stick", "walker_or_rollator", "parallel_bars", "ankle_foot_orthosis", "wheelchair_primary", "other", "not_recorded"].map((v) => ({ value: v, label: pretty(v) }))} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Distance tested (m)</Label>
                    <Input className="h-9" type="number" value={s.distance_m} onChange={(e) => set("distance_m", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Gait safety notes</Label>
                  <Textarea rows={2} value={s.gait_notes} onChange={(e) => set("gait_notes", e.target.value)} />
                </div>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabelledSelect label="Bed → chair transfer" value={s.bed_to_chair} onChange={(v) => set("bed_to_chair", v)}
                    options={TRANSFER_OPTIONS.map((v) => ({ value: v, label: pretty(v) }))} />
                  <LabelledSelect label="Sit to stand" value={s.sit_to_stand} onChange={(v) => set("sit_to_stand", v)}
                    options={TRANSFER_OPTIONS.map((v) => ({ value: v, label: pretty(v) }))} />
                </div>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <Checkbox checked={s.transfer_aid} onCheckedChange={(c) => set("transfer_aid", !!c)} />
                  Transfer aid required
                </label>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Transfer notes</Label>
                  <Textarea rows={2} value={s.transfer_notes} onChange={(e) => set("transfer_notes", e.target.value)} />
                </div>
                <Separator />
                <LabelledSelect label="Modified Rankin Scale (global disability)" value={s.mrs} onChange={(v) => set("mrs", v)} options={MRS} />
              </div>
            )}

            {/* STEP 6 — REHAB GOALS */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-semibold text-foreground">Physiotherapy goals mapped from your CMSA, FAC and mRS entries</p>
                </div>
                {rehabGoals.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-center">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No goals generated yet. Enter at least one CMSA stage (Step 3), FAC score (Step 5) or mRS score (Step 5) to see tailored physiotherapy exercises and timelines.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rehabGoals.map((g) => (
                      <div
                        key={g.domain}
                        className={`rounded-lg border p-3.5 space-y-2.5 ${
                          g.domain === "CMSA"
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : g.domain === "FAC"
                            ? "border-sky-500/40 bg-sky-500/5"
                            : "border-amber-500/40 bg-amber-500/5"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge variant="secondary" className="text-[11px] font-bold">{g.domain}</Badge>
                          <p className="text-xs font-semibold text-foreground">{g.tier}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          <strong className="text-foreground">Timeline:</strong> {g.timeline}
                        </p>
                        <ul className="space-y-1.5">
                          {g.exercises.map((e, i) => (
                            <li key={i} className="flex gap-2 text-xs leading-snug text-foreground/90">
                              <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      Goals auto-update as you change CMSA, FAC or mRS. Always individualise dose, frequency and precautions to the patient's medical status and local protocols.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 7 — CLINICAL SUMMARY */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "NIHSS motor", value: motorSubtotal === null ? "—" : `${motorSubtotal}/16`, icon: <Activity className="h-4 w-4 text-rose-500" /> },
                    { label: "TIS", value: tisTotal === null ? "—" : `${tisTotal}/23`, icon: <PersonStanding className="h-4 w-4 text-emerald-500" /> },
                    { label: "FAC", value: s.fac === "" ? "—" : `${s.fac}/5`, icon: <Footprints className="h-4 w-4 text-sky-500" /> },
                    { label: "mRS", value: s.mrs === "" ? "—" : `${s.mrs}/6`, icon: <Check className="h-4 w-4 text-amber-500" /> },
                  ].map((c) => (
                    <div key={c.label} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">{c.icon}{c.label}</div>
                      <p className="text-2xl font-bold text-foreground mt-1">{c.value}</p>
                    </div>
                  ))}
                </div>
                <LabelledSelect label="Rehabilitation priority" value={s.rehab_priority} onChange={(v) => set("rehab_priority", v)}
                  options={REHAB_PRIORITIES.map((v) => ({ value: v, label: pretty(v) }))} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Clinician notes</Label>
                  <Textarea rows={3} value={s.clinician_notes} onChange={(e) => set("clinician_notes", e.target.value)} />
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-foreground mb-2">Report</p>
                  <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/90">{report}</pre>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => { navigator.clipboard.writeText(report); toast.success("Assessment copied to clipboard"); }}
                  >
                    <Copy className="h-4 w-4 mr-1.5" /> Copy report
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportPDF}>
                    <FileDown className="h-4 w-4 mr-1.5" /> Export PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setS(initialState); setStep(0); toast.success("Assessment reset"); }}>
                    <RotateCcw className="h-4 w-4 mr-1.5" /> Reset
                  </Button>
                </div>
              </div>
            )}

            {/* nav */}
            <div className="flex items-center justify-between pt-1">
              <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((v) => Math.max(0, v - 1))}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <span className="text-[11px] text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
              <Button size="sm" disabled={step === STEPS.length - 1} onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <p className="text-[10px] leading-snug text-muted-foreground border-t pt-3">
              Clinical documentation and rehabilitation tracking aid only. Does not replace formal NIHSS certification, validated administration manuals, neurological examination, swallowing/airway assessment, physiotherapy assessment or local stroke protocols.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default StrokeMotorControlDashboard;
