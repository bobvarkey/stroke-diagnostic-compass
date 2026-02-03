import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Brain,
  Clock,
  Network,
  ArrowUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  RotateCcw,
  Zap,
  Activity,
  Gauge,
  TrendingUp,
  Shield,
  Info,
  ArrowUpCircle,
  Crosshair
} from "lucide-react";
import LVOLocationSelector, { LVOLocation } from "./LVOLocationSelector";
import ImagingScanProgress, { ScanItem, ScanStatus } from "./ImagingScanProgress";
import HeadsUpTest from "./HeadsUpTest";
import ETICIScoreCalculator from "./ETICIScoreCalculator";
import TALDefinitionGuide from "./TALDefinitionGuide";
import CTACollateralGrading from "./CTACollateralGrading";
import { toast } from "@/hooks/use-toast";
import ModuleCommentBox from "./ModuleCommentBox";

type CollateralStatus = "good" | "intermediate" | "poor" | null;
type HeadsUpResult = "positive" | "negative" | "not_performed" | null;
type TimeWindow = "0-4.5h" | "4.5-6h" | "6-24h" | ">24h" | null;
type RecommendationLevel = "strongly_recommended" | "recommended" | "consider" | "not_recommended";

interface AssessmentData {
  nihss: number | null;
  hasLVO: boolean | null;
  lvoLocation: LVOLocation | null;
  collateralStatus: CollateralStatus;
  headsUpResult: HeadsUpResult;
  timeWindow: TimeWindow;
  tpaEligible: boolean | null;
  aspectsScore: number | null;
  perfusionMismatch: boolean | null;
}

interface Recommendation {
  level: RecommendationLevel;
  title: string;
  description: string;
  actions: string[];
  evidence: string;
  caveats: string[];
}

// Default imaging scans for LVO workup
const DEFAULT_SCANS: ScanItem[] = [
  { id: "ncct", name: "Non-Contrast CT Head", shortName: "NCCT", status: "pending", isRequired: true },
  { id: "cta", name: "CT Angiography (Head/Neck)", shortName: "CTA", status: "pending", isRequired: true },
  { id: "ctp", name: "CT Perfusion", shortName: "CTP", status: "pending", isRequired: false },
  { id: "mra", name: "MR Angiography", shortName: "MRA", status: "pending", isRequired: false },
];

const LVODecisionDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [assessment, setAssessment] = useState<AssessmentData>({
    nihss: null,
    hasLVO: null,
    lvoLocation: null,
    collateralStatus: null,
    headsUpResult: null,
    timeWindow: null,
    tpaEligible: null,
    aspectsScore: null,
    perfusionMismatch: null,
  });
  const [imagingScans, setImagingScans] = useState<ScanItem[]>(DEFAULT_SCANS);
  const [savedLVOLocation, setSavedLVOLocation] = useState<LVOLocation | null>(null);
  const [comment, setComment] = useState("");

  const updateAssessment = <K extends keyof AssessmentData>(
    key: K,
    value: AssessmentData[K]
  ) => {
    setAssessment((prev) => ({ ...prev, [key]: value }));
  };

  const resetAssessment = () => {
    setAssessment({
      nihss: null,
      hasLVO: null,
      lvoLocation: null,
      collateralStatus: null,
      headsUpResult: null,
      timeWindow: null,
      tpaEligible: null,
      aspectsScore: null,
      perfusionMismatch: null,
    });
    setImagingScans(DEFAULT_SCANS);
    setSavedLVOLocation(null);
  };

  // Imaging scan handlers
  const handleScanStatusChange = (scanId: string, status: ScanStatus, result?: string) => {
    setImagingScans(prev => prev.map(scan => 
      scan.id === scanId 
        ? { ...scan, status, result, completedAt: status === "completed" ? new Date() : undefined }
        : scan
    ));
  };

  const handleMarkScanComplete = (scanId: string) => {
    setImagingScans(prev => prev.map(scan => 
      scan.id === scanId 
        ? { ...scan, status: "completed" as ScanStatus, completedAt: new Date() }
        : scan
    ));
    
    // If CTA completed, prompt for LVO confirmation
    if (scanId === "cta") {
      toast({
        title: "CTA Completed",
        description: "Please confirm LVO status and location based on imaging findings.",
      });
    }
  };

  const handleSaveLVOLocation = (location: LVOLocation) => {
    setSavedLVOLocation(location);
    toast({
      title: "LVO Location Saved",
      description: `${location.side !== "midline" ? location.side + " " : ""}${location.vessel} ${location.segment} recorded.`,
    });
  };

  // Calculate completion percentage
  const completionPercent = (() => {
    const fields = [
      assessment.nihss !== null,
      assessment.hasLVO !== null,
      assessment.collateralStatus !== null,
      assessment.timeWindow !== null,
      assessment.tpaEligible !== null,
    ];
    return (fields.filter(Boolean).length / fields.length) * 100;
  })();

  // Determine NIHSS category
  const getNIHSSCategory = () => {
    if (assessment.nihss === null) return null;
    if (assessment.nihss <= 5) return { label: "Mild", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" };
    if (assessment.nihss <= 15) return { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" };
    if (assessment.nihss <= 24) return { label: "Severe", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" };
    return { label: "Very Severe", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" };
  };

  // Generate treatment recommendation
  const getRecommendation = (): Recommendation | null => {
    if (!assessment.hasLVO || assessment.timeWindow === null) return null;

    const nihss = assessment.nihss ?? 0;
    const collaterals = assessment.collateralStatus;
    const headsUp = assessment.headsUpResult;
    const timeWindow = assessment.timeWindow;
    const tpaEligible = assessment.tpaEligible;
    const aspects = assessment.aspectsScore ?? 10;
    const mismatch = assessment.perfusionMismatch;

    // Early window with good profile
    if (timeWindow === "0-4.5h" && nihss >= 6) {
      return {
        level: "strongly_recommended",
        title: "Emergent IV tPA + Mechanical Thrombectomy",
        description: "Patient presents within optimal window with significant deficit. Dual therapy strongly recommended.",
        actions: [
          "Administer IV tPA immediately if eligible",
          "Activate neurointerventional team",
          "Proceed to mechanical thrombectomy",
          "Target door-to-needle <60 min, door-to-groin <90 min"
        ],
        evidence: "MR CLEAN, EXTEND-IA, SWIFT PRIME, ESCAPE, REVASCAT trials demonstrate significant benefit for combined therapy in LVO.",
        caveats: [
          "Verify no contraindications to tPA",
          "Consider blood pressure management",
          "ASPECTS ≥6 preferred for thrombectomy"
        ]
      };
    }

    // Early window, low NIHSS with positive Heads Up
    if (timeWindow === "0-4.5h" && nihss <= 5 && headsUp === "positive") {
      return {
        level: "strongly_recommended",
        title: "Consider Mechanical Thrombectomy",
        description: "Positive Heads Up test indicates collateral vulnerability despite mild symptoms. MT may prevent deterioration.",
        actions: [
          "Administer IV tPA if eligible",
          "Proceed to mechanical thrombectomy",
          "Do not delay for clinical observation",
          "Close monitoring if conservative approach chosen"
        ],
        evidence: "Heads Up test (Ali et al., 2016) identifies patients at risk of deterioration who may benefit from early intervention.",
        caveats: [
          "Consider patient preferences",
          "Balance procedural risks vs. expected deterioration",
          "Ensure adequate collateral assessment"
        ]
      };
    }

    // Early window, low NIHSS with negative Heads Up and good collaterals
    if (timeWindow === "0-4.5h" && nihss <= 5 && headsUp === "negative" && collaterals === "good") {
      return {
        level: "consider",
        title: "Medical Management with Close Monitoring",
        description: "Mild stroke with negative Heads Up test and good collaterals suggests adequate perfusion. Conservative management may be appropriate.",
        actions: [
          "Administer IV tPA if eligible",
          "Initiate intensive monitoring protocol",
          "Serial NIHSS assessments every 1-2 hours",
          "Have thrombectomy team on standby",
          "Low threshold for intervention if any deterioration"
        ],
        evidence: "SELECT2, ENDOLOW, and IN EXTREMIS trials suggest some mild LVO strokes may be managed conservatively.",
        caveats: [
          "This remains an area of active research",
          "Individual risk factors matter",
          "Any deterioration should prompt immediate reassessment"
        ]
      };
    }

    // Extended window (6-24h) with perfusion mismatch
    if ((timeWindow === "6-24h") && mismatch === true && aspects >= 6) {
      return {
        level: "strongly_recommended",
        title: "Late Window Mechanical Thrombectomy",
        description: "Patient meets extended window criteria with favorable imaging. Thrombectomy recommended per DAWN/DEFUSE-3.",
        actions: [
          "Confirm perfusion imaging meets selection criteria",
          "Proceed directly to mechanical thrombectomy",
          "IV tPA not indicated if >4.5h or already given"
        ],
        evidence: "DAWN and DEFUSE-3 trials demonstrate benefit up to 24 hours in selected patients with mismatch.",
        caveats: [
          "DAWN criteria: Clinical-core mismatch",
          "DEFUSE-3 criteria: Perfusion mismatch ratio ≥1.8",
          "Ischemic core volume limits apply"
        ]
      };
    }

    // 4.5-6h window
    if (timeWindow === "4.5-6h" && nihss >= 6) {
      return {
        level: "recommended",
        title: "Mechanical Thrombectomy",
        description: "Within 6-hour window for thrombectomy. IV tPA not indicated if >4.5h from onset.",
        actions: [
          "Activate neurointerventional team",
          "Proceed to mechanical thrombectomy",
          "Perfusion imaging recommended if available"
        ],
        evidence: "Original thrombectomy trials (2015) established 6-hour window. Extended window trials require imaging selection.",
        caveats: [
          "ASPECTS ≥6 generally recommended",
          "Consider perfusion imaging for borderline cases"
        ]
      };
    }

    // Poor collaterals - still consider MT
    if (collaterals === "poor" && nihss >= 6 && aspects >= 6) {
      return {
        level: "consider",
        title: "Consider Thrombectomy with Caution",
        description: "Poor collaterals increase risk but do not necessarily preclude benefit. Individualized decision needed.",
        actions: [
          "Discuss risks and benefits with patient/family",
          "Multidisciplinary team discussion recommended",
          "If proceeding, aim for fastest possible recanalization"
        ],
        evidence: "Poor collaterals associated with worse outcomes but some patients still benefit from recanalization.",
        caveats: [
          "Higher risk of hemorrhagic transformation",
          "May have limited benefit if large established core",
          "Consider patient age, comorbidities, baseline function"
        ]
      };
    }

    // Low NIHSS, no Heads Up test performed
    if (nihss !== null && nihss <= 5 && headsUp === "not_performed") {
      return {
        level: "consider",
        title: "Perform Heads Up Test",
        description: "Low NIHSS with LVO creates uncertainty. Heads Up test recommended to assess collateral vulnerability.",
        actions: [
          "Elevate head of bed to 90°",
          "Monitor for 30 minutes",
          "Serial NIHSS assessment",
          "Terminate if any worsening → proceed to MT"
        ],
        evidence: "Ali et al., 2016 - Heads Up test helps stratify mild LVO strokes for intervention.",
        caveats: [
          "Do not delay if clinical concern high",
          "Consider collateral status on CTA",
          "Patient must be hemodynamically stable"
        ]
      };
    }

    // Beyond 24h
    if (timeWindow === ">24h") {
      return {
        level: "not_recommended",
        title: "Thrombectomy Not Routinely Indicated",
        description: "Beyond established time windows for intervention. Focus on secondary prevention.",
        actions: [
          "Optimize medical management",
          "Initiate secondary prevention",
          "Rehabilitation planning",
          "Identify stroke etiology"
        ],
        evidence: "No established benefit for MT beyond 24 hours in current evidence.",
        caveats: [
          "Rare exceptions may exist (wake-up stroke with favorable imaging)",
          "Consider stroke neurology consultation"
        ]
      };
    }

    return null;
  };

  const nihssCategory = getNIHSSCategory();
  const recommendation = getRecommendation();

  const getRecommendationStyle = (level: RecommendationLevel) => {
    switch (level) {
      case "strongly_recommended":
        return {
          bg: "bg-green-50 dark:bg-green-950/30",
          border: "border-green-300 dark:border-green-700",
          icon: <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />,
          badge: "bg-green-600 text-white"
        };
      case "recommended":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-300 dark:border-blue-700",
          icon: <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
          badge: "bg-blue-600 text-white"
        };
      case "consider":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-950/30",
          border: "border-yellow-300 dark:border-yellow-700",
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />,
          badge: "bg-yellow-600 text-white"
        };
      case "not_recommended":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-red-300 dark:border-red-700",
          icon: <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />,
          badge: "bg-red-600 text-white"
        };
    }
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Target className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                </div>
                <div>
                  <span className="text-lg">LVO Decision Dashboard</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    Integrated treatment decision support for Large Vessel Occlusion
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {recommendation && (
                  <Badge className={getRecommendationStyle(recommendation.level).badge}>
                    {recommendation.level.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Imaging Workflow Progress - NEW */}
            <ImagingScanProgress
              scans={imagingScans}
              onStatusChange={handleScanStatusChange}
              onMarkComplete={handleMarkScanComplete}
            />

            {/* Completion Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Clinical Assessment Completion</span>
                <span className="font-medium">{Math.round(completionPercent)}%</span>
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>

            {/* Input Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* NIHSS Input */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Label className="font-semibold">NIHSS Score</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={42}
                    placeholder="0-42"
                    value={assessment.nihss ?? ""}
                    onChange={(e) => updateAssessment("nihss", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-24"
                  />
                  {nihssCategory && (
                    <Badge className={`${nihssCategory.bg} ${nihssCategory.color}`}>
                      {nihssCategory.label} ({assessment.nihss})
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mild ≤5 | Moderate 6-15 | Severe 16-24 | Very Severe &gt;24
                </p>
              </div>

              {/* LVO Confirmation */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Label className="font-semibold">Large Vessel Occlusion (LVO)</Label>
                  {savedLVOLocation && (
                    <Badge className="bg-green-600 text-white text-xs ml-auto">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {savedLVOLocation.vessel} {savedLVOLocation.segment}
                    </Badge>
                  )}
                </div>
                <RadioGroup
                  value={assessment.hasLVO === null ? "" : assessment.hasLVO.toString()}
                  onValueChange={(v) => updateAssessment("hasLVO", v === "true")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="lvo-yes" />
                    <Label htmlFor="lvo-yes">Confirmed LVO</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="lvo-no" />
                    <Label htmlFor="lvo-no">No LVO</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  ICA, M1, M2 (proximal), basilar artery occlusion
                </p>
              </div>

              {/* Time Window */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Label className="font-semibold">Time from Symptom Onset</Label>
                </div>
                <RadioGroup
                  value={assessment.timeWindow ?? ""}
                  onValueChange={(v) => updateAssessment("timeWindow", v as TimeWindow)}
                  className="grid grid-cols-2 gap-2"
                >
                  {[
                    { value: "0-4.5h", label: "0 - 4.5 hours" },
                    { value: "4.5-6h", label: "4.5 - 6 hours" },
                    { value: "6-24h", label: "6 - 24 hours" },
                    { value: ">24h", label: "> 24 hours" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                      <Label htmlFor={`time-${option.value}`} className="text-sm">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* tPA Eligibility */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Label className="font-semibold">IV tPA Eligibility</Label>
                </div>
                <RadioGroup
                  value={assessment.tpaEligible === null ? "" : assessment.tpaEligible.toString()}
                  onValueChange={(v) => updateAssessment("tpaEligible", v === "true")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="tpa-yes" />
                    <Label htmlFor="tpa-yes">Eligible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="tpa-no" />
                    <Label htmlFor="tpa-no">Not Eligible / Contraindicated</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Based on AHA/ASA tPA eligibility criteria
                </p>
              </div>

              {/* Collateral Status */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <Label className="font-semibold">CTA Collateral Status</Label>
                </div>
                <RadioGroup
                  value={assessment.collateralStatus ?? ""}
                  onValueChange={(v) => updateAssessment("collateralStatus", v as CollateralStatus)}
                  className="flex gap-3"
                >
                  {[
                    { value: "good", label: "Good", color: "text-green-600" },
                    { value: "intermediate", label: "Intermediate", color: "text-yellow-600" },
                    { value: "poor", label: "Poor", color: "text-red-600" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`coll-${option.value}`} />
                      <Label htmlFor={`coll-${option.value}`} className={`text-sm ${option.color}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Based on Tan, Maas, or Multiphase CTA grading
                </p>
              </div>

              {/* Heads Up Test */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <Label className="font-semibold">Heads Up Test Result</Label>
                </div>
                <RadioGroup
                  value={assessment.headsUpResult ?? ""}
                  onValueChange={(v) => updateAssessment("headsUpResult", v as HeadsUpResult)}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { value: "positive", label: "Positive (Worsening)", color: "text-red-600" },
                    { value: "negative", label: "Negative (Stable)", color: "text-green-600" },
                    { value: "not_performed", label: "Not Performed", color: "text-gray-600" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`hu-${option.value}`} />
                      <Label htmlFor={`hu-${option.value}`} className={`text-sm ${option.color}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  For mild LVO strokes (NIHSS ≤5)
                </p>
              </div>

              {/* ASPECTS Score */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Label className="font-semibold">ASPECTS Score (Optional)</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    placeholder="0-10"
                    value={assessment.aspectsScore ?? ""}
                    onChange={(e) => updateAssessment("aspectsScore", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-24"
                  />
                  {assessment.aspectsScore !== null && (
                    <Badge variant={assessment.aspectsScore >= 6 ? "default" : "destructive"}>
                      {assessment.aspectsScore >= 6 ? "Favorable" : "Large Core"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  ≥6 generally favorable for thrombectomy
                </p>
              </div>

              {/* Perfusion Mismatch */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Label className="font-semibold">Perfusion Mismatch (Extended Window)</Label>
                </div>
                <RadioGroup
                  value={assessment.perfusionMismatch === null ? "" : assessment.perfusionMismatch.toString()}
                  onValueChange={(v) => updateAssessment("perfusionMismatch", v === "true")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="mismatch-yes" />
                    <Label htmlFor="mismatch-yes">Mismatch Present</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="mismatch-no" />
                    <Label htmlFor="mismatch-no">No Mismatch</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  DAWN/DEFUSE-3 criteria for 6-24h window
                </p>
              </div>
            </div>

            {/* LVO Location Selector - Shows when LVO is confirmed */}
            {assessment.hasLVO === true && (
              <LVOLocationSelector
                value={assessment.lvoLocation}
                onChange={(location) => updateAssessment("lvoLocation", location)}
                onSave={handleSaveLVOLocation}
              />
            )}

            {/* Reset Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={resetAssessment} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset All
              </Button>
            </div>

            {/* Recommendation Panel */}
            {recommendation && (
              <Alert className={`border-2 ${getRecommendationStyle(recommendation.level).border} ${getRecommendationStyle(recommendation.level).bg}`}>
                <div className="flex items-start gap-3">
                  {getRecommendationStyle(recommendation.level).icon}
                  <div className="flex-1 space-y-4">
                    <div>
                      <AlertTitle className="text-xl font-bold mb-1">
                        {recommendation.title}
                      </AlertTitle>
                      <AlertDescription className="text-base">
                        {recommendation.description}
                      </AlertDescription>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Recommended Actions
                      </h4>
                      <ul className="space-y-1 ml-6">
                        {recommendation.actions.map((action, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evidence */}
                    <div className="p-3 bg-background/60 rounded-lg border">
                      <h4 className="font-semibold flex items-center gap-2 text-sm mb-1">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Evidence Base
                      </h4>
                      <p className="text-sm text-muted-foreground">{recommendation.evidence}</p>
                    </div>

                    {/* Caveats */}
                    {recommendation.caveats.length > 0 && (
                      <div className="p-3 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold flex items-center gap-2 text-sm mb-2 text-yellow-800 dark:text-yellow-300">
                          <AlertTriangle className="h-4 w-4" />
                          Important Considerations
                        </h4>
                        <ul className="space-y-1">
                          {recommendation.caveats.map((caveat, idx) => (
                            <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                              <span>⚠️</span>
                              {caveat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            {/* Summary Panel when no clear recommendation */}
            {!recommendation && assessment.hasLVO !== null && (
              <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle>Awaiting Complete Assessment</AlertTitle>
                <AlertDescription>
                  Complete all required fields to receive a treatment recommendation. 
                  Key missing data:{" "}
                  {[
                    assessment.nihss === null && "NIHSS",
                    assessment.timeWindow === null && "Time Window",
                    assessment.collateralStatus === null && "Collateral Status",
                  ].filter(Boolean).join(", ")}
                </AlertDescription>
              </Alert>
            )}

            {/* Clinical Decision Flowchart Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Decision Algorithm Summary
              </h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Step 1:</strong> Confirm LVO on CTA/MRA (ICA, M1, M2, basilar)</p>
                <p><strong>Step 2:</strong> Assess time window and tPA eligibility</p>
                <p><strong>Step 3:</strong> If NIHSS ≤5, consider Heads Up test and collateral assessment</p>
                <p><strong>Step 4:</strong> For 6-24h window, perfusion imaging required (DAWN/DEFUSE-3 criteria)</p>
                <p><strong>Step 5:</strong> Integrate all factors for individualized treatment decision</p>
              </div>
            </div>

            {/* EVT Assessment Tools - Collapsible Sub-sections */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Crosshair className="h-5 w-5" />
                EVT Assessment Tools
              </h3>
              
              {/* CTA Collateral Grading - Collapsible */}
              <Collapsible>
                <Card className="border-cyan-200 dark:border-cyan-800">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 transition-colors py-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          CTA Collateral Grading Scales
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <CTACollateralGrading />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Heads Up Test - Collapsible */}
              <Collapsible>
                <Card className="border-amber-200 dark:border-amber-800">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors py-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          Heads Up Test (Low NIHSS LVO)
                        </div>
                        <Badge variant="outline" className="mr-2 text-xs">For NIHSS ≤5</Badge>
                        <ChevronDown className="h-4 w-4" />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <HeadsUpTest />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* eTICI Score - Collapsible */}
              <Collapsible>
                <Card className="border-green-200 dark:border-green-800">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-950/30 transition-colors py-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                          eTICI Score (Post-EVT Reperfusion)
                        </div>
                        <Badge variant="outline" className="mr-2 text-xs">Post-Procedure</Badge>
                        <ChevronDown className="h-4 w-4" />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <ETICIScoreCalculator />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* TAL Definition Guide - Collapsible */}
              <Collapsible>
                <Card className="border-indigo-200 dark:border-indigo-800">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors py-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          Target Arterial Lesion (TAL) Guide
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <TALDefinitionGuide />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground p-3 border rounded-lg bg-muted/30">
              <p className="font-medium mb-1">⚕️ Clinical Decision Support Disclaimer</p>
              <p>
                This tool provides guidance based on current evidence and guidelines (AHA/ASA 2019, 
                ESCAPE-NA1, DAWN, DEFUSE-3). Individual patient factors, institutional capabilities, 
                and clinical judgment should always guide treatment decisions. Consult stroke neurology 
                and neurointerventional teams for complex cases.
              </p>
            </div>

            {/* Comments Section */}
            <ModuleCommentBox
              value={comment}
              onChange={setComment}
              placeholder="Add notes about LVO assessment, imaging findings, collateral status, or treatment recommendations..."
              label="LVO Assessment Notes"
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default LVODecisionDashboard;
