import { useEffect, useRef, useState } from "react";
import { Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ClinicalSlide from "./ClinicalSlide";
import esusChecklistSlide from "@/assets/esus-diagnostic-checklist.webp";
import { cn } from "@/lib/utils";
import {
  classificationInfoNotes,
  classifyEsus,
  ESUS_OUTCOME_LABEL,
  ESUS_PURPOSE,
  ESUS_RESPONSE_OPTIONS,
  ESUS_SCOPE,
  ESUS_SECTIONS,
  ESUS_SLIDES,
  ESUS_TITLE,
  formatEsusChecklistCopy,
  itemInfoNotes,
  responseFor,
  sectionInfoNotes,
  slideInfoNotes,
  type EsusBullet,
  type EsusResponse,
} from "@/lib/esusChecklist";

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

  if (notes.length === 0) return null;

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
            <p key={note}>{note}</p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const ESUS_CHECKLIST_ALT =
  "ESUS diagnostic checklist. Subtitle: Embolic stroke of undetermined source. Empty checkboxes in three columns. Minimum evaluation: Brain CT or MRI reviewed; Intracranial and extracranial arteries supplying the infarct assessed; 12-lead ECG reviewed; TTE reviewed. Add TEE if indicated.; ≥24 h of continuous rhythm monitoring; History, exam and targeted tests reviewed. ESUS criteria: Imaging confirms nonlacunar infarct; No ≥50% atherosclerotic stenosis in a supplying artery; No major-risk cardioembolic source (e.g. AF, thrombus, mechanical valve, LVEF <30%, infective endocarditis); No other cause (e.g. dissection, vasculitis). Cardiac and paradoxical sources: Occult AF: 2–4 weeks of monitoring if AF would change treatment. Consider an implantable monitor in selected cases.; Atrial high-rate episodes / device AF: review tracing, burden and timing; Atrial cardiopathy: NT-proBNP, ECG P-wave indices and LA size; LA spontaneous echo contrast or cor triatriatum; LV scar, aneurysm, cardiomyopathy, dysfunction or thrombus; Mitral or aortic valve abnormalities; PFO / right-to-left shunt: shunt size, atrial septal aneurysm, DVT/PE clues; Targeted TEE or cardiac CT/MRI for suspected cardiac or aortic sources. Arterial and aortic sources: Ipsilateral carotid plaque <50%: haemorrhage, thin cap, lipid core, ulceration or soft plaque >3 mm; Aortic arch plaque: ≥4 mm, ulceration, protrusion or mobile component. Cancer and procoagulant states: Cancer history, symptoms or therapy.; Few conventional vascular risk factors.; Multiterritory infarcts, incl. three territories; D-dimer: record assay, units and context; Anaemia, low platelets or low albumin; NBTE, coagulopathy, tumour embolism, vascular compression or therapy effects; Other procoagulant states (e.g. APS); Consider whole-body FDG PET/CT if occult cancer is suspected. Footer: Classify as ESUS when the minimum evaluation is complete and all four criteria are met. ESUS or atrial cardiopathy alone does not justify empiric anticoagulation. Hart 2014 / AHA/ASA 2021 / ESC and ACC 2024 / ARCADIA 2024 / AHA cancer statement.";

const panelClass =
  "min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm dark:border-border dark:bg-background/40 dark:text-foreground sm:p-4";

function BulletList({ bullets, className }: { bullets: readonly EsusBullet[]; className?: string }) {
  return (
    <ul className={cn("list-disc space-y-1 pl-4 text-sm leading-relaxed", className)}>
      {bullets.map((bullet) => {
        if (typeof bullet === "string") {
          return <li key={bullet} className="break-words">{bullet}</li>;
        }
        return (
          <li key={bullet.text} className="break-words">
            {bullet.text}
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {bullet.sub_bullets.map((line) => (
                <li key={line} className="break-words">{line}</li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

export default function EsusSection() {
  const [answers, setAnswers] = useState<Record<string, EsusResponse>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const outcome = classifyEsus(answers);

  const setResponse = (itemId: string, value: EsusResponse) => {
    setAnswers((current) => ({ ...current, [itemId]: value }));
    setCopiedText(null);
  };

  const copyChecklist = async () => {
    const text = formatEsusChecklistCopy(answers);
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
    <div className="space-y-6 text-foreground">
      <header className="flex items-start gap-2 min-w-0">
        <h2 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight break-words">
          {ESUS_TITLE}
        </h2>
        <InfoNote label="Notes" notes={[ESUS_SCOPE, ESUS_PURPOSE]} />
      </header>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {ESUS_SLIDES.map((slide) => {
          const notes = slideInfoNotes(slide.id);
          return (
            <article key={slide.id} className={panelClass}>
              {(slide.title || notes.length > 0) && (
                <div className="flex items-start gap-2">
                  {slide.title && (
                    <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug break-words">{slide.title}</h3>
                  )}
                  <InfoNote label={slide.title ?? slide.id} notes={notes} />
                </div>
              )}
              {slide.article_label && (
                <p className="mt-2 text-xs leading-relaxed break-words text-slate-500 dark:text-muted-foreground">{slide.article_label}</p>
              )}
              {slide.article_title && (
                <p className="mt-1 text-sm font-medium leading-snug break-words">{slide.article_title}</p>
              )}
              <BulletList bullets={slide.bullets} className={slide.title || notes.length > 0 ? "mt-2" : undefined} />
              {slide.figure_caption && (
                <p className="mt-2 text-sm leading-relaxed break-words">{slide.figure_caption}</p>
              )}
              {slide.additional_citation && (
                <p className="mt-2 text-sm leading-relaxed break-words">{slide.additional_citation}</p>
              )}
              {slide.citation && (
                <p className="mt-2 text-sm leading-relaxed break-words">{slide.citation}</p>
              )}
            </article>
          );
        })}
      </div>

      <ClinicalSlide
        src={esusChecklistSlide}
        caption="ESUS diagnostic checklist"
        alt={ESUS_CHECKLIST_ALT}
      />

      <div className="space-y-5">
        {ESUS_SECTIONS.map((section) => (
          <section key={section.id} className="space-y-2" aria-labelledby={`esus-${section.id}`}>
            <div className="flex items-start gap-2">
              <h3 id={`esus-${section.id}`} className="min-w-0 flex-1 text-sm font-semibold leading-snug break-words">
                {section.title}
              </h3>
              <InfoNote label={section.title} notes={sectionInfoNotes(section)} />
            </div>
            <div className="space-y-2">
              {section.items.map((item) => {
                const selected = responseFor(answers, item.id);
                return (
                  <div key={item.id} className={panelClass}>
                    <div className="flex items-start gap-2">
                      <p className="min-w-0 flex-1 text-sm leading-relaxed break-words">{item.prompt}</p>
                      <InfoNote label={item.prompt} notes={itemInfoNotes(item)} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={item.prompt}>
                      {ESUS_RESPONSE_OPTIONS.map((option) => {
                        const active = selected === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setResponse(item.id, option.value)}
                            className={cn(
                              "min-h-11 rounded-lg border px-3 text-sm",
                              active
                                ? "border-slate-900 bg-slate-900 text-white dark:border-foreground dark:bg-foreground dark:text-background"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-border dark:bg-background/40 dark:text-foreground dark:hover:bg-muted",
                            )}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed break-words">{ESUS_OUTCOME_LABEL[outcome]}</p>
        <InfoNote label="Classification" notes={classificationInfoNotes(outcome)} />
        <Button type="button" variant="outline" className="min-h-11" onClick={() => { void copyChecklist(); }}>
          <Copy className="h-4 w-4" />
          {copiedText ? "Copied" : "Copy"}
        </Button>
      </div>
      {copiedText && (
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{copiedText}</pre>
      )}
    </div>
  );
}
