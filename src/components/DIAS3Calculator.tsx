import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Zap, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const DIAS3Calculator: React.FC = () => {
  const [decompressive, setDecompressive] = useState<boolean | null>(null);
  const [ich, setIch] = useState<boolean | null>(null);
  const [age, setAge] = useState(40);
  const [seizures, setSeizures] = useState<boolean | null>(null);
  const [statusEpilepticus, setStatusEpilepticus] = useState<boolean | null>(null);
  const [subduralHematoma, setSubduralHematoma] = useState<boolean | null>(null);

  const allAnswered =
    decompressive !== null &&
    ich !== null &&
    seizures !== null &&
    statusEpilepticus !== null &&
    subduralHematoma !== null;

  const { risk1y, risk3y } = useMemo(() => {
    if (!allAnswered) return { risk1y: null, risk3y: null };

    // Coefficients from JAMA Neurology 2024 (Lindgren et al.)
    const A =
      (decompressive ? 0.8234791 : 0) +
      (ich ? 0.3680903 : 0) +
      0.01301186 * (age / 10) + // age per decade — actually it's age in years * coefficient per decade
      (seizures ? 0.4197767 : 0) +
      (statusEpilepticus ? 0.8561262 : 0) +
      (subduralHematoma ? 0.2464726 : 0);

    // Wait — from the paper: "0.01301186 × age (per decade)"
    // That means multiply by age/10? No, the coefficient is "per decade" meaning for each decade of age.
    // Actually re-reading: the coefficient column says 0.013, HR per decade is 1.01
    // The formula says: 0.01301186 × age (per decade)
    // So if age = 40, age in decades = 4, contribution = 0.01301186 * 4 = 0.052
    // Actually wait, looking more carefully at the table:
    // "Age at onset (in decades)" with coefficient 0.013
    // So it's age expressed in decades. age=40 → 4 decades → 4*0.01301186
    
    const ageDecades = age / 10;
    const Acorrected =
      (decompressive ? 0.8234791 : 0) +
      (ich ? 0.3680903 : 0) +
      0.01301186 * ageDecades +
      (seizures ? 0.4197767 : 0) +
      (statusEpilepticus ? 0.8561262 : 0) +
      (subduralHematoma ? 0.2464726 : 0);

    const baselineOffset = 0.4390308;
    const baseline1y = 0.09996527;
    const baseline3y = 0.14976;

    // Formula: 1 − (1 − baseline_hazard) ^ exp(A − 0.4390308)
    const r1 = 1 - Math.pow(1 - baseline1y, Math.exp(Acorrected - baselineOffset));
    const r3 = 1 - Math.pow(1 - baseline3y, Math.exp(Acorrected - baselineOffset));

    return {
      risk1y: Math.min(Math.max(r1 * 100, 0), 100),
      risk3y: Math.min(Math.max(r3 * 100, 0), 100),
    };
  }, [allAnswered, decompressive, ich, age, seizures, statusEpilepticus, subduralHematoma]);

  const riskCategory = risk1y === null ? null : risk1y < 10 ? "Low" : risk1y < 20 ? "Moderate" : "High";
  const riskColor =
    riskCategory === "Low"
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      : riskCategory === "Moderate"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

  const BoolButton = ({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean | null;
    onChange: (v: boolean) => void;
  }) => (
    <div className="p-3 border border-border rounded-lg bg-muted/10">
      <p className="text-xs sm:text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      <div className="flex gap-2">
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

  return (
    <Card className="border-2 border-violet-200 dark:border-violet-800">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-500" />
                <span className="text-base sm:text-lg">DIAS3 — Post-CVT Epilepsy Risk</span>
              </div>
              <div className="flex items-center gap-2">
                {risk1y !== null && (
                  <Badge className={riskColor}>
                    1-yr: {risk1y.toFixed(1)}%
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg">
              <p className="text-xs text-violet-700 dark:text-violet-300">
                <strong>DIAS3 Score</strong> predicts individual risk of epilepsy at 1 and 3 years after CVT using 6 readily available variables.
                <br />
                <span className="text-muted-foreground">Lindgren et al., JAMA Neurology 2024. C-statistic 0.74–0.80.</span>
              </p>
            </div>

            <div className="space-y-3">
              <BoolButton
                label="Decompressive hemicraniectomy"
                description="Acute treatment with decompressive hemicraniectomy"
                value={decompressive}
                onChange={setDecompressive}
              />
              <BoolButton
                label="Intracerebral hemorrhage"
                description="ICH including hemorrhagic transformation of venous infarct, on admission imaging"
                value={ich}
                onChange={setIch}
              />

              {/* Age slider */}
              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium">Age at onset</p>
                  <Badge variant="outline" className="text-sm font-bold">{age} years</Badge>
                </div>
                <Slider
                  value={[age]}
                  onValueChange={([v]) => setAge(v)}
                  min={18}
                  max={80}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>18</span>
                  <span>80</span>
                </div>
              </div>

              <BoolButton
                label="Seizures in the acute phase"
                description="Acute symptomatic seizure (within 7 days of diagnosis), excluding status epilepticus"
                value={seizures}
                onChange={setSeizures}
              />
              <BoolButton
                label="Status epilepticus in the acute phase"
                description="Continuous seizure ≥5 min or multiple seizures within 30 min without consciousness normalization"
                value={statusEpilepticus}
                onChange={setStatusEpilepticus}
              />
              <BoolButton
                label="Subdural hematoma"
                description="Subdural hematoma on admission neuroimaging (CT or MRI)"
                value={subduralHematoma}
                onChange={setSubduralHematoma}
              />
            </div>

            {/* Results */}
            <div
              className={`p-4 rounded-lg border-2 ${
                allAnswered
                  ? riskCategory === "Low"
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                    : riskCategory === "Moderate"
                    ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                    : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                  : "border-border bg-muted/20"
              }`}
            >
              {allAnswered && risk1y !== null && risk3y !== null ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">1-Year Epilepsy Risk</p>
                      <p className="text-2xl sm:text-3xl font-bold">{risk1y.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">3-Year Epilepsy Risk</p>
                      <p className="text-2xl sm:text-3xl font-bold">{risk3y.toFixed(1)}%</p>
                    </div>
                  </div>
                  {risk1y >= 20 && (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      High risk of post-CVT epilepsy. Consider long-term antiseizure medication and closer follow-up.
                    </div>
                  )}
                  {risk1y >= 10 && risk1y < 20 && (
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Moderate risk. Counsel patient on seizure precautions and consider ASM discussion.
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Complete all fields to calculate epilepsy risk
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default DIAS3Calculator;
