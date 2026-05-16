import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Syringe, AlertTriangle, Info, Calculator, Activity, FlaskConical } from "lucide-react";
import ModuleCommentBox from "./ModuleCommentBox";

/**
 * Tirofiban Dosing Calculator for Acute Ischemic Stroke
 *
 * Standard AIS protocol (off-label, used in SaTIS, TREND, ESCAPIST,
 * ADVENT, ASSET-IT, RESCUE BT trials & Chinese Stroke Association guidelines):
 *   Loading: 0.4 mcg/kg/min IV over 30 min
 *   Maintenance: 0.1 mcg/kg/min continuous IV for 24–72 h
 *
 * Renal: CrCl < 30 mL/min → reduce both rates by 50%.
 * IA rescue (during EVT): 0.25–1 mg IA bolus, may repeat q5 min, max ~1 mg.
 * SAO/progressive stroke consensus: cap total loading dose at 1 mg.
 */
export default function TirofibanDoseCalculator() {
  const [weight, setWeight] = useState<string>("");
  const [renalManualOverride, setRenalManualOverride] = useState(false);
  const [renalImpairedManual, setRenalImpairedManual] = useState(false);
  const [activeMode, setActiveMode] = useState<"iv" | "ia" | "post_ivt" | "instant">("iv");
  const [comments, setComments] = useState("");

  // CrCl (Cockcroft-Gault) inputs
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [scr, setScr] = useState<string>(""); // mg/dL
  const [instantStart, setInstantStart] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const formatTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())} (${pad(date.getDate())}/${pad(date.getMonth() + 1)})`;
  };
  const addMinutes = (base: Date, mins: number) => new Date(base.getTime() + mins * 60000);

  const weightNum = parseFloat(weight) || 0;
  const isValidWeight = weightNum >= 30 && weightNum <= 200;

  // Cockcroft-Gault CrCl (mL/min) — uses actual body weight from main weight field
  const ageNum = parseFloat(age) || 0;
  const scrNum = parseFloat(scr) || 0;
  const crclCalc = useMemo(() => {
    if (!ageNum || !scrNum || !weightNum) return null;
    const raw = ((140 - ageNum) * weightNum) / (72 * scrNum);
    const val = sex === "female" ? raw * 0.85 : raw;
    return Math.round(val * 10) / 10;
  }, [ageNum, scrNum, weightNum, sex]);

  const renalImpaired = renalManualOverride
    ? renalImpairedManual
    : crclCalc !== null
      ? crclCalc < 30
      : false;
  const setRenalImpaired = (v: boolean) => {
    setRenalManualOverride(true);
    setRenalImpairedManual(v);
  };

  const factor = renalImpaired ? 0.5 : 1;

  // Standard concentration: 50 mcg/mL (0.05 mg/mL) ready-to-use bag
  const CONC_MCG_PER_ML = 50;

  const ivDose = useMemo(() => {
    if (!isValidWeight) return null;
    const loadRate = 0.4 * factor; // mcg/kg/min
    const maintRate = 0.1 * factor; // mcg/kg/min

    // Loading: rate × weight × 30 min
    const loadingTotalMcg = loadRate * weightNum * 30;
    const loadingTotalMg = loadingTotalMcg / 1000;
    const loadingMlPerHr = (loadRate * weightNum * 60) / CONC_MCG_PER_ML; // mL/hr during 30 min
    const loadingVolumeMl = loadingTotalMcg / CONC_MCG_PER_ML;

    // Maintenance: per hour
    const maintMcgPerHr = maintRate * weightNum * 60;
    const maintMlPerHr = maintMcgPerHr / CONC_MCG_PER_ML;
    const maint24hMg = (maintMcgPerHr * 24) / 1000;

    // SAO cap: total loading should not exceed 1 mg
    const cappedLoadingMg = Math.min(loadingTotalMg, 1);

    return {
      loadRate: loadRate.toFixed(2),
      maintRate: maintRate.toFixed(2),
      loadingTotalMg: loadingTotalMg.toFixed(3),
      loadingVolumeMl: loadingVolumeMl.toFixed(2),
      loadingMlPerHr: loadingMlPerHr.toFixed(1),
      maintMcgPerHr: maintMcgPerHr.toFixed(1),
      maintMlPerHr: maintMlPerHr.toFixed(2),
      maint24hMg: maint24hMg.toFixed(2),
      cappedLoadingMg: cappedLoadingMg.toFixed(3),
      cappedTriggered: loadingTotalMg > 1,
    };
  }, [weightNum, isValidWeight, factor]);

  // INSTANT trial regimen (JAMA 2026): post-IV tenecteplase tirofiban for AIS
  // without large/medium vessel occlusion or cardioembolic source.
  // 30-min 0.3 mcg/kg/min bolus + 0.075 mcg/kg/min continuous infusion up to 47.5 h
  const instantDose = useMemo(() => {
    if (!isValidWeight) return null;
    const loadRate = 0.3 * factor; // mcg/kg/min over 30 min
    const maintRate = 0.075 * factor; // mcg/kg/min

    const loadingTotalMcg = loadRate * weightNum * 30;
    const loadingTotalMg = loadingTotalMcg / 1000;
    const loadingVolumeMl = loadingTotalMcg / CONC_MCG_PER_ML;
    const loadingMlPerHr = (loadRate * weightNum * 60) / CONC_MCG_PER_ML;

    const maintMcgPerHr = maintRate * weightNum * 60;
    const maintMlPerHr = maintMcgPerHr / CONC_MCG_PER_ML;
    const maintTotalMg = (maintMcgPerHr * 47.5) / 1000;
    const maintTotalMl = maintMlPerHr * 47.5;

    return {
      loadRate: loadRate.toFixed(3),
      maintRate: maintRate.toFixed(4),
      loadingTotalMg: loadingTotalMg.toFixed(3),
      loadingVolumeMl: loadingVolumeMl.toFixed(2),
      loadingMlPerHr: loadingMlPerHr.toFixed(2),
      maintMcgPerHr: maintMcgPerHr.toFixed(2),
      maintMlPerHr: maintMlPerHr.toFixed(2),
      maintTotalMg: maintTotalMg.toFixed(2),
      maintTotalMl: maintTotalMl.toFixed(1),
    };
  }, [weightNum, isValidWeight, factor]);

  return (
    <Card className="border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50 dark:from-cyan-950/30 to-background">
      <CardHeader className="bg-cyan-100/50 dark:bg-cyan-900/30">
        <CardTitle className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300">
          <Syringe className="h-5 w-5" />
          Tirofiban Infusion Dose Calculator (Acute Ischemic Stroke)
        </CardTitle>
        <p className="text-xs text-cyan-700/80 dark:text-cyan-400/80 mt-1">
          GP IIb/IIIa inhibitor — off-label in AIS. Doses lower than cardiac protocols.
          Based on SaTIS, TREND, ESCAPIST, ADVENT, ASSET-IT, RESCUE BT.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tiro-weight" className="text-cyan-700 dark:text-cyan-400 font-medium">
              Patient Weight (kg)
            </Label>
            <Input
              id="tiro-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
              min="30"
              max="200"
              className="mt-1 border-cyan-200 dark:border-cyan-700"
            />
          </div>
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-cyan-200 dark:border-cyan-700 bg-background/60">
            <div>
              <Label className="text-cyan-700 dark:text-cyan-400 font-medium text-sm">
                Renal impairment (CrCl &lt; 30 mL/min)
              </Label>
              <p className="text-xs text-muted-foreground">
                {renalManualOverride
                  ? "Manual override active"
                  : crclCalc !== null
                    ? `Auto from CrCl ${crclCalc} mL/min`
                    : "Enter age & creatinine to auto-detect"}
              </p>
            </div>
            <Switch checked={renalImpaired} onCheckedChange={setRenalImpaired} />
          </div>
        </div>

        {/* CrCl (Cockcroft-Gault) calculator */}
        <div className="p-3 rounded-lg border border-cyan-200 dark:border-cyan-700 bg-background/60 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-800 dark:text-cyan-300">
                Creatinine Clearance (Cockcroft-Gault)
              </span>
            </div>
            {crclCalc !== null && (
              <Badge
                className={
                  crclCalc < 30
                    ? "bg-red-600"
                    : crclCalc < 60
                      ? "bg-amber-600"
                      : "bg-green-600"
                }
              >
                CrCl {crclCalc} mL/min
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="tiro-age" className="text-xs">Age (yr)</Label>
              <Input id="tiro-age" type="number" min="18" max="120" value={age}
                onChange={(e) => setAge(e.target.value)} placeholder="e.g. 68" className="mt-1 h-9" />
            </div>
            <div>
              <Label htmlFor="tiro-scr" className="text-xs">S. Creatinine (mg/dL)</Label>
              <Input id="tiro-scr" type="number" step="0.1" min="0.1" max="15" value={scr}
                onChange={(e) => setScr(e.target.value)} placeholder="e.g. 1.2" className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs">Sex</Label>
              <div className="mt-1 inline-flex rounded-md border border-cyan-200 dark:border-cyan-700 overflow-hidden h-9">
                <button type="button" onClick={() => setSex("male")}
                  className={`px-3 text-xs font-medium ${sex === "male" ? "bg-cyan-600 text-white" : "bg-background"}`}>
                  Male
                </button>
                <button type="button" onClick={() => setSex("female")}
                  className={`px-3 text-xs font-medium ${sex === "female" ? "bg-cyan-600 text-white" : "bg-background"}`}>
                  Female (×0.85)
                </button>
              </div>
            </div>
          </div>
          {crclCalc !== null && (
            <div className="text-[11px] text-muted-foreground">
              Formula: ((140 − {ageNum}) × {weightNum} kg) / (72 × {scrNum}){sex === "female" ? " × 0.85" : ""} ={" "}
              <strong>{crclCalc} mL/min</strong>
              {crclCalc < 30 && " — severe impairment, halved rates applied"}
              {crclCalc >= 30 && crclCalc < 60 && " — moderate impairment, monitor closely"}
            </div>
          )}
          {renalManualOverride && (
            <button type="button" onClick={() => setRenalManualOverride(false)}
              className="text-[11px] underline text-cyan-700 dark:text-cyan-400">
              Clear manual override & use calculated CrCl
            </button>
          )}
        </div>

        {renalImpaired && (
          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
              <strong>Renal dose adjustment active:</strong> Loading 0.2 mcg/kg/min · Maintenance 0.05 mcg/kg/min
            </AlertDescription>
          </Alert>
        )}

        {/* Mode tabs */}
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as typeof activeMode)}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="iv" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-[11px] sm:text-sm">
              Standard IV
            </TabsTrigger>
            <TabsTrigger value="post_ivt" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-[11px] sm:text-sm">
              Post-IVT/EVT
            </TabsTrigger>
            <TabsTrigger value="instant" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-[11px] sm:text-sm">
              Post-TNK (INSTANT)
            </TabsTrigger>
            <TabsTrigger value="ia" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[11px] sm:text-sm">
              IA Rescue
            </TabsTrigger>
          </TabsList>

          {/* IV Standard */}
          <TabsContent value="iv" className="space-y-4">
            <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-cyan-600" />
                <span className="font-medium text-cyan-800 dark:text-cyan-300">Standard AIS IV Protocol</span>
              </div>
              <ul className="text-sm text-cyan-700 dark:text-cyan-400 space-y-1 list-disc list-inside">
                <li>Loading: <strong>0.4 mcg/kg/min IV × 30 min</strong></li>
                <li>Maintenance: <strong>0.1 mcg/kg/min continuous IV</strong></li>
                <li>Duration: 24–72 hours typically</li>
                <li>Standard concentration: 50 mcg/mL (ready-to-use bag)</li>
                <li>SAO / progressive stroke: cap total loading at <strong>1 mg</strong></li>
              </ul>
            </div>

            {isValidWeight && ivDose ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-lg border-2 border-amber-400">
                    <Badge className="mb-2 bg-amber-600">Loading Infusion</Badge>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      {ivDose.loadingTotalMg} mg
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      total over 30 min ({ivDose.loadRate} mcg/kg/min × {weightNum} kg)
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                      = <strong>{ivDose.loadingVolumeMl} mL</strong> @ 50 mcg/mL<br />
                      Pump rate: <strong>{ivDose.loadingMlPerHr} mL/hr</strong> × 30 min
                    </div>
                    {ivDose.cappedTriggered && (
                      <div className="mt-2 p-2 bg-amber-200/60 dark:bg-amber-800/40 rounded text-[11px] text-amber-800 dark:text-amber-200">
                        ⚠ SAO cap: total loading should not exceed <strong>1 mg</strong> ({ivDose.cappedLoadingMg} mg suggested cap).
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400">
                    <Badge className="mb-2 bg-green-600">Maintenance Infusion</Badge>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {ivDose.maintMlPerHr} mL/hr
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      = {ivDose.maintMcgPerHr} mcg/hr ({ivDose.maintRate} mcg/kg/min × {weightNum} kg)
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-400 mt-2">
                      24-h total: <strong>{ivDose.maint24hMg} mg</strong><br />
                      Continue 24–72 h per protocol
                    </div>
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

          {/* Post IVT / EVT */}
          <TabsContent value="post_ivt" className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-300">Post-Thrombolysis / Post-EVT (ADVENT, ASSET-IT)</span>
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Initiate <strong>within 6 h</strong> of thrombolysis</li>
                <li>Same regimen: 0.4 mcg/kg/min × 30 min → 0.1 mcg/kg/min</li>
                <li>Maintain for <strong>24 hours</strong> typically</li>
                <li>Bridge to oral antiplatelet (ASA ± clopidogrel) at end of infusion</li>
                <li>Hold if any sICH suspicion — obtain immediate non-contrast CT</li>
              </ul>
            </div>

            {isValidWeight && ivDose && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg border-2 border-blue-400">
                  <Badge className="mb-2 bg-blue-600">Loading (30 min)</Badge>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {ivDose.loadingMlPerHr} mL/hr
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Total {ivDose.loadingTotalMg} mg ({ivDose.loadingVolumeMl} mL)
                  </div>
                </div>
                <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg border-2 border-blue-400">
                  <Badge className="mb-2 bg-blue-600">Maintenance × 24 h</Badge>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {ivDose.maintMlPerHr} mL/hr
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    24-h total: {ivDose.maint24hMg} mg
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* IA Rescue */}
          {/* INSTANT post-TNK regimen */}
          <TabsContent value="instant" className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  Post-Tenecteplase — INSTANT Trial Regimen (JAMA 2026)
                </span>
              </div>
              <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                <li>Population: AIS <strong>without</strong> large/medium vessel occlusion or cardioembolic source, with insufficient response to IV TNK</li>
                <li>Loading: <strong>0.3 mcg/kg/min IV × 30 min</strong> (lower than standard 0.4)</li>
                <li>Maintenance: <strong>0.075 mcg/kg/min</strong> continuous IV (lower than standard 0.1)</li>
                <li>Duration: <strong>up to 47.5 hours</strong></li>
                <li>Standard concentration: 50 mcg/mL ready-to-use bag</li>
                <li>Outcome: 63.8% vs 52.2% excellent mRS 0–1 at 90 d (RR 1.22; P = .03)</li>
              </ul>
            </div>

            {renalImpaired && (
              <Alert className="border-amber-400 bg-amber-100/60 dark:bg-amber-900/30">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Renal adjustment applied to INSTANT regimen:</strong> Loading 0.15 mcg/kg/min · Maintenance 0.0375 mcg/kg/min (50% reduction for CrCl &lt; 30 mL/min). INSTANT trial excluded severe renal impairment — use with caution and document rationale.
                </AlertDescription>
              </Alert>
            )}

            {isValidWeight && instantDose && parseFloat(instantDose.loadingTotalMg) > 1 && (
              <Alert className="border-red-300 bg-red-50 dark:bg-red-950/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs text-red-700 dark:text-red-400">
                  <strong>Loading dose cap warning:</strong> Calculated loading {instantDose.loadingTotalMg} mg exceeds the conservative 1 mg ceiling used in SAO/AIS protocols. Consider capping loading at 1 mg.
                </AlertDescription>
              </Alert>
            )}

            {isValidWeight && instantDose ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-lg border-2 border-amber-400">
                  <Badge className="mb-2 bg-amber-600">Loading (30 min)</Badge>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {instantDose.loadingMlPerHr} mL/hr
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {instantDose.loadRate} mcg/kg/min × {weightNum} kg
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                    Total: <strong>{instantDose.loadingTotalMg} mg</strong> ({instantDose.loadingVolumeMl} mL @ 50 mcg/mL)
                  </div>
                </div>
                <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-lg border-2 border-amber-400">
                  <Badge className="mb-2 bg-amber-600">Maintenance × up to 47.5 h</Badge>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {instantDose.maintMlPerHr} mL/hr
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    = {instantDose.maintMcgPerHr} mcg/hr ({instantDose.maintRate} mcg/kg/min)
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                    47.5-h total: <strong>{instantDose.maintTotalMg} mg</strong> ({instantDose.maintTotalMl} mL)
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Enter a valid weight (30–200 kg) to calculate INSTANT regimen
              </div>
            )}

            {isValidWeight && instantDose && (() => {
              const startDate = instantStart ? new Date(instantStart) : new Date();
              if (isNaN(startDate.getTime())) return null;
              const loadEnd = addMinutes(startDate, 30);
              const stop = addMinutes(loadEnd, 47.5 * 60);
              const platelet1 = addMinutes(startDate, 2 * 60);
              const platelet2 = addMinutes(startDate, 6 * 60);
              const checkpoints = [6, 12, 24, 36].map((h) => ({ h, t: addMinutes(startDate, h * 60) }));
              const cumMg = (parseFloat(instantDose.loadingTotalMg) + parseFloat(instantDose.maintTotalMg)).toFixed(2);
              const cumMl = (parseFloat(instantDose.loadingVolumeMl) + parseFloat(instantDose.maintTotalMl)).toFixed(1);
              return (
                <div className="rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-background/60 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                      INSTANT Infusion Timeline & Pump Schedule
                    </span>
                  </div>
                  <div>
                    <Label htmlFor="instant-start" className="text-xs text-amber-700 dark:text-amber-400">
                      Start time (loading bolus begins)
                    </Label>
                    <Input
                      id="instant-start"
                      type="datetime-local"
                      value={instantStart}
                      onChange={(e) => setInstantStart(e.target.value)}
                      className="mt-1 border-amber-200 dark:border-amber-700 max-w-xs"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                          <th className="p-2 text-left border border-amber-200 dark:border-amber-800">Step</th>
                          <th className="p-2 text-left border border-amber-200 dark:border-amber-800">Time</th>
                          <th className="p-2 text-left border border-amber-200 dark:border-amber-800">Pump rate</th>
                          <th className="p-2 text-left border border-amber-200 dark:border-amber-800">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-amber-900 dark:text-amber-200">
                        <tr>
                          <td className="p-2 border border-amber-200 dark:border-amber-800 font-medium">1. Start loading</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">{formatTime(startDate)}</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800"><strong>{instantDose.loadingMlPerHr} mL/hr</strong></td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">{instantDose.loadRate} mcg/kg/min × 30 min</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-amber-200 dark:border-amber-800 font-medium">2. Switch to maintenance</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">{formatTime(loadEnd)}</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800"><strong>{instantDose.maintMlPerHr} mL/hr</strong></td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">Drop to {instantDose.maintRate} mcg/kg/min</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-amber-200 dark:border-amber-800 font-medium">3. Platelets / Hb</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">{formatTime(platelet1)} · {formatTime(platelet2)}</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">—</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">CBC at 2 h & 6 h; hold if plt &lt; 90</td>
                        </tr>
                        {checkpoints.map((cp) => (
                          <tr key={cp.h}>
                            <td className="p-2 border border-amber-200 dark:border-amber-800 font-medium">Checkpoint {cp.h} h</td>
                            <td className="p-2 border border-amber-200 dark:border-amber-800">{formatTime(cp.t)}</td>
                            <td className="p-2 border border-amber-200 dark:border-amber-800">{instantDose.maintMlPerHr} mL/hr</td>
                            <td className="p-2 border border-amber-200 dark:border-amber-800">NIHSS, BP &lt; 180/105, bleeding survey</td>
                          </tr>
                        ))}
                        <tr className="bg-amber-50 dark:bg-amber-950/40">
                          <td className="p-2 border border-amber-200 dark:border-amber-800 font-medium">Stop infusion</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800"><strong>{formatTime(stop)}</strong></td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">0 mL/hr</td>
                          <td className="p-2 border border-amber-200 dark:border-amber-800">End at 48 h total; bridge to oral antiplatelet</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">
                    Cumulative dose at stop: <strong>{cumMg} mg</strong> ({cumMl} mL @ 50 mcg/mL){renalImpaired && " — renal-adjusted (50%)"}
                  </div>
                </div>
              );
            })()}

            <Alert className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Reference:</strong> INSTANT Trial Investigators. Intravenous tirofiban after tenecteplase in
                acute ischemic stroke: the INSTANT randomized clinical trial. <em>JAMA</em>. Published online May 8, 2026.
                doi:10.1001/jama.2026.5245
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* IA Rescue */}
          <TabsContent value="ia" className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-300">Intra-Arterial Rescue (during EVT)</span>
              </div>
              <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1 list-disc list-inside">
                <li>Small IA boluses: <strong>0.25–0.5 mg</strong> via microcatheter</li>
                <li>May repeat <strong>every 5 minutes</strong> as needed</li>
                <li>Maximum total IA dose: ~<strong>1 mg</strong> (weight-based, do not exceed)</li>
                <li>Indications: re-occlusion, in-stent thrombosis, distal emboli, no-reflow</li>
                <li>Consider follow-on IV maintenance infusion (0.1 mcg/kg/min × 24 h)</li>
              </ul>
            </div>

            {isValidWeight && (
              <div className="p-4 bg-purple-100 dark:bg-purple-900/40 rounded-lg border-2 border-purple-400 text-center">
                <Badge className="mb-2 bg-purple-600">IA Bolus Range</Badge>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  0.25 – 1 mg
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                  Per bolus 0.25–0.5 mg • Repeat q5 min • Max cumulative ~1 mg
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-400 mt-3">
                  Dilute to 50 mcg/mL → 1 mg = <strong>20 mL</strong>; 0.25 mg = <strong>5 mL</strong>; 0.5 mg = <strong>10 mL</strong>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Safety / Monitoring */}
        <Alert className="border-red-300 bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
            <strong>Safety & Monitoring:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Check <strong>platelets & hemoglobin at 2–6 h</strong> after starting, then daily — risk of acute thrombocytopenia</li>
              <li>Hold for platelets &lt; 90 × 10⁹/L or active bleeding</li>
              <li>Maintain BP &lt; 180/105 mmHg throughout infusion</li>
              <li>Avoid concomitant anticoagulants unless specifically indicated</li>
              <li>Renal dosing: CrCl &lt; 30 mL/min → halve both rates (toggle above)</li>
              <li>Off-label in AIS — document indication and informed consent per local policy</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Evidence */}
        <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-700 rounded-lg">
          <p className="text-xs text-cyan-700 dark:text-cyan-400">
            <strong>Evidence:</strong> RESCUE BT (NEJM 2023;388:2025-2036) — IV tirofiban improved 90-day functional outcome
            in selected AIS patients undergoing EVT without significantly increasing sICH. Also supported by SaTIS, TREND,
            ESCAPIST, ADVENT, ASSET-IT, and Chinese Stroke Association consensus guidelines.
          </p>
        </div>

        <ModuleCommentBox
          value={comments}
          onChange={setComments}
          placeholder="Document tirofiban indication, dose, renal status, platelet monitoring plan..."
          label="Tirofiban Decision Notes"
        />
      </CardContent>
    </Card>
  );
}
