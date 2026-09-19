import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Brain, Activity, Stethoscope, Eye } from "lucide-react";
import CVTEvaluationPathway from "./CVTEvaluationPathway";
import CVTEndovascularTechniques from "./CVTEndovascularTechniques";
import CVTGradingScale from "./CVTGradingScale";
import DIAS3Calculator from "./DIAS3Calculator";
import SI2NCAL2CCalculator from "./SI2NCAL2CCalculator";
import HeldnerCVTScore from "./HeldnerCVTScore";
import CVTIntraclotThrombolysis from "./CVTIntraclotThrombolysis";
import CVTProceduralTechniques from "./CVTProceduralTechniques";

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
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded text-center text-green-900 dark:text-green-100"><strong>0:</strong> Not present</div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded text-center text-yellow-900 dark:text-yellow-100"><strong>1:</strong> Mild</div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded text-center text-orange-900 dark:text-orange-100"><strong>2:</strong> Moderate</div>
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded text-center text-red-900 dark:text-red-100"><strong>3:</strong> Severe</div>
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

/* ─────────────────────────── Main Export ─────────────────────────── */

const CerebralVenousThrombosis: React.FC = () => (
  <div className="space-y-6">
    <CVTEvaluationPathway />
    <CVTIntraclotThrombolysis />
    <CVTProceduralTechniques />
    <CVTEndovascularTechniques />
    <HeldnerCVTScore />
    <CVTGradingScale />
    <SI2NCAL2CCalculator />
    <DIAS3Calculator />
    <CVDSeverityScale />
  </div>
);

export default CerebralVenousThrombosis;
