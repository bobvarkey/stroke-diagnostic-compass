import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileType2, Loader2 } from "lucide-react";
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

const cap = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ") : "";

const nihssSeverity = (n: number) =>
  n <= 4 ? "Minor" : n <= 15 ? "Moderate" : n <= 20 ? "Moderate-Severe" : "Severe";
const gcsSeverity = (n: number) => (n >= 13 ? "Mild" : n >= 9 ? "Moderate" : "Severe");

/** Build a plain-text report (also used as the source-of-truth for PDF body). */
function buildTextReport({ scores, demographics, checkedTests }: Props): string {
  const lines: string[] = [];
  const now = new Date().toLocaleString();

  lines.push("STROKE INVESTIGATION SUMMARY");
  lines.push("=".repeat(50));
  lines.push(`Generated: ${now}`);
  lines.push("");

  if (demographics.age || demographics.sex || demographics.race) {
    lines.push("PATIENT DEMOGRAPHICS");
    lines.push("-".repeat(50));
    if (demographics.age) lines.push(`  Age: ${demographics.age} years`);
    if (demographics.sex) lines.push(`  Sex: ${cap(demographics.sex)}`);
    if (demographics.race) lines.push(`  Race/Ethnicity: ${cap(demographics.race)}`);
    lines.push("");
  }

  const hasClinical =
    scores.nihss ||
    scores.gcs ||
    scores.four ||
    scores.huntHess !== undefined ||
    scores.wfns ||
    scores.ichScore !== undefined ||
    scores.funcScore !== undefined;

  if (hasClinical) {
    lines.push("CLINICAL SCORES");
    lines.push("-".repeat(50));
    if (scores.nihss) {
      lines.push(`  NIHSS Total: ${scores.nihss.total}/42  (${nihssSeverity(scores.nihss.total)})`);
    }
    if (scores.gcs) {
      lines.push(
        `  GCS Total: ${scores.gcs.total}/15  [E${scores.gcs.eye} V${scores.gcs.verbal} M${scores.gcs.motor}]  (${gcsSeverity(scores.gcs.total)})`,
      );
    }
    if (scores.four) {
      lines.push(
        `  FOUR Score: ${scores.four.total}/16  [E${scores.four.eye} M${scores.four.motor} B${scores.four.brainstem} R${scores.four.respiration}]`,
      );
    }
    if (scores.huntHess !== undefined) lines.push(`  Hunt & Hess Grade: ${scores.huntHess}`);
    if (scores.wfns) {
      lines.push(
        `  WFNS Grade: ${scores.wfns.grade}  [GCS ${scores.wfns.gcs}, motor deficit ${scores.wfns.motorDeficit ? "present" : "absent"}]`,
      );
    }
    if (scores.ichScore !== undefined) lines.push(`  ICH Score: ${scores.ichScore}/6`);
    if (scores.funcScore !== undefined) lines.push(`  FUNC Score: ${scores.funcScore}/11`);
    lines.push("");
  }

  const hasRisk =
    scores.cha2ds2vasc !== undefined || scores.hasbled !== undefined || scores.abcd2 !== undefined;
  if (hasRisk) {
    lines.push("RISK STRATIFICATION");
    lines.push("-".repeat(50));
    if (scores.cha2ds2vasc !== undefined) lines.push(`  CHA2DS2-VASc: ${scores.cha2ds2vasc}`);
    if (scores.hasbled !== undefined) lines.push(`  HAS-BLED: ${scores.hasbled}`);
    if (scores.abcd2 !== undefined) lines.push(`  ABCD2: ${scores.abcd2}`);
    lines.push("");
  }

  if (scores.mrs !== undefined || scores.aspects !== undefined) {
    lines.push("FUNCTIONAL & IMAGING");
    lines.push("-".repeat(50));
    if (scores.mrs !== undefined) lines.push(`  Modified Rankin Scale: ${scores.mrs}`);
    if (scores.aspects !== undefined) lines.push(`  ASPECTS: ${scores.aspects}/10`);
    lines.push("");
  }

  if (checkedTests.length > 0) {
    lines.push(`COMPLETED INVESTIGATIONS (${checkedTests.length})`);
    lines.push("-".repeat(50));
    checkedTests.forEach((t) => lines.push(`  • ${t}`));
    lines.push("");
  }

  lines.push("-".repeat(50));
  lines.push("For clinical documentation purposes only.");
  return lines.join("\n");
}

function downloadBlob(content: BlobPart, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function WorkupExportButton(props: Props) {
  const [busy, setBusy] = useState(false);
  const stamp = new Date().toISOString().split("T")[0];

  const exportText = () => {
    try {
      setBusy(true);
      const text = buildTextReport(props);
      downloadBlob(text, `stroke-workup-${stamp}.txt`, "text/plain;charset=utf-8");
      toast.success("Text report downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export text report");
    } finally {
      setBusy(false);
    }
  };

  const exportPDF = () => {
    try {
      setBusy(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 14;
      const bottom = 280;
      let y = 20;

      const newPageIfNeeded = (needed = 8) => {
        if (y + needed > bottom) {
          doc.addPage();
          y = 20;
        }
      };

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Stroke Investigation Summary", pageWidth / 2, y, { align: "center" });
      y += 8;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: "center" });
      y += 8;
      doc.setTextColor(0);

      // Body — reuse text report, render line by line so page breaks work
      const text = buildTextReport(props);
      // Drop the first three lines (title + rule + generated) already rendered above
      const body = text.split("\n").slice(3).join("\n");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(body, pageWidth - marginX * 2);
      wrapped.forEach((line: string) => {
        newPageIfNeeded(6);
        // Section headings in blue
        if (/^[A-Z0-9 &().-]+$/.test(line.trim()) && line.trim().length > 3 && !line.startsWith(" ")) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 102, 153);
          doc.text(line, marginX, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0);
        } else {
          doc.text(line, marginX, y);
        }
        y += 5;
      });

      // Footer on every page
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Stroke Workup Checklist — page ${i} of ${pages}`,
          pageWidth / 2,
          289,
          { align: "center" },
        );
      }

      doc.save(`stroke-workup-${stamp}.pdf`);
      toast.success("PDF report downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={busy}
          className="bg-gradient-sunset text-primary-foreground border-0 shadow-md hover:opacity-90"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={exportPDF} disabled={busy}>
          <FileType2 className="h-4 w-4 mr-2 text-primary" />
          Formatted PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportText} disabled={busy}>
          <FileText className="h-4 w-4 mr-2 text-primary" />
          Plain text (.txt)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
