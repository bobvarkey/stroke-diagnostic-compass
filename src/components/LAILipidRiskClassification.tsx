import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ChevronDown, Heart, Target, Info, CheckCircle2, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import LipidRiskPDFReport from "./LipidRiskPDFReport";

interface RiskFactor {
  id: string;
  label: string;
  description?: string;
  category: string;
}

interface RiskCategory {
  name: string;
  ldlTarget: string;
  optionalTarget?: string;
  nonHdlTarget?: string;
  apoBTarget?: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const riskCategories: Record<string, RiskCategory> = {
  low: {
    name: "Low Risk",
    ldlTarget: "<100 mg/dL",
    nonHdlTarget: "<130 mg/dL",
    apoBTarget: "<100 mg/dL",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  moderate: {
    name: "Moderate Risk",
    ldlTarget: "<100 mg/dL",
    nonHdlTarget: "<130 mg/dL",
    apoBTarget: "<100 mg/dL",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  high: {
    name: "High Risk",
    ldlTarget: "<70 mg/dL",
    nonHdlTarget: "<100 mg/dL",
    apoBTarget: "<80 mg/dL",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  veryHigh: {
    name: "Very High Risk",
    ldlTarget: "<50 mg/dL",
    nonHdlTarget: "<80 mg/dL",
    apoBTarget: "<65 mg/dL",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
  },
  extremeA: {
    name: "Extreme Risk (Group A)",
    ldlTarget: "<50 mg/dL",
    optionalTarget: "≤30 mg/dL (optional)",
    nonHdlTarget: "<80 mg/dL",
    apoBTarget: "<65 mg/dL",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-950/50",
    borderColor: "border-red-300 dark:border-red-700",
  },
  extremeB: {
    name: "Extreme Risk (Group B)",
    ldlTarget: "≤30 mg/dL (mandatory)",
    nonHdlTarget: "<60 mg/dL",
    apoBTarget: "<55 mg/dL",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-950/50",
    borderColor: "border-purple-300 dark:border-purple-700",
  },
  extremeC: {
    name: "Extreme Risk (Group C)",
    ldlTarget: "10-15 mg/dL",
    nonHdlTarget: "<40 mg/dL",
    apoBTarget: "<40 mg/dL",
    color: "text-pink-700 dark:text-pink-300",
    bgColor: "bg-pink-100 dark:bg-pink-950/50",
    borderColor: "border-pink-300 dark:border-pink-700",
  },
};

// High Risk Features (LDL target <70 mg/dL)
const highRiskFeatures: RiskFactor[] = [
  { id: "hr_family_history", label: "Family history of premature CAD", description: "Independently warrants LDL-C <70 mg/dL", category: "High Risk Features" },
  { id: "hr_nafld_fibrosis", label: "NAFLD with fibrosis grade II-III", category: "High Risk Features" },
  { id: "hr_metabolic_syndrome", label: "Metabolic syndrome", category: "High Risk Features" },
  { id: "hr_ckd_3b_4", label: "CKD Stage 3B or 4", category: "High Risk Features" },
  { id: "hr_apob_130", label: "ApoB >130 mg/dL", category: "High Risk Features" },
  { id: "hr_lpa_50", label: "Lp(a) ≥50 mg/dL", category: "High Risk Features" },
  { id: "hr_cac_1_99", label: "CAC score 1-99, <75th percentile for age/gender/ethnicity", category: "High Risk Features" },
  { id: "hr_extreme_rf", label: "Extreme elevation of a single risk factor", category: "High Risk Features" },
];

// Risk Modifiers
const riskModifiers: RiskFactor[] = [
  { id: "rm_elevated_tg", label: "Elevated TG (fasting >150 or non-fasting >175 mg/dL)", category: "Risk Modifiers" },
  { id: "rm_lpa_20_49", label: "Lp(a) 20-49 mg/dL", category: "Risk Modifiers" },
  { id: "rm_waist_men", label: "Increased waist circumference: Men >90 cm", category: "Risk Modifiers" },
  { id: "rm_waist_women", label: "Increased waist circumference: Women >80 cm", category: "Risk Modifiers" },
  { id: "rm_ifg", label: "Impaired fasting glucose (100-125 mg/dL)", category: "Risk Modifiers" },
  { id: "rm_hscrp", label: "hs-CRP >2 mg/L", category: "Risk Modifiers" },
  { id: "rm_air_pollution", label: "Air pollution exposure", category: "Risk Modifiers" },
  { id: "rm_inflammatory_joint", label: "Inflammatory joint diseases (RA, AS, PsA)", category: "Risk Modifiers" },
  { id: "rm_premature_menopause", label: "Premature menopause", category: "Risk Modifiers" },
  { id: "rm_preeclampsia", label: "History of preeclampsia", category: "Risk Modifiers" },
  { id: "rm_gdm", label: "Gestational diabetes", category: "Risk Modifiers" },
  { id: "rm_pcos", label: "Polycystic ovary syndrome", category: "Risk Modifiers" },
  { id: "rm_prs", label: "High polygenic risk score", category: "Risk Modifiers" },
  { id: "rm_hiv", label: "HIV infection", category: "Risk Modifiers" },
];

// Diabetes-Related
const diabetesFactors: RiskFactor[] = [
  { id: "dm_present", label: "Diabetes mellitus present", description: "All DM patients: Start lipid therapy on Day 1; Target LDL <70 mg/dL", category: "Diabetes" },
  { id: "dm_tod", label: "Diabetes + Target organ damage", description: "LDL target <50 mg/dL", category: "Diabetes" },
  { id: "dm_2_major_rf", label: "Diabetes + ≥2 major ASCVD risk factors", description: "LDL target <50 mg/dL", category: "Diabetes" },
  { id: "dm_ascvd", label: "Diabetes + ASCVD (Extreme Risk A)", description: "Optional target ≤30 mg/dL", category: "Diabetes" },
  { id: "dm_ascvd_tod", label: "Diabetes + ASCVD + TOD or ≥2 major RF", description: "LDL target ≤30 mg/dL", category: "Diabetes" },
];

// ASCVD-Related
const ascvdFactors: RiskFactor[] = [
  { id: "ascvd_present", label: "Established ASCVD", description: "LDL target <50 mg/dL", category: "ASCVD" },
  { id: "ascvd_recurrent_acs", label: "Recurrent ACS (Extreme Risk B)", description: "LDL target ≤30 mg/dL mandatory", category: "ASCVD" },
  { id: "ascvd_polyvascular", label: "Polyvascular disease (Extreme Risk B)", description: "LDL target ≤30 mg/dL mandatory", category: "ASCVD" },
];

// Subclinical Atherosclerosis
const subclinicalFactors: RiskFactor[] = [
  { id: "sub_carotid_plaque", label: "Non-obstructive carotid plaque", description: "Equivalent to ASCVD; LDL <50 mg/dL", category: "Subclinical Atherosclerosis" },
  { id: "sub_femoral_plaque", label: "Non-obstructive femoral plaque", description: "Equivalent to ASCVD; LDL <50 mg/dL", category: "Subclinical Atherosclerosis" },
  { id: "sub_coronary_plaque", label: "Non-obstructive coronary plaque", description: "Equivalent to ASCVD; LDL <50 mg/dL", category: "Subclinical Atherosclerosis" },
  { id: "sub_abi", label: "Ankle-brachial index <0.9", description: "Equivalent to ASCVD; LDL <50 mg/dL", category: "Subclinical Atherosclerosis" },
];

// CAC Score Categories
const cacFactors: RiskFactor[] = [
  { id: "cac_1_99_below75", label: "CAC 1-99, <75th percentile (High Risk)", description: "LDL target <70 mg/dL", category: "CAC Score" },
  { id: "cac_above75", label: "CAC >75th percentile for age/gender/ethnicity (Very High Risk)", description: "LDL target <50 mg/dL", category: "CAC Score" },
  { id: "cac_100_299", label: "CAC 100-299 (Very High Risk)", description: "LDL target <50 mg/dL", category: "CAC Score" },
  { id: "cac_above300", label: "CAC >300 (Extreme Risk A)", description: "Optional target ≤30 mg/dL", category: "CAC Score" },
];

// Familial Hypercholesterolemia
const fhFactors: RiskFactor[] = [
  { id: "fh_hefh", label: "HeFH without ASCVD (Very High Risk)", description: "LDL target <50 mg/dL", category: "Familial Hypercholesterolemia" },
  { id: "fh_hefh_ascvd", label: "HeFH with ASCVD (Extreme Risk A)", description: "Optional target ≤30 mg/dL", category: "Familial Hypercholesterolemia" },
  { id: "fh_hofh", label: "HoFH without ASCVD (Extreme Risk A)", description: "LDL <50 mg/dL, optional ≤30 mg/dL", category: "Familial Hypercholesterolemia" },
  { id: "fh_hofh_ascvd", label: "HoFH with ASCVD (Extreme Risk B)", description: "LDL target ≤30 mg/dL mandatory", category: "Familial Hypercholesterolemia" },
];

// Extreme Risk C
const extremeCFactors: RiskFactor[] = [
  { id: "ext_c_recurrent", label: "Recurrent ASCVD despite optimal holistic management", description: "LDL target 10-15 mg/dL", category: "Extreme Risk C" },
];

// Factor labels for PDF report
const allFactorLabels: Record<string, string> = {};
[...highRiskFeatures, ...riskModifiers, ...diabetesFactors, ...ascvdFactors, ...subclinicalFactors, ...cacFactors, ...fhFactors, ...extremeCFactors].forEach(f => {
  allFactorLabels[f.id] = f.label;
});

const LAILipidRiskClassification: React.FC = () => {
  const [selectedFactors, setSelectedFactors] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["key-concepts"]));
  
  // Lipid panel values for automatic calculation
  const [lipidValues, setLipidValues] = useState({
    totalCholesterol: "" as string,
    ldl: "" as string,
    hdl: "" as string,
    triglycerides: "" as string,
    apoB: "" as string
  });

  // Calculate non-HDL-C automatically
  const calculatedNonHdl = useMemo(() => {
    const tc = parseFloat(lipidValues.totalCholesterol);
    const hdl = parseFloat(lipidValues.hdl);
    if (!isNaN(tc) && !isNaN(hdl) && tc > hdl) {
      return tc - hdl;
    }
    return null;
  }, [lipidValues.totalCholesterol, lipidValues.hdl]);

  const updateLipidValue = (field: keyof typeof lipidValues, value: string) => {
    setLipidValues(prev => ({ ...prev, [field]: value }));
  };

  const toggleFactor = (id: string) => {
    setSelectedFactors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Determine risk category based on selected factors
  const determinedRiskCategory = useMemo(() => {
    // Extreme Risk C - highest priority
    if (selectedFactors.has("ext_c_recurrent")) {
      return riskCategories.extremeC;
    }

    // Extreme Risk B
    if (
      selectedFactors.has("ascvd_recurrent_acs") ||
      selectedFactors.has("ascvd_polyvascular") ||
      selectedFactors.has("fh_hofh_ascvd")
    ) {
      return riskCategories.extremeB;
    }

    // Extreme Risk A
    if (
      selectedFactors.has("dm_ascvd") ||
      selectedFactors.has("dm_ascvd_tod") ||
      selectedFactors.has("cac_above300") ||
      selectedFactors.has("fh_hefh_ascvd") ||
      selectedFactors.has("fh_hofh")
    ) {
      return riskCategories.extremeA;
    }

    // Very High Risk
    if (
      selectedFactors.has("ascvd_present") ||
      selectedFactors.has("dm_tod") ||
      selectedFactors.has("dm_2_major_rf") ||
      selectedFactors.has("sub_carotid_plaque") ||
      selectedFactors.has("sub_femoral_plaque") ||
      selectedFactors.has("sub_coronary_plaque") ||
      selectedFactors.has("sub_abi") ||
      selectedFactors.has("cac_above75") ||
      selectedFactors.has("cac_100_299") ||
      selectedFactors.has("fh_hefh")
    ) {
      return riskCategories.veryHigh;
    }

    // High Risk
    const hasHighRiskFeature = highRiskFeatures.some((f) => selectedFactors.has(f.id));
    const hasDiabetes = selectedFactors.has("dm_present");
    const hasCacLow = selectedFactors.has("cac_1_99_below75");

    if (hasHighRiskFeature || hasDiabetes || hasCacLow) {
      return riskCategories.high;
    }

    // Risk modifiers can elevate from low/moderate to higher risk
    const riskModifierCount = riskModifiers.filter((f) => selectedFactors.has(f.id)).length;

    if (riskModifierCount >= 3) {
      return riskCategories.high;
    }

    if (riskModifierCount >= 1) {
      return riskCategories.moderate;
    }

    return riskCategories.low;
  }, [selectedFactors]);

  const renderFactorSection = (
    title: string,
    factors: RiskFactor[],
    sectionKey: string,
    icon: React.ReactNode
  ) => (
    <Collapsible open={expandedSections.has(sectionKey)} onOpenChange={() => toggleSection(sectionKey)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
          <Badge variant="outline" className="ml-2">
            {factors.filter((f) => selectedFactors.has(f.id)).length}/{factors.length}
          </Badge>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            expandedSections.has(sectionKey) && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2 pl-2">
        {factors.map((factor) => (
          <div
            key={factor.id}
            className={cn(
              "flex items-start gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-muted/30",
              selectedFactors.has(factor.id) && "bg-primary/10"
            )}
            onClick={() => toggleFactor(factor.id)}
          >
            <Checkbox
              id={factor.id}
              checked={selectedFactors.has(factor.id)}
              onCheckedChange={() => toggleFactor(factor.id)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor={factor.id}
                className="text-sm font-medium cursor-pointer leading-tight"
              >
                {factor.label}
              </label>
              {factor.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
              )}
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-orange-600" />
          LAI 2024 Lipid Risk Classification (Indian Guidelines)
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Lipid Association of India Consensus Statement IV - CV Risk Assessment & LDL-C Targets
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Key Concepts Section */}
        <Collapsible open={expandedSections.has("key-concepts")} onOpenChange={() => toggleSection("key-concepts")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">Key Concepts: Why Indian-Specific Guidelines?</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                expandedSections.has("key-concepts") && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg text-sm space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p><strong>Lower baseline LDL-C, higher ASCVD burden:</strong> Indians have ~10 mg/dL lower LDL-C than Western populations but higher incidence, prevalence, and severity of ASCVD with higher mortality.</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p><strong>Higher discordance:</strong> Indian subjects have higher non-HDL-C and ApoB levels with significant discordance between LDL-C and non-HDL-C.</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p><strong>Earlier onset:</strong> ASCVD manifests at a younger age in Indians; age-based risk tools are not directly applicable.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p><strong>Subclinical atherosclerosis:</strong> Presence of ANY subclinical atherosclerosis triggers intensive LDL-C lowering regardless of other risk factors.</p>
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p><strong>Treatment targets:</strong> LDL-C is primary target, non-HDL-C is co-primary, ApoB is secondary. Screen Lp(a) at age 18 or earlier.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Lipid Panel Calculator */}
        <Collapsible open={expandedSections.has("lipid-calc")} onOpenChange={() => toggleSection("lipid-calc")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Lipid Panel Calculator (Non-HDL-C & ApoB)</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                expandedSections.has("lipid-calc") && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">Total Cholesterol</Label>
                <input
                  type="number"
                  value={lipidValues.totalCholesterol}
                  onChange={(e) => updateLipidValue("totalCholesterol", e.target.value)}
                  placeholder="mg/dL"
                  className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input"
                />
              </div>
              <div>
                <Label className="text-xs">LDL-C</Label>
                <input
                  type="number"
                  value={lipidValues.ldl}
                  onChange={(e) => updateLipidValue("ldl", e.target.value)}
                  placeholder="mg/dL"
                  className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input"
                />
              </div>
              <div>
                <Label className="text-xs">HDL-C</Label>
                <input
                  type="number"
                  value={lipidValues.hdl}
                  onChange={(e) => updateLipidValue("hdl", e.target.value)}
                  placeholder="mg/dL"
                  className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input"
                />
              </div>
              <div>
                <Label className="text-xs">Triglycerides</Label>
                <input
                  type="number"
                  value={lipidValues.triglycerides}
                  onChange={(e) => updateLipidValue("triglycerides", e.target.value)}
                  placeholder="mg/dL"
                  className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input"
                />
              </div>
              <div>
                <Label className="text-xs">ApoB</Label>
                <input
                  type="number"
                  value={lipidValues.apoB}
                  onChange={(e) => updateLipidValue("apoB", e.target.value)}
                  placeholder="mg/dL"
                  className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md bg-background border-input"
                />
              </div>
            </div>
            
            {/* Calculated Non-HDL-C */}
            {calculatedNonHdl !== null && (
              <div className="mt-3 p-2 bg-primary/10 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Calculated Non-HDL-C:</span>{" "}
                  <span className="text-lg font-bold text-primary">{calculatedNonHdl} mg/dL</span>
                  <span className="text-xs text-muted-foreground ml-2">(TC - HDL)</span>
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Current Risk Assessment Result */}
        <div
          className={cn(
            "p-4 rounded-lg border-2",
            determinedRiskCategory.bgColor,
            determinedRiskCategory.borderColor
          )}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Risk Category</p>
              <p className={cn("text-xl font-bold", determinedRiskCategory.color)}>
                {determinedRiskCategory.name}
              </p>
            </div>
            
            {/* All Targets Display */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">LDL-C Target</p>
                <p className={cn("text-lg font-bold", determinedRiskCategory.color)}>
                  {determinedRiskCategory.ldlTarget}
                </p>
                <Badge variant="outline" className="text-[10px] mt-1">Primary</Badge>
                {determinedRiskCategory.optionalTarget && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {determinedRiskCategory.optionalTarget}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Non-HDL-C</p>
                <p className={cn("text-lg font-bold", determinedRiskCategory.color)}>
                  {determinedRiskCategory.nonHdlTarget}
                </p>
                <Badge variant="secondary" className="text-[10px] mt-1">Co-Primary</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">ApoB</p>
                <p className={cn("text-lg font-bold", determinedRiskCategory.color)}>
                  {determinedRiskCategory.apoBTarget}
                </p>
                <Badge variant="outline" className="text-[10px] mt-1">Secondary</Badge>
              </div>
            </div>
          </div>

          {/* Target Status Check */}
          {(lipidValues.ldl || calculatedNonHdl || lipidValues.apoB) && (
            <div className="mt-4 pt-3 border-t border-current/10 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {lipidValues.ldl && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">LDL-C:</span>
                  <span className="font-medium">{lipidValues.ldl} mg/dL</span>
                  {parseFloat(lipidValues.ldl) <= parseInt(determinedRiskCategory.ldlTarget.replace(/[<≤]/g, "")) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
              {calculatedNonHdl !== null && determinedRiskCategory.nonHdlTarget && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Non-HDL:</span>
                  <span className="font-medium">{calculatedNonHdl} mg/dL</span>
                  {calculatedNonHdl <= parseInt(determinedRiskCategory.nonHdlTarget.replace(/[<≤]/g, "")) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
              {lipidValues.apoB && determinedRiskCategory.apoBTarget && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">ApoB:</span>
                  <span className="font-medium">{lipidValues.apoB} mg/dL</span>
                  {parseFloat(lipidValues.apoB) <= parseInt(determinedRiskCategory.apoBTarget.replace(/[<≤]/g, "")) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          )}

          {selectedFactors.size > 0 && (
            <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Selected factors: {selectedFactors.size} | Achieve targets by Week 12
              </p>
              <LipidRiskPDFReport
                riskCategory={determinedRiskCategory}
                selectedFactors={Array.from(selectedFactors)}
                factorLabels={allFactorLabels}
                lipidValues={{
                  totalCholesterol: lipidValues.totalCholesterol ? parseFloat(lipidValues.totalCholesterol) : undefined,
                  ldl: lipidValues.ldl ? parseFloat(lipidValues.ldl) : undefined,
                  hdl: lipidValues.hdl ? parseFloat(lipidValues.hdl) : undefined,
                  triglycerides: lipidValues.triglycerides ? parseFloat(lipidValues.triglycerides) : undefined,
                  nonHdl: calculatedNonHdl ?? undefined,
                  apoB: lipidValues.apoB ? parseFloat(lipidValues.apoB) : undefined
                }}
              />
            </div>
          )}
        </div>

        {/* Risk Factor Categories */}
        <div className="space-y-3">
          {renderFactorSection(
            "High Risk Features (Target: <70 mg/dL)",
            highRiskFeatures,
            "high-risk",
            <Target className="h-4 w-4 text-orange-500" />
          )}

          {renderFactorSection(
            "Risk Modifiers (May Elevate Risk Category)",
            riskModifiers,
            "modifiers",
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}

          {renderFactorSection(
            "Diabetes Mellitus",
            diabetesFactors,
            "diabetes",
            <Heart className="h-4 w-4 text-red-500" />
          )}

          {renderFactorSection(
            "Established ASCVD",
            ascvdFactors,
            "ascvd",
            <Heart className="h-4 w-4 text-red-600" />
          )}

          {renderFactorSection(
            "Subclinical Atherosclerosis (Equivalent to ASCVD)",
            subclinicalFactors,
            "subclinical",
            <Heart className="h-4 w-4 text-purple-500" />
          )}

          {renderFactorSection(
            "CAC Score Categories",
            cacFactors,
            "cac",
            <Heart className="h-4 w-4 text-blue-500" />
          )}

          {renderFactorSection(
            "Familial Hypercholesterolemia",
            fhFactors,
            "fh",
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}

          {renderFactorSection(
            "Extreme Risk Group C",
            extremeCFactors,
            "extreme-c",
            <AlertTriangle className="h-4 w-4 text-pink-500" />
          )}
        </div>

        {/* ACS Management Note */}
        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-red-700 dark:text-red-400">ACS Management:</p>
              <ul className="text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                <li>Lipid profile at emergency triage, repeat within 2 weeks</li>
                <li>Start high-intensity statin + ezetimibe at presentation</li>
                <li>Intensify every 2 weeks until LDL-C goal achieved (target: Week 4)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Reference Table */}
        <Collapsible open={expandedSections.has("quick-ref")} onOpenChange={() => toggleSection("quick-ref")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Quick Reference: LDL-C Targets by Risk</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                expandedSections.has("quick-ref") && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 border">Risk Category</th>
                  <th className="text-left p-2 border">LDL-C Target</th>
                  <th className="text-left p-2 border">Key Conditions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-medium text-green-700 dark:text-green-400">Low/Moderate</td>
                  <td className="p-2 border">&lt;100 mg/dL</td>
                  <td className="p-2 border text-muted-foreground">No significant risk factors</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium text-orange-700 dark:text-orange-400">High Risk</td>
                  <td className="p-2 border">&lt;70 mg/dL</td>
                  <td className="p-2 border text-muted-foreground">DM, family Hx, CKD 3B/4, Lp(a) ≥50</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium text-red-600 dark:text-red-400">Very High Risk</td>
                  <td className="p-2 border">&lt;50 mg/dL</td>
                  <td className="p-2 border text-muted-foreground">ASCVD, subclinical plaque, HeFH, DM+TOD</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium text-red-700 dark:text-red-300">Extreme A</td>
                  <td className="p-2 border">&lt;50 (opt ≤30)</td>
                  <td className="p-2 border text-muted-foreground">DM+ASCVD, CAC&gt;300, HeFH+ASCVD</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium text-purple-700 dark:text-purple-300">Extreme B</td>
                  <td className="p-2 border">≤30 mg/dL</td>
                  <td className="p-2 border text-muted-foreground">Recurrent ACS, polyvascular, HoFH+ASCVD</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium text-pink-700 dark:text-pink-300">Extreme C</td>
                  <td className="p-2 border">10-15 mg/dL</td>
                  <td className="p-2 border text-muted-foreground">Recurrent ASCVD despite optimal Rx</td>
                </tr>
              </tbody>
            </table>
          </CollapsibleContent>
        </Collapsible>

        {/* Citation */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Based on: LAI 2023 Update on CV Risk Assessment and Lipid Management in Indian Patients: Consensus Statement IV
        </p>
      </CardContent>
    </Card>
  );
};

export default LAILipidRiskClassification;
