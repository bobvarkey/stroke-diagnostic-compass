import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, TrendingDown, TrendingUp, Minus, Clock, FileText, Trash2, Plus, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

type NIHSSScoreValue = number | "UN";

interface NIHSSScores {
  [key: string]: NIHSSScoreValue;
}

interface NIHSSTimepoint {
  id: string;
  timepoint: "baseline" | "24h" | "discharge" | "follow-up" | "custom";
  customLabel?: string;
  datetime: string;
  scores: NIHSSScores;
  untestableReasons: Record<string, string>;
  examiner: string;
  notes: string;
}

interface Demographics {
  name?: string;
  mrn?: string;
  dob?: string;
  age?: string;
  sex?: string;
}

interface Props {
  currentScores: NIHSSScores;
  currentUntestableReasons: Record<string, string>;
}

const timepointLabels: Record<string, string> = {
  baseline: "Baseline",
  "24h": "24 Hours",
  discharge: "Discharge",
  "follow-up": "Follow-up",
  custom: "Custom"
};

const nihssItemNames: Record<string, string> = {
  "1a": "LOC", "1b": "LOC Questions", "1c": "LOC Commands",
  "2": "Best Gaze", "3": "Visual Fields", "4": "Facial Palsy",
  "5a": "Left Arm", "5b": "Right Arm", "6a": "Left Leg", "6b": "Right Leg",
  "7": "Limb Ataxia", "8": "Sensory", "9": "Best Language",
  "10": "Dysarthria", "11": "Extinction"
};

