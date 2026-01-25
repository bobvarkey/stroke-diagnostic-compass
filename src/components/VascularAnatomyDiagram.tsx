import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, Target, Info } from "lucide-react";

interface VesselSegment {
  id: string;
  name: string;
  fullName: string;
  description: string;
  morbidity: "critical" | "high" | "moderate";
  territory: string;
  thrombectomyConsiderations: string[];
}

const vesselSegments: VesselSegment[] = [
  {
    id: "ica_terminus",
    name: "ICA-T",
    fullName: "ICA Terminus (Carotid T)",
    description: "Terminal portion of internal carotid artery at bifurcation into MCA and ACA",
    morbidity: "critical",
    territory: "MCA + ACA territories at risk",
    thrombectomyConsiderations: [
      "T-occlusion: ICA+M1+A1 involvement",
      "L-occlusion: ICA+M1 involvement",
      "Highest morbidity, requires emergent treatment",
      "Consider bi-hemispheric monitoring"
    ]
  },
  {
    id: "m1_proximal",
    name: "M1 Prox",
    fullName: "M1 Proximal Segment",
    description: "Origin of M1 at ICA bifurcation to before lenticulostriate arteries (LSAs)",
    morbidity: "critical",
    territory: "Entire MCA territory + basal ganglia (LSA)",
    thrombectomyConsiderations: [
      "Lenticulostriate arteries (LSAs) at risk",
      "Basal ganglia and internal capsule involvement",
      "High urgency for recanalization",
      "Direct aspiration or stent retriever approach"
    ]
  },
  {
    id: "m1_distal",
    name: "M1 Dist",
    fullName: "M1 Distal Segment",
    description: "Segment beyond lenticulostriate artery origins to MCA bifurcation/trifurcation",
    morbidity: "high",
    territory: "Cortical MCA territory (LSAs spared)",
    thrombectomyConsiderations: [
      "LSAs preserved - better deep structure outcome",
      "Still high priority for thrombectomy",
      "Lower hemorrhagic transformation risk",
      "Often better functional outcomes vs proximal M1"
    ]
  },
  {
    id: "m2_superior",
    name: "M2 Sup",
    fullName: "M2 Superior Division",
    description: "Superior/frontal trunk of MCA after bifurcation",
    morbidity: "moderate",
    territory: "Frontal & superior parietal cortex",
    thrombectomyConsiderations: [
      "Motor strip involvement common",
      "Dominant hemisphere: Broca's aphasia risk",
      "Patient selection important (NIHSS, eloquent cortex)",
      "ESCAPE-NA1, SWIFT PRIME subanalyses support treatment"
    ]
  },
  {
    id: "m2_inferior",
    name: "M2 Inf",
    fullName: "M2 Inferior Division",
    description: "Inferior/temporal trunk of MCA after bifurcation",
    morbidity: "moderate",
    territory: "Temporal & inferior parietal cortex",
    thrombectomyConsiderations: [
      "Dominant hemisphere: Wernicke's area at risk",
      "Consider NIHSS and clinical presentation",
      "Thrombectomy beneficial in selected patients",
      "Lower overall morbidity than M1"
    ]
  },
  {
    id: "a1",
    name: "A1",
    fullName: "A1 Segment (ACA)",
    description: "Horizontal segment from ICA to anterior communicating artery",
    morbidity: "high",
    territory: "Frontal lobe, medial hemisphere",
    thrombectomyConsiderations: [
      "Often part of T-occlusion",
      "Isolated A1 occlusion less common",
      "Collateral potential via AComm",
      "Consider if part of tandem lesion"
    ]
  }
];

