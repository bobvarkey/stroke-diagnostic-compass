import { useEffect, useState } from "react";
import { ShieldAlert, ArrowRight, ExternalLink } from "lucide-react";
import CollapsibleModule from "./CollapsibleModule";
import { Button } from "@/components/ui/button";
import {
  ICH_REVERSAL_EVENT, ICH_REVERSAL_KEY, ichReversalRecommendations, readJSON,
  type Antithrombotic, type IchReversalInput,
} from "@/lib/strokePlan";
import { NAVIGATE_SECTION_EVENT } from "@/lib/sectionTabs";

const AGENTS: { v: Antithrombotic; l: string }[] = [
  { v: "none", l: "None" }, { v: "xa", l: "FXa inhibitor" }, { v: "dabigatran", l: "Dabigatran" },
  { v: "vka", l: "Warfarin/VKA" }, { v: "heparin", l: "Heparin (UFH)" }, { v: "antiplatelet", l: "Antiplatelet" }, { v: "unknown", l: "Unknown" },
];
const DEFAULT: IchReversalInput = { agent: "unknown", neurosurgery: false, traumatic: false, reversalAlreadyGiven: false };
const TONE = { do: "border-emerald-500/60 bg-emerald-500/10", avoid: "border-red-500/60 bg-red-500/10", consider: "border-sky-500/60 bg-sky-500/10", info: "border-border bg-muted/30" };

export default function ICHReversalPlanner({ title = "ICH Reversal Planner (NCS/SCCM)" }: { title?: string }) {
  const [s, setS] = useState<IchReversalInput>(() => readJSON<IchReversalInput>(ICH_REVERSAL_KEY) ?? DEFAULT);
  const [touched, setTouched] = useState(() => readJSON(ICH_REVERSAL_KEY) !== null);

  useEffect(() => {
    const h = (e: Event) => setS((e as CustomEvent<IchReversalInput>).detail);
    window.addEventListener(ICH_REVERSAL_EVENT, h);
    return () => window.removeEventListener(ICH_REVERSAL_EVENT, h);
  }, []);

  const update = (p: Partial<IchReversalInput>) => {
    const next = { ...s, ...p };
    setS(next); setTouched(true);
    try { localStorage.setItem(ICH_REVERSAL_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent(ICH_REVERSAL_EVENT, { detail: next }));
  };
  const recs = ichReversalRecommendations(s);
  const toggle = (k: "neurosurgery" | "traumatic" | "reversalAlreadyGiven", l: string) => (
    <label className="flex items-center gap-2 text-sm min-h-[44px] cursor-pointer">
      <input type="checkbox" checked={s[k]} onChange={(e) => update({ [k]: e.target.checked })} className="h-4 w-4" /> {l}
    </label>
  );

  return (
    <CollapsibleModule title={title} icon={<ShieldAlert className="h-5 w-5 text-rose-500" />}>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold mb-2">Antithrombotic before bleed</p>
          <div className="flex flex-wrap gap-2">
            {AGENTS.map((a) => (
              <Button key={a.v} size="sm" variant={s.agent === a.v ? "default" : "outline"} className="min-h-[44px]" onClick={() => update({ agent: a.v })}>{a.l}</Button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-1">
          {toggle("neurosurgery", "Neurosurgery planned")}
          {toggle("traumatic", "Traumatic ICH")}
          {toggle("reversalAlreadyGiven", "Reversal already given")}
        </div>
        {touched && (
          <ul className="space-y-2">
            {recs.map((r, i) => (
              <li key={i} className={`rounded-lg border p-3 text-sm ${TONE[r.level]}`}>
                <span className="font-semibold uppercase text-xs mr-2">{r.level}</span>{r.text}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="min-h-[44px]" onClick={() => window.dispatchEvent(new CustomEvent(NAVIGATE_SECTION_EVENT, { detail: "stroke-plan" }))}>
            Send to Stroke Plan <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button size="sm" variant="outline" className="min-h-[44px]" asChild>
            <a href="https://pubmed.ncbi.nlm.nih.gov/42786382/" target="_blank" rel="noopener noreferrer">NCS/SCCM guideline <ExternalLink className="h-3.5 w-3.5 ml-1" /></a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Decision support only; conditional recommendations with limited evidence. Follow local protocol.</p>
      </div>
    </CollapsibleModule>
  );
}
