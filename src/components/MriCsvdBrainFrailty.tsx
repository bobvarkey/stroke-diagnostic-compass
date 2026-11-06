import { useState } from "react";
import { Brain, Download, RotateCcw, ShieldAlert } from "lucide-react";
import CollapsibleModule from "./CollapsibleModule";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { tabColor } from "@/lib/tabColors";
import { buildMriCsvdReport, calculateMriCsvd, emptyMriCsvdInputs, markerNames, mriCsvdReportText, type Grade, type MriCsvdInputs } from "@/lib/mriCsvdScore";

function GradeField({ label, value, onChange }: { label: string; value: Grade; onChange: (value: Grade) => void }) {
  return <div className="space-y-2"><Label>{label}</Label>
    <Select value={value === null ? "unknown" : String(value)} onValueChange={v => onChange(v === "unknown" ? null : Number(v) as Grade)}>
      <SelectTrigger aria-label={label} className="min-h-[44px]"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="unknown">Not assessed</SelectItem>{[0, 1, 2, 3].map(v => <SelectItem key={v} value={String(v)}>Grade {v}</SelectItem>)}</SelectContent>
    </Select></div>;
}
function CountField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number | null) => void }) {
  return <div className="space-y-2"><Label>{label}</Label><Input aria-label={label} type="number" min={0} step={1} value={value ?? ""} placeholder="Not assessed" className="min-h-[44px]" onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))} /></div>;
}

