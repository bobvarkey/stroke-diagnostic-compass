import React, { useState, useRef, useCallback, memo } from "react";
import LazySection from "./LazySection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Activity, Heart, Brain, Eye, TestTube, Search, Droplets, ArrowRight, ChevronDown, AlertTriangle, Zap, Layers, Beaker, Target, Crosshair, BarChart3, Calculator, ClipboardList, FileText, Pill, ShieldAlert, Syringe, HeartPulse } from "lucide-react";
import SectionNavigator, { SectionItem } from "./SectionNavigator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import bostonCriteriaFlowchart from "@/assets/boston-criteria-flowchart.jpeg";
import fourScoreDiagram from "@/assets/four-score-diagram.png";
import DocumentAnalyzer from "./DocumentAnalyzer";
import DemographicsForm from "./DemographicsForm";
import PDFScoreSummary from "./PDFScoreSummary";
import InteractiveASPECTSCalculator from "./InteractiveASPECTSCalculator";
import InteractivePcASPECTSCalculator from "./InteractivePcASPECTSCalculator";
import FisherScaleCalculator from "./FisherScaleCalculator";
import InteractiveICHScoreCalculator from "./ICHScoreCalculator";
import { nihssIconMap } from "./NIHSSIcons";
import SerialNIHSSTracker from "./SerialNIHSSTracker";
import { ThemeToggle } from "./ThemeToggle";
import TreatmentDecisionAid from "./TreatmentDecisionAid";
import TPAEligibilityChecklist from "./TPAEligibilityChecklist";
import HeadsUpTest from "./HeadsUpTest";
import LVODecisionDashboard from "./LVODecisionDashboard";
import LAILipidRiskClassification from "./LAILipidRiskClassification";
import LipidTherapyIntensificationGuide from "./LipidTherapyIntensificationGuide";
import ETICIScoreCalculator from "./ETICIScoreCalculator";
import TALDefinitionGuide from "./TALDefinitionGuide";
import VascularAnatomyDiagram from "./VascularAnatomyDiagram";
import ThrombectomyOutcomeTracker from "./ThrombectomyOutcomeTracker";
import PREVENTScoreCalculator from "./PREVENTScoreCalculator";
import CTPPenumbraCalculator from "./CTPPenumbraCalculator";
import ISPS25StrokePhenotyping from "./ISPS25StrokePhenotyping";
import StrokeHistoryTemplate from "./StrokeHistoryTemplate";
import KDIGOHeatMap from "./KDIGOHeatMap";
import PRIMEToolCalculator from "./PRIMEToolCalculator";
import StrokeCodeSystem from "./StrokeCodeSystem";
import InteractiveAcuteStrokeAlgorithm from "./InteractiveAcuteStrokeAlgorithm";
import ThrombolyticDoseCalculator from "./ThrombolyticDoseCalculator";
import PostThrombolysisICHManagement from "./PostThrombolysisICHManagement";
import CerebralVenousThrombosis from "./CerebralVenousThrombosis";
import SubarachnoidHemorrhage from "./SubarachnoidHemorrhage";
import SubduralHematoma from "./SubduralHematoma";
import LabInvestigationsModule from "./LabInvestigationsModule";
import FeedbackForm from "./FeedbackForm";
import ICHAnticoagReversalCalculators from "./ICHAnticoagReversalCalculators";

interface TestItem {
  id: string;
  name: string;
  category: string;
}

const strokeTests: TestItem[] = [
  // Basic Laboratory Studies
  { id: "cbc", name: "CBC (Complete Blood Count)", category: "Basic Laboratory" },
  { id: "esr", name: "ESR (Erythrocyte Sedimentation Rate)", category: "Basic Laboratory" },
  { id: "crp", name: "CRP (C-Reactive Protein)", category: "Basic Laboratory" },
  { id: "rft", name: "RFT (Renal Function Tests)", category: "Basic Laboratory" },
  { id: "lft", name: "LFT (Liver Function Tests)", category: "Basic Laboratory" },
  { id: "tft", name: "TFT (Thyroid Function Tests)", category: "Basic Laboratory" },
  { id: "uacr", name: "uACR (Urine Albumin-to-Creatinine Ratio) - CV risk biomarker: <30 normal | 30-300 microalbuminuria | >300 macroalbuminuria", category: "Basic Laboratory" },
  { id: "egfr", name: "eGFR (Estimated Glomerular Filtration Rate) - CKD staging: ≥90 G1 | 60-89 G2 | 45-59 G3a | 30-44 G3b | 15-29 G4 | <15 G5", category: "Basic Laboratory" },
  
  // Chemistry Profile
  { id: "glucose", name: "Fasting Glucose", category: "Chemistry Profile" },
  { id: "hba1c", name: "Hemoglobin A1c Level", category: "Chemistry Profile" },
  
  // Coagulation Studies
  { id: "pt", name: "PT (Prothrombin Time)", category: "Coagulation" },
  { id: "aptt", name: "aPTT (Activated Partial Thromboplastin Time)", category: "Coagulation" },
  { id: "thrombin", name: "Thrombin Time", category: "Coagulation" },
  { id: "platelets", name: "Platelet Count", category: "Coagulation" },
  { id: "fibrinogen", name: "Fibrinogen", category: "Coagulation" },
  { id: "ddimer_coag", name: "D-dimer", category: "Coagulation" },
  
  // Infectious Disease Workup
  { id: "vdrl", name: "VDRL", category: "Infectious Disease" },
  { id: "hiv", name: "HIV", category: "Infectious Disease" },
  { id: "hbsag", name: "HBsAg", category: "Infectious Disease" },
  { id: "hcv", name: "HCV Serology", category: "Infectious Disease" },
  { id: "cultures", name: "Blood Cultures", category: "Infectious Disease" },
  
  // Specialized Blood Tests
  { id: "toxicology", name: "Toxicology Screen", category: "Specialized Blood" },
  { id: "lipids", name: "Fasting Lipid Profile", category: "Specialized Blood" },
  { id: "sickle", name: "Sickle Cell Prep", category: "Specialized Blood" },
  { id: "sickling", name: "Sickling Test", category: "Specialized Blood" },
  { id: "hbelectro", name: "Hb Electrophoresis", category: "Specialized Blood" },
  { id: "pnh", name: "PNH Screen", category: "Specialized Blood" },
  { id: "pregnancy", name: "Pregnancy Test", category: "Specialized Blood" },
  { id: "lactic", name: "Lactic Acid", category: "Specialized Blood" },
  { id: "homocysteine", name: "Homocysteine", category: "Specialized Blood" },
  { id: "ace", name: "ACE Levels", category: "Specialized Blood" },
  { id: "lipoprotein", name: "Lipoprotein (A)", category: "Specialized Blood" },
  { id: "apob_spec", name: "Apolipoprotein B (ApoB)", category: "Specialized Blood" },
  { id: "hscrp", name: "High-Sensitivity CRP", category: "Specialized Blood" },
  { id: "clinicalexome", name: "Clinical Exome Testing", category: "Specialized Blood" },
  
  // Hypercoagulable Screen
  { id: "apla", name: "APLA Antibodies (ACL, LAC, beta2 GP)", category: "Hypercoagulable" },
  { id: "proteinc", name: "Protein C Activity", category: "Hypercoagulable" },
  { id: "proteins", name: "Free Protein S Antigen", category: "Hypercoagulable" },
  { id: "antithrombin", name: "Antithrombin III", category: "Hypercoagulable" },
  { id: "apcr", name: "APCR", category: "Hypercoagulable" },
  { id: "fvl", name: "Factor V Leiden Mutation", category: "Hypercoagulable" },
  { id: "pg20210a", name: "Prothrombin G20210A Mutation", category: "Hypercoagulable" },
  { id: "mthfr", name: "MTHFR Mutation", category: "Hypercoagulable" },
  { id: "ddimer", name: "D-dimer", category: "Hypercoagulable" },
  { id: "cyp2c19_hypercoag", name: "CYP2C19 Genotyping (Clopidogrel Resistance) ⚠️ 30-50% of Indians are resistant", category: "Hypercoagulable" },
  { id: "pru_hypercoag", name: "P2Y12 Reaction Units (PRU) - Platelet Function Test", category: "Hypercoagulable" },
  { id: "thrombophilia_maxi", name: "Thrombophilia Maxi Panel (Metropolis) - Comprehensive thrombophilia screen including Factor V Leiden, Prothrombin G20210A, MTHFR, Protein C/S, AT-III, APLA", category: "Hypercoagulable" },
  
  // Autoimmune/Inflammatory
  { id: "ana", name: "ANA", category: "Autoimmune" },
  { id: "complement", name: "Complement Levels", category: "Autoimmune" },
  { id: "anca", name: "ANCA", category: "Autoimmune" },
  { id: "cryoglobulin", name: "Cryoglobulin", category: "Autoimmune" },
  { id: "scl70", name: "Scl-70", category: "Autoimmune" },
  
  // CSF Analysis
  { id: "csf", name: "CSF Analysis", category: "CSF" },
  
  // Brain Imaging
  { id: "ct", name: "CT Brain", category: "Brain Imaging" },
  { id: "cta", name: "CTA", category: "Brain Imaging" },
  { id: "mri", name: "MRI Brain", category: "Brain Imaging" },
  { id: "mra", name: "MRA", category: "Brain Imaging" },
  { id: "mrv", name: "MRV", category: "Brain Imaging" },
  { id: "blackblood", name: "MRI Black Blood Imaging", category: "Brain Imaging" },
  
  // Vascular Imaging
  { id: "carotid", name: "Carotid Duplex Ultrasound", category: "Vascular Imaging" },
  { id: "tcd", name: "TCD with Bubble Study", category: "Vascular Imaging" },
  { id: "mracta", name: "MRA/CTA of Head and Neck", category: "Vascular Imaging" },
  { id: "dsa", name: "DSA +/- Rotational/Flexion", category: "Vascular Imaging" },
  { id: "legultrasound", name: "Lower Extremity Ultrasound", category: "Vascular Imaging" },
  { id: "pelvicmr", name: "Pelvic CT or MR Venography", category: "Vascular Imaging" },
  { id: "carotiddoppler", name: "Carotid Doppler for Floating Thrombus", category: "Vascular Imaging" },
  { id: "vesselwall", name: "Vessel Wall Imaging (BBI-MRI)", category: "Vascular Imaging" },
  { id: "cbctdsa", name: "CBCT-DSA", category: "Vascular Imaging" },
  
  // Cardiac Studies
  { id: "ecg", name: "ECG", category: "Cardiac" },
  { id: "tee", name: "TEE with Bubble Study", category: "Cardiac" },
  { id: "tte", name: "TTE", category: "Cardiac" },
  { id: "ttela", name: "TTE LA diameter≥39 mm in men and ≥37 mm in women", category: "Cardiac" },
  { id: "ttelavolume", name: "LA volume >34 ml/m2 BSA by TTE", category: "Cardiac" },
  { id: "ntprobnp", name: "NT-pro-BNP >250 pg/dl (within 48h of stroke)", category: "Cardiac" },
  { id: "holter", name: "Holter Monitor", category: "Cardiac" },
  
  // Advanced Studies
  { id: "eeg", name: "EEG", category: "Advanced" },
  { id: "petct", name: "PET CT for Arteritis", category: "Advanced" },
  { id: "brainbiopsy", name: "Brain and Meningeal Biopsy", category: "Advanced" },
  { id: "skinbiopsy", name: "Skin Biopsy", category: "Advanced" },
  { id: "nervebiopsy", name: "Sural Nerve or Muscle Biopsy", category: "Advanced" },
  { id: "genetics", name: "Genetic Testing (CADASIL, Fabry's, MELAS, HANAC)", category: "Advanced" },
  { id: "ophthalmology", name: "Ophthalmological/Fundus Examination", category: "Advanced" },
  { id: "fabrys", name: "Fabry's: GLA Activity", category: "Advanced" },
  { id: "skinpxe", name: "Skin: Pseudoxanthoma Elasticum", category: "Advanced" },
  
  // Aortic Atheroma Grading (Katz Classification)
  { id: "aortic_grade1", name: "Grade 1: Normal-appearing intima", category: "Aortic Atheroma Grading" },
  { id: "aortic_grade2", name: "Grade 2: Extensive intimal thickening", category: "Aortic Atheroma Grading" },
  { id: "aortic_grade3", name: "Grade 3: Sessile atheroma protruding <5 mm", category: "Aortic Atheroma Grading" },
  { id: "aortic_grade4", name: "Grade 4: Sessile atheroma protruding ≥5 mm", category: "Aortic Atheroma Grading" },
  { id: "aortic_grade5", name: "Grade 5: Mobile atheroma (may be ulcerated)", category: "Aortic Atheroma Grading" },
  
  // ESUS-Related Aetiologies
  { id: "occult_cancer", name: "Occult Cancer", category: "ESUS Aetiologies" },
  { id: "branch_artery", name: "Branch Artery Disease", category: "ESUS Aetiologies" },
  { id: "aortic_arch_athero", name: "Aortic Arch Atherosclerosis", category: "ESUS Aetiologies" },
  { id: "nonstenotic_laa", name: "Non-stenotic Extracranial Large Artery Atherosclerosis", category: "ESUS Aetiologies" },
  { id: "minor_valve", name: "Minor Valve Disease", category: "ESUS Aetiologies" },
  { id: "lv_wall_motion", name: "LV Wall Motion Abnormalities", category: "ESUS Aetiologies" },
  { id: "carotid_siphon", name: "Carotid Siphon Disease", category: "ESUS Aetiologies" },
  { id: "atrial_cardiopathy", name: "Atrial Cardiopathy without AFib", category: "ESUS Aetiologies" },
  { id: "nonischemic_cm", name: "Non-ischemic Cardiomyopathy", category: "ESUS Aetiologies" },
  { id: "hyperhomocysteinemia", name: "Hyperhomocysteinemia", category: "ESUS Aetiologies" },
  
  // Lipid Assessment
  { id: "lipid_panel", name: "Standard Lipid Panel (TC, LDL, HDL, TG)", category: "Lipid Assessment" },
  { id: "apob", name: "ApoB (Sticky Cholesterol) - <80: lower risk | 80-99: moderate | ≥100: high risk | Secondary prevention target: <65 mg/dL", category: "Lipid Assessment" },
  { id: "apob_legend", name: "⚠️ High ApoB predicts atherosclerotic plaque formation across all lipid phenotypes", category: "Lipid Assessment" },
  { id: "lpa", name: "Lp(a) (Genetic Risk Factor) - <30: normal | 30-50: borderline | ≥50: high | ≥100 mg/dL: very high genetic risk", category: "Lipid Assessment" },
  { id: "lipid_high_apob", name: "High ApoB → Treat for high atherogenic load", category: "Lipid Assessment" },
  { id: "lipid_normal_apob_high_lpa", name: "Normal ApoB + High Lp(a) → Hidden inherited risk", category: "Lipid Assessment" },
  { id: "lipid_both_high", name: "Both High → Very high lifetime risk, aggressive management", category: "Lipid Assessment" },
  
  // Stroke Phenotypes
  { id: "pheno_svd", name: "Small Vessel Disease (lacunar infarcts, WMH, microbleeds)", category: "Stroke Phenotypes" },
  { id: "pheno_lva", name: "Large Vessel Atherosclerosis (extracranial carotid/vertebral)", category: "Stroke Phenotypes" },
  { id: "pheno_icad", name: "Intracranial Atherosclerosis (MCA, basilar, ICA stenosis)", category: "Stroke Phenotypes" },
  { id: "pheno_cardio", name: "Cardioembolism (see Cardioembolism Aetiologies below)", category: "Stroke Phenotypes" },
  { id: "pheno_esus", name: "ESUS (Embolic Stroke of Undetermined Source)", category: "Stroke Phenotypes" },
  { id: "pheno_heme", name: "Hematological Causes (APLS, PNH, sickle cell, thrombophilia)", category: "Stroke Phenotypes" },
  { id: "pheno_radiation", name: "Radiation Vasculopathy", category: "Stroke Phenotypes" },
  { id: "pheno_fmd", name: "Fibromuscular Dysplasia (FMD)", category: "Stroke Phenotypes" },
  { id: "pheno_dissection", name: "Arterial Dissection (carotid/vertebral)", category: "Stroke Phenotypes" },
  { id: "pheno_vasculitis", name: "CNS Vasculitis (primary or secondary)", category: "Stroke Phenotypes" },
  { id: "pheno_iatrogenic", name: "Iatrogenic (stroke within 24h of vascular/cardiac/neurosurgical procedure)", category: "Stroke Phenotypes" },
  { id: "pheno_drug", name: "Drug Use (cocaine or methamphetamine positive on drug screen)", category: "Stroke Phenotypes" },
  { id: "pheno_other", name: "Other Vasculopathies (moyamoya, RCVS, etc.)", category: "Stroke Phenotypes" },
  
  // Cardioembolism Aetiologies
  { id: "ce_af", name: "Known or ECG-detected AF or atrial flutter", category: "Cardioembolism Aetiologies" },
  { id: "ce_thrombus", name: "Intracardiac thrombus", category: "Cardioembolism Aetiologies" },
  { id: "ce_mech_valve", name: "Mechanical heart valve", category: "Cardioembolism Aetiologies" },
  { id: "ce_tumor", name: "Left-sided cardiac tumors (myxoma, fibroelastoma)", category: "Cardioembolism Aetiologies" },
  { id: "ce_ms", name: "Severe mitral stenosis", category: "Cardioembolism Aetiologies" },
  { id: "ce_stemi", name: "STEMI within 4 weeks", category: "Cardioembolism Aetiologies" },
  { id: "ce_ef", name: "Left ventricular ejection fraction <30%", category: "Cardioembolism Aetiologies" },
  { id: "ce_endocarditis", name: "Infective or non-infective endocarditis", category: "Cardioembolism Aetiologies" },
  { id: "ce_pfo", name: "PFO (if PASCAL classification is definite, probable, or possible)", category: "Cardioembolism Aetiologies" },
  { id: "ce_lv_aneurysm", name: "Left ventricular apical aneurysm", category: "Cardioembolism Aetiologies" },
  { id: "ce_lvnc", name: "Left ventricular noncompaction", category: "Cardioembolism Aetiologies" },
  
  // HMOD (Hypertension-Mediated Organ Damage) Evaluation
  { id: "hmod_fundus", name: "Optic Fundus Assessment (hypertensive retinopathy grading)", category: "HMOD Evaluation" },
  { id: "hmod_lv_mass", name: "LV Mass Index / LV Hypertrophy (Echo or CMR)", category: "HMOD Evaluation" },
  { id: "hmod_egfr", name: "eGFR (chronic kidney disease assessment)", category: "HMOD Evaluation" },
  { id: "hmod_acr", name: "Urine Albumin-to-Creatinine Ratio (microalbuminuria)", category: "HMOD Evaluation" },
  { id: "hmod_pwv", name: "Pulse Wave Velocity / Arterial Stiffness", category: "HMOD Evaluation" },
  { id: "hmod_abi", name: "Ankle-Brachial Index (peripheral artery disease)", category: "HMOD Evaluation" },
  { id: "hmod_carotid_imt", name: "Carotid Intima-Media Thickness", category: "HMOD Evaluation" },
  { id: "hmod_ecg_strain", name: "ECG LV Strain Pattern", category: "HMOD Evaluation" },
  
  // Brain/CNS HMOD
  { id: "hmod_lacunar", name: "Lacunar Infarcts on MRI (silent or symptomatic)", category: "HMOD Evaluation" },
  { id: "hmod_wmh", name: "White Matter Hyperintensities on MRI (Fazekas grading)", category: "HMOD Evaluation" },
  { id: "hmod_microbleeds", name: "Cerebral Microbleeds on MRI (lobar vs. deep)", category: "HMOD Evaluation" },
  { id: "hmod_pvs", name: "Enlarged Perivascular Spaces (centrum semiovale, basal ganglia)", category: "HMOD Evaluation" },
  { id: "hmod_atrophy", name: "Brain Atrophy Assessment", category: "HMOD Evaluation" },
  
  // Anthropometric Assessment
  { id: "anthro_height", name: "Height (cm/m)", category: "Anthropometric Assessment" },
  { id: "anthro_weight", name: "Weight (kg)", category: "Anthropometric Assessment" },
  { id: "anthro_bmi", name: "BMI - <18.5: Underweight | 18.5-24.9: Normal | 25-29.9: Overweight | 30-34.9: Obese I | 35-39.9: Obese II | ≥40: Obese III", category: "Anthropometric Assessment" },
  { id: "anthro_waist", name: "Waist Circumference - Men: >102cm high risk | Women: >88cm high risk (WHO cutoffs)", category: "Anthropometric Assessment" },
  { id: "anthro_waist_asian", name: "Waist Circumference (Asian) - Men: >90cm | Women: >80cm", category: "Anthropometric Assessment" },
  
  // Insulin Resistance Markers
  { id: "ir_homa", name: "HOMA-IR = (Fasting Insulin × Fasting Glucose) ÷ 405 | <1.0: Optimal | 1.0-1.9: Normal | 2.0-2.9: Early IR | ≥3.0: Significant IR", category: "Insulin Resistance" },
  { id: "ir_tg_hdl", name: "TG:HDL Ratio | <2: Optimal | 2-3: Borderline | >3: High IR risk | >4: Very high risk (metabolic syndrome marker)", category: "Insulin Resistance" },
  { id: "ir_glucose_insulin", name: "Fasting Glucose:Insulin Ratio | >6: Normal insulin sensitivity | <6: Insulin resistance likely", category: "Insulin Resistance" },
  { id: "ir_quicki", name: "QUICKI = 1 ÷ (log Insulin + log Glucose) | >0.45: Normal | 0.35-0.45: Borderline | <0.35: Insulin resistant", category: "Insulin Resistance" },
  
  // Pharmacogenomics - Clopidogrel Resistance
  { id: "cyp2c19_genotype", name: "CYP2C19 Genotyping (Clopidogrel Resistance Test)", category: "Pharmacogenomics" },
  { id: "pru_test", name: "P2Y12 Reaction Units (PRU) - Platelet Function Test", category: "Pharmacogenomics" },
  { id: "aru_test", name: "VerifyNow Aspirin (ARU) - Aspirin Resistance Test", category: "Pharmacogenomics" },
  { id: "ltb4_test", name: "LTB4 Inhibition Assay - Aspirin Effect Confirmation", category: "Pharmacogenomics" },
];

// Clopidogrel Resistance Clinical Note
const clopidogrelResistanceNote = `CYP2C19 Loss-of-Function Alleles: Clopidogrel is a prodrug requiring CYP2C19 for activation. Patients with loss-of-function alleles (*2, *3) have reduced or absent enzyme activity, leading to diminished antiplatelet effect.

⚠️ IMPORTANT: 30-50% of the Indian population carries CYP2C19 loss-of-function alleles, making clopidogrel resistance highly prevalent in this demographic.

Metabolizer Phenotypes:
• Ultrarapid (*17/*17): Enhanced response - may have increased bleeding risk
• Normal (*1/*1): Standard response - clopidogrel effective
• Intermediate (*1/*2, *1/*3): Reduced response - consider alternative or higher dose
• Poor (*2/*2, *2/*3, *3/*3): Minimal response - alternative antiplatelet recommended

PRU Testing Interpretation:
• PRU <85: Adequate platelet inhibition (increased bleeding risk)
• PRU 85-208: Therapeutic range
• PRU >208: High platelet reactivity (clopidogrel resistance)

Alternative Agents for Poor Metabolizers:
• Ticagrelor (Brilinta) - not CYP2C19 dependent
• Prasugrel (Effient) - less affected by CYP2C19 variants`;

// AF Burden Clinical Note
const afBurdenNote = `The type and burden of device-detected AF are paramount to appropriate management. High-burden AF (longest episode >24 hours) significantly elevates stroke risk - anticoagulation or LAA occlusion should be considered. Low-burden AF (6 min–24 hours) management is less clear. AF detected within 12 months of continuous cardiac monitoring, particularly episodes >24 hours, is more likely causal for ESUS. Although prolonged monitoring increases AF detection, further research is needed for low-burden AF management, especially when detected beyond 12 months.`;

// STRIVE Criteria for Cerebral Small Vessel Disease
const striveMarkers = [
  { name: "Recent Small Subcortical Infarcts", desc: "Acute lesions <20mm in axial plane, in perforating artery territory" },
  { name: "Lacunes", desc: "Round/ovoid fluid-filled cavities 3-15mm, in perforating artery territory" },
  { name: "White Matter Hyperintensities", desc: "Hyperintense on T2/FLAIR, variable size; use Fazekas scale (0-3)" },
  { name: "Perivascular Spaces", desc: "Fluid-filled spaces following vessels; rate in basal ganglia and centrum semiovale" },
  { name: "Cerebral Microbleeds", desc: "Small round hypointense lesions on T2*/SWI, 2-10mm; distinguish lobar vs. deep" },
  { name: "Cortical Superficial Siderosis", desc: "Linear hypointensity on T2*/SWI following cortical surface" },
  { name: "Brain Atrophy", desc: "Lower brain volume not due to focal injury; global and regional assessment" },
];

const categoryIcons: Record<string, any> = {
  "Basic Laboratory": TestTube,
  "Chemistry Profile": TestTube,
  "Coagulation": Activity,
  "Infectious Disease": Stethoscope,
  "Specialized Blood": TestTube,
  "Hypercoagulable": Activity,
  "Autoimmune": Stethoscope,
  "CSF": Brain,
  "Brain Imaging": Brain,
  "Vascular Imaging": Heart,
  "Cardiac": Heart,
  "Advanced": Eye,
  "Aortic Atheroma Grading": Heart,
  "ESUS Aetiologies": Search,
  "Lipid Assessment": TestTube,
  "Stroke Phenotypes": Droplets,
  "Cardioembolism Aetiologies": Heart,
  "HMOD Evaluation": Eye,
  "Anthropometric Assessment": Activity,
  "Insulin Resistance": TestTube,
  "Pharmacogenomics": TestTube,
};

