import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown, RotateCcw, AlertTriangle, CheckCircle2, Activity,
  Calculator, TrendingUp, Shield, Syringe
} from "lucide-react";

interface RiskFactor {
  id: string;
  label: string;
  description: string;
  points: number;
  category: "imaging" | "clinical" | "treatment";
}

const RISK_FACTORS: RiskFactor[] = [
  // Imaging factors
  {
    id: "nakaguchi_separated",
    label: "Separated morphology (Nakaguchi)",
    description: "Distinct inner/outer membranes with separated fluid layers on CT/MRI",
    points: 3,
    category: "imaging",
  },
  {
    id: "nakaguchi_laminar",
    label: "Laminar morphology (Nakaguchi)",
    description: "Layered appearance with membrane formation but not fully separated",
    points: 1,
    category: "imaging",
  },
  {
    id: "bilateral",
    label: "Bilateral cSDH",
    description: "Subdural collections present on both hemispheres",
    points: 2,
    category: "imaging",
  },
  {
    id: "thickness_gt20",
    label: "Maximum thickness ≥20mm",
    description: "Measured above temporal bones, up to 2 slices above ventricles",
    points: 2,
    category: "imaging",
  },
  {
    id: "thickness_10_20",
    label: "Maximum thickness 10–19mm",
    description: "Moderate-sized collection requiring close monitoring",
    points: 1,
    category: "imaging",
  },
  {
    id: "midline_shift_gt10",
    label: "Midline shift ≥10mm",
    description: "Significant mass effect with septum pellucidum displacement",
    points: 2,
    category: "imaging",
  },
  // Clinical factors
  {
    id: "anticoagulation",
    label: "On anticoagulation therapy",
    description: "Warfarin, DOACs (apixaban, rivarelbaan, edoxaban, dabigatran), or heparin",
    points: 3,
    category: "clinical",
  },
  {
    id: "dual_antiplatelet",
    label: "Dual antiplatelet therapy",
    description: "ASA + P2Y12 inhibitor (clopidogrel, ticagrelor, prasugrel)",
    points: 2,
    category: "clinical",
  },
  {
    id: "single_antiplatelet",
    label: "Single antiplatelet therapy",
    description: "Aspirin or P2Y12 inhibitor monotherapy",
    points: 1,
    category: "clinical",
  },
  {
    id: "age_gt80",
    label: "Age ≥80 years",
    description: "Advanced age with increased brain atrophy and fragile bridging veins",
    points: 2,
    category: "clinical",
  },
  {
    id: "age_65_79",
    label: "Age 65–79 years",
    description: "Moderate age-related risk",
    points: 1,
    category: "clinical",
  },
  {
    id: "coagulopathy",
    label: "Underlying coagulopathy",
    description: "Liver disease, thrombocytopenia, inherited bleeding disorder",
    points: 2,
    category: "clinical",
  },
  {
    id: "hemodialysis",
    label: "Hemodialysis patient",
    description: "Heparin exposure during dialysis + uremic platelet dysfunction",
    points: 2,
    category: "clinical",
  },
  {
    id: "alcohol",
    label: "Chronic alcohol use",
    description: "Brain atrophy + coagulopathy + repeated falls",
    points: 1,
    category: "clinical",
  },
  // Treatment factors
  {
    id: "incomplete_drainage",
    label: "Incomplete initial drainage",
    description: "Residual collection >10mm after primary surgical evacuation",
    points: 2,
    category: "treatment",
  },
  {
    id: "no_drain",
    label: "No subdural drain placed post-op",
    description: "Drain placement reduces recurrence by ~50% (RR 0.54)",
    points: 2,
    category: "treatment",
  },
];

// Mutually exclusive groups — only one can be selected per group
const EXCLUSIVE_GROUPS: string[][] = [
  ["nakaguchi_separated", "nakaguchi_laminar"],
  ["thickness_gt20", "thickness_10_20"],
  ["anticoagulation", "dual_antiplatelet", "single_antiplatelet"],
  ["age_gt80", "age_65_79"],
];

function getRiskCategory(score: number): {
  level: "low" | "moderate" | "high" | "very-high";
  label: string;
  recurrenceRate: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  if (score <= 3) {
    return {
      level: "low",
      label: "Low Risk",
      recurrenceRate: "5–10%",
      color: "text-green-800 dark:text-green-300",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-400 dark:border-green-600",
    };
  }
  if (score <= 7) {
    return {
      level: "moderate",
      label: "Moderate Risk",
      recurrenceRate: "15–25%",
      color: "text-amber-800 dark:text-amber-300",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-400 dark:border-amber-600",
    };
  }
  if (score <= 12) {
    return {
      level: "high",
      label: "High Risk",
      recurrenceRate: "30–45%",
      color: "text-orange-800 dark:text-orange-300",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-400 dark:border-orange-600",
    };
  }
  return {
    level: "very-high",
    label: "Very High Risk",
    recurrenceRate: "≥50%",
    color: "text-red-800 dark:text-red-300",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-400 dark:border-red-600",
  };
}

function getRecommendations(score: number, selected: Set<string>): string[] {
  const recs: string[] = [];
  const risk = getRiskCategory(score);

  // Universal
  recs.push("Serial CT imaging at 1, 3, and 6 weeks post-treatment");

  if (risk.level === "low") {
    recs.push("Standard burr-hole drainage if symptomatic");
    recs.push("Consider observation with serial imaging if asymptomatic and small");
    recs.push("Routine post-operative drain placement recommended");
  }

  if (risk.level === "moderate") {
    recs.push("Burr-hole drainage with subdural drain placement (48–72h)");
    recs.push("Consider adjunctive MMA embolization (MMAE) if neurologically stable (GCS ≥9, mRS 0–3)");
    recs.push("Closer imaging surveillance: CT at 2, 4, and 8 weeks");
  }

  if (risk.level === "high" || risk.level === "very-high") {
    recs.push("Strong consideration for adjunctive MMA embolization (MMAE)");
    recs.push("Burr-hole drainage + subdural drain (48–72h) as primary treatment");
    recs.push("Multidisciplinary discussion: Neurosurgery + Neurointerventional");
    recs.push("Extended imaging follow-up: CT at 2, 4, 8, and 12 weeks");
  }

  // Specific factor-based recommendations
  if (selected.has("anticoagulation")) {
    recs.push("⚠ Anticoagulation management: Hold and reverse before intervention; multidisciplinary discussion on resumption timing (typically 2–4 weeks if high thrombotic risk)");
  }
  if (selected.has("dual_antiplatelet")) {
    recs.push("⚠ Consider holding P2Y12 inhibitor peri-operatively if safe; consult cardiology for bridging strategy");
  }
  if (selected.has("nakaguchi_separated")) {
    recs.push("⚠ Separated morphology: Highest recurrence subtype — MMAE strongly recommended as adjunct");
  }
  if (selected.has("bilateral")) {
    recs.push("⚠ Bilateral cSDH: Consider staged vs simultaneous bilateral drainage; MMAE may reduce need for repeat surgery");
  }
  if (selected.has("no_drain")) {
    recs.push("⚠ Strongly recommend post-operative subdural drain — reduces recurrence by ~50%");
  }
  if (selected.has("hemodialysis")) {
    recs.push("⚠ Coordinate with nephrology: Consider heparin-free dialysis sessions post-operatively");
  }
  if (selected.has("coagulopathy")) {
    recs.push("⚠ Correct coagulopathy before and after intervention; monitor platelet count and INR closely");
  }

  return recs;
}

