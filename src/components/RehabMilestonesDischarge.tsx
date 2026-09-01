import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, Flag, CheckCircle2, CircleDashed, Home, AlertTriangle } from "lucide-react";
import { useRehabSharedState } from "@/hooks/useRehabSharedState";

interface Milestone {
  key: string;
  label: string;
  target: string;
  met: (s: { fac: number | null; cmsa: number | null; mrs: number | null }) => boolean | null;
}

const MILESTONES: Milestone[] = [
  {
    key: "sitting",
    label: "Independent unsupported sitting",
    target: "FAC ≥ 1 with trunk control; prerequisite for transfers",
    met: (s) => (s.fac === null ? null : s.fac >= 1),
  },
  {
    key: "transfer",
    label: "Assisted transfer bed ↔ chair",
    target: "FAC ≥ 2 (light touch) — enables out-of-bed therapy dose",
    met: (s) => (s.fac === null ? null : s.fac >= 2),
  },
  {
    key: "supervised_gait",
    label: "Supervised ambulation without contact",
    target: "FAC ≥ 3",
    met: (s) => (s.fac === null ? null : s.fac >= 3),
  },
  {
    key: "indep_gait",
    label: "Independent gait on level surfaces",
    target: "FAC ≥ 4 — key home-discharge threshold",
    met: (s) => (s.fac === null ? null : s.fac >= 4),
  },
  {
    key: "arm_out_of_synergy",
    label: "Arm movement out of obligatory synergy",
    target: "CMSA stage ≥ 4",
    met: (s) => (s.cmsa === null ? null : s.cmsa >= 4),
  },
  {
    key: "arm_function",
    label: "Functional hand use in ADLs",
    target: "CMSA stage ≥ 5–6",
    met: (s) => (s.cmsa === null ? null : s.cmsa >= 5),
  },
  {
    key: "independence",
    label: "Functional independence",
    target: "mRS ≤ 2 (slight disability, independent in own affairs)",
    met: (s) => (s.mrs === null ? null : s.mrs <= 2),
  },
];

const RehabMilestonesDischarge: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { state } = useRehabSharedState();
  const s = { fac: state.fac, cmsa: state.cmsa, mrs: state.mrs };

  const results = useMemo(() => MILESTONES.map((m) => ({ ...m, status: m.met(s) })), [s.fac, s.cmsa, s.mrs]);
  const scored = results.filter((r) => r.status !== null);
  const achieved = results.filter((r) => r.status === true).length;
  const pct = scored.length ? Math.round((achieved / results.length) * 100) : 0;

  const dischargeChecks = useMemo(() => {
    const blockers: string[] = [];
    if (state.fac !== null && state.fac < 3) blockers.push("Ambulation still requires hands-on assistance (FAC < 3) — needs caregiver training or inpatient rehab bed.");
    if (state.mrs !== null && state.mrs >= 4) blockers.push("mRS ≥ 4 — cannot attend to bodily needs unaided; 24-hour care or rehabilitation facility required.");
    if (state.dysphagiaSuspected) blockers.push("Dysphagia unresolved — confirm safe diet/IDDSI level and aspiration plan before discharge.");
    if (state.unsafeUnsupportedSitting) blockers.push("Unsafe unsupported sitting — falls risk; supervised environment required.");
    if (state.pusherScreenPositive) blockers.push("Lateropulsion/pusher behaviour — high falls risk, extend supervised rehabilitation.");
    if (state.cognitiveImpairment || state.neglectScreenPositive) blockers.push("Cognitive impairment or neglect — assess capacity, home safety, driving and medication management.");
    if (state.depressionScreenPositive || state.fatigueSignificant) blockers.push("Mood/fatigue burden — arrange psychological review and paced home program.");
    return blockers;
  }, [state]);

  const destination = useMemo(() => {
    if (state.fac === null && state.mrs === null) return { label: "Enter FAC / mRS in the Recovery module", tone: "muted" as const };
    if ((state.mrs ?? 0) >= 4 || (state.fac ?? 5) <= 1) return { label: "Inpatient rehabilitation or 24-h care", tone: "danger" as const };
    if ((state.mrs ?? 0) === 3 || (state.fac ?? 5) <= 3) return { label: "Home with supervision + community therapy", tone: "warn" as const };
    return { label: "Home with outpatient / home exercise program", tone: "ok" as const };
  }, [state.fac, state.mrs]);

  const destClass =
    destination.tone === "danger"
      ? "border-red-500/50 bg-red-500/10"
      : destination.tone === "warn"
      ? "border-amber-500/50 bg-amber-500/10"
      : destination.tone === "ok"
      ? "border-emerald-500/50 bg-emerald-500/10"
      : "border-border/60 bg-muted/20";

  return (
    <Card id="rehab-milestones-discharge" className="border-indigo-500/30 bg-card/80 backdrop-blur">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-indigo-500/5 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/15">
                  <Flag className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Rehab milestones & discharge criteria</CardTitle>
                  <p className="text-xs text-muted-foreground">Live from the Recovery module scores (CMSA, FAC, mRS) and screening flags</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{achieved}/{MILESTONES.length} met</Badge>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>Milestone progress</span><span>{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 text-[10px]">CMSA {state.cmsa ?? "—"}</Badge>
                <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[10px]">FAC {state.fac ?? "—"}</Badge>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]">mRS {state.mrs ?? "—"}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              {results.map((m) => (
                <div
                  key={m.key}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 ${
                    m.status === true ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/60 bg-muted/20"
                  }`}
                >
                  {m.status === true ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-foreground">{m.label}</p>
                    <p className="text-[11px] leading-snug text-muted-foreground">{m.target}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`rounded-lg border p-3 ${destClass}`}>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-foreground" />
                <p className="text-xs font-bold text-foreground">Suggested discharge destination: {destination.label}</p>
              </div>
              {dischargeChecks.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {dischargeChecks.map((b, i) => (
                    <li key={i} className="flex gap-1.5 text-[11px] leading-snug text-foreground/80">
                      <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] leading-snug text-foreground/80 mt-1">
                  No discharge blockers flagged. Confirm home environment, caregiver training, secondary prevention meds and follow-up review before discharge.
                </p>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground">
              Decision support only — milestone thresholds follow AHA/ASA adult stroke rehabilitation guidance. Individualise to the patient's medical status, social support and local pathway.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RehabMilestonesDischarge;
