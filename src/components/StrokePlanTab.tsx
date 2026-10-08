import { useEffect, useState } from "react";
import { ClipboardList, ArrowRight, CheckCircle2, AlertTriangle, Circle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OCCULT5_EVENT } from "./DDimerStrokeModule";
import {
  buildPlan, readJSON, ICH_REVERSAL_EVENT, ICH_REVERSAL_KEY, OCCULT5_KEY, ABCD2_KEY, ABCD2_EVENT, type Abcd2Snapshot,
  type IchReversalInput, type Occult5Snapshot, type PlanStep,
  SICH_KEY, SICH_EVENT, type SichSnapshot,
} from "@/lib/strokePlan";
import { IVT_CONTRA_EVENT, IVT_CONTRA_KEY, IVT_TREE_EVENT, IVT_TREE_KEY, type IvtContraSnapshot, type IvtTreeInput } from "@/lib/ivtPlan";
import { NAVIGATE_SECTION_EVENT } from "@/lib/sectionTabs";
import { useTreatmentPathways } from "@/hooks/useTreatmentPathways";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { TreatmentPathways } from "@/lib/treatmentPathways";
import { Textarea } from "./ui/textarea";
import SavePlanRecord from "./SavePlanRecord";
import { enrichPlan, historyFlags, HISTORY_NOTES_KEY, HISTORY_NOTES_EVENT } from "@/lib/planEnrichment";

const ICON = {
  done: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  action: <AlertTriangle className="h-5 w-5 text-red-500" />,
  pending: <Circle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
};
const LABEL = { done: "Done", action: "Action", pending: "Pending", info: "Review" };

