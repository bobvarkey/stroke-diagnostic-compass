import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Target, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import evtAlgorithmImage from "@/assets/evt-eligibility-algorithm.jpeg";

type EVTResult = "evt" | "idd" | "no_evt" | null;

interface DecisionState {
  population: string;
  vessel: string;
  timeWindow: string;
  aspects: string;
  mrs: string;
  nihss: string;
}

const initialState: DecisionState = {
  population: "",
  vessel: "",
  timeWindow: "",
  aspects: "",
  mrs: "",
  nihss: "",
};

function getResult(s: DecisionState): { result: EVTResult; reasoning: string } {
  const { population, vessel, timeWindow, aspects, mrs, nihss } = s;
  if (!population || !vessel) return { result: null, reasoning: "" };

  // Neonates
  if (population === "neonate") {
    if (vessel === "lvo") return { result: "idd", reasoning: "Insufficient data for neonates ≤28 days with LVO" };
    return { result: "idd", reasoning: "No data for this vessel type in neonates" };
  }

  // 28 days – 5 years
  if (population === "infant") {
    if (vessel === "lvo") return { result: "evt", reasoning: "EVT recommended for ages 28 days–5 yrs with LVO and salvageable brain tissue (0–24 h)" };
    return { result: "idd", reasoning: "No data for this vessel type in this age group" };
  }

  // 6–17 years
  if (population === "pediatric") {
    if (vessel === "lvo") {
      if (!timeWindow) return { result: null, reasoning: "" };
      if (timeWindow === "0-6h" || timeWindow === "6-24h") return { result: "evt", reasoning: `EVT recommended for ages 6–17 with LVO at ${timeWindow === "0-6h" ? "0–6 h" : "6–24 h"} with salvageable brain tissue` };
      return { result: "idd", reasoning: "Insufficient data beyond 24 h for pediatric LVO" };
    }
    return { result: "idd", reasoning: "No data for this vessel type in pediatric patients" };
  }

  // Adults ≥18
  if (population === "adult") {
    // MVO Non-dominant / DVO
    if (vessel === "mvo_nondominant" || vessel === "dvo") {
      return { result: "no_evt", reasoning: "No EVT recommended for non-dominant M2 or distal vessel occlusions" };
    }

    // Basilar
    if (vessel === "basilar") {
      if (!timeWindow) return { result: null, reasoning: "" };
      if (timeWindow === "0-24h") {
        if (!mrs) return { result: null, reasoning: "" };
        if (mrs === "0-1") {
          if (!nihss) return { result: null, reasoning: "" };
          if (nihss === "gte10" || nihss === "6-9") return { result: "evt", reasoning: `EVT recommended: Basilar artery, 0–24 h, PC-ASPECTS ≥6, mRS 0–1, NIHSS ${nihss === "gte10" ? "≥10" : "6–9"}` };
          return { result: "idd", reasoning: "Insufficient data for basilar with NIHSS <6" };
        }
        return { result: "idd", reasoning: "Insufficient data for basilar artery with mRS ≥2" };
      }
      return { result: "idd", reasoning: "Insufficient data beyond 24 h for basilar occlusion" };
    }

    // MVO Dominant M2
    if (vessel === "mvo_dominant") {
      if (!timeWindow) return { result: null, reasoning: "" };
      if (timeWindow === "0-6h") return { result: "evt", reasoning: "EVT recommended for dominant M2, 0–6 h, ASPECTS 6–10, mRS 0–1" };
      return { result: "idd", reasoning: "Insufficient data for dominant M2 beyond 6 h" };
    }

    // LVO
    if (vessel === "lvo") {
      if (!timeWindow) return { result: null, reasoning: "" };
      if (timeWindow === "gt24h") return { result: "idd", reasoning: "Insufficient data beyond 24 h for adult LVO" };

      if (!aspects) return { result: null, reasoning: "" };
      if (!mrs) return { result: null, reasoning: "" };

      if (timeWindow === "0-6h") {
        if (aspects === "6-10") {
          if (mrs === "0-1" || mrs === "2" || mrs === "3-4") return { result: "evt", reasoning: `EVT recommended: LVO, 0–6 h, ASPECTS 6–10, mRS ${mrs}` };
          return { result: "idd", reasoning: "Insufficient data for ASPECTS 6–10 with mRS >4" };
        }
        if (aspects === "3-5" || aspects === "0-2") {
          if (mrs === "0-1") return { result: "evt", reasoning: `EVT recommended: LVO, 0–6 h, ASPECTS ${aspects}, mRS 0–1` };
          return { result: "idd", reasoning: `Insufficient data for ASPECTS ${aspects} with mRS ≥2` };
        }
      }

      if (timeWindow === "6-24h") {
        if (aspects === "6-10" || aspects === "3-5") {
          if (mrs === "0-1") return { result: "evt", reasoning: `EVT recommended: LVO, 6–24 h, ASPECTS ${aspects}, mRS 0–1` };
          return { result: "idd", reasoning: `Insufficient data for ASPECTS ${aspects} with mRS ≥2 at 6–24 h` };
        }
        return { result: "idd", reasoning: "Insufficient data for low ASPECTS at 6–24 h" };
      }
    }
  }

  return { result: null, reasoning: "" };
}

// Available options that change based on previous selections
function getVesselOptions(pop: string) {
  if (pop === "neonate" || pop === "infant" || pop === "pediatric") return [{ value: "lvo", label: "LVO*" }];
  return [
    { value: "lvo", label: "LVO* (ICA, M1, dominant M2)" },
    { value: "mvo_dominant", label: "MVO (Dominant M2)" },
    { value: "mvo_nondominant", label: "MVO (Non-dominant M2)" },
    { value: "dvo", label: "DVO" },
    { value: "basilar", label: "Basilar Artery" },
  ];
}

function getTimeOptions(pop: string, vessel: string) {
  if (pop === "neonate" || pop === "infant") return [{ value: "0-24h", label: "0–24 h" }];
  if (pop === "pediatric") return [
    { value: "0-6h", label: "0–6 h" },
    { value: "6-24h", label: "6–24 h" },
    { value: "gt24h", label: ">24 h" },
  ];
  if (vessel === "mvo_dominant") return [
    { value: "0-6h", label: "0–6 h" },
    { value: "gt6h", label: ">6 h" },
  ];
  if (vessel === "basilar" || vessel === "mvo_nondominant" || vessel === "dvo") return [{ value: "0-24h", label: "0–24 h" }];
  // adult LVO
  return [
    { value: "0-6h", label: "0–6 h" },
    { value: "6-24h", label: "6–24 h" },
    { value: "gt24h", label: ">24 h" },
  ];
}

function getAspectsOptions(timeWindow: string) {
  return [
    { value: "6-10", label: "ASPECTS 6–10" },
    { value: "3-5", label: "ASPECTS 3–5" },
    { value: "0-2", label: "ASPECTS 0–2" },
  ];
}

function getMrsOptions(pop: string, vessel: string, timeWindow: string, aspects: string) {
  if (vessel === "basilar") return [
    { value: "0-1", label: "mRS 0–1" },
    { value: "gte2", label: "mRS ≥2" },
  ];
  if (vessel === "lvo" && timeWindow === "0-6h" && aspects === "6-10") {
    return [
      { value: "0-1", label: "mRS 0–1" },
      { value: "2", label: "mRS 2" },
      { value: "3-4", label: "mRS 3–4" },
      { value: "gt4", label: "mRS >4" },
    ];
  }
  return [
    { value: "0-1", label: "mRS 0–1" },
    { value: "gte2", label: "mRS ≥2" },
  ];
}

function needsAspects(s: DecisionState): boolean {
  return s.population === "adult" && s.vessel === "lvo" && !!s.timeWindow && s.timeWindow !== "gt24h";
}

function needsMrs(s: DecisionState): boolean {
  if (s.population === "adult" && s.vessel === "lvo" && !!s.timeWindow && s.timeWindow !== "gt24h" && !!s.aspects) return true;
  if (s.population === "adult" && s.vessel === "basilar" && !!s.timeWindow) return true;
  return false;
}

function needsNihss(s: DecisionState): boolean {
  return s.population === "adult" && s.vessel === "basilar" && s.mrs === "0-1";
}

function needsTime(s: DecisionState): boolean {
  if (!s.population || !s.vessel) return false;
  if (s.population === "neonate" || s.population === "infant") return false; // auto-determined
  if (s.vessel === "mvo_nondominant" || s.vessel === "dvo") return false; // instant no
  return true;
}

const resultStyles: Record<string, { bg: string; text: string; label: string }> = {
  evt: { bg: "bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-600", text: "text-green-800 dark:text-green-200", label: "✓ EVT Recommended" },
  idd: { bg: "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-600", text: "text-yellow-800 dark:text-yellow-200", label: "⚠ Insufficient Data to Determine (IDD)" },
  no_evt: { bg: "bg-red-100 dark:bg-red-900/50 border-red-400 dark:border-red-600", text: "text-red-800 dark:text-red-200", label: "✗ No EVT" },
};

export default function InteractiveEVTDecisionTree() {
  const [state, setState] = useState<DecisionState>(initialState);

  const setField = (field: keyof DecisionState, value: string) => {
    setState(prev => {
      const next = { ...prev, [field]: value };
      // Reset downstream fields
      if (field === "population") { next.vessel = ""; next.timeWindow = ""; next.aspects = ""; next.mrs = ""; next.nihss = ""; }
      if (field === "vessel") { next.timeWindow = ""; next.aspects = ""; next.mrs = ""; next.nihss = ""; }
      if (field === "timeWindow") { next.aspects = ""; next.mrs = ""; next.nihss = ""; }
      if (field === "aspects") { next.mrs = ""; next.nihss = ""; }
      if (field === "mrs") { next.nihss = ""; }
      return next;
    });
  };

  const { result, reasoning } = useMemo(() => getResult(state), [state]);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-semibold text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Interactive EVT Eligibility Tool
        </h5>
        <button
          onClick={() => setState(initialState)}
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Population */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Population</Label>
          <Select value={state.population} onValueChange={v => setField("population", v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neonate">≤28 days (Neonate)</SelectItem>
              <SelectItem value="infant">28 days – 5 years</SelectItem>
              <SelectItem value="pediatric">6–17 years</SelectItem>
              <SelectItem value="adult">≥18 years (Adult)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vessel */}
        {state.population && (
          <div className="space-y-1">
            <Label className="text-xs font-medium">Vessel Occlusion</Label>
            <Select value={state.vessel} onValueChange={v => setField("vessel", v)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select vessel" />
              </SelectTrigger>
              <SelectContent>
                {getVesselOptions(state.population).map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Time Window */}
        {needsTime(state) && (
          <div className="space-y-1">
            <Label className="text-xs font-medium">Time from Onset</Label>
            <Select value={state.timeWindow} onValueChange={v => setField("timeWindow", v)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select time window" />
              </SelectTrigger>
              <SelectContent>
                {getTimeOptions(state.population, state.vessel).map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ASPECTS */}
        {needsAspects(state) && (
          <div className="space-y-1">
            <Label className="text-xs font-medium">ASPECTS Score</Label>
            <Select value={state.aspects} onValueChange={v => setField("aspects", v)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select ASPECTS" />
              </SelectTrigger>
              <SelectContent>
                {getAspectsOptions(state.timeWindow).map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* mRS */}
        {needsMrs(state) && (
          <div className="space-y-1">
            <Label className="text-xs font-medium">Baseline mRS</Label>
            <Select value={state.mrs} onValueChange={v => setField("mrs", v)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select mRS" />
              </SelectTrigger>
              <SelectContent>
                {getMrsOptions(state.population, state.vessel, state.timeWindow, state.aspects).map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* NIHSS for basilar */}
        {needsNihss(state) && (
          <div className="space-y-1">
            <Label className="text-xs font-medium">NIHSS</Label>
            <Select value={state.nihss} onValueChange={v => setField("nihss", v)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select NIHSS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gte10">NIHSS ≥10</SelectItem>
                <SelectItem value="6-9">NIHSS 6–9</SelectItem>
                <SelectItem value="lt6">NIHSS &lt;6</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Result Banner */}
      {result && (
        <div className={cn("p-3 rounded-lg border-2 transition-all", resultStyles[result].bg)}>
          <p className={cn("font-bold text-sm", resultStyles[result].text)}>{resultStyles[result].label}</p>
          <p className="text-xs text-muted-foreground mt-1">{reasoning}</p>
        </div>
      )}

      {!result && state.population && (
        <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 text-center text-xs text-muted-foreground">
          Continue selecting criteria above to determine EVT eligibility
        </div>
      )}
    </div>
  );
}
