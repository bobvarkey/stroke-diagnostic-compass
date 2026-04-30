import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Syringe, AlertTriangle, Info, Calculator, Activity } from "lucide-react";
import ModuleCommentBox from "./ModuleCommentBox";

type Regimen = "low" | "intermediate" | "pci";

interface RegimenSpec {
  key: Regimen;
  label: string;
  bolusPerKg: number; // mcg/kg (0 = no bolus)
  infusionPerKg: number; // mcg/kg/min
  bolusCap?: number; // mcg total cap
  source: string;
  notes: string[];
}

const REGIMENS: Record<Regimen, RegimenSpec> = {
  low: {
    key: "low",
    label: "Low-dose stroke (no bolus)",
    bolusPerKg: 0,
    infusionPerKg: 0.75,
    source: "Frontiers Neurol 2021 — AIS case series; favored when sICH risk is high or post-IVT",
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
      "Transition to oral DAPT: give loading dose, then stop cangrelor 1 h later",
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
      "Continue infusion ≥2 h or for duration of PCI (whichever is longer), max 4 h",
      "Ticagrelor may be given any time; clopidogrel/prasugrel only AFTER stopping cangrelor",
    ],
  },
};

// Standard reconstitution: 50 mg vial + 5 mL SWFI = 10 mg/mL,
// then dilute 1 vial in 250 mL bag = 200 mcg/mL final concentration
const FINAL_CONC_MCG_PER_ML = 200;

