import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  HeartPulse,
  Brain,
  Zap,
  Wind,
  FlaskConical,
  Flame,
  Droplet,
  GitBranch,
  Scale,
  Activity,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import shsFigure from "@/assets/stroke-heart-syndrome-cascade.jpeg.asset.json";

type Pathway = {
  n: number;
  title: string;
  icon: LucideIcon;
  tint: string;
  bullets: string[];
};

/* Class strings are written out in full so the Tailwind scanner keeps them. */
const PATHWAYS: Pathway[] = [
  {
    n: 1,
    title: "Sympathetic Activation",
    icon: Zap,
    tint: "border-orange-500/40 bg-orange-500/10",
    bullets: [
      "Norepinephrine spillover",
      "β-adrenergic overstimulation",
      "Increased heart rate",
      "Vasoconstriction",
      "Afterload and wall stress ↑",
    ],
  },
  {
    n: 2,
    title: "Parasympathetic Withdrawal",
    icon: Wind,
    tint: "border-amber-500/40 bg-amber-500/10",
    bullets: ["Reduced vagal tone", "Reduced HRV", "Loss of cardioprotection", "Proarrhythmic tendency ↑"],
  },
  {
    n: 3,
    title: "Neuroendocrine Stress Response",
    icon: FlaskConical,
    tint: "border-lime-500/40 bg-lime-500/10",
    bullets: ["HPA axis activation", "↑ Cortisol", "RAAS activation", "ADH release", "Fluid retention", "Metabolic stress"],
  },
  {
    n: 4,
    title: "Inflammatory Signaling",
    icon: Flame,
    tint: "border-purple-500/40 bg-purple-500/10",
    bullets: [
      "NF-κB / NLRP3 inflammasome activation",
      "ZBP1-NLRP3 signalling",
      "Cytokine release (IL-1β, IL-6, TNF-α)",
      "Systemic inflammation",
    ],
  },
  {
    n: 5,
    title: "Endothelial Injury",
    icon: Droplet,
    tint: "border-sky-500/40 bg-sky-500/10",
    bullets: ["Endothelial activation", "Increased permeability", "Upregulation of adhesion molecules", "Reduced nitric oxide"],
  },
  {
    n: 6,
    title: "Microvascular Dysfunction",
    icon: GitBranch,
    tint: "border-cyan-500/40 bg-cyan-500/10",
    bullets: ["Microvascular constriction", "Impaired perfusion", "No-reflow phenomenon", "Microthrombosis"],
  },
  {
    n: 7,
    title: "Oxygen Supply-Demand Mismatch",
    icon: Scale,
    tint: "border-teal-500/40 bg-teal-500/10",
    bullets: ["Increased myocardial oxygen demand", "Reduced oxygen supply", "Supply-demand ischaemia (type 2 MI)"],
  },
];

const MANIFESTATIONS: Pathway[] = [
  {
    n: 1,
    title: "Troponin Elevation",
    icon: Droplet,
    tint: "border-rose-500/40 bg-rose-500/10",
    bullets: ["Myocardial injury"],
  },
  {
    n: 2,
    title: "ECG Abnormalities",
    icon: Activity,
    tint: "border-pink-500/40 bg-pink-500/10",
    bullets: ["ST-segment changes", "T-wave inversion", "QTc prolongation"],
  },
  {
    n: 3,
    title: "Arrhythmias",
    icon: Activity,
    tint: "border-red-500/40 bg-red-500/10",
    bullets: ["Atrial fibrillation", "Bradyarrhythmias", "Ventricular arrhythmias", "Conduction blocks"],
  },
  {
    n: 4,
    title: "Left Ventricular Dysfunction",
    icon: HeartPulse,
    tint: "border-fuchsia-500/40 bg-fuchsia-500/10",
    bullets: ["Reduced LVEF", "Regional wall motion abnormalities"],
  },
  {
    n: 5,
    title: "Takotsubo-like Cardiomyopathy",
    icon: HeartPulse,
    tint: "border-violet-500/40 bg-violet-500/10",
    bullets: ["Apical ballooning", "Transient LV dysfunction", "Often reversible"],
  },
  {
    n: 6,
    title: "Heart Failure",
    icon: Activity,
    tint: "border-rose-500/40 bg-rose-500/10",
    bullets: ["Pulmonary congestion", "Elevated filling pressures", "Low cardiac output"],
  },
  {
    n: 7,
    title: "Mortality",
    icon: Activity,
    tint: "border-slate-500/40 bg-slate-500/10",
    bullets: ["Cardiovascular death", "Multi-organ failure"],
  },
];

const KEY_REGIONS = [
  "Insular cortex (particularly right insula)",
  "Anterior cingulate cortex",
  "Amygdala",
  "Hypothalamus",
  "Brainstem autonomic nuclei",
];

const OUTPUTS = ["Sympathetic activation", "Parasympathetic withdrawal", "Neuroendocrine overdrive", "Inflammatory activation"];

const STROKE_TRIGGERS = ["Acute Ischaemic Stroke", "Intracerebral Haemorrhage", "Subarachnoid Haemorrhage"];

