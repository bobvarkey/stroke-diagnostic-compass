import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, X } from "lucide-react";
import { GLOSSARY, GlossaryEntry } from "@/data/glossary";

/**
 * Global acronym / short-form explainer.
 *
 * Non-invasive: it never rewrites the DOM (which would fight React).
 * Instead it reads the word under the pointer via the caret APIs and shows a
 * popup explanation for any term found in the glossary.
 *  - hover  → transient tooltip
 *  - click  → pinned card (stays until dismissed)
 */

const WORD_CHARS = /[A-Za-z0-9()₂²\-–']/;

/** Case-insensitive lookup map built once. */
const LOOKUP: Record<string, GlossaryEntry> = Object.values(GLOSSARY).reduce(
  (acc, entry) => {
    acc[entry.term.toLowerCase()] = entry;
    return acc;
  },
  {} as Record<string, GlossaryEntry>
);
Object.keys(GLOSSARY).forEach((k) => {
  LOOKUP[k.toLowerCase()] ||= GLOSSARY[k];
});

function caretNode(x: number, y: number): { node: Text; offset: number } | null {
  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  };
  if (doc.caretRangeFromPoint) {
    const r = doc.caretRangeFromPoint(x, y);
    if (r && r.startContainer.nodeType === Node.TEXT_NODE) {
      return { node: r.startContainer as Text, offset: r.startOffset };
    }
    return null;
  }
  const p = doc.caretPositionFromPoint?.(x, y);
  if (p && p.offsetNode.nodeType === Node.TEXT_NODE) {
    return { node: p.offsetNode as Text, offset: p.offset };
  }
  return null;
}

function findTerm(x: number, y: number): { entry: GlossaryEntry; rect: DOMRect } | null {
  const target = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!target) return null;
  if (target.closest("input, textarea, [data-no-glossary], .glossary-popup")) return null;

  const hit = caretNode(x, y);
  if (!hit) return null;

  const text = hit.node.data;
  let start = Math.min(hit.offset, Math.max(text.length - 1, 0));
  if (!WORD_CHARS.test(text[start] ?? "")) start = Math.max(0, start - 1);
  if (!WORD_CHARS.test(text[start] ?? "")) return null;

  let s = start;
  while (s > 0 && WORD_CHARS.test(text[s - 1])) s--;
  let e = start;
  while (e < text.length - 1 && WORD_CHARS.test(text[e + 1])) e++;

  const raw = text.slice(s, e + 1).replace(/^[-–']+|[-–'.,;:]+$/g, "");
  if (!raw || raw.length < 2) return null;

  const entry = LOOKUP[raw.toLowerCase()];
  if (!entry) return null;

  // Bounding rect for the matched word only
  const range = document.createRange();
  range.setStart(hit.node, s);
  range.setEnd(hit.node, Math.min(e + 1, text.length));
  const rect = range.getBoundingClientRect();
  range.detach?.();
  if (!rect || rect.width === 0) return null;
  return { entry, rect };
}

interface PopupState {
  entry: GlossaryEntry;
  rect: DOMRect;
  pinned: boolean;
}

export default function AcronymAutoTooltip() {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const raf = useRef<number | null>(null);
  const last = useRef(0);

  const close = useCallback(() => setPopup(null), []);

  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - last.current < 90) return;
      last.current = now;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPopup((prev) => {
          if (prev?.pinned) return prev;
          const found = findTerm(ev.clientX, ev.clientY);
          if (!found) return null;
          if (prev && prev.entry.term === found.entry.term) return prev;
          return { ...found, pinned: false };
        });
      });
    };

    const onClick = (ev: MouseEvent) => {
      const t = ev.target as HTMLElement | null;
      if (t?.closest(".glossary-popup")) return;
      const found = findTerm(ev.clientX, ev.clientY);
      if (found) {
        setPopup({ ...found, pinned: true });
      } else {
        setPopup((prev) => (prev?.pinned ? null : prev));
      }
    };

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [close]);

  if (!popup) return null;

  const width = 320;
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, popup.rect.left));
  const above = popup.rect.top > 220;
  const style: React.CSSProperties = {
    position: "fixed",
    left,
    width,
    zIndex: 90,
    ...(above ? { bottom: window.innerHeight - popup.rect.top + 8 } : { top: popup.rect.bottom + 8 }),
  };

  return createPortal(
    <div
      style={style}
      role="tooltip"
      className="glossary-popup animate-in fade-in-0 zoom-in-95 rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-xl text-popover-foreground"
      onMouseLeave={() => !popup.pinned && close()}
    >
      <div className="flex items-start gap-2">
        <BookOpen className="h-4 w-4 mt-0.5 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">{popup.entry.term}</p>
          <p className="text-xs font-medium text-primary">{popup.entry.short}</p>
          <p className="text-xs mt-1 leading-snug text-muted-foreground">{popup.entry.full}</p>
          {popup.entry.category && (
            <span className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {popup.entry.category}
            </span>
          )}
        </div>
        {popup.pinned && (
          <button
            aria-label="Close explanation"
            onClick={close}
            className="rounded p-1 hover:bg-muted text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
