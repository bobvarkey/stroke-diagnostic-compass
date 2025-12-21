import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Activity, Heart, Brain, Eye, TestTube, Search, Droplets, ArrowRight, ChevronDown, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import bostonCriteriaFlowchart from "@/assets/boston-criteria-flowchart.jpeg";

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

export default function StrokeWorkupChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleCheck = (testId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(testId)) {
      newChecked.delete(testId);
    } else {
      newChecked.add(testId);
    }
    setCheckedItems(newChecked);
  };

  const categories = Array.from(new Set(strokeTests.map(test => test.category)));
  const completionPercentage = (checkedItems.size / strokeTests.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-medical-header mb-2">
          Stroke Investigation Workup Checklist
        </h1>
        <p className="text-muted-foreground">
          Comprehensive clinical investigation checklist for stroke evaluation
        </p>
      </div>

      {/* ISPS25 Flowchart */}
      <ISPS25Flowchart />

      {/* NIHSS Scale Reference */}
      <NIHSSScaleReference />

      {/* mRS Scale Reference */}
      <MRSScaleReference />

      {/* ASPECTS Score Reference */}
      <ASPECTSScoreReference />

      {/* pc-ASPECTS Score Reference */}
      <PcASPECTSScoreReference />

      {/* CHA2DS2-VASc Calculator */}
      <CHA2DS2VAScCalculator />

      {/* HAS-BLED Calculator */}
      <HASBLEDCalculator />

      {/* ABCD2 Calculator */}
      <ABCD2Calculator />

      {/* ICH Score Calculator */}
      <ICHScoreCalculator />

      {/* FUNC Score Calculator */}
      <FUNCScoreCalculator />

      {/* SAH Grading Scales */}
      <SAHGradingScales />

      {/* Metabolic Syndrome Checker */}
      <MetabolicSyndromeChecker />

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
                {category === "Cardioembolism Aetiologies" && (
                  <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      AF Burden Management Note
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {afBurdenNote}
                    </p>
                  </div>
                )}
                {category === "HMOD Evaluation" && (
                  <div className="mb-4 space-y-4">
                    {/* ESC HMOD Diagnostic Criteria */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        ESC Criteria for Diagnosing HMOD
                      </h4>
                      
                      {/* Kidney */}
                      <div className="mb-4">
                        <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded text-xs">Kidney</span>
                          eGFR & ACR
                        </h5>
                        <ul className="text-sm text-emerald-700 dark:text-emerald-400 list-disc list-inside space-y-1 ml-2">
                          <li>eGFR {"<"}60 mL/min/1.73 m² (irrespective of albuminuria)</li>
                          <li>Albuminuria ≥30 mg/g (irrespective of eGFR)</li>
                        </ul>
                      </div>
                      
                      {/* Heart - ECG */}
                      <div className="mb-4">
                        <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded text-xs">Heart</span>
                          ECG - LVH Criteria
                        </h5>
                        <ul className="text-sm text-emerald-700 dark:text-emerald-400 list-disc list-inside space-y-1 ml-2">
                          <li>Sokolow-Lyon: SV1+RV5 {">"}35 mm</li>
                          <li>RaVL ≥11 mm</li>
                          <li>Cornell voltage: SV3+RaVL {">"}28 mm (men), {">"}20 mm (women)</li>
                        </ul>
                      </div>
                      
                      {/* Heart - Echo */}
                      <div className="mb-4">
                        <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded text-xs">Heart</span>
                          Echocardiography
                        </h5>
                        <div className="grid gap-3 md:grid-cols-2 ml-2">
                          <div>
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mb-1">LVH:</p>
                            <ul className="text-sm text-emerald-700 dark:text-emerald-400 list-disc list-inside space-y-1">
                              <li>LV mass/height²˙⁷: {">"}50 g/m²˙⁷ (men), {">"}47 (women)</li>
                              <li>LV mass/BSA: {">"}115 g/m² (men), {">"}95 (women)</li>
                              <li>LV concentric geometry: RWT ≥0.43</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mb-1">Diastolic Dysfunction:</p>
                            <ul className="text-sm text-emerald-700 dark:text-emerald-400 list-disc list-inside space-y-1">
                              <li>LA volume/height²: {">"}18.5 mL/m² (men), {">"}16.5 (women)</li>
                              <li>LA volume index: 34 mL/m²</li>
                              <li>{"e'"} {"<"}7 cm/s; E/{"e'"} {">"}14</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Cardiac Biomarkers */}
                      <div className="mb-4">
                        <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded text-xs">Heart</span>
                          Cardiac Biomarkers
                        </h5>
                        <ul className="text-sm text-emerald-700 dark:text-emerald-400 list-disc list-inside space-y-1 ml-2">
                          <li>hs-cTnT or I {">"}99th percentile upper reference limit</li>
                          <li>NT-proBNP {">"}125 pg/mL (age {"<"}75) or {">"}450 pg/mL (age ≥75)</li>
                        </ul>
                      </div>
                      
                      {/* Arteries */}
                      <div>
                        <h5 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded text-xs">Arteries</span>
                          Vascular Assessment
                        </h5>
                        <ul className="text-sm text-emerald-700 dark:text-emerald-400 list-disc list-inside space-y-1 ml-2">
                          <li>Carotid/femoral ultrasound: Plaque (focal wall thickening {">"}1.5 mm)</li>
                          <li>Carotid-femoral PWV {">"}10 m/s</li>
                          <li>Brachial-ankle PWV {">"}14 m/s</li>
                          <li>Coronary artery calcium score {">"}100 Agatston units</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* STRIVE Criteria */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        STRIVE-2 Criteria (STandards for ReportIng Vascular changes on nEuroimaging)
                      </h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {striveMarkers.map((marker, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium text-blue-800 dark:text-blue-300">{marker.name}:</span>
                            <span className="text-blue-700 dark:text-blue-400 ml-1">{marker.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Fazekas Scale */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Fazekas Scale for White Matter Hyperintensities
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">0</div>
                          <div className="text-sm font-medium text-purple-800 dark:text-purple-300">None</div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">No WMH</div>
                        </div>
                        <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">1</div>
                          <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Punctate</div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Punctate foci</div>
                        </div>
                        <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">2</div>
                          <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Early Confluent</div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Beginning to merge</div>
                        </div>
                        <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">3</div>
                          <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Confluent</div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Large confluent areas</div>
                        </div>
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-3 italic">
                        Score periventricular and deep white matter separately. Higher grades indicate greater SVD burden.
                      </p>
                    </div>
                    
                    {/* Microbleed Distribution Patterns */}
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-700 rounded-lg">
                      <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-3 flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Cerebral Microbleed Distribution Patterns
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Lobar Pattern - CAA */}
                        <div className="p-3 bg-rose-100/50 dark:bg-rose-900/30 rounded-lg border-l-4 border-rose-500">
                          <div className="font-semibold text-rose-800 dark:text-rose-300 mb-2">Lobar (Cortical-Subcortical)</div>
                          <div className="text-sm text-rose-700 dark:text-rose-400 space-y-1">
                            <p><span className="font-medium">Location:</span> Cortex, grey-white junction, subcortical white matter</p>
                            <p><span className="font-medium">Suggests:</span> Cerebral Amyloid Angiopathy (CAA)</p>
                            <p><span className="font-medium">Clinical:</span> Higher ICH recurrence risk, cognitive decline, transient focal neurological episodes</p>
                            <p><span className="font-medium">Note:</span> Strictly lobar pattern supports probable CAA (Boston criteria)</p>
                          </div>
                        </div>
                        
                        {/* Deep Pattern - Hypertensive */}
                        <div className="p-3 bg-rose-100/50 dark:bg-rose-900/30 rounded-lg border-l-4 border-rose-500">
                          <div className="font-semibold text-rose-800 dark:text-rose-300 mb-2">Deep (Basal Ganglia/Infratentorial)</div>
                          <div className="text-sm text-rose-700 dark:text-rose-400 space-y-1">
                            <p><span className="font-medium">Location:</span> Basal ganglia, thalamus, brainstem, cerebellum</p>
                            <p><span className="font-medium">Suggests:</span> Hypertensive Arteriopathy</p>
                            <p><span className="font-medium">Clinical:</span> Associated with lacunar infarcts, WMH, and hypertensive SVD</p>
                            <p><span className="font-medium">Note:</span> Often coexists with other HMOD markers</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-rose-100/70 dark:bg-rose-900/50 rounded text-xs text-rose-700 dark:text-rose-400">
                        <span className="font-medium">Mixed pattern:</span> Both lobar and deep microbleeds may indicate mixed pathology or advanced hypertensive disease. Count and distribution guide anticoagulation decisions.
                      </div>
                    </div>
                    
                    {/* Boston Criteria for CAA */}
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-700 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Boston Criteria v2.0 for CAA Diagnosis
                      </h4>
                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Definite CAA */}
                        <div className="p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg border-t-4 border-indigo-700">
                          <div className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2 text-center">Definite CAA</div>
                          <div className="text-sm text-indigo-700 dark:text-indigo-400">
                            <p>Full postmortem examination demonstrating:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Lobar, cortical, or cortical-subcortical hemorrhage</li>
                              <li>Severe CAA with vasculopathy</li>
                              <li>Absence of other diagnostic lesion</li>
                            </ul>
                          </div>
                        </div>
                        
                        {/* Probable CAA */}
                        <div className="p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg border-t-4 border-indigo-500">
                          <div className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2 text-center">Probable CAA</div>
                          <div className="text-sm text-indigo-700 dark:text-indigo-400">
                            <p className="font-medium mb-1">Age ≥50 years with:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>≥2 strictly lobar hemorrhagic lesions (ICH, microbleeds, or cSS)</li>
                              <li>OR 1 lobar hemorrhagic lesion + 1 white matter feature (severe WMH or ≥20 centrum semiovale PVS)</li>
                            </ul>
                            <p className="mt-2 text-xs italic">Excludes other causes</p>
                          </div>
                        </div>
                        
                        {/* Possible CAA */}
                        <div className="p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg border-t-4 border-indigo-300">
                          <div className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2 text-center">Possible CAA</div>
                          <div className="text-sm text-indigo-700 dark:text-indigo-400">
                            <p className="font-medium mb-1">Age ≥50 years with:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Single lobar ICH, OR</li>
                              <li>Single lobar microbleed, OR</li>
                              <li>Focal or disseminated cSS</li>
                            </ul>
                            <p className="mt-2 text-xs italic">Excludes other causes</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                        <div className="p-2 bg-indigo-100/70 dark:bg-indigo-900/50 rounded">
                          <span className="font-medium">Key hemorrhagic markers:</span> Lobar ICH, lobar microbleeds, cortical superficial siderosis (cSS)
                        </div>
                        <div className="p-2 bg-indigo-100/70 dark:bg-indigo-900/50 rounded">
                          <span className="font-medium">Exclusions:</span> Deep hemorrhage, anticoagulant-associated ICH (INR &gt;3), other identified cause
                        </div>
                      </div>
                      
                      {/* Boston Criteria Flowchart Image */}
                      <div className="mt-4">
                        <img 
                          src={bostonCriteriaFlowchart} 
                          alt="Boston Criteria v2.0 Flowchart for CAA Diagnosis showing clinical/radiologic criteria and pathology-based classification" 
                          className="w-full rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-md"
                        />
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 text-center">
                          TFNE: Transient focal neurologic event; ICH: Intracerebral hemorrhage; CSS: Cortical superficial siderosis; 
                          cSAH: Convexity subarachnoid hemorrhage; DPS: Dilated perivascular spaces; WMH: White matter hyperintensities
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-medical-section/30 transition-colors"
                    >
                      <Checkbox
                        id={test.id}
                        checked={checkedItems.has(test.id)}
                        onCheckedChange={() => handleCheck(test.id)}
                        className="data-[state=checked]:bg-medical-complete data-[state=checked]:border-medical-complete"
                      />
                      <label
                        htmlFor={test.id}
                        className={`text-sm font-medium cursor-pointer flex-1 ${
                          checkedItems.has(test.id)
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
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

      {/* Pharmacogenomics Reference Card */}
      <Collapsible>
        <Card className="border-violet-300 dark:border-violet-700 bg-gradient-to-br from-violet-50 dark:from-violet-950/30 to-background">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="bg-violet-100/50 dark:bg-violet-900/30">
              <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Pharmacogenomics - CYP2C19 & Antiplatelet Therapy Guide
                </div>
                <ChevronDown className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-6 space-y-6">
              {/* Warning Banner */}
              <div className="p-4 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-300">High Prevalence in Indian Population</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      <strong>30-50% of the Indian population</strong> carries CYP2C19 loss-of-function alleles (*2, *3), making clopidogrel resistance highly prevalent in this demographic. Consider pharmacogenomic testing or alternative antiplatelet agents.
                    </p>
                  </div>
                </div>
              </div>

              {/* CYP2C19 Overview */}
              <div className="p-4 bg-violet-100 dark:bg-violet-900/40 rounded-lg">
                <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">CYP2C19 & Clopidogrel Metabolism</h4>
                <p className="text-sm text-violet-700 dark:text-violet-400 mb-3">
                  Clopidogrel is a prodrug requiring hepatic CYP2C19 enzyme for conversion to its active metabolite. Genetic polymorphisms in CYP2C19 significantly affect drug efficacy.
                </p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-violet-800 dark:text-violet-300">Key Alleles:</span>
                  </div>
                  <ul className="list-disc list-inside text-violet-700 dark:text-violet-400 space-y-1 ml-2">
                    <li><strong>*1</strong> - Normal function (wild-type)</li>
                    <li><strong>*2</strong> - Loss-of-function (most common in South Asians)</li>
                    <li><strong>*3</strong> - Loss-of-function</li>
                    <li><strong>*17</strong> - Gain-of-function (ultrarapid metabolism)</li>
                  </ul>
                </div>
              </div>

              {/* Metabolizer Phenotypes Table */}
              <div>
                <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">CYP2C19 Metabolizer Phenotypes</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-violet-200 dark:bg-violet-800">
                        <th className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-left text-violet-900 dark:text-violet-100">Phenotype</th>
                        <th className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-left text-violet-900 dark:text-violet-100">Genotype Examples</th>
                        <th className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-left text-violet-900 dark:text-violet-100">Enzyme Activity</th>
                        <th className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-left text-violet-900 dark:text-violet-100">Clinical Implication</th>
                        <th className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-left text-violet-900 dark:text-violet-100">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="text-violet-700 dark:text-violet-400">
                      <tr className="bg-blue-50 dark:bg-blue-950/30">
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2 font-medium">Ultrarapid</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">*17/*17</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">Increased</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">Enhanced platelet inhibition</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-blue-700 dark:text-blue-400">Standard dose; monitor for bleeding</td>
                      </tr>
                      <tr className="bg-green-50 dark:bg-green-950/30">
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2 font-medium">Normal (Extensive)</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">*1/*1, *1/*17</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">Normal</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">Expected response</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-green-700 dark:text-green-400">Clopidogrel effective at standard dose</td>
                      </tr>
                      <tr className="bg-amber-50 dark:bg-amber-950/30">
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2 font-medium">Intermediate</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">*1/*2, *1/*3, *2/*17</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">Reduced</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">Diminished antiplatelet effect</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-amber-700 dark:text-amber-400">Consider alternative or double dose*</td>
                      </tr>
                      <tr className="bg-red-50 dark:bg-red-950/30">
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2 font-medium">Poor</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">*2/*2, *2/*3, *3/*3</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">Minimal/Absent</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2">Clopidogrel ineffective</td>
                        <td className="border border-violet-300 dark:border-violet-600 px-3 py-2 text-red-700 dark:text-red-400 font-medium">Use alternative antiplatelet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">*Double loading dose (600mg) followed by 150mg daily may partially overcome intermediate metabolizer status, though efficacy is variable.</p>
              </div>

              {/* PRU Testing */}
              <div className="p-4 bg-slate-100 dark:bg-slate-900/40 rounded-lg">
                <h4 className="font-semibold text-slate-800 dark:text-slate-300 mb-3">P2Y12 Reaction Units (PRU) - Platelet Function Testing</h4>
                <p className="text-sm text-slate-700 dark:text-slate-400 mb-3">
                  PRU testing (VerifyNow P2Y12 assay) measures actual platelet inhibition regardless of genotype. Useful for phenotypic confirmation.
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-700">
                    <div className="font-bold text-blue-800 dark:text-blue-300">PRU &lt; 85</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400">Adequate inhibition</div>
                    <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">↑ Bleeding risk</div>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded border border-green-200 dark:border-green-700">
                    <div className="font-bold text-green-800 dark:text-green-300">PRU 85-208</div>
                    <div className="text-xs text-green-700 dark:text-green-400">Therapeutic range</div>
                    <div className="text-xs text-green-600 dark:text-green-500 mt-1">Optimal balance</div>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded border border-red-200 dark:border-red-700">
                    <div className="font-bold text-red-800 dark:text-red-300">PRU &gt; 208</div>
                    <div className="text-xs text-red-700 dark:text-red-400">High platelet reactivity</div>
                    <div className="text-xs text-red-600 dark:text-red-500 mt-1">Clopidogrel resistance</div>
                  </div>
                </div>
              </div>

              {/* Alternative Antiplatelet Agents */}
              <div>
                <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">Alternative Antiplatelet Agents for Poor/Intermediate Metabolizers</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-teal-100 dark:bg-teal-900/40 rounded-lg border border-teal-200 dark:border-teal-700">
                    <h5 className="font-bold text-teal-800 dark:text-teal-300 mb-2">Ticagrelor (Brilinta)</h5>
                    <ul className="text-sm text-teal-700 dark:text-teal-400 space-y-1">
                      <li>• <strong>Not CYP2C19 dependent</strong></li>
                      <li>• Direct-acting, reversible P2Y12 inhibitor</li>
                      <li>• Loading: 180mg; Maintenance: 90mg BID</li>
                      <li>• Faster onset/offset than clopidogrel</li>
                      <li>• Side effects: Dyspnea, bleeding, bradyarrhythmias</li>
                      <li>• Avoid with strong CYP3A4 inhibitors</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-100 dark:bg-orange-900/40 rounded-lg border border-orange-200 dark:border-orange-700">
                    <h5 className="font-bold text-orange-800 dark:text-orange-300 mb-2">Prasugrel (Effient)</h5>
                    <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                      <li>• <strong>Less affected by CYP2C19 variants</strong></li>
                      <li>• Irreversible P2Y12 inhibitor</li>
                      <li>• Loading: 60mg; Maintenance: 10mg daily</li>
                      <li>• More potent than clopidogrel</li>
                      <li>• <strong>Contraindicated:</strong> Prior stroke/TIA, age ≥75, weight &lt;60kg</li>
                      <li>• Higher bleeding risk</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Dosing Recommendations Summary */}
              <div className="p-4 bg-violet-200 dark:bg-violet-800/40 rounded-lg">
                <h4 className="font-semibold text-violet-900 dark:text-violet-200 mb-3">Clinical Decision Algorithm</h4>
                <div className="space-y-2 text-sm text-violet-800 dark:text-violet-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-violet-900 dark:text-violet-100">1.</span>
                    <span>Consider CYP2C19 genotyping in high-risk patients (ACS, PCI, stroke) especially in South Asian populations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-violet-900 dark:text-violet-100">2.</span>
                    <span>If genotyping unavailable, consider empiric use of ticagrelor in Indian patients given high prevalence of LOF alleles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-violet-900 dark:text-violet-100">3.</span>
                    <span>PRU testing can confirm phenotypic response when genotype is uncertain</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-violet-900 dark:text-violet-100">4.</span>
                    <span>Poor metabolizers: Switch to ticagrelor (preferred) or prasugrel (if no contraindications)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-violet-900 dark:text-violet-100">5.</span>
                    <span>Intermediate metabolizers: Consider double-dose clopidogrel or switch to alternative</span>
                  </div>
                </div>
              </div>

              {/* References */}
              <div className="p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700 rounded-lg">
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  <strong>References:</strong> CPIC Guidelines for Clopidogrel and CYP2C19 (2022); Scott SA et al. <em>Clin Pharmacol Ther</em>. 2013;94(3):317-323.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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

      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        <p>Clinical investigation checklist - Always correlate with clinical presentation</p>
      </div>
    </div>
  );
}