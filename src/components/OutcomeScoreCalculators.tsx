import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Activity, Gauge, Droplets } from "lucide-react";
import { publishSich, readJSON, SICH_KEY, type SichSnapshot } from "@/lib/strokePlan";

type Opt = { pts: number; l: string };
function Item({ q, opts, value, onChange }: { q: string; opts: Opt[]; value: number | null; onChange: (i: number) => void }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <p className="text-sm font-semibold mb-2">{q}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o, i) => (
          <Button key={o.l} size="sm" variant={value === i ? "default" : "outline"} className="min-h-[44px]" onClick={() => onChange(i)}>
            {o.l} <span className="ml-1 opacity-70">({o.pts})</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function Shell({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-2 border-primary/20">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">{icon}{title}<ChevronDown className={`h-4 w-4 ml-auto transition-transform ${open ? "rotate-180" : ""}`} /></CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent><CardContent className="space-y-3">{children}</CardContent></CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function useScore(items: Opt[][]) {
  const [sel, setSel] = useState<(number | null)[]>(items.map(() => null));
  const done = sel.every((s) => s !== null);
  const total = sel.reduce<number>((a, s, i) => a + (s === null ? 0 : items[i][s].pts), 0);
  const set = (i: number) => (v: number) => setSel((p) => p.map((x, j) => (j === i ? v : x)));
  return { sel, set, done, total, reset: () => setSel(items.map(() => null)) };
}
const YN = (pts: number): Opt[] => [{ pts: 0, l: "No" }, { pts, l: "Yes" }];

/* ---------------- THRIVE ---------------- */
const THRIVE: { q: string; o: Opt[] }[] = [
  { q: "Age", o: [{ pts: 0, l: "≤59" }, { pts: 1, l: "60–79" }, { pts: 2, l: "≥80" }] },
  { q: "NIHSS", o: [{ pts: 0, l: "≤10" }, { pts: 2, l: "11–20" }, { pts: 4, l: "≥21" }] },
  { q: "Hypertension", o: YN(1) },
  { q: "Diabetes mellitus", o: YN(1) },
  { q: "Atrial fibrillation", o: YN(1) },
];
export function thriveBand(s: number) {
  if (s <= 2) return { band: "Low (0–2)", good: "~65%", death: "~6%", tone: "border-emerald-500/50 bg-emerald-500/10" };
  if (s <= 5) return { band: "Moderate (3–5)", good: "~42%", death: "~18%", tone: "border-amber-500/50 bg-amber-500/10" };
  return { band: "High (6–9)", good: "~11%", death: "~43%", tone: "border-red-500/50 bg-red-500/10" };
}
export function ThriveScoreCalculator() {
  const s = useScore(THRIVE.map((t) => t.o));
  const b = thriveBand(s.total);
  return (
    <Shell title="THRIVE Score — Stroke Outcome" icon={<Activity className="h-5 w-5 text-emerald-500" />}>
      <p className="text-sm text-muted-foreground">Totaled Health Risks in Vascular Events: predicts 90-day outcome, mortality and sICH after ischemic stroke (with or without reperfusion). Range 0–9.</p>
      {THRIVE.map((t, i) => <Item key={t.q} q={t.q} opts={t.o} value={s.sel[i]} onChange={s.set(i)} />)}
      <div className={`rounded-xl border-2 p-4 ${s.done ? b.tone : "border-border"}`}>
        <p className="font-bold text-lg">THRIVE {s.total}/9 {!s.done && <span className="text-sm font-normal">(incomplete)</span>}</p>
        {s.done && <p className="text-sm">{b.band}: good outcome (mRS 0–2 at 90 days) {b.good}; mortality {b.death}.</p>}
      </div>
      <p className="text-xs text-muted-foreground">Flint AC et al. Ann Neurol 2010; Neurology 2013. Prognostic only — do not withhold reperfusion therapy based on THRIVE.</p>
      <Button size="sm" variant="ghost" onClick={s.reset}>Reset</Button>
    </Shell>
  );
}

/* ---------------- mRS ---------------- */
const MRS = [
  { s: 0, t: "No symptoms at all" },
  { s: 1, t: "No significant disability despite symptoms; able to carry out all usual duties and activities" },
  { s: 2, t: "Slight disability; unable to do all previous activities but able to look after own affairs without assistance" },
  { s: 3, t: "Moderate disability; requires some help, but able to walk without assistance" },
  { s: 4, t: "Moderately severe disability; unable to walk and attend to bodily needs without assistance" },
  { s: 5, t: "Severe disability; bedridden, incontinent, requires constant nursing care and attention" },
  { s: 6, t: "Dead" },
];
export function ModifiedRankinScaleCalculator() {
  const [pre, setPre] = useState<number | null>(null);
  const [cur, setCur] = useState<number | null>(null);
  const Row = ({ v, set, label }: { v: number | null; set: (n: number) => void; label: string }) => (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      {MRS.map((m) => (
        <button key={m.s} onClick={() => set(m.s)} className={`w-full text-left rounded-lg border p-3 min-h-[44px] text-sm transition-all ${v === m.s ? "border-primary bg-primary/15 font-semibold" : "border-border bg-card/60 hover:bg-accent/40"}`}>
          <b className="mr-2">{m.s}</b>{m.t}
        </button>
      ))}
    </div>
  );
  const cat = cur === null ? "" : cur <= 1 ? "Excellent outcome (mRS 0–1)" : cur === 2 ? "Functional independence (mRS 0–2)" : cur <= 5 ? "Dependent / disabled (mRS 3–5)" : "Death";
  return (
    <Shell title="Modified Rankin Scale (mRS)" icon={<Gauge className="h-5 w-5 text-sky-500" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Row v={pre} set={setPre} label="Pre-stroke mRS" />
        <Row v={cur} set={setCur} label="Current / 90-day mRS" />
      </div>
      {cur !== null && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/10 p-4 text-sm">
          <p className="font-bold text-lg">mRS {cur} — {cat}</p>
          {pre !== null && <p>Change from baseline: {cur - pre > 0 ? `+${cur - pre} (worse)` : cur - pre < 0 ? `${cur - pre} (better)` : "no change"}.</p>}
          {pre !== null && pre >= 3 && <p className="mt-1">Pre-stroke mRS ≥3: interpret outcome as return to baseline rather than mRS 0–2.</p>}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Primary outcome in most stroke trials, assessed at 90 days. A structured interview (e.g. mRS-9Q) improves reliability.</p>
    </Shell>
  );
}

/* ---------------- Secondary ICH score ---------------- */
const SICH: { q: string; o: Opt[] }[] = [
  { q: "NCCT categorisation (enlarged vessels/calcifications along margins, hyperattenuation in dural sinus/cortical vein = high; neither high nor low = indeterminate; basal ganglia/thalamus/brainstem without high features = low)", o: [{ pts: 0, l: "Low" }, { pts: 1, l: "Indeterminate" }, { pts: 2, l: "High" }] },
  { q: "Age (years)", o: [{ pts: 2, l: "18–45" }, { pts: 1, l: "46–70" }, { pts: 0, l: "≥71" }] },
  { q: "Sex", o: [{ pts: 0, l: "Male" }, { pts: 1, l: "Female" }] },
  { q: "Neither known hypertension nor impaired coagulation", o: [{ pts: 0, l: "No (HTN or coagulopathy present)" }, { pts: 1, l: "Yes (neither)" }] },
];
export function SecondaryICHScoreCalculator() {
  const [sel, setSel] = useState<(number | null)[]>(() => readJSON<SichSnapshot>(SICH_KEY)?.selections ?? SICH.map(() => null));
  const done = sel.every((v) => v !== null);
  const total = sel.reduce<number>((sum, v, i) => sum + (v === null ? 0 : SICH[i]?.o[v]?.pts ?? 0), 0);
  const update = (next: (number | null)[]) => {
    setSel(next);
    publishSich({ selections: next, complete: next.every((v) => v !== null), score: next.reduce<number>((sum, v, i) => sum + (v === null ? 0 : SICH[i]?.o[v]?.pts ?? 0), 0) });
  };
  const s = { sel, done, total, set: (i: number) => (v: number) => update(sel.map((old, j) => j === i ? v : old)), reset: () => { setSel(SICH.map(() => null)); publishSich(null); } };
  const high = s.total >= 2;
  return (
    <Shell title="Secondary ICH (sICH) Score — Vascular Cause" icon={<Droplets className="h-5 w-5 text-rose-500" />}>
      <p className="text-sm text-muted-foreground">Estimates the probability that a spontaneous ICH has an underlying vascular cause (AVM, aneurysm, dural fistula, venous thrombosis, moyamoya) to guide CTA/DSA. Range 0–6.</p>
      {SICH.map((t, i) => <Item key={t.q} q={t.q} opts={t.o} value={s.sel[i]} onChange={s.set(i)} />)}
      <div className={`rounded-xl border-2 p-4 ${!s.done ? "border-border" : high ? "border-red-500/50 bg-red-500/10" : "border-emerald-500/50 bg-emerald-500/10"}`}>
        <p className="font-bold text-lg">sICH score {s.total}/6 {!s.done && <span className="text-sm font-normal">(incomplete)</span>}</p>
        {s.done && <p className="text-sm">{high ? "Higher probability of a vascular lesion — obtain CTA/CTV; consider DSA if CTA negative and suspicion remains." : "Low probability of a vascular lesion — CTA still reasonable in lobar ICH, age <70 or no hypertension history."}</p>}
      </div>
      <div id="sich-cta" className="scroll-mt-40 space-y-1 border-t border-border pt-3">
        <h4 className="font-semibold text-sm">CT angiogram (CTA) / CT venogram (CTV)</h4>
        <p className="text-sm text-muted-foreground">For higher suspicion, obtain CTA to assess arterial vascular causes. Add CTV if cerebral venous thrombosis is suspected. Review findings with the stroke and neuroradiology teams.</p>
      </div>
      <div id="sich-dsa" className="scroll-mt-40 space-y-1 border-t border-border pt-3">
        <h4 className="font-semibold text-sm">Catheter angiogram (DSA)</h4>
        <p className="text-sm text-muted-foreground">Consider DSA after negative or inconclusive CTA when suspicion remains, or to clarify a suspected vascular lesion. Discuss the indication, timing and procedural risks with the neurovascular team.</p>
      </div>
      <p className="text-xs text-muted-foreground">Delgado Almandoz JE et al. AJNR 2010. Supports, does not replace, clinical judgment; AHA 2022 ICH guideline recommends CTA in most spontaneous ICH.</p>
      <Button size="sm" variant="ghost" onClick={s.reset}>Reset</Button>
    </Shell>
  );
}
