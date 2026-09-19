import { useMemo, useRef, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Brain,
  ChevronDown,
  FlaskConical,
  Pill,
  RotateCcw,
  ScanSearch,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CVT_ABBREVIATIONS,
  CVT_ALTERNATIVE_DIAGNOSES,
  CVT_ANTICOAG_NOTE,
  CVT_DISCLAIMER,
  CVT_ETIOLOGY,
  CVT_PATHWAY_TITLE,
  CVT_STABLE_DURATION,
  INITIAL_CVT_PATHWAY_STATE,
  getCvtPathwayGuidance,
  type CvtCourse,
  type CvtGuidanceTone,
  type CvtImagingResult,
  type CvtMassEffect,
  type CvtPathwayState,
} from "@/lib/cvtEvaluationPathway";

const TONE_CLASS: Record<CvtGuidanceTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200",
  urgent: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
  action: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
  stable: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
  progression: "border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-200",
};

function FlowArrow() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <ArrowDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
  accent,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  accent: "sky" | "red" | "purple" | "amber" | "orange" | "slate";
}) {
  const selectedMap = {
    sky: "border-sky-600 bg-sky-600 text-white",
    red: "border-red-600 bg-red-600 text-white",
    purple: "border-purple-600 bg-purple-600 text-white",
    amber: "border-amber-600 bg-amber-600 text-white",
    orange: "border-orange-600 bg-orange-600 text-white",
    slate: "border-slate-600 bg-slate-700 text-white",
  } as const;
  const idleMap = {
    sky: "border-sky-200 text-sky-800 hover:border-sky-400 dark:border-sky-800 dark:text-sky-200",
    red: "border-red-200 text-red-800 hover:border-red-400 dark:border-red-800 dark:text-red-200",
    purple: "border-purple-200 text-purple-800 hover:border-purple-400 dark:border-purple-800 dark:text-purple-200",
    amber: "border-amber-200 text-amber-800 hover:border-amber-400 dark:border-amber-800 dark:text-amber-200",
    orange: "border-orange-200 text-orange-800 hover:border-orange-400 dark:border-orange-800 dark:text-orange-200",
    slate: "border-slate-200 text-slate-800 hover:border-slate-400 dark:border-slate-600 dark:text-slate-200",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all text-center",
        selected ? selectedMap[accent] : idleMap[accent],
      )}
    >
      {children}
    </button>
  );
}

