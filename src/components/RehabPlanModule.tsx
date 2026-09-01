import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarDays, ChevronDown, ClipboardList, Copy, Dumbbell, RotateCcw, TrendingUp, Target, LayoutList, GitCommitVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useRehabSharedState } from "@/hooks/useRehabSharedState";


/* ------------------------------- clinical data ---------------------------- */

type Tier = "flaccid" | "synergy" | "selective";
type FacTier = "dependent" | "supervised" | "independent";
type MrsTier = "severe" | "moderate" | "mild";

const CMSA_STAGES: { value: string; label: string }[] = [
  { value: "1", label: "Stage 1 — Flaccid paralysis, no voluntary movement" },
  { value: "2", label: "Stage 2 — Spasticity appearing, minimal voluntary movement" },
  { value: "3", label: "Stage 3 — Marked spasticity, movement within obligatory synergy" },
  { value: "4", label: "Stage 4 — Spasticity declining, movement deviating from synergy" },
  { value: "5", label: "Stage 5 — Relative independence from synergy patterns" },
  { value: "6", label: "Stage 6 — Near-normal coordination, isolated joint movement" },
  { value: "7", label: "Stage 7 — Normal movement" },
];

const FAC_LEVELS: { value: string; label: string }[] = [
  { value: "0", label: "FAC 0 — Non-functional (≥2 helpers / parallel bars)" },
  { value: "1", label: "FAC 1 — Dependent level II (continuous firm manual support)" },
  { value: "2", label: "FAC 2 — Dependent level I (light touch for balance)" },
  { value: "3", label: "FAC 3 — Dependent for supervision (no contact)" },
  { value: "4", label: "FAC 4 — Independent on level surfaces" },
  { value: "5", label: "FAC 5 — Independent all surfaces / stairs" },
];

const MRS_LEVELS: { value: string; label: string }[] = [
  { value: "0", label: "mRS 0 — No symptoms" },
  { value: "1", label: "mRS 1 — No significant disability" },
  { value: "2", label: "mRS 2 — Slight disability" },
  { value: "3", label: "mRS 3 — Moderate disability (walks unaided)" },
  { value: "4", label: "mRS 4 — Moderately severe (cannot walk unaided)" },
  { value: "5", label: "mRS 5 — Severe (bedridden, constant care)" },
];

const cmsaTier = (stage: string): Tier | null => {
  if (!stage) return null;
  const n = Number(stage);
  if (n <= 2) return "flaccid";
  if (n <= 4) return "synergy";
  return "selective";
};

const facTier = (fac: string): FacTier | null => {
  if (fac === "") return null;
  const n = Number(fac);
  if (n <= 1) return "dependent";
  if (n <= 3) return "supervised";
  return "independent";
};

const mrsTier = (mrs: string): MrsTier | null => {
  if (mrs === "") return null;
  const n = Number(mrs);
  if (n >= 4) return "severe";
  if (n >= 2) return "moderate";
  return "mild";
};

/* exercise pools -------------------------------------------------------- */

const UPPER_LIMB: Record<Tier, string[]> = {
  flaccid: [
    "Full passive ROM all joints of affected arm — 2 sets × 10 reps, support humeral head, no traction",
    "Protective positioning & scapular setting in supported sitting — 10 min",
    "Weight-bearing through affected forearm in sitting (loaded elbow) — 5 × 30 s",
    "Sensory stimulation (texture, tapping, deep pressure) over affected limb — 10 min",
    "Mirror therapy with unaffected hand — 15 min",
    "Caregiver-assisted handling & shoulder subluxation check — 10 min",
  ],
  synergy: [
    "Active-assisted reach in gravity-eliminated plane (table slide) — 3 × 15 reps",
    "Out-of-synergy drill: shoulder flexion with elbow extended — 3 × 10 reps",
    "Grasp-and-release with graded objects — 60 repetitions",
    "Prolonged stretch of spastic wrist/finger flexors — 3 × 60 s",
    "Bilateral arm training (symmetric pushing/pulling) — 10 min",
    "Task practice: reach-to-cup, doorknob turn, towel wipe — 100 repetitions",
  ],
  selective: [
    "Progressive resisted strengthening (band/dumbbell) — 3 × 10 at moderate load",
    "Fine motor & dexterity: pegboard, coins, buttons — 15 min",
    "Modified CIMT block: unaffected hand mitted, functional task practice — 30 min",
    "Speed & accuracy reaching drills to targets — 3 × 20 reps",
    "ADL integration: dressing, grooming, utensil use — 20 min",
    "Handwriting / keyboard practice — 15 min",
  ],
};

