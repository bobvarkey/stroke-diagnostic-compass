import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Pill, AlertTriangle } from "lucide-react";

const TRIALS = [
  ["CHANCE", "Aspirin + clopidogrel", "21 days DAPT, then clopidogrel to day 90", "Minor stroke NIHSS ≤3 or high-risk TIA"],
  ["POINT", "Aspirin + clopidogrel", "90 days", "Minor stroke NIHSS ≤3 or high-risk TIA"],
  ["THALES", "Aspirin + ticagrelor", "30 days", "Mild–moderate stroke NIHSS ≤5 or high-risk TIA"],
  ["SAMMPRIS", "Aspirin + clopidogrel", "90 days", "Symptomatic severe ICAS 70–99%"],
];

const SCENARIOS = [
  ["Minor stroke/TIA, no significant symptomatic stenosis", "Aspirin + clopidogrel 21 days"],
  ["Symptomatic intracranial stenosis 50–69%", "Usually 21 days if eligible for minor-stroke/high-risk-TIA DAPT; individualize"],
  ["Symptomatic intracranial stenosis 70–99%", "Aspirin + clopidogrel up to 90 days"],
  ["Mild–moderate stroke NIHSS ≤5 or high-risk TIA, selected for ticagrelor", "Aspirin + ticagrelor 30 days"],
  ["Severe ICAS after 90 days", "Single antiplatelet therapy unless another indication exists"],
];

const TIMELINE = [
  { label: "CHANCE / usual minor stroke — DAPT 21 days, then single antiplatelet", days: 21, cls: "bg-teal-500" },
  { label: "THALES — aspirin + ticagrelor 30 days", days: 30, cls: "bg-amber-500" },
  { label: "SAMMPRIS / severe symptomatic ICAS — aspirin + clopidogrel 90 days", days: 90, cls: "bg-rose-500" },
];

const CAVEATS = [
  "The 90-day ICAS regimen applies to recent stroke/TIA attributable to severe intracranial atherosclerotic stenosis, not incidental stenosis.",
  "The evidence for 90 days is strongest for aspirin plus clopidogrel, not aspirin plus ticagrelor.",
  "Continuing DAPT beyond 90 days is not routinely recommended because of bleeding risk.",
  "If the patient has atrial fibrillation requiring anticoagulation, these DAPT pathways cannot automatically be applied. Combining anticoagulation and antiplatelets increases bleeding risk.",
  "After IV thrombolysis, antiplatelet initiation generally requires follow-up imaging at 24 hours; post-thrombectomy treatment must account for infarct size, hemorrhage and any intracranial stent.",
];

export default function IcasDaptSection() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-violet-500/30">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer min-h-[44px]">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-5 w-5 text-violet-500" />
              DAPT in Intracranial Atherosclerosis
              <Badge variant="outline" className="ml-auto">21 vs 30 vs 90 days</Badge>
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-5 text-sm">
            <p className="rounded-md border border-violet-500/30 bg-violet-500/10 p-3">
              Short-term DAPT for minor non-cardioembolic stroke or high-risk TIA is generally <strong>21 days</strong>, whereas
              severe symptomatic intracranial atherosclerotic stenosis (sICAS, 70–99%) generally warrants <strong>90 days</strong> of
              aspirin plus clopidogrel.
            </p>

            <section className="space-y-2">
              <h4 className="font-semibold">1. Trial comparison</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead><tr className="border-b border-border text-left">
                    <th className="p-1.5">Trial</th><th className="p-1.5">Regimen</th><th className="p-1.5">Duration</th><th className="p-1.5">Population</th>
                  </tr></thead>
                  <tbody>{TRIALS.map((r) => (
                    <tr key={r[0]} className="border-b border-border/50">{r.map((c, i) => <td key={i} className={`p-1.5 ${i === 0 ? "font-semibold" : ""}`}>{c}</td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
              <p className="text-muted-foreground">POINT used 90 days of DAPT, but pooled CHANCE/POINT analyses showed most ischemic benefit occurred in the first 21 days while bleeding risk continued — so 21 days is generally preferred for routine minor stroke/high-risk TIA.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">2. Intracranial stenosis: which DAPT duration?</h4>
              <div className="space-y-1.5">{SCENARIOS.map(([s, a]) => (
                <div key={s} className="rounded-md border border-border p-2 sm:flex sm:gap-3">
                  <div className="sm:w-1/2 text-muted-foreground">{s}</div>
                  <div className="sm:w-1/2 font-medium">{a}</div>
                </div>
              ))}</div>
              <p className="text-muted-foreground">AAN practice advisory: aspirin 325 mg/day with clopidogrel 75 mg/day for up to 90 days in severe symptomatic ICAS, provided hemorrhagic transformation risk is low.</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">3. Practical timeline (day 0 → 90)</h4>
              {TIMELINE.map((t) => (
                <div key={t.label} className="space-y-1">
                  <div className="text-xs">{t.label}</div>
                  <div className="h-3 w-full rounded bg-muted"><div className={`h-3 rounded ${t.cls}`} style={{ width: `${(t.days / 90) * 100}%` }} /></div>
                </div>
              ))}
              <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums"><span>Day 0</span><span>21</span><span>90</span></div>
            </section>

            <section className="space-y-1">
              <h4 className="font-semibold">4. Additional trial evidence</h4>
              <p><strong>INSPIRES:</strong> mild ischemic stroke or high-risk TIA of presumed atherosclerotic origin — aspirin + clopidogrel started within 72 h for 21 days, then clopidogrel alone to day 90.</p>
              <p><strong>CHANCE-2:</strong> CYP2C19 loss-of-function carriers — aspirin + ticagrelor for 21 days then ticagrelor to day 90 reduced recurrent stroke vs clopidogrel-based strategy, with more overall bleeding.</p>
            </section>

            <section className="space-y-1">
              <h4 className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-500" />5. Key clinical caveats</h4>
              <ul className="list-disc pl-5 space-y-1">{CAVEATS.map((c) => <li key={c}>{c}</li>)}</ul>
            </section>

            <p className="rounded-md border border-border bg-muted/50 p-3">
              <strong>Bottom line:</strong> symptomatic 70–99% ICAS → 90 days aspirin + clopidogrel, then single antiplatelet. Routine minor stroke/high-risk TIA → 21 days. THALES supports 30 days aspirin + ticagrelor in selected patients.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
