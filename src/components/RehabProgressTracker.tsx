import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, LineChart, Plus, Trash2, TrendingDown, TrendingUp, Minus, Copy } from "lucide-react";
import { toast } from "sonner";
import { useRehabSharedState } from "@/hooks/useRehabSharedState";

interface LogEntry {
  id: string;
  date: string;
  exercises: string;
  minutes: number;
  cmsa: number;
  fac: number;
  mrs: number;
  notes: string;
}

const KEY = "stroke-companion:rehab-progress-log";

const CMSA_OPTS = [
  "Stage 1 — flaccid paralysis",
  "Stage 2 — spasticity appears, minimal voluntary movement",
  "Stage 3 — marked spasticity, synergy-dominated movement",
  "Stage 4 — spasticity decreasing, movement out of synergy begins",
  "Stage 5 — spasticity waning, more complex isolated movement",
  "Stage 6 — near-normal coordination, mild residual slowing",
  "Stage 7 — normal movement and coordination",
];
const FAC_OPTS = [
  "0 — non-functional",
  "1 — continuous manual support",
  "2 — intermittent manual support",
  "3 — supervision only",
  "4 — independent, level surfaces",
  "5 — independent everywhere",
];
const MRS_OPTS = [
  "0 — no symptoms",
  "1 — no significant disability",
  "2 — slight disability",
  "3 — moderate disability, walks unaided",
  "4 — moderately severe, cannot walk unaided",
  "5 — severe disability, bedridden",
  "6 — death",
];

function load(): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

