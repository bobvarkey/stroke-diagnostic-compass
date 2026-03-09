import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, RotateCcw, ChevronDown, Image } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import aspectsReferenceDiagram from "@/assets/aspects-reference-diagram.jpeg";

interface ASPECTSRegion {
  id: string;
  name: string;
  fullName: string;
  level: "ganglionic" | "supraganglionic";
  // SVG positioning for the clickable regions
  path: string;
  labelX: number;
  labelY: number;
}

const ganglionicRegions: ASPECTSRegion[] = [
  { id: "C", name: "C", fullName: "Caudate", level: "ganglionic", path: "M 145 95 Q 155 85 165 95 Q 175 105 165 115 Q 155 125 145 115 Q 135 105 145 95", labelX: 155, labelY: 105 },
  { id: "L", name: "L", fullName: "Lentiform nucleus", level: "ganglionic", path: "M 115 95 Q 130 80 145 95 Q 135 115 120 120 Q 105 115 100 100 Q 105 85 115 95", labelX: 122, labelY: 100 },
  { id: "IC", name: "IC", fullName: "Internal Capsule", level: "ganglionic", path: "M 165 95 L 175 80 L 185 95 L 175 130 L 165 115 Z", labelX: 175, labelY: 105 },
  { id: "I", name: "I", fullName: "Insular ribbon", level: "ganglionic", path: "M 75 90 Q 85 75 95 85 Q 100 95 95 110 Q 85 125 75 115 Q 65 105 75 90", labelX: 85, labelY: 100 },
  { id: "M1", name: "M1", fullName: "Anterior MCA cortex", level: "ganglionic", path: "M 195 65 Q 210 55 225 65 Q 235 80 225 95 Q 210 100 195 95 Q 185 80 195 65", labelX: 210, labelY: 80 },
  { id: "M2", name: "M2", fullName: "MCA cortex lateral to insular ribbon", level: "ganglionic", path: "M 50 60 Q 65 45 80 55 Q 90 70 80 90 Q 65 100 50 90 Q 40 75 50 60", labelX: 65, labelY: 72 },
  { id: "M3", name: "M3", fullName: "Posterior MCA cortex", level: "ganglionic", path: "M 195 115 Q 210 105 230 115 Q 245 130 235 150 Q 215 160 195 150 Q 180 135 195 115", labelX: 215, labelY: 132 },
];

const supraganglionicRegions: ASPECTSRegion[] = [
  { id: "M4", name: "M4", fullName: "Anterior MCA territory", level: "supraganglionic", path: "M 195 45 Q 215 30 235 45 Q 250 65 235 85 Q 215 95 195 85 Q 175 70 195 45", labelX: 215, labelY: 65 },
  { id: "M5", name: "M5", fullName: "Lateral MCA territory", level: "supraganglionic", path: "M 45 40 Q 70 20 95 40 Q 110 60 95 85 Q 70 100 45 85 Q 25 65 45 40", labelX: 70, labelY: 60 },
  { id: "M6", name: "M6", fullName: "Posterior MCA territory", level: "supraganglionic", path: "M 195 100 Q 220 85 245 100 Q 265 125 245 155 Q 220 175 195 155 Q 170 130 195 100", labelX: 220, labelY: 125 },
];

interface Props {
  onScoreChange?: (score: number) => void;
}

