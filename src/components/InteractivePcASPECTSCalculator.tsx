import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, RotateCcw, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PcASPECTSRegion {
  id: string;
  name: string;
  fullName: string;
  points: number;
  category: "brainstem" | "thalamus" | "cerebellum" | "occipital";
  side?: "left" | "right";
}

const pcAspectsRegions: PcASPECTSRegion[] = [
  // Brainstem - 2 points each
  { id: "midbrain", name: "M", fullName: "Midbrain", points: 2, category: "brainstem" },
  { id: "pons", name: "P", fullName: "Pons", points: 2, category: "brainstem" },
  // Thalamus - 1 point each
  { id: "thalamus_l", name: "TL", fullName: "Left Thalamus", points: 1, category: "thalamus", side: "left" },
  { id: "thalamus_r", name: "TR", fullName: "Right Thalamus", points: 1, category: "thalamus", side: "right" },
  // Cerebellum - 1 point each
  { id: "cerebellum_l", name: "CL", fullName: "Left Cerebellum", points: 1, category: "cerebellum", side: "left" },
  { id: "cerebellum_r", name: "CR", fullName: "Right Cerebellum", points: 1, category: "cerebellum", side: "right" },
  // PCA territory (Occipital) - 1 point each
  { id: "pca_l", name: "OL", fullName: "Left PCA Territory", points: 1, category: "occipital", side: "left" },
  { id: "pca_r", name: "OR", fullName: "Right PCA Territory", points: 1, category: "occipital", side: "right" },
];

interface Props {
  onScoreChange?: (score: number) => void;
}

