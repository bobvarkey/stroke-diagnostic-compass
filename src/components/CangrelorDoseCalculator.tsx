import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Syringe, AlertTriangle, Info, Calculator, Activity, Clock, Droplets } from "lucide-react";
import ModuleCommentBox from "./ModuleCommentBox";

type Regimen = "low" | "intermediate" | "pci";

interface RegimenSpec {
  key: Regimen;
  label: string;
  bolusPerKg: number;
  infusionPerKg: number;
  source: string;
  notes: string[];
}

const REGIMENS: Record<Regimen, RegimenSpec> = {
  low: {
    key: "low",
    label: "Low-dose stroke (no bolus)",
    bolusPerKg: 0,
    infusionPerKg: 0.75,
    source: "Front Neurol 2021 — AIS case series; favored when sICH risk is high or post-IVT",
    notes: [
      "No loading bolus — reduces hemorrhagic risk",
      "Bridge to oral DAPT once safe (typically 4–6 h after stenting)",
      "Stop infusion ~1 h before transitioning to oral P2Y12 inhibitor",
    ],
  },
  intermediate: {
    key: "intermediate",
    label: "Intermediate stroke (neurointervention)",
    bolusPerKg: 15,
    infusionPerKg: 2,
    source: "AJNR 2020; SVIN 2024 (tandem lesions); JNIS 2025 multicenter",
    notes: [
      "Most commonly reported regimen for emergent cervical/intracranial stenting",
      "Onset of platelet inhibition <2 min; offset within 60 min of stopping",
      "Transition to oral DAPT: load → overlap 1 h → stop cangrelor",
    ],
  },
  pci: {
    key: "pci",
    label: "PCI / Cardiac (KENGREAL® label)",
    bolusPerKg: 30,
    infusionPerKg: 4,
    source: "FDA label — CHAMPION PHOENIX",
    notes: [
      "FDA-approved cardiac PCI dose — generally too aggressive for AIS post-IVT",
      "Continue ≥2 h or duration of PCI (whichever is longer), max 4 h cardiac",
      "Ticagrelor any time; clopidogrel/prasugrel only AFTER stopping",
    ],
  },
};

// Duration protocol presets (hours)
const DURATION_PRESETS: { value: string; label: string; hours: number; context: string }[] = [
  { value: "pci-2h", label: "PCI / EVT procedure", hours: 2, context: "Min FDA cardiac duration; cover stent deployment + early thrombosis risk" },
  { value: "post-evt-4h", label: "Post-EVT bridge (4 h)", hours: 4, context: "Short bridge until oral DAPT effective" },
  { value: "post-stent-12h", label: "Post-stenting (12 h)", hours: 12, context: "Extended cervical/intracranial stent coverage" },
  { value: "post-ivt-24h", label: "Post-IVT/EVT (24 h)", hours: 24, context: "Until safe to start oral DAPT after IVT washout" },
  { value: "extended-48h", label: "Extended (48 h)", hours: 48, context: "Refractory/recurrent occlusion; off-label" },
  { value: "custom", label: "Custom duration", hours: 0, context: "Enter manually below" },
];

