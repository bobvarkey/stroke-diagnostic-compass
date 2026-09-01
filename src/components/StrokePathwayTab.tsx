import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity, AlertTriangle, ArrowRight, ChevronDown, GitBranch, ShieldCheck, Stethoscope,
} from "lucide-react";
import RehabPlanModule from "@/components/RehabPlanModule";
import ComplexRehabProblemsScreen from "@/components/ComplexRehabProblemsScreen";
import RehabProgressTracker from "@/components/RehabProgressTracker";

const RED_FLAGS: { key: string; label: string; action: string }[] = [
  { key: "worsening_motor", label: "New or worsening motor deficit", action: "Hold mobilisation. Urgent NIHSS, repeat imaging, notify stroke team." },
  { key: "reduced_gcs", label: "Reduced consciousness / new drowsiness", action: "Hold therapy. Urgent GCS, glucose, CT to exclude oedema, haemorrhage or hydrocephalus." },
  { key: "pupil", label: "New pupillary asymmetry", action: "Emergency — suspect herniation. Neurosurgical/neurocritical escalation now." },
  { key: "dysphagia", label: "New dysphagia or weak cough", action: "NBM, SLT referral, upright positioning, aspiration precautions before any exercise." },
  { key: "head_drop", label: "New head drop / cannot hold head upright", action: "Head/neck support, defer unsupported sitting, reassess brainstem and neuromuscular causes." },
  { key: "seizure", label: "New seizure", action: "Stop therapy, airway protection, seizure management protocol, re-image." },
  { key: "bp_instability", label: "BP instability / orthostatic symptoms on standing", action: "Graded tilt/standing protocol, monitor BP supine→sit→stand, review antihypertensives." },
  { key: "severe_headache", label: "Severe headache or vomiting", action: "Suspect raised ICP or haemorrhagic transformation — urgent imaging before mobilising." },
];

const STAGES = [
  { key: "hyperacute", label: "Hyperacute (0–24 h)", detail: "Reperfusion decisions, BP/glucose targets, neuro-observation. Rehab role: positioning, swallow screen, avoid early high-dose out-of-bed mobilisation (<24 h)." },
  { key: "acute", label: "Acute ward (24 h – 7 days)", detail: "Stability confirmed → start graded mobilisation, trunk control, transfers, and multidisciplinary goal setting." },
  { key: "subacute", label: "Subacute (week 2–12)", detail: "Highest neuroplastic yield. High-repetition task-specific training, gait retraining, ADL retraining." },
  { key: "chronic", label: "Chronic (>3 months)", detail: "Maintenance conditioning, community reintegration, secondary prevention adherence." },
];

interface Props {
  onGoToRecovery?: () => void;
}

