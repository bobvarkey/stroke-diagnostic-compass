import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Activity } from "lucide-react";

interface CVTGSState {
  lesionSize: boolean | null;    // >6cm parenchymal lesion
  bilateralBabinski: boolean | null;
  maleSex: boolean | null;
  parenchymalHemorrhage: boolean | null;
  consciousness: number | null;  // 0=alert, 1=somnolence, 2=stupor, 3=coma
}

const CVTGradingScale: React.FC = () => {
  const [state, setState] = useState<CVTGSState>({
    lesionSize: null,
    bilateralBabinski: null,
    maleSex: null,
    parenchymalHemorrhage: null,
    consciousness: null,
  });

  const { totalScore, allAnswered } = useMemo(() => {
    const answered =
      state.lesionSize !== null &&
      state.bilateralBabinski !== null &&
      state.maleSex !== null &&
      state.parenchymalHemorrhage !== null &&
      state.consciousness !== null;

    const score =
      (state.lesionSize ? 3 : 0) +
      (state.bilateralBabinski ? 3 : 0) +
      (state.maleSex ? 2 : 0) +
      (state.parenchymalHemorrhage ? 2 : 0) +
      (state.consciousness ?? 0);

    return { totalScore: score, allAnswered: answered };
  }, [state]);

  const severity = totalScore <= 2 ? "Mild" : totalScore <= 7 ? "Moderate" : "Severe";
  const fatalityRate = totalScore <= 2 ? "0.4%" : totalScore <= 7 ? "9.9%" : "61.4%";
  const severityColor =
    severity === "Mild"
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      : severity === "Moderate"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

  const BoolButton = ({
    label,
    points,
    value,
    onChange,
  }: {
    label: string;
    points: number;
    value: boolean | null;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border rounded-lg bg-muted/10 gap-2">
      <div className="text-xs sm:text-sm font-medium">
        {label} <span className="text-muted-foreground">({points} pts)</span>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onChange(false)}
          className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
            value === false
              ? "bg-green-600 border-green-600 text-white"
              : "border-muted-foreground/30 text-muted-foreground hover:border-green-400"
          }`}
        >
          No
        </button>
        <button
          onClick={() => onChange(true)}
          className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
            value === true
              ? "bg-red-600 border-red-600 text-white"
              : "border-muted-foreground/30 text-muted-foreground hover:border-red-400"
          }`}
        >
          Yes
        </button>
      </div>
    </div>
  );

  const consciousnessLevels = [
    { label: "Alert", value: 0 },
    { label: "Somnolence", value: 1 },
    { label: "Stupor", value: 2 },
    { label: "Coma", value: 3 },
  ];

  return (
    <Card className="border-2 border-teal-200 dark:border-teal-800">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-500" />
                <span className="text-base sm:text-lg">CVT Grading Scale (CVT-GS)</span>
              </div>
              <div className="flex items-center gap-2">
                {allAnswered && (
                  <Badge className={severityColor}>
                    {totalScore}/13 — {severity}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Reference */}
            <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg">
              <p className="text-xs text-teal-700 dark:text-teal-300">
                <strong>CVT-GS</strong> predicts 30-day mortality and poor functional outcome (mRS &gt;2) after CVT.
                <br />
                <span className="text-muted-foreground">Barboza et al., Front Neurol 2018. AUC 0.916 for 30-day mortality.</span>
              </p>
            </div>

            {/* Binary items */}
            <div className="space-y-2">
              <BoolButton
                label="Parenchymal lesion size > 6 cm"
                points={3}
                value={state.lesionSize}
                onChange={(v) => setState((s) => ({ ...s, lesionSize: v }))}
              />
              <BoolButton
                label="Bilateral Babinski signs"
                points={3}
                value={state.bilateralBabinski}
                onChange={(v) => setState((s) => ({ ...s, bilateralBabinski: v }))}
              />
              <BoolButton
                label="Male sex"
                points={2}
                value={state.maleSex}
                onChange={(v) => setState((s) => ({ ...s, maleSex: v }))}
              />
              <BoolButton
                label="Parenchymal hemorrhage"
                points={2}
                value={state.parenchymalHemorrhage}
                onChange={(v) => setState((s) => ({ ...s, parenchymalHemorrhage: v }))}
              />
            </div>

            {/* Level of Consciousness */}
            <div className="p-3 border border-border rounded-lg bg-muted/10">
              <p className="text-xs sm:text-sm font-medium mb-2">
                Level of Consciousness <span className="text-muted-foreground">(0–3 pts)</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {consciousnessLevels.map((lvl) => (
                  <button
                    key={lvl.value}
                    onClick={() => setState((s) => ({ ...s, consciousness: lvl.value }))}
                    className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                      state.consciousness === lvl.value
                        ? lvl.value === 0
                          ? "bg-green-600 border-green-600 text-white"
                          : lvl.value === 1
                          ? "bg-yellow-600 border-yellow-600 text-white"
                          : lvl.value === 2
                          ? "bg-orange-600 border-orange-600 text-white"
                          : "bg-red-600 border-red-600 text-white"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-teal-400"
                    }`}
                  >
                    {lvl.label} ({lvl.value})
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            <div
              className={`p-4 rounded-lg border-2 ${
                allAnswered
                  ? severity === "Mild"
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                    : severity === "Moderate"
                    ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                    : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-lg">Total: {totalScore}/13</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mild (0–2, 0.4% fatality) · Moderate (3–7, 9.9%) · Severe (8–13, 61.4%)
                  </p>
                </div>
                {allAnswered && (
                  <div className="text-right">
                    <Badge className={`text-sm px-3 py-1 ${severityColor}`}>{severity}</Badge>
                    <p className="text-xs font-semibold mt-1">30-day fatality: {fatalityRate}</p>
                  </div>
                )}
              </div>
              {allAnswered && totalScore >= 3 && (
                <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  {severity === "Severe"
                    ? "High risk of 30-day mortality. Consider ICU admission, close monitoring, and early aggressive management."
                    : "Moderate risk. Monitor closely for neurological deterioration."}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CVTGradingScale;
