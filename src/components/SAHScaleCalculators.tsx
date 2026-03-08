import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, RotateCcw, Brain, Droplets, Activity, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// ─── WFNS Scale ─────────────────────────────────────────────────────────────

export function SAHWFNSCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [gcs, setGcs] = useState<number | null>(null);
  const [motorDeficit, setMotorDeficit] = useState<boolean | null>(null);

  const getGrade = () => {
    if (gcs === null) return null;
    if (gcs === 15) return { grade: "I", mortality: "5%", color: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-300", border: "border-green-300 dark:border-green-700", desc: "GCS 15, no motor deficit" };
    if (gcs >= 13 && gcs <= 14 && motorDeficit === null) return null;
    if (gcs >= 13 && gcs <= 14 && !motorDeficit) return { grade: "II", mortality: "9%", color: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300", border: "border-yellow-300 dark:border-yellow-700", desc: "GCS 13-14, no motor deficit" };
    if (gcs >= 13 && gcs <= 14 && motorDeficit) return { grade: "III", mortality: "20%", color: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-300 dark:border-amber-700", desc: "GCS 13-14, with motor deficit" };
    if (gcs >= 7 && gcs <= 12) return { grade: "IV", mortality: "33%", color: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700", desc: "GCS 7-12, ± motor deficit" };
    if (gcs >= 3 && gcs <= 6) return { grade: "V", mortality: "70%", color: "bg-red-100 dark:bg-red-900/40", text: "text-red-800 dark:text-red-300", border: "border-red-300 dark:border-red-700", desc: "GCS 3-6, ± motor deficit" };
    return null;
  };

  const result = getGrade();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-violet-400 dark:border-violet-600 bg-gradient-to-br from-violet-50 dark:from-violet-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-violet-100/50 dark:bg-violet-900/30">
            <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                WFNS Scale (SAH)
                <Badge variant="outline" className="border-violet-400 text-violet-600 dark:text-violet-400 text-[10px]">GCS-Based</Badge>
              </div>
              <div className="flex items-center gap-2">
                {result && <Badge className={`${result.color} ${result.text} border ${result.border}`}>Grade {result.grade}</Badge>}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-violet-800 dark:text-violet-300">Glasgow Coma Scale (3-15)</label>
              <Slider min={3} max={15} step={1} value={gcs !== null ? [gcs] : [15]} onValueChange={([v]) => setGcs(v)} />
              <div className="text-center font-mono text-lg font-bold text-violet-700 dark:text-violet-400">{gcs ?? "—"}</div>
            </div>
            {gcs !== null && gcs >= 13 && gcs <= 14 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-violet-800 dark:text-violet-300">Motor Deficit Present?</label>
                <div className="flex gap-2">
                  <Button size="sm" variant={motorDeficit === true ? "default" : "outline"} onClick={() => setMotorDeficit(true)}>Yes</Button>
                  <Button size="sm" variant={motorDeficit === false ? "default" : "outline"} onClick={() => setMotorDeficit(false)}>No</Button>
                </div>
              </div>
            )}
            {result && (
              <div className={`p-4 rounded-lg ${result.color} border ${result.border}`}>
                <div className={`text-2xl font-bold ${result.text}`}>WFNS Grade {result.grade}</div>
                <div className={`text-sm ${result.text}`}>{result.desc}</div>
                <div className={`text-lg font-bold mt-2 ${result.text}`}>{result.mortality} mortality</div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setGcs(null); setMotorDeficit(null); }}><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
            <p className="text-xs text-muted-foreground"><strong>Ref:</strong> Drake CG et al. J Neurosurg 1988. Most widely used in research for SAH grading.</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Hunt & Hess ────────────────────────────────────────────────────────────

export function SAHHuntHessCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [grade, setGrade] = useState<number | null>(null);

  const grades = [
    { g: 1, desc: "Asymptomatic or mild headache, slight nuchal rigidity", mortality: "1-5%", color: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-300", border: "border-green-300 dark:border-green-700" },
    { g: 2, desc: "Moderate-severe headache, nuchal rigidity, CN palsy only", mortality: "5-10%", color: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300", border: "border-yellow-300 dark:border-yellow-700" },
    { g: 3, desc: "Drowsiness, confusion, or mild focal deficit", mortality: "10-15%", color: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-300 dark:border-amber-700" },
    { g: 4, desc: "Stupor, moderate-severe hemiparesis, early decerebrate", mortality: "20-40%", color: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700" },
    { g: 5, desc: "Deep coma, decerebrate rigidity, moribund", mortality: "50-70%", color: "bg-red-100 dark:bg-red-900/40", text: "text-red-800 dark:text-red-300", border: "border-red-300 dark:border-red-700" },
  ];

  const selected = grade !== null ? grades[grade - 1] : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50 dark:from-amber-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-amber-100/50 dark:bg-amber-900/30">
            <CardTitle className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hunt & Hess Scale (SAH)
              </div>
              <div className="flex items-center gap-2">
                {selected && <Badge className={`${selected.color} ${selected.text} border ${selected.border}`}>Grade {grade}</Badge>}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-3">
            {grades.map((g) => (
              <button key={g.g} onClick={() => setGrade(g.g)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${grade === g.g ? `${g.color} ${g.border} ring-2 ring-offset-1` : 'border-border hover:bg-accent/50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm">Grade {g.g}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{g.mortality}</Badge>
                </div>
              </button>
            ))}
            {selected && (
              <div className={`p-4 rounded-lg ${selected.color} border ${selected.border} mt-2`}>
                <div className={`text-2xl font-bold ${selected.text}`}>Hunt & Hess Grade {grade}</div>
                <div className={`text-sm ${selected.text} mt-1`}>{selected.desc}</div>
                <div className={`text-lg font-bold mt-2 ${selected.text}`}>Surgical Mortality: {selected.mortality}</div>
                {grade && grade >= 4 && <p className={`text-xs mt-2 ${selected.text}`}>⚠ Poor-grade SAH — consider goals of care discussion. Early aggressive treatment may still be beneficial.</p>}
              </div>
            )}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setGrade(null)}><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
              <p className="text-xs text-muted-foreground">Add 1 grade for serious systemic disease or severe vasospasm on angiography.</p>
            </div>
            <p className="text-xs text-muted-foreground"><strong>Ref:</strong> Hunt WE, Hess RM. J Neurosurg 1968;28:14-20.</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── SAH Score (Mortality Predictor) ────────────────────────────────────────

export function SAHScoreCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [wfns, setWfns] = useState<number | null>(null);
  const [age, setAge] = useState<string>("");
  const [rebleed, setRebleed] = useState(false);
  const [aneurysmSize, setAneurysmSize] = useState<"small" | "large" | null>(null);
  const [diffuseSah, setDiffuseSah] = useState(false);

  const getScore = () => {
    if (wfns === null) return null;
    let score = 0;
    score += wfns === 4 ? 1 : wfns === 5 ? 2 : 0;
    const ageNum = parseInt(age);
    if (!isNaN(ageNum)) { score += ageNum >= 70 ? 2 : ageNum >= 50 ? 1 : 0; }
    if (rebleed) score += 1;
    if (aneurysmSize === "large") score += 1;
    if (diffuseSah) score += 1;
    return score;
  };

  const score = getScore();
  const getMortality = (s: number) => {
    if (s <= 1) return { risk: "~8%", level: "Low", color: "text-green-700 dark:text-green-400" };
    if (s <= 3) return { risk: "~25%", level: "Moderate", color: "text-amber-700 dark:text-amber-400" };
    if (s <= 5) return { risk: "~50%", level: "High", color: "text-orange-700 dark:text-orange-400" };
    return { risk: ">70%", level: "Very High", color: "text-red-700 dark:text-red-400" };
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-rose-400 dark:border-rose-600 bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-rose-100/50 dark:bg-rose-900/30">
            <CardTitle className="flex items-center justify-between text-rose-800 dark:text-rose-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                SAH Score (Mortality Predictor)
              </div>
              <div className="flex items-center gap-2">
                {score !== null && <Badge variant="outline" className="border-rose-400 text-rose-600 dark:text-rose-400">{score} pts</Badge>}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-rose-800 dark:text-rose-300">WFNS Grade at Admission</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {[1,2,3,4,5].map(g => (
                    <Button key={g} size="sm" variant={wfns === g ? "default" : "outline"} onClick={() => setWfns(g)}>
                      Grade {g} {g >= 4 ? `(+${g === 4 ? 1 : 2}pt)` : "(0pt)"}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-rose-800 dark:text-rose-300">Age</label>
                <input type="number" placeholder="e.g. 65" value={age} onChange={e => setAge(e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-rose-300 dark:border-rose-700 bg-background text-sm" />
                <p className="text-xs text-muted-foreground mt-0.5">&lt;50: 0pt | 50-69: 1pt | ≥70: 2pt</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button onClick={() => setRebleed(!rebleed)}
                  className={`p-2 rounded border text-xs text-left ${rebleed ? 'bg-rose-100 dark:bg-rose-900/40 border-rose-400' : 'border-border'}`}>
                  <span className="font-semibold">Rebleed (+1)</span><br />Aneurysm rebleeding
                </button>
                <button onClick={() => setAneurysmSize(aneurysmSize === "large" ? null : "large")}
                  className={`p-2 rounded border text-xs text-left ${aneurysmSize === "large" ? 'bg-rose-100 dark:bg-rose-900/40 border-rose-400' : 'border-border'}`}>
                  <span className="font-semibold">Large aneurysm (+1)</span><br />≥10mm
                </button>
                <button onClick={() => setDiffuseSah(!diffuseSah)}
                  className={`p-2 rounded border text-xs text-left ${diffuseSah ? 'bg-rose-100 dark:bg-rose-900/40 border-rose-400' : 'border-border'}`}>
                  <span className="font-semibold">Diffuse SAH (+1)</span><br />Modified Fisher 3-4
                </button>
              </div>
            </div>
            {score !== null && (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-700">
                <div className="text-2xl font-bold text-rose-800 dark:text-rose-300">SAH Score: {score}</div>
                <div className={`text-lg font-semibold mt-1 ${getMortality(score).color}`}>
                  {getMortality(score).level} Risk — Mortality {getMortality(score).risk}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground"><strong>Ref:</strong> Comprehensive prognostic tool combining clinical, radiologic, and patient factors.</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Hijdra Score ───────────────────────────────────────────────────────────

export function HijdraScoreCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const cisterns = [
    "Frontal interhemispheric fissure",
    "Lateral Sylvian fissure (L)",
    "Lateral Sylvian fissure (R)",
    "Basal Sylvian fissure (L)",
    "Basal Sylvian fissure (R)",
    "Suprasellar cistern",
    "Ambient cistern (L)",
    "Ambient cistern (R)",
    "Quadrigeminal cistern",
    "Prepontine cistern",
  ];
  const ventricles = [
    "Lateral ventricle (L)",
    "Lateral ventricle (R)",
    "Third ventricle",
    "Fourth ventricle",
  ];
  const [cisternScores, setCisternScores] = useState<number[]>(Array(10).fill(0));
  const [ventricleScores, setVentricleScores] = useState<number[]>(Array(4).fill(0));

  const cisternTotal = cisternScores.reduce((a, b) => a + b, 0);
  const ventricleTotal = ventricleScores.reduce((a, b) => a + b, 0);
  const total = cisternTotal + ventricleTotal;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-cyan-400 dark:border-cyan-600 bg-gradient-to-br from-cyan-50 dark:from-cyan-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-cyan-100/50 dark:bg-cyan-900/30">
            <CardTitle className="flex items-center justify-between text-cyan-800 dark:text-cyan-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Hijdra Sum Score
                <Badge variant="outline" className="border-cyan-400 text-cyan-600 dark:text-cyan-400 text-[10px]">Quantitative</Badge>
              </div>
              <div className="flex items-center gap-2">
                {total > 0 && <Badge variant="outline" className="border-cyan-400 text-cyan-600 dark:text-cyan-400">{total}/42</Badge>}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              Quantifies subarachnoid and intraventricular blood volume. Each cistern/fissure scored 0-3, each ventricle 0-3.
              Higher scores correlate with worse outcomes and higher vasospasm risk.
            </p>

            <div>
              <h5 className="font-semibold text-cyan-800 dark:text-cyan-300 text-sm mb-2">Cisterns & Fissures (0-30)</h5>
              <div className="space-y-2">
                {cisterns.map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs w-48 sm:w-56 shrink-0">{name}</span>
                    <div className="flex gap-1">
                      {[0,1,2,3].map(v => (
                        <button key={v} onClick={() => { const n = [...cisternScores]; n[i] = v; setCisternScores(n); }}
                          className={`w-8 h-8 rounded text-xs font-bold border transition-all ${cisternScores[i] === v
                            ? v === 0 ? 'bg-green-200 dark:bg-green-800 border-green-400' : v === 1 ? 'bg-yellow-200 dark:bg-yellow-800 border-yellow-400' : v === 2 ? 'bg-orange-200 dark:bg-orange-800 border-orange-400' : 'bg-red-200 dark:bg-red-800 border-red-400'
                            : 'border-border hover:bg-accent/50'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-cyan-800 dark:text-cyan-300 text-sm mb-2">Ventricles (0-12)</h5>
              <div className="space-y-2">
                {ventricles.map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs w-48 sm:w-56 shrink-0">{name}</span>
                    <div className="flex gap-1">
                      {[0,1,2,3].map(v => (
                        <button key={v} onClick={() => { const n = [...ventricleScores]; n[i] = v; setVentricleScores(n); }}
                          className={`w-8 h-8 rounded text-xs font-bold border transition-all ${ventricleScores[i] === v
                            ? v === 0 ? 'bg-green-200 dark:bg-green-800 border-green-400' : v === 1 ? 'bg-yellow-200 dark:bg-yellow-800 border-yellow-400' : v === 2 ? 'bg-orange-200 dark:bg-orange-800 border-orange-400' : 'bg-red-200 dark:bg-red-800 border-red-400'
                            : 'border-border hover:bg-accent/50'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-300 dark:border-cyan-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-xl font-bold text-cyan-800 dark:text-cyan-300">{cisternTotal}</div><div className="text-xs text-muted-foreground">Cisterns</div></div>
                <div><div className="text-xl font-bold text-cyan-800 dark:text-cyan-300">{ventricleTotal}</div><div className="text-xs text-muted-foreground">IVH</div></div>
                <div><div className="text-2xl font-bold text-cyan-800 dark:text-cyan-300">{total}</div><div className="text-xs text-muted-foreground">Total /42</div></div>
              </div>
              {cisternTotal > 20 && <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">⚠ High cistern score — elevated vasospasm risk</p>}
            </div>

            <Button variant="ghost" size="sm" onClick={() => { setCisternScores(Array(10).fill(0)); setVentricleScores(Array(4).fill(0)); }}>
              <RotateCcw className="h-3 w-3 mr-1" />Reset
            </Button>
            <p className="text-xs text-muted-foreground"><strong>Ref:</strong> Hijdra A et al. J Neurosurg 1990. 0=no blood, 1=small amount, 2=moderately filled, 3=completely filled.</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── VASOGRADE ──────────────────────────────────────────────────────────────

export function VasogradeCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [wfns, setWfns] = useState<number | null>(null);
  const [mFisher, setMFisher] = useState<number | null>(null);

  const getVasograde = () => {
    if (wfns === null || mFisher === null) return null;
    // Green: WFNS I-II + mFisher 1-2
    if (wfns <= 2 && mFisher <= 2) return { grade: "Green", dci: "11%", color: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-300", border: "border-green-400", desc: "Low DCI risk" };
    // Yellow: WFNS I-III + mFisher 3-4
    if (wfns <= 3 && mFisher >= 3) return { grade: "Yellow", dci: "28%", color: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300", border: "border-yellow-400", desc: "Moderate DCI risk" };
    // Yellow: WFNS III + mFisher 1-2
    if (wfns === 3 && mFisher <= 2) return { grade: "Yellow", dci: "28%", color: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300", border: "border-yellow-400", desc: "Moderate DCI risk" };
    // Red: WFNS IV-V
    if (wfns >= 4) return { grade: "Red", dci: "38%", color: "bg-red-100 dark:bg-red-900/40", text: "text-red-800 dark:text-red-300", border: "border-red-400", desc: "High DCI risk" };
    return { grade: "Yellow", dci: "28%", color: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300", border: "border-yellow-400", desc: "Moderate DCI risk" };
  };

  const result = getVasograde();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-emerald-100/50 dark:bg-emerald-900/30">
            <CardTitle className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                VASOGRADE (DCI Predictor)
              </div>
              <div className="flex items-center gap-2">
                {result && <Badge className={`${result.color} ${result.text} border ${result.border}`}>{result.grade}</Badge>}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              Combines WFNS grade and Modified Fisher scale to predict delayed cerebral ischemia (DCI). Simple traffic-light classification.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-emerald-800 dark:text-emerald-300">WFNS Grade</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {[1,2,3,4,5].map(g => (
                    <Button key={g} size="sm" variant={wfns === g ? "default" : "outline"} onClick={() => setWfns(g)}>
                      {g}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Modified Fisher Grade</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {[1,2,3,4].map(g => (
                    <Button key={g} size="sm" variant={mFisher === g ? "default" : "outline"} onClick={() => setMFisher(g)}>
                      {g}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {result && (
              <div className={`p-4 rounded-lg ${result.color} border ${result.border}`}>
                <div className={`text-2xl font-bold ${result.text}`}>VASOGRADE: {result.grade}</div>
                <div className={`text-sm ${result.text}`}>{result.desc}</div>
                <div className={`text-lg font-semibold mt-1 ${result.text}`}>DCI Risk: {result.dci}</div>
              </div>
            )}

            {/* Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-100 dark:bg-emerald-900/40">
                    <th className="p-2 border border-emerald-200 dark:border-emerald-700"></th>
                    <th className="p-2 border border-emerald-200 dark:border-emerald-700">mFisher 1-2</th>
                    <th className="p-2 border border-emerald-200 dark:border-emerald-700">mFisher 3-4</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-2 border border-emerald-200 dark:border-emerald-700 font-bold">WFNS I-II</td>
                    <td className="p-2 border border-emerald-200 dark:border-emerald-700 bg-green-100 dark:bg-green-900/20 text-center font-bold text-green-700">🟢 Green</td>
                    <td className="p-2 border border-emerald-200 dark:border-emerald-700 bg-yellow-100 dark:bg-yellow-900/20 text-center font-bold text-yellow-700">🟡 Yellow</td>
                  </tr>
                  <tr><td className="p-2 border border-emerald-200 dark:border-emerald-700 font-bold">WFNS III</td>
                    <td className="p-2 border border-emerald-200 dark:border-emerald-700 bg-yellow-100 dark:bg-yellow-900/20 text-center font-bold text-yellow-700">🟡 Yellow</td>
                    <td className="p-2 border border-emerald-200 dark:border-emerald-700 bg-yellow-100 dark:bg-yellow-900/20 text-center font-bold text-yellow-700">🟡 Yellow</td>
                  </tr>
                  <tr><td className="p-2 border border-emerald-200 dark:border-emerald-700 font-bold">WFNS IV-V</td>
                    <td className="p-2 border border-emerald-200 dark:border-emerald-700 bg-red-100 dark:bg-red-900/20 text-center font-bold text-red-700">🔴 Red</td>
                    <td className="p-2 border border-emerald-200 dark:border-emerald-700 bg-red-100 dark:bg-red-900/20 text-center font-bold text-red-700">🔴 Red</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground"><strong>Ref:</strong> de Oliveira Manoel AL et al. Stroke 2015. VASOGRADE predicts DCI, poor outcome, and mortality.</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── SEBES (Subarachnoid Extension of Blood into brain parenchyma) ──────────

export function SEBESCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const grades = [
    { s: 0, desc: "No blood in Sylvian fissure or parenchyma on either side", dci: "5%", color: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-300" },
    { s: 1, desc: "Thin SAH without blood clot in bilateral Sylvian fissures", dci: "15%", color: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300" },
    { s: 2, desc: "Thin SAH with blood clot in unilateral Sylvian fissure", dci: "25%", color: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-300" },
    { s: 3, desc: "Thick SAH with bilateral Sylvian fissure clots", dci: "40%", color: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300" },
    { s: 4, desc: "Thick SAH with intracerebral or intraventricular extension", dci: "55%", color: "bg-red-100 dark:bg-red-900/40", text: "text-red-800 dark:text-red-300" },
  ];

  const selected = score !== null ? grades[score] : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-pink-400 dark:border-pink-600 bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-pink-100/50 dark:bg-pink-900/30">
            <CardTitle className="flex items-center justify-between text-pink-800 dark:text-pink-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                SEBES Score
                <Badge variant="outline" className="border-pink-400 text-pink-600 dark:text-pink-400 text-[10px]">DCI Risk</Badge>
              </div>
              <div className="flex items-center gap-2">
                {selected && <Badge variant="outline" className="border-pink-400 text-pink-600 dark:text-pink-400">{score}/4</Badge>}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-3">
            <p className="text-xs text-muted-foreground">
              Sylvian fissure and basal cistern Early Brain Edema Score. Predicts DCI based on early brain edema patterns.
            </p>
            {grades.map((g) => (
              <button key={g.s} onClick={() => setScore(g.s)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${score === g.s ? `${g.color} ring-2 ring-offset-1` : 'border-border hover:bg-accent/50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm">Score {g.s}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">DCI {g.dci}</Badge>
                </div>
              </button>
            ))}
            {selected && (
              <div className={`p-3 rounded-lg ${selected.color}`}>
                <div className={`font-bold ${selected.text}`}>SEBES {score}: DCI Risk ~{selected.dci}</div>
              </div>
            )}
            <p className="text-xs text-muted-foreground"><strong>Ref:</strong> Ahn SH et al. Neurosurgery 2018. SEBES independently predicts DCI and poor functional outcome.</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── BNI Scale ──────────────────────────────────────────────────────────────

export function BNIScaleCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [grade, setGrade] = useState<number | null>(null);

  const grades = [
    { g: 1, desc: "No SAH or thin SAH ≤ 5mm", spasm: "< 15%", color: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-300" },
    { g: 2, desc: "SAH clot 5-10mm", spasm: "~20%", color: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300" },
    { g: 3, desc: "SAH clot 10-15mm", spasm: "~30%", color: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-300" },
    { g: 4, desc: "SAH clot 15-20mm", spasm: "~40%", color: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300" },
    { g: 5, desc: "SAH clot > 20mm", spasm: "> 50%", color: "bg-red-100 dark:bg-red-900/40", text: "text-red-800 dark:text-red-300" },
  ];

  const selected = grade !== null ? grades[grade - 1] : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-sky-400 dark:border-sky-600 bg-gradient-to-br from-sky-50 dark:from-sky-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-sky-100/50 dark:bg-sky-900/30">
            <CardTitle className="flex items-center justify-between text-sky-800 dark:text-sky-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                BNI Scale (Vasospasm)
                <Badge variant="outline" className="border-sky-400 text-sky-600 dark:text-sky-400 text-[10px]">Barrow</Badge>
              </div>
              <div className="flex items-center gap-2">
                {selected && <Badge variant="outline" className="border-sky-400 text-sky-600 dark:text-sky-400">Grade {grade}</Badge>}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-3">
            <p className="text-xs text-muted-foreground">
              Barrow Neurological Institute grading scale. Measures maximum SAH clot thickness in any cistern/fissure to predict symptomatic vasospasm.
            </p>
            {grades.map((g) => (
              <button key={g.g} onClick={() => setGrade(g.g)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${grade === g.g ? `${g.color} ring-2 ring-offset-1` : 'border-border hover:bg-accent/50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm">Grade {g.g}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Spasm {g.spasm}</Badge>
                </div>
              </button>
            ))}
            {selected && (
              <div className={`p-3 rounded-lg ${selected.color}`}>
                <div className={`font-bold ${selected.text}`}>BNI Grade {grade}: Vasospasm Risk {selected.spasm}</div>
              </div>
            )}
            <p className="text-xs text-muted-foreground"><strong>Ref:</strong> Wilson DA et al. J Neurosurg 2012. Simple volumetric grading outperforms Fisher in predicting vasospasm.</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
