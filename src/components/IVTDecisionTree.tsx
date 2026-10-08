import { useEffect, useState } from "react";
import { GitBranch, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { readJSON } from "@/lib/strokePlan";
import { NAVIGATE_SECTION_EVENT } from "@/lib/sectionTabs";
import {
  ivtDecision, publish, IVT_CONTRA_EVENT, IVT_CONTRA_KEY, IVT_TREE_EVENT, IVT_TREE_KEY,
  type IvtContraSnapshot, type IvtTreeInput,
} from "@/lib/ivtPlan";

const EMPTY: IvtTreeInput = { ischemicOnCT: "", window: "", disabling: "", lvo: "", mismatch: "", evtAvailable: "" };
type Opt = { v: string; l: string };
const YN: Opt[] = [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }];

function Q({ n, q, opts, value, onChange }: { n: number; q: string; opts: Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <p className="text-sm font-semibold mb-2">{n}. {q}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <Button key={o.v} size="sm" variant={value === o.v ? "default" : "outline"} className="min-h-[44px]" onClick={() => onChange(value === o.v ? "" : o.v)}>{o.l}</Button>
        ))}
      </div>
    </div>
  );
}

export default function IVTDecisionTree() {
  const [t, setT] = useState<IvtTreeInput>(() => readJSON<IvtTreeInput>(IVT_TREE_KEY) ?? EMPTY);
  const [contra, setContra] = useState(() => readJSON<IvtContraSnapshot>(IVT_CONTRA_KEY));
  useEffect(() => {
    const h = (e: Event) => setContra((e as CustomEvent<IvtContraSnapshot | null>).detail);
    window.addEventListener(IVT_CONTRA_EVENT, h);
    return () => window.removeEventListener(IVT_CONTRA_EVENT, h);
  }, []);
  const set = (k: keyof IvtTreeInput) => (v: string) => {
    const next = { ...t, [k]: v } as IvtTreeInput;
    setT(next);
    publish(IVT_TREE_KEY, IVT_TREE_EVENT, next);
  };
  const o = ivtDecision(t, contra);
  const tone = o.kind === "ivt" ? "border-emerald-500/50 bg-emerald-500/10" : o.kind === "incomplete" ? "border-amber-500/50 bg-amber-500/10" : "border-red-500/50 bg-red-500/10";
  const title = o.kind === "ivt" ? `Give IVT${o.plusEvt ? " + thrombectomy" : ""}` : o.kind === "no-ivt" ? `No IVT${o.plusEvt ? " — thrombectomy pathway" : ""}` : o.kind === "stop" ? "Stop — hemorrhage" : "Keep going";
  const go = (id: string) => window.dispatchEvent(new CustomEvent(NAVIGATE_SECTION_EVENT, { detail: id }));
  const ext = t.window && t.window !== "lt4_5" && t.window !== "gt24";
  let n = 0;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg"><GitBranch className="h-5 w-5 text-primary" />IVT Decision Tree</CardTitle>
        <p className="text-sm text-muted-foreground">Uses your tPA/TNK contraindications checklist. The result updates the Plan tab.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border p-3 text-sm flex flex-wrap items-center gap-2 justify-between">
          <span>Contraindications: <b>{!contra ? "not checked" : contra.absolute.length ? `${contra.absolute.length} absolute` : contra.relative.length ? `${contra.relative.length} relative` : "none ticked"}</b></span>
          <Button size="sm" variant="outline" className="min-h-[44px]" onClick={() => go("tpa-eligibility")}>Open checklist</Button>
        </div>
        <Q n={++n} q="Imaging: hemorrhage excluded (CT/MRI)?" opts={YN} value={t.ischemicOnCT} onChange={set("ischemicOnCT")} />
        <Q n={++n} q="Time from last known well" value={t.window} onChange={set("window")} opts={[
          { v: "lt4_5", l: "≤4.5 h" }, { v: "4_5to9", l: "4.5–9 h" }, { v: "9to24", l: "9–24 h" }, { v: "wakeup", l: "Wake-up / unknown" }, { v: "gt24", l: ">24 h" }]} />
        <Q n={++n} q="Disabling deficit (BATHE)?" opts={YN} value={t.disabling} onChange={set("disabling")} />
        <Q n={++n} q="Large vessel occlusion on CTA?" opts={YN} value={t.lvo} onChange={set("lvo")} />
        {t.lvo === "yes" && <Q n={++n} q="Thrombectomy available on site?" opts={YN} value={t.evtAvailable} onChange={set("evtAvailable")} />}
        {ext && <Q n={++n} q="DWI-FLAIR or CT perfusion mismatch?" opts={YN} value={t.mismatch} onChange={set("mismatch")} />}
        <div className={`rounded-xl border-2 p-4 ${tone}`}>
          <p className="font-bold">{title}</p>
          <p className="text-sm mt-1">{o.text}</p>
          {o.kind === "ivt" && (
            <Button size="sm" className="mt-3 min-h-[44px]" onClick={() => go("thrombolytics-anticoag")}>Open IVT dose calculators <ArrowRight className="h-4 w-4 ml-1" /></Button>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={() => { setT(EMPTY); publish(IVT_TREE_KEY, IVT_TREE_EVENT, null); }}>Clear answers</Button>
        <p className="text-xs text-muted-foreground">Decision support only — confirm with the stroke team and local protocol.</p>
      </CardContent>
    </Card>
  );
}
