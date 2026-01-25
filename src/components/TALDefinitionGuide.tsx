import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Target, AlertTriangle, Info } from "lucide-react";

interface OcclusionType {
  id: string;
  name: string;
  location: "ica" | "mca";
  description: string;
  morbidity: "high" | "moderate" | "standard";
  urgency: "critical" | "high" | "moderate";
}

const occlusionTypes: OcclusionType[] = [
  // ICA occlusions
  {
    id: "t_occlusion",
    name: "T-occlusion (terminal ICA+M1+A1)",
    location: "ica",
    description: "Complete occlusion at ICA terminus involving both MCA and ACA origins",
    morbidity: "high",
    urgency: "critical"
  },
  {
    id: "l_occlusion",
    name: "L-occlusion (terminal ICA+M1)",
    location: "ica",
    description: "Terminal ICA occlusion extending into M1 with preserved A1",
    morbidity: "high",
    urgency: "critical"
  },
  {
    id: "isolated_terminal_ica",
    name: "Isolated terminal ICA occlusion",
    location: "ica",
    description: "Isolated occlusion of the terminal ICA without extension into branches",
    morbidity: "high",
    urgency: "critical"
  },
  // MCA occlusions
  {
    id: "m1_proximal_lsa",
    name: "M1 (proximal, with LSA occlusion)",
    location: "mca",
    description: "Proximal M1 lesion with occlusion of the lenticulostriate arteries",
    morbidity: "high",
    urgency: "critical"
  },
  {
    id: "m1_distal_no_lsa",
    name: "M1 (distal, without LSA occlusion)",
    location: "mca",
    description: "Distal M1 lesion without occlusion of the lenticulostriate arteries - better deep structure preservation",
    morbidity: "moderate",
    urgency: "high"
  },
  {
    id: "m2",
    name: "M2 occlusion",
    location: "mca",
    description: "Occlusion of M2 segment (superior or inferior division)",
    morbidity: "moderate",
    urgency: "moderate"
  }
];

