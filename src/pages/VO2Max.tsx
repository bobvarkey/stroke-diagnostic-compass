import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STAGES = [
  { stage: 1, time: "0–3 min", speed: 1.7, incline: 0, mets: 2.3, note: "Warm-up; lactate should be near baseline." },
  { stage: 2, time: "3–6 min", speed: 1.7, incline: 5, mets: 3.5, note: "Watch for premature mitochondrial lactate spike (>3.5 mmol/L)." },
  { stage: 3, time: "6–9 min", speed: 1.7, incline: 10, mets: 4.6, note: "Typical McArdle symptom onset; severe acidosis in mito disease." },
  { stage: 4, time: "9–12 min", speed: 2.5, incline: 12, mets: 7.0, note: "Monitor for 'Second Wind' HR drop in McArdle." },
  { stage: 5, time: "12–15 min", speed: 3.4, incline: 14, mets: 9.5, note: "Advanced stage for higher-functioning patients." },
];

const vo2FromTime = (T: number) =>
  14.8 - 1.379 * T + 0.451 * T ** 2 - 0.012 * T ** 3;

const interpret = (vo2: number) => {
  if (vo2 < 20) return { label: "Very poor", color: "text-red-500" };
  if (vo2 < 30) return { label: "Poor", color: "text-orange-500" };
  if (vo2 < 40) return { label: "Below average", color: "text-amber-500" };
  if (vo2 < 50) return { label: "Average to Good", color: "text-emerald-500" };
  return { label: "Excellent", color: "text-teal-500" };
};

// Jones et al. predicted VO2max (mL/kg/min) from age & sex
const predictedVO2 = (age: number, sex: string) => {
  if (!age || age <= 0 || !sex) return null;
  if (sex === "M") return 50.75 - 0.372 * age;
  if (sex === "F") return 41.85 - 0.413 * age;
  return null;
};

const percentPredictedLabel = (pct: number) => {
  if (pct >= 100) return { label: "Normal (≥100%)", color: "text-emerald-500" };
  if (pct >= 85) return { label: "Low-normal (85–99%)", color: "text-teal-500" };
  if (pct >= 70) return { label: "Mildly reduced (70–84%)", color: "text-amber-500" };
  if (pct >= 50) return { label: "Moderately reduced (50–69%)", color: "text-orange-500" };
  return { label: "Severely reduced (<50%)", color: "text-red-500" };
};

