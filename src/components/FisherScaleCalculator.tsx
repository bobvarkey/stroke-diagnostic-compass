import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronDown, RotateCcw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  onScoreChange?: (scores: { fisher: number | null; modifiedFisher: number | null }) => void;
}

export default function FisherScaleCalculator({ onScoreChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"original" | "modified">("modified");
  
  // Original Fisher Scale
  const [originalFisher, setOriginalFisher] = useState<number | null>(null);
  
  // Modified Fisher Scale components
  const [sahThickness, setSahThickness] = useState<"none" | "thin" | "thick" | null>(null);
  const [ivhPresent, setIvhPresent] = useState<boolean | null>(null);

  // Calculate Modified Fisher Score
  const getModifiedFisherScore = (): number | null => {
    if (sahThickness === null) return null;
    if (sahThickness === "none") return 0;
    if (sahThickness === "thin") {
      if (ivhPresent === null) return null;
      return ivhPresent ? 2 : 1;
    }
    if (sahThickness === "thick") {
      if (ivhPresent === null) return null;
      return ivhPresent ? 4 : 3;
    }
    return null;
  };

  const modifiedFisherScore = getModifiedFisherScore();

  useEffect(() => {
    onScoreChange?.({
      fisher: originalFisher,
      modifiedFisher: modifiedFisherScore
    });
  }, [originalFisher, modifiedFisherScore, onScoreChange]);

  const resetCalculator = () => {
    setOriginalFisher(null);
    setSahThickness(null);
    setIvhPresent(null);
  };

  const getVasospasmRisk = (score: number | null, isModified: boolean): { risk: string; color: string; bgColor: string } => {
    if (score === null) return { risk: "Select options", color: "text-slate-500", bgColor: "bg-slate-100 dark:bg-slate-800" };
    
    if (isModified) {
      switch (score) {
        case 0: return { risk: "0% vasospasm risk", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" };
        case 1: return { risk: "~24% vasospasm risk", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" };
        case 2: return { risk: "~33% vasospasm risk", color: "text-yellow-700 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" };
        case 3: return { risk: "~33% vasospasm risk", color: "text-yellow-700 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" };
        case 4: return { risk: "~40% vasospasm risk", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40" };
        default: return { risk: "Unknown", color: "text-slate-500", bgColor: "bg-slate-100 dark:bg-slate-800" };
      }
    } else {
      switch (score) {
        case 1: return { risk: "Low vasospasm risk", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" };
        case 2: return { risk: "Low vasospasm risk", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" };
        case 3: return { risk: "High vasospasm risk", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40" };
        case 4: return { risk: "Moderate vasospasm risk", color: "text-yellow-700 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" };
        default: return { risk: "Unknown", color: "text-slate-500", bgColor: "bg-slate-100 dark:bg-slate-800" };
      }
    }
  };

  const originalRisk = getVasospasmRisk(originalFisher, false);
  const modifiedRisk = getVasospasmRisk(modifiedFisherScore, true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-rose-300 dark:border-rose-700 bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-rose-100/50 dark:bg-rose-900/30">
            <CardTitle className="flex items-center justify-between text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>Fisher Scale Calculator (SAH)</span>
                {(originalFisher !== null || modifiedFisherScore !== null) && (
                  <Badge className="ml-2 bg-rose-500 text-white">
                    {activeTab === "modified" && modifiedFisherScore !== null
                      ? `mFisher: ${modifiedFisherScore}`
                      : originalFisher !== null
                      ? `Fisher: ${originalFisher}`
                      : ""}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Instructions */}
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 rounded-lg">
              <p className="text-sm text-rose-700 dark:text-rose-400">
                <strong>Purpose:</strong> The Fisher Scale grades subarachnoid hemorrhage (SAH) on CT to predict risk of symptomatic vasospasm. 
                The Modified Fisher Scale is preferred as it better predicts delayed cerebral ischemia.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "original" | "modified")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="modified">Modified Fisher Scale</TabsTrigger>
                <TabsTrigger value="original">Original Fisher Scale</TabsTrigger>
              </TabsList>

              {/* Modified Fisher Scale */}
              <TabsContent value="modified" className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={resetCalculator}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>

                {/* SAH Thickness */}
                <div className="space-y-2">
                  <h4 className="font-medium text-rose-800 dark:text-rose-300 text-sm">
                    1. SAH Thickness on CT
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: "none", label: "No SAH", desc: "No subarachnoid blood" },
                      { value: "thin", label: "Thin SAH", desc: "< 1mm thickness" },
                      { value: "thick", label: "Thick SAH", desc: "≥ 1mm thickness" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSahThickness(option.value as any)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          sahThickness === option.value
                            ? "border-rose-500 bg-rose-100 dark:bg-rose-900/40"
                            : "border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-600"
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* IVH Present - only show if SAH is present */}
                {sahThickness && sahThickness !== "none" && (
                  <div className="space-y-2 animate-in fade-in-50">
                    <h4 className="font-medium text-rose-800 dark:text-rose-300 text-sm">
                      2. Intraventricular Hemorrhage (IVH) in Both Lateral Ventricles?
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIvhPresent(false)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          ivhPresent === false
                            ? "border-rose-500 bg-rose-100 dark:bg-rose-900/40"
                            : "border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-600"
                        }`}
                      >
                        <div className="font-medium text-sm">No IVH</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">No blood in both lateral ventricles</div>
                      </button>
                      <button
                        onClick={() => setIvhPresent(true)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          ivhPresent === true
                            ? "border-rose-500 bg-rose-100 dark:bg-rose-900/40"
                            : "border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-600"
                        }`}
                      >
                        <div className="font-medium text-sm">IVH Present</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Blood in both lateral ventricles</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Score Display */}
                <div className={`p-4 rounded-lg border-2 ${modifiedFisherScore !== null ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'} ${modifiedRisk.bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">Modified Fisher Score</span>
                  </div>
                  <div className={`text-4xl font-bold ${modifiedFisherScore !== null ? modifiedRisk.color : 'text-slate-400'}`}>
                    {modifiedFisherScore !== null ? modifiedFisherScore : "—"}/4
                  </div>
                  <div className={`mt-2 text-sm font-medium ${modifiedRisk.color}`}>
                    {modifiedRisk.risk}
                  </div>
                </div>

                {/* Modified Fisher Grade Reference */}
                <div className="space-y-2">
                  <h4 className="font-medium text-rose-800 dark:text-rose-300 text-sm">Modified Fisher Grade Reference</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    {[
                      { grade: 0, desc: "No SAH/IVH", risk: "0%", color: "bg-green-100 dark:bg-green-900/30 border-green-300" },
                      { grade: 1, desc: "Thin SAH, no IVH", risk: "24%", color: "bg-green-100 dark:bg-green-900/30 border-green-300" },
                      { grade: 2, desc: "Thin SAH + IVH", risk: "33%", color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300" },
                      { grade: 3, desc: "Thick SAH, no IVH", risk: "33%", color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300" },
                      { grade: 4, desc: "Thick SAH + IVH", risk: "40%", color: "bg-red-100 dark:bg-red-900/30 border-red-300" },
                    ].map((item) => (
                      <div key={item.grade} className={`p-2 rounded border ${item.color} text-center`}>
                        <div className="font-bold">Grade {item.grade}</div>
                        <div className="text-slate-600 dark:text-slate-400">{item.desc}</div>
                        <div className="font-medium mt-1">~{item.risk}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Original Fisher Scale */}
              <TabsContent value="original" className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={resetCalculator}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-rose-800 dark:text-rose-300 text-sm">
                    Select CT Findings
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { grade: 1, label: "Grade 1", desc: "No blood detected on CT", risk: "Low" },
                      { grade: 2, label: "Grade 2", desc: "Diffuse or thin layer of SAH < 1mm thick, no clots", risk: "Low" },
                      { grade: 3, label: "Grade 3", desc: "Localized clot and/or thick layer ≥ 1mm", risk: "High" },
                      { grade: 4, label: "Grade 4", desc: "Intracerebral or intraventricular clot with diffuse or no SAH", risk: "Moderate" },
                    ].map((option) => (
                      <button
                        key={option.grade}
                        onClick={() => setOriginalFisher(option.grade)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          originalFisher === option.grade
                            ? "border-rose-500 bg-rose-100 dark:bg-rose-900/40"
                            : "border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{option.desc}</div>
                          </div>
                          <Badge variant="outline" className={`
                            ${option.risk === "Low" ? "border-green-500 text-green-700 dark:text-green-300" : ""}
                            ${option.risk === "High" ? "border-red-500 text-red-700 dark:text-red-300" : ""}
                            ${option.risk === "Moderate" ? "border-yellow-500 text-yellow-700 dark:text-yellow-300" : ""}
                          `}>
                            {option.risk} Risk
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Display */}
                <div className={`p-4 rounded-lg border-2 ${originalFisher !== null ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'} ${originalRisk.bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">Original Fisher Grade</span>
                  </div>
                  <div className={`text-4xl font-bold ${originalFisher !== null ? originalRisk.color : 'text-slate-400'}`}>
                    {originalFisher !== null ? originalFisher : "—"}/4
                  </div>
                  <div className={`mt-2 text-sm font-medium ${originalRisk.color}`}>
                    {originalRisk.risk}
                  </div>
                </div>

                {/* Note about Original Fisher */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    <strong>Note:</strong> The original Fisher Scale paradoxically has lower vasospasm risk for Grade 4 than Grade 3. 
                    The Modified Fisher Scale addresses this limitation and is now preferred.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 rounded-lg">
              <p className="text-xs text-rose-600 dark:text-rose-400">
                <strong>Clinical Notes:</strong> Vasospasm typically occurs 3-14 days post-SAH (peak at days 7-10). 
                Higher Fisher grades warrant more intensive TCD monitoring and consideration of prophylactic nimodipine. 
                CT should be performed within 24 hours of symptom onset for accurate grading.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
