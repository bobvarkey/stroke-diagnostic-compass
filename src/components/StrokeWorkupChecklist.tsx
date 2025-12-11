import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Activity, Heart, Brain, Eye, TestTube, Search } from "lucide-react";

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
  { id: "apob", name: "ApoB Level", category: "Lipid Assessment" },
  { id: "lpa", name: "Lp(a) Level", category: "Lipid Assessment" },
  { id: "lipid_high_apob", name: "High ApoB → Treat for high atherogenic load", category: "Lipid Assessment" },
  { id: "lipid_normal_apob_high_lpa", name: "Normal ApoB + High Lp(a) → Hidden inherited risk", category: "Lipid Assessment" },
  { id: "lipid_both_high", name: "Both High → Very high lifetime risk, aggressive management", category: "Lipid Assessment" },
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
};

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