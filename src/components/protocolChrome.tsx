import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function fineHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function ProtocolInfoNote({ label, notes }: { label: string; notes: readonly string[] }) {
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

export function StatusMark({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium leading-4 text-slate-600 dark:border-border dark:text-muted-foreground">
      {children}
    </span>
  );
}

export function ProtocolCard({
  id,
  title,
  status,
  notes,
  notesLabel,
  children,
}: {
  id: string;
  title: string;
  status: string;
  notes: readonly string[];
  notesLabel: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-36 min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm dark:border-border dark:bg-background/40 dark:text-foreground sm:p-4"
    >
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-snug tracking-tight break-words">{title}</h2>
          <div className="mt-2">
            <StatusMark>{status}</StatusMark>
          </div>
        </div>
        <ProtocolInfoNote label={notesLabel} notes={notes} />
      </header>
      <div className="mt-3 divide-y divide-slate-200 dark:divide-border">{children}</div>
    </section>
  );
}

export function ProtocolStep({
  title,
  notes,
  notesLabel,
  children,
}: {
  title: string;
  notes?: readonly string[];
  notesLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="py-1">
      <div className="flex items-start gap-1">
        <CollapsibleTrigger className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-2 py-2 text-left text-sm font-medium">
          <span className="break-words">{title}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform dark:text-muted-foreground", open && "rotate-180")} />
        </CollapsibleTrigger>
        {notes && notes.length > 0 && (
          <ProtocolInfoNote label={notesLabel ?? title} notes={notes} />
        )}
      </div>
      <CollapsibleContent className="space-y-3 pb-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed break-words">
      <span className="text-slate-500 dark:text-muted-foreground">{label}: </span>
      <span>{value}</span>
    </p>
  );
}

export function Lines({ items }: { items: readonly string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <p key={item} className="text-sm leading-relaxed break-words">{item}</p>
      ))}
    </div>
  );
}

export type CheckItem = { id: string; label: string };

export function CheckList({
  items,
  checked,
  onToggle,
}: {
  items: readonly CheckItem[];
  checked: Readonly<Record<string, boolean>>;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
            <Checkbox
              checked={checked[item.id] === true}
              onCheckedChange={(value) => onToggle(item.id, value === true)}
              aria-label={item.label}
              className="mt-0.5"
            />
            <span className="text-sm leading-snug break-words">{item.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export function NoteRow({ text, notes, label }: { text: string; notes: readonly string[]; label: string }) {
  return (
    <div className="flex items-start gap-1">
      <p className="min-w-0 flex-1 text-sm leading-relaxed break-words">{text}</p>
      <ProtocolInfoNote label={label} notes={notes} />
    </div>
  );
}

export function NumericField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-sm leading-snug break-words">
        {label} <span className="text-slate-500 dark:text-muted-foreground">{unit}</span>
      </span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        className="mt-1 min-h-11 bg-white text-slate-900 dark:bg-background dark:text-foreground"
      />
    </label>
  );
}

export function ResultBlock({ lines }: { lines: readonly string[] }) {
  return (
    <div aria-live="polite" className="min-h-6">
      {lines.map((line) => (
        <p key={line} className="text-sm font-medium leading-relaxed break-words">{line}</p>
      ))}
    </div>
  );
}

export async function copyPlainText(text: string): Promise<void> {
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

export function CopyResult({ copied, onCopy, text }: { copied: boolean; onCopy: () => void; text: string }) {
  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4" />
        {copied ? "Copied" : "Copy"}
      </Button>
      {copied && (
        <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{text}</pre>
      )}
    </div>
  );
}

export function ReferenceList({ references }: { references: readonly { id: string; title: string; url: string }[] }) {
  return (
    <div className="space-y-3 py-3">
      <h3 className="text-sm font-medium">References</h3>
      <ul className="space-y-3">
        {references.map((reference) => (
          <li key={reference.id} className="min-w-0">
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline underline-offset-2 break-words text-slate-900 dark:text-foreground"
            >
              {reference.title}
            </a>
            <p className="mt-0.5 break-all text-xs text-slate-500 dark:text-muted-foreground">{reference.url}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
