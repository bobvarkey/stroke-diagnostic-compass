import { useEffect, useMemo, useState } from "react";
import { Droplets, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import CollapsibleModule from "./CollapsibleModule";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabColor } from "@/lib/tabColors";

type Tri = "yes" | "no" | "unknown";
type Unit = "ug/L" | "mg/L" | "ng/mL";
type Basis = "FEU" | "DDU" | "unknown";

const CAUSES: { category: string; items: { cause: string; note?: string }[] }[] = [
  { category: "Stroke-related mechanisms", items: [
    { cause: "Acute ischemic stroke itself", note: "The index event can contribute to elevation without revealing etiology." },
    { cause: "Cardioembolism, including AF or left atrial thrombus", note: "Possible embolic mechanism; D-dimer does not diagnose atrial fibrillation." },
    { cause: "Cancer-associated hypercoagulability or occult malignancy", note: "Assess particularly with otherwise unexplained embolic or multi-territory infarcts, after competing explanations are considered." },
  ]},
  { category: "Concurrent thrombotic or vascular disorders", items: [
    { cause: "Deep vein thrombosis", note: "Consider paradoxical embolism when appropriate." },
    { cause: "Pulmonary embolism", note: "Can coexist with or follow stroke." },
    { cause: "Myocardial infarction", note: "Assess using symptoms, ECG, and cardiac biomarkers." },
    { cause: "Aortic dissection", note: "Emergency consideration when the clinical picture suggests acute aortic syndrome." },
  ]},
  { category: "Systemic coagulopathy", items: [
    { cause: "Disseminated intravascular coagulation (DIC)", note: "Assess platelet count, PT/aPTT, fibrinogen, and clinical trigger; no single result diagnoses DIC." },
    { cause: "Thrombotic thrombocytopenic purpura (TTP)", note: "Usually normal or minimally elevated D-dimer in isolated TTP; assess thrombocytopenia, microangiopathic hemolysis, and ADAMTS13 when suspected. Marked elevation suggests an alternative or concurrent cause, not exclusion of TTP." },
  ]},
  { category: "Inflammation and infection", items: [
    { cause: "Sepsis or severe infection" },
    { cause: "Acute viral illness, including severe COVID-19" },
    { cause: "Chronic inflammatory or autoimmune disease" },
  ]},
  { category: "Physiological, comorbid, or recent-event factors", items: [
    { cause: "Older age" }, { cause: "Pregnancy or postpartum state" }, { cause: "Recent surgery or trauma" },
    { cause: "Immobilization" }, { cause: "Liver disease" }, { cause: "Heart failure" },
    { cause: "Recent thrombolytic treatment", note: "May transiently alter D-dimer interpretation." },
  ]},
];

const RULES = [
  { if: "Known active cancer", then: "Evaluate the stroke mechanism and cancer activity; do not label the cancer occult or calculate OCCULT-5 for occult-cancer screening." },
  { if: "Marked D-dimer elevation + unexplained multi-territory embolic infarcts", then: "Flag: investigate possible cancer-associated stroke; do not label as diagnosed cancer-related stroke." },
  { if: "OCCULT-5 ≥ 3", then: "Flag: consider targeted malignancy screening; not an automatic order for whole-body CT or PET/CT." },
  { if: "Suspected TTP", then: "Urgently assess for thrombotic microangiopathy; a normal or mildly elevated D-dimer does not exclude TTP." },
  { if: "Suspected DIC", then: "Assess for the underlying trigger and interpret coagulation tests together; D-dimer alone is insufficient." },
];

const SAFEGUARDS = [
  "Do not diagnose cancer, atrial fibrillation, venous thromboembolism, DIC, or TTP using D-dimer alone.",
  "Do not use an OCCULT-5 score below 3 to rule out cancer when symptoms or other findings are concerning.",
  "Do not apply the OCCULT-5 D-dimer threshold when assay comparability or FEU/DDU basis is unknown; show the score as provisional.",
  "Do not initiate anticoagulation solely for an elevated D-dimer or OCCULT-5 score.",
  "No universal stroke-specific D-dimer cutoff or internationally agreed systematic occult-cancer screening pathway has been established.",
];

const TriSelect = ({ label, value, onChange }: { label: string; value: Tri; onChange: (v: Tri) => void }) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <div className="grid grid-cols-3 gap-1">
      {(["yes", "no", "unknown"] as Tri[]).map((v) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={`min-h-[44px] rounded-md border text-xs font-semibold capitalize transition-colors ${value === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted/50"}`}>
          {v}
        </button>
      ))}
    </div>
  </div>
);

export const OCCULT5_EVENT = "occult5-updated";
export interface Occult5State { min: number; max: number; definitive: boolean; notApplicable: boolean }

