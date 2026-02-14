import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ArrowRight, ChevronDown, Zap, Clock, Activity, Target, BookOpen, ClipboardList, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import ModuleCommentBox from "./ModuleCommentBox";
import evtAlgorithmImage from "@/assets/evt-eligibility-algorithm.jpeg";
import InteractiveEVTDecisionTree from "./InteractiveEVTDecisionTree";

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
  // OAC timing inputs
  strokeSize: string;
  hemorrhagicTransformation: string;
  // CYP2C19 genotyping
  cyp2c19Genotype: string;
  // Renal function for Ticagrelor
  egfr: string;
  // NOAC contraindications
  valvularAF: string;
  antiphospholipidSyndrome: string;
}

const InteractiveAcuteStrokeAlgorithm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("guidelines");
  const [comment, setComment] = useState("");
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
    // OAC timing inputs
    strokeSize: "",
    hemorrhagicTransformation: "",
    // CYP2C19 genotyping
    cyp2c19Genotype: "",
    // Renal function for Ticagrelor
    egfr: "",
    // NOAC contraindications
    valvularAF: "",
    antiphospholipidSyndrome: "",
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

    // CYP2C19 Genotype Logic
    const cyp2c19PoorMetabolizer = 
      inputs.cyp2c19Genotype === "*2/*2" || 
      inputs.cyp2c19Genotype === "*2/*3" || 
      inputs.cyp2c19Genotype === "*3/*3";
    const cyp2c19IntermediateMetabolizer = 
      inputs.cyp2c19Genotype === "*1/*2" || 
      inputs.cyp2c19Genotype === "*1/*3";
    const cyp2c19NormalMetabolizer = 
      inputs.cyp2c19Genotype === "*1/*1";
    const cyp2c19RapidMetabolizer = 
      inputs.cyp2c19Genotype === "*1/*17" || 
      inputs.cyp2c19Genotype === "*17/*17";
    
    // Auto-recommend Ticagrelor for poor metabolizers
    const recommendTicagrelor = recommendDAPT && cyp2c19PoorMetabolizer;
    const considerTicagrelor = recommendDAPT && cyp2c19IntermediateMetabolizer;
    
    // eGFR parsing for Ticagrelor dosing
    const egfrValue = inputs.egfr ? parseFloat(inputs.egfr) : null;
    const hasRenalImpairment = egfrValue !== null && egfrValue < 60;
    const severRenalImpairment = egfrValue !== null && egfrValue < 30;

    // NOAC contraindications - Valvular AF and APLS
    const hasValvularAF = inputs.valvularAF === "yes";
    const hasAPLS = inputs.antiphospholipidSyndrome === "yes";
    const noacContraindicated = hasValvularAF || hasAPLS;

    // 1-3-6-12 Day Rule for OAC timing based on stroke size
    const hasHemorrhagicTransformation = inputs.hemorrhagicTransformation === "yes";
    
    // Calculate OAC start timing based on stroke size (1-3-6-12 rule)
    const getOACTiming = () => {
      if (!inputs.strokeSize) return null;
      if (hasHemorrhagicTransformation) {
        return {
          days: "14+",
          recommendation: "Delay OAC until hemorrhage stabilized. Repeat imaging before starting.",
          severity: "high_risk"
        };
      }
      switch (inputs.strokeSize) {
        case "tia":
          return {
            days: "1",
            recommendation: "Start OAC within 24 hours (Day 1). TIA has minimal bleeding risk.",
            severity: "low_risk"
          };
        case "small":
          return {
            days: "3",
            recommendation: "Start OAC at Day 3. Small infarct (<1.5cm) has low HT risk.",
            severity: "low_risk"
          };
        case "medium":
          return {
            days: "6",
            recommendation: "Start OAC at Day 6. Moderate infarct (1.5-3cm) requires monitoring.",
            severity: "moderate_risk"
          };
        case "large":
          return {
            days: "12-14",
            recommendation: "Start OAC at Day 12-14. Large infarct (>3cm or >1/3 MCA) has high HT risk.",
            severity: "high_risk"
          };
        default:
          return null;
      }
    };
    
    const oacTiming = getOACTiming();

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
      // CYP2C19 genotype
      cyp2c19PoorMetabolizer,
      cyp2c19IntermediateMetabolizer,
      cyp2c19NormalMetabolizer,
      cyp2c19RapidMetabolizer,
      recommendTicagrelor,
      considerTicagrelor,
      // Renal function
      egfrValue,
      hasRenalImpairment,
      severRenalImpairment,
      // NOAC contraindications
      hasValvularAF,
      hasAPLS,
      noacContraindicated,
      // OAC timing
      oacTiming,
      hasHemorrhagicTransformation,
      isComplete: hasTimeInput && hasNIHSS && hasDisabling,
    };
  }, [timeFromOnset, nihss, mrs, inputs.disablingDeficit, inputs.lvoStatus, inputs.imagingType, coreVol, mismatchRat, inputs.afStatus, inputs.strokeClassification, inputs.cardioembolicSource, inputs.symptomOnsetToPresentation, inputs.highBleedingRisk, inputs.strokeSize, inputs.hemorrhagicTransformation]);

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
            {/* Internal Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="guidelines" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Guidelines & Trials</span>
                  <span className="sm:hidden">Evidence</span>
                </TabsTrigger>
                <TabsTrigger value="assessment" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Patient Assessment</span>
                  <span className="sm:hidden">Assess</span>
                </TabsTrigger>
                <TabsTrigger value="pathways" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <span className="hidden sm:inline">Treatment Pathways</span>
                  <span className="sm:hidden">Pathways</span>
                </TabsTrigger>
              </TabsList>

              {/* Guidelines & Trials Tab */}
              <TabsContent value="guidelines" className="space-y-6">
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

            {/* Recent Landmark Trials Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-300 dark:border-emerald-700 rounded-lg">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Landmark Trials – Acute Ischemic Stroke
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {/* OCEANIC-STROKE */}
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded border-l-4 border-emerald-500">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">OCEANIC-STROKE</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded">Phase III +</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    FXIa inhibition with <strong>asundexian</strong> reduced ischemic stroke in non-cardioembolic stroke/high-risk TIA on antiplatelet therapy <em>without</em> increased major bleeding.
                  </p>
                </div>
                
                {/* OPTION */}
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded border-l-4 border-blue-500">
                  <span className="font-bold text-blue-700 dark:text-blue-400">OPTION</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">Extended Window</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    In patients with salvageable tissue, <strong>tenecteplase (4.5–24h)</strong> significantly improved 90-day excellent outcomes. Note: higher sICH (2.8% vs 0%).
                  </p>
                </div>
                
                {/* CHOICE-2 */}
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded border-l-4 border-purple-500">
                  <span className="font-bold text-purple-700 dark:text-purple-400">CHOICE-2</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded">Phase III</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Largest trial of <strong>IA alteplase post-EVT</strong>: higher mRS 0–1 outcomes, no increase in sICH. <strong>NNT ≈ 7</strong>.
                  </p>
                </div>
                
                {/* LAIS */}
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded border-l-4 border-indigo-500">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">LAIS</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-indigo-500 text-white text-xs rounded">Neuroprotection</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    <strong>Loberamisal</strong> (dual-target neuroprotection) within 48h for AIS (NIHSS 7–20): <strong>+13% absolute increase</strong> in excellent functional outcomes at 90 days.
                  </p>
                </div>
                
                {/* DISTALS */}
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded border-l-4 border-pink-500">
                  <span className="font-bold text-pink-700 dark:text-pink-400">DISTALS</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded">Distal EVT</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    <strong>Tigertriever</strong> for distal occlusions: higher successful reperfusion at 24h without increased sICH.
                  </p>
                </div>
                
                {/* ORIENTA-MeVO */}
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded border-l-4 border-cyan-500">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400">ORIENTA-MeVO</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-cyan-500 text-white text-xs rounded">MeVO</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    <strong>EVT for medium vessel occlusions</strong> improved 90-day functional outcomes without excess sICH in a Chinese population.
                  </p>
                </div>
              </div>
            </div>

                {/* EVT Eligibility Algorithm */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-300 dark:border-green-700 rounded-lg">
                  <h4 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Algorithm for Management of Acute Ischemic Stroke Eligible for EVT
                  </h4>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-border">
                    <img 
                      src={evtAlgorithmImage} 
                      alt="EVT Eligibility Algorithm - Decision tree by population, vessel occlusion type, time from onset, tissue injury, baseline function, and evidence for EVT" 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                    <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded text-center">
                      <span className="font-semibold text-foreground">DVO</span>
                      <p className="text-muted-foreground">Distal Vessel Occlusion</p>
                    </div>
                    <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded text-center">
                      <span className="font-semibold text-foreground">EVT</span>
                      <p className="text-muted-foreground">Endovascular Thrombectomy</p>
                    </div>
                    <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded text-center">
                      <span className="font-semibold text-foreground">IDD</span>
                      <p className="text-muted-foreground">Insufficient Data to Determine</p>
                    </div>
                    <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded text-center">
                      <span className="font-semibold text-foreground">LVO</span>
                      <p className="text-muted-foreground">Large Vessel Occlusion</p>
                    </div>
                    <div className="p-1.5 bg-white/70 dark:bg-gray-800/70 rounded text-center">
                      <span className="font-semibold text-foreground">MVO</span>
                      <p className="text-muted-foreground">Medium Vessel Occlusion</p>
                    </div>
                  </div>
                  {/* Interactive EVT Decision Tree */}
                  <InteractiveEVTDecisionTree />

                  <p className="text-xs text-muted-foreground mt-3 italic">
                    mRS: modified Rankin Scale · ASPECTS: Alberta Stroke Program Early CT Score · PC-ASPECTS: Posterior Circulation ASPECTS · NIHSS: National Institutes of Health Stroke Scale. * LVO includes ICA, M1, and dominant M2 occlusions.
                  </p>
                </div>

              </TabsContent>

              {/* Assessment Tab */}
              <TabsContent value="assessment" className="space-y-6">
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

                  {/* CYP2C19 Genotype Testing Section - Show when DAPT is recommended */}
                  {pathwayState.recommendDAPT && (
                    <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600 rounded-lg">
                      <h5 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                        🧬 CYP2C19 Pharmacogenomics
                        <Badge variant="outline" className="ml-2 text-orange-600 border-orange-400">For Clopidogrel Dosing</Badge>
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* CYP2C19 Genotype */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                            CYP2C19 Genotype
                          </Label>
                          <Select value={inputs.cyp2c19Genotype} onValueChange={(v) => updateInput("cyp2c19Genotype", v)}>
                            <SelectTrigger className={cn(getInputClass(inputs.cyp2c19Genotype), "border-orange-300")}>
                              <SelectValue placeholder="Select genotype" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unknown">Unknown / Not tested</SelectItem>
                              <SelectItem value="*1/*1">*1/*1 (Normal Metabolizer)</SelectItem>
                              <SelectItem value="*1/*17">*1/*17 (Rapid Metabolizer)</SelectItem>
                              <SelectItem value="*17/*17">*17/*17 (Ultrarapid Metabolizer)</SelectItem>
                              <SelectItem value="*1/*2">*1/*2 (Intermediate Metabolizer)</SelectItem>
                              <SelectItem value="*1/*3">*1/*3 (Intermediate Metabolizer)</SelectItem>
                              <SelectItem value="*2/*2">*2/*2 (Poor Metabolizer)</SelectItem>
                              <SelectItem value="*2/*3">*2/*3 (Poor Metabolizer)</SelectItem>
                              <SelectItem value="*3/*3">*3/*3 (Poor Metabolizer)</SelectItem>
                            </SelectContent>
                          </Select>
                          {pathwayState.cyp2c19PoorMetabolizer && (
                            <Badge className="bg-red-500 text-white text-xs">⚠️ POOR METABOLIZER → Use Ticagrelor</Badge>
                          )}
                          {pathwayState.cyp2c19IntermediateMetabolizer && (
                            <Badge className="bg-amber-500 text-white text-xs">⚡ Intermediate → Consider Ticagrelor</Badge>
                          )}
                          {pathwayState.cyp2c19NormalMetabolizer && (
                            <Badge className="bg-green-500 text-white text-xs">✓ Normal → Clopidogrel OK</Badge>
                          )}
                          {pathwayState.cyp2c19RapidMetabolizer && (
                            <Badge className="bg-blue-500 text-white text-xs">✓ Rapid/Ultra → Clopidogrel OK</Badge>
                          )}
                        </div>

                        {/* eGFR for Ticagrelor dosing */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                            eGFR (mL/min/1.73m²)
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g., 60"
                            value={inputs.egfr}
                            onChange={(e) => updateInput("egfr", e.target.value)}
                            className={cn(getInputClass(inputs.egfr), "border-orange-300")}
                          />
                          {pathwayState.severRenalImpairment && (
                            <Badge variant="destructive" className="text-xs">⚠️ eGFR &lt;30: Caution with Ticagrelor</Badge>
                          )}
                          {pathwayState.hasRenalImpairment && !pathwayState.severRenalImpairment && (
                            <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">eGFR 30-60: Monitor closely</Badge>
                          )}
                        </div>
                      </div>

                      {/* Ticagrelor Recommendation Panel */}
                      {(pathwayState.recommendTicagrelor || pathwayState.considerTicagrelor) && (
                        <div className={cn(
                          "p-4 rounded-lg border-2 mb-4",
                          pathwayState.recommendTicagrelor 
                            ? "bg-red-100 dark:bg-red-900/40 border-red-500"
                            : "bg-amber-100 dark:bg-amber-900/40 border-amber-500"
                        )}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🧬</span>
                            <span className={cn(
                              "font-bold text-lg",
                              pathwayState.recommendTicagrelor ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"
                            )}>
                              {pathwayState.recommendTicagrelor 
                                ? "TICAGRELOR RECOMMENDED (Poor Metabolizer)" 
                                : "Consider Ticagrelor (Intermediate Metabolizer)"}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {/* Dosing */}
                            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">📋 Ticagrelor Dosing:</p>
                              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                <li>• <strong>Standard:</strong> Ticagrelor 90mg BID + Aspirin 81mg daily</li>
                                <li>• <strong>Duration:</strong> 21-30 days (minor stroke/TIA), then Aspirin alone</li>
                                <li>• THALES trial regimen: Loading dose not required for stroke</li>
                              </ul>
                            </div>

                            {/* Renal Adjustments */}
                            {(pathwayState.hasRenalImpairment || pathwayState.severRenalImpairment) && (
                              <div className={cn(
                                "p-3 rounded border",
                                pathwayState.severRenalImpairment 
                                  ? "bg-red-50 dark:bg-red-900/30 border-red-400"
                                  : "bg-amber-50 dark:bg-amber-900/30 border-amber-400"
                              )}>
                                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">🔬 Renal Dosing Adjustments:</p>
                                <ul className="text-sm space-y-1">
                                  {pathwayState.severRenalImpairment ? (
                                    <>
                                      <li className="text-red-700 dark:text-red-400">• <strong>eGFR &lt;30:</strong> No dose adjustment needed but limited data</li>
                                      <li className="text-red-700 dark:text-red-400">• Monitor closely for bleeding</li>
                                      <li className="text-red-700 dark:text-red-400">• Not studied in dialysis patients</li>
                                    </>
                                  ) : (
                                    <>
                                      <li className="text-amber-700 dark:text-amber-400">• <strong>eGFR 30-60:</strong> No dose adjustment required</li>
                                      <li className="text-amber-700 dark:text-amber-400">• Monitor for bleeding signs</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Drug Interactions */}
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded border border-rose-400">
                              <p className="font-semibold text-rose-800 dark:text-rose-300 mb-2">⚠️ Critical Drug Interactions:</p>
                              <ul className="text-sm text-rose-700 dark:text-rose-400 space-y-1">
                                <li>• <strong className="text-rose-800 dark:text-rose-300">AVOID with strong CYP3A4 inhibitors:</strong></li>
                                <li className="ml-4">- Ketoconazole, Itraconazole, Voriconazole</li>
                                <li className="ml-4">- Clarithromycin, Nefazodone</li>
                                <li className="ml-4">- Ritonavir, Atazanavir, Indinavir</li>
                                <li>• <strong className="text-rose-800 dark:text-rose-300">AVOID with strong CYP3A4 inducers:</strong></li>
                                <li className="ml-4">- Rifampin, Phenytoin, Carbamazepine, Phenobarbital</li>
                                <li>• <strong className="text-rose-800 dark:text-rose-300">Caution:</strong> Aspirin &gt;100mg/day reduces Ticagrelor efficacy</li>
                                <li>• <strong>Digoxin:</strong> Monitor levels (Ticagrelor increases digoxin by ~30%)</li>
                                <li>• <strong>Simvastatin/Lovastatin:</strong> Max 40mg/day (increased statin exposure)</li>
                              </ul>
                            </div>

                            {/* Side Effects to Monitor */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-400">
                              <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">👁️ Side Effects to Monitor:</p>
                              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                <li>• <strong>Dyspnea:</strong> Common (10-15%), usually resolves, rarely requires discontinuation</li>
                                <li>• <strong>Bradyarrhythmias:</strong> Ventricular pauses in first week - caution in sick sinus syndrome</li>
                                <li>• <strong>Bleeding:</strong> Similar major bleeding to clopidogrel, more minor bleeding</li>
                                <li>• <strong>Hyperuricemia:</strong> Monitor uric acid in gout-prone patients</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Population Alert */}
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded border border-orange-400">
                        <p className="text-sm text-orange-800 dark:text-orange-300">
                          <strong>⚠️ High-Risk Populations:</strong> 30-50% of South Asian, 40-50% of East Asian, 
                          and 25-30% of African populations carry CYP2C19 loss-of-function alleles (*2, *3). 
                          Consider empiric Ticagrelor if genotyping unavailable in these populations.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* OAC Timing Inputs - Show when OAC is recommended */}
                  {pathwayState.recommendOAC && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-400 dark:border-purple-600 rounded-lg">
                      <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        OAC Timing: 1-3-6-12 Day Rule
                        <Badge variant="outline" className="ml-2 text-purple-600 border-purple-400">Based on Stroke Size</Badge>
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Stroke Size for OAC Timing */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            Infarct Size on Imaging
                          </Label>
                          <Select value={inputs.strokeSize} onValueChange={(v) => updateInput("strokeSize", v)}>
                            <SelectTrigger className={cn(getInputClass(inputs.strokeSize), "border-purple-300")}>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tia">TIA (no infarct)</SelectItem>
                              <SelectItem value="small">Small (&lt;1.5 cm)</SelectItem>
                              <SelectItem value="medium">Medium (1.5-3 cm)</SelectItem>
                              <SelectItem value="large">Large (&gt;3 cm or &gt;1/3 MCA)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Hemorrhagic Transformation */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            Hemorrhagic Transformation
                          </Label>
                          <Select value={inputs.hemorrhagicTransformation} onValueChange={(v) => updateInput("hemorrhagicTransformation", v)}>
                            <SelectTrigger className={cn(getInputClass(inputs.hemorrhagicTransformation), "border-purple-300")}>
                              <SelectValue placeholder="HT present?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="yes">Yes (HI-1/2 or PH-1/2)</SelectItem>
                            </SelectContent>
                          </Select>
                          {pathwayState.hasHemorrhagicTransformation && (
                            <Badge variant="destructive" className="text-xs">⚠️ Delay OAC</Badge>
                          )}
                        </div>

                        {/* Valvular AF */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            Valvular AF
                          </Label>
                          <Select value={inputs.valvularAF} onValueChange={(v) => updateInput("valvularAF", v)}>
                            <SelectTrigger className={cn(getInputClass(inputs.valvularAF), "border-purple-300")}>
                              <SelectValue placeholder="Valvular?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">Non-Valvular AF</SelectItem>
                              <SelectItem value="yes">Valvular AF (MS, mechanical valve)</SelectItem>
                            </SelectContent>
                          </Select>
                          {pathwayState.hasValvularAF && (
                            <Badge variant="destructive" className="text-xs">⚠️ Warfarin ONLY</Badge>
                          )}
                        </div>

                        {/* Antiphospholipid Syndrome */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            Antiphospholipid Syndrome
                          </Label>
                          <Select value={inputs.antiphospholipidSyndrome} onValueChange={(v) => updateInput("antiphospholipidSyndrome", v)}>
                            <SelectTrigger className={cn(getInputClass(inputs.antiphospholipidSyndrome), "border-purple-300")}>
                              <SelectValue placeholder="APLS?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No / Unknown</SelectItem>
                              <SelectItem value="yes">Yes (APLS confirmed)</SelectItem>
                            </SelectContent>
                          </Select>
                          {pathwayState.hasAPLS && (
                            <Badge variant="destructive" className="text-xs">⚠️ Warfarin ONLY</Badge>
                          )}
                        </div>
                      </div>

                      {/* NOAC Contraindication Warning */}
                      {pathwayState.noacContraindicated && (
                        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/40 border-2 border-red-500 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-bold text-red-800 dark:text-red-300 text-lg">
                              🚫 NOAC CONTRAINDICATED - Use Warfarin
                            </span>
                          </div>
                          <div className="space-y-2 text-sm text-red-700 dark:text-red-400">
                            {pathwayState.hasValvularAF && (
                              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded">
                                <strong>Valvular AF (Mechanical valve or Moderate-Severe Mitral Stenosis):</strong>
                                <ul className="mt-1 ml-4 list-disc">
                                  <li>NOACs are NOT approved and are inferior to Warfarin</li>
                                  <li>RE-ALIGN trial (Dabigatran): Stopped early due to excess thromboembolism & bleeding</li>
                                  <li>Target INR 2.5-3.5 for mechanical valves (varies by valve position)</li>
                                </ul>
                              </div>
                            )}
                            {pathwayState.hasAPLS && (
                              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded">
                                <strong>Antiphospholipid Antibody Syndrome (APLS):</strong>
                                <ul className="mt-1 ml-4 list-disc">
                                  <li>TRAPS trial (Rivaroxaban): Increased arterial thrombosis vs Warfarin</li>
                                  <li>ASTRO-APS trial (Apixaban): Inferior to Warfarin, excess thrombosis</li>
                                  <li>Warfarin with target INR 2.5-3.0 (or 3.0-4.0 for triple-positive APLS)</li>
                                  <li>NOACs should be switched to Warfarin in all APLS patients</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 1-3-6-12 Visual Guide */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className={cn(
                          "p-3 rounded-lg text-center border-2 transition-all",
                          inputs.strokeSize === "tia" && !pathwayState.hasHemorrhagicTransformation
                            ? "bg-green-200 dark:bg-green-800 border-green-500 ring-2 ring-green-400 shadow-lg"
                            : "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 opacity-60"
                        )}>
                          <div className="text-2xl font-bold text-green-700 dark:text-green-300">1</div>
                          <div className="text-xs font-medium text-green-800 dark:text-green-200">Day</div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">TIA</div>
                        </div>
                        <div className={cn(
                          "p-3 rounded-lg text-center border-2 transition-all",
                          inputs.strokeSize === "small" && !pathwayState.hasHemorrhagicTransformation
                            ? "bg-blue-200 dark:bg-blue-800 border-blue-500 ring-2 ring-blue-400 shadow-lg"
                            : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 opacity-60"
                        )}>
                          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">3</div>
                          <div className="text-xs font-medium text-blue-800 dark:text-blue-200">Days</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Small</div>
                        </div>
                        <div className={cn(
                          "p-3 rounded-lg text-center border-2 transition-all",
                          inputs.strokeSize === "medium" && !pathwayState.hasHemorrhagicTransformation
                            ? "bg-amber-200 dark:bg-amber-800 border-amber-500 ring-2 ring-amber-400 shadow-lg"
                            : "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 opacity-60"
                        )}>
                          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">6</div>
                          <div className="text-xs font-medium text-amber-800 dark:text-amber-200">Days</div>
                          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Medium</div>
                        </div>
                        <div className={cn(
                          "p-3 rounded-lg text-center border-2 transition-all",
                          inputs.strokeSize === "large" && !pathwayState.hasHemorrhagicTransformation
                            ? "bg-red-200 dark:bg-red-800 border-red-500 ring-2 ring-red-400 shadow-lg"
                            : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 opacity-60"
                        )}>
                          <div className="text-2xl font-bold text-red-700 dark:text-red-300">12</div>
                          <div className="text-xs font-medium text-red-800 dark:text-red-200">Days</div>
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">Large</div>
                        </div>
                      </div>

                      {/* Timing Recommendation Display */}
                      {pathwayState.oacTiming && (
                        <div className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          pathwayState.oacTiming.severity === "low_risk" 
                            ? "bg-green-100 dark:bg-green-900/40 border-green-500"
                            : pathwayState.oacTiming.severity === "moderate_risk"
                              ? "bg-amber-100 dark:bg-amber-900/40 border-amber-500"
                              : "bg-red-100 dark:bg-red-900/40 border-red-500"
                        )}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                              "px-4 py-2 rounded-lg font-bold text-lg",
                              pathwayState.oacTiming.severity === "low_risk"
                                ? "bg-green-600 text-white"
                                : pathwayState.oacTiming.severity === "moderate_risk"
                                  ? "bg-amber-600 text-white"
                                  : "bg-red-600 text-white"
                            )}>
                              Day {pathwayState.oacTiming.days}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Start OAC/NOAC</p>
                              <p className="text-sm text-muted-foreground">{pathwayState.oacTiming.recommendation}</p>
                            </div>
                          </div>
                          {pathwayState.hasHemorrhagicTransformation && (
                            <div className="mt-2 p-2 bg-red-200 dark:bg-red-900/60 rounded text-sm text-red-800 dark:text-red-200">
                              ⚠️ <strong>Hemorrhagic transformation present:</strong> Repeat imaging at Day 7-10 to confirm stability before initiating OAC.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reference Note */}
                      <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-muted-foreground">
                        <strong>1-3-6-12 Rule Reference:</strong> European Stroke Organisation guidelines. TIA = Day 1, Small infarct = Day 3, 
                        Medium infarct = Day 6, Large infarct = Day 12. Consider bridging with aspirin until OAC started.
                      </div>
                    </div>
                  )}

                  {/* Recommendation Summary */}
                  {(pathwayState.recommendOAC || pathwayState.recommendDAPT || pathwayState.recommendSAPT) && (
                    <div className={cn(
                      "mt-4 p-3 rounded-lg border-2 transition-all",
                      pathwayState.recommendOAC 
                        ? pathwayState.noacContraindicated 
                          ? "bg-red-100 dark:bg-red-900/40 border-red-500"
                          : "bg-purple-100 dark:bg-purple-900/40 border-purple-500" 
                        : pathwayState.recommendDAPT 
                          ? pathwayState.recommendTicagrelor
                            ? "bg-orange-100 dark:bg-orange-900/40 border-orange-500"
                            : "bg-amber-100 dark:bg-amber-900/40 border-amber-500"
                          : "bg-green-100 dark:bg-green-900/40 border-green-500"
                    )}>
                      <p className={cn(
                        "font-bold text-sm",
                        pathwayState.recommendOAC 
                          ? pathwayState.noacContraindicated 
                            ? "text-red-800 dark:text-red-300"
                            : "text-purple-800 dark:text-purple-300" 
                          : pathwayState.recommendDAPT 
                            ? pathwayState.recommendTicagrelor
                              ? "text-orange-800 dark:text-orange-300"
                              : "text-amber-800 dark:text-amber-300"
                            : "text-green-800 dark:text-green-300"
                      )}>
                        ✓ Recommended: {
                          pathwayState.recommendOAC 
                            ? pathwayState.noacContraindicated 
                              ? "WARFARIN (NOAC Contraindicated)" 
                              : "OAC/NOAC" 
                            : pathwayState.recommendDAPT 
                              ? pathwayState.recommendTicagrelor
                                ? "TICAGRELOR + ASA (CYP2C19 Poor Metabolizer)"
                                : "DAPT (21-90 days)" 
                              : "SAPT (long-term)"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pathwayState.recommendOAC && (
                          pathwayState.noacContraindicated 
                            ? `${pathwayState.hasValvularAF ? 'Valvular AF' : ''}${pathwayState.hasValvularAF && pathwayState.hasAPLS ? ' + ' : ''}${pathwayState.hasAPLS ? 'APLS' : ''} detected → Warfarin ONLY (NOACs contraindicated). ${pathwayState.oacTiming ? `Start Day ${pathwayState.oacTiming.days}.` : 'Select stroke size above for timing.'}`
                            : `AF or cardioembolic source detected → Anticoagulation indicated. ${pathwayState.oacTiming ? `Start Day ${pathwayState.oacTiming.days} based on stroke size.` : 'Select stroke size above for timing.'}`
                        )}
                        {pathwayState.recommendDAPT && (
                          pathwayState.recommendTicagrelor
                            ? `CYP2C19 poor metabolizer (${inputs.cyp2c19Genotype}) → Ticagrelor 90mg BID + Aspirin 81mg daily. Clopidogrel will NOT be effective.`
                            : pathwayState.considerTicagrelor
                              ? `Minor stroke/TIA within 24h → Consider Ticagrelor (intermediate metabolizer ${inputs.cyp2c19Genotype}). Standard: ASA + Clopidogrel.`
                              : "Minor stroke/TIA within 24h without cardioembolic source → DAPT for 21-90 days, then transition to SAPT."
                        )}
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
                        <li>• <strong>First-line:</strong> {pathwayState.recommendTicagrelor ? <span className="text-red-600 dark:text-red-400 font-bold">Ticagrelor + ASA (Poor metabolizer)</span> : "Aspirin + Clopidogrel"}</li>
                        <li>• 21-90 days (minor stroke/TIA)</li>
                        <li>• ⚠️ Check CYP2C19 status {pathwayState.cyp2c19PoorMetabolizer && <Badge className="bg-red-500 text-white text-xs ml-1">POOR</Badge>}</li>
                        {pathwayState.recommendDAPT && (
                          <li className="text-amber-800 dark:text-amber-300 font-medium">• Then transition to SAPT</li>
                        )}
                      </ul>
                      
                      {/* CYP2C19 Genotype-Based Recommendation */}
                      {pathwayState.recommendTicagrelor ? (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded border-2 border-red-500">
                          <p className="font-semibold text-red-800 dark:text-red-300 mb-1">
                            🧬 TICAGRELOR RECOMMENDED (Poor Metabolizer Detected):
                          </p>
                          <ul className="text-red-700 dark:text-red-400 space-y-0.5">
                            <li>• <strong>Ticagrelor 90mg BID</strong> + Aspirin 81mg daily</li>
                            <li>• CYP2C19 genotype: {inputs.cyp2c19Genotype}</li>
                            <li>• Clopidogrel will NOT be effective in this patient</li>
                            <li>• ⚠️ Check drug interactions above</li>
                          </ul>
                        </div>
                      ) : pathwayState.considerTicagrelor ? (
                        <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/40 rounded border border-amber-400">
                          <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                            🧬 Consider Ticagrelor (Intermediate Metabolizer):
                          </p>
                          <ul className="text-amber-700 dark:text-amber-400 space-y-0.5">
                            <li>• CYP2C19 genotype: {inputs.cyp2c19Genotype}</li>
                            <li>• Reduced clopidogrel efficacy possible</li>
                            <li>• <strong>Ticagrelor 90mg BID</strong> + Aspirin 81mg daily as alternative</li>
                          </ul>
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/40 rounded border border-orange-300 dark:border-orange-600">
                          <p className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                            🧬 CYP2C19 Poor Metabolizer Alternative:
                          </p>
                          <ul className="text-orange-700 dark:text-orange-400 space-y-0.5">
                            <li>• <strong>Ticagrelor 90mg BID</strong> + Aspirin 81mg daily</li>
                            <li>• Not affected by CYP2C19 polymorphisms</li>
                            <li>• THALES trial: Ticagrelor + ASA in minor stroke/TIA</li>
                            <li>• ⚠️ 30-50% of Indian population carries LOF alleles</li>
                          </ul>
                        </div>
                      )}
                      
                      {/* Prasugrel Contraindication Warning */}
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded border border-red-300 dark:border-red-600">
                        <p className="font-semibold text-red-800 dark:text-red-300 mb-1">
                          🚫 Prasugrel CONTRAINDICATED in Stroke/TIA:
                        </p>
                        <ul className="text-red-700 dark:text-red-400 space-y-0.5">
                          <li>• FDA Black Box: Prior stroke/TIA is formal contraindication</li>
                          <li>• TRITON-TIMI 38: 6.5% vs 1.2% stroke rate (vs clopidogrel)</li>
                          <li>• Increased intracranial hemorrhage risk</li>
                          <li>• If on prasugrel for ACS and develops stroke → stop prasugrel</li>
                          <li className="italic text-red-600 dark:text-red-300">• Only used in narrow neurointerventional scenarios (not routine)</li>
                        </ul>
                      </div>
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
                        <li>• {pathwayState.noacContraindicated ? <span className="text-red-600 dark:text-red-400 font-bold">NOAC contraindicated → Warfarin only</span> : "NOAC preferred over Warfarin"}</li>
                        <li>• Delay 4-14 days post-stroke</li>
                        {pathwayState.recommendOAC && pathwayState.hasAF && (
                          <li className="text-purple-800 dark:text-purple-300 font-medium">• AF detected → indefinite OAC</li>
                        )}
                      </ul>
                      
                      {/* NOAC Contraindication Warning in Flowchart */}
                      {pathwayState.noacContraindicated && pathwayState.recommendOAC && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded border border-red-400">
                          <p className="font-semibold text-red-800 dark:text-red-300 text-xs mb-1">
                            🚫 NOAC Contraindicated:
                          </p>
                          <ul className="text-red-700 dark:text-red-400 space-y-0.5">
                            {pathwayState.hasValvularAF && (
                              <li>• Valvular AF (MS/mechanical) → Warfarin INR 2.5-3.5</li>
                            )}
                            {pathwayState.hasAPLS && (
                              <li>• APLS → Warfarin INR 2.5-3.0 (or 3.0-4.0 if triple+)</li>
                            )}
                          </ul>
                        </div>
                      )}
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

              {/* Comments Section */}
              <ModuleCommentBox
                value={comment}
                onChange={setComment}
                placeholder="Add clinical notes about this patient's acute stroke management, treatment decisions, or timing considerations..."
                label="Acute Stroke Algorithm Notes"
              />
            </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default InteractiveAcuteStrokeAlgorithm;