export default function VO2Max() {
  const [minutes, setMinutes] = useState<string>("9");
  const [seconds, setSeconds] = useState<string>("30");
  const [stage, setStage] = useState<string>("3");
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  const T = useMemo(() => {
    const m = parseFloat(minutes) || 0;
    const s = parseFloat(seconds) || 0;
    return m + s / 60;
  }, [minutes, seconds]);

  const timeResult = useMemo(() => {
    if (T <= 0) return null;
    const vo2 = vo2FromTime(T);
    const mets = vo2 / 3.5;
    return { vo2, mets, interp: interpret(vo2) };
  }, [T]);

  const stageResult = useMemo(() => {
    const s = STAGES.find((x) => x.stage === parseInt(stage));
    if (!s) return null;
    const vo2 = s.mets * 3.5;
    return { ...s, vo2, interp: interpret(vo2) };
  }, [stage]);

  return (
    <div className="min-h-screen relative bg-background">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <header className="sticky top-0 z-40 glass-strong border-b">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-sunset flex items-center justify-center shadow-glow">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-lg text-gradient-sunset">VO₂ Max Calculator</h1>
          </div>
          <Badge variant="outline" className="ml-auto">Modified Bruce</Badge>
        </div>
        <div className="h-[2px] bg-gradient-sunset opacity-70" />
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4 flex gap-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Clinical use only.</strong> Estimated VO₂ from treadmill time is a proxy, not a substitute for direct gas analysis.
              In suspected metabolic myopathies (McArdle, mitochondrial), interpret alongside lactate kinetics and RPE — effort may be
              pain- or cramp-limited rather than cardiopulmonary-limited.
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="time" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="time" className="font-bold">By Total Time</TabsTrigger>
            <TabsTrigger value="stage" className="font-bold">By Stage</TabsTrigger>
            <TabsTrigger value="protocol" className="font-bold">Protocol</TabsTrigger>
          </TabsList>

          {/* By Time */}
          <TabsContent value="time" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Modified Bruce — Polynomial Estimate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Minutes</Label>
                    <Input type="number" min="0" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
                  </div>
                  <div>
                    <Label>Seconds</Label>
                    <Input type="number" min="0" max="59" value={seconds} onChange={(e) => setSeconds(e.target.value)} />
                  </div>
                  <div>
                    <Label>Age (opt.)</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="years" />
                  </div>
                  <div>
                    <Label>Sex (opt.)</Label>
                    <Select value={sex} onValueChange={setSex}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Weight (kg, opt.)</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="max-w-[200px]" />
                </div>

                {timeResult && (
                  <div className="grid md:grid-cols-3 gap-3 pt-2">
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                      <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground">Estimated VO₂</div>
                        <div className="text-3xl font-black text-gradient-sunset">{timeResult.vo2.toFixed(2)}</div>
                        <div className="text-xs">mL/kg/min</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
                      <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground">METs</div>
                        <div className="text-3xl font-black text-gradient-sunset">{timeResult.mets.toFixed(2)}</div>
                        <div className="text-xs">× resting O₂</div>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground">Interpretation</div>
                        <div className={`text-2xl font-black ${timeResult.interp.color}`}>{timeResult.interp.label}</div>
                        {weight && parseFloat(weight) > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Absolute VO₂ ≈ {(timeResult.vo2 * parseFloat(weight) / 1000).toFixed(2)} L/min
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="text-xs text-muted-foreground p-3 rounded-md bg-muted/40 font-mono">
                  VO₂ = 14.8 − 1.379·T + 0.451·T² − 0.012·T³  &nbsp;(T in minutes)
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Stage */}
          <TabsContent value="stage" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stage-based estimate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Completed stage</Label>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger className="max-w-[300px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s.stage} value={String(s.stage)}>
                          Stage {s.stage} — {s.speed} mph / {s.incline}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {stageResult && (
                  <>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">Approx VO₂</div>
                          <div className="text-3xl font-black text-gradient-sunset">{stageResult.vo2.toFixed(1)}</div>
                          <div className="text-xs">mL/kg/min</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">METs</div>
                          <div className="text-3xl font-black text-gradient-sunset">{stageResult.mets.toFixed(1)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">Category</div>
                          <div className={`text-2xl font-black ${stageResult.interp.color}`}>{stageResult.interp.label}</div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex gap-2 text-sm p-3 rounded-md bg-muted/40">
                      <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <span>{stageResult.note}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Protocol */}
          <TabsContent value="protocol" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Modified Bruce Protocol — Treadmill</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left">Stage</th>
                        <th className="p-2 text-left">Time</th>
                        <th className="p-2 text-left">Speed (mph)</th>
                        <th className="p-2 text-left">Incline (%)</th>
                        <th className="p-2 text-left">Est. METs</th>
                        <th className="p-2 text-left">Clinical Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STAGES.map((s) => (
                        <tr key={s.stage} className="border-t">
                          <td className="p-2 font-bold">{s.stage}</td>
                          <td className="p-2">{s.time}</td>
                          <td className="p-2">{s.speed}</td>
                          <td className="p-2">{s.incline}</td>
                          <td className="p-2">{s.mets}</td>
                          <td className="p-2">{s.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Pre-test preparation</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>• Fast 4–6 h before testing.</div>
                  <div>• No strenuous exercise 24–48 h prior.</div>
                  <div>• No caffeine, nicotine, alcohol × 12 h.</div>
                  <div>• Hydrate up to 1 h before test.</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Sampling & safety</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>• 3-min stages (mandatory for lactate steady state).</div>
                  <div>• Draw lactate in last 30 s of each stage.</div>
                  <div>• Use safety harness / spotter for McArdle patients.</div>
                  <div>• Stop for severe cramp → rhabdomyolysis risk.</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Mitochondrial signpost</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  Lactate surge &gt;4–5 mmol/L at Stage 2 or 3 (1.7 mph walking) suggests failing oxidative phosphorylation and early
                  anaerobic switch.
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Glycogen storage (McArdle) signpost</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  Severe stiffness/fatigue by Stage 3 with <em>flat</em> lactate (&lt;1.5 mmol/L, below baseline) suggests blocked
                  glycogen breakdown. Look for "Second Wind" HR plateau/drop at Stage 4.
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-sm">Post-test recovery</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>• <strong>0–3 min:</strong> Active recovery walk at 1.0–1.2 mph / 0% grade. Do not sit down.</div>
                  <div>• <strong>3–10 min:</strong> Passive seated recovery; complete final lactate draws.</div>
                  <div>• Provide carbohydrate/electrolyte snack after final draw.</div>
                  <div>• Instruct patient to watch for dark/tea-colored urine × 24 h → ER for rhabdomyolysis.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