const StrokePathwayTab: React.FC<Props> = ({ onGoToRecovery }) => {
  const [openFlags, setOpenFlags] = useState(false);
  const [openStages, setOpenStages] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [stage, setStage] = useState("acute");
  const [mobilisationCleared, setMobilisationCleared] = useState(false);
  const [swallowCleared, setSwallowCleared] = useState(false);

  const active = RED_FLAGS.filter((f) => flags[f.key]);
  const emergency = active.some((f) => ["pupil", "reduced_gcs", "seizure", "worsening_motor"].includes(f.key));

  const gate = useMemo(() => {
    if (emergency) {
      return {
        tone: "danger" as const,
        title: "STOP — neurological escalation before any rehab",
        text: "Active high-priority red flag. Rehabilitation is deferred until urgent medical/neurosurgical review and repeat imaging are complete.",
      };
    }
    if (active.length) {
      return {
        tone: "warn" as const,
        title: "Modified rehab only — precautions active",
        text: "Non-emergency red flags present. Restrict to bed-level positioning, respiratory care and supported sitting; document precautions before progressing.",
      };
    }
    if (!mobilisationCleared || !swallowCleared) {
      return {
        tone: "warn" as const,
        title: "Clearance incomplete",
        text: "Confirm medical clearance for mobilisation and a completed swallow screen before starting the structured rehab plan.",
      };
    }
    return {
      tone: "ok" as const,
      title: "Cleared — proceed to structured rehab plan",
      text: "No active red flags and clearances documented. Complete the Recovery motor assessment (NIHSS motor, CMSA, TIS, FAC, mRS), then build the day-by-day plan below.",
    };
  }, [emergency, active.length, mobilisationCleared, swallowCleared]);

  const toneClass =
    gate.tone === "danger"
      ? "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
      : gate.tone === "warn"
      ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

  return (
    <div className="space-y-6">
      {/* Pathway overview */}
      <Card id="stroke-pathway-overview" className="border-indigo-500/30 bg-card/80 backdrop-blur">
        <Collapsible open={openStages} onOpenChange={setOpenStages}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-indigo-500/5 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/15">
                    <GitBranch className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">Stroke Pathway — acute to rehabilitation</CardTitle>
                    <p className="text-xs text-muted-foreground">Red flags → decision alerts → motor assessment → structured rehab plan</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openStages ? "rotate-180" : ""}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                {["Red flags", "Decision alerts", "Motor assessment", "Rehab plan"].map((x, i) => (
                  <React.Fragment key={x}>
                    <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-indigo-700 dark:text-indigo-300">{x}</span>
                    {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Current pathway stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((st) => <SelectItem key={st.key} value={st.key} className="text-sm">{st.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {STAGES.map((st) => (
                  <div
                    key={st.key}
                    className={`rounded-lg border p-3 ${stage === st.key ? "border-indigo-500/60 bg-indigo-500/10" : "border-border/60 bg-muted/20"}`}
                  >
                    <p className="text-xs font-bold text-foreground">{st.label}</p>
                    <p className="text-[11px] leading-snug text-muted-foreground mt-1">{st.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Red flags + gate */}
      <Card id="pathway-red-flags" className="border-red-500/30 bg-card/80 backdrop-blur">
        <Collapsible open={openFlags} onOpenChange={setOpenFlags}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-red-500/5 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-500/15">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">Acute neurological red flags & rehab gate</CardTitle>
                    <p className="text-xs text-muted-foreground">Screen before every therapy session; each flag maps to an action</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {active.length > 0 && (
                    <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 text-[10px]">{active.length} active</Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFlags ? "rotate-180" : ""}`} />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {RED_FLAGS.map((f) => (
                  <label
                    key={f.key}
                    className={`flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer ${
                      flags[f.key] ? "border-red-500/50 bg-red-500/10" : "border-border/60 bg-muted/20"
                    }`}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={!!flags[f.key]}
                      onCheckedChange={(c) => setFlags((p) => ({ ...p, [f.key]: !!c }))}
                    />
                    <span>
                      <span className="block text-xs font-semibold text-foreground">{f.label}</span>
                      {flags[f.key] && (
                        <span className="block text-[11px] leading-snug text-red-700 dark:text-red-300 mt-1">{f.action}</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>

              <Separator />

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 cursor-pointer">
                  <Checkbox checked={mobilisationCleared} onCheckedChange={(c) => setMobilisationCleared(!!c)} />
                  <span className="text-xs font-semibold text-foreground">Medical clearance for mobilisation documented</span>
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 cursor-pointer">
                  <Checkbox checked={swallowCleared} onCheckedChange={(c) => setSwallowCleared(!!c)} />
                  <span className="text-xs font-semibold text-foreground">Swallow screen completed before oral intake</span>
                </label>
              </div>

              <div className={`rounded-lg border p-3 ${toneClass}`}>
                <div className="flex items-center gap-2">
                  {gate.tone === "ok" ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <p className="text-xs font-bold">{gate.title}</p>
                </div>
                <p className="text-[11px] leading-snug mt-1 text-foreground/80">{gate.text}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => {
                      onGoToRecovery?.();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <Activity className="h-3.5 w-3.5" /> Open Recovery motor assessment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => document.getElementById("rehab-plan-module")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >
                    <Stethoscope className="h-3.5 w-3.5" /> Jump to rehab plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Structured rehab plan */}
      <RehabPlanModule />
    </div>
  );
};

export default StrokePathwayTab;
