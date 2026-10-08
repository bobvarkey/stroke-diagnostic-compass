import { useState } from "react";
import { Calculator, TestTube, Info } from "lucide-react";
import CollapsibleModule from "./CollapsibleModule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabColor } from "@/lib/tabColors";
import PRIMEToolCalculator from "./PRIMEToolCalculator";
import DDimerStrokeModule, { type Occult5State } from "./DDimerStrokeModule";

interface Props {
  onOccult5Change?: (st: Occult5State) => void;
}

/**
 * Combined cancer-related stroke risk module:
 * PRIME (predicting ischemic stroke risk in known malignancy) + OCCULT-5
 * (occult malignancy suspicion from D-dimer etc.) in one collapsible section.
 */
const CancerStrokeRiskModule = ({ onOccult5Change }: Props) => {
  const [tab, setTab] = useState("prime");

  return (
    <CollapsibleModule
      title="Cancer & Stroke Risk — PRIME + OCCULT-5"
      icon={<Calculator className="h-5 w-5 text-rose-500" />}
      defaultOpen={false}
    >
      <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        PRIME estimates ischemic stroke risk in patients with known active cancer; OCCULT-5 flags suspicion of occult (undiscovered) malignancy after stroke. They answer different questions — use the tab that fits the patient.
      </p>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/60 flex-wrap h-auto gap-1">
          <TabsTrigger value="prime" className={tabColor("rose")}>PRIME — Known Cancer</TabsTrigger>
          <TabsTrigger value="occult5" className={tabColor("amber")}>OCCULT-5 — Occult Cancer</TabsTrigger>
        </TabsList>
        <TabsContent value="prime" className="mt-3">
          <PRIMEToolCalculator embedded />
        </TabsContent>
        <TabsContent value="occult5" className="mt-3">
          <DDimerStrokeModule embedded onScoreChange={onOccult5Change} />
        </TabsContent>
      </Tabs>
    </CollapsibleModule>
  );
};

export default CancerStrokeRiskModule;
