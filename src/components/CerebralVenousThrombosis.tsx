import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Brain, Activity, Stethoscope, Pill, Syringe, Eye } from "lucide-react";
import cvtFlowchart from "@/assets/cvt-management-flowchart.png";
import CVTGradingScale from "./CVTGradingScale";
import DIAS3Calculator from "./DIAS3Calculator";
import SI2NCAL2CCalculator from "./SI2NCAL2CCalculator";

/* ─────────────────────────── Symptom Severity Scale ─────────────────────────── */

interface SymptomRow {
  label: string;
  icon: React.ReactNode;
  options: number[]; // scores for each column
  descriptions: string[];
}

const generalSymptoms: SymptomRow[] = [
  {
    label: "Headache, head pressure, eye pain",
    icon: <Brain className="h-4 w-4 text-purple-500" />,
    options: [0, 1, 2, 3],
    descriptions: ["Not Present", "Occurs Occasionally", "Occurs Frequently", "Severe"],
  },
  {
    label: "Cognitive dysfunction, poor memory",
    icon: <Brain className="h-4 w-4 text-blue-500" />,
    options: [0, 1, 2, 3],
    descriptions: ["Not Present", "Occurs Occasionally", "Occurs Frequently", "Severe"],
  },
  {
    label: "Tinnitus (including dizziness)",
    icon: <Activity className="h-4 w-4 text-amber-500" />,
    options: [0, 1, 2, 3],
    descriptions: ["Not Present", "Occurs Occasionally", "Occurs Frequently", "Severe"],
  },
  {
    label: "Dizziness, high-pitched ringing",
    icon: <Activity className="h-4 w-4 text-orange-500" />,
    options: [0, 1, 2, 3],
    descriptions: ["Not Present", "Occurs Occasionally", "Occurs Frequently", "Severe"],
  },
  {
    label: "Visual symptoms (blurred vision, loss of vision)",
    icon: <Eye className="h-4 w-4 text-cyan-500" />,
    options: [0, 1, 2, 3],
    descriptions: ["Not Present", "Occurs Occasionally", "Occurs Frequently", "Severe"],
  },
];

const motorSymptoms: SymptomRow[] = [
  {
    label: "Involuntary motor episodes (seizures, catatonia, shaking, spasms)",
    icon: <Stethoscope className="h-4 w-4 text-red-500" />,
    options: [0, 2, 4],
    descriptions: ["Not Present", "Occurs Occasionally", "Occurs Frequently"],
  },
];