const MOBILITY: Record<FacTier, string[]> = {
  dependent: [
    "Bed mobility: rolling and supine-to-sit with assist — 5 reps each side",
    "Unsupported sitting balance with reach outside base of support — 3 × 2 min",
    "Sit-to-stand with 1–2 assist or standing hoist — 8–10 reps",
    "Tilt table / standing frame for orthostatic tolerance & limb loading — 15–20 min",
    "Weight shifting in supported standing (frame/bars) — 3 × 2 min",
    "Assisted transfer training bed↔chair with consistent technique — 5 reps",
  ],
  supervised: [
    "Overground gait with close guarding — 3 × 20–50 m (progress 10–20% weekly)",
    "Body-weight–supported treadmill or bars gait, 15–20 min",
    "Sit-to-stand without hands — 3 × 10 reps",
    "Static/dynamic standing balance: feet together → semi-tandem → tandem — 3 × 30 s",
    "Step-ups and stair practice with rail — 2 × 10 steps",
    "Gait quality drills: heel strike, step length symmetry, knee control (± AFO trial)",
  ],
  independent: [
    "Community ambulation: kerbs, slopes, uneven ground — 15–20 min",
    "Dual-task walking (cognitive load while walking) — 3 × 3 min",
    "Gait speed intervals, target ≥0.8–1.0 m/s — 6 × 30 s fast walk",
    "Endurance walk, build toward 30 min continuous",
    "Perturbation/reactive balance and tandem walking — 10 min",
    "Stairs without rail, ascent/descent — 3 × 1 flight",
  ],
};

const GLOBAL_CARE: Record<MrsTier, string[]> = {
  severe: [
    "2-hourly repositioning & pressure-area check",
    "Chest physiotherapy and assisted cough — 10 min",
    "Postural/seating management review (trunk & head support)",
    "Contracture prevention: sustained stretch of ankle, elbow, fingers — 3 × 60 s",
    "Caregiver training in safe handling and hoist transfer",
    "Swallow-safe upright feeding positioning (with SLT)",
  ],
  moderate: [
    "ADL retraining: dressing, grooming, toileting with adaptive aids — 20 min",
    "Home exercise program review & adherence check — 10 min",
    "Falls-risk education and environment planning",
    "Light aerobic activity (cycle/walk) — 15–20 min at comfortable effort",
    "Energy conservation & fatigue pacing session",
    "Graded household task practice (kitchen, laundry) — 20 min",
  ],
  mild: [
    "Aerobic conditioning 30–40 min at 60–80% HR reserve",
    "Whole-body resistance training — 2–3 sets, moderate–vigorous",
    "Return-to-work / driving readiness tasks — 20 min",
    "Secondary prevention coaching (BP, lipids, glucose, activity adherence)",
    "Sport/leisure-specific reconditioning — 20 min",
    "Cognitive-motor dual-task and fatigue-management practice",
  ],
};

const phaseOf = (day: number) =>
  day <= 7 ? "Acute (day 0–7)" : day <= 90 ? "Subacute (week 2–12)" : "Chronic (>3 months)";

const PROGRESSION_RULE =
  "Progress when the patient completes the prescribed dose on 2 consecutive days with no red flag and Borg ≤13; regress one level if fatigue, pain >4/10, BP instability or new neurological change.";

/* weekly goals by tier ---------------------------------------------------- */