const VascularAnatomyDiagram: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const getSelectedInfo = () => vesselSegments.find(s => s.id === selectedSegment);
  const selectedInfo = getSelectedInfo();

  const getMorbidityColor = (morbidity: string) => {
    switch (morbidity) {
      case "critical": return { bg: "fill-red-500", stroke: "stroke-red-600", badge: "bg-red-600" };
      case "high": return { bg: "fill-orange-500", stroke: "stroke-orange-600", badge: "bg-orange-500" };
      case "moderate": return { bg: "fill-yellow-500", stroke: "stroke-yellow-600", badge: "bg-yellow-500" };
      default: return { bg: "fill-muted", stroke: "stroke-border", badge: "bg-muted" };
    }
  };

  const isActive = (id: string) => selectedSegment === id || hoveredSegment === id;

  return (
    <Card className="w-full border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Brain className="h-5 w-5" />
          Interactive Vascular Anatomy - Anterior Circulation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Educational Note */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Click on vessel segments to view Target Arterial Lesion (TAL) details and thrombectomy considerations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SVG Diagram */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-border">
            <svg viewBox="0 0 400 350" className="w-full h-auto max-h-80">
              {/* Background brain outline */}
              <ellipse cx="200" cy="175" rx="170" ry="150" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" />
              
              {/* ICA (coming up from bottom) */}
              <path 
                d="M200 340 L200 260" 
                fill="none" 
                stroke="currentColor" 
                strokeOpacity="0.3" 
                strokeWidth="8"
                strokeLinecap="round"
              />
              <text x="215" y="300" className="text-xs fill-muted-foreground">ICA</text>

              {/* ICA Terminus */}
              <circle 
                cx="200" 
                cy="260" 
                r="18"
                className={`cursor-pointer transition-all duration-200 ${
                  isActive("ica_terminus") 
                    ? "fill-red-500 stroke-red-700 stroke-2" 
                    : "fill-red-400/70 stroke-red-500 stroke-1 hover:fill-red-500"
                }`}
                onClick={() => setSelectedSegment("ica_terminus")}
                onMouseEnter={() => setHoveredSegment("ica_terminus")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              <text 
                x="200" y="265" 
                textAnchor="middle" 
                className="text-[10px] fill-white font-bold pointer-events-none"
              >
                ICA-T
              </text>

              {/* A1 Segment (going left/medial) */}
              <path 
                d="M182 260 Q150 250 130 220" 
                fill="none" 
                className={`cursor-pointer transition-all duration-200 ${
                  isActive("a1") 
                    ? "stroke-orange-500" 
                    : "stroke-orange-400/70 hover:stroke-orange-500"
                }`}
                strokeWidth={isActive("a1") ? "10" : "8"}
                strokeLinecap="round"
                onClick={() => setSelectedSegment("a1")}
                onMouseEnter={() => setHoveredSegment("a1")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              <text x="135" y="250" className="text-xs fill-orange-600 dark:fill-orange-400 font-medium">A1</text>

              {/* M1 Proximal */}
              <path 
                d="M218 260 Q260 255 280 245" 
                fill="none" 
                className={`cursor-pointer transition-all duration-200 ${
                  isActive("m1_proximal") 
                    ? "stroke-red-500" 
                    : "stroke-red-400/70 hover:stroke-red-500"
                }`}
                strokeWidth={isActive("m1_proximal") ? "12" : "10"}
                strokeLinecap="round"
                onClick={() => setSelectedSegment("m1_proximal")}
                onMouseEnter={() => setHoveredSegment("m1_proximal")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              <text x="245" y="275" className="text-xs fill-red-600 dark:fill-red-400 font-medium">M1</text>
              <text x="242" y="285" className="text-[9px] fill-muted-foreground">prox</text>

              {/* LSA indicator (small branches) */}
              <path d="M260 250 L255 225" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="2,2" />
              <path d="M270 248 L268 220" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="2,2" />
              <text x="248" y="215" className="text-[8px] fill-muted-foreground">LSAs</text>

              {/* M1 Distal */}
              <path 
                d="M280 245 Q310 230 330 205" 
                fill="none" 
                className={`cursor-pointer transition-all duration-200 ${
                  isActive("m1_distal") 
                    ? "stroke-orange-500" 
                    : "stroke-orange-400/70 hover:stroke-orange-500"
                }`}
                strokeWidth={isActive("m1_distal") ? "10" : "8"}
                strokeLinecap="round"
                onClick={() => setSelectedSegment("m1_distal")}
                onMouseEnter={() => setHoveredSegment("m1_distal")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              <text x="315" y="235" className="text-xs fill-orange-600 dark:fill-orange-400 font-medium">M1</text>
              <text x="315" y="245" className="text-[9px] fill-muted-foreground">dist</text>

              {/* MCA Bifurcation point */}
              <circle cx="330" cy="205" r="5" className="fill-primary/30 stroke-primary" />

              {/* M2 Superior */}
              <path 
                d="M330 205 Q345 170 340 130" 
                fill="none" 
                className={`cursor-pointer transition-all duration-200 ${
                  isActive("m2_superior") 
                    ? "stroke-yellow-500" 
                    : "stroke-yellow-400/70 hover:stroke-yellow-500"
                }`}
                strokeWidth={isActive("m2_superior") ? "8" : "6"}
                strokeLinecap="round"
                onClick={() => setSelectedSegment("m2_superior")}
                onMouseEnter={() => setHoveredSegment("m2_superior")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              <text x="350" y="150" className="text-xs fill-yellow-600 dark:fill-yellow-400 font-medium">M2</text>
              <text x="350" y="160" className="text-[9px] fill-muted-foreground">sup</text>

              {/* M2 Inferior */}
              <path 
                d="M330 205 Q360 220 365 260" 
                fill="none" 
                className={`cursor-pointer transition-all duration-200 ${
                  isActive("m2_inferior") 
                    ? "stroke-yellow-500" 
                    : "stroke-yellow-400/70 hover:stroke-yellow-500"
                }`}
                strokeWidth={isActive("m2_inferior") ? "8" : "6"}
                strokeLinecap="round"
                onClick={() => setSelectedSegment("m2_inferior")}
                onMouseEnter={() => setHoveredSegment("m2_inferior")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              <text x="370" y="245" className="text-xs fill-yellow-600 dark:fill-yellow-400 font-medium">M2</text>
              <text x="370" y="255" className="text-[9px] fill-muted-foreground">inf</text>

              {/* Territory labels */}
              <text x="100" y="180" className="text-[10px] fill-muted-foreground italic">ACA territory</text>
              <text x="280" y="100" className="text-[10px] fill-muted-foreground italic">MCA territory</text>
              <text x="240" y="190" className="text-[10px] fill-muted-foreground italic">Basal ganglia</text>
            </svg>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Critical morbidity</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>High morbidity</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Moderate morbidity</span>
              </div>
            </div>
          </div>

          {/* Segment Details Panel */}
          <div className="space-y-4">
            {selectedInfo ? (
              <div className={`p-4 rounded-lg border-2 ${
                selectedInfo.morbidity === "critical" 
                  ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700" 
                  : selectedInfo.morbidity === "high"
                  ? "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700"
                  : "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg">{selectedInfo.fullName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedInfo.description}</p>
                  </div>
                  <Badge className={getMorbidityColor(selectedInfo.morbidity).badge}>
                    {selectedInfo.morbidity.toUpperCase()}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Territory at Risk</p>
                    <p className="text-sm font-medium">{selectedInfo.territory}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Thrombectomy Considerations</p>
                    <ul className="space-y-1">
                      {selectedInfo.thrombectomyConsiderations.map((point, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <Target className="h-3 w-3 mt-1 flex-shrink-0 text-primary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-border text-center">
                <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click on a vessel segment in the diagram to view TAL details
                </p>
              </div>
            )}

            {/* Quick Segment List */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">All Segments</p>
              <div className="grid grid-cols-2 gap-2">
                {vesselSegments.map(segment => (
                  <button
                    key={segment.id}
                    onClick={() => setSelectedSegment(segment.id)}
                    className={`p-2 rounded-md text-left text-sm transition-colors ${
                      selectedSegment === segment.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium">{segment.name}</div>
                    <div className="text-xs opacity-75">{segment.fullName.split(" ")[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tandem Lesion Note */}
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-purple-700 dark:text-purple-300">Tandem Lesions</p>
              <p className="text-purple-600 dark:text-purple-400">
                In cervical ICA + M1 tandem lesions, the MCA is the TAL (primary target for recanalization).
                The extracranial component should be addressed but does not define the TAL.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VascularAnatomyDiagram;
