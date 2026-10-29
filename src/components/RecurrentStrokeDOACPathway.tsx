import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Route, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
  DOAC_INFO, buildDoacRecurrencePlan,
  type Doac, type Exposure, type Mechanism, type AntiplateletReason,
} from "@/lib/recurrentDoacPathway";

function Choice<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: [T, string][]; onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <button key={v} type="button" onClick={() => onChange(v)} aria-pressed={value === v}
            className={`min-h-[44px] rounded-lg border px-3 text-sm transition-colors ${value === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

const RecurrentStrokeDOACPathway: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [doac, setDoac] = useState<Doac>("apixaban");
  const [exposure, setExposure] = useState<Exposure>("unknown");
  const [mechanism, setMechanism] = useState<Mechanism>("undetermined");
  const [antiplatelet, setAntiplatelet] = useState<AntiplateletReason>("none_taken");
  const plan = useMemo(() => buildDoacRecurrencePlan({ doac, exposure, mechanism, antiplatelet }), [doac, exposure, mechanism, antiplatelet]);
  const d = DOAC_INFO[doac];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-primary/30">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center justify-between gap-2 text-sm sm:text-base">
              <span className="flex items-center gap-2"><Route className="h-5 w-5 text-primary" />Recurrent Stroke Despite DOAC — Pathway</span>
              <span className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">ESC 2024 · AHA/ASA 2026</Badge>
                <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} /></span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-5 pt-5">
            <p className="text-xs text-muted-foreground">Secondary-prevention pathway, not an acute reperfusion algorithm. Separates under-exposure, a competing mechanism, and true breakthrough cardioembolism.</p>
            <DoacChoice label="1. Anticoagulant at time of stroke" value={doac} onChange={setDoac}
              options={[["dabigatran", "Dabigatran"], ["apixaban", "Apixaban"], ["rivaroxaban", "Rivaroxaban"]]} />
            <div className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-xs sm:grid-cols-2">
              <div><b>Standard AF dose:</b> {d.standard}</div>
              <div><b>Reduced:</b> {d.reduced}</div>
              <div><b>Renal elimination:</b> {d.renal}</div>
              <div><b>Interactions:</b> {d.interaction}</div>
              <div><b>Activity assay:</b> {d.assay}</div>
              <div><b>Reversal:</b> {d.reversal}</div>
              <div className="sm:col-span-2 text-muted-foreground">{d.note}</div>
            </div>
            <ExposureChoice label="2. Is anticoagulant exposure adequate?" value={exposure} onChange={setExposure}
              options={[["adequate", "Yes — dose & adherence verified"], ["inadequate", "No — missed / underdosed / interaction"], ["unknown", "Not yet established"]]} />
            <MechanismChoice label="3. Most likely stroke mechanism" value={mechanism} onChange={setMechanism}
              options={[["cardioembolic", "Cardioembolic"], ["large_artery", "Large-artery"], ["lacunar", "Small-vessel / lacunar"], ["other", "Other (APS, malignancy…)"], ["undetermined", "Undetermined"]]} />
            <AntiplateletReasonChoice label="4. Also on clopidogrel or aspirin — why?" value={antiplatelet} onChange={setAntiplatelet}
              options={[["none_taken", "Not on antiplatelet"], ["yes_reason_unknown", "Yes — reason not yet known"], ["prior_stroke_only", "Prior stroke only"], ["stable_cad_gt12m", "Stable CAD >12 mo post-PCI"], ["recent_pci_acs", "Recent PCI / ACS"], ["recent_carotid_stent", "Recent carotid stent"], ["severe_icas", "Severe intracranial stenosis"], ["no_indication", "No documented reason"]]} />

            <div className="space-y-2">
              <p className="text-sm font-semibold">Treatment plan</p>
              {plan.map((p, i) => {
                const Icon = p.tone === "avoid" ? XCircle : p.tone === "caution" ? AlertTriangle : CheckCircle2;
                const tone = p.tone === "avoid" ? "text-destructive" : p.tone === "caution" ? "text-accent-foreground" : "text-primary";
                return (
                  <div key={i} className="flex gap-3 rounded-lg border bg-card p-3">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
                    <div><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.detail}</p></div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">Assumes the DOAC is for atrial fibrillation; if the indication is venous thromboembolism, the long-term strategy needs modification.</p>
            <p className="text-[11px] text-muted-foreground">Evidence: 2024 ESC AF guideline; 2026 AHA/ASA acute ischaemic stroke guideline; 2023 ACC/AHA AF guideline; 2025 meta-analysis (n=14,307, observational) — DOAC continuation ≈ switching DOAC, warfarin switch worse; 2026 BMJ breakthrough-stroke review.</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const DoacChoice = Choice<Doac>;
const ExposureChoice = Choice<Exposure>;
const MechanismChoice = Choice<Mechanism>;
const AntiplateletReasonChoice = Choice<AntiplateletReason>;

export default RecurrentStrokeDOACPathway;
