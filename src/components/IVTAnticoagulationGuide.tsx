import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldAlert, ChevronDown, AlertTriangle, Info, Pill, Syringe, 
  Clock, FlaskConical, BookOpen, Scale
} from "lucide-react";
import { cn } from "@/lib/utils";
import ModuleCommentBox from "./ModuleCommentBox";

const IVTAnticoagulationGuide: React.FC = () => {
  const [comment, setComment] = useState("");
  const [vkaOpen, setVkaOpen] = useState(true);
  const [doacOpen, setDoacOpen] = useState(true);
  const [dosingOpen, setDosingOpen] = useState(false);
  const [doacReversalOpen, setDoacReversalOpen] = useState(false);
  const [practicalOpen, setPracticalOpen] = useState(false);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            IVT in Anticoagulated Patients
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
              ESO + AHA/ASA 2026
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Summary Alert */}
        <Alert className="bg-destructive/10 border-destructive/50">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">Key Principle</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            Current ESO and AHA/ASA guidelines contraindicate routine IVT in acute ischemic stroke patients on 
            <strong> VKAs if INR &gt;1.7</strong>, or on <strong>DOACs within 48 hours</strong>, primarily due to bleeding risks. 
            <strong> Prioritize mechanical thrombectomy</strong> in eligible LVO cases.
          </AlertDescription>
        </Alert>

        {/* VKA Section */}
        <Collapsible open={vkaOpen} onOpenChange={setVkaOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-orange-700 dark:text-orange-400">VKA (Warfarin) Guidelines</span>
              <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-600">INR &gt;1.7 = Excluded</Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-orange-500 transition-transform", vkaOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            <div className="grid gap-3">
              {/* AHA/ASA */}
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600 text-primary-foreground text-xs">AHA/ASA</Badge>
                  <span className="text-sm font-medium">Absolute Exclusion</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✕</span>
                    <span>No reversal recommended solely for IVT eligibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span>Prioritize thrombectomy in eligible LVO cases</span>
                  </li>
                </ul>
              </div>

              {/* ESO */}
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-emerald-600 text-primary-foreground text-xs">ESO</Badge>
                  <span className="text-sm font-medium">Weak Allowance (Class IIb, Level C)</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">⚠</span>
                    <span>Reversal using <strong>4F-PCC (25–50 IU/kg IV)</strong> + <strong>Vitamin K (5–10 mg IV)</strong> to achieve INR ≤1.7 before IVT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>Based on pilot data (n=26): INR 1.3±0.2 at 5 min, no sICH post-IVT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">⚠</span>
                    <span>Lacks RCTs — feasibility demonstrated but not proven</span>
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* DOAC Section */}
        <Collapsible open={doacOpen} onOpenChange={setDoacOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-purple-700 dark:text-purple-400">DOAC/NOAC Guidelines</span>
              <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-600">&lt;48h = Excluded</Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-purple-500 transition-transform", doacOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium text-muted-foreground">Aspect</th>
                    <th className="text-left p-2 font-medium">
                      <Badge className="bg-blue-600 text-primary-foreground text-xs">AHA/ASA</Badge>
                    </th>
                    <th className="text-left p-2 font-medium">
                      <Badge className="bg-emerald-600 text-primary-foreground text-xs">ESO</Badge>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border/50">
                    <td className="p-2 font-medium">DOAC &lt;48h</td>
                    <td className="p-2 text-muted-foreground">Exclusion <strong>regardless of labs</strong></td>
                    <td className="p-2 text-muted-foreground">
                      Consider IVT if:<br />
                      • Anti-Xa &lt;0.5 U/mL (Xa inhibitors)<br />
                      • Thrombin time &lt;60s (dabigatran)<br />
                      <em className="text-xs">If tests available rapidly</em>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-2 font-medium">Reversal Agents</td>
                    <td className="p-2 text-muted-foreground">Not routinely endorsed pre-IVT</td>
                    <td className="p-2 text-muted-foreground">
                      May use andexanet alfa or idarucizumab if time allows, but <strong>not standard</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 4F-PCC Dosing Table */}
        <Collapsible open={dosingOpen} onOpenChange={setDosingOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-400">4F-PCC Dosing for VKA Reversal</span>
              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600">ESO Class IIb</Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-blue-500 transition-transform", dosingOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            {/* Dosing Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-2 font-medium">Baseline INR</th>
                    <th className="text-left p-2 font-medium">4F-PCC Dose (IU/kg)</th>
                    <th className="text-left p-2 font-medium">Example (70 kg)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border/50">
                    <td className="p-2 font-medium">&gt;1.3 to ≤1.9</td>
                    <td className="p-2">25 IU/kg</td>
                    <td className="p-2 text-muted-foreground">1,750 IU</td>
                  </tr>
                  <tr className="border-b border-border/50 bg-yellow-500/5">
                    <td className="p-2 font-medium">&gt;1.9 to ≤4</td>
                    <td className="p-2">35 IU/kg</td>
                    <td className="p-2 text-muted-foreground">2,450 IU</td>
                  </tr>
                  <tr className="border-b border-border/50 bg-destructive/5">
                    <td className="p-2 font-medium">&gt;4</td>
                    <td className="p-2">50 IU/kg</td>
                    <td className="p-2 text-muted-foreground">3,500 IU</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground italic px-1">Max weight cap: 100 kg for dosing calculations</p>

            {/* Administration Protocol */}
            <div className="p-3 rounded-lg border bg-muted/30">
              <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Administration Protocol
              </h5>
              <ol className="text-xs space-y-2 text-muted-foreground list-decimal list-inside">
                <li><strong>4F-PCC</strong> IV bolus over <strong>10 minutes</strong></li>
                <li><strong>Vitamin K 5–10 mg IV</strong> over 30 minutes (for sustained effect)</li>
                <li>Recheck INR <strong>15–30 minutes</strong> post-infusion</li>
                <li>If INR &gt;1.7 persists → repeat dose</li>
                <li>Initiate IVT promptly if stroke window allows</li>
              </ol>
            </div>

            {/* Pilot Data */}
            <Alert className="bg-blue-500/5 border-blue-500/30">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-sm">Pilot Evidence (n=26)</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Weight-based 4F-PCC + 10 mg vitamin K achieved <strong>INR 1.3±0.2 at 5 min</strong> with 
                <strong> no sICH post-IVT</strong>. Monitor for thrombosis; prioritize thrombectomy if eligible.
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        {/* DOAC Reversal Agents */}
        <Collapsible open={doacReversalOpen} onOpenChange={setDoacReversalOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-rose-500" />
              <span className="font-medium text-rose-700 dark:text-rose-400">DOAC Reversal Agents & Dosing</span>
              <Badge variant="outline" className="text-xs border-rose-500/50 text-rose-600">Investigational</Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-rose-500 transition-transform", doacReversalOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            <Alert className="bg-yellow-500/5 border-yellow-500/30">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-xs">
                DOAC reversal before IVT remains <strong>investigational</strong> and is not routinely recommended. 
                ESO weakly allows consideration (Class IIb) if reversal can be confirmed with drug-specific assays.
              </AlertDescription>
            </Alert>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-2 font-medium">DOAC Class</th>
                    <th className="text-left p-2 font-medium">Agent</th>
                    <th className="text-left p-2 font-medium">Dosing Protocol</th>
                    <th className="text-left p-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border/50">
                    <td className="p-2 font-medium">Dabigatran<br/><span className="text-xs text-muted-foreground">(thrombin inhibitor)</span></td>
                    <td className="p-2 font-medium text-emerald-600">Idarucizumab</td>
                    <td className="p-2 text-muted-foreground">
                      <strong>5 g IV</strong> (two 2.5 g/50 mL vials sequentially over 5–10 min)<br/>
                      Repeat 5 g if needed after 2–4h
                    </td>
                    <td className="p-2 text-muted-foreground">
                      Reverses in <strong>minutes</strong>; monitor with dTT. 
                      ESO endorses for urgent reversal if feasible.
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-2 font-medium">Xa Inhibitors<br/><span className="text-xs text-muted-foreground">(apixaban, rivaroxaban, edoxaban)</span></td>
                    <td className="p-2 font-medium text-blue-600">Andexanet Alfa</td>
                    <td className="p-2 text-muted-foreground">
                      <strong>Low dose:</strong> 400 mg bolus (30 mg/min) + 4 mg/min × 120 min<br/>
                      <strong>High dose:</strong> 800 mg bolus + 8 mg/min × 120 min
                    </td>
                    <td className="p-2 text-muted-foreground">
                      Effect in <strong>2–5 min</strong>, lasts ~2h. 
                      Use anti-Xa assay post-dose. Not standard for IVT.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Andexanet Dosing Selection */}
            <div className="p-3 rounded-lg border bg-muted/30">
              <h5 className="text-sm font-medium mb-2">Andexanet Alfa: Dose Selection</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded border bg-card">
                  <p className="font-medium text-blue-600 mb-1">Low Dose</p>
                  <ul className="text-muted-foreground space-y-0.5">
                    <li>• Rivaroxaban ≤10 mg</li>
                    <li>• Apixaban ≤5 mg</li>
                    <li>• Last dose &gt;8 hours ago</li>
                  </ul>
                </div>
                <div className="p-2 rounded border bg-card">
                  <p className="font-medium text-rose-600 mb-1">High Dose</p>
                  <ul className="text-muted-foreground space-y-0.5">
                    <li>• Rivaroxaban &gt;10 mg</li>
                    <li>• Apixaban &gt;5 mg</li>
                    <li>• Last dose ≤8 hours ago or unknown</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Practical Advice */}
        <Collapsible open={practicalOpen} onOpenChange={setPracticalOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">Practical Decision-Making</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-primary transition-transform", practicalOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            <div className="p-3 rounded-lg border bg-muted/30">
              <ol className="text-sm space-y-3 text-muted-foreground list-decimal list-inside">
                <li><strong>Confirm timing</strong> of last anticoagulant dose from patient/family/pharmacy</li>
                <li><strong>Obtain STAT labs:</strong> INR/PT, aPTT, platelet count, fibrinogen, drug-specific assays if available (anti-Xa, dTT)</li>
                <li><strong>Favor thrombectomy</strong> over IVT in eligible LVO cases regardless of anticoagulation status</li>
                <li><strong>If VKA with INR &gt;1.7:</strong> Consider 4F-PCC reversal per ESO protocol only if thrombectomy unavailable and high clinical benefit expected</li>
                <li><strong>If DOAC &lt;48h:</strong> Check drug-specific levels urgently; consider IVT only if levels undetectable/below threshold (ESO)</li>
                <li><strong>Consult hematology</strong> urgently if reversal pursued</li>
              </ol>
            </div>

            <Alert className="bg-primary/5 border-primary/30">
              <BookOpen className="h-4 w-4 text-primary" />
              <AlertTitle className="text-sm">Emerging Evidence</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Registry data suggest safety in select low-risk scenarios (e.g., dabigatran + idarucizumab with no excess sICH). 
                Prospective trials like <strong>PAUSE-IVT</strong> are awaited. Individualize based on local expertise and 
                agent availability.
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        {/* Sources */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground transition-colors font-medium">
            📚 Key References (ESO, AHA/ASA, Landmark Studies)
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            <li>• ESO Guidelines on IVT for Acute Ischaemic Stroke (2021) — PMC7995316</li>
            <li>• AHA/ASA 2019/2026 Guidelines for Early Management of AIS</li>
            <li>• ESO Guideline on Reversal of Oral Anticoagulants — PMC6921939</li>
            <li>• Reversal of VKA Before Thrombolysis — Stroke 2018 (STROKEAHA.118.020890)</li>
            <li>• Thrombolysis Despite DOAC — SVN 2024 (svn-2023-002727)</li>
            <li>• Intravenous Thrombolysis on DOACs — PMC12909014</li>
          </ul>
        </details>

        <p className="text-xs text-muted-foreground text-center pt-1">
          Based on ESO 2021 IVT Guidelines, AHA/ASA 2026 AIS Guidelines, and ESO Anticoagulant Reversal Guidelines
        </p>

        <ModuleCommentBox
          value={comment}
          onChange={setComment}
          placeholder="Add notes about anticoagulation status, reversal decisions, or IVT eligibility rationale..."
          label="Anticoagulation & IVT Notes"
        />
      </CardContent>
    </Card>
  );
};

export default IVTAnticoagulationGuide;