const WEEKLY_UL: Record<Tier, string> = {
  flaccid: "Maintain full painless shoulder ROM, no subluxation increase, initiate 15 min/day mirror therapy",
  synergy: "Achieve ≥100 task repetitions/day and one out-of-synergy reach with elbow extended",
  selective: "Increase resisted load ~10% and complete 2 self-care ADLs with the affected hand unaided",
};

const WEEKLY_MOB: Record<FacTier, string> = {
  dependent: "Tolerate 20 min upright standing and complete bed↔chair transfer with 1 assist",
  supervised: "Increase walking distance 10–20% and progress to standby supervision on level ground",
  independent: "Reach ≥0.8 m/s gait speed and 30 min continuous walking including kerbs and stairs",
};

const WEEKLY_GLOBAL: Record<MrsTier, string> = {
  severe: "No pressure injury or contracture; caregiver independent in handling and safe feeding position",
  moderate: "Independent in 2 additional ADLs and adherent to daily home exercise program",
  mild: "Complete 150 min/week aerobic activity and progress return-to-work/driving readiness tasks",
};

const TIER_MILESTONES: { key: string; label: string; detail: string }[] = [
  { key: "cmsa-flaccid", label: "CMSA 1–2 · Flaccid", detail: "Protect the limb: ROM, positioning, sensory input, mirror therapy" },
  { key: "cmsa-synergy", label: "CMSA 3–4 · Synergy", detail: "High-repetition task practice, break obligatory synergy, manage spasticity" },
  { key: "cmsa-selective", label: "CMSA 5–7 · Selective", detail: "Strength, dexterity, modified CIMT, ADL and vocational integration" },
  { key: "fac-dependent", label: "FAC 0–1 · Dependent", detail: "Bed mobility, sitting balance, tilt/standing frame, assisted transfers" },
  { key: "fac-supervised", label: "FAC 2–3 · Supervised", detail: "Overground gait with guarding, sit-to-stand, dynamic balance, stairs with rail" },
  { key: "fac-independent", label: "FAC 4–5 · Independent", detail: "Community ambulation, dual-task, gait speed and endurance targets" },
  { key: "mrs-severe", label: "mRS 4–5 · Severe", detail: "Pressure care, chest physio, contracture prevention, caregiver training" },
  { key: "mrs-moderate", label: "mRS 2–3 · Moderate", detail: "ADL retraining, falls prevention, light aerobic work, energy conservation" },
  { key: "mrs-mild", label: "mRS 0–1 · Mild", detail: "Conditioning, resistance training, return to work/driving, prevention coaching" },
];

/* ------------------------------- component ------------------------------- */

interface DayPlan {
  day: number;
  date: string;
  phase: string;
  blocks: { time: string; focus: string; items: string[] }[];
  isReview: boolean;
}

