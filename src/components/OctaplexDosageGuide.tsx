import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ClinicalSlide from "./ClinicalSlide";
import octaplexDosageGuide from "@/assets/octaplex-dosage-guide.webp";

const CAPTION = "Octaplex dosage guide";

const DOSE_ROWS = [
  { inr: "2.0–2.5", dose: "0.9–1.3 mL/kg" },
  { inr: "2.5–3.0", dose: "1.3–1.6 mL/kg" },
  { inr: "3.0–3.5", dose: "1.6–1.9 mL/kg" },
  { inr: ">3.5", dose: ">1.9 mL/kg" },
] as const;

const NOTES = [
  "1 vial after reconstitution is 20 mL and contains 500 IU.",
  "Single dose should not exceed 3,000 IU (= 120 mL Octaplex).",
  "Example: 70 kg, INR 2.5, 1.3 mL × 70 = 91 mL (2275 IU = 4.55 vials).",
] as const;

function fineHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function DosingNotes() {
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
          aria-label="Octaplex dosing notes"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200/80 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
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
        className="w-[min(22rem,calc(100vw-1.5rem))] border-border bg-popover p-3 text-left text-[13px] font-normal leading-relaxed text-popover-foreground shadow-lg"
      >
        <div className="space-y-2 break-words">
          {NOTES.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function OctaplexDosageGuide() {
  return (
    <div id="octaplex-dosage-guide" className="min-w-0 space-y-3 text-slate-900 dark:text-slate-100">
      <ClinicalSlide src={octaplexDosageGuide} caption={CAPTION} alt={CAPTION} />
      <div className="min-w-0">
        <div className="flex items-start gap-1">
          <h5 className="min-w-0 flex-1 pt-2 text-sm font-semibold leading-snug">
            Octaplex dosing for normalisation of INR (≤ 1.2 within 1 hour)
          </h5>
          <DosingNotes />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px] leading-snug sm:text-sm">
            <caption className="sr-only">
              Octaplex dosing for normalisation of INR (≤ 1.2 within 1 hour)
            </caption>
            <thead>
              <tr className="border-b border-slate-300 dark:border-white/15">
                <th scope="col" className="px-2 py-2 font-medium">
                  Initial INR
                </th>
                <th scope="col" className="px-2 py-2 font-medium">
                  Approximate dose
                </th>
              </tr>
            </thead>
            <tbody>
              {DOSE_ROWS.map((row) => (
                <tr key={row.inr} className="border-b border-slate-300 last:border-0 dark:border-white/15">
                  <th scope="row" className="px-2 py-2 font-medium">
                    {row.inr}
                  </th>
                  <td className="px-2 py-2">{row.dose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
