import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight, Pill, CalendarCheck, Clock, ChevronDown, Repeat,
  AlertTriangle, ExternalLink, Ban,
} from "lucide-react";

type Agent = "clopidogrel" | "ticagrelor" | "prasugrel";
type Setting = "acute" | "chronic";

const AGENT_META: Record<Agent, {
  name: string; drugName: string; short: string; color: string; ring: string; text: string;
}> = {
  clopidogrel: {
    name: "Clopidogrel", drugName: "Clopidogrel", short: "CLOPI",
    color: "from-purple-600 to-violet-500",
    ring: "border-purple-500/60", text: "text-purple-200",
  },
  ticagrelor: {
    name: "Ticagrelor", drugName: "Ticagrelor", short: "TICA",
    color: "from-cyan-600 to-teal-500",
    ring: "border-cyan-500/60", text: "text-cyan-200",
  },
  prasugrel: {
    name: "Prasugrel", drugName: "Prasugrel", short: "PRAS",
    color: "from-rose-600 to-pink-500",
    ring: "border-rose-500/60", text: "text-rose-200",
  },
};

interface Recommendation {
  loadingDose: string;
  maintenance: string;
  timing: string;
  gradient: string;
  icon: React.ReactNode;
  warnings?: string[];
  contra?: string;
}

