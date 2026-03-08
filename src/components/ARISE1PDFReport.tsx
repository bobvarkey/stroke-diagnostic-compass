import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface ARISE1PDFReportProps {
  cSDHScore?: number;
  riskLevel?: string;
  selectedFactors?: string[];
}

export default function ARISE1PDFReport({ cSDHScore, riskLevel, selectedFactors = [] }: ARISE1PDFReportProps) {
  const generatePDF = () => {
    const pdf = new jsPDF();
    const margin = 15;
    let y = margin;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    // Helper functions
    const addTitle = (text: string, size: number = 16) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", "bold");
      pdf.text(text, margin, y);
      y += size * 0.5 + 2;
    };

    const addSubtitle = (text: string) => {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 100, 150);
      pdf.text(text, margin, y);
      y += 6;
      pdf.setTextColor(0, 0, 0);
    };

    const addText = (text: string, indent: number = 0) => {
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(text, contentWidth - indent);
      lines.forEach((line: string) => {
        if (y > 275) { pdf.addPage(); y = margin; }
        pdf.text(line, margin + indent, y);
        y += 5;
      });
    };

    const addBullet = (text: string, indent: number = 5) => {
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(`• ${text}`, contentWidth - indent - 3);
      lines.forEach((line: string, idx: number) => {
        if (y > 275) { pdf.addPage(); y = margin; }
        pdf.text(idx === 0 ? line : `  ${line}`, margin + indent, y);
        y += 5;
      });
    };

    const addSpacer = (size: number = 6) => { y += size; };

    const checkPageBreak = (needed: number = 30) => {
      if (y > 280 - needed) { pdf.addPage(); y = margin; }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TITLE
    // ═══════════════════════════════════════════════════════════════════════
    pdf.setFillColor(0, 128, 128);
    pdf.rect(0, 0, pageWidth, 25, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("ARISE I Consensus Framework", margin, 16);
    pdf.setFontSize(10);
    pdf.text("Management of Chronic Subdural Hematoma (cSDH)", margin, 22);
    y = 32;
    pdf.setTextColor(0, 0, 0);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 10;

    // ═══════════════════════════════════════════════════════════════════════
    // PATIENT STRATIFICATION MATRIX
    // ═══════════════════════════════════════════════════════════════════════
    addTitle("1. Patient Stratification Matrix", 14);
    addSpacer(2);

    // Draw table
    const colWidths = [45, 55, 80];
    const tableX = margin;
    let tableY = y;
    const rowHeight = 12;

    // Header
    pdf.setFillColor(0, 100, 150);
    pdf.rect(tableX, tableY, contentWidth, rowHeight, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("Category", tableX + 3, tableY + 8);
    pdf.text("Criteria", tableX + colWidths[0] + 3, tableY + 8);
    pdf.text("Management", tableX + colWidths[0] + colWidths[1] + 3, tableY + 8);
    tableY += rowHeight;
    pdf.setTextColor(0, 0, 0);

    // Emergent Row
    pdf.setFillColor(255, 230, 230);
    pdf.rect(tableX, tableY, contentWidth, rowHeight * 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("EMERGENT", tableX + 3, tableY + 8);
    pdf.setFont("helvetica", "normal");
    pdf.text("GCS < 9 or", tableX + colWidths[0] + 3, tableY + 6);
    pdf.text("mRS 4-5 or", tableX + colWidths[0] + 3, tableY + 11);
    pdf.text("Herniation signs", tableX + colWidths[0] + 3, tableY + 16);
    pdf.text("Immediate surgical evacuation", tableX + colWidths[0] + colWidths[1] + 3, tableY + 8);
    pdf.text("(BH, Craniotomy)", tableX + colWidths[0] + colWidths[1] + 3, tableY + 14);
    tableY += rowHeight * 2;

    // Stable Row
    pdf.setFillColor(230, 255, 230);
    pdf.rect(tableX, tableY, contentWidth, rowHeight * 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.text("STABLE", tableX + 3, tableY + 8);
    pdf.setFont("helvetica", "normal");
    pdf.text("GCS ≥ 9 and", tableX + colWidths[0] + 3, tableY + 6);
    pdf.text("mRS 0-3 and", tableX + colWidths[0] + 3, tableY + 11);
    pdf.text("No herniation", tableX + colWidths[0] + 3, tableY + 16);
    pdf.text("Consider MMAE ± Surgery", tableX + colWidths[0] + colWidths[1] + 3, tableY + 8);
    pdf.text("(MMAE alone if symptomatic improvement)", tableX + colWidths[0] + colWidths[1] + 3, tableY + 14);
    tableY += rowHeight * 2;

    // Draw borders
    pdf.setDrawColor(100, 100, 100);
    pdf.rect(tableX, y, contentWidth, tableY - y, "S");
    pdf.line(tableX + colWidths[0], y, tableX + colWidths[0], tableY);
    pdf.line(tableX + colWidths[0] + colWidths[1], y, tableX + colWidths[0] + colWidths[1], tableY);

    y = tableY + 8;

    // ═══════════════════════════════════════════════════════════════════════
    // DECISION ALGORITHM
    // ═══════════════════════════════════════════════════════════════════════
    checkPageBreak(60);
    addTitle("2. ARISE I Decision Algorithm", 14);
    addSpacer(2);

    addSubtitle("Step 1: Clinical Assessment");
    addBullet("Assess GCS, mRS, and signs of herniation (pupil asymmetry, posturing)");
    addBullet("If emergent → Proceed directly to surgical evacuation");
    addSpacer(3);

    addSubtitle("Step 2: Imaging Evaluation");
    addBullet("Measure hematoma thickness (mm) and midline shift (mm)");
    addBullet("Classify Nakaguchi morphology (Homogeneous / Layered / Separated / Trabecular)");
    addBullet("Note laterality (Unilateral vs Bilateral)");
    addSpacer(3);

    addSubtitle("Step 3: Risk Factor Assessment");
    addBullet("Anticoagulation / Antiplatelet therapy status");
    addBullet("Age ≥ 80 years");
    addBullet("Hemodialysis dependence");
    addBullet("Prior recurrence history");
    addSpacer(3);

    addSubtitle("Step 4: Treatment Selection");
    addText("STABLE patients (GCS ≥9, mRS 0-3):", 0);
    addBullet("Symptomatic improvement → Consider MMAE alone", 10);
    addBullet("No improvement / High recurrence risk → MMAE + Surgery", 10);
    addBullet("Surgery options: Burr hole (BH), Twist drill (TD), Craniotomy", 10);
    addSpacer(3);

    // ═══════════════════════════════════════════════════════════════════════
    // MMAE GUIDANCE
    // ═══════════════════════════════════════════════════════════════════════
    checkPageBreak(50);
    addTitle("3. Middle Meningeal Artery Embolization (MMAE)", 14);
    addSpacer(2);

    addSubtitle("Embolic Agent Selection");
    const agents = [
      { name: "Liquid Agents (Onyx, PHIL, n-BCA)", desc: "Most penetrating; highest procedural success; recommended for experienced operators" },
      { name: "Particles (PVA, Embospheres)", desc: "Easier handling; moderate penetration; acceptable alternative" },
      { name: "Coils", desc: "Proximal occlusion only; lowest penetration; may require adjunctive agents" },
    ];
    agents.forEach(a => {
      pdf.setFont("helvetica", "bold");
      addText(`${a.name}:`, 5);
      pdf.setFont("helvetica", "normal");
      addText(a.desc, 10);
    });
    addSpacer(3);

    addSubtitle("Technical Considerations");
    addBullet("Access: Radial preferred (especially elderly/coagulopathy) or femoral");
    addBullet("Target: Microcatheter above anterior clinoid, frontal/parietal MMA branches");
    addBullet("Avoid: Dural-pial and meningo-ophthalmic anastomoses");
    addBullet("Anesthesia: Conscious sedation + intra-arterial lidocaine for DMSO agents");
    addSpacer(3);

    // ═══════════════════════════════════════════════════════════════════════
    // RECURRENCE RISK FACTORS
    // ═══════════════════════════════════════════════════════════════════════
    checkPageBreak(45);
    addTitle("4. Recurrence Risk Factors (ARISE I Criteria)", 14);
    addSpacer(2);

    addSubtitle("Imaging Factors");
    addBullet("Nakaguchi Separated or Trabecular morphology (+2 points each)");
    addBullet("Thickness ≥ 20mm (+1 point)");
    addBullet("Midline shift ≥ 10mm (+1 point)");
    addBullet("Bilateral hematoma (+2 points)");
    addSpacer(2);

    addSubtitle("Clinical Factors");
    addBullet("Anticoagulation therapy (+2 points)");
    addBullet("Antiplatelet therapy (+1 point)");
    addBullet("Age ≥ 80 years (+1 point)");
    addBullet("Hemodialysis (+2 points)");
    addBullet("Liver cirrhosis (+1 point)");
    addBullet("Diabetes mellitus (+1 point)");
    addSpacer(2);

    addSubtitle("Treatment Factors");
    addBullet("No post-operative drain (+2 points)");
    addBullet("Incomplete drainage (+2 points)");
    addSpacer(3);

    // ═══════════════════════════════════════════════════════════════════════
    // RISK STRATIFICATION TABLE
    // ═══════════════════════════════════════════════════════════════════════
    checkPageBreak(40);
    addTitle("5. Risk Stratification", 14);
    addSpacer(2);

    const riskTable = [
      { score: "0-3", level: "Low Risk", rate: "5-10%", action: "Standard follow-up" },
      { score: "4-7", level: "Moderate Risk", rate: "15-25%", action: "Consider adjunctive MMAE" },
      { score: "8-12", level: "High Risk", rate: "30-45%", action: "MMAE strongly recommended" },
      { score: "≥13", level: "Very High Risk", rate: "≥50%", action: "MMAE + aggressive management" },
    ];

    const riskTableY = y;
    const riskColWidths = [25, 40, 35, 80];
    
    // Header
    pdf.setFillColor(100, 100, 100);
    pdf.rect(tableX, y, contentWidth, 10, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("Score", tableX + 3, y + 7);
    pdf.text("Risk Level", tableX + riskColWidths[0] + 3, y + 7);
    pdf.text("Recurrence", tableX + riskColWidths[0] + riskColWidths[1] + 3, y + 7);
    pdf.text("Recommendation", tableX + riskColWidths[0] + riskColWidths[1] + riskColWidths[2] + 3, y + 7);
    y += 10;
    pdf.setTextColor(0, 0, 0);

    riskTable.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(tableX, y, contentWidth, 9, "F");
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(row.score, tableX + 3, y + 6);
      pdf.text(row.level, tableX + riskColWidths[0] + 3, y + 6);
      pdf.text(row.rate, tableX + riskColWidths[0] + riskColWidths[1] + 3, y + 6);
      pdf.text(row.action, tableX + riskColWidths[0] + riskColWidths[1] + riskColWidths[2] + 3, y + 6);
      y += 9;
    });

    pdf.setDrawColor(100, 100, 100);
    pdf.rect(tableX, riskTableY, contentWidth, y - riskTableY, "S");
    y += 8;

    // ═══════════════════════════════════════════════════════════════════════
    // KEY TRIAL EVIDENCE
    // ═══════════════════════════════════════════════════════════════════════
    checkPageBreak(50);
    addTitle("6. Key Trial Evidence", 14);
    addSpacer(2);

    const trials = [
      { name: "EMBOLISE", result: "MMAE + surgery reduced recurrence vs surgery alone (4.1% vs 11.5%)" },
      { name: "STEM", result: "MMAE alone non-inferior to surgery for select stable cSDH" },
      { name: "MAGIC-MT", result: "MMAE reduced surgical re-intervention rates" },
    ];

    trials.forEach(t => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(`${t.name}:`, margin, y);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(t.result, contentWidth - 25);
      lines.forEach((line: string, idx: number) => {
        pdf.text(line, margin + 25, y + idx * 5);
      });
      y += Math.max(lines.length * 5, 6) + 2;
    });
    addSpacer(3);

    // ═══════════════════════════════════════════════════════════════════════
    // CURRENT PATIENT (if score provided)
    // ═══════════════════════════════════════════════════════════════════════
    if (cSDHScore !== undefined) {
      checkPageBreak(30);
      pdf.setFillColor(255, 250, 230);
      pdf.rect(margin, y, contentWidth, 25, "F");
      pdf.setDrawColor(200, 150, 50);
      pdf.rect(margin, y, contentWidth, 25, "S");
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(150, 100, 0);
      pdf.text("Current Patient Assessment", margin + 3, y + 8);
      
      pdf.setFontSize(10);
      pdf.text(`Risk Score: ${cSDHScore}`, margin + 3, y + 16);
      pdf.text(`Risk Level: ${riskLevel || "N/A"}`, margin + 60, y + 16);
      
      if (selectedFactors && selectedFactors.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Factors: ${selectedFactors.slice(0, 4).join(", ")}${selectedFactors.length > 4 ? "..." : ""}`, margin + 3, y + 22);
      }
      y += 30;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════════════════════════════════
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100);
    pdf.text("ARISE I Consensus Framework - For clinical reference only. Based on 2024 consensus guidelines.", margin, 285);
    pdf.text("Generated by Stroke Investigation Workup Checklist", pageWidth - margin - 60, 285);

    // Save
    pdf.save(`ARISE-I-cSDH-Framework-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("ARISE I PDF generated successfully!");
  };

  return (
    <Button 
      onClick={generatePDF} 
      variant="outline" 
      className="flex items-center gap-2 border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
    >
      <Download className="h-4 w-4" />
      <FileText className="h-4 w-4" />
      <span className="hidden sm:inline">Export ARISE I PDF</span>
      <span className="sm:hidden">PDF</span>
    </Button>
  );
}
