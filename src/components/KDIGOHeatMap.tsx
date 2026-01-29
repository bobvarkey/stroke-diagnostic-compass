import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, Info } from "lucide-react";

interface KDIGOCell {
  egfrRange: string;
  uacrRange: string;
  riskCategory: string;
  color: string;
  cvRisk: string;
  ckdProgression: string;
}

const KDIGOHeatMap: React.FC = () => {
  const [egfr, setEgfr] = useState<number>(75);
  const [uacr, setUacr] = useState<number>(25);

  // KDIGO risk categories based on eGFR and uACR
  const getEgfrCategory = (value: number): { stage: string; row: number } => {
    if (value >= 90) return { stage: "G1", row: 0 };
    if (value >= 60) return { stage: "G2", row: 1 };
    if (value >= 45) return { stage: "G3a", row: 2 };
    if (value >= 30) return { stage: "G3b", row: 3 };
    if (value >= 15) return { stage: "G4", row: 4 };
    return { stage: "G5", row: 5 };
  };

  const getUacrCategory = (value: number): { stage: string; col: number } => {
    if (value < 30) return { stage: "A1", col: 0 };
    if (value < 300) return { stage: "A2", col: 1 };
    return { stage: "A3", col: 2 };
  };

  // Risk matrix: rows = eGFR stages, cols = UACR stages
  // 0 = low (green), 1 = moderate (yellow), 2 = high (orange), 3 = very high (red)
  const riskMatrix = [
    [0, 1, 2], // G1
    [0, 1, 2], // G2
    [1, 2, 3], // G3a
    [2, 3, 3], // G3b
    [3, 3, 3], // G4
    [3, 3, 3], // G5
  ];

  const riskLabels = ["Low", "Moderate", "High", "Very High"];
  const riskColors = [
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500"
  ];
  const riskBgColors = [
    "bg-green-100 dark:bg-green-900/40",
    "bg-yellow-100 dark:bg-yellow-900/40",
    "bg-orange-100 dark:bg-orange-900/40",
    "bg-red-100 dark:bg-red-900/40"
  ];

  const currentRisk = useMemo(() => {
    const egfrCat = getEgfrCategory(egfr);
    const uacrCat = getUacrCategory(uacr);
    const riskLevel = riskMatrix[egfrCat.row][uacrCat.col];
    
    return {
      egfrStage: egfrCat.stage,
      uacrStage: uacrCat.stage,
      riskLevel,
      riskLabel: riskLabels[riskLevel],
      riskColor: riskColors[riskLevel],
      row: egfrCat.row,
      col: uacrCat.col
    };
  }, [egfr, uacr]);

  const egfrRows = [
    { stage: "G1", range: "≥90", label: "Normal or high" },
    { stage: "G2", range: "60-89", label: "Mildly decreased" },
    { stage: "G3a", range: "45-59", label: "Mildly to moderately decreased" },
    { stage: "G3b", range: "30-44", label: "Moderately to severely decreased" },
    { stage: "G4", range: "15-29", label: "Severely decreased" },
    { stage: "G5", range: "<15", label: "Kidney failure" },
  ];

  const uacrCols = [
    { stage: "A1", range: "<30", label: "Normal to mildly increased" },
    { stage: "A2", range: "30-299", label: "Moderately increased" },
    { stage: "A3", range: "≥300", label: "Severely increased" },
  ];

  const managementGuidance = useMemo(() => {
    const { riskLevel } = currentRisk;
    switch (riskLevel) {
      case 0:
        return {
          monitoring: "Annual eGFR and uACR",
          bpTarget: "<140/90 mmHg (if no other indication)",
          aceiArb: "Consider if hypertension or diabetes",
          sglt2i: "Consider if T2DM for renal protection",
          statin: "Per ASCVD risk assessment"
        };
      case 1:
        return {
          monitoring: "Annual eGFR and uACR",
          bpTarget: "<130/80 mmHg",
          aceiArb: "Recommended if albuminuria present",
          sglt2i: "Recommended if T2DM or albuminuria",
          statin: "Consider for CV risk reduction"
        };
      case 2:
        return {
          monitoring: "Every 6 months",
          bpTarget: "<130/80 mmHg",
          aceiArb: "Strongly recommended",
          sglt2i: "Strongly recommended",
          statin: "Recommended for CV protection"
        };
      case 3:
        return {
          monitoring: "Every 3-4 months",
          bpTarget: "<130/80 mmHg (individualized)",
          aceiArb: "Essential (titrate to max tolerated)",
          sglt2i: "Recommended if eGFR ≥20",
          statin: "Recommended; nephrology referral"
        };
      default:
        return {
          monitoring: "Per nephrology",
          bpTarget: "Individualized",
          aceiArb: "Per nephrologist",
          sglt2i: "Per nephrologist",
          statin: "Per nephrologist"
        };
    }
  }, [currentRisk]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-teal-500" />
          KDIGO CKD Heat Map
          <Badge variant="outline" className="ml-2">Kidney-CV Risk</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Combined cardiovascular and CKD progression risk based on eGFR and uACR
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="egfr">eGFR (mL/min/1.73m²)</Label>
            <Input
              id="egfr"
              type="number"
              min={0}
              max={150}
              value={egfr}
              onChange={(e) => setEgfr(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uacr">uACR (mg/g)</Label>
            <Input
              id="uacr"
              type="number"
              min={0}
              max={5000}
              value={uacr}
              onChange={(e) => setUacr(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Current Classification */}
        <div className={`p-4 rounded-lg border-2 ${riskBgColors[currentRisk.riskLevel]}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Classification</p>
              <p className="text-2xl font-bold">
                CKD {currentRisk.egfrStage}{currentRisk.uacrStage}
              </p>
            </div>
            <Badge className={`${currentRisk.riskColor} text-white text-lg px-4 py-2`}>
              {currentRisk.riskLabel} Risk
            </Badge>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>eGFR: {egfr} mL/min/1.73m² ({currentRisk.egfrStage})</div>
            <div>uACR: {uacr} mg/g ({currentRisk.uacrStage})</div>
          </div>
        </div>

        {/* KDIGO Heat Map Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 border bg-muted" colSpan={2} rowSpan={2}>
                  <div className="text-center">
                    <p className="font-bold">Prognosis of CKD</p>
                    <p className="text-muted-foreground">by GFR and Albuminuria</p>
                  </div>
                </th>
                <th className="p-2 border bg-muted text-center" colSpan={3}>
                  Persistent Albuminuria Categories (uACR mg/g)
                </th>
              </tr>
              <tr>
                {uacrCols.map((col) => (
                  <th key={col.stage} className={`p-2 border text-center ${currentRisk.uacrStage === col.stage ? 'ring-2 ring-primary' : ''}`}>
                    <div className="font-bold">{col.stage}</div>
                    <div className="text-muted-foreground">{col.range}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {egfrRows.map((row, rowIdx) => (
                <tr key={row.stage}>
                  {rowIdx === 0 && (
                    <td className="p-2 border bg-muted font-bold text-center writing-mode-vertical" rowSpan={6}>
                      <div className="transform -rotate-0">
                        GFR Categories<br/>(mL/min/1.73m²)
                      </div>
                    </td>
                  )}
                  <td className={`p-2 border bg-muted ${currentRisk.egfrStage === row.stage ? 'ring-2 ring-primary' : ''}`}>
                    <div className="font-bold">{row.stage}: {row.range}</div>
                    <div className="text-muted-foreground text-xs">{row.label}</div>
                  </td>
                  {uacrCols.map((col, colIdx) => {
                    const cellRisk = riskMatrix[rowIdx][colIdx];
                    const isCurrentCell = rowIdx === currentRisk.row && colIdx === currentRisk.col;
                    return (
                      <td
                        key={col.stage}
                        className={`p-3 border text-center ${riskBgColors[cellRisk]} ${isCurrentCell ? 'ring-4 ring-primary ring-offset-2' : ''}`}
                      >
                        {isCurrentCell && (
                          <div className="font-bold text-lg">●</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center">
          {riskLabels.map((label, idx) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded ${riskColors[idx]}`}></div>
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* CV Risk Implications */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Cardiovascular Risk Implications
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-background rounded border">
              <p className="text-muted-foreground">CV Event Risk</p>
              <p className="font-medium">
                {currentRisk.riskLevel === 0 ? "1.0x baseline" :
                 currentRisk.riskLevel === 1 ? "1.4x baseline" :
                 currentRisk.riskLevel === 2 ? "2.0x baseline" : "3.4x baseline"}
              </p>
            </div>
            <div className="p-2 bg-background rounded border">
              <p className="text-muted-foreground">CKD Progression</p>
              <p className="font-medium">
                {currentRisk.riskLevel === 0 ? "Low" :
                 currentRisk.riskLevel === 1 ? "Moderate" :
                 currentRisk.riskLevel === 2 ? "High" : "Very High"}
              </p>
            </div>
            <div className="p-2 bg-background rounded border">
              <p className="text-muted-foreground">AKI Susceptibility</p>
              <p className="font-medium">
                {currentRisk.riskLevel >= 2 ? "Increased" : "Baseline"}
              </p>
            </div>
          </div>
        </div>

        {/* Management Guidance */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              KDIGO-Guided Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-background rounded">
                <p className="text-muted-foreground">Monitoring Frequency</p>
                <p className="font-medium">{managementGuidance.monitoring}</p>
              </div>
              <div className="p-2 bg-background rounded">
                <p className="text-muted-foreground">BP Target</p>
                <p className="font-medium">{managementGuidance.bpTarget}</p>
              </div>
              <div className="p-2 bg-background rounded">
                <p className="text-muted-foreground">ACEi/ARB</p>
                <p className="font-medium">{managementGuidance.aceiArb}</p>
              </div>
              <div className="p-2 bg-background rounded">
                <p className="text-muted-foreground">SGLT2 Inhibitor</p>
                <p className="font-medium">{managementGuidance.sglt2i}</p>
              </div>
            </div>
            <div className="p-2 bg-background rounded">
              <p className="text-muted-foreground">Statin Therapy</p>
              <p className="font-medium">{managementGuidance.statin}</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <strong>Reference:</strong> KDIGO 2024 Clinical Practice Guideline for Evaluation and Management of CKD. 
          CV risk multipliers based on CKD-Prognosis Consortium meta-analysis.
        </div>
      </CardContent>
    </Card>
  );
};

export default KDIGOHeatMap;
