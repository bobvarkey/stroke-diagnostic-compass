import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Copy, RotateCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PredictorInputs {
  age: string;
  sex: "male" | "female";
  ldl: string;
  nonhdl: string;
  apob: string;
  lpa: string;
  hba1c: string;
  egfr: string;
  hscrp: string;
}

const majorRiskFactors = [
  { id: "ageRisk", label: "Age threshold met (men ≥45 y, women ≥55 y)", auto: true },
  { id: "smoking", label: "Current cigarette smoking" },
  { id: "htn", label: "Hypertension (BP ≥140/90 or treated)" },
  { id: "lowhdl", label: "Low HDL-C" },
  { id: "fhx", label: "Family history of premature CHD" },
  { id: "dm", label: "Diabetes mellitus", auto: true },
  { id: "ckd", label: "Chronic kidney disease (eGFR <60)", auto: true },
  { id: "obesity", label: "Obesity" },
];

const ascvdModifiers = [
  { id: "ascvd", label: "Established ASCVD" },
  { id: "cad", label: "CAD / coronary ASCVD" },
  { id: "stroke", label: "Ischemic stroke or TIA of atherosclerotic origin" },
  { id: "pad", label: "PAD" },
  { id: "polyvascular", label: "Polyvascular disease" },
  { id: "tod", label: "Diabetes target organ damage" },
  { id: "fh", label: "Familial hypercholesterolemia / strong family history" },
  { id: "hofh", label: "Homozygous familial hypercholesterolemia" },
  { id: "subclinical", label: "High coronary calcium / extensive plaque burden / subclinical high-risk burden" },
  { id: "ckd34", label: "CKD stage 3B or 4" },
  { id: "recurrent50", label: "Recurrent or progressive events despite LDL-C <50 mg/dL" },
  { id: "acs12", label: "Recurrent ACS within 12 months despite being on LDL goal" },
  { id: "sequelae30", label: "Ongoing ASCVD sequelae despite LDL-C ≤30 mg/dL and intensive therapy" },
];

