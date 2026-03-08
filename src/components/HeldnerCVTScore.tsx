import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Search, ShieldCheck } from "lucide-react";

interface HeldnerState {
  seizures: boolean | null;
  thrombophilia: boolean | null;
  oralContraception: boolean | null;
  symptomDuration: boolean | null;
  worstHeadache: boolean | null;
  focalDeficit: boolean | null;
  dDimerElevated: boolean | null; // optional enhancement
  useDDimer: boolean;
}

const HeldnerCVTScore: React.FC = () => {
  const [state, setState] = useState<HeldnerState>({
    seizures: null,
    thrombophilia: null,
    oralContraception: null,
    symptomDuration: null,
    worstHeadache: null,
    focalDeficit: null,
    dDimerElevated: null,
    useDDimer: false,
  });

  const { pretest, enhanced, allBase } = useMemo(() => {
    const base =
      (state.seizures ? 4 : 0) +
      (state.thrombophilia ? 4 : 0) +
      (state.oralContraception ? 2 : 0) +
      (state.symptomDuration ? 2 : 0) +
      (state.worstHeadache ? 1 : 0) +
      (state.focalDeficit ? 1 : 0);

    const allAnswered =
      state.seizures !== null &&
      state.thrombophilia !== null &&
      state.oralContraception !== null &&
      state.symptomDuration !== null &&
      state.worstHeadache !== null &&
      state.focalDeficit !== null;

    const enh = base + (state.useDDimer && state.dDimerElevated ? 3 : 0);

    return { pretest: base, enhanced: enh, allBase: allAnswered };
  }, [state]);

  const activeScore = state.useDDimer && state.dDimerElevated !== null ? enhanced : pretest;

  const risk =
    activeScore <= 2 ? "Low" : activeScore <= 5 ? "Moderate" : "High";

  const riskDetails = {
    Low: { color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", prevalence: "~5.9%", npv: "94.1%", border: "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30" },
    Moderate: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", prevalence: "~28%", npv: "", border: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30" },
    High: { color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", prevalence: "~93%", npv: "", border: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30" },
  };

  const rd = riskDetails[risk];

  const variables = [
    { key: "seizures" as const, label: "Seizure(s) at presentation", points: 4 },
    { key: "thrombophilia" as const, label: "Known thrombophilia / hematologic coagulopathy", points: 4 },
    { key: "oralContraception" as const, label: "Oral contraception use", points: 2 },
    { key: "symptomDuration" as const, label: "Symptom duration > 6 days", points: 2 },
    { key: "worstHeadache" as const, label: '"Worst headache ever" (patient-reported)', points: 1 },
    { key: "focalDeficit" as const, label: "Focal neurologic deficit", points: 1 },
  ];

  return (
    <Card className="border-2 border-sky-200 dark:border-sky-800">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-sky-500" />
                <span className="text-base sm:text-lg">Heldner CVT Clinical Score</span>
              </div>
              <div className="flex items-center gap-2">
                {allBase && (
                  <Badge className={rd.color}>
                    {activeScore}/{ state.useDDimer ? "17" : "14" } — {risk}
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
            <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg">
              <p className="text-xs text-sky-700 dark:text-sky-300">
                <strong>Heldner CVT Clinical Score</strong> — Pretest clinical probability for CVT diagnosis. Stratifies risk as Low (0–2), Moderate (3–5), or High (≥6). Optional D-dimer enhancement improves AUC to 0.937.
                <br />
                <span className="text-muted-foreground">Heldner et al., Neurology 2020 (PMID: 32576633)</span>
              </p>
            </div>

            {/* Variables */}
            <div className="space-y-2">
              {variables.map((v) => (
                <div
                  key={v.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border rounded-lg bg-muted/10 gap-2"
                >
                  <div className="text-xs sm:text-sm font-medium">
                    {v.label}{" "}
                    <span className="text-muted-foreground">
                      ({v.points} pt{v.points > 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setState((s) => ({ ...s, [v.key]: false }))}
                      className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                        state[v.key] === false
                          ? "bg-green-600 border-green-600 text-white"
                          : "border-muted-foreground/30 text-muted-foreground hover:border-green-400"
                      }`}
                    >
                      No
                    </button>
                    <button
                      onClick={() => setState((s) => ({ ...s, [v.key]: true }))}
                      className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                        state[v.key] === true
                          ? "bg-red-600 border-red-600 text-white"
                          : "border-muted-foreground/30 text-muted-foreground hover:border-red-400"
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* D-dimer Enhancement */}
            <div className="p-3 border-2 border-dashed border-sky-300 dark:border-sky-700 rounded-lg bg-sky-50/50 dark:bg-sky-950/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300">
                  Optional: D-dimer Enhancement (+3 pts)
                </p>
                <button
                  onClick={() => setState((s) => ({ ...s, useDDimer: !s.useDDimer, dDimerElevated: null }))}
                  className={`px-3 py-1 rounded-lg border-2 text-xs font-semibold transition-all ${
                    state.useDDimer
                      ? "bg-sky-600 border-sky-600 text-white"
                      : "border-sky-300 text-sky-600 hover:bg-sky-100 dark:border-sky-700 dark:text-sky-400"
                  }`}
                >
                  {state.useDDimer ? "Enabled" : "Add D-dimer"}
                </button>
              </div>
              {state.useDDimer && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    D-dimer &gt; 500 μg/L?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setState((s) => ({ ...s, dDimerElevated: false }))}
                      className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                        state.dDimerElevated === false
                          ? "bg-green-600 border-green-600 text-white"
                          : "border-muted-foreground/30 text-muted-foreground hover:border-green-400"
                      }`}
                    >
                      ≤500 μg/L
                    </button>
                    <button
                      onClick={() => setState((s) => ({ ...s, dDimerElevated: true }))}
                      className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                        state.dDimerElevated === true
                          ? "bg-red-600 border-red-600 text-white"
                          : "border-muted-foreground/30 text-muted-foreground hover:border-red-400"
                      }`}
                    >
                      &gt;500 μg/L
                    </button>
                  </div>
                  {state.dDimerElevated === false && pretest <= 2 && allBase && (
                    <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Low clinical score + D-dimer ≤500 μg/L → CVT effectively excluded (NPV 100%)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Result */}
            <div className={`p-4 rounded-lg border-2 ${allBase ? rd.border : "border-border bg-muted/20"}`}>
              {allBase ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-lg">
                        Score: {activeScore}/{state.useDDimer ? "17" : "14"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Low (0–2) · Moderate (3–5) · High (≥6)
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-sm px-3 py-1 ${rd.color}`}>{risk} Risk</Badge>
                      <p className="text-xs font-semibold mt-1">CVT prevalence: {rd.prevalence}</p>
                    </div>
                  </div>

                  {/* Risk-specific guidance */}
                  {risk === "Low" && (
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-300">
                      <ShieldCheck className="h-3 w-3 inline mr-1" />
                      CVT unlikely (NPV 94.1%). If D-dimer ≤500 μg/L, CVT can be excluded (NPV 100%). Consider alternative diagnoses.
                    </div>
                  )}
                  {risk === "Moderate" && (
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      CVT prevalence ~28%. Check D-dimer → if &gt;500 μg/L, proceed to neuroimaging (MRV or CTV).
                    </div>
                  )}
                  {risk === "High" && (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      CVT prevalence ~93%. Proceed directly to neuroimaging (MRI + MRV or CT + CTV). Do not delay for D-dimer.
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Complete all fields to calculate CVT probability
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default HeldnerCVTScore;
