import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, AlertTriangle, Scale } from "lucide-react";

/* =========================================================
 * UIATS — Unruptured Intracranial Aneurysm Treatment Score
 * Etminan N, et al. Neurology 2015;85(10):881–889
 * Two parallel columns: points favouring repair vs conservative.
 * ========================================================= */

type Flag = { key: string; label: string; pts: number };

const REPAIR_PATIENT: Flag[] = [
  { key: "priorSAH", label: "Previous SAH from a different aneurysm", pts: 4 },
  { key: "familial", label: "Familial aneurysms / SAH (≥2 first-degree relatives)", pts: 3 },
  { key: "ethnicity", label: "Japanese / Finnish / Inuit ethnicity", pts: 2 },
  { key: "smoking", label: "Current cigarette smoking", pts: 3 },
  { key: "htn", label: "Hypertension (SBP > 140 mmHg, treated or untreated)", pts: 2 },
  { key: "adpkd", label: "Autosomal dominant polycystic kidney disease", pts: 2 },
  { key: "drugs", label: "Current drug abuse (cocaine / amphetamine)", pts: 2 },
  { key: "alcohol", label: "Current alcohol abuse (>300 g ethanol/week)", pts: 1 },
  { key: "cnDeficit", label: "Cranial nerve deficit from the aneurysm", pts: 4 },
  { key: "massEffect", label: "Clinical or radiological mass effect", pts: 4 },
  { key: "thromboembolic", label: "Thromboembolic events from the aneurysm", pts: 3 },
  { key: "epilepsy", label: "Epilepsy attributable to the aneurysm", pts: 1 },
  { key: "qol", label: "Reduced QoL due to fear of rupture", pts: 2 },
];

const REPAIR_ANEURYSM: Flag[] = [
  { key: "multiple", label: "Aneurysm multiplicity", pts: 1 },
  { key: "irregular", label: "Irregular morphology / lobulation (daughter sac)", pts: 3 },
  { key: "ratio", label: "Size ratio > 3 or aspect ratio > 1.6", pts: 1 },
  { key: "growth", label: "Documented growth on serial imaging", pts: 4 },
  { key: "denovo", label: "De novo aneurysm formation on serial imaging", pts: 3 },
  { key: "contralateral", label: "Contralateral steno-occlusive vessel disease", pts: 1 },
];

const CONS_COMORBID: Flag[] = [
  { key: "neurocog", label: "Neurocognitive disorder (dementia)", pts: 3 },
  { key: "coag", label: "Coagulopathy / thrombophilic disease", pts: 2 },
  { key: "psych", label: "Psychiatric disorder impairing independence", pts: 2 },
];

const LOCATIONS = [
  { v: 0, l: "ICA / MCA / other anterior (0 pt)" },
  { v: 2, l: "AComA or PComA (2 pt)" },
  { v: 4, l: "Vertebral / basilar artery (4 pt)" },
  { v: 5, l: "Basilar apex bifurcation (5 pt)" },
];