export default function SerialNIHSSTracker({ currentScores, currentUntestableReasons }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [timepoints, setTimepoints] = useState<NIHSSTimepoint[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [selectedTimepoint, setSelectedTimepoint] = useState<"baseline" | "24h" | "discharge" | "follow-up" | "custom">("baseline");
  const [customLabel, setCustomLabel] = useState("");
  const [examiner, setExaminer] = useState("");
  const [notes, setNotes] = useState("");

  const calculateTotalScore = (scores: NIHSSScores): number => {
    let total = 0;
    for (const score of Object.values(scores)) {
      if (score !== "UN") {
        total += score;
      }
    }
    return total;
  };

  const countUntestable = (scores: NIHSSScores): number => {
    return Object.values(scores).filter(s => s === "UN").length;
  };

  const getSeverityLabel = (score: number): string => {
    if (score <= 4) return "Minor";
    if (score <= 15) return "Moderate";
    if (score <= 20) return "Moderate-Severe";
    return "Severe";
  };

  const getSeverityColor = (score: number): string => {
    if (score <= 4) return "bg-green-500";
    if (score <= 15) return "bg-yellow-500";
    if (score <= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const saveCurrentTimepoint = () => {
    const newTimepoint: NIHSSTimepoint = {
      id: Date.now().toString(),
      timepoint: selectedTimepoint,
      customLabel: selectedTimepoint === "custom" ? customLabel : undefined,
      datetime: new Date().toISOString(),
      scores: { ...currentScores },
      untestableReasons: { ...currentUntestableReasons },
      examiner,
      notes
    };

    setTimepoints([...timepoints, newTimepoint]);
    setExaminer("");
    setNotes("");
    setCustomLabel("");
    toast.success(`${timepointLabels[selectedTimepoint]} NIHSS saved successfully!`);
  };

  const deleteTimepoint = (id: string) => {
    setTimepoints(timepoints.filter(t => t.id !== id));
    toast.success("Timepoint deleted");
  };

  const getScoreChange = (current: number, previous: number): { change: number; trend: "improved" | "worsened" | "stable" } => {
    const change = current - previous;
    if (change < 0) return { change, trend: "improved" };
    if (change > 0) return { change, trend: "worsened" };
    return { change: 0, trend: "stable" };
  };

  const getItemScoreChange = (itemId: string, currentTP: NIHSSTimepoint, previousTP: NIHSSTimepoint): { change: number | null; trend: "improved" | "worsened" | "stable" | "na" } => {
    const current = currentTP.scores[itemId as keyof NIHSSScores];
    const previous = previousTP.scores[itemId as keyof NIHSSScores];
    
    if (current === "UN" || previous === "UN") return { change: null, trend: "na" };
    
    const change = current - previous;
    if (change < 0) return { change, trend: "improved" };
    if (change > 0) return { change, trend: "worsened" };
    return { change: 0, trend: "stable" };
  };

  const generatePDF = async () => {
    if (timepoints.length === 0) {
      toast.error("No timepoints saved. Save at least one NIHSS assessment first.");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 15;

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Serial NIHSS Tracking Sheet", pageWidth / 2, yPos, { align: "center" });
      yPos += 8;

      // Timestamp
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      // Demographics Section
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Patient Information:", 14, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      const demoFields = [
        `Name: ${demographics.name || "_________________________"}`,
        `MRN: ${demographics.mrn || "_____________"}`,
        `DOB: ${demographics.dob || "_____________"}`,
        `Age: ${demographics.age || "____"} years`,
        `Sex: ${demographics.sex || "______"}`
      ];
      doc.text(demoFields.join("    "), 14, yPos);
      yPos += 10;

      // Create comparison table
      const colWidth = Math.min(40, (pageWidth - 80) / Math.max(timepoints.length, 1));
      const itemColWidth = 60;
      const startX = 14;

      // Table Header
      doc.setFillColor(220, 230, 241);
      doc.rect(startX, yPos, itemColWidth + (colWidth * timepoints.length), 10, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("NIHSS Item", startX + 2, yPos + 7);
      
      timepoints.forEach((tp, idx) => {
        const label = tp.timepoint === "custom" ? (tp.customLabel || "Custom") : timepointLabels[tp.timepoint];
        const date = new Date(tp.datetime).toLocaleDateString();
        const time = new Date(tp.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        doc.text(label, startX + itemColWidth + (idx * colWidth) + 2, yPos + 4);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(`${date} ${time}`, startX + itemColWidth + (idx * colWidth) + 2, yPos + 8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
      });
      yPos += 12;

      // NIHSS Items Rows
      const items = Object.keys(nihssItemNames) as (keyof typeof nihssItemNames)[];
      
      items.forEach((itemId, rowIdx) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 15;
        }

        const bgColor = rowIdx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(startX, yPos - 4, itemColWidth + (colWidth * timepoints.length), 8, "F");
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(`${itemId}. ${nihssItemNames[itemId]}`, startX + 2, yPos);

        timepoints.forEach((tp, idx) => {
          const score = tp.scores[itemId];
          const scoreText = score === "UN" ? "UN" : score.toString();
          
          // Color coding for changes
          if (idx > 0) {
            const prevTP = timepoints[idx - 1];
            const changeInfo = getItemScoreChange(itemId, tp, prevTP);
            
            if (changeInfo.trend === "improved") {
              doc.setTextColor(34, 139, 34); // Green
            } else if (changeInfo.trend === "worsened") {
              doc.setTextColor(220, 20, 60); // Red
            } else {
              doc.setTextColor(0, 0, 0);
            }
          } else {
            doc.setTextColor(0, 0, 0);
          }
          
          doc.text(scoreText, startX + itemColWidth + (idx * colWidth) + colWidth / 2, yPos, { align: "center" });
        });
        
        doc.setTextColor(0, 0, 0);
        yPos += 8;
      });

      // Total Score Row
      yPos += 2;
      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(startX, yPos - 4, itemColWidth + (colWidth * timepoints.length), 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("TOTAL SCORE", startX + 2, yPos + 2);
      
      timepoints.forEach((tp, idx) => {
        const total = calculateTotalScore(tp.scores);
        const un = countUntestable(tp.scores);
        const scoreText = un > 0 ? `${total} (${un} UN)` : total.toString();
        doc.text(scoreText, startX + itemColWidth + (idx * colWidth) + colWidth / 2, yPos + 2, { align: "center" });
      });
      doc.setTextColor(0, 0, 0);
      yPos += 14;

      // Severity Row
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Severity:", startX + 2, yPos);
      doc.setFont("helvetica", "normal");
      timepoints.forEach((tp, idx) => {
        const total = calculateTotalScore(tp.scores);
        doc.text(getSeverityLabel(total), startX + itemColWidth + (idx * colWidth) + colWidth / 2, yPos, { align: "center" });
      });
      yPos += 8;

      // Score Changes
      if (timepoints.length > 1) {
        doc.setFont("helvetica", "bold");
        doc.text("Change from Previous:", startX + 2, yPos);
        doc.setFont("helvetica", "normal");
        
        timepoints.forEach((tp, idx) => {
          if (idx > 0) {
            const currentTotal = calculateTotalScore(tp.scores);
            const prevTotal = calculateTotalScore(timepoints[idx - 1].scores);
            const { change, trend } = getScoreChange(currentTotal, prevTotal);
            
            let changeText = change === 0 ? "No change" : `${change > 0 ? "+" : ""}${change}`;
            if (Math.abs(change) >= 4) changeText += " *";
            
            if (trend === "improved") {
              doc.setTextColor(34, 139, 34);
              changeText = "↓ " + changeText;
            } else if (trend === "worsened") {
              doc.setTextColor(220, 20, 60);
              changeText = "↑ " + changeText;
            }
            
            doc.text(changeText, startX + itemColWidth + (idx * colWidth) + colWidth / 2, yPos, { align: "center" });
            doc.setTextColor(0, 0, 0);
          } else {
            doc.text("-", startX + itemColWidth + (idx * colWidth) + colWidth / 2, yPos, { align: "center" });
          }
        });
        yPos += 10;
      }

      // Examiner and Notes Section
      yPos += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Assessment Details:", startX, yPos);
      yPos += 6;

      timepoints.forEach((tp, idx) => {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 15;
        }
        
        const label = tp.timepoint === "custom" ? (tp.customLabel || "Custom") : timepointLabels[tp.timepoint];
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`${label}:`, startX, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`Examiner: ${tp.examiner || "Not recorded"}`, startX + 30, yPos);
        if (tp.notes) {
          yPos += 5;
          doc.text(`Notes: ${tp.notes}`, startX + 30, yPos);
        }
        yPos += 7;
      });

      // Untestable Items Documentation
      const hasUntestable = timepoints.some(tp => countUntestable(tp.scores) > 0);
      if (hasUntestable) {
        yPos += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Untestable Items Documentation:", startX, yPos);
        yPos += 6;

        timepoints.forEach((tp) => {
          const unItems = Object.entries(tp.scores).filter(([_, score]) => score === "UN");
          if (unItems.length > 0) {
            const label = tp.timepoint === "custom" ? (tp.customLabel || "Custom") : timepointLabels[tp.timepoint];
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.text(`${label}:`, startX, yPos);
            yPos += 5;
            
            unItems.forEach(([itemId]) => {
              if (yPos > pageHeight - 15) {
                doc.addPage();
                yPos = 15;
              }
              doc.setFont("helvetica", "normal");
              const reason = tp.untestableReasons[itemId] || "Reason not documented";
              doc.text(`  ${itemId}. ${nihssItemNames[itemId]}: ${reason}`, startX, yPos);
              yPos += 4;
            });
            yPos += 3;
          }
        });
      }

      // Legend/Key
      yPos = pageHeight - 18;
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text("* Change of ≥4 points is clinically significant. UN = Untestable (excluded from total). Green = improvement, Red = worsening.", startX, yPos);
      yPos += 4;
      doc.text("Severity: Minor (0-4) | Moderate (5-15) | Moderate-Severe (16-20) | Severe (21-42)", startX, yPos);
      
      // Footer
      yPos += 5;
      doc.text("Generated by Stroke Investigation Workup Checklist - For clinical documentation purposes only", pageWidth / 2, yPos, { align: "center" });

      // Save
      const filename = `serial-nihss-${demographics.mrn || "patient"}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success("PDF generated successfully!");

    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const currentTotal = calculateTotalScore(currentScores);
  const currentUN = countUntestable(currentScores);
  const lastTimepoint = timepoints.length > 0 ? timepoints[timepoints.length - 1] : null;
  const lastTotal = lastTimepoint ? calculateTotalScore(lastTimepoint.scores) : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-violet-400 dark:border-violet-600 bg-gradient-to-br from-violet-50 dark:from-violet-950/30 to-background mt-4">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-violet-100/50 dark:bg-violet-900/30">
            <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Serial NIHSS Tracking
                <Badge variant="outline" className="ml-2 text-xs">
                  {timepoints.length} timepoint{timepoints.length !== 1 ? "s" : ""} saved
                </Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Patient Demographics */}
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-700">
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3 text-sm">Patient Demographics (for PDF)</h4>
              <div className="grid gap-3 md:grid-cols-5">
                <div className="space-y-1">
                  <Label className="text-xs text-violet-700 dark:text-violet-400">Patient Name</Label>
                  <Input
                    placeholder="Full Name"
                    value={demographics.name || ""}
                    onChange={(e) => setDemographics({ ...demographics, name: e.target.value })}
                    className="h-8 text-sm border-violet-300 dark:border-violet-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-violet-700 dark:text-violet-400">MRN</Label>
                  <Input
                    placeholder="MRN"
                    value={demographics.mrn || ""}
                    onChange={(e) => setDemographics({ ...demographics, mrn: e.target.value })}
                    className="h-8 text-sm border-violet-300 dark:border-violet-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-violet-700 dark:text-violet-400">Date of Birth</Label>
                  <Input
                    type="date"
                    value={demographics.dob || ""}
                    onChange={(e) => setDemographics({ ...demographics, dob: e.target.value })}
                    className="h-8 text-sm border-violet-300 dark:border-violet-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-violet-700 dark:text-violet-400">Age</Label>
                  <Input
                    placeholder="Age"
                    type="number"
                    value={demographics.age || ""}
                    onChange={(e) => setDemographics({ ...demographics, age: e.target.value })}
                    className="h-8 text-sm border-violet-300 dark:border-violet-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-violet-700 dark:text-violet-400">Sex</Label>
                  <select
                    value={demographics.sex || ""}
                    onChange={(e) => setDemographics({ ...demographics, sex: e.target.value })}
                    className="h-8 w-full text-sm border border-violet-300 dark:border-violet-700 rounded-md bg-background px-2"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Current Score */}
            <div className="p-4 bg-white dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-700">
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3 text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Save Current NIHSS Score
              </h4>
              
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
                <div className="space-y-1">
                  <Label className="text-xs text-violet-700 dark:text-violet-400">Timepoint</Label>
                  <select
                    value={selectedTimepoint}
                    onChange={(e) => setSelectedTimepoint(e.target.value as typeof selectedTimepoint)}
                    className="h-9 w-full text-sm border border-violet-300 dark:border-violet-700 rounded-md bg-background px-2"
                  >
                    <option value="baseline">Baseline</option>
                    <option value="24h">24 Hours</option>
                    <option value="discharge">Discharge</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                {selectedTimepoint === "custom" && (
                  <div className="space-y-1">
                    <Label className="text-xs text-violet-700 dark:text-violet-400">Custom Label</Label>
                    <Input
                      placeholder="e.g., 48h, Day 3"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      className="h-9 text-sm border-violet-300 dark:border-violet-700"
                    />
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label className="text-xs text-violet-700 dark:text-violet-400">Examiner</Label>
                  <Input
                    placeholder="Examiner name"
                    value={examiner}
                    onChange={(e) => setExaminer(e.target.value)}
                    className="h-9 text-sm border-violet-300 dark:border-violet-700"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-violet-700 dark:text-violet-400">Notes</Label>
                  <Input
                    placeholder="Optional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-9 text-sm border-violet-300 dark:border-violet-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Badge className={`${getSeverityColor(currentTotal)} text-white px-3 py-1`}>
                    Current: {currentTotal}/42 {currentUN > 0 && `(${currentUN} UN)`}
                  </Badge>
                  {lastTotal !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      {(() => {
                        const { change, trend } = getScoreChange(currentTotal, lastTotal);
                        const Icon = trend === "improved" ? TrendingDown : trend === "worsened" ? TrendingUp : Minus;
                        const colorClass = trend === "improved" ? "text-green-600" : trend === "worsened" ? "text-red-600" : "text-gray-500";
                        return (
                          <>
                            <Icon className={`h-4 w-4 ${colorClass}`} />
                            <span className={colorClass}>
                              {change === 0 ? "No change" : `${change > 0 ? "+" : ""}${change}`} from last
                              {Math.abs(change) >= 4 && <span className="font-bold ml-1">(Clinically significant!)</span>}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <Button
                  onClick={saveCurrentTimepoint}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Save {timepointLabels[selectedTimepoint]}
                </Button>
              </div>
            </div>

            {/* Saved Timepoints */}
            {timepoints.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-violet-800 dark:text-violet-300 text-sm">Saved Assessments</h4>
                
                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-violet-100 dark:bg-violet-900/40">
                        <th className="border border-violet-200 dark:border-violet-700 p-2 text-left sticky left-0 bg-violet-100 dark:bg-violet-900/40">Item</th>
                        {timepoints.map((tp, idx) => (
                          <th key={tp.id} className="border border-violet-200 dark:border-violet-700 p-2 text-center min-w-[80px]">
                            <div className="font-bold">
                              {tp.timepoint === "custom" ? (tp.customLabel || "Custom") : timepointLabels[tp.timepoint]}
                            </div>
                            <div className="font-normal text-violet-600 dark:text-violet-400">
                              {new Date(tp.datetime).toLocaleDateString()}
                            </div>
                            <div className="font-normal text-violet-500 dark:text-violet-500 text-[10px]">
                              {new Date(tp.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(nihssItemNames).map((itemId, rowIdx) => (
                        <tr key={itemId} className={rowIdx % 2 === 0 ? "bg-white dark:bg-violet-950/20" : "bg-violet-50 dark:bg-violet-950/10"}>
                          <td className="border border-violet-200 dark:border-violet-700 p-2 font-medium sticky left-0 bg-inherit">
                            {itemId}. {nihssItemNames[itemId]}
                          </td>
                          {timepoints.map((tp, idx) => {
                            const score = tp.scores[itemId as keyof NIHSSScores];
                            const prevTP = idx > 0 ? timepoints[idx - 1] : null;
                            let changeClass = "";
                            
                            if (prevTP) {
                              const changeInfo = getItemScoreChange(itemId, tp, prevTP);
                              if (changeInfo.trend === "improved") changeClass = "text-green-600 dark:text-green-400 font-bold";
                              else if (changeInfo.trend === "worsened") changeClass = "text-red-600 dark:text-red-400 font-bold";
                            }
                            
                            return (
                              <td key={tp.id} className={`border border-violet-200 dark:border-violet-700 p-2 text-center ${changeClass}`}>
                                {score === "UN" ? (
                                  <span className="text-amber-600 dark:text-amber-400">UN</span>
                                ) : (
                                  score
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      
                      {/* Total Row */}
                      <tr className="bg-violet-200 dark:bg-violet-800/50 font-bold">
                        <td className="border border-violet-300 dark:border-violet-600 p-2 sticky left-0 bg-violet-200 dark:bg-violet-800/50">
                          TOTAL
                        </td>
                        {timepoints.map((tp, idx) => {
                          const total = calculateTotalScore(tp.scores);
                          const un = countUntestable(tp.scores);
                          const prevTP = idx > 0 ? timepoints[idx - 1] : null;
                          let changeInfo = null;
                          
                          if (prevTP) {
                            const prevTotal = calculateTotalScore(prevTP.scores);
                            changeInfo = getScoreChange(total, prevTotal);
                          }
                          
                          return (
                            <td key={tp.id} className="border border-violet-300 dark:border-violet-600 p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Badge className={`${getSeverityColor(total)} text-white text-xs`}>
                                  {total}{un > 0 && ` (${un} UN)`}
                                </Badge>
                                {changeInfo && (
                                  <span className={`text-xs ${
                                    changeInfo.trend === "improved" ? "text-green-600" : 
                                    changeInfo.trend === "worsened" ? "text-red-600" : "text-gray-500"
                                  }`}>
                                    {changeInfo.change !== 0 && (changeInfo.change > 0 ? "+" : "")}
                                    {changeInfo.change !== 0 && changeInfo.change}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Examiner Row */}
                      <tr className="bg-violet-50 dark:bg-violet-950/30">
                        <td className="border border-violet-200 dark:border-violet-700 p-2 text-violet-600 dark:text-violet-400 sticky left-0 bg-violet-50 dark:bg-violet-950/30">
                          Examiner
                        </td>
                        {timepoints.map((tp) => (
                          <td key={tp.id} className="border border-violet-200 dark:border-violet-700 p-2 text-center text-violet-600 dark:text-violet-400">
                            {tp.examiner || "-"}
                          </td>
                        ))}
                      </tr>
                      
                      {/* Actions Row */}
                      <tr>
                        <td className="border border-violet-200 dark:border-violet-700 p-2 sticky left-0 bg-white dark:bg-violet-950/20">
                          Actions
                        </td>
                        {timepoints.map((tp) => (
                          <td key={tp.id} className="border border-violet-200 dark:border-violet-700 p-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTimepoint(tp.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Clinical Significance Note */}
                {timepoints.length > 1 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      <strong>Clinical Note:</strong> A change of ≥4 points on the NIHSS is considered clinically significant. 
                      <span className="text-green-600 dark:text-green-400 font-medium"> Green</span> indicates improvement (score decreased), 
                      <span className="text-red-600 dark:text-red-400 font-medium"> Red</span> indicates worsening (score increased).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Export to PDF */}
            <div className="flex gap-3">
              <Button
                onClick={generatePDF}
                disabled={isGeneratingPDF || timepoints.length === 0}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Export Serial NIHSS to PDF
                  </>
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700 rounded-lg">
              <p className="text-xs text-violet-600 dark:text-violet-400">
                <strong>Instructions:</strong> Score the NIHSS using the calculator above, then save it to a timepoint (Baseline, 24h, Discharge, or Follow-up). 
                The tracker will automatically compare scores across timepoints and highlight changes. Export to PDF for documentation.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
