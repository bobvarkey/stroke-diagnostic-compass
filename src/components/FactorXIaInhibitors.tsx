import { useEffect, useRef, useState } from "react";
import { Info, Pill } from "lucide-react";
import ClinicalSlide from "./ClinicalSlide";
import CollapsibleModule from "./CollapsibleModule";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import slide from "@/assets/asundexian-milvexian.webp";
import {
  FACTOR_XIA_CAPTION,
  FACTOR_XIA_CITATIONS,
  FACTOR_XIA_COLUMNS,
  FACTOR_XIA_FOOTNOTE,
  FACTOR_XIA_ROWS,
  FACTOR_XIA_SUBTITLE,
  FACTOR_XIA_TITLE,
} from "@/lib/factorXIaInhibitors";

function fineHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

function FootnoteButton() {
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
          aria-label="Footnote and citations"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <p className="whitespace-pre-wrap">{FACTOR_XIA_FOOTNOTE}</p>
          <p className="whitespace-pre-wrap">{FACTOR_XIA_CITATIONS}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function FactorXIaInhibitors() {
  return (
    <CollapsibleModule
      title={FACTOR_XIA_TITLE}
      icon={<Pill className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
      className="min-w-0"
    >
      <div className="min-w-0 space-y-4 text-foreground">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-sm leading-relaxed">{FACTOR_XIA_SUBTITLE}</p>
          <FootnoteButton />
        </div>
        <ClinicalSlide src={slide} caption={FACTOR_XIA_CAPTION} alt={FACTOR_XIA_CAPTION} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[20rem] table-fixed border-collapse text-left text-[13px] leading-snug sm:text-sm">
            <caption className="sr-only">{FACTOR_XIA_TITLE}</caption>
            <thead>
              <tr className="border-b border-border">
                {FACTOR_XIA_COLUMNS.map((column) => (
                  <th key={column} scope="col" className="px-2 py-2 align-bottom font-medium text-foreground">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACTOR_XIA_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <th scope="row" className="px-2 py-2 align-top font-medium text-foreground">
                    {row.label}
                  </th>
                  <td className="px-2 py-2 align-top break-words">
                    <Lines lines={row.asundexian} />
                  </td>
                  <td className="px-2 py-2 align-top break-words">
                    <Lines lines={row.milvexian} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleModule>
  );
}