const Spark: React.FC<{ label: string; values: number[]; max: number; better: "up" | "down"; color: string }> = ({
  label, values, max, better, color,
}) => {
  if (values.length === 0) return null;
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const improved = better === "up" ? delta > 0 : delta < 0;
  const Icon = delta === 0 ? Minus : improved ? TrendingUp : TrendingDown;
  const tone = delta === 0 ? "text-muted-foreground" : improved ? "text-emerald-500" : "text-red-500";
  const w = 100;
  const h = 28;
  const pts = values
    .map((v, i) => {
      const x = values.length === 1 ? 0 : (i / (values.length - 1)) * w;
      const y = h - (v / max) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground">{label}</p>
        <span className={`flex items-center gap-1 text-[11px] font-semibold ${tone}`}>
          <Icon className="h-3.5 w-3.5" />
          {delta > 0 ? "+" : ""}{delta}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-8 w-full" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="text-[10px] text-muted-foreground">
        {first} → {last} over {values.length} entr{values.length === 1 ? "y" : "ies"}
      </p>
    </div>
  );
};

const RehabProgressTracker: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<LogEntry[]>(() => (typeof window === "undefined" ? [] : load()));
  const { state, update } = useRehabSharedState();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [exercises, setExercises] = useState("");
  const [minutes, setMinutes] = useState("45");
  const [cmsa, setCmsa] = useState(String(state.cmsa ?? 3));
  const [fac, setFac] = useState(String(state.fac ?? 1));
  const [mrs, setMrs] = useState(String(state.mrs ?? 4));
  const [notes, setNotes] = useState("");

  const persist = (next: LogEntry[]) => {
    setLog(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const add = () => {
    if (!exercises.trim()) {
      toast.error("Add at least one exercise for the day");
      return;
    }
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      date,
      exercises: exercises.trim(),
      minutes: Number(minutes) || 0,
      cmsa: Number(cmsa),
      fac: Number(fac),
      mrs: Number(mrs),
      notes: notes.trim(),
    };
    const next = [...log, entry].sort((a, b) => a.date.localeCompare(b.date));
    persist(next);
    update({ cmsa: entry.cmsa, fac: entry.fac, mrs: entry.mrs });
    setExercises("");
    setNotes("");
    toast.success(`Logged ${entry.date}`);
  };

  const remove = (id: string) => persist(log.filter((e) => e.id !== id));

  const totals = useMemo(() => {
    const mins = log.reduce((s, e) => s + e.minutes, 0);
    return { days: log.length, mins };
  }, [log]);

  const copySummary = () => {
    const lines = [
      "REHAB PROGRESS SUMMARY",
      `Sessions logged: ${totals.days} | Total therapy time: ${totals.mins} min`,
      "",
      ...log.map(
        (e) =>
          `${e.date} — ${e.minutes} min | CMSA ${e.cmsa} | FAC ${e.fac} | mRS ${e.mrs}\n  Exercises: ${e.exercises}${e.notes ? `\n  Notes: ${e.notes}` : ""}`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Progress summary copied");
  };

  return (
    <Card id="rehab-progress-tracker" className="border-teal-500/30 bg-card/80 backdrop-blur">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer rounded-t-lg transition-colors hover:bg-teal-500/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-teal-500/15 p-2">
                  <LineChart className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Rehab progress tracker</CardTitle>
                  <p className="text-xs text-muted-foreground">Log daily exercises and watch CMSA, FAC and mRS trend over time</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.length > 0 && (
                  <Badge className="bg-teal-500/20 text-[10px] text-teal-700 dark:text-teal-300">{log.length} days</Badge>
                )}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Entry form */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Therapy minutes</Label>
                <Input
                  type="number" min={0} max={480} value={minutes}
                  onChange={(e) => setMinutes(e.target.value)} className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground">Exercises completed today</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. Sit-to-stand ×3×10, task-specific reach ×50 reps, treadmill 10 min with harness"
                  value={exercises}
                  onChange={(e) => setExercises(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">CMSA arm stage</Label>
                <Select value={cmsa} onValueChange={setCmsa}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CMSA_OPTS.map((l, i) => <SelectItem key={i} value={String(i + 1)} className="text-sm">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">FAC</Label>
                <Select value={fac} onValueChange={setFac}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FAC_OPTS.map((l, i) => <SelectItem key={i} value={String(i)} className="text-sm">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">mRS</Label>
                <Select value={mrs} onValueChange={setMrs}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MRS_OPTS.map((l, i) => <SelectItem key={i} value={String(i)} className="text-sm">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Notes (optional)</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fatigue, pain, participation" className="h-9 text-sm" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="h-8 gap-1.5" onClick={add}>
                <Plus className="h-3.5 w-3.5" /> Log day
              </Button>
              {log.length > 0 && (
                <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={copySummary}>
                  <Copy className="h-3.5 w-3.5" /> Copy summary
                </Button>
              )}
            </div>

            {log.length > 0 && (
              <>
                <Separator />
                <div className="grid gap-2 sm:grid-cols-3">
                  <Spark label="CMSA (higher is better)" values={log.map((e) => e.cmsa)} max={7} better="up" color="hsl(var(--primary))" />
                  <Spark label="FAC (higher is better)" values={log.map((e) => e.fac)} max={5} better="up" color="#10b981" />
                  <Spark label="mRS (lower is better)" values={log.map((e) => e.mrs)} max={6} better="down" color="#f59e0b" />
                </div>

                <div className="space-y-2">
                  {log.map((e) => (
                    <div key={e.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {e.date} · {e.minutes} min
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <Badge variant="outline" className="text-[10px]">CMSA {e.cmsa}</Badge>
                            <Badge variant="outline" className="text-[10px]">FAC {e.fac}</Badge>
                            <Badge variant="outline" className="text-[10px]">mRS {e.mrs}</Badge>
                          </div>
                          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{e.exercises}</p>
                          {e.notes && <p className="text-[11px] italic leading-snug text-muted-foreground">{e.notes}</p>}
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(e.id)} aria-label="Delete entry">
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {totals.days} sessions · {totals.mins} total therapy minutes. Latest scores feed the rehab plan and pathway gate.
                </p>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RehabProgressTracker;
