import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ChevronDown, Heart, Target, Info, CheckCircle2, Calculator, Brain, FileText, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

// Stroke-Specific Risk Factors (NEW for LAI 2026)
const strokeRiskFactors: RiskFactor[] = [
  { id: "sk_ischemic_stroke", label: "History of ischemic stroke", description: "Established ASCVD equivalent → Very High Risk", category: "Stroke Risk" },
  { id: "sk_tia", label: "History of TIA", description: "Cerebrovascular ASCVD equivalent", category: "Stroke Risk" },
  { id: "sk_lvo", label: "Large vessel occlusion (LVO) stroke", description: "High-risk cerebrovascular phenotype", category: "Stroke Risk" },
  { id: "sk_recurrent_stroke", label: "Recurrent stroke despite optimal therapy", description: "Extreme Risk B/C consideration", category: "Stroke Risk" },
  { id: "sk_carotid_stenosis", label: "Carotid stenosis ≥50%", description: "Subclinical/clinical atherosclerosis", category: "Stroke Risk" },
  { id: "sk_intracranial_stenosis", label: "Intracranial atherosclerotic stenosis", description: "Very High Risk — aggressive lipid lowering", category: "Stroke Risk" },
  { id: "sk_af_stroke", label: "Stroke with concurrent atrial fibrillation", description: "Cardioembolic + atherosclerotic overlap", category: "Stroke Risk" },
  { id: "sk_young_stroke", label: "Cryptogenic/young-onset stroke (<45 years)", description: "Screen Lp(a), ApoB, FH", category: "Stroke Risk" },
  { id: "sk_stroke_dm", label: "Stroke + diabetes mellitus", description: "Extreme Risk A consideration", category: "Stroke Risk" },
  { id: "sk_stroke_pad", label: "Stroke + peripheral artery disease (polyvascular)", description: "Extreme Risk B — polyvascular disease", category: "Stroke Risk" },
  { id: "sk_lacunar", label: "Lacunar/small vessel disease stroke", description: "Aggressive BP + lipid targets", category: "Stroke Risk" },
  { id: "sk_carotid_imt", label: "Increased carotid IMT (>75th percentile)", description: "Subclinical atherosclerosis marker", category: "Stroke Risk" },
];

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
  { id: "rm_air_pollution", label: "Air pollution exposure", category: "Risk Modifiers" },
  { id: "rm_premature_menopause", label: "Premature menopause", category: "Risk Modifiers" },
  { id: "rm_preeclampsia", label: "History of preeclampsia", category: "Risk Modifiers" },
  { id: "rm_gdm", label: "Gestational diabetes", category: "Risk Modifiers" },
  { id: "rm_pcos", label: "Polycystic ovary syndrome", category: "Risk Modifiers" },
  { id: "rm_prs", label: "High polygenic risk score", category: "Risk Modifiers" },
  { id: "rm_hiv", label: "HIV infection", category: "Risk Modifiers" },
];

// Known Risk Enhancers (ESC/EAS 2025 + AHA/ACC 2018)
const riskEnhancers: RiskFactor[] = [
  { id: "re_fh_premature_cvd", label: "Family history of premature CVD (men <55y; women <60y)", description: "ESC/EAS 2025 + AHA/ACC 2018 risk enhancer", category: "Known Risk Enhancers" },
  { id: "re_south_asian", label: "High-risk ethnicity (e.g., South Asian ancestry)", description: "ESC/EAS 2025 + AHA/ACC — independent ASCVD risk enhancer", category: "Known Risk Enhancers" },
  { id: "re_primary_hyperchol", label: "Primary hypercholesterolemia (LDL-C 160–189 mg/dL; non-HDL-C 190–219 mg/dL)", description: "AHA/ACC 2018 — borderline high LDL without other risk factors", category: "Known Risk Enhancers" },
  { id: "re_hypertriglyceridemia", label: "Persistently elevated primary hypertriglyceridemia (≥175 mg/dL)", description: "AHA/ACC 2018 risk enhancer", category: "Known Risk Enhancers" },
  { id: "re_elevated_lpa", label: "Elevated Lp(a) ≥50 mg/dL or ≥125 nmol/L", description: "ESC/EAS 2025 (>50 mg/dL / >105 nmol/L) + AHA/ACC 2018", category: "Known Risk Enhancers" },
  { id: "re_elevated_apob", label: "Elevated ApoB ≥130 mg/dL", description: "AHA/ACC 2018 risk enhancer — better predictor than LDL-C alone", category: "Known Risk Enhancers" },
  { id: "re_elevated_hscrp", label: "Persistently elevated hs-CRP ≥2.0 mg/L", description: "ESC/EAS 2025 + AHA/ACC 2018 — residual inflammatory risk marker", category: "Known Risk Enhancers" },
  { id: "re_abi_low", label: "ABI <0.9", description: "AHA/ACC 2018 — marker of peripheral atherosclerosis", category: "Known Risk Enhancers" },
  { id: "re_ckd_moderate", label: "Chronic kidney disease (eGFR 15–59 mL/min/1.73m² ± albuminuria)", description: "AHA/ACC 2018 risk enhancer", category: "Known Risk Enhancers" },
  { id: "re_metabolic_syndrome", label: "Metabolic syndrome", description: "AHA/ACC 2018 risk enhancer — cluster of cardiometabolic risk", category: "Known Risk Enhancers" },
  { id: "re_obesity", label: "Obesity (BMI >30)", description: "ESC/EAS 2025 risk enhancer", category: "Known Risk Enhancers" },
  { id: "re_physical_inactivity", label: "Physical inactivity / sedentary lifestyle", description: "ESC/EAS 2025 risk enhancer", category: "Known Risk Enhancers" },
  { id: "re_stress_psychosocial", label: "Stress symptoms & psychosocial stressors", description: "ESC/EAS 2025 risk enhancer — including depression, anxiety", category: "Known Risk Enhancers" },
  { id: "re_social_deprivation", label: "Social deprivation", description: "ESC/EAS 2025 risk enhancer — socioeconomic determinant of CV risk", category: "Known Risk Enhancers" },
  { id: "re_major_psych", label: "Major psychiatric disorders", description: "ESC/EAS 2025 risk enhancer — schizophrenia, bipolar, major depression", category: "Known Risk Enhancers" },
  { id: "re_premature_menopause", label: "History of premature menopause (before age 40)", description: "ESC/EAS 2025 + AHA/ACC 2018 risk enhancer", category: "Known Risk Enhancers" },
  { id: "re_pregnancy_complications", label: "Preeclampsia or hypertensive disorders of pregnancy", description: "ESC/EAS 2025 + AHA/ACC 2018 — increases later ASCVD risk", category: "Known Risk Enhancers" },
  { id: "re_hiv", label: "HIV infection / HIV/AIDS", description: "ESC/EAS 2025 + AHA/ACC 2018 — accelerated atherosclerosis", category: "Known Risk Enhancers" },
  { id: "re_osa", label: "Obstructive sleep apnea syndrome", description: "ESC/EAS 2025 risk enhancer — intermittent hypoxia accelerates atherosclerosis", category: "Known Risk Enhancers" },
  { id: "re_chronic_inflammatory", label: "Chronic immune-mediated / inflammatory disorder", description: "ESC/EAS 2025 + AHA/ACC 2018 — psoriasis, RA, HIV/AIDS", category: "Known Risk Enhancers" },
];

