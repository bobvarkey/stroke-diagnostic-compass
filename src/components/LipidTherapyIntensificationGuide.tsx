import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";

interface RiskFactor {
  id: string;
  label: string;
  category: "ascvd" | "diabetes" | "cac" | "fh" | "other";
  riskLevel: "extreme" | "veryHigh" | "high" | "moderate";
}

const riskFactors: RiskFactor[] = [
  // Extreme Risk B
  { id: "recurrent_acs", label: "Recurrent ACS despite optimal therapy", category: "ascvd", riskLevel: "extreme" },
  { id: "polyvascular", label: "Polyvascular disease (ASCVD in ≥2 territories)", category: "ascvd", riskLevel: "extreme" },
  { id: "hefh_ascvd", label: "HeFH with ASCVD", category: "fh", riskLevel: "extreme" },
  { id: "hofh_ascvd", label: "HoFH with ASCVD", category: "fh", riskLevel: "extreme" },
  
  // Extreme Risk A
  { id: "ascvd_dm_tod", label: "ASCVD + DM with target organ damage", category: "ascvd", riskLevel: "extreme" },
  { id: "cac_300", label: "CAC score >300", category: "cac", riskLevel: "extreme" },
  { id: "hofh_no_ascvd", label: "HoFH without ASCVD", category: "fh", riskLevel: "extreme" },
  
  // Very High Risk
  { id: "ascvd_any", label: "Any clinical ASCVD (prior MI, stroke, PAD)", category: "ascvd", riskLevel: "veryHigh" },
  { id: "subclinical_athero", label: "Subclinical atherosclerosis (plaque on imaging)", category: "ascvd", riskLevel: "veryHigh" },
  { id: "dm_tod", label: "DM + Target organ damage", category: "diabetes", riskLevel: "veryHigh" },
  { id: "dm_major_rf", label: "DM + ≥2 major ASCVD risk factors", category: "diabetes", riskLevel: "veryHigh" },
  { id: "hefh_no_ascvd", label: "HeFH without ASCVD", category: "fh", riskLevel: "veryHigh" },
  { id: "cac_100_299", label: "CAC score 100-299 or >75th percentile", category: "cac", riskLevel: "veryHigh" },
  
  // High Risk
  { id: "dm_simple", label: "Diabetes mellitus (uncomplicated)", category: "diabetes", riskLevel: "high" },
  { id: "fh_premature", label: "Family history of premature CAD", category: "other", riskLevel: "high" },
  { id: "nafld_fib", label: "NAFLD with fibrosis (grade II/III)", category: "other", riskLevel: "high" },
  { id: "mets", label: "Metabolic syndrome", category: "other", riskLevel: "high" },
  { id: "ckd_3b_4", label: "CKD stage 3b or 4", category: "other", riskLevel: "high" },
  { id: "apob_130", label: "ApoB >130 mg/dL", category: "other", riskLevel: "high" },
  { id: "lpa_50", label: "Lp(a) ≥50 mg/dL", category: "other", riskLevel: "high" },
  { id: "cac_1_99", label: "CAC 1-99 (<75th percentile)", category: "cac", riskLevel: "high" },
  
  // Moderate Risk
  { id: "hypertension", label: "Hypertension", category: "other", riskLevel: "moderate" },
  { id: "smoking", label: "Current smoking", category: "other", riskLevel: "moderate" },
  { id: "obesity", label: "Obesity (BMI >30)", category: "other", riskLevel: "moderate" },
  { id: "sedentary", label: "Sedentary lifestyle", category: "other", riskLevel: "moderate" },
];

