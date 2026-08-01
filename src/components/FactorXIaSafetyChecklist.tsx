import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ShieldAlert, FlaskConical, Clock, Droplets, AlertTriangle } from "lucide-react";

/* --------------------------------------------------------------- */
/* Data                                                             */
/* --------------------------------------------------------------- */

const BLEEDING_CHECKS = [
  "ISTH major bleeding screen at every visit: overt bleeding, Hb fall ≥2 g/dL, ≥2 units transfused, critical-site bleed",
  "Concomitant antithrombotics documented (aspirin / P2Y12 / LMWH / UFH) — additive bleeding risk, protocol-defined limits only",
  "NSAIDs, SSRIs and systemic steroids reviewed and minimised",
  "Recent or planned surgery, LP, or arterial puncture flagged — hold ≥24 h (asundexian) or ≥24–48 h (milvexian) pre-procedure",
  "GI bleeding history, active ulcer disease, or known AVM screened before first dose",
  "Fall risk / head injury risk assessed in elderly (>75 y) patients",
  "Patient counselled on bleeding red flags and given an anticoagulant alert card",
];

const LAB_CHECKS = [
  "Baseline FBC (Hb, platelets), renal function (creatinine, eGFR/CrCl) and LFTs before first dose",
  "Repeat FBC + renal panel at 1 month, then every 3 months (sooner if unwell, dehydrated, or on interacting drugs)",
  "aPTT is prolonged by FXIa inhibition but is NOT a validated drug-level assay — do not titrate dose to aPTT",
  "PT/INR and anti-Xa levels are insensitive/uninformative — do not use to exclude drug effect",
  "Specialised assays (FXI activity, drug-specific chromogenic assay) available only in trial/reference labs",
  "Faecal occult blood / urinalysis if unexplained Hb fall",
  "Pregnancy test in women of childbearing potential (no human safety data)",
];

const CONTRA_CHECKS = [
  "Active clinically significant bleeding — absolute contraindication",
  "Acute ICH, SAH, or haemorrhagic transformation of infarct",
  "Severe hepatic impairment (Child-Pugh C) or coagulopathy from liver disease",
  "Severe renal impairment / dialysis — asundexian data limited; milvexian excluded CrCl <30 mL/min in most trials",
  "Platelets <50 ×10⁹/L or known bleeding diathesis",
  "Strong CYP3A4 / P-gp inhibitors or inducers (asundexian is a CYP3A4 substrate) — e.g. azoles, ritonavir, rifampicin, carbamazepine",
  "Use outside an approved clinical trial — neither agent is licensed",
];

const REVERSAL_CHECKS = [
  "No specific antidote exists for either agent — plan supportive management in advance",
  "Stop the drug; note the time of the last dose (t½ ≈ 12–17 h asundexian, ≈ 8–14 h milvexian)",
  "Local haemostasis, mechanical compression, endoscopic/interventional control as indicated",
  "Life-threatening bleed: 4F-PCC 25–50 IU/kg (off-label, best available non-specific option)",
  "Consider TXA 1 g IV over 10 min for mucosal bleeding (avoid in active thrombosis / suspected DIC)",
  "FFP or FXI-containing plasma products only if 4F-PCC unavailable; rFVIIa is a last resort",
  "Transfuse to Hb target, correct fibrinogen >1.5 g/L, platelets if <50 ×10⁹/L or on antiplatelets",
  "Repeat non-contrast CT head + neuro-obs q1h for any intracranial bleed; escalate to neurosurgery",
  "Report the event to the trial sponsor / pharmacovigilance within 24 h",
];

interface Regimen {
  drug: string;
  colour: string;
  timing: string;
  regimens: { label: string; dose: string }[];
  renal: string;
  hepatic: string;
  trial: string;
}

const REGIMENS: Regimen[] = [
  {
    drug: "Asundexian (BAY 2433334)",
    colour: "purple",
    timing:
      "Post-stroke start (OCEANIC-STROKE): first dose within 72 h of symptom onset in non-cardioembolic ischaemic stroke/high-risk TIA, given on top of standard antiplatelet therapy. Confirm no haemorrhagic transformation on repeat imaging before starting. In AF (OCEANIC-AF) initiation followed the standard 1-3-6-12 day rule after an index stroke.",
    regimens: [
      { label: "AF stroke prevention (OCEANIC-AF)", dose: "50 mg PO once daily" },
      { label: "Non-cardioembolic stroke (OCEANIC-STROKE)", dose: "50 mg PO once daily + guideline antiplatelet, started ≤72 h from onset" },
      { label: "Post-MI / with DAPT (PACIFIC-AMI)", dose: "10–50 mg PO once daily on background DAPT" },
    ],
    renal: "Moderate impairment (CrCl 30–50 mL/min): 20 mg daily. Severe impairment (CrCl <30 mL/min): 10 mg daily or avoid — exposure rises ~2-fold and safety data are sparse. Not studied in dialysis.",
    hepatic: "Mild (Child-Pugh A): no adjustment. Moderate (Child-Pugh B): use with caution, consider 20 mg daily. Severe (Child-Pugh C): contraindicated. Avoid with strong CYP3A4 inhibitors/inducers.",
    trial:
      "OCEANIC-AF stopped early for inferiority to apixaban (higher ischaemic stroke rate) despite markedly less bleeding — AF development discontinued. OCEANIC-STROKE continues in non-cardioembolic stroke.",
  },
  {
    drug: "Milvexian (BMS-986177 / JNJ-70033093)",
    colour: "indigo",
    timing:
      "Post-stroke start (AXIOMATIC-SSP / LIBREXIA-STROKE): first dose within 48 h of symptom onset in acute non-cardioembolic ischaemic stroke or high-risk TIA, added to aspirin + clopidogrel for the initial DAPT window. Exclude ICH and large infarcts with high haemorrhagic-transformation risk before dosing.",
    regimens: [
      { label: "Acute secondary prevention (AXIOMATIC-SSP)", dose: "25, 50, 100 or 200 mg PO BID × 90 days on background DAPT; 25 mg BID plateau of efficacy" },
      { label: "Phase 3 stroke (LIBREXIA-STROKE)", dose: "25 mg PO BID started ≤48 h from onset, on background antiplatelet therapy" },
      { label: "AF (LIBREXIA-AF) / VTE prevention (AXIOMATIC-TKR)", dose: "AF: 100 mg PO BID. Post-arthroplasty VTE: 25–200 mg BID or 25–50 mg daily" },
    ],
    renal: "Predominantly renal + biliary elimination. Mild–moderate impairment: no dose change in trials. CrCl <30 mL/min: excluded from pivotal trials — avoid; if unavoidable, reduce to the lowest studied dose with close monitoring.",
    hepatic: "Mild (Child-Pugh A): no adjustment. Moderate (Child-Pugh B): caution, limited data. Severe (Child-Pugh C) or coagulopathic liver disease: contraindicated. CYP3A4 substrate — avoid strong inhibitors/inducers.",
    trial:
      "AXIOMATIC-SSP: no dose-response for the primary imaging endpoint but a signal for reduced symptomatic ischaemic stroke at ≥25 mg BID, with no excess of major bleeding. Definitive answers pending LIBREXIA-STROKE.",
  },
];

