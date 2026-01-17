import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileText, Printer, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface ScoreData {
  nihss?: { total: number; breakdown: Record<string, number> };
  gcs?: { total: number; eye: number; verbal: number; motor: number };
  four?: { total: number; eye: number; motor: number; brainstem: number; respiration: number };
  huntHess?: number;
  wfns?: { grade: string; gcs: number; motorDeficit: boolean };
  ichScore?: number;
  funcScore?: number;
  cha2ds2vasc?: number;
  hasbled?: number;
  abcd2?: number;
  mrs?: number;
  aspects?: number;
}

interface Demographics {
  age?: string;
  sex?: string;
  race?: string;
}

interface Props {
  scores: ScoreData;
  demographics: Demographics;
  checkedTests: string[];
}

export default function PDFScoreSummary({ scores, demographics, checkedTests }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      const lineHeight = 7;
      const sectionGap = 12;

      // Helper functions
      const addTitle = (text: string) => {
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(text, pageWidth / 2, yPos, { align: "center" });
        yPos += lineHeight + 5;
      };

      const addSection = (title: string) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 102, 153);
        doc.text(title, 14, yPos);
        yPos += lineHeight;
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
      };

      const addLine = (label: string, value: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(10);
        doc.text(`${label}: ${value}`, 20, yPos);
        yPos += lineHeight - 1;
      };

      const addSpacer = () => {
        yPos += sectionGap;
      };

      // Title
      addTitle("Stroke Investigation Summary");
      
      // Date and Time
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: "center" });
      yPos += lineHeight + 5;

      // Demographics
      if (demographics.age || demographics.sex || demographics.race) {
        addSection("Patient Demographics");
        if (demographics.age) addLine("Age", `${demographics.age} years`);
        if (demographics.sex) addLine("Sex", demographics.sex.charAt(0).toUpperCase() + demographics.sex.slice(1));
        if (demographics.race) addLine("Race/Ethnicity", demographics.race.charAt(0).toUpperCase() + demographics.race.slice(1).replace("-", " "));
        addSpacer();
      }

      // Clinical Scores Section
      addSection("Clinical Scores");

      // NIHSS
      if (scores.nihss) {
        addLine("NIHSS Total", `${scores.nihss.total}/42`);
        const severity = scores.nihss.total <= 4 ? "Minor" : scores.nihss.total <= 15 ? "Moderate" : scores.nihss.total <= 20 ? "Moderate-Severe" : "Severe";
        addLine("  Severity", severity);
      }

      // GCS
      if (scores.gcs) {
        addLine("GCS Total", `${scores.gcs.total}/15`);
        addLine("  Breakdown", `E${scores.gcs.eye} V${scores.gcs.verbal} M${scores.gcs.motor}`);
        const gcsSeverity = scores.gcs.total >= 13 ? "Mild" : scores.gcs.total >= 9 ? "Moderate" : "Severe";
        addLine("  Severity", gcsSeverity);
      }

      // FOUR Score
      if (scores.four) {
        addLine("FOUR Score", `${scores.four.total}/16`);
        addLine("  Breakdown", `E${scores.four.eye} M${scores.four.motor} B${scores.four.brainstem} R${scores.four.respiration}`);
      }

      // Hunt and Hess
      if (scores.huntHess !== undefined) {
        addLine("Hunt & Hess Grade", `${scores.huntHess}`);
      }

      // WFNS
      if (scores.wfns) {
        addLine("WFNS Grade", scores.wfns.grade);
        addLine("  GCS", `${scores.wfns.gcs}`);
        addLine("  Motor Deficit", scores.wfns.motorDeficit ? "Present" : "Absent");
      }

      // ICH Score
      if (scores.ichScore !== undefined) {
        addLine("ICH Score", `${scores.ichScore}/6`);
      }

      // FUNC Score
      if (scores.funcScore !== undefined) {
        addLine("FUNC Score", `${scores.funcScore}/11`);
      }

      addSpacer();

      // Risk Scores
      const hasRiskScores = scores.cha2ds2vasc !== undefined || scores.hasbled !== undefined || scores.abcd2 !== undefined;
      if (hasRiskScores) {
        addSection("Risk Stratification Scores");
        if (scores.cha2ds2vasc !== undefined) {
          addLine("CHA₂DS₂-VASc", `${scores.cha2ds2vasc}`);
        }
        if (scores.hasbled !== undefined) {
          addLine("HAS-BLED", `${scores.hasbled}`);
        }
        if (scores.abcd2 !== undefined) {
          addLine("ABCD²", `${scores.abcd2}`);
        }
        addSpacer();
      }

      // Functional Scores
      if (scores.mrs !== undefined || scores.aspects !== undefined) {
        addSection("Functional & Imaging Scores");
        if (scores.mrs !== undefined) {
          addLine("Modified Rankin Scale", `${scores.mrs}`);
        }
        if (scores.aspects !== undefined) {
          addLine("ASPECTS", `${scores.aspects}/10`);
        }
        addSpacer();
      }

      // Completed Tests
      if (checkedTests.length > 0) {
        addSection("Completed Investigations");
        doc.setFontSize(9);
        const testsPerLine = 3;
        for (let i = 0; i < checkedTests.length; i += testsPerLine) {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const line = checkedTests.slice(i, i + testsPerLine).join(", ");
          doc.text(`• ${line}`, 20, yPos);
          yPos += lineHeight - 2;
        }
        addSpacer();
      }

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128, 128, 128);
      const footerText = "Generated by Stroke Investigation Workup Checklist - For clinical documentation purposes only";
      doc.text(footerText, pageWidth / 2, 285, { align: "center" });

      // Save PDF
      doc.save(`stroke-summary-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasAnyScores = Object.values(scores).some(v => v !== undefined);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-sky-400 dark:border-sky-600 bg-gradient-to-br from-sky-50 dark:from-sky-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-sky-100/50 dark:bg-sky-900/30">
            <CardTitle className="flex items-center justify-between text-sky-800 dark:text-sky-300">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Print Score Summary (PDF)
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Preview of what will be included */}
            <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-700">
              <h4 className="font-semibold text-sky-800 dark:text-sky-300 mb-3">PDF Will Include:</h4>
              <div className="grid gap-2 md:grid-cols-2 text-sm text-sky-700 dark:text-sky-400">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Patient Demographics (if entered)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>All calculated clinical scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Risk stratification scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Completed investigations list</span>
                </div>
              </div>
            </div>

            {/* Current Scores Summary */}
            {hasAnyScores && (
              <div className="p-4 bg-white dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-700">
                <h4 className="font-semibold text-sky-800 dark:text-sky-300 mb-2">Current Scores:</h4>
                <div className="flex flex-wrap gap-2">
                  {scores.nihss && <span className="px-2 py-1 bg-sky-100 dark:bg-sky-800 rounded text-xs">NIHSS: {scores.nihss.total}</span>}
                  {scores.gcs && <span className="px-2 py-1 bg-sky-100 dark:bg-sky-800 rounded text-xs">GCS: {scores.gcs.total}</span>}
                  {scores.four && <span className="px-2 py-1 bg-sky-100 dark:bg-sky-800 rounded text-xs">FOUR: {scores.four.total}</span>}
                  {scores.huntHess !== undefined && <span className="px-2 py-1 bg-sky-100 dark:bg-sky-800 rounded text-xs">H&H: {scores.huntHess}</span>}
                  {scores.wfns && <span className="px-2 py-1 bg-sky-100 dark:bg-sky-800 rounded text-xs">WFNS: {scores.wfns.grade}</span>}
                  {scores.cha2ds2vasc !== undefined && <span className="px-2 py-1 bg-sky-100 dark:bg-sky-800 rounded text-xs">CHA₂DS₂-VASc: {scores.cha2ds2vasc}</span>}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full bg-sky-600 hover:bg-sky-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Generate & Download PDF
                </>
              )}
            </Button>

            {/* Note */}
            <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-700 rounded-lg">
              <p className="text-xs text-sky-600 dark:text-sky-400">
                <strong>Note:</strong> The PDF includes all scores calculated during this session. 
                For complete documentation, ensure all relevant calculators have been used before generating the PDF.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
