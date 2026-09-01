import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileType2, Loader2, Copy, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

export interface SDHChecklistItem {
  id: string;
  label: string;
  required?: boolean;
  highlight?: boolean;
}

export interface SDHExportProps {
  imagingChecks: SDHChecklistItem[];
  clinicalChecks: SDHChecklistItem[];
  checked: Set<string>;
  result: { label: string; text: string };
  /** Optional structured radiology reporting template lines */
  reportingTemplate?: string[];
}

const mark = (on: boolean) => (on ? "[x]" : "[ ]");

export function buildSDHReport({
  imagingChecks,
  clinicalChecks,
  checked,
  result,
  reportingTemplate,
}: SDHExportProps): string {
  const lines: string[] = [];
  const hdcs = checked.has("hdcs");

  lines.push("SDH / MMAE ELIGIBILITY REPORT");
  lines.push("=".repeat(58));
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");

  lines.push("ASSESSMENT OUTCOME");
  lines.push("-".repeat(58));
  lines.push(`  ${result.label}`);
  lines.push(`  ${result.text}`);
  lines.push("");

  lines.push("HYPERDENSE CAPSULE SIGN (HDCS)");
  lines.push("-".repeat(58));
  lines.push(`  HDCS on NCCT: ${hdcs ? "PRESENT" : "Not documented / absent"}`);
  lines.push(
    hdcs
      ? "  HDCS reflects a vascularized outer neomembrane. In nonacute SDH its"
      : "  HDCS absence does not exclude MMAE, but expected benefit may be lower.",
  );
  if (hdcs) {
    lines.push("  presence was associated with lower recurrence/progression after MMAE");
    lines.push("  versus usual care (NCT04700345; Radiology 2026).");
  }
  lines.push("");

  lines.push("KEY IMAGING PREREQUISITES");
  lines.push("-".repeat(58));
  imagingChecks.forEach((c) =>
    lines.push(`  ${mark(checked.has(c.id))} ${c.label}${c.required ? " *" : ""}`),
  );
  lines.push("");

  lines.push("CLINICAL PREREQUISITES");
  lines.push("-".repeat(58));
  clinicalChecks.forEach((c) => lines.push(`  ${mark(checked.has(c.id))} ${c.label}`));
  lines.push("");

  const total = imagingChecks.length + clinicalChecks.length;
  lines.push(`COMPLETION: ${checked.size}/${total} items documented`);
  lines.push("");

  if (reportingTemplate?.length) {
    lines.push("SUGGESTED STRUCTURED RADIOLOGY REPORT");
    lines.push("-".repeat(58));
    reportingTemplate.forEach((t) => lines.push(`  - ${t}`));
    lines.push("");
  }

  lines.push("-".repeat(58));
  lines.push(
    "Refs: Radiology 2026 (HDCS as MMAE biomarker); EMBOLISE, MAGIC-MT, STEM;",
  );
  lines.push("AHA/ASA cSDH Scientific Statement 2025. NCT04700345.");
  lines.push("Decision support only — not a substitute for clinical judgement.");
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

export default function SDHChecklistExport(props: SDHExportProps) {
  const [busy, setBusy] = useState(false);
  const stamp = new Date().toISOString().split("T")[0];

  const exportPDF = () => {
    try {
      setBusy(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 14;
      const bottom = 278;
      let y = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("SDH / MMAE Eligibility Report", pageWidth / 2, y, { align: "center" });
      y += 8;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, {
        align: "center",
      });
      y += 9;
      doc.setTextColor(0);

      const body = buildSDHReport(props).split("\n").slice(3).join("\n");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(body, pageWidth - marginX * 2);
      wrapped.forEach((line: string) => {
        if (y + 6 > bottom) {
          doc.addPage();
          y = 20;
        }
        const trimmed = line.trim();
        const isHeading =
          /^[A-Z0-9 &()/*.,:-]+$/.test(trimmed) && trimmed.length > 3 && !line.startsWith(" ");
        if (isHeading) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(190, 74, 24);
          doc.text(line, marginX, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0);
        } else {
          doc.text(line, marginX, y);
        }
        y += 5;
      });

      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(`Stroke Companion — SDH checklist — page ${i} of ${pages}`, pageWidth / 2, 289, {
          align: "center",
        });
      }

      doc.save(`sdh-mmae-checklist-${stamp}.pdf`);
      toast.success("PDF report downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF");
    } finally {
      setBusy(false);
    }
  };

  const exportText = () => {
    try {
      setBusy(true);
      downloadBlob(
        buildSDHReport(props),
        `sdh-mmae-checklist-${stamp}.txt`,
        "text/plain;charset=utf-8",
      );
      toast.success("Text report downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export text report");
    } finally {
      setBusy(false);
    }
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildSDHReport(props));
      toast.success("Report copied to clipboard");
    } catch {
      toast.error("Clipboard unavailable — use the text download instead");
    }
  };

  const shareReport = async () => {
    const text = buildSDHReport(props);
    if (navigator.share) {
      try {
        await navigator.share({ title: "SDH / MMAE Eligibility Report", text });
      } catch (e) {
        if ((e as DOMException)?.name !== "AbortError") toast.error("Sharing failed");
      }
    } else {
      await copyReport();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          disabled={busy}
          className="bg-gradient-sunset text-primary-foreground border-0 shadow-md hover:opacity-90"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export checklist
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-50">
        <DropdownMenuItem onClick={exportPDF} disabled={busy}>
          <FileType2 className="h-4 w-4 mr-2 text-primary" />
          Printable PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportText} disabled={busy}>
          <FileText className="h-4 w-4 mr-2 text-primary" />
          Plain text (.txt)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={shareReport}>
          <Share2 className="h-4 w-4 mr-2 text-primary" />
          Share report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyReport}>
          <Copy className="h-4 w-4 mr-2 text-primary" />
          Copy to clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
