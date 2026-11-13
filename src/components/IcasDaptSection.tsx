import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Pill, AlertTriangle } from "lucide-react";
import { tabColor } from "@/lib/tabColors";
import MinorStrokeDaptGuidance from "@/components/MinorStrokeDaptGuidance";

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

const quiet = "text-slate-500 dark:text-muted-foreground";

function IcasDurationGuidance() {
  return (
    <div className="space-y-5 text-sm text-slate-800 dark:text-foreground">
      <p className="text-xs leading-relaxed text-slate-500 dark:text-muted-foreground">
        Eligibility, trial figures, and the 30-day ticagrelor schedule for minor noncardioembolic stroke or TIA are on the Minor stroke / TIA tab.
      </p>
      <p className="rounded-md border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/30 dark:bg-violet-500/10">
        Short-term DAPT for minor non-cardioembolic stroke or high-risk TIA is generally <strong>21 days</strong>, whereas
        severe symptomatic intracranial atherosclerotic stenosis (sICAS, 70–99%) generally warrants <strong>90 days</strong> of
        aspirin plus clopidogrel.
      </p>

      <section className="space-y-2">
        <h4 className="font-semibold">1. Trial comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="border-b border-slate-200 dark:border-border text-left">
              <th className="p-1.5">Trial</th><th className="p-1.5">Regimen</th><th className="p-1.5">Duration</th><th className="p-1.5">Population</th>
            </tr></thead>
            <tbody>{TRIALS.map((r) => (
              <tr key={r[0]} className="border-b border-slate-200/80 dark:border-border/50">{r.map((c, i) => <td key={i} className={`p-1.5 ${i === 0 ? "font-semibold" : ""}`}>{c}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
        <p className={quiet}>POINT used 90 days of DAPT, but pooled CHANCE/POINT analyses showed most ischemic benefit occurred in the first 21 days while bleeding risk continued — so 21 days is generally preferred for routine minor stroke/high-risk TIA.</p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold">2. Intracranial stenosis: which DAPT duration?</h4>
        <div className="space-y-1.5">{SCENARIOS.map(([s, a]) => (
          <div key={s} className="rounded-md border border-slate-200 p-2 dark:border-border sm:flex sm:gap-3">
            <div className={`sm:w-1/2 ${quiet}`}>{s}</div>
            <div className="sm:w-1/2 font-medium">{a}</div>
          </div>
        ))}</div>
        <p className={quiet}>AAN practice advisory: aspirin 325 mg/day with clopidogrel 75 mg/day for up to 90 days in severe symptomatic ICAS, provided hemorrhagic transformation risk is low.</p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold">3. Practical timeline (day 0 → 90)</h4>
        {TIMELINE.map((t) => (
          <div key={t.label} className="space-y-1">
            <div className="text-xs break-words">{t.label}</div>
            <div className="h-3 w-full rounded bg-slate-200 dark:bg-muted"><div className={`h-3 rounded ${t.cls}`} style={{ width: `${(t.days / 90) * 100}%` }} /></div>
          </div>
        ))}
        <div className={`flex justify-between text-[10px] tabular-nums ${quiet}`}><span>Day 0</span><span>21</span><span>90</span></div>
      </section>

      <section className="space-y-1">
        <h4 className="font-semibold">4. Additional trial evidence</h4>
        <p><strong>INSPIRES:</strong> mild ischemic stroke or high-risk TIA of presumed atherosclerotic origin — aspirin + clopidogrel started within 72 h for 21 days, then clopidogrel alone to day 90.</p>
        <p><strong>CHANCE-2:</strong> CYP2C19 loss-of-function carriers — aspirin + ticagrelor for 21 days then ticagrelor to day 90 reduced recurrent stroke vs clopidogrel-based strategy, with more overall bleeding.</p>
      </section>

      <section className="space-y-1">
        <h4 className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />5. Key clinical caveats</h4>
        <ul className="list-disc pl-5 space-y-1">{CAVEATS.map((c) => <li key={c}>{c}</li>)}</ul>
      </section>

      <p className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-border dark:bg-muted/50">
        <strong>Bottom line:</strong> symptomatic 70–99% ICAS → 90 days aspirin + clopidogrel, then single antiplatelet. Routine minor stroke/high-risk TIA → 21 days. THALES supports 30 days aspirin + ticagrelor in selected patients.
      </p>
    </div>
  );
}

export default function IcasDaptSection({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm dark:border-violet-500/30 dark:bg-card/80 dark:text-card-foreground">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer min-h-[44px]">
            <CardTitle className="text-base font-semibold leading-snug sm:text-base">
              <span className="flex items-start gap-2 min-w-0">
                <Pill className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>DAPT</span>
                    <Badge variant="outline" className="border-slate-300 font-normal text-slate-600 dark:border-border dark:text-muted-foreground">
                      Minor stroke · TIA · ICAS
                    </Badge>
                  </span>
                  {!open && (
                    <span className="block text-xs font-normal leading-relaxed text-slate-500 dark:text-muted-foreground">
                      Dual antiplatelet therapy after minor stroke or TIA, and duration in intracranial atherosclerosis.
                    </span>
                  )}
                </span>
                <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform dark:text-muted-foreground ${open ? "rotate-180" : ""}`} />
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Tabs defaultValue="minor" className="w-full">
              <TabsList aria-label="DAPT topics" className="flex h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
                <TabsTrigger value="minor" className={`min-h-11 flex-1 whitespace-normal px-2 text-center text-xs leading-tight sm:text-sm ${tabColor("teal")}`}>
                  Minor stroke / TIA
                </TabsTrigger>
                <TabsTrigger value="icas" className={`min-h-11 flex-1 whitespace-normal px-2 text-center text-xs leading-tight sm:text-sm ${tabColor("violet")}`}>
                  Intracranial atherosclerosis
                </TabsTrigger>
              </TabsList>
              <TabsContent value="minor" className="mt-4">
                <MinorStrokeDaptGuidance />
              </TabsContent>
              <TabsContent value="icas" className="mt-4">
                <IcasDurationGuidance />
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