export default function CSDHRecurrenceCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleFactor = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Remove mutually exclusive items
        for (const group of EXCLUSIVE_GROUPS) {
          if (group.includes(id)) {
            for (const member of group) {
              if (member !== id) next.delete(member);
            }
          }
        }
        next.add(id);
      }
      return next;
    });
  };

  const totalScore = useMemo(() => {
    return RISK_FACTORS.filter((f) => selected.has(f.id)).reduce((sum, f) => sum + f.points, 0);
  }, [selected]);

  const riskCategory = useMemo(() => getRiskCategory(totalScore), [totalScore]);
  const recommendations = useMemo(() => getRecommendations(totalScore, selected), [totalScore, selected]);

  const reset = () => setSelected(new Set());

  const categoryLabel: Record<string, { label: string; icon: React.ReactNode }> = {
    imaging: { label: "Imaging Factors", icon: <Activity className="h-4 w-4" /> },
    clinical: { label: "Clinical Factors", icon: <Syringe className="h-4 w-4" /> },
    treatment: { label: "Treatment Factors", icon: <Shield className="h-4 w-4" /> },
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-violet-400 dark:border-violet-600 bg-gradient-to-br from-violet-50 dark:from-violet-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-violet-100/50 dark:bg-violet-900/30">
            <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <span>cSDH Recurrence Risk Calculator</span>
                <Badge variant="outline" className="border-violet-400 text-violet-600 dark:text-violet-400 text-[10px]">
                  ARISE I
                </Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-5">
            {/* Factor Selection */}
            {(["imaging", "clinical", "treatment"] as const).map((cat) => (
              <div key={cat}>
                <h4 className="font-semibold text-violet-800 dark:text-violet-300 text-sm mb-2 flex items-center gap-2">
                  {categoryLabel[cat].icon}
                  {categoryLabel[cat].label}
                </h4>
                <div className="space-y-1.5">
                  {RISK_FACTORS.filter((f) => f.category === cat).map((factor) => {
                    const isSelected = selected.has(factor.id);
                    return (
                      <button
                        key={factor.id}
                        onClick={() => toggleFactor(factor.id)}
                        className={`w-full text-left p-2.5 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-violet-500 dark:border-violet-400 bg-violet-100 dark:bg-violet-900/40 shadow-sm"
                            : "border-muted bg-background hover:border-violet-300 dark:hover:border-violet-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-semibold ${isSelected ? "text-violet-800 dark:text-violet-200" : "text-foreground"}`}>
                                {factor.label}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] shrink-0 ${
                                  isSelected
                                    ? "bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200"
                                    : ""
                                }`}
                              >
                                +{factor.points} pt{factor.points > 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                              {factor.description}
                            </p>
                          </div>
                          <div className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-violet-500 dark:bg-violet-400 border-violet-500 dark:border-violet-400"
                              : "border-muted-foreground/30"
                          }`}>
                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white dark:text-violet-950" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Score & Risk Output */}
            <div className={`p-4 rounded-xl border-2 ${riskCategory.borderColor} ${riskCategory.bgColor}`}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <div className={`text-2xl font-black ${riskCategory.color}`}>
                    {totalScore} <span className="text-sm font-semibold">points</span>
                  </div>
                  <div className={`text-sm font-bold ${riskCategory.color}`}>{riskCategory.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Estimated Recurrence</div>
                  <div className={`text-lg font-bold ${riskCategory.color}`}>{riskCategory.recurrenceRate}</div>
                </div>
              </div>

              {/* Risk bar */}
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (totalScore / 20) * 100)}%`,
                    background:
                      riskCategory.level === "low"
                        ? "linear-gradient(90deg, #22c55e, #4ade80)"
                        : riskCategory.level === "moderate"
                        ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                        : riskCategory.level === "high"
                        ? "linear-gradient(90deg, #f97316, #fb923c)"
                        : "linear-gradient(90deg, #ef4444, #f87171)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Very High</span>
              </div>
            </div>

            {/* Treatment Recommendations */}
            <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700">
              <h5 className="font-semibold text-violet-800 dark:text-violet-300 text-xs mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Treatment Recommendations
              </h5>
              <ul className="text-xs space-y-1.5 text-violet-700 dark:text-violet-400">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    {rec.startsWith("⚠") ? (
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-violet-500 dark:text-violet-400" />
                    )}
                    <span>{rec.replace(/^⚠\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clinical Pearl */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 text-[11px] mb-1">📋 Clinical Pearl</h5>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                This calculator synthesizes recurrence risk factors from the ARISE I consensus (2024), EMBOLISE, STEM, and MAGIC-MT trial data.
                Nakaguchi separated morphology is the strongest imaging predictor of recurrence. Anticoagulation status is the most impactful
                modifiable clinical factor. MMA embolization as adjunct to surgical drainage reduces recurrence by approximately 50% in high-risk
                patients. Always correlate with clinical status and multidisciplinary input.
              </p>
            </div>

            {/* Reset */}
            <Button variant="outline" size="sm" onClick={reset} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Calculator
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
