import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, Clock, AlertTriangle, ShieldAlert, Droplet, TrendingUp } from "lucide-react";

export type UFHRegimenId =
  | "heparin-infusion"
  | "heparin-low-intensity"
  | "heparin-procedural"
  | "heparin-bolus"
  | "ufh-prophylactic-sc";

export interface UFHRiskFactors {
  priorHeparin14d: boolean;      // ↑ HIT risk (immune sensitisation)
  postSurgical: boolean;         // ↑ HIT risk (type II ~1–3%)
  baselineAPTTProlonged: boolean;// LA+ / factor deficiency → use anti-Xa
  htRisk: boolean;               // post-EVT / large infarct — target lower
  obesity: boolean;              // BMI >40 or wt >120 kg
  renalImpairment: boolean;      // CrCl <30 — still preferred agent
  pregnancy: boolean;
  activeBleeding: boolean;
}

interface RegimenSpec {
  id: UFHRegimenId;
  label: string;
  targetAPTT: string;
  targetAntiXa: string;
  firstCheckHours: number;
  reCheckAfterChange: number;
  steadyStateFreq: string;
  bolusText?: string;
}

const REGIMENS: Record<UFHRegimenId, RegimenSpec> = {
  "heparin-infusion": {
    id: "heparin-infusion",
    label: "Therapeutic infusion (18 U/kg/h)",
    targetAPTT: "60–100 s (1.5–2.5× control)",
    targetAntiXa: "0.3–0.7 IU/mL",
    firstCheckHours: 6,
    reCheckAfterChange: 6,
    steadyStateFreq: "q6h until 2 consecutive therapeutic → q24h",
    bolusText: "80 U/kg IV bolus (cap 10,000 U)",
  },
  "heparin-low-intensity": {
    id: "heparin-low-intensity",
    label: "Low-intensity infusion (10 U/kg/h, no bolus)",
    targetAPTT: "45–60 s",
    targetAntiXa: "0.1–0.3 IU/mL",
    firstCheckHours: 6,
    reCheckAfterChange: 6,
    steadyStateFreq: "q6h × 24 h → q12h until stable → q24h",
    bolusText: "No bolus — post-EVT / HT risk",
  },
  "heparin-procedural": {
    id: "heparin-procedural",
    label: "Procedural bolus (EVT, 70 U/kg)",
    targetAPTT: "n/a — use ACT intra-procedural",
    targetAntiXa: "n/a — ACT 250–300 s",
    firstCheckHours: 0,
    reCheckAfterChange: 0,
    steadyStateFreq: "ACT every 30 min intra-procedure; aPTT at end of case",
    bolusText: "70 U/kg IV bolus at sheath insertion",
  },
  "heparin-bolus": {
    id: "heparin-bolus",
    label: "Therapeutic bolus (80 U/kg)",
    targetAPTT: "60–100 s",
    targetAntiXa: "0.3–0.7 IU/mL",
    firstCheckHours: 6,
    reCheckAfterChange: 6,
    steadyStateFreq: "q6h → q24h once therapeutic ×2",
    bolusText: "80 U/kg IV bolus (cap 10,000 U)",
  },
  "ufh-prophylactic-sc": {
    id: "ufh-prophylactic-sc",
    label: "Prophylactic SC (5,000 U q8–12h)",
    targetAPTT: "Not monitored (subtherapeutic)",
    targetAntiXa: "Not required",
    firstCheckHours: 0,
    reCheckAfterChange: 0,
    steadyStateFreq: "Platelets baseline + q2–3 d × 14 d (HIT)",
    bolusText: "No bolus",
  },
};

interface TimelineEvent {
  time: string;
  hourOffset: number;
  kind: "aptt" | "antiXa" | "platelets" | "hgb" | "act" | "neuro" | "escalate";
  label: string;
  detail: string;
}

