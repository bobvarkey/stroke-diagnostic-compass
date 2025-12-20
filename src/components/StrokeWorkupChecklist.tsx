import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Activity, Heart, Brain, Eye, TestTube, Search, Droplets, ArrowRight, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
];

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

      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        <p>Clinical investigation checklist - Always correlate with clinical presentation</p>
      </div>
    </div>
  );
}