export default function MriCsvdBrainFrailty() {
  const [input, setInput] = useState<MriCsvdInputs>({ ...emptyMriCsvdInputs });
  const result = calculateMriCsvd(input);
  const update = (patch: Partial<MriCsvdInputs>) => setInput(previous => ({ ...previous, ...patch }));
  const exportReport = async (format: "json" | "txt" | "pdf") => {
    if (format === "pdf") {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(11);
      const lines: string[] = doc.splitTextToSize(mriCsvdReportText(input), 180);
      let y = 20;
      lines.forEach(line => { if (y > 275) { doc.addPage(); y = 20; } doc.text(line, 15, y); y += 6; });
      doc.save("MRI-CSVD-5-report.pdf");
      return;
    }
    const text = format === "json" ? JSON.stringify(buildMriCsvdReport(input), null, 2) : mriCsvdReportText(input);
    const url = URL.createObjectURL(new Blob([text], { type: format === "json" ? "application/json" : "text/plain" }));
    const link = document.createElement("a"); link.href = url; link.download = `MRI-CSVD-5-report.${format}`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <CollapsibleModule title="CSVD / Brain Frailty — MRI-CSVD-5" icon={<Brain className="h-5 w-5 shrink-0 text-primary" />} subtitle="Study-specific MRI burden • Goulart 2026" className="bg-card/80 backdrop-blur">
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap gap-2"><Badge variant="secondary">Research use</Badge><Badge variant="outline">External validation required</Badge><Badge variant="outline">Provisional scoring thresholds</Badge></div>
      <div className="flex gap-3 border-l-4 border-destructive bg-muted/40 p-3"><ShieldAlert className="h-5 w-5 shrink-0 text-destructive" /><p><strong>Not an EVT exclusion tool.</strong> Never delay reperfusion, exclude a patient from thrombectomy or infer futility from a high score. No validated risk strata or patient-level absolute risk prediction.</p></div>
      <p className="text-muted-foreground">Five equally weighted MRI markers of chronic cerebral injury; not equivalent to the conventional total SVD score or CT Brain Frailty Score. Full scoring methods remain unverified; the supplied thresholds are provisional.</p>
      <Tabs defaultValue="score">
        <TabsList className="h-auto flex flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="score" className={`${tabColor("teal")} min-h-[44px]`}>MRI markers</TabsTrigger>
          <TabsTrigger value="evidence" className={`${tabColor("amber")} min-h-[44px]`}>Evidence & limitations</TabsTrigger>
        </TabsList>
        <TabsContent value="score" className="space-y-5 pt-3">
          <div className="divide-y divide-border">
            <section className="space-y-3 py-4"><h3 className="font-semibold">1. White matter hyperintensities <Badge variant="outline">{result.components.wmh ?? "Not assessed"}</Badge></h3>
              <p className="text-muted-foreground">FLAIR / T2 • Study-defined Fazekas ≥2: 1 point. Do not infer the study grade by combining periventricular and deep grades.</p>
              <div className="grid gap-3 sm:grid-cols-3"><GradeField label="Periventricular Fazekas" value={input.periventricularFazekas} onChange={v => update({ periventricularFazekas: v })} /><GradeField label="Deep Fazekas" value={input.deepFazekas} onChange={v => update({ deepFazekas: v })} /><GradeField label="Study-defined Fazekas" value={input.studyFazekas} onChange={v => update({ studyFazekas: v })} /></div>
            </section>
            <section className="space-y-3 py-4"><h3 className="font-semibold">2. Chronic lacunes <Badge variant="outline">{result.components.lacunes ?? "Not assessed"}</Badge></h3><p className="text-muted-foreground">T1 / T2 / FLAIR • At least 1 chronic subcortical CSF-like cavity: 1 point. Exclude perivascular spaces and mimics.</p><CountField label="Chronic lacune count" value={input.lacunes} onChange={v => update({ lacunes: v })} /></section>
            <section className="space-y-3 py-4"><h3 className="font-semibold">3. Global cortical atrophy <Badge variant="outline">{result.components.atrophy ?? "Not assessed"}</Badge></h3><p className="text-muted-foreground">T1 / T2 • Pasquier GCA ≥2: 1 point. Study-specific global grading requires full-methods verification.</p><GradeField label="Pasquier GCA" value={input.gca} onChange={v => update({ gca: v })} /></section>
            <section className="space-y-3 py-4"><h3 className="font-semibold">4. Enlarged perivascular spaces <Badge variant="outline">{result.components.epvs ?? "Not assessed"}</Badge></h3><p className="text-muted-foreground">T2 • More than 10 EPVS: 1 point, only with a verified regional counting protocol. An unknown protocol remains incomplete, not zero.</p>
              <div className="grid gap-3 sm:grid-cols-2"><CountField label="EPVS count" value={input.epvs} onChange={v => update({ epvs: v })} /><div className="space-y-2"><Label htmlFor="csvd-epvs-region">EPVS counting region</Label><Input id="csvd-epvs-region" value={input.epvsRegion} maxLength={200} className="min-h-[44px]" onChange={e => update({ epvsRegion: e.target.value })} /></div></div>
              <div className="flex min-h-[44px] items-center gap-3"><Checkbox id="csvd-epvs-verified" checked={input.epvsProtocolVerified} onCheckedChange={v => update({ epvsProtocolVerified: v === true })} /><Label htmlFor="csvd-epvs-verified">Region and counting protocol verified against the original study methods</Label></div>
            </section>
            <section className="space-y-3 py-4"><h3 className="font-semibold">5. Cerebral microbleeds <Badge variant="outline">{result.components.microbleeds ?? "Not assessed"}</Badge></h3><p className="text-muted-foreground">SWI / T2*-GRE • At least 1 microbleed: 1 point. Exclude calcification, vessels and susceptibility artifacts.</p>
              <div className="grid gap-3 sm:grid-cols-2"><CountField label="Microbleed count" value={input.microbleeds} onChange={v => update({ microbleeds: v })} /><div className="space-y-2"><Label>Microbleed distribution</Label><Select value={input.microbleedDistribution} onValueChange={v => update({ microbleedDistribution: v as MriCsvdInputs["microbleedDistribution"] })}><SelectTrigger aria-label="Microbleed distribution" className="min-h-[44px]"><SelectValue /></SelectTrigger><SelectContent>{["unknown", "none", "strictly_lobar", "deep", "mixed", "infratentorial"].map(v => <SelectItem key={v} value={v}>{v.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div></div>
            </section>
          </div>
          <div aria-live="polite" className="space-y-2 border-y border-border py-4">
            <p className="text-lg font-semibold tabular-nums">{result.totalScore === null ? `Incomplete — ${result.assessed}/5 markers assessed` : `Total CSVD score: ${result.totalScore}/5`}</p>
            {result.totalScore === null ? <><p>Observed points: {result.observedScore} (not a total score).</p><p className="text-muted-foreground">Missing: {result.missing.map(key => markerNames[key]).join(", ") || "invalid raw input"}.</p></> : <p>{result.totalScore === 0 ? "No positive markers under the specified criteria." : "Increasing cumulative burden of MRI-defined chronic cerebral injury; supports counselling and rehabilitation planning, not treatment futility."}</p>}
            {result.errors.map(error => <p key={error} className="text-destructive" role="alert">{error}</p>)}
          </div>
          <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => void exportReport("json")} className="min-h-[44px]"><Download className="mr-2 h-4 w-4" />JSON</Button><Button variant="outline" onClick={() => void exportReport("pdf")} className="min-h-[44px]"><Download className="mr-2 h-4 w-4" />PDF</Button><Button variant="outline" onClick={() => void exportReport("txt")} className="min-h-[44px]"><Download className="mr-2 h-4 w-4" />Text</Button><Button variant="ghost" aria-label="Reset MRI-CSVD score" title="Reset score" onClick={() => setInput({ ...emptyMriCsvdInputs })} className="min-h-[44px]"><RotateCcw className="h-4 w-4" /></Button></div>
        </TabsContent>
        <TabsContent value="evidence" className="space-y-4 pt-3">
          <h3 className="font-semibold">Goulart et al. — International Journal of Stroke, 2026</h3>
          <p>Retrospective two-centre cohort, 2015–2022: 479 anterior-circulation LVO patients treated with thrombectomy, with pre-treatment STRIVE-2 MRI. Primary endpoint: dependence or death (90-day mRS 3–6).</p>
          <p>Bayesian logistic regression adjusted for age, sex, thrombolysis, infarct volume, time-to-puncture and reperfusion status. These variables are study metadata, not score components.</p>
          <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-border"><th className="p-2">Association</th><th className="p-2">Adjusted OR (95% credible interval)</th><th className="p-2">Posterior probability</th></tr></thead><tbody>{[
            ["mRS 3–6, per point", "1.44 (1.23–1.69)", ">99%"], ["sICH, per point", "1.33 (0.92–1.93)", "94%"], ["Lacunes", "2.07 (1.22–3.59)", ">99%"], ["Atrophy", "1.92 (1.09–3.40)", "99%"], ["WMH", "1.63 (0.94–2.84)", "96%"],
          ].map(row => <tr key={row[0]} className="border-b border-border">{row.map(cell => <td key={cell} className="p-2">{cell}</td>)}</tr>)}</tbody></table></div>
          <p>1.44 represents 44% greater adjusted odds per additional point, not 44% greater absolute risk. The sICH and WMH intervals include 1; these associations are less certain. EPVS and microbleeds were not independently associated in the conference report described in your supplied document; nevertheless, each contributes equally to the composite.</p>
          <p className="text-muted-foreground">Abstract-level composite findings verified; full methods are unavailable. Detailed thresholds and individual-marker estimates follow the supplied evidence document. Limitations include retrospective design, MRI-selected patients, reported single-reader assessment, limited sICH events, no untreated comparator and no external validation.</p>
          <p className="text-muted-foreground">Before protocol-level use, verify Fazekas aggregation, lacune definition, global atrophy grading, EPVS region/counting method, microbleed exclusions and supplementary instructions against full methods.</p>
          <div className="flex flex-wrap gap-4"><a href="https://doi.org/10.1177/17474930261490798" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-primary underline">Original article</a><a href="https://pubmed.ncbi.nlm.nih.gov/42728583/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-primary underline">PubMed: 42728583</a></div>
        </TabsContent>
      </Tabs>
    </div>
  </CollapsibleModule>;
}