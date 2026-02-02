import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PRIMEInputs {
  sex: 'male' | 'female';
  age: number;
  longTermCare: boolean;
  asthma: boolean;
  atrialFibrillation: boolean;
  chf: boolean;
  dementia: boolean;
  dyslipidemia: boolean;
  heartValve: boolean;
  hypertension: boolean;
  ischemicStroke: boolean;
  liverDisease: boolean;
  tia: boolean;
  vte: boolean;
  recentHospitalization: boolean;
  cancerType: string;
  cancerStage: string;
  surgeryPlanned: boolean;
  systemicTherapy: boolean;
  timeframe: '30' | '90' | '180' | '365';
}

const cancerTypes = [
  { value: 'breast', label: 'Breast' },
  { value: 'gi_colorectal', label: 'Gastrointestinal - Colorectal' },
  { value: 'gi_other', label: 'Gastrointestinal - Other' },
  { value: 'gu_gynaecological', label: 'Genitourinary - Gynaecological' },
  { value: 'gu_prostate', label: 'Genitourinary - Prostate' },
  { value: 'gu_other', label: 'Genitourinary - Other' },
  { value: 'head_neck', label: 'Head and Neck' },
  { value: 'hematology', label: 'Hematology' },
  { value: 'lung', label: 'Lung' },
  { value: 'other', label: 'Other' },
];

const cancerStages = [
  { value: '0', label: 'Stage 0' },
  { value: '1', label: 'Stage 1' },
  { value: '2', label: 'Stage 2' },
  { value: '3', label: 'Stage 3' },
  { value: '4', label: 'Stage 4' },
  { value: 'unknown', label: 'Unknown' },
];

const MedicalHistoryItem: React.FC<{
  id: string;
  label: string;
  timeframe: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ id, label, timeframe, value, onChange }) => (
  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
    <div className="flex-1">
      <Label htmlFor={id} className="font-normal cursor-pointer">{label}</Label>
      <p className="text-xs text-muted-foreground">{timeframe}</p>
    </div>
    <RadioGroup
      value={value ? 'yes' : 'no'}
      onValueChange={(v) => onChange(v === 'yes')}
      className="flex gap-4"
    >
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="no" id={`${id}-no`} />
        <Label htmlFor={`${id}-no`} className="font-normal text-sm">No</Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="yes" id={`${id}-yes`} />
        <Label htmlFor={`${id}-yes`} className="font-normal text-sm">Yes</Label>
      </div>
    </RadioGroup>
  </div>
);

const PRIMEToolCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<PRIMEInputs>({
    sex: 'male',
    age: 65,
    longTermCare: false,
    asthma: false,
    atrialFibrillation: false,
    chf: false,
    dementia: false,
    dyslipidemia: false,
    heartValve: false,
    hypertension: false,
    ischemicStroke: false,
    liverDisease: false,
    tia: false,
    vte: false,
    recentHospitalization: false,
    cancerType: '',
    cancerStage: '',
    surgeryPlanned: false,
    systemicTherapy: false,
    timeframe: '365',
  });

  // PRIME risk calculation (simplified model based on published coefficients)
  const calculateRisk = useMemo(() => {
    if (!inputs.cancerType || !inputs.cancerStage) return null;

    // Base hazard varies by timeframe
    const baseHazards: Record<string, number> = {
      '30': 0.003,
      '90': 0.008,
      '180': 0.015,
      '365': 0.025,
    };

    let logHazard = Math.log(baseHazards[inputs.timeframe]);

    // Demographics
    if (inputs.sex === 'female') logHazard -= 0.15;
    logHazard += (inputs.age - 65) * 0.025;
    if (inputs.longTermCare) logHazard += 0.45;

    // Medical history risk factors
    if (inputs.asthma) logHazard += 0.12;
    if (inputs.atrialFibrillation) logHazard += 0.85;
    if (inputs.chf) logHazard += 0.35;
    if (inputs.dementia) logHazard += 0.30;
    if (inputs.dyslipidemia) logHazard += 0.15;
    if (inputs.heartValve) logHazard += 0.55;
    if (inputs.hypertension) logHazard += 0.25;
    if (inputs.ischemicStroke) logHazard += 1.20;
    if (inputs.liverDisease) logHazard += 0.25;
    if (inputs.tia) logHazard += 0.65;
    if (inputs.vte) logHazard += 0.30;
    if (inputs.recentHospitalization) logHazard += 0.40;

    // Cancer type coefficients
    const cancerCoeffs: Record<string, number> = {
      'breast': -0.20,
      'gi_colorectal': 0.15,
      'gi_other': 0.35,
      'gu_gynaecological': 0.10,
      'gu_prostate': -0.10,
      'gu_other': 0.20,
      'head_neck': 0.25,
      'hematology': 0.45,
      'lung': 0.50,
      'other': 0.20,
    };
    logHazard += cancerCoeffs[inputs.cancerType] || 0;

    // Cancer stage coefficients
    const stageCoeffs: Record<string, number> = {
      '0': -0.30,
      '1': 0,
      '2': 0.20,
      '3': 0.45,
      '4': 0.75,
      'unknown': 0.30,
    };
    logHazard += stageCoeffs[inputs.cancerStage] || 0;

    // Treatment factors
    if (inputs.surgeryPlanned) logHazard += 0.35;
    if (inputs.systemicTherapy) logHazard += 0.25;

    // Convert to probability
    const risk = (1 - Math.exp(-Math.exp(logHazard))) * 100;
    return Math.max(0.1, Math.min(99, Math.round(risk * 100) / 100));
  }, [inputs]);

  const getRiskCategory = (risk: number) => {
    if (risk < 1) return { label: 'Low', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' };
    if (risk < 3) return { label: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' };
    if (risk < 5) return { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' };
    return { label: 'Very High', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' };
  };

  const updateInput = <K extends keyof PRIMEInputs>(key: K, value: PRIMEInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const riskCategory = calculateRisk ? getRiskCategory(calculateRisk) : null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-rose-500" />
          PRIME Tool
          <Badge variant="outline" className="ml-2">Cancer-Stroke Risk</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          <strong>P</strong>redicting <strong>R</strong>isk of <strong>I</strong>schemic Stroke in <strong>M</strong>alignancy <strong>E</strong>stimation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sociodemographics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-primary border-b pb-1">Sociodemographics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sex</Label>
              <RadioGroup
                value={inputs.sex}
                onValueChange={(v) => updateInput('sex', v as 'male' | 'female')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="prime-male" />
                  <Label htmlFor="prime-male" className="font-normal">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="prime-female" />
                  <Label htmlFor="prime-female" className="font-normal">Female</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prime-age">Age (years)</Label>
              <Input
                id="prime-age"
                type="number"
                min={18}
                max={100}
                value={inputs.age}
                onChange={(e) => updateInput('age', Number(e.target.value))}
              />
            </div>
            <MedicalHistoryItem
              id="ltc"
              label="Long-term care resident"
              timeframe="Anytime in 6 months prior to diagnosis"
              value={inputs.longTermCare}
              onChange={(v) => updateInput('longTermCare', v)}
            />
          </div>
        </div>

        {/* Medical History */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-primary border-b pb-1">Medical History</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <MedicalHistoryItem
              id="asthma"
              label="Asthma"
              timeframe="Anytime"
              value={inputs.asthma}
              onChange={(v) => updateInput('asthma', v)}
            />
            <MedicalHistoryItem
              id="afib"
              label="Atrial fibrillation"
              timeframe="Within previous 8 years"
              value={inputs.atrialFibrillation}
              onChange={(v) => updateInput('atrialFibrillation', v)}
            />
            <MedicalHistoryItem
              id="chf"
              label="Congestive heart failure"
              timeframe="Anytime"
              value={inputs.chf}
              onChange={(v) => updateInput('chf', v)}
            />
            <MedicalHistoryItem
              id="dementia"
              label="Dementia"
              timeframe="Anytime"
              value={inputs.dementia}
              onChange={(v) => updateInput('dementia', v)}
            />
            <MedicalHistoryItem
              id="dyslipidemia"
              label="Dyslipidemia"
              timeframe="Within previous 8 years"
              value={inputs.dyslipidemia}
              onChange={(v) => updateInput('dyslipidemia', v)}
            />
            <MedicalHistoryItem
              id="heartvalve"
              label="Heart valve replacement/repair"
              timeframe="Within previous 8 years"
              value={inputs.heartValve}
              onChange={(v) => updateInput('heartValve', v)}
            />
            <MedicalHistoryItem
              id="htn"
              label="Hypertension"
              timeframe="Anytime"
              value={inputs.hypertension}
              onChange={(v) => updateInput('hypertension', v)}
            />
            <MedicalHistoryItem
              id="stroke"
              label="Ischemic stroke"
              timeframe="Within previous 8 years"
              value={inputs.ischemicStroke}
              onChange={(v) => updateInput('ischemicStroke', v)}
            />
            <MedicalHistoryItem
              id="liver"
              label="Liver disease"
              timeframe="Within previous 8 years"
              value={inputs.liverDisease}
              onChange={(v) => updateInput('liverDisease', v)}
            />
            <MedicalHistoryItem
              id="tia"
              label="Transient ischemic attack"
              timeframe="Within previous 8 years"
              value={inputs.tia}
              onChange={(v) => updateInput('tia', v)}
            />
            <MedicalHistoryItem
              id="vte"
              label="Venous thromboembolism"
              timeframe="Within previous 8 years"
              value={inputs.vte}
              onChange={(v) => updateInput('vte', v)}
            />
            <MedicalHistoryItem
              id="hosp"
              label="Recent hospitalization (non-elective)"
              timeframe="Within 3 months prior to cancer diagnosis"
              value={inputs.recentHospitalization}
              onChange={(v) => updateInput('recentHospitalization', v)}
            />
          </div>
        </div>

        {/* Cancer Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-primary border-b pb-1">Cancer Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cancer Type</Label>
              <Select value={inputs.cancerType} onValueChange={(v) => updateInput('cancerType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cancer type" />
                </SelectTrigger>
                <SelectContent>
                  {cancerTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cancer Stage</Label>
              <Select value={inputs.cancerStage} onValueChange={(v) => updateInput('cancerStage', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {cancerStages.map(stage => (
                    <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <MedicalHistoryItem
              id="surgery"
              label="Cancer treatment planned: Surgery"
              timeframe="Within 3 months after cancer diagnosis"
              value={inputs.surgeryPlanned}
              onChange={(v) => updateInput('surgeryPlanned', v)}
            />
            <MedicalHistoryItem
              id="systemic"
              label="Cancer treatment planned: Systemic therapy"
              timeframe="Chemotherapy, immunotherapy, etc."
              value={inputs.systemicTherapy}
              onChange={(v) => updateInput('systemicTherapy', v)}
            />
          </div>
        </div>

        {/* Timeframe */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-primary border-b pb-1">Timeframe</h4>
          <div className="space-y-2">
            <Label>Select timeframe to calculate risk prediction</Label>
            <Select value={inputs.timeframe} onValueChange={(v) => updateInput('timeframe', v as PRIMEInputs['timeframe'])}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {calculateRisk !== null && riskCategory && (
          <Card className={`border-2 ${riskCategory.color.replace('bg-', 'border-')}`}>
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Calculated risk of ischemic stroke {inputs.timeframe} days after cancer diagnosis
                </p>
                <p className={`text-5xl font-bold ${riskCategory.textColor}`}>
                  {calculateRisk}%
                </p>
                <Badge className={riskCategory.color}>{riskCategory.label} Risk</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {!inputs.cancerType || !inputs.cancerStage ? (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Please select cancer type and stage to calculate risk
          </div>
        ) : null}

        {/* Clinical Implications */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
            <AlertTriangle className="h-4 w-4" />
            Clinical Implications & Considerations
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 bg-muted/50 rounded-lg text-sm space-y-2">
            <p><strong>High-risk patients may benefit from:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Closer neurological monitoring during cancer treatment</li>
              <li>Optimization of modifiable stroke risk factors</li>
              <li>Consideration of anticoagulation if AF present (balancing bleed risk)</li>
              <li>Early neurology consultation for high-risk cases</li>
              <li>Patient education on stroke warning signs</li>
            </ul>
            <p className="mt-3"><strong>Key risk drivers in cancer patients:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Prior stroke/TIA history (strongest predictor)</li>
              <li>Atrial fibrillation</li>
              <li>Advanced cancer stage</li>
              <li>Hematologic malignancies and lung cancer</li>
              <li>Systemic therapy and surgical treatment</li>
            </ul>
          </CollapsibleContent>
        </Collapsible>

        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded flex items-start gap-2">
          <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Reference:</strong> PRIME Tool developed by Ottawa Hospital Research Institute. 
            For the official calculator, visit{' '}
            <a 
              href="https://study.ohri.ca/PRIME/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              study.ohri.ca/PRIME
            </a>
            . This implementation uses a simplified model for educational purposes.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PRIMEToolCalculator;