export default function InteractiveASPECTSCalculator({ onScoreChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [affectedRegions, setAffectedRegions] = useState<Set<string>>(new Set());
  const [activeLevel, setActiveLevel] = useState<"ganglionic" | "supraganglionic">("ganglionic");

  const score = 10 - affectedRegions.size;

  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  const toggleRegion = (regionId: string) => {
    setAffectedRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(regionId)) {
        newSet.delete(regionId);
      } else {
        newSet.add(regionId);
      }
      return newSet;
    });
  };

  const resetCalculator = () => {
    setAffectedRegions(new Set());
  };

  const getScoreColor = () => {
    if (score >= 8) return { bg: "bg-green-500", text: "text-green-700 dark:text-green-300", border: "border-green-500" };
    if (score >= 6) return { bg: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-500" };
    return { bg: "bg-red-500", text: "text-red-700 dark:text-red-300", border: "border-red-500" };
  };

  const getInterpretation = () => {
    if (score >= 8) return { label: "Small infarct core", desc: "Favorable for reperfusion therapy", level: "low" };
    if (score >= 6) return { label: "Moderate infarct", desc: "Consider risks/benefits carefully", level: "moderate" };
    return { label: "Large infarct core", desc: "Higher risk of hemorrhagic transformation", level: "high" };
  };

  const currentRegions = activeLevel === "ganglionic" ? ganglionicRegions : supraganglionicRegions;
  const scoreColors = getScoreColor();
  const interpretation = getInterpretation();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50 dark:from-cyan-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-cyan-100/50 dark:bg-cyan-900/30">
            <CardTitle className="flex items-center justify-between text-cyan-800 dark:text-cyan-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>ASPECTS Interactive Calculator</span>
                {affectedRegions.size > 0 && (
                  <Badge className={`ml-2 ${scoreColors.bg} text-white`}>
                    Score: {score}/10
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
            <div className="mb-4 p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-700 rounded-lg">
              <p className="text-sm text-cyan-700 dark:text-cyan-400">
                <strong>Instructions:</strong> Click on brain regions showing early ischemic changes. 
                Each affected region subtracts 1 point from the total score of 10.
              </p>
            </div>

            {/* Level Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveLevel("ganglionic")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  activeLevel === "ganglionic"
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-800/40"
                }`}
              >
                Ganglionic Level
                <span className="block text-xs opacity-80">Basal Ganglia Visible</span>
              </button>
              <button
                onClick={() => setActiveLevel("supraganglionic")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  activeLevel === "supraganglionic"
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-800/40"
                }`}
              >
                Supraganglionic Level
                <span className="block text-xs opacity-80">Above Basal Ganglia</span>
              </button>
            </div>

            {/* Interactive Brain Diagram */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* SVG Brain Diagram */}
              <div className="flex-1 flex justify-center">
                <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 shadow-inner">
                  <svg viewBox="0 0 280 200" className="w-full max-w-sm h-auto">
                    {/* Brain outline */}
                    <ellipse
                      cx="140"
                      cy="100"
                      rx="130"
                      ry="90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-400 dark:text-slate-600"
                    />
                    
                    {/* Midline */}
                    <line
                      x1="140"
                      y1="10"
                      x2="140"
                      y2="190"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      className="text-slate-300 dark:text-slate-700"
                    />

                    {/* MCA territory outline for reference */}
                    <path
                      d="M 40 50 Q 80 20 140 30 Q 200 20 240 50 Q 260 100 240 150 Q 200 180 140 185 Q 80 180 40 150 Q 20 100 40 50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      className="text-cyan-300 dark:text-cyan-700"
                    />

                    {/* Clickable regions */}
                    {currentRegions.map((region) => {
                      const isAffected = affectedRegions.has(region.id);
                      return (
                        <g key={region.id} className="cursor-pointer" onClick={() => toggleRegion(region.id)}>
                          <path
                            d={region.path}
                            fill={isAffected ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 211, 238, 0.3)"}
                            stroke={isAffected ? "#dc2626" : "#06b6d4"}
                            strokeWidth="2"
                            className="transition-all duration-200 hover:opacity-80"
                          />
                          <text
                            x={region.labelX}
                            y={region.labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={`text-xs font-bold pointer-events-none ${
                              isAffected ? "fill-white" : "fill-cyan-800 dark:fill-cyan-200"
                            }`}
                          >
                            {region.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Level label */}
                    <text
                      x="140"
                      y="188"
                      textAnchor="middle"
                      className="text-xs fill-slate-500 dark:fill-slate-400"
                    >
                      {activeLevel === "ganglionic" ? "Ganglionic Level" : "Supraganglionic Level"}
                    </text>
                  </svg>
                </div>
              </div>

              {/* Region Legend & Controls */}
              <div className="flex-1 space-y-4">
                {/* Current Score Display */}
                <div className={`p-4 rounded-lg border-2 ${scoreColors.border} bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">ASPECTS Score</span>
                    <button
                      onClick={resetCalculator}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  </div>
                  <div className={`text-4xl font-bold ${scoreColors.text}`}>
                    {score}/10
                  </div>
                  <div className="mt-2 text-sm">
                    <span className={`font-medium ${scoreColors.text}`}>{interpretation.label}</span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{interpretation.desc}</p>
                  </div>
                </div>

                {/* All Regions Checklist */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 text-sm">All Regions</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {[...ganglionicRegions, ...supraganglionicRegions].map((region) => {
                      const isAffected = affectedRegions.has(region.id);
                      return (
                        <button
                          key={region.id}
                          onClick={() => toggleRegion(region.id)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all ${
                            isAffected
                              ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isAffected ? "bg-red-500 text-white" : "bg-cyan-500 text-white"
                          }`}>
                            {region.name}
                          </span>
                          <span className="truncate">{region.fullName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Interpretation Guide */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-800 dark:text-green-300">8-10</div>
                <div className="text-sm text-green-700 dark:text-green-400">Small infarct</div>
                <div className="text-xs text-green-600 dark:text-green-500">Favorable for reperfusion</div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">6-7</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-400">Moderate infarct</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500">Consider risks/benefits</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-800 dark:text-red-300">0-5</div>
                <div className="text-sm text-red-700 dark:text-red-400">Large infarct</div>
                <div className="text-xs text-red-600 dark:text-red-500">High hemorrhage risk</div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-700 rounded-lg">
              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                <strong>Clinical Notes:</strong> ASPECTS ≥6 is generally the threshold for IV thrombolysis eligibility. 
                For mechanical thrombectomy, ASPECTS ≥6 on CT is typically required. Recent trials (DAWN, DEFUSE 3) 
                also incorporate perfusion imaging for extended window patients.
              </p>
            </div>

            {/* ASPECTS Reference Diagram */}
            <div className="mt-4">
              <button
                onClick={() => setShowReference(!showReference)}
                className="flex items-center gap-2 w-full py-2 px-3 bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-200 dark:border-cyan-700 rounded-lg text-sm font-medium text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800/40 transition-colors"
              >
                <Image className="h-4 w-4" />
                {showReference ? "Hide" : "Show"} ASPECTS Reference Diagram
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showReference ? 'rotate-180' : ''}`} />
              </button>
              {showReference && (
                <div className="mt-3 rounded-lg overflow-hidden border border-cyan-200 dark:border-cyan-700 shadow-md">
                  <img
                    src={aspectsReferenceDiagram}
                    alt="ASPECTS scoring reference showing basal ganglia level (C, P, IC, I, M1, M2, M3) and supraganglionic level (M4, M5, M6) MCA territories on axial CT"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