export default function InteractivePcASPECTSCalculator({ onScoreChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [affectedRegions, setAffectedRegions] = useState<Set<string>>(new Set());

  const totalDeducted = pcAspectsRegions
    .filter(r => affectedRegions.has(r.id))
    .reduce((sum, r) => sum + r.points, 0);
  const score = 10 - totalDeducted;

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
    if (score >= 8) return { label: "Small infarct", desc: "Favorable for intervention", level: "low" };
    if (score >= 6) return { label: "Moderate infarct", desc: "Individualized decision needed", level: "moderate" };
    return { label: "Large infarct", desc: "Poor prognosis expected", level: "high" };
  };

  const scoreColors = getScoreColor();
  const interpretation = getInterpretation();

  const getCategoryColor = (category: string, isAffected: boolean) => {
    if (isAffected) return { fill: "rgba(239, 68, 68, 0.7)", stroke: "#dc2626" };
    switch (category) {
      case "brainstem": return { fill: "rgba(251, 146, 60, 0.4)", stroke: "#f97316" };
      case "thalamus": return { fill: "rgba(34, 211, 238, 0.3)", stroke: "#06b6d4" };
      case "cerebellum": return { fill: "rgba(74, 222, 128, 0.3)", stroke: "#22c55e" };
      case "occipital": return { fill: "rgba(167, 139, 250, 0.3)", stroke: "#8b5cf6" };
      default: return { fill: "rgba(148, 163, 184, 0.3)", stroke: "#94a3b8" };
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50 dark:from-teal-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-teal-100/50 dark:bg-teal-900/30">
            <CardTitle className="flex items-center justify-between text-teal-800 dark:text-teal-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>pc-ASPECTS Interactive Calculator</span>
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
            <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <p className="text-sm text-teal-700 dark:text-teal-400">
                <strong>Instructions:</strong> Click on brain regions showing early ischemic changes. 
                Brainstem regions (Midbrain, Pons) subtract 2 points each. Other regions subtract 1 point each.
              </p>
            </div>

            {/* Interactive Brain Diagram */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* SVG Posterior Circulation Diagram */}
              <div className="flex-1 flex justify-center">
                <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 shadow-inner">
                  <svg viewBox="0 0 300 320" className="w-full max-w-sm h-auto">
                    {/* Brain outline - sagittal/posterior view */}
                    <ellipse
                      cx="150"
                      cy="120"
                      rx="120"
                      ry="100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-400 dark:text-slate-600"
                    />

                    {/* Midline */}
                    <line
                      x1="150"
                      y1="20"
                      x2="150"
                      y2="220"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      className="text-slate-300 dark:text-slate-700"
                    />

                    {/* Left PCA Territory (Occipital) */}
                    <g className="cursor-pointer" onClick={() => toggleRegion("pca_l")}>
                      <path
                        d="M 45 80 Q 30 100 35 130 Q 45 160 75 170 Q 100 165 110 140 Q 115 110 100 85 Q 80 65 45 80"
                        fill={getCategoryColor("occipital", affectedRegions.has("pca_l")).fill}
                        stroke={getCategoryColor("occipital", affectedRegions.has("pca_l")).stroke}
                        strokeWidth="2"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      <text x="70" y="125" textAnchor="middle" className={`text-xs font-bold pointer-events-none ${affectedRegions.has("pca_l") ? "fill-white" : "fill-purple-800 dark:fill-purple-200"}`}>OL</text>
                    </g>

                    {/* Right PCA Territory (Occipital) */}
                    <g className="cursor-pointer" onClick={() => toggleRegion("pca_r")}>
                      <path
                        d="M 255 80 Q 270 100 265 130 Q 255 160 225 170 Q 200 165 190 140 Q 185 110 200 85 Q 220 65 255 80"
                        fill={getCategoryColor("occipital", affectedRegions.has("pca_r")).fill}
                        stroke={getCategoryColor("occipital", affectedRegions.has("pca_r")).stroke}
                        strokeWidth="2"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      <text x="230" y="125" textAnchor="middle" className={`text-xs font-bold pointer-events-none ${affectedRegions.has("pca_r") ? "fill-white" : "fill-purple-800 dark:fill-purple-200"}`}>OR</text>
                    </g>

                    {/* Left Thalamus */}
                    <g className="cursor-pointer" onClick={() => toggleRegion("thalamus_l")}>
                      <ellipse
                        cx="115"
                        cy="95"
                        rx="25"
                        ry="18"
                        fill={getCategoryColor("thalamus", affectedRegions.has("thalamus_l")).fill}
                        stroke={getCategoryColor("thalamus", affectedRegions.has("thalamus_l")).stroke}
                        strokeWidth="2"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      <text x="115" y="99" textAnchor="middle" className={`text-xs font-bold pointer-events-none ${affectedRegions.has("thalamus_l") ? "fill-white" : "fill-cyan-800 dark:fill-cyan-200"}`}>TL</text>
                    </g>

                    {/* Right Thalamus */}
                    <g className="cursor-pointer" onClick={() => toggleRegion("thalamus_r")}>
                      <ellipse
                        cx="185"
                        cy="95"
                        rx="25"
                        ry="18"
                        fill={getCategoryColor("thalamus", affectedRegions.has("thalamus_r")).fill}
                        stroke={getCategoryColor("thalamus", affectedRegions.has("thalamus_r")).stroke}
                        strokeWidth="2"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      <text x="185" y="99" textAnchor="middle" className={`text-xs font-bold pointer-events-none ${affectedRegions.has("thalamus_r") ? "fill-white" : "fill-cyan-800 dark:fill-cyan-200"}`}>TR</text>
                    </g>

                    {/* Left Cerebellum */}
                    <g className="cursor-pointer" onClick={() => toggleRegion("cerebellum_l")}>
                      <path
                        d="M 50 185 Q 35 210 50 240 Q 75 265 110 255 Q 140 240 145 210 Q 140 185 115 175 Q 80 170 50 185"
                        fill={getCategoryColor("cerebellum", affectedRegions.has("cerebellum_l")).fill}
                        stroke={getCategoryColor("cerebellum", affectedRegions.has("cerebellum_l")).stroke}
                        strokeWidth="2"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      <text x="95" y="220" textAnchor="middle" className={`text-xs font-bold pointer-events-none ${affectedRegions.has("cerebellum_l") ? "fill-white" : "fill-green-800 dark:fill-green-200"}`}>CL</text>
                    </g>

                    {/* Right Cerebellum */}
                    <g className="cursor-pointer" onClick={() => toggleRegion("cerebellum_r")}>
                      <path
                        d="M 250 185 Q 265 210 250 240 Q 225 265 190 255 Q 160 240 155 210 Q 160 185 185 175 Q 220 170 250 185"
                        fill={getCategoryColor("cerebellum", affectedRegions.has("cerebellum_r")).fill}
                        stroke={getCategoryColor("cerebellum", affectedRegions.has("cerebellum_r")).stroke}
                        strokeWidth="2"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      <text x="205" y="220" textAnchor="middle" className={`text-xs font-bold pointer-events-none ${affectedRegions.has("cerebellum_r") ? "fill-white" : "fill-green-800 dark:fill-green-200"}`}>CR</text>
                    </g>

                    {/* Midbrain */}
                    <g className="cursor-pointer" onClick={() => toggleRegion("midbrain")}>
                      <ellipse
                        cx="150"
                        cy="145"
                        rx="30"
                        ry="18"
                        fill={getCategoryColor("brainstem", affectedRegions.has("midbrain")).fill}
                        stroke={getCategoryColor("brainstem", affectedRegions.has("midbrain")).stroke}
                        strokeWidth="2"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      <text x="150" y="149" textAnchor="middle" className={`text-xs font-bold pointer-events-none ${affectedRegions.has("midbrain") ? "fill-white" : "fill-orange-800 dark:fill-orange-200"}`}>M</text>
                    </g>

                    {/* Pons */}
                    <g className="cursor-pointer" onClick={() => toggleRegion("pons")}>
                      <ellipse
                        cx="150"
                        cy="180"
                        rx="35"
                        ry="20"
                        fill={getCategoryColor("brainstem", affectedRegions.has("pons")).fill}
                        stroke={getCategoryColor("brainstem", affectedRegions.has("pons")).stroke}
                        strokeWidth="2"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      <text x="150" y="184" textAnchor="middle" className={`text-xs font-bold pointer-events-none ${affectedRegions.has("pons") ? "fill-white" : "fill-orange-800 dark:fill-orange-200"}`}>P</text>
                    </g>

                    {/* Labels */}
                    <text x="150" y="290" textAnchor="middle" className="text-xs fill-slate-500 dark:fill-slate-400">
                      Posterior Circulation View
                    </text>

                    {/* Legend */}
                    <g transform="translate(10, 270)">
                      <rect x="0" y="0" width="10" height="10" fill="rgba(251, 146, 60, 0.6)" stroke="#f97316" strokeWidth="1" rx="2" />
                      <text x="14" y="9" className="text-[8px] fill-slate-600 dark:fill-slate-400">Brainstem (2pts)</text>
                      
                      <rect x="80" y="0" width="10" height="10" fill="rgba(34, 211, 238, 0.4)" stroke="#06b6d4" strokeWidth="1" rx="2" />
                      <text x="94" y="9" className="text-[8px] fill-slate-600 dark:fill-slate-400">Thalamus (1pt)</text>
                      
                      <rect x="155" y="0" width="10" height="10" fill="rgba(74, 222, 128, 0.4)" stroke="#22c55e" strokeWidth="1" rx="2" />
                      <text x="169" y="9" className="text-[8px] fill-slate-600 dark:fill-slate-400">Cerebellum (1pt)</text>
                      
                      <rect x="235" y="0" width="10" height="10" fill="rgba(167, 139, 250, 0.4)" stroke="#8b5cf6" strokeWidth="1" rx="2" />
                      <text x="249" y="9" className="text-[8px] fill-slate-600 dark:fill-slate-400">PCA (1pt)</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Region Legend & Controls */}
              <div className="flex-1 space-y-4">
                {/* Current Score Display */}
                <div className={`p-4 rounded-lg border-2 ${scoreColors.border} bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">pc-ASPECTS Score</span>
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
                  {totalDeducted > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      Points deducted: {totalDeducted}
                    </p>
                  )}
                </div>

                {/* All Regions Checklist */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 text-sm">All Regions</h4>
                  <div className="space-y-2">
                    {/* Brainstem */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Brainstem (2 pts each)</p>
                      <div className="grid grid-cols-2 gap-1">
                        {pcAspectsRegions.filter(r => r.category === "brainstem").map((region) => {
                          const isAffected = affectedRegions.has(region.id);
                          return (
                            <button
                              key={region.id}
                              onClick={() => toggleRegion(region.id)}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all ${
                                isAffected
                                  ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                                  : "bg-orange-50 dark:bg-orange-900/20 text-slate-700 dark:text-slate-300 border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-800/30"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isAffected ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                              }`}>
                                {region.name}
                              </span>
                              <span className="truncate">{region.fullName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Thalamus */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Thalamus (1 pt each)</p>
                      <div className="grid grid-cols-2 gap-1">
                        {pcAspectsRegions.filter(r => r.category === "thalamus").map((region) => {
                          const isAffected = affectedRegions.has(region.id);
                          return (
                            <button
                              key={region.id}
                              onClick={() => toggleRegion(region.id)}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all ${
                                isAffected
                                  ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                                  : "bg-cyan-50 dark:bg-cyan-900/20 text-slate-700 dark:text-slate-300 border border-cyan-200 dark:border-cyan-700 hover:bg-cyan-100 dark:hover:bg-cyan-800/30"
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

                    {/* Cerebellum */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400">Cerebellum (1 pt each)</p>
                      <div className="grid grid-cols-2 gap-1">
                        {pcAspectsRegions.filter(r => r.category === "cerebellum").map((region) => {
                          const isAffected = affectedRegions.has(region.id);
                          return (
                            <button
                              key={region.id}
                              onClick={() => toggleRegion(region.id)}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all ${
                                isAffected
                                  ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                                  : "bg-green-50 dark:bg-green-900/20 text-slate-700 dark:text-slate-300 border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800/30"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isAffected ? "bg-red-500 text-white" : "bg-green-500 text-white"
                              }`}>
                                {region.name}
                              </span>
                              <span className="truncate">{region.fullName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PCA Territory */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400">PCA Territory (1 pt each)</p>
                      <div className="grid grid-cols-2 gap-1">
                        {pcAspectsRegions.filter(r => r.category === "occipital").map((region) => {
                          const isAffected = affectedRegions.has(region.id);
                          return (
                            <button
                              key={region.id}
                              onClick={() => toggleRegion(region.id)}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all ${
                                isAffected
                                  ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                                  : "bg-purple-50 dark:bg-purple-900/20 text-slate-700 dark:text-slate-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800/30"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isAffected ? "bg-red-500 text-white" : "bg-purple-500 text-white"
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
              </div>
            </div>

            {/* Score Interpretation Guide */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-800 dark:text-green-300">8-10</div>
                <div className="text-sm text-green-700 dark:text-green-400">Small infarct</div>
                <div className="text-xs text-green-600 dark:text-green-500">Favorable for intervention</div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">6-7</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-400">Moderate infarct</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500">Individualized decision</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-800 dark:text-red-300">0-5</div>
                <div className="text-sm text-red-700 dark:text-red-400">Large infarct</div>
                <div className="text-xs text-red-600 dark:text-red-500">Poor prognosis</div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <p className="text-xs text-teal-600 dark:text-teal-400">
                <strong>Clinical Notes:</strong> pc-ASPECTS was developed specifically for posterior circulation strokes. 
                Brainstem involvement (midbrain, pons) carries more weight (2 points each) due to clinical significance. 
                DWI-MRI is preferred over CT for posterior fossa assessment due to artifact limitations.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
