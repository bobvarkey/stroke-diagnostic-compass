import { useEffect, useRef, useState } from "react";
import { Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AGE_BAND_NOT_SELECTED,
  AGE_BANDS,
  FINDINGS_UNKNOWN_MESSAGE,
  HIGH_ROPE_HEADER,
  LOW_ROPE_HEADER,
  PASCAL_ASSIGNMENT_NOTE,
  PASCAL_CATEGORY_TITLE,
  PASCAL_FEATURES_NOTE,
  PASCAL_FEATURES_TITLE,
  PASCAL_FINDINGS,
  PASCAL_TABLE,
  QUALIFYING_NOT_ASSIGNED,
  ROPE_BAND_MISSING_MESSAGE,
  ROPE_ITEMS,
  ROPE_PASCAL_CLOSING,
  ROPE_PASCAL_INTRO,
  ROPE_PASCAL_TITLE,
  ROPE_SCORING_NOTE,
  ROPE_STEP_TITLE,
  TRI_LABEL,
  classifyRopePascal,
  formatRopePascalCopy,
  highlightedColumns,
  type AgeBandId,
  type PascalFindingId,
  type RopeItemId,
  type TriState,
} from "@/lib/ropePascal";

function fineHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function InfoNote({ label, notes }: { label: string; notes: readonly string[] }) {
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
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next && fineHover() && Date.now() - hoverOpenedAt.current < 350) return;
        setOpen(next);
      }}
    >
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
            <p key={note}>{note}</p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const panelClass =
  "min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm dark:border-border dark:bg-background/40 dark:text-foreground sm:p-4";

function choiceClass(active: boolean, interactive: boolean) {
  return cn(
    "min-h-11 rounded-lg border px-3 text-sm",
    active
      ? "border-slate-900 bg-slate-900 text-white dark:border-foreground dark:bg-foreground dark:text-background"
      : cn(
          "border-slate-200 bg-white text-slate-700 dark:border-border dark:bg-background/40 dark:text-foreground",
          interactive && "hover:bg-slate-50 dark:hover:bg-muted",
        ),
  );
}

export default function RopePascalChecklist() {
  const [rope, setRope] = useState<Partial<Record<RopeItemId, boolean>>>({});
  const [ageBand, setAgeBand] = useState<AgeBandId | null>(null);
  const [findings, setFindings] = useState<Partial<Record<PascalFindingId, TriState>>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const answers = { rope, ageBand, findings };
  const result = classifyRopePascal(answers);
  const highlight = highlightedColumns(result);
  const interpretationText =
    result.interpretation ?? (result.grade ? ROPE_BAND_MISSING_MESSAGE : FINDINGS_UNKNOWN_MESSAGE);

  const clearCopy = () => setCopiedText(null);

  const copyChecklist = async () => {
    const text = formatRopePascalCopy(answers);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopiedText(text);
  };

  return (
    <div className="scroll-mt-36 space-y-4 text-foreground">
      <header className="flex items-start gap-2 min-w-0">
        <h2 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight break-words">
          {ROPE_PASCAL_TITLE}
        </h2>
        <InfoNote label="About this checklist" notes={[ROPE_PASCAL_INTRO]} />
      </header>

      <section className={panelClass} aria-labelledby="rope-score-heading">
        <div className="flex items-start gap-2">
          <h3 id="rope-score-heading" className="min-w-0 flex-1 text-sm font-semibold leading-snug">
            {ROPE_STEP_TITLE}
          </h3>
          <InfoNote label="RoPE scoring" notes={[ROPE_SCORING_NOTE]} />
        </div>
        <div className="mt-2 space-y-1">
          {ROPE_ITEMS.map((item) => (
            <label key={item.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1">
              <Checkbox
                checked={rope[item.id] === true}
                onCheckedChange={(checked) => {
                  setRope((current) => ({ ...current, [item.id]: checked === true }));
                  clearCopy();
                }}
                aria-label={item.label}
              />
              <span className="text-sm leading-snug break-words">{item.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3" role="radiogroup" aria-label="Age">
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {AGE_BANDS.map((band) => {
              const selected = ageBand === band.id;
              return (
                <button
                  key={band.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setAgeBand(band.id);
                    clearCopy();
                  }}
                  className={cn(choiceClass(selected, true), "px-1")}
                >
                  <span className="block text-sm leading-none">{band.label}</span>
                  <span className={cn("mt-1 block text-xs tabular-nums", selected ? "text-white/80 dark:text-background/70" : "text-slate-500 dark:text-muted-foreground")}>
                    {band.points}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-live="polite">
          <p className="text-lg font-semibold tabular-nums">
            {result.points} / 10
          </p>
          <span className={cn(choiceClass(result.band === "Low", false), "inline-flex items-center")}>Low (0–6)</span>
          <span className={cn(choiceClass(result.band === "High", false), "inline-flex items-center")}>High (7–10)</span>
          {result.band === null && (
            <span className="text-sm text-slate-500 dark:text-muted-foreground">{AGE_BAND_NOT_SELECTED}</span>
          )}
        </div>
      </section>

      <section className={panelClass} aria-labelledby="pascal-features-heading">
        <div className="flex items-start gap-2">
          <h3 id="pascal-features-heading" className="min-w-0 flex-1 text-sm font-semibold leading-snug">
            {PASCAL_FEATURES_TITLE}
          </h3>
          <InfoNote label="Extended PASCAL features" notes={[PASCAL_FEATURES_NOTE]} />
        </div>
        <div className="mt-2 space-y-3">
          {PASCAL_FINDINGS.map((item) => (
            <div key={item.id}>
              <p className="text-sm leading-relaxed break-words">{item.label}</p>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={item.label}>
                {(["present", "absent", "unknown"] as const).map((value) => {
                  const selected = findings[item.id] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setFindings((current) => ({ ...current, [item.id]: value }));
                        clearCopy();
                      }}
                      className={choiceClass(selected, true)}
                    >
                      {TRI_LABEL[value]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass} aria-labelledby="pascal-category-heading">
        <div className="flex items-start gap-2">
          <h3 id="pascal-category-heading" className="min-w-0 flex-1 text-sm font-semibold leading-snug">
            {PASCAL_CATEGORY_TITLE}
          </h3>
          <InfoNote label="How to assign the category" notes={[PASCAL_ASSIGNMENT_NOTE]} />
          <InfoNote label="RoPE estimates and trials" notes={[ROPE_PASCAL_CLOSING]} />
        </div>
        <div className="mt-2 space-y-1 text-sm leading-relaxed break-words" aria-live="polite">
          <p>RoPE: {result.points} / 10 ({result.band ?? AGE_BAND_NOT_SELECTED})</p>
          <p>Extended PASCAL: {result.grade ?? FINDINGS_UNKNOWN_MESSAGE}</p>
          <p>Qualifying findings: {result.grade ? result.qualifying.join("; ") : QUALIFYING_NOT_ASSIGNED}</p>
          <p>Interpretation: {interpretationText}</p>
        </div>

        <div className="mt-3 space-y-2 md:hidden">
          {PASCAL_TABLE.map((row) => {
            const activeRow = result.grade === row.grade;
            const cellClass = (column: "low" | "high") =>
              cn(
                "rounded-md px-2 py-1.5 break-words",
                activeRow && highlight.includes(column)
                  ? "bg-slate-900 font-medium text-white dark:bg-foreground dark:text-background"
                  : "bg-slate-50 text-slate-800 dark:bg-muted/40 dark:text-foreground",
              );
            return (
              <div key={row.grade} className="rounded-lg border border-slate-200 p-2 dark:border-border">
                <p className="text-sm font-medium">{row.grade}</p>
                <p className="mt-0.5 text-sm leading-snug break-words">{row.findings}</p>
                <p className={cn("mt-1.5 text-sm", cellClass("low"))} aria-current={activeRow && highlight.includes("low") ? "true" : undefined}>
                  {LOW_ROPE_HEADER}: {row.low}
                </p>
                <p className={cn("mt-1 text-sm", cellClass("high"))} aria-current={activeRow && highlight.includes("high") ? "true" : undefined}>
                  {HIGH_ROPE_HEADER}: {row.high}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full table-fixed border-collapse text-left text-sm leading-snug">
            <thead>
              <tr>
                <th className="w-[18%] border border-slate-200 px-2 py-2 font-medium text-slate-500 dark:border-border dark:text-muted-foreground">Risk grade</th>
                <th className="w-[40%] border border-slate-200 px-2 py-2 font-medium text-slate-500 dark:border-border dark:text-muted-foreground">Findings</th>
                <th className="w-[21%] border border-slate-200 px-2 py-2 font-medium text-slate-500 dark:border-border dark:text-muted-foreground">{LOW_ROPE_HEADER}</th>
                <th className="w-[21%] border border-slate-200 px-2 py-2 font-medium text-slate-500 dark:border-border dark:text-muted-foreground">{HIGH_ROPE_HEADER}</th>
              </tr>
            </thead>
            <tbody>
              {PASCAL_TABLE.map((row) => {
                const activeRow = result.grade === row.grade;
                const cellClass = (column: "low" | "high") =>
                  cn(
                    "border border-slate-200 px-2 py-2 align-top break-words dark:border-border",
                    activeRow && highlight.includes(column) &&
                      "border-slate-900 bg-slate-900 font-medium text-white dark:border-foreground dark:bg-foreground dark:text-background",
                  );
                return (
                  <tr key={row.grade}>
                    <td className={cn("border border-slate-200 px-2 py-2 align-top font-medium break-words dark:border-border", activeRow && "text-slate-950 dark:text-foreground")}>
                      {row.grade}
                    </td>
                    <td className="border border-slate-200 px-2 py-2 align-top break-words dark:border-border">{row.findings}</td>
                    <td className={cellClass("low")} aria-current={activeRow && highlight.includes("low") ? "true" : undefined}>{row.low}</td>
                    <td className={cellClass("high")} aria-current={activeRow && highlight.includes("high") ? "true" : undefined}>{row.high}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => { void copyChecklist(); }}>
            <Copy className="h-4 w-4" />
            {copiedText ? "Copied" : "Copy"}
          </Button>
        </div>
        {copiedText && (
          <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{copiedText}</pre>
        )}
      </section>
    </div>
  );
}