/** P2Y12 switching matrix — ESC 2020 NSTE-ACS + Angiolillo Circulation 2017 consensus. */
function getRecommendation(from: Agent, to: Agent, setting: Setting): Recommendation | null {
  if (from === to) return null;
  const key = `${from}->${to}:${setting}` as const;

  const map: Record<string, Recommendation> = {
    // ── ACUTE (escalation to more potent agent — LD regardless of prior timing) ──
    "clopidogrel->ticagrelor:acute": {
      loadingDose: "Ticagrelor 180 mg PO ×1",
      maintenance: "Ticagrelor 90 mg PO BID",
      timing: "Give IMMEDIATELY — irrespective of prior clopidogrel timing or last dose.",
      gradient: "from-blue-700 via-cyan-600 to-teal-500",
      icon: <CalendarCheck className="h-5 w-5" />,
    },
    "clopidogrel->prasugrel:acute": {
      loadingDose: "Prasugrel 60 mg PO ×1",
      maintenance: "Prasugrel 10 mg PO daily (5 mg if ≥75 y or <60 kg)",
      timing: "Give IMMEDIATELY — irrespective of prior clopidogrel timing. PCI-treated ACS only.",
      gradient: "from-rose-600 via-pink-500 to-fuchsia-500",
      icon: <CalendarCheck className="h-5 w-5" />,
      contra: "Prior stroke/TIA → prasugrel CONTRAINDICATED. Use ticagrelor instead.",
    },
    "ticagrelor->clopidogrel:acute": {
      loadingDose: "Clopidogrel 600 mg PO ×1",
      maintenance: "Clopidogrel 75 mg PO daily",
      timing: "Administer 24 h AFTER the last ticagrelor dose.",
      gradient: "from-orange-500 via-rose-500 to-pink-600",
      icon: <Clock className="h-5 w-5" />,
      warnings: ["De-escalation only if bleeding, non-adherence, cost, or dyspnoea intolerance."],
    },
    "ticagrelor->prasugrel:acute": {
      loadingDose: "Prasugrel 60 mg PO ×1",
      maintenance: "Prasugrel 10 mg PO daily (5 mg if ≥75 y or <60 kg)",
      timing: "Administer 24 h AFTER the last ticagrelor dose.",
      gradient: "from-fuchsia-600 via-rose-500 to-orange-500",
      icon: <Clock className="h-5 w-5" />,
      contra: "Prior stroke/TIA → prasugrel CONTRAINDICATED.",
    },
    "prasugrel->ticagrelor:acute": {
      loadingDose: "Ticagrelor 180 mg PO ×1",
      maintenance: "Ticagrelor 90 mg PO BID",
      timing: "Give 24 h after last prasugrel dose (acute rescue may give immediately if bleeding low).",
      gradient: "from-blue-700 via-cyan-600 to-teal-500",
      icon: <CalendarCheck className="h-5 w-5" />,
    },
    "prasugrel->clopidogrel:acute": {
      loadingDose: "Clopidogrel 600 mg PO ×1",
      maintenance: "Clopidogrel 75 mg PO daily",
      timing: "Administer 24 h AFTER last prasugrel dose. De-escalation (TROPICAL-ACS).",
      gradient: "from-orange-500 via-rose-500 to-pink-600",
      icon: <Clock className="h-5 w-5" />,
      warnings: ["Consider platelet-function or CYP2C19-guided de-escalation (TROPICAL-ACS / POPular Genetics)."],
    },

    // ── CHRONIC (>30 d post-ACS) — no LD for escalation; LD only for de-escalation to clopidogrel ──
    "clopidogrel->ticagrelor:chronic": {
      loadingDose: "NO loading dose",
      maintenance: "Ticagrelor 90 mg PO BID",
      timing: "Start 24 h after last clopidogrel dose.",
      gradient: "from-blue-700 via-cyan-600 to-teal-500",
      icon: <CalendarCheck className="h-5 w-5" />,
    },
    "clopidogrel->prasugrel:chronic": {
      loadingDose: "NO loading dose",
      maintenance: "Prasugrel 10 mg PO daily (5 mg if ≥75 y or <60 kg)",
      timing: "Start 24 h after last clopidogrel dose.",
      gradient: "from-rose-600 via-pink-500 to-fuchsia-500",
      icon: <CalendarCheck className="h-5 w-5" />,
      contra: "Prior stroke/TIA → prasugrel CONTRAINDICATED.",
    },
    "ticagrelor->clopidogrel:chronic": {
      loadingDose: "Clopidogrel 600 mg PO ×1 (LD required — de-escalation)",
      maintenance: "Clopidogrel 75 mg PO daily",
      timing: "LD 24 h after last ticagrelor dose, then 75 mg daily.",
      gradient: "from-orange-500 via-rose-500 to-pink-600",
      icon: <Clock className="h-5 w-5" />,
      warnings: ["Chronic tica→clopi de-escalation REQUIRES 600 mg LD to overcome reversible P2Y12 blockade offset."],
    },
    "ticagrelor->prasugrel:chronic": {
      loadingDose: "NO loading dose",
      maintenance: "Prasugrel 10 mg PO daily (5 mg if ≥75 y or <60 kg)",
      timing: "Start 24 h after last ticagrelor dose.",
      gradient: "from-fuchsia-600 via-rose-500 to-orange-500",
      icon: <Clock className="h-5 w-5" />,
      contra: "Prior stroke/TIA → prasugrel CONTRAINDICATED.",
    },
    "prasugrel->ticagrelor:chronic": {
      loadingDose: "NO loading dose",
      maintenance: "Ticagrelor 90 mg PO BID",
      timing: "Start 24 h after last prasugrel dose.",
      gradient: "from-blue-700 via-cyan-600 to-teal-500",
      icon: <CalendarCheck className="h-5 w-5" />,
    },
    "prasugrel->clopidogrel:chronic": {
      loadingDose: "Clopidogrel 600 mg PO ×1 (LD required — de-escalation)",
      maintenance: "Clopidogrel 75 mg PO daily",
      timing: "LD 24 h after last prasugrel dose. Guided de-escalation preferred.",
      gradient: "from-orange-500 via-rose-500 to-pink-600",
      icon: <Clock className="h-5 w-5" />,
      warnings: ["Consider TROPICAL-ACS platelet-function or CYP2C19 genotype-guided de-escalation."],
    },
  };

  return map[key] ?? null;
}

interface Props {
  onSelectDrug?: (drugName: string) => void;
}

