import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Native slides for PFO closure safety/timing and post-closure management.
 * Visible copy is the deck text. Speaker notes stay in hover popups.
 */

const CLOSURE_FOOTER =
  "Kent et al. JAMA. 2021 (Table 4).  ·  SCOPE Study. PCORI. 2023.  ·  Caso et al. Eur Stroke J. 2024.";

const AFTER_FOOTER =
  "ESO PFO guideline (2024), SCAI PFO guideline (2022), ESC endocarditis guideline (2023), European PFO position paper (2019)";

const AF_NOTES = [
  "AF rates are the observed proportions in the as-treated safety analysis in Table 4. Day 45 is measured from randomization. AF beyond day 45 can include AF first detected later or persisting beyond that point.",
  "Kent DM et al. JAMA. 2021;326:2277–2286. https://jamanetwork.com/journals/jama/fullarticle/2787115",
] as const;

const COMPLICATION_NOTES = [
  "The SCOPE report gives the exact rates for access-site or retroperitoneal hemorrhage, cardiac tamponade and cardiac perforation. https://www.ncbi.nlm.nih.gov/books/NBK592989/",
] as const;

const TIMING_NOTES = [
  "The ESO guideline describes the 6-month eligibility window for several trials and the limited evidence on very early closure. https://doi.org/10.1177/23969873241247978",
] as const;

const ANTIPLATELET_NOTES = [
  "The European Stroke Organisation expert consensus suggests 1–6 months of dual therapy followed by a single antiplatelet agent long term, for at least 5 years after closure. Comparative evidence for the optimal duration is limited. Caso et al. Eur Stroke J. 2024. https://doi.org/10.1177/23969873241247978",
  "SCAI found a knowledge gap about dual antiplatelet therapy beyond one month. Individualize the regimen with the implanting team based on device protocol, bleeding risk and any indication for anticoagulation. https://pmc.ncbi.nlm.nih.gov/articles/PMC11307505/",
] as const;

const ECHO_NOTES = [
  "For surveillance of closure and residual shunt, see Pristipino et al. European position paper, Table 7. The timing and modality of follow-up imaging can vary by centre. https://eurointervention.pcronline.com/article/european-position-paper-on-the-management-of-patients-with-patent-foramen-ovale-general-approach-and-left-circulation-thromboembolism",
] as const;

const AFTER_AF_NOTES = [
  "Many AF events in the pooled trials occurred within 45 days. ESO found limited evidence to guide routine prolonged rhythm monitoring after closure. Kent et al. JAMA. 2021. https://jamanetwork.com/journals/jama/fullarticle/2787115",
] as const;

const ENDOCARDITIS_NOTES = [
  "The ESC identifies septal defect closure devices as high risk during the first six months after implantation. At-risk dental procedures include extractions, oral surgery and procedures that manipulate the gingival or periapical region. Reassess prophylaxis with cardiology if a residual shunt persists. https://doi.org/10.1093/eurheartj/ehad193",
] as const;

const COMPLICATIONS = [
  ["Access-site or retroperitoneal bleeding", "1.01%"],
  ["Pericardial tamponade", "0.17%"],
  ["Cardiac perforation", "0.06%"],
] as const;

/** Bar heights use the chart scale (0–6%). Labels are the slide’s formatted values. */
const AF_GROUPS = [
  {
    label: "Overall AF",
    bars: [
      { name: "PFO closure", value: "5.0%", ratio: 5 / 6 },
      { name: "Medical therapy", value: "1.1%", ratio: 1.1 / 6 },
    ],
  },
  {
    label: "AF beyond day 45",
    bars: [
      { name: "PFO closure", value: "2.4%", ratio: 2.4 / 6 },
      { name: "Medical therapy", value: "0.8%", ratio: 0.8 / 6 },
    ],
  },
] as const;

const Y_TICKS = [6, 4, 2, 0] as const;

function fineHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function NoteText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("http") ? (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-medium text-sky-700 underline decoration-sky-700/40 underline-offset-2 hover:decoration-sky-700 dark:text-sky-300 dark:decoration-sky-300/40"
          >
            {part}
          </a>
        ) : (
          <span key={`${index}-${part.slice(0, 12)}`}>{part}</span>
        ),
      )}
    </>
  );
}