export default function DDimerStrokeModule({ onScoreChange }: { onScoreChange?: (s: Occult5State) => void } = {}) {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"female" | "male" | "unknown">("unknown");
  const [esus, setEsus] = useState<Tri>("unknown");
  const [multi, setMulti] = useState<Tri>("unknown");
  const [dd, setDd] = useState("");
  const [unit, setUnit] = useState<Unit>("ug/L");
  const [basis, setBasis] = useState<Basis>("unknown");
  const [assayMatch, setAssayMatch] = useState<Tri>("unknown");
  const [uln, setUln] = useState("");
  const [timing, setTiming] = useState<"before" | "after" | "not_applicable" | "unknown">("unknown");
  const [cancer, setCancer] = useState<Tri>("unknown");

  const ddUgL = useMemo(() => {
    const n = parseFloat(dd);
    if (isNaN(n)) return null;
    return unit === "mg/L" ? n * 1000 : n; // ng/mL == ug/L
  }, [dd, unit]);

  const result = useMemo(() => {
    const ageN = parseFloat(age);
    // each item: 1 = positive, 0 = negative, null = unknown
    const items: { label: string; v: 0 | 1 | null }[] = [
      { label: "Age ≥ 77 y", v: isNaN(ageN) ? null : ageN >= 77 ? 1 : 0 },
      { label: "ESUS confirmed", v: esus === "unknown" ? null : esus === "yes" ? 1 : 0 },
      { label: "Multi-territorial acute infarcts", v: multi === "unknown" ? null : multi === "yes" ? 1 : 0 },
      {
        label: "D-dimer ≥ 820 µg/L (comparable assay)",
        v: ddUgL === null || assayMatch !== "yes" || basis === "unknown" ? null : ddUgL >= 820 ? 1 : 0,
      },
      { label: "Female sex", v: sex === "unknown" ? null : sex === "female" ? 1 : 0 },
    ];
    const min = items.reduce((s, i) => s + (i.v === 1 ? 1 : 0), 0);
    const max = items.reduce((s, i) => s + (i.v === 0 ? 0 : 1), 0);
    return { items, min, max, definitive: min === max };
  }, [age, esus, multi, ddUgL, assayMatch, basis, sex]);

  const ulnN = parseFloat(uln);
  const aboveUln = ddUgL !== null && !isNaN(ulnN) && ulnN > 0 ? ddUgL / ulnN : null;
  const cancerKnown = cancer === "yes";

  useEffect(() => {
    const st: Occult5State = { min: result.min, max: result.max, definitive: result.definitive, notApplicable: cancerKnown };
    try { localStorage.setItem("occult5", JSON.stringify(st)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent(OCCULT5_EVENT, { detail: st }));
    onScoreChange?.(st);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.min, result.max, result.definitive, cancerKnown]);

  const interp = (() => {
    if (cancerKnown) return { tone: "border-amber-500/60 bg-amber-500/10", text: "Known active cancer — OCCULT-5 is not applicable for occult-cancer screening. Evaluate stroke mechanism and cancer activity." };
    if (result.min >= 3) return { tone: "border-red-500/60 bg-red-500/10", text: "Screening-prompt threshold met (≥3). Consider targeted malignancy assessment after reviewing symptoms, examination, imaging, alternative stroke mechanisms, and competing causes of D-dimer elevation. Not diagnostic of cancer." };
    if (result.max <= 2) return { tone: "border-emerald-500/60 bg-emerald-500/10", text: "Below proposed screening-prompt threshold (0–2). Do not rule out cancer; use clinical suspicion and usual screening pathways." };
    return { tone: "border-sky-500/60 bg-sky-500/10", text: `Provisional score ${result.min}–${result.max}: complete unknown items (or verify assay comparability) before interpreting.` };
  })();

  return (
    <CollapsibleModule
      title="Elevated D-dimer in Ischemic Stroke"
      subtitle="Interpretation, alternative causes & OCCULT-5"
      icon={<Droplets className="h-5 w-5 text-rose-400" />}
      badge={<Badge variant="outline" className="text-[10px]">OCCULT-5</Badge>}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-3 text-sm flex gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
          <p><strong>Core principle:</strong> D-dimer reflects breakdown of cross-linked fibrin. Elevation is nonspecific and may reflect the stroke, its cause, a complication, or an unrelated condition.</p>
        </div>

        <Tabs defaultValue="calc">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="calc" className={`text-xs font-semibold ${tabColor("amber")}`}>OCCULT-5</TabsTrigger>
            <TabsTrigger value="causes" className={`text-xs font-semibold ${tabColor("sky")}`}>Causes</TabsTrigger>
            <TabsTrigger value="rules" className={`text-xs font-semibold ${tabColor("violet")}`}>Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="calc" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Age (years)</Label>
                <Input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 70" className="min-h-[44px]" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sex recorded for score</Label>
                <div className="grid grid-cols-3 gap-1">
                  {(["female", "male", "unknown"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => setSex(v)}
                      className={`min-h-[44px] rounded-md border text-xs font-semibold capitalize ${sex === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted/50"}`}>
                      {v === "unknown" ? "Other/unk" : v}
                    </button>
                  ))}
                </div>
              </div>
              <TriSelect label="ESUS confirmed" value={esus} onChange={setEsus} />
              <TriSelect label="Multi-territorial acute infarcts" value={multi} onChange={setMulti} />
              <TriSelect label="Known active cancer" value={cancer} onChange={setCancer} />
              <div className="space-y-1">
                <Label className="text-xs">Sample vs thrombolysis</Label>
                <select value={timing} onChange={(e) => setTiming(e.target.value as typeof timing)} className="w-full min-h-[44px] rounded-md border border-border bg-background px-2 text-sm">
                  <option value="unknown">Unknown</option><option value="before">Before</option><option value="after">After</option><option value="not_applicable">Not applicable</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-3">
              <p className="text-sm font-semibold">D-dimer</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1 col-span-1">
                  <Label className="text-xs">Value</Label>
                  <Input inputMode="decimal" value={dd} onChange={(e) => setDd(e.target.value)} className="min-h-[44px]" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Unit</Label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="w-full min-h-[44px] rounded-md border border-border bg-background px-2 text-sm">
                    <option>ug/L</option><option>mg/L</option><option>ng/mL</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reporting basis</Label>
                  <select value={basis} onChange={(e) => setBasis(e.target.value as Basis)} className="w-full min-h-[44px] rounded-md border border-border bg-background px-2 text-sm">
                    <option value="unknown">Unknown</option><option>FEU</option><option>DDU</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Local ULN (same unit as µg/L)</Label>
                  <Input inputMode="decimal" value={uln} onChange={(e) => setUln(e.target.value)} placeholder="e.g. 500" className="min-h-[44px]" />
                </div>
              </div>
              <TriSelect label="Assay/reporting basis matches OCCULT-5 derivation?" value={assayMatch} onChange={setAssayMatch} />
              {ddUgL !== null && (
                <p className="text-xs text-muted-foreground">
                  = {ddUgL.toFixed(0)} µg/L = {(ddUgL / 1000).toFixed(2)} mg/L = {ddUgL.toFixed(0)} ng/mL (same basis)
                  {aboveUln !== null && <> · {aboveUln.toFixed(1)}× local ULN</>}
                </p>
              )}
              <div className="text-xs rounded-md border border-amber-500/50 bg-amber-500/10 p-2 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>FEU and DDU are not interchangeable (FEU ≈ 2× DDU). The 820 µg/L cutoff is a published research threshold, not a universal clinical cutoff — verify assay comparability before applying it.</span>
              </div>
              {timing === "after" && (
                <p className="text-xs text-amber-400">Sample drawn after thrombolysis — thrombolytics may transiently alter D-dimer interpretation.</p>
              )}
            </div>

            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">OCCULT-5 score</p>
                <Badge className="text-sm">{cancerKnown ? "N/A" : result.definitive ? `${result.min} / 5` : `${result.min}–${result.max} (provisional)`}</Badge>
              </div>
              <ul className="text-xs space-y-1">
                {result.items.map((i) => (
                  <li key={i.label} className="flex justify-between">
                    <span>{i.label}</span>
                    <span className="font-semibold">{i.v === null ? "?" : i.v}</span>
                  </li>
                ))}
              </ul>
              <div className={`rounded-md border p-2 text-sm ${interp.tone}`}>{interp.text}</div>
            </div>

            <details className="rounded-lg border border-border p-3 text-xs">
              <summary className="cursor-pointer font-semibold text-sm">Original study performance (score ≥3)</summary>
              <ul className="mt-2 space-y-0.5">
                <li>Derivation: acute ischemic stroke of all etiologies — n = 1001; occult malignancy n = 22</li>
                <li>Sensitivity 64% · Specificity 73%</li>
                <li>LR+ 2.35 · LR− 0.5</li>
                <li>PPV 5% · NPV 98.8%</li>
                <li className="text-muted-foreground">Predictive values are cohort-prevalence dependent; the score is not an independently established diagnostic test.</li>
                <li className="text-muted-foreground">Example: 70-y female, ESUS, multi-territory, D-dimer 1.2 mg/L (comparable assay) → 4 → consider targeted occult malignancy assessment; not a diagnosis.</li>
              </ul>
            </details>
          </TabsContent>

          <TabsContent value="causes" className="space-y-3 pt-3">
            {CAUSES.map((c) => (
              <div key={c.category} className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold mb-2">{c.category}</p>
                <ul className="space-y-1.5 text-xs">
                  {c.items.map((i) => (
                    <li key={i.cause}><span className="font-medium">• {i.cause}</span>{i.note && <span className="text-muted-foreground"> — {i.note}</span>}</li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="rules" className="space-y-3 pt-3">
            {RULES.map((r) => (
              <div key={r.if} className="rounded-lg border border-border p-3 text-xs">
                <p className="font-semibold text-sm">If: {r.if}</p>
                <p className="text-muted-foreground mt-1">{r.then}</p>
              </div>
            ))}
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
              <p className="text-sm font-semibold flex items-center gap-2 mb-2"><ShieldAlert className="h-4 w-4 text-red-400" />Safeguards</p>
              <ul className="text-xs space-y-1 list-disc pl-4">{SAFEGUARDS.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CollapsibleModule>
  );
}
