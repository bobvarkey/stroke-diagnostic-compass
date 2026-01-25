import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";

interface RiskCategory {
  name: string;
  ldlTarget: string;
  optionalTarget?: string;
  nonHdlTarget?: string;
  apoBTarget?: string;
}

interface LipidRiskPDFReportProps {
  riskCategory: RiskCategory;
  selectedFactors: string[];
  factorLabels: Record<string, string>;
  lipidValues?: {
    totalCholesterol?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    nonHdl?: number;
    apoB?: number;
  };
}

const LipidRiskPDFReport: React.FC<LipidRiskPDFReportProps> = ({
  riskCategory,
  selectedFactors,
  factorLabels,
  lipidValues
}) => {
  const generatePDF = () => {
    const pdf = new jsPDF();
    const margin = 20;
    let y = margin;

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(220, 38, 38); // Red for emphasis
    pdf.text("Cardiovascular Risk Assessment Report", margin, y);
    y += 8;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text("Based on LAI 2024 Indian Guidelines", margin, y);
    y += 15;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Report Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 15;

    // Risk Category Box
    pdf.setFillColor(254, 243, 199); // Yellow background
    pdf.rect(margin, y, 170, 30, "F");
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(180, 83, 9);
    pdf.text("RISK CLASSIFICATION", margin + 5, y + 10);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(riskCategory.name.toUpperCase(), margin + 5, y + 22);
    y += 38;

    // Targets Section
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Treatment Targets", margin, y);
    y += 8;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    
    // LDL-C Target
    pdf.setFont("helvetica", "bold");
    pdf.text("LDL-C (Primary Target):", margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(riskCategory.ldlTarget, margin + 55, y);
    y += 7;

    if (riskCategory.optionalTarget) {
      pdf.text(`Optional Target: ${riskCategory.optionalTarget}`, margin + 10, y);
      y += 7;
    }

    // Non-HDL-C Target
    if (riskCategory.nonHdlTarget) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Non-HDL-C (Co-Primary):", margin, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(riskCategory.nonHdlTarget, margin + 55, y);
      y += 7;
    }

    // ApoB Target
    if (riskCategory.apoBTarget) {
      pdf.setFont("helvetica", "bold");
      pdf.text("ApoB (Secondary):", margin, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(riskCategory.apoBTarget, margin + 55, y);
      y += 7;
    }

    y += 8;

    // Current Lipid Values (if provided)
    if (lipidValues && Object.values(lipidValues).some(v => v !== undefined)) {
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Current Lipid Profile", margin, y);
      y += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      if (lipidValues.totalCholesterol) {
        pdf.text(`Total Cholesterol: ${lipidValues.totalCholesterol} mg/dL`, margin, y);
        y += 6;
      }
      if (lipidValues.ldl !== undefined) {
        const atTarget = parseInt(riskCategory.ldlTarget.replace(/[<≤]/g, "")) >= lipidValues.ldl;
        pdf.text(`LDL-C: ${lipidValues.ldl} mg/dL ${atTarget ? "(AT TARGET)" : "(ABOVE TARGET)"}`, margin, y);
        y += 6;
      }
      if (lipidValues.hdl !== undefined) {
        pdf.text(`HDL-C: ${lipidValues.hdl} mg/dL`, margin, y);
        y += 6;
      }
      if (lipidValues.triglycerides !== undefined) {
        pdf.text(`Triglycerides: ${lipidValues.triglycerides} mg/dL`, margin, y);
        y += 6;
      }
      if (lipidValues.nonHdl !== undefined) {
        pdf.text(`Non-HDL-C: ${lipidValues.nonHdl} mg/dL (calculated)`, margin, y);
        y += 6;
      }
      if (lipidValues.apoB !== undefined) {
        pdf.text(`ApoB: ${lipidValues.apoB} mg/dL`, margin, y);
        y += 6;
      }
      y += 8;
    }

    // Selected Risk Factors
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Identified Risk Factors", margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    if (selectedFactors.length === 0) {
      pdf.text("No significant risk factors identified", margin, y);
      y += 6;
    } else {
      selectedFactors.forEach((factor) => {
        const label = factorLabels[factor] || factor;
        // Handle line wrapping for long labels
        const lines = pdf.splitTextToSize(`• ${label}`, 170);
        lines.forEach((line: string) => {
          if (y > 270) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(line, margin, y);
          y += 5;
        });
      });
    }

    y += 10;

    // Timeline Recommendations
    if (y > 240) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Treatment Timeline (LAI 2024)", margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const timeline = [
      "• Start lipid-lowering therapy immediately upon diagnosis",
      "• Check lipid panel at 4-6 weeks after initiation",
      "• Intensify therapy every 2 weeks if not at target",
      "• Stable ASCVD: Achieve LDL-C target by Week 12",
      "• ACS patients: Achieve LDL-C target by Week 4",
      "• Annual lipid monitoring once at target"
    ];

    timeline.forEach(item => {
      pdf.text(item, margin, y);
      y += 6;
    });

    y += 10;

    // Disclaimer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    const disclaimer = "This report is generated based on LAI 2024 Consensus Statement IV guidelines for Indian patients. Clinical judgment should be applied. This tool is for educational purposes and does not replace professional medical advice.";
    const disclaimerLines = pdf.splitTextToSize(disclaimer, 170);
    disclaimerLines.forEach((line: string) => {
      pdf.text(line, margin, y);
      y += 4;
    });

    pdf.save("lipid-risk-assessment-report.pdf");
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      <FileText className="h-4 w-4" />
      Export PDF Report
    </Button>
  );
};

export default LipidRiskPDFReport;
