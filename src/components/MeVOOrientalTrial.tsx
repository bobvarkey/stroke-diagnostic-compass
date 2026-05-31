import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, Info, ExternalLink } from "lucide-react";

const MeVOOrientalTrial = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Default view - matches CHOICE-2 style */}
      <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded border-l-4 border-cyan-500 cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-cyan-600" />
          <span className="font-bold text-cyan-700 dark:text-cyan-400">ORIENTAL-MeVO</span>
          <Badge className="bg-cyan-500 text-white text-xs">MeVO</Badge>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            ORIENTAL-MeVO used stricter patient selection (NIHSS ≥6) and found a significant benefit.
          </span>
        </div>
      </div>

      {/* Expanded view on hover */}
      {isHovered && (
        <div className="absolute z-50 left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-cyan-200 dark:border-cyan-800 space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-semibold">ORIENTAL-MeVO Trial</h3>
            <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-500 border-cyan-500/30">NEJM 2026</Badge>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            Three prior trials (DISTAL, ESCAPE-MeVO) were neutral — thrombectomy didn't seem to help.
            ORIENTAL-MeVO used stricter patient selection (NIHSS ≥6) and found a significant benefit.
          </p>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-2 font-semibold">Outcome</th>
                  <th className="text-center p-2 font-semibold">Medical Mgmt</th>
                  <th className="text-center p-2 font-semibold">Thrombectomy</th>
                  <th className="text-center p-2 font-semibold">Benefit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2 font-medium">mRS 0–2 @ 90d</td>
                  <td className="p-2 text-center">46.6%</td>
                  <td className="p-2 text-center text-green-600 font-semibold">58.6%</td>
                  <td className="p-2 text-center">aRR 1.24</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2 font-medium">mRS 0–1</td>
                  <td className="p-2 text-center">33.2%</td>
                  <td className="p-2 text-center text-green-600 font-semibold">48.9%</td>
                  <td className="p-2 text-center">aRR 1.47</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Vessel patency</td>
                  <td className="p-2 text-center">46.2%</td>
                  <td className="p-2 text-center text-green-600 font-semibold">82.1%</td>
                  <td className="p-2 text-center">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* NNT Highlight */}
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <span className="text-sm font-bold text-green-600">NNT = 8</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">for functional independence</span>
          </div>

          {/* Critical Nuance */}
          <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 dark:text-gray-300">
              <strong>Critical nuance:</strong> Benefit was not seen in NIHSS &lt;8 — explaining why earlier trials were negative.
              <strong> Lesson:</strong> MeVO thrombectomy works only in moderate-to-severe deficits.
            </div>
          </div>

          {/* Bottom Line */}
          <blockquote className="text-xs italic text-gray-600 dark:text-gray-400 border-l-2 border-cyan-500 pl-3">
            "MeVO thrombectomy is not a routine default, but it is not dead. Signal strongest with higher-NIHSS, clearly disabling patients."
          </blockquote>

          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <ExternalLink className="h-3 w-3" />
            <span>Nogueira R et al. NEJM 2026. ISC Feb 2026.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeVOOrientalTrial;
