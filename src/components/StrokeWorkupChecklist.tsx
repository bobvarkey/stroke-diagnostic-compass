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
  { id: "apob", name: "ApoB Level (Normal: <90 mg/dL; High risk: <70 mg/dL; Very high risk: <55 mg/dL)", category: "Lipid Assessment" },
  { id: "lpa", name: "Lp(a) Level (Normal: <30 mg/dL or <75 nmol/L; Elevated: ≥50 mg/dL or ≥125 nmol/L)", category: "Lipid Assessment" },
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