const AntiplateletSwitchingGuide: React.FC<Props> = ({ onSelectDrug }) => {
  const [from, setFrom] = useState<Agent>("clopidogrel");
  const [to, setTo] = useState<Agent>("ticagrelor");
  const [setting, setSetting] = useState<Setting>("acute");

  const rec = useMemo(() => getRecommendation(from, to, setting), [from, to, setting]);
  const fromMeta = AGENT_META[from];
  const toMeta = AGENT_META[to];

  return (
    <Card
      id="antiplatelet-switching"
      className="border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-4 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30">
          <Repeat className="h-5 w-5 text-cyan-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-base sm:text-lg">
            P2Y12 Antiplatelet Switching Tool
          </h3>
          <p className="text-xs text-slate-400">
            Clopidogrel ⇄ Ticagrelor ⇄ Prasugrel · Acute &amp; Chronic transitions with timing logic
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-700 mb-4">
        <div>
          <Label className="text-xs text-slate-300">Current P2Y12</Label>
          <Select value={from} onValueChange={(v) => setFrom(v as Agent)}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-9 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clopidogrel">Clopidogrel</SelectItem>
              <SelectItem value="ticagrelor">Ticagrelor</SelectItem>
              <SelectItem value="prasugrel">Prasugrel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-300">Switch to</Label>
          <Select value={to} onValueChange={(v) => setTo(v as Agent)}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-9 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clopidogrel" disabled={from === "clopidogrel"}>Clopidogrel</SelectItem>
              <SelectItem value="ticagrelor" disabled={from === "ticagrelor"}>Ticagrelor</SelectItem>
              <SelectItem value="prasugrel" disabled={from === "prasugrel"}>Prasugrel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-300">Setting</Label>
          <Select value={setting} onValueChange={(v) => setSetting(v as Setting)}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-9 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acute">Acute (≤30 d post-ACS / index event)</SelectItem>
              <SelectItem value="chronic">Chronic (&gt;30 d)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Infographic */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-3 items-stretch">
        {/* From */}
        <AgentCard meta={fromMeta} label="CURRENT" />

        {/* Arrow / recommendation */}
        <div className="flex flex-col gap-2 justify-center">
          {rec ? (
            <div className={`relative rounded-2xl p-4 text-white shadow-lg bg-gradient-to-r ${rec.gradient}`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-9 w-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                  {rec.icon}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider opacity-90">
                    {fromMeta.name} → {toMeta.name} · {setting === "acute" ? "Acute" : "Chronic"}
                  </p>
                  <p className="font-bold text-base sm:text-lg leading-tight">{rec.loadingDose}</p>
                  <p className="text-xs opacity-95"><strong>Timing:</strong> {rec.timing}</p>
                  <p className="text-xs opacity-95"><strong>Maintenance:</strong> {rec.maintenance}</p>
                </div>
                <ArrowRight className="h-6 w-6 shrink-0 mt-1" />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-700 text-center text-slate-400 text-sm">
              Select a different target agent.
            </div>
          )}

          <div className="self-center px-4 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-[11px] font-bold tracking-widest text-indigo-900 dark:text-indigo-200">
            {setting === "acute" ? "ACUTE SETTING" : "CHRONIC / MAINTENANCE"}
          </div>

          {rec?.contra && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/15 p-2.5 flex items-start gap-2">
              <Ban className="h-4 w-4 text-red-300 shrink-0 mt-0.5" />
              <p className="text-xs text-red-100"><strong>Contraindication:</strong> {rec.contra}</p>
            </div>
          )}
          {rec?.warnings?.map((w, i) => (
            <div key={i} className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-100">{w}</p>
            </div>
          ))}

          {/* Link to calculator / drug details */}
          {onSelectDrug && rec && (
            <Button
              size="sm"
              onClick={() => onSelectDrug(toMeta.drugName)}
              className="self-center mt-1 h-8 bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              View {toMeta.name} details in formulary
            </Button>
          )}
        </div>

        {/* To */}
        <AgentCard meta={toMeta} label="TARGET" />
      </div>

      {/* Chronic monotherapy de-escalation */}
      <Collapsible className="mt-4">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 hover:bg-slate-800/70 transition">
            <span className="text-sm font-medium text-slate-200">
              Chronic monotherapy de-escalation (DAPT → SAPT) &amp; clinical notes
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform data-[state=open]:rotate-180" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3 text-sm">
          <div className="rounded-md border border-cyan-500/30 bg-cyan-500/5 p-3">
            <p className="text-xs uppercase tracking-wide font-semibold text-cyan-300 mb-2">
              DAPT → Monotherapy timing (post-ACS / post-PCI)
            </p>
            <ul className="list-disc list-inside text-slate-200 text-xs space-y-1.5">
              <li><strong>1–3 mo DAPT then drop aspirin</strong> → continue <em>ticagrelor 90 mg BID</em> monotherapy (TWILIGHT, TICO, T-PASS). High-bleed / low-ischaemic risk.</li>
              <li><strong>1–3 mo DAPT then drop aspirin</strong> → continue <em>clopidogrel 75 mg daily</em> monotherapy (STOPDAPT-2, SMART-CHOICE). Standard-risk PCI.</li>
              <li><strong>Ticagrelor → Clopidogrel monotherapy at 1 mo</strong>: TALOS-AMI de-escalation — clopi 75 mg daily <em>without</em> a new LD (post-ACS, event-free ≥1 mo).</li>
              <li><strong>12 mo DAPT then SAPT</strong>: default = aspirin 75–100 mg (or clopi 75 mg if aspirin-intolerant / PAD — CAPRIE, HOST-EXAM: clopi &gt; ASA long-term).</li>
              <li><strong>Post-stroke DAPT (CHANCE/POINT):</strong> ASA + clopi ×21 d → clopi 75 mg monotherapy through day 90 → then long-term SAPT (ASA or clopi).</li>
            </ul>
          </div>

          <div className="rounded-md border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-200 mb-2">
              Half-life / offset (governs washout intervals)
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-purple-500/10 border border-purple-500/30 p-2">
                <p className="font-semibold text-purple-200">Clopidogrel</p>
                <p className="text-slate-300">Irreversible · offset 5–7 d · hold 5 d pre-CABG</p>
              </div>
              <div className="rounded bg-cyan-500/10 border border-cyan-500/30 p-2">
                <p className="font-semibold text-cyan-200">Ticagrelor</p>
                <p className="text-slate-300">Reversible · offset 3–5 d · hold 3–5 d pre-CABG</p>
              </div>
              <div className="rounded bg-rose-500/10 border border-rose-500/30 p-2">
                <p className="font-semibold text-rose-200">Prasugrel</p>
                <p className="text-slate-300">Irreversible · offset 7–10 d · hold 7 d pre-CABG</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs uppercase tracking-wide font-semibold text-amber-300 mb-1">Key rules</p>
            <ul className="list-disc list-inside text-amber-100 text-xs space-y-1">
              <li>Never co-administer two P2Y12 inhibitors — always separate by 24 h.</li>
              <li>Escalation (weaker → stronger) in the <em>acute</em> setting: give LD immediately regardless of prior drug timing.</li>
              <li>De-escalation (stronger → weaker) at any time: 24 h gap + LD (600 mg clopi) to overcome residual reversible inhibition and offset.</li>
              <li>Prasugrel: contraindicated in prior stroke/TIA; caution ≥75 y or &lt;60 kg (use 5 mg maintenance).</li>
              <li>Cangrelor bridge: NEVER give oral clopi/prasugrel while infusing (blocks binding); ticagrelor may overlap.</li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            References: 2020 ESC NSTE-ACS Guidelines · Angiolillo DJ et al. Circulation 2017;136:1955–1975 · TROPICAL-ACS · TALOS-AMI · TWILIGHT · STOPDAPT-2 · HOST-EXAM · CHANCE / POINT / THALES.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const AgentCard: React.FC<{ meta: typeof AGENT_META[Agent]; label: string }> = ({ meta, label }) => (
  <div className={`rounded-2xl border-2 ${meta.ring} bg-white/95 dark:bg-slate-900 p-4 flex flex-col items-center justify-center text-center shadow-lg`}>
    <Badge variant="outline" className="text-[10px] mb-2 border-slate-400/40 text-slate-500 dark:text-slate-400">
      {label}
    </Badge>
    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center mb-2 shadow-inner`}>
      <Pill className="h-6 w-6 text-white" />
    </div>
    <p className="text-lg font-extrabold tracking-wide text-slate-900 dark:text-white">
      {meta.name.toUpperCase()}
    </p>
  </div>
);

export default AntiplateletSwitchingGuide;