const TALDefinitionGuide: React.FC = () => {
  const [selectedOcclusion, setSelectedOcclusion] = useState<string>("");

  const getSelectedOcclusionInfo = () => {
    return occlusionTypes.find(o => o.id === selectedOcclusion);
  };

  const occlusionInfo = getSelectedOcclusionInfo();

  const getMorbidityColor = (morbidity: string) => {
    switch (morbidity) {
      case "high": return "bg-red-500 text-white";
      case "moderate": return "bg-yellow-500 text-white";
      case "standard": return "bg-green-500 text-white";
      default: return "bg-muted";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical": return <Badge className="bg-red-600">Critical Urgency</Badge>;
      case "high": return <Badge className="bg-orange-500">High Urgency</Badge>;
      case "moderate": return <Badge variant="secondary">Moderate Urgency</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="w-full border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Target className="h-5 w-5" />
          Target Arterial Lesion (TAL) Definition
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Key Points */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Key Concepts
          </h4>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
            <li>• <strong>TAL</strong> = most proximal part of the <strong>intracranial arterial occlusion</strong></li>
            <li>• Isolated extracranial artery occlusions (such as extracranial ICA) are <strong>NOT</strong> considered as TAL</li>
            <li>• In tandem lesions involving cervical ICA + M1, the <strong>target artery is the MCA</strong>, as it directly affects distal perfusion and is the primary target for recanalization</li>
            <li>• Accurate identification of the TAL is crucial as it influences the feasibility, technique, and success rate of mechanical thrombectomy</li>
            <li>• <strong>Proximal occlusions (ICA, proximal M1)</strong> have higher morbidity and require rapid recanalization</li>
          </ul>
        </div>

        {/* Location-based Classification */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Select Occlusion Type</h3>
          
          <RadioGroup value={selectedOcclusion} onValueChange={setSelectedOcclusion}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ICA Occlusions */}
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-medium text-red-700 dark:text-red-300 mb-3">ICA Occlusions</h4>
                <div className="space-y-3">
                  {occlusionTypes
                    .filter(o => o.location === "ica")
                    .map(occlusion => (
                      <div 
                        key={occlusion.id}
                        className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedOcclusion === occlusion.id 
                            ? "bg-red-100 dark:bg-red-900/50" 
                            : "hover:bg-red-100/50 dark:hover:bg-red-900/30"
                        }`}
                        onClick={() => setSelectedOcclusion(occlusion.id)}
                      >
                        <RadioGroupItem value={occlusion.id} id={occlusion.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={occlusion.id} className="cursor-pointer font-medium text-red-800 dark:text-red-200">
                            {occlusion.name}
                          </Label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* MCA Occlusions */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-3">MCA Occlusions</h4>
                <div className="space-y-3">
                  {occlusionTypes
                    .filter(o => o.location === "mca")
                    .map(occlusion => (
                      <div 
                        key={occlusion.id}
                        className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedOcclusion === occlusion.id 
                            ? "bg-blue-100 dark:bg-blue-900/50" 
                            : "hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
                        }`}
                        onClick={() => setSelectedOcclusion(occlusion.id)}
                      >
                        <RadioGroupItem value={occlusion.id} id={occlusion.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={occlusion.id} className="cursor-pointer font-medium text-blue-800 dark:text-blue-200">
                            {occlusion.name}
                          </Label>
                          {occlusion.id === "m1_proximal_lsa" && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              ↳ with occlusion of lenticulostriate arteries
                            </p>
                          )}
                          {occlusion.id === "m1_distal_no_lsa" && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              ↳ without occlusion of lenticulostriate arteries
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Selected Occlusion Details */}
        {occlusionInfo && (
          <div className={`p-4 rounded-lg ${
            occlusionInfo.location === "ica" 
              ? "bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700" 
              : "bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700"
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className={`text-lg font-bold ${
                  occlusionInfo.location === "ica" 
                    ? "text-red-800 dark:text-red-200" 
                    : "text-blue-800 dark:text-blue-200"
                }`}>
                  {occlusionInfo.name}
                </h4>
                <p className={`text-sm mt-1 ${
                  occlusionInfo.location === "ica" 
                    ? "text-red-700 dark:text-red-300" 
                    : "text-blue-700 dark:text-blue-300"
                }`}>
                  {occlusionInfo.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getUrgencyBadge(occlusionInfo.urgency)}
                <Badge className={getMorbidityColor(occlusionInfo.morbidity)}>
                  {occlusionInfo.morbidity === "high" ? "High Morbidity" : "Moderate Morbidity"}
                </Badge>
              </div>
            </div>

            {/* Clinical Implications */}
            <div className="mt-4 pt-4 border-t border-current/20">
              <h5 className="font-medium mb-2">Clinical Implications</h5>
              <ul className="text-sm space-y-1">
                {occlusionInfo.morbidity === "high" && (
                  <>
                    <li>• Requires urgent/emergent mechanical thrombectomy</li>
                    <li>• Higher risk of poor outcome if not rapidly recanalized</li>
                    <li>• Consider direct aspiration or stent retriever approach</li>
                  </>
                )}
                {occlusionInfo.id === "m1_proximal_lsa" && (
                  <li className="flex items-start gap-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Basal ganglia at risk - lenticulostriate territory involvement</span>
                  </li>
                )}
                {occlusionInfo.id === "m1_distal_no_lsa" && (
                  <li className="text-green-700 dark:text-green-400">
                    ✓ Preserved deep structures - lenticulostriate arteries spared
                  </li>
                )}
                {occlusionInfo.id === "m2" && (
                  <>
                    <li>• Consider patient selection carefully (NIHSS, eloquent territory)</li>
                    <li>• Endovascular treatment beneficial in selected patients (ESCAPE-NA1, SWIFT PRIME sub-analyses)</li>
                  </>
                )}
                {occlusionInfo.location === "ica" && occlusionInfo.id.includes("t_") && (
                  <li className="flex items-start gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Both MCA and ACA territories at risk - consider bi-hemispheric monitoring</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Tandem Lesion Note */}
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Tandem Lesions
          </h4>
          <div className="text-sm text-purple-700 dark:text-purple-400 space-y-2">
            <p>When a tandem lesion involves the <strong>cervical segment of ICA + M1</strong>:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The <strong>target artery is the MCA</strong> (not the cervical ICA)</li>
              <li>MCA directly affects distal perfusion and is the primary target for recanalization</li>
              <li>Cervical ICA lesion should be addressed (stenting) but the intracranial occlusion determines the TAL</li>
              <li>Treatment strategy: Antegrade vs retrograde approach depends on operator preference and anatomy</li>
            </ul>
          </div>
        </div>

        {/* M1 Segment Anatomy Note */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">M1 Segment Anatomy</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Proximal M1:</strong> Gives rise to lenticulostriate arteries (LSAs) → supplies basal ganglia, internal capsule</p>
            <p><strong>Distal M1:</strong> Beyond LSA origins → occlusion spares deep structures</p>
            <p className="text-primary font-medium">Distinguishing proximal vs. distal M1 occlusion is important for prognosis and procedural planning</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TALDefinitionGuide;