export function UIATSScore() {
  const [age, setAge] = useState("");
  const [size, setSize] = useState("");
  const [lifeExp, setLifeExp] = useState("");
  const [location, setLocation] = useState<number | null>(null);
  const [complex, setComplex] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const toggle = (k: string) => setChecks((c) => ({ ...c, [k]: !c[k] }));

  const ageNum = age.trim() === "" ? null : Number(age);
  const sizeNum = size.trim() === "" ? null : Number(size);
  const lifeNum = lifeExp.trim() === "" ? null : Number(lifeExp);

  const ageError =
    ageNum === null ? null : Number.isNaN(ageNum) || ageNum < 18 || ageNum > 110
      ? "UIATS applies to adults ≥ 18 years (enter 18–110)."
      : null;
  const sizeError =
    sizeNum === null ? null : Number.isNaN(sizeNum) || sizeNum <= 0 || sizeNum > 60
      ? "Enter a plausible diameter (0.1–60 mm)."
      : null;

  const ageRepairPts = useMemo(() => {
    if (ageNum === null || ageError) return null;
    if (ageNum < 40) return 4;
    if (ageNum <= 60) return 3;
    if (ageNum <= 70) return 2;
    return 0;
  }, [ageNum, ageError]);

  const ageConsPts = useMemo(() => {
    if (ageNum === null || ageError) return null;
    if (ageNum < 40) return 0;
    if (ageNum <= 60) return 1;
    if (ageNum <= 70) return 3;
    if (ageNum <= 80) return 4;
    return 5;
  }, [ageNum, ageError]);

  const sizeRepairPts = useMemo(() => {
    if (sizeNum === null || sizeError) return null;
    if (sizeNum < 4) return 0;
    if (sizeNum < 7) return 1;
    if (sizeNum < 13) return 2;
    if (sizeNum < 25) return 3;
    return 4;
  }, [sizeNum, sizeError]);

  const sizeConsPts = useMemo(() => {
    if (sizeNum === null || sizeError) return null;
    if (sizeNum < 6) return 0;
    if (sizeNum <= 10) return 1;
    if (sizeNum <= 20) return 3;
    return 5;
  }, [sizeNum, sizeError]);

  const lifeConsPts = useMemo(() => {
    if (lifeNum === null || Number.isNaN(lifeNum) || lifeNum < 0) return null;
    if (lifeNum < 5) return 4;
    if (lifeNum <= 10) return 3;
    return 1;
  }, [lifeNum]);

  const missing: string[] = [];
  if (ageRepairPts === null) missing.push("Age");
  if (sizeRepairPts === null) missing.push("Aneurysm size");
  if (location === null) missing.push("Aneurysm location");
  if (lifeConsPts === null) missing.push("Life expectancy");

  const repairScore = useMemo(() => {
    if (ageRepairPts === null || sizeRepairPts === null || location === null) return null;
    const flags = [...REPAIR_PATIENT, ...REPAIR_ANEURYSM]
      .filter((f) => checks[f.key])
      .reduce((s, f) => s + f.pts, 0);
    return ageRepairPts + sizeRepairPts + location + flags;
  }, [ageRepairPts, sizeRepairPts, location, checks]);

  const consScore = useMemo(() => {
    if (ageConsPts === null || sizeConsPts === null || lifeConsPts === null) return null;
    const comorbid = CONS_COMORBID.filter((f) => checks[f.key]).reduce((s, f) => s + f.pts, 0);
    // Constant intervention-related risk = 5 points (always added)
    return ageConsPts + sizeConsPts + lifeConsPts + comorbid + (complex ? 3 : 0) + 5;
  }, [ageConsPts, sizeConsPts, lifeConsPts, checks, complex]);

  const recommendation = useMemo(() => {
    if (repairScore === null || consScore === null) return null;
    const diff = repairScore - consScore;
    if (diff >= 3) return { text: "Aneurysm repair (surgical or endovascular)", tone: "repair", diff };
    if (diff <= -3) return { text: "Conservative management", tone: "cons", diff };
    return { text: "Not definitive — either approach may be supported", tone: "neutral", diff };
  }, [repairScore, consScore]);

  const reset = () => {
    setAge(""); setSize(""); setLifeExp(""); setLocation(null); setComplex(false); setChecks({});
  };

  const CheckRow = ({ f }: { f: Flag }) => (
    <div className="flex items-start gap-2">
      <Checkbox id={`uiats-${f.key}`} checked={!!checks[f.key]} onCheckedChange={() => toggle(f.key)} className="mt-0.5" />
      <Label htmlFor={`uiats-${f.key}`} className="text-sm cursor-pointer leading-snug">
        {f.label} — <span className="font-semibold">{f.pts} pt</span>
      </Label>
    </div>
  );

  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
          <Scale className="h-5 w-5" /> UIATS — Treatment Decision Score
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Saccular UIA in adults ≥18 y · Etminan N, et al. Neurology 2015;85:881–889. Score each aneurysm separately.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Shared inputs */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Age (years)</Label>
            <Input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 54" className="h-9" aria-invalid={!!ageError} />
            {ageError && <p className="text-xs text-destructive">{ageError}</p>}
            {ageRepairPts !== null && (
              <p className="text-xs text-muted-foreground">Repair {ageRepairPts} pt · Conservative {ageConsPts} pt</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Max diameter (mm)</Label>
            <Input type="number" inputMode="decimal" step={0.1} value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 7.6" className="h-9" aria-invalid={!!sizeError} />
            {sizeError && <p className="text-xs text-destructive">{sizeError}</p>}
            {sizeRepairPts !== null && (
              <p className="text-xs text-muted-foreground">Repair {sizeRepairPts} pt · Conservative {sizeConsPts} pt</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Life expectancy (years)</Label>
            <Input type="number" inputMode="numeric" value={lifeExp} onChange={(e) => setLifeExp(e.target.value)} placeholder="e.g. 20" className="h-9" />
            {lifeConsPts !== null && <p className="text-xs text-muted-foreground">Conservative {lifeConsPts} pt</p>}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Repair column */}
          <div className="space-y-3 rounded-lg border border-emerald-300 dark:border-emerald-800 p-3">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Favouring aneurysm repair</p>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient domain</Label>
              {REPAIR_PATIENT.map((f) => <CheckRow key={f.key} f={f} />)}
            </div>

            <div className="space-y-2 border-t pt-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aneurysm domain</Label>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Location</Label>
                <RadioGroup value={location?.toString() ?? ""} onValueChange={(v) => setLocation(Number(v))}>
                  {LOCATIONS.map((o) => (
                    <div key={o.v} className="flex items-center gap-2">
                      <RadioGroupItem id={`uiats-loc-${o.v}`} value={o.v.toString()} />
                      <Label htmlFor={`uiats-loc-${o.v}`} className="text-sm cursor-pointer">{o.l}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              {REPAIR_ANEURYSM.map((f) => <CheckRow key={f.key} f={f} />)}
            </div>
          </div>

          {/* Conservative column */}
          <div className="space-y-3 rounded-lg border border-amber-300 dark:border-amber-800 p-3">
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Favouring conservative management</p>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comorbid disease</Label>
              {CONS_COMORBID.map((f) => <CheckRow key={f.key} f={f} />)}
            </div>

            <div className="space-y-2 border-t pt-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Treatment domain</Label>
              <div className="flex items-start gap-2">
                <Checkbox id="uiats-complex" checked={complex} onCheckedChange={(v) => setComplex(!!v)} className="mt-0.5" />
                <Label htmlFor="uiats-complex" className="text-sm cursor-pointer leading-snug">
                  High complexity-related risk (wide neck, calcification, intraluminal thrombus, branch incorporation, tortuosity, &lt;3 mm) — <span className="font-semibold">3 pt</span>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimal intervention-related risk is always added as a constant <strong>5 pt</strong> on this side.
              </p>
            </div>
          </div>
        </div>

        {missing.length > 0 && (
          <div className="rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div><strong>Missing:</strong> {missing.join(" · ")}</div>
          </div>
        )}

        {repairScore !== null && consScore !== null && recommendation && (
          <div className="rounded-lg border-2 border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/30 p-4 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-md bg-emerald-100 dark:bg-emerald-950/40 px-3 py-2">
                <span className="text-xs font-medium">Repair</span>
                <Badge className="bg-emerald-600 text-white text-base px-3">{repairScore}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md bg-amber-100 dark:bg-amber-950/40 px-3 py-2">
                <span className="text-xs font-medium">Conservative</span>
                <Badge className="bg-amber-600 text-white text-base px-3">{consScore}</Badge>
              </div>
            </div>
            <p className="text-sm">
              <strong>Difference:</strong> {recommendation.diff > 0 ? "+" : ""}{recommendation.diff} pt
            </p>
            <p className="text-sm">
              <strong>UIATS recommendation:</strong> {recommendation.text}
            </p>
            <p className="text-xs text-muted-foreground">
              A difference of ≥3 points directs the recommendation; ±2 points or less is "not definitive".
            </p>
          </div>
        )}

        <div className="rounded-md border p-3 text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1 font-semibold text-foreground"><Calculator className="h-3.5 w-3.5" /> Scope</p>
          <p>
            Not applicable to fusiform, dissecting, infective, traumatic or flow-related aneurysms, aneurysms in
            collagen disorders / moyamoya, or patients &lt;18 years. UIATS reflects expert consensus, not rupture-risk
            prediction — pair it with PHASES and patient preference.
          </p>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={reset} className="text-xs">Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default UIATSScore;
