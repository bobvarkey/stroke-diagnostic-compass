import { useEffect, useState } from "react";
import { GitBranch, ArrowRight } from "lucide-react";
import CollapsibleModule from "./CollapsibleModule";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useTreatmentPathways } from "@/hooks/useTreatmentPathways";
import { evtSteps, ichCareSteps, ivtCareSteps, preventionSteps, type TreatmentPathways } from "@/lib/treatmentPathways";
import { readJSON, type PlanStep } from "@/lib/strokePlan";
import { IVT_TREE_KEY, IVT_TREE_EVENT, IVT_CONTRA_KEY, IVT_CONTRA_EVENT, type IvtTreeInput, type IvtContraSnapshot } from "@/lib/ivtPlan";
import { NAVIGATE_SECTION_EVENT } from "@/lib/sectionTabs";

type Kind = "ivt" | "evt" | "ich" | "prevention";
type Field = { key: string; label: string; options?: [string, string][]; number?: boolean };
const FIELDS: Record<Kind, Field[]> = {
  ivt: [
    { key: "bpReady", label: "BP <185/110 mmHg before treatment?" },
    { key: "glucoseChecked", label: "Glucose checked and hypoglycemia / mimics addressed?" },
    { key: "given", label: "IVT administered and drug / dose / time documented?" },
    { key: "followupScan", label: "24-hour CT/MRI reviewed before antithrombotics?" },
  ],
  evt: [
    { key: "vessel", label: "Occlusion on vascular imaging", options: [["anterior", "Proximal anterior (ICA / M1)"], ["basilar", "Basilar artery"], ["medium", "Medium / distal vessel"], ["none", "No treatable LVO"]] },
    { key: "within24", label: "Within 24 hours of last known well?" },
    { key: "imagingReviewed", label: "NIHSS, ASPECTS/core, baseline mRS and imaging selection reviewed by stroke team?" },
    { key: "teamAccepted", label: "EVT eligibility confirmed and case accepted by neurointerventional team?" },
    { key: "onsite", label: "EVT available on site?" },
    { key: "performed", label: "Thrombectomy performed and reperfusion result documented?" },
    { key: "followup", label: "Post-EVT examination, BP plan and follow-up imaging reviewed?" },
  ],
  ich: [
    { key: "confirmed", label: "Spontaneous ICH confirmed on imaging?" },
    { key: "sbp", label: "Presenting systolic BP (mmHg)", number: true },
    { key: "mildModerate", label: "Mild–moderate ICH (not large/severe or requiring decompression)?" },
    { key: "deterioration", label: "Neurological deterioration or reduced consciousness?" },
    { key: "hydrocephalus", label: "Hydrocephalus / intraventricular obstruction?" },
    { key: "cerebellarConcern", label: "Cerebellar bleed with compression, deterioration or volume ≥15 mL?" },
    { key: "seizure", label: "Clinical or electrographic seizure present?" },
    { key: "repeatScan", label: "Repeat imaging reviewed for hematoma expansion?" },
    { key: "swallow", label: "Swallow screen completed before oral intake?" },
    { key: "stableScan", label: "Bleeding stability confirmed before pharmacological VTE prophylaxis?" },
  ],
  prevention: [
    { key: "mechanism", label: "Working stroke mechanism", options: [["noncardioembolic", "Noncardioembolic ischemic stroke / TIA"], ["af", "Nonvalvular AF / cardioembolism"], ["valvular", "Mechanical valve / rheumatic mitral stenosis"], ["esus", "ESUS / mechanism unresolved"], ["ich", "Recovery after ICH"]] },
    { key: "bleedingExcluded", label: "Intracranial bleeding excluded for antithrombotic start?" },
    { key: "minorHighRisk", label: "Minor ischemic stroke NIHSS ≤3 or TIA ABCD² ≥4?" },
    { key: "earlyPresentation", label: "Early presentation within the local short-term DAPT initiation window?" },
    { key: "bleedingRisk", label: "High bleeding risk or another DAPT contraindication?" },
    { key: "recentIvt", label: "IVT given for this event?" },
    { key: "scan24", label: "If IVT given: ≥24 hours elapsed and CT/MRI excludes hemorrhage?" },
    { key: "carotid", label: "Symptomatic extracranial carotid stenosis?" },
    { key: "bpReviewed", label: "Long-term BP plan agreed?" },
    { key: "lipidsReviewed", label: "Lipids, diabetes and vascular risk plan reviewed?" },
    { key: "lifestyleReviewed", label: "Lifestyle, adherence and follow-up plan agreed?" },
    { key: "rehabReviewed", label: "Rehabilitation goals and discharge support reviewed?" },
  ],
};
const TITLES: Record<Kind, string> = { ivt: "IVT Treatment & Monitoring Pathway", evt: "Thrombectomy Pathway", ich: "Acute ICH Care Pathway", prevention: "Secondary Prevention Pathway" };
const LINKS: Record<Kind, [string, string][]> = {
  ivt: [["tpa-eligibility", "Contraindications"], ["ivt-decision-tree", "IVT selection"], ["thrombolytics-anticoag", "Drug doses"], ["post-ivt-hemorrhage", "Post-IVT hemorrhage"]],
  evt: [["lvo-dashboard", "LVO assessment"], ["aspects-calculator", "ASPECTS"], ["ctp-penumbra", "Core / mismatch"], ["nihss-calculator", "NIHSS"], ["mrs-scale", "Baseline mRS"]],
  ich: [["ich-score", "ICH severity"], ["ich-reversal-planner", "Reversal guidance"], ["secondary-ich-score", "Vascular cause / sICH"], ["ich-expansion", "Expansion assessment"]],
  prevention: [["abcd2-score", "ABCD²"], ["recurrent-dapt", "Antiplatelet guide"], ["lipid-risk", "Lipid targets"], ["cancer-stroke-risk", "Cancer / OCCULT-5"], ["mrs-scale", "Functional outcome"]],
};
const SOURCES: Record<Kind, [string, string][]> = {
  ivt: [["AHA/ASA 2026 acute ischemic stroke", "https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke/top-things-to-know"]],
  evt: [["AHA/ASA 2026 acute ischemic stroke", "https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke/top-things-to-know"]],
  ich: [["AHA/ASA 2022 spontaneous ICH", "https://www.ahajournals.org/doi/10.1161/STR.0000000000000407"], ["NCS/SCCM focused reversal update", "https://pubmed.ncbi.nlm.nih.gov/42786382/"]],
  prevention: [["AHA/ASA 2021 secondary prevention", "https://professional.heart.org/en/science-news/2021-guideline-for-the-prevention-of-stroke-in-patients-with-stroke-and-transient-ischemic-attack/top-things-to-know"], ["AHA/ASA 2022 ICH", "https://www.ahajournals.org/doi/10.1161/STR.0000000000000407"]],
};
const STATUS: Record<PlanStep["status"], string> = { pending: "Pending", action: "Action", info: "Review", done: "Done" };
export default function TreatmentPathwayModule({ kind }: { kind: Kind }) {
  const { state, update } = useTreatmentPathways();
  const [tree, setTree] = useState(() => readJSON<IvtTreeInput>(IVT_TREE_KEY));
  const [contra, setContra] = useState(() => readJSON<IvtContraSnapshot>(IVT_CONTRA_KEY));
  useEffect(() => {
    const sync = () => { setTree(readJSON<IvtTreeInput>(IVT_TREE_KEY)); setContra(readJSON<IvtContraSnapshot>(IVT_CONTRA_KEY)); };
    window.addEventListener(IVT_TREE_EVENT, sync); window.addEventListener(IVT_CONTRA_EVENT, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(IVT_TREE_EVENT, sync); window.removeEventListener(IVT_CONTRA_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const values = state[kind];
  const steps = kind === "ivt" ? ivtCareSteps(state.ivt, tree, contra) : kind === "evt" ? evtSteps(state.evt, tree) : kind === "ich" ? ichCareSteps(state.ich) : preventionSteps(state.prevention, state.strokeType);
  const set = (key: string, value: string) => update(kind, { ...values, [key]: value } as TreatmentPathways[typeof kind]);
  const go = (id: string) => window.dispatchEvent(new CustomEvent(NAVIGATE_SECTION_EVENT, { detail: id }));
  return (
    <CollapsibleModule title={TITLES[kind]} icon={<GitBranch className="h-5 w-5 text-primary" />}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {LINKS[kind].map(([id, title]) => <Button key={id} variant="outline" size="sm" className="min-h-11" onClick={() => go(id)}>{title}<ArrowRight className="ml-2 h-4 w-4" /></Button>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS[kind].map(f => {
            const id = `${kind}-${f.key}`;
            const value = String(values[f.key as keyof typeof values] ?? "");
            return <div key={id} className="space-y-2 min-w-0">
              <Label htmlFor={id} className="leading-relaxed">{f.label}</Label>
              {f.number ? <Input id={id} type="number" min={40} max={300} value={value} onChange={e => { const n = e.target.value; if (!n || (Number(n) >= 0 && Number(n) <= 300)) set(f.key, n); }} className="min-h-11" /> :
                <Select value={value || "unknown"} onValueChange={v => set(f.key, v === "unknown" ? "" : v)}>
                  <SelectTrigger id={id} className="min-h-11 h-auto text-left [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="unknown">Not assessed / unknown</SelectItem>{(f.options ?? [["yes", "Yes"], ["no", "No"]]).map(([v, l]) => <SelectItem value={v} key={v}>{l}</SelectItem>)}</SelectContent>
                </Select>}
            </div>;
          })}
        </div>
        <ol className="space-y-3">
          {steps.map((s, n) => <li key={s.id} className="border-l-2 border-primary pl-3 py-1"><p className="font-semibold">{n + 1}. {s.title} <Badge variant="outline">{STATUS[s.status]}</Badge></p><p className="text-sm text-muted-foreground mt-1">{s.detail}</p></li>)}
        </ol>
        <Button className="min-h-11" onClick={() => go("stroke-plan")}>Review Stroke Plan<ArrowRight className="ml-2 h-4 w-4" /></Button>
        <div className="flex flex-wrap gap-3 text-xs">{SOURCES[kind].map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{label}</a>)}</div>
        <p className="text-xs text-muted-foreground">Clinical decision support, not an automatic treatment order. Confirm eligibility, timing and local protocol with the treating team.</p>
      </div>
    </CollapsibleModule>
  );
}