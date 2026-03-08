import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown, AlertTriangle, Activity, Brain, Clock, Shield,
  Stethoscope, Syringe, Target, CheckCircle2, XCircle, ArrowRight,
  RotateCcw, Layers, Scissors, Zap, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Classification & Clinical Features ─────────────────────────────────────

function SDHClassification() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-orange-400 dark:border-orange-600 bg-gradient-to-br from-orange-50 dark:from-orange-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-orange-100/50 dark:bg-orange-900/30">
            <CardTitle className="flex items-center justify-between text-orange-800 dark:text-orange-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <span>SDH Classification & Clinical Features</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Classification by Timing */}
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-300 text-sm mb-3">Classification by Timing</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    type: "Acute SDH",
                    timing: "< 3 days",
                    ct: "Hyperdense (white) on CT",
                    mortality: "40-60%",
                    color: "border-red-400 bg-red-50 dark:bg-red-950/20",
                    textColor: "text-red-800 dark:text-red-300",
                  },
                  {
                    type: "Subacute SDH",
                    timing: "3-21 days",
                    ct: "Isodense → may be missed on CT",
                    mortality: "Variable",
                    color: "border-amber-400 bg-amber-50 dark:bg-amber-950/20",
                    textColor: "text-amber-800 dark:text-amber-300",
                  },
                  {
                    type: "Chronic SDH (cSDH)",
                    timing: "> 21 days",
                    ct: "Hypodense (dark) ± membranes",
                    mortality: "1-5%",
                    color: "border-green-400 bg-green-50 dark:bg-green-950/20",
                    textColor: "text-green-800 dark:text-green-300",
                  },
                ].map((item) => (
                  <div key={item.type} className={`p-3 rounded-lg border-2 ${item.color}`}>
                    <div className={`font-bold text-sm ${item.textColor}`}>{item.type}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <div><strong>Timing:</strong> {item.timing}</div>
                      <div><strong>CT:</strong> {item.ct}</div>
                      <div><strong>Mortality:</strong> {item.mortality}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Presentation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-700">
                <h5 className="font-semibold text-orange-800 dark:text-orange-300 text-sm mb-2">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Acute SDH Presentation
                </h5>
                <ul className="text-xs space-y-1 text-orange-700 dark:text-orange-400">
                  <li>• Rapid neurological deterioration</li>
                  <li>• Decreased consciousness (GCS decline)</li>
                  <li>• Contralateral hemiparesis / hemiplegia</li>
                  <li>• Ipsilateral pupil dilation (uncal herniation)</li>
                  <li>• Headache, nausea, vomiting</li>
                  <li>• Cushing reflex (HTN + bradycardia)</li>
                  <li>• Seizures (early, 10-25%)</li>
                  <li>• Often trauma-related (bridging vein rupture)</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-700">
                <h5 className="font-semibold text-orange-800 dark:text-orange-300 text-sm mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Chronic SDH Presentation
                </h5>
                <ul className="text-xs space-y-1 text-orange-700 dark:text-orange-400">
                  <li>• Insidious onset over weeks-months</li>
                  <li>• Progressive headache (often bilateral)</li>
                  <li>• Cognitive decline / dementia-like symptoms</li>
                  <li>• Gait instability / falls</li>
                  <li>• Fluctuating consciousness ("stroke mimicker")</li>
                  <li>• Subtle focal deficits / speech changes</li>
                  <li>• May be incidental finding on imaging</li>
                  <li>• ⚠ High risk in elderly, anticoagulated patients</li>
                </ul>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-2">Key Risk Factors</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-amber-700 dark:text-amber-400">
                <div>• Age &gt;65</div>
                <div>• Anticoagulation</div>
                <div>• Antiplatelets</div>
                <div>• Brain atrophy</div>
                <div>• Alcohol use</div>
                <div>• Coagulopathy</div>
                <div>• Hemodialysis</div>
                <div>• Prior head trauma</div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Diagnosis & Imaging ────────────────────────────────────────────────────

function SDHDiagnosis() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-blue-100/50 dark:bg-blue-900/30">
            <CardTitle className="flex items-center justify-between text-blue-800 dark:text-blue-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>Diagnosis & Imaging</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* CT Characteristics */}
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-3">CT Head Characteristics</h4>
              <div className="space-y-2">
                {[
                  { phase: "Acute (0-3d)", density: "Hyperdense (50-70 HU)", shape: "Crescent-shaped, crosses suture lines", note: "Does NOT cross midline (unlike EDH)" },
                  { phase: "Subacute (3-21d)", density: "Isodense (may be invisible)", shape: "Look for medial displacement of grey-white junction", note: "MRI superior for detection" },
                  { phase: "Chronic (>21d)", density: "Hypodense (0-25 HU)", shape: "Crescent, may have membranes/septations", note: "Mixed density suggests rebleeding" },
                ].map((item) => (
                  <div key={item.phase} className="p-3 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/10">
                    <div className="font-semibold text-blue-800 dark:text-blue-300 text-xs">{item.phase}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <div><strong>Density:</strong> {item.density}</div>
                      <div><strong>Shape:</strong> {item.shape}</div>
                      <div><strong>Key:</strong> {item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Imaging Measurements — ARISE I */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">Key Measurements on Imaging (ARISE I)</h5>
              <ul className="text-xs space-y-1.5 text-blue-700 dark:text-blue-400">
                <li>• <strong>Maximum thickness:</strong> Measured above temporal bones, up to 2 slices above ventricles (surgical threshold: ≥10mm)</li>
                <li>• <strong>Midline shift (MLS):</strong> Displacement of septum pellucidum (surgical threshold: ≥5mm)</li>
                <li>• <strong>Morphology:</strong> Nakaguchi classification (homogeneous, laminar, separated) — predicts recurrence</li>
                <li>• <strong>Effacement:</strong> Sulcal effacement, basal cistern compression</li>
                <li>• <strong>CT Angiography:</strong> Evaluate for active bleeding / cortical vessel compression</li>
                <li>• <strong>MRI:</strong> Superior for neomembrane vascularity, isodense subacute SDH, recurrence risk assessment</li>
                <li>• <strong>AI Tools:</strong> Automated volume/mass effect analysis emerging for standardized measurement</li>
              </ul>
            </div>

            {/* Clinical Stability Assessment */}
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-700">
              <h5 className="font-semibold text-indigo-800 dark:text-indigo-300 text-xs mb-2">Clinical Stability Assessment (ARISE I)</h5>
              <ul className="text-xs space-y-1 text-indigo-700 dark:text-indigo-400">
                <li>• <strong>GCS ≥9</strong> — required for "stable" classification</li>
                <li>• <strong>Pre-morbid mRS ≤3</strong> — baseline functional status</li>
                <li>• <strong>No emergent decompensation</strong> — no profound weakness, no altered status requiring emergency intervention</li>
              </ul>
            </div>

            {/* Markwalder Grading Scale */}
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-3">Markwalder Grading Scale (cSDH)</h4>
              <div className="space-y-1.5">
                {[
                  { grade: 0, desc: "Normal neurological status", color: "bg-green-100 dark:bg-green-900/30 border-green-300" },
                  { grade: 1, desc: "Alert, oriented; mild symptoms (headache) or no deficit", color: "bg-green-100 dark:bg-green-900/30 border-green-300" },
                  { grade: 2, desc: "Drowsy/disoriented OR variable neurological deficit (e.g., hemiparesis)", color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300" },
                  { grade: 3, desc: "Stuporous but responds to stimuli; severe focal deficits", color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300" },
                  { grade: 4, desc: "Comatose, no motor response; decerebrate/decorticate posturing", color: "bg-red-100 dark:bg-red-900/30 border-red-300" },
                ].map((item) => (
                  <div key={item.grade} className={`p-2 rounded border text-xs ${item.color}`}>
                    <strong>Grade {item.grade}:</strong> {item.desc}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Treatment Indications & Decision Algorithm ─────────────────────────────

function SDHTreatmentIndications() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-emerald-100/50 dark:bg-emerald-900/30">
            <CardTitle className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Treatment Indications</span>
                <Badge variant="outline" className="border-emerald-400 text-emerald-600 dark:text-emerald-400 text-[10px]">Decision Aid</Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Acute SDH Surgical Indications */}
            <div>
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-3">
                <Scissors className="h-4 w-4 inline mr-1" />
                Acute SDH — Surgical Indications (BTF Guidelines)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700">
                  <h5 className="font-semibold text-red-800 dark:text-red-300 text-xs mb-2 flex items-center gap-1">
                    <Scissors className="h-3 w-3" /> Surgery Recommended
                  </h5>
                  <ul className="text-xs space-y-1 text-red-700 dark:text-red-400">
                    <li>• SDH thickness ≥10mm</li>
                    <li>• Midline shift ≥5mm</li>
                    <li>• GCS drop ≥2 points from injury</li>
                    <li>• ICP &gt;20 mmHg</li>
                    <li>• GCS &lt;9 with any of above</li>
                    <li>• Neurological deterioration</li>
                    <li>• Pupil asymmetry / new fixed dilated pupil</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-700">
                  <h5 className="font-semibold text-green-800 dark:text-green-300 text-xs mb-2 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Conservative Management
                  </h5>
                  <ul className="text-xs space-y-1 text-green-700 dark:text-green-400">
                    <li>• Thickness &lt;10mm AND MLS &lt;5mm</li>
                    <li>• Stable neurological exam</li>
                    <li>• GCS ≥9 without deterioration</li>
                    <li>• No pupillary changes</li>
                    <li>• ICP &lt;20 mmHg (if monitored)</li>
                    <li>• Serial imaging q6-12h initially</li>
                    <li>• ICU monitoring mandatory</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Acute SDH — Key Management Parameters */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-700">
              <h5 className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs mb-2">
                <Stethoscope className="h-3 w-3 inline mr-1" />
                Acute SDH — Key Management Parameters
              </h5>
              <ul className="text-xs space-y-1.5 text-emerald-700 dark:text-emerald-400">
                <li>• <strong>ICP Control:</strong> Maintain MAP 80-110 mmHg and SBP &lt;180 mmHg</li>
                <li>• <strong>ICP Monitoring:</strong> For comatose patients (GCS &lt;9)</li>
                <li>• <strong>Surgery:</strong> Immediate evacuation via craniotomy is standard for significant hematomas (&gt;10mm thickness or &gt;5mm shift)</li>
                <li>• <strong>Seizure Prophylaxis:</strong> 7 days of AED prophylaxis recommended</li>
                <li>• <strong>Anticoagulation:</strong> Immediate reversal is critical to prevent hematoma expansion</li>
              </ul>
            </div>

            {/* Chronic SDH Treatment Algorithm */}
            <div>
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-3">
                Chronic SDH — Treatment Decision Algorithm
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/10">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Step 1: Assess Symptoms & Imaging</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-500 text-white text-[10px]">Asymptomatic + small → Observe</Badge>
                    <Badge className="bg-amber-500 text-white text-[10px]">Mild symptoms → Medical trial</Badge>
                    <Badge className="bg-red-500 text-white text-[10px]">Significant symptoms / MLS ≥5mm → Treat</Badge>
                  </div>
                </div>
                <div className="p-3 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/10">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Step 2: Choose Treatment Modality</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300">
                      <strong>Medical</strong>
                      <div className="text-muted-foreground mt-0.5">Dexamethasone, atorvastatin, TXA, observe</div>
                    </div>
                    <div className="p-2 rounded bg-violet-100 dark:bg-violet-900/30 border border-violet-300">
                      <strong>MMA Embolization</strong>
                      <div className="text-muted-foreground mt-0.5">Minimally invasive, emerging standard</div>
                    </div>
                    <div className="p-2 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-300">
                      <strong>Surgical</strong>
                      <div className="text-muted-foreground mt-0.5">Burr hole, craniotomy, drain</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chronic SDH Key Points */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 text-xs mb-2">Chronic SDH — Clinical Pearls</h5>
              <ul className="text-xs space-y-1 text-amber-700 dark:text-amber-400">
                <li>• <strong>Surgical standard:</strong> Burr-hole drainage is standard of care for symptomatic patients with substantial mass effect</li>
                <li>• <strong>Conservative watch:</strong> ~20% of stable patients initially managed conservatively will eventually require surgery</li>
                <li>• <strong>Emerging:</strong> MMA embolization is being explored to reduce recurrence rates in chronic cases</li>
                <li>• <strong>Steroids:</strong> Evidence is limited; avoid routine use (increased complications per Dex-CSDH)</li>
                <li>• <strong>Post-op drains:</strong> Subdural drains are used to prevent recurrence after burr-hole drainage</li>
              </ul>
            </div>

            {/* Anticoagulation Reversal */}
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-700">
              <h5 className="font-semibold text-rose-800 dark:text-rose-300 text-xs mb-2">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Anticoagulation Management
              </h5>
              <ul className="text-xs space-y-1 text-rose-700 dark:text-rose-400">
                <li>• <strong>Warfarin:</strong> Reverse with 4F-PCC + IV Vitamin K (target INR &lt;1.4)</li>
                <li>• <strong>DOACs:</strong> Idarucizumab (dabigatran) or Andexanet alfa (FXa inhibitors)</li>
                <li>• <strong>Antiplatelets:</strong> Consider platelet transfusion only if surgical emergency (PATCH trial negative)</li>
                <li>• <strong>Timing of resumption:</strong> Individualize; typically 2-4 weeks post-intervention for high-risk AF patients</li>
                <li>• <strong>cSDH on anticoagulation:</strong> Higher recurrence (~30%); MMA embolization may reduce this</li>
                <li>• <strong>Critical:</strong> Immediate reversal of anticoagulants is essential to prevent hematoma expansion in all SDH types</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Surgical Treatment Options ─────────────────────────────────────────────

function SDHSurgicalOptions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-violet-400 dark:border-violet-600 bg-gradient-to-br from-violet-50 dark:from-violet-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-violet-100/50 dark:bg-violet-900/30">
            <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                <span>Surgical Treatment Options</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Acute SDH Surgery */}
            <div>
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 text-sm mb-3">Acute SDH — Surgical Approaches</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/10">
                  <h5 className="font-bold text-sm text-violet-800 dark:text-violet-300">Decompressive Craniectomy (DC)</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                    <li>• <strong>Indication:</strong> Severe acute SDH with brain swelling, refractory ICP</li>
                    <li>• <strong>Technique:</strong> Large bone flap removed, duraplasty performed</li>
                    <li>• <strong>Evidence:</strong> RESCUE-ASDH trial — DC vs craniotomy in acute SDH</li>
                    <li>• <strong>Advantage:</strong> Better ICP control when significant edema present</li>
                    <li>• <strong>Complication:</strong> Syndrome of the trephined, hydrocephalus, infection</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/10">
                  <h5 className="font-bold text-sm text-violet-800 dark:text-violet-300">Craniotomy with Evacuation</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                    <li>• <strong>Indication:</strong> Standard approach for acute SDH without severe swelling</li>
                    <li>• <strong>Technique:</strong> Bone flap raised, hematoma evacuated, hemostasis achieved, bone replaced</li>
                    <li>• <strong>Timing:</strong> Within 4 hours of deterioration associated with better outcomes</li>
                    <li>• <strong>Advantage:</strong> Direct visualization, hemostasis, bone preservation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Chronic SDH Surgery */}
            <div>
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 text-sm mb-3">Chronic SDH — Surgical Approaches</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/10">
                  <h5 className="font-bold text-sm text-violet-800 dark:text-violet-300">Burr Hole Drainage</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                    <li>• <strong>Most common procedure</strong> for chronic SDH</li>
                    <li>• 1-2 burr holes, irrigation, subdural drain placement</li>
                    <li>• Drain typically left for 24-72 hours</li>
                    <li>• Success rate: 80-90%, recurrence: 10-30%</li>
                    <li>• Can be done under local anesthesia</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/10">
                  <h5 className="font-bold text-sm text-violet-800 dark:text-violet-300">Twist Drill Craniostomy (TDC)</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                    <li>• Bedside procedure under local anesthesia</li>
                    <li>• Small twist drill hole, catheter insertion for drainage</li>
                    <li>• Ideal for high-surgical-risk patients</li>
                    <li>• May have higher recurrence than burr hole</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/10">
                  <h5 className="font-bold text-sm text-violet-800 dark:text-violet-300">Mini-Craniotomy</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                    <li>• Used for organized/septated collections</li>
                    <li>• Better for membrane removal and loculated collections</li>
                    <li>• Lower recurrence than burr hole in complex cases</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Post-Surgical Management */}
            <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700">
              <h5 className="font-semibold text-violet-800 dark:text-violet-300 text-xs mb-2">Post-Surgical Management</h5>
              <ul className="text-xs space-y-1 text-violet-700 dark:text-violet-400">
                <li>• <strong>Position:</strong> Flat bed rest or slight Trendelenburg (promotes brain re-expansion)</li>
                <li>• <strong>Hydration:</strong> IV fluid boluses to expand brain volume</li>
                <li>• <strong>Drain:</strong> Subdural drain at level of ear, remove after 24-72h</li>
                <li>• <strong>Imaging:</strong> CT 24h post-op and before discharge</li>
                <li>• <strong>Seizure:</strong> Prophylactic AEDs for 7 days (acute SDH); not routine for cSDH</li>
                <li>• <strong>Recurrence:</strong> Follow-up CT at 4-6 weeks; recurrence rate 10-30% for cSDH</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── MMA Embolization ───────────────────────────────────────────────────────

function MMAEmbolization() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const emboTools = [
    {
      id: "pvac",
      name: "PVA Particles (Polyvinyl Alcohol)",
      type: "Particulate",
      mechanism: "Mechanical occlusion of distal MMA branches",
      sizes: "150-250 µm or 250-355 µm",
      advantages: ["Widely available", "Cost-effective", "Familiar to interventionalists", "Good for distal penetration"],
      disadvantages: ["Non-target embolization risk", "Less controllable", "Cannot visualize under fluoro", "Recanalization possible"],
      evidence: "Used in multiple case series; effective but less controlled than liquid agents",
      technique: "Microcatheter positioned in MMA, slow injection under fluoroscopic guidance",
    },
    {
      id: "onyx",
      name: "Onyx (EVOH - Ethylene Vinyl Alcohol Copolymer)",
      type: "Liquid Embolic",
      mechanism: "Precipitates on contact with blood; fills vessels in controlled manner",
      sizes: "Onyx-18 (most common), Onyx-34 (for larger vessels)",
      advantages: ["Excellent visualization (tantalum)", "Controlled, slow injection", "Non-adhesive (can pause injection)", "Deep penetration into neovasculature", "Durable occlusion"],
      disadvantages: ["DMSO solvent — requires compatible catheter", "Tantalum artifact on follow-up CT/MRI", "Expensive", "Risk of cranial nerve palsy if reflux into ECA branches", "Learning curve"],
      evidence: "EMBOLISE trial, multiple large case series; considered first-line liquid embolic for MMA embolization",
      technique: "DMSO-compatible microcatheter, slow injection with 'plug and push' technique, fluoroscopic monitoring",
    },
    {
      id: "nbca",
      name: "n-BCA Glue (N-Butyl-2-Cyanoacrylate)",
      type: "Liquid Embolic (Adhesive)",
      mechanism: "Polymerizes instantly on contact with ionic solutions (blood)",
      sizes: "Diluted with Lipiodol (1:1 to 1:4 ratio to control polymerization speed)",
      advantages: ["Very rapid occlusion", "Excellent for high-flow situations", "Good penetration", "Less expensive than Onyx", "Well-established literature"],
      disadvantages: ["Adhesive — risk of catheter entrapment", "Requires precise timing", "Less controllable than Onyx", "Steep learning curve", "Risk of non-target embolization"],
      evidence: "Long track record in AVM and dural fistula embolization; effective in MMA embolization",
      technique: "Microcatheter positioned, rapid injection after Dextrose 5% flush, immediate catheter withdrawal",
    },
    {
      id: "coils",
      name: "Detachable Coils (Pushable/Hydrogel)",
      type: "Mechanical",
      mechanism: "Thrombogenic platinum coils deployed in proximal MMA trunk",
      sizes: "Varies by vessel diameter (2-4mm typically for MMA)",
      advantages: ["Very controlled deployment", "Detachable — repositionable", "Low risk of distal embolization", "Good for proximal occlusion", "Familiar to neurointerventionalists"],
      disadvantages: ["Only proximal occlusion (collaterals may reconstitute)", "Does not penetrate neovasculature", "Higher recurrence than liquid embolics", "May need multiple coils", "Expensive"],
      evidence: "MAGIC-MT and STEM trials included coil arms; effective but may have higher recurrence vs liquid embolics",
      technique: "Microcatheter in proximal MMA, sequential coil deployment until stasis achieved",
    },
    {
      id: "squid",
      name: "Squid (EVOH - Next Gen)",
      type: "Liquid Embolic",
      mechanism: "Similar to Onyx but with less tantalum, better visibility profile",
      sizes: "Squid-12 (low viscosity), Squid-18 (standard)",
      advantages: ["Less CT/MRI artifact than Onyx", "Better fluoroscopic control", "Lower viscosity option available", "Non-adhesive"],
      disadvantages: ["Similar DMSO requirement", "Newer — less published data", "May not be available in all centers", "Similar cost to Onyx"],
      evidence: "Emerging data showing comparable efficacy to Onyx with potentially fewer imaging artifacts",
      technique: "Similar to Onyx — DMSO-compatible catheter, controlled slow injection",
    },
    {
      id: "phil",
      name: "PHIL (Precipitating Hydrophobic Injectable Liquid)",
      type: "Liquid Embolic (Non-DMSO)",
      mechanism: "Copolymer that precipitates from DMSO; iodinated for visibility",
      sizes: "PHIL 25%, PHIL 30%",
      advantages: ["No tantalum → minimal CT/MRI artifact", "Good fluoroscopic visibility (iodine-based)", "Non-adhesive", "Controlled injection"],
      disadvantages: ["Newer agent — less long-term data", "Still requires DMSO solvent", "Limited availability", "Less viscous formulations may migrate"],
      evidence: "Initial studies show promising results for dural embolization with less imaging artifact",
      technique: "DMSO-compatible microcatheter, controlled injection similar to Onyx technique",
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-fuchsia-400 dark:border-fuchsia-600 bg-gradient-to-br from-fuchsia-50 dark:from-fuchsia-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-fuchsia-100/50 dark:bg-fuchsia-900/30">
            <CardTitle className="flex items-center justify-between text-fuchsia-800 dark:text-fuchsia-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>MMA Embolization</span>
                <Badge variant="outline" className="border-fuchsia-400 text-fuchsia-600 dark:text-fuchsia-400 text-[10px]">Emerging</Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Overview */}
            <div className="p-3 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-700">
              <p className="text-xs text-fuchsia-700 dark:text-fuchsia-400">
                <strong>Middle Meningeal Artery (MMA) Embolization</strong> is an emerging minimally invasive treatment
                for chronic and recurrent SDH. By occluding the MMA blood supply to the dural membrane neovasculature,
                it reduces recurrence and may serve as primary treatment or adjunct to surgery.
              </p>
            </div>

            {/* Key Trials */}
            <div>
              <h4 className="font-semibold text-fuchsia-800 dark:text-fuchsia-300 text-sm mb-2">Landmark Trials</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { trial: "EMBOLISE (2024)", result: "MMA embolization reduced surgical rescue (4.6% vs 11.3%)", design: "RCT, n=400, embolization vs standard care" },
                  { trial: "MAGIC-MT (2024)", result: "MMA embo + surgery reduced recurrence vs surgery alone (4.2% vs 11.3%)", design: "RCT, n=400, combined vs surgery" },
                  { trial: "STEM (2024)", result: "Embolization non-inferior to surgery as primary treatment", design: "RCT, embolization vs surgical evacuation" },
                  { trial: "DIAMETER (2024)", result: "Favorable safety and efficacy of MMA embolization for cSDH", design: "Multi-center registry" },
                ].map((t) => (
                  <div key={t.trial} className="p-2 rounded-lg border border-fuchsia-200 dark:border-fuchsia-700 bg-fuchsia-50/50 dark:bg-fuchsia-950/10">
                    <div className="font-bold text-xs text-fuchsia-800 dark:text-fuchsia-300">{t.trial}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t.design}</div>
                    <div className="text-[10px] text-fuchsia-700 dark:text-fuchsia-400 mt-1 font-medium">{t.result}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indications & Contraindications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-700">
                <h5 className="font-semibold text-green-800 dark:text-green-300 text-xs mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Indications
                </h5>
                <ul className="text-[10px] space-y-1 text-green-700 dark:text-green-400">
                  <li>• Symptomatic chronic SDH</li>
                  <li>• Recurrent cSDH after surgical drainage</li>
                  <li>• Bilateral cSDH</li>
                  <li>• Patients on anticoagulation (high recurrence risk)</li>
                  <li>• Poor surgical candidates</li>
                  <li>• Adjunct to surgical drainage</li>
                  <li>• Primary treatment (emerging evidence)</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700">
                <h5 className="font-semibold text-red-800 dark:text-red-300 text-xs mb-2 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Contraindications / Cautions
                </h5>
                <ul className="text-[10px] space-y-1 text-red-700 dark:text-red-400">
                  <li>• Acute SDH requiring emergency evacuation</li>
                  <li>• Dangerous anastomoses (ophthalmic artery, ICA)</li>
                  <li>• Severe renal insufficiency (contrast)</li>
                  <li>• Active infection at access site</li>
                  <li>• Severe contrast allergy</li>
                  <li>• Complete MMA origin from ophthalmic artery</li>
                </ul>
              </div>
            </div>

            {/* Embolization Tools */}
            <div>
              <h4 className="font-semibold text-fuchsia-800 dark:text-fuchsia-300 text-sm mb-3">Embolic Agents — Detailed Comparison</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {emboTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                    className={`p-2 rounded-lg border-2 text-left transition-all text-xs ${
                      selectedTool === tool.id
                        ? 'border-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-900/40 ring-1 ring-fuchsia-400'
                        : 'border-border hover:border-fuchsia-300 dark:hover:border-fuchsia-600'
                    }`}
                  >
                    <div className="font-semibold text-[10px] sm:text-xs">{tool.name.split(" (")[0]}</div>
                    <Badge variant="outline" className="text-[8px] mt-1">{tool.type}</Badge>
                  </button>
                ))}
              </div>

              {/* Selected Tool Detail */}
              {selectedTool && (() => {
                const tool = emboTools.find(t => t.id === selectedTool);
                if (!tool) return null;
                return (
                  <div className="p-4 rounded-lg border-2 border-fuchsia-400 dark:border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/20 animate-in fade-in-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-fuchsia-800 dark:text-fuchsia-300">{tool.name}</h5>
                      <Badge className="bg-fuchsia-500 text-white text-[10px]">{tool.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Mechanism:</strong> {tool.mechanism}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Sizes/Formulations:</strong> {tool.sizes}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">✓ Advantages</div>
                        <ul className="text-[10px] space-y-0.5 text-green-700 dark:text-green-400">
                          {tool.advantages.map((a, i) => <li key={i}>• {a}</li>)}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">✗ Disadvantages</div>
                        <ul className="text-[10px] space-y-0.5 text-red-700 dark:text-red-400">
                          {tool.disadvantages.map((d, i) => <li key={i}>• {d}</li>)}
                        </ul>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Technique:</strong> {tool.technique}
                    </div>
                    <div className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400 italic">
                      <strong>Evidence:</strong> {tool.evidence}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Procedural Steps */}
            <div className="p-3 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-700">
              <h5 className="font-semibold text-fuchsia-800 dark:text-fuchsia-300 text-xs mb-2">MMA Embolization — Procedural Steps</h5>
              <ol className="text-[10px] space-y-1.5 text-fuchsia-700 dark:text-fuchsia-400 list-decimal list-inside">
                <li>Femoral or radial artery access (6F sheath)</li>
                <li>ECA angiography — identify MMA origin and course</li>
                <li>Evaluate for dangerous anastomoses (ophthalmic, petrosal branch)</li>
                <li>Microcatheter (e.g., Marathon, Headway Duo) navigated to MMA trunk</li>
                <li>Position distal to petrosal branch (avoid CN VII palsy)</li>
                <li>Selective embolization with chosen agent</li>
                <li>Post-embolization angiography to confirm MMA occlusion</li>
                <li>Consider contralateral MMA embolization if bilateral or accessory supply</li>
                <li>Post-procedure: CT head at 24h, follow-up imaging at 6-12 weeks</li>
              </ol>
            </div>

            {/* Complications */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 text-xs mb-2">Potential Complications</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-amber-700 dark:text-amber-400">
                <div>
                  <strong>Procedural:</strong>
                  <ul className="mt-0.5 space-y-0.5">
                    <li>• Facial nerve palsy (petrosal branch)</li>
                    <li>• Non-target embolization</li>
                    <li>• Access site complications</li>
                    <li>• Stroke (rare)</li>
                  </ul>
                </div>
                <div>
                  <strong>Post-Procedural:</strong>
                  <ul className="mt-0.5 space-y-0.5">
                    <li>• Headache (common, self-limiting)</li>
                    <li>• Scalp necrosis (very rare)</li>
                    <li>• Recurrence (5-10% with liquid embolics)</li>
                    <li>• Need for surgical rescue (2-5%)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Medical Management ─────────────────────────────────────────────────────

function SDHMedicalManagement() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-teal-400 dark:border-teal-600 bg-gradient-to-br from-teal-50 dark:from-teal-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-teal-100/50 dark:bg-teal-900/30">
            <CardTitle className="flex items-center justify-between text-teal-800 dark:text-teal-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Syringe className="h-5 w-5" />
                <span>Medical Management (cSDH)</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              {[
                {
                  drug: "Dexamethasone",
                  dose: "Loading: 4mg BD × 2 weeks, then taper over 2 weeks",
                  evidence: "Dex-CSDH trial (2020) — reduced surgical need at 6 months, BUT no benefit at 12 months and more adverse events. Use cautiously.",
                  notes: "Monitor glucose, consider PPI prophylaxis. Contraindicated if diabetes poorly controlled.",
                  verdict: "Controversial",
                  color: "border-amber-300",
                },
                {
                  drug: "Atorvastatin",
                  dose: "20-80 mg daily for 8-12 weeks",
                  evidence: "Multiple observational studies suggest improved resolution and reduced recurrence. RCT data limited.",
                  notes: "Anti-inflammatory and pro-angiogenic effects may promote membrane resolution.",
                  verdict: "Promising",
                  color: "border-green-300",
                },
                {
                  drug: "Tranexamic Acid (TXA)",
                  dose: "500mg-1g TDS for 4-8 weeks",
                  evidence: "TRACS trial ongoing. Small studies show reduced SDH volume. Antifibrinolytic mechanism.",
                  notes: "Monitor for thromboembolic events. Avoid in active thrombosis.",
                  verdict: "Under Investigation",
                  color: "border-blue-300",
                },
                {
                  drug: "ACE Inhibitors (e.g., Enalapril)",
                  dose: "Standard antihypertensive dosing",
                  evidence: "Retrospective data suggests angiotensin pathway modulation may reduce SDH recurrence.",
                  notes: "Consider in patients with concurrent hypertension.",
                  verdict: "Hypothesis-generating",
                  color: "border-violet-300",
                },
              ].map((med) => (
                <div key={med.drug} className={`p-3 rounded-lg border ${med.color} dark:border-opacity-50 bg-background`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{med.drug}</span>
                    <Badge variant="outline" className="text-[10px]">{med.verdict}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div><strong>Dose:</strong> {med.dose}</div>
                    <div><strong>Evidence:</strong> {med.evidence}</div>
                    <div><strong>Notes:</strong> {med.notes}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700">
              <p className="text-xs text-teal-700 dark:text-teal-400">
                <strong>Clinical Pearl:</strong> Medical management is best suited for small, minimally symptomatic cSDH
                (Markwalder Grade 0-1). Consider combination therapy (e.g., atorvastatin + observation) and regular imaging
                follow-up. Escalate to MMA embolization or surgery if no improvement at 4-6 weeks.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SubduralHematoma() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-orange-500 dark:border-orange-600 bg-gradient-to-br from-orange-600 via-orange-700 to-amber-800 text-white">
        <CardContent className="py-4 sm:py-6">
          <div className="flex items-start gap-3">
            <Layers className="h-6 w-6 sm:h-8 sm:w-8 mt-1 shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                Subdural Hematoma (SDH) — Comprehensive Management
              </h2>
              <p className="text-orange-100 text-xs sm:text-sm mt-1">
                SDH is a collection of blood between the dura and arachnoid mater, most commonly from bridging vein rupture.
                Acute SDH carries high mortality (40-60%), while chronic SDH is increasingly managed with minimally invasive
                MMA embolization alongside traditional surgical drainage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SDHClassification />
      <SDHDiagnosis />
      <SDHTreatmentIndications />
      <SDHSurgicalOptions />
      <MMAEmbolization />
      <SDHMedicalManagement />

      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        <p>Subdural hematoma management — Always correlate with clinical presentation and imaging</p>
      </div>
    </div>
  );
}