/* --------------------------------------------------------------- */

function CheckGroup({
  title,
  icon,
  items,
  tone,
  storageKey,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone: string;
  storageKey: string;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className={`rounded-lg border ${tone} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm font-bold">{title}</p>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {checked.size}/{items.length}
        </Badge>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={`${storageKey}-${i}`} className="flex items-start gap-2">
            <Checkbox
              id={`${storageKey}-${i}`}
              checked={checked.has(i)}
              onCheckedChange={() => toggle(i)}
              className="mt-0.5"
            />
            <label htmlFor={`${storageKey}-${i}`} className="text-xs leading-snug cursor-pointer">
              {item}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FactorXIaSafetyChecklist() {
  const [open, setOpen] = useState(false);

  return (
    <Card id="factor-xia-safety" className="border-purple-500/40 bg-purple-950/20">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-purple-200">
              <ShieldAlert className="h-4 w-4" />
              Factor XIa Inhibitors — Monitoring &amp; Safety Checklist
              <Badge className="ml-2 bg-amber-600 text-white text-[10px]">Investigational</Badge>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
            </CardTitle>
            <p className="text-xs text-slate-400 text-left">
              Asundexian &amp; milvexian — dosing relative to stroke onset, renal/hepatic adjustment, lab parameters,
              contraindications and reversal planning.
            </p>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-500/50 bg-amber-950/30 p-3 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-100">
                Neither agent is approved for clinical use. Use only within a clinical trial or an approved
                compassionate-use protocol. Doses below are trial regimens reproduced for reference.
              </p>
            </div>

            {/* Dosing regimens */}
            <div className="space-y-3">
              {REGIMENS.map((r) => (
                <div key={r.drug} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 space-y-2">
                  <p className="text-sm font-bold text-purple-200">{r.drug}</p>

                  <div className="flex gap-2">
                    <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-200">
                      <span className="font-semibold text-cyan-300">Timing vs stroke onset: </span>
                      {r.timing}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {r.regimens.map((d) => (
                      <div key={d.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 text-xs">
                        <span className="font-semibold text-slate-300 sm:w-64 shrink-0">{d.label}</span>
                        <span className="text-slate-100">{d.dose}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-200">
                    <span className="font-semibold text-emerald-300">Renal adjustment: </span>
                    {r.renal}
                  </p>
                  <p className="text-xs text-slate-200">
                    <span className="font-semibold text-orange-300">Hepatic adjustment: </span>
                    {r.hepatic}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">{r.trial}</p>
                </div>
              ))}
            </div>

            {/* Checklists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <CheckGroup
                title="Bleeding risk assessment"
                icon={<Droplets className="h-4 w-4 text-rose-400" />}
                items={BLEEDING_CHECKS}
                tone="border-rose-500/40 bg-rose-950/20 text-rose-50"
                storageKey="fxia-bleed"
              />
              <CheckGroup
                title="Laboratory parameters"
                icon={<FlaskConical className="h-4 w-4 text-cyan-400" />}
                items={LAB_CHECKS}
                tone="border-cyan-500/40 bg-cyan-950/20 text-cyan-50"
                storageKey="fxia-lab"
              />
              <CheckGroup
                title="Contraindications & cautions"
                icon={<ShieldAlert className="h-4 w-4 text-amber-400" />}
                items={CONTRA_CHECKS}
                tone="border-amber-500/40 bg-amber-950/20 text-amber-50"
                storageKey="fxia-contra"
              />
              <CheckGroup
                title="Reversal & bleeding management"
                icon={<AlertTriangle className="h-4 w-4 text-emerald-400" />}
                items={REVERSAL_CHECKS}
                tone="border-emerald-500/40 bg-emerald-950/20 text-emerald-50"
                storageKey="fxia-reversal"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Evidence: OCEANIC-AF (NEJM 2024), OCEANIC-STROKE, PACIFIC-AMI/PACIFIC-STROKE (Lancet 2022),
              AXIOMATIC-SSP (NEJM 2022), AXIOMATIC-TKR (NEJM 2021), LIBREXIA-AF/STROKE/ACS (ongoing).
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
