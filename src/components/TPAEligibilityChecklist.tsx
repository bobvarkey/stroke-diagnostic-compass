import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  Syringe,
  ShieldAlert,
  ShieldCheck,
  Info,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Criterion {
  id: string;
  label: string;
  description?: string;
  severity: "absolute" | "relative" | "inclusion";
}

const inclusionCriteria: Criterion[] = [
  { id: "inc_age", label: "Age ≥18 years", severity: "inclusion" },
  { id: "inc_diagnosis", label: "Clinical diagnosis of ischemic stroke with measurable neurological deficit", severity: "inclusion" },
  { id: "inc_time_3h", label: "Symptom onset within 3 hours (standard window)", description: "Time last known well to treatment", severity: "inclusion" },
  { id: "inc_time_4_5h", label: "OR Symptom onset within 3-4.5 hours (extended window)", description: "Additional criteria apply for extended window", severity: "inclusion" },
];

const absoluteContraindications: Criterion[] = [
  // Hemorrhage-related
  { id: "abs_ich_history", label: "History of intracranial hemorrhage", description: "Any prior ICH, including SAH", severity: "absolute" },
  { id: "abs_active_bleed", label: "Active internal bleeding", severity: "absolute" },
  { id: "abs_ich_ct", label: "CT shows hemorrhage or multilobar infarct (>1/3 hemisphere)", severity: "absolute" },
  { id: "abs_sah_suspected", label: "Suspected subarachnoid hemorrhage", severity: "absolute" },
  
  // Recent procedures/trauma
  { id: "abs_brain_surgery", label: "Intracranial/intraspinal surgery within 3 months", severity: "absolute" },
  { id: "abs_head_trauma", label: "Serious head trauma within 3 months", severity: "absolute" },
  { id: "abs_arterial_puncture", label: "Arterial puncture at noncompressible site within 7 days", severity: "absolute" },
  
  // Coagulation
  { id: "abs_anticoag", label: "Current anticoagulation with INR >1.7 or PT >15 seconds", severity: "absolute" },
  { id: "abs_heparin", label: "Heparin received within 48 hours with elevated aPTT", severity: "absolute" },
  { id: "abs_doac_48h", label: "DOAC use within 48 hours (or elevated drug levels)", description: "Includes dabigatran, rivaroxaban, apixaban, edoxaban", severity: "absolute" },
  { id: "abs_platelets", label: "Platelet count <100,000/mm³", severity: "absolute" },
  
  // Medical conditions
  { id: "abs_endocarditis", label: "Infective endocarditis", severity: "absolute" },
  { id: "abs_aortic_dissection", label: "Known or suspected aortic arch dissection", severity: "absolute" },
  { id: "abs_neoplasm", label: "Intracranial neoplasm (excluding meningioma)", severity: "absolute" },
  
  // Blood pressure
  { id: "abs_sbp", label: "Systolic BP >185 mmHg despite treatment", severity: "absolute" },
  { id: "abs_dbp", label: "Diastolic BP >110 mmHg despite treatment", severity: "absolute" },
  
  // Blood glucose
  { id: "abs_glucose_low", label: "Blood glucose <50 mg/dL", severity: "absolute" },
];

const relativeContraindications: Criterion[] = [
  // Extended window specific (3-4.5 hours)
  { id: "rel_age_80", label: "Age >80 years (for 3-4.5 hour window)", description: "Not a contraindication for 0-3 hour window", severity: "relative" },
  { id: "rel_severe_stroke", label: "Severe stroke (NIHSS >25)", severity: "relative" },
  { id: "rel_dm_prior_stroke", label: "Diabetes AND prior ischemic stroke (for 3-4.5 hour window)", severity: "relative" },
  { id: "rel_any_anticoag", label: "Any anticoagulant use regardless of INR (for 3-4.5 hour window)", severity: "relative" },
  
  // Recent events
  { id: "rel_major_surgery", label: "Major surgery or serious trauma within 14 days", severity: "relative" },
  { id: "rel_gi_gu_bleed", label: "GI or urinary tract hemorrhage within 21 days", severity: "relative" },
  { id: "rel_mi_3mo", label: "Recent acute MI within 3 months", severity: "relative" },
  { id: "rel_stroke_3mo", label: "Ischemic stroke within 3 months", severity: "relative" },
  
  // Medical conditions
  { id: "rel_seizure", label: "Seizure at stroke onset with postictal residual deficits", description: "Consider if deficits are due to stroke vs postictal", severity: "relative" },
  { id: "rel_pregnancy", label: "Pregnancy", description: "Weigh risk-benefit carefully; not absolute contraindication", severity: "relative" },
  { id: "rel_uncontrolled_htn", label: "History of uncontrolled hypertension", severity: "relative" },
  { id: "rel_gi_pathology", label: "Known GI malignancy or recent GI bleed", severity: "relative" },
  
  // Other considerations
  { id: "rel_minor_deficit", label: "Minor or rapidly improving stroke symptoms", description: "Consider if symptoms are disabling", severity: "relative" },
  { id: "rel_glucose_high", label: "Blood glucose >400 mg/dL", severity: "relative" },
  { id: "rel_lp_7days", label: "Lumbar puncture within 7 days", severity: "relative" },
  { id: "rel_dementia", label: "Dementia or poor baseline functional status", description: "Consider patient/family preferences", severity: "relative" },
];

type EligibilityStatus = "eligible" | "ineligible" | "caution" | "incomplete";

