import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, AlertTriangle, HeartPulse, Activity, Stethoscope, Ribbon, Waves } from "lucide-react";

interface Pathway {
  id: string;
  title: string;
  icon: React.ReactNode;
  accent: string;
  clue: string;
  investigations: string[];
  decision: string;
  caveat?: string;
}

const PATHWAYS: Pathway[] = [
  {
    id: "carotid-web",
    title: "Ipsilateral carotid artery web",
    icon: <Waves className="h-4 w-4" />,
    accent: "text-orange-500",
    clue:
      "Shelf-like intimal projection at the posterior carotid bulb, ipsilateral to the infarct. Suspect in young patients (often women, <60y) with recurrent ESUS in one territory and no conventional risk factors.",
    investigations: [
      "Dedicated CT angiography with sagittal-oblique reformats of the carotid bulb (modality of choice)",
      "High-resolution vessel wall MRI if CTA equivocal",
      "Digital subtraction angiography when CTA/MRI remain inconclusive and intervention is considered",
      "Review prior imaging — webs are frequently missed on axial-only review",
    ],
    decision:
      "Confirmed ipsilateral web with recurrent ipsilateral stroke: consider carotid stenting or endarterectomy. First event: antithrombotic therapy plus close follow-up; anticoagulation is not established.",
  },
  {
    id: "pfo-pascal",
    title: "Patent foramen ovale with possible/probable PASCAL",
    icon: <HeartPulse className="h-4 w-4" />,
    accent: "text-rose-500",
    clue:
      "PASCAL (PFO-Associated Stroke Causal Likelihood) combines the RoPE score with high-risk PFO features (large shunt, atrial septal aneurysm) to grade causality as unlikely, possible, or probable.",
    investigations: [
      "TTE with agitated saline (bubble) study, with and without Valsalva",
      "TEE to size the shunt and identify atrial septal aneurysm / long tunnel",
      "Transcranial Doppler bubble study when TEE is not tolerated",
      "Lower-limb and pelvic venous imaging (Doppler ± MR venography) for a source thrombus",
      "Thrombophilia screen if age <50 or prior venous thromboembolism",
      "Calculate RoPE score to complete the PASCAL classification",
    ],
    decision:
      "Possible or probable PASCAL in patients ≤60y: percutaneous PFO closure reduces recurrence (RESPECT, CLOSE, REDUCE). Unlikely PASCAL: antiplatelet therapy alone.",
    caveat: "Closure benefit is not demonstrated for 'unlikely' PASCAL — avoid reflex closure of an incidental PFO.",
  },
  {
    id: "nonstenotic-plaque",
    title: "Nonstenotic (30–50%) ulcerated atherosclerosis / arch atheroma ≥4 mm",
    icon: <Activity className="h-4 w-4" />,
    accent: "text-amber-500",
    clue:
      "Sub-50% plaque is excluded by TOAST yet can embolise when it is ulcerated, has intraplaque haemorrhage, a thin/ruptured fibrous cap, or a mobile arch component ≥4 mm thick.",
    investigations: [
      "CTA with plaque characterisation — ulceration, low-attenuation lipid core, plaque thickness",
      "High-resolution vessel wall MRI for intraplaque haemorrhage and cap integrity",
      "TEE or ECG-gated CTA of the aortic arch to measure atheroma thickness and mobile debris",
      "Compare ipsilateral versus contralateral plaque burden — asymmetry supports causality",
    ],
    decision:
      "Treat as atherosclerotic: high-intensity statin to LDL-C target, blood pressure control, antiplatelet therapy. Anticoagulation is not superior for arch atheroma (ARCH trial).",
  },
  {
    id: "device-af",
    title: "Device-detected atrial fibrillation within 1 year of the index stroke",
    icon: <Stethoscope className="h-4 w-4" />,
    accent: "text-sky-500",
    clue:
      "Subclinical AF found by implantable loop recorder, pacemaker, or prolonged patch monitoring. Burden and timing relative to the stroke both matter.",
    investigations: [
      "Prolonged ambulatory monitoring ≥14–30 days as the minimum ESUS standard",
      "Implantable loop recorder when non-invasive monitoring is negative (CRYSTAL-AF, STROKE-AF)",
      "Interrogate any existing pacemaker/ICD for atrial high-rate episodes",
      "Atrial cardiopathy markers: NT-proBNP, left atrial volume index, P-wave terminal force in V1",
    ],
    decision:
      "Episodes ≥24 h or clinical AF: start a DOAC. Short subclinical episodes (6 min – 24 h): individualise — NOAH-AFNET 6 and ARTESiA show modest ischaemic benefit offset by bleeding.",
    caveat: "Device-detected AF is not equivalent to clinical AF; weigh burden, CHA₂DS₂-VASc, and bleeding risk.",
  },
  {
    id: "cancer",
    title: "Evaluation for occult cancer",
    icon: <Ribbon className="h-4 w-4" />,
    accent: "text-purple-500",
    clue:
      "Suspect malignancy-associated stroke with multi-territory infarcts, markedly raised D-dimer, unexplained weight loss, venous thromboembolism, or non-bacterial thrombotic endocarditis on echo.",
    investigations: [
      "D-dimer, fibrinogen, CRP, peripheral smear",
      "CT chest / abdomen / pelvis; whole-body FDG-PET-CT if initial imaging is negative and suspicion remains",
      "TEE for marantic (non-bacterial thrombotic) vegetations",
      "Age- and sex-appropriate screening: mammography, colonoscopy, PSA, cervical screening",
      "Tumour markers only to direct an already-suspected source — not as a blind screen",
    ],
    decision:
      "Confirmed cancer-associated thrombosis: low-molecular-weight heparin is generally preferred over antiplatelets or VKA; coordinate with oncology and use the PRIME tool for risk estimation.",
  },
];