export default function CangrelorDoseCalculator() {
  const [weight, setWeight] = useState<string>("");
  const [regimen, setRegimen] = useState<Regimen>("intermediate");
  const [comments, setComments] = useState<string>("");

  const weightNum = parseFloat(weight) || 0;
  const isValid = weightNum >= 30 && weightNum <= 200;
  const spec = REGIMENS[regimen];

  const calc = useMemo(() => {
    if (!isValid) return null;
    const bolusMcg = spec.bolusPerKg * weightNum;
    const infusionMcgMin = spec.infusionPerKg * weightNum;
    const infusionMcgHr = infusionMcgMin * 60;
    const pumpRateMlHr = infusionMcgHr / FINAL_CONC_MCG_PER_ML;
    const bolusMl = bolusMcg / FINAL_CONC_MCG_PER_ML;
    return {
      bolusMcg: Math.round(bolusMcg),
      bolusMg: Math.round((bolusMcg / 1000) * 100) / 100,
      bolusMl: Math.round(bolusMl * 10) / 10,
      infusionMcgMin: Math.round(infusionMcgMin),
      infusionMcgHr: Math.round(infusionMcgHr),
      pumpRateMlHr: Math.round(pumpRateMlHr * 10) / 10,
    };
  }, [weightNum, isValid, spec]);

  return (
    <Card className="border-rose-300 dark:border-rose-700 bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-background">
      <CardHeader className="bg-rose-100/50 dark:bg-rose-900/30">
        <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
          <Syringe className="h-5 w-5" />
          Cangrelor Infusion Calculator (IV P2Y12 Inhibitor)
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Reversible IV P2Y12 — useful for emergent stenting in AIS when oral DAPT not feasible
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {/* Weight */}
        <div className="max-w-xs">
          <Label htmlFor="cangrelor-weight" className="text-rose-700 dark:text-rose-400 font-medium">
            Patient Weight (kg)
          </Label>
          <Input
            id="cangrelor-weight"
            type="number"
            min="30"
            max="200"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight in kg"
            className="mt-1 border-rose-200 dark:border-rose-700"
          />
        </div>

        {/* Regimen Tabs */}
        <Tabs value={regimen} onValueChange={(v) => setRegimen(v as Regimen)}>
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="low" className="text-[11px] sm:text-xs whitespace-normal py-2">
              Low-dose
              <br />
              <span className="opacity-70">(no bolus)</span>
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="text-[11px] sm:text-xs whitespace-normal py-2">
              Intermediate
              <br />
              <span className="opacity-70">(stroke stenting)</span>
            </TabsTrigger>
            <TabsTrigger value="pci" className="text-[11px] sm:text-xs whitespace-normal py-2">
              PCI dose
              <br />
              <span className="opacity-70">(cardiac label)</span>
            </TabsTrigger>
          </TabsList>

          {(["low", "intermediate", "pci"] as Regimen[]).map((r) => {
            const s = REGIMENS[r];
            return (
              <TabsContent key={r} value={r} className="space-y-3 pt-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-rose-600" />
                    <span className="font-medium text-rose-800 dark:text-rose-300">{s.label}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {s.bolusPerKg > 0 ? `${s.bolusPerKg} mcg/kg bolus` : "No bolus"} • {s.infusionPerKg} mcg/kg/min
                    </Badge>
                  </div>
                  <ul className="text-xs text-rose-700 dark:text-rose-400 space-y-1 list-disc list-inside">
                    {s.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">Source: {s.source}</p>
                </div>

                {isValid && calc ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {s.bolusPerKg > 0 ? (
                      <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-center border-2 border-amber-400">
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                          {calc.bolusMg} mg
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          Bolus ({s.bolusPerKg} mcg/kg) — IV push &lt;1 min
                        </div>
                        <div className="text-[11px] text-amber-500 mt-1">
                          = {calc.bolusMcg} mcg = {calc.bolusMl} mL @ 200 mcg/mL
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/40 rounded-lg text-center border-2 border-dashed border-muted">
                        <div className="text-sm font-medium text-muted-foreground">No bolus</div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Start infusion directly — minimizes bleeding risk
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-lg text-center border-2 border-green-400">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {calc.pumpRateMlHr} mL/hr
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Maintenance Infusion ({s.infusionPerKg} mcg/kg/min)
                      </div>
                      <div className="text-[11px] text-green-500 mt-1">
                        = {calc.infusionMcgMin} mcg/min = {calc.infusionMcgHr} mcg/hr
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                    <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Enter a valid weight (30–200 kg) to calculate dose
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Reconstitution */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Reconstitution & Concentration
          </h5>
          <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
            <li>Reconstitute 50 mg vial with 5 mL sterile water → 10 mg/mL</li>
            <li>Withdraw 5 mL and add to 250 mL NS or D5W bag</li>
            <li>Final concentration: <strong>200 mcg/mL</strong> (used in mL/hr above)</li>
            <li>Stable 12 h at room temperature; administer via dedicated IV line</li>
          </ol>
        </div>

        {/* Safety */}
        <Alert className="border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Safety considerations in AIS:</strong> Cangrelor is OFF-LABEL for stroke. Use lowest effective
            dose if recent IVT (last alteplase ≤24 h, last TNK ≤6 h). Avoid bolus if active sICH risk. Hold ≥1 h
            before LP, surgery, or external ventricular drain placement. Platelet function returns to baseline
            within 60 min of stopping infusion.
          </AlertDescription>
        </Alert>

        {/* Transition */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 text-xs">
          <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-1">
            Transition to Oral P2Y12 Inhibitor
          </h5>
          <ul className="text-purple-700 dark:text-purple-400 space-y-0.5 list-disc list-inside">
            <li><strong>Ticagrelor 180 mg:</strong> may be given any time during cangrelor infusion</li>
            <li><strong>Clopidogrel 600 mg / Prasugrel 60 mg:</strong> give ONLY after stopping cangrelor (receptor competition)</li>
            <li>Recommended overlap: load oral agent → continue cangrelor 1 h → stop infusion</li>
          </ul>
        </div>

        <ModuleCommentBox
          value={comments}
          onChange={setComments}
          placeholder="Document indication for cangrelor (e.g., emergent ICA stenting in tandem occlusion), regimen chosen, and transition plan to oral DAPT..."
          label="Cangrelor Decision Notes"
        />

        <p className="text-[10px] text-muted-foreground text-center">
          Off-label in AIS. Refs: AJNR 2020;41:2094 • Front Neurol 2021;12:636682 • SVIN 2024;4:e001020 • JNIS 2025 multicenter
        </p>
      </CardContent>
    </Card>
  );
}