const TPAEligibilityChecklist: React.FC = () => {
  const [inclusionChecked, setInclusionChecked] = useState<Record<string, boolean>>({});
  const [absoluteChecked, setAbsoluteChecked] = useState<Record<string, boolean>>({});
  const [relativeChecked, setRelativeChecked] = useState<Record<string, boolean>>({});
  const [inclusionOpen, setInclusionOpen] = useState(true);
  const [absoluteOpen, setAbsoluteOpen] = useState(true);
  const [relativeOpen, setRelativeOpen] = useState(true);

  const toggleInclusion = (id: string) => {
    setInclusionChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAbsolute = (id: string) => {
    setAbsoluteChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRelative = (id: string) => {
    setRelativeChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const eligibilityAssessment = useMemo(() => {
    const inclusionMet = Object.values(inclusionChecked).filter(Boolean).length;
    const hasTimeWindow = inclusionChecked["inc_time_3h"] || inclusionChecked["inc_time_4_5h"];
    const hasBasicInclusion = inclusionChecked["inc_age"] && inclusionChecked["inc_diagnosis"];
    const absolutePresent = Object.entries(absoluteChecked).filter(([_, v]) => v).map(([k]) => k);
    const relativePresent = Object.entries(relativeChecked).filter(([_, v]) => v).map(([k]) => k);

    let status: EligibilityStatus = "incomplete";
    let message = "";
    let details: string[] = [];

    // Check for absolute contraindications first
    if (absolutePresent.length > 0) {
      status = "ineligible";
      message = "ABSOLUTE CONTRAINDICATION PRESENT - tPA NOT RECOMMENDED";
      details = absolutePresent.map(id => {
        const criterion = absoluteContraindications.find(c => c.id === id);
        return criterion?.label || id;
      });
    } else if (!hasBasicInclusion || !hasTimeWindow) {
      status = "incomplete";
      message = "Complete inclusion criteria assessment";
      if (!inclusionChecked["inc_age"]) details.push("Confirm age ≥18 years");
      if (!inclusionChecked["inc_diagnosis"]) details.push("Confirm ischemic stroke diagnosis");
      if (!hasTimeWindow) details.push("Confirm time window eligibility");
    } else if (relativePresent.length > 0) {
      status = "caution";
      message = "RELATIVE CONTRAINDICATION(S) PRESENT - Careful risk-benefit assessment needed";
      details = relativePresent.map(id => {
        const criterion = relativeContraindications.find(c => c.id === id);
        return criterion?.label || id;
      });
      
      // Extended window specific warnings
      if (inclusionChecked["inc_time_4_5h"] && !inclusionChecked["inc_time_3h"]) {
        const extendedWindowIssues = ["rel_age_80", "rel_dm_prior_stroke", "rel_any_anticoag"];
        const hasExtendedIssue = relativePresent.some(id => extendedWindowIssues.includes(id));
        if (hasExtendedIssue) {
          details.unshift("⚠️ Extended window (3-4.5h) contraindications present");
        }
      }
    } else if (hasBasicInclusion && hasTimeWindow) {
      status = "eligible";
      message = "Patient appears ELIGIBLE for IV tPA";
      if (inclusionChecked["inc_time_4_5h"] && !inclusionChecked["inc_time_3h"]) {
        details.push("Extended window (3-4.5h): Ensure no extended window contraindications");
      }
      details.push("Confirm BP controlled to <185/110 mmHg before administration");
      details.push("Standard dose: 0.9 mg/kg (max 90 mg), 10% bolus over 1 min, remainder over 60 min");
    }

    return { status, message, details, absolutePresent, relativePresent, inclusionMet };
  }, [inclusionChecked, absoluteChecked, relativeChecked]);

  const getStatusColor = (status: EligibilityStatus) => {
    switch (status) {
      case "eligible": return "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400";
      case "ineligible": return "bg-destructive/10 border-destructive/50 text-destructive";
      case "caution": return "bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400";
      default: return "bg-muted border-border text-muted-foreground";
    }
  };

  const getStatusIcon = (status: EligibilityStatus) => {
    switch (status) {
      case "eligible": return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "ineligible": return <XCircle className="h-6 w-6 text-destructive" />;
      case "caution": return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default: return <Info className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const CriterionItem: React.FC<{ 
    criterion: Criterion; 
    checked: boolean; 
    onToggle: () => void;
    type: "inclusion" | "absolute" | "relative";
  }> = ({ criterion, checked, onToggle, type }) => {
    const getBadgeVariant = () => {
      if (type === "inclusion") return checked ? "default" : "outline";
      if (type === "absolute") return checked ? "destructive" : "outline";
      return checked ? "secondary" : "outline";
    };

    return (
      <div 
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/50",
          type === "absolute" && checked && "bg-destructive/10 border-destructive/30",
          type === "relative" && checked && "bg-yellow-500/10 border-yellow-500/30",
          type === "inclusion" && checked && "bg-green-500/10 border-green-500/30",
          !checked && "bg-card border-border"
        )}
        onClick={onToggle}
      >
        <Checkbox 
          checked={checked} 
          onCheckedChange={onToggle}
          className={cn(
            "mt-0.5",
            type === "absolute" && checked && "border-destructive data-[state=checked]:bg-destructive",
            type === "relative" && checked && "border-yellow-500 data-[state=checked]:bg-yellow-500",
            type === "inclusion" && checked && "border-green-500 data-[state=checked]:bg-green-500"
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-sm font-medium leading-relaxed",
              checked && type === "absolute" && "text-destructive",
              checked && type === "relative" && "text-yellow-700 dark:text-yellow-400",
              checked && type === "inclusion" && "text-green-700 dark:text-green-400"
            )}>
              {criterion.label}
            </span>
          </div>
          {criterion.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {criterion.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Syringe className="h-5 w-5 text-primary" />
            IV tPA Eligibility Checklist
          </CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Door-to-Needle Target: ≤60 min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real-time Status Display */}
        <Alert className={cn("transition-all", getStatusColor(eligibilityAssessment.status))}>
          <div className="flex items-start gap-3">
            {getStatusIcon(eligibilityAssessment.status)}
            <div className="flex-1">
              <AlertTitle className="text-base font-semibold mb-1">
                {eligibilityAssessment.message}
              </AlertTitle>
              {eligibilityAssessment.details.length > 0 && (
                <AlertDescription>
                  <ul className="text-sm space-y-1 mt-2">
                    {eligibilityAssessment.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-current">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              )}
            </div>
          </div>
        </Alert>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <div className="text-xs">
              <span className="font-medium text-green-700 dark:text-green-400">
                {eligibilityAssessment.inclusionMet}/{inclusionCriteria.length}
              </span>
              <span className="text-muted-foreground ml-1">Inclusion</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <XCircle className="h-4 w-4 text-destructive" />
            <div className="text-xs">
              <span className="font-medium text-destructive">
                {eligibilityAssessment.absolutePresent.length}
              </span>
              <span className="text-muted-foreground ml-1">Absolute</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div className="text-xs">
              <span className="font-medium text-yellow-700 dark:text-yellow-400">
                {eligibilityAssessment.relativePresent.length}
              </span>
              <span className="text-muted-foreground ml-1">Relative</span>
            </div>
          </div>
        </div>

        {/* Inclusion Criteria */}
        <Collapsible open={inclusionOpen} onOpenChange={setInclusionOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">Inclusion Criteria</span>
              <Badge variant="outline" className="text-green-600 border-green-500/50">
                {Object.values(inclusionChecked).filter(Boolean).length}/{inclusionCriteria.length}
              </Badge>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-green-500 transition-transform",
              inclusionOpen && "rotate-180"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {inclusionCriteria.map(criterion => (
              <CriterionItem
                key={criterion.id}
                criterion={criterion}
                checked={inclusionChecked[criterion.id] || false}
                onToggle={() => toggleInclusion(criterion.id)}
                type="inclusion"
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Absolute Contraindications */}
        <Collapsible open={absoluteOpen} onOpenChange={setAbsoluteOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">Absolute Contraindications</span>
              {eligibilityAssessment.absolutePresent.length > 0 && (
                <Badge variant="destructive">
                  {eligibilityAssessment.absolutePresent.length} PRESENT
                </Badge>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-destructive transition-transform",
              absoluteOpen && "rotate-180"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            <p className="text-xs text-muted-foreground px-1 mb-2">
              <Zap className="h-3 w-3 inline mr-1" />
              Any checked item = tPA contraindicated
            </p>
            {absoluteContraindications.map(criterion => (
              <CriterionItem
                key={criterion.id}
                criterion={criterion}
                checked={absoluteChecked[criterion.id] || false}
                onToggle={() => toggleAbsolute(criterion.id)}
                type="absolute"
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Relative Contraindications */}
        <Collapsible open={relativeOpen} onOpenChange={setRelativeOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-yellow-700 dark:text-yellow-400">Relative Contraindications</span>
              {eligibilityAssessment.relativePresent.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                  {eligibilityAssessment.relativePresent.length} Present
                </Badge>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-yellow-500 transition-transform",
              relativeOpen && "rotate-180"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            <p className="text-xs text-muted-foreground px-1 mb-2">
              <Info className="h-3 w-3 inline mr-1" />
              Weigh risks vs benefits - may still be candidates with careful consideration
            </p>
            {relativeContraindications.map(criterion => (
              <CriterionItem
                key={criterion.id}
                criterion={criterion}
                checked={relativeChecked[criterion.id] || false}
                onToggle={() => toggleRelative(criterion.id)}
                type="relative"
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Quick Reference */}
        <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Quick Reference - IV Alteplase Dosing
          </h4>
          <div className="grid gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Dose</Badge>
              <span>0.9 mg/kg (maximum 90 mg)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Bolus</Badge>
              <span>10% of total dose IV push over 1 minute</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Infusion</Badge>
              <span>Remaining 90% IV infusion over 60 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">BP Target</Badge>
              <span>&lt;180/105 mmHg for 24 hours post-treatment</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Monitoring</Badge>
              <span>Neuro checks q15min × 2h, q30min × 6h, then q1h × 16h</span>
            </div>
          </div>
        </div>

        {/* Evidence Source */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Based on AHA/ASA 2019 Guidelines for Early Management of Acute Ischemic Stroke
        </p>
      </CardContent>
    </Card>
  );
};

export default TPAEligibilityChecklist;