function NoteButton({ label, notes }: { label: string; notes: readonly string[] }) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

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

  const place = () => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(352, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
    const top = Math.min(rect.bottom + 8, window.innerHeight - 16);
    setBox({ top, left, width });
  };

  useEffect(() => {
    if (!open) return;
    place();
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={() => {
          if (fineHover()) scheduleClose();
        }}
        onPointerEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onPointerLeave={() => {
          if (fineHover()) scheduleClose();
        }}
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && box
        ? createPortal(
            <div
              id={panelId}
              role="tooltip"
              style={{ top: box.top, left: box.left, width: box.width }}
              onMouseEnter={cancelClose}
              onMouseLeave={() => {
                if (fineHover()) scheduleClose();
              }}
              className="fixed z-50 max-h-[min(70vh,24rem)] overflow-y-auto rounded-md border border-slate-200 bg-white p-3 text-left text-[13px] font-normal leading-relaxed text-slate-800 shadow-lg dark:border-border dark:bg-popover dark:text-popover-foreground"
            >
              <div className="space-y-2 break-words">
                {notes.map((note) => (
                  <p key={note}>
                    <NoteText text={note} />
                  </p>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Heading({
  title,
  subtitle,
  notes,
  tone = "default",
}: {
  title: string;
  subtitle?: string;
  notes?: readonly string[];
  tone?: "default" | "teal";
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "text-base font-semibold leading-snug",
            tone === "teal" ? "text-[#006E71] dark:text-teal-300" : "text-slate-900 dark:text-foreground",
          )}
        >
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {notes ? <NoteButton label={title} notes={notes} /> : null}
    </div>
  );
}

function AfChart() {
  return (
    <figure className="min-w-0">
      <div className="flex gap-1.5">
        <div className="relative h-40 w-8 shrink-0 text-[10px] leading-none text-slate-500 dark:text-muted-foreground">
          {Y_TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute right-1 tabular-nums"
              style={{ bottom: `${(tick / 6) * 100}%`, transform: "translateY(50%)" }}
            >
              {tick}%
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-40 border-b border-l border-slate-300 dark:border-border">
            {[2, 4, 6].map((tick) => (
              <div
                key={tick}
                className="pointer-events-none absolute inset-x-0 border-t border-slate-200 dark:border-border/60"
                style={{ bottom: `${(tick / 6) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end justify-around px-1">
              {AF_GROUPS.map((group) => (
                <div key={group.label} className="flex h-full items-end gap-1.5 sm:gap-2">
                  {group.bars.map((bar) => (
                    <div key={bar.name} className="relative h-full w-7 sm:w-9">
                      <span className="sr-only">
                        {group.label}, {bar.name} {bar.value}
                      </span>
                      <span
                        className="absolute left-1/2 whitespace-nowrap pb-0.5 text-center text-[11px] font-semibold leading-none tabular-nums text-slate-900 dark:text-foreground"
                        style={{ bottom: `${bar.ratio * 100}%`, transform: "translate(-50%, -100%)" }}
                        aria-hidden="true"
                      >
                        {bar.value}
                      </span>
                      <div
                        className={cn(
                          "absolute inset-x-0 bottom-0",
                          bar.name === "PFO closure" ? "bg-[#006E71]" : "bg-[#A6B7C7]",
                        )}
                        style={{ height: `${bar.ratio * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs leading-snug text-slate-800 dark:text-foreground">
            {AF_GROUPS.map((group) => (
              <div key={group.label}>{group.label}</div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 bg-[#006E71]" aria-hidden="true" />
          PFO closure
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 bg-[#A6B7C7]" aria-hidden="true" />
          Medical therapy
        </span>
      </figcaption>
    </figure>
  );
}

const slideClass =
  "scroll-mt-40 min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-border dark:bg-card dark:text-foreground sm:p-6";

export default function PfoClosureSlides() {
  return (
    <div className="min-w-0 space-y-4">
      <section id="pfo-closure-safety" className={slideClass} aria-labelledby="pfo-closure-safety-title">
        <div className="mb-4 h-1 w-10 rounded-full bg-[#006E71]" aria-hidden="true" />
        <h2 id="pfo-closure-safety-title" className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          PFO closure after ischemic stroke
        </h2>
        <p className="mt-1 text-base text-slate-500 dark:text-muted-foreground">Safety and timing</p>

        <div className="mt-5 grid grid-cols-1 gap-6 border-t border-slate-200 pt-5 dark:border-border lg:grid-cols-2">
          <div className="min-w-0 space-y-3">
            <Heading
              title="Atrial fibrillation"
              subtitle="Pooled analysis of six randomized trials"
              notes={AF_NOTES}
            />
            <AfChart />
          </div>

          <div className="min-w-0 space-y-3">
            <Heading
              title="Procedure-related complications"
              subtitle="Reported with device closure"
              notes={COMPLICATION_NOTES}
            />
            <ul className="divide-y divide-slate-200 dark:divide-border">
              {COMPLICATIONS.map(([name, rate]) => (
                <li key={name} className="flex items-baseline justify-between gap-3 py-3">
                  <span className="min-w-0 text-sm leading-snug">{name}</span>
                  <span className="shrink-0 text-lg font-semibold tabular-nums text-[#006E71] dark:text-teal-300">
                    {rate}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 border-l-4 border-[#006E71] bg-[#e7f3f2] px-3 py-3 dark:bg-teal-950/40 sm:px-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[#006E71] dark:text-teal-300">Timing after stroke</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-foreground">
              Optimal timing remains uncertain. Consider closure after completing the stroke workup and confirming neurologic stability. Several trials enrolled within 6 months of stroke.
            </p>
          </div>
          <NoteButton label="Timing after stroke" notes={TIMING_NOTES} />
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-slate-500 dark:text-muted-foreground sm:text-xs">
          {CLOSURE_FOOTER}
        </p>
      </section>

      <section id="pfo-after-closure" className={slideClass} aria-labelledby="pfo-after-closure-title">
        <div className="mb-4 h-1 w-10 rounded-full bg-[#006E71]" aria-hidden="true" />
        <h2 id="pfo-after-closure-title" className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          Medical management after PFO closure
        </h2>

        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-border">
          <Heading title="Antiplatelet therapy" notes={ANTIPLATELET_NOTES} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="flex min-w-0 flex-1 flex-col justify-center bg-[#006E71] px-4 py-3 text-white">
              <p className="text-lg font-semibold leading-snug">1–6 months</p>
              <p className="mt-1 text-sm leading-snug text-white/90">Dual therapy · aspirin + clopidogrel</p>
            </div>
            <div className="flex items-center justify-center text-[#006E71] dark:text-teal-300" aria-hidden="true">
              <ChevronRight className="h-6 w-6 rotate-90 sm:rotate-0" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center bg-[#e7f3f2] px-4 py-3 dark:bg-teal-950/40">
              <p className="text-lg font-semibold leading-snug text-[#006E71] dark:text-teal-200">
                At least 5 years after closure
              </p>
              <p className="mt-1 text-sm leading-snug text-slate-700 dark:text-slate-200">Single agent · e.g., aspirin</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-muted-foreground">
            ESO expert consensus based on trial regimens. Optimal duration remains uncertain.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 border-t border-slate-200 pt-5 dark:border-border sm:grid-cols-2 sm:gap-x-8">
          <div className="min-w-0 space-y-1">
            <Heading
              title="Echocardiographic follow-up"
              tone="teal"
              notes={ECHO_NOTES}
            />
            <p className="text-sm leading-relaxed">
              Check device position with TTE. Use a bubble study when assessing for a residual shunt.
            </p>
          </div>
          <div className="min-w-0 space-y-1">
            <Heading title="Atrial fibrillation" tone="teal" notes={AFTER_AF_NOTES} />
            <p className="text-sm leading-relaxed">
              Watch for AF, especially in the first weeks. Tailor rhythm monitoring to symptoms and risk.
            </p>
          </div>
          <div className="min-w-0 space-y-1">
            <Heading title="Endocarditis prophylaxis" tone="teal" notes={ENDOCARDITIS_NOTES} />
            <p className="text-sm leading-relaxed">
              Give antibiotic prophylaxis for at-risk dental procedures in the first 6 months after implantation.
            </p>
          </div>
          <div className="min-w-0 space-y-1">
            <Heading title="Long-term stroke prevention" tone="teal" />
            <p className="text-sm leading-relaxed">
              Manage vascular risk factors. Anticoagulate for a separate indication, such as AF.
            </p>
          </div>
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-slate-500 dark:text-muted-foreground sm:text-xs">
          {AFTER_FOOTER}
        </p>
      </section>
    </div>
  );
}