// hsCRP-Based Risk Assessment
const hsCRPFactors: RiskFactor[] = [
  { id: "hscrp_low", label: "hs-CRP <1 mg/L (Low cardiovascular risk)", description: "Low inflammatory burden — standard lipid targets apply", category: "hs-CRP" },
  { id: "hscrp_moderate", label: "hs-CRP 1-2 mg/L (Moderate risk)", description: "Borderline inflammation — consider risk modifier upshift", category: "hs-CRP" },
  { id: "hscrp_high", label: "hs-CRP 2-5 mg/L (High risk)", description: "Residual inflammatory risk — intensify therapy, consider colchicine/icosapent ethyl", category: "hs-CRP" },
  { id: "hscrp_very_high", label: "hs-CRP 5-10 mg/L (Very high risk)", description: "Significant inflammatory burden — aggressive LDL target + anti-inflammatory Rx", category: "hs-CRP" },
  { id: "hscrp_extreme", label: "hs-CRP >10 mg/L (Extreme — rule out acute cause)", description: "Rule out infection/acute illness. If chronic: Extreme Risk consideration", category: "hs-CRP" },
];

// Chronic Inflammatory Conditions
const inflammatoryConditions: RiskFactor[] = [
  { id: "inf_ra", label: "Rheumatoid Arthritis (RA)", description: "2-3× ASCVD risk; accelerated atherosclerosis; treat as risk modifier", category: "Chronic Inflammatory Conditions" },
  { id: "inf_sle", label: "Systemic Lupus Erythematosus (SLE)", description: "5-10× MI risk in young women; antiphospholipid overlap", category: "Chronic Inflammatory Conditions" },
  { id: "inf_psoriasis", label: "Psoriasis", description: "1.5-2× CVD risk; severity-dependent; biologics may reduce risk", category: "Chronic Inflammatory Conditions" },
  { id: "inf_psa", label: "Psoriatic Arthritis (PsA)", description: "Joint + skin inflammation; additive CV risk", category: "Chronic Inflammatory Conditions" },
  { id: "inf_as", label: "Ankylosing Spondylitis (AS)", description: "Aortic inflammation + accelerated atherosclerosis", category: "Chronic Inflammatory Conditions" },
  { id: "inf_vasculitis", label: "Systemic Vasculitis (GPA, EGPA, PAN)", description: "Vessel wall inflammation; high ASCVD risk", category: "Chronic Inflammatory Conditions" },
  { id: "inf_ibd", label: "Inflammatory Bowel Disease (Crohn's / UC)", description: "Chronic systemic inflammation; increased thrombotic risk", category: "Chronic Inflammatory Conditions" },
  { id: "inf_sarcoidosis", label: "Sarcoidosis", description: "Granulomatous inflammation; cardiac involvement possible", category: "Chronic Inflammatory Conditions" },
  { id: "inf_sjogren", label: "Sjögren's Syndrome", description: "Chronic inflammation + accelerated atherosclerosis", category: "Chronic Inflammatory Conditions" },
  { id: "inf_dermatomyositis", label: "Dermatomyositis / Polymyositis", description: "Inflammatory myopathy; statin caution but CV risk elevated", category: "Chronic Inflammatory Conditions" },
  { id: "inf_scleroderma", label: "Systemic Sclerosis (Scleroderma)", description: "Microvascular + macrovascular disease", category: "Chronic Inflammatory Conditions" },
  { id: "inf_behcet", label: "Behçet's Disease", description: "Vascular inflammation; arterial & venous thrombosis risk", category: "Chronic Inflammatory Conditions" },
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
[...strokeRiskFactors, ...highRiskFeatures, ...riskModifiers, ...riskEnhancers, ...hsCRPFactors, ...inflammatoryConditions, ...diabetesFactors, ...ascvdFactors, ...subclinicalFactors, ...cacFactors, ...fhFactors, ...extremeCFactors].forEach(f => {
  allFactorLabels[f.id] = f.label;
});

interface LAILipidRiskClassificationProps {
  strokeHistoryFactors?: Record<string, boolean>;
}

const LAILipidRiskClassification: React.FC<LAILipidRiskClassificationProps> = ({ strokeHistoryFactors }) => {
  const [selectedFactors, setSelectedFactors] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["key-concepts"]));
  const [cacScoreInput, setCacScoreInput] = useState<string>("");
  
  // Lipid panel values for automatic calculation
  const [lipidValues, setLipidValues] = useState({
    totalCholesterol: "" as string,
    ldl: "" as string,
    hdl: "" as string,
    triglycerides: "" as string,
    apoB: "" as string
  });

  // Auto-select CAC tier based on numeric input
  const cacAutoTier = useMemo(() => {
    const score = parseFloat(cacScoreInput);
    if (isNaN(score) || score < 0) return null;
    if (score === 0) return { tier: "cac_0", label: "CAC = 0 (Low Risk)", color: "text-green-700 dark:text-green-400" };
    if (score < 100) return { tier: "cac_1_99_below75", label: "CAC 1–99 (High Risk)", color: "text-orange-700 dark:text-orange-400" };
    if (score < 300) return { tier: "cac_100_299", label: "CAC 100–299 (Very High Risk)", color: "text-red-600 dark:text-red-400" };
    return { tier: "cac_above300", label: "CAC ≥300 (Extreme Risk A)", color: "text-red-700 dark:text-red-300" };
  }, [cacScoreInput]);

  // Apply CAC auto-selection to factors
  const applyCacScore = useCallback(() => {
    if (!cacAutoTier) return;
    setSelectedFactors(prev => {
      const newSet = new Set(prev);
      // Remove all CAC-related factors first
      ["cac_1_99_below75", "cac_above75", "cac_100_299", "cac_above300"].forEach(id => newSet.delete(id));
      // Add the correct tier (skip cac_0 as it's not a risk factor)
      if (cacAutoTier.tier !== "cac_0") {
        newSet.add(cacAutoTier.tier);
      }
      return newSet;
    });
    toast.success(`CAC tier auto-selected: ${cacAutoTier.label}`);
  }, [cacAutoTier]);

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

  // Mapping from stroke history template IDs to LAI lipid risk factor IDs
  const historyToLipidMap: Record<string, string[]> = {
    previous_stroke: ["sk_ischemic_stroke"],
    carotid_stenosis: ["sk_carotid_stenosis"],
    afib: ["sk_af_stroke"],
    diabetes: ["dm_present", "sk_stroke_dm"],
    ihd: ["ascvd_present"],
    hyperlipidemia: [],
    early_menopause: ["rm_premature_menopause"],
    gestational_dm: ["rm_gdm"],
    autoimmune: ["rm_inflammatory_joint"],
    family_stroke: ["hr_family_history"],
    sickle_cell: [],
    hypercoagulable: [],
  };

  const [syncedFromHistory, setSyncedFromHistory] = useState(false);

  const syncFromStrokeHistory = useCallback(() => {
    if (!strokeHistoryFactors) return;
    setSelectedFactors(prev => {
      const newSet = new Set(prev);
      Object.entries(strokeHistoryFactors).forEach(([historyId, checked]) => {
        if (checked && historyToLipidMap[historyId]) {
          historyToLipidMap[historyId].forEach(lipidId => newSet.add(lipidId));
        }
      });
      return newSet;
    });
    setSyncedFromHistory(true);
    toast.success("Stroke history synced to lipid risk factors");
  }, [strokeHistoryFactors]);

  // Count available sync items
  const syncableCount = useMemo(() => {
    if (!strokeHistoryFactors) return 0;
    return Object.entries(strokeHistoryFactors).filter(
      ([id, checked]) => checked && historyToLipidMap[id]?.length > 0
    ).length;
  }, [strokeHistoryFactors]);

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
    if (selectedFactors.has("ext_c_recurrent") || selectedFactors.has("sk_recurrent_stroke")) {
      return riskCategories.extremeC;
    }

    // Extreme Risk B
    if (
      selectedFactors.has("ascvd_recurrent_acs") ||
      selectedFactors.has("ascvd_polyvascular") ||
      selectedFactors.has("fh_hofh_ascvd") ||
      selectedFactors.has("sk_stroke_pad")
    ) {
      return riskCategories.extremeB;
    }

    // Extreme Risk A
    if (
      selectedFactors.has("dm_ascvd") ||
      selectedFactors.has("dm_ascvd_tod") ||
      selectedFactors.has("cac_above300") ||
      selectedFactors.has("fh_hefh_ascvd") ||
      selectedFactors.has("fh_hofh") ||
      selectedFactors.has("sk_stroke_dm")
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
      selectedFactors.has("fh_hefh") ||
      selectedFactors.has("sk_ischemic_stroke") ||
      selectedFactors.has("sk_tia") ||
      selectedFactors.has("sk_lvo") ||
      selectedFactors.has("sk_intracranial_stenosis") ||
      selectedFactors.has("sk_carotid_stenosis")
    ) {
      return riskCategories.veryHigh;
    }

    // High Risk
    const hasHighRiskFeature = highRiskFeatures.some((f) => selectedFactors.has(f.id));
    const hasDiabetes = selectedFactors.has("dm_present");
    const hasCacLow = selectedFactors.has("cac_1_99_below75");
    const hasStrokeModifier = selectedFactors.has("sk_af_stroke") || 
      selectedFactors.has("sk_young_stroke") || 
      selectedFactors.has("sk_lacunar") || 
      selectedFactors.has("sk_carotid_imt");

    if (hasHighRiskFeature || hasDiabetes || hasCacLow || hasStrokeModifier) {
      return riskCategories.high;
    }

    // hsCRP and inflammatory conditions as risk modifiers
    const hasHighCRP = selectedFactors.has("hscrp_very_high") || selectedFactors.has("hscrp_extreme");
    const hasModCRP = selectedFactors.has("hscrp_high");
    const inflammatoryCount = inflammatoryConditions.filter(f => selectedFactors.has(f.id)).length;

    // ≥2 inflammatory conditions OR high CRP + any inflammatory condition → High Risk
    if (hasHighCRP || inflammatoryCount >= 2 || (hasModCRP && inflammatoryCount >= 1)) {
      return riskCategories.high;
    }

    // Risk modifiers + risk enhancers can elevate from low/moderate to higher risk
    const riskModifierCount = riskModifiers.filter((f) => selectedFactors.has(f.id)).length;
    const riskEnhancerCount = riskEnhancers.filter((f) => selectedFactors.has(f.id)).length;
    const totalModifiers = riskModifierCount + riskEnhancerCount + inflammatoryCount + (hasModCRP ? 1 : 0) + (selectedFactors.has("hscrp_moderate") ? 1 : 0);

    if (totalModifiers >= 3) {
      return riskCategories.high;
    }

    if (totalModifiers >= 1) {
      return riskCategories.moderate;
    }

    return riskCategories.low;
  }, [selectedFactors]);

  // Generate comprehensive risk profile summary
  const generateRiskProfile = useMemo(() => {
    const selectedStrokeFactors = strokeRiskFactors.filter(f => selectedFactors.has(f.id));
    const selectedLipidFactors = [...highRiskFeatures, ...riskModifiers, ...riskEnhancers, ...hsCRPFactors, ...inflammatoryConditions, ...diabetesFactors, ...ascvdFactors, ...subclinicalFactors, ...cacFactors, ...fhFactors, ...extremeCFactors].filter(f => selectedFactors.has(f.id));
    
    if (selectedStrokeFactors.length === 0 && selectedLipidFactors.length === 0) return null;

    const cat = determinedRiskCategory;
    let therapyRec = "";
    if (cat === riskCategories.low || cat === riskCategories.moderate) {
      therapyRec = "Lifestyle modification ± moderate-intensity statin. Reassess in 6-12 weeks.";
    } else if (cat === riskCategories.high) {
      therapyRec = "High-intensity statin (Atorvastatin 40-80mg or Rosuvastatin 20-40mg). Add Ezetimibe if target not achieved by Week 6.";
    } else if (cat === riskCategories.veryHigh) {
      therapyRec = "High-intensity statin + Ezetimibe from Day 1. Consider PCSK9 inhibitor if target not met by Week 8. Achieve LDL-C target by Week 12.";
    } else if (cat === riskCategories.extremeA) {
      therapyRec = "High-intensity statin + Ezetimibe ± PCSK9 inhibitor. Achieve LDL-C <50 mg/dL (optional ≤30 mg/dL). Intensify every 2 weeks.";
    } else if (cat === riskCategories.extremeB) {
      therapyRec = "Maximum statin + Ezetimibe + PCSK9 inhibitor mandatory. Target LDL-C ≤30 mg/dL. Consider Inclisiran if PCSK9i intolerant.";
    } else if (cat === riskCategories.extremeC) {
      therapyRec = "Quadruple therapy: Max statin + Ezetimibe + PCSK9i + Bempedoic acid. Target LDL-C 10-15 mg/dL. Consider Lipoprotein apheresis.";
    }

    let strokeSpecific = "";
    if (selectedStrokeFactors.length > 0) {
      strokeSpecific = "\n\nSTROKE-SPECIFIC CONSIDERATIONS:\n";
      if (selectedFactors.has("sk_ischemic_stroke") || selectedFactors.has("sk_tia") || selectedFactors.has("sk_lvo")) {
        strokeSpecific += "• Cerebrovascular ASCVD equivalent — initiate intensive lipid therapy immediately\n";
        strokeSpecific += "• Target LDL-C <50 mg/dL for secondary stroke prevention\n";
      }
      if (selectedFactors.has("sk_intracranial_stenosis")) {
        strokeSpecific += "• Intracranial atherosclerosis: Target LDL-C <70 mg/dL per SAMMPRIS; LAI recommends <50 mg/dL\n";
      }
      if (selectedFactors.has("sk_carotid_stenosis")) {
        strokeSpecific += "• Carotid stenosis ≥50%: Intensive lipid lowering may stabilize/regress plaque\n";
      }
      if (selectedFactors.has("sk_young_stroke")) {
        strokeSpecific += "• Young-onset stroke: Screen Lp(a) at age 18, ApoB, lipid panel, consider FH screening\n";
      }
      if (selectedFactors.has("sk_lacunar")) {
        strokeSpecific += "• Small vessel disease: Dual target — aggressive BP (<130/80) + LDL-C lowering\n";
      }
      if (selectedFactors.has("sk_stroke_pad")) {
        strokeSpecific += "• Polyvascular disease (stroke + PAD): Extreme Risk B — mandatory LDL-C ≤30 mg/dL\n";
      }
      if (selectedFactors.has("sk_recurrent_stroke")) {
        strokeSpecific += "• Recurrent stroke despite therapy: Extreme Risk C — consider LDL-C 10-15 mg/dL target\n";
      }
    }

    // Inflammatory / hsCRP considerations
    const selectedInflammatory = inflammatoryConditions.filter(f => selectedFactors.has(f.id));
    const selectedCRP = hsCRPFactors.filter(f => selectedFactors.has(f.id));
    let inflammatorySpecific = "";
    if (selectedInflammatory.length > 0 || selectedCRP.length > 0) {
      inflammatorySpecific = "\n\nINFLAMMATORY RISK CONSIDERATIONS:\n";
      if (selectedCRP.length > 0) {
        const crpLevel = selectedCRP[selectedCRP.length - 1]; // highest selected
        inflammatorySpecific += `• ${crpLevel.label}\n`;
        if (selectedFactors.has("hscrp_high") || selectedFactors.has("hscrp_very_high")) {
          inflammatorySpecific += "• Residual inflammatory risk — consider low-dose colchicine (0.5mg/day) or icosapent ethyl if TG elevated\n";
          inflammatorySpecific += "• CANTOS/COLCOT/LoDoCo2 evidence supports anti-inflammatory therapy for residual CV risk\n";
        }
        if (selectedFactors.has("hscrp_extreme")) {
          inflammatorySpecific += "• hs-CRP >10: Rule out acute infection/illness before attributing to chronic inflammation\n";
        }
      }
      if (selectedInflammatory.length > 0) {
        inflammatorySpecific += `• Chronic inflammatory conditions (${selectedInflammatory.length}): `;
        inflammatorySpecific += selectedInflammatory.map(f => f.label.split(" (")[0]).join(", ") + "\n";
        inflammatorySpecific += "• Autoimmune conditions accelerate atherosclerosis — treat as CV risk enhancer\n";
        inflammatorySpecific += "• Monitor for statin myopathy in inflammatory myopathies; consider ezetimibe-first if concern\n";
      }
    }

    return {
      summary: `RISK CATEGORY: ${cat.name}\nLDL-C Target: ${cat.ldlTarget}${cat.optionalTarget ? ` (${cat.optionalTarget})` : ""}\nNon-HDL-C Target: ${cat.nonHdlTarget}\nApoB Target: ${cat.apoBTarget}\n\nTHERAPY RECOMMENDATION:\n${therapyRec}${strokeSpecific}${inflammatorySpecific}\n\nSELECTED RISK FACTORS (${selectedFactors.size}):\n${[...selectedStrokeFactors, ...selectedLipidFactors].map(f => `• ${f.label}`).join("\n")}`,
      therapyRec,
      strokeSpecific,
    };
  }, [selectedFactors, determinedRiskCategory]);

  const copyRiskProfile = () => {
    if (generateRiskProfile) {
      navigator.clipboard.writeText(generateRiskProfile.summary);
      toast.success("Risk profile copied to clipboard");
    }
  };

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
          LAI 2026 Lipid Risk Classification (Indian Guidelines)
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Lipid Association of India — CV & Stroke Risk Assessment with LDL-C Targets
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Sync from Stroke History */}
        {syncableCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                <strong>{syncableCount}</strong> stroke history item{syncableCount > 1 ? 's' : ''} can be synced
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={syncFromStrokeHistory} className="gap-1">
              <Brain className="h-3 w-3" />
              {syncedFromHistory ? 'Re-sync' : 'Sync from History'}
            </Button>
          </div>
        )}

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
                  <div className="mt-1.5 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700">
                    <p className="text-xs font-bold text-red-700 dark:text-red-300">
                      LAI 2026: {determinedRiskCategory.optionalTarget}
                    </p>
                  </div>
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

        {/* Stroke Risk Factors - NEW */}
        <div className="space-y-3">
          {renderFactorSection(
            "Stroke & Cerebrovascular Risk Factors",
            strokeRiskFactors,
            "stroke-risk",
            <Brain className="h-4 w-4 text-blue-600" />
          )}
        </div>

        {/* Risk Profile Generator */}
        {generateRiskProfile && (
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Generated Risk Profile
                </CardTitle>
                <Button variant="outline" size="sm" onClick={copyRiskProfile}>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={cn("p-3 rounded-lg border mb-3", determinedRiskCategory.bgColor, determinedRiskCategory.borderColor)}>
                <p className={cn("text-lg font-bold", determinedRiskCategory.color)}>{determinedRiskCategory.name}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">LDL-C</span>
                    <p className="font-semibold">{determinedRiskCategory.ldlTarget}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Non-HDL-C</span>
                    <p className="font-semibold">{determinedRiskCategory.nonHdlTarget}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">ApoB</span>
                    <p className="font-semibold">{determinedRiskCategory.apoBTarget}</p>
                  </div>
                </div>
              </div>
              {(determinedRiskCategory === riskCategories.extremeA || determinedRiskCategory === riskCategories.extremeB || determinedRiskCategory === riskCategories.extremeC) && (
                <div className="mt-2 p-2 bg-amber-100/60 dark:bg-amber-900/30 rounded border border-amber-300 dark:border-amber-700 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> CAD (coronary artery disease) is typically a "must" to fall under the "Extreme Risk" category, with PAD, stroke, or CKD acting as additional major complicating factors.
                  </p>
                </div>
              )}
              <div className="text-sm space-y-2">
                <div>
                  <p className="font-semibold text-xs uppercase text-muted-foreground">Therapy Recommendation</p>
                  <p className="text-sm mt-1">{generateRiskProfile.therapyRec}</p>
                </div>
                {generateRiskProfile.strokeSpecific && (
                  <div className="mt-2 p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
                    <p className="font-semibold text-xs uppercase text-muted-foreground flex items-center gap-1">
                      <Brain className="h-3 w-3" /> Stroke-Specific Considerations
                    </p>
                    <pre className="text-xs whitespace-pre-wrap font-sans mt-1">{generateRiskProfile.strokeSpecific.trim()}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lipid Risk Factor Categories */}
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
            "Known Risk Enhancers (ESC/EAS 2025 + AHA/ACC 2018)",
            riskEnhancers,
            "risk-enhancers",
            <Info className="h-4 w-4 text-blue-500" />
          )}

          {renderFactorSection(
            "hs-CRP Based Risk Assessment",
            hsCRPFactors,
            "hscrp",
            <Target className="h-4 w-4 text-rose-500" />
          )}

          {renderFactorSection(
            "Chronic Inflammatory Conditions (CV Risk Enhancers)",
            inflammatoryConditions,
            "inflammatory",
            <AlertTriangle className="h-4 w-4 text-orange-600" />
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

          {/* CAC Score Numeric Input */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">CAC Score Input</span>
              <Badge variant="outline" className="text-xs">Auto-selects risk tier</Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-[200px]">
                <Label className="text-xs text-muted-foreground">Enter CAC Score (Agatston)</Label>
                <input
                  type="number"
                  min="0"
                  value={cacScoreInput}
                  onChange={(e) => setCacScoreInput(e.target.value)}
                  placeholder="e.g., 150"
                  className="mt-1 w-full px-3 py-2 text-sm border rounded-md bg-background border-input"
                />
              </div>
              {cacAutoTier && (
                <div className="flex-1 flex items-center gap-2">
                  <div className={cn("px-3 py-2 rounded-lg border-2 font-medium text-sm", 
                    cacAutoTier.tier === "cac_0" ? "bg-green-100 dark:bg-green-900/40 border-green-400" :
                    cacAutoTier.tier === "cac_1_99_below75" ? "bg-orange-100 dark:bg-orange-900/40 border-orange-400" :
                    cacAutoTier.tier === "cac_100_299" ? "bg-red-100 dark:bg-red-900/40 border-red-400" :
                    "bg-red-200 dark:bg-red-900/60 border-red-500"
                  )}>
                    <p className={cn("text-sm font-bold", cacAutoTier.color)}>{cacAutoTier.label}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={applyCacScore} className="gap-1">
                    <Target className="h-3 w-3" />
                    Apply
                  </Button>
                </div>
              )}
            </div>
            {cacScoreInput && parseFloat(cacScoreInput) === 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                CAC = 0 indicates very low short-term ASCVD risk. Consider deferring statin unless other high-risk features present.
              </p>
            )}
          </div>

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

        {/* Lp(a) Risk Stratification — AHA/ACC 2026 */}
        <Collapsible open={expandedSections.has("lpa-guide")} onOpenChange={() => toggleSection("lpa-guide")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Lp(a) — Risk Stratification & AHA/ACC 2026 Update</span>
              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 dark:text-purple-300">Genetic Risk</Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSections.has("lpa-guide") && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3 p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-sm space-y-2">
              <p className="font-semibold text-purple-800 dark:text-purple-300">What is Lp(a)?</p>
              <p className="text-muted-foreground">Lp(a) represents a specific, highly inherited subset of atherogenic particles that are particularly dangerous — often described as a "hidden" risk factor that <strong>does not respond</strong> to standard diet or lifestyle changes. It is the <strong>strongest hereditary risk factor</strong> for heart disease.</p>
            </div>

            <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800 text-xs">
              <p className="text-red-800 dark:text-red-300"><strong>⚠️ Clinical Impact:</strong> Elevated levels of Lp(a) significantly increase the risk of <strong>heart disease, stroke, and aortic valve stenosis</strong>, even if your other cholesterol numbers are normal.</p>
            </div>

            <div className="text-sm">
              <p className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Lp(a) Risk Categories</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border">Risk Category</th>
                      <th className="text-left p-2 border">mg/dL (Mass)</th>
                      <th className="text-left p-2 border">nmol/L (Particle Count)</th>
                      <th className="text-left p-2 border">Relative Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-green-50 dark:bg-green-900/20">
                      <td className="p-2 border font-medium">Optimal</td>
                      <td className="p-2 border text-muted-foreground">≤14 mg/dL</td>
                      <td className="p-2 border text-muted-foreground">—</td>
                      <td className="p-2 border text-muted-foreground">Lowest</td>
                    </tr>
                    <tr className="bg-green-50/50 dark:bg-green-900/10">
                      <td className="p-2 border font-medium">Normal (Lower Risk)</td>
                      <td className="p-2 border text-muted-foreground">&lt;30 mg/dL</td>
                      <td className="p-2 border text-muted-foreground">&lt;75 nmol/L</td>
                      <td className="p-2 border text-muted-foreground">Reference</td>
                    </tr>
                    <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                      <td className="p-2 border font-medium">Borderline / Intermediate</td>
                      <td className="p-2 border text-muted-foreground">30–50 mg/dL</td>
                      <td className="p-2 border text-muted-foreground">75–125 nmol/L</td>
                      <td className="p-2 border text-muted-foreground">1.2× (28% ↑ CV risk)</td>
                    </tr>
                    <tr className="bg-orange-50 dark:bg-orange-900/20">
                      <td className="p-2 border font-medium">High Risk</td>
                      <td className="p-2 border text-muted-foreground">&gt;50 mg/dL</td>
                      <td className="p-2 border text-muted-foreground">&gt;125 nmol/L</td>
                      <td className="p-2 border text-muted-foreground">1.4× (44% ↑ CV risk)</td>
                    </tr>
                    <tr className="bg-red-50 dark:bg-red-900/20">
                      <td className="p-2 border font-medium">Very High</td>
                      <td className="p-2 border text-muted-foreground">≥100 mg/dL</td>
                      <td className="p-2 border text-muted-foreground">≥250 nmol/L</td>
                      <td className="p-2 border text-muted-foreground">2× (114% ↑ CV risk)</td>
                    </tr>
                    <tr className="bg-red-100 dark:bg-red-900/30">
                      <td className="p-2 border font-medium">Extreme</td>
                      <td className="p-2 border text-muted-foreground">≥150 mg/dL</td>
                      <td className="p-2 border text-muted-foreground">≥350 nmol/L</td>
                      <td className="p-2 border text-muted-foreground">3×</td>
                    </tr>
                    <tr className="bg-red-200 dark:bg-red-900/40">
                      <td className="p-2 border font-medium">Highest / Extreme Risk</td>
                      <td className="p-2 border text-muted-foreground">&gt;180 mg/dL</td>
                      <td className="p-2 border text-muted-foreground">&gt;430 nmol/L</td>
                      <td className="p-2 border text-muted-foreground">4×</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">📌 <strong>Particle Count (nmol/L) is considered more accurate</strong> than mass (mg/dL) because Lp(a) particles vary in size.</p>
            </div>

            <div className="p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 text-xs">
              <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">🆕 AHA/ACC 2026 Key Change</p>
              <p className="text-muted-foreground"><strong>Lp(a) testing is now recommended for ALL adults.</strong> This is the first guideline update in 8 years. Treatment decisions for younger adults are now based on <strong>30-year</strong> heart disease risk projections rather than 10-year risk alone.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Lp(a)-Targeted Therapies */}
        <Collapsible open={expandedSections.has("lpa-therapy")} onOpenChange={() => toggleSection("lpa-therapy")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-600" />
              <span className="font-medium text-sm">Lp(a)-Targeted Therapies — Pipeline & Evidence</span>
              <Badge variant="outline" className="text-xs border-violet-300 text-violet-700 dark:text-violet-300">Emerging</Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSections.has("lpa-therapy") && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3 p-4 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-800">

            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800 text-xs">
              <p className="text-yellow-800 dark:text-yellow-300"><strong>⚠️ Key Point:</strong> Currently, <strong>no FDA-approved therapy specifically targets Lp(a)</strong>. Lp(a) does not respond meaningfully to statins, diet, or exercise. Several promising agents are in Phase III trials.</p>
            </div>

            <div className="text-sm space-y-2">
              <p className="font-semibold text-violet-800 dark:text-violet-300">Emerging Lp(a)-Lowering Agents</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border">Agent</th>
                      <th className="text-left p-2 border">Mechanism</th>
                      <th className="text-left p-2 border">Lp(a) Reduction</th>
                      <th className="text-left p-2 border">Key Trial</th>
                      <th className="text-left p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-violet-50/50 dark:bg-violet-900/10">
                      <td className="p-2 border font-medium">Pelacarsen</td>
                      <td className="p-2 border text-muted-foreground">ASO (antisense oligonucleotide) targeting hepatic apo(a) mRNA</td>
                      <td className="p-2 border font-semibold text-green-600">~80%</td>
                      <td className="p-2 border text-muted-foreground"><strong>Lp(a) HORIZON</strong> (Phase III, n=8,323; MACE outcomes; results expected 2025-2026)</td>
                      <td className="p-2 border"><Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:text-blue-300">Phase III</Badge></td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Olpasiran</td>
                      <td className="p-2 border text-muted-foreground">siRNA targeting apo(a) mRNA in hepatocytes</td>
                      <td className="p-2 border font-semibold text-green-600">~95-101%</td>
                      <td className="p-2 border text-muted-foreground"><strong>OCEAN(a)</strong> (Phase III, n=6,000+; MACE outcomes). <strong>OCEAN(a)-Dose</strong> showed 71-101% reduction dose-dependently</td>
                      <td className="p-2 border"><Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:text-blue-300">Phase III</Badge></td>
                    </tr>
                    <tr className="bg-violet-50/50 dark:bg-violet-900/10">
                      <td className="p-2 border font-medium">Lepodisiran</td>
                      <td className="p-2 border text-muted-foreground">siRNA targeting apo(a) mRNA; longer dosing interval</td>
                      <td className="p-2 border font-semibold text-green-600">~94-97%</td>
                      <td className="p-2 border text-muted-foreground"><strong>ACCLAIM-Lp(a)</strong> (Phase III; MACE outcomes)</td>
                      <td className="p-2 border"><Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:text-blue-300">Phase III</Badge></td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Zerlasiran</td>
                      <td className="p-2 border text-muted-foreground">siRNA; twice-yearly dosing</td>
                      <td className="p-2 border font-semibold text-green-600">~90%</td>
                      <td className="p-2 border text-muted-foreground">Phase II completed; Phase III planned</td>
                      <td className="p-2 border"><Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700 dark:text-yellow-300">Phase II</Badge></td>
                    </tr>
                    <tr className="bg-violet-50/50 dark:bg-violet-900/10">
                      <td className="p-2 border font-medium">Muvalaplin</td>
                      <td className="p-2 border text-muted-foreground">Oral small molecule; blocks apo(a)–apoB100 binding</td>
                      <td className="p-2 border font-semibold text-green-600">~65%</td>
                      <td className="p-2 border text-muted-foreground">First oral Lp(a)-lowering agent. Phase II data published.</td>
                      <td className="p-2 border"><Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700 dark:text-yellow-300">Phase II</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800 text-xs space-y-2">
              <p className="font-semibold text-red-800 dark:text-red-300">❌ Niacin — NOT Recommended for Lp(a) Lowering</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Niacin reduces Lp(a) by ~20-30%, but this has <strong>NOT translated into clinical benefit</strong></li>
                <li><strong>AIM-HIGH</strong> (2011): Niacin added to statin showed no MACE reduction despite improved lipid profile; trial stopped early for futility</li>
                <li><strong>HPS2-THRIVE</strong> (2014): Niacin + laropiprant showed no CV benefit but <strong>increased serious adverse events</strong> (myopathy, infections, bleeding, new-onset diabetes)</li>
                <li>AHA/ACC 2026: <strong>Niacin is not recommended</strong> for Lp(a) or general lipid management</li>
                <li>Side effects include flushing, hepatotoxicity, hyperglycemia, and hyperuricemia</li>
              </ul>
            </div>

            <div className="text-sm space-y-2">
              <p className="font-semibold text-violet-800 dark:text-violet-300">Current Management While Awaiting Lp(a) Therapies</p>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                <li><strong>Aggressively treat all modifiable risk factors</strong> — LDL-C, BP, glucose, smoking, weight</li>
                <li><strong>Lower LDL-C targets</strong> — elevated Lp(a) should prompt more aggressive LDL-C goals (e.g., treat as "risk enhancer" per AHA 2026)</li>
                <li><strong>PCSK9 inhibitors</strong> reduce Lp(a) by ~20-30% as a secondary effect (not primary indication)</li>
                <li><strong>Aspirin</strong> may be considered for primary prevention in patients with Lp(a) ≥50 mg/dL (AHA 2026 — individualized decision)</li>
                <li><strong>Lipoprotein apheresis</strong> — FDA-approved for refractory cases with Lp(a) ≥60 mg/dL + progressive CVD despite optimal therapy</li>
              </ul>
            </div>

            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800 text-xs">
              <p className="text-blue-800 dark:text-blue-300"><strong>📌 Bottom Line:</strong> Lp(a) is genetically determined (>90% heritable) and resistant to lifestyle changes. Dedicated Lp(a)-lowering therapies (ASO/siRNA) are the most promising approach, with cardiovascular outcomes trials expected to report in 2025-2026. Until then, focus on aggressive LDL-C lowering and comprehensive risk factor management.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ApoB Clinical Guide — AHA/ACC 2026 */}
        <Collapsible open={expandedSections.has("apob-guide")} onOpenChange={() => toggleSection("apob-guide")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">ApoB — Why It Matters More Than LDL-C</span>
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-300">AHA/ACC 2026</Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSections.has("apob-guide") && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="text-sm space-y-2">
              <p className="font-semibold text-amber-800 dark:text-amber-300">ApoB vs LDL-C: Key Differences</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border">Feature</th>
                      <th className="text-left p-2 border">LDL-C</th>
                      <th className="text-left p-2 border">ApoB</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium">What it measures</td>
                      <td className="p-2 border text-muted-foreground">Mass of cholesterol in LDL</td>
                      <td className="p-2 border text-muted-foreground">Number of all atherogenic particles</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">How obtained</td>
                      <td className="p-2 border text-muted-foreground">Often <em>calculated</em> (Friedewald)</td>
                      <td className="p-2 border text-muted-foreground">Always <em>directly measured</em></td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Particles counted</td>
                      <td className="p-2 border text-muted-foreground">Only LDL (1 of 3 atherogenic)</td>
                      <td className="p-2 border text-muted-foreground">LDL + VLDL + Lp(a) — all atherogenic</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">CV risk prediction</td>
                      <td className="p-2 border text-muted-foreground">Good</td>
                      <td className="p-2 border text-muted-foreground"><strong>Superior</strong> — more accurate predictor</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Discordance</td>
                      <td className="p-2 border text-muted-foreground" colSpan={2}>Common in metabolic syndrome, diabetes, high TG — <strong>ApoB wins when they disagree</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-sm space-y-1.5">
              <p className="font-semibold text-amber-800 dark:text-amber-300">Clinical Pearls</p>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                <li><strong>ApoB reflects total atherogenic particle burden</strong> (LDL + Lp(a) + VLDL remnants)</li>
                <li><strong>Lp(a) confers genetic risk</strong> — a specific, inherited subset that doesn't respond to lifestyle changes</li>
                <li>Think of ApoB as "sticky cholesterol" — it counts every particle that can enter the arterial wall</li>
                <li>Young adults with high ApoB but normal LDL-C had <strong>55% higher risk</strong> of developing coronary artery calcification 25 years later</li>
                <li>Those with high LDL-C but normal ApoB did <strong>not</strong> show increased risk — ApoB was the true driver</li>
                <li>When ApoB and LDL-C disagree, <strong>always follow ApoB</strong> for risk prediction</li>
              </ul>
            </div>

            <div className="text-sm space-y-2">
              <p className="font-semibold text-amber-800 dark:text-amber-300">Key ApoB Reference Ranges</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border">Category</th>
                      <th className="text-left p-2 border">ApoB Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium text-green-700 dark:text-green-400">Optimal</td>
                      <td className="p-2 border text-muted-foreground">&lt;90 mg/dL</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-yellow-700 dark:text-yellow-400">Borderline High</td>
                      <td className="p-2 border text-muted-foreground">90–109 mg/dL</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-red-700 dark:text-red-400">High Risk</td>
                      <td className="p-2 border text-muted-foreground">≥110 mg/dL (often defined as ≥130 mg/dL)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Male Typical Range</td>
                      <td className="p-2 border text-muted-foreground">66–133 mg/dL</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Female Typical Range</td>
                      <td className="p-2 border text-muted-foreground">60–117 mg/dL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 text-xs">
              <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">🆕 AHA/ACC 2026 Highlights (52 New Recommendations)</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                <li><strong>Lp(a) testing recommended for ALL adults</strong> — strongest hereditary CV risk factor</li>
                <li><strong>ApoB, hsCRP, and CAC testing</strong> recommended more frequently as superior biomarkers</li>
                <li><strong>Specific LDL targets restored</strong> — removed in 2013, now back in 2026</li>
                <li><strong>30-year risk projections</strong> for younger adults (replacing 10-year-only assessment)</li>
                <li>Treatment now recommended for <strong>younger adults</strong> based on lifetime risk</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

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
                  <td className="p-2 border text-muted-foreground">ASCVD, stroke/TIA, LVO, subclinical plaque, HeFH</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium text-red-700 dark:text-red-300">Extreme A</td>
                  <td className="p-2 border">&lt;50 (opt ≤30)</td>
                  <td className="p-2 border text-muted-foreground">DM+ASCVD, CAC&gt;300, HeFH+ASCVD</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium text-purple-700 dark:text-purple-300">Extreme B</td>
                  <td className="p-2 border">≤30 mg/dL</td>
                  <td className="p-2 border text-muted-foreground">Recurrent ACS, polyvascular (stroke+PAD), HoFH+ASCVD</td>
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
          Based on: LAI 2026 Update | ESC/EAS Guidelines on Dyslipidemias 2025 (Mach F, et al. Atherosclerosis. 2025;409:120479) | AHA/ACC Cholesterol Guidelines 2026 (52 new recommendations) | AHA/ACC 2018 (Grundy SM, et al. Circulation. 2019;139:e1082-e1143)
        </p>
      </CardContent>
    </Card>
  );
};

export default LAILipidRiskClassification;
