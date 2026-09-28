import { ShieldAlert, ExternalLink, Activity } from "lucide-react";
import CollapsibleModule from "./CollapsibleModule";
import { Badge } from "@/components/ui/badge";

const ROWS = [
  ["Sample", "Whole blood (cells + platelets + plasma)", "Platelet-poor plasma"],
  ["Location", "Point-of-care / OR / ED", "Central lab"],
  ["Turnaround", "5–10 min initial, ~30 min full", "45–60+ min"],
  ["Scope", "Initiation → strength → lysis", "Initiation only"],
  ["Platelet/fibrin function", "Yes", "No"],
  ["Hyperfibrinolysis", "Detects", "Cannot detect"],
];

export default function ICHAntithromboticGuideline() {
  return (
    <CollapsibleModule
      title="Antithrombotic-Associated ICH — NCS/SCCM Focused Update"
      subtitle="Neurocrit Care, Sep 24 2026 · PMID 42786382 · GRADE"
      icon={<ShieldAlert className="h-5 w-5 text-rose-500" />}
      badge={<Badge variant="outline" className="text-[10px]">New</Badge>}
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
          <p className="font-semibold">Factor Xa inhibitor reversal: 4F-PCC preferred over andexanet alfa</p>
          <p className="text-xs text-muted-foreground mt-1">ANNEXA-I: better hematoma control but no mortality/functional benefit; more thrombosis (RR 1.37; 1.99 in spontaneous IPH cohorts). Andexanet withdrawn in the US (Dec 2025). Avoid andexanet + PCC combinations; verify reversal already given in transfers.</p>
        </div>
        <div className="rounded-lg border border-border p-3 space-y-1">
          <p className="font-semibold">Platelet transfusion</p>
          <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
            <li><strong>Avoid</strong> in non-neurosurgical spontaneous IPH on antiplatelets (PATCH).</li>
            <li><strong>Give</strong> to aspirin users with spontaneous IPH undergoing neurosurgery.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="font-semibold">Desmopressin</p>
          <p className="text-xs text-muted-foreground">No recommendation — insufficient evidence of benefit.</p>
        </div>

        <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-3 space-y-2">
          <p className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-sky-400" />Traumatic ICH: use viscoelastic assays (TEG / ROTEM)</p>
          <p className="text-xs text-muted-foreground">Point-of-care whole-blood tests tracking clot formation, strength and breakdown in real time. TEG: moving cup, fixed pin; ROTEM: fixed cup, rotating pin; cartridge systems include TEG 6s and Quantra. Enable goal-directed therapy (cryoprecipitate/fibrinogen for low fibrinogen, platelets, tranexamic acid for hyperfibrinolysis) and can reduce blood product use.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left"><th className="p-1">Feature</th><th className="p-1">VEA (TEG/ROTEM)</th><th className="p-1">PT/aPTT</th></tr></thead>
              <tbody>{ROWS.map((r) => <tr key={r[0]} className="border-t border-border/50">{r.map((c, i) => <td key={i} className={`p-1 ${i === 0 ? "font-medium" : "text-muted-foreground"}`}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Limitation: standard VEAs are insensitive to antiplatelet and some DOAC effects — interpret alongside drug history and specific assays.</p>
        </div>

        <p className="text-xs text-muted-foreground">All recommendations are conditional; evidence remains limited.</p>
        <a href="https://pubmed.ncbi.nlm.nih.gov/42786382/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline text-xs">
          PubMed 42786382 <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </CollapsibleModule>
  );
}
