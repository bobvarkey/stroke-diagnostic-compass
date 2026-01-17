import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronDown, RotateCcw, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Props {
  onScoreChange?: (score: number | null) => void;
}

export default function ICHScoreCalculator({ onScoreChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  // ICH Score components
  const [gcs, setGcs] = useState<"3-4" | "5-12" | "13-15" | null>(null);
  const [ichVolume, setIchVolume] = useState<"<30" | ">=30" | null>(null);
  const [ivhPresent, setIvhPresent] = useState<boolean | null>(null);
  const [infratentorial, setInfratentorial] = useState<boolean | null>(null);
  const [age, setAge] = useState<"<80" | ">=80" | null>(null);

  // Calculate ICH Score
  const calculateScore = (): number | null => {
    if (gcs === null || ichVolume === null || ivhPresent === null || infratentorial === null || age === null) {
      return null;
    }

    let score = 0;
    
    // GCS component
    if (gcs === "3-4") score += 2;
    else if (gcs === "5-12") score += 1;
    // 13-15 = 0 points

    // ICH Volume
    if (ichVolume === ">=30") score += 1;

    // IVH
    if (ivhPresent) score += 1;

    // Infratentorial
    if (infratentorial) score += 1;

    // Age
    if (age === ">=80") score += 1;

    return score;
  };

  const score = calculateScore();

  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  const resetCalculator = () => {
    setGcs(null);
    setIchVolume(null);
    setIvhPresent(null);
    setInfratentorial(null);
    setAge(null);
  };

  const getMortalityData = (score: number | null): { mortality: string; color: string; bgColor: string; borderColor: string } => {
    if (score === null) {
      return { mortality: "Complete all fields", color: "text-slate-500", bgColor: "bg-slate-100 dark:bg-slate-800", borderColor: "border-slate-200 dark:border-slate-700" };
    }
    
    const data: Record<number, { mortality: string; color: string; bgColor: string; borderColor: string }> = {
      0: { mortality: "0% 30-day mortality", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40", borderColor: "border-green-500" },
      1: { mortality: "13% 30-day mortality", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40", borderColor: "border-green-500" },
      2: { mortality: "26% 30-day mortality", color: "text-yellow-700 dark:text-yellow-300", bgColor: "bg-yellow-100 dark:bg-yellow-900/40", borderColor: "border-yellow-500" },
      3: { mortality: "72% 30-day mortality", color: "text-orange-700 dark:text-orange-300", bgColor: "bg-orange-100 dark:bg-orange-900/40", borderColor: "border-orange-500" },
      4: { mortality: "97% 30-day mortality", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40", borderColor: "border-red-500" },
      5: { mortality: "100% 30-day mortality", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40", borderColor: "border-red-500" },
      6: { mortality: "100% 30-day mortality", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40", borderColor: "border-red-500" },
    };
    
    return data[score] || { mortality: "Unknown", color: "text-slate-500", bgColor: "bg-slate-100 dark:bg-slate-800", borderColor: "border-slate-200" };
  };

  const mortalityData = getMortalityData(score);

  // Count completed fields
  const completedFields = [gcs, ichVolume, ivhPresent, infratentorial, age].filter(v => v !== null).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 dark:from-red-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-red-100/50 dark:bg-red-900/30">
            <CardTitle className="flex items-center justify-between text-red-800 dark:text-red-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>ICH Score Calculator</span>
                {score !== null && (
                  <Badge className="ml-2 bg-red-500 text-white">
                    Score: {score}/6
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
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>Purpose:</strong> The ICH Score predicts 30-day mortality in patients with spontaneous intracerebral hemorrhage. 
                It helps guide clinical decision-making and prognostication discussions.
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Completed: {completedFields}/5 fields
              </span>
              <button
                onClick={resetCalculator}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {/* GCS Score */}
              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  1. Glasgow Coma Scale (GCS)
                  {gcs !== null && <Badge variant="outline" className="text-xs">{gcs === "3-4" ? "+2" : gcs === "5-12" ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "13-15", label: "GCS 13-15", points: 0 },
                    { value: "5-12", label: "GCS 5-12", points: 1 },
                    { value: "3-4", label: "GCS 3-4", points: 2 },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGcs(option.value as any)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        gcs === option.value
                          ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                          : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">+{option.points} pts</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ICH Volume */}
              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  2. ICH Volume (ABC/2 method)
                  {ichVolume !== null && <Badge variant="outline" className="text-xs">{ichVolume === ">=30" ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIchVolume("<30")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      ichVolume === "<30"
                        ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="font-medium text-sm">&lt; 30 mL</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+0 pts</div>
                  </button>
                  <button
                    onClick={() => setIchVolume(">=30")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      ichVolume === ">=30"
                        ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="font-medium text-sm">≥ 30 mL</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+1 pt</div>
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ABC/2 formula: (A × B × C) / 2, where A = largest diameter, B = perpendicular diameter, C = number of slices × slice thickness
                </p>
              </div>

              {/* IVH */}
              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  3. Intraventricular Hemorrhage (IVH)
                  {ivhPresent !== null && <Badge variant="outline" className="text-xs">{ivhPresent ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIvhPresent(false)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      ivhPresent === false
                        ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="font-medium text-sm">No IVH</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+0 pts</div>
                  </button>
                  <button
                    onClick={() => setIvhPresent(true)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      ivhPresent === true
                        ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="font-medium text-sm">IVH Present</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+1 pt</div>
                  </button>
                </div>
              </div>

              {/* Infratentorial Origin */}
              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  4. Infratentorial Origin
                  {infratentorial !== null && <Badge variant="outline" className="text-xs">{infratentorial ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInfratentorial(false)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      infratentorial === false
                        ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="font-medium text-sm">Supratentorial</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+0 pts</div>
                  </button>
                  <button
                    onClick={() => setInfratentorial(true)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      infratentorial === true
                        ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="font-medium text-sm">Infratentorial</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+1 pt</div>
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Infratentorial = brainstem or cerebellum origin
                </p>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  5. Age
                  {age !== null && <Badge variant="outline" className="text-xs">{age === ">=80" ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAge("<80")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      age === "<80"
                        ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="font-medium text-sm">&lt; 80 years</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+0 pts</div>
                  </button>
                  <button
                    onClick={() => setAge(">=80")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      age === ">=80"
                        ? "border-red-500 bg-red-100 dark:bg-red-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="font-medium text-sm">≥ 80 years</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+1 pt</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className={`mt-6 p-4 rounded-lg border-2 ${mortalityData.borderColor} ${mortalityData.bgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">ICH Score</span>
                {score !== null && score >= 3 && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className={`text-4xl font-bold ${score !== null ? mortalityData.color : 'text-slate-400'}`}>
                {score !== null ? score : "—"}/6
              </div>
              <div className={`mt-2 text-sm font-medium ${mortalityData.color}`}>
                {mortalityData.mortality}
              </div>
            </div>

            {/* Mortality Reference Table */}
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-red-800 dark:text-red-300 text-sm">30-Day Mortality by ICH Score</h4>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {[
                  { score: 0, mortality: "0%", color: "bg-green-100 dark:bg-green-900/30 border-green-300" },
                  { score: 1, mortality: "13%", color: "bg-green-100 dark:bg-green-900/30 border-green-300" },
                  { score: 2, mortality: "26%", color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300" },
                  { score: 3, mortality: "72%", color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300" },
                  { score: 4, mortality: "97%", color: "bg-red-100 dark:bg-red-900/30 border-red-300" },
                  { score: 5, mortality: "100%", color: "bg-red-100 dark:bg-red-900/30 border-red-300" },
                  { score: 6, mortality: "100%", color: "bg-red-100 dark:bg-red-900/30 border-red-300" },
                ].map((item) => (
                  <div 
                    key={item.score} 
                    className={`p-2 rounded border text-center ${item.color} ${score === item.score ? 'ring-2 ring-red-500' : ''}`}
                  >
                    <div className="font-bold">{item.score}</div>
                    <div className="text-slate-600 dark:text-slate-400">{item.mortality}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Clinical Notes:</strong> The ICH Score was derived from a cohort study by Hemphill et al. (2001). 
                It should be used to inform discussions about prognosis, not as the sole determinant of care decisions. 
                Self-fulfilling prophecy from early care withdrawal can influence outcomes.
              </p>
            </div>

            {/* Warning */}
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <strong>⚠️ Caution:</strong> Do not use this score alone to make decisions about limiting care. 
                Early aggressive treatment and avoidance of do-not-resuscitate orders in the first 24-48 hours may improve outcomes.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