function buildTimeline(spec: RegimenSpec, risk: UFHRiskFactors): TimelineEvent[] {
  const ev: TimelineEvent[] = [];
  const useAntiXa =
    risk.baselineAPTTProlonged || risk.obesity || risk.renalImpairment;
  const monitorLabel = useAntiXa ? "Anti-Xa" : "aPTT";
  const monitorKind: "aptt" | "antiXa" = useAntiXa ? "antiXa" : "aptt";
  const target = useAntiXa ? spec.targetAntiXa : spec.targetAPTT;

  // Baseline (T = 0)
  ev.push({
    time: "T = 0 h",
    hourOffset: 0,
    kind: "platelets",
    label: "Baseline labs",
    detail: `Baseline ${monitorLabel}, platelets, Hb/Hct, PT/INR, creatinine${useAntiXa ? " (using anti-Xa — see risk factors)" : ""}.`,
  });

  if (spec.bolusText && spec.id !== "ufh-prophylactic-sc") {
    ev.push({
      time: "T = 0 h",
      hourOffset: 0,
      kind: "escalate",
      label: "Loading / bolus",
      detail: spec.bolusText,
    });
  }

  if (spec.id === "heparin-procedural") {
    ev.push({
      time: "Intra-procedure",
      hourOffset: 0.5,
      kind: "act",
      label: "ACT every 30 min",
      detail: "Target ACT 250–300 s. Additional 25 U/kg bolus if below target.",
    });
    ev.push({
      time: "End of case",
      hourOffset: 2,
      kind: "aptt",
      label: "Post-procedure aPTT",
      detail: "If continuing infusion, transition to Raschke nomogram schedule.",
    });
  }

  if (spec.firstCheckHours > 0) {
    ev.push({
      time: `T = ${spec.firstCheckHours} h`,
      hourOffset: spec.firstCheckHours,
      kind: monitorKind,
      label: `First ${monitorLabel} check`,
      detail: `Target ${target}. Adjust per Raschke weight-based nomogram; re-check ${spec.reCheckAfterChange} h after any rate change.`,
    });
    ev.push({
      time: "T = 12 h",
      hourOffset: 12,
      kind: monitorKind,
      label: `${monitorLabel} q6h phase`,
      detail: `Continue q6h ${monitorLabel} until 2 consecutive therapeutic values.`,
    });
    ev.push({
      time: "T = 24 h",
      hourOffset: 24,
      kind: "platelets",
      label: "Day 1 platelets + Hb",
      detail: "Baseline HIT surveillance. Repeat CBC daily × 5 d then q2–3 d to day 14.",
    });
    ev.push({
      time: "T = 24 h",
      hourOffset: 24,
      kind: "neuro",
      label: "Neuro check + CT if change",
      detail: "GCS/NIHSS q4h × 24 h then q shift. Any deterioration → hold infusion, urgent non-contrast CT.",
    });
    ev.push({
      time: "T = 48 h",
      hourOffset: 48,
      kind: monitorKind,
      label: `Transition to q24h ${monitorLabel}`,
      detail: "Only after 2 consecutive therapeutic values on stable rate.",
    });
  }

  // HIT window — always relevant
  ev.push({
    time: "Day 4–14",
    hourOffset: 96,
    kind: "platelets",
    label: "HIT surveillance window",
    detail:
      (risk.priorHeparin14d
        ? "PRIOR heparin exposure <100 d — rapid-onset HIT can occur <24 h. Send HIT ELISA + SRA at any platelet drop or new thrombus. "
        : "") +
      "Calculate 4T score if platelets fall >50% from baseline, absolute <150 K, or new thrombosis. 4T ≥4 → stop heparin, start argatroban/bivalirudin, send HIT antibody.",
  });

  if (risk.htRisk) {
    ev.push({
      time: "T = 6 h",
      hourOffset: 6,
      kind: "escalate",
      label: "Hemorrhagic transformation guard",
      detail: "Consider lower target (aPTT 45–60 s). Repeat CT at 24 h and for any NIHSS ↑ ≥2.",
    });
  }
  if (risk.obesity) {
    ev.push({
      time: "T = 0 h",
      hourOffset: 0,
      kind: "escalate",
      label: "Obesity dosing",
      detail: "Dose on ACTUAL body weight. Cap bolus 10,000 U and initial infusion 2,000 U/h. Prefer anti-Xa monitoring.",
    });
  }
  if (risk.pregnancy) {
    ev.push({
      time: "T = 0 h",
      hourOffset: 0,
      kind: "escalate",
      label: "Pregnancy",
      detail: "UFH does NOT cross placenta — agent of choice. Monitor anti-Xa; higher doses often required in 2nd/3rd trimester.",
    });
  }
  if (risk.activeBleeding) {
    ev.push({
      time: "IMMEDIATE",
      hourOffset: -1,
      kind: "escalate",
      label: "Active bleeding → reverse",
      detail: "STOP infusion. Protamine 1 mg per 100 U heparin given in prior 2–3 h (max 50 mg, slow IV over 10 min). Type & screen, transfuse as needed.",
    });
  }

  return ev.sort((a, b) => a.hourOffset - b.hourOffset);
}

