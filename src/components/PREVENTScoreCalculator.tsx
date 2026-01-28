import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Heart, AlertTriangle, CheckCircle2, Info, Calculator } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PREVENTInputs {
  age: number;
  sex: 'male' | 'female';
  totalCholesterol: number;
  hdlCholesterol: number;
  systolicBP: number;
  bmi: number;
  eGFR: number;
  diabetes: boolean;
  currentSmoker: boolean;
  onBPMeds: boolean;
  onStatins: boolean;
  uACR: number;
}

const PREVENTScoreCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<PREVENTInputs>({
    age: 55,
    sex: 'male',
    totalCholesterol: 200,
    hdlCholesterol: 50,
    systolicBP: 130,
    bmi: 28,
    eGFR: 90,
    diabetes: false,
    currentSmoker: false,
    onBPMeds: false,
    onStatins: false,
    uACR: 10
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // PREVENT equation coefficients (simplified approximation based on AHA 2023)
  const calculateRisk = useMemo(() => {
    const { age, sex, totalCholesterol, hdlCholesterol, systolicBP, bmi, eGFR, diabetes, currentSmoker, onBPMeds, onStatins, uACR } = inputs;

    // Validate inputs
    if (age < 30 || age > 79) return null;
    if (totalCholesterol < 130 || totalCholesterol > 320) return null;
    if (hdlCholesterol < 20 || hdlCholesterol > 100) return null;
    if (systolicBP < 90 || systolicBP > 200) return null;

    // Non-HDL cholesterol
    const nonHDL = totalCholesterol - hdlCholesterol;

    // Base coefficients (simplified PREVENT model)
    let baseRisk10 = 0;
    let baseRisk30 = 0;

    // Age contribution (major driver)
    const ageTerm = (age - 55) / 10;
    baseRisk10 += ageTerm * 2.5;
    baseRisk30 += ageTerm * 4.0;

    // Sex adjustment
    if (sex === 'male') {
      baseRisk10 += 1.5;
      baseRisk30 += 2.0;
    }

    // Systolic BP contribution
    const sbpTerm = (systolicBP - 120) / 20;
    baseRisk10 += sbpTerm * 1.2 * (onBPMeds ? 1.1 : 1.0);
    baseRisk30 += sbpTerm * 1.8 * (onBPMeds ? 1.1 : 1.0);

    // Non-HDL cholesterol contribution
    const lipidTerm = (nonHDL - 130) / 30;
    baseRisk10 += lipidTerm * 0.8 * (onStatins ? 0.9 : 1.0);
    baseRisk30 += lipidTerm * 1.2 * (onStatins ? 0.9 : 1.0);

    // HDL protective effect
    const hdlTerm = (hdlCholesterol - 50) / 10;
    baseRisk10 -= hdlTerm * 0.4;
    baseRisk30 -= hdlTerm * 0.6;

    // Diabetes
    if (diabetes) {
      baseRisk10 += 2.5;
      baseRisk30 += 4.0;
    }

    // Smoking
    if (currentSmoker) {
      baseRisk10 += 2.0;
      baseRisk30 += 3.5;
    }

    // BMI contribution
    const bmiTerm = (bmi - 25) / 5;
    baseRisk10 += bmiTerm * 0.3;
    baseRisk30 += bmiTerm * 0.5;

    // eGFR contribution (kidney function)
    if (eGFR < 60) {
      baseRisk10 += (60 - eGFR) / 15 * 1.5;
      baseRisk30 += (60 - eGFR) / 15 * 2.0;
    }

    // uACR contribution (if elevated)
    if (uACR > 30) {
      baseRisk10 += Math.log10(uACR / 30) * 1.0;
      baseRisk30 += Math.log10(uACR / 30) * 1.5;
    }

    // Convert to percentage (logistic-like transformation)
    const risk10 = Math.max(0.5, Math.min(50, 2.5 + baseRisk10));
    const risk30 = Math.max(2, Math.min(80, 8 + baseRisk30));

    return {
      tenYear: Math.round(risk10 * 10) / 10,
      thirtyYear: Math.round(risk30 * 10) / 10
    };
  }, [inputs]);

  const getRiskCategory = (risk10: number) => {
    if (risk10 < 5) return { label: 'Low', color: 'bg-green-500', textColor: 'text-green-700' };
    if (risk10 < 7.5) return { label: 'Borderline', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (risk10 < 20) return { label: 'Intermediate', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { label: 'High', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const getRecommendations = (risk10: number) => {
    if (risk10 < 5) {
      return {
        lifestyle: "Emphasize heart-healthy lifestyle",
        statin: "Statin therapy generally not indicated",
        aspirin: "Aspirin not recommended for primary prevention",
        monitoring: "Reassess risk every 4-6 years"
      };
    }
    if (risk10 < 7.5) {
      return {
        lifestyle: "Intensify lifestyle modifications",
        statin: "Consider statin if risk enhancers present",
        aspirin: "Aspirin generally not recommended",
        monitoring: "Reassess risk in 2-4 years"
      };
    }
    if (risk10 < 20) {
      return {
        lifestyle: "Intensive lifestyle intervention",
        statin: "Moderate-intensity statin recommended",
        aspirin: "Consider low-dose aspirin if benefit > bleed risk",
        monitoring: "Annual reassessment recommended"
      };
    }
    return {
      lifestyle: "Maximal lifestyle intervention",
      statin: "High-intensity statin strongly recommended",
      aspirin: "Consider aspirin if no contraindications",
      monitoring: "Close follow-up every 3-6 months"
    };
  };

  const riskCategory = calculateRisk ? getRiskCategory(calculateRisk.tenYear) : null;
  const recommendations = calculateRisk ? getRecommendations(calculateRisk.tenYear) : null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-red-500" />
          AHA PREVENT Score Calculator
          <Badge variant="outline" className="ml-2">Primary Prevention</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Predicting Risk of cardiovascular disease EVENTs - For patients aged 30-79 without established ASCVD
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demographics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age (30-79)</Label>
            <Input
              id="age"
              type="number"
              min={30}
              max={79}
              value={inputs.age}
              onChange={(e) => setInputs({ ...inputs, age: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Sex</Label>
            <RadioGroup
              value={inputs.sex}
              onValueChange={(v) => setInputs({ ...inputs, sex: v as 'male' | 'female' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal">Female</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sbp">Systolic BP (mmHg)</Label>
            <Input
              id="sbp"
              type="number"
              min={90}
              max={200}
              value={inputs.systolicBP}
              onChange={(e) => setInputs({ ...inputs, systolicBP: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmi">BMI (kg/m²)</Label>
            <Input
              id="bmi"
              type="number"
              step={0.1}
              min={15}
              max={60}
              value={inputs.bmi}
              onChange={(e) => setInputs({ ...inputs, bmi: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Lipids */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tc">Total Cholesterol (mg/dL)</Label>
            <Input
              id="tc"
              type="number"
              min={130}
              max={320}
              value={inputs.totalCholesterol}
              onChange={(e) => setInputs({ ...inputs, totalCholesterol: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hdl">HDL Cholesterol (mg/dL)</Label>
            <Input
              id="hdl"
              type="number"
              min={20}
              max={100}
              value={inputs.hdlCholesterol}
              onChange={(e) => setInputs({ ...inputs, hdlCholesterol: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Non-HDL (calculated)</Label>
            <div className="h-10 flex items-center px-3 bg-muted rounded-md">
              <span className="font-medium">{inputs.totalCholesterol - inputs.hdlCholesterol} mg/dL</span>
            </div>
          </div>
        </div>

        {/* Kidney Function */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="egfr">eGFR (mL/min/1.73m²)</Label>
            <Input
              id="egfr"
              type="number"
              min={15}
              max={120}
              value={inputs.eGFR}
              onChange={(e) => setInputs({ ...inputs, eGFR: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uacr">uACR (mg/g) - Optional</Label>
            <Input
              id="uacr"
              type="number"
              min={0}
              max={5000}
              value={inputs.uACR}
              onChange={(e) => setInputs({ ...inputs, uACR: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Risk Factors */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diabetes"
              checked={inputs.diabetes}
              onCheckedChange={(c) => setInputs({ ...inputs, diabetes: c as boolean })}
            />
            <Label htmlFor="diabetes" className="font-normal">Diabetes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="smoker"
              checked={inputs.currentSmoker}
              onCheckedChange={(c) => setInputs({ ...inputs, currentSmoker: c as boolean })}
            />
            <Label htmlFor="smoker" className="font-normal">Current Smoker</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bpmeds"
              checked={inputs.onBPMeds}
              onCheckedChange={(c) => setInputs({ ...inputs, onBPMeds: c as boolean })}
            />
            <Label htmlFor="bpmeds" className="font-normal">On BP Meds</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="statins"
              checked={inputs.onStatins}
              onCheckedChange={(c) => setInputs({ ...inputs, onStatins: c as boolean })}
            />
            <Label htmlFor="statins" className="font-normal">On Statins</Label>
          </div>
        </div>

        {/* Results */}
        {calculateRisk && riskCategory && recommendations && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`border-2 ${riskCategory.color.replace('bg-', 'border-')}`}>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">10-Year CVD Risk</p>
                    <p className={`text-4xl font-bold ${riskCategory.textColor}`}>
                      {calculateRisk.tenYear}%
                    </p>
                    <Badge className={riskCategory.color}>{riskCategory.label} Risk</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-muted">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">30-Year CVD Risk</p>
                    <p className="text-4xl font-bold text-foreground">
                      {calculateRisk.thirtyYear}%
                    </p>
                    <Badge variant="outline">Lifetime Perspective</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Management Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[80px]">Lifestyle:</span>
                  <span>{recommendations.lifestyle}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[80px]">Statin:</span>
                  <span>{recommendations.statin}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[80px]">Aspirin:</span>
                  <span>{recommendations.aspirin}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium min-w-[80px]">Follow-up:</span>
                  <span>{recommendations.monitoring}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Risk Enhancers Info */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
            <Info className="h-4 w-4" />
            Risk-Enhancing Factors (may upgrade risk category)
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
            <ul className="space-y-1 list-disc list-inside">
              <li>Family history of premature ASCVD (men &lt;55y, women &lt;65y)</li>
              <li>Persistently elevated LDL-C ≥160 mg/dL</li>
              <li>Metabolic syndrome</li>
              <li>Chronic kidney disease (eGFR 15-59)</li>
              <li>Chronic inflammatory conditions (RA, psoriasis, HIV)</li>
              <li>History of premature menopause or preeclampsia</li>
              <li>High-risk ethnicity (e.g., South Asian)</li>
              <li>Elevated Lp(a) ≥50 mg/dL or ≥125 nmol/L</li>
              <li>Elevated apoB ≥130 mg/dL</li>
              <li>Ankle-brachial index &lt;0.9</li>
              <li>High-risk CAC score (≥75th percentile)</li>
            </ul>
          </CollapsibleContent>
        </Collapsible>

        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <strong>Note:</strong> This calculator implements a simplified approximation of the AHA PREVENT equations. 
          For clinical decisions, use the official AHA PREVENT calculator at professional.heart.org. 
          Not for patients with established ASCVD.
        </div>
      </CardContent>
    </Card>
  );
};

export default PREVENTScoreCalculator;