const LAIExtremeRiskPredictor: React.FC = () => {
  const [inputs, setInputs] = useState<PredictorInputs>({
    age: "", sex: "male", ldl: "", nonhdl: "", apob: "", lpa: "", hba1c: "", egfr: "", hscrp: "",
  });
  const [riskFactorChecks, setRiskFactorChecks] = useState<Record<string, boolean>>({});
  const [modifierChecks, setModifierChecks] = useState<Record<string, boolean>>({});

  const updateInput = (field: keyof PredictorInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const toggleRF = (id: string) => setRiskFactorChecks(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleMod = (id: string) => setModifierChecks(prev => ({ ...prev, [id]: !prev[id] }));

  // Auto-derived risk factors
  const derivedRF = useMemo(() => {
    const age = parseFloat(inputs.age);
    const egfr = parseFloat(inputs.egfr);
    const hba1c = parseFloat(inputs.hba1c);
    const derived: Record<string, boolean> = {};
    if (!isNaN(age)) {
      derived.ageRisk = (inputs.sex === "male" && age >= 45) || (inputs.sex === "female" && age >= 55);
    }
    if (!isNaN(egfr)) derived.ckd = egfr < 60;
    if (!isNaN(hba1c) && hba1c > 7) derived.dm = true;
    return derived;
  }, [inputs.age, inputs.sex, inputs.egfr, inputs.hba1c]);

  const effectiveRF = useMemo(() => {
    const merged: Record<string, boolean> = { ...riskFactorChecks };
    Object.entries(derivedRF).forEach(([k, v]) => { if (v) merged[k] = true; });
    return merged;
  }, [riskFactorChecks, derivedRF]);

  const rfCount = useMemo(() => Object.values(effectiveRF).filter(Boolean).length, [effectiveRF]);

  // Classification algorithm
  const result = useMemo(() => {
    const ldl = parseFloat(inputs.ldl);
    const lpa = parseFloat(inputs.lpa);
    const m = modifierChecks;
    const dm = effectiveRF.dm || false;
    const rf = rfCount;

    let cat = "Unclassified";
    let target = "—";
    const why: string[] = [];
    let colorClass = "text-muted-foreground";
    let bgClass = "bg-muted/30";

    // Category C
    if (m.sequelae30 && m.ascvd && !isNaN(ldl) && ldl <= 30) {
      cat = "Extreme Risk C"; target = "10–15 mg/dL";
      why.push("Ongoing ASCVD sequelae despite LDL-C ≤30 mg/dL and intensive therapy.");
      colorClass = "text-pink-700 dark:text-pink-300"; bgClass = "bg-pink-100 dark:bg-pink-950/50";
    }
    // Category B
    else if ((m.cad && (dm || m.polyvascular || m.tod || rf >= 3)) || m.recurrent50 || m.acs12 || m.hofh) {
      cat = "Extreme Risk B"; target = "≤30 mg/dL";
      if (m.cad) why.push("CAD present with very-high-risk features.");
      if (m.recurrent50) why.push("Recurrent/progressive events despite LDL-C <50 mg/dL.");
      if (m.acs12) why.push("Recurrent ACS within 12 months despite LDL goal.");
      if (m.hofh) why.push("Homozygous familial hypercholesterolemia selected.");
      colorClass = "text-purple-700 dark:text-purple-300"; bgClass = "bg-purple-100 dark:bg-purple-950/50";
    }
    // Category A
    else if (
      (m.ascvd && (dm || m.fh || rf >= 3 || m.ckd34 || m.polyvascular || m.pad || m.stroke || (!isNaN(lpa) && lpa >= 50) || m.subclinical)) ||
      m.subclinical
    ) {
      cat = "Extreme Risk A"; target = "<50 mg/dL, optional ≤30 mg/dL";
      why.push("Very-high-risk ASCVD or equivalent burden detected.");
      if (m.ascvd && !m.cad && (m.stroke || m.pad)) why.push("CAD not required because other ASCVD territories qualify.");
      if (m.subclinical) why.push("High calcium / extensive plaque burden supports extreme-risk A assignment.");
      colorClass = "text-red-700 dark:text-red-300"; bgClass = "bg-red-100 dark:bg-red-950/50";
    }
    // Very High Risk
    else if (m.ascvd || m.hofh || (dm && (rf >= 3 || m.tod))) {
      cat = "Very High Risk"; target = "<50 mg/dL";
      if (m.ascvd) why.push("Established ASCVD present.");
      if (m.hofh) why.push("Homozygous FH present.");
      if (dm && (rf >= 3 || m.tod)) why.push("Diabetes with ≥3 risk factors or target-organ damage.");
      colorClass = "text-red-600 dark:text-red-400"; bgClass = "bg-red-50 dark:bg-red-950/30";
    }
    // Lower
    else {
      cat = "Lower than VHR / not classifiable here"; target = "Use standard LAI primary-prevention pathway";
      why.push("No extreme-risk or very-high-risk trigger selected.");
      colorClass = "text-green-700 dark:text-green-400"; bgClass = "bg-green-50 dark:bg-green-950/30";
    }

    return { cat, target, why, colorClass, bgClass };
  }, [inputs, modifierChecks, effectiveRF, rfCount]);

  // Generate EMR note
  const emrNote = useMemo(() => {
    const m = modifierChecks;
    const dm = effectiveRF.dm || false;
    const lines = [
      "LAI EXTREME RISK ASSESSMENT",
      `Predicted category: ${result.cat}`,
      `LDL-C target: ${result.target}`,
      `Established ASCVD: ${m.ascvd ? "Yes" : "No"}`,
      `Territories: CAD=${m.cad ? "Yes" : "No"}, Stroke/TIA=${m.stroke ? "Yes" : "No"}, PAD=${m.pad ? "Yes" : "No"}, Polyvascular=${m.polyvascular ? "Yes" : "No"}`,
      `Modifiers: DM=${dm ? "Yes" : "No"}, TOD=${m.tod ? "Yes" : "No"}, FH=${m.fh ? "Yes" : "No"}, HoFH=${m.hofh ? "Yes" : "No"}, CKD3B/4=${m.ckd34 ? "Yes" : "No"}, High plaque/CAC=${m.subclinical ? "Yes" : "No"}`,
      `Risk factor count: ${rfCount}`,
      `Labs: LDL-C=${inputs.ldl || "—"}, Non-HDL-C=${inputs.nonhdl || "—"}, ApoB=${inputs.apob || "—"}, Lp(a)=${inputs.lpa || "—"}, HbA1c=${inputs.hba1c || "—"}, eGFR=${inputs.egfr || "—"}, hsCRP=${inputs.hscrp || "—"}`,
      `Rationale: ${result.why.join(" ")}`,
    ];
    return lines.join("\n");
  }, [inputs, modifierChecks, effectiveRF, rfCount, result]);

  const copyNote = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(emrNote);
      toast.success("EMR note copied to clipboard");
    } catch { toast.error("Failed to copy"); }
  }, [emrNote]);

  const resetAll = () => {
    setInputs({ age: "", sex: "male", ldl: "", nonhdl: "", apob: "", lpa: "", hba1c: "", egfr: "", hscrp: "" });
    setRiskFactorChecks({});
    setModifierChecks({});
  };

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Patient Data</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Age</Label>
            <input type="number" value={inputs.age} onChange={e => updateInput("age", e.target.value)} placeholder="Years" className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input" />
          </div>
          <div>
            <Label className="text-xs">Sex</Label>
            <select value={inputs.sex} onChange={e => updateInput("sex", e.target.value as "male" | "female")} className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">LDL-C (mg/dL)</Label>
            <input type="number" value={inputs.ldl} onChange={e => updateInput("ldl", e.target.value)} placeholder="mg/dL" className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input" />
          </div>
          <div>
            <Label className="text-xs">Non-HDL-C (mg/dL)</Label>
            <input type="number" value={inputs.nonhdl} onChange={e => updateInput("nonhdl", e.target.value)} placeholder="mg/dL" className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input" />
          </div>
          <div>
            <Label className="text-xs">ApoB (mg/dL)</Label>
            <input type="number" value={inputs.apob} onChange={e => updateInput("apob", e.target.value)} placeholder="mg/dL" className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Lp(a) (mg/dL)</Label>
            <input type="number" value={inputs.lpa} onChange={e => updateInput("lpa", e.target.value)} placeholder="mg/dL" className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input" />
          </div>
          <div>
            <Label className="text-xs">HbA1c (%)</Label>
            <input type="number" value={inputs.hba1c} onChange={e => updateInput("hba1c", e.target.value)} placeholder="%" className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">eGFR (mL/min/1.73m²)</Label>
            <input type="number" value={inputs.egfr} onChange={e => updateInput("egfr", e.target.value)} placeholder="mL/min" className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input" />
          </div>
          <div>
            <Label className="text-xs">hsCRP (mg/L)</Label>
            <input type="number" value={inputs.hscrp} onChange={e => updateInput("hscrp", e.target.value)} placeholder="mg/L" className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input" />
          </div>
        </div>
      </div>

      {/* Major ASCVD Risk Factors */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Major ASCVD Risk Factors</p>
        <div className="space-y-1.5">
          {majorRiskFactors.map(rf => {
            const isAuto = rf.auto && derivedRF[rf.id];
            const checked = effectiveRF[rf.id] || false;
            return (
              <div key={rf.id} className={cn("flex items-center gap-2.5 p-2 rounded-md border transition-colors cursor-pointer hover:bg-muted/30", checked && "bg-primary/10 border-primary/30")} onClick={() => !isAuto && toggleRF(rf.id)}>
                <Checkbox checked={checked} disabled={!!isAuto} onCheckedChange={() => !isAuto && toggleRF(rf.id)} className="mt-0" />
                <span className="text-xs flex-1">{rf.label}</span>
                {isAuto && <Badge variant="outline" className="text-[10px]">Auto</Badge>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">Risk factor count: <strong className="ml-1">{rfCount}</strong></Badge>
          <span className="text-[10px] text-muted-foreground">CKD & DM auto-detect from labs</span>
        </div>
      </div>

      {/* ASCVD History & Extreme-Risk Modifiers */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">ASCVD History & Extreme-Risk Modifiers</p>
        <div className="space-y-1.5">
          {ascvdModifiers.map(mod => {
            const checked = modifierChecks[mod.id] || false;
            return (
              <div key={mod.id} className={cn("flex items-center gap-2.5 p-2 rounded-md border transition-colors cursor-pointer hover:bg-muted/30", checked && "bg-primary/10 border-primary/30")} onClick={() => toggleMod(mod.id)}>
                <Checkbox checked={checked} onCheckedChange={() => toggleMod(mod.id)} className="mt-0" />
                <span className="text-xs flex-1">{mod.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result */}
      <div className={cn("p-4 rounded-lg border-2 space-y-2", result.bgClass)}>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Predicted Category</p>
        <p className={cn("text-xl font-bold", result.colorClass)}>{result.cat}</p>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium">LDL target: {result.target}</span>
        </div>
        <p className="text-xs text-muted-foreground">{result.why.join(" ")}</p>
      </div>

      {/* Decision Logic */}
      <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
        <p className="font-semibold text-xs uppercase text-muted-foreground">Decision Logic</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Check <strong>Category C</strong> first: ongoing ASCVD sequelae despite LDL-C ≤30 and intensive therapy.</li>
          <li>Then <strong>Category B</strong>: CAD plus very-high-risk features or recurrent events despite LDL-C &lt;50.</li>
          <li>Then <strong>Category A</strong>: ASCVD or equivalent burden with diabetes, FH, CKD, Lp(a), stroke, PAD, polyvascular disease, or high calcium/plaque burden.</li>
          <li>If not extreme-risk, label <strong>Very High Risk</strong> when established ASCVD, homozygous FH, or diabetes with ≥3 major risk factors / target-organ damage.</li>
        </ol>
      </div>

      {/* Bucket Summary */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-2 border">Category</th>
              <th className="text-left p-2 border">Main Trigger</th>
              <th className="text-left p-2 border">LDL-C Target</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2 border font-medium text-pink-700 dark:text-pink-300">C</td><td className="p-2 border text-muted-foreground">Residual ASCVD sequelae despite LDL ≤30</td><td className="p-2 border">10–15 mg/dL</td></tr>
            <tr><td className="p-2 border font-medium text-purple-700 dark:text-purple-300">B</td><td className="p-2 border text-muted-foreground">CAD + very-high-risk features, or recurrent/progressive events despite LDL &lt;50</td><td className="p-2 border">≤30 mg/dL</td></tr>
            <tr><td className="p-2 border font-medium text-red-700 dark:text-red-300">A</td><td className="p-2 border text-muted-foreground">ASCVD/equivalent with major modifiers; CAD not mandatory</td><td className="p-2 border">&lt;50 mg/dL, optional ≤30</td></tr>
            <tr><td className="p-2 border font-medium text-red-600 dark:text-red-400">VHR</td><td className="p-2 border text-muted-foreground">ASCVD or equivalent very-high-risk state</td><td className="p-2 border">&lt;50 mg/dL</td></tr>
          </tbody>
        </table>
      </div>

      {/* EMR Note */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">EMR Note</p>
        <textarea value={emrNote} readOnly className="w-full min-h-[160px] px-3 py-2 text-xs border rounded-md bg-muted/30 border-input font-mono resize-y" />
        <div className="flex gap-2">
          <Button size="sm" onClick={copyNote} className="gap-1">
            <Copy className="h-3.5 w-3.5" />
            Copy Note
          </Button>
          <Button size="sm" variant="outline" onClick={resetAll} className="gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LAIExtremeRiskPredictor;