const KIND_META: Record<TimelineEvent["kind"], { color: string; icon: React.ReactNode; label: string }> = {
  aptt: { color: "bg-cyan-500/20 text-cyan-200 border-cyan-400/40", icon: <Activity className="h-3 w-3" />, label: "aPTT" },
  antiXa: { color: "bg-indigo-500/20 text-indigo-200 border-indigo-400/40", icon: <Activity className="h-3 w-3" />, label: "Anti-Xa" },
  platelets: { color: "bg-rose-500/20 text-rose-200 border-rose-400/40", icon: <Droplet className="h-3 w-3" />, label: "Platelets/HIT" },
  hgb: { color: "bg-red-500/20 text-red-200 border-red-400/40", icon: <Droplet className="h-3 w-3" />, label: "Hb/Hct" },
  act: { color: "bg-amber-500/20 text-amber-200 border-amber-400/40", icon: <Clock className="h-3 w-3" />, label: "ACT" },
  neuro: { color: "bg-purple-500/20 text-purple-200 border-purple-400/40", icon: <TrendingUp className="h-3 w-3" />, label: "Neuro" },
  escalate: { color: "bg-orange-500/20 text-orange-200 border-orange-400/40", icon: <ShieldAlert className="h-3 w-3" />, label: "Action" },
};

interface Props {
  initialRegimen?: UFHRegimenId;
}

