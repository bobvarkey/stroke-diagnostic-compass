import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Scale, Clock, ArrowRightLeft, AlertTriangle } from "lucide-react";

import tpaVsMedical from "@/assets/tpa-vs-medical-management.png";
import tpa3hVs4h from "@/assets/tpa-3h-vs-4-5h.png";
import tpaVsTpaMtLvo from "@/assets/tpa-vs-tpa-mt-lvo.png";
import lateThrombectomyLvo from "@/assets/late-thrombectomy-lvo.png";

interface DecisionScenario {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  keyStats: string;
  clinicalContext: string;
  evidenceSource: string;
}

const decisionScenarios: DecisionScenario[] = [
  {
    id: "tpa-vs-medical",
    title: "Medical Management vs IV tPA",
    subtitle: "Acute Ischemic Stroke within 4.5 hours",
    image: tpaVsMedical,
    description: "Comparison of outcomes between supportive care (no IV tPA) versus IV tPA (clot-busting medication) in acute ischemic stroke.",
    keyStats: "18 vs 31 patients living independently per 100 treated",
    clinicalContext: "For eligible patients within the treatment window, IV tPA significantly improves functional outcomes. More patients achieve independent living with treatment.",
    evidenceSource: "Based on clinical trials of IV tPA for acute ischemic stroke (NINDS, ECASS)"
  },
  {
    id: "tpa-3h-vs-4-5h",
    title: "IV tPA: <3 hours vs 3-4.5 hours",
    subtitle: "Time-dependent efficacy of thrombolysis",
    image: tpa3hVs4h,
    description: "Comparison of functional outcomes when IV tPA is administered within 3 hours (NINDS trial) versus 3-4.5 hours (ECASS III trial).",
    keyStats: "32 vs 16 patients with improved outcomes per 100 treated",
    clinicalContext: "Earlier treatment yields substantially better outcomes. 'Time is brain' - every minute counts in acute stroke treatment.",
    evidenceSource: "NINDS trial (<3h) and ECASS III trial (3-4.5h)"
  },
  {
    id: "tpa-vs-tpa-mt",
    title: "tPA Alone vs tPA + Mechanical Thrombectomy",
    subtitle: "Large Vessel Occlusion (LVO)",
    image: tpaVsTpaMtLvo,
    description: "In patients with large vessel occlusion, comparison between IV tPA alone versus combined IV tPA and mechanical thrombectomy.",
    keyStats: "Significantly more patients achieve functional independence with combined therapy",
    clinicalContext: "For LVO patients, mechanical thrombectomy combined with IV tPA dramatically improves outcomes compared to medical therapy alone.",
    evidenceSource: "Based on MR CLEAN, EXTEND-IA, SWIFT PRIME, ESCAPE, REVASCAT trials"
  },
  {
    id: "late-thrombectomy",
    title: "No Reperfusion vs Late Thrombectomy",
    subtitle: "tPA-ineligible or late-presenting patients (6-24 hours)",
    image: lateThrombectomyLvo,
    description: "For patients ineligible for IV tPA or presenting in extended window (6-24 hours), comparison between medical management alone versus late mechanical thrombectomy.",
    keyStats: "32 vs 43 patients living independently per 100 treated",
    clinicalContext: "Late thrombectomy in selected LVO patients with favorable imaging extends the treatment window and improves outcomes.",
    evidenceSource: "Based on DAWN and DEFUSE 3 trials for late thrombectomy in LVO"
  }
];

const TreatmentDecisionAid: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tpa-vs-medical");

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
          <Scale className="h-5 w-5" />
          Treatment Choice Consequence Matrix
          <Badge variant="outline" className="ml-2 text-xs border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400">
            Visual Decision Aid
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Evidence-based visual comparisons of stroke treatment outcomes to aid clinical decision-making
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1 bg-purple-100 dark:bg-purple-900/30 p-1">
            <TabsTrigger 
              value="tpa-vs-medical" 
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span className="hidden sm:inline">Medical vs tPA</span>
              <span className="sm:hidden">1</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tpa-3h-vs-4-5h"
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">3h vs 4.5h</span>
              <span className="sm:hidden">2</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tpa-vs-tpa-mt"
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <Scale className="h-3 w-3" />
              <span className="hidden sm:inline">tPA vs tPA+MT</span>
              <span className="sm:hidden">3</span>
            </TabsTrigger>
            <TabsTrigger 
              value="late-thrombectomy"
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden sm:inline">Late MT (6-24h)</span>
              <span className="sm:hidden">4</span>
            </TabsTrigger>
          </TabsList>

          {decisionScenarios.map((scenario) => (
            <TabsContent key={scenario.id} value={scenario.id} className="mt-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="text-center border-b border-purple-200 dark:border-purple-800 pb-3">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {scenario.subtitle}
                  </p>
                </div>

                {/* Image */}
                <div className="relative rounded-lg overflow-hidden border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900">
                  <img 
                    src={scenario.image} 
                    alt={scenario.title}
                    className="w-full h-auto object-contain max-h-[500px]"
                  />
                </div>

                {/* Key Stats */}
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-800 dark:text-purple-300">Key Statistics</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                    {scenario.keyStats}
                  </p>
                </div>

                {/* Clinical Context */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm">Clinical Context</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      {scenario.clinicalContext}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-2 text-sm">Evidence Source</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scenario.evidenceSource}
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-3 text-sm">Outcome Legend</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-emerald-600"></div>
                      <span className="text-gray-700 dark:text-gray-300">Living independently</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-lime-500"></div>
                      <span className="text-gray-700 dark:text-gray-300">Needs some help (moderate disability)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500"></div>
                      <span className="text-gray-700 dark:text-gray-300">Needs significant care (severe disability)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-400"></div>
                      <span className="text-gray-700 dark:text-gray-300">Unchanged outcome</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-600"></div>
                      <span className="text-gray-700 dark:text-gray-300">Worse outcome / Died</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer Note */}
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-600 dark:text-purple-400 text-center">
            <strong>Note:</strong> These visual aids are based on clinical trial data and should be used to support shared decision-making with patients and families. 
            Individual patient factors and clinical judgment should guide treatment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentDecisionAid;
