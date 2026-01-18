import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, TrendingDown, TrendingUp, Minus, Clock, FileText, Trash2, Plus, Loader2, Mail, MessageCircle, Share2 } from "lucide-react";
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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [timepoints, setTimepoints] = useState<NIHSSTimepoint[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [selectedTimepoint, setSelectedTimepoint] = useState<"baseline" | "24h" | "discharge" | "follow-up" | "custom">("baseline");
  const [customLabel, setCustomLabel] = useState("");
  const [examiner, setExaminer] = useState("");
  const [notes, setNotes] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const pdfBlobRef = useRef<Blob | null>(null);

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

  const generatePDFBlob = async (): Promise<Blob | null> => {
    if (timepoints.length === 0) {
      toast.error("No timepoints saved. Save at least one NIHSS assessment first.");
      return null;
    }

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

      return doc.output('blob');
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
      return null;
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await generatePDFBlob();
      if (blob) {
        pdfBlobRef.current = blob;
        const filename = `serial-nihss-${demographics.mrn || "patient"}-${new Date().toISOString().split('T')[0]}.pdf`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("PDF generated and downloaded successfully!");
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const createSummaryText = () => {
    const patientInfo = demographics.name ? `Patient: ${demographics.name}` : "Patient: Not specified";
    const mrnInfo = demographics.mrn ? ` (MRN: ${demographics.mrn})` : "";
    
    let summary = `📋 Serial NIHSS Report\n${patientInfo}${mrnInfo}\n\n`;
    
    timepoints.forEach((tp, idx) => {
      const label = tp.timepoint === "custom" ? (tp.customLabel || "Custom") : timepointLabels[tp.timepoint];
      const total = calculateTotalScore(tp.scores);
      const severity = getSeverityLabel(total);
      const date = new Date(tp.datetime).toLocaleString();
      
      summary += `📍 ${label} (${date})\n`;
      summary += `   Score: ${total}/42 - ${severity}\n`;
      
      if (idx > 0) {
        const prevTotal = calculateTotalScore(timepoints[idx - 1].scores);
        const { change, trend } = getScoreChange(total, prevTotal);
        const arrow = trend === "improved" ? "↓" : trend === "worsened" ? "↑" : "→";
        summary += `   Change: ${arrow} ${change === 0 ? "No change" : (change > 0 ? "+" : "") + change}\n`;
      }
      summary += "\n";
    });
    
    return summary;
  };

  const shareViaWhatsApp = async () => {
    if (timepoints.length === 0) {
      toast.error("No timepoints saved. Save at least one NIHSS assessment first.");
      return;
    }

    const summary = createSummaryText();
    const encodedText = encodeURIComponent(summary + "\n📄 PDF attached separately if available.");
    
    // Format phone number (remove spaces and special characters)
    let phone = recipientPhone.replace(/[\s\-\(\)]/g, '');
    if (phone && !phone.startsWith('+')) {
      phone = '+' + phone;
    }
    
    const whatsappUrl = phone 
      ? `https://wa.me/${phone.replace('+', '')}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const shareViaEmail = async () => {
    if (timepoints.length === 0) {
      toast.error("No timepoints saved. Save at least one NIHSS assessment first.");
      return;
    }

    setIsSendingEmail(true);
    
    try {
      const summary = createSummaryText();
      const patientName = demographics.name || "Patient";
      const subject = encodeURIComponent(`Serial NIHSS Report - ${patientName}`);
      const body = encodeURIComponent(summary + "\n\nNote: Please generate and attach the PDF from the Stroke Workup Checklist for complete documentation.");
      
      const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
      toast.success("Opening email client...");
    } finally {
      setIsSendingEmail(false);
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
            <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300 text-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6" />
                <span className="font-semibold">Serial NIHSS Tracking</span>
                <Badge variant="outline" className="ml-2 text-sm font-medium">
                  {timepoints.length} timepoint{timepoints.length !== 1 ? "s" : ""} saved
                </Badge>
              </div>
              <ChevronDown className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Patient Demographics */}
            <div className="p-5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-700">
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-4 text-base">Patient Demographics (for PDF)</h4>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Patient Name</Label>
                  <Input
                    placeholder="Full Name"
                    value={demographics.name || ""}
                    onChange={(e) => setDemographics({ ...demographics, name: e.target.value })}
                    className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">MRN</Label>
                  <Input
                    placeholder="MRN"
                    value={demographics.mrn || ""}
                    onChange={(e) => setDemographics({ ...demographics, mrn: e.target.value })}
                    className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Date of Birth</Label>
                  <Input
                    type="date"
                    value={demographics.dob || ""}
                    onChange={(e) => setDemographics({ ...demographics, dob: e.target.value })}
                    className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Age</Label>
                  <Input
                    placeholder="Age"
                    type="number"
                    value={demographics.age || ""}
                    onChange={(e) => setDemographics({ ...demographics, age: e.target.value })}
                    className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Sex</Label>
                  <select
                    value={demographics.sex || ""}
                    onChange={(e) => setDemographics({ ...demographics, sex: e.target.value })}
                    className="h-10 w-full text-base border border-violet-300 dark:border-violet-700 rounded-md bg-background px-3 focus:ring-2 focus:ring-violet-500"
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
            <div className="p-5 bg-white dark:bg-violet-950/30 rounded-xl border border-violet-200 dark:border-violet-700">
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-4 text-base flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Save Current NIHSS Score
              </h4>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Timepoint</Label>
                  <select
                    value={selectedTimepoint}
                    onChange={(e) => setSelectedTimepoint(e.target.value as typeof selectedTimepoint)}
                    className="h-10 w-full text-base border border-violet-300 dark:border-violet-700 rounded-md bg-background px-3 focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="baseline">Baseline</option>
                    <option value="24h">24 Hours</option>
                    <option value="discharge">Discharge</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                {selectedTimepoint === "custom" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Custom Label</Label>
                    <Input
                      placeholder="e.g., 48h, Day 3"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Examiner</Label>
                  <Input
                    placeholder="Examiner name"
                    value={examiner}
                    onChange={(e) => setExaminer(e.target.value)}
                    className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Notes</Label>
                  <Input
                    placeholder="Optional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Badge className={`${getSeverityColor(currentTotal)} text-white px-4 py-2 text-base font-medium`}>
                    Current: {currentTotal}/42 {currentUN > 0 && `(${currentUN} UN)`}
                  </Badge>
                  {lastTotal !== null && (
                    <div className="flex items-center gap-2 text-base">
                      {(() => {
                        const { change, trend } = getScoreChange(currentTotal, lastTotal);
                        const Icon = trend === "improved" ? TrendingDown : trend === "worsened" ? TrendingUp : Minus;
                        const colorClass = trend === "improved" ? "text-green-600 dark:text-green-400" : trend === "worsened" ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400";
                        return (
                          <>
                            <Icon className={`h-5 w-5 ${colorClass}`} />
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
                  className="bg-violet-600 hover:bg-violet-700 h-11 px-6 text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  <Plus className="h-5 w-5 mr-2" />
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

            {/* Share & Export Section */}
            <div className="p-5 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/30 rounded-xl border border-violet-200 dark:border-violet-700 space-y-5">
              <h4 className="font-semibold text-violet-800 dark:text-violet-300 text-base flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share & Export
              </h4>
              
              {/* Recipient Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Email Recipient</Label>
                  <Input
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">WhatsApp Number (with country code)</Label>
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="h-10 text-base border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || timepoints.length === 0}
                  className="h-12 bg-violet-600 hover:bg-violet-700 text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={shareViaEmail}
                  disabled={isSendingEmail || timepoints.length === 0}
                  variant="outline"
                  className="h-12 border-2 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Send via Email
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={shareViaWhatsApp}
                  disabled={timepoints.length === 0}
                  variant="outline"
                  className="h-12 border-2 border-green-500 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Send via WhatsApp
                </Button>
              </div>
              
              <p className="text-sm text-violet-600 dark:text-violet-400 leading-relaxed">
                <strong>Tip:</strong> Download the PDF first, then share via Email or WhatsApp. The PDF can be attached manually to your email or shared as a document in WhatsApp.
              </p>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-700 rounded-xl">
              <p className="text-sm text-violet-700 dark:text-violet-400 leading-relaxed">
                <strong>Instructions:</strong> Score the NIHSS using the calculator above, then save it to a timepoint (Baseline, 24h, Discharge, or Follow-up). 
                The tracker will automatically compare scores across timepoints and highlight changes. Use the share buttons to send reports to your clinical team.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
