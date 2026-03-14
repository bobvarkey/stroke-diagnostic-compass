import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Zap, Brain, Clock, ArrowRight, CheckCircle2, XCircle, AlertTriangle, 
  Syringe, Target, Activity, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import ModuleCommentBox from "./ModuleCommentBox";

interface PatientInputs {
  nihss: string;
  timeFromLKW: string; // in minutes
  age: string;
  weight: string;
  lvoPresent: "yes" | "no" | "unknown";
  aspects: string;
  onAnticoagulation: "none" | "vka" | "doac";
  inr: string;
  bpControlled: "yes" | "no" | "unknown";
  premorbidMRS: string;
}

type Pathway = "ivt_only" | "ivt_evt" | "evt_only" | "medical" | "assess_further";

interface Recommendation {
  pathway: Pathway;
  title: string;
  urgency: "immediate" | "urgent" | "standard";
  rationale: string[];
  actions: string[];
  warnings: string[];
  tpaDose?: { bolus: string; infusion: string; total: string };
}

const StrokeTreatmentRecommender: React.FC = () => {
  const [inputs, setInputs] = useState<PatientInputs>({
    nihss: "",
    timeFromLKW: "",
    age: "",
    weight: "",
    lvoPresent: "unknown",
    aspects: "",
    onAnticoagulation: "none",
    inr: "",
    bpControlled: "unknown",
    premorbidMRS: "",
  });
  const [comment, setComment] = useState("");

  const updateInput = (key: keyof PatientInputs, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const recommendation = useMemo((): Recommendation | null => {
    const nihss = parseInt(inputs.nihss);
    const timeMin = parseInt(inputs.timeFromLKW);
    const age = parseInt(inputs.age);
    const weight = parseFloat(inputs.weight);
    const aspects = parseInt(inputs.aspects);
    const inr = parseFloat(inputs.inr);
    const mrs = parseInt(inputs.premorbidMRS);

    if (isNaN(nihss) || isNaN(timeMin)) return null;

    const timeHours = timeMin / 60;
    const rationale: string[] = [];
    const actions: string[] = [];
    const warnings: string[] = [];
    let pathway: Pathway = "assess_further";
    let title = "";
    let urgency: "immediate" | "urgent" | "standard" = "standard";

    // Determine IVT eligibility
    let ivtEligible = true;
    let ivtWindow = false;

    if (timeHours <= 3) {
      ivtWindow = true;
      rationale.push(`Within 3-hour IVT window (${timeHours.toFixed(1)}h from LKW)`);
    } else if (timeHours <= 4.5) {
      ivtWindow = true;
      rationale.push(`Within extended 3–4.5h IVT window (${timeHours.toFixed(1)}h from LKW)`);
      if (!isNaN(age) && age > 80) {
        warnings.push("Age >80: Relative contraindication in extended window (3–4.5h)");
      }
    } else {
      ivtWindow = false;
      rationale.push(`Outside IVT window (${timeHours.toFixed(1)}h from LKW)`);
    }

    // Anticoagulation check
    if (inputs.onAnticoagulation === "vka") {
      if (!isNaN(inr) && inr > 1.7) {
        ivtEligible = false;
        warnings.push(`VKA with INR ${inr} (>1.7) — IVT contraindicated. Consider ESO 4F-PCC reversal protocol if thrombectomy unavailable.`);
      } else if (!isNaN(inr) && inr <= 1.7) {
        rationale.push(`VKA with INR ${inr} (≤1.7) — IVT may proceed`);
      }
    } else if (inputs.onAnticoagulation === "doac") {
      ivtEligible = false;
      warnings.push("DOAC use — IVT contraindicated per AHA/ASA. Consider drug-specific assays (ESO) or prioritize thrombectomy.");
    }

    if (inputs.bpControlled === "no") {
      warnings.push("BP not controlled to <185/110 mmHg — IVT contraindicated until controlled");
    }

    // Determine EVT eligibility
    let evtEligible = false;
    if (inputs.lvoPresent === "yes") {
      if (timeHours <= 6) {
        evtEligible = true;
        rationale.push("LVO present within 6-hour EVT window");
      } else if (timeHours <= 24) {
        if (!isNaN(aspects) && aspects >= 6) {
          evtEligible = true;
          rationale.push(`LVO present, ASPECTS ≥6 (${aspects}), within 6–24h extended EVT window (DAWN/DEFUSE 3 criteria)`);
        } else if (!isNaN(aspects) && aspects >= 3) {
          evtEligible = true;
          rationale.push(`LVO present, ASPECTS ${aspects} (≥3), consider EVT per 3-6-24 rule with perfusion imaging`);
          warnings.push("ASPECTS 3-5: Emerging evidence — requires perfusion mismatch confirmation");
        } else {
          rationale.push("LVO present but ASPECTS may be too low for late-window EVT");
        }
      }
      if (!isNaN(mrs) && mrs > 2) {
        warnings.push(`Pre-morbid mRS ${mrs} (>2) — reduced benefit from EVT per trial data; consider goals of care`);
      }
    }

    // NIHSS considerations
    if (nihss <= 5) {
      rationale.push(`Low NIHSS (${nihss}) — assess if deficits are clearly disabling (BATHE criteria)`);
      if (nihss <= 5 && inputs.lvoPresent !== "yes") {
        warnings.push("Low NIHSS without LVO: Weigh IVT risk-benefit carefully. Consider if deficits are disabling.");
      }
    } else if (nihss >= 6 && nihss <= 25) {
      rationale.push(`Moderate-severe NIHSS (${nihss}) — standard IVT/EVT indications apply`);
    } else if (nihss > 25) {
      rationale.push(`Very severe NIHSS (${nihss}) — relative contraindication for extended window IVT`);
      warnings.push("NIHSS >25 is a relative contraindication in extended (3–4.5h) window");
    }

    // Determine pathway
    if (ivtWindow && ivtEligible && evtEligible) {
      pathway = "ivt_evt";
      title = "IV THROMBOLYSIS + THROMBECTOMY (Bridging Therapy)";
      urgency = "immediate";
      actions.push("Initiate IVT immediately — do NOT delay for EVT");
      actions.push("Activate neurointerventional team simultaneously");
      actions.push("Transfer to angio suite during IVT infusion");
      if (nihss >= 6) actions.push(`NIHSS ${nihss} ≥6 with LVO — meets 3-6-24 criteria for EVT`);
    } else if (!ivtWindow && evtEligible) {
      pathway = "evt_only";
      title = "THROMBECTOMY ONLY (Direct to EVT)";
      urgency = "immediate";
      actions.push("Outside IVT window — proceed directly to mechanical thrombectomy");
      actions.push("Obtain CT perfusion if 6–24h window");
    } else if (ivtWindow && ivtEligible && !evtEligible && inputs.lvoPresent !== "yes") {
      pathway = "ivt_only";
      title = "IV THROMBOLYSIS ONLY";
      urgency = "immediate";
      actions.push("Initiate IVT as soon as possible");
      actions.push("Monitor for neurological improvement");
      if (inputs.lvoPresent === "unknown") {
        actions.push("Obtain CTA to rule out LVO — if LVO found, activate EVT");
      }
    } else if (!ivtEligible && evtEligible) {
      pathway = "evt_only";
      title = "THROMBECTOMY ONLY (IVT Contraindicated)";
      urgency = "immediate";
      actions.push("IVT contraindicated — proceed directly to EVT");
    } else if (!ivtWindow && !evtEligible) {
      pathway = "medical";
      title = "MEDICAL MANAGEMENT";
      urgency = "standard";
      actions.push("Outside treatment windows for IVT and EVT");
      actions.push("Initiate secondary prevention per guidelines");
      actions.push("Antiplatelet therapy per CHANCE-2/POINT protocol if applicable");
      actions.push("Admit to stroke unit for monitoring");
    } else {
      pathway = "assess_further";
      title = "FURTHER ASSESSMENT NEEDED";
      urgency = "urgent";
      actions.push("Obtain CTA/CTP to determine LVO status and salvageable tissue");
      if (ivtWindow && ivtEligible) actions.push("Consider starting IVT while awaiting imaging if no contraindications");
    }

    // tPA dosing if applicable
    let tpaDose;
    if ((pathway === "ivt_only" || pathway === "ivt_evt") && !isNaN(weight) && weight > 0) {
      const cappedWeight = Math.min(weight, 100); // max 90mg
      const totalDose = Math.min(cappedWeight * 0.9, 90);
      const bolus = totalDose * 0.1;
      const infusion = totalDose * 0.9;
      tpaDose = {
        total: `${totalDose.toFixed(1)} mg`,
        bolus: `${bolus.toFixed(1)} mg IV push over 1 min`,
        infusion: `${infusion.toFixed(1)} mg IV infusion over 60 min`,
      };
    }

    return { pathway, title, urgency, rationale, actions, warnings, tpaDose };
  }, [inputs]);

  const getPathwayColor = (pathway: Pathway) => {
    switch (pathway) {
      case "ivt_evt": return "bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400";
      case "ivt_only": return "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400";
      case "evt_only": return "bg-purple-500/10 border-purple-500/50 text-purple-700 dark:text-purple-400";
      case "medical": return "bg-muted border-border text-foreground";
      default: return "bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400";
    }
  };

  const getPathwayIcon = (pathway: Pathway) => {
    switch (pathway) {
      case "ivt_evt": return <Zap className="h-6 w-6 text-blue-500" />;
      case "ivt_only": return <Syringe className="h-6 w-6 text-green-500" />;
      case "evt_only": return <Target className="h-6 w-6 text-purple-500" />;
      case "medical": return <Activity className="h-6 w-6 text-muted-foreground" />;
      default: return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "immediate": return <Badge variant="destructive" className="animate-pulse">IMMEDIATE</Badge>;
      case "urgent": return <Badge className="bg-yellow-500 text-white">URGENT</Badge>;
      default: return <Badge variant="secondary">STANDARD</Badge>;
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Stroke Treatment Pathway Recommender
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Enter patient data to generate evidence-based treatment recommendations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patient Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs font-medium">NIHSS Score *</Label>
            <Input
              type="number" min="0" max="42"
              value={inputs.nihss}
              onChange={e => updateInput("nihss", e.target.value)}
              placeholder="0-42"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Time from LKW (min) *</Label>
            <Input
              type="number" min="0"
              value={inputs.timeFromLKW}
              onChange={e => updateInput("timeFromLKW", e.target.value)}
              placeholder="e.g. 120"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Age (years)</Label>
            <Input
              type="number" min="0" max="120"
              value={inputs.age}
              onChange={e => updateInput("age", e.target.value)}
              placeholder="Age"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Weight (kg)</Label>
            <Input
              type="number" min="0" max="300"
              value={inputs.weight}
              onChange={e => updateInput("weight", e.target.value)}
              placeholder="For tPA dosing"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">ASPECTS</Label>
            <Input
              type="number" min="0" max="10"
              value={inputs.aspects}
              onChange={e => updateInput("aspects", e.target.value)}
              placeholder="0-10"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Pre-morbid mRS</Label>
            <Input
              type="number" min="0" max="5"
              value={inputs.premorbidMRS}
              onChange={e => updateInput("premorbidMRS", e.target.value)}
              placeholder="0-5"
              className="mt-1 h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs font-medium">LVO Present?</Label>
            <Select value={inputs.lvoPresent} onValueChange={v => updateInput("lvoPresent", v)}>
              <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Unknown / Pending CTA</SelectItem>
                <SelectItem value="yes">Yes — LVO confirmed</SelectItem>
                <SelectItem value="no">No — No LVO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">Anticoagulation</Label>
            <Select value={inputs.onAnticoagulation} onValueChange={v => updateInput("onAnticoagulation", v)}>
              <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="vka">VKA (Warfarin)</SelectItem>
                <SelectItem value="doac">DOAC (Apixaban, Rivaroxaban, etc.)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">BP Controlled &lt;185/110?</Label>
            <Select value={inputs.bpControlled} onValueChange={v => updateInput("bpControlled", v)}>
              <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Unknown</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {inputs.onAnticoagulation === "vka" && (
          <div className="max-w-[200px]">
            <Label className="text-xs font-medium">INR Value</Label>
            <Input
              type="number" min="0" max="20" step="0.1"
              value={inputs.inr}
              onChange={e => updateInput("inr", e.target.value)}
              placeholder="e.g. 2.5"
              className="mt-1 h-9"
            />
          </div>
        )}

        {/* Recommendation Output */}
        {recommendation && (
          <div className="space-y-3 mt-4">
            <Alert className={cn("transition-all", getPathwayColor(recommendation.pathway))}>
              <div className="flex items-start gap-3">
                {getPathwayIcon(recommendation.pathway)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <AlertTitle className="text-base font-bold">
                      {recommendation.title}
                    </AlertTitle>
                    {getUrgencyBadge(recommendation.urgency)}
                  </div>
                </div>
              </div>
            </Alert>

            {/* Rationale */}
            {recommendation.rationale.length > 0 && (
              <div className="p-3 rounded-lg border bg-muted/30">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" /> Clinical Rationale
                </h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {recommendation.rationale.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            {recommendation.actions.length > 0 && (
              <div className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" /> Recommended Actions
                </h5>
                <ol className="text-xs space-y-1 text-muted-foreground list-decimal list-inside">
                  {recommendation.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Warnings */}
            {recommendation.warnings.length > 0 && (
              <div className="p-3 rounded-lg border bg-yellow-500/5 border-yellow-500/20">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <AlertTriangle className="h-4 w-4" /> Warnings & Considerations
                </h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {recommendation.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">⚠</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* tPA Dosing */}
            {recommendation.tpaDose && (
              <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-primary" /> Calculated tPA Dosing
                </h5>
                <div className="grid gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs min-w-[60px]">Total</Badge>
                    <span className="font-semibold">{recommendation.tpaDose.total}</span>
                    <span className="text-muted-foreground">(0.9 mg/kg, max 90 mg)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs min-w-[60px]">Bolus</Badge>
                    <span>{recommendation.tpaDose.bolus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs min-w-[60px]">Infusion</Badge>
                    <span>{recommendation.tpaDose.infusion}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!recommendation && (
          <div className="p-6 text-center text-muted-foreground border border-dashed rounded-lg">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enter at minimum <strong>NIHSS</strong> and <strong>Time from LKW</strong> to generate recommendations</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-1">
          Decision support tool — does not replace clinical judgment. Based on AHA/ASA 2026, ESO 2021, DAWN, DEFUSE 3 criteria.
        </p>

        <ModuleCommentBox
          value={comment}
          onChange={setComment}
          placeholder="Document treatment pathway decision rationale, team discussion, or patient/family preferences..."
          label="Treatment Decision Notes"
        />
      </CardContent>
    </Card>
  );
};

export default StrokeTreatmentRecommender;
