import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Syringe, AlertTriangle, Info, Calculator, Clock, ChevronDown } from "lucide-react";
import ModuleCommentBox from "./ModuleCommentBox";

interface DoseResult {
  totalDose: number;
  bolusDose: number;
  infusionDose: number;
  bolusVolume?: number;
  infusionVolume?: number;
  infusionRate?: number;
}

export default function ThrombolyticDoseCalculator() {
  const [weight, setWeight] = useState<string>("");
  const [activeAgent, setActiveAgent] = useState<"alteplase" | "tenecteplase" | "ia_tpa">("alteplase");
  const [comments, setComments] = useState<string>("");

  const weightNum = parseFloat(weight) || 0;
  const cappedWeight = Math.min(weightNum, 100); // Cap at 100kg for dosing

  // Intra-arterial tPA dosing: 0.225 mg/kg (weight-based)
  const iaTPADose = useMemo((): { dose: number; volume: number; maxDose: number } | null => {
    if (weightNum < 30 || weightNum > 200) return null;
    
    // 0.225 mg/kg, capped at 20mg max
    const calculatedDose = cappedWeight * 0.225;
    const dose = Math.min(Math.round(calculatedDose * 10) / 10, 20);
    const volume = Math.round(dose * 10) / 10; // 1 mg/mL concentration
    
    return {
      dose,
      volume,
      maxDose: 20
    };
  }, [weightNum, cappedWeight]);

  // Alteplase (tPA) dosing: 0.9 mg/kg, max 90mg, 10% bolus, 90% infusion over 60 min
  const alteplaseDose = useMemo((): DoseResult | null => {
    if (weightNum < 30 || weightNum > 200) return null;
    
    const totalDose = Math.min(cappedWeight * 0.9, 90);
    const bolusDose = totalDose * 0.1;
    const infusionDose = totalDose * 0.9;
    
    // Standard concentration: 1mg/mL after reconstitution
    const bolusVolume = bolusDose; // mL (1mg/mL)
    const infusionVolume = infusionDose; // mL (1mg/mL)
    const infusionRate = infusionVolume / 60; // mL/min over 60 minutes
    
    return {
      totalDose: Math.round(totalDose * 10) / 10,
      bolusDose: Math.round(bolusDose * 10) / 10,
      infusionDose: Math.round(infusionDose * 10) / 10,
      bolusVolume: Math.round(bolusVolume * 10) / 10,
      infusionVolume: Math.round(infusionVolume * 10) / 10,
      infusionRate: Math.round(infusionRate * 100) / 100
    };
  }, [weightNum, cappedWeight]);

  // Tenecteplase dosing: weight-based tiers (AHA 2024)
  const tenecteplaseDose = useMemo((): { dose: number; tier: string } | null => {
    if (weightNum < 30 || weightNum > 200) return null;
    
    // Standard Tenecteplase dosing for stroke (0.25 mg/kg, single bolus)
    // Weight-based tiers from clinical trials
    if (weightNum < 60) return { dose: 25, tier: "<60 kg" };
    if (weightNum < 70) return { dose: 30, tier: "60-<70 kg" };
    if (weightNum < 80) return { dose: 35, tier: "70-<80 kg" };
    if (weightNum < 90) return { dose: 40, tier: "80-<90 kg" };
    return { dose: 50, tier: "≥90 kg" };
  }, [weightNum]);

  const isValidWeight = weightNum >= 30 && weightNum <= 200;

  return (
    <Card className="border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 dark:from-amber-950/30 to-background">
      <CardHeader className="bg-amber-100/50 dark:bg-amber-900/30">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <Syringe className="h-5 w-5" />
          Thrombolytic Dose Calculator (tPA / Tenecteplase)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Weight Input */}
        <div className="max-w-xs">
          <Label htmlFor="weight" className="text-amber-700 dark:text-amber-400 font-medium">
            Patient Weight (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight in kg"
            min="30"
            max="200"
            className="mt-1 border-amber-200 dark:border-amber-700"
          />
          {weightNum > 100 && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              ⚠️ Dosing capped at 100kg equivalent
            </p>
          )}
        </div>

        {/* Agent Tabs */}
        <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as "alteplase" | "tenecteplase" | "ia_tpa")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alteplase" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm">
              IV Alteplase
            </TabsTrigger>
            <TabsTrigger value="tenecteplase" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs sm:text-sm">
              IV TNK
            </TabsTrigger>
            <TabsTrigger value="ia_tpa" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm">
              IA tPA
            </TabsTrigger>
          </TabsList>

          {/* Alteplase Tab */}
          <TabsContent value="alteplase" className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-300">IV Alteplase Protocol</span>
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Dose: 0.9 mg/kg (max 90 mg)</li>
                <li>10% as IV bolus over 1 minute</li>
                <li>90% as IV infusion over 60 minutes</li>
                <li>Standard concentration: 1 mg/mL after reconstitution</li>
              </ul>
            </div>

            {isValidWeight && alteplaseDose ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {alteplaseDose.totalDose} mg
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Dose</div>
                </div>
                <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-center border-2 border-amber-400">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {alteplaseDose.bolusDose} mg
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    Bolus (10%) — Push over 1 min
                  </div>
                  <div className="text-xs text-amber-500 mt-1">
                    = {alteplaseDose.bolusVolume} mL
                  </div>
                </div>
                <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-lg text-center border-2 border-green-400">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {alteplaseDose.infusionDose} mg
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Infusion (90%) over 60 min
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    = {alteplaseDose.infusionVolume} mL @ {alteplaseDose.infusionRate} mL/min
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Enter a valid weight (30-200 kg) to calculate dose
              </div>
            )}
          </TabsContent>

          {/* Tenecteplase Tab */}
          <TabsContent value="tenecteplase" className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-300">IV Tenecteplase Protocol</span>
              </div>
              <ul className="text-sm text-green-700 dark:text-green-400 space-y-1 list-disc list-inside">
                <li>Dose: 0.25 mg/kg (single IV bolus)</li>
                <li>Weight-tiered dosing (see table below)</li>
                <li>Administer as single bolus over 5 seconds</li>
                <li>AHA 2024: Non-inferior to Alteplase within 4.5h</li>
              </ul>
            </div>

            {/* Weight Tier Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-green-100 dark:bg-green-900/40">
                    <th className="p-2 border border-green-200 dark:border-green-700 text-left">Weight Range</th>
                    <th className="p-2 border border-green-200 dark:border-green-700 text-center">Dose (mg)</th>
                    <th className="p-2 border border-green-200 dark:border-green-700 text-center">Volume (mL)*</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { range: "<60 kg", dose: 25, volume: 5 },
                    { range: "60-<70 kg", dose: 30, volume: 6 },
                    { range: "70-<80 kg", dose: 35, volume: 7 },
                    { range: "80-<90 kg", dose: 40, volume: 8 },
                    { range: "≥90 kg", dose: 50, volume: 10 },
                  ].map((tier) => (
                    <tr 
                      key={tier.range}
                      className={
                        tenecteplaseDose?.tier === tier.range 
                          ? "bg-green-200 dark:bg-green-800/50 font-medium" 
                          : "bg-background"
                      }
                    >
                      <td className="p-2 border border-green-200 dark:border-green-700">{tier.range}</td>
                      <td className="p-2 border border-green-200 dark:border-green-700 text-center">{tier.dose} mg</td>
                      <td className="p-2 border border-green-200 dark:border-green-700 text-center">{tier.volume} mL</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-1">
                *Reconstituted to 5 mg/mL concentration
              </p>
            </div>

            {isValidWeight && tenecteplaseDose ? (
              <div className="p-6 bg-green-100 dark:bg-green-900/40 rounded-lg text-center border-2 border-green-400">
                <Badge className="mb-2 bg-green-600">{tenecteplaseDose.tier}</Badge>
                <div className="text-4xl font-bold text-green-700 dark:text-green-300">
                  {tenecteplaseDose.dose} mg
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Single IV bolus over 5 seconds
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 text-green-700 dark:text-green-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Push dose - No infusion required</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Enter a valid weight (30-200 kg) to calculate dose
              </div>
            )}
          </TabsContent>

          <TabsContent value="ia_tpa" className="space-y-3">
            {/* Weight-Based Dose Result */}
            {isValidWeight && iaTPADose ? (
              <div className="p-4 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-center border-2 border-purple-400">
                <Badge className="mb-2 bg-purple-600">0.225 mg/kg</Badge>
                <div className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                  {iaTPADose.dose} mg
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  = {iaTPADose.volume} mL at 1 mg/mL
                </div>
                <div className="text-xs text-purple-500 mt-2">
                  Max dose: {iaTPADose.maxDose} mg • Infusion over 10-15 min
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Enter a valid weight (30-200 kg) to calculate IA tPA dose
              </div>
            )}

            {/* Quick Protocol Summary */}
            <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 text-xs">
              <p className="text-purple-700 dark:text-purple-400">
                <strong>Protocol:</strong> 0.225 mg/kg (max 20mg) • 1 mg/mL concentration • 10-15 min infusion • Microcatheter distal to clot
              </p>
            </div>

            {/* Collapsible CHOICE-2 Evidence */}
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-lg border border-purple-300 dark:border-purple-600 hover:bg-purple-200/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600 text-white text-[10px]">CHOICE-2</Badge>
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-300">Trial Evidence</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-purple-600 transition-transform data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="p-3 bg-white dark:bg-gray-900/50 rounded-lg border border-purple-200 dark:border-purple-700 text-xs space-y-1">
                  <p><strong>Design:</strong> Phase III RCT of IA alteplase (10mg) vs placebo post-EVT in LVO</p>
                  <p><strong>Primary:</strong> Higher mRS 0-1 at 90 days with IA tPA</p>
                  <p><strong>Safety:</strong> No increase in sICH</p>
                  <p><strong>NNT:</strong> ~7 for excellent outcome</p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Collapsible Technique */}
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900/50 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors">
                  <span className="text-xs font-medium text-purple-800 dark:text-purple-300">Administration Technique</span>
                  <ChevronDown className="h-4 w-4 text-purple-600 transition-transform data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
                    <strong>1.</strong> Microcatheter distal to clot
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
                    <strong>2.</strong> Dilute to 1 mg/mL
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
                    <strong>3.</strong> ~1 mg/min infusion
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
                    <strong>4.</strong> Angio runs to assess
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Collapsible Patient Selection */}
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Patient Selection</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-amber-600 transition-transform data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-700">
                    <strong className="text-green-700 dark:text-green-400">✓ Include:</strong>
                    <ul className="list-disc list-inside mt-1 text-green-600 dark:text-green-500">
                      <li>Post-EVT, eTICI &lt;3</li>
                      <li>LVO (ICA, M1, M2)</li>
                      <li>Within 24h onset</li>
                      <li>No sICH on angio</li>
                    </ul>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-700">
                    <strong className="text-red-700 dark:text-red-400">✗ Exclude:</strong>
                    <ul className="list-disc list-inside mt-1 text-red-600 dark:text-red-500">
                      <li>Active ICH</li>
                      <li>Coagulopathy</li>
                      <li>Surgery &lt;14d</li>
                      <li>Uncontrolled HTN</li>
                    </ul>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
        </Tabs>

        {/* Clinical Warnings */}
        <Alert className="border-red-300 bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
            <strong>Critical Reminders:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Verify eligibility before administration (no absolute contraindications)</li>
              <li>Check BP &lt;185/110 mmHg before and maintain &lt;180/105 post-thrombolysis</li>
              <li>Hold anticoagulants and antiplatelets for 24h post-thrombolysis</li>
              <li>If proceeding to EVT: Consider Tenecteplase (bridging therapy)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* AHA 2024 Evidence Box */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <strong>AHA 2024 Guidelines:</strong> Tenecteplase (0.25 mg/kg) is non-inferior to Alteplase for acute ischemic stroke 
            within 4.5 hours. TNK offers practical advantages: single bolus, no infusion pump required, easier for pre-hospital 
            or drip-and-ship scenarios. (Class 1, LOE A)
          </p>
        </div>

        <ModuleCommentBox 
          value={comments}
          onChange={setComments}
          placeholder="Add thrombolytic administration notes, timing, or observations..."
          label="Thrombolytic Notes"
        />
      </CardContent>
    </Card>
  );
}