export default function StrokeHeartSyndromeSection() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-rose-500/30 bg-card/80 backdrop-blur">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer min-h-[44px]">
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="h-5 w-5 shrink-0 text-rose-500" />
              <span className="min-w-0">Stroke-Heart Syndrome (SHS)</span>
              <Badge variant="outline" className="ml-auto shrink-0">
                Mechanistic cascade
              </Badge>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3">
              <p className="font-semibold">Definition</p>
              <p>
                <strong>Stroke-heart syndrome</strong> is the cardiac injury that follows acute brain injury:
                disruption of central autonomic, neuroendocrine and immune signalling converges on{" "}
                <strong>myocardial injury, electrical instability and structural dysfunction</strong> — independent of
                primary coronary plaque rupture.
              </p>
            </div>

            <figure className="space-y-2">
              <a href={shsFigure.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={shsFigure.url}
                  alt="Mechanistic cascade from acute stroke to cardiac manifestations: stroke types disrupt the central autonomic network, seven mechanistic pathways converge on myocardial injury, electrical instability and structural dysfunction, producing troponin elevation, ECG abnormalities, arrhythmias, left ventricular dysfunction, Takotsubo-like cardiomyopathy, heart failure and death."
                  className="w-full rounded-md border border-border"
                  loading="lazy"
                />
              </a>
              <figcaption className="text-xs text-muted-foreground">
                Figure 1 — Mechanistic cascade from acute stroke to cardiac manifestations. Tap the image to open it
                full size.
              </figcaption>
            </figure>

            {/* Tier 1: triggers */}
            <div>
              <p className="font-semibold mb-1">Triggers</p>
              <div className="flex flex-wrap gap-2">
                {STROKE_TRIGGERS.map((s) => (
                  <span key={s} className="rounded-md border border-blue-500/40 bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Tier 2: central autonomic network */}
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2">
              <p className="flex items-center gap-2 font-semibold">
                <Brain className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Central autonomic network disruption
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Key brain regions
                  </p>
                  <ul className="mt-1 list-disc pl-5 space-y-0.5">
                    {KEY_REGIONS.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Outputs affected
                  </p>
                  <ul className="mt-1 list-disc pl-5 space-y-0.5">
                    {OUTPUTS.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Tier 3: seven pathways */}
            <div>
              <p className="font-semibold mb-2">Mechanistic pathways</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PATHWAYS.map((p) => (
                  <div key={p.n} className={`rounded-md border p-2.5 ${p.tint}`}>
                    <p className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[11px] font-bold tabular-nums">
                        {p.n}
                      </span>
                      <p.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 text-xs leading-tight">{p.title}</span>
                    </p>
                    <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-xs">
                      {p.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Convergence */}
            <div className="rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
              Convergence — myocardial injury, electrical instability and structural dysfunction
            </div>

            {/* Tier 4: manifestations */}
            <div>
              <p className="font-semibold mb-2">Cardiac manifestations &amp; adverse outcomes</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {MANIFESTATIONS.map((m) => (
                  <div key={m.title} className={`rounded-md border p-2.5 ${m.tint}`}>
                    <p className="flex items-center gap-1.5 font-semibold text-foreground">
                      <m.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 text-xs leading-tight">{m.title}</span>
                    </p>
                    <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-xs">
                      {m.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Bedside checklist — added for this app, not part of the figure */}
            <div className="rounded-md border border-foreground/15 bg-muted/40 p-3 space-y-2">
              <p className="flex items-center gap-2 font-semibold">
                <Stethoscope className="h-4 w-4 shrink-0 text-rose-500" />
                Bedside screening (added for this app)
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>
                  <strong>Baseline 12-lead ECG + continuous telemetry</strong> for the first 24-72 h; watch QTc,
                  ST/T changes and new atrial fibrillation.
                </li>
                <li>
                  <strong>Serial troponin</strong> (0 / 3-6 h). A rise without a coronary pattern is usually
                  supply-demand (type 2) injury, not plaque rupture — do not reflexively trigger an ACS pathway.
                </li>
                <li>
                  <strong>Echocardiography</strong> if troponin rises, new murmur, hypotension or pulmonary
                  oedema: look for reduced LVEF, regional wall-motion abnormalities and apical ballooning.
                </li>
                <li>
                  <strong>Insular / right-hemispheric, large-volume, ICH and SAH</strong> patients carry the
                  highest autonomic risk — monitor longer and involve cardiology early.
                </li>
                <li>
                  <strong>Exclude competing causes</strong> before labelling SHS: type 1 MI / ACS, pulmonary
                  embolism, sepsis, hypoxia, anaemia, and pre-existing cardiomyopathy.
                </li>
                <li>
                  <strong>Re-check at discharge</strong>: persistent LV dysfunction, new heart failure or
                  arrhythmia needs follow-up imaging and rhythm surveillance.
                </li>
              </ul>
              <p className="text-[11px] text-muted-foreground">
                Abbreviations: ADH — antidiuretic hormone; ECG — electrocardiogram; HPA — hypothalamic-pituitary-adrenal;
                HRV — heart-rate variability; IL — interleukin; LVEF — left ventricular ejection fraction; NF-κB —
                nuclear factor-κB; NLRP3 — NOD-like receptor protein 3; RAAS — renin-angiotensin-aldosterone system;
                SHS — stroke-heart syndrome; TNF-α — tumour necrosis factor-α; ZBP1 — Z-DNA-binding protein 1.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
