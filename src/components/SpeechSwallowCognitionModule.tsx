import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, MessageSquare, Soup, Brain, Target, AlertTriangle } from "lucide-react";
import { useRehabSharedState } from "@/hooks/useRehabSharedState";

type Opt = { value: string; label: string };

const SWALLOW_ITEMS: { key: string; label: string }[] = [
  { key: "alert", label: "Cannot maintain alertness / upright sitting for 15 min" },
  { key: "voice", label: "Wet or gurgly voice quality" },
  { key: "cough", label: "Weak volitional cough or absent throat clear" },
  { key: "waterTest", label: "Cough, choke or voice change on 50 mL water swallow test" },
  { key: "drooling", label: "Drooling or oral residue / pocketing" },
  { key: "facial", label: "Facial, lingual or palatal weakness" },
];

const DIET: Opt[] = [
  { value: "nbm", label: "NBM (nil by mouth) — awaiting SLT" },
  { value: "iddsi3", label: "IDDSI 3 liquidised + 4 pureed" },
  { value: "iddsi5", label: "IDDSI 5 minced & moist" },
  { value: "iddsi7ez", label: "IDDSI 7 easy to chew" },
  { value: "normal", label: "Normal diet & thin fluids" },
];

const COMM: Opt[] = [
  { value: "none", label: "No communication impairment" },
  { value: "dysarthria", label: "Dysarthria — slurred but language intact" },
  { value: "expressive", label: "Expressive (Broca) aphasia — effortful, non-fluent" },
  { value: "receptive", label: "Receptive (Wernicke) aphasia — fluent, poor comprehension" },
  { value: "global", label: "Global aphasia — expression and comprehension impaired" },
  { value: "apraxiaSpeech", label: "Apraxia of speech — inconsistent articulatory groping" },
];

const COG_DOMAINS: { key: string; label: string; hint: string }[] = [
  { key: "attention", label: "Attention / concentration", hint: "Serial 7s, digit span, sustained task >5 min" },
  { key: "memory", label: "Memory", hint: "3-word recall at 5 min, orientation to time/place" },
  { key: "executive", label: "Executive function", hint: "Sequencing, planning, clock draw, trail making" },
  { key: "visuospatial", label: "Visuospatial / neglect", hint: "Line bisection, cancellation, copying" },
  { key: "insight", label: "Insight / safety awareness", hint: "Recognises deficits, complies with precautions" },
];

const MOCA: Opt[] = [
  { value: "none", label: "Not performed" },
  { value: "26", label: "MoCA ≥26 — normal" },
  { value: "18", label: "MoCA 18–25 — mild impairment" },
  { value: "10", label: "MoCA 10–17 — moderate impairment" },
  { value: "9", label: "MoCA <10 — severe impairment" },
];

const SectionShell: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, title, subtitle, icon, accent, badge, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card id={id} className={`${accent} bg-card/80 backdrop-blur`}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer rounded-t-lg transition-colors hover:bg-muted/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-muted/50 p-2">{icon}</div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const Goals: React.FC<{ items: string[]; tone?: string }> = ({ items, tone = "text-foreground" }) => (
  <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
    <div className="mb-1.5 flex items-center gap-1.5">
      <Target className="h-3.5 w-3.5 text-muted-foreground" />
      <p className="text-xs font-bold text-foreground">Rehab goals</p>
    </div>
    <ul className="space-y-1">
      {items.map((g) => (
        <li key={g} className={`text-[11px] leading-snug ${tone}`}>• {g}</li>
      ))}
    </ul>
  </div>
);

