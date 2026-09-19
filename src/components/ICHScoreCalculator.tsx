import { useState, useEffect, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronDown, RotateCcw, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { calculatorOptionClass, cn } from "@/lib/utils";

interface Props {
  onScoreChange?: (score: number | null) => void;
}

function OptionButton({
  selected,
  onClick,
  label,
  points,
}: {
  selected: boolean;
  onClick: () => void;
  label: ReactNode;
  points: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("p-3 rounded-lg border-2 text-center transition-all", calculatorOptionClass(selected))}
    >
      <div className="font-medium text-sm">{label}</div>
      <div className={cn("text-xs", selected ? "text-white/90" : "text-muted-foreground")}>{points}</div>
    </button>
  );
}

export default function ICHScoreCalculator({ onScoreChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [gcs, setGcs] = useState<"3-4" | "5-12" | "13-15" | null>(null);
  const [ichVolume, setIchVolume] = useState<"<30" | ">=30" | null>(null);
  const [ivhPresent, setIvhPresent] = useState<boolean | null>(null);
  const [infratentorial, setInfratentorial] = useState<boolean | null>(null);
  const [age, setAge] = useState<"<80" | ">=80" | null>(null);

  const calculateScore = (): number | null => {
    if (gcs === null || ichVolume === null || ivhPresent === null || infratentorial === null || age === null) {
      return null;
    }

    let score = 0;
    if (gcs === "3-4") score += 2;
    else if (gcs === "5-12") score += 1;
    if (ichVolume === ">=30") score += 1;
    if (ivhPresent) score += 1;
    if (infratentorial) score += 1;
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
      return { mortality: "Complete all fields", color: "text-muted-foreground", bgColor: "bg-slate-100 dark:bg-slate-800", borderColor: "border-slate-200 dark:border-slate-700" };
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

    return data[score] || { mortality: "Unknown", color: "text-muted-foreground", bgColor: "bg-slate-100 dark:bg-slate-800", borderColor: "border-slate-200" };
  };

  const mortalityData = getMortalityData(score);
  const completedFields = [gcs, ichVolume, ivhPresent, infratentorial, age].filter((v) => v !== null).length;

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
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Purpose:</strong> The ICH Score predicts 30-day mortality in patients with spontaneous intracerebral hemorrhage.
                It helps guide clinical decision-making and prognostication discussions.
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">
                Completed: {completedFields}/5 fields
              </span>
              <button
                type="button"
                onClick={resetCalculator}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  1. Glasgow Coma Scale (GCS)
                  {gcs !== null && <Badge variant="outline" className="text-xs">{gcs === "3-4" ? "+2" : gcs === "5-12" ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "13-15" as const, label: "GCS 13-15", points: "+0 pts" },
                    { value: "5-12" as const, label: "GCS 5-12", points: "+1 pts" },
                    { value: "3-4" as const, label: "GCS 3-4", points: "+2 pts" },
                  ].map((option) => (
                    <OptionButton
                      key={option.value}
                      selected={gcs === option.value}
                      onClick={() => setGcs(option.value)}
                      label={option.label}
                      points={option.points}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  2. ICH Volume (ABC/2 method)
                  {ichVolume !== null && <Badge variant="outline" className="text-xs">{ichVolume === ">=30" ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <OptionButton selected={ichVolume === "<30"} onClick={() => setIchVolume("<30")} label="< 30 mL" points="+0 pts" />
                  <OptionButton selected={ichVolume === ">=30"} onClick={() => setIchVolume(">=30")} label="≥ 30 mL" points="+1 pt" />
                </div>
                <p className="text-xs text-muted-foreground">
                  ABC/2 formula: (A × B × C) / 2, where A = largest diameter, B = perpendicular diameter, C = number of slices × slice thickness
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  3. Intraventricular Hemorrhage (IVH)
                  {ivhPresent !== null && <Badge variant="outline" className="text-xs">{ivhPresent ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <OptionButton selected={ivhPresent === false} onClick={() => setIvhPresent(false)} label="No IVH" points="+0 pts" />
                  <OptionButton selected={ivhPresent === true} onClick={() => setIvhPresent(true)} label="IVH Present" points="+1 pt" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  4. Infratentorial Origin
                  {infratentorial !== null && <Badge variant="outline" className="text-xs">{infratentorial ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <OptionButton selected={infratentorial === false} onClick={() => setInfratentorial(false)} label="Supratentorial" points="+0 pts" />
                  <OptionButton selected={infratentorial === true} onClick={() => setInfratentorial(true)} label="Infratentorial" points="+1 pt" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Infratentorial = brainstem or cerebellum origin
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  5. Age
                  {age !== null && <Badge variant="outline" className="text-xs">{age === ">=80" ? "+1" : "+0"}</Badge>}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <OptionButton selected={age === "<80"} onClick={() => setAge("<80")} label="< 80 years" points="+0 pts" />
                  <OptionButton selected={age === ">=80"} onClick={() => setAge(">=80")} label="≥ 80 years" points="+1 pt" />
                </div>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg border-2 ${mortalityData.borderColor} ${mortalityData.bgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">ICH Score</span>
                {score !== null && score >= 3 && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className={`text-4xl font-bold ${score !== null ? mortalityData.color : "text-slate-400"}`}>
                {score !== null ? score : "—"}/6
              </div>
              <div className={`mt-2 text-sm font-medium ${mortalityData.color}`}>
                {mortalityData.mortality}
              </div>
            </div>

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
                    className={`p-2 rounded border text-center ${item.color} ${score === item.score ? "ring-2 ring-red-500" : ""}`}
                  >
                    <div className="font-bold">{item.score}</div>
                    <div className="text-slate-700 dark:text-slate-200">{item.mortality}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs text-red-800 dark:text-red-200">
                <strong>Clinical Notes:</strong> The ICH Score was derived from a cohort study by Hemphill et al. (2001).
                It should be used to inform discussions about prognosis, not as the sole determinant of care decisions.
                Self-fulfilling prophecy from early care withdrawal can influence outcomes.
              </p>
            </div>

            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
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