const CVDSeverityScale: React.FC = () => {
  const [generalScores, setGeneralScores] = useState<(number | null)[]>(
    new Array(generalSymptoms.length).fill(null)
  );
  const [motorScore, setMotorScore] = useState<number | null>(null);
  const [disabilityScore, setDisabilityScore] = useState<number | null>(null);

  const totalScore = useMemo(() => {
    const gen = generalScores.reduce((s, v) => s + (v ?? 0), 0);
    return gen + (motorScore ?? 0) + (disabilityScore ?? 0);
  }, [generalScores, motorScore, disabilityScore]);

  const allAnswered =
    generalScores.every((s) => s !== null) &&
    motorScore !== null &&
    disabilityScore !== null;

  const severity = totalScore <= 6 ? "Mild" : totalScore <= 12 ? "Moderate" : "Severe";
  const severityColor =
    severity === "Mild"
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      : severity === "Moderate"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

  const handleGeneralChange = (idx: number, val: number) => {
    setGeneralScores((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  return (
    <Card className="border-2 border-indigo-200 dark:border-indigo-800">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-500" />
                <span className="text-base sm:text-lg">Cerebral Venous Disorders Symptom Severity Scale</span>
              </div>
              <div className="flex items-center gap-2">
                {allAnswered && (
                  <Badge className={severityColor}>{totalScore} — {severity}</Badge>
                )}
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Scoring Guide */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Scoring Guide</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded text-center"><strong>0:</strong> Not present</div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-center"><strong>1:</strong> Mild</div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-center"><strong>2:</strong> Moderate</div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-center"><strong>3:</strong> Severe</div>
              </div>
            </div>

            {/* General Symptoms */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-500" /> General Symptoms
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border-b font-medium text-muted-foreground">Symptom</th>
                      <th className="p-2 border-b text-center font-medium text-muted-foreground">Not Present<br/><span className="text-xs">(0)</span></th>
                      <th className="p-2 border-b text-center font-medium text-muted-foreground">Occasional<br/><span className="text-xs">(1)</span></th>
                      <th className="p-2 border-b text-center font-medium text-muted-foreground">Frequent<br/><span className="text-xs">(2)</span></th>
                      <th className="p-2 border-b text-center font-medium text-muted-foreground">Severe<br/><span className="text-xs">(3)</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalSymptoms.map((sym, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-2 flex items-center gap-2 min-w-[200px]">
                          {sym.icon}
                          <span className="text-xs sm:text-sm">{sym.label}</span>
                        </td>
                        {sym.options.map((val) => (
                          <td key={val} className="p-2 text-center">
                            <button
                              onClick={() => handleGeneralChange(idx, val)}
                              className={`w-8 h-8 rounded-full border-2 transition-all text-xs font-bold ${
                                generalScores[idx] === val
                                  ? "bg-indigo-600 border-indigo-600 text-white scale-110"
                                  : "border-muted-foreground/30 text-muted-foreground hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                              }`}
                            >
                              {val}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Motor Symptoms */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-500" /> Motor Symptoms
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border-b font-medium text-muted-foreground">Symptom</th>
                      <th className="p-2 border-b text-center font-medium text-muted-foreground">Not Present<br/><span className="text-xs">(0)</span></th>
                      <th className="p-2 border-b text-center font-medium text-muted-foreground">Occasional<br/><span className="text-xs">(2)</span></th>
                      <th className="p-2 border-b text-center font-medium text-muted-foreground">Frequent<br/><span className="text-xs">(4)</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {motorSymptoms.map((sym, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-2 flex items-center gap-2 min-w-[200px]">
                          {sym.icon}
                          <span className="text-xs sm:text-sm">{sym.label}</span>
                        </td>
                        {sym.options.map((val) => (
                          <td key={val} className="p-2 text-center">
                            <button
                              onClick={() => setMotorScore(val)}
                              className={`w-8 h-8 rounded-full border-2 transition-all text-xs font-bold ${
                                motorScore === val
                                  ? "bg-red-600 border-red-600 text-white scale-110"
                                  : "border-muted-foreground/30 text-muted-foreground hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                              }`}
                            >
                              {val}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disability Assessment */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Disability Assessment
              </h4>
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <p className="text-sm font-medium mb-3">Fully disabled because of your symptoms (unable to return to work/school)?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDisabilityScore(0)}
                    className={`px-6 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                      disabilityScore === 0
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-green-400"
                    }`}
                  >
                    No (0)
                  </button>
                  <button
                    onClick={() => setDisabilityScore(4)}
                    className={`px-6 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                      disabilityScore === 4
                        ? "bg-red-600 border-red-600 text-white"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-red-400"
                    }`}
                  >
                    Yes (4)
                  </button>
                </div>
              </div>
            </div>

            {/* Total Score */}
            <div className={`p-4 rounded-lg border-2 ${
              allAnswered
                ? severity === "Mild"
                  ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                  : severity === "Moderate"
                  ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                  : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                : "border-border bg-muted/20"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">Total Score: {totalScore}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mild (0–6) · Moderate (7–12) · Severe (&gt;12)
                  </p>
                </div>
                {allAnswered && (
                  <Badge className={`text-lg px-4 py-1 ${severityColor}`}>{severity}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

/* ─────────────────────────── CVT Management Flowchart ─────────────────────────── */

const CVTManagementFlowchart: React.FC = () => (
  <Card className="border-2 border-purple-200 dark:border-purple-800">
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-purple-500" />
              <span className="text-base sm:text-lg">CVT Management Algorithm</span>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
          </CardTitle>
        </CardHeader>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <CardContent className="space-y-6">
          {/* Flowchart Image */}
          <div className="rounded-lg overflow-hidden border border-border">
            <img
              src={cvtFlowchart}
              alt="CVT Management Algorithm Flowchart"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>

          {/* Clinical Presentation */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Clinical Presentation — When to Suspect CVT
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-medium text-purple-800 dark:text-purple-200">Common Symptoms:</p>
                <ul className="list-disc list-inside text-purple-600 dark:text-purple-400 space-y-0.5">
                  <li>Severe headache (often progressive, worst in morning)</li>
                  <li>Seizures (focal or generalized)</li>
                  <li>Focal neurological deficits</li>
                  <li>Papilledema / visual changes</li>
                  <li>Altered consciousness</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-purple-800 dark:text-purple-200">Risk Factors:</p>
                <ul className="list-disc list-inside text-purple-600 dark:text-purple-400 space-y-0.5">
                  <li>Oral contraceptive pills / pregnancy / postpartum</li>
                  <li>Prothrombotic states (thrombophilia, APLS)</li>
                  <li>Infections (otitis, mastoiditis, sinusitis)</li>
                  <li>Malignancy, dehydration</li>
                  <li>Head trauma, recent surgery</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Management Steps */}
          <div className="space-y-3">
            {/* Step 1: Imaging */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h5 className="font-semibold text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                Imaging Confirmation
              </h5>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <strong>MRI with T2*/SWI + MR Venography</strong> (preferred) or <strong>CT Head with CT Venography</strong>. 
                If no evidence → consider arterial stroke, idiopathic intracranial hypertension, meningitis, brain abscess, neoplasm.
              </p>
            </div>

            {/* Step 2: Etiological Evaluation */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg">
              <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-500 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                Etiological Evaluation
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400 mt-2">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Clinical:</p>
                  <p>Otitis, mastoiditis, facial infection, dehydration, head trauma, Behçet's, sarcoid, UC, malignancy, rheumatological conditions</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Exposures:</p>
                  <p>OCP, chemotherapy, COVID-19 vaccination</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Labs:</p>
                  <p>Hematocrit, CBC, renal function, urinalysis, pregnancy test, PT, aPTT, ESR, D-dimer, iron studies, hypercoag panel, APLA, MTHFR, homocysteine, serum protein electrophoresis</p>
                </div>
              </div>
            </div>

            {/* Step 3: Mass Effect */}
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h5 className="font-semibold text-red-700 dark:text-red-300 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">!</span>
                Mass Effect with Midline Shift or Herniation
              </h5>
              <p className="text-xs text-red-600 dark:text-red-400">
                Consider <strong>decompressive hemicraniectomy</strong>. 
                This is a neurosurgical emergency requiring urgent evaluation.
              </p>
            </div>

            {/* Step 4: Anticoagulation */}
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h5 className="font-semibold text-green-700 dark:text-green-300 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                Initiate Parenteral Anticoagulation
              </h5>
              <p className="text-xs text-green-600 dark:text-green-400">
                <strong>SC LMWH (preferred)</strong> or <strong>unfractionated IV heparin</strong>.
              </p>
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-300 font-medium">
                ⚠️ NB: Intracranial hemorrhage as a consequence of CVT is <strong>NOT</strong> a contraindication for anticoagulation.
              </div>
            </div>

            {/* Step 5: Stable vs Progression */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <h5 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Stable CVT
                </h5>
                <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1 list-disc list-inside">
                  <li>Transition to DOAC or warfarin</li>
                  <li>Duration: 3–12 months for transient causes</li>
                  <li>High-risk thrombophilia / recurrent VTE → indefinite OAC</li>
                  <li>LMWH preferred during pregnancy</li>
                </ul>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg">
                <h5 className="font-semibold text-rose-700 dark:text-rose-300 mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Progression (Thrombus Propagation)
                </h5>
                <ul className="text-xs text-rose-600 dark:text-rose-400 space-y-1 list-disc list-inside">
                  <li>Consider endovascular therapy</li>
                  <li>Intrasinus thrombolysis</li>
                  <li>Endovascular thrombectomy</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  </Card>
);

/* ─────────────────────────── Main Export ─────────────────────────── */

const CerebralVenousThrombosis: React.FC = () => (
  <div className="space-y-6">
    <CVTManagementFlowchart />
    <CVTGradingScale />
    <SI2NCAL2CCalculator />
    <DIAS3Calculator />
    <CVDSeverityScale />
  </div>
);

export default CerebralVenousThrombosis;
