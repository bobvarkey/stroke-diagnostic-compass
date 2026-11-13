import { useEffect, useRef, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  MINOR_STROKE_DAPT,
  MINOR_STROKE_DAPT_DOSING,
  MINOR_STROKE_DAPT_REFERENCES,
  MINOR_STROKE_DAPT_REGIMENS,
  MINOR_STROKE_DAPT_SOURCES,
  MINOR_STROKE_DAPT_TRIALS,
  splitNoteLinks,
} from "@/lib/minorStrokeDapt";

function fineHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function NoteText({ text }: { text: string }) {
  return (
    <>
      {splitNoteLinks(text).map((part, index) =>
        part.type === "link" ? (
          <a
            key={`${part.value}-${index}`}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-medium text-sky-700 underline decoration-sky-700/40 underline-offset-2 hover:decoration-sky-700 dark:text-sky-300 dark:decoration-sky-300/40"
          >
            {part.value}
          </a>
        ) : (
          <span key={`${index}-${part.value.slice(0, 12)}`}>{part.value}</span>
        ),
      )}
    </>
  );
}

function GuidelineNote({ label, notes }: { label: string; notes: readonly string[] }) {
  const [open, setOpen] = useState(false);
  const hoverOpenedAt = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 220);
  };

  return (
    <Popover open={open} onOpenChange={(next) => {
      if (!next && fineHover() && Date.now() - hoverOpenedAt.current < 350) return;
      setOpen(next);
    }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
          onMouseEnter={() => {
            cancelClose();
            hoverOpenedAt.current = Date.now();
            setOpen(true);
          }}
          onMouseLeave={() => {
            if (fineHover()) scheduleClose();
          }}
          onPointerEnter={() => {
            cancelClose();
            hoverOpenedAt.current = Date.now();
            setOpen(true);
          }}
          onPointerLeave={() => {
            if (fineHover()) scheduleClose();
          }}
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={12}
        onOpenAutoFocus={(event) => {
          if (Date.now() - hoverOpenedAt.current < 350) event.preventDefault();
        }}
        onMouseEnter={cancelClose}
        onMouseLeave={() => {
          if (fineHover()) scheduleClose();
        }}
        onPointerEnter={cancelClose}
        onPointerLeave={() => {
          if (fineHover()) scheduleClose();
        }}
        className="w-[min(22rem,calc(100vw-1.5rem))] max-h-[min(70vh,24rem)] overflow-y-auto border-slate-200 bg-white p-3 text-left text-[13px] font-normal leading-relaxed text-slate-800 shadow-lg dark:border-border dark:bg-popover dark:text-popover-foreground"
      >
        <div className="space-y-2 break-words">
          {notes.map((note) => (
            <p key={note}>
              <NoteText text={note} />
            </p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const panelClass =
  "min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm dark:border-border dark:bg-background/40 dark:text-foreground sm:p-4";

export default function MinorStrokeDaptGuidance() {
  const [referencesOpen, setReferencesOpen] = useState(false);

  return (
    <div className="space-y-6 text-slate-900 dark:text-foreground">
      <header className="space-y-1 min-w-0">
        <h4 className="text-base font-semibold leading-snug tracking-tight">{MINOR_STROKE_DAPT.title}</h4>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-muted-foreground">{MINOR_STROKE_DAPT.context}</p>
      </header>

      <section className="space-y-2" aria-labelledby="dapt-regimen-heading">
        <h5 id="dapt-regimen-heading" className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
          {MINOR_STROKE_DAPT.whoHeading}
        </h5>
        <div className="space-y-2">
          {MINOR_STROKE_DAPT_REGIMENS.map((regimen) => (
            <article key={regimen.id} className={panelClass}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <h6 className="text-sm font-semibold leading-snug">{regimen.title}</h6>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-muted-foreground">{regimen.grade}</p>
                </div>
                <GuidelineNote label={regimen.noteLabel} notes={regimen.notes} />
              </div>
              <p className="mt-2 text-sm leading-relaxed break-words">{regimen.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2" aria-labelledby="dapt-trial-heading">
        <h5 id="dapt-trial-heading" className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
          {MINOR_STROKE_DAPT.trialsHeading}
        </h5>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MINOR_STROKE_DAPT_TRIALS.map((trial) => (
            <article key={trial.id} className={panelClass}>
              <div className="flex items-start gap-2">
                <h6 className="min-w-0 flex-1 text-sm font-semibold leading-snug">{trial.title}</h6>
                <GuidelineNote label={trial.noteLabel} notes={trial.notes} />
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                {trial.outcomeLabel}:{" "}
                <span className="mt-1 block text-xl font-semibold tabular-nums tracking-tight">{trial.outcome}</span>
                <span className="text-slate-500 dark:text-muted-foreground">({trial.hazard})</span>
              </p>
              <div className="mt-3 space-y-1 text-sm leading-relaxed">
                {trial.extras.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2" aria-labelledby="dapt-dosing-heading">
        <div className="flex items-start gap-2">
          <h5 id="dapt-dosing-heading" className="min-w-0 flex-1 text-sm font-semibold leading-snug">
            {MINOR_STROKE_DAPT_DOSING.title}{" "}
            <span className="font-normal text-slate-500 dark:text-muted-foreground">
              ({MINOR_STROKE_DAPT_DOSING.caution})
            </span>
          </h5>
          <GuidelineNote label={MINOR_STROKE_DAPT_DOSING.noteLabel} notes={MINOR_STROKE_DAPT_DOSING.notes} />
        </div>
        <ol className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {MINOR_STROKE_DAPT_DOSING.steps.map((step) => (
            <li key={step.label} className={panelClass}>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
                {step.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed break-words">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="space-y-1 min-w-0">
        <p className="text-xs leading-relaxed text-slate-500 break-words dark:text-muted-foreground">
          Sources
          {MINOR_STROKE_DAPT_SOURCES.map((source) => (
            <span key={source.href}>
              {" · "}
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-700 underline decoration-sky-700/30 underline-offset-2 hover:decoration-sky-700 dark:text-sky-300 dark:decoration-sky-300/30"
              >
                {source.label}
              </a>
            </span>
          ))}
        </p>
        <Collapsible open={referencesOpen} onOpenChange={setReferencesOpen}>
          <CollapsibleTrigger className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-1 text-left text-sm text-slate-600 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground">
            <span>Notes and references</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", referencesOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 px-1 pb-1 pt-2 text-sm leading-relaxed text-slate-600 dark:text-muted-foreground">
            {MINOR_STROKE_DAPT_REFERENCES.map((note) => (
              <p key={note} className="break-words">
                <NoteText text={note} />
              </p>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </footer>
    </div>
  );
}
