import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ETICIGrade {
  grade: string;
  description: string;
  perfusion: string;
  outcome: "excellent" | "good" | "fair" | "poor" | "none";
  successfulReperfusion: boolean;
}

const eticiGrades: ETICIGrade[] = [
  {
    grade: "0",
    description: "No perfusion",
    perfusion: "0%",
    outcome: "none",
    successfulReperfusion: false
  },
  {
    grade: "1",
    description: "Minimal flow, no distal branch filling",
    perfusion: "0%",
    outcome: "poor",
    successfulReperfusion: false
  },
  {
    grade: "2a",
    description: "Capillary filling of some target area",
    perfusion: "1-49%",
    outcome: "poor",
    successfulReperfusion: false
  },
  {
    grade: "2b50",
    description: "Partial reperfusion",
    perfusion: "50-66%",
    outcome: "fair",
    successfulReperfusion: false
  },
  {
    grade: "2b67",
    description: "More extensive partial reperfusion",
    perfusion: "67-89%",
    outcome: "good",
    successfulReperfusion: true
  },
  {
    grade: "2c",
    description: "Near-complete, small distal branches not filled/slow flow",
    perfusion: "90-99%",
    outcome: "excellent",
    successfulReperfusion: true
  },
  {
    grade: "3",
    description: "Complete reperfusion",
    perfusion: "100%",
    outcome: "excellent",
    successfulReperfusion: true
  }
];

const ETICIScoreCalculator: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>("");

  const getSelectedGradeInfo = () => {
    return eticiGrades.find(g => g.grade === selectedGrade);
  };

  const gradeInfo = getSelectedGradeInfo();

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "excellent": return "bg-green-500 dark:bg-green-600";
      case "good": return "bg-emerald-500 dark:bg-emerald-600";
      case "fair": return "bg-yellow-500 dark:bg-yellow-600";
      case "poor": return "bg-orange-500 dark:bg-orange-600";
      case "none": return "bg-red-600 dark:bg-red-700";
      default: return "bg-muted";
    }
  };

  const getOutcomeBadgeVariant = (outcome: string) => {
    switch (outcome) {
      case "excellent":
      case "good":
        return "default";
      case "fair":
        return "secondary";
      default:
        return "destructive";
    }
  };

  return (
    <Card className="w-full border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Activity className="h-5 w-5" />
          eTICI (Expanded Treatment in Cerebral Infarction) Score
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Key Points */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Key Points</h4>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
            <li>• eTICI is an angiographic grading system that clarifies how much brain is reperfused after thrombectomy</li>
            <li>• Compared to TICI and mTICI (modified TICI) scales, it offers finer granularity for partial reperfusion</li>
            <li>• <strong>Grades 2b67, 2c, and 3</strong> are associated with better clinical outcomes</li>
            <li>• <strong>eTICI 2c/3 (≥90% reperfusion)</strong> is now often used as the primary target for successful endovascular therapy</li>
          </ul>
        </div>

        {/* Grade Selection Table */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Select eTICI Grade</h3>
          
          <RadioGroup value={selectedGrade} onValueChange={setSelectedGrade}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="p-3 text-left font-medium text-primary">Select</th>
                    <th className="p-3 text-center font-medium text-primary">eTICI Grade</th>
                    <th className="p-3 text-left font-medium text-primary">Reperfusion Description</th>
                    <th className="p-3 text-center font-medium text-primary">% Target Territory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eticiGrades.map((grade) => (
                    <tr 
                      key={grade.grade}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedGrade === grade.grade ? "bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedGrade(grade.grade)}
                    >
                      <td className="p-3">
                        <RadioGroupItem value={grade.grade} id={`grade-${grade.grade}`} />
                      </td>
                      <td className="p-3 text-center">
                        <Badge 
                          variant={grade.successfulReperfusion ? "default" : "secondary"}
                          className={grade.successfulReperfusion ? "bg-green-600" : ""}
                        >
                          {grade.grade}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Label htmlFor={`grade-${grade.grade}`} className="cursor-pointer">
                          {grade.description}
                        </Label>
                      </td>
                      <td className="p-3 text-center font-medium">
                        {grade.perfusion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RadioGroup>
        </div>

        {/* Result Display */}
        {gradeInfo && (
          <div className={`p-4 rounded-lg ${getOutcomeColor(gradeInfo.outcome)} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold">eTICI {gradeInfo.grade}</h4>
                <p className="text-sm opacity-90 mt-1">{gradeInfo.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{gradeInfo.perfusion}</div>
                <div className="text-sm opacity-90">reperfusion</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                {gradeInfo.successfulReperfusion ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Successful Reperfusion (≥67%)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Unsuccessful Reperfusion (&lt;67%)</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Outcome Interpretation */}
        {gradeInfo && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Clinical Interpretation</h4>
            <div className="space-y-3 text-sm">
              {gradeInfo.outcome === "excellent" && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400">Excellent Outcome Expected</p>
                    <p className="text-muted-foreground">Near-complete or complete reperfusion. Best prognosis for functional recovery. Associated with higher rates of good clinical outcome (mRS 0-2).</p>
                  </div>
                </div>
              )}
              {gradeInfo.outcome === "good" && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">Good Outcome Expected</p>
                    <p className="text-muted-foreground">More than two-thirds reperfusion achieved. Associated with improved outcomes compared to lower grades. May still benefit from medical optimization.</p>
                  </div>
                </div>
              )}
              {gradeInfo.outcome === "fair" && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">Intermediate Outcome</p>
                    <p className="text-muted-foreground">Partial reperfusion achieved. Outcomes variable. Consider rescue strategies if clinically indicated. Close monitoring essential.</p>
                  </div>
                </div>
              )}
              {(gradeInfo.outcome === "poor" || gradeInfo.outcome === "none") && (
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-600 dark:text-red-400">Poor Outcome Expected</p>
                    <p className="text-muted-foreground">Minimal or no reperfusion. Consider rescue attempts if safe. High risk of poor functional outcome. Discuss prognosis with family. Consider palliative care consultation if appropriate.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison with mTICI */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">eTICI vs mTICI Comparison</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>mTICI 2b</strong> = eTICI 2b50 + 2b67 (less granular, 50-89%)</p>
            <p><strong>eTICI advantage:</strong> Distinguishes between 50-66% and 67-89% reperfusion, which has prognostic significance</p>
            <p><strong>Clinical target:</strong> eTICI 2c/3 (≥90%) increasingly used as benchmark for successful thrombectomy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ETICIScoreCalculator;
