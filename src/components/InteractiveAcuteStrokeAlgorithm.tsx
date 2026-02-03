import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ArrowRight, ChevronDown, Zap, Clock, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlgorithmInputs {
  lastKnownWell: string;
  nihssScore: string;
  premorbidMRS: string;
  disablingDeficit: string;
  lvoStatus: string;
  imagingType: string;
  coreVolume: string;
  mismatchRatio: string;
  // Antithrombotic decision inputs
  afStatus: string;
  strokeClassification: string;
  cardioembolicSource: string;
  symptomOnsetToPresentation: string;
  highBleedingRisk: string;
}

const InteractiveAcuteStrokeAlgorithm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [inputs, setInputs] = useState<AlgorithmInputs>({
    lastKnownWell: "",
    nihssScore: "",
    premorbidMRS: "",
    disablingDeficit: "",
    lvoStatus: "",
    imagingType: "",
    coreVolume: "",
    mismatchRatio: "",
    // Antithrombotic decision inputs
    afStatus: "",
    strokeClassification: "",
    cardioembolicSource: "",
    symptomOnsetToPresentation: "",
    highBleedingRisk: "",
  });

  const updateInput = (field: keyof AlgorithmInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculate time from last known well
  const timeFromOnset = useMemo(() => {
    if (!inputs.lastKnownWell) return null;
    const hours = parseFloat(inputs.lastKnownWell);
    if (isNaN(hours)) return null;
    return hours;
  }, [inputs.lastKnownWell]);

  // NIHSS score parsing
  const nihss = useMemo(() => {
    if (!inputs.nihssScore) return null;
    const score = parseInt(inputs.nihssScore);
    if (isNaN(score)) return null;
    return score;
  }, [inputs.nihssScore]);

  // mRS parsing
  const mrs = useMemo(() => {
    if (!inputs.premorbidMRS) return null;
    const score = parseInt(inputs.premorbidMRS);
    if (isNaN(score) || score < 0 || score > 5) return null;
    return score;
  }, [inputs.premorbidMRS]);

  // Core volume parsing
  const coreVol = useMemo(() => {
    if (!inputs.coreVolume) return null;
    const vol = parseFloat(inputs.coreVolume);
    if (isNaN(vol)) return null;
    return vol;
  }, [inputs.coreVolume]);

  // Mismatch ratio parsing
  const mismatchRat = useMemo(() => {
    if (!inputs.mismatchRatio) return null;
    const ratio = parseFloat(inputs.mismatchRatio);
    if (isNaN(ratio)) return null;
    return ratio;
  }, [inputs.mismatchRatio]);

  // Determine which pathways should be highlighted
  const pathwayState = useMemo(() => {
    const hasTimeInput = timeFromOnset !== null;
    const hasNIHSS = nihss !== null;
    const hasMRS = mrs !== null;
    const hasDisabling = inputs.disablingDeficit !== "";
    const hasLVO = inputs.lvoStatus !== "";
    const hasImaging = inputs.imagingType !== "";
    const hasCore = coreVol !== null;
    const hasMismatch = mismatchRat !== null;

    // Window determinations
    const inIVTWindow = hasTimeInput && timeFromOnset !== null && timeFromOnset <= 4.5;
    const inExtendedIVTWindow = hasTimeInput && timeFromOnset !== null && timeFromOnset > 4.5 && timeFromOnset <= 9;
    const inEVTWindow = hasTimeInput && timeFromOnset !== null && timeFromOnset >= 6 && timeFromOnset <= 24;
    const inLateWindow = hasTimeInput && timeFromOnset !== null && timeFromOnset > 4.5;

    // Treatment pathway determinations
    const isDisabling = inputs.disablingDeficit === "disabling";
    const isNonDisabling = inputs.disablingDeficit === "non-disabling";
    const hasLVOConfirmed = inputs.lvoStatus === "lvo_positive";
    const hasBasilar = inputs.lvoStatus === "basilar";
    const hasNoLVO = inputs.lvoStatus === "lvo_negative";

    // IVT eligibility
    const ivtEligible = inIVTWindow && isDisabling && hasNIHSS;
    const daptPreferred = inIVTWindow && isNonDisabling;

    // Extended IVT eligibility (4.5-9h with imaging criteria)
    const extendedIVTEligible = inExtendedIVTWindow && hasImaging && 
      ((coreVol !== null && coreVol < 70) || (mismatchRat !== null && mismatchRat > 1.2));

    // EVT eligibility
    const standardEVTEligible = (inEVTWindow || inIVTWindow) && hasLVOConfirmed && 
      ((coreVol !== null && coreVol < 70) || !hasCore);
    
    const largeCoreEVT = inEVTWindow && hasLVOConfirmed && coreVol !== null && coreVol >= 70 && coreVol <= 100;
    
    const basilarEVT = hasBasilar && nihss !== null && nihss >= 10 && 
      hasTimeInput && timeFromOnset !== null && timeFromOnset <= 24;

    // Bridging therapy
    const bridgingTherapy = ivtEligible && hasLVOConfirmed;

    // No LVO - Medical Management pathway
    const noLVOMedicalManagement = hasNoLVO && hasTimeInput;

    // Antithrombotic decision logic
    const hasAF = inputs.afStatus === "af_confirmed" || inputs.afStatus === "af_paroxysmal";
    const hasCardioembolicSource = inputs.cardioembolicSource === "yes" || hasAF;
    const isMinorStroke = inputs.strokeClassification === "minor_stroke" || inputs.strokeClassification === "tia";
    const isTIA = inputs.strokeClassification === "tia";
    const isWithin24h = inputs.symptomOnsetToPresentation === "within_24h";
    const hasHighBleedingRisk = inputs.highBleedingRisk === "yes";

    // Antithrombotic recommendations
    // OAC/NOAC: If AF or cardioembolic source confirmed
    const recommendOAC = hasNoLVO && hasCardioembolicSource;
    
    // DAPT: Minor stroke (NIHSS ≤3-5) or TIA within 24h of onset, no AF
    const recommendDAPT = hasNoLVO && isMinorStroke && isWithin24h && !hasCardioembolicSource && !hasHighBleedingRisk;
    
    // SAPT: Default for non-cardioembolic, not eligible for DAPT, or high bleeding risk
    const recommendSAPT = hasNoLVO && !hasCardioembolicSource && (!isMinorStroke || !isWithin24h || hasHighBleedingRisk);

    // Determine which antithrombotic input section to show
    const showAntithromboticInputs = hasNoLVO;

    return {
      hasTimeInput,
      hasNIHSS,
      hasMRS,
      hasDisabling,
      hasLVO,
      hasImaging,
      hasCore,
      hasMismatch,
      inIVTWindow,
      inExtendedIVTWindow,
      inEVTWindow,
      inLateWindow,
      ivtEligible,
      daptPreferred,
      extendedIVTEligible,
      standardEVTEligible,
      largeCoreEVT,
      basilarEVT,
      bridgingTherapy,
      noLVOMedicalManagement,
      hasNoLVO,
      // Antithrombotic recommendations
      showAntithromboticInputs,
      recommendOAC,
      recommendDAPT,
      recommendSAPT,
      hasAF,
      hasCardioembolicSource,
      isMinorStroke,
      isWithin24h,
      hasHighBleedingRisk,
      isComplete: hasTimeInput && hasNIHSS && hasDisabling,
    };
  }, [timeFromOnset, nihss, mrs, inputs.disablingDeficit, inputs.lvoStatus, inputs.imagingType, coreVol, mismatchRat]);

  // Get pathway highlight class
  const getPathwayClass = (isActive: boolean, baseColor: string) => {
    if (isActive) {
      return cn(
        "transition-all duration-500 transform",
        baseColor,
        "ring-4 ring-offset-2 shadow-lg scale-[1.02]",
        "animate-pulse"
      );
    }
    return cn(
      "transition-all duration-300",
      "opacity-50 grayscale",
      baseColor
    );
  };

  // Input field styling based on filled status
  const getInputClass = (value: string) => {
    return value ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50 dark:from-red-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-red-100/50 dark:bg-red-900/30">
            <CardTitle className="flex items-center justify-between text-red-800 dark:text-red-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Acute Stroke Management Algorithm
                <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded">AHA 2026</span>
                <Badge variant="outline" className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  Interactive
                </Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* 2026 Key Updates Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 border border-blue-300 dark:border-blue-700 rounded-lg">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AHA 2026 Guideline Key Updates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                  <span className="font-semibold text-green-700 dark:text-green-400">✓ Tenecteplase</span>
                  <span className="text-gray-700 dark:text-gray-300"> now endorsed equally with alteplase in 4.5h window</span>
                </div>
                <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                  <span className="font-semibold text-green-700 dark:text-green-400">✓ Large Core EVT</span>
                  <span className="text-gray-700 dark:text-gray-300"> expanded eligibility for larger infarct cores</span>
                </div>
                <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                  <span className="font-semibold text-green-700 dark:text-green-400">✓ Basilar EVT</span>
                  <span className="text-gray-700 dark:text-gray-300"> strong recommendation within 24h if NIHSS ≥10</span>
                </div>
                <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">⚠ Non-disabling stroke</span>
                  <span className="text-gray-700 dark:text-gray-300"> DAPT preferred over thrombolysis</span>
                </div>
              </div>
            </div>

            {/* Interactive Information Inputs */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-900 border-2 border-blue-400 dark:border-blue-600 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Enter Patient Information
                <span className="text-xs text-muted-foreground ml-2">(Pathways will highlight as you fill)</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Last Known Well Time */}
                <div className="space-y-2">
                  <Label htmlFor="lkw" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-500" />
                    Last Known Well (hours)
                  </Label>
                  <Input
                    id="lkw"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g., 2.5"
                    value={inputs.lastKnownWell}
                    onChange={(e) => updateInput("lastKnownWell", e.target.value)}
                    className={cn(getInputClass(inputs.lastKnownWell))}
                  />
                  {timeFromOnset !== null && (
                    <Badge variant={timeFromOnset <= 4.5 ? "default" : timeFromOnset <= 9 ? "secondary" : "outline"} className="text-xs">
                      {timeFromOnset <= 4.5 ? "IVT Window" : timeFromOnset <= 9 ? "Extended Window" : timeFromOnset <= 24 ? "EVT Window" : "Late Window"}
                    </Badge>
                  )}
                </div>

                {/* NIHSS Score */}
                <div className="space-y-2">
                  <Label htmlFor="nihss" className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-500" />
                    NIHSS Score (0-42)
                  </Label>
                  <Input
                    id="nihss"
                    type="number"
                    min="0"
                    max="42"
                    placeholder="e.g., 8"
                    value={inputs.nihssScore}
                    onChange={(e) => updateInput("nihssScore", e.target.value)}
                    className={cn(getInputClass(inputs.nihssScore))}
                  />
                  {nihss !== null && (
                    <Badge 
                      variant={nihss <= 4 ? "outline" : nihss <= 15 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {nihss <= 4 ? "Minor" : nihss <= 15 ? "Moderate" : nihss <= 20 ? "Mod-Severe" : "Severe"}
                    </Badge>
                  )}
                </div>

                {/* Pre-stroke mRS */}
                <div className="space-y-2">
                  <Label htmlFor="mrs" className="flex items-center gap-2">
                    Pre-stroke mRS (0-5)
                  </Label>
                  <Select value={inputs.premorbidMRS} onValueChange={(v) => updateInput("premorbidMRS", v)}>
                    <SelectTrigger className={cn(getInputClass(inputs.premorbidMRS))}>
                      <SelectValue placeholder="Select mRS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - No symptoms</SelectItem>
                      <SelectItem value="1">1 - No significant disability</SelectItem>
                      <SelectItem value="2">2 - Slight disability</SelectItem>
                      <SelectItem value="3">3 - Moderate disability</SelectItem>
                      <SelectItem value="4">4 - Moderately severe</SelectItem>
                      <SelectItem value="5">5 - Severe disability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Disabling vs Non-disabling */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Deficit Type
                  </Label>
                  <Select value={inputs.disablingDeficit} onValueChange={(v) => updateInput("disablingDeficit", v)}>
                    <SelectTrigger className={cn(getInputClass(inputs.disablingDeficit))}>
                      <SelectValue placeholder="Disabling?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabling">Disabling Deficit</SelectItem>
                      <SelectItem value="non-disabling">Non-disabling Deficit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Second Row - Imaging Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {/* LVO Status */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    LVO Status (CTA)
                  </Label>
                  <Select value={inputs.lvoStatus} onValueChange={(v) => updateInput("lvoStatus", v)}>
                    <SelectTrigger className={cn(getInputClass(inputs.lvoStatus))}>
                      <SelectValue placeholder="LVO?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lvo_positive">LVO+ (ICA/M1/M2)</SelectItem>
                      <SelectItem value="basilar">Basilar Occlusion</SelectItem>
                      <SelectItem value="lvo_negative">No LVO</SelectItem>
                      <SelectItem value="pending">Pending CTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Imaging Type */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Advanced Imaging
                  </Label>
                  <Select value={inputs.imagingType} onValueChange={(v) => updateInput("imagingType", v)}>
                    <SelectTrigger className={cn(getInputClass(inputs.imagingType))}>
                      <SelectValue placeholder="Imaging type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ctp">CTP (RAPID/Viz.ai)</SelectItem>
                      <SelectItem value="mri_dwi_flair">MRI DWI-FLAIR</SelectItem>
                      <SelectItem value="ncct_only">NCCT Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Core Volume */}
                <div className="space-y-2">
                  <Label htmlFor="core" className="flex items-center gap-2">
                    Core Volume (mL)
                  </Label>
                  <Input
                    id="core"
                    type="number"
                    min="0"
                    placeholder="e.g., 25"
                    value={inputs.coreVolume}
                    onChange={(e) => updateInput("coreVolume", e.target.value)}
                    className={cn(getInputClass(inputs.coreVolume))}
                  />
                  {coreVol !== null && (
                    <Badge 
                      variant={coreVol < 70 ? "default" : coreVol <= 100 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {coreVol < 70 ? "Standard" : coreVol <= 100 ? "Large Core" : "Very Large"}
                    </Badge>
                  )}
                </div>

                {/* Mismatch Ratio */}
                <div className="space-y-2">
                  <Label htmlFor="mismatch" className="flex items-center gap-2">
                    Mismatch Ratio
                  </Label>
                  <Input
                    id="mismatch"
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="e.g., 1.8"
                    value={inputs.mismatchRatio}
                    onChange={(e) => updateInput("mismatchRatio", e.target.value)}
                    className={cn(getInputClass(inputs.mismatchRatio))}
                  />
                  {mismatchRat !== null && (
                    <Badge 
                      variant={mismatchRat >= 1.8 ? "default" : mismatchRat >= 1.2 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {mismatchRat >= 1.8 ? "DAWN/DEFUSE Met" : mismatchRat >= 1.2 ? "Extended IVT" : "Low Mismatch"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Antithrombotic Decision Inputs - Show when No LVO selected */}
              {pathwayState.showAntithromboticInputs && (
                <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-400 dark:border-teal-600 rounded-lg">
                  <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-teal-500" />
                    Antithrombotic Selection Inputs
                    <Badge variant="outline" className="ml-2 text-teal-600 border-teal-400">No LVO Pathway</Badge>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* AF Status */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                        Atrial Fibrillation
                      </Label>
                      <Select value={inputs.afStatus} onValueChange={(v) => updateInput("afStatus", v)}>
                        <SelectTrigger className={cn(getInputClass(inputs.afStatus), "border-teal-300")}>
                          <SelectValue placeholder="AF status?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="af_confirmed">AF Confirmed</SelectItem>
                          <SelectItem value="af_paroxysmal">Paroxysmal AF</SelectItem>
                          <SelectItem value="no_af">No AF</SelectItem>
                          <SelectItem value="af_pending">Pending Monitoring</SelectItem>
                        </SelectContent>
                      </Select>
                      {pathwayState.hasAF && (
                        <Badge variant="destructive" className="text-xs">→ OAC Indicated</Badge>
                      )}
                    </div>

                    {/* Stroke Classification */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                        Stroke Classification
                      </Label>
                      <Select value={inputs.strokeClassification} onValueChange={(v) => updateInput("strokeClassification", v)}>
                        <SelectTrigger className={cn(getInputClass(inputs.strokeClassification), "border-teal-300")}>
                          <SelectValue placeholder="Type?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tia">TIA (symptoms resolved)</SelectItem>
                          <SelectItem value="minor_stroke">Minor Stroke (NIHSS ≤3)</SelectItem>
                          <SelectItem value="moderate_stroke">Moderate Stroke (NIHSS 4-15)</SelectItem>
                          <SelectItem value="severe_stroke">Severe Stroke (NIHSS &gt;15)</SelectItem>
                        </SelectContent>
                      </Select>
                      {pathwayState.isMinorStroke && (
                        <Badge variant="secondary" className="text-xs">DAPT candidate</Badge>
                      )}
                    </div>

                    {/* Symptom Onset */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                        Symptom Onset
                      </Label>
                      <Select value={inputs.symptomOnsetToPresentation} onValueChange={(v) => updateInput("symptomOnsetToPresentation", v)}>
                        <SelectTrigger className={cn(getInputClass(inputs.symptomOnsetToPresentation), "border-teal-300")}>
                          <SelectValue placeholder="When?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="within_24h">Within 24 hours</SelectItem>
                          <SelectItem value="24_72h">24-72 hours</SelectItem>
                          <SelectItem value="over_72h">&gt;72 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      {pathwayState.isWithin24h && pathwayState.isMinorStroke && !pathwayState.hasCardioembolicSource && (
                        <Badge className="text-xs bg-amber-500">→ DAPT eligible</Badge>
                      )}
                    </div>

                    {/* Cardioembolic Source */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                        Other CE Source
                      </Label>
                      <Select value={inputs.cardioembolicSource} onValueChange={(v) => updateInput("cardioembolicSource", v)}>
                        <SelectTrigger className={cn(getInputClass(inputs.cardioembolicSource), "border-teal-300")}>
                          <SelectValue placeholder="CE source?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes (PFO, valve, thrombus)</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="pending">Pending workup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bleeding Risk */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                        Bleeding Risk
                      </Label>
                      <Select value={inputs.highBleedingRisk} onValueChange={(v) => updateInput("highBleedingRisk", v)}>
                        <SelectTrigger className={cn(getInputClass(inputs.highBleedingRisk), "border-teal-300")}>
                          <SelectValue placeholder="Risk?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">Low/Moderate</SelectItem>
                          <SelectItem value="yes">High (HAS-BLED ≥3)</SelectItem>
                        </SelectContent>
                      </Select>
                      {pathwayState.hasHighBleedingRisk && (
                        <Badge variant="outline" className="text-xs border-red-400 text-red-600">Caution with DAPT</Badge>
                      )}
                    </div>
                  </div>

                  {/* Recommendation Summary */}
                  {(pathwayState.recommendOAC || pathwayState.recommendDAPT || pathwayState.recommendSAPT) && (
                    <div className={cn(
                      "mt-4 p-3 rounded-lg border-2 transition-all",
                      pathwayState.recommendOAC 
                        ? "bg-purple-100 dark:bg-purple-900/40 border-purple-500" 
                        : pathwayState.recommendDAPT 
                          ? "bg-amber-100 dark:bg-amber-900/40 border-amber-500"
                          : "bg-green-100 dark:bg-green-900/40 border-green-500"
                    )}>
                      <p className={cn(
                        "font-bold text-sm",
                        pathwayState.recommendOAC ? "text-purple-800 dark:text-purple-300" :
                        pathwayState.recommendDAPT ? "text-amber-800 dark:text-amber-300" :
                        "text-green-800 dark:text-green-300"
                      )}>
                        ✓ Recommended: {pathwayState.recommendOAC ? "OAC/NOAC" : pathwayState.recommendDAPT ? "DAPT (21-90 days)" : "SAPT (long-term)"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pathwayState.recommendOAC && "AF or cardioembolic source detected → Anticoagulation indicated. Delay 4-14 days based on stroke size."}
                        {pathwayState.recommendDAPT && "Minor stroke/TIA within 24h without cardioembolic source → DAPT for 21-90 days, then transition to SAPT."}
                        {pathwayState.recommendSAPT && "Non-cardioembolic stroke, not DAPT eligible → Long-term single antiplatelet therapy."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Summary */}
              {pathwayState.isComplete && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    ✓ Core information complete - Review highlighted pathways below
                  </p>
                </div>
              )}
            </div>

            {/* Main Flowchart */}
            <div className="space-y-4">
              {/* Starting Point */}
              <div className="flex justify-center">
                <div className={cn(
                  "px-6 py-3 border-2 rounded-lg transition-all duration-300",
                  pathwayState.hasTimeInput 
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-400" 
                    : "border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800"
                )}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Last known well time to presentation
                    {timeFromOnset !== null && (
                      <span className="ml-2 text-green-600 dark:text-green-400 font-bold">
                        = {timeFromOnset}h
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 rotate-90 text-gray-500" />
              </div>

              {/* Time Windows - Updated for AHA 2026 */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* < 4.5 hours pathway - IVT Window */}
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-4 space-y-3 transition-all duration-500",
                  pathwayState.inIVTWindow
                    ? "border-green-500 bg-green-50/50 dark:bg-green-900/20 ring-4 ring-green-400/50 shadow-lg"
                    : "border-green-400 dark:border-green-600 opacity-60"
                )}>
                  <div className={cn(
                    "text-center px-4 py-2 rounded-lg border transition-all",
                    pathwayState.inIVTWindow
                      ? "bg-green-200 dark:bg-green-700 border-green-500 ring-2 ring-green-400"
                      : "bg-green-100 dark:bg-green-800/40 border-green-400 dark:border-green-600"
                  )}>
                    <span className="font-semibold text-green-800 dark:text-green-200">&lt; 4.5 hours (IVT Window)</span>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 rotate-90 text-gray-400" />
                  </div>

                  <div className="text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                    <span className="text-sm text-blue-800 dark:text-blue-300">NCCT ± CTA ± CTP</span>
                  </div>

                  {/* Disabling Deficit Branch */}
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-300 dark:border-green-700">
                    <p className="text-xs font-bold text-green-800 dark:text-green-300 mb-2 text-center">DISABLING Deficit?</p>
                    <div className="flex justify-center gap-4">
                      <div className={cn(
                        "text-center transition-all duration-300",
                        pathwayState.ivtEligible ? "scale-105" : ""
                      )}>
                        <div className="px-3 py-1 bg-green-200 dark:bg-green-700 rounded text-xs mb-2 font-medium">Yes</div>
                        <div className={cn(
                          "px-3 py-2 rounded-lg font-bold text-xs transition-all duration-500",
                          pathwayState.ivtEligible
                            ? "bg-green-600 text-white ring-4 ring-green-400 shadow-lg animate-pulse"
                            : "bg-green-600/50 text-white/70"
                        )}>
                          Alteplase OR Tenecteplase
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">No NIHSS threshold</p>
                      </div>
                      <div className={cn(
                        "text-center transition-all duration-300",
                        pathwayState.daptPreferred ? "scale-105" : ""
                      )}>
                        <div className="px-3 py-1 bg-amber-200 dark:bg-amber-700 rounded text-xs mb-2 font-medium">No (Non-disabling)</div>
                        <div className={cn(
                          "px-3 py-2 rounded-lg font-bold text-xs transition-all duration-500",
                          pathwayState.daptPreferred
                            ? "bg-amber-600 text-white ring-4 ring-amber-400 shadow-lg animate-pulse"
                            : "bg-amber-600/50 text-white/70"
                        )}>
                          DAPT Preferred
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Aspirin + Clopidogrel</p>
                      </div>
                    </div>
                  </div>

                  {/* LVO Check */}
                  <div className={cn(
                    "p-3 rounded border transition-all duration-500",
                    pathwayState.bridgingTherapy
                      ? "bg-purple-100 dark:bg-purple-900/40 border-purple-500 ring-2 ring-purple-400"
                      : "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700"
                  )}>
                    <p className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-2 text-center">LVO on CTA?</p>
                    <div className="text-center">
                      <div className={cn(
                        "px-4 py-2 rounded-lg font-bold text-sm transition-all duration-500",
                        pathwayState.bridgingTherapy
                          ? "bg-purple-600 text-white ring-4 ring-purple-400 shadow-lg animate-pulse"
                          : "bg-purple-600/50 text-white/70"
                      )}>
                        IVT + EVT (bridging therapy)
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Do not delay EVT for IVT effect</p>
                    </div>
                  </div>
                </div>

                {/* 4.5-9 hours / Wake-up stroke - Extended IVT */}
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-4 space-y-3 transition-all duration-500",
                  pathwayState.inExtendedIVTWindow
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 ring-4 ring-amber-400/50 shadow-lg"
                    : "border-amber-400 dark:border-amber-600 opacity-60"
                )}>
                  <div className={cn(
                    "text-center px-4 py-2 rounded-lg border transition-all",
                    pathwayState.inExtendedIVTWindow
                      ? "bg-amber-200 dark:bg-amber-700 border-amber-500 ring-2 ring-amber-400"
                      : "bg-amber-100 dark:bg-amber-800/40 border-amber-400 dark:border-amber-600"
                  )}>
                    <span className="font-semibold text-amber-800 dark:text-amber-200">4.5-9h / Wake-up Stroke</span>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 rotate-90 text-gray-400" />
                  </div>

                  <div className="text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                    <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">MRI DWI-FLAIR or CTP Mismatch</span>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-300 dark:border-amber-700 text-xs">
                    <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Extended Window IVT Criteria:</p>
                    <ul className="text-amber-700 dark:text-amber-400 space-y-0.5">
                      <li>• DWI lesion with NO FLAIR change, OR</li>
                      <li>• Perfusion mismatch ratio &gt;1.2</li>
                      <li>• Ischemic core &lt;70mL</li>
                      <li>• Mismatch volume &gt;10mL</li>
                    </ul>
                  </div>

                  <div className="flex justify-center gap-4">
                    <div className={cn(
                      "text-center transition-all duration-300",
                      pathwayState.extendedIVTEligible ? "scale-105" : ""
                    )}>
                      <div className="px-3 py-1 bg-green-200 dark:bg-green-700 rounded text-xs mb-1">Criteria Met</div>
                      <div className={cn(
                        "px-4 py-2 rounded-lg font-bold text-sm transition-all duration-500",
                        pathwayState.extendedIVTEligible
                          ? "bg-green-600 text-white ring-4 ring-green-400 shadow-lg animate-pulse"
                          : "bg-green-600/50 text-white/70"
                      )}>
                        Alteplase or Tenecteplase
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mb-1">Not Met</div>
                      <div className="px-4 py-2 bg-gray-600/50 text-white/70 rounded-lg font-bold text-sm">
                        Check EVT eligibility
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6-24 hours - EVT Window */}
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-4 space-y-3 transition-all duration-500",
                  pathwayState.inEVTWindow || pathwayState.standardEVTEligible || pathwayState.largeCoreEVT || pathwayState.basilarEVT
                    ? "border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 ring-4 ring-purple-400/50 shadow-lg"
                    : "border-purple-400 dark:border-purple-600 opacity-60"
                )}>
                  <div className={cn(
                    "text-center px-4 py-2 rounded-lg border transition-all",
                    pathwayState.inEVTWindow
                      ? "bg-purple-200 dark:bg-purple-700 border-purple-500 ring-2 ring-purple-400"
                      : "bg-purple-100 dark:bg-purple-800/40 border-purple-400 dark:border-purple-600"
                  )}>
                    <span className="font-semibold text-purple-800 dark:text-purple-200">6-24 hours (EVT Window)</span>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 rotate-90 text-gray-400" />
                  </div>

                  <div className="text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                    <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">CTA + CTP (RAPID/Viz.ai)</span>
                  </div>

                  {/* DAWN/DEFUSE Criteria */}
                  <div className={cn(
                    "p-3 rounded border text-xs transition-all duration-500",
                    pathwayState.standardEVTEligible
                      ? "bg-purple-100 dark:bg-purple-900/40 border-purple-500 ring-2 ring-purple-400"
                      : "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700"
                  )}>
                    <p className="font-bold text-purple-800 dark:text-purple-300 mb-1">Standard EVT (DAWN/DEFUSE-3):</p>
                    <ul className="text-purple-700 dark:text-purple-400 space-y-0.5">
                      <li>• Core &lt;70mL + Mismatch ≥1.8 + Penumbra ≥15mL</li>
                      <li>• LVO: ICA, M1, or proximal M2</li>
                    </ul>
                  </div>

                  {/* Large Core - NEW 2026 */}
                  <div className={cn(
                    "p-3 rounded border text-xs transition-all duration-500",
                    pathwayState.largeCoreEVT
                      ? "bg-red-100 dark:bg-red-900/40 border-red-500 ring-2 ring-red-400 animate-pulse"
                      : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                  )}>
                    <p className="font-bold text-red-800 dark:text-red-300 mb-1">🆕 Large Core EVT (2026):</p>
                    <ul className="text-red-700 dark:text-red-400 space-y-0.5">
                      <li>• Core 70-100mL may benefit from EVT</li>
                      <li>• Shared decision-making</li>
                      <li>• Consider age, baseline function</li>
                    </ul>
                  </div>

                  {/* Basilar - NEW Strong Recommendation */}
                  <div className={cn(
                    "p-3 rounded border text-xs transition-all duration-500",
                    pathwayState.basilarEVT
                      ? "bg-orange-100 dark:bg-orange-900/40 border-orange-500 ring-2 ring-orange-400 animate-pulse"
                      : "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
                  )}>
                    <p className="font-bold text-orange-800 dark:text-orange-300 mb-1">🆕 Basilar Occlusion (Strong):</p>
                    <ul className="text-orange-700 dark:text-orange-400 space-y-0.5">
                      <li>• NIHSS ≥10 within 24 hours</li>
                      <li>• EVT recommended (Class I)</li>
                      <li>• Consider up to 48h in select cases</li>
                    </ul>
                  </div>

                  <div className={cn(
                    "text-center px-4 py-2 rounded-lg font-bold text-sm transition-all duration-500",
                    pathwayState.standardEVTEligible || pathwayState.largeCoreEVT || pathwayState.basilarEVT
                      ? "bg-purple-600 text-white ring-4 ring-purple-400 shadow-lg animate-pulse"
                      : "bg-purple-600/50 text-white/70"
                  )}>
                    EVT if criteria met
                  </div>
                </div>

                {/* No LVO - Medical Management Pathway */}
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-4 space-y-3 transition-all duration-500",
                  pathwayState.noLVOMedicalManagement
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 ring-4 ring-teal-400/50 shadow-lg"
                    : "border-teal-400 dark:border-teal-600 opacity-60"
                )}>
                  <div className={cn(
                    "text-center px-4 py-2 rounded-lg border transition-all",
                    pathwayState.noLVOMedicalManagement
                      ? "bg-teal-200 dark:bg-teal-700 border-teal-500 ring-2 ring-teal-400"
                      : "bg-teal-100 dark:bg-teal-800/40 border-teal-400 dark:border-teal-600"
                  )}>
                    <span className="font-semibold text-teal-800 dark:text-teal-200">No LVO - Medical Management</span>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 rotate-90 text-gray-400" />
                  </div>

                  <div className="text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                    <span className="text-sm text-blue-800 dark:text-blue-300">CTA confirms No LVO</span>
                  </div>

                  {/* Secondary Prevention Options */}
                  <div className={cn(
                    "p-3 rounded border transition-all duration-500",
                    pathwayState.noLVOMedicalManagement
                      ? "bg-teal-100 dark:bg-teal-900/40 border-teal-500"
                      : "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700"
                  )}>
                    <p className="text-xs font-bold text-teal-800 dark:text-teal-300 mb-2 text-center">
                      Secondary Prevention Strategy
                      {(pathwayState.recommendOAC || pathwayState.recommendDAPT || pathwayState.recommendSAPT) && (
                        <span className="ml-2 text-xs font-normal text-teal-600 dark:text-teal-400">
                          (fill inputs above for recommendation)
                        </span>
                      )}
                    </p>
                    
                    {/* SAPT */}
                    <div className={cn(
                      "mb-2 p-2 rounded text-xs transition-all duration-500",
                      pathwayState.recommendSAPT
                        ? "bg-green-200 dark:bg-green-800/60 border-2 border-green-500 ring-2 ring-green-400 shadow-lg scale-[1.02] animate-pulse"
                        : pathwayState.noLVOMedicalManagement
                          ? "bg-green-100 dark:bg-green-900/40 border border-green-400"
                          : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-green-800 dark:text-green-300">SAPT (Single Antiplatelet)</p>
                        {pathwayState.recommendSAPT && (
                          <Badge className="bg-green-600 text-white text-xs">✓ RECOMMENDED</Badge>
                        )}
                      </div>
                      <ul className="text-green-700 dark:text-green-400 space-y-0.5">
                        <li>• Aspirin 75-100mg daily</li>
                        <li>• OR Clopidogrel 75mg daily</li>
                        <li>• Long-term maintenance</li>
                        {pathwayState.hasHighBleedingRisk && pathwayState.recommendSAPT && (
                          <li className="text-red-600 dark:text-red-400 font-medium">• ⚠️ Lower bleeding risk than DAPT</li>
                        )}
                      </ul>
                    </div>

                    {/* DAPT */}
                    <div className={cn(
                      "mb-2 p-2 rounded text-xs transition-all duration-500",
                      pathwayState.recommendDAPT
                        ? "bg-amber-200 dark:bg-amber-800/60 border-2 border-amber-500 ring-2 ring-amber-400 shadow-lg scale-[1.02] animate-pulse"
                        : pathwayState.noLVOMedicalManagement
                          ? "bg-amber-100 dark:bg-amber-900/40 border border-amber-400"
                          : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-amber-800 dark:text-amber-300">DAPT (Dual Antiplatelet)</p>
                        {pathwayState.recommendDAPT && (
                          <Badge className="bg-amber-600 text-white text-xs">✓ RECOMMENDED</Badge>
                        )}
                      </div>
                      <ul className="text-amber-700 dark:text-amber-400 space-y-0.5">
                        <li>• Aspirin + Clopidogrel</li>
                        <li>• 21-90 days (minor stroke/TIA)</li>
                        <li>• ⚠️ Check CYP2C19 status</li>
                        {pathwayState.recommendDAPT && (
                          <li className="text-amber-800 dark:text-amber-300 font-medium">• Then transition to SAPT</li>
                        )}
                      </ul>
                    </div>

                    {/* OAC/NOAC */}
                    <div className={cn(
                      "p-2 rounded text-xs transition-all duration-500",
                      pathwayState.recommendOAC
                        ? "bg-purple-200 dark:bg-purple-800/60 border-2 border-purple-500 ring-2 ring-purple-400 shadow-lg scale-[1.02] animate-pulse"
                        : pathwayState.noLVOMedicalManagement
                          ? "bg-purple-100 dark:bg-purple-900/40 border border-purple-400"
                          : "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-purple-800 dark:text-purple-300">OAC / NOAC</p>
                        {pathwayState.recommendOAC && (
                          <Badge className="bg-purple-600 text-white text-xs">✓ RECOMMENDED</Badge>
                        )}
                      </div>
                      <ul className="text-purple-700 dark:text-purple-400 space-y-0.5">
                        <li>• If AF/cardioembolic source</li>
                        <li>• NOAC preferred over Warfarin</li>
                        <li>• Delay 4-14 days post-stroke</li>
                        {pathwayState.recommendOAC && pathwayState.hasAF && (
                          <li className="text-purple-800 dark:text-purple-300 font-medium">• AF detected → indefinite OAC</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Risk Factor Management */}
                  <div className={cn(
                    "p-3 rounded border text-xs transition-all duration-500",
                    pathwayState.noLVOMedicalManagement
                      ? "bg-slate-100 dark:bg-slate-900/40 border-slate-400"
                      : "bg-slate-50 dark:bg-slate-900/20 border-slate-300 dark:border-slate-700"
                  )}>
                    <p className="font-bold text-slate-800 dark:text-slate-300 mb-1">+ Aggressive Risk Factor Management</p>
                    <ul className="text-slate-700 dark:text-slate-400 space-y-0.5">
                      <li>• BP target: &lt;130/80 mmHg</li>
                      <li>• LDL target: &lt;70 mg/dL (high-intensity statin)</li>
                      <li>• Glucose control: HbA1c &lt;7%</li>
                      <li>• Lifestyle modifications</li>
                    </ul>
                  </div>

                  <div className={cn(
                    "text-center px-4 py-2 rounded-lg font-bold text-sm transition-all duration-500",
                    pathwayState.noLVOMedicalManagement
                      ? "bg-teal-600 text-white ring-4 ring-teal-400 shadow-lg animate-pulse"
                      : "bg-teal-600/50 text-white/70"
                  )}>
                    Medical Management
                  </div>
                </div>
              </div>

              {/* Key Points - Updated for 2026 */}
              <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">IVT (Alteplase/Tenecteplase)</h5>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• <strong>Tenecteplase endorsed</strong> as equivalent</li>
                    <li>• Disabling deficit: treat regardless of NIHSS</li>
                    <li>• Non-disabling: DAPT preferred</li>
                    <li>• 4.5h window (standard), 4.5-9h (imaging selection)</li>
                    <li>• TNK dose: 0.25 mg/kg (max 25mg)</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                  <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">EVT Eligibility (2026)</h5>
                  <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                    <li>• LVO: ICA, M1, M2, basilar (strong)</li>
                    <li>• Consider M3, ACA, PCA (select cases)</li>
                    <li>• <strong>Large core (70-100mL)</strong> may benefit</li>
                    <li>• <strong>Basilar: 24h window, NIHSS ≥10</strong></li>
                    <li>• Direct transfer to EVT center encouraged</li>
                  </ul>
                </div>
                <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-700">
                  <h5 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">No LVO - Medical Mgmt</h5>
                  <ul className="text-sm text-teal-700 dark:text-teal-400 space-y-1">
                    <li>• <strong>SAPT:</strong> Aspirin or Clopidogrel</li>
                    <li>• <strong>DAPT:</strong> ASA + Clopi (21-90d)</li>
                    <li>• <strong>OAC/NOAC:</strong> If AF present</li>
                    <li>• High-intensity statin (LDL &lt;70)</li>
                    <li>• BP target &lt;130/80 mmHg</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                  <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">BP & Glucose (2026)</h5>
                  <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                    <li>• Pre-IVT: maintain &lt;185/110 mmHg</li>
                    <li>• Post-IVT: &lt;180/105 mmHg x 24h</li>
                    <li>• <strong>Intensive SBP &lt;140 NOT recommended</strong></li>
                    <li>• Avoid hypoglycemia (&lt;60 mg/dL)</li>
                    <li>• Intensive glucose 80-130 NOT recommended</li>
                  </ul>
                </div>
              </div>

              {/* Mobile Stroke Unit Note */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>🚑 Mobile Stroke Units (MSU):</strong> When available, MSUs enable faster diagnosis and treatment. Consider direct transport to EVT-capable center if systems allow rapid transfer.
                </p>
              </div>

              {/* Reference - Updated */}
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400">
                  <strong>Reference:</strong> Prabhakaran S, et al. 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke. Stroke. 2026. doi: 10.1161/STR.0000000000000513
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default InteractiveAcuteStrokeAlgorithm;
