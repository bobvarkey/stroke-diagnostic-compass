import { useEffect, useRef, useState } from "react";
import { Copy, Info, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ClinicalSlide from "./ClinicalSlide";
import ptfDiagram from "@/assets/ptf-terminal-force-diagram.webp";
import ptfv1Lead from "@/assets/ptfv1-lead-v1.webp";
import laVolumeDiagram from "@/assets/la-volume-area-length.webp";
import {
  ABOUT_THRESHOLDS,
  AF_OPTIONS,
  AF_PLACEHOLDER,
  ANTICOAGULATION_NOTE,
  ATRIAL_CARDIOPATHY_SUBTITLE,
  ATRIAL_CARDIOPATHY_TITLE,
  BIOMARKERS_LEAD,
  CLASSIFICATION_OPTIONS,
  CLASSIFICATION_PLACEHOLDER,
  FINDINGS_LEAD,
  FINDING_CHECKS,
  LAVI_CALCULATOR_NOTE,
  LAVI_DIAGRAM_CAPTION,
  LAVI_HEADING,
  LAVI_THRESHOLD_LABEL,
  LAVI_UNIT,
  LOCAL_NOTE,
  MONITORING_NOTE,
  MONITORING_OPTIONS,
  MONITORING_PLACEHOLDER,
  NT_PROBNP_HEADING,
  NT_PROBNP_THRESHOLD_LABEL,
  NT_PROBNP_UNIT,
  PTFV1_CALCULATOR_NOTE,
  PTFV1_HEADING,
  PTFV1_LEAD_CAPTION,
  PTFV1_THRESHOLD_LABEL,
  PTFV1_UNIT,
  PTF_DIAGRAM_CAPTION,
  REFERENCES,
  RISK_FACTOR_CHECKS,
  SECTION_NAV,
  WORKUP_CHECKS,
  WORKUP_LEAD,
  biomarkerSummary,
  biomarkerValues,
  emptyAnswers,
  formatAtrialCardiopathyCopy,
  formatQuantity,
  laviFromVolume,
  meetsLaviThreshold,
  meetsNtProBnpThreshold,
  meetsPtfv1Threshold,
  parseNumeric,
  ptfv1FromTracing,
  type AtrialCardiopathyAnswers,
  type ChecklistItem,
  type SelectOption,
} from "@/lib/atrialCardiopathy";

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
          className="no-print inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
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

const fieldClass =
  "h-11 bg-white text-base text-slate-900 dark:bg-background dark:text-foreground md:text-sm";

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY - 136;
  window.scrollTo({ top, behavior: "smooth" });
}

function copyControlValues(source: ParentNode, clone: ParentNode) {
  const from = source.querySelectorAll("input, textarea");
  const to = clone.querySelectorAll("input, textarea");
  from.forEach((node, index) => {
    const target = to[index];
    if (node instanceof HTMLInputElement && target instanceof HTMLInputElement) {
      target.value = node.value;
      target.setAttribute("value", node.value);
    }
    if (node instanceof HTMLTextAreaElement && target instanceof HTMLTextAreaElement) {
      target.value = node.value;
      target.textContent = node.value;
    }
  });
}

function printChecklist() {
  const source = document.getElementById("atrial-cardiopathy");
  document.getElementById("atrial-cardiopathy-print-root")?.remove();
  if (source) {
    const root = document.createElement("div");
    root.id = "atrial-cardiopathy-print-root";
    const clone = source.cloneNode(true) as HTMLElement;
    copyControlValues(source, clone);
    root.appendChild(clone);
    document.body.appendChild(root);
  }
  document.body.classList.add("print-atrial-cardiopathy");
  const cleanup = () => {
    document.body.classList.remove("print-atrial-cardiopathy");
    document.getElementById("atrial-cardiopathy-print-root")?.remove();
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  try {
    window.print();
  } catch {
    cleanup();
  }
}

async function writeClipboard(text: string) {
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
}

function CheckRow({
  item,
  checked,
  onChange,
}: {
  item: ChecklistItem;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg py-1">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        aria-label={item.label}
        className="mt-0.5"
      />
      <span className="min-w-0">
        <span className="block text-sm leading-snug break-words">{item.label}</span>
        {item.note && (
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-muted-foreground">{item.note}</span>
        )}
      </span>
    </label>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  multiline = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-1 block text-sm leading-snug">{label}</span>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24 bg-white text-base text-slate-900 dark:bg-background dark:text-foreground md:text-sm"
        />
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          className={fieldClass}
        />
      )}
    </label>
  );
}

function ChoiceField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-sm leading-snug">{label}</p>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger aria-label={label} className={cn(fieldClass, "w-full")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-1 block text-sm leading-snug">{label}</span>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(fieldClass, "[color-scheme:light] dark:[color-scheme:dark]")}
      />
    </label>
  );
}

function Flag({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <span className="inline-flex items-center rounded-md border border-amber-700/30 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100">
      Flagged
    </span>
  );
}

function MeasurementStatus({ value, unit, flagged }: { value: number | null; unit: string; flagged: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
      {value === null ? (
        <span>Pending</span>
      ) : (
        <span className="font-medium tabular-nums">{formatQuantity(value)} {unit}</span>
      )}
      <Flag on={flagged} />
    </p>
  );
}

function Heading({ id, title, noteLabel, note }: { id: string; title: string; noteLabel?: string; note?: string }) {
  return (
    <div className="flex items-start gap-2">
      <h3 id={id} className="min-w-0 flex-1 text-sm font-semibold leading-snug break-words">{title}</h3>
      {note && noteLabel && <InfoNote label={noteLabel} notes={[note]} />}
    </div>
  );
}

export default function AtrialCardiopathyChecklist() {
  const [answers, setAnswers] = useState<AtrialCardiopathyAnswers>(emptyAnswers);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const set = <K extends keyof AtrialCardiopathyAnswers>(key: K, value: AtrialCardiopathyAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setCopiedText(null);
  };

  const setCheck = (id: string, checked: boolean) => {
    setAnswers((current) => ({ ...current, checks: { ...current.checks, [id]: checked } }));
    setCopiedText(null);
  };

  const values = biomarkerValues(answers);
  const summary = biomarkerSummary(values);
  const ptfCalculated = ptfv1FromTracing(parseNumeric(answers.ptfDepth), parseNumeric(answers.ptfDuration));
  const laviCalculated = laviFromVolume(parseNumeric(answers.laVolume), parseNumeric(answers.bsa));

  const copyChecklist = async () => {
    const text = formatAtrialCardiopathyCopy(answers);
    setCopiedText(text);
    await writeClipboard(text);
  };

  return (
    <div className="scroll-mt-36 space-y-6 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm dark:border-border dark:bg-background/40 dark:text-foreground sm:p-4">
      <header className="flex items-start gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-snug tracking-tight break-words">{ATRIAL_CARDIOPATHY_TITLE}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-muted-foreground">{ATRIAL_CARDIOPATHY_SUBTITLE}</p>
        </div>
        <InfoNote label="How entries are kept" notes={[LOCAL_NOTE]} />
      </header>

      <div className="no-print flex flex-wrap items-center gap-1">
        <nav aria-label="Atrial cardiopathy sections" className="flex min-w-0 flex-wrap gap-1">
          {SECTION_NAV.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="min-h-11 rounded-md px-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-foreground dark:hover:bg-muted"
            >
              {section.label}
            </button>
          ))}
        </nav>
        <Button type="button" variant="outline" className="min-h-11 bg-white dark:bg-background" onClick={() => { setAnswers(emptyAnswers()); setCopiedText(null); }}>
          Clear form
        </Button>
        <Button type="button" variant="outline" className="min-h-11 bg-white dark:bg-background" onClick={printChecklist}>
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
        <Button type="button" variant="outline" className="min-h-11 bg-white dark:bg-background" onClick={() => { void copyChecklist(); }}>
          <Copy className="h-4 w-4" />
          {copiedText ? "Copied" : "Copy"}
        </Button>
      </div>
      {copiedText && (
        <pre className="no-print whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{copiedText}</pre>
      )}

      <section className={cn(panelClass, "scroll-mt-36 space-y-4")} aria-labelledby="atrial-cardiopathy-workup">
        <Heading id="atrial-cardiopathy-workup" title="Stroke workup" />
        <p className="text-sm leading-relaxed">{WORKUP_LEAD}</p>
        <div>
          {WORKUP_CHECKS.map((item) => (
            <CheckRow key={item.id} item={item} checked={answers.checks[item.id] === true} onChange={(checked) => setCheck(item.id, checked)} />
          ))}
        </div>
        <ChoiceField
          label="Stroke classification"
          placeholder={CLASSIFICATION_PLACEHOLDER}
          value={answers.classification}
          options={CLASSIFICATION_OPTIONS}
          onChange={(value) => set("classification", value)}
        />
        <TextField
          id="atrial-monitoring-hours"
          label="Initial continuous monitoring (hours)"
          value={answers.monitoringHours}
          onChange={(value) => set("monitoringHours", value)}
        />
        <ChoiceField
          label="Known or detected AF"
          placeholder={AF_PLACEHOLDER}
          value={answers.afStatus}
          options={AF_OPTIONS}
          onChange={(value) => set("afStatus", value)}
        />
        <TextField
          id="atrial-infarct-pattern"
          label="Infarct pattern and competing causes"
          value={answers.infarctPattern}
          onChange={(value) => set("infarctPattern", value)}
          multiline
        />
        <div>
          <h4 className="text-sm font-semibold leading-snug">Risk factors and symptoms</h4>
          {RISK_FACTOR_CHECKS.map((item) => (
            <CheckRow key={item.id} item={item} checked={answers.checks[item.id] === true} onChange={(checked) => setCheck(item.id, checked)} />
          ))}
        </div>
        <TextField
          id="atrial-history"
          label="Relevant history or symptoms"
          value={answers.historySymptoms}
          onChange={(value) => set("historySymptoms", value)}
          multiline
        />
      </section>

      <section className="scroll-mt-36 space-y-4" aria-labelledby="atrial-cardiopathy-biomarkers">
        <div className={panelClass}>
          <Heading
            id="atrial-cardiopathy-biomarkers"
            title="Atrial cardiopathy biomarkers"
            noteLabel="About the thresholds"
            note={ABOUT_THRESHOLDS}
          />
          <p className="mt-2 text-sm leading-relaxed">{BIOMARKERS_LEAD}</p>
        </div>

        <div className="print-stack grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
          <div className={cn(panelClass, "space-y-3")}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 className="text-sm font-semibold leading-snug">{PTFV1_HEADING}</h4>
              <p className="text-sm text-slate-500 dark:text-muted-foreground">{PTFV1_THRESHOLD_LABEL}</p>
            </div>
            <MeasurementStatus value={values.ptfv1} unit={PTFV1_UNIT} flagged={meetsPtfv1Threshold(values.ptfv1)} />
            <TextField
              id="atrial-ptfv1"
              label="Enter PTFV1 directly (µV·ms)"
              value={answers.ptfv1}
              onChange={(value) => set("ptfv1", value)}
            />
            <DateField id="atrial-ecg-date" label="ECG date" value={answers.ecgDate} onChange={(value) => set("ecgDate", value)} />
            <div className="flex items-start gap-2">
              <h5 className="min-w-0 flex-1 pt-2.5 text-sm font-medium leading-snug">Calculate PTFV1 from the V1 tracing</h5>
              <InfoNote label="How to calculate PTFV1" notes={[PTFV1_CALCULATOR_NOTE]} />
            </div>
            <TextField
              id="atrial-ptf-depth"
              label="Terminal negative depth (mm)"
              value={answers.ptfDepth}
              onChange={(value) => set("ptfDepth", value)}
            />
            <TextField
              id="atrial-ptf-duration"
              label="Negative component duration (ms)"
              value={answers.ptfDuration}
              onChange={(value) => set("ptfDuration", value)}
            />
            <p className="min-h-5 text-sm tabular-nums" aria-live="polite">
              {ptfCalculated === null ? "" : `${formatQuantity(ptfCalculated)} ${PTFV1_UNIT}`}
            </p>
          </div>
          <div className="min-w-0 space-y-4 lg:sticky lg:top-36 lg:self-start">
            <ClinicalSlide src={ptfDiagram} caption={PTF_DIAGRAM_CAPTION} alt={PTF_DIAGRAM_CAPTION} />
            <ClinicalSlide src={ptfv1Lead} caption={PTFV1_LEAD_CAPTION} alt={PTFV1_LEAD_CAPTION} />
          </div>
        </div>

        <div className={cn(panelClass, "space-y-3")}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h4 className="text-sm font-semibold leading-snug">{NT_PROBNP_HEADING}</h4>
            <p className="text-sm text-slate-500 dark:text-muted-foreground">{NT_PROBNP_THRESHOLD_LABEL}</p>
          </div>
          <MeasurementStatus value={values.ntProBnp} unit={NT_PROBNP_UNIT} flagged={meetsNtProBnpThreshold(values.ntProBnp)} />
          <TextField
            id="atrial-ntprobnp"
            label="Enter NT-proBNP directly (pg/mL)"
            value={answers.ntProBnp}
            onChange={(value) => set("ntProBnp", value)}
          />
          <DateField id="atrial-sample-date" label="Sample date" value={answers.sampleDate} onChange={(value) => set("sampleDate", value)} />
        </div>

        <div className="print-stack grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
          <div className={cn(panelClass, "space-y-3")}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 className="text-sm font-semibold leading-snug">{LAVI_HEADING}</h4>
              <p className="text-sm text-slate-500 dark:text-muted-foreground">{LAVI_THRESHOLD_LABEL}</p>
            </div>
            <MeasurementStatus value={values.lavi} unit={LAVI_UNIT} flagged={meetsLaviThreshold(values.lavi)} />
            <TextField
              id="atrial-lavi"
              label="Enter LAVI directly (mL/m²)"
              value={answers.lavi}
              onChange={(value) => set("lavi", value)}
            />
            <DateField id="atrial-echo-date" label="Echo date" value={answers.echoDate} onChange={(value) => set("echoDate", value)} />
            <div className="flex items-start gap-2">
              <h5 className="min-w-0 flex-1 pt-2.5 text-sm font-medium leading-snug">Calculate LAVI from LA volume and body surface area</h5>
              <InfoNote label="How to calculate LAVI" notes={[LAVI_CALCULATOR_NOTE]} />
            </div>
            <TextField
              id="atrial-la-volume"
              label="LA volume (mL)"
              value={answers.laVolume}
              onChange={(value) => set("laVolume", value)}
            />
            <TextField
              id="atrial-bsa"
              label="Body surface area (m²)"
              value={answers.bsa}
              onChange={(value) => set("bsa", value)}
            />
            <p className="min-h-5 text-sm tabular-nums" aria-live="polite">
              {laviCalculated === null ? "" : `${formatQuantity(laviCalculated)} ${LAVI_UNIT}`}
            </p>
          </div>
          <div className="min-w-0 lg:sticky lg:top-36 lg:self-start">
            <ClinicalSlide src={laVolumeDiagram} caption={LAVI_DIAGRAM_CAPTION} alt={LAVI_DIAGRAM_CAPTION} />
          </div>
        </div>

        <p className={cn(panelClass, "text-sm font-medium leading-relaxed")} aria-live="polite">{summary}</p>
      </section>

      <section className={cn(panelClass, "scroll-mt-36 space-y-4")} aria-labelledby="atrial-cardiopathy-findings">
        <Heading id="atrial-cardiopathy-findings" title="Additional findings" />
        <p className="text-sm leading-relaxed">{FINDINGS_LEAD}</p>
        <TextField
          id="atrial-pr"
          label="PR interval (ms)"
          value={answers.prInterval}
          onChange={(value) => set("prInterval", value)}
        />
        <TextField
          id="atrial-pac"
          label="PAC burden"
          value={answers.pacBurden}
          onChange={(value) => set("pacBurden", value)}
        />
        <div>
          {FINDING_CHECKS.map((item) => (
            <CheckRow key={item.id} item={item} checked={answers.checks[item.id] === true} onChange={(checked) => setCheck(item.id, checked)} />
          ))}
        </div>
        <TextField
          id="atrial-other-cardiac"
          label="Other cardiac findings"
          value={answers.otherCardiac}
          onChange={(value) => set("otherCardiac", value)}
          multiline
        />
      </section>

      <section className={cn(panelClass, "scroll-mt-36 space-y-4")} aria-labelledby="atrial-cardiopathy-follow-up">
        <Heading
          id="atrial-cardiopathy-follow-up"
          title="Rhythm monitoring and prevention"
          noteLabel="Monitoring guidance"
          note={MONITORING_NOTE}
        />
        <ChoiceField
          label="Monitoring plan"
          placeholder={MONITORING_PLACEHOLDER}
          value={answers.monitoringPlan}
          options={MONITORING_OPTIONS}
          onChange={(value) => set("monitoringPlan", value)}
        />
        <TextField
          id="atrial-duration-device"
          label="Duration and device"
          value={answers.durationDevice}
          onChange={(value) => set("durationDevice", value)}
        />
        <DateField id="atrial-review-date" label="Review date" value={answers.reviewDate} onChange={(value) => set("reviewDate", value)} />
        <TextField
          id="atrial-clinician"
          label="Responsible clinician"
          value={answers.clinician}
          onChange={(value) => set("clinician", value)}
        />
        <TextField
          id="atrial-monitor-result"
          label="Monitor result and prevention plan"
          value={answers.monitorResult}
          onChange={(value) => set("monitorResult", value)}
          multiline
        />
        <p className="text-sm leading-relaxed">{ANTICOAGULATION_NOTE}</p>
      </section>

      <section className={cn(panelClass, "space-y-2")} aria-labelledby="atrial-cardiopathy-references">
        <h3 id="atrial-cardiopathy-references" className="text-sm font-semibold leading-snug">References</h3>
        <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed">
          {REFERENCES.map((title) => (
            <li key={title} className="break-words">{title}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
