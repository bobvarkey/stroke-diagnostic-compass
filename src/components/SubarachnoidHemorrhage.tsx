import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown, AlertTriangle, Activity, Brain, Heart, Thermometer,
  Droplets, Clock, Shield, Zap, Stethoscope, Syringe, Target,
  CheckCircle2, XCircle, ArrowRight, TrendingUp, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SAHWFNSCalculator, SAHHuntHessCalculator, SAHScoreCalculator,
  HijdraScoreCalculator, VasogradeCalculator, SEBESCalculator, BNIScaleCalculator,
  PREDICTScoreCalculator
} from "./SAHScaleCalculators";
import FisherScaleCalculator from "./FisherScaleCalculator";

// ─── Diagnostic Algorithm ───────────────────────────────────────────────────

function SAHDiagnosticAlgorithm() {
  const [isOpen, setIsOpen] = useState(true);
  const [ctPositive, setCtPositive] = useState<boolean | null>(null);
  const [lpDone, setLpDone] = useState<boolean | null>(null);
  const [lpPositive, setLpPositive] = useState<boolean | null>(null);
  const [ctaDone, setCtaDone] = useState<boolean | null>(null);

  const reset = () => {
    setCtPositive(null);
    setLpDone(null);
    setLpPositive(null);
    setCtaDone(null);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50 dark:from-red-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-red-100/50 dark:bg-red-900/30">
            <CardTitle className="flex items-center justify-between text-red-800 dark:text-red-300">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                SAH Diagnostic Algorithm
                <Badge variant="outline" className="border-red-400 text-red-600 dark:text-red-400">Interactive</Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Clinical Presentation */}
            <div className="p-4 bg-red-100/60 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> When to Suspect SAH
              </h4>
              <div className="grid gap-2 sm:grid-cols-2 text-sm text-red-700 dark:text-red-400">
                <div>
                  <p className="font-semibold mb-1">Classic Presentation:</p>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li><strong>Thunderclap headache</strong> — worst of life, peaks in seconds</li>
                    <li>Onset with exertion, Valsalva, or coitus</li>
                    <li>Neck stiffness / meningismus (6-24h delay)</li>
                    <li>LOC at onset (50%), seizure (7%)</li>
                    <li>Nausea/vomiting, photophobia</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Warning Signs (Sentinel Headache):</p>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li>20-50% have sentinel leak days-weeks before</li>
                    <li>Sudden-onset headache that resolved</li>
                    <li>CN III palsy (PComA aneurysm)</li>
                    <li>CN VI palsy (raised ICP)</li>
                    <li>Subhyaloid (preretinal) hemorrhage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ottawa SAH Rule */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-300 dark:border-amber-700">
              <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">📋 Ottawa SAH Rule</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                For alert patients ≥15y with new severe non-traumatic headache reaching max intensity within 1 hour. 100% sensitivity for SAH if any present:
              </p>
              <div className="grid gap-1 sm:grid-cols-2 text-xs text-amber-700 dark:text-amber-400">
                <p>• Age ≥40 years</p>
                <p>• Neck pain or stiffness</p>
                <p>• Witnessed LOC</p>
                <p>• Onset during exertion</p>
                <p>• Thunderclap headache (instant peak)</p>
                <p>• Limited neck flexion on exam</p>
              </div>
            </div>

            {/* Interactive Decision Tree */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" /> Step-by-Step Diagnostic Pathway
                </h4>
                <Button variant="ghost" size="sm" onClick={reset} className="text-xs">
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              </div>

              {/* Step 1: Non-contrast CT */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                <p className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2">
                  Step 1: Non-Contrast CT Head (within 6h = 99% sensitive)
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
                  Sensitivity: 98-100% within 6h, 93% at 12h, 85% at 24h, 50% at 1 week
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant={ctPositive === true ? "default" : "outline"}
                    className={ctPositive === true ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setCtPositive(true)}>
                    <CheckCircle2 className="h-3 w-3 mr-1" /> SAH on CT
                  </Button>
                  <Button size="sm" variant={ctPositive === false ? "default" : "outline"}
                    className={ctPositive === false ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setCtPositive(false)}>
                    <XCircle className="h-3 w-3 mr-1" /> CT Normal
                  </Button>
                </div>
              </div>

              {/* Branch: CT Positive → CTA */}
              {ctPositive === true && (
                <div className="ml-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-500 space-y-2">
                  <p className="font-semibold text-sm text-red-800 dark:text-red-300">
                    ✓ SAH Confirmed → Proceed to CTA + Neurosurgical Consult
                  </p>
                  <div className="text-xs text-red-700 dark:text-red-400 space-y-1">
                    <p>• <strong>CTA</strong>: Sensitivity 95-100% for aneurysms ≥3mm</p>
                    <p>• <strong>DSA (catheter angiography)</strong>: Gold standard if CTA negative — repeat at 1-2 weeks</p>
                    <p>• Pattern recognition: Perimesencephalic (benign) vs. aneurysmal (diffuse)</p>
                    <p>• If CTA negative → consider DSA, venous imaging, spinal MRI</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant={ctaDone === true ? "default" : "outline"}
                      onClick={() => setCtaDone(true)}>Aneurysm Found</Button>
                    <Button size="sm" variant={ctaDone === false ? "default" : "outline"}
                      onClick={() => setCtaDone(false)}>No Aneurysm (Perimesencephalic?)</Button>
                  </div>

                  {ctaDone === true && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg mt-2">
                      <p className="text-xs font-bold text-red-800 dark:text-red-300">→ Secure aneurysm within 24h (coiling preferred if feasible, otherwise clipping)</p>
                      <p className="text-xs text-red-700 dark:text-red-400 mt-1">Proceed to Treatment Algorithm ↓</p>
                    </div>
                  )}

                  {ctaDone === false && (
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg mt-2">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Perimesencephalic SAH Pattern</p>
                      <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1">
                        <li>• Blood confined to perimesencephalic cisterns</li>
                        <li>• Repeat DSA at 1-2 weeks to rule out posterior circulation aneurysm</li>
                        <li>• Excellent prognosis if truly non-aneurysmal</li>
                        <li>• Consider spinal vascular malformation</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Branch: CT Negative → LP */}
              {ctPositive === false && (
                <div className="ml-4 space-y-3">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-l-4 border-yellow-500">
                    <p className="font-semibold text-sm text-yellow-800 dark:text-yellow-300">
                      Step 2: Lumbar Puncture (if CT &gt;6h from onset or high clinical suspicion)
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
                      Wait ≥12h from headache onset for xanthochromia to develop. If CT within 6h and negative, LP may be unnecessary per recent evidence.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant={lpDone === true ? "default" : "outline"}
                        onClick={() => { setLpDone(true); setLpPositive(null); }}>LP Performed</Button>
                      <Button size="sm" variant={lpDone === false ? "default" : "outline"}
                        onClick={() => setLpDone(false)}>LP Not Needed (CT &lt;6h)</Button>
                    </div>
                  </div>

                  {lpDone === true && (
                    <div className="ml-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-l-4 border-purple-500">
                      <p className="font-semibold text-sm text-purple-800 dark:text-purple-300 mb-2">LP Interpretation:</p>
                      <div className="text-xs text-purple-700 dark:text-purple-400 mb-3 space-y-1">
                        <p>• <strong>Xanthochromia</strong>: Visual (yellow CSF) or spectrophotometry — most specific</p>
                        <p>• <strong>RBCs</strong>: Non-clearing RBCs (same count tube 1 vs tube 4) supports SAH</p>
                        <p>• <strong>Opening pressure</strong>: Often elevated in SAH</p>
                        <p>• Traumatic tap: RBCs decrease tube 1→4, no xanthochromia, supernatant clear</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant={lpPositive === true ? "default" : "outline"}
                          className={lpPositive === true ? "bg-red-600 hover:bg-red-700" : ""}
                          onClick={() => setLpPositive(true)}>Xanthochromia / SAH+</Button>
                        <Button size="sm" variant={lpPositive === false ? "default" : "outline"}
                          className={lpPositive === false ? "bg-green-600 hover:bg-green-700" : ""}
                          onClick={() => setLpPositive(false)}>Normal LP</Button>
                      </div>

                      {lpPositive === true && (
                        <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                          <p className="text-xs font-bold text-red-800 dark:text-red-300">→ SAH Confirmed by LP → CTA/DSA urgently</p>
                        </div>
                      )}
                      {lpPositive === false && (
                        <div className="mt-2 p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                          <p className="text-xs font-bold text-green-800 dark:text-green-300">→ SAH effectively excluded. Consider alternative diagnoses.</p>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                            DDx: Thunderclap migraine, RCVS, cervical artery dissection, pituitary apoplexy, CVT
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {lpDone === false && (
                    <div className="ml-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
                      <p className="text-xs font-bold text-green-800 dark:text-green-300">
                        CT within 6h + negative = SAH very unlikely (sensitivity ~99%). Consider discharge with safety netting.
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        Controversy: Some centers still advocate LP for all, especially if presentation is classic thunderclap.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CT Patterns */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-300 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-slate-300 mb-2">🧠 SAH Distribution Patterns on CT</h4>
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                  <p className="font-semibold text-red-700 dark:text-red-400">Aneurysmal (85%)</p>
                  <p className="text-red-600 dark:text-red-500">Diffuse basal cistern blood, asymmetric → localizes to aneurysm</p>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-700 dark:text-amber-400">Perimesencephalic (10%)</p>
                  <p className="text-amber-600 dark:text-amber-500">Blood anterior to brainstem only, benign prognosis</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                  <p className="font-semibold text-purple-700 dark:text-purple-400">Convexal SAH</p>
                  <p className="text-purple-600 dark:text-purple-500">Cortical surface → consider CAA, RCVS, CVT, vasculitis</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-700 dark:text-blue-400">Spinal SAH</p>
                  <p className="text-blue-600 dark:text-blue-500">Consider spinal AVM/AVF, coagulopathy</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>References:</strong> Perry JJ et al. JAMA 2013 (Ottawa SAH Rule). Edlow JA et al. Lancet 2022. AHA/ASA Guidelines 2023.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Treatment Algorithm ────────────────────────────────────────────────────

function SAHTreatmentAlgorithm() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-orange-400 dark:border-orange-600 bg-gradient-to-br from-orange-50 dark:from-orange-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-orange-100/50 dark:bg-orange-900/30">
            <CardTitle className="flex items-center justify-between text-orange-800 dark:text-orange-300">
              <div className="flex items-center gap-2">
                <Syringe className="h-5 w-5" />
                SAH Treatment Algorithm
                <Badge variant="outline" className="border-orange-400 text-orange-600 dark:text-orange-400">AHA 2023</Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">

            {/* Initial Stabilization */}
            <div className="p-4 bg-red-100/60 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Immediate Management (First 24h)
              </h4>
              <div className="grid gap-3 sm:grid-cols-2 text-xs text-red-700 dark:text-red-400">
                <div className="space-y-1">
                  <p className="font-semibold">Airway & Hemodynamics:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Intubate if GCS ≤8 or declining</li>
                    <li>HOB 30° to reduce ICP</li>
                    <li>Target SBP &lt;160 mmHg before aneurysm secured</li>
                    <li>SBP &lt;140 mmHg reasonable (AHA Class IIa)</li>
                    <li>Nicardipine or clevidipine IV preferred</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Critical Orders:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>ICU admission (neurocritical care preferred)</li>
                    <li>Continuous EEG if altered mental status</li>
                    <li>Strict bed rest, dark/quiet environment</li>
                    <li>DVT prophylaxis: pneumatic compression devices</li>
                    <li>Antifibrinolytics (TXA/aminocaproic acid) if delay to surgery &gt;24h</li>
                    <li>NPO until aneurysm treatment plan established</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Aneurysm Securing */}
            <div className="p-4 bg-orange-100/60 dark:bg-orange-900/30 rounded-lg border border-orange-300 dark:border-orange-700">
              <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Aneurysm Securing — Goal: Within 24h
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-300 dark:border-blue-700">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1">Endovascular Coiling</h5>
                  <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-0.5 list-disc list-inside">
                    <li>Preferred for posterior circulation aneurysms</li>
                    <li>Better outcomes in ISAT trial for amenable lesions</li>
                    <li>Lower risk of cognitive deficits</li>
                    <li>Consider flow diverter for wide-neck aneurysms</li>
                    <li>Dual antiplatelet needed for stent-assisted coiling</li>
                    <li>Higher recurrence rate → follow-up imaging needed</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-300 dark:border-purple-700">
                  <h5 className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-1">Surgical Clipping</h5>
                  <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-0.5 list-disc list-inside">
                    <li>Preferred for MCA aneurysms, wide-neck lesions</li>
                    <li>More durable obliteration</li>
                    <li>Allows evacuation of significant hematoma</li>
                    <li>Better for patients needing VP shunt later</li>
                    <li>Higher morbidity (craniotomy, brain retraction)</li>
                    <li>Can address mass effect simultaneously</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs text-amber-700 dark:text-amber-400">
                <strong>Decision factors:</strong> Aneurysm morphology, location, patient age/comorbidities, surgeon expertise, availability. Multidisciplinary team discussion ideal.
              </div>
            </div>

            {/* Medical Management */}
            <div className="p-4 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-300 dark:border-teal-700">
              <h4 className="font-bold text-teal-800 dark:text-teal-300 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Ongoing Medical Management
              </h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded">
                  <p className="font-semibold text-teal-800 dark:text-teal-300">Nimodipine</p>
                  <p className="text-teal-700 dark:text-teal-400">60mg PO q4h × 21 days</p>
                  <p className="text-teal-600 dark:text-teal-500 mt-0.5">Only proven agent to improve outcomes. Do NOT give IV. Start immediately.</p>
                </div>
                <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded">
                  <p className="font-semibold text-teal-800 dark:text-teal-300">Euvolemia</p>
                  <p className="text-teal-700 dark:text-teal-400">Isotonic fluids, avoid hypovolemia</p>
                  <p className="text-teal-600 dark:text-teal-500 mt-0.5">Triple-H therapy (hypervolemia/HTN/hemodilution) no longer recommended as prophylaxis.</p>
                </div>
                <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded">
                  <p className="font-semibold text-teal-800 dark:text-teal-300">Sodium Monitoring</p>
                  <p className="text-teal-700 dark:text-teal-400">Check Na+ q6-8h</p>
                  <p className="text-teal-600 dark:text-teal-500 mt-0.5">Cerebral salt wasting common → hyponatremia. Treat with saline, NOT fluid restriction (risk of vasospasm).</p>
                </div>
                <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded">
                  <p className="font-semibold text-teal-800 dark:text-teal-300">Glucose Control</p>
                  <p className="text-teal-700 dark:text-teal-400">Target 140-180 mg/dL</p>
                  <p className="text-teal-600 dark:text-teal-500 mt-0.5">Avoid both hyper- and hypoglycemia. Insulin infusion if needed.</p>
                </div>
                <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded">
                  <p className="font-semibold text-teal-800 dark:text-teal-300">Temperature</p>
                  <p className="text-teal-700 dark:text-teal-400">Target normothermia</p>
                  <p className="text-teal-600 dark:text-teal-500 mt-0.5">Fever worsens outcomes. Aggressive treatment with acetaminophen ± cooling devices.</p>
                </div>
                <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded">
                  <p className="font-semibold text-teal-800 dark:text-teal-300">Seizure Prophylaxis</p>
                  <p className="text-teal-700 dark:text-teal-400">Consider levetiracetam</p>
                  <p className="text-teal-600 dark:text-teal-500 mt-0.5">Avoid phenytoin (associated with worse cognitive outcomes). Brief prophylaxis (3-7 days) if used.</p>
                </div>
              </div>
            </div>

            {/* Antifibrinolytic Timing */}
            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-300 dark:border-violet-700">
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-2 text-sm">⏱ Antifibrinolytic Therapy (TXA/Aminocaproic Acid)</h4>
              <div className="text-xs text-violet-700 dark:text-violet-400 space-y-1">
                <p>• Short-term (&lt;72h) use reasonable if aneurysm securing delayed (AHA Class IIa)</p>
                <p>• Reduces early rebleeding rate from ~15% to ~2%</p>
                <p>• Discontinue once aneurysm is secured</p>
                <p>• Risk: DVT, hydrocephalus, DCI — weigh against rebleeding risk</p>
                <p>• <strong>TXA</strong>: 1g IV load → 1g q8h; <strong>Aminocaproic acid</strong>: 4g IV load → 1g/h</p>
              </div>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-700 rounded-lg">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                <strong>References:</strong> Connolly ES et al. AHA/ASA Guidelines 2023. Molyneux AJ et al. ISAT Lancet 2002. Hillman J et al. Neurosurgery 2002 (antifibrinolytics).
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Complications Management ───────────────────────────────────────────────

function SAHComplicationsManagement() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeComplTab, setActiveComplTab] = useState("vasospasm");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-purple-400 dark:border-purple-600 bg-gradient-to-br from-purple-50 dark:from-purple-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-purple-100/50 dark:bg-purple-900/30">
            <CardTitle className="flex items-center justify-between text-purple-800 dark:text-purple-300">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                SAH Complications & Management
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <Tabs value={activeComplTab} onValueChange={setActiveComplTab}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-1 h-auto p-1 mb-4">
                <TabsTrigger value="vasospasm" className="text-[10px] sm:text-xs px-1">Vasospasm/DCI</TabsTrigger>
                <TabsTrigger value="rebleeding" className="text-[10px] sm:text-xs px-1">Rebleeding</TabsTrigger>
                <TabsTrigger value="hydrocephalus" className="text-[10px] sm:text-xs px-1">Hydrocephalus</TabsTrigger>
                <TabsTrigger value="seizures" className="text-[10px] sm:text-xs px-1">Seizures</TabsTrigger>
                <TabsTrigger value="systemic" className="text-[10px] sm:text-xs px-1">Systemic</TabsTrigger>
              </TabsList>

              {/* Vasospasm / DCI */}
              <TabsContent value="vasospasm" className="space-y-3">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-300 dark:border-red-700">
                  <h4 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Cerebral Vasospasm & Delayed Cerebral Ischemia (DCI)
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs text-red-700 dark:text-red-400">
                    <div>
                      <p className="font-semibold mb-1">Timeline & Epidemiology:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Peak days 4-14 (most common day 7-10)</li>
                        <li>Angiographic vasospasm: 70% of patients</li>
                        <li>Symptomatic DCI: 20-30%</li>
                        <li>Leading cause of death/disability in survivors</li>
                        <li>Higher Fisher grade → higher risk</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">DCI ≠ Vasospasm:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>DCI = clinical deterioration or new infarct</li>
                        <li>Can occur WITHOUT angiographic spasm</li>
                        <li>Multifactorial: microthrombosis, cortical spreading depolarization, inflammation</li>
                        <li>DCI is the treatment target, not spasm per se</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-300 dark:border-blue-700">
                  <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">📊 Monitoring for Vasospasm</h5>
                  <div className="grid gap-2 sm:grid-cols-2 text-xs text-blue-700 dark:text-blue-400">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded">
                      <p className="font-semibold">Transcranial Doppler (TCD)</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Daily from day 3 to day 14</li>
                        <li>MCA mean velocity &gt;120 cm/s = mild spasm</li>
                        <li>&gt;200 cm/s = severe spasm</li>
                        <li>Lindegaard ratio &gt;3 = vasospasm (MCA/ICA)</li>
                        <li>Lindegaard ratio &gt;6 = severe</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded">
                      <p className="font-semibold">Clinical Monitoring</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Neuro checks q1-2h (GCS, pupils, motor exam)</li>
                        <li>New focal deficit or decline in GCS → urgent CTA</li>
                        <li>CTP if available (for perfusion deficits)</li>
                        <li>DSA if CTA inconclusive + clinical deterioration</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-300 dark:border-green-700">
                  <h5 className="font-bold text-green-800 dark:text-green-300 mb-2">🔧 Treatment of Vasospasm / DCI</h5>
                  <div className="space-y-2 text-xs text-green-700 dark:text-green-400">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded">
                      <p className="font-semibold">Step 1: Hemodynamic Augmentation (Induced HTN)</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>SBP target 180-220 mmHg (if aneurysm secured)</li>
                        <li>Phenylephrine or norepinephrine preferred</li>
                        <li>Volume load with isotonic crystalloid</li>
                        <li>If clinical improvement → maintain MAP target</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded">
                      <p className="font-semibold">Step 2: Endovascular Rescue</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Intra-arterial milrinone or verapamil</li>
                        <li>Balloon angioplasty for proximal spasm</li>
                        <li>May need repeated treatments</li>
                        <li>Consider if refractory to hemodynamic augmentation</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded">
                      <p className="font-semibold">Step 3 (Refractory): Experimental/Adjunctive</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Intrathecal nicardipine (via EVD)</li>
                        <li>IV milrinone infusion (Montreal Protocol)</li>
                        <li>Lumbar drain CSF drainage</li>
                        <li>Stellate ganglion block (emerging evidence)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Rebleeding */}
              <TabsContent value="rebleeding" className="space-y-3">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-300 dark:border-red-700">
                  <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">🩸 Rebleeding Prevention</h4>
                  <div className="text-xs text-red-700 dark:text-red-400 space-y-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded">
                      <p className="font-semibold">Risk & Timeline:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Highest risk in first 24h (4-6%)</li>
                        <li>Cumulative 20-30% in first 2 weeks if untreated</li>
                        <li>Mortality of rebleed: 40-60%</li>
                        <li>Risk factors: High grade, larger aneurysm, unsecured</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded">
                      <p className="font-semibold">Prevention Measures:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li><strong>Early aneurysm securing (within 24h)</strong> — most important</li>
                        <li>SBP &lt;160 mmHg (strict BP control)</li>
                        <li>Avoid straining, Valsalva, agitation</li>
                        <li>Short-term antifibrinolytics if surgical delay</li>
                        <li>Avoid anticoagulation and antiplatelets until secured</li>
                        <li>Stool softeners, anxiolytics, anti-emetics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Hydrocephalus */}
              <TabsContent value="hydrocephalus" className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-300 dark:border-blue-700">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Droplets className="h-4 w-4" /> Hydrocephalus Management
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs text-blue-700 dark:text-blue-400">
                    <div>
                      <p className="font-semibold mb-1">Acute Hydrocephalus (20-30%):</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Occurs within hours-days (IVH, obstruction)</li>
                        <li>Signs: declining GCS, upgaze palsy, large ventricles</li>
                        <li>Treatment: <strong>EVD (External Ventricular Drain)</strong></li>
                        <li>Set drainage pressure 15-20 cmH₂O</li>
                        <li>Monitor for ventriculitis (CSF cultures, cell count)</li>
                        <li>Gradual weaning before removal</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Chronic Hydrocephalus (10-20%):</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Develops over weeks (communicating type)</li>
                        <li>Classic triad: gait disturbance, dementia, incontinence</li>
                        <li>Risk factors: IVH, higher Fisher grade, older age</li>
                        <li>Treatment: <strong>VP shunt placement</strong></li>
                        <li>Consider if EVD-dependent after 14-21 days</li>
                        <li>Endoscopic third ventriculostomy if obstructive</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-300 dark:border-amber-700">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>EVD Tip:</strong> In patients with unsecured aneurysms, rapid CSF drainage can cause transmural pressure changes 
                    and precipitate rebleeding. Drain cautiously (no more than 5-10 mL at a time) and secure the aneurysm ASAP.
                  </p>
                </div>
              </TabsContent>

              {/* Seizures */}
              <TabsContent value="seizures" className="space-y-3">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-300 dark:border-amber-700">
                  <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Seizure Management in SAH
                  </h4>
                  <div className="text-xs text-amber-700 dark:text-amber-400 space-y-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded">
                      <p className="font-semibold">Epidemiology:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Early seizures: 6-18% at presentation</li>
                        <li>Late epilepsy: 3-7% long-term</li>
                        <li>Risk factors: cortical ICH, rebleeding, infarction, MCA aneurysm</li>
                        <li>Non-convulsive seizures in 10-20% (cEEG needed)</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded">
                      <p className="font-semibold">Management:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li><strong>Do NOT use phenytoin</strong> — associated with worse cognitive outcomes (AHA Class III)</li>
                        <li>If prophylaxis used: levetiracetam preferred, limit to 3-7 days</li>
                        <li>Routine long-term AED prophylaxis NOT recommended</li>
                        <li>Treat acute seizures aggressively: lorazepam → levetiracetam</li>
                        <li>cEEG for unexplained altered consciousness or poor-grade SAH</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Systemic Complications */}
              <TabsContent value="systemic" className="space-y-3">
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-300 dark:border-rose-700">
                  <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Systemic Complications
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded text-rose-700 dark:text-rose-400">
                      <p className="font-semibold">Cardiac (Neurogenic Stunned Myocardium)</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Troponin elevation (30-50%)</li>
                        <li>ECG: QT prolongation, ST changes, T-wave inversions</li>
                        <li>Takotsubo-like cardiomyopathy (4-8%)</li>
                        <li>Regional wall motion abnormalities</li>
                        <li>Serial echocardiography; usually reversible</li>
                        <li>Avoid dobutamine (may worsen Takotsubo)</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded text-rose-700 dark:text-rose-400">
                      <p className="font-semibold">Pulmonary</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Neurogenic pulmonary edema (2-8%)</li>
                        <li>Aspiration pneumonia (20%)</li>
                        <li>ARDS from inflammatory cascade</li>
                        <li>PE risk — prophylactic SCDs, then pharmacologic after aneurysm secured</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded text-rose-700 dark:text-rose-400">
                      <p className="font-semibold">Electrolyte Disorders</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li><strong>Cerebral salt wasting (CSW)</strong>: Hyponatremia + volume depletion</li>
                        <li>→ Volume replace with hypertonic saline ± fludrocortisone</li>
                        <li><strong>SIADH</strong>: Hyponatremia + euvolemia/hypervolemia</li>
                        <li>→ Fluid restrict (but risky in SAH due to vasospasm)</li>
                        <li>Key distinction: CSW = hypovolemic, SIADH = eu/hypervolemic</li>
                        <li>Hyponatremia worsens vasospasm and outcomes</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded text-rose-700 dark:text-rose-400">
                      <p className="font-semibold">Fever & Anemia</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Fever: Independent predictor of poor outcome</li>
                        <li>Target normothermia aggressively</li>
                        <li>Infectious workup for each fever episode</li>
                        <li>Anemia: Hgb target &gt;8 g/dL (≥10 controversial)</li>
                        <li>Transfuse if symptomatic or Hgb &lt;8</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-700 rounded-lg">
              <p className="text-xs text-purple-600 dark:text-purple-400">
                <strong>References:</strong> Diringer MN et al. Neurocritical Care 2011. Vergouwen MDI et al. Stroke 2010 (DCI definition). 
                AHA/ASA Guidelines for SAH Management 2023. Dankbaar JW et al. Stroke 2009 (TCD monitoring).
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// SAHGradingSummary removed — replaced by interactive calculators in SAHScaleCalculators.tsx

// ─── SAH Day-by-Day Timeline ────────────────────────────────────────────────

function SAHTimeline() {
  const [isOpen, setIsOpen] = useState(false);

  const timelineItems = [
    { day: "Day 0-1", title: "Admission & Securing", color: "bg-red-500", items: ["Diagnose (CT ± LP)", "CTA → identify aneurysm", "Secure aneurysm (coil/clip) within 24h", "ICU admission, BP control", "Start nimodipine 60mg q4h", "EVD if hydrocephalus", "Antifibrinolytics if delay"] },
    { day: "Day 1-3", title: "Stabilization", color: "bg-orange-500", items: ["Serial neuro exams q1-2h", "Begin TCD monitoring", "Manage ICP if EVD in situ", "Optimize Na+, glucose, temperature", "cEEG if poor grade", "DVT prophylaxis (SCDs)", "Fever surveillance"] },
    { day: "Day 4-14", title: "Vasospasm Watch", color: "bg-amber-500", items: ["Peak vasospasm risk", "Daily TCD + clinical monitoring", "Induced HTN if symptomatic DCI", "Endovascular rescue if refractory", "Continue nimodipine", "Pharmacologic DVT ppx (after securing)", "CSW/SIADH monitoring"] },
    { day: "Day 14-21", title: "Weaning & Recovery", color: "bg-green-500", items: ["Continue nimodipine (total 21 days)", "EVD weaning trial", "VP shunt evaluation if EVD-dependent", "Mobilization, rehab evaluation", "Screen for depression, anxiety", "VTE prophylaxis continuation", "Plan stepdown/transfer"] },
    { day: "Day 21+", title: "Long-term Planning", color: "bg-blue-500", items: ["Follow-up vascular imaging (3-6mo)", "Neuropsych evaluation", "Screen for fatigue, cognitive deficits", "Driving restrictions counseling", "Smoking cessation, BP optimization", "Family screening if familial (≥2 FDR)", "Return to work assessment"] },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-cyan-400 dark:border-cyan-600 bg-gradient-to-br from-cyan-50 dark:from-cyan-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-cyan-100/50 dark:bg-cyan-900/30">
            <CardTitle className="flex items-center justify-between text-cyan-800 dark:text-cyan-300">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SAH Day-by-Day Management Timeline
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {timelineItems.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} shrink-0 mt-1`} />
                    {idx < timelineItems.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">{item.day}</Badge>
                      <span className="font-semibold text-sm">{item.title}</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                      {item.items.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function SubarachnoidHemorrhage() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950/40 dark:to-orange-950/40 rounded-lg border border-red-300 dark:border-red-700">
        <h3 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2 mb-2">
          <Droplets className="h-5 w-5" />
          Subarachnoid Hemorrhage (SAH) — Comprehensive Management
        </h3>
        <p className="text-sm text-red-700 dark:text-red-400">
          SAH accounts for ~5% of strokes but 25% of stroke-related deaths. 85% are aneurysmal. 
          Rapid diagnosis, early aneurysm securing, and vigilant complication monitoring are critical.
        </p>
      </div>

      <SAHDiagnosticAlgorithm />
      <SAHTreatmentAlgorithm />
      <SAHComplicationsManagement />

      {/* Clinical Severity Scales */}
      <SAHWFNSCalculator />
      <SAHHuntHessCalculator />
      <SAHScoreCalculator />

      {/* Radiological Scales */}
      <FisherScaleCalculator />
      <HijdraScoreCalculator />

      {/* Prognostic & DCI Prediction */}
      <VasogradeCalculator />
      <SEBESCalculator />
      <BNIScaleCalculator />

      <SAHTimeline />
    </div>
  );
}
