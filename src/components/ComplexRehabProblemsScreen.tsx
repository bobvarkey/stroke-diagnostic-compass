import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ChevronDown, Puzzle, ShieldCheck } from "lucide-react";
import { useRehabSharedState } from "@/hooks/useRehabSharedState";

type Severity = "critical" | "high" | "moderate";

interface Alert {
  id: string;
  severity: Severity;
  message: string;
}

const SEV_STYLE: Record<Severity, string> = {
  critical: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300",
  high: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  moderate: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const FAC_OPTS = [
  { v: "0", l: "FAC 0 — non-functional, cannot walk or needs ≥2 helpers" },
  { v: "1", l: "FAC 1 — needs continuous manual support for weight & balance" },
  { v: "2", l: "FAC 2 — needs intermittent/light manual contact for balance" },
  { v: "3", l: "FAC 3 — needs verbal supervision, no physical contact" },
  { v: "4", l: "FAC 4 — independent on level surfaces only" },
  { v: "5", l: "FAC 5 — independent everywhere, including stairs & slopes" },
];

const ComplexRehabProblemsScreen: React.FC = () => {
  const { state, update } = useRehabSharedState();
  const [open, setOpen] = useState(false);

  // pusher clinical features
  const [leans, setLeans] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [resists, setResists] = useState(false);

  const pusherPositive = leans && pushing && resists;

  React.useEffect(() => {
    if (state.pusherScreenPositive !== pusherPositive) update({ pusherScreenPositive: pusherPositive });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pusherPositive]);

  const alerts = useMemo<Alert[]>(() => {
    const a: Alert[] = [];
    if (pusherPositive) {
      a.push({
        id: "pusher_syndrome_screen",
        severity: "high",
        message:
          "Clinical pattern is compatible with lateropulsion/contraversive pushing. Complete BLS or SCP assessment, assess neglect and verticality perception, use enhanced falls precautions, and initiate therapist-led midline/vertical-feedback rehabilitation.",
      });
    }
    if (pusherPositive && ((state.fac !== null && state.fac <= 2) || state.unsafeUnsupportedSitting)) {
      a.push({
        id: "lateropulsion_safety_risk",
        severity: "critical",
        message:
          "Lateropulsion with unsafe sitting or dependent ambulation: do not permit unsupervised transfers, standing, or walking. Document required assistance level and falls-prevention plan.",
      });
    }
    if (state.neglectScreenPositive) {
      a.push({
        id: "neglect_rehabilitation_risk",
        severity: "high",
        message:
          "Spatial neglect affects transfer, gait, and upper-limb rehabilitation safety. Use structured scanning/environmental strategies and obtain occupational-therapy assessment.",
      });
    }
    if (state.apraxiaScreenPositive) {
      a.push({
        id: "apraxia_rehabilitation_risk",
        severity: "moderate",
        message:
          "Apraxia can impair learning, dressing, transfer sequencing, and use of walking aids despite adequate strength. Use demonstration, simplified single-step cues, repetition, and occupational-therapy involvement.",
      });
    }
    if (state.shoulderPain || state.shoulderSubluxation) {
      a.push({
        id: "shoulder_pain_review",
        severity: "moderate",
        message:
          "Hemiplegic shoulder problem identified. Avoid traction during transfers, review handling and positioning, assess passive range and subluxation, and arrange rehabilitation/specialist review.",
      });
    }
    if (state.dysphagiaSuspected) {
      a.push({
        id: "dysphagia_safety",
        severity: "critical",
        message:
          "Possible dysphagia: maintain appropriate aspiration precautions and follow local swallow-screening/speech-language-therapy pathway before unsafe oral intake.",
      });
    }
    if (state.fatigueSignificant || state.depressionScreenPositive) {
      a.push({
        id: "mood_and_fatigue",
        severity: "moderate",
        message:
          "Fatigue and/or mood symptoms may substantially limit rehabilitation participation. Screen for reversible contributors, use paced therapy planning, and arrange psychological/medical review as indicated.",
      });
    }
    return a;
  }, [pusherPositive, state]);

  const criticalCount = alerts.filter((x) => x.severity === "critical").length;

  const Check: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }> = ({
    checked, onChange, label, hint,
  }) => (
    <label
      className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 ${
        checked ? "border-orange-500/50 bg-orange-500/10" : "border-border/60 bg-muted/20"
      }`}
    >
      <Checkbox className="mt-0.5" checked={checked} onCheckedChange={(c) => onChange(!!c)} />
      <span>
        <span className="block text-xs font-semibold text-foreground">{label}</span>
        {hint && <span className="block text-[11px] leading-snug text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );

  return (
    <Card id="complex-rehab-problems" className="border-orange-500/30 bg-card/80 backdrop-blur">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer rounded-t-lg transition-colors hover:bg-orange-500/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-orange-500/15 p-2">
                  <Puzzle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Complex rehabilitation problems & gate</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Lateropulsion, neglect, apraxia, shoulder, dysphagia, fatigue & mood
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {criticalCount > 0 && (
                  <Badge className="bg-red-500/20 text-[10px] text-red-700 dark:text-red-300">{criticalCount} critical</Badge>
                )}
                {alerts.length > 0 && (
                  <Badge className="bg-orange-500/20 text-[10px] text-orange-700 dark:text-orange-300">{alerts.length} alerts</Badge>
                )}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-bold text-foreground">Lateropulsion / pusher syndrome — clinical features</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Check checked={leans} onChange={setLeans} label="Leans or falls to one side" />
                <Check checked={pushing} onChange={setPushing} label="Active pushing with non-paretic limbs" />
                <Check checked={resists} onChange={setResists} label="Resists passive correction to midline" />
              </div>
              {pusherPositive && (
                <Badge className="mt-2 bg-orange-500/20 text-[10px] text-orange-700 dark:text-orange-300">
                  Pusher screen positive (all 3 features)
                </Badge>
              )}
            </div>

            <Separator />

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground">Functional Ambulation Category</Label>
                <Select
                  value={state.fac === null ? "" : String(state.fac)}
                  onValueChange={(v) => update({ fac: Number(v) })}
                >
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select FAC level" /></SelectTrigger>
                  <SelectContent>
                    {FAC_OPTS.map((o) => <SelectItem key={o.v} value={o.v} className="text-sm">{o.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Check
                checked={state.unsafeUnsupportedSitting}
                onChange={(v) => update({ unsafeUnsupportedSitting: v })}
                label="Unsafe unsupported sitting (TIS observation)"
              />
              <Check
                checked={state.neglectScreenPositive}
                onChange={(v) => update({ neglectScreenPositive: v })}
                label="Unilateral spatial neglect screen positive"
                hint="Cancellation, line bisection, personal neglect on grooming"
              />
              <Check
                checked={state.apraxiaScreenPositive}
                onChange={(v) => update({ apraxiaScreenPositive: v })}
                label="Motor apraxia screen positive"
                hint="Cannot sequence familiar tasks despite adequate strength"
              />
              <Check
                checked={state.shoulderPain}
                onChange={(v) => update({ shoulderPain: v })}
                label="Hemiplegic shoulder pain present"
              />
              <Check
                checked={state.shoulderSubluxation}
                onChange={(v) => update({ shoulderSubluxation: v })}
                label="Shoulder subluxation suspected"
                hint="Palpable sulcus, flaccid arm, pain on passive elevation"
              />
              <Check
                checked={state.dysphagiaSuspected}
                onChange={(v) => update({ dysphagiaSuspected: v })}
                label="Dysphagia suspected"
                hint="Auto-set by the Recovery swallow module"
              />
              <Check
                checked={state.fatigueSignificant}
                onChange={(v) => update({ fatigueSignificant: v })}
                label="Clinically significant post-stroke fatigue"
              />
              <Check
                checked={state.depressionScreenPositive}
                onChange={(v) => update({ depressionScreenPositive: v })}
                label="Depression / apathy screen positive"
                hint="PHQ-9 ≥10 or persistent low motivation"
              />
            </div>

            <Separator />

            {alerts.length === 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
                <p className="text-[11px] leading-snug text-emerald-700 dark:text-emerald-300">
                  No complex rehabilitation problems flagged — proceed with the standard rehab plan.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className={`rounded-lg border p-3 ${SEV_STYLE[a.severity]}`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wide">{a.severity}</p>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-foreground/85">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ComplexRehabProblemsScreen;
