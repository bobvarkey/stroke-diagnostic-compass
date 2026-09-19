import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertTriangle,
  Ban,
  Bath,
  ChevronDown,
  Clock,
  Droplets,
  Footprints,
  Info,
  Pill,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MINOR_NON_DISABLING_STROKE as C,
  formatAbbreviations,
  formatIvtClassEvidence,
} from "@/lib/minorNonDisablingStroke";

/** Lucide 0.462 has no toilet icon; keep a compact stand-in for Toileting. */
function ToiletGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 4h7a3 3 0 0 1 3 3v3H7V4z" />
      <path d="M5 10h14a3 3 0 0 1-3 5H8a3 3 0 0 1-3-5z" />
      <path d="M9 15v3a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

const BATHE_ICONS = {
  B: Bath,
  A: Footprints,
  T: ToiletGlyph,
  H: Droplets,
  E: Utensils,
} as const;

const BATHE_TONES = [
  "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200",
  "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200",
  "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-200",
  "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200",
  "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
] as const;

const MinorNonDisablingStroke = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50/70 dark:from-teal-950/30 to-background">
        <CollapsibleTrigger className="w-full text-left" aria-expanded={isOpen}>
          <CardHeader className="bg-teal-100/50 dark:bg-teal-900/30">
            <CardTitle className="flex items-center justify-between gap-2 text-teal-800 dark:text-teal-200">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <ActivityGlyph />
                <span className="text-sm sm:text-base">{C.title}</span>
                <Badge className="bg-teal-600 text-white hover:bg-teal-600 border-0">
                  {C.nihssThresholdLabel}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] border-teal-400/70 text-teal-800 dark:text-teal-200 hidden sm:inline-flex"
                >
                  BATHE
                </Badge>
              </div>
              <ChevronDown
                className={cn("h-5 w-5 shrink-0 transition-transform", isOpen && "rotate-180")}
              />
            </CardTitle>
            {!isOpen && (
              <p className="text-xs font-normal text-teal-800/80 dark:text-teal-300/80 mt-1">
                {C.nihssCaveat} IVT Class 3 (No Benefit) · DAPT preferred.
              </p>
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-5 space-y-4">
            <div
              className="flex items-start gap-2 p-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40"
              role="status"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>NIHSS caveat.</strong> Often framed around {C.nihssThresholdLabel}, but{" "}
                {C.nihssCaveat.charAt(0).toLowerCase()}
                {C.nihssCaveat.slice(1)}
              </p>
            </div>

            <section aria-labelledby="bathe-heading">
              <h3
                id="bathe-heading"
                className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2"
              >
                {C.assessEverydayFunctionHeading} — BATHE
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {C.bathe.map((item, index) => {
                  const Icon = BATHE_ICONS[item.letter];
                  return (
                    <div
                      key={item.letter}
                      className={cn(
                        "rounded-lg border p-2 text-center min-h-[72px] flex flex-col items-center justify-center gap-1",
                        BATHE_TONES[index],
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <div className="text-lg font-bold leading-none">{item.letter}</div>
                      <div className="text-[10px] sm:text-xs font-medium leading-tight">
                        {item.word}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-slate-800 dark:text-slate-100">
                <strong>Core question:</strong> {C.coreQuestion}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{C.baselineNote}</p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3">
                <div className="flex items-start gap-2">
                  <Ban className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                      {C.ivt.heading}
                    </h4>
                    <p className="text-xs text-red-800/90 dark:text-red-200/90 mt-1">
                      {C.ivt.rationale}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-red-400/70 text-red-800 dark:text-red-200"
                      >
                        Class {C.ivt.classOfRecommendation}: {C.ivt.classLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-red-400/70 text-red-800 dark:text-red-200"
                      >
                        Level {C.ivt.levelOfEvidence}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3">
                <div className="flex items-start gap-2">
                  <Pill className="h-4 w-4 text-emerald-700 dark:text-emerald-300 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      {C.dapt.heading}
                    </h4>
                    <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 mt-1">
                      {C.dapt.statement}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="guideline" className="border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {C.guidelineHeading}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-800 dark:text-slate-100">{C.guidelinePopulation}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    <strong>Example:</strong> {C.guidelineExample}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="notes" className="border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    Scope, pretreatment, and definitions
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <p>{C.preTreatment}</p>
                  <p>{C.scope}</p>
                  <p>{C.batheLimitation}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatIvtClassEvidence()}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-relaxed">
              {C.footer} {formatAbbreviations()}
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

function ActivityGlyph() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600/15 dark:bg-teal-400/15 shrink-0">
      <Footprints className="h-4 w-4 text-teal-700 dark:text-teal-300" aria-hidden="true" />
    </span>
  );
}

export default MinorNonDisablingStroke;