const SpeechSwallowCognitionModule: React.FC = () => {
  const { state, update } = useRehabSharedState();

  const [swallow, setSwallow] = useState<Record<string, boolean>>({});
  const [diet, setDiet] = useState("nbm");
  const [comm, setComm] = useState("none");
  const [cog, setCog] = useState<Record<string, boolean>>({});
  const [moca, setMoca] = useState("none");

  const swallowFails = SWALLOW_ITEMS.filter((i) => swallow[i.key]);
  const dysphagia = swallowFails.length > 0 || diet !== "normal";
  const commImpaired = comm !== "none";
  const cogFails = COG_DOMAINS.filter((d) => cog[d.key]);
  const cogImpaired = cogFails.length > 0 || (moca !== "none" && moca !== "26");

  // publish to the shared pathway state
  React.useEffect(() => {
    update({
      dysphagiaSuspected: dysphagia,
      communicationImpairment: commImpaired,
      cognitiveImpairment: cogImpaired,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dysphagia, commImpaired, cogImpaired]);

  const swallowGoals = useMemo(() => {
    if (!dysphagia) return ["Maintain normal diet; re-screen if new drowsiness, wet voice or chest infection."];
    return [
      "Week 1: SLT bedside evaluation ± FEES/videofluoroscopy; keep NBM until formally cleared.",
      "Daily: strict aspiration precautions — upright 90°, remain upright 30 min post-meal, single sips, no straws.",
      "Daily: oral care 2× per day (reduces aspiration pneumonia risk).",
      "Week 1–2: effortful swallow, supraglottic swallow and Mendelsohn manoeuvre as tolerated (SLT-led).",
      "Week 2–4: Shaker/chin-tuck-against-resistance for suprahyoid strength; graded IDDSI upgrade.",
      "Escalate: NG tube if unsafe oral intake >24–72 h; discuss gastrostomy if dysphagia persists >2–3 weeks.",
    ];
  }, [dysphagia]);

  const commGoals = useMemo(() => {
    switch (comm) {
      case "dysarthria":
        return [
          "Daily: over-articulation drills, rate control (pacing board), breath-support training.",
          "Week 2+: intensive loudness/clarity practice; introduce AAC only if intelligibility <50%.",
        ];
      case "expressive":
        return [
          "Daily 45–60 min: constraint-induced aphasia therapy or semantic feature analysis (high dose = better outcome).",
          "Provide picture/word boards; allow extra response time and accept gesture.",
          "Week 2–12: script training for functional phrases; family communication-partner training.",
        ];
      case "receptive":
        return [
          "Short simple sentences, one instruction at a time, supplement with gesture and written key words.",
          "Daily: auditory comprehension hierarchy — yes/no → single step → multistep.",
          "Verify consent and safety understanding before every therapy session.",
        ];
      case "global":
        return [
          "Establish a reliable yes/no or gesture signal before functional tasks.",
          "Daily short, high-frequency sessions; multimodal communication (gesture, drawing, AAC).",
          "Formal capacity/consent review; involve family in all sessions.",
        ];
      case "apraxiaSpeech":
        return [
          "Daily: sound production treatment with articulatory placement and integral stimulation cues.",
          "Slow rate, rhythmic/melodic cueing, high repetition of functional targets.",
        ];
      default:
        return ["No communication goals required; re-screen if new confusion or slurring."];
    }
  }, [comm]);

  const cogGoals = useMemo(() => {
    if (!cogImpaired) return ["No cognitive goals required; re-screen at discharge planning."];
    const g = [
      "Formal cognitive assessment (MoCA/OCS) and occupational-therapy review within 72 h.",
      "Structured, low-distraction environment; consistent daily routine and orientation board.",
      "Errorless learning and task-simplification for all new motor skills.",
    ];
    if (cog.attention) g.push("Attention: graded sustained-attention drills, 10–15 min blocks with rest breaks.");
    if (cog.memory) g.push("Memory: external aids (diary, alarms, checklists) plus spaced-retrieval practice.");
    if (cog.executive) g.push("Executive: goal-plan-do-review strategy training on real ADL tasks.");
    if (cog.visuospatial) g.push("Visuospatial/neglect: structured left-scanning, limb activation, environmental cueing.");
    if (cog.insight) g.push("Insight: supervised practice only; video feedback and explicit safety contracting.");
    return g;
  }, [cogImpaired, cog]);

  return (
    <div className="space-y-4">
      {/* Swallow */}
      <SectionShell
        id="recovery-swallow-module"
        title="Swallow (dysphagia) module"
        subtitle="Bedside screen, IDDSI diet level and swallow rehab goals"
        icon={<Soup className="h-5 w-5 text-amber-500" />}
        accent="border-amber-500/30"
        badge={
          dysphagia ? (
            <Badge className="bg-red-500/20 text-[10px] text-red-700 dark:text-red-300">Dysphagia suspected</Badge>
          ) : (
            <Badge className="bg-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300">Screen negative</Badge>
          )
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {SWALLOW_ITEMS.map((i) => (
            <label
              key={i.key}
              className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 ${
                swallow[i.key] ? "border-amber-500/50 bg-amber-500/10" : "border-border/60 bg-muted/20"
              }`}
            >
              <Checkbox
                className="mt-0.5"
                checked={!!swallow[i.key]}
                onCheckedChange={(c) => setSwallow((p) => ({ ...p, [i.key]: !!c }))}
              />
              <span className="text-xs font-semibold text-foreground">{i.label}</span>
            </label>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Current diet / fluid level</Label>
          <Select value={diet} onValueChange={setDiet}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIET.map((d) => <SelectItem key={d.value} value={d.value} className="text-sm">{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {dysphagia && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500" />
            <p className="text-[11px] leading-snug text-red-700 dark:text-red-300">
              Possible dysphagia: maintain aspiration precautions and follow the local swallow-screening/SLT pathway before any
              unsafe oral intake.
            </p>
          </div>
        )}
        <Separator />
        <Goals items={swallowGoals} />
      </SectionShell>

      {/* Speech */}
      <SectionShell
        id="recovery-speech-module"
        title="Speech & communication module"
        subtitle="Aphasia/dysarthria classification with dose-matched therapy goals"
        icon={<MessageSquare className="h-5 w-5 text-sky-500" />}
        accent="border-sky-500/30"
        badge={
          commImpaired ? (
            <Badge className="bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300">Impairment</Badge>
          ) : undefined
        }
      >
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Communication pattern</Label>
          <Select value={comm} onValueChange={setComm}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COMM.map((c) => <SelectItem key={c.value} value={c.value} className="text-sm">{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Goals items={commGoals} />
      </SectionShell>

      {/* Cognition */}
      <SectionShell
        id="recovery-cognition-module"
        title="Cognition module"
        subtitle="Domain screen, MoCA banding and cognitive rehab goals"
        icon={<Brain className="h-5 w-5 text-violet-500" />}
        accent="border-violet-500/30"
        badge={
          cogImpaired ? (
            <Badge className="bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300">
              {cogFails.length || 1} domain{cogFails.length === 1 ? "" : "s"}
            </Badge>
          ) : undefined
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {COG_DOMAINS.map((d) => (
            <label
              key={d.key}
              className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 ${
                cog[d.key] ? "border-violet-500/50 bg-violet-500/10" : "border-border/60 bg-muted/20"
              }`}
            >
              <Checkbox
                className="mt-0.5"
                checked={!!cog[d.key]}
                onCheckedChange={(c) => setCog((p) => ({ ...p, [d.key]: !!c }))}
              />
              <span>
                <span className="block text-xs font-semibold text-foreground">{d.label}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">{d.hint}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">MoCA band</Label>
          <Select value={moca} onValueChange={setMoca}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MOCA.map((m) => <SelectItem key={m.value} value={m.value} className="text-sm">{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Goals items={cogGoals} />
        <p className="text-[10px] text-muted-foreground">
          Screens feed the Pathway rehab gate: dysphagia, communication and cognition flags update the alerts automatically.
          Current shared flags — swallow: {state.dysphagiaSuspected ? "positive" : "negative"}; cognition:{" "}
          {state.cognitiveImpairment ? "positive" : "negative"}.
        </p>
      </SectionShell>
    </div>
  );
};

export default SpeechSwallowCognitionModule;