const UFHMonitoringTimeline: React.FC<Props> = ({ initialRegimen = "heparin-infusion" }) => {
  const [regimen, setRegimen] = useState<UFHRegimenId>(initialRegimen);
  const [risk, setRisk] = useState<UFHRiskFactors>({
    priorHeparin14d: false,
    postSurgical: false,
    baselineAPTTProlonged: false,
    htRisk: false,
    obesity: false,
    renalImpairment: false,
    pregnancy: false,
    activeBleeding: false,
  });

  const spec = REGIMENS[regimen];
  const timeline = useMemo(() => buildTimeline(spec, risk), [spec, risk]);
  const useAntiXa = risk.baselineAPTTProlonged || risk.obesity || risk.renalImpairment;

  const hitRiskTier = risk.priorHeparin14d || risk.postSurgical ? "HIGH" : "STANDARD";

  const RISK_OPTS: { key: keyof UFHRiskFactors; label: string; hint: string }[] = [
    { key: "priorHeparin14d", label: "Prior heparin <100 d", hint: "Rapid-onset HIT possible <24 h" },
    { key: "postSurgical", label: "Post-surgical (cardiac/ortho)", hint: "HIT incidence 1–3%" },
    { key: "baselineAPTTProlonged", label: "Baseline aPTT prolonged / LA+", hint: "Switch to anti-Xa monitoring" },
    { key: "htRisk", label: "Hemorrhagic transformation risk", hint: "Lower target, more frequent neuro checks" },
    { key: "obesity", label: "Obesity (BMI >40 or >120 kg)", hint: "Actual weight, cap bolus, anti-Xa" },
    { key: "renalImpairment", label: "CrCl <30 mL/min", hint: "UFH preferred; use anti-Xa" },
    { key: "pregnancy", label: "Pregnancy", hint: "Agent of choice; higher doses needed" },
    { key: "activeBleeding", label: "Active bleeding", hint: "STOP + protamine reversal" },
  ];

  return (
    <Card className="border-cyan-500/40 bg-slate-950/70">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30">
            <Activity className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <CardTitle className="text-base text-white">Auto-generated UFH Monitoring Timeline</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              aPTT / anti-Xa cadence, HIT platelet schedule, and escalation logic — tailored to regimen & risk factors.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Regimen selector */}
        <div>
          <Label className="text-slate-200 text-xs uppercase tracking-wide">Selected regimen</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {(Object.values(REGIMENS) as RegimenSpec[]).map((r) => (
              <button
                key={r.id}
                onClick={() => setRegimen(r.id)}
                className={`text-left rounded-md border px-3 py-2 text-xs transition ${
                  regimen === r.id
                    ? "bg-cyan-600/25 border-cyan-400/60 text-cyan-100"
                    : "bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <p className="font-semibold">{r.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Target: {r.targetAPTT}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Risk factors */}
        <div className="rounded-md border border-slate-700 bg-slate-900/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-300 font-semibold mb-2">Patient risk factors</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RISK_OPTS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-start gap-2 rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs cursor-pointer hover:bg-slate-800/60"
              >
                <Checkbox
                  checked={risk[opt.key]}
                  onCheckedChange={(v) =>
                    setRisk((p) => ({ ...p, [opt.key]: v === true }))
                  }
                  className="mt-0.5"
                />
                <span>
                  <span className="text-slate-100 font-medium">{opt.label}</span>
                  <span className="block text-[10px] text-slate-400">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-cyan-600/25 text-cyan-100 border border-cyan-400/40">
            Monitor: {useAntiXa ? "Anti-Xa (0.3–0.7 IU/mL)" : "aPTT"}
          </Badge>
          <Badge className="bg-slate-700/60 text-slate-100 border border-slate-500/40">
            Target: {useAntiXa ? spec.targetAntiXa : spec.targetAPTT}
          </Badge>
          <Badge
            className={
              hitRiskTier === "HIGH"
                ? "bg-rose-600/30 text-rose-100 border border-rose-400/50"
                : "bg-emerald-600/25 text-emerald-100 border border-emerald-400/40"
            }
          >
            HIT risk: {hitRiskTier}
          </Badge>
          <Badge className="bg-slate-700/60 text-slate-100 border border-slate-500/40">
            Steady state: {spec.steadyStateFreq}
          </Badge>
        </div>

        {/* Timeline */}
        <div className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-300 font-semibold mb-3">Timeline</p>
          <ol className="relative border-l border-cyan-500/30 ml-2 space-y-3">
            {timeline.map((e, i) => {
              const meta = KIND_META[e.kind];
              return (
                <li key={i} className="ml-4">
                  <span className="absolute -left-[7px] flex h-3 w-3 items-center justify-center rounded-full bg-cyan-400 border border-cyan-200" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-cyan-200">{e.time}</span>
                    <Badge className={`${meta.color} text-[10px] gap-1`}>
                      {meta.icon} {meta.label}
                    </Badge>
                    <span className="text-xs text-slate-100 font-medium">{e.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{e.detail}</p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Escalation ladder */}
        <div className="rounded-md border border-orange-500/40 bg-orange-950/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-orange-300" />
            <p className="text-xs uppercase tracking-wide text-orange-200 font-semibold">Escalation ladder</p>
          </div>
          <ol className="text-[11px] text-slate-200 space-y-1 list-decimal list-inside">
            <li>
              <b>Sub-therapeutic</b> (aPTT &lt;35 s): re-bolus 80 U/kg + ↑ infusion 4 U/kg/h → re-check in 6 h.
            </li>
            <li>
              <b>Mildly low</b> (aPTT 35–45 s): 40 U/kg bolus + ↑ 2 U/kg/h → re-check in 6 h.
            </li>
            <li>
              <b>Therapeutic</b> (46–70 s or anti-Xa 0.3–0.7): no change → next check per schedule.
            </li>
            <li>
              <b>Supra-therapeutic</b> (71–90 s): ↓ infusion 2 U/kg/h → re-check in 6 h.
            </li>
            <li>
              <b>Critical high</b> (&gt;90 s): hold 1 h, then ↓ 3 U/kg/h + re-check in 6 h.
            </li>
            <li>
              <b>Bleeding or platelets ↓&gt;50% or thrombus</b>: STOP heparin, send HIT ELISA, start
              argatroban / bivalirudin, reverse with protamine (1 mg per 100 U in prior 2–3 h; max 50 mg).
            </li>
            <li>
              <b>Heparin resistance</b> (&gt;35,000 U/day not therapeutic): switch to anti-Xa monitoring;
              check antithrombin level; consider ATIII concentrate or alternative anticoagulant.
            </li>
          </ol>
        </div>

        <p className="text-[10px] text-slate-500 italic flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          Auto-generated from ACCP 2022 / AHA-ASA 2022 / ASH 2018 HIT guidelines. Bedside aid only — verify against institutional heparin protocol.
        </p>
      </CardContent>
    </Card>
  );
};

export default UFHMonitoringTimeline;