const LipidTherapyIntensificationGuide: React.FC = () => {
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [currentLDL, setCurrentLDL] = useState<string>("");
  const [currentTherapy, setCurrentTherapy] = useState<string>("none");

  const toggleFactor = (id: string) => {
    setSelectedFactors(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Determine risk level based on selected factors
  const calculateRiskLevel = (): "extreme" | "veryHigh" | "high" | "moderate" | "low" => {
    const selectedRiskLevels = selectedFactors.map(id => 
      riskFactors.find(f => f.id === id)?.riskLevel
    );
    
    if (selectedRiskLevels.includes("extreme")) return "extreme";
    if (selectedRiskLevels.includes("veryHigh")) return "veryHigh";
    if (selectedRiskLevels.includes("high")) return "high";
    if (selectedRiskLevels.length > 0) return "moderate";
    return "low";
  };

  const riskLevel = calculateRiskLevel();

  const getLDLTarget = () => {
    switch (riskLevel) {
      case "extreme": return { target: "<30", optional: null, color: "bg-red-600 dark:bg-red-700" };
      case "veryHigh": return { target: "<50", optional: "30", color: "bg-orange-500 dark:bg-orange-600" };
      case "high": return { target: "<70", optional: null, color: "bg-yellow-500 dark:bg-yellow-600" };
      case "moderate": return { target: "<100", optional: null, color: "bg-blue-500 dark:bg-blue-600" };
      default: return { target: "<130", optional: null, color: "bg-green-500 dark:bg-green-600" };
    }
  };

  const getTherapyRecommendation = () => {
    const ldl = parseInt(currentLDL) || 200;
    const target = parseInt(getLDLTarget().target.replace("<", ""));
    const gap = ldl - target;

    if (currentTherapy === "none") {
      if (gap > 100) {
        return {
          step: 1,
          recommendation: "Start high-intensity statin + Ezetimibe",
          details: "LDL reduction needed: >50%. Start combination therapy immediately.",
          nextStep: "If not at goal in 4-6 weeks, add PCSK9 inhibitor"
        };
      } else if (gap > 50) {
        return {
          step: 1,
          recommendation: "Start high-intensity statin",
          details: "Atorvastatin 40-80mg or Rosuvastatin 20-40mg",
          nextStep: "Add Ezetimibe if not at goal in 4-6 weeks"
        };
      } else {
        return {
          step: 1,
          recommendation: "Start moderate-intensity statin",
          details: "Atorvastatin 10-20mg or Rosuvastatin 5-10mg",
          nextStep: "Uptitrate if not at goal"
        };
      }
    } else if (currentTherapy === "statin") {
      return {
        step: 2,
        recommendation: "Add Ezetimibe 10mg",
        details: "Expected additional LDL reduction: 15-20%",
        nextStep: "If still not at goal, add PCSK9 inhibitor"
      };
    } else if (currentTherapy === "statin_eze") {
      return {
        step: 3,
        recommendation: "Add PCSK9 Inhibitor",
        details: "Evolocumab 140mg q2w or Alirocumab 75-150mg q2w. Expected LDL reduction: 50-60%",
        nextStep: "Consider Inclisiran for sustained reduction"
      };
    } else if (currentTherapy === "statin_eze_pcsk9") {
      return {
        step: 4,
        recommendation: "Consider Inclisiran or Bempedoic Acid",
        details: "Inclisiran 300mg q6mo (after loading). Bempedoic Acid 180mg daily if statin intolerant.",
        nextStep: "LDL apheresis if HoFH or refractory"
      };
    }
    return { step: 0, recommendation: "", details: "", nextStep: "" };
  };

  const ldlTarget = getLDLTarget();
  const therapy = getTherapyRecommendation();

  const getRiskLevelLabel = () => {
    switch (riskLevel) {
      case "extreme": return "Extreme Risk";
      case "veryHigh": return "Very High Risk";
      case "high": return "High Risk";
      case "moderate": return "Moderate Risk";
      default: return "Low Risk";
    }
  };

  return (
    <Card className="w-full border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <TrendingDown className="h-5 w-5" />
          Lipid Therapy Intensification Guide (LAI 2024)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Risk Factor Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Step 1: Select Risk Factors</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Extreme & Very High Risk */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Extreme/Very High Risk Conditions</h4>
              {riskFactors
                .filter(f => f.riskLevel === "extreme" || f.riskLevel === "veryHigh")
                .map(factor => (
                  <div key={factor.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor.id}
                      checked={selectedFactors.includes(factor.id)}
                      onCheckedChange={() => toggleFactor(factor.id)}
                    />
                    <Label htmlFor={factor.id} className="text-sm cursor-pointer">
                      {factor.label}
                    </Label>
                    <Badge variant="outline" className={`text-xs ${
                      factor.riskLevel === "extreme" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"
                    }`}>
                      {factor.riskLevel === "extreme" ? "Extreme" : "Very High"}
                    </Badge>
                  </div>
                ))}
            </div>

            {/* High & Moderate Risk */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">High/Moderate Risk Factors</h4>
              {riskFactors
                .filter(f => f.riskLevel === "high" || f.riskLevel === "moderate")
                .map(factor => (
                  <div key={factor.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor.id}
                      checked={selectedFactors.includes(factor.id)}
                      onCheckedChange={() => toggleFactor(factor.id)}
                    />
                    <Label htmlFor={factor.id} className="text-sm cursor-pointer">
                      {factor.label}
                    </Label>
                    <Badge variant="outline" className={`text-xs ${
                      factor.riskLevel === "high" ? "border-yellow-500 text-yellow-600" : "border-blue-500 text-blue-600"
                    }`}>
                      {factor.riskLevel === "high" ? "High" : "Moderate"}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Risk Stratification Result */}
        <div className={`p-4 rounded-lg ${ldlTarget.color} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg">{getRiskLevelLabel()}</h4>
              <p className="text-sm opacity-90">
                LDL-C Target: {ldlTarget.target} mg/dL
                {ldlTarget.optional && ` (Optional: <${ldlTarget.optional} mg/dL)`}
              </p>
            </div>
            {riskLevel === "extreme" && (
              <AlertTriangle className="h-8 w-8" />
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Current LDL-C (mg/dL)</Label>
            <input
              type="number"
              value={currentLDL}
              onChange={(e) => setCurrentLDL(e.target.value)}
              placeholder="Enter current LDL-C"
              className="mt-1 w-full px-3 py-2 border rounded-md bg-background text-foreground border-input"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Current Therapy</Label>
            <Select value={currentTherapy} onValueChange={setCurrentTherapy}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select current therapy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No lipid therapy</SelectItem>
                <SelectItem value="statin">Statin only</SelectItem>
                <SelectItem value="statin_eze">Statin + Ezetimibe</SelectItem>
                <SelectItem value="statin_eze_pcsk9">Statin + Ezetimibe + PCSK9i</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Therapy Escalation Pathway */}
        {currentLDL && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 2: Therapy Escalation</h3>
            
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {therapy.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{therapy.recommendation}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{therapy.details}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                    <ArrowRight className="h-4 w-4" />
                    <span>{therapy.nextStep}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Escalation Pathway */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-3">Complete Escalation Pathway</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className={`px-3 py-2 rounded-md ${currentTherapy === "none" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  High-Intensity Statin
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className={`px-3 py-2 rounded-md ${currentTherapy === "statin" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  + Ezetimibe
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className={`px-3 py-2 rounded-md ${currentTherapy === "statin_eze" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  + PCSK9 Inhibitor
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className={`px-3 py-2 rounded-md ${currentTherapy === "statin_eze_pcsk9" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  Inclisiran / Bempedoic Acid
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expected LDL Reduction Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Therapy</th>
                <th className="text-center p-3 font-medium">Expected LDL Reduction</th>
                <th className="text-left p-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3">High-intensity statin</td>
                <td className="p-3 text-center font-semibold text-green-600">50-55%</td>
                <td className="p-3 text-muted-foreground">First-line therapy</td>
              </tr>
              <tr>
                <td className="p-3">+ Ezetimibe 10mg</td>
                <td className="p-3 text-center font-semibold text-green-600">+15-20%</td>
                <td className="p-3 text-muted-foreground">Blocks intestinal absorption</td>
              </tr>
              <tr>
                <td className="p-3">+ PCSK9 inhibitor</td>
                <td className="p-3 text-center font-semibold text-green-600">+50-60%</td>
                <td className="p-3 text-muted-foreground">Evolocumab, Alirocumab</td>
              </tr>
              <tr>
                <td className="p-3">Inclisiran</td>
                <td className="p-3 text-center font-semibold text-green-600">50-52%</td>
                <td className="p-3 text-muted-foreground">siRNA, twice yearly dosing</td>
              </tr>
              <tr>
                <td className="p-3">Bempedoic Acid</td>
                <td className="p-3 text-center font-semibold text-green-600">18-25%</td>
                <td className="p-3 text-muted-foreground">For statin-intolerant patients</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Timeline Guidance */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            LAI Timeline Recommendations
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
            <li>• <strong>ACS patients:</strong> Check lipids at ER triage, start statin + ezetimibe immediately</li>
            <li>• <strong>Reassess:</strong> Repeat lipid panel in 2 weeks, then every 4-6 weeks until at goal</li>
            <li>• <strong>Target achievement:</strong> Aim to reach LDL goal by Week 4 (ACS) or Week 12 (stable)</li>
            <li>• <strong>Intensify every 2 weeks</strong> if not at goal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LipidTherapyIntensificationGuide;