const ESUSWorkupModule: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const total = useMemo(() => PATHWAYS.reduce((n, p) => n + p.investigations.length, 0), []);
  const completed = Object.values(done).filter(Boolean).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="border-yellow-500/30" id="esus-workup">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              <span className="flex items-center gap-2">
                <Search className="h-5 w-5 text-yellow-500" />
                ESUS — Embolic Stroke of Undetermined Source
                <Badge variant="outline" className="ml-1">5 pathways</Badge>
              </span>
              <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Covert causes to interrogate after a standard workup is negative — with the investigations that confirm each one.
            </p>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Investigation progress</span>
                <span className="text-muted-foreground">{completed} / {total}</span>
              </div>
              <Progress value={pct} className="mt-2 h-2" />
            </div>

            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                <span>
                  <strong>ESUS definition:</strong> non-lacunar infarct, no ≥50% stenosis in the supplying artery, no
                  major-risk cardioembolic source, and no other identified cause — after brain and vessel imaging,
                  echocardiography, ≥24 h cardiac rhythm monitoring, and basic labs. NAVIGATE-ESUS and RE-SPECT ESUS
                  showed empiric anticoagulation does <em>not</em> beat aspirin, so the aim is to find the specific mechanism.
                </span>
              </p>
            </div>

            {PATHWAYS.map((p) => (
              <Card key={p.id} className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center gap-2 text-sm ${p.accent}`}>
                    {p.icon}
                    <span className="text-foreground">{p.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">When to suspect: </strong>{p.clue}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Investigations</p>
                    {p.investigations.map((inv, i) => {
                      const id = `${p.id}-${i}`;
                      return (
                        <div key={id} className="flex items-start gap-2">
                          <Checkbox
                            id={id}
                            checked={!!done[id]}
                            onCheckedChange={(c) => setDone((d) => ({ ...d, [id]: c as boolean }))}
                            className="mt-0.5"
                          />
                          <Label htmlFor={id} className="cursor-pointer text-xs font-normal leading-snug">
                            {inv}
                          </Label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
                    <p className="text-[11px] leading-snug">
                      <strong className="text-emerald-700 dark:text-emerald-300">If positive: </strong>
                      <span className="text-muted-foreground">{p.decision}</span>
                    </p>
                  </div>

                  {p.caveat && (
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      <AlertTriangle className="mr-1 inline h-3 w-3 text-amber-500" />
                      {p.caveat}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="rounded bg-muted/30 p-2 text-xs text-muted-foreground">
              <strong>Reference:</strong> AHA/ASA scientific statement on ESUS and covert embolic sources; RoPE/PASCAL
              classification; CRYSTAL-AF, STROKE-AF, ARTESiA, NOAH-AFNET 6, NAVIGATE-ESUS, RE-SPECT ESUS, ARCH.
              Findings should be interpreted alongside the ISPS25 phenotyping module.
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ESUSWorkupModule;