const RehabPlanModule: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { state: shared } = useRehabSharedState();
  const [cmsa, setCmsa] = useState("");
  const [fac, setFac] = useState("");
  const [mrs, setMrs] = useState("");
  const [dayOfStroke, setDayOfStroke] = useState("1");
  const [sessions, setSessions] = useState("2");
  const [length, setLength] = useState("7");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState("");
  const [view, setView] = useState<"cards" | "timeline">("timeline");

  /* prefill from the Recovery module scores when the clinician has not overridden them */
  React.useEffect(() => {
    if (!cmsa && shared.cmsa != null) setCmsa(String(shared.cmsa));
    if (fac === "" && shared.fac != null) setFac(String(shared.fac));
    if (mrs === "" && shared.mrs != null) setMrs(String(shared.mrs));
  }, [shared.cmsa, shared.fac, shared.mrs]); // eslint-disable-line react-hooks/exhaustive-deps

  const tC = cmsaTier(cmsa);
  const tF = facTier(fac);
  const tM = mrsTier(mrs);
  const ready = Boolean(tC || tF || tM);

  const activeMilestones = new Set(
    [tC && `cmsa-${tC}`, tF && `fac-${tF}`, tM && `mrs-${tM}`].filter(Boolean) as string[]
  );


  const plan: DayPlan[] = useMemo(() => {
    if (!ready) return [];
    const days = Number(length) || 7;
    const perDay = Number(sessions) || 2;
    const base = Number(dayOfStroke) || 1;
    const start = new Date(startDate + "T00:00:00");

    const pick = (pool: string[], day: number, slot: number, count: number) => {
      if (!pool.length) return [];
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        out.push(pool[(day * 2 + slot * 3 + i) % pool.length]);
      }
      return Array.from(new Set(out));
    };

    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const absoluteDay = base + i;
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const blocks: DayPlan["blocks"] = [];
      const slotNames = ["Morning session", "Afternoon session", "Evening session"];

      for (let slot = 0; slot < perDay; slot++) {
        const items: string[] = [];
        let focus = "";
        if (slot % 2 === 0) {
          focus = tF ? "Mobility, transfers & balance" : "Global care & conditioning";
          if (tF) items.push(...pick(MOBILITY[tF], day, slot, 3));
          if (tM) items.push(...pick(GLOBAL_CARE[tM], day, slot, 1));
        } else {
          focus = tC ? "Upper-limb motor recovery" : "Function & participation";
          if (tC) items.push(...pick(UPPER_LIMB[tC], day, slot, 3));
          if (tM) items.push(...pick(GLOBAL_CARE[tM], day, slot, 1));
        }
        if (!items.length && tM) items.push(...pick(GLOBAL_CARE[tM], day, slot, 3));
        blocks.push({ time: slotNames[slot] ?? `Session ${slot + 1}`, focus, items });
      }

      return {
        day: absoluteDay,
        date: d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" }),
        phase: phaseOf(absoluteDay),
        blocks,
        isReview: day % 7 === 0 || day === 3,
      };
    });
  }, [ready, tC, tF, tM, length, sessions, dayOfStroke, startDate]);

  const completed = plan.filter((p) => progress[p.day]).length;

  /* weekly goals derived from the active tiers */
  const weeks = useMemo(() => {
    if (!plan.length) return [];
    const out: { week: number; days: DayPlan[]; goals: string[] }[] = [];
    for (let i = 0; i < plan.length; i += 7) {
      const days = plan.slice(i, i + 7);
      const goals = [
        tF && `Mobility: ${WEEKLY_MOB[tF]}`,
        tC && `Upper limb: ${WEEKLY_UL[tC]}`,
        tM && `Function & care: ${WEEKLY_GLOBAL[tM]}`,
      ].filter(Boolean) as string[];
      out.push({ week: out.length + 1, days, goals });
    }
    return out;
  }, [plan, tC, tF, tM]);


  const planText = useMemo(() => {
    const head = [
      "STROKE REHABILITATION PLAN",
      `Generated: ${new Date().toLocaleString()}`,
      `Start date: ${startDate} · Day of stroke at start: ${dayOfStroke}`,
      `CMSA: ${cmsa ? CMSA_STAGES.find((c) => c.value === cmsa)?.label : "—"}`,
      `FAC: ${fac !== "" ? FAC_LEVELS.find((f) => f.value === fac)?.label : "—"}`,
      `mRS: ${mrs !== "" ? MRS_LEVELS.find((m) => m.value === mrs)?.label : "—"}`,
      `Tiers: CMSA ${tC ?? "—"} · FAC ${tF ?? "—"} · mRS ${tM ?? "—"}`,
      `Sessions/day: ${sessions} · Plan length: ${length} days`,
      "",
      `Progression rule: ${PROGRESSION_RULE}`,
      "",
    ];
    const body = plan.flatMap((d) => [
      `--- Day ${d.day} (${d.date}) · ${d.phase}${d.isReview ? " · REVIEW POINT" : ""}${progress[d.day] ? " · COMPLETED" : ""}`,
      ...d.blocks.flatMap((b) => [`  ${b.time} — ${b.focus}`, ...b.items.map((x) => `    • ${x}`)]),
      "",
    ]);
    const tail = notes ? ["Progress notes:", notes, ""] : [];
    return [...head, ...body, ...tail, "Individualise dose and precautions to local protocol and medical stability."].join("\n");
  }, [plan, cmsa, fac, mrs, tC, tF, tM, sessions, length, startDate, dayOfStroke, notes, progress]);

  const reset = () => {
    setCmsa(""); setFac(""); setMrs(""); setDayOfStroke("1"); setSessions("2");
    setLength("7"); setProgress({}); setNotes("");
    toast.success("Rehab plan reset");
  };

  return (
    <Card id="rehab-plan-module" className="border-emerald-500/30 bg-card/80 backdrop-blur">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-emerald-500/5 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/15">
                  <Dumbbell className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Rehab Plan Builder — day-by-day schedule</CardTitle>
                  <p className="text-xs text-muted-foreground">Enter progress; get a dated exercise schedule matched to CMSA, FAC and mRS tiers</p>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">CMSA stage (affected arm/leg)</Label>
                <Select value={cmsa} onValueChange={setCmsa}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {CMSA_STAGES.map((o) => <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">FAC level</Label>
                <Select value={fac} onValueChange={setFac}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select FAC" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {FAC_LEVELS.map((o) => <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">mRS</Label>
                <Select value={mrs} onValueChange={setMrs}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select mRS" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {MRS_LEVELS.map((o) => <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Start date</Label>
                <Input className="h-9" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Day since stroke (at start)</Label>
                <Input className="h-9" type="number" min={0} value={dayOfStroke} onChange={(e) => setDayOfStroke(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Sessions per day</Label>
                <Select value={sessions} onValueChange={setSessions}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3"].map((v) => <SelectItem key={v} value={v} className="text-sm">{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Plan length (days)</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["3", "7", "14", "21"].map((v) => <SelectItem key={v} value={v} className="text-sm">{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ready && (
              <div className="flex flex-wrap gap-2">
                {tC && <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 text-[11px]">CMSA tier: {tC}</Badge>}
                {tF && <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[11px]">FAC tier: {tF}</Badge>}
                {tM && <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px]">mRS tier: {tM}</Badge>}
                <Badge variant="secondary" className="text-[11px]">
                  {completed}/{plan.length} days completed
                </Badge>
              </div>
            )}

            {ready && (
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant={view === "timeline" ? "default" : "outline"} className="h-7 gap-1.5 text-[11px]" onClick={() => setView("timeline")}>
                  <GitCommitVertical className="h-3.5 w-3.5" /> Timeline
                </Button>
                <Button size="sm" variant={view === "cards" ? "default" : "outline"} className="h-7 gap-1.5 text-[11px]" onClick={() => setView("cards")}>
                  <LayoutList className="h-3.5 w-3.5" /> Day cards
                </Button>
              </div>
            )}

            <Separator />

            {!ready ? (
              <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border/60 p-4">
                Enter at least one of CMSA stage, FAC level or mRS to generate the day-by-day schedule.
              </p>
            ) : (
              <div className="space-y-3">
                {/* tier milestones rail */}
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
                  <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-2">Tier milestones — where this patient sits</p>
                  <div className="grid gap-1.5 sm:grid-cols-3">
                    {TIER_MILESTONES.map((m) => {
                      const on = activeMilestones.has(m.key);
                      return (
                        <div
                          key={m.key}
                          className={`rounded-md border p-2 ${on ? "border-indigo-500/60 bg-indigo-500/15" : "border-border/50 bg-background/40 opacity-70"}`}
                        >
                          <p className={`text-[11px] font-semibold ${on ? "text-indigo-700 dark:text-indigo-200" : "text-foreground"}`}>{m.label}</p>
                          <p className="text-[10px] leading-snug text-muted-foreground">{m.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {view === "timeline"
                  ? weeks.map((w) => (
                      <div key={w.week} className="rounded-lg border border-border/60 bg-muted/10 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-foreground">Week {w.week}</p>
                          <Badge variant="secondary" className="text-[10px]">
                            {w.days.filter((d) => progress[d.day]).length}/{w.days.length} days done
                          </Badge>
                        </div>
                        {w.goals.length > 0 && (
                          <div className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5" /> Weekly goals
                            </p>
                            <ul className="mt-1 space-y-1">
                              {w.goals.map((g, i) => (
                                <li key={i} className="text-[11px] leading-snug text-muted-foreground">• {g}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-3 relative pl-5 border-l-2 border-emerald-500/30 space-y-3">
                          {w.days.map((d) => (
                            <div key={d.day} className="relative">
                              <span
                                className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 ${
                                  progress[d.day] ? "bg-emerald-500 border-emerald-500" : "bg-background border-emerald-500/50"
                                }`}
                              />
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold text-foreground">Day {d.day} · {d.date}</p>
                                  <p className="text-[10px] text-muted-foreground">{d.phase}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {d.isReview && (
                                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">
                                      <TrendingUp className="h-3 w-3 mr-1" />Review
                                    </Badge>
                                  )}
                                  <label className="flex items-center gap-1.5 text-[10px] text-foreground cursor-pointer">
                                    <Checkbox
                                      checked={!!progress[d.day]}
                                      onCheckedChange={(c) => setProgress((p) => ({ ...p, [d.day]: !!c }))}
                                    />
                                    Done
                                  </label>
                                </div>
                              </div>
                              <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                                {d.blocks.map((b, i) => (
                                  <div key={i} className="rounded-md border border-border/50 bg-background/40 p-2">
                                    <p className="text-[11px] font-semibold text-foreground">{b.time} — {b.focus}</p>
                                    <ul className="mt-1 space-y-1">
                                      {b.items.map((it, j) => (
                                        <li key={j} className="text-[11px] leading-snug text-muted-foreground flex gap-1.5">
                                          <span className="text-emerald-500">•</span><span>{it}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  : plan.map((d) => (
                      <div
                        key={d.day}
                        className={`rounded-lg border p-3 ${
                          progress[d.day] ? "border-emerald-500/50 bg-emerald-500/5" : "border-border/60 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-emerald-500 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-foreground">Day {d.day} · {d.date}</p>
                              <p className="text-[11px] text-muted-foreground">{d.phase}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {d.isReview && (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">
                                <TrendingUp className="h-3 w-3 mr-1" />Review & progress
                              </Badge>
                            )}
                            <label className="flex items-center gap-1.5 text-[11px] text-foreground cursor-pointer">
                              <Checkbox
                                checked={!!progress[d.day]}
                                onCheckedChange={(c) => setProgress((p) => ({ ...p, [d.day]: !!c }))}
                              />
                              Done
                            </label>
                          </div>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {d.blocks.map((b, i) => (
                            <div key={i} className="rounded-md border border-border/50 bg-background/40 p-2">
                              <p className="text-[11px] font-semibold text-foreground">{b.time} — {b.focus}</p>
                              <ul className="mt-1 space-y-1">
                                {b.items.map((it, j) => (
                                  <li key={j} className="text-[11px] leading-snug text-muted-foreground flex gap-1.5">
                                    <span className="text-emerald-500">•</span><span>{it}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}


                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Progression / regression rule</p>
                  <p className="text-[11px] leading-snug text-muted-foreground mt-1">{PROGRESSION_RULE}</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Progress notes (tolerance, Borg, adverse events)</Label>
                  <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Day 3: tolerated 2 × 30 m with rollator, Borg 12, no dizziness." />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(planText);
                      toast.success("Rehab plan copied to clipboard");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy plan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => {
                      const blob = new Blob([planText], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `rehab-plan-${startDate}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <ClipboardList className="h-3.5 w-3.5" /> Download .txt
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={reset}>
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              Schedules are decision support built from CMSA/FAC/mRS tiers (AHA/ASA adult stroke rehabilitation recommendations). Individualise dose, frequency and precautions to the patient's medical status and local protocols.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RehabPlanModule;
