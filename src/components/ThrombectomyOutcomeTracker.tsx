import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingDown, TrendingUp, Minus, CheckCircle, XCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface OutcomeData {
  etici: string;
  nihssBaseline: number | null;
  nihss24h: number | null;
  nihss7d: number | null;
  mrs90d: number | null;
  sich: boolean;
  mortality: boolean;
}

const eticiGrades = ["0", "1", "2a", "2b50", "2b67", "2c", "3"];

const mrsDescriptions: Record<number, { label: string; description: string; color: string }> = {
  0: { label: "mRS 0", description: "No symptoms", color: "bg-green-500" },
  1: { label: "mRS 1", description: "No significant disability", color: "bg-green-400" },
  2: { label: "mRS 2", description: "Slight disability", color: "bg-lime-500" },
  3: { label: "mRS 3", description: "Moderate disability", color: "bg-yellow-500" },
  4: { label: "mRS 4", description: "Moderately severe disability", color: "bg-orange-500" },
  5: { label: "mRS 5", description: "Severe disability", color: "bg-red-500" },
  6: { label: "mRS 6", description: "Dead", color: "bg-gray-700" }
};

const ThrombectomyOutcomeTracker: React.FC = () => {
  const [outcome, setOutcome] = useState<OutcomeData>({
    etici: "",
    nihssBaseline: null,
    nihss24h: null,
    nihss7d: null,
    mrs90d: null,
    sich: false,
    mortality: false
  });

  const updateOutcome = (field: keyof OutcomeData, value: any) => {
    setOutcome(prev => ({ ...prev, [field]: value }));
  };

  const calculations = useMemo(() => {
    const nihssChange24h = outcome.nihssBaseline !== null && outcome.nihss24h !== null
      ? outcome.nihssBaseline - outcome.nihss24h
      : null;
    
    const nihssChange7d = outcome.nihssBaseline !== null && outcome.nihss7d !== null
      ? outcome.nihssBaseline - outcome.nihss7d
      : null;

    const earlyImprovement = nihssChange24h !== null && nihssChange24h >= 8;
    const dramaticImprovement = nihssChange24h !== null && (nihssChange24h >= 8 || outcome.nihss24h === 0);
    
    const successfulReperfusion = ["2b67", "2c", "3"].includes(outcome.etici);
    const goodFunctionalOutcome = outcome.mrs90d !== null && outcome.mrs90d <= 2;

    return {
      nihssChange24h,
      nihssChange7d,
      earlyImprovement,
      dramaticImprovement,
      successfulReperfusion,
      goodFunctionalOutcome
    };
  }, [outcome]);

  const generatePDF = () => {
    const pdf = new jsPDF();
    const margin = 20;
    let y = margin;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Thrombectomy Outcome Report", margin, y);
    y += 15;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 15;

    // Reperfusion Result
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Reperfusion Result", margin, y);
    y += 8;
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`eTICI Grade: ${outcome.etici || "Not recorded"}`, margin, y);
    y += 6;
    pdf.text(`Successful Reperfusion (≥2b67): ${calculations.successfulReperfusion ? "Yes" : "No"}`, margin, y);
    y += 12;

    // NIHSS Trajectory
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("NIHSS Trajectory", margin, y);
    y += 8;
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Baseline NIHSS: ${outcome.nihssBaseline ?? "Not recorded"}`, margin, y);
    y += 6;
    pdf.text(`24h NIHSS: ${outcome.nihss24h ?? "Not recorded"}`, margin, y);
    y += 6;
    pdf.text(`7-day NIHSS: ${outcome.nihss7d ?? "Not recorded"}`, margin, y);
    y += 6;
    if (calculations.nihssChange24h !== null) {
      pdf.text(`24h Change: ${calculations.nihssChange24h > 0 ? "-" : "+"}${Math.abs(calculations.nihssChange24h)} points`, margin, y);
      y += 6;
    }
    if (calculations.nihssChange7d !== null) {
      pdf.text(`7-day Change: ${calculations.nihssChange7d > 0 ? "-" : "+"}${Math.abs(calculations.nihssChange7d)} points`, margin, y);
      y += 6;
    }
    y += 6;

    // Functional Outcome
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("90-Day Functional Outcome", margin, y);
    y += 8;
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    if (outcome.mrs90d !== null) {
      const mrsInfo = mrsDescriptions[outcome.mrs90d];
      pdf.text(`mRS: ${outcome.mrs90d} - ${mrsInfo.description}`, margin, y);
      y += 6;
      pdf.text(`Good Outcome (mRS 0-2): ${calculations.goodFunctionalOutcome ? "Yes" : "No"}`, margin, y);
    } else {
      pdf.text("mRS: Not recorded", margin, y);
    }
    y += 12;

    // Safety Endpoints
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Safety Endpoints", margin, y);
    y += 8;
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Symptomatic ICH (sICH): ${outcome.sich ? "Yes" : "No"}`, margin, y);
    y += 6;
    pdf.text(`90-day Mortality: ${outcome.mortality ? "Yes" : "No"}`, margin, y);

    pdf.save("thrombectomy-outcome-report.pdf");
  };

  return (
    <Card className="w-full border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Activity className="h-5 w-5" />
          Thrombectomy Outcome Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* eTICI */}
          <div>
            <Label className="text-sm font-medium">eTICI Grade (Post-procedure)</Label>
            <Select value={outcome.etici} onValueChange={(v) => updateOutcome("etici", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select eTICI" />
              </SelectTrigger>
              <SelectContent>
                {eticiGrades.map(grade => (
                  <SelectItem key={grade} value={grade}>
                    eTICI {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Baseline NIHSS */}
          <div>
            <Label className="text-sm font-medium">Baseline NIHSS</Label>
            <input
              type="number"
              min="0"
              max="42"
              value={outcome.nihssBaseline ?? ""}
              onChange={(e) => updateOutcome("nihssBaseline", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="0-42"
              className="mt-1 w-full px-3 py-2 border rounded-md bg-background text-foreground border-input"
            />
          </div>

          {/* 24h NIHSS */}
          <div>
            <Label className="text-sm font-medium">24-hour NIHSS</Label>
            <input
              type="number"
              min="0"
              max="42"
              value={outcome.nihss24h ?? ""}
              onChange={(e) => updateOutcome("nihss24h", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="0-42"
              className="mt-1 w-full px-3 py-2 border rounded-md bg-background text-foreground border-input"
            />
          </div>

          {/* 7-day NIHSS */}
          <div>
            <Label className="text-sm font-medium">7-day NIHSS</Label>
            <input
              type="number"
              min="0"
              max="42"
              value={outcome.nihss7d ?? ""}
              onChange={(e) => updateOutcome("nihss7d", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="0-42"
              className="mt-1 w-full px-3 py-2 border rounded-md bg-background text-foreground border-input"
            />
          </div>

          {/* 90-day mRS */}
          <div>
            <Label className="text-sm font-medium">90-day mRS</Label>
            <Select 
              value={outcome.mrs90d?.toString() ?? ""} 
              onValueChange={(v) => updateOutcome("mrs90d", v ? parseInt(v) : null)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select mRS" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6].map(score => (
                  <SelectItem key={score} value={score.toString()}>
                    mRS {score} - {mrsDescriptions[score].description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Safety Checkboxes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Safety Endpoints</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outcome.sich}
                  onChange={(e) => updateOutcome("sich", e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm">Symptomatic ICH (sICH)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outcome.mortality}
                  onChange={(e) => updateOutcome("mortality", e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm">90-day Mortality</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reperfusion Status */}
          <div className={`p-4 rounded-lg border ${
            calculations.successfulReperfusion 
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" 
              : outcome.etici 
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : "bg-muted/50 border-border"
          }`}>
            <p className="text-xs text-muted-foreground uppercase">Reperfusion</p>
            <div className="flex items-center gap-2 mt-1">
              {outcome.etici ? (
                <>
                  <Badge className={calculations.successfulReperfusion ? "bg-green-600" : "bg-red-600"}>
                    eTICI {outcome.etici}
                  </Badge>
                  {calculations.successfulReperfusion ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Not recorded</span>
              )}
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              {calculations.successfulReperfusion ? "Successful (≥2b67)" : "Target: eTICI ≥2b67"}
            </p>
          </div>

          {/* NIHSS Change */}
          <div className={`p-4 rounded-lg border ${
            calculations.nihssChange24h !== null && calculations.nihssChange24h > 0
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
              : calculations.nihssChange24h !== null && calculations.nihssChange24h < 0
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : "bg-muted/50 border-border"
          }`}>
            <p className="text-xs text-muted-foreground uppercase">24h NIHSS Change</p>
            {calculations.nihssChange24h !== null ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">
                  {calculations.nihssChange24h > 0 ? "-" : "+"}{Math.abs(calculations.nihssChange24h)}
                </span>
                {calculations.nihssChange24h > 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : calculations.nihssChange24h < 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-600" />
                ) : (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground mt-1 block">Not calculated</span>
            )}
            <p className="text-xs mt-2 text-muted-foreground">
              {calculations.dramaticImprovement ? "✓ Dramatic improvement" : ""}
            </p>
          </div>

          {/* Functional Outcome */}
          <div className={`p-4 rounded-lg border ${
            calculations.goodFunctionalOutcome
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
              : outcome.mrs90d !== null
              ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
              : "bg-muted/50 border-border"
          }`}>
            <p className="text-xs text-muted-foreground uppercase">90-day Outcome</p>
            {outcome.mrs90d !== null ? (
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${mrsDescriptions[outcome.mrs90d].color}`} />
                  <span className="font-bold">mRS {outcome.mrs90d}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {mrsDescriptions[outcome.mrs90d].description}
                </p>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground mt-1 block">Not recorded</span>
            )}
            <p className="text-xs mt-2 text-muted-foreground">
              Target: mRS 0-2
            </p>
          </div>

          {/* Safety */}
          <div className={`p-4 rounded-lg border ${
            outcome.sich || outcome.mortality
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          }`}>
            <p className="text-xs text-muted-foreground uppercase">Safety</p>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                {outcome.sich ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm">sICH: {outcome.sich ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center gap-2">
                {outcome.mortality ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm">Mortality: {outcome.mortality ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Quality Reporting Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Successful Reperfusion</p>
              <p className="font-semibold">{calculations.successfulReperfusion ? "Yes (eTICI ≥2b67)" : "No"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Early Neurological Improvement</p>
              <p className="font-semibold">{calculations.earlyImprovement ? "Yes (≥8pt reduction)" : "No"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Good Functional Outcome</p>
              <p className="font-semibold">{calculations.goodFunctionalOutcome ? "Yes (mRS 0-2)" : "No"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Safety Events</p>
              <p className="font-semibold">{outcome.sich || outcome.mortality ? "Present" : "None"}</p>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThrombectomyOutcomeTracker;
