import { useEffect, useState } from "react";
import { Search, ArrowRight, ScanSearch, AlertTriangle } from "lucide-react";
import CollapsibleModule from "./CollapsibleModule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OCCULT5_EVENT, type Occult5State } from "./DDimerStrokeModule";

const readStored = (): Occult5State | null => {
  try { const v = localStorage.getItem("occult5"); return v ? JSON.parse(v) : null; } catch { return null; }
};

const STEPS = [
  { t: "1. Calculate OCCULT-5", d: "Age ≥77, ESUS, multi-territory infarcts, D-dimer ≥820 µg/L (comparable assay), female sex." },
  { t: "2. Exclude known active cancer & competing causes", d: "Known cancer → evaluate cancer activity, not occult screening. Review alternative causes of D-dimer elevation (VTE, sepsis, DIC, recent surgery)." },
  { t: "3. Clinical review", d: "Targeted history (weight loss, night sweats, bleeding, smoking), full examination (breast, lymph nodes, skin, rectal/pelvic as appropriate)." },
  { t: "4. Baseline labs", d: "CBC with film, LFTs, calcium, LDH, CRP, urinalysis; consider CEA/CA-125/PSA only as adjuncts — not stand-alone screening." },
  { t: "5. Targeted imaging (if score ≥3 or clinical suspicion)", d: "Choose modality by findings; multidisciplinary discussion before whole-body studies." },
];

const IMAGING = [
  { m: "CT chest / abdomen / pelvis (contrast)", n: "Pragmatic first-line when screening prompt met; detects lung, renal, pancreatic, hepatic, lymphoma." },
  { m: "FDG PET/CT", n: "Consider when CT is negative but suspicion remains high; higher yield but cost, radiation and false positives." },
  { m: "Age/sex-appropriate screening", n: "Mammography, cervical screening, PSA discussion, colonoscopy / FIT per national programmes if overdue." },
  { m: "Ultrasound (abdomen/pelvis, testicular)", n: "Radiation-free adjunct; useful in younger patients or targeted symptoms." },
  { m: "TEE / cardiac imaging", n: "Look for nonbacterial thrombotic (marantic) endocarditis in suspected cancer-associated stroke." },
  { m: "Lower-limb venous Doppler", n: "If VTE suspected — also informs paradoxical embolism." },
];

export default function OccultCancerScreeningSection() {
  const [score, setScore] = useState<Occult5State | null>(readStored);
  useEffect(() => {
    const h = (e: Event) => setScore((e as CustomEvent<Occult5State>).detail);
    window.addEventListener(OCCULT5_EVENT, h);
    return () => window.removeEventListener(OCCULT5_EVENT, h);
  }, []);

  const label = !score ? "Not calculated" : score.notApplicable ? "N/A (known cancer)" : score.definitive ? `${score.min} / 5` : `${score.min}–${score.max} provisional`;
  const tone = !score || score.notApplicable ? "border-border" : score.min >= 3 ? "border-red-500/60 bg-red-500/10" : score.max <= 2 ? "border-emerald-500/60 bg-emerald-500/10" : "border-sky-500/60 bg-sky-500/10";
  const msg = !score ? "Complete the OCCULT-5 calculator in Elevated D-dimer to drive this pathway."
    : score.notApplicable ? "Known active cancer — evaluate cancer activity and stroke mechanism rather than occult screening."
    : score.min >= 3 ? "Screening prompt met — proceed to targeted imaging (step 5) after clinical review."
    : score.max <= 2 ? "Below threshold — usual age-appropriate screening; escalate only if clinically suspicious."
    : "Provisional — complete unknown items before deciding on imaging.";

  return (
    <CollapsibleModule
      title="Targeted Occult Cancer Screening"
      subtitle="Pathway from OCCULT-5 to imaging"
      icon={<Search className="h-5 w-5 text-amber-500" />}
      badge={<Badge variant="outline" className="text-[10px]">OCCULT-5: {label}</Badge>}
    >
      <div className="space-y-4 text-sm">
        <div className={`rounded-lg border p-3 space-y-2 ${tone}`}>
          <p className="font-semibold">Current OCCULT-5: {label}</p>
          <p className="text-muted-foreground">{msg}</p>
          <Button size="sm" variant="outline" className="min-h-[44px]" onClick={() => document.getElementById("d-dimer-stroke")?.scrollIntoView({ behavior: "smooth" })}>
            Open OCCULT-5 calculator <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-2">
          {STEPS.map((s) => (
            <div key={s.t} className="rounded-lg border border-border p-3">
              <p className="font-semibold">{s.t}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border p-3">
          <p className="font-semibold flex items-center gap-2 mb-2"><ScanSearch className="h-4 w-4 text-primary" />Imaging options</p>
          <ul className="space-y-1.5 text-xs">
            {IMAGING.map((i) => (
              <li key={i.m}><span className="font-medium">• {i.m}</span><span className="text-muted-foreground"> — {i.n}</span></li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-xs flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>No internationally agreed systematic occult-cancer screening pathway exists after stroke. OCCULT-5 ≥3 is a prompt, not an automatic order for whole-body CT or PET/CT; a score &lt;3 does not rule out cancer.</span>
        </div>
      </div>
    </CollapsibleModule>
  );
}
