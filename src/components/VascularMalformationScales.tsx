import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, Activity, Calculator, GitBranch, AlertTriangle } from "lucide-react";

/* =========================================================
 * 1. Spetzler-Martin AVM Grading Scale
 * ========================================================= */
function SpetzlerMartinScale() {
  const [size, setSize] = useState<number | null>(null);
  const [eloquent, setEloquent] = useState<boolean | null>(null);
  const [deepVenous, setDeepVenous] = useState<boolean | null>(null);

  const grade = useMemo(() => {
    if (size === null || eloquent === null || deepVenous === null) return null;
    return size + (eloquent ? 1 : 0) + (deepVenous ? 1 : 0);
  }, [size, eloquent, deepVenous]);

  const riskBand = (g: number | null) => {
    if (g === null) return null;
    if (g <= 2) return { label: "Low surgical risk", color: "bg-emerald-500", morbMort: "~0–5% permanent deficit" };
    if (g === 3) return { label: "Intermediate risk", color: "bg-amber-500", morbMort: "~10–20% morbidity" };
    if (g === 4) return { label: "High surgical risk", color: "bg-orange-500", morbMort: "~30% morbidity/mortality" };
    return { label: "Very high risk (often inoperable)", color: "bg-red-600", morbMort: ">30–40% morbidity/mortality" };
  };

  const risk = riskBand(grade);

  return (
    <Card className="border-l-4 border-l-rose-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
          <Calculator className="h-5 w-5" /> Spetzler–Martin AVM Grading Scale
        </CardTitle>
        <p className="text-xs text-muted-foreground">Predicts microsurgical risk for brain arteriovenous malformations (grade 1–5).</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">AVM Nidus Size</Label>
          <RadioGroup value={size?.toString() ?? ""} onValueChange={(v) => setSize(Number(v))}>
            {[
              { v: 1, label: "Small (< 3 cm)" },
              { v: 2, label: "Medium (3–6 cm)" },
              { v: 3, label: "Large (> 6 cm)" },
            ].map((o) => (
              <div key={o.v} className="flex items-center gap-2">
                <RadioGroupItem id={`sm-size-${o.v}`} value={o.v.toString()} />
                <Label htmlFor={`sm-size-${o.v}`} className="text-sm cursor-pointer">{o.label} — {o.v} pt</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Eloquence of Adjacent Brain</Label>
          <RadioGroup value={eloquent === null ? "" : eloquent ? "1" : "0"} onValueChange={(v) => setEloquent(v === "1")}>
            <div className="flex items-center gap-2"><RadioGroupItem id="sm-elo-1" value="1" /><Label htmlFor="sm-elo-1" className="text-sm cursor-pointer">Eloquent (sensorimotor, language, visual cortex, hypothalamus, thalamus, internal capsule, brainstem, cerebellar peduncles, deep cerebellar nuclei) — 1 pt</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem id="sm-elo-0" value="0" /><Label htmlFor="sm-elo-0" className="text-sm cursor-pointer">Non-eloquent — 0 pt</Label></div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Venous Drainage</Label>
          <RadioGroup value={deepVenous === null ? "" : deepVenous ? "1" : "0"} onValueChange={(v) => setDeepVenous(v === "1")}>
            <div className="flex items-center gap-2"><RadioGroupItem id="sm-vd-1" value="1" /><Label htmlFor="sm-vd-1" className="text-sm cursor-pointer">Any deep venous drainage (internal cerebral veins, basal veins, precentral cerebellar vein) — 1 pt</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem id="sm-vd-0" value="0" /><Label htmlFor="sm-vd-0" className="text-sm cursor-pointer">Superficial only — 0 pt</Label></div>
          </RadioGroup>
        </div>

        {grade !== null && risk && (
          <div className="rounded-lg border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Spetzler–Martin Grade</span>
              <Badge className={`${risk.color} text-white text-lg px-3 py-1`}>Grade {grade}</Badge>
            </div>
            <p className="text-sm"><strong>{risk.label}</strong> — {risk.morbMort}</p>
            <p className="text-xs text-muted-foreground">Supplementary Lawton–Young grade (age, unruptured, diffuse nidus) further refines surgical decision-making.</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground border-t pt-2">Reference: Spetzler RF, Martin NA. J Neurosurg 1986;65(4):476–83.</p>
      </CardContent>
    </Card>
  );
}

/* =========================================================
 * 2. R2eD AVM Annual Bleed Risk
 * ========================================================= */
function R2eDAVMScore() {
  const [race, setRace] = useState<string>(""); // non-white = 1
  const [eloquent, setEloquent] = useState<boolean>(false);
  const [drainage, setDrainage] = useState<string>(""); // exclusive deep = 2

  const score = (race === "nonwhite" ? 1 : 0) + (eloquent ? 1 : 0) + (drainage === "deep" ? 2 : 0);

  const annualRisk = (s: number) => {
    // Approx from Pollock/Flickinger derivations & derivative R2eD studies
    if (s === 0) return "~0.9% / year";
    if (s === 1) return "~1.7% / year";
    if (s === 2) return "~2.5% / year";
    if (s === 3) return "~3.7% / year";
    return "~5.6% / year";
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <Activity className="h-5 w-5" /> R₂eD AVM — Annual Hemorrhage Risk
        </CardTitle>
        <p className="text-xs text-muted-foreground">Estimates annual bleed risk of unruptured brain AVMs (Race, Eloquent, exclusively Deep drainage).</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Race / Ethnicity</Label>
          <RadioGroup value={race} onValueChange={setRace}>
            <div className="flex items-center gap-2"><RadioGroupItem id="r2-w" value="white" /><Label htmlFor="r2-w" className="text-sm cursor-pointer">White — 0 pt</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem id="r2-nw" value="nonwhite" /><Label htmlFor="r2-nw" className="text-sm cursor-pointer">Non-white — 1 pt</Label></div>
          </RadioGroup>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="r2-elo" checked={eloquent} onCheckedChange={(v) => setEloquent(!!v)} />
          <Label htmlFor="r2-elo" className="text-sm cursor-pointer">Eloquent location — 1 pt</Label>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Venous Drainage</Label>
          <RadioGroup value={drainage} onValueChange={setDrainage}>
            <div className="flex items-center gap-2"><RadioGroupItem id="r2-sup" value="superficial" /><Label htmlFor="r2-sup" className="text-sm cursor-pointer">Any superficial component — 0 pt</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem id="r2-deep" value="deep" /><Label htmlFor="r2-deep" className="text-sm cursor-pointer">Exclusively deep drainage — 2 pt</Label></div>
          </RadioGroup>
        </div>

        <div className="rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">R₂eD Score</span>
            <Badge className="bg-orange-600 text-white text-lg px-3 py-1">{score} / 4</Badge>
          </div>
          <p className="text-sm"><strong>Estimated annual hemorrhage risk:</strong> {annualRisk(score)}</p>
          <p className="text-xs text-muted-foreground">Applies to previously unruptured AVMs. Prior hemorrhage independently increases risk (~4–5% per year in first year).</p>
        </div>
        <p className="text-xs text-muted-foreground border-t pt-2">Reference: Feghali J, et al. Stroke 2020 — R₂eD AVM score for hemorrhage prediction.</p>
      </CardContent>
    </Card>
  );
}

/* =========================================================
 * 3. PHASES Aneurysm Rupture Risk Score
 * ========================================================= */
function PHASESScore() {
  const [population, setPopulation] = useState<number | null>(null);
  const [htn, setHtn] = useState<boolean>(false);
  const [age, setAge] = useState<number | null>(null);
  const [sizePts, setSizePts] = useState<number | null>(null);
  const [priorSAH, setPriorSAH] = useState<boolean>(false);
  const [site, setSite] = useState<number | null>(null);

  const score = [population, age, sizePts, site].every((v) => v !== null)
    ? (population! + (htn ? 1 : 0) + age! + sizePts! + (priorSAH ? 1 : 0) + site!)
    : null;

  const risk = (s: number | null) => {
    if (s === null) return null;
    if (s <= 2) return "0.4% (5-year)";
    if (s === 3) return "0.7%";
    if (s === 4) return "0.9%";
    if (s === 5) return "1.3%";
    if (s === 6) return "1.7%";
    if (s === 7) return "2.4%";
    if (s === 8) return "3.2%";
    if (s === 9) return "4.3%";
    if (s === 10) return "5.3%";
    if (s === 11) return "7.2%";
    return "≥17.8% (5-year)";
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Calculator className="h-5 w-5" /> PHASES — Aneurysm Rupture Risk (5-year)
        </CardTitle>
        <p className="text-xs text-muted-foreground">Modality: DSA / CTA / MRA · Brain · Vascular. Validated in pooled analysis of 6 prospective cohorts (Greving JP, Lancet Neurol 2014).</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">P — Population</Label>
          <RadioGroup value={population?.toString() ?? ""} onValueChange={(v) => setPopulation(Number(v))}>
            {[{v:0,l:"North American / European (non-Finnish)"},{v:3,l:"Japanese"},{v:5,l:"Finnish"}].map(o => (
              <div key={o.v} className="flex items-center gap-2"><RadioGroupItem id={`ph-p-${o.v}`} value={o.v.toString()}/><Label htmlFor={`ph-p-${o.v}`} className="text-sm cursor-pointer">{o.l} — {o.v} pt</Label></div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="ph-htn" checked={htn} onCheckedChange={(v) => setHtn(!!v)} />
          <Label htmlFor="ph-htn" className="text-sm cursor-pointer">H — Hypertension — 1 pt</Label>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">A — Age</Label>
          <RadioGroup value={age?.toString() ?? ""} onValueChange={(v) => setAge(Number(v))}>
            <div className="flex items-center gap-2"><RadioGroupItem id="ph-a-0" value="0"/><Label htmlFor="ph-a-0" className="text-sm cursor-pointer">&lt; 70 years — 0 pt</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem id="ph-a-1" value="1"/><Label htmlFor="ph-a-1" className="text-sm cursor-pointer">≥ 70 years — 1 pt</Label></div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">S — Size of Aneurysm</Label>
          <RadioGroup value={sizePts?.toString() ?? ""} onValueChange={(v) => setSizePts(Number(v))}>
            {[{v:0,l:"< 7.0 mm"},{v:3,l:"7.0 – 9.9 mm"},{v:6,l:"10.0 – 19.9 mm"},{v:10,l:"≥ 20 mm"}].map(o=>(
              <div key={o.v} className="flex items-center gap-2"><RadioGroupItem id={`ph-s-${o.v}`} value={o.v.toString()}/><Label htmlFor={`ph-s-${o.v}`} className="text-sm cursor-pointer">{o.l} — {o.v} pt</Label></div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="ph-e" checked={priorSAH} onCheckedChange={(v) => setPriorSAH(!!v)} />
          <Label htmlFor="ph-e" className="text-sm cursor-pointer">E — Earlier SAH from a different aneurysm — 1 pt</Label>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">S — Site of Aneurysm</Label>
          <RadioGroup value={site?.toString() ?? ""} onValueChange={(v) => setSite(Number(v))}>
            <div className="flex items-center gap-2"><RadioGroupItem id="ph-si-0" value="0"/><Label htmlFor="ph-si-0" className="text-sm cursor-pointer">ICA — 0 pt</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem id="ph-si-2" value="2"/><Label htmlFor="ph-si-2" className="text-sm cursor-pointer">MCA — 2 pt</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem id="ph-si-4" value="4"/><Label htmlFor="ph-si-4" className="text-sm cursor-pointer">ACA / PCom / Posterior circulation — 4 pt</Label></div>
          </RadioGroup>
        </div>

        {score !== null && (
          <div className="rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PHASES Score</span>
              <Badge className="bg-purple-600 text-white text-lg px-3 py-1">{score}</Badge>
            </div>
            <p className="text-sm"><strong>Estimated 5-year rupture risk:</strong> {risk(score)}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground border-t pt-2">Reference: Greving JP, et al. Lancet Neurol 2014;13(1):59–66.</p>
      </CardContent>
    </Card>
  );
}

/* =========================================================
 * 4. dAVF — Cognard & Borden Classification
 * ========================================================= */
const COGNARD: { type: string; desc: string; cvr: string; ectasia: string; risk: string; color: string; mgmt: string }[] = [
  { type: "I", desc: "Confined to sinus, antegrade flow", cvr: "Absent", ectasia: "Absent", risk: "Low / Benign", color: "bg-emerald-500", mgmt: "Conservative / serial imaging" },
  { type: "IIa", desc: "Sinus only, retrograde sinus flow", cvr: "Absent", ectasia: "Absent", risk: "Low–Intermediate (venous HTN)", color: "bg-lime-500", mgmt: "Consider Rx if symptomatic ICH/venous HTN" },
  { type: "IIb", desc: "Sinus drainage with cortical venous reflux (antegrade sinus)", cvr: "Present", ectasia: "±", risk: "Intermediate — hemorrhage 10–20%", color: "bg-amber-500", mgmt: "Treatment usually indicated" },
  { type: "IIa+b", desc: "Retrograde sinus flow + cortical venous reflux", cvr: "Present", ectasia: "±", risk: "High — hemorrhage ~20%", color: "bg-orange-500", mgmt: "Treatment indicated" },
  { type: "III", desc: "Direct cortical venous drainage, no ectasia", cvr: "Present", ectasia: "Absent", risk: "High — annual bleed ~10%", color: "bg-red-500", mgmt: "Urgent endovascular / surgical treatment" },
  { type: "IV", desc: "Direct cortical venous drainage with venous ectasia (≥5 mm & >3× draining vein)", cvr: "Present", ectasia: "Present", risk: "Very high — annual bleed ~20–30%", color: "bg-red-700", mgmt: "Urgent treatment mandatory" },
  { type: "V", desc: "Spinal perimedullary venous drainage", cvr: "—", ectasia: "—", risk: "Progressive myelopathy (~50%)", color: "bg-fuchsia-600", mgmt: "Treatment to prevent myelopathy" },
];

const BORDEN: { type: string; drainage: string; behavior: string; cognard: string }[] = [
  { type: "I", drainage: "Anterograde into dural venous sinus or meningeal vein", behavior: "Benign natural history", cognard: "Cognard I, IIa" },
  { type: "II", drainage: "Into dural sinus with cortical venous reflux", behavior: "Aggressive — hemorrhage / neurologic deficit risk", cognard: "Cognard IIb, IIa+b" },
  { type: "III", drainage: "Direct cortical venous drainage (no sinus)", behavior: "Highly aggressive — high hemorrhage risk", cognard: "Cognard III, IV, V" },
];

function DAVFClassification() {
  const [tab, setTab] = useState("flow");
  const [drainage, setDrainage] = useState<string>("");
  const [flow, setFlow] = useState<string>("");
  const [ectasia, setEctasia] = useState<boolean>(false);

  const suggested = useMemo(() => {
    if (drainage === "sinus" && flow === "antegrade") return { cognard: "I", borden: "I" };
    if (drainage === "sinus" && flow === "retrograde") return { cognard: "IIa", borden: "I" };
    if (drainage === "sinus_cvr" && flow === "antegrade") return { cognard: "IIb", borden: "II" };
    if (drainage === "sinus_cvr" && flow === "retrograde") return { cognard: "IIa+b", borden: "II" };
    if (drainage === "cortical") return { cognard: ectasia ? "IV" : "III", borden: "III" };
    if (drainage === "spinal") return { cognard: "V", borden: "III" };
    return null;
  }, [drainage, flow, ectasia]);

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <GitBranch className="h-5 w-5" /> dAVF Classification — Cognard & Borden
        </CardTitle>
        <p className="text-xs text-muted-foreground">Classify dural AV fistulas by venous drainage pattern, cortical reflux, and venous ectasia for hemorrhage risk stratification and treatment planning.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="flow">Cognard Flow Map</TabsTrigger>
            <TabsTrigger value="classifier">Classifier</TabsTrigger>
            <TabsTrigger value="tables">Reference Tables</TabsTrigger>
          </TabsList>

          {/* Flow map */}
          <TabsContent value="flow" className="space-y-3 pt-3">
            <div className="rounded-lg border p-3 bg-muted/30 space-y-3 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-500 text-white">Sinus only</Badge>
                  <span>Antegrade →</span><Badge variant="outline">Type I</Badge>
                  <span>| Retrograde →</span><Badge variant="outline">Type IIa</Badge>
                  <span className="text-xs text-muted-foreground">(less dangerous)</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-amber-500 text-white">Sinus + CVR</Badge>
                  <span>Antegrade →</span><Badge variant="outline">Type IIb</Badge>
                  <span>| Retrograde →</span><Badge variant="outline">Type IIa+b</Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-red-500 text-white">CVR only</Badge>
                  <span>No ectasia →</span><Badge variant="outline">Type III</Badge>
                  <span>| With ectasia →</span><Badge variant="outline">Type IV</Badge>
                  <span className="text-xs text-red-600">(most dangerous)</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-fuchsia-600 text-white">Spinal</Badge>
                  <span>Perimedullary drainage →</span><Badge variant="outline">Type V</Badge>
                  <span className="text-xs text-muted-foreground">(myelopathy risk)</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3 text-xs space-y-1 bg-background">
              <p className="font-semibold">Flow Direction Key</p>
              <p>→ Antegrade — normal sinus direction · ← Retrograde — reversed flow</p>
              <p>↗ Cortical vein reflux — into cortical veins · ↑ Direct cortical drainage (no sinus)</p>
              <p>Venous ectasia — ≥5 mm diameter and &gt;3× the draining vein caliber</p>
              <p>↓ Spinal perimedullary drainage</p>
            </div>
          </TabsContent>

          {/* Classifier */}
          <TabsContent value="classifier" className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Venous Drainage Pattern</Label>
              <RadioGroup value={drainage} onValueChange={setDrainage}>
                <div className="flex items-start gap-2"><RadioGroupItem id="dv-s" value="sinus" /><Label htmlFor="dv-s" className="text-sm cursor-pointer">Dural sinus only — confined drainage</Label></div>
                <div className="flex items-start gap-2"><RadioGroupItem id="dv-sc" value="sinus_cvr" /><Label htmlFor="dv-sc" className="text-sm cursor-pointer">Sinus + cortical venous reflux</Label></div>
                <div className="flex items-start gap-2"><RadioGroupItem id="dv-c" value="cortical" /><Label htmlFor="dv-c" className="text-sm cursor-pointer">Direct cortical vein drainage (no sinus)</Label></div>
                <div className="flex items-start gap-2"><RadioGroupItem id="dv-sp" value="spinal" /><Label htmlFor="dv-sp" className="text-sm cursor-pointer">Spinal perimedullary veins</Label></div>
              </RadioGroup>
            </div>

            {(drainage === "sinus" || drainage === "sinus_cvr") && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sinus Flow Direction</Label>
                <RadioGroup value={flow} onValueChange={setFlow}>
                  <div className="flex items-center gap-2"><RadioGroupItem id="fl-a" value="antegrade" /><Label htmlFor="fl-a" className="text-sm cursor-pointer">Antegrade (normal flow)</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem id="fl-r" value="retrograde" /><Label htmlFor="fl-r" className="text-sm cursor-pointer">Retrograde (reversed flow)</Label></div>
                </RadioGroup>
              </div>
            )}

            {drainage === "cortical" && (
              <div className="flex items-start gap-2">
                <Checkbox id="ect" checked={ectasia} onCheckedChange={(v) => setEctasia(!!v)} />
                <Label htmlFor="ect" className="text-sm cursor-pointer">Venous ectasia present (≥5 mm & &gt;3× draining vein)</Label>
              </div>
            )}

            {suggested && (
              <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 p-4 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-indigo-600 text-white text-lg px-3 py-1">Cognard {suggested.cognard}</Badge>
                  <Badge className="bg-violet-600 text-white text-lg px-3 py-1">Borden {suggested.borden}</Badge>
                </div>
                {(() => {
                  const c = COGNARD.find((x) => x.type === suggested.cognard);
                  return c ? (
                    <div className="text-sm space-y-1">
                      <p><strong>Behavior:</strong> {c.desc}</p>
                      <p><strong>Hemorrhage risk:</strong> <span className="font-semibold">{c.risk}</span></p>
                      <p><strong>Management:</strong> {c.mgmt}</p>
                    </div>
                  ) : null;
                })()}
                {(suggested.cognard === "III" || suggested.cognard === "IV") && (
                  <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400 border-t pt-2">
                    <AlertTriangle className="h-4 w-4" /> High-risk lesion — urgent endovascular / surgical treatment recommended.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Reference tables */}
          <TabsContent value="tables" className="space-y-4 pt-3">
            <div>
              <h4 className="font-semibold text-sm mb-2">Full Cognard Classification</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">CVR</th>
                      <th className="p-2 text-left">Ectasia</th>
                      <th className="p-2 text-left">Risk</th>
                      <th className="p-2 text-left">Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COGNARD.map((c) => (
                      <tr key={c.type} className="border-t align-top">
                        <td className="p-2"><Badge className={`${c.color} text-white`}>{c.type}</Badge></td>
                        <td className="p-2">{c.desc}</td>
                        <td className="p-2">{c.cvr}</td>
                        <td className="p-2">{c.ectasia}</td>
                        <td className="p-2">{c.risk}</td>
                        <td className="p-2">{c.mgmt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Full Borden Classification</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Drainage</th>
                      <th className="p-2 text-left">Behavior</th>
                      <th className="p-2 text-left">Cognard equivalent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BORDEN.map((b) => (
                      <tr key={b.type} className="border-t align-top">
                        <td className="p-2"><Badge variant="outline">Borden {b.type}</Badge></td>
                        <td className="p-2">{b.drainage}</td>
                        <td className="p-2">{b.behavior}</td>
                        <td className="p-2">{b.cognard}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground border-t pt-2">
          References: Cognard C, et al. Radiology 1995;194(3):671–80 · Borden JA, et al. J Neurosurg 1995;82(2):166–79. Educational reference only — not a substitute for clinical judgment.
        </p>
      </CardContent>
    </Card>
  );
}

/* =========================================================
 * Container
 * ========================================================= */
export default function VascularMalformationScales() {
  const [open, setOpen] = useState(true);
  return (
    <Card id="vascular-malformations" className="border-2 border-rose-200 dark:border-rose-800/60">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <Activity className="h-5 w-5" /> Vascular Malformations & Aneurysm Risk Scores
              </span>
              <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
            </CardTitle>
            <p className="text-xs text-muted-foreground text-left">Spetzler–Martin · R₂eD AVM · PHASES · dAVF (Cognard & Borden)</p>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <SpetzlerMartinScale />
            <R2eDAVMScore />
            <PHASESScore />
            <DAVFClassification />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
