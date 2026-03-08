import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, TrendingDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const SI2NCAL2CCalculator: React.FC = () => {
  const [noFemaleSexRF, setNoFemaleSexRF] = useState<boolean | null>(null);
  const [ich, setIch] = useState<boolean | null>(null);
  const [cnsInfection, setCnsInfection] = useState<boolean | null>(null);
  const [focalDeficits, setFocalDeficits] = useState<boolean | null>(null);
  const [coma, setComa] = useState<boolean | null>(null);
  const [age, setAge] = useState(40);
  const [hemoglobin, setHemoglobin] = useState(135); // g/L
  const [glucose, setGlucose] = useState(6.0); // mmol/L
  const [cancer, setCancer] = useState<boolean | null>(null);

  const allBoolAnswered =
    noFemaleSexRF !== null &&
    ich !== null &&
    cnsInfection !== null &&
    focalDeficits !== null &&
    coma !== null &&
    cancer !== null;

  const results = useMemo(() => {
    if (!allBoolAnswered) return null;

    // 6-month dependency/death (logistic model)
    // A = sum of coefficients. Intercept offset = -1.742
    const A_6m =
      (noFemaleSexRF ? 0.642 : 0) +
      (ich ? 0.604 : 0) +
      (focalDeficits ? 1.004 : 0) +
      (coma ? 1.440 : 0) +
      (-0.068 * age + 0.001 * age * age) + // square root transformation coefficients
      (-0.013 * hemoglobin) +
      (0.130 * glucose) +
      (cancer ? 0.901 : 0);

    const risk6m = 1 / (1 + Math.exp(-(A_6m - 1.742)));

    // Mortality model (Cox)
    // A = sum of coefficients. baseline hazard offset = 0.898196
    const A_mort =
      (noFemaleSexRF ? 0.372 : 0) +
      (ich ? 0.217 : 0) +
      (cnsInfection ? 0.521 : 0) +
      (focalDeficits ? 0.232 : 0) +
      (coma ? 0.827 : 0) +
      0.019 * age +
      (-0.006 * hemoglobin) +
      (0.050 * glucose) +
      (cancer ? 1.271 : 0);

    const baselineHazard = 0.898196;
    const B30 = 0.02362037;
    const B1y = 0.04298228;

    // Formula: 1 – (1 – B) ^ exp(A – baseline_hazard)
    const mort30d = 1 - Math.pow(1 - B30, Math.exp(A_mort - baselineHazard));
    const mort1y = 1 - Math.pow(1 - B1y, Math.exp(A_mort - baselineHazard));

    return {
      dependency6m: Math.min(Math.max(risk6m * 100, 0), 100),
      mortality30d: Math.min(Math.max(mort30d * 100, 0), 100),
      mortality1y: Math.min(Math.max(mort1y * 100, 0), 100),
    };
  }, [allBoolAnswered, noFemaleSexRF, ich, cnsInfection, focalDeficits, coma, age, hemoglobin, glucose, cancer]);

  const BoolButton = ({
    label,
    description,
    value,
    onChange,
    invert,
  }: {
    label: string;
    description: string;
    value: boolean | null;
    onChange: (v: boolean) => void;
    invert?: boolean;
  }) => (
    <div className="p-3 border border-border rounded-lg bg-muted/10">
      <p className="text-xs sm:text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(false)}
          className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
            value === false
              ? invert
                ? "bg-red-600 border-red-600 text-white"
                : "bg-green-600 border-green-600 text-white"
              : "border-muted-foreground/30 text-muted-foreground hover:border-green-400"
          }`}
        >
          No
        </button>
        <button
          onClick={() => onChange(true)}
          className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
            value === true
              ? invert
                ? "bg-green-600 border-green-600 text-white"
                : "bg-red-600 border-red-600 text-white"
              : "border-muted-foreground/30 text-muted-foreground hover:border-red-400"
          }`}
        >
          Yes
        </button>
      </div>
    </div>
  );

  return (
    <Card className="border-2 border-rose-200 dark:border-rose-800">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-rose-500" />
                <span className="text-base sm:text-lg">SI₂NCAL₂C — CVT Outcome</span>
              </div>
              <div className="flex items-center gap-2">
                {results && (
                  <Badge className={results.dependency6m >= 20 ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"}>
                    6m mRS 3–6: {results.dependency6m.toFixed(1)}%
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
              <p className="text-xs text-rose-700 dark:text-rose-300">
                <strong>SI₂NCAL₂C</strong> predicts mortality (30-day, 1-year) and dependency/death (mRS 3–6 at 6 months) after CVT.
                <br />
                <span className="text-muted-foreground">Lindgren et al., Eur J Neurol 2023. C-statistics 0.80–0.84.</span>
              </p>
            </div>

            <div className="space-y-3">
              {/* S — Absence of female-sex-specific risk factors */}
              <BoolButton
                label="Female-sex-specific risk factor present?"
                description="OCP use, pregnancy, recent delivery (within 12 weeks), or hormone replacement therapy"
                value={noFemaleSexRF === null ? null : !noFemaleSexRF}
                onChange={(v) => setNoFemaleSexRF(!v)}
              />

              {/* I — ICH */}
              <BoolButton
                label="Intracerebral hemorrhage"
                description="ICH including hemorrhagic transformation of venous infarct, on admission imaging"
                value={ich}
                onChange={setIch}
              />

              {/* I — Infection CNS */}
              <BoolButton
                label="CNS infection"
                description="Bacterial/viral meningitis, encephalitis, or invasive infection in dural sinuses/veins"
                value={cnsInfection}
                onChange={setCnsInfection}
              />

              {/* N — Focal deficits */}
              <BoolButton
                label="Neurological focal deficits"
                description="Any clinical focal neurological deficit at admission"
                value={focalDeficits}
                onChange={setFocalDeficits}
              />

              {/* C — Coma */}
              <BoolButton
                label="Coma (GCS < 9)"
                description="Glasgow Coma Scale score < 9 points at admission"
                value={coma}
                onChange={setComa}
              />

              {/* A — Age */}
              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium">Age at admission</p>
                  <Badge variant="outline" className="text-sm font-bold">{age} years</Badge>
                </div>
                <Slider value={[age]} onValueChange={([v]) => setAge(v)} min={18} max={80} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>18</span>
                  <span>80</span>
                </div>
              </div>

              {/* L — Hemoglobin */}
              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium">Hemoglobin at admission</p>
                  <Badge variant="outline" className="text-sm font-bold">{hemoglobin} g/L</Badge>
                </div>
                <Slider value={[hemoglobin]} onValueChange={([v]) => setHemoglobin(v)} min={72} max={179} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>72 g/L</span>
                  <span>179 g/L</span>
                </div>
              </div>

              {/* L — Glucose */}
              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium">Blood glucose at admission</p>
                  <Badge variant="outline" className="text-sm font-bold">
                    {glucose.toFixed(1)} mmol/L ({(glucose * 18).toFixed(0)} mg/dL)
                  </Badge>
                </div>
                <Slider value={[glucose * 10]} onValueChange={([v]) => setGlucose(v / 10)} min={36} max={178} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3.6 mmol/L</span>
                  <span>17.8 mmol/L</span>
                </div>
              </div>

              {/* C — Cancer */}
              <BoolButton
                label="Cancer"
                description="Any malignant tumor or hematological malignancy diagnosed during hospitalization or up to 10 years prior"
                value={cancer}
                onChange={setCancer}
              />
            </div>

            {/* Results */}
            <div
              className={`p-4 rounded-lg border-2 ${
                results
                  ? results.dependency6m >= 30
                    ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                    : results.dependency6m >= 15
                    ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                    : "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                  : "border-border bg-muted/20"
              }`}
            >
              {results ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">30-Day Mortality</p>
                      <p className="text-xl sm:text-2xl font-bold">{results.mortality30d.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">1-Year Mortality</p>
                      <p className="text-xl sm:text-2xl font-bold">{results.mortality1y.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-lg border-2 border-rose-200 dark:border-rose-700">
                      <p className="text-xs text-muted-foreground">6-Month mRS 3–6</p>
                      <p className="text-xl sm:text-2xl font-bold">{results.dependency6m.toFixed(1)}%</p>
                    </div>
                  </div>
                  {results.dependency6m >= 30 && (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      High predicted risk of poor outcome. Consider ICU-level care, early aggressive management, and multidisciplinary team involvement.
                    </div>
                  )}
                  {results.mortality30d >= 10 && (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Elevated 30-day mortality risk. Consider close neurological monitoring and endovascular therapy if clinical deterioration.
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Complete all fields to calculate predicted outcomes
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SI2NCAL2CCalculator;