export default function CangrelorDoseCalculator() {
  const [weight, setWeight] = useState<string>("");
  const [regimen, setRegimen] = useState<Regimen>("intermediate");
  const [comments, setComments] = useState<string>("");

  // Configurable vial
  const [vialMg, setVialMg] = useState<string>("50");
  const [diluentMl, setDiluentMl] = useState<string>("250");

  // Duration
  const [durationPreset, setDurationPreset] = useState<string>("post-evt-4h");
  const [customHours, setCustomHours] = useState<string>("4");

  // Heparin bridge workflow
  const [heparinBridge, setHeparinBridge] = useState<boolean>(false);
  const [heparinDose, setHeparinDose] = useState<"systemic" | "procedural" | "subq">("procedural");
  const [oralAgent, setOralAgent] = useState<"ticagrelor" | "clopidogrel" | "prasugrel">("ticagrelor");

  const weightNum = parseFloat(weight) || 0;
  const isValid = weightNum >= 30 && weightNum <= 200;
  const spec = REGIMENS[regimen];

  // Live final concentration from configurable vial fields
  const finalConcMcgPerMl = useMemo(() => {
    const mg = parseFloat(vialMg);
    const ml = parseFloat(diluentMl);
    if (!mg || !ml || mg <= 0 || ml <= 0) return 0;
    return (mg * 1000) / ml; // mg→mcg / mL
  }, [vialMg, diluentMl]);
  const finalConcMgPerMl = finalConcMcgPerMl / 1000;

  // Inline validation: unit / concentration / vial-vs-diluent sanity
  const dosingWarnings = useMemo(() => {
    const warnings: { level: "error" | "warn" | "info"; msg: string }[] = [];
    const mg = parseFloat(vialMg);
    const ml = parseFloat(diluentMl);

    // Vial strength sanity (Cangrelor vial = 50 mg lyophilized)
    if (vialMg !== "" && (isNaN(mg) || mg <= 0)) {
      warnings.push({ level: "error", msg: "Vial strength must be a positive number in mg." });
    } else if (!isNaN(mg) && mg > 0) {
      if (mg < 5) warnings.push({ level: "warn", msg: `Vial strength ${mg} mg looks too low — did you enter mcg instead of mg? (Standard cangrelor vial = 50 mg)` });
      if (mg > 200) warnings.push({ level: "warn", msg: `Vial strength ${mg} mg exceeds typical 50 mg vial — confirm you are not entering total bag mass.` });
    }

    // Diluent volume sanity
    if (diluentMl !== "" && (isNaN(ml) || ml <= 0)) {
      warnings.push({ level: "error", msg: "Diluent volume must be a positive number in mL." });
    } else if (!isNaN(ml) && ml > 0) {
      if (ml < 20) warnings.push({ level: "warn", msg: `Diluent ${ml} mL is unusually small — did you confuse vial reconstitution volume (5 mL) with the infusion bag (typically 250 mL)?` });
      if (ml > 500) warnings.push({ level: "warn", msg: `Diluent ${ml} mL is unusually large — final concentration will be very dilute and pump rates may exceed device limits.` });
    }

    // Cross-field concentration sanity (mcg/mL vs mg/mL unit checks)
    if (finalConcMcgPerMl > 0) {
      if (finalConcMcgPerMl < 50) {
        warnings.push({ level: "warn", msg: `Final concentration ${Math.round(finalConcMcgPerMl)} mcg/mL (${finalConcMgPerMl.toFixed(3)} mg/mL) is unusually dilute — pump rate will be high. Standard is 200 mcg/mL (0.2 mg/mL).` });
      } else if (finalConcMcgPerMl > 1000) {
        warnings.push({ level: "error", msg: `Final concentration ${Math.round(finalConcMcgPerMl)} mcg/mL (${finalConcMgPerMl.toFixed(2)} mg/mL) is dangerously concentrated — likely a unit error (mg vs mcg) or wrong bag size.` });
      } else if (Math.abs(finalConcMcgPerMl - 200) > 20) {
        warnings.push({ level: "info", msg: `Final concentration ${Math.round(finalConcMcgPerMl)} mcg/mL differs from the 200 mcg/mL (0.2 mg/mL) standard — confirm pump library entry.` });
      }
    }

    // Vial vs diluent ratio plausibility (catches swapped fields)
    if (!isNaN(mg) && !isNaN(ml) && mg > 0 && ml > 0 && mg > ml) {
      warnings.push({ level: "warn", msg: `Vial mass (${mg} mg) exceeds diluent volume (${ml} mL) — fields may be swapped. Cangrelor is typically 50 mg in 250 mL.` });
    }

    // Weight sanity
    if (weight !== "") {
      const w = parseFloat(weight);
      if (isNaN(w) || w <= 0) warnings.push({ level: "error", msg: "Weight must be a positive number in kg." });
      else if (w < 30) warnings.push({ level: "warn", msg: `Weight ${w} kg is below adult range — pediatric dosing not validated for cangrelor.` });
      else if (w > 200) warnings.push({ level: "warn", msg: `Weight ${w} kg exceeds 200 kg — consider capping at 200 kg actual body weight; consult pharmacy.` });
    }

    return warnings;
  }, [vialMg, diluentMl, finalConcMcgPerMl, finalConcMgPerMl, weight]);

  const hasErrors = dosingWarnings.some((w) => w.level === "error");

  const durationHours = useMemo(() => {
    if (durationPreset === "custom") return parseFloat(customHours) || 0;
    return DURATION_PRESETS.find((d) => d.value === durationPreset)?.hours ?? 0;
  }, [durationPreset, customHours]);

  const calc = useMemo(() => {
    if (!isValid || finalConcMcgPerMl <= 0 || hasErrors) return null;
    const bolusMcg = spec.bolusPerKg * weightNum;
    const infusionMcgMin = spec.infusionPerKg * weightNum;
    const infusionMcgHr = infusionMcgMin * 60;
    const pumpRateMlHr = infusionMcgHr / finalConcMcgPerMl;
    const bolusMl = bolusMcg / finalConcMcgPerMl;
    // Total drug for chosen duration
    const totalMcg = bolusMcg + infusionMcgMin * 60 * durationHours;
    const totalMg = totalMcg / 1000;
    const totalMl = totalMcg / finalConcMcgPerMl;
    const vialsUsed = parseFloat(vialMg) > 0 ? Math.ceil(totalMg / parseFloat(vialMg)) : 0;
    return {
      bolusMcg: Math.round(bolusMcg),
      bolusMg: Math.round((bolusMcg / 1000) * 100) / 100,
      bolusMl: Math.round(bolusMl * 10) / 10,
      infusionMcgMin: Math.round(infusionMcgMin),
      infusionMcgHr: Math.round(infusionMcgHr),
      pumpRateMlHr: Math.round(pumpRateMlHr * 10) / 10,
      totalMg: Math.round(totalMg * 10) / 10,
      totalMl: Math.round(totalMl),
      vialsUsed,
    };
  }, [weightNum, isValid, spec, finalConcMcgPerMl, durationHours, vialMg, hasErrors]);

  // Build infusion schedule timeline
  const schedule = useMemo(() => {
    if (!calc || durationHours <= 0) return [] as { t: string; event: string; tone: "start" | "step" | "transition" | "stop" }[];
    const events: { t: string; event: string; tone: "start" | "step" | "transition" | "stop" }[] = [];
    events.push({ t: "T = 0", event: spec.bolusPerKg > 0 ? `Cangrelor bolus ${calc.bolusMg} mg IV (${calc.bolusMl} mL) + start infusion ${calc.pumpRateMlHr} mL/hr` : `Start cangrelor infusion ${calc.pumpRateMlHr} mL/hr (no bolus)`, tone: "start" });

    if (heparinBridge) {
      if (heparinDose === "procedural") {
        events.push({ t: "T = 0–procedure end", event: "Procedural UFH 50–70 U/kg IV bolus, target ACT 250–300 s during stenting", tone: "step" });
      } else if (heparinDose === "systemic") {
        events.push({ t: "T = 0", event: "Start UFH infusion 12 U/kg/h IV; check aPTT q6h, target 1.5–2× control", tone: "step" });
      } else {
        events.push({ t: "T = 0", event: "Enoxaparin 1 mg/kg SQ q12h (or 40 mg daily for prophylaxis only)", tone: "step" });
      }
    }

    // Halfway monitoring marker
    if (durationHours >= 4) {
      events.push({ t: `T = ${Math.round(durationHours / 2)} h`, event: "Mid-infusion: neuro check, BP, recheck Hb/platelets", tone: "step" });
    }

    // Oral antiplatelet timing
    const stopHr = durationHours;
    const oralLoadHr = oralAgent === "ticagrelor" ? Math.max(0, stopHr - 1) : stopHr; // ticagrelor can overlap; thienopyridines after stop
    if (oralAgent === "ticagrelor") {
      events.push({ t: `T = ${oralLoadHr} h`, event: "Load Ticagrelor 180 mg PO (may be given anytime during infusion)", tone: "transition" });
    } else if (oralAgent === "clopidogrel") {
      events.push({ t: `T = ${stopHr} h (immediately after stop)`, event: "Load Clopidogrel 600 mg PO — receptor competition prohibits earlier dosing", tone: "transition" });
    } else {
      events.push({ t: `T = ${stopHr} h (immediately after stop)`, event: "Load Prasugrel 60 mg PO — only after cangrelor stopped", tone: "transition" });
    }

    if (heparinBridge && heparinDose === "systemic") {
      events.push({ t: `T = ${stopHr} h`, event: "Stop UFH infusion concurrently with cangrelor (avoid antithrombotic stacking)", tone: "stop" });
    }

    events.push({ t: `T = ${stopHr} h`, event: "Stop cangrelor infusion — platelet function recovers within 60 min", tone: "stop" });
    events.push({ t: `T = ${stopHr + 1} h`, event: "Verify ongoing oral DAPT effect; resume VTE prophylaxis if held", tone: "step" });
    return events;
  }, [calc, durationHours, spec, heparinBridge, heparinDose, oralAgent]);

  const toneClass = (tone: string) => {
    switch (tone) {
      case "start": return "bg-green-100 dark:bg-green-900/40 border-green-400 text-green-800 dark:text-green-300";
      case "step": return "bg-blue-50 dark:bg-blue-950/30 border-blue-300 text-blue-800 dark:text-blue-300";
      case "transition": return "bg-purple-50 dark:bg-purple-950/30 border-purple-300 text-purple-800 dark:text-purple-300";
      case "stop": return "bg-rose-100 dark:bg-rose-900/40 border-rose-400 text-rose-800 dark:text-rose-300";
      default: return "bg-muted/40 border-border";
    }
  };

  return (
    <Card className="border-rose-300 dark:border-rose-700 bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-background">
      <CardHeader className="bg-rose-100/50 dark:bg-rose-900/30">
        <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
          <Syringe className="h-5 w-5" />
          Cangrelor Infusion Calculator (IV P2Y12 Inhibitor)
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Configurable concentration • Protocol-window duration • Optional heparin bridge & oral DAPT transition
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {/* Patient + Vial Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="cangrelor-weight" className="text-rose-700 dark:text-rose-400 font-medium text-xs">
              Patient Weight (kg)
            </Label>
            <Input
              id="cangrelor-weight"
              type="number" min="30" max="200"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="30–200"
              className="mt-1 h-9 border-rose-200 dark:border-rose-700"
            />
          </div>
          <div>
            <Label htmlFor="cangrelor-vial" className="font-medium text-xs flex items-center gap-1">
              <Droplets className="h-3 w-3" /> Vial Strength (mg)
            </Label>
            <Input
              id="cangrelor-vial"
              type="number" min="1" max="500"
              value={vialMg}
              onChange={(e) => setVialMg(e.target.value)}
              placeholder="e.g. 50"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label htmlFor="cangrelor-diluent" className="font-medium text-xs flex items-center gap-1">
              <Droplets className="h-3 w-3" /> Diluent Bag (mL)
            </Label>
            <Input
              id="cangrelor-diluent"
              type="number" min="10" max="1000"
              value={diluentMl}
              onChange={(e) => setDiluentMl(e.target.value)}
              placeholder="e.g. 250"
              className="mt-1 h-9"
            />
          </div>
        </div>

        {finalConcMcgPerMl > 0 && (
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
            <strong>Live final concentration:</strong> {Math.round(finalConcMcgPerMl)} mcg/mL
            <span className="ml-2 opacity-80">({finalConcMgPerMl.toFixed(3)} mg/mL)</span>
          </div>
        )}

        {/* Inline dosing / unit validation warnings */}
        {dosingWarnings.length > 0 && (
          <div className="space-y-1.5">
            {dosingWarnings.map((w, i) => {
              const styles =
                w.level === "error"
                  ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300"
                  : w.level === "warn"
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                  : "bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300";
              const label = w.level === "error" ? "Error" : w.level === "warn" ? "Check" : "Note";
              return (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-md border text-xs ${styles}`}>
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div><strong>{label}:</strong> {w.msg}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Regimen Tabs */}
        <Tabs value={regimen} onValueChange={(v) => setRegimen(v as Regimen)}>
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="low" className="text-[11px] sm:text-xs whitespace-normal py-2">
              Low-dose<br /><span className="opacity-70">(no bolus)</span>
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="text-[11px] sm:text-xs whitespace-normal py-2">
              Intermediate<br /><span className="opacity-70">(stroke stenting)</span>
            </TabsTrigger>
            <TabsTrigger value="pci" className="text-[11px] sm:text-xs whitespace-normal py-2">
              PCI dose<br /><span className="opacity-70">(cardiac label)</span>
            </TabsTrigger>
          </TabsList>

          {(["low", "intermediate", "pci"] as Regimen[]).map((r) => {
            const s = REGIMENS[r];
            return (
              <TabsContent key={r} value={r} className="space-y-3 pt-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 text-sm">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Info className="h-4 w-4 text-rose-600" />
                    <span className="font-medium text-rose-800 dark:text-rose-300">{s.label}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {s.bolusPerKg > 0 ? `${s.bolusPerKg} mcg/kg bolus` : "No bolus"} • {s.infusionPerKg} mcg/kg/min
                    </Badge>
                  </div>
                  <ul className="text-xs text-rose-700 dark:text-rose-400 space-y-1 list-disc list-inside">
                    {s.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">Source: {s.source}</p>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Duration selector */}
        <div className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
          <Label className="text-xs font-medium text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Infusion Duration / Protocol Window
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select value={durationPreset} onValueChange={setDurationPreset}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DURATION_PRESETS.map((d) => (
                  <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {durationPreset === "custom" && (
              <Input
                type="number" min="0.5" max="96" step="0.5"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                placeholder="Hours"
                className="h-9 text-xs"
              />
            )}
          </div>
          <p className="text-[10px] text-indigo-700 dark:text-indigo-400 italic">
            {DURATION_PRESETS.find((d) => d.value === durationPreset)?.context}
          </p>
        </div>

        {/* Calculated Doses */}
        {isValid && calc ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {spec.bolusPerKg > 0 ? (
                <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-center border-2 border-amber-400">
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{calc.bolusMg} mg</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400">Bolus ({spec.bolusPerKg} mcg/kg)</div>
                  <div className="text-[10px] text-amber-500 mt-1">= {calc.bolusMl} mL @ {Math.round(finalConcMcgPerMl)} mcg/mL</div>
                </div>
              ) : (
                <div className="p-3 bg-muted/40 rounded-lg text-center border-2 border-dashed border-muted">
                  <div className="text-sm font-medium text-muted-foreground">No bolus</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Direct infusion start</div>
                </div>
              )}
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg text-center border-2 border-green-400">
                <div className="text-xl font-bold text-green-700 dark:text-green-300">{calc.pumpRateMlHr} mL/hr</div>
                <div className="text-[10px] text-green-600 dark:text-green-400">Pump rate ({spec.infusionPerKg} mcg/kg/min)</div>
                <div className="text-[10px] text-green-500 mt-1">= {calc.infusionMcgMin} mcg/min</div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-center border-2 border-purple-400">
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{calc.totalMg} mg</div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400">Total over {durationHours} h</div>
                <div className="text-[10px] text-purple-500 mt-1">≈ {calc.vialsUsed} vial(s) • {calc.totalMl} mL</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Enter weight (30–200 kg) and valid vial settings to calculate
          </div>
        )}

        {/* Heparin / Anticoagulant Bridge Workflow */}
        <div className="p-3 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="heparin-bridge" className="text-sm font-medium text-orange-800 dark:text-orange-300 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Heparin / Anticoagulant Bridge
            </Label>
            <Switch id="heparin-bridge" checked={heparinBridge} onCheckedChange={setHeparinBridge} />
          </div>
          {heparinBridge && (
            <div className="space-y-2">
              <div>
                <Label className="text-[11px] text-orange-700 dark:text-orange-400">Heparin strategy</Label>
                <Select value={heparinDose} onValueChange={(v) => setHeparinDose(v as typeof heparinDose)}>
                  <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="procedural" className="text-xs">Procedural UFH bolus (50–70 U/kg, ACT 250–300 s)</SelectItem>
                    <SelectItem value="systemic" className="text-xs">Systemic UFH infusion (12 U/kg/h, aPTT 1.5–2×)</SelectItem>
                    <SelectItem value="subq" className="text-xs">SQ Enoxaparin (1 mg/kg q12h, or 40 mg ppx only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Alert className="border-orange-300 bg-orange-100/50 dark:bg-orange-900/30 py-2">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <AlertDescription className="text-[11px] text-orange-800 dark:text-orange-300">
                  Concurrent UFH + cangrelor + planned oral DAPT increases bleeding risk. Avoid systemic UFH infusion if recent IVT (&lt;24 h alteplase / &lt;6 h TNK). Stop UFH at the same time as cangrelor to prevent antithrombotic stacking.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Oral agent selector */}
        <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20">
          <Label className="text-xs font-medium text-purple-800 dark:text-purple-300">Planned Oral P2Y12 (transition)</Label>
          <Select value={oralAgent} onValueChange={(v) => setOralAgent(v as typeof oralAgent)}>
            <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ticagrelor" className="text-xs">Ticagrelor 180 mg (overlap allowed)</SelectItem>
              <SelectItem value="clopidogrel" className="text-xs">Clopidogrel 600 mg (only after stop)</SelectItem>
              <SelectItem value="prasugrel" className="text-xs">Prasugrel 60 mg (only after stop; avoid prior stroke)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generated Schedule */}
        {schedule.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Infusion Schedule ({durationHours} h protocol)
            </h5>
            <div className="space-y-1.5">
              {schedule.map((ev, i) => (
                <div key={i} className={`p-2 rounded-md border text-xs flex items-start gap-2 ${toneClass(ev.tone)}`}>
                  <Badge variant="outline" className="text-[10px] shrink-0 bg-background/60">{ev.t}</Badge>
                  <span className="flex-1">{ev.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reconstitution */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Reconstitution Reference
          </h5>
          <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
            <li>Reconstitute 50 mg vial with 5 mL sterile water → 10 mg/mL</li>
            <li>Withdraw 5 mL and add to 250 mL NS or D5W → <strong>200 mcg/mL</strong> (standard)</li>
            <li>For other concentrations, edit vial mg & diluent mL above (live calc)</li>
            <li>Stable 12 h at room temperature; dedicated IV line</li>
          </ol>
        </div>

        {/* Safety */}
        <Alert className="border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>AIS safety:</strong> Cangrelor is OFF-LABEL for stroke. Use lowest effective regimen if recent IVT. Hold ≥1 h before LP, surgery, or EVD placement. Platelet function recovers within 60 min of stopping infusion.
          </AlertDescription>
        </Alert>

        <ModuleCommentBox
          value={comments}
          onChange={setComments}
          placeholder="Document indication, regimen, duration, heparin bridge plan, and oral DAPT transition timing..."
          label="Cangrelor Decision Notes"
        />

        <p className="text-[10px] text-muted-foreground text-center">
          Off-label in AIS. Refs: AJNR 2020;41:2094 • Front Neurol 2021;12:636682 • SVIN 2024;4:e001020 • JNIS 2025
        </p>
      </CardContent>
    </Card>
  );
}
