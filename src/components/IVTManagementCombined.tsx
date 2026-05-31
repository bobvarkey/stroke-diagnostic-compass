import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Syringe, ShieldAlert, Beaker, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import TPAEligibilityChecklist from "./TPAEligibilityChecklist";
import IVTAnticoagulationGuide from "./IVTAnticoagulationGuide";
import ThrombolyticDoseCalculator from "./ThrombolyticDoseCalculator";

const IVTManagementCombined: React.FC = () => {
  const [eligibilityOpen, setEligibilityOpen] = useState(true);
  const [anticoagOpen, setAnticoagOpen] = useState(false);
  const [dosingOpen, setDosingOpen] = useState(false);

  return (
    <Card className="border-2 border-amber-500/30">
      <CardHeader className="pb-4 bg-gradient-to-r from-amber-100/50 to-orange-100/50 dark:from-amber-900/30 dark:to-orange-900/30">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-800 dark:text-amber-300">
          <Zap className="h-5 w-5 text-amber-500" />
          IVT Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Eligibility Checklist */}
        <Collapsible open={eligibilityOpen} onOpenChange={setEligibilityOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-amber-700 dark:text-amber-400">IVT Eligibility Checklist</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-amber-500 transition-transform", eligibilityOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <TPAEligibilityChecklist />
          </CollapsibleContent>
        </Collapsible>

        {/* Anticoagulation Guide */}
        <Collapsible open={anticoagOpen} onOpenChange={setAnticoagOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">IVT in Anticoagulated Patients</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-destructive transition-transform", anticoagOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <IVTAnticoagulationGuide />
          </CollapsibleContent>
        </Collapsible>

        {/* Dosing Calculator */}
        <Collapsible open={dosingOpen} onOpenChange={setDosingOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-400">Thrombolytic Dosing</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-blue-500 transition-transform", dosingOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ThrombolyticDoseCalculator />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default IVTManagementCombined;