export default function StrokePlanTab() {
  const { state: pathways, update } = useTreatmentPathways();
  const [occult, setOccult] = useState(() => readJSON<Occult5Snapshot>(OCCULT5_KEY));
  const [ich, setIch] = useState(() => readJSON<IchReversalInput>(ICH_REVERSAL_KEY));
  const [sich, setSich] = useState(() => readJSON<SichSnapshot>(SICH_KEY));
  useEffect(() => {
    const sync = () => setSich(readJSON<SichSnapshot>(SICH_KEY));
    window.addEventListener(SICH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(SICH_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  const [ivtContra, setIvtContra] = useState(() => readJSON<IvtContraSnapshot>(IVT_CONTRA_KEY));
  const [ivtTree, setIvtTree] = useState(() => readJSON<IvtTreeInput>(IVT_TREE_KEY));
  useEffect(() => {
    const c = (e: Event) => setIvtContra((e as CustomEvent<IvtContraSnapshot | null>).detail);
    const t = (e: Event) => setIvtTree((e as CustomEvent<IvtTreeInput | null>).detail);
    window.addEventListener(IVT_CONTRA_EVENT, c); window.addEventListener(IVT_TREE_EVENT, t);
    return () => { window.removeEventListener(IVT_CONTRA_EVENT, c); window.removeEventListener(IVT_TREE_EVENT, t); };
  }, []);
  const [abcd2, setAbcd2] = useState(() => readJSON<Abcd2Snapshot>(ABCD2_KEY));
  useEffect(() => {
    const a = (e: Event) => setAbcd2((e as CustomEvent<Abcd2Snapshot | null>).detail);
    window.addEventListener(ABCD2_EVENT, a);
    return () => window.removeEventListener(ABCD2_EVENT, a);
  }, []);

  useEffect(() => {
    const o = (e: Event) => setOccult((e as CustomEvent<Occult5Snapshot>).detail);
    const i = (e: Event) => setIch((e as CustomEvent<IchReversalInput>).detail);
    window.addEventListener(OCCULT5_EVENT, o);
    window.addEventListener(ICH_REVERSAL_EVENT, i);
    return () => { window.removeEventListener(OCCULT5_EVENT, o); window.removeEventListener(ICH_REVERSAL_EVENT, i); };
  }, []);

  const [notes, setNotes] = useState(() => localStorage.getItem(HISTORY_NOTES_KEY) ?? "");
  const saveNotes = (v: string) => {
    setNotes(v);
    try { localStorage.setItem(HISTORY_NOTES_KEY, v); } catch { /* storage full */ }
    window.dispatchEvent(new CustomEvent(HISTORY_NOTES_EVENT, { detail: v }));
  };
  const flags = historyFlags(notes);
  const plan = enrichPlan(buildPlan(occult, ich, abcd2, ivtContra, ivtTree, sich, pathways), notes);
  const phases = ["Investigation", "Treatment", "Secondary prevention"] as const;
  const go = (s: PlanStep) => window.dispatchEvent(new CustomEvent(NAVIGATE_SECTION_EVENT, { detail: s.sectionId }));
  const actions = plan.filter((p) => p.status === "action" || p.status === "pending");

  return (
    <div id="stroke-plan" className="space-y-5">
      <div className="glass-strong rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Stroke Pathway & Plan</h2>
        </div>
        <p className="text-sm text-muted-foreground">Scores and flags from other tabs update this plan automatically. Tap a next step to jump to it.</p>
        <div className="mt-3 space-y-2 max-w-md">
          <Label htmlFor="plan-stroke-type">Confirmed stroke pathway</Label>
          <Select value={pathways.strokeType || "unknown"} onValueChange={v => update("strokeType", (v === "unknown" ? "" : v) as TreatmentPathways["strokeType"])}>
            <SelectTrigger id="plan-stroke-type" className="min-h-11"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="unknown">Not confirmed — review both pathways</SelectItem><SelectItem value="ischemic">Ischemic stroke / TIA</SelectItem><SelectItem value="ich">Spontaneous ICH</SelectItem></SelectContent>
          </Select>
          {!pathways.strokeType && <p className="text-sm text-muted-foreground">Stroke type unconfirmed: ischemic and ICH steps are alternatives, not a combined treatment order.</p>}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">OCCULT-5: {!occult ? "—" : occult.notApplicable ? "N/A" : occult.definitive ? occult.min : `${occult.min}–${occult.max}`}</Badge>
          <Badge variant="outline">ABCD²: {abcd2 ? abcd2.score : "—"}</Badge>
          <Badge variant="outline">sICH: {sich ? `${sich.score}/6${sich.complete ? "" : " (incomplete)"}` : "—"}</Badge>
          <Badge variant="outline">IVT contraindications: {!ivtContra ? "—" : ivtContra.absolute.length ? `${ivtContra.absolute.length} absolute` : "none absolute"}</Badge>
          <Badge variant="outline">ICH antithrombotic: {ich?.agent ?? "—"}</Badge>
          <Badge variant="outline">{actions.length} open step{actions.length === 1 ? "" : "s"}</Badge>
        </div>
      </div>

      <div id="patient-history-notes" className="glass rounded-xl p-4 space-y-2">
        <Label htmlFor="history-notes" className="font-semibold">Patient history notes</Label>
        <p className="text-sm text-muted-foreground">Type the patient's history. Key items (blood thinners, AF, cancer, prior bleeding, surgery, seizure, pregnancy, kidney disease, contrast allergy…) are picked up and added to the matching steps below. Saved on this device only.</p>
        <Textarea id="history-notes" value={notes} maxLength={5000} rows={5} onChange={(e) => saveNotes(e.target.value)} placeholder="e.g. 72 y/o, AF on apixaban (last dose 08:00), HTN, prior surgery 2 weeks ago…" />
        {flags.length > 0 && <div className="flex flex-wrap gap-2">{flags.map((f) => <Badge key={f.label} variant="outline" className="border-primary/50">{f.label}</Badge>)}</div>}
      </div>

      <SavePlanRecord notes={notes} plan={plan} />

      {phases.map((ph) => (
        <section key={ph} className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{ph}</h3>
          {plan.filter((p) => p.phase === ph).map((s) => (
            <div key={s.id} className="glass rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1">
                {ICON[s.status]}
                <div>
                  <p className="font-semibold text-sm">{s.title} <Badge variant="secondary" className="ml-1 text-[10px]">{LABEL[s.status]}</Badge></p>
                  <p className="text-sm text-muted-foreground">{s.detail}</p>
                  {s.historyNotes.map((n) => <p key={n} className="text-sm mt-1 border-l-2 border-primary pl-2"><span className="font-semibold">From history:</span> {n}</p>)}
                  {s.references.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs">
                      {s.references.map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">{r.label}</a></li>)}
                    </ul>
                  )}
                </div>
              </div>
              <Button size="sm" className="min-h-[44px] shrink-0" onClick={() => go(s)}>
                {s.actionLabel} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ))}
        </section>
      ))}
      <p className="text-xs text-muted-foreground">Decision support only — confirm every step clinically and per local protocol.</p>
    </div>
  );
}
