import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, Target, Info } from "lucide-react";
import vascularAnatomyImage from "@/assets/vascular-anatomy-diagram.png";

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

  const getSelectedInfo = () => vesselSegments.find(s => s.id === selectedSegment);
  const selectedInfo = getSelectedInfo();

  const getMorbidityColor = (morbidity: string) => {
    switch (morbidity) {
      case "critical": return { badge: "bg-red-600" };
      case "high": return { badge: "bg-orange-500" };
      case "moderate": return { badge: "bg-yellow-500" };
      default: return { badge: "bg-muted" };
    }
  };

  return (
    <Card className="w-full border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Brain className="h-5 w-5" />
          Cerebral Vascular Anatomy Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Educational Note */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Reference diagram showing anterior (MCA/ACA) and posterior (PCA) circulation segments. Select a segment below for TAL details.
            </p>
          </div>
        </div>

        {/* Vascular Anatomy Image */}
        <div className="bg-white dark:bg-slate-900/50 rounded-lg p-4 border border-border">
          <img 
            src={vascularAnatomyImage} 
            alt="Cerebral Vascular Anatomy - Anterior and Posterior Circulation showing ICA, MCA (M1-M4), ACA (A1-A3), and PCA (P1-P5) segments" 
            className="w-full h-auto rounded-lg"
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-foreground mb-2">Anterior Circulation (Left)</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><span className="font-medium text-red-600">ICA</span> - Internal Carotid Artery</li>
                <li><span className="font-medium text-orange-500">M1</span> - Sphenoidal/Horizontal MCA</li>
                <li><span className="font-medium text-blue-500">M2</span> - Insular MCA</li>
                <li><span className="font-medium text-green-500">M3</span> - Opercular MCA</li>
                <li><span className="font-medium text-purple-500">M4</span> - Cortical MCA</li>
                <li><span className="font-medium text-cyan-500">A1-A3</span> - Anterior Cerebral Artery segments</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Posterior Circulation (Right)</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><span className="font-medium text-red-600">P1</span> - Precommunicating PCA</li>
                <li><span className="font-medium text-orange-500">P2</span> - Ambient PCA</li>
                <li><span className="font-medium text-cyan-500">P3</span> - Quadrigeminal PCA</li>
                <li><span className="font-medium text-blue-600">P4</span> - Calcarine PCA</li>
                <li><span className="font-medium text-yellow-600">P5</span> - Terminal Cortical PCA</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                  Select a vessel segment below to view TAL details
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