// Acute Stroke Management Algorithm Component - AHA 2026 Guidelines
function AcuteStrokeAlgorithm() {
  const [isOpen, setIsOpen] = useState(true);

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

            {/* Information Needed Section */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Information Needed</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 border-2 border-red-500 rounded-lg text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last known well time</span>
                </div>
                <div className="p-3 border-2 border-red-500 rounded-lg text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NIH Stroke Scale score</span>
                </div>
                <div className="p-3 border-2 border-red-500 rounded-lg text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pre-stroke mRS</span>
                </div>
                <div className="p-3 border-2 border-orange-500 rounded-lg text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disabling vs Non-disabling</span>
                </div>
              </div>
            </div>

            {/* Main Flowchart */}
            <div className="space-y-4">
              {/* Starting Point */}
              <div className="flex justify-center">
                <div className="px-6 py-3 border-2 border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Last known well time to presentation</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 rotate-90 text-gray-500" />
              </div>

              {/* Time Windows - Updated for AHA 2026 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* < 4.5 hours pathway - IVT Window */}
                <div className="border-2 border-dashed border-green-400 dark:border-green-600 rounded-lg p-4 space-y-3">
                  <div className="text-center px-4 py-2 bg-green-100 dark:bg-green-800/40 rounded-lg border border-green-400 dark:border-green-600">
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
                      <div className="text-center">
                        <div className="px-3 py-1 bg-green-200 dark:bg-green-700 rounded text-xs mb-2 font-medium">Yes</div>
                        <div className="px-3 py-2 bg-green-600 text-white rounded-lg font-bold text-xs">
                          Alteplase OR Tenecteplase
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">No NIHSS threshold</p>
                      </div>
                      <div className="text-center">
                        <div className="px-3 py-1 bg-amber-200 dark:bg-amber-700 rounded text-xs mb-2 font-medium">No (Non-disabling)</div>
                        <div className="px-3 py-2 bg-amber-600 text-white rounded-lg font-bold text-xs">
                          DAPT Preferred
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Aspirin + Clopidogrel</p>
                      </div>
                    </div>
                  </div>

                  {/* LVO Check */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-300 dark:border-purple-700">
                    <p className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-2 text-center">LVO on CTA?</p>
                    <div className="text-center">
                      <div className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm">
                        IVT + EVT (bridging therapy)
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Do not delay EVT for IVT effect</p>
                    </div>
                  </div>
                </div>

                {/* 4.5-9 hours / Wake-up stroke - Extended IVT */}
                <div className="border-2 border-dashed border-amber-400 dark:border-amber-600 rounded-lg p-4 space-y-3">
                  <div className="text-center px-4 py-2 bg-amber-100 dark:bg-amber-800/40 rounded-lg border border-amber-400 dark:border-amber-600">
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
                    <div className="text-center">
                      <div className="px-3 py-1 bg-green-200 dark:bg-green-700 rounded text-xs mb-1">Criteria Met</div>
                      <div className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm">
                        Alteplase or Tenecteplase
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mb-1">Not Met</div>
                      <div className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold text-sm">
                        Check EVT eligibility
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6-24 hours - EVT Window */}
                <div className="border-2 border-dashed border-purple-400 dark:border-purple-600 rounded-lg p-4 space-y-3">
                  <div className="text-center px-4 py-2 bg-purple-100 dark:bg-purple-800/40 rounded-lg border border-purple-400 dark:border-purple-600">
                    <span className="font-semibold text-purple-800 dark:text-purple-200">6-24 hours (EVT Window)</span>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 rotate-90 text-gray-400" />
                  </div>

                  <div className="text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                    <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">CTA + CTP (RAPID/Viz.ai)</span>
                  </div>

                  {/* DAWN/DEFUSE Criteria */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-300 dark:border-purple-700 text-xs">
                    <p className="font-bold text-purple-800 dark:text-purple-300 mb-1">Standard EVT (DAWN/DEFUSE-3):</p>
                    <ul className="text-purple-700 dark:text-purple-400 space-y-0.5">
                      <li>• Core &lt;70mL + Mismatch ≥1.8 + Penumbra ≥15mL</li>
                      <li>• LVO: ICA, M1, or proximal M2</li>
                    </ul>
                  </div>

                  {/* Large Core - NEW 2026 */}
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-300 dark:border-red-700 text-xs">
                    <p className="font-bold text-red-800 dark:text-red-300 mb-1">🆕 Large Core EVT (2026):</p>
                    <ul className="text-red-700 dark:text-red-400 space-y-0.5">
                      <li>• Core 70-100mL may benefit from EVT</li>
                      <li>• Shared decision-making</li>
                      <li>• Consider age, baseline function</li>
                    </ul>
                  </div>

                  {/* Basilar - NEW Strong Recommendation */}
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-300 dark:border-orange-700 text-xs">
                    <p className="font-bold text-orange-800 dark:text-orange-300 mb-1">🆕 Basilar Occlusion (Strong):</p>
                    <ul className="text-orange-700 dark:text-orange-400 space-y-0.5">
                      <li>• NIHSS ≥10 within 24 hours</li>
                      <li>• EVT recommended (Class I)</li>
                      <li>• Consider up to 48h in select cases</li>
                    </ul>
                  </div>

                  <div className="text-center px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm">
                    EVT if criteria met
                  </div>
                </div>
              </div>

              {/* Key Points - Updated for 2026 */}
              <div className="mt-6 grid md:grid-cols-3 gap-4">
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
}


// Acute ICH Management Component
function AcuteICHManagement() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-orange-400 dark:border-orange-600 bg-gradient-to-br from-orange-50 dark:from-orange-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-orange-100/50 dark:bg-orange-900/30">
            <CardTitle className="flex items-center justify-between text-orange-800 dark:text-orange-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Acute Intracerebral Hemorrhage (ICH) Management
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            
            {/* ICH Care Bundle Timeline */}
            <div className="p-4 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4">ICH Care Bundle - Time-Based Targets</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                  <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded">Door</span>
                  <div className="text-sm text-orange-700 dark:text-orange-400">
                    <p>• Stabilize patient, rapid imaging (CT)</p>
                    <p>• Coagulation tests (PT/INR, aPTT, platelets, fibrinogen)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white dark:bg-orange-950/30 rounded border-l-4 border-amber-500">
                  <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">&lt;30 min</span>
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    <p>• Reverse anticoagulant (if applicable)</p>
                    <p>• Start intensive BP lowering</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white dark:bg-orange-950/30 rounded border-l-4 border-yellow-500">
                  <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded">&lt;60 min</span>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">
                    <p>• Achieve SBP &lt;140 mmHg</p>
                    <p>• Consult Neurosurgery</p>
                    <p>• Achieve Temperature &lt;37.5°C</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white dark:bg-orange-950/30 rounded border-l-4 border-green-500">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">7 days</span>
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <p>• Maintain SBP &lt;140 mmHg; Temperature &lt;37.5°C</p>
                    <p>• Maintain normoglycemia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FASTEST Trial - ICH Hemostatic Therapy */}
            <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-lg border border-purple-300 dark:border-purple-700">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Emerging Trial Evidence – Hemostatic Therapy</span>
                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded font-bold">NEW</span>
              </h4>
              <div className="p-3 bg-white/60 dark:bg-purple-950/40 rounded border-l-4 border-purple-500">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-purple-700 dark:text-purple-400">FASTEST Trial</span>
                  <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded">Phase III</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  <strong>rFVIIa (recombinant Factor VIIa)</strong> for spontaneous ICH: promising early results in <strong>spot sign–positive patients</strong> treated within <strong>&lt;90 minutes</strong> of onset.
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 italic">
                  Clinical implication: Consider early CTA for spot sign identification to select patients who may benefit from hemostatic therapy.
                </p>
              </div>
            </div>

            {/* Initial Evaluation */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Initial Evaluation (ED)</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Brain Attack Activation</h5>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Single alpha page: stroke team, CT technician, Neuro ICU charge nurse</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">ABCs</h5>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Airway, Breathing, Circulation</li>
                    <li>• Peripheral IV placement</li>
                    <li>• Blood draw: Coag, CBC, CMP</li>
                    <li>• O₂ sat &gt;92%</li>
                    <li>• Continuous pulse oximetry and cardiac monitor</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/50 rounded">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Non-contrast head CT: Target door-to-CT time ≤20 minutes of ED arrival</p>
              </div>
            </div>

            {/* CT Evidence of ICH - Immediate Actions */}
            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3">CT Evidence of ICH - Immediate Actions</h4>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-2">
                <li>• <strong>BP Control:</strong> Labetalol 10 mg and/or Hydralazine 10 mg IV prn to keep SBP ≤140 mmHg</li>
                <li>• <strong>BP Infusion:</strong> Start Nicardipine infusion 5-15 mg/hr as needed</li>
                <li>• <strong>Coagulopathy:</strong> Emergent reversal (see anticoagulation reversal algorithm)</li>
                <li>• <strong>ICP Management:</strong> Mannitol 0.5-1 gm IV bolus or hypertonic saline for mass effect or herniation</li>
              </ul>
            </div>

            {/* Blood Pressure Management */}
            <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-700">
              <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-3">Blood Pressure Management (Class 1)</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-700">
                  <h5 className="font-medium text-rose-700 dark:text-rose-400 mb-2">Key Principles</h5>
                  <ul className="text-sm text-rose-600 dark:text-rose-400 space-y-1">
                    <li>• BP control is CRITICAL to reduce hematoma expansion</li>
                    <li>• Avoid BP variability - ensure careful titration</li>
                    <li>• Initiate BP lowering within 2 hours of ICH onset</li>
                    <li>• Goal: reach target BP in ≤1 hour</li>
                  </ul>
                </div>
                <div className="p-3 bg-white dark:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-700">
                  <h5 className="font-medium text-rose-700 dark:text-rose-400 mb-2">Targets</h5>
                  <ul className="text-sm text-rose-600 dark:text-rose-400 space-y-1">
                    <li>• Goal SBP &lt;140 mmHg (range 130-150 mmHg)</li>
                    <li>• AVOID SBP &lt;130 if initial SBP was ≥150 mmHg</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Anticoagulation Reversal Algorithm */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">Anticoagulation Reversal - Class 1 Recommendation</h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-4 font-medium">Discontinue anticoagulation therapy immediately. Rapid reversal should be performed as soon as possible.</p>
              
              <div className="grid md:grid-cols-4 gap-3">
                {/* VKA */}
                <div className="p-3 bg-white dark:bg-amber-950/30 rounded border border-amber-300 dark:border-amber-700">
                  <h5 className="font-bold text-amber-800 dark:text-amber-300 mb-2 text-sm">Vitamin K Antagonists (Warfarin)</h5>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded">
                      <p className="font-medium text-amber-700 dark:text-amber-400">INR 1.3-1.9:</p>
                      <p className="text-amber-600 dark:text-amber-500">4-F PCC 10-20 IU/kg (Class 2b)</p>
                    </div>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded">
                      <p className="font-medium text-amber-700 dark:text-amber-400">INR ≥2.0:</p>
                      <p className="text-amber-600 dark:text-amber-500">4-F PCC 25-50 IU/kg (Class 1)</p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded">
                      <p className="text-green-700 dark:text-green-400 font-medium">+ IV Vitamin K (Class 1)</p>
                    </div>
                  </div>
                </div>

                {/* Dabigatran */}
                <div className="p-3 bg-white dark:bg-amber-950/30 rounded border border-amber-300 dark:border-amber-700">
                  <h5 className="font-bold text-amber-800 dark:text-amber-300 mb-2 text-sm">Dabigatran</h5>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded">
                      <p className="text-amber-600 dark:text-amber-500">Activated charcoal if DOAC &lt;2 hrs (potential efficacy up to 8 hrs) - Class 2b</p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded">
                      <p className="font-medium text-green-700 dark:text-green-400">If Idarucizumab available:</p>
                      <p className="text-green-600 dark:text-green-500">Idarucizumab (Class 2a)</p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded">
                      <p className="font-medium text-orange-700 dark:text-orange-400">If NOT available:</p>
                      <p className="text-orange-600 dark:text-orange-500">PCCs or aPCC and/or renal replacement therapy (Class 2b)</p>
                    </div>
                  </div>
                </div>

                {/* Factor Xa Inhibitors */}
                <div className="p-3 bg-white dark:bg-amber-950/30 rounded border border-amber-300 dark:border-amber-700">
                  <h5 className="font-bold text-amber-800 dark:text-amber-300 mb-2 text-sm">Factor Xa Inhibitors</h5>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mb-2">(Rivaroxaban, Apixaban, Edoxaban)</p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded">
                      <p className="text-amber-600 dark:text-amber-500">History: When last dose taken</p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded">
                      <p className="font-medium text-green-700 dark:text-green-400">If Andexanet alfa available:</p>
                      <p className="text-green-600 dark:text-green-500">Andexanet alpha (Class 2a)</p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded">
                      <p className="font-medium text-orange-700 dark:text-orange-400">If NOT available:</p>
                      <p className="text-orange-600 dark:text-orange-500">4 Factor PCC or aPCC (Class 2b)</p>
                    </div>
                  </div>
                </div>

                {/* Heparins */}
                <div className="p-3 bg-white dark:bg-amber-950/30 rounded border border-amber-300 dark:border-amber-700">
                  <h5 className="font-bold text-amber-800 dark:text-amber-300 mb-2 text-sm">Heparins</h5>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded">
                      <p className="font-medium text-blue-700 dark:text-blue-400">Unfractionated Heparin:</p>
                      <p className="text-blue-600 dark:text-blue-500">Protamine (Class 2a)</p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded">
                      <p className="font-medium text-orange-700 dark:text-orange-400">Low Molecular Weight Heparin:</p>
                      <p className="text-orange-600 dark:text-orange-500">Protamine (Class 2b)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/50 rounded text-xs text-amber-700 dark:text-amber-400">
                <strong>DOACs:</strong> Thorough medication history is key. Assess dose and timing of last DOAC dose; may consider activated charcoal if ingested ≤2 hours
              </div>
            </div>

            {/* Anticoagulation Reversal Dose Calculators */}
            <ICHAnticoagReversalCalculators />

            {/* Antiplatelet Reversal */}
            <div className="p-4 bg-pink-50 dark:bg-pink-900/30 rounded-lg border border-pink-200 dark:border-pink-700">
              <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-3">Antiplatelet Reversal</h4>
              <p className="text-sm text-pink-700 dark:text-pink-400 mb-3">Discontinue antiplatelet therapy</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-pink-950/30 rounded border border-pink-200 dark:border-pink-700">
                  <h5 className="font-medium text-pink-700 dark:text-pink-400 mb-2">Aspirin / Desmopressin</h5>
                  <p className="text-sm text-pink-600 dark:text-pink-400">Is patient proceeding to emergent neurosurgical intervention?</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded flex-1">
                      <p className="font-medium text-green-700 dark:text-green-400">Yes:</p>
                      <p className="text-green-600 dark:text-green-500">Platelet transfusion & desmopressin if hemorrhage expansion or post-operative potential harm</p>
                    </div>
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/40 rounded flex-1">
                      <p className="font-medium text-pink-700 dark:text-pink-400">No:</p>
                      <p className="text-pink-600 dark:text-pink-500">Uncertain (avoid routine platelet transfusion)</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-pink-950/30 rounded border border-pink-200 dark:border-pink-700">
                  <h5 className="font-medium text-pink-700 dark:text-pink-400 mb-2">P2Y12 Inhibitors</h5>
                  <p className="text-sm text-pink-600 dark:text-pink-400">Efficacy of hemostatic agents remain uncertain</p>
                  <p className="text-xs text-pink-500 dark:text-pink-500 mt-2">Critical Point: REVERSE trial: P2Y12 + platelet transfusion harmful (avoid routine platelet transfusion)</p>
                </div>
              </div>
            </div>

            {/* Glucose & Temperature Control */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg border border-cyan-200 dark:border-cyan-700">
                <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3">Glucose Control</h4>
                <ul className="text-sm text-cyan-700 dark:text-cyan-400 space-y-1">
                  <li>• Avoid hypoglycemia (BG &lt;60 mg/dL)</li>
                  <li>• Avoid hyperglycemia (&gt;180 mg/dL)</li>
                  <li>• Target: 80-180 mg/dL remains unclear</li>
                </ul>
              </div>
              <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-700">
                <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-3">Temperature Control (Thermoregulation)</h4>
                <ul className="text-sm text-teal-700 dark:text-teal-400 space-y-1">
                  <li>• Maintain normothermia (&lt;37.5°C)</li>
                  <li>• Consider acetaminophen if medications are needed</li>
                  <li>• Utility of hypothermia remains unclear</li>
                </ul>
              </div>
            </div>

            {/* Risk Stratification for Macrovascular Cause */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">Risk Stratification for Macrovascular Cause (Spontaneous ICH)</h4>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">After history and non-contrast head CT, assess risk of macrovascular cause</p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded border border-green-300 dark:border-green-700">
                  <h5 className="font-bold text-green-800 dark:text-green-300 mb-2">Low Risk (1-5%) - ALL OF:</h5>
                  <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                    <li>• Older age (&gt;50 yrs)</li>
                    <li>• History of hypertension</li>
                    <li>• Deep location</li>
                    <li>• CT signs of small vessel disease</li>
                  </ul>
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded">
                    <p className="text-xs font-medium text-red-700 dark:text-red-400">→ No urgent indication for further imaging</p>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded border border-yellow-300 dark:border-yellow-700">
                  <h5 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">Intermediate Risk (6-25%)</h5>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">Combination of low risk and high risk features</p>
                  <div className="mt-2 p-2 bg-yellow-200 dark:bg-yellow-900/60 rounded">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">→ Acute CTA recommended</p>
                  </div>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded border border-red-300 dark:border-red-700">
                  <h5 className="font-bold text-red-800 dark:text-red-300 mb-2">High Risk (&gt;25%)</h5>
                  <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                    <li>• Younger age (&lt;50 yrs)</li>
                    <li>• No history of hypertension</li>
                    <li>• Lobar location</li>
                    <li>• No CT signs of small vessel disease</li>
                    <li>• Primary intraventricular hemorrhage</li>
                  </ul>
                  <div className="mt-2 p-2 bg-red-200 dark:bg-red-900/60 rounded">
                    <p className="text-xs font-medium text-red-800 dark:text-red-300">→ Acute CTA recommended</p>
                  </div>
                </div>
              </div>

              {/* CTA Results Pathway */}
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded">
                <h5 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">After CTA (for Intermediate/High Risk)</h5>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="text-sm">
                    <p className="font-medium text-indigo-700 dark:text-indigo-400">CTA Positive → High yield of intra-arterial DSA (&gt;50%)</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-indigo-700 dark:text-indigo-400">CTA Negative:</p>
                    <ul className="text-xs text-indigo-600 dark:text-indigo-500 mt-1">
                      <li>• Evidence of SVD + Hx HTN → Low yield DSA (&lt;2%)</li>
                      <li>• Evidence of SVD + No Hx HTN → Intermediate yield DSA (2-50%)</li>
                      <li>• No evidence of SVD → Intermediate yield DSA (2-50%)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Surgical Indications */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">Surgical Indications</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded">
                  <h5 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Consider Neurosurgery Consult for:</h5>
                  <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                    <li>• Ventriculostomy for severe IVH ± hydrocephalus</li>
                    <li>• Craniotomy for large cerebellar or temporal ICH</li>
                    <li>• EVD placement</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded">
                  <h5 className="font-medium text-purple-700 dark:text-purple-400 mb-2">No Surgical Indications:</h5>
                  <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                    <li>• Admit to Neuro ICU</li>
                    <li>• ICH order set</li>
                    <li>• Medical management</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ICU Care */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-800 dark:text-slate-300 mb-3">ICU Management</h4>
              <div className="grid md:grid-cols-4 gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">Mechanical ventilation</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">Sedation</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">Further BP control</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">Fever control</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">Glycemic control</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">ICP monitoring</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">Fluid resuscitation</p>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">Nutrition</p>
                </div>
              </div>
            </div>

            {/* VTE Prophylaxis & Seizures */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-violet-50 dark:bg-violet-900/30 rounded-lg border border-violet-200 dark:border-violet-700">
                <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">VTE Prophylaxis</h4>
                <ul className="text-sm text-violet-700 dark:text-violet-400 space-y-1">
                  <li>• Initiate pneumatic compression on date of ICH diagnosis</li>
                  <li>• Not a candidate for anticoagulation? Consider retrievable IVC filter</li>
                  <li>• Delaying therapeutic anticoagulation for 1-2 weeks after ICH onset may be considered</li>
                </ul>
                <div className="mt-3 p-2 bg-violet-100 dark:bg-violet-900/40 rounded text-xs">
                  <p className="text-violet-600 dark:text-violet-400"><strong>What if ICH patient develops acute VTE?</strong> Temporary use of retrievable IVC filter + AC can be started</p>
                </div>
              </div>
              <div className="p-4 bg-fuchsia-50 dark:bg-fuchsia-900/30 rounded-lg border border-fuchsia-200 dark:border-fuchsia-700">
                <h4 className="font-semibold text-fuchsia-800 dark:text-fuchsia-300 mb-3">Seizure Management</h4>
                <ul className="text-sm text-fuchsia-700 dark:text-fuchsia-400 space-y-1">
                  <li><strong>Confirmed seizures:</strong> AED recommended to reduce morbidity</li>
                  <li><strong>Suspicion of seizures:</strong> cEEG (1-24 hours) reasonable to diagnose electrographic seizures or epileptiform discharges</li>
                  <li><strong>NO evidence of seizure prophylaxis:</strong> Prophylactic AED is NOT beneficial and not recommended</li>
                </ul>
              </div>
            </div>

            {/* ICH with Atrial Fibrillation - Anticoagulation Decision */}
            <div className="p-4 bg-sky-50 dark:bg-sky-900/30 rounded-lg border border-sky-200 dark:border-sky-700">
              <h4 className="font-semibold text-sky-800 dark:text-sky-300 mb-3">ICH with Atrial Fibrillation - Anticoagulation Resumption</h4>
              <p className="text-sm text-sky-600 dark:text-sky-400 mb-4">
                1. Intensive risk factor management (BP control, alcohol use, concomitant antithrombotic medication)<br/>
                2. Assess cause of ICH (MRI and at least non-invasive angiography) and risk of recurrent ICH
              </p>
              
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded border border-green-300 dark:border-green-700">
                  <h5 className="font-bold text-green-800 dark:text-green-300 mb-2 text-sm">Low Recurrence Risk</h5>
                  <p className="text-xs text-green-700 dark:text-green-400 mb-2">Cryptogenic ICH, arteriolosclerosis without lobar microbleeds</p>
                  <div className="p-2 bg-green-200 dark:bg-green-900/60 rounded">
                    <p className="text-xs font-medium text-green-800 dark:text-green-300">→ Reinitiate anticoagulation in the post-acute phase</p>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded border border-yellow-300 dark:border-yellow-700">
                  <h5 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2 text-sm">Moderate Recurrence Risk</h5>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">CAA without cortical superficial siderosis, mixed SVD phenotype with high number of lobar microbleeds</p>
                  <div className="p-2 bg-yellow-200 dark:bg-yellow-900/60 rounded">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">→ Individual risk/benefit assessment considering: severity of cSVD, thromboembolic risk, risk factor management. Options: no AC, LAAO, or AC</p>
                  </div>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded border border-red-300 dark:border-red-700">
                  <h5 className="font-bold text-red-800 dark:text-red-300 mb-2 text-sm">High Recurrence Risk</h5>
                  <p className="text-xs text-red-700 dark:text-red-400 mb-2">CAA with disseminated cortical superficial siderosis, recurrent ICH</p>
                  <div className="p-2 bg-red-200 dark:bg-red-900/60 rounded">
                    <p className="text-xs font-medium text-red-800 dark:text-red-300">→ Do NOT initiate AC outside RCT. Evaluate left atrial appendage occlusion (LAAO) considering procedural risk, general health, frailty, comorbidities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rehabilitation */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">Rehabilitation</h4>
              <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                <li>• Early mobilization when medically stable</li>
                <li>• Physical therapy</li>
                <li>• Occupational therapy</li>
                <li>• Speech therapy as needed</li>
              </ul>
            </div>

            {/* References */}
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-700 rounded-lg">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                <strong>References:</strong> AHA/ASA 2022 Guideline for Management of Intracerebral Hemorrhage | Parry-Jones A, et al. European Stroke Journal 2023 (ICH Care Bundles Consensus Statement) | Greenberg SM, et al. Lancet Neurol 2022 (Boston Criteria v2.0)
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ISPS25 Flowchart Component
function ISPS25Flowchart() {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-medical-header/30 bg-gradient-to-br from-medical-section to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-medical-header/10">
            <CardTitle className="flex items-center justify-between text-medical-header">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                ISPS25 - Ischemic Stroke Phenotyping System 2025
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Main Flow */}
              <div className="flex flex-col items-center space-y-4">
                {/* Ischemic Stroke Box */}
                <div className="bg-medical-header text-white px-6 py-3 rounded-lg font-semibold shadow-lg">
                  Ischemic Stroke
                </div>
                <ArrowRight className="h-6 w-6 rotate-90 text-medical-header" />
                
                {/* First Pass Workup */}
                <div className="w-full max-w-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Minimum First Pass Workup</h3>
                  <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400">
                    <li>• Comprehensive history and exam</li>
                    <li>• Brain imaging</li>
                    <li>• TTE, ECG</li>
                    <li>• Cervical and intracranial vessel imaging (aortic arch to vertex)</li>
                    <li>• 24h continuous telemetry</li>
                    <li>• Laboratory tests, toxicology</li>
                    <li>• Age-appropriate cancer screening</li>
                  </ul>
                </div>
                
                <ArrowRight className="h-6 w-6 rotate-90 text-medical-header" />
                
                {/* Phenotype Outcomes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
                  <div className="bg-sky-100 dark:bg-sky-900/30 border border-sky-300 dark:border-sky-700 rounded-lg p-3 text-center">
                    <span className="text-sm font-medium text-sky-800 dark:text-sky-300">Small Vessel Disease*</span>
                  </div>
                  <div className="bg-sky-100 dark:bg-sky-900/30 border border-sky-300 dark:border-sky-700 rounded-lg p-3 text-center">
                    <span className="text-sm font-medium text-sky-800 dark:text-sky-300">Cardioembolism*</span>
                  </div>
                  <div className="bg-sky-100 dark:bg-sky-900/30 border border-sky-300 dark:border-sky-700 rounded-lg p-3 text-center">
                    <span className="text-sm font-medium text-sky-800 dark:text-sky-300">Large Artery Atherosclerosis*</span>
                  </div>
                  <div className="bg-sky-100 dark:bg-sky-900/30 border border-sky-300 dark:border-sky-700 rounded-lg p-3 text-center">
                    <span className="text-sm font-medium text-sky-800 dark:text-sky-300">Other Determined Cause*</span>
                  </div>
                </div>
                
                <div className="text-center text-muted-foreground text-sm">OR</div>
                
                {/* Undetermined Cause Path */}
                <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg px-6 py-3">
                  <span className="font-semibold text-amber-800 dark:text-amber-300">Undetermined Cause</span>
                </div>
                
                <ArrowRight className="h-6 w-6 rotate-90 text-amber-600" />
                
                {/* Second Pass Workup */}
                <div className="w-full max-w-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Minimum Second Pass Workup</h3>
                  <ul className="text-sm space-y-1 text-amber-700 dark:text-amber-400">
                    <li>• APLS testing if age &lt;60 years, recurrent ESUS, suspected SLE, unexplained PTT elevation</li>
                    <li>• TEE if age &lt;60 years</li>
                    <li>• Prolonged cardiac monitoring if age ≥40 years</li>
                    <li>• Genetic testing/counseling in select patients</li>
                    <li>• MRI/MRA with T1 fat saturation if concern for dissection</li>
                    <li>• CT chest/abdomen/pelvis if D-dimer ≥2.5mg/dL, 3-territory sign, "B symptoms", or recurrent ESUS</li>
                  </ul>
                </div>
                
                <div className="flex items-center gap-4">
                  <ArrowRight className="h-6 w-6 rotate-90 text-amber-600" />
                  <span className="text-sm text-muted-foreground">Negative workup</span>
                </div>
                
                {/* ESUS 2.0 */}
                <div className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold shadow-lg">
                  ESUS 2.0
                </div>
              </div>
              
              {/* Cardioembolism Subtypes */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Cardioembolism Subtypes</h4>
                  <ul className="text-sm space-y-1 text-purple-700 dark:text-purple-400">
                    <li>• "PFO-associated" if PFO+ and PASCAL definite/probable/possible</li>
                    <li>• "AF-associated" if AF detected within 12 months of prolonged monitoring</li>
                    <li>• Cardiac myxoma or fibroelastoma-related</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Other Determined Causes</h4>
                  <ul className="text-sm space-y-1 text-green-700 dark:text-green-400">
                    <li>• Occult malignancy identified</li>
                    <li>• New diagnosis of APLS</li>
                    <li>• Cervical artery dissection on MRI/MRA</li>
                    <li>• Evidence of genetic disorder</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Reference: Yaghi S, et al. <em>Stroke</em> (2025). ISPS25 Proposal.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// NIHSS Scale Reference Component
function NIHSSScaleReference() {
  const [isOpen, setIsOpen] = useState(false);
  
  const nihssItems = [
    { item: "1a", name: "Level of Consciousness", scores: "0 = Alert; 1 = Drowsy; 2 = Obtunded; 3 = Coma/Unresponsive" },
    { item: "1b", name: "LOC Questions (month, age)", scores: "0 = Both correct; 1 = One correct; 2 = Neither correct" },
    { item: "1c", name: "LOC Commands (open/close eyes, grip)", scores: "0 = Both correct; 1 = One correct; 2 = Neither correct" },
    { item: "2", name: "Best Gaze (horizontal eye movement)", scores: "0 = Normal; 1 = Partial gaze palsy; 2 = Forced deviation" },
    { item: "3", name: "Visual Fields", scores: "0 = No loss; 1 = Partial hemianopia; 2 = Complete hemianopia; 3 = Bilateral blindness" },
    { item: "4", name: "Facial Palsy", scores: "0 = Normal; 1 = Minor paralysis; 2 = Partial paralysis; 3 = Complete paralysis" },
    { item: "5a", name: "Left Arm Motor", scores: "0 = No drift; 1 = Drift before 10s; 2 = Falls before 10s; 3 = No effort against gravity; 4 = No movement" },
    { item: "5b", name: "Right Arm Motor", scores: "0 = No drift; 1 = Drift before 10s; 2 = Falls before 10s; 3 = No effort against gravity; 4 = No movement" },
    { item: "6a", name: "Left Leg Motor", scores: "0 = No drift; 1 = Drift before 5s; 2 = Falls before 5s; 3 = No effort against gravity; 4 = No movement" },
    { item: "6b", name: "Right Leg Motor", scores: "0 = No drift; 1 = Drift before 5s; 2 = Falls before 5s; 3 = No effort against gravity; 4 = No movement" },
    { item: "7", name: "Limb Ataxia", scores: "0 = Absent; 1 = One limb; 2 = Two or more limbs" },
    { item: "8", name: "Sensory", scores: "0 = Normal; 1 = Mild-moderate loss; 2 = Severe/total loss" },
    { item: "9", name: "Best Language (Aphasia)", scores: "0 = Normal; 1 = Mild-moderate aphasia; 2 = Severe aphasia; 3 = Mute/global aphasia" },
    { item: "10", name: "Dysarthria", scores: "0 = Normal; 1 = Mild-moderate; 2 = Severe/unintelligible" },
    { item: "11", name: "Extinction/Inattention", scores: "0 = Normal; 1 = One modality; 2 = Profound (two modalities)" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-rose-300 dark:border-rose-700 bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-rose-100/50 dark:bg-rose-900/30">
            <CardTitle className="flex items-center justify-between text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                NIHSS - National Institutes of Health Stroke Scale (0-42)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Severity Interpretation */}
            <div className="mb-6 p-4 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
              <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-3">Stroke Severity Interpretation</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-800 dark:text-green-300">0-4</div>
                  <div className="text-sm text-green-700 dark:text-green-400">Minor Stroke</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">5-15</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">Moderate Stroke</div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-orange-800 dark:text-orange-300">16-20</div>
                  <div className="text-sm text-orange-700 dark:text-orange-400">Moderate-Severe</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-800 dark:text-red-300">21-42</div>
                  <div className="text-sm text-red-700 dark:text-red-400">Severe Stroke</div>
                </div>
              </div>
            </div>

            {/* Scale Items */}
            <div className="space-y-2">
              <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-3">Scale Components</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rose-200 dark:border-rose-700">
                      <th className="text-left py-2 px-3 text-rose-800 dark:text-rose-300 font-semibold w-16">Item</th>
                      <th className="text-left py-2 px-3 text-rose-800 dark:text-rose-300 font-semibold w-48">Domain</th>
                      <th className="text-left py-2 px-3 text-rose-800 dark:text-rose-300 font-semibold">Scoring</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nihssItems.map((item, index) => (
                      <tr key={item.item} className={`border-b border-rose-100 dark:border-rose-800 ${index % 2 === 0 ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}>
                        <td className="py-2 px-3 font-medium text-rose-700 dark:text-rose-400">{item.item}</td>
                        <td className="py-2 px-3 text-rose-700 dark:text-rose-400">{item.name}</td>
                        <td className="py-2 px-3 text-rose-600 dark:text-rose-500 text-xs">{item.scores}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 rounded-lg">
              <p className="text-xs text-rose-600 dark:text-rose-400">
                <strong>Clinical Notes:</strong> NIHSS should be performed at baseline, 24h post-treatment, at discharge, and during follow-up. 
                A change of ≥4 points is considered clinically significant. UN = Untestable (e.g., amputation, fusion) - do not add to score.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Visual NIHSS Calculator Component
function VisualNIHSSCalculator() {
  const [isOpen, setIsOpen] = useState(true);
  const [showPrintSheet, setShowPrintSheet] = useState(false);
  const [scores, setScores] = useState<Record<string, number | "UN">>({
    "1a": 0, "1b": 0, "1c": 0, "2": 0, "3": 0, "4": 0,
    "5a": 0, "5b": 0, "6a": 0, "6b": 0, "7": 0, "8": 0,
    "9": 0, "10": 0, "11": 0
  });
  const [untestableReasons, setUntestableReasons] = useState<Record<string, string>>({
    "5a": "", "5b": "", "6a": "", "6b": "", "7": "", "10": ""
  });

  // Items that can be marked as untestable
  const untestableItems = ["5a", "5b", "6a", "6b", "7", "10"];

  const nihssItems = [
    {
      item: "1a",
      name: "Level of Consciousness",
      icon: "🧠",
      options: [
        { score: 0, label: "Alert", desc: "Keenly responsive" },
        { score: 1, label: "Drowsy", desc: "Arousable by minor stimulation" },
        { score: 2, label: "Obtunded", desc: "Requires repeated stimulation" },
        { score: 3, label: "Coma", desc: "Unresponsive or reflex responses only" }
      ]
    },
    {
      item: "1b",
      name: "LOC Questions",
      icon: "❓",
      hint: "Ask month and age",
      options: [
        { score: 0, label: "Both correct", desc: "Answers both correctly" },
        { score: 1, label: "One correct", desc: "Answers one correctly" },
        { score: 2, label: "Neither", desc: "Both incorrect or unable" }
      ]
    },
    {
      item: "1c",
      name: "LOC Commands",
      icon: "✋",
      hint: "Open/close eyes, grip and release",
      options: [
        { score: 0, label: "Both correct", desc: "Performs both tasks" },
        { score: 1, label: "One correct", desc: "Performs one task" },
        { score: 2, label: "Neither", desc: "Neither task performed" }
      ]
    },
    {
      item: "2",
      name: "Best Gaze",
      icon: "👀",
      hint: "Horizontal eye movements only",
      options: [
        { score: 0, label: "Normal", desc: "Full horizontal movements" },
        { score: 1, label: "Partial palsy", desc: "Abnormal gaze, can overcome" },
        { score: 2, label: "Forced deviation", desc: "Fixed deviation or total paresis" }
      ]
    },
    {
      item: "3",
      name: "Visual Fields",
      icon: "📐",
      hint: "Test all 4 quadrants",
      options: [
        { score: 0, label: "No loss", desc: "No visual field loss" },
        { score: 1, label: "Partial", desc: "Partial hemianopia" },
        { score: 2, label: "Complete", desc: "Complete hemianopia" },
        { score: 3, label: "Bilateral", desc: "Bilateral blindness including cortical" }
      ]
    },
    {
      item: "4",
      name: "Facial Palsy",
      icon: "😐",
      hint: "Show teeth, raise eyebrows, close eyes",
      options: [
        { score: 0, label: "Normal", desc: "Symmetric movements" },
        { score: 1, label: "Minor", desc: "Flattened nasolabial fold" },
        { score: 2, label: "Partial", desc: "Near-total lower face paralysis" },
        { score: 3, label: "Complete", desc: "Complete unilateral palsy" }
      ]
    },
    {
      item: "5a",
      name: "Left Arm Motor",
      icon: "💪",
      hint: "Extend arm 90° (sitting) or 45° (supine) for 10 sec",
      canBeUntestable: true,
      untestableReason: "Amputation or joint fusion (shoulder)",
      options: [
        { score: 0, label: "No drift", desc: "Holds for full 10 seconds" },
        { score: 1, label: "Drift", desc: "Drifts before 10 seconds" },
        { score: 2, label: "Some effort", desc: "Falls before 10 seconds" },
        { score: 3, label: "No gravity", desc: "No effort against gravity" },
        { score: 4, label: "No movement", desc: "No movement at all" }
      ]
    },
    {
      item: "5b",
      name: "Right Arm Motor",
      icon: "💪",
      hint: "Extend arm 90° (sitting) or 45° (supine) for 10 sec",
      canBeUntestable: true,
      untestableReason: "Amputation or joint fusion (shoulder)",
      options: [
        { score: 0, label: "No drift", desc: "Holds for full 10 seconds" },
        { score: 1, label: "Drift", desc: "Drifts before 10 seconds" },
        { score: 2, label: "Some effort", desc: "Falls before 10 seconds" },
        { score: 3, label: "No gravity", desc: "No effort against gravity" },
        { score: 4, label: "No movement", desc: "No movement at all" }
      ]
    },
    {
      item: "6a",
      name: "Left Leg Motor",
      icon: "🦵",
      hint: "Raise leg 30° supine for 5 seconds",
      canBeUntestable: true,
      untestableReason: "Amputation or joint fusion (hip)",
      options: [
        { score: 0, label: "No drift", desc: "Holds for full 5 seconds" },
        { score: 1, label: "Drift", desc: "Drifts before 5 seconds" },
        { score: 2, label: "Some effort", desc: "Falls before 5 seconds" },
        { score: 3, label: "No gravity", desc: "No effort against gravity" },
        { score: 4, label: "No movement", desc: "No movement at all" }
      ]
    },
    {
      item: "6b",
      name: "Right Leg Motor",
      icon: "🦵",
      hint: "Raise leg 30° supine for 5 seconds",
      canBeUntestable: true,
      untestableReason: "Amputation or joint fusion (hip)",
      options: [
        { score: 0, label: "No drift", desc: "Holds for full 5 seconds" },
        { score: 1, label: "Drift", desc: "Drifts before 5 seconds" },
        { score: 2, label: "Some effort", desc: "Falls before 5 seconds" },
        { score: 3, label: "No gravity", desc: "No effort against gravity" },
        { score: 4, label: "No movement", desc: "No movement at all" }
      ]
    },
    {
      item: "7",
      name: "Limb Ataxia",
      icon: "🎯",
      hint: "Finger-to-nose and heel-to-shin",
      canBeUntestable: true,
      untestableReason: "Amputation or joint fusion ONLY (if paralyzed → score 0)",
      options: [
        { score: 0, label: "Absent", desc: "No ataxia" },
        { score: 1, label: "One limb", desc: "Present in 1 limb" },
        { score: 2, label: "Two+ limbs", desc: "Present in 2 or more limbs" }
      ]
    },
    {
      item: "8",
      name: "Sensory",
      icon: "🖐️",
      hint: "Pinprick on face, arm, trunk, leg",
      neverUntestable: true,
      options: [
        { score: 0, label: "Normal", desc: "No sensory loss" },
        { score: 1, label: "Mild-mod", desc: "Mild-moderate loss, patient aware" },
        { score: 2, label: "Severe", desc: "Severe or total sensory loss" }
      ]
    },
    {
      item: "9",
      name: "Best Language",
      icon: "💬",
      hint: "Describe picture, name items, read sentences",
      options: [
        { score: 0, label: "Normal", desc: "No aphasia" },
        { score: 1, label: "Mild-mod", desc: "Some loss, can follow conversation" },
        { score: 2, label: "Severe", desc: "Fragmented expression, need inference" },
        { score: 3, label: "Mute/Global", desc: "Mute or global aphasia" }
      ]
    },
    {
      item: "10",
      name: "Dysarthria",
      icon: "🗣️",
      hint: "Evaluate speech clarity",
      canBeUntestable: true,
      untestableReason: "Intubated or physical barrier to speech",
      options: [
        { score: 0, label: "Normal", desc: "Normal articulation" },
        { score: 1, label: "Mild-mod", desc: "Slurred but understandable" },
        { score: 2, label: "Severe", desc: "Unintelligible or mute" }
      ]
    },
    {
      item: "11",
      name: "Extinction/Inattention",
      icon: "🔍",
      hint: "Double simultaneous stimulation",
      neverUntestable: true,
      options: [
        { score: 0, label: "Normal", desc: "No abnormality" },
        { score: 1, label: "One modality", desc: "Extinction to one modality" },
        { score: 2, label: "Profound", desc: "Profound hemi-inattention" }
      ]
    }
  ];

  // Calculate total score (excluding UN items)
  const totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
    if (score === "UN") return sum;
    return sum + score;
  }, 0);

  // Count untestable items
  const untestableCount = Object.values(scores).filter(s => s === "UN").length;

  const getSeverityInfo = (score: number) => {
    if (score <= 4) return { label: "Minor Stroke", color: "bg-green-500", textColor: "text-green-800 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" };
    if (score <= 15) return { label: "Moderate Stroke", color: "bg-yellow-500", textColor: "text-yellow-800 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" };
    if (score <= 20) return { label: "Moderate-Severe", color: "bg-orange-500", textColor: "text-orange-800 dark:text-orange-300", bgColor: "bg-orange-100 dark:bg-orange-900/40" };
    return { label: "Severe Stroke", color: "bg-red-500", textColor: "text-red-800 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40" };
  };

  const severity = getSeverityInfo(totalScore);

  const resetScores = () => {
    setScores({
      "1a": 0, "1b": 0, "1c": 0, "2": 0, "3": 0, "4": 0,
      "5a": 0, "5b": 0, "6a": 0, "6b": 0, "7": 0, "8": 0,
      "9": 0, "10": 0, "11": 0
    });
    setUntestableReasons({
      "5a": "", "5b": "", "6a": "", "6b": "", "7": "", "10": ""
    });
  };

  const handleSetUntestable = (itemId: string) => {
    setScores({ ...scores, [itemId]: "UN" });
  };

  const handleClearUntestable = (itemId: string) => {
    setScores({ ...scores, [itemId]: 0 });
    setUntestableReasons({ ...untestableReasons, [itemId]: "" });
  };

  const handlePrint = () => {
    setShowPrintSheet(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-indigo-400 dark:border-indigo-600 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-indigo-100/50 dark:bg-indigo-900/30">
            <CardTitle className="flex items-center justify-between text-indigo-800 dark:text-indigo-300">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Visual NIHSS Calculator
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${severity.color} text-white font-bold px-3 py-1`}>
                  Score: {totalScore}/42{untestableCount > 0 && ` (${untestableCount} UN)`}
                </Badge>
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Score Display and Severity */}
            <div className={`p-4 rounded-lg ${severity.bgColor} border`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className={`text-4xl font-bold ${severity.textColor}`}>
                    {totalScore}
                    {untestableCount > 0 && (
                      <span className="text-lg ml-2 text-amber-600 dark:text-amber-400">
                        ({untestableCount} UN)
                      </span>
                    )}
                  </div>
                  <div className={`text-lg font-semibold ${severity.textColor}`}>{severity.label}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="text-center px-3 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg border border-green-300 dark:border-green-700">
                    <div className="text-xs text-green-700 dark:text-green-400">Minor</div>
                    <div className="font-bold text-green-800 dark:text-green-300">0-4</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <div className="text-xs text-yellow-700 dark:text-yellow-400">Moderate</div>
                    <div className="font-bold text-yellow-800 dark:text-yellow-300">5-15</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg border border-orange-300 dark:border-orange-700">
                    <div className="text-xs text-orange-700 dark:text-orange-400">Mod-Severe</div>
                    <div className="font-bold text-orange-800 dark:text-orange-300">16-20</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-300 dark:border-red-700">
                    <div className="text-xs text-red-700 dark:text-red-400">Severe</div>
                    <div className="font-bold text-red-800 dark:text-red-300">21-42</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrint(); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                    Print Sheet
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); resetScores(); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>

            {/* NIHSS Items Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nihssItems.map((item) => {
                const isUntestable = scores[item.item] === "UN";
                const canBeUntestable = (item as any).canBeUntestable;
                const neverUntestable = (item as any).neverUntestable;
                
                return (
                  <div
                    key={item.item}
                    className={`p-4 rounded-lg border ${
                      isUntestable 
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700' 
                        : 'bg-white dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {nihssIconMap[item.item] ? (
                          React.createElement(nihssIconMap[item.item], { size: 48, className: "drop-shadow-md" })
                        ) : (
                          <span className="text-2xl">{item.icon}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">
                          {item.item}. {item.name}
                        </div>
                        {item.hint && (
                          <div className="text-xs text-indigo-500 dark:text-indigo-400">{item.hint}</div>
                        )}
                        {neverUntestable && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">⚠️ Never untestable</div>
                        )}
                      </div>
                      <div className="ml-auto">
                        <Badge 
                          variant="outline" 
                          className={isUntestable 
                            ? "border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50" 
                            : "border-indigo-400 text-indigo-700 dark:text-indigo-300"
                          }
                        >
                          {isUntestable ? "UN" : scores[item.item]}
                        </Badge>
                      </div>
                    </div>

                    {isUntestable ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded text-xs text-amber-800 dark:text-amber-300">
                          <strong>Marked as Untestable</strong>
                          <p className="text-amber-700 dark:text-amber-400 mt-1">
                            Reason: {(item as any).untestableReason}
                          </p>
                        </div>
                        <textarea
                          placeholder="Document specific reason (required)..."
                          value={untestableReasons[item.item] || ""}
                          onChange={(e) => setUntestableReasons({ ...untestableReasons, [item.item]: e.target.value })}
                          className="w-full p-2 text-xs border border-amber-300 dark:border-amber-700 rounded bg-white dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 placeholder:text-amber-500"
                          rows={2}
                        />
                        <button
                          onClick={() => handleClearUntestable(item.item)}
                          className="w-full px-3 py-1.5 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors"
                        >
                          Clear UN & Score Normally
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-1">
                          {item.options.map((option) => (
                            <button
                              key={option.score}
                              onClick={() => setScores({ ...scores, [item.item]: option.score })}
                              className={`w-full text-left px-3 py-2 rounded text-xs transition-all ${
                                scores[item.item] === option.score
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                              }`}
                            >
                              <span className="font-bold mr-1">{option.score}:</span>
                              <span className="font-medium">{option.label}</span>
                              <span className="text-xs opacity-75 ml-1">- {option.desc}</span>
                            </button>
                          ))}
                        </div>
                        {canBeUntestable && (
                          <button
                            onClick={() => handleSetUntestable(item.item)}
                            className="w-full mt-2 px-3 py-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex items-center justify-center gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Mark as UN (Untestable)
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Untestable Items Summary */}
            {untestableCount > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-lg">
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Untestable Items Documentation ({untestableCount} items)
                </h4>
                <div className="space-y-2">
                  {Object.entries(scores).filter(([_, score]) => score === "UN").map(([itemId]) => {
                    const item = nihssItems.find(i => i.item === itemId);
                    return (
                      <div key={itemId} className="p-2 bg-white dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                        <div className="font-medium text-amber-800 dark:text-amber-300 text-xs">
                          {itemId}. {item?.name}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {untestableReasons[itemId] || (item as any)?.untestableReason || "No reason documented"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clinical Notes */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-700 rounded-lg">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                <strong>Clinical Notes:</strong> Perform NIHSS at baseline, 24h post-treatment, at discharge, and during follow-up. 
                A change of ≥4 points is clinically significant.
              </p>
            </div>

            {/* Untestable Items Caveat */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Handling "Untestable" Items (UN/X)</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    If a response is considered "untestable" due to physical limitations (e.g., amputation, fused joint, intubation), 
                    mark as <strong>"UN"</strong> or <strong>"X"</strong> and document a detailed explanation on the form.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                {/* Items that CAN be marked UN */}
                <div className="p-3 bg-white dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                  <h5 className="font-semibold text-amber-800 dark:text-amber-300 text-xs mb-2">Items That CAN Be Marked "UN":</h5>
                  <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                    <li>• <strong>Motor Arm (5a/5b):</strong> Amputation or joint fusion (shoulder)</li>
                    <li>• <strong>Motor Leg (6a/6b):</strong> Amputation or joint fusion (hip)</li>
                    <li>• <strong>Limb Ataxia (7):</strong> ONLY if amputation or joint fusion exists. If paralyzed or comatose → score 0, NOT "UN"</li>
                    <li>• <strong>Dysarthria (10):</strong> Intubated or physical barrier to producing speech</li>
                  </ul>
                </div>

                {/* Items that are NEVER untestable */}
                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
                  <h5 className="font-semibold text-red-800 dark:text-red-300 text-xs mb-2">Items NEVER Untestable:</h5>
                  <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                    <li>• <strong>Sensory (8):</strong> If comatose or severely obtunded → score 2</li>
                    <li>• <strong>Extinction/Inattention (11):</strong> NEVER untestable. Score 0 if cannot be tested, or based on other findings</li>
                  </ul>
                </div>
              </div>

              {/* Comatose Patients */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-800">
                <h5 className="font-semibold text-purple-800 dark:text-purple-300 text-xs mb-2">⚠️ Comatose Patients (LOC 1a = 3):</h5>
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  Most items receive the <strong>highest score (maximum deficit)</strong>. Exceptions: Sensory (8) = 2; Extinction (11) = scored 0 or based on findings.
                </p>
              </div>

              {/* Important Tip */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-xs mb-2">💡 Key Principle:</h5>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>"Score what you see"</strong> — not what you think the patient can do. "UN" means the item could NOT be evaluated, 
                  not that it is normal. If paralyzed, score 4 for motor deficit, NOT "untestable."
                </p>
              </div>
            </div>

            {/* Printable NIHSS Scoring Sheet */}
            {showPrintSheet && (
              <div className="print:block hidden">
                <style>{`
                  @media print {
                    body * { visibility: hidden; }
                    .nihss-print-sheet, .nihss-print-sheet * { visibility: visible; }
                    .nihss-print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
                  }
                `}</style>
                <div className="nihss-print-sheet bg-white p-8 text-black">
                  <div className="border-2 border-black p-6">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold">NIH STROKE SCALE SCORING SHEET</h1>
                      <p className="text-sm mt-2">National Institutes of Health Stroke Scale</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-4">
                      <div><strong>Patient Name:</strong> _________________________</div>
                      <div><strong>MRN:</strong> _________________________</div>
                      <div><strong>Date of Birth:</strong> _________________________</div>
                      <div><strong>Date/Time of Assessment:</strong> _________________________</div>
                      <div><strong>Examiner Name:</strong> _________________________</div>
                      <div><strong>Examiner Signature:</strong> _________________________</div>
                    </div>

                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black p-2 text-left w-16">Item</th>
                          <th className="border border-black p-2 text-left">Scale Definition</th>
                          <th className="border border-black p-2 w-20 text-center">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nihssItems.map((item) => {
                          const score = scores[item.item];
                          const isUN = score === "UN";
                          return (
                            <tr key={item.item}>
                              <td className="border border-black p-2 font-bold align-top">{item.item}</td>
                              <td className="border border-black p-2">
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-xs mt-1">
                                  {item.options.map(opt => (
                                    <span key={opt.score} className="mr-3">
                                      {opt.score}={opt.label}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="border border-black p-2 text-center text-lg font-bold">
                                {isUN ? "UN" : score}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-200">
                          <td colSpan={2} className="border border-black p-2 font-bold text-right">TOTAL SCORE:</td>
                          <td className="border border-black p-2 text-center text-xl font-bold">
                            {totalScore}{untestableCount > 0 && ` (${untestableCount} UN)`}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Untestable Documentation Section */}
                    <div className="mt-6 border-t-2 border-black pt-4">
                      <h3 className="font-bold text-lg mb-3">UNTESTABLE ITEMS DOCUMENTATION</h3>
                      <p className="text-xs mb-4 italic">
                        For each item marked "UN", document the specific reason below. Items marked UN are excluded from the total score.
                      </p>
                      
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-black p-2 w-24">Item</th>
                            <th className="border border-black p-2">Reason for Untestable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {["5a", "5b", "6a", "6b", "7", "10"].map((itemId) => {
                            const item = nihssItems.find(i => i.item === itemId);
                            const isUN = scores[itemId] === "UN";
                            return (
                              <tr key={itemId}>
                                <td className="border border-black p-2 text-center">
                                  <span className={isUN ? "font-bold" : ""}>{itemId}</span>
                                  {isUN && <span className="ml-1 text-xs">(UN)</span>}
                                </td>
                                <td className="border border-black p-2">
                                  {isUN ? (
                                    <span>{untestableReasons[itemId] || (item as any)?.untestableReason || "____________________"}</span>
                                  ) : (
                                    <span className="text-gray-400">N/A - Tested normally</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Scoring Guide */}
                    <div className="mt-6 grid grid-cols-4 gap-2 text-xs">
                      <div className="border p-2 text-center bg-green-100">
                        <div className="font-bold">0-4</div>
                        <div>Minor Stroke</div>
                      </div>
                      <div className="border p-2 text-center bg-yellow-100">
                        <div className="font-bold">5-15</div>
                        <div>Moderate Stroke</div>
                      </div>
                      <div className="border p-2 text-center bg-orange-100">
                        <div className="font-bold">16-20</div>
                        <div>Moderate-Severe</div>
                      </div>
                      <div className="border p-2 text-center bg-red-100">
                        <div className="font-bold">21-42</div>
                        <div>Severe Stroke</div>
                      </div>
                    </div>

                    {/* Key Rules Footer */}
                    <div className="mt-4 text-xs border-t pt-3">
                      <p><strong>Key Rules:</strong> "UN" = Untestable (not scored). Sensory (8) & Extinction (11) are NEVER untestable. 
                      Comatose patients (1a=3): give maximum scores; Sensory=2, Extinction=0. "Score what you see."</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Non-print Printable Sheet Preview Toggle */}
            <div className="print:hidden">
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center justify-between cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                      Preview Printable NIHSS Scoring Sheet
                    </span>
                    <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-inner overflow-auto max-h-[600px]">
                    <div className="min-w-[600px] text-sm text-gray-800 dark:text-gray-200">
                      <div className="text-center mb-4 pb-3 border-b">
                        <h3 className="text-lg font-bold">NIH STROKE SCALE SCORING SHEET</h3>
                        <p className="text-xs text-gray-500">Print Preview</p>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                              <th className="border p-2 text-left">Item</th>
                              <th className="border p-2 text-left">Assessment</th>
                              <th className="border p-2 text-center w-16">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nihssItems.map((item) => {
                              const score = scores[item.item];
                              const isUN = score === "UN";
                              return (
                                <tr key={item.item} className={isUN ? "bg-amber-50 dark:bg-amber-950/30" : ""}>
                                  <td className="border p-2 font-semibold">{item.item}</td>
                                  <td className="border p-2">{item.name}</td>
                                  <td className={`border p-2 text-center font-bold ${isUN ? "text-amber-600" : ""}`}>
                                    {isUN ? "UN" : score}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-indigo-100 dark:bg-indigo-900/30 font-bold">
                              <td colSpan={2} className="border p-2 text-right">TOTAL:</td>
                              <td className="border p-2 text-center text-lg">{totalScore}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {untestableCount > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-700">
                          <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-xs mb-2">Untestable Items:</h4>
                          {Object.entries(scores).filter(([_, score]) => score === "UN").map(([itemId]) => {
                            const item = nihssItems.find(i => i.item === itemId);
                            return (
                              <div key={itemId} className="text-xs text-amber-700 dark:text-amber-400">
                                <strong>{itemId}.</strong> {item?.name}: {untestableReasons[itemId] || (item as any)?.untestableReason || "Reason not documented"}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Serial NIHSS Tracker */}
            <SerialNIHSSTracker 
              currentScores={scores} 
              currentUntestableReasons={untestableReasons}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Visual GCS Calculator Component
function VisualGCSCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    eye: 4,
    verbal: 5,
    motor: 6
  });

  const gcsItems = [
    {
      key: "eye",
      name: "Eye Opening",
      icon: "👁️",
      color: "blue",
      options: [
        { score: 4, label: "Spontaneous", desc: "Opens eyes without stimulation" },
        { score: 3, label: "To Voice", desc: "Opens eyes to verbal command" },
        { score: 2, label: "To Pain", desc: "Opens eyes to painful stimuli" },
        { score: 1, label: "None", desc: "No eye opening" }
      ]
    },
    {
      key: "verbal",
      name: "Verbal Response",
      icon: "💬",
      color: "purple",
      options: [
        { score: 5, label: "Oriented", desc: "Oriented to person, place, time" },
        { score: 4, label: "Confused", desc: "Confused conversation" },
        { score: 3, label: "Inappropriate", desc: "Inappropriate words" },
        { score: 2, label: "Incomprehensible", desc: "Incomprehensible sounds" },
        { score: 1, label: "None", desc: "No verbal response" }
      ]
    },
    {
      key: "motor",
      name: "Motor Response",
      icon: "💪",
      color: "green",
      options: [
        { score: 6, label: "Obeys Commands", desc: "Follows simple commands" },
        { score: 5, label: "Localizes Pain", desc: "Moves toward painful stimulus" },
        { score: 4, label: "Withdraws", desc: "Withdraws from pain" },
        { score: 3, label: "Abnormal Flexion", desc: "Decorticate posturing" },
        { score: 2, label: "Extension", desc: "Decerebrate posturing" },
        { score: 1, label: "None", desc: "No motor response" }
      ]
    }
  ];

  const totalScore = scores.eye + scores.verbal + scores.motor;

  const getSeverityInfo = (score: number) => {
    if (score >= 13) return { label: "Mild Brain Injury", color: "bg-green-500", textColor: "text-green-800 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" };
    if (score >= 9) return { label: "Moderate Brain Injury", color: "bg-yellow-500", textColor: "text-yellow-800 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" };
    return { label: "Severe Brain Injury", color: "bg-red-500", textColor: "text-red-800 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40" };
  };

  const getIntubationNote = () => {
    if (totalScore <= 8) return { show: true, text: "Consider intubation for airway protection (GCS ≤8)" };
    return { show: false, text: "" };
  };

  const severity = getSeverityInfo(totalScore);
  const intubationNote = getIntubationNote();

  const resetScores = () => {
    setScores({ eye: 4, verbal: 5, motor: 6 });
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { selected: string; unselected: string }> = {
      blue: {
        selected: "bg-blue-600 text-white shadow-md",
        unselected: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
      },
      purple: {
        selected: "bg-purple-600 text-white shadow-md",
        unselected: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
      },
      green: {
        selected: "bg-green-600 text-white shadow-md",
        unselected: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
      }
    };
    return isSelected ? colors[color].selected : colors[color].unselected;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-emerald-100/50 dark:bg-emerald-900/30">
            <CardTitle className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Visual GCS Calculator
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${severity.color} text-white font-bold px-3 py-1`}>
                  GCS: {totalScore}/15
                </Badge>
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Score Display and Severity */}
            <div className={`p-4 rounded-lg ${severity.bgColor} border`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className={`text-4xl font-bold ${severity.textColor}`}>{totalScore}</div>
                  <div className={`text-lg font-semibold ${severity.textColor}`}>{severity.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    E{scores.eye} V{scores.verbal} M{scores.motor}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="text-center px-3 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg border border-green-300 dark:border-green-700">
                    <div className="text-xs text-green-700 dark:text-green-400">Mild</div>
                    <div className="font-bold text-green-800 dark:text-green-300">13-15</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <div className="text-xs text-yellow-700 dark:text-yellow-400">Moderate</div>
                    <div className="font-bold text-yellow-800 dark:text-yellow-300">9-12</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-300 dark:border-red-700">
                    <div className="text-xs text-red-700 dark:text-red-400">Severe</div>
                    <div className="font-bold text-red-800 dark:text-red-300">3-8</div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); resetScores(); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
              
              {intubationNote.show && (
                <div className="mt-3 p-2 bg-red-200 dark:bg-red-900/50 rounded border border-red-400 dark:border-red-700">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {intubationNote.text}
                  </p>
                </div>
              )}
            </div>

            {/* GCS Components */}
            <div className="grid gap-4 md:grid-cols-3">
              {gcsItems.map((item) => (
                <div
                  key={item.key}
                  className="p-4 bg-white dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                        {item.name}
                      </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-400 text-emerald-700 dark:text-emerald-300 text-lg px-3">
                      {scores[item.key]}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {item.options.map((option) => (
                      <button
                        key={option.score}
                        onClick={() => setScores({ ...scores, [item.key]: option.score })}
                        className={`w-full text-left px-3 py-2 rounded transition-all ${getColorClasses(item.color, scores[item.key] === option.score)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{option.score}</span>
                          <span className="font-medium text-sm">{option.label}</span>
                        </div>
                        <div className="text-xs opacity-75 mt-0.5">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Clinical Pearls */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 text-sm">GCS-Pupils Score (GCS-P)</h5>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  GCS-P = GCS − Pupil Reactivity Score<br/>
                  • Both reactive = 0<br/>
                  • One reactive = 1<br/>
                  • Neither reactive = 2<br/>
                  Range: 1-15 (lower = worse prognosis)
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm">Motor Score Importance</h5>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  The Motor component (M) is the most predictive of outcome.<br/>
                  • M ≤4: Poor prognosis indicator<br/>
                  • M6: Best motor response<br/>
                  If only one component is available, Motor alone can estimate severity.
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                <strong>Clinical Notes:</strong> GCS should be documented as component scores (E_V_M_) in addition to total. 
                For intubated patients, record as E_VT M_ (T = intubated). 
                Serial GCS assessments are valuable for tracking neurological status.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Visual FOUR Score Calculator Component
function VisualFOURScoreCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    eye: 4,
    motor: 4,
    brainstem: 4,
    respiration: 4
  });

  const fourItems = [
    {
      key: "eye",
      name: "Eye Response",
      icon: "👁️",
      color: "blue",
      options: [
        { score: 4, label: "E4: Eyelids open, tracking or blinking to command", desc: "Follows objects or blinks on command" },
        { score: 3, label: "E3: Eyelids open but not tracking", desc: "Eyes open spontaneously, no tracking" },
        { score: 2, label: "E2: Eyelids closed, open to loud voice", desc: "Opens to verbal stimulus" },
        { score: 1, label: "E1: Eyelids closed, open to pain", desc: "Opens only to painful stimulus" },
        { score: 0, label: "E0: Eyelids remain closed with pain", desc: "No eye opening" }
      ]
    },
    {
      key: "motor",
      name: "Motor Response",
      icon: "💪",
      color: "green",
      options: [
        { score: 4, label: "M4: Thumbs-up, fist, or peace sign", desc: "Follows specific commands" },
        { score: 3, label: "M3: Localizing to pain", desc: "Purposeful movement to stimulus" },
        { score: 2, label: "M2: Flexion response to pain", desc: "Withdrawal or flexor posturing" },
        { score: 1, label: "M1: Extension response to pain", desc: "Extensor posturing" },
        { score: 0, label: "M0: No response to pain, or myoclonus", desc: "No motor response or status myoclonus" }
      ]
    },
    {
      key: "brainstem",
      name: "Brainstem Reflexes",
      icon: "🧠",
      color: "purple",
      options: [
        { score: 4, label: "B4: Pupil AND corneal reflexes present", desc: "Both reflexes intact" },
        { score: 3, label: "B3: One pupil wide and fixed", desc: "Unilateral pupil abnormality" },
        { score: 2, label: "B2: Pupil OR corneal reflex absent", desc: "One reflex absent" },
        { score: 1, label: "B1: Pupil AND corneal reflexes absent", desc: "Both reflexes absent" },
        { score: 0, label: "B0: Absent pupil, corneal, AND cough reflex", desc: "All brainstem reflexes absent" }
      ]
    },
    {
      key: "respiration",
      name: "Respiration",
      icon: "🫁",
      color: "teal",
      options: [
        { score: 4, label: "R4: Not intubated, regular breathing", desc: "Normal breathing pattern" },
        { score: 3, label: "R3: Not intubated, Cheyne-Stokes pattern", desc: "Periodic breathing pattern" },
        { score: 2, label: "R2: Not intubated, irregular breathing", desc: "Ataxic or irregular pattern" },
        { score: 1, label: "R1: Intubated, breathes above ventilator rate", desc: "Triggers ventilator" },
        { score: 0, label: "R0: Intubated, breathes at ventilator rate or apnea", desc: "No respiratory drive" }
      ]
    }
  ];

  const totalScore = scores.eye + scores.motor + scores.brainstem + scores.respiration;

  const getSeverityInfo = (score: number) => {
    if (score >= 13) return { label: "Good Prognosis", color: "bg-green-500", textColor: "text-green-800 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" };
    if (score >= 9) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-800 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" };
    if (score >= 5) return { label: "Poor Prognosis", color: "bg-orange-500", textColor: "text-orange-800 dark:text-orange-300", bgColor: "bg-orange-100 dark:bg-orange-900/40" };
    return { label: "Very Poor Prognosis", color: "bg-red-500", textColor: "text-red-800 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40" };
  };

  const severity = getSeverityInfo(totalScore);

  const resetScores = () => {
    setScores({ eye: 4, motor: 4, brainstem: 4, respiration: 4 });
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { selected: string; unselected: string }> = {
      blue: {
        selected: "bg-blue-600 text-white shadow-md",
        unselected: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
      },
      purple: {
        selected: "bg-purple-600 text-white shadow-md",
        unselected: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
      },
      green: {
        selected: "bg-green-600 text-white shadow-md",
        unselected: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
      },
      teal: {
        selected: "bg-teal-600 text-white shadow-md",
        unselected: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40"
      }
    };
    return isSelected ? colors[color].selected : colors[color].unselected;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-cyan-400 dark:border-cyan-600 bg-gradient-to-br from-cyan-50 dark:from-cyan-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-cyan-100/50 dark:bg-cyan-900/30">
            <CardTitle className="flex items-center justify-between text-cyan-800 dark:text-cyan-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                FOUR Score Calculator
                <Badge variant="outline" className="ml-2 text-xs border-cyan-400">For Intubated Patients</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${severity.color} text-white font-bold px-3 py-1`}>
                  Score: {totalScore}/16
                </Badge>
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Score Display and Severity */}
            <div className={`p-4 rounded-lg ${severity.bgColor} border`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className={`text-4xl font-bold ${severity.textColor}`}>{totalScore}</div>
                  <div className={`text-lg font-semibold ${severity.textColor}`}>{severity.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    E{scores.eye} M{scores.motor} B{scores.brainstem} R{scores.respiration}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="text-center px-3 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg border border-green-300 dark:border-green-700">
                    <div className="text-xs text-green-700 dark:text-green-400">Good</div>
                    <div className="font-bold text-green-800 dark:text-green-300">13-16</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <div className="text-xs text-yellow-700 dark:text-yellow-400">Moderate</div>
                    <div className="font-bold text-yellow-800 dark:text-yellow-300">9-12</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg border border-orange-300 dark:border-orange-700">
                    <div className="text-xs text-orange-700 dark:text-orange-400">Poor</div>
                    <div className="font-bold text-orange-800 dark:text-orange-300">5-8</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-300 dark:border-red-700">
                    <div className="text-xs text-red-700 dark:text-red-400">Very Poor</div>
                    <div className="font-bold text-red-800 dark:text-red-300">0-4</div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); resetScores(); }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
              
              {totalScore === 0 && (
                <div className="mt-3 p-2 bg-red-200 dark:bg-red-900/50 rounded border border-red-400 dark:border-red-700">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    FOUR Score of 0 may indicate brain death - consider further evaluation
                  </p>
                </div>
              )}
            </div>

            {/* FOUR Score Components */}
            <div className="grid gap-4 md:grid-cols-2">
              {fourItems.map((item) => (
                <div
                  key={item.key}
                  className="p-4 bg-white dark:bg-cyan-950/30 rounded-lg border border-cyan-200 dark:border-cyan-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="font-semibold text-cyan-800 dark:text-cyan-300">
                        {item.name}
                      </div>
                    </div>
                    <Badge variant="outline" className="border-cyan-400 text-cyan-700 dark:text-cyan-300 text-lg px-3">
                      {scores[item.key]}
                    </Badge>
                  </div>
                  <div className="grid gap-1">
                    {item.options.map((option) => (
                      <button
                        key={option.score}
                        onClick={() => setScores({ ...scores, [item.key]: option.score })}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-all ${getColorClasses(item.color, scores[item.key] === option.score)}`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="opacity-75 mt-0.5">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FOUR Score Visual Diagram */}
            <div className="p-4 bg-white dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-700 rounded-lg">
              <h5 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3 text-sm text-center">FOUR Score Visual Reference</h5>
              <img 
                src={fourScoreDiagram} 
                alt="FOUR Score Visual Diagram showing Eye Response, Motor Response, Brainstem Reflexes, and Respiration scoring" 
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
              />
              <p className="text-xs text-center text-cyan-600 dark:text-cyan-400 mt-2">
                © Mayo Foundation for Medical Education and Research
              </p>
            </div>

            {/* Advantages over GCS */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 text-sm">Advantages over GCS</h5>
              <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <li>• <strong>Intubated patients:</strong> No verbal component - can fully assess intubated patients</li>
                <li>• <strong>Brainstem reflexes:</strong> Includes pupil, corneal, and cough reflexes</li>
                <li>• <strong>Respiration:</strong> Assesses respiratory pattern and ventilator dependence</li>
                <li>• <strong>Brain death:</strong> Score of 0 may suggest brain death (E0, M0, B0, R0)</li>
                <li>• <strong>Better discrimination:</strong> More granular assessment of severely impaired patients</li>
              </ul>
            </div>

            {/* Notes */}
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-700 rounded-lg">
              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                <strong>Reference:</strong> Wijdicks EFM, et al. "Validation of a new coma scale: The FOUR score." Ann Neurol 2005;58:585-593. 
                The FOUR score was specifically designed for ICU patients and provides better prognostic information than GCS in intubated patients.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Hunt and Hess Scale Calculator Component
function HuntHessCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const grades = [
    {
      grade: 1,
      title: "Grade I",
      description: "Asymptomatic or minimal headache and slight nuchal rigidity",
      mortality: "~1%",
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/40",
      borderColor: "border-green-400 dark:border-green-600",
      textColor: "text-green-800 dark:text-green-300"
    },
    {
      grade: 2,
      title: "Grade II",
      description: "Moderate to severe headache, nuchal rigidity, no neurological deficit except cranial nerve palsy",
      mortality: "~5%",
      color: "lime",
      bgColor: "bg-lime-100 dark:bg-lime-900/40",
      borderColor: "border-lime-400 dark:border-lime-600",
      textColor: "text-lime-800 dark:text-lime-300"
    },
    {
      grade: 3,
      title: "Grade III",
      description: "Drowsiness, confusion, or mild focal deficit",
      mortality: "~19%",
      color: "yellow",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
      borderColor: "border-yellow-400 dark:border-yellow-600",
      textColor: "text-yellow-800 dark:text-yellow-300"
    },
    {
      grade: 4,
      title: "Grade IV",
      description: "Stupor, moderate to severe hemiparesis, possible early decerebrate rigidity, vegetative disturbances",
      mortality: "~42%",
      color: "orange",
      bgColor: "bg-orange-100 dark:bg-orange-900/40",
      borderColor: "border-orange-400 dark:border-orange-600",
      textColor: "text-orange-800 dark:text-orange-300"
    },
    {
      grade: 5,
      title: "Grade V",
      description: "Deep coma, decerebrate rigidity, moribund appearance",
      mortality: "~77%",
      color: "red",
      bgColor: "bg-red-100 dark:bg-red-900/40",
      borderColor: "border-red-400 dark:border-red-600",
      textColor: "text-red-800 dark:text-red-300"
    }
  ];

  const selectedGradeInfo = selectedGrade !== null ? grades.find(g => g.grade === selectedGrade) : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-rose-400 dark:border-rose-600 bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-rose-100/50 dark:bg-rose-900/30">
            <CardTitle className="flex items-center justify-between text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Hunt and Hess Scale (SAH)
              </div>
              <div className="flex items-center gap-3">
                {selectedGrade !== null && (
                  <Badge className={`${selectedGradeInfo?.bgColor} ${selectedGradeInfo?.textColor} font-bold px-3 py-1 border ${selectedGradeInfo?.borderColor}`}>
                    Grade {selectedGrade}
                  </Badge>
                )}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Grade Selection */}
            <div className="space-y-3">
              {grades.map((grade) => (
                <button
                  key={grade.grade}
                  onClick={() => setSelectedGrade(grade.grade)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedGrade === grade.grade
                      ? `${grade.bgColor} ${grade.borderColor} shadow-md`
                      : 'bg-white dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white ${
                        grade.color === 'green' ? 'bg-green-500' :
                        grade.color === 'lime' ? 'bg-lime-500' :
                        grade.color === 'yellow' ? 'bg-yellow-500' :
                        grade.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {grade.grade}
                      </div>
                      <div>
                        <div className={`font-semibold ${selectedGrade === grade.grade ? grade.textColor : 'text-rose-800 dark:text-rose-300'}`}>
                          {grade.title}
                        </div>
                        <div className={`text-sm ${selectedGrade === grade.grade ? grade.textColor : 'text-rose-600 dark:text-rose-400'}`}>
                          {grade.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${selectedGrade === grade.grade ? grade.textColor : 'text-rose-500 dark:text-rose-400'}`}>
                        Mortality
                      </div>
                      <div className={`font-bold ${selectedGrade === grade.grade ? grade.textColor : 'text-rose-700 dark:text-rose-300'}`}>
                        {grade.mortality}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Result Display */}
            {selectedGrade !== null && selectedGradeInfo && (
              <div className={`p-4 rounded-lg ${selectedGradeInfo.bgColor} border ${selectedGradeInfo.borderColor}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className={`text-3xl font-bold ${selectedGradeInfo.textColor}`}>
                      Hunt & Hess Grade {selectedGrade}
                    </div>
                    <div className={`text-sm ${selectedGradeInfo.textColor} mt-1`}>
                      {selectedGradeInfo.description}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${selectedGradeInfo.textColor}`}>
                      {selectedGradeInfo.mortality}
                    </div>
                    <div className={`text-xs ${selectedGradeInfo.textColor}`}>
                      Surgical Mortality
                    </div>
                  </div>
                </div>
                
                {/* Management Implications */}
                <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded">
                  <h5 className={`font-semibold ${selectedGradeInfo.textColor} mb-2 text-sm`}>Management Implications</h5>
                  <ul className={`text-xs ${selectedGradeInfo.textColor} space-y-1`}>
                    {selectedGrade <= 3 ? (
                      <>
                        <li>• Early surgical/endovascular intervention typically recommended</li>
                        <li>• Good candidates for aneurysm repair within 72 hours</li>
                        <li>• Better functional outcomes expected</li>
                      </>
                    ) : (
                      <>
                        <li>• May benefit from stabilization before intervention</li>
                        <li>• Consider EVD for hydrocephalus if present</li>
                        <li>• Aggressive medical management to reduce ICP</li>
                        <li>• Surgery timing controversial - often delayed until clinical improvement</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 text-sm">Modified Hunt & Hess</h5>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Add 1 grade for serious systemic disease (HTN, DM, severe atherosclerosis, COPD) or severe vasospasm on angiography.
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm">Timing of Assessment</h5>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Grade should be assessed at presentation and can change with clinical status. Serial assessments are important for monitoring.
                </p>
              </div>
            </div>

            {/* Reset and Notes */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedGrade(null)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 rounded-lg">
              <p className="text-xs text-rose-600 dark:text-rose-400">
                <strong>Reference:</strong> Hunt WE, Hess RM. "Surgical risk as related to time of intervention in the repair of intracranial aneurysms." J Neurosurg 1968;28:14-20.
                Mortality rates are historical surgical mortality and may vary with modern endovascular techniques.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// WFNS (World Federation of Neurological Surgeons) Scale Calculator
function WFNSCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [gcs, setGcs] = useState<number | null>(null);
  const [motorDeficit, setMotorDeficit] = useState<boolean | null>(null);

  const getWFNSGrade = (): { grade: string; mortality: string; color: string; bgColor: string; borderColor: string; textColor: string; description: string } | null => {
    if (gcs === null) return null;
    
    if (gcs === 15) {
      return {
        grade: "I",
        mortality: "5%",
        color: "green",
        bgColor: "bg-green-100 dark:bg-green-900/40",
        borderColor: "border-green-400 dark:border-green-600",
        textColor: "text-green-800 dark:text-green-300",
        description: "GCS 15, no motor deficit"
      };
    }
    if (gcs >= 13 && gcs <= 14) {
      if (motorDeficit === false) {
        return {
          grade: "II",
          mortality: "9%",
          color: "lime",
          bgColor: "bg-lime-100 dark:bg-lime-900/40",
          borderColor: "border-lime-400 dark:border-lime-600",
          textColor: "text-lime-800 dark:text-lime-300",
          description: "GCS 13-14, no motor deficit"
        };
      } else if (motorDeficit === true) {
        return {
          grade: "III",
          mortality: "20%",
          color: "yellow",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
          borderColor: "border-yellow-400 dark:border-yellow-600",
          textColor: "text-yellow-800 dark:text-yellow-300",
          description: "GCS 13-14, with motor deficit"
        };
      }
      return null;
    }
    if (gcs >= 7 && gcs <= 12) {
      return {
        grade: "IV",
        mortality: "33%",
        color: "orange",
        bgColor: "bg-orange-100 dark:bg-orange-900/40",
        borderColor: "border-orange-400 dark:border-orange-600",
        textColor: "text-orange-800 dark:text-orange-300",
        description: "GCS 7-12, with or without motor deficit"
      };
    }
    if (gcs >= 3 && gcs <= 6) {
      return {
        grade: "V",
        mortality: "76%",
        color: "red",
        bgColor: "bg-red-100 dark:bg-red-900/40",
        borderColor: "border-red-400 dark:border-red-600",
        textColor: "text-red-800 dark:text-red-300",
        description: "GCS 3-6, with or without motor deficit"
      };
    }
    return null;
  };

  const wfnsResult = getWFNSGrade();
  const needsMotorDeficit = gcs !== null && gcs >= 13 && gcs <= 14;

  const gcsOptions = [
    { value: 15, label: "15" },
    { value: 14, label: "14" },
    { value: 13, label: "13" },
    { value: 12, label: "12" },
    { value: 11, label: "11" },
    { value: 10, label: "10" },
    { value: 9, label: "9" },
    { value: 8, label: "8" },
    { value: 7, label: "7" },
    { value: 6, label: "6" },
    { value: 5, label: "5" },
    { value: 4, label: "4" },
    { value: 3, label: "3" },
  ];

  const resetScores = () => {
    setGcs(null);
    setMotorDeficit(null);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-violet-400 dark:border-violet-600 bg-gradient-to-br from-violet-50 dark:from-violet-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-violet-100/50 dark:bg-violet-900/30">
            <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                WFNS Scale Calculator (SAH)
                <Badge variant="outline" className="ml-2 text-xs border-violet-400">GCS-Based</Badge>
              </div>
              <div className="flex items-center gap-3">
                {wfnsResult && (
                  <Badge className={`${wfnsResult.bgColor} ${wfnsResult.textColor} font-bold px-3 py-1 border ${wfnsResult.borderColor}`}>
                    Grade {wfnsResult.grade}
                  </Badge>
                )}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Input Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* GCS Selection */}
              <div className="p-4 bg-white dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                <h5 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">Glasgow Coma Scale (GCS)</h5>
                <div className="grid grid-cols-5 gap-2">
                  {gcsOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setGcs(option.value);
                        // Reset motor deficit if not needed
                        if (option.value < 13 || option.value > 14) {
                          setMotorDeficit(null);
                        }
                      }}
                      className={`p-3 rounded-lg font-bold text-lg transition-all ${
                        gcs === option.value
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motor Deficit Selection */}
              <div className={`p-4 bg-white dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800 ${!needsMotorDeficit ? 'opacity-50' : ''}`}>
                <h5 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">
                  Motor Deficit Present?
                  {needsMotorDeficit && <span className="text-red-500 ml-1">*</span>}
                </h5>
                <p className="text-xs text-violet-600 dark:text-violet-400 mb-3">
                  {needsMotorDeficit 
                    ? "Required for GCS 13-14 to differentiate Grade II vs III" 
                    : "Only applicable for GCS 13-14"
                  }
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMotorDeficit(false)}
                    disabled={!needsMotorDeficit}
                    className={`p-4 rounded-lg font-medium transition-all ${
                      motorDeficit === false
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                    } ${!needsMotorDeficit ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="text-lg">No</div>
                    <div className="text-xs opacity-75">No motor deficit</div>
                  </button>
                  <button
                    onClick={() => setMotorDeficit(true)}
                    disabled={!needsMotorDeficit}
                    className={`p-4 rounded-lg font-medium transition-all ${
                      motorDeficit === true
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                    } ${!needsMotorDeficit ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="text-lg">Yes</div>
                    <div className="text-xs opacity-75">Motor deficit present</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {wfnsResult ? (
              <div className={`p-4 rounded-lg ${wfnsResult.bgColor} border ${wfnsResult.borderColor}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className={`text-3xl font-bold ${wfnsResult.textColor}`}>
                      WFNS Grade {wfnsResult.grade}
                    </div>
                    <div className={`text-sm ${wfnsResult.textColor} mt-1`}>
                      {wfnsResult.description}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${wfnsResult.textColor}`}>
                      {wfnsResult.mortality}
                    </div>
                    <div className={`text-xs ${wfnsResult.textColor}`}>
                      Mortality Rate
                    </div>
                  </div>
                </div>
                
                {/* Management Implications */}
                <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded">
                  <h5 className={`font-semibold ${wfnsResult.textColor} mb-2 text-sm`}>Management Implications</h5>
                  <ul className={`text-xs ${wfnsResult.textColor} space-y-1`}>
                    {wfnsResult.grade === "I" || wfnsResult.grade === "II" || wfnsResult.grade === "III" ? (
                      <>
                        <li>• "Good grade" SAH - early intervention typically recommended</li>
                        <li>• Aneurysm treatment within 24-72 hours preferred</li>
                        <li>• Better functional outcomes expected</li>
                      </>
                    ) : (
                      <>
                        <li>• "Poor grade" SAH - stabilization may be needed before intervention</li>
                        <li>• Consider EVD for hydrocephalus if present</li>
                        <li>• Aggressive ICP management required</li>
                        <li>• Timing of aneurysm treatment controversial</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700 text-center">
                <p className="text-violet-600 dark:text-violet-400">
                  {gcs === null 
                    ? "Select GCS score to calculate WFNS grade" 
                    : "Select motor deficit status to complete grading"
                  }
                </p>
              </div>
            )}

            {/* WFNS Grade Reference Table */}
            <div className="p-4 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg">
              <h5 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">WFNS Grading System Reference</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-violet-200 dark:border-violet-700">
                      <th className="text-left py-2 px-2 text-violet-800 dark:text-violet-300 font-semibold">Grade</th>
                      <th className="text-center py-2 px-2 text-violet-800 dark:text-violet-300 font-semibold">GCS</th>
                      <th className="text-center py-2 px-2 text-violet-800 dark:text-violet-300 font-semibold">Motor Deficit</th>
                      <th className="text-center py-2 px-2 text-violet-800 dark:text-violet-300 font-semibold">Mortality</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-violet-100 dark:border-violet-800 bg-green-50 dark:bg-green-900/20">
                      <td className="py-2 px-2 font-bold text-green-700 dark:text-green-300">I</td>
                      <td className="py-2 px-2 text-center">15</td>
                      <td className="py-2 px-2 text-center">Absent</td>
                      <td className="py-2 px-2 text-center">5%</td>
                    </tr>
                    <tr className="border-b border-violet-100 dark:border-violet-800 bg-lime-50 dark:bg-lime-900/20">
                      <td className="py-2 px-2 font-bold text-lime-700 dark:text-lime-300">II</td>
                      <td className="py-2 px-2 text-center">13-14</td>
                      <td className="py-2 px-2 text-center">Absent</td>
                      <td className="py-2 px-2 text-center">9%</td>
                    </tr>
                    <tr className="border-b border-violet-100 dark:border-violet-800 bg-yellow-50 dark:bg-yellow-900/20">
                      <td className="py-2 px-2 font-bold text-yellow-700 dark:text-yellow-300">III</td>
                      <td className="py-2 px-2 text-center">13-14</td>
                      <td className="py-2 px-2 text-center">Present</td>
                      <td className="py-2 px-2 text-center">20%</td>
                    </tr>
                    <tr className="border-b border-violet-100 dark:border-violet-800 bg-orange-50 dark:bg-orange-900/20">
                      <td className="py-2 px-2 font-bold text-orange-700 dark:text-orange-300">IV</td>
                      <td className="py-2 px-2 text-center">7-12</td>
                      <td className="py-2 px-2 text-center">Present or Absent</td>
                      <td className="py-2 px-2 text-center">33%</td>
                    </tr>
                    <tr className="bg-red-50 dark:bg-red-900/20">
                      <td className="py-2 px-2 font-bold text-red-700 dark:text-red-300">V</td>
                      <td className="py-2 px-2 text-center">3-6</td>
                      <td className="py-2 px-2 text-center">Present or Absent</td>
                      <td className="py-2 px-2 text-center">76%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comparison with Hunt & Hess */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 text-sm">WFNS vs Hunt & Hess</h5>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  WFNS uses objective GCS scoring, reducing inter-observer variability. 
                  Hunt & Hess relies on clinical description which can be subjective.
                  Both predict outcome similarly but WFNS is more reproducible.
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm">"Good Grade" vs "Poor Grade"</h5>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Grades I-III: "Good grade" - typically proceed with early treatment<br/>
                  Grades IV-V: "Poor grade" - may need stabilization first, outcome less certain
                </p>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={resetScores}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Reference */}
            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700 rounded-lg">
              <p className="text-xs text-violet-600 dark:text-violet-400">
                <strong>Reference:</strong> Report of World Federation of Neurological Surgeons Committee on a Universal Subarachnoid Hemorrhage Grading Scale. 
                J Neurosurg 1988;68:985-986. Mortality rates based on ISAT and contemporary studies.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Modified Rankin Scale (mRS) Component
function MRSScaleReference() {
  const [isOpen, setIsOpen] = useState(false);
  
  const mrsLevels = [
    { score: 0, label: "No symptoms", description: "No symptoms at all", color: "bg-green-500" },
    { score: 1, label: "No significant disability", description: "Despite symptoms, able to carry out all usual duties and activities", color: "bg-green-400" },
    { score: 2, label: "Slight disability", description: "Unable to carry out all previous activities but able to look after own affairs without assistance", color: "bg-lime-400" },
    { score: 3, label: "Moderate disability", description: "Requiring some help, but able to walk without assistance", color: "bg-yellow-400" },
    { score: 4, label: "Moderately severe disability", description: "Unable to walk without assistance and unable to attend to own bodily needs without assistance", color: "bg-orange-400" },
    { score: 5, label: "Severe disability", description: "Bedridden, incontinent, and requiring constant nursing care and attention", color: "bg-red-500" },
    { score: 6, label: "Dead", description: "Death", color: "bg-gray-700" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-violet-300 dark:border-violet-700 bg-gradient-to-br from-violet-50 dark:from-violet-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-violet-100/50 dark:bg-violet-900/30">
            <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                mRS - Modified Rankin Scale (0-6)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Outcome Categories */}
            <div className="mb-6 p-4 bg-violet-100 dark:bg-violet-900/40 rounded-lg">
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">Functional Outcome Categories</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-800 dark:text-green-300">mRS 0-1</div>
                  <div className="text-sm text-green-700 dark:text-green-400">Excellent Outcome</div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">Functionally independent</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">mRS 0-2</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">Good Outcome</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Independent in ADLs</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-800 dark:text-red-300">mRS 3-6</div>
                  <div className="text-sm text-red-700 dark:text-red-400">Poor Outcome</div>
                  <div className="text-xs text-red-600 dark:text-red-500 mt-1">Dependent or deceased</div>
                </div>
              </div>
            </div>

            {/* Scale Levels */}
            <div className="space-y-3">
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">Scale Definitions</h4>
              {mrsLevels.map((level) => (
                <div key={level.score} className="flex items-start gap-3 p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                  <div className={`flex-shrink-0 w-10 h-10 ${level.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {level.score}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-violet-800 dark:text-violet-300">{level.label}</div>
                    <div className="text-sm text-violet-600 dark:text-violet-400">{level.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700 rounded-lg">
              <p className="text-xs text-violet-600 dark:text-violet-400">
                <strong>Clinical Notes:</strong> mRS is the most widely used outcome measure in stroke trials. Assess at 90 days post-stroke for primary outcome. 
                "Shift analysis" examines improvement across the entire scale. mRS 0-2 is typically considered "good outcome" in clinical trials.
                Pre-stroke mRS should be documented to assess change.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ASPECTS Score Component
function ASPECTSScoreReference() {
  const [isOpen, setIsOpen] = useState(false);
  
  const aspectsRegions = [
    { region: "C", name: "Caudate", level: "Ganglionic" },
    { region: "L", name: "Lentiform nucleus", level: "Ganglionic" },
    { region: "IC", name: "Internal Capsule", level: "Ganglionic" },
    { region: "I", name: "Insular ribbon", level: "Ganglionic" },
    { region: "M1", name: "Anterior MCA cortex", level: "Ganglionic" },
    { region: "M2", name: "MCA cortex lateral to insular ribbon", level: "Ganglionic" },
    { region: "M3", name: "Posterior MCA cortex", level: "Ganglionic" },
    { region: "M4", name: "Anterior MCA territory (above M1)", level: "Supraganglionic" },
    { region: "M5", name: "Lateral MCA territory (above M2)", level: "Supraganglionic" },
    { region: "M6", name: "Posterior MCA territory (above M3)", level: "Supraganglionic" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50 dark:from-cyan-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-cyan-100/50 dark:bg-cyan-900/30">
            <CardTitle className="flex items-center justify-between text-cyan-800 dark:text-cyan-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                ASPECTS - Alberta Stroke Program Early CT Score (0-10)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Score Interpretation */}
            <div className="mb-6 p-4 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3">Score Interpretation</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-800 dark:text-green-300">ASPECTS 8-10</div>
                  <div className="text-sm text-green-700 dark:text-green-400">Small infarct core</div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">Favorable for reperfusion therapy</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">ASPECTS 6-7</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">Moderate infarct</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Consider risks/benefits carefully</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-800 dark:text-red-300">ASPECTS 0-5</div>
                  <div className="text-sm text-red-700 dark:text-red-400">Large infarct core</div>
                  <div className="text-xs text-red-600 dark:text-red-500 mt-1">Higher risk of hemorrhagic transformation</div>
                </div>
              </div>
            </div>

            {/* Scoring Method */}
            <div className="mb-4 p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-700 rounded-lg">
              <p className="text-sm text-cyan-700 dark:text-cyan-400">
                <strong>Scoring:</strong> Start with 10 points. Subtract 1 point for each region showing early ischemic changes 
                (loss of gray-white differentiation, swelling, hypoattenuation). Assess at two axial CT levels: ganglionic (basal ganglia visible) 
                and supraganglionic (above basal ganglia).
              </p>
            </div>

            {/* Regions Table */}
            <div className="space-y-2">
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3">MCA Territory Regions (10 regions)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ganglionic Level */}
                <div className="bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                  <h5 className="font-medium text-cyan-700 dark:text-cyan-400 mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-200 dark:bg-cyan-800 rounded text-xs">Ganglionic Level</span>
                    Basal Ganglia Visible
                  </h5>
                  <div className="space-y-2">
                    {aspectsRegions.filter(r => r.level === "Ganglionic").map((region) => (
                      <div key={region.region} className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {region.region}
                        </span>
                        <span className="text-sm text-cyan-700 dark:text-cyan-400">{region.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supraganglionic Level */}
                <div className="bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                  <h5 className="font-medium text-cyan-700 dark:text-cyan-400 mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-200 dark:bg-cyan-800 rounded text-xs">Supraganglionic Level</span>
                    Above Basal Ganglia
                  </h5>
                  <div className="space-y-2">
                    {aspectsRegions.filter(r => r.level === "Supraganglionic").map((region) => (
                      <div key={region.region} className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {region.region}
                        </span>
                        <span className="text-sm text-cyan-700 dark:text-cyan-400">{region.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-700 rounded-lg">
              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                <strong>Clinical Notes:</strong> ASPECTS ≥6 is generally the threshold for IV thrombolysis eligibility. 
                For mechanical thrombectomy, recent trials (DAWN, DEFUSE 3) use perfusion imaging. 
                CT-ASPECTS and DWI-ASPECTS show good correlation. Inter-rater reliability improves with training.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// pc-ASPECTS Score Component
function PcASPECTSScoreReference() {
  const [isOpen, setIsOpen] = useState(false);
  
  const pcAspectsRegions = [
    { region: "L", name: "Left Thalamus", points: 1, level: "Thalamus" },
    { region: "R", name: "Right Thalamus", points: 1, level: "Thalamus" },
    { region: "L", name: "Left Cerebellum", points: 1, level: "Cerebellum" },
    { region: "R", name: "Right Cerebellum", points: 1, level: "Cerebellum" },
    { region: "L", name: "Left PCA territory", points: 1, level: "Occipital" },
    { region: "R", name: "Right PCA territory", points: 1, level: "Occipital" },
    { region: "M", name: "Midbrain", points: 2, level: "Brainstem" },
    { region: "P", name: "Pons", points: 2, level: "Brainstem" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50 dark:from-teal-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-teal-100/50 dark:bg-teal-900/30">
            <CardTitle className="flex items-center justify-between text-teal-800 dark:text-teal-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                pc-ASPECTS - Posterior Circulation ASPECTS (0-10)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Score Interpretation */}
            <div className="mb-6 p-4 bg-teal-100 dark:bg-teal-900/40 rounded-lg">
              <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-3">Score Interpretation</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-800 dark:text-green-300">pc-ASPECTS 8-10</div>
                  <div className="text-sm text-green-700 dark:text-green-400">Small infarct</div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">Favorable for intervention</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">pc-ASPECTS 6-7</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">Moderate infarct</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Individualized decision</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-800 dark:text-red-300">pc-ASPECTS 0-5</div>
                  <div className="text-sm text-red-700 dark:text-red-400">Large infarct</div>
                  <div className="text-xs text-red-600 dark:text-red-500 mt-1">Poor prognosis</div>
                </div>
              </div>
            </div>

            {/* Scoring Method */}
            <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <p className="text-sm text-teal-700 dark:text-teal-400">
                <strong>Scoring:</strong> Start with 10 points. Subtract points for each region showing early ischemic changes on CT/DWI-MRI. 
                Brainstem regions (midbrain, pons) are weighted 2 points each due to clinical significance. 
                Other regions (thalamus, cerebellum, PCA territory) are 1 point each.
              </p>
            </div>

            {/* Regions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-teal-800 dark:text-teal-300">Posterior Circulation Regions (10 points total)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brainstem - 2 points each */}
                <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h5 className="font-medium text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded text-xs font-bold">2 pts each</span>
                    Brainstem
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">M</span>
                      <div>
                        <span className="text-sm font-medium text-teal-700 dark:text-teal-400">Midbrain</span>
                        <span className="text-xs text-teal-500 dark:text-teal-500 ml-2">(2 points)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">P</span>
                      <div>
                        <span className="text-sm font-medium text-teal-700 dark:text-teal-400">Pons</span>
                        <span className="text-xs text-teal-500 dark:text-teal-500 ml-2">(2 points)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thalamus - 1 point each */}
                <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h5 className="font-medium text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-teal-200 dark:bg-teal-800 rounded text-xs font-bold">1 pt each</span>
                    Thalamus
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">TL</span>
                      <span className="text-sm text-teal-700 dark:text-teal-400">Left Thalamus (1 point)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">TR</span>
                      <span className="text-sm text-teal-700 dark:text-teal-400">Right Thalamus (1 point)</span>
                    </div>
                  </div>
                </div>

                {/* Cerebellum - 1 point each */}
                <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h5 className="font-medium text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-teal-200 dark:bg-teal-800 rounded text-xs font-bold">1 pt each</span>
                    Cerebellum
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">CL</span>
                      <span className="text-sm text-teal-700 dark:text-teal-400">Left Cerebellum (1 point)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">CR</span>
                      <span className="text-sm text-teal-700 dark:text-teal-400">Right Cerebellum (1 point)</span>
                    </div>
                  </div>
                </div>

                {/* Occipital/PCA - 1 point each */}
                <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h5 className="font-medium text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-teal-200 dark:bg-teal-800 rounded text-xs font-bold">1 pt each</span>
                    PCA Territory (Occipital)
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">OL</span>
                      <span className="text-sm text-teal-700 dark:text-teal-400">Left PCA/Occipital (1 point)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">OR</span>
                      <span className="text-sm text-teal-700 dark:text-teal-400">Right PCA/Occipital (1 point)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <p className="text-xs text-teal-600 dark:text-teal-400">
                <strong>Clinical Notes:</strong> pc-ASPECTS is used for basilar artery occlusion and posterior circulation strokes. 
                DWI-MRI is more sensitive than CT for posterior fossa ischemia. pc-ASPECTS ≥8 associated with good outcomes after thrombectomy. 
                Brainstem involvement carries worse prognosis, hence higher point weighting. BASILAR trial used pc-ASPECTS for patient selection.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// CHA2DS2-VASc Score Calculator Component
function CHA2DS2VAScCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<Set<string>>(new Set());

  const toggleCriteria = (id: string) => {
    const newSet = new Set(criteria);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      // Handle mutually exclusive age groups
      if (id === "age_75" && newSet.has("age_65_74")) {
        newSet.delete("age_65_74");
      } else if (id === "age_65_74" && newSet.has("age_75")) {
        newSet.delete("age_75");
      }
      newSet.add(id);
    }
    setCriteria(newSet);
  };

  const criteriaItems = [
    { id: "chf", letter: "C", name: "Congestive Heart Failure", desc: "Heart failure or LVEF ≤40%", points: 1 },
    { id: "htn", letter: "H", name: "Hypertension", desc: "BP >140/90 or on antihypertensive therapy", points: 1 },
    { id: "age_75", letter: "A₂", name: "Age ≥75 years", desc: "Age 75 years or older", points: 2 },
    { id: "dm", letter: "D", name: "Diabetes Mellitus", desc: "Fasting glucose >125 mg/dL or on treatment", points: 1 },
    { id: "stroke", letter: "S₂", name: "Stroke/TIA/Thromboembolism", desc: "Prior stroke, TIA, or systemic embolism", points: 2 },
    { id: "vascular", letter: "V", name: "Vascular Disease", desc: "Prior MI, PAD, or aortic plaque", points: 1 },
    { id: "age_65_74", letter: "A", name: "Age 65-74 years", desc: "Age between 65 and 74 years", points: 1 },
    { id: "female", letter: "Sc", name: "Sex Category (Female)", desc: "Female sex", points: 1 },
  ];

  const totalScore = criteriaItems.reduce((sum, item) => {
    return sum + (criteria.has(item.id) ? item.points : 0);
  }, 0);

  const getRiskLevel = (score: number) => {
    if (score === 0) return { level: "Low", color: "bg-green-500", annualRisk: "0.2%", recommendation: "No antithrombotic therapy or aspirin" };
    if (score === 1) return { level: "Low-Moderate", color: "bg-yellow-500", annualRisk: "0.6-2.8%", recommendation: "Consider oral anticoagulant (OAC) or aspirin" };
    if (score === 2) return { level: "Moderate", color: "bg-orange-500", annualRisk: "2.2-4.0%", recommendation: "Oral anticoagulant recommended" };
    if (score <= 4) return { level: "Moderate-High", color: "bg-orange-600", annualRisk: "4.0-6.7%", recommendation: "Oral anticoagulant recommended" };
    return { level: "High", color: "bg-red-500", annualRisk: "6.7-15.2%", recommendation: "Oral anticoagulant strongly recommended" };
  };

  const risk = getRiskLevel(totalScore);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-indigo-100/50 dark:bg-indigo-900/30">
            <CardTitle className="flex items-center justify-between text-indigo-800 dark:text-indigo-300">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                CHA₂DS₂-VASc Score Calculator (0-9)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Score Display */}
            <div className="mb-6 p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 ${risk.color} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                    {totalScore}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-indigo-800 dark:text-indigo-300">{risk.level} Risk</div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400">Annual Stroke Risk: {risk.annualRisk}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-indigo-950/50 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">Recommendation</div>
                  <div className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">{risk.recommendation}</div>
                </div>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div className="space-y-3">
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">Risk Factors (Select all that apply)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criteriaItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      criteria.has(item.id) 
                        ? 'bg-indigo-200 dark:bg-indigo-800/50 border border-indigo-400 dark:border-indigo-600' 
                        : 'bg-white dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                    }`}
                    onClick={() => toggleCriteria(item.id)}
                  >
                    <Checkbox 
                      checked={criteria.has(item.id)} 
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {item.letter}
                        </span>
                        <span className="font-medium text-sm text-indigo-800 dark:text-indigo-300">{item.name}</span>
                        <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${item.points === 2 ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' : 'bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200'}`}>
                          +{item.points}
                        </span>
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-500 mt-1 ml-10">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Stratification Table */}
            <div className="mt-6 overflow-x-auto">
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">Annual Stroke Risk by Score</h4>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-2">
                  <div className="font-bold text-green-800 dark:text-green-300">0</div>
                  <div className="text-green-600 dark:text-green-400">0.2%</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-2">
                  <div className="font-bold text-yellow-800 dark:text-yellow-300">1</div>
                  <div className="text-yellow-600 dark:text-yellow-400">0.6%</div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/40 rounded p-2">
                  <div className="font-bold text-orange-800 dark:text-orange-300">2</div>
                  <div className="text-orange-600 dark:text-orange-400">2.2%</div>
                </div>
                <div className="bg-orange-200 dark:bg-orange-900/50 rounded p-2">
                  <div className="font-bold text-orange-800 dark:text-orange-300">3-4</div>
                  <div className="text-orange-600 dark:text-orange-400">4.0-6.7%</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/40 rounded p-2">
                  <div className="font-bold text-red-800 dark:text-red-300">≥5</div>
                  <div className="text-red-600 dark:text-red-400">6.7-15%</div>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-700 rounded-lg">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                <strong>Clinical Notes:</strong> CHA₂DS₂-VASc guides anticoagulation in non-valvular AF. Score ≥2 (men) or ≥3 (women) indicates OAC benefit. 
                Female sex alone (score=1) does not warrant OAC. Consider bleeding risk (HAS-BLED) when deciding therapy. 
                DOACs preferred over warfarin in most patients. LAA occlusion is an alternative for OAC-contraindicated patients.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// uACR Cardiovascular Risk Reference Component
function UACRCardiovascularRisk() {
  const [isOpen, setIsOpen] = useState(false);

  const uacrCategories = [
    { range: "<30", label: "Normal to Mildly Increased", color: "bg-green-500", risk: "Baseline CV risk", category: "A1" },
    { range: "30-300", label: "Moderately Increased (Microalbuminuria)", color: "bg-yellow-500", risk: "1.5-2x CV risk", category: "A2" },
    { range: ">300", label: "Severely Increased (Macroalbuminuria)", color: "bg-red-500", risk: "3-4x CV risk", category: "A3" },
  ];

  const keyOutcomes = [
    { outcome: "Heart Failure", icon: "❤️", description: "Strong dose-response relationship; even mild albuminuria increases risk" },
    { outcome: "Myocardial Infarction", icon: "💔", description: "Independent predictor regardless of traditional risk factors" },
    { outcome: "Stroke", icon: "🧠", description: "Significant association, especially in diabetic and hypertensive patients" },
    { outcome: "CV Death", icon: "⚠️", description: "Graded relationship with mortality; no safe threshold identified" },
    { outcome: "All-cause Hospitalization", icon: "🏥", description: "Elevated uACR predicts increased healthcare utilization" },
  ];

  const treatments = [
    { name: "ACE Inhibitors / ARBs", mechanism: "RAAS blockade reduces intraglomerular pressure", evidence: "First-line for albuminuria reduction" },
    { name: "SGLT2 Inhibitors", mechanism: "Nephroprotective beyond glucose control", evidence: "DAPA-CKD, CREDENCE, EMPA-KIDNEY trials" },
    { name: "Non-steroidal MRAs", mechanism: "Finerenone reduces inflammation and fibrosis", evidence: "FIDELIO-DKD, FIGARO-DKD trials" },
    { name: "BP Control", mechanism: "Target <130/80 mmHg", evidence: "Reduces albuminuria progression" },
  ];

  const screeningIndications = [
    "Diabetes mellitus (annual screening)",
    "Hypertension",
    "Chronic kidney disease (all stages)",
    "Heart failure",
    "Atherosclerotic cardiovascular disease",
    "Family history of kidney disease",
    "Obesity / Metabolic syndrome",
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50 dark:from-teal-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-teal-100/50 dark:bg-teal-900/30">
            <CardTitle className="flex items-center justify-between text-teal-800 dark:text-teal-300">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                uACR - Cardiovascular Risk Biomarker
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Key Message Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 rounded-lg border border-teal-200 dark:border-teal-700">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-teal-800 dark:text-teal-300 mb-1">Key Takeaway</h4>
                  <p className="text-sm text-teal-700 dark:text-teal-400">
                    Albuminuria is an early, inexpensive, actionable "red flag" for cardiovascular risk, comparable to blood pressure or LDL cholesterol. 
                    Routine measurement and treatment-guided monitoring of uACR can improve risk stratification, guide therapy, and help prevent future cardiovascular events.
                  </p>
                </div>
              </div>
            </div>

            {/* uACR Categories */}
            <div className="mb-6">
              <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-3">uACR Categories (mg/g or mg/mmol)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {uacrCategories.map((cat) => (
                  <div key={cat.range} className={`p-4 rounded-lg border ${
                    cat.category === "A1" ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20" :
                    cat.category === "A2" ? "border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20" :
                    "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 ${cat.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                        {cat.category}
                      </div>
                      <span className="font-bold text-sm">{cat.range} mg/g</span>
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{cat.label}</div>
                    <div className={`text-xs font-semibold ${
                      cat.category === "A1" ? "text-green-600 dark:text-green-400" :
                      cat.category === "A2" ? "text-yellow-600 dark:text-yellow-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>{cat.risk}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-teal-600 dark:text-teal-500 mt-2 italic">
                ⚠️ Large population studies ({">"}9 million individuals) demonstrate NO safe threshold - even low/mildly elevated levels increase CV risk
              </p>
            </div>

            {/* Key Clinical Outcomes */}
            <div className="mb-6">
              <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-3">Associated Cardiovascular Outcomes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {keyOutcomes.map((item) => (
                  <div key={item.outcome} className="p-3 bg-white dark:bg-teal-950/30 rounded-lg border border-teal-100 dark:border-teal-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-sm text-teal-800 dark:text-teal-300">{item.outcome}</span>
                    </div>
                    <p className="text-xs text-teal-600 dark:text-teal-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Clinical Points */}
            <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-2">Critical Clinical Points</h4>
              <ul className="space-y-2 text-xs text-cyan-700 dark:text-cyan-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span><strong>Beyond Kidney Disease:</strong> Albuminuria is a marker of systemic vascular injury and endothelial dysfunction, not just renal pathology</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span><strong>Preserved eGFR:</strong> Albuminuria adds prognostic value even when eGFR is normal (CKD stages 1-2)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span><strong>PREVENT Score:</strong> AHA now includes uACR and eGFR in cardiovascular risk assessment tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span><strong>Modifiable:</strong> Unlike many biomarkers, albuminuria responds to treatment and reduction correlates with improved outcomes</span>
                </li>
              </ul>
            </div>

            {/* Treatments That Reduce Albuminuria */}
            <div className="mb-6">
              <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-3">Evidence-Based Treatments to Reduce Albuminuria</h4>
              <div className="space-y-2">
                {treatments.map((tx) => (
                  <div key={tx.name} className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-100 dark:border-teal-800">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                      <div>
                        <span className="font-medium text-sm text-teal-800 dark:text-teal-300">{tx.name}</span>
                        <span className="text-xs text-teal-600 dark:text-teal-500 ml-2">— {tx.mechanism}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200 rounded">{tx.evidence}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who to Screen */}
            <div className="mb-6">
              <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-3">Who Should Be Screened for uACR?</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {screeningIndications.map((indication) => (
                  <div key={indication} className="p-2 bg-white dark:bg-teal-950/30 rounded border border-teal-100 dark:border-teal-800 text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1">
                    <span className="text-teal-500">✓</span>
                    {indication}
                  </div>
                ))}
              </div>
            </div>

            {/* Underutilization Warning */}
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Clinical Practice Gap:</strong> Despite strong evidence, uACR remains underused because it has traditionally been viewed as a "kidney-only" test. 
                  Experts emphasize making uACR routine, standardized, and embedded in clinical workflows for all high-risk patients.
                </p>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <p className="text-xs text-teal-600 dark:text-teal-400">
                <strong>References:</strong> Kidney Disease: Improving Global Outcomes (KDIGO) 2024 Guidelines | AHA PREVENT Score (2023) | 
                DAPA-CKD, CREDENCE, EMPA-KIDNEY, FIDELIO-DKD, FIGARO-DKD Trials | CKD Prognosis Consortium ({">"}9 million participants meta-analysis)
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// eGFR Calculator with KDIGO CKD Staging Component
function EGFRCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [creatinine, setCreatinine] = useState<string>("");
  const [uacr, setUacr] = useState<string>("");

  // CKD-EPI 2021 equation (race-free)
  const calculateEGFR = (): number | null => {
    const ageNum = parseFloat(age);
    const creatNum = parseFloat(creatinine);
    if (!ageNum || !creatNum || !sex) return null;

    const isFemale = sex === "female";
    const k = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const scrOverK = creatNum / k;
    
    let eGFR = 142 * 
      Math.pow(Math.min(scrOverK, 1), alpha) * 
      Math.pow(Math.max(scrOverK, 1), -1.200) * 
      Math.pow(0.9938, ageNum);
    
    if (isFemale) eGFR *= 1.012;
    
    return Math.round(eGFR);
  };

  const getGFRStage = (egfr: number) => {
    if (egfr >= 90) return { stage: "G1", label: "Normal or High", color: "bg-green-500" };
    if (egfr >= 60) return { stage: "G2", label: "Mildly Decreased", color: "bg-green-400" };
    if (egfr >= 45) return { stage: "G3a", label: "Mildly to Moderately Decreased", color: "bg-yellow-400" };
    if (egfr >= 30) return { stage: "G3b", label: "Moderately to Severely Decreased", color: "bg-orange-400" };
    if (egfr >= 15) return { stage: "G4", label: "Severely Decreased", color: "bg-orange-600" };
    return { stage: "G5", label: "Kidney Failure", color: "bg-red-600" };
  };

  const getUACRCategory = (uacrVal: number) => {
    if (uacrVal < 30) return { category: "A1", label: "Normal to Mildly Increased", color: "bg-green-500" };
    if (uacrVal <= 300) return { category: "A2", label: "Moderately Increased", color: "bg-yellow-500" };
    return { category: "A3", label: "Severely Increased", color: "bg-red-500" };
  };

  // KDIGO Risk Categories based on GFR and UACR
  const getKDIGORisk = (egfr: number, uacrVal: number): { risk: string; color: string; prognosis: string } => {
    const gStage = getGFRStage(egfr).stage;
    const aCategory = getUACRCategory(uacrVal).category;

    // Risk matrix based on KDIGO 2024 guidelines
    const riskMatrix: Record<string, Record<string, { risk: string; color: string; prognosis: string }>> = {
      G1: {
        A1: { risk: "Low", color: "bg-green-500", prognosis: "No CKD without other kidney damage markers" },
        A2: { risk: "Moderately Increased", color: "bg-yellow-500", prognosis: "CKD - Monitor annually" },
        A3: { risk: "High", color: "bg-orange-500", prognosis: "CKD - Refer to nephrology" },
      },
      G2: {
        A1: { risk: "Low", color: "bg-green-500", prognosis: "No CKD without other kidney damage markers" },
        A2: { risk: "Moderately Increased", color: "bg-yellow-500", prognosis: "CKD - Monitor annually" },
        A3: { risk: "High", color: "bg-orange-500", prognosis: "CKD - Refer to nephrology" },
      },
      G3a: {
        A1: { risk: "Moderately Increased", color: "bg-yellow-500", prognosis: "CKD - Monitor annually" },
        A2: { risk: "High", color: "bg-orange-500", prognosis: "CKD - Monitor every 6 months" },
        A3: { risk: "Very High", color: "bg-red-500", prognosis: "CKD - Refer to nephrology" },
      },
      G3b: {
        A1: { risk: "High", color: "bg-orange-500", prognosis: "CKD - Monitor every 6 months" },
        A2: { risk: "Very High", color: "bg-red-500", prognosis: "CKD - Refer to nephrology" },
        A3: { risk: "Very High", color: "bg-red-600", prognosis: "CKD - Urgent nephrology referral" },
      },
      G4: {
        A1: { risk: "Very High", color: "bg-red-500", prognosis: "CKD - Refer to nephrology" },
        A2: { risk: "Very High", color: "bg-red-600", prognosis: "CKD - Urgent nephrology referral" },
        A3: { risk: "Very High", color: "bg-red-700", prognosis: "CKD - Urgent nephrology referral" },
      },
      G5: {
        A1: { risk: "Very High", color: "bg-red-600", prognosis: "CKD - Urgent nephrology referral" },
        A2: { risk: "Very High", color: "bg-red-700", prognosis: "CKD - Urgent nephrology referral" },
        A3: { risk: "Very High", color: "bg-red-800", prognosis: "CKD - Urgent nephrology referral" },
      },
    };

    return riskMatrix[gStage]?.[aCategory] || { risk: "Unknown", color: "bg-gray-400", prognosis: "Enter values" };
  };

  const egfr = calculateEGFR();
  const uacrNum = parseFloat(uacr) || 0;
  const gfrStage = egfr ? getGFRStage(egfr) : null;
  const uacrCategory = uacrNum > 0 ? getUACRCategory(uacrNum) : null;
  const kdigoRisk = egfr && uacrNum > 0 ? getKDIGORisk(egfr, uacrNum) : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-emerald-100/50 dark:bg-emerald-900/30">
            <CardTitle className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                eGFR Calculator & KDIGO CKD Staging
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Input Fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Age (years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="30-79"
                  className="w-full p-2 border border-emerald-200 dark:border-emerald-700 rounded-lg bg-white dark:bg-emerald-950/30 text-sm"
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full p-2 border border-emerald-200 dark:border-emerald-700 rounded-lg bg-white dark:bg-emerald-950/30 text-sm"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Serum Cr (mg/dL)</label>
                <input
                  type="number"
                  value={creatinine}
                  onChange={(e) => setCreatinine(e.target.value)}
                  placeholder="0.5-10"
                  step="0.1"
                  className="w-full p-2 border border-emerald-200 dark:border-emerald-700 rounded-lg bg-white dark:bg-emerald-950/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">uACR (mg/g)</label>
                <input
                  type="number"
                  value={uacr}
                  onChange={(e) => setUacr(e.target.value)}
                  placeholder="0-5000"
                  className="w-full p-2 border border-emerald-200 dark:border-emerald-700 rounded-lg bg-white dark:bg-emerald-950/30 text-sm"
                />
              </div>
            </div>

            {/* Results Display */}
            {egfr && (
              <div className="mb-6 p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* eGFR Result */}
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 ${gfrStage?.color} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {egfr}
                    </div>
                    <div>
                      <div className="text-sm text-emerald-600 dark:text-emerald-400">eGFR (mL/min/1.73m²)</div>
                      <div className="font-bold text-emerald-800 dark:text-emerald-300">{gfrStage?.stage}: {gfrStage?.label}</div>
                    </div>
                  </div>
                  
                  {/* uACR Result */}
                  {uacrCategory && (
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 ${uacrCategory.color} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                        {uacrCategory.category}
                      </div>
                      <div>
                        <div className="text-sm text-emerald-600 dark:text-emerald-400">uACR Category</div>
                        <div className="font-bold text-emerald-800 dark:text-emerald-300">{uacrCategory.label}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* KDIGO Risk */}
                  {kdigoRisk && (
                    <div className="p-3 bg-white dark:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 ${kdigoRisk.color} rounded-full`}></div>
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">{kdigoRisk.risk} Risk</span>
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-500">{kdigoRisk.prognosis}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* KDIGO Heat Map */}
            <div className="mb-6">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">KDIGO CKD Classification Heat Map</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30" rowSpan={2}>GFR Category</th>
                      <th className="p-2 border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30" rowSpan={2}>eGFR (mL/min/1.73m²)</th>
                      <th className="p-2 border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30" colSpan={3}>Persistent Albuminuria Categories (uACR mg/g)</th>
                    </tr>
                    <tr>
                      <th className="p-2 border border-emerald-200 dark:border-emerald-700 bg-green-100 dark:bg-green-900/30">A1: {"<"}30<br/>Normal</th>
                      <th className="p-2 border border-emerald-200 dark:border-emerald-700 bg-yellow-100 dark:bg-yellow-900/30">A2: 30-300<br/>Moderate</th>
                      <th className="p-2 border border-emerald-200 dark:border-emerald-700 bg-orange-100 dark:bg-orange-900/30">A3: {">"}300<br/>Severe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700 font-medium">G1</td>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700">≥90</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-green-200 dark:bg-green-800/50 text-center ${egfr && egfr >= 90 && uacrNum < 30 ? 'ring-2 ring-blue-500' : ''}`}>Low Risk</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-yellow-200 dark:bg-yellow-800/50 text-center ${egfr && egfr >= 90 && uacrNum >= 30 && uacrNum <= 300 ? 'ring-2 ring-blue-500' : ''}`}>Moderate</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-orange-300 dark:bg-orange-800/50 text-center ${egfr && egfr >= 90 && uacrNum > 300 ? 'ring-2 ring-blue-500' : ''}`}>High</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700 font-medium">G2</td>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700">60-89</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-green-200 dark:bg-green-800/50 text-center ${egfr && egfr >= 60 && egfr < 90 && uacrNum < 30 ? 'ring-2 ring-blue-500' : ''}`}>Low Risk</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-yellow-200 dark:bg-yellow-800/50 text-center ${egfr && egfr >= 60 && egfr < 90 && uacrNum >= 30 && uacrNum <= 300 ? 'ring-2 ring-blue-500' : ''}`}>Moderate</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-orange-300 dark:bg-orange-800/50 text-center ${egfr && egfr >= 60 && egfr < 90 && uacrNum > 300 ? 'ring-2 ring-blue-500' : ''}`}>High</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700 font-medium">G3a</td>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700">45-59</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-yellow-200 dark:bg-yellow-800/50 text-center ${egfr && egfr >= 45 && egfr < 60 && uacrNum < 30 ? 'ring-2 ring-blue-500' : ''}`}>Moderate</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-orange-300 dark:bg-orange-800/50 text-center ${egfr && egfr >= 45 && egfr < 60 && uacrNum >= 30 && uacrNum <= 300 ? 'ring-2 ring-blue-500' : ''}`}>High</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-400 dark:bg-red-800/50 text-center text-white ${egfr && egfr >= 45 && egfr < 60 && uacrNum > 300 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700 font-medium">G3b</td>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700">30-44</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-orange-300 dark:bg-orange-800/50 text-center ${egfr && egfr >= 30 && egfr < 45 && uacrNum < 30 ? 'ring-2 ring-blue-500' : ''}`}>High</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-400 dark:bg-red-800/50 text-center text-white ${egfr && egfr >= 30 && egfr < 45 && uacrNum >= 30 && uacrNum <= 300 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-500 dark:bg-red-900/50 text-center text-white ${egfr && egfr >= 30 && egfr < 45 && uacrNum > 300 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700 font-medium">G4</td>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700">15-29</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-400 dark:bg-red-800/50 text-center text-white ${egfr && egfr >= 15 && egfr < 30 && uacrNum < 30 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-500 dark:bg-red-900/50 text-center text-white ${egfr && egfr >= 15 && egfr < 30 && uacrNum >= 30 && uacrNum <= 300 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-600 dark:bg-red-950/50 text-center text-white ${egfr && egfr >= 15 && egfr < 30 && uacrNum > 300 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700 font-medium">G5</td>
                      <td className="p-2 border border-emerald-200 dark:border-emerald-700">{"<"}15</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-500 dark:bg-red-900/50 text-center text-white ${egfr && egfr < 15 && uacrNum < 30 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-600 dark:bg-red-950/50 text-center text-white ${egfr && egfr < 15 && uacrNum >= 30 && uacrNum <= 300 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                      <td className={`p-2 border border-emerald-200 dark:border-emerald-700 bg-red-700 dark:bg-red-950/70 text-center text-white ${egfr && egfr < 15 && uacrNum > 300 ? 'ring-2 ring-blue-500' : ''}`}>Very High</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2 italic">
                Green = Low risk | Yellow = Moderate risk | Orange = High risk | Red = Very high risk. 
                Blue ring highlights current patient position.
              </p>
            </div>

            {/* CKD-EPI Equation Info */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                <strong>Formula:</strong> CKD-EPI 2021 Creatinine Equation (Race-Free) | 
                <strong> References:</strong> Inker LA et al. NEJM 2021 | KDIGO 2024 CKD Guideline | 
                eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^Age × 1.012 [if female]
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
// PREVENTScoreCalculator is now imported from ./PREVENTScoreCalculator.tsx

// HAS-BLED Score Calculator Component
function HASBLEDCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<Set<string>>(new Set());

  const toggleCriteria = (id: string) => {
    const newSet = new Set(criteria);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCriteria(newSet);
  };

  const criteriaItems = [
    { id: "htn", letter: "H", name: "Hypertension", desc: "Uncontrolled, systolic BP >160 mmHg", points: 1 },
    { id: "renal", letter: "A", name: "Abnormal Renal Function", desc: "Dialysis, transplant, Cr >2.26 mg/dL or >200 μmol/L", points: 1 },
    { id: "liver", letter: "A", name: "Abnormal Liver Function", desc: "Cirrhosis, bilirubin >2x ULN, AST/ALT/ALP >3x ULN", points: 1 },
    { id: "stroke", letter: "S", name: "Stroke History", desc: "Prior stroke (ischemic or hemorrhagic)", points: 1 },
    { id: "bleeding", letter: "B", name: "Bleeding History/Predisposition", desc: "Prior major bleed, anemia, or bleeding diathesis", points: 1 },
    { id: "inr", letter: "L", name: "Labile INR", desc: "Unstable/high INRs, TTR <60% (if on warfarin)", points: 1 },
    { id: "elderly", letter: "E", name: "Elderly", desc: "Age >65 years", points: 1 },
    { id: "drugs", letter: "D", name: "Drugs", desc: "Antiplatelet agents, NSAIDs", points: 1 },
    { id: "alcohol", letter: "D", name: "Alcohol", desc: "≥8 drinks/week", points: 1 },
  ];

  const totalScore = criteriaItems.reduce((sum, item) => {
    return sum + (criteria.has(item.id) ? item.points : 0);
  }, 0);

  const getRiskLevel = (score: number) => {
    if (score === 0) return { level: "Low", color: "bg-green-500", annualRisk: "0.9%", interpretation: "Anticoagulation generally safe" };
    if (score === 1) return { level: "Low", color: "bg-green-400", annualRisk: "3.4%", interpretation: "Anticoagulation generally safe" };
    if (score === 2) return { level: "Moderate", color: "bg-yellow-500", annualRisk: "4.1%", interpretation: "Anticoagulation with caution, address modifiable factors" };
    if (score === 3) return { level: "High", color: "bg-orange-500", annualRisk: "5.8%", interpretation: "Consider alternatives, address modifiable risk factors" };
    if (score === 4) return { level: "High", color: "bg-orange-600", annualRisk: "8.9%", interpretation: "High bleeding risk, careful consideration needed" };
    return { level: "Very High", color: "bg-red-500", annualRisk: "9.1%+", interpretation: "Very high bleeding risk, consider alternatives to anticoagulation" };
  };

  const risk = getRiskLevel(totalScore);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-rose-300 dark:border-rose-700 bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-rose-100/50 dark:bg-rose-900/30">
            <CardTitle className="flex items-center justify-between text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                HAS-BLED Score Calculator (0-9)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Score Display */}
            <div className="mb-6 p-4 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 ${risk.color} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                    {totalScore}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-rose-800 dark:text-rose-300">{risk.level} Bleeding Risk</div>
                    <div className="text-sm text-rose-600 dark:text-rose-400">Annual Major Bleeding Risk: {risk.annualRisk}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-rose-950/50 rounded-lg p-3 border border-rose-200 dark:border-rose-700">
                  <div className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">Interpretation</div>
                  <div className="text-sm font-semibold text-rose-800 dark:text-rose-300">{risk.interpretation}</div>
                </div>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div className="space-y-3">
              <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-3">Risk Factors (Select all that apply)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criteriaItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      criteria.has(item.id) 
                        ? 'bg-rose-200 dark:bg-rose-800/50 border border-rose-400 dark:border-rose-600' 
                        : 'bg-white dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                    }`}
                    onClick={() => toggleCriteria(item.id)}
                  >
                    <Checkbox 
                      checked={criteria.has(item.id)} 
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {item.letter}
                        </span>
                        <span className="font-medium text-sm text-rose-800 dark:text-rose-300">{item.name}</span>
                        <span className="ml-auto px-2 py-0.5 rounded text-xs font-bold bg-rose-200 dark:bg-rose-700 text-rose-800 dark:text-rose-200">
                          +{item.points}
                        </span>
                      </div>
                      <div className="text-xs text-rose-600 dark:text-rose-500 mt-1 ml-10">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modifiable Risk Factors */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-700 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Modifiable Risk Factors</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-2 text-center text-green-700 dark:text-green-400">
                  <div className="font-medium">H</div>
                  <div className="text-xs">Control BP</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-2 text-center text-green-700 dark:text-green-400">
                  <div className="font-medium">L</div>
                  <div className="text-xs">Improve TTR / Use DOAC</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-2 text-center text-green-700 dark:text-green-400">
                  <div className="font-medium">D</div>
                  <div className="text-xs">Stop NSAIDs/antiplatelets</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-2 text-center text-green-700 dark:text-green-400">
                  <div className="font-medium">D</div>
                  <div className="text-xs">Reduce alcohol</div>
                </div>
              </div>
            </div>

            {/* Risk Stratification Table */}
            <div className="mt-6 overflow-x-auto">
              <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-3">Annual Major Bleeding Risk by Score</h4>
              <div className="grid grid-cols-6 gap-2 text-center text-xs">
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-2">
                  <div className="font-bold text-green-800 dark:text-green-300">0</div>
                  <div className="text-green-600 dark:text-green-400">0.9%</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-2">
                  <div className="font-bold text-green-800 dark:text-green-300">1</div>
                  <div className="text-green-600 dark:text-green-400">3.4%</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-2">
                  <div className="font-bold text-yellow-800 dark:text-yellow-300">2</div>
                  <div className="text-yellow-600 dark:text-yellow-400">4.1%</div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/40 rounded p-2">
                  <div className="font-bold text-orange-800 dark:text-orange-300">3</div>
                  <div className="text-orange-600 dark:text-orange-400">5.8%</div>
                </div>
                <div className="bg-orange-200 dark:bg-orange-900/50 rounded p-2">
                  <div className="font-bold text-orange-800 dark:text-orange-300">4</div>
                  <div className="text-orange-600 dark:text-orange-400">8.9%</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/40 rounded p-2">
                  <div className="font-bold text-red-800 dark:text-red-300">≥5</div>
                  <div className="text-red-600 dark:text-red-400">9.1%+</div>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 rounded-lg">
              <p className="text-xs text-rose-600 dark:text-rose-400">
                <strong>Clinical Notes:</strong> HAS-BLED ≥3 indicates high bleeding risk but is NOT a contraindication to anticoagulation. 
                Use to identify modifiable risk factors. High CHA₂DS₂-VASc often outweighs high HAS-BLED. 
                DOACs have lower major bleeding rates than warfarin, especially intracranial hemorrhage. 
                Reassess bleeding risk periodically.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ABCD2 Score Calculator Component
function ABCD2Calculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<Set<string>>(new Set());

  const toggleCriteria = (id: string) => {
    const newSet = new Set(criteria);
    
    // Handle mutually exclusive options
    if (id === "clinical_weakness") {
      newSet.delete("clinical_speech");
    } else if (id === "clinical_speech") {
      newSet.delete("clinical_weakness");
    }
    if (id === "duration_60") {
      newSet.delete("duration_10_59");
    } else if (id === "duration_10_59") {
      newSet.delete("duration_60");
    }
    
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCriteria(newSet);
  };

  const criteriaItems = [
    { id: "age", letter: "A", name: "Age ≥60 years", desc: "Patient is 60 years old or older", points: 1 },
    { id: "bp", letter: "B", name: "Blood Pressure ≥140/90", desc: "Initial BP ≥140 systolic and/or ≥90 diastolic", points: 1 },
    { id: "clinical_weakness", letter: "C", name: "Unilateral Weakness", desc: "Unilateral weakness during TIA", points: 2, exclusive: "clinical" },
    { id: "clinical_speech", letter: "C", name: "Speech Impairment (no weakness)", desc: "Speech disturbance without weakness", points: 1, exclusive: "clinical" },
    { id: "duration_60", letter: "D", name: "Duration ≥60 minutes", desc: "TIA symptoms lasted 60 minutes or longer", points: 2, exclusive: "duration" },
    { id: "duration_10_59", letter: "D", name: "Duration 10-59 minutes", desc: "TIA symptoms lasted 10-59 minutes", points: 1, exclusive: "duration" },
    { id: "diabetes", letter: "D", name: "Diabetes", desc: "History of diabetes mellitus", points: 1 },
  ];

  const totalScore = criteriaItems.reduce((sum, item) => {
    return sum + (criteria.has(item.id) ? item.points : 0);
  }, 0);

  const getRiskLevel = (score: number) => {
    if (score <= 1) return { level: "Low", color: "bg-green-500", day2Risk: "0%", day7Risk: "0.4%", day90Risk: "1.0%", recommendation: "Outpatient workup may be appropriate" };
    if (score <= 3) return { level: "Low-Moderate", color: "bg-yellow-500", day2Risk: "1.3%", day7Risk: "1.2%", day90Risk: "3.1%", recommendation: "Consider urgent evaluation within 24-48 hours" };
    if (score <= 5) return { level: "Moderate-High", color: "bg-orange-500", day2Risk: "4.1%", day7Risk: "5.9%", day90Risk: "9.8%", recommendation: "Urgent evaluation and admission recommended" };
    return { level: "High", color: "bg-red-500", day2Risk: "8.1%", day7Risk: "11.7%", day90Risk: "17.8%", recommendation: "Hospital admission strongly recommended" };
  };

  const risk = getRiskLevel(totalScore);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-sky-300 dark:border-sky-700 bg-gradient-to-br from-sky-50 dark:from-sky-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-sky-100/50 dark:bg-sky-900/30">
            <CardTitle className="flex items-center justify-between text-sky-800 dark:text-sky-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                ABCD² Score - TIA Stroke Risk (0-7)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Score Display */}
            <div className="mb-6 p-4 bg-sky-100 dark:bg-sky-900/40 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 ${risk.color} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                    {totalScore}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-sky-800 dark:text-sky-300">{risk.level} Risk</div>
                    <div className="text-sm text-sky-600 dark:text-sky-400">2-day stroke risk: {risk.day2Risk}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-sky-950/50 rounded-lg p-3 border border-sky-200 dark:border-sky-700">
                  <div className="text-xs font-medium text-sky-600 dark:text-sky-400 mb-1">Recommendation</div>
                  <div className="text-sm font-semibold text-sky-800 dark:text-sky-300">{risk.recommendation}</div>
                </div>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sky-800 dark:text-sky-300 mb-3">Risk Factors (Select all that apply)</h4>
              <div className="grid grid-cols-1 gap-3">
                {criteriaItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      criteria.has(item.id) 
                        ? 'bg-sky-200 dark:bg-sky-800/50 border border-sky-400 dark:border-sky-600' 
                        : 'bg-white dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/30'
                    }`}
                    onClick={() => toggleCriteria(item.id)}
                  >
                    <Checkbox 
                      checked={criteria.has(item.id)} 
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {item.letter}
                        </span>
                        <span className="font-medium text-sm text-sky-800 dark:text-sky-300">{item.name}</span>
                        <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${item.points === 2 ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200' : 'bg-sky-200 dark:bg-sky-700 text-sky-800 dark:text-sky-200'}`}>
                          +{item.points}
                        </span>
                      </div>
                      <div className="text-xs text-sky-600 dark:text-sky-500 mt-1 ml-10">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Stratification Table */}
            <div className="mt-6 overflow-x-auto">
              <h4 className="font-semibold text-sky-800 dark:text-sky-300 mb-3">Stroke Risk by Score</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-sky-200 dark:border-sky-700">
                    <th className="text-left py-2 px-2 text-sky-800 dark:text-sky-300">Score</th>
                    <th className="text-center py-2 px-2 text-sky-800 dark:text-sky-300">Risk Level</th>
                    <th className="text-center py-2 px-2 text-sky-800 dark:text-sky-300">2-Day</th>
                    <th className="text-center py-2 px-2 text-sky-800 dark:text-sky-300">7-Day</th>
                    <th className="text-center py-2 px-2 text-sky-800 dark:text-sky-300">90-Day</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-50 dark:bg-green-900/20">
                    <td className="py-2 px-2 font-medium">0-1</td>
                    <td className="py-2 px-2 text-center">Low</td>
                    <td className="py-2 px-2 text-center">0%</td>
                    <td className="py-2 px-2 text-center">0.4%</td>
                    <td className="py-2 px-2 text-center">1.0%</td>
                  </tr>
                  <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                    <td className="py-2 px-2 font-medium">2-3</td>
                    <td className="py-2 px-2 text-center">Low-Moderate</td>
                    <td className="py-2 px-2 text-center">1.3%</td>
                    <td className="py-2 px-2 text-center">1.2%</td>
                    <td className="py-2 px-2 text-center">3.1%</td>
                  </tr>
                  <tr className="bg-orange-50 dark:bg-orange-900/20">
                    <td className="py-2 px-2 font-medium">4-5</td>
                    <td className="py-2 px-2 text-center">Moderate-High</td>
                    <td className="py-2 px-2 text-center">4.1%</td>
                    <td className="py-2 px-2 text-center">5.9%</td>
                    <td className="py-2 px-2 text-center">9.8%</td>
                  </tr>
                  <tr className="bg-red-50 dark:bg-red-900/20">
                    <td className="py-2 px-2 font-medium">6-7</td>
                    <td className="py-2 px-2 text-center">High</td>
                    <td className="py-2 px-2 text-center">8.1%</td>
                    <td className="py-2 px-2 text-center">11.7%</td>
                    <td className="py-2 px-2 text-center">17.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-700 rounded-lg">
              <p className="text-xs text-sky-600 dark:text-sky-400">
                <strong>Clinical Notes:</strong> ABCD² score helps stratify TIA patients for urgent workup. 
                Score ≥4 generally warrants hospital admission. Imaging (MRI DWI, vessel imaging) is essential regardless of score. 
                ABCD² does not replace clinical judgment – consider mechanism, vessel imaging, and other risk factors. 
                Dual antiplatelet therapy (DAPT) for 21 days reduces early recurrent stroke in high-risk TIA.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ICH Score Calculator Component
function ICHScoreCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<Set<string>>(new Set());

  const toggleCriteria = (id: string) => {
    const newSet = new Set(criteria);
    
    // Handle mutually exclusive GCS options
    if (id.startsWith("gcs_")) {
      newSet.delete("gcs_3_4");
      newSet.delete("gcs_5_12");
      newSet.delete("gcs_13_15");
    }
    
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCriteria(newSet);
  };

  const criteriaItems = [
    { id: "gcs_3_4", name: "GCS Score 3-4", desc: "Glasgow Coma Scale 3-4", points: 2, group: "gcs" },
    { id: "gcs_5_12", name: "GCS Score 5-12", desc: "Glasgow Coma Scale 5-12", points: 1, group: "gcs" },
    { id: "gcs_13_15", name: "GCS Score 13-15", desc: "Glasgow Coma Scale 13-15 (select if applicable)", points: 0, group: "gcs" },
    { id: "volume", name: "ICH Volume ≥30 mL", desc: "Hemorrhage volume ≥30 cm³ on CT (ABC/2 method)", points: 1 },
    { id: "ivh", name: "Intraventricular Hemorrhage", desc: "Blood present in ventricles on CT", points: 1 },
    { id: "infratentorial", name: "Infratentorial Origin", desc: "Hemorrhage origin in brainstem or cerebellum", points: 1 },
    { id: "age", name: "Age ≥80 years", desc: "Patient is 80 years old or older", points: 1 },
  ];

  const totalScore = criteriaItems.reduce((sum, item) => {
    return sum + (criteria.has(item.id) ? item.points : 0);
  }, 0);

  const getMortalityRisk = (score: number) => {
    const risks = [
      { score: 0, mortality: "0%", color: "bg-green-500" },
      { score: 1, mortality: "13%", color: "bg-yellow-500" },
      { score: 2, mortality: "26%", color: "bg-orange-400" },
      { score: 3, mortality: "72%", color: "bg-orange-600" },
      { score: 4, mortality: "97%", color: "bg-red-500" },
      { score: 5, mortality: "100%", color: "bg-red-700" },
      { score: 6, mortality: "100%", color: "bg-red-900" },
    ];
    return risks[Math.min(score, 6)];
  };

  const risk = getMortalityRisk(totalScore);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 dark:from-red-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-red-100/50 dark:bg-red-900/30">
            <CardTitle className="flex items-center justify-between text-red-800 dark:text-red-300">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                ICH Score - Hemorrhage Prognosis (0-6)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Score Display */}
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 ${risk.color} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                    {totalScore}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-800 dark:text-red-300">30-Day Mortality</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{risk.mortality}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-red-950/50 rounded-lg p-3 border border-red-200 dark:border-red-700">
                  <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Important Note</div>
                  <div className="text-sm text-red-800 dark:text-red-300">Score should not be used alone to limit care</div>
                </div>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div className="space-y-3">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3">Clinical & Imaging Criteria</h4>
              
              {/* GCS Group */}
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Glasgow Coma Scale (select one)</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {criteriaItems.filter(i => i.group === "gcs").map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        criteria.has(item.id) 
                          ? 'bg-red-200 dark:bg-red-800/50 border border-red-400' 
                          : 'bg-white dark:bg-red-950/30 border border-red-100 dark:border-red-800 hover:bg-red-100'
                      }`}
                      onClick={() => toggleCriteria(item.id)}
                    >
                      <Checkbox checked={criteria.has(item.id)} />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{item.name}</span>
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-bold ${item.points === 2 ? 'bg-red-500 text-white' : item.points === 1 ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'}`}>
                          +{item.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criteriaItems.filter(i => !i.group).map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      criteria.has(item.id) 
                        ? 'bg-red-200 dark:bg-red-800/50 border border-red-400 dark:border-red-600' 
                        : 'bg-white dark:bg-red-950/30 border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                    onClick={() => toggleCriteria(item.id)}
                  >
                    <Checkbox 
                      checked={criteria.has(item.id)} 
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-red-800 dark:text-red-300">{item.name}</span>
                        <span className="ml-auto px-2 py-0.5 rounded text-xs font-bold bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200">
                          +{item.points}
                        </span>
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-500 mt-1">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mortality Table */}
            <div className="mt-6 overflow-x-auto">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3">30-Day Mortality by ICH Score</h4>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {[0, 1, 2, 3, 4, 5, 6].map((score) => {
                  const r = getMortalityRisk(score);
                  return (
                    <div key={score} className={`${r.color} text-white rounded p-2`}>
                      <div className="font-bold text-lg">{score}</div>
                      <div>{r.mortality}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ABC/2 Formula */}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">ICH Volume Calculation (ABC/2)</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Volume (mL) = (A × B × C) / 2</strong><br/>
                A = largest diameter on axial CT (cm)<br/>
                B = diameter perpendicular to A (cm)<br/>
                C = number of CT slices with hemorrhage × slice thickness (cm)
              </p>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Clinical Notes:</strong> ICH Score predicts 30-day mortality but should NOT be used alone to withdraw care. 
                Self-fulfilling prophecy concerns exist if used to limit treatment. 
                Early aggressive care improves outcomes in many patients. 
                Consider patient preferences, premorbid function, and reversible factors. 
                Score derived from Hemphill et al., Stroke 2001.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// FUNC Score Calculator Component
function FUNCScoreCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<Set<string>>(new Set());

  const toggleCriteria = (id: string) => {
    const newSet = new Set(criteria);
    
    // Handle mutually exclusive options
    if (id.startsWith("volume_")) {
      newSet.delete("volume_lt30");
      newSet.delete("volume_30_60");
      newSet.delete("volume_gt60");
    }
    if (id.startsWith("age_")) {
      newSet.delete("age_lt70");
      newSet.delete("age_70_79");
      newSet.delete("age_gte80");
    }
    if (id.startsWith("location_")) {
      newSet.delete("location_lobar");
      newSet.delete("location_deep");
      newSet.delete("location_infra");
    }
    if (id.startsWith("gcs_")) {
      newSet.delete("gcs_gte9");
      newSet.delete("gcs_lte8");
    }
    
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCriteria(newSet);
  };

  const criteriaGroups = [
    {
      name: "ICH Volume",
      items: [
        { id: "volume_lt30", name: "<30 mL", points: 4 },
        { id: "volume_30_60", name: "30-60 mL", points: 2 },
        { id: "volume_gt60", name: ">60 mL", points: 0 },
      ]
    },
    {
      name: "Age",
      items: [
        { id: "age_lt70", name: "<70 years", points: 2 },
        { id: "age_70_79", name: "70-79 years", points: 1 },
        { id: "age_gte80", name: "≥80 years", points: 0 },
      ]
    },
    {
      name: "ICH Location",
      items: [
        { id: "location_lobar", name: "Lobar", points: 2 },
        { id: "location_deep", name: "Deep", points: 1 },
        { id: "location_infra", name: "Infratentorial", points: 0 },
      ]
    },
    {
      name: "GCS Score",
      items: [
        { id: "gcs_gte9", name: "GCS ≥9", points: 2 },
        { id: "gcs_lte8", name: "GCS ≤8", points: 0 },
      ]
    },
  ];

  const cognitiveItem = { id: "no_cognitive", name: "No Pre-ICH Cognitive Impairment", desc: "No dementia or significant cognitive decline before ICH", points: 1 };

  const allItems = [...criteriaGroups.flatMap(g => g.items), cognitiveItem];
  
  const totalScore = allItems.reduce((sum, item) => {
    return sum + (criteria.has(item.id) ? item.points : 0);
  }, 0);

  const getFunctionalOutcome = (score: number) => {
    if (score <= 4) return { outcome: "0%", color: "bg-red-600", desc: "No chance of functional independence" };
    if (score === 5) return { outcome: "5%", color: "bg-red-500", desc: "Very low chance" };
    if (score === 6) return { outcome: "10%", color: "bg-orange-600", desc: "Low chance" };
    if (score === 7) return { outcome: "25%", color: "bg-orange-500", desc: "Low-moderate chance" };
    if (score === 8) return { outcome: "45%", color: "bg-yellow-500", desc: "Moderate chance" };
    if (score === 9) return { outcome: "65%", color: "bg-lime-500", desc: "Good chance" };
    if (score === 10) return { outcome: "80%", color: "bg-green-500", desc: "High chance" };
    return { outcome: "95%", color: "bg-green-600", desc: "Very high chance" };
  };

  const outcome = getFunctionalOutcome(totalScore);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 dark:from-purple-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-purple-100/50 dark:bg-purple-900/30">
            <CardTitle className="flex items-center justify-between text-purple-800 dark:text-purple-300">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                FUNC Score - Functional Outcome After ICH (0-11)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Score Display */}
            <div className="mb-6 p-4 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 ${outcome.color} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                    {totalScore}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-800 dark:text-purple-300">Functional Independence at 90 Days</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{outcome.outcome}</div>
                    <div className="text-sm text-purple-500 dark:text-purple-500">{outcome.desc}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criteria Groups */}
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300">Score Components (select one per category)</h4>
              
              {criteriaGroups.map((group) => (
                <div key={group.name} className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2">{group.name}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {group.items.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          criteria.has(item.id) 
                            ? 'bg-purple-200 dark:bg-purple-800/50 border border-purple-400' 
                            : 'bg-white dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800 hover:bg-purple-100'
                        }`}
                        onClick={() => toggleCriteria(item.id)}
                      >
                        <Checkbox checked={criteria.has(item.id)} />
                        <span className="text-sm text-purple-800 dark:text-purple-300">{item.name}</span>
                        <span className={`ml-auto px-1.5 py-0.5 rounded text-xs font-bold ${
                          item.points >= 2 ? 'bg-green-200 text-green-800' : 
                          item.points === 1 ? 'bg-yellow-200 text-yellow-800' : 
                          'bg-gray-200 text-gray-800'
                        }`}>
                          +{item.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Cognitive Impairment */}
              <div 
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  criteria.has(cognitiveItem.id) 
                    ? 'bg-purple-200 dark:bg-purple-800/50 border border-purple-400 dark:border-purple-600' 
                    : 'bg-white dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
                onClick={() => toggleCriteria(cognitiveItem.id)}
              >
                <Checkbox checked={criteria.has(cognitiveItem.id)} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-purple-800 dark:text-purple-300">{cognitiveItem.name}</span>
                    <span className="ml-auto px-2 py-0.5 rounded text-xs font-bold bg-yellow-200 text-yellow-800">+{cognitiveItem.points}</span>
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-500 mt-1">{cognitiveItem.desc}</div>
                </div>
              </div>
            </div>

            {/* Outcome Table */}
            <div className="mt-6 overflow-x-auto">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">Functional Independence by FUNC Score</h4>
              <div className="grid grid-cols-6 gap-1 text-center text-xs">
                {[
                  { score: "0-4", pct: "0%", color: "bg-red-600" },
                  { score: "5", pct: "5%", color: "bg-red-500" },
                  { score: "6", pct: "10%", color: "bg-orange-500" },
                  { score: "7", pct: "25%", color: "bg-yellow-500" },
                  { score: "8-9", pct: "45-65%", color: "bg-lime-500" },
                  { score: "10-11", pct: "80-95%", color: "bg-green-500" },
                ].map((item) => (
                  <div key={item.score} className={`${item.color} text-white rounded p-2`}>
                    <div className="font-bold">{item.score}</div>
                    <div>{item.pct}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-700 rounded-lg">
              <p className="text-xs text-purple-600 dark:text-purple-400">
                <strong>Clinical Notes:</strong> FUNC Score predicts functional independence (mRS 0-2) at 90 days after ICH. 
                Complements ICH Score (mortality) with functional outcome prediction. 
                Higher scores indicate better prognosis. Use alongside ICH Score for comprehensive prognostication. 
                Score should inform goals-of-care discussions but not determine care limitations alone. 
                Derived from Rost et al., Stroke 2008.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Functional Outcome Scales Component (mRS & GOS)
function FunctionalOutcomeScales() {
  const [isOpen, setIsOpen] = useState(false);

  const mrsGrades = [
    { score: 0, description: "No symptoms at all", category: "Excellent", color: "bg-green-500" },
    { score: 1, description: "No significant disability despite symptoms; able to carry out all usual duties and activities", category: "Good", color: "bg-green-400" },
    { score: 2, description: "Slight disability; unable to carry out all previous activities but able to look after own affairs without assistance", category: "Good", color: "bg-lime-500" },
    { score: 3, description: "Moderate disability; requiring some help, but able to walk without assistance", category: "Moderate", color: "bg-yellow-500" },
    { score: 4, description: "Moderately severe disability; unable to walk without assistance and unable to attend to own bodily needs without assistance", category: "Poor", color: "bg-orange-500" },
    { score: 5, description: "Severe disability; bedridden, incontinent, and requiring constant nursing care and attention", category: "Poor", color: "bg-red-500" },
    { score: 6, description: "Dead", category: "Dead", color: "bg-gray-800" },
  ];

  const gosGrades = [
    { score: 1, description: "Death", outcome: "Dead", color: "bg-gray-800" },
    { score: 2, description: "Persistent vegetative state - Patient exhibits no obvious cortical function", outcome: "Unfavorable", color: "bg-red-600" },
    { score: 3, description: "Severe disability - Conscious but disabled; patient depends upon others for daily support due to mental or physical disability or both", outcome: "Unfavorable", color: "bg-orange-500" },
    { score: 4, description: "Moderate disability - Disabled but independent; patient is independent as far as daily life is concerned. Disabilities include varying degrees of dysphasia, hemiparesis, or ataxia, as well as intellectual and memory deficits and personality changes", outcome: "Favorable", color: "bg-yellow-500" },
    { score: 5, description: "Good recovery - Resumption of normal activities even though there may be minor neurological or psychological deficits", outcome: "Favorable", color: "bg-green-500" },
  ];

  const gosEGrades = [
    { score: 1, description: "Death", category: "Dead" },
    { score: 2, description: "Vegetative state - Unable to interact with environment; unresponsive", category: "VS" },
    { score: 3, description: "Lower severe disability - Dependent on others for care, needs assistance with most activities", category: "SD-" },
    { score: 4, description: "Upper severe disability - Dependent, but can be left alone for 8+ hours", category: "SD+" },
    { score: 5, description: "Lower moderate disability - Independent at home, but unable to return to work/school or participate in social activities", category: "MD-" },
    { score: 6, description: "Upper moderate disability - Some disability, but can return to work (reduced capacity) or participate in social activities", category: "MD+" },
    { score: 7, description: "Lower good recovery - Good recovery with minor physical or mental deficits affecting daily life", category: "GR-" },
    { score: 8, description: "Upper good recovery - Full recovery or minor symptoms not affecting daily life", category: "GR+" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50 dark:from-cyan-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-cyan-100/50 dark:bg-cyan-900/30">
            <CardTitle className="flex items-center justify-between text-cyan-800 dark:text-cyan-300">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Functional Outcome Scales (mRS & GOS)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Modified Rankin Scale */}
            <div>
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-cyan-200 dark:bg-cyan-800 rounded text-sm">mRS</span>
                Modified Rankin Scale
              </h4>
              <p className="text-sm text-cyan-700 dark:text-cyan-400 mb-3">
                Most widely used outcome measure in stroke trials. Assesses degree of disability/dependence in daily activities.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-cyan-200 dark:bg-cyan-800">
                      <th className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-left text-cyan-900 dark:text-cyan-100 w-16">Score</th>
                      <th className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-left text-cyan-900 dark:text-cyan-100">Description</th>
                      <th className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-center text-cyan-900 dark:text-cyan-100 w-24">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mrsGrades.map((grade) => (
                      <tr key={grade.score} className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                        <td className="border border-cyan-300 dark:border-cyan-600 px-3 py-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${grade.color}`}>
                            {grade.score}
                          </span>
                        </td>
                        <td className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-cyan-700 dark:text-cyan-400">
                          {grade.description}
                        </td>
                        <td className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            grade.category === 'Excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            grade.category === 'Good' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300' :
                            grade.category === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            grade.category === 'Poor' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {grade.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
                <p className="text-xs text-cyan-700 dark:text-cyan-400">
                  <strong>Clinical Use:</strong> mRS 0-2 = Favorable outcome (functional independence) | mRS 3-5 = Unfavorable outcome (disability/dependence) | mRS 6 = Death
                </p>
              </div>
            </div>

            {/* Glasgow Outcome Scale */}
            <div>
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-cyan-200 dark:bg-cyan-800 rounded text-sm">GOS</span>
                Glasgow Outcome Scale
              </h4>
              <p className="text-sm text-cyan-700 dark:text-cyan-400 mb-3">
                Standard outcome measure for traumatic brain injury and other acute brain injuries. Simple 5-point scale.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-cyan-200 dark:bg-cyan-800">
                      <th className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-left text-cyan-900 dark:text-cyan-100 w-16">Score</th>
                      <th className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-left text-cyan-900 dark:text-cyan-100">Description</th>
                      <th className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-center text-cyan-900 dark:text-cyan-100 w-28">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gosGrades.map((grade) => (
                      <tr key={grade.score} className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                        <td className="border border-cyan-300 dark:border-cyan-600 px-3 py-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${grade.color}`}>
                            {grade.score}
                          </span>
                        </td>
                        <td className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-cyan-700 dark:text-cyan-400">
                          {grade.description}
                        </td>
                        <td className="border border-cyan-300 dark:border-cyan-600 px-3 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            grade.outcome === 'Favorable' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            grade.outcome === 'Unfavorable' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {grade.outcome}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Glasgow Outcome Scale - Extended */}
            <div>
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-cyan-200 dark:bg-cyan-800 rounded text-sm">GOS-E</span>
                Glasgow Outcome Scale - Extended
              </h4>
              <p className="text-sm text-cyan-700 dark:text-cyan-400 mb-3">
                Extended 8-point version providing greater sensitivity to detect differences in outcome, especially in the upper range.
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {gosEGrades.map((grade) => (
                  <div key={grade.score} className={`p-3 rounded-lg border ${
                    grade.score === 1 ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' :
                    grade.score === 2 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' :
                    grade.score <= 4 ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' :
                    grade.score <= 6 ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' :
                    'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        grade.score === 1 ? 'bg-gray-800' :
                        grade.score === 2 ? 'bg-red-600' :
                        grade.score <= 4 ? 'bg-orange-500' :
                        grade.score <= 6 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                        {grade.score}
                      </span>
                      <span className="font-medium text-cyan-800 dark:text-cyan-300">{grade.category}</span>
                    </div>
                    <p className="text-xs text-cyan-600 dark:text-cyan-500">{grade.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="p-4 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-2">Clinical Considerations</h4>
              <ul className="text-sm text-cyan-700 dark:text-cyan-400 space-y-1">
                <li>• <strong>mRS</strong> is preferred for stroke outcomes; typically assessed at 90 days post-stroke</li>
                <li>• <strong>GOS/GOS-E</strong> is standard for TBI outcomes; typically assessed at 6 months post-injury</li>
                <li>• Shift analysis (ordinal) is increasingly used in trials vs. dichotomized outcomes</li>
                <li>• Pre-morbid mRS should be documented to assess change from baseline</li>
                <li>• Telephone administration validated for both scales when in-person assessment not possible</li>
              </ul>
            </div>

            {/* References */}
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-700 rounded-lg">
              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                <strong>References:</strong> van Swieten JC et al. <em>Stroke</em>. 1988;19:604-607 (mRS) | Jennett B, Bond M. <em>Lancet</em>. 1975;1:480-484 (GOS) | Wilson JT et al. <em>J Neurotrauma</em>. 1998;15:573-585 (GOS-E)
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ADL Assessment Scales Component (Barthel Index & FIM)
function ADLAssessmentScales() {
  const [isOpen, setIsOpen] = useState(false);

  const barthelItems = [
    { activity: "Feeding", independent: 10, dependent: 0, description: "Independent: able to eat from a tray, use utensils" },
    { activity: "Bathing", independent: 5, dependent: 0, description: "Independent: able to bathe self without assistance" },
    { activity: "Grooming", independent: 5, dependent: 0, description: "Independent: face, hair, teeth, shaving" },
    { activity: "Dressing", independent: 10, dependent: 0, description: "Independent: including buttons, zips, laces" },
    { activity: "Bowel Control", independent: 10, dependent: 0, description: "No accidents; able to manage suppository/enema" },
    { activity: "Bladder Control", independent: 10, dependent: 0, description: "No accidents; able to manage catheter if needed" },
    { activity: "Toilet Use", independent: 10, dependent: 0, description: "Independent: on/off, dressing, wiping" },
    { activity: "Transfers", independent: 15, dependent: 0, description: "Bed to chair and back; independent" },
    { activity: "Mobility", independent: 15, dependent: 0, description: "Walking 50 yards independently (or wheelchair)" },
    { activity: "Stairs", independent: 10, dependent: 0, description: "Up and down one flight without help" },
  ];

  const barthelInterpretation = [
    { range: "0-20", level: "Total Dependence", color: "bg-red-500" },
    { range: "21-60", level: "Severe Dependence", color: "bg-orange-500" },
    { range: "61-90", level: "Moderate Dependence", color: "bg-yellow-500" },
    { range: "91-99", level: "Slight Dependence", color: "bg-lime-500" },
    { range: "100", level: "Independent", color: "bg-green-500" },
  ];

  const fimDomains = [
    {
      category: "Self-Care",
      items: [
        { name: "Eating", maxScore: 7 },
        { name: "Grooming", maxScore: 7 },
        { name: "Bathing", maxScore: 7 },
        { name: "Dressing - Upper Body", maxScore: 7 },
        { name: "Dressing - Lower Body", maxScore: 7 },
        { name: "Toileting", maxScore: 7 },
      ],
      maxTotal: 42,
    },
    {
      category: "Sphincter Control",
      items: [
        { name: "Bladder Management", maxScore: 7 },
        { name: "Bowel Management", maxScore: 7 },
      ],
      maxTotal: 14,
    },
    {
      category: "Transfers",
      items: [
        { name: "Bed/Chair/Wheelchair", maxScore: 7 },
        { name: "Toilet", maxScore: 7 },
        { name: "Tub/Shower", maxScore: 7 },
      ],
      maxTotal: 21,
    },
    {
      category: "Locomotion",
      items: [
        { name: "Walk/Wheelchair", maxScore: 7 },
        { name: "Stairs", maxScore: 7 },
      ],
      maxTotal: 14,
    },
    {
      category: "Communication",
      items: [
        { name: "Comprehension", maxScore: 7 },
        { name: "Expression", maxScore: 7 },
      ],
      maxTotal: 14,
    },
    {
      category: "Social Cognition",
      items: [
        { name: "Social Interaction", maxScore: 7 },
        { name: "Problem Solving", maxScore: 7 },
        { name: "Memory", maxScore: 7 },
      ],
      maxTotal: 21,
    },
  ];

  const fimLevels = [
    { score: 7, level: "Complete Independence", description: "No helper, no extra time" },
    { score: 6, level: "Modified Independence", description: "Device or extra time needed" },
    { score: 5, level: "Supervision/Setup", description: "Standby assistance, cueing, or coaxing" },
    { score: 4, level: "Minimal Assistance", description: "Performs 75%+ of task" },
    { score: 3, level: "Moderate Assistance", description: "Performs 50-74% of task" },
    { score: 2, level: "Maximal Assistance", description: "Performs 25-49% of task" },
    { score: 1, level: "Total Assistance", description: "Performs <25% of task" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-pink-300 dark:border-pink-700 bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-pink-100/50 dark:bg-pink-900/30">
            <CardTitle className="flex items-center justify-between text-pink-800 dark:text-pink-300">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                ADL Assessment Scales (Barthel Index & FIM)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Barthel Index */}
            <div>
              <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-pink-200 dark:bg-pink-800 rounded text-sm">BI</span>
                Barthel Index (Modified)
              </h4>
              <p className="text-sm text-pink-700 dark:text-pink-400 mb-3">
                Measures performance in 10 basic activities of daily living. Total score: 0-100. Higher = more independent.
              </p>
              
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-pink-200 dark:bg-pink-800">
                      <th className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-left text-pink-900 dark:text-pink-100">Activity</th>
                      <th className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-center text-pink-900 dark:text-pink-100 w-24">Independent</th>
                      <th className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-center text-pink-900 dark:text-pink-100 w-24">Dependent</th>
                      <th className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-left text-pink-900 dark:text-pink-100">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-pink-700 dark:text-pink-400">
                    {barthelItems.map((item) => (
                      <tr key={item.activity} className="hover:bg-pink-50 dark:hover:bg-pink-900/20">
                        <td className="border border-pink-300 dark:border-pink-600 px-3 py-2 font-medium">{item.activity}</td>
                        <td className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-center text-green-600 dark:text-green-400 font-bold">{item.independent}</td>
                        <td className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-center text-red-600 dark:text-red-400">{item.dependent}</td>
                        <td className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-xs">{item.description}</td>
                      </tr>
                    ))}
                    <tr className="bg-pink-100 dark:bg-pink-900/40 font-bold">
                      <td className="border border-pink-300 dark:border-pink-600 px-3 py-2">TOTAL</td>
                      <td className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-center text-green-700 dark:text-green-300">100</td>
                      <td className="border border-pink-300 dark:border-pink-600 px-3 py-2 text-center text-red-700 dark:text-red-300">0</td>
                      <td className="border border-pink-300 dark:border-pink-600 px-3 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Barthel Interpretation */}
              <div className="grid grid-cols-5 gap-2">
                {barthelInterpretation.map((item) => (
                  <div key={item.range} className="p-2 rounded text-center">
                    <div className={`${item.color} text-white px-2 py-1 rounded text-xs font-bold mb-1`}>
                      {item.range}
                    </div>
                    <div className="text-xs text-pink-700 dark:text-pink-400">{item.level}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FIM */}
            <div>
              <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-pink-200 dark:bg-pink-800 rounded text-sm">FIM</span>
                Functional Independence Measure
              </h4>
              <p className="text-sm text-pink-700 dark:text-pink-400 mb-3">
                18-item scale measuring physical and cognitive disability. Each item scored 1-7. Total score: 18-126. Motor subscale: 13-91, Cognitive subscale: 5-35.
              </p>

              {/* FIM Scoring Levels */}
              <div className="mb-4 p-3 bg-pink-100 dark:bg-pink-900/40 rounded-lg">
                <h5 className="font-medium text-pink-800 dark:text-pink-300 mb-2">FIM Scoring Levels (1-7)</h5>
                <div className="grid gap-1">
                  {fimLevels.map((level) => (
                    <div key={level.score} className="flex items-center gap-2 text-sm">
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${
                        level.score >= 6 ? 'bg-green-500' :
                        level.score >= 4 ? 'bg-yellow-500' :
                        level.score >= 2 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}>
                        {level.score}
                      </span>
                      <span className="font-medium text-pink-800 dark:text-pink-300 w-40">{level.level}</span>
                      <span className="text-pink-600 dark:text-pink-500 text-xs">{level.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FIM Domains */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {fimDomains.map((domain) => (
                  <div key={domain.category} className="p-3 bg-white dark:bg-pink-950/30 border border-pink-200 dark:border-pink-700 rounded-lg">
                    <h5 className="font-medium text-pink-800 dark:text-pink-300 mb-2 flex items-center justify-between">
                      {domain.category}
                      <span className="text-xs bg-pink-200 dark:bg-pink-800 px-2 py-0.5 rounded">Max: {domain.maxTotal}</span>
                    </h5>
                    <ul className="text-xs text-pink-600 dark:text-pink-500 space-y-1">
                      {domain.items.map((item) => (
                        <li key={item.name} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="text-pink-400">({item.maxScore})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* FIM Interpretation */}
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded border border-red-200 dark:border-red-700">
                  <div className="font-bold text-red-800 dark:text-red-300">18-35</div>
                  <div className="text-xs text-red-700 dark:text-red-400">Complete Dependence</div>
                  <div className="text-xs text-red-600 dark:text-red-500 mt-1">Needs 24-hour assistance</div>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded border border-yellow-200 dark:border-yellow-700">
                  <div className="font-bold text-yellow-800 dark:text-yellow-300">36-89</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-400">Modified Dependence</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Needs some assistance</div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded border border-green-200 dark:border-green-700">
                  <div className="font-bold text-green-800 dark:text-green-300">90-126</div>
                  <div className="text-xs text-green-700 dark:text-green-400">Independent</div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">Minimal to no assistance</div>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="p-4 bg-pink-100 dark:bg-pink-900/40 rounded-lg">
              <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">Barthel Index vs FIM Comparison</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-pink-700 dark:text-pink-400 mb-1">Barthel Index</h5>
                  <ul className="text-xs text-pink-600 dark:text-pink-500 space-y-1">
                    <li>• Simpler, quicker to administer (5-10 min)</li>
                    <li>• Focuses on basic ADLs only</li>
                    <li>• Ceiling effect in mild disability</li>
                    <li>• Free to use; no training required</li>
                    <li>• Good for screening and general monitoring</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-pink-700 dark:text-pink-400 mb-1">FIM</h5>
                  <ul className="text-xs text-pink-600 dark:text-pink-500 space-y-1">
                    <li>• More comprehensive (30-45 min)</li>
                    <li>• Includes cognitive/communication domains</li>
                    <li>• Greater sensitivity to change</li>
                    <li>• Requires training and certification</li>
                    <li>• Standard in rehabilitation settings</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="p-4 bg-pink-200 dark:bg-pink-800/40 rounded-lg">
              <h4 className="font-semibold text-pink-900 dark:text-pink-200 mb-2">Clinical Considerations</h4>
              <ul className="text-sm text-pink-800 dark:text-pink-300 space-y-1">
                <li>• Assess at admission, weekly during rehabilitation, and at discharge</li>
                <li>• FIM gain = Discharge FIM - Admission FIM (predicts functional trajectory)</li>
                <li>• FIM efficiency = FIM gain ÷ Length of stay (measure of rehabilitation effectiveness)</li>
                <li>• Barthel Index ≥60 often used as threshold for discharge home</li>
                <li>• Both scales validated for stroke, TBI, and other neurological conditions</li>
              </ul>
            </div>

            {/* References */}
            <div className="p-3 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-700 rounded-lg">
              <p className="text-xs text-pink-600 dark:text-pink-400">
                <strong>References:</strong> Mahoney FI, Barthel DW. <em>Md State Med J</em>. 1965;14:61-65 (Barthel Index) | Keith RA et al. <em>Arch Phys Med Rehabil</em>. 1987;68:387-391 (FIM)
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// SAH Grading Scales Component (Hunt & Hess / WFNS)
function SAHGradingScales() {
  const [isOpen, setIsOpen] = useState(false);

  const huntHessGrades = [
    { grade: 1, description: "Asymptomatic or mild headache, slight nuchal rigidity", mortality: "1%", color: "bg-green-500" },
    { grade: 2, description: "Moderate to severe headache, nuchal rigidity, no deficit except CN palsy", mortality: "5%", color: "bg-lime-500" },
    { grade: 3, description: "Drowsiness, confusion, or mild focal deficit", mortality: "19%", color: "bg-yellow-500" },
    { grade: 4, description: "Stupor, moderate to severe hemiparesis, early decerebrate rigidity", mortality: "42%", color: "bg-orange-500" },
    { grade: 5, description: "Deep coma, decerebrate rigidity, moribund appearance", mortality: "77%", color: "bg-red-600" },
  ];

  const wfnsGrades = [
    { grade: "I", gcs: "15", motor: "Absent", mortality: "5%", color: "bg-green-500" },
    { grade: "II", gcs: "13-14", motor: "Absent", mortality: "9%", color: "bg-lime-500" },
    { grade: "III", gcs: "13-14", motor: "Present", mortality: "20%", color: "bg-yellow-500" },
    { grade: "IV", gcs: "7-12", motor: "Present or Absent", mortality: "33%", color: "bg-orange-500" },
    { grade: "V", gcs: "3-6", motor: "Present or Absent", mortality: "76%", color: "bg-red-600" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-pink-300 dark:border-pink-700 bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-pink-100/50 dark:bg-pink-900/30">
            <CardTitle className="flex items-center justify-between text-pink-800 dark:text-pink-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                SAH Grading Scales (Hunt & Hess / WFNS)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Hunt and Hess Scale */}
              <div className="p-4 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-lg">
                <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-pink-200 dark:bg-pink-800 rounded text-xs">Clinical</span>
                  Hunt & Hess Scale
                </h4>
                <div className="space-y-2">
                  {huntHessGrades.map((item) => (
                    <div key={item.grade} className="flex items-start gap-3 p-2 bg-white dark:bg-pink-950/30 rounded border border-pink-100 dark:border-pink-800">
                      <div className={`w-10 h-10 ${item.color} text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                        {item.grade}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-pink-800 dark:text-pink-300">{item.description}</p>
                        <p className="text-xs text-pink-600 dark:text-pink-500 mt-1">Mortality: {item.mortality}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WFNS Scale */}
              <div className="p-4 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-lg">
                <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-pink-200 dark:bg-pink-800 rounded text-xs">GCS-Based</span>
                  WFNS Scale
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-pink-200 dark:border-pink-700">
                        <th className="text-left py-2 px-2 text-pink-800 dark:text-pink-300 font-semibold">Grade</th>
                        <th className="text-center py-2 px-2 text-pink-800 dark:text-pink-300 font-semibold">GCS</th>
                        <th className="text-center py-2 px-2 text-pink-800 dark:text-pink-300 font-semibold">Motor Deficit</th>
                        <th className="text-center py-2 px-2 text-pink-800 dark:text-pink-300 font-semibold">Mortality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wfnsGrades.map((item) => (
                        <tr key={item.grade} className="border-b border-pink-100 dark:border-pink-800">
                          <td className="py-2 px-2">
                            <span className={`inline-flex w-8 h-8 ${item.color} text-white rounded-full items-center justify-center font-bold`}>
                              {item.grade}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center text-pink-700 dark:text-pink-400">{item.gcs}</td>
                          <td className="py-2 px-2 text-center text-pink-700 dark:text-pink-400">{item.motor}</td>
                          <td className="py-2 px-2 text-center text-pink-700 dark:text-pink-400">{item.mortality}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Fisher / Modified Fisher Scale */}
            <div className="mt-6 p-4 bg-pink-100 dark:bg-pink-900/40 rounded-lg">
              <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-3">Modified Fisher Scale (Vasospasm Risk)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-2 text-center">
                  <div className="font-bold text-green-800 dark:text-green-300">Grade 0</div>
                  <div className="text-xs text-green-700 dark:text-green-400">No SAH/IVH</div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">0% vasospasm</div>
                </div>
                <div className="bg-lime-100 dark:bg-lime-900/40 rounded p-2 text-center">
                  <div className="font-bold text-lime-800 dark:text-lime-300">Grade 1</div>
                  <div className="text-xs text-lime-700 dark:text-lime-400">Thin SAH, no IVH</div>
                  <div className="text-xs text-lime-600 dark:text-lime-500 mt-1">24% vasospasm</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-2 text-center">
                  <div className="font-bold text-yellow-800 dark:text-yellow-300">Grade 2</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-400">Thin SAH + IVH</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">33% vasospasm</div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/40 rounded p-2 text-center">
                  <div className="font-bold text-orange-800 dark:text-orange-300">Grade 3</div>
                  <div className="text-xs text-orange-700 dark:text-orange-400">Thick SAH, no IVH</div>
                  <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">33% vasospasm</div>
                </div>
              </div>
              <div className="mt-2 flex justify-center">
                <div className="bg-red-100 dark:bg-red-900/40 rounded p-2 text-center w-full md:w-1/2">
                  <div className="font-bold text-red-800 dark:text-red-300">Grade 4</div>
                  <div className="text-xs text-red-700 dark:text-red-400">Thick SAH + IVH</div>
                  <div className="text-xs text-red-600 dark:text-red-500 mt-1">40% vasospasm</div>
                </div>
              </div>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-2 text-center">
                Thin SAH: &lt;1mm; Thick SAH: ≥1mm or clot; IVH: Intraventricular hemorrhage
              </p>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-700 rounded-lg">
              <p className="text-xs text-pink-600 dark:text-pink-400">
                <strong>Clinical Notes:</strong> Hunt & Hess is the traditional clinical grading system. WFNS uses GCS for more objective assessment. 
                Both predict outcome and guide surgical timing. Grades I-III ("good grade") typically undergo early aneurysm treatment. 
                Modified Fisher predicts symptomatic vasospasm risk (days 3-14). 
                All patients need nimodipine, euvolemia, and close monitoring for delayed cerebral ischemia (DCI).
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Metabolic Syndrome Criteria Checker Component
function MetabolicSyndromeChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [idfCriteria, setIdfCriteria] = useState<Set<string>>(new Set());
  const [atpCriteria, setAtpCriteria] = useState<Set<string>>(new Set());

  const toggleIdfCriteria = (id: string) => {
    const newSet = new Set(idfCriteria);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setIdfCriteria(newSet);
  };

  const toggleAtpCriteria = (id: string) => {
    const newSet = new Set(atpCriteria);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setAtpCriteria(newSet);
  };

  const idfItems = [
    { id: "idf_waist", name: "Central Obesity (REQUIRED)", desc: "Waist ≥94cm (men) or ≥80cm (women) - Europid; ≥90cm (men) or ≥80cm (women) - Asian", required: true },
    { id: "idf_tg", name: "Raised Triglycerides", desc: "≥150 mg/dL (1.7 mmol/L) or specific treatment", required: false },
    { id: "idf_hdl", name: "Reduced HDL-C", desc: "<40 mg/dL (men) or <50 mg/dL (women), or specific treatment", required: false },
    { id: "idf_bp", name: "Raised Blood Pressure", desc: "Systolic ≥130 or Diastolic ≥85 mmHg, or treatment for HTN", required: false },
    { id: "idf_glucose", name: "Raised Fasting Glucose", desc: "≥100 mg/dL (5.6 mmol/L) or previously diagnosed T2DM", required: false },
  ];

  const atpItems = [
    { id: "atp_waist", name: "Abdominal Obesity", desc: "Waist >102cm (men) or >88cm (women)" },
    { id: "atp_tg", name: "Raised Triglycerides", desc: "≥150 mg/dL (1.7 mmol/L)" },
    { id: "atp_hdl", name: "Low HDL-C", desc: "<40 mg/dL (men) or <50 mg/dL (women)" },
    { id: "atp_bp", name: "Raised Blood Pressure", desc: "≥130/85 mmHg or on antihypertensive medication" },
    { id: "atp_glucose", name: "Raised Fasting Glucose", desc: "≥100 mg/dL (5.6 mmol/L) or on treatment" },
  ];

  const idfMet = idfCriteria.has("idf_waist") && 
    (idfItems.filter(i => !i.required && idfCriteria.has(i.id)).length >= 2);
  
  const atpMet = atpCriteria.size >= 3;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 dark:from-amber-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-amber-100/50 dark:bg-amber-900/30">
            <CardTitle className="flex items-center justify-between text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Metabolic Syndrome Criteria Checker (IDF / ATP III)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* IDF Criteria */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">IDF Definition (2005)</h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${idfMet ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {idfMet ? 'MetS Present' : 'MetS Absent'}
                  </div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500 mb-4">
                  Requires: Central obesity (mandatory) + ≥2 of remaining criteria
                </p>
                <div className="space-y-3">
                  {idfItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        idfCriteria.has(item.id) 
                          ? 'bg-amber-200 dark:bg-amber-800/50 border border-amber-400 dark:border-amber-600' 
                          : 'bg-white dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                      }`}
                      onClick={() => toggleIdfCriteria(item.id)}
                    >
                      <Checkbox 
                        checked={idfCriteria.has(item.id)} 
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${item.required ? 'text-red-700 dark:text-red-400' : 'text-amber-800 dark:text-amber-300'}`}>
                          {item.name}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ATP III Criteria */}
              <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300">ATP III / NCEP Definition</h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${atpMet ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {atpMet ? 'MetS Present' : 'MetS Absent'}
                  </div>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-500 mb-4">
                  Requires: ≥3 of 5 criteria (no mandatory component)
                </p>
                <div className="space-y-3">
                  {atpItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        atpCriteria.has(item.id) 
                          ? 'bg-orange-200 dark:bg-orange-800/50 border border-orange-400 dark:border-orange-600' 
                          : 'bg-white dark:bg-orange-950/30 border border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                      }`}
                      onClick={() => toggleAtpCriteria(item.id)}
                    >
                      <Checkbox 
                        checked={atpCriteria.has(item.id)} 
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-orange-800 dark:text-orange-300">{item.name}</div>
                        <div className="text-xs text-orange-600 dark:text-orange-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinical Significance */}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <strong>Clinical Significance:</strong> Metabolic syndrome increases cardiovascular risk 2-fold and diabetes risk 5-fold. 
                IDF emphasizes central obesity as the primary driver. ATP III treats all criteria equally. 
                Both definitions identify similar high-risk populations. Treatment focuses on lifestyle modification, weight loss, and managing individual components.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface Patient {
  id: string;
  patient_id: string;
  name: string | null;
  weight: number | null;
  age: number | null;
  sex: string | null;
  last_known_well: string | null;
  demographics: Record<string, unknown>;
  clinical_data: Record<string, unknown>;
  created_by: string | null;
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
}

interface StrokeWorkupChecklistProps {
  patient?: Patient;
  onPatientDataChange?: (data: Record<string, unknown>) => void;
}

export default function StrokeWorkupChecklist({ patient, onPatientDataChange }: StrokeWorkupChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [strokeHistoryFactors, setStrokeHistoryFactors] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("ischemic");
  const [demographics, setDemographics] = useState<{ patientId: string; name?: string; age?: string; sex?: string; race?: string; lastKnownWell?: string }>({ 
    patientId: patient?.patient_id || "",
    name: patient?.name || undefined,
    age: patient?.age?.toString() || undefined,
    sex: patient?.sex || undefined,
    lastKnownWell: patient?.last_known_well ? patient.last_known_well.slice(0, 16) : undefined,
  });
  const [calculatedScores, setCalculatedScores] = useState<Record<string, any>>({});

  const handleCheck = (testId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(testId)) {
      newChecked.delete(testId);
    } else {
      newChecked.add(testId);
    }
    setCheckedItems(newChecked);
  };

  const checkedTestNames = strokeTests.filter(t => checkedItems.has(t.id)).map(t => t.name);
  const categories = Array.from(new Set(strokeTests.map(test => test.category)));
  const completionPercentage = (checkedItems.size / strokeTests.length) * 100;

  return (
    <div className="max-w-6xl mx-auto px-[max(0.75rem,env(safe-area-inset-left))] sm:px-4 md:px-6 py-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-4 space-y-5">
      {/* Header with Theme Toggle */}
      <div className="relative text-center mb-4">
        {/* Theme Toggle - Fixed Position */}
        <div className="absolute right-0 top-0">
          <ThemeToggle />
        </div>
        
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-2 leading-relaxed">
          Acute Stroke Workup Checklist
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">
          Comprehensive clinical investigation checklist for stroke evaluation
        </p>
      </div>

      {/* Main Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop/Tablet top tabs - hidden on mobile */}
        <TabsList className="hidden sm:grid w-full grid-cols-6 h-14 mb-5 glass-strong rounded-xl p-1">
          <TabsTrigger value="ischemic" className="flex items-center gap-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-2 rounded-lg transition-all">
            <Zap className="h-4 w-4 shrink-0" />
            Ischemic
          </TabsTrigger>
          <TabsTrigger value="hemorrhagic" className="flex items-center gap-1 text-xs font-semibold data-[state=active]:bg-accent-amber data-[state=active]:text-white data-[state=active]:shadow-md px-2 rounded-lg transition-all">
            <Droplets className="h-4 w-4 shrink-0" />
            ICH
          </TabsTrigger>
          <TabsTrigger value="post-ivt" className="flex items-center gap-1 text-xs font-semibold data-[state=active]:bg-accent-rose data-[state=active]:text-white data-[state=active]:shadow-md px-2 rounded-lg transition-all">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Post IVT-ICH
          </TabsTrigger>
          <TabsTrigger value="cvt" className="flex items-center gap-1 text-xs font-semibold data-[state=active]:bg-accent-purple data-[state=active]:text-white data-[state=active]:shadow-md px-2 rounded-lg transition-all">
            <Brain className="h-4 w-4 shrink-0" />
            CVT
          </TabsTrigger>
          <TabsTrigger value="sah" className="flex items-center gap-1 text-xs font-semibold data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md px-2 rounded-lg transition-all">
            <Droplets className="h-4 w-4 shrink-0" />
            SAH
          </TabsTrigger>
          <TabsTrigger value="sdh" className="flex items-center gap-1 text-xs font-semibold data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md px-2 rounded-lg transition-all">
            <Layers className="h-4 w-4 shrink-0" />
            SDH
          </TabsTrigger>
        </TabsList>

        {/* Ischemic Stroke Tab Content */}
        <TabsContent value="ischemic" className="space-y-6">
          {/* Section Navigator */}
          <SectionNavigator 
            title="Ischemic Stroke Modules"
            sections={[
              { id: "stroke-code", label: "Stroke Code System", icon: <Zap className="h-3.5 w-3.5 text-red-500" /> },
              { id: "acute-algorithm", label: "Acute Stroke Algorithm", icon: <Activity className="h-3.5 w-3.5 text-blue-500" /> },
              { id: "tpa-eligibility", label: "tPA Eligibility", icon: <ClipboardList className="h-3.5 w-3.5 text-green-500" /> },
              { id: "thrombolytic-dose", label: "Thrombolytic Dosing", icon: <Beaker className="h-3.5 w-3.5 text-amber-500" /> },
              { id: "treatment-decision", label: "Treatment Decisions", icon: <Target className="h-3.5 w-3.5 text-purple-500" /> },
              { id: "lvo-dashboard", label: "LVO Dashboard", icon: <Crosshair className="h-3.5 w-3.5 text-rose-500" /> },
              { id: "ctp-penumbra", label: "CTP Penumbra", icon: <Brain className="h-3.5 w-3.5 text-cyan-500" /> },
              { id: "vascular-anatomy", label: "Vascular Anatomy", icon: <Heart className="h-3.5 w-3.5 text-red-400" /> },
              { id: "aspects-calculator", label: "ASPECTS Calculator", icon: <Calculator className="h-3.5 w-3.5 text-teal-500" /> },
              { id: "nihss-calculator", label: "NIHSS Calculator", icon: <BarChart3 className="h-3.5 w-3.5 text-indigo-500" /> },
              { id: "gcs-calculator", label: "GCS Calculator", icon: <Brain className="h-3.5 w-3.5 text-orange-500" /> },
              { id: "prevent-score", label: "PREVENT Score", icon: <ShieldAlert className="h-3.5 w-3.5 text-emerald-500" /> },
              { id: "kdigo-heatmap", label: "KDIGO Heat Map", icon: <Activity className="h-3.5 w-3.5 text-pink-500" /> },
              { id: "prime-tool", label: "PRIME Tool", icon: <Calculator className="h-3.5 w-3.5 text-violet-500" /> },
              { id: "lipid-risk", label: "Lipid Risk", icon: <Pill className="h-3.5 w-3.5 text-yellow-500" /> },
              { id: "stroke-history", label: "Stroke History", icon: <FileText className="h-3.5 w-3.5 text-slate-500" /> },
              { id: "stroke-phenotyping", label: "Stroke Phenotyping", icon: <Search className="h-3.5 w-3.5 text-blue-400" /> },
              { id: "lab-investigations", label: "Lab Investigations", icon: <TestTube className="h-3.5 w-3.5 text-green-400" /> },
              { id: "workup-checklist", label: "Workup Checklist", icon: <ClipboardList className="h-3.5 w-3.5 text-gray-500" /> },
            ]}
            onNavigateToSection={(id) => {
              // Sections are already rendered, just scroll
            }}
          />

          {/* Demographics Form */}
          <DemographicsForm demographics={demographics} onDemographicsChange={setDemographics} />

          {/* AI Document Analyzer */}
          <DocumentAnalyzer checkedTests={checkedTestNames} calculatedScores={calculatedScores} demographics={demographics} />

          {/* PDF Score Summary */}
          <PDFScoreSummary scores={calculatedScores} demographics={demographics} checkedTests={checkedTestNames} />

          {/* Stroke Code System */}
          <LazySection id="stroke-code">
            <StrokeCodeSystem />
          </LazySection>

          {/* Acute Stroke Management Algorithm - Interactive */}
          <LazySection id="acute-algorithm">
            <InteractiveAcuteStrokeAlgorithm />
          </LazySection>

          {/* tPA Eligibility Checklist */}
          <LazySection id="tpa-eligibility">
            <TPAEligibilityChecklist />
          </LazySection>

          {/* Thrombolytic Dose Calculator */}
          <LazySection id="thrombolytic-dose">
            <ThrombolyticDoseCalculator />
          </LazySection>

          {/* Treatment Choice Consequence Matrix */}
          <LazySection id="treatment-decision">
            <TreatmentDecisionAid />
          </LazySection>

          {/* LVO Decision Dashboard - Integrated Treatment Recommendation (includes Collateral Grading, HeadsUp, eTICI, TAL) */}
          <LazySection id="lvo-dashboard">
            <LVODecisionDashboard />
          </LazySection>

          {/* CTP Penumbra & Collateral Calculator */}
          <LazySection id="ctp-penumbra">
            <CTPPenumbraCalculator />
          </LazySection>

          {/* Interactive Vascular Anatomy Diagram */}
          <LazySection id="vascular-anatomy">
            <VascularAnatomyDiagram />
          </LazySection>

          {/* Interactive ASPECTS Calculator */}
          <LazySection id="aspects-calculator">
            <InteractiveASPECTSCalculator 
              onScoreChange={useCallback((score: number) => {
                setCalculatedScores(prev => ({ ...prev, aspects: score }));
              }, [])}
            />
          </LazySection>

          {/* Interactive pc-ASPECTS Calculator */}
          <InteractivePcASPECTSCalculator 
            onScoreChange={useCallback((score: number) => {
              setCalculatedScores(prev => ({ ...prev, pcAspects: score }));
            }, [])}
          />

          {/* Visual NIHSS Calculator */}
          <LazySection id="nihss-calculator">
            <VisualNIHSSCalculator />
          </LazySection>

          {/* Visual GCS Calculator */}
          <LazySection id="gcs-calculator">
            <VisualGCSCalculator />
          </LazySection>

          {/* PREVENT Score Calculator */}
          <LazySection id="prevent-score">
            <PREVENTScoreCalculator />
          </LazySection>

          {/* KDIGO CKD Heat Map */}
          <LazySection id="kdigo-heatmap">
            <KDIGOHeatMap />
          </LazySection>

          {/* PRIME Tool - Cancer Stroke Risk */}
          <LazySection id="prime-tool">
            <PRIMEToolCalculator />
          </LazySection>

          {/* LAI 2024 Lipid Risk Classification */}
          <LazySection id="lipid-risk">
            <LAILipidRiskClassification strokeHistoryFactors={strokeHistoryFactors} />
          </LazySection>

          {/* Stroke History Template */}
          <LazySection id="stroke-history">
            <StrokeHistoryTemplate onHistoryChange={setStrokeHistoryFactors} />
          </LazySection>

          {/* ISPS25 Stroke Phenotyping System */}
          <LazySection id="stroke-phenotyping">
            <ISPS25StrokePhenotyping />
          </LazySection>

          {/* Lab Investigations Module */}
          <LazySection id="lab-investigations">
            <LabInvestigationsModule />
          </LazySection>

          {/* Progress Overview & Workup Checklist */}
          <div id="workup-checklist">
          <Card className="bg-medical-section border-medical-header/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-medical-header">
                <Activity className="h-5 w-5" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {checkedItems.size} of {strokeTests.length} tests completed
                  </span>
                  <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                    {Math.round(completionPercentage)}%
                  </Badge>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {categories.map((category) => {
              const categoryTests = strokeTests.filter(test => test.category === category);
              const categoryCompleted = categoryTests.filter(test => checkedItems.has(test.id)).length;
              const categoryProgress = (categoryCompleted / categoryTests.length) * 100;
              const IconComponent = categoryIcons[category] || TestTube;

              return (
                <Card key={category} className="border-border">
                  <CardHeader className="bg-medical-section/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-medical-header">
                        <IconComponent className="h-5 w-5" />
                        {category}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {categoryCompleted}/{categoryTests.length}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(categoryProgress)}%
                        </div>
                      </div>
                    </div>
                    <Progress value={categoryProgress} className="h-1" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {categoryTests.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-center space-x-3 p-2 rounded hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            id={test.id}
                            checked={checkedItems.has(test.id)}
                            onCheckedChange={() => handleCheck(test.id)}
                          />
                          <label
                            htmlFor={test.id}
                            className={`text-sm cursor-pointer flex-1 ${
                              checkedItems.has(test.id) ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {test.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          </div>

          {/* Discharge Summary Template */}
          <Collapsible>
            <Card className="border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30 to-background">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="bg-emerald-100/50 dark:bg-emerald-900/30">
                  <CardTitle className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Stroke Discharge Summary Template
                    </div>
                    <ChevronDown className="h-5 w-5" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-6">
              {/* Overview */}
              <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Overview</h4>
                <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1 list-disc list-inside">
                  <li>Write the summary you would want to read – succinct, highlight relevant details, clear accountability for follow up</li>
                  <li>Fix chart errors permanently in the source, not just the document</li>
                  <li>Delete sections with no information rather than leaving placeholder text</li>
                </ul>
              </div>

              {/* Template Sections */}
              <div className="grid gap-3 md:grid-cols-2">
                {/* Administrative */}
                <div className="p-3 bg-white dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded text-xs flex items-center justify-center font-bold">1</span>
                    Administrative
                  </h5>
                  <ul className="text-xs text-emerald-600 dark:text-emerald-500 space-y-1">
                    <li>• Admission date and time</li>
                    <li>• Discharge date and time</li>
                    <li>• Primary care provider</li>
                    <li>• Relevant specialists (admitting, follow-up, discharging)</li>
                  </ul>
                </div>

                {/* Diagnoses */}
                <div className="p-3 bg-white dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded text-xs flex items-center justify-center font-bold">2</span>
                    Diagnoses
                  </h5>
                  <ul className="text-xs text-emerald-600 dark:text-emerald-500 space-y-1">
                    <li>• <strong>Most Responsible Diagnosis:</strong> Use full detail (e.g., "Ischemic stroke, left MCA, secondary to atrial fibrillation, status post EVT")</li>
                    <li>• This Visit + Chronic: Stroke, comorbidities, issues needing follow-up</li>
                    <li>• This Visit Only: Significant complications</li>
                    <li>• Chronic Only: Past history not relevant to admission</li>
                  </ul>
                </div>

                {/* Care Planning */}
                <div className="p-3 bg-white dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded text-xs flex items-center justify-center font-bold">3</span>
                    Care Planning
                  </h5>
                  <ul className="text-xs text-emerald-600 dark:text-emerald-500 space-y-1">
                    <li>• Advance care planning</li>
                    <li>• Goals of care</li>
                    <li>• Code status</li>
                  </ul>
                </div>

                {/* Interventions */}
                <div className="p-3 bg-white dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded text-xs flex items-center justify-center font-bold">4</span>
                    Interventions
                  </h5>
                  <ul className="text-xs text-emerald-600 dark:text-emerald-500 space-y-1">
                    <li>• Operative: Surgeries, EVT, stenting</li>
                    <li>• Other: Thrombolysis, mechanical ventilation</li>
                  </ul>
                </div>

                {/* Medications & Allergies */}
                <div className="p-3 bg-white dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded text-xs flex items-center justify-center font-bold">5</span>
                    Medications & Allergies
                  </h5>
                  <ul className="text-xs text-emerald-600 dark:text-emerald-500 space-y-1">
                    <li>• Allergies (correct any errors)</li>
                    <li>• Discharge medications (from reconciliation)</li>
                    <li>• Immunizations administered</li>
                  </ul>
                </div>

                {/* Clinical Details */}
                <div className="p-3 bg-white dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded text-xs flex items-center justify-center font-bold">6</span>
                    Clinical Details
                  </h5>
                  <ul className="text-xs text-emerald-600 dark:text-emerald-500 space-y-1">
                    <li>• Relevant lab results</li>
                    <li>• Functional history (pre-admission and at discharge)</li>
                    <li>• Hospital course (temporal, by diagnosis)</li>
                    <li>• Significant findings (synthesized imaging, echo, etc.)</li>
                  </ul>
                </div>
              </div>

              {/* Discharge Disposition */}
              <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Discharge Disposition Options</h4>
                <div className="flex flex-wrap gap-2">
                  {["Home", "Home with supports", "Home with outpatient rehab", "Inpatient rehabilitation", "Long Term Care", "Repatriation", "CAMU"].map((option) => (
                    <span key={option} className="px-2 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded text-xs">
                      {option}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reference Link */}
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  <strong>Reference:</strong> Adapted from VGH Neurology Discharge Summary Guide. 
                  <a href="https://vghneuro.ca/docs/discharge-summary/" target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-emerald-800 dark:hover:text-emerald-300">
                    View full documentation →
                  </a>
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

          {/* User Feedback Section */}
          <FeedbackForm />

          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Ischemic stroke investigation checklist - Always correlate with clinical presentation</p>
          </div>
        </TabsContent>

        {/* Intracerebral Hemorrhage Tab Content */}
        <TabsContent value="hemorrhagic" className="space-y-6">
          {/* Section Navigator */}
          <SectionNavigator 
            title="ICH Modules"
            sections={[
              { id: "acute-ich", label: "Acute ICH Management", icon: <ShieldAlert className="h-3.5 w-3.5 text-red-500" /> },
              { id: "ich-score", label: "ICH Score", icon: <Calculator className="h-3.5 w-3.5 text-amber-500" /> },
              { id: "func-score", label: "FUNC Score", icon: <BarChart3 className="h-3.5 w-3.5 text-blue-500" /> },
              { id: "sah-grading", label: "SAH Grading Scales", icon: <Activity className="h-3.5 w-3.5 text-purple-500" /> },
              { id: "fisher-scale", label: "Fisher Scale", icon: <Brain className="h-3.5 w-3.5 text-orange-500" /> },
              { id: "nihss-calculator", label: "NIHSS Calculator", icon: <BarChart3 className="h-3.5 w-3.5 text-indigo-500" /> },
              { id: "gcs-calculator", label: "GCS Calculator", icon: <Brain className="h-3.5 w-3.5 text-teal-500" /> },
            ]}
            onNavigateToSection={() => {}}
          />

          {/* Acute ICH Management */}
          <AcuteICHManagement />

          {/* ICH Score Calculator - Interactive Version */}
          <InteractiveICHScoreCalculator 
            onScoreChange={useCallback((score) => {
              setCalculatedScores(prev => ({ ...prev, ichScore: score }));
            }, [])}
          />

          {/* FUNC Score Calculator */}
          <FUNCScoreCalculator />

          {/* SAH Grading Scales */}
          <SAHGradingScales />

          {/* Hunt and Hess Calculator */}
          <HuntHessCalculator />

          {/* WFNS Scale Calculator */}
          <WFNSCalculator />

          {/* Fisher Scale Calculator */}
          <FisherScaleCalculator 
            onScoreChange={(scores) => {
              setCalculatedScores(prev => ({ 
                ...prev, 
                fisher: scores.fisher,
                modifiedFisher: scores.modifiedFisher 
              }));
            }}
          />
          <VisualNIHSSCalculator />

          {/* Visual GCS Calculator - also relevant for ICH */}
          <VisualGCSCalculator />

          {/* FOUR Score Calculator - also relevant for ICH */}
          <VisualFOURScoreCalculator />

          {/* NIHSS Scale Reference - also relevant for ICH */}
          <NIHSSScaleReference />

          {/* mRS Scale Reference */}
          <MRSScaleReference />

          {/* Functional Outcome Scales */}
          <FunctionalOutcomeScales />

          {/* ADL Assessment Scales */}
          <ADLAssessmentScales />

          {/* User Feedback Section */}
          <FeedbackForm />

          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Intracerebral hemorrhage investigation checklist - Always correlate with clinical presentation</p>
          </div>
        </TabsContent>

        {/* Post-IVT Hemorrhage Tab Content */}
        <TabsContent value="post-ivt" className="space-y-6">
          <LazySection id="post-ivt-hemorrhage">
            <PostThrombolysisICHManagement />
          </LazySection>

          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Post-IV thrombolysis hemorrhage management protocol - Follow institutional guidelines</p>
          </div>
        </TabsContent>

        {/* Cerebral Venous Thrombosis Tab Content */}
        <TabsContent value="cvt" className="space-y-6">
          <LazySection id="cvt-management">
            <CerebralVenousThrombosis />
          </LazySection>

          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Cerebral venous thrombosis evaluation and management - Always correlate with clinical presentation</p>
          </div>
        </TabsContent>
        {/* Subarachnoid Hemorrhage Tab Content */}
        <TabsContent value="sah" className="space-y-6">
          <LazySection id="sah-management">
            <SubarachnoidHemorrhage />
          </LazySection>

          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Subarachnoid hemorrhage management — Always correlate with clinical presentation</p>
          </div>
        </TabsContent>
        {/* Subdural Hematoma Tab Content */}
        <TabsContent value="sdh" className="space-y-6">
          <LazySection id="sdh-management">
            <SubduralHematoma />
          </LazySection>
        </TabsContent>
      </Tabs>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border/50 backdrop-blur-xl bg-background/90" style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
        <div className="grid grid-cols-6 h-16">
          {[
            { value: "ischemic", icon: <Zap className="h-5 w-5" />, label: "Ischemic", activeColor: "text-primary" },
            { value: "hemorrhagic", icon: <Droplets className="h-5 w-5" />, label: "ICH", activeColor: "text-amber-500" },
            { value: "post-ivt", icon: <AlertTriangle className="h-5 w-5" />, label: "Post IVT-ICH", activeColor: "text-rose-500" },
            { value: "cvt", icon: <Brain className="h-5 w-5" />, label: "CVT", activeColor: "text-purple-500" },
            { value: "sah", icon: <Droplets className="h-5 w-5" />, label: "SAH", activeColor: "text-red-500" },
            { value: "sdh", icon: <Layers className="h-5 w-5" />, label: "SDH", activeColor: "text-orange-500" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                activeTab === tab.value
                  ? `${tab.activeColor} font-semibold`
                  : 'text-muted-foreground'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${
                activeTab === tab.value ? 'bg-primary/10' : ''
              }`}>
                {tab.icon}
              </div>
              <span className="text-[10px] leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}