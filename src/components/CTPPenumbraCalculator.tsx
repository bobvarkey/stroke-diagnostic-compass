import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Clock, AlertTriangle, CheckCircle2, XCircle, Info, Activity } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CTPInputs {
  // Volumes
  coreVolume: number; // CBF <30% or rCBF <30%
  penumbraVolume: number; // Tmax >6s
  mismatchVolume: number; // calculated
  mismatchRatio: number; // calculated
  
  // Clinical
  nihss: number;
  age: number;
  timeFromOnset: number; // hours
  
  // CTP Parameters
  tmaxThreshold: '4s' | '6s' | '10s';
  coreDefinition: 'cbf30' | 'cbv' | 'rCBF';
  
  // Collateral Grade
  collateralGrade: 'good' | 'moderate' | 'poor';
}

const CTPPenumbraCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CTPInputs>({
    coreVolume: 15,
    penumbraVolume: 80,
    mismatchVolume: 65,
    mismatchRatio: 5.3,
    nihss: 14,
    age: 68,
    timeFromOnset: 8,
    tmaxThreshold: '6s',
    coreDefinition: 'cbf30',
    collateralGrade: 'moderate'
  });

  // Calculate mismatch automatically
  const calculatedMismatch = useMemo(() => {
    const mismatchVol = Math.max(0, inputs.penumbraVolume - inputs.coreVolume);
    const mismatchRat = inputs.coreVolume > 0 ? inputs.penumbraVolume / inputs.coreVolume : Infinity;
    return {
      volume: mismatchVol,
      ratio: mismatchRat
    };
  }, [inputs.penumbraVolume, inputs.coreVolume]);

  // DAWN Criteria Assessment
  const dawnEligibility = useMemo(() => {
    const { age, nihss, coreVolume, timeFromOnset } = inputs;
    
    if (timeFromOnset < 6 || timeFromOnset > 24) {
      return { eligible: false, reason: "Time window: 6-24 hours from LKW", group: null };
    }

    // Group A: Age ≥80, NIHSS ≥10, Core <21mL
    if (age >= 80 && nihss >= 10 && coreVolume < 21) {
      return { eligible: true, reason: "DAWN Group A criteria met", group: 'A' };
    }
    
    // Group B: Age <80, NIHSS ≥10, Core <31mL
    if (age < 80 && nihss >= 10 && coreVolume < 31) {
      return { eligible: true, reason: "DAWN Group B criteria met", group: 'B' };
    }
    
    // Group C: Age <80, NIHSS ≥20, Core 31-50mL
    if (age < 80 && nihss >= 20 && coreVolume >= 31 && coreVolume <= 50) {
      return { eligible: true, reason: "DAWN Group C criteria met", group: 'C' };
    }

    return { 
      eligible: false, 
      reason: "Does not meet DAWN mismatch criteria",
      group: null
    };
  }, [inputs]);

  // DEFUSE 3 Criteria Assessment
  const defuseEligibility = useMemo(() => {
    const { coreVolume, timeFromOnset } = inputs;
    const { volume: mismatchVol, ratio: mismatchRat } = calculatedMismatch;
    
    if (timeFromOnset < 6 || timeFromOnset > 16) {
      return { eligible: false, reason: "Time window: 6-16 hours from LKW" };
    }

    const criteria = {
      coreUnder70: coreVolume < 70,
      mismatchVolumeOver15: mismatchVol >= 15,
      mismatchRatioOver1_8: mismatchRat >= 1.8
    };

    if (criteria.coreUnder70 && criteria.mismatchVolumeOver15 && criteria.mismatchRatioOver1_8) {
      return { eligible: true, reason: "All DEFUSE 3 criteria met", criteria };
    }

    const failed = [];
    if (!criteria.coreUnder70) failed.push("Core ≥70mL");
    if (!criteria.mismatchVolumeOver15) failed.push("Mismatch volume <15mL");
    if (!criteria.mismatchRatioOver1_8) failed.push("Mismatch ratio <1.8");

    return { 
      eligible: false, 
      reason: `Failed: ${failed.join(", ")}`,
      criteria
    };
  }, [inputs, calculatedMismatch]);

  // Collateral Assessment Impact
  const collateralImpact = useMemo(() => {
    const { collateralGrade, coreVolume, penumbraVolume } = inputs;
    
    const penumbraSalvage = {
      good: 0.7, // 70% salvageable
      moderate: 0.5, // 50% salvageable
      poor: 0.2 // 20% salvageable
    };

    const salvageableVolume = (penumbraVolume - coreVolume) * penumbraSalvage[collateralGrade];
    const expectedFinalInfarct = coreVolume + (penumbraVolume - coreVolume) * (1 - penumbraSalvage[collateralGrade]);

    return {
      salvageableVolume: Math.round(salvageableVolume),
      expectedFinalInfarct: Math.round(expectedFinalInfarct),
      coreGrowthRisk: collateralGrade === 'poor' ? 'High' : collateralGrade === 'moderate' ? 'Moderate' : 'Low'
    };
  }, [inputs]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-500" />
          CTP Penumbra & Collateral Calculator
          <Badge variant="outline" className="ml-2">Late Window</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          DAWN/DEFUSE 3 eligibility assessment for extended window thrombectomy
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time and Clinical */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="onset">Time from LKW (hours)</Label>
            <Input
              id="onset"
              type="number"
              step={0.5}
              min={0}
              max={48}
              value={inputs.timeFromOnset}
              onChange={(e) => setInputs({ ...inputs, timeFromOnset: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={18}
              max={100}
              value={inputs.age}
              onChange={(e) => setInputs({ ...inputs, age: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nihss">NIHSS</Label>
            <Input
              id="nihss"
              type="number"
              min={0}
              max={42}
              value={inputs.nihss}
              onChange={(e) => setInputs({ ...inputs, nihss: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* CTP Volumes */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-3">
          <h4 className="font-medium text-sm">CT Perfusion Parameters</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="core">Core Volume (mL)</Label>
              <Input
                id="core"
                type="number"
                min={0}
                max={300}
                value={inputs.coreVolume}
                onChange={(e) => setInputs({ ...inputs, coreVolume: Number(e.target.value) })}
                className="bg-red-50 dark:bg-red-950/30"
              />
              <p className="text-xs text-muted-foreground">CBF &lt;30%</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="penumbra">Penumbra (Tmax &gt;6s)</Label>
              <Input
                id="penumbra"
                type="number"
                min={0}
                max={500}
                value={inputs.penumbraVolume}
                onChange={(e) => setInputs({ ...inputs, penumbraVolume: Number(e.target.value) })}
                className="bg-yellow-50 dark:bg-yellow-950/30"
              />
              <p className="text-xs text-muted-foreground">Critically hypoperfused</p>
            </div>
            <div className="space-y-2">
              <Label>Mismatch Volume</Label>
              <div className="h-10 flex items-center px-3 bg-green-50 dark:bg-green-950/30 rounded-md border">
                <span className="font-medium">{calculatedMismatch.volume} mL</span>
              </div>
              <p className="text-xs text-muted-foreground">Penumbra - Core</p>
            </div>
            <div className="space-y-2">
              <Label>Mismatch Ratio</Label>
              <div className="h-10 flex items-center px-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border">
                <span className="font-medium">
                  {calculatedMismatch.ratio === Infinity ? '∞' : calculatedMismatch.ratio.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Penumbra / Core</p>
            </div>
          </div>
        </div>

        {/* Collateral Grade */}
        <div className="space-y-2">
          <Label>CTA Collateral Grade</Label>
          <RadioGroup
            value={inputs.collateralGrade}
            onValueChange={(v) => setInputs({ ...inputs, collateralGrade: v as 'good' | 'moderate' | 'poor' })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="good" id="col-good" />
              <Label htmlFor="col-good" className="font-normal">Good (≥50%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="col-mod" />
              <Label htmlFor="col-mod" className="font-normal">Moderate (25-50%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poor" id="col-poor" />
              <Label htmlFor="col-poor" className="font-normal">Poor (&lt;25%)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Trial Eligibility Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DAWN */}
          <Card className={`border-2 ${dawnEligibility.eligible ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-red-300 bg-red-50/50 dark:bg-red-950/20'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {dawnEligibility.eligible ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                DAWN (6-24h)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className={dawnEligibility.eligible ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {dawnEligibility.reason}
              </p>
              {dawnEligibility.group && (
                <Badge className="mt-2 bg-green-600">Group {dawnEligibility.group}</Badge>
              )}
            </CardContent>
          </Card>

          {/* DEFUSE 3 */}
          <Card className={`border-2 ${defuseEligibility.eligible ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-red-300 bg-red-50/50 dark:bg-red-950/20'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {defuseEligibility.eligible ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                DEFUSE 3 (6-16h)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className={defuseEligibility.eligible ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {defuseEligibility.reason}
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  {inputs.coreVolume < 70 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                  <span>Core &lt;70mL: {inputs.coreVolume}mL</span>
                </div>
                <div className="flex items-center gap-2">
                  {calculatedMismatch.volume >= 15 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                  <span>Mismatch ≥15mL: {calculatedMismatch.volume}mL</span>
                </div>
                <div className="flex items-center gap-2">
                  {calculatedMismatch.ratio >= 1.8 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                  <span>Ratio ≥1.8: {calculatedMismatch.ratio === Infinity ? '∞' : calculatedMismatch.ratio.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collateral Impact Estimation */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Collateral-Based Outcome Estimation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Salvageable Tissue</p>
                <p className="text-xl font-bold text-green-600">{collateralImpact.salvageableVolume} mL</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected Final Infarct</p>
                <p className="text-xl font-bold text-orange-600">{collateralImpact.expectedFinalInfarct} mL</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Core Growth Risk</p>
                <Badge variant={collateralImpact.coreGrowthRisk === 'High' ? 'destructive' : collateralImpact.coreGrowthRisk === 'Moderate' ? 'default' : 'secondary'}>
                  {collateralImpact.coreGrowthRisk}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTP Thresholds Reference */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
            <Info className="h-4 w-4" />
            CTP Parameter Definitions & Thresholds
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Definition</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Significance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">CBF</TableCell>
                  <TableCell>Cerebral Blood Flow</TableCell>
                  <TableCell>&lt;30% of normal</TableCell>
                  <TableCell>Ischemic core (irreversible)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CBV</TableCell>
                  <TableCell>Cerebral Blood Volume</TableCell>
                  <TableCell>&lt;2.0 mL/100g</TableCell>
                  <TableCell>Alternative core definition</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tmax</TableCell>
                  <TableCell>Time to Maximum</TableCell>
                  <TableCell>&gt;6 seconds</TableCell>
                  <TableCell>Critically hypoperfused (penumbra)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">MTT</TableCell>
                  <TableCell>Mean Transit Time</TableCell>
                  <TableCell>Prolonged</TableCell>
                  <TableCell>Delayed perfusion</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>

        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <strong>Clinical Note:</strong> Final treatment decisions should integrate CTP findings with clinical assessment, 
          vessel status, and patient factors. Automated software (RAPID, Viz.ai) provides standardized measurements.
        </div>
      </CardContent>
    </Card>
  );
};

export default CTPPenumbraCalculator;