function EtiologyColumn({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="space-y-1.5">
      <h5 className="text-xs font-semibold text-purple-800 dark:text-purple-200">{title}</h5>
      <ul className="space-y-1 text-xs text-purple-700 dark:text-purple-300">
        {items.map((item) => (
          <li key={item} className="flex gap-1.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CVTEvaluationPathway() {
  const [isOpen, setIsOpen] = useState(true);
  const [state, setState] = useState<CvtPathwayState>(INITIAL_CVT_PATHWAY_STATE);
  const etiologyRef = useRef<HTMLDivElement | null>(null);

  const guidance = useMemo(() => getCvtPathwayGuidance(state), [state]);

  const setImaging = (imaging: CvtImagingResult) => {
    setState((prev) => ({
      imaging,
      massEffect: imaging === "confirmed" ? prev.massEffect : "pending",
      course: imaging === "confirmed" ? prev.course : "pending",
    }));
  };

  const setMassEffect = (massEffect: CvtMassEffect) => {
    setState((prev) => ({
      ...prev,
      imaging: "confirmed",
      massEffect,
    }));
  };

  const setCourse = (course: CvtCourse) => {
    setState((prev) => ({
      ...prev,
      imaging: "confirmed",
      course,
    }));
  };

  const openEtiology = () => {
    setState((prev) => ({ ...prev, imaging: "confirmed" }));
    etiologyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setState(INITIAL_CVT_PATHWAY_STATE);
  };

  const confirmed = state.imaging === "confirmed";
  const noCvt = state.imaging === "no-cvt";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/70 dark:from-purple-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-purple-100/50 dark:bg-purple-900/30">
            <CardTitle className="flex items-center justify-between text-purple-800 dark:text-purple-200 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Syringe className="h-5 w-5 shrink-0" />
                <span className="text-base sm:text-lg leading-snug text-left">{CVT_PATHWAY_TITLE}</span>
                <Badge className="ml-1 bg-purple-600 text-white hidden sm:inline-flex shrink-0">SNIF pathway</Badge>
              </div>
              <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", isOpen && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className={cn("flex-1 p-3 rounded-lg border text-sm", TONE_CLASS[guidance.tone])}>
                <p className="font-semibold">{guidance.title}</p>
                <p className="mt-1 text-xs sm:text-sm opacity-90">{guidance.detail}</p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-800 dark:text-slate-100 bg-slate-200 dark:bg-slate-700 border border-slate-400 dark:border-slate-500 rounded hover:bg-slate-300 dark:hover:bg-slate-600 shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div className="space-y-1">
              <div className="mx-auto max-w-xl rounded-lg border-2 border-sky-300 bg-sky-50 px-4 py-3 text-center dark:border-sky-700 dark:bg-sky-950/30">
                <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">Clinical suspicion for CVT</p>
              </div>

              <FlowArrow />

              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(14rem,20rem)] gap-2 items-stretch">
                <div
                  className={cn(
                    "rounded-lg border-2 px-4 py-3",
                    state.imaging !== "pending"
                      ? "border-sky-500 bg-sky-50 ring-2 ring-sky-300/60 dark:border-sky-400 dark:bg-sky-950/30 dark:ring-sky-700/50"
                      : "border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/20",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <ScanSearch className="h-4 w-4 mt-0.5 text-sky-600 dark:text-sky-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">
                        Brain and cerebral venous imaging
                      </p>
                      <p className="text-xs text-sky-800 dark:text-sky-300 mt-0.5">
                        MRI with T2* and MRV <strong>OR</strong> Head CT with CTV
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ChoiceButton
                      accent="sky"
                      selected={confirmed}
                      onClick={() => setImaging(confirmed ? "pending" : "confirmed")}
                    >
                      CVT confirmed
                    </ChoiceButton>
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-center text-slate-400 dark:text-slate-500" aria-hidden>
                  <ArrowRight className="h-4 w-4" />
                </div>

                <div
                  className={cn(
                    "rounded-lg border-2 p-3",
                    noCvt
                      ? "border-slate-600 bg-slate-100 ring-2 ring-slate-400/70 dark:border-slate-400 dark:bg-slate-900/50"
                      : "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40",
                  )}
                >
                  <ChoiceButton
                    accent="slate"
                    selected={noCvt}
                    onClick={() => setImaging(noCvt ? "pending" : "no-cvt")}
                  >
                    No evidence of CVT
                  </ChoiceButton>
                  <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                    Consider alternative diagnoses
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {CVT_ALTERNATIVE_DIAGNOSES.map((dx) => (
                      <li key={dx} className="flex gap-1.5">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                        {dx}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <FlowArrow />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-stretch">
                <div
                  className={cn(
                    "rounded-lg border-2 p-3",
                    state.massEffect === "present"
                      ? "border-red-500 bg-red-50 ring-2 ring-red-300/70 dark:border-red-400 dark:bg-red-950/40"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
                  )}
                >
                  <p className="text-xs font-semibold text-red-800 dark:text-red-200 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Mass effect with midline shift or signs of herniation
                  </p>
                  <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                    Consider decompressive hemicraniectomy
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <ChoiceButton
                      accent="red"
                      selected={state.massEffect === "present"}
                      onClick={() => setMassEffect(state.massEffect === "present" ? "pending" : "present")}
                    >
                      Present
                    </ChoiceButton>
                    <ChoiceButton
                      accent="slate"
                      selected={state.massEffect === "absent"}
                      onClick={() => setMassEffect(state.massEffect === "absent" ? "pending" : "absent")}
                    >
                      Absent
                    </ChoiceButton>
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-lg border-2 px-3 py-3 text-center flex flex-col justify-center",
                    confirmed
                      ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-300/70 dark:border-cyan-400 dark:bg-cyan-950/40"
                      : "border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/20",
                  )}
                >
                  <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">CVT confirmed</p>
                  <p className="text-[11px] text-cyan-700 dark:text-cyan-300 mt-1">
                    Three parallel next steps: urgent decompression if herniating, etiological evaluation, and parenteral anticoagulation
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openEtiology}
                  className="rounded-lg border-2 border-purple-300 bg-purple-50 p-3 text-left transition-all hover:border-purple-500 dark:border-purple-700 dark:bg-purple-950/30 dark:hover:border-purple-400"
                >
                  <p className="text-xs font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5" />
                    Etiological evaluation
                  </p>
                  <p className="mt-1 text-xs text-purple-700 dark:text-purple-300">
                    Jump to the workup section — clinical assessment, exposures, initial labs, and additional tests
                  </p>
                </button>
              </div>

              <FlowArrow />

              <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                  <Syringe className="h-4 w-4" />
                  Initiate parenteral anticoagulation
                </p>
                <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                  Subcutaneous LMWH (preferred) <strong>OR</strong> IV unfractionated heparin
                </p>
                <div className="mt-2 flex items-start gap-2 rounded-md bg-emerald-100/80 p-2 text-xs font-medium text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{CVT_ANTICOAG_NOTE}</span>
                </div>
              </div>

              <FlowArrow />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  className={cn(
                    "rounded-lg border-2 p-3",
                    state.course === "stable"
                      ? "border-amber-500 bg-amber-50 ring-2 ring-amber-300/70 dark:border-amber-400 dark:bg-amber-950/40"
                      : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20",
                  )}
                >
                  <ChoiceButton
                    accent="amber"
                    selected={state.course === "stable"}
                    onClick={() => setCourse(state.course === "stable" ? "pending" : "stable")}
                  >
                    Clinically and radiologically stable
                  </ChoiceButton>
                  <p className="mt-2 text-xs font-medium text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5" />
                    Transition to oral anticoagulation
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    DOAC or warfarin
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-300">
                    <li>{CVT_STABLE_DURATION.transient}</li>
                    <li>{CVT_STABLE_DURATION.highRisk}</li>
                    <li>{CVT_STABLE_DURATION.pregnancy}</li>
                  </ul>
                </div>

                <div
                  className={cn(
                    "rounded-lg border-2 p-3",
                    state.course === "progression"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-300/70 dark:border-orange-400 dark:bg-orange-950/40"
                      : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20",
                  )}
                >
                  <ChoiceButton
                    accent="orange"
                    selected={state.course === "progression"}
                    onClick={() => setCourse(state.course === "progression" ? "pending" : "progression")}
                  >
                    Clinical or imaging progression
                  </ChoiceButton>
                  <p className="mt-2 text-xs text-orange-800 dark:text-orange-300">(e.g., thrombus propagation)</p>
                  <p className="mt-1 text-xs font-medium text-orange-900 dark:text-orange-100">
                    Consider endovascular therapy
                  </p>
                  <p className="text-xs text-orange-800 dark:text-orange-300 mt-0.5">
                    Intrasinus thrombolysis or endovascular thrombectomy
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <a
                      href="#cvt-intraclot-thrombolysis"
                      className="inline-flex text-xs font-semibold text-orange-800 underline-offset-2 hover:underline dark:text-orange-200"
                    >
                      Intraclot protocol →
                    </a>
                    <a
                      href="#cvt-procedural-techniques"
                      className="inline-flex text-xs font-semibold text-orange-800 underline-offset-2 hover:underline dark:text-orange-200"
                    >
                      Procedural techniques →
                    </a>
                    <a
                      href="#cvt-endovascular-techniques"
                      className="inline-flex text-xs font-semibold text-orange-800 underline-offset-2 hover:underline dark:text-orange-200"
                    >
                      Endovascular techniques →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={etiologyRef}
              id="cvt-etiological-evaluation"
              className="scroll-mt-24 rounded-lg border-2 border-purple-300 bg-purple-50/80 p-3 dark:border-purple-700 dark:bg-purple-950/30"
            >
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-3">
                Etiological evaluation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EtiologyColumn title={CVT_ETIOLOGY.clinical.title} items={CVT_ETIOLOGY.clinical.items} />
                <EtiologyColumn title={CVT_ETIOLOGY.exposures.title} items={CVT_ETIOLOGY.exposures.items} />
                <EtiologyColumn title={CVT_ETIOLOGY.initialLabs.title} items={CVT_ETIOLOGY.initialLabs.items} />
                <EtiologyColumn title={CVT_ETIOLOGY.additionalLabs.title} items={CVT_ETIOLOGY.additionalLabs.items} />
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="suspect" className="border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:no-underline">
                  When to suspect CVT — presentation and risk factors
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/20">
                      <p className="font-medium text-purple-800 dark:text-purple-200 mb-1.5 flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5" />
                        Common symptoms
                      </p>
                      <ul className="list-disc list-inside text-purple-700 dark:text-purple-300 space-y-0.5">
                        <li>Severe headache (often progressive, worst in morning)</li>
                        <li>Seizures (focal or generalized)</li>
                        <li>Focal neurological deficits</li>
                        <li>Papilledema / visual changes</li>
                        <li>Altered consciousness</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/20">
                      <p className="font-medium text-purple-800 dark:text-purple-200 mb-1.5 flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5" />
                        Risk factors
                      </p>
                      <ul className="list-disc list-inside text-purple-700 dark:text-purple-300 space-y-0.5">
                        <li>Oral contraceptive pills / pregnancy / postpartum</li>
                        <li>Prothrombotic states (thrombophilia, APLS)</li>
                        <li>Infections (otitis, mastoiditis, sinusitis)</li>
                        <li>Malignancy, dehydration</li>
                        <li>Head trauma, recent surgery</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {CVT_ABBREVIATIONS.map((item, i) => (
                  <span key={item.abbr}>
                    {i > 0 && " | "}
                    <strong>{item.abbr}</strong>: {item.definition}
                  </span>
                ))}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{CVT_DISCLAIMER}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
