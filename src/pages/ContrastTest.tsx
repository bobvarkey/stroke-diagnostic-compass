import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

/* ───────────────────────── Contrast math ───────────────────────── */
function parseColor(c: string): [number, number, number] | null {
  if (!c) return null;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#000";
  ctx.fillStyle = c;
  const v = ctx.fillStyle as string;
  const m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = v.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const [r, g, b] = rgb[1].split(",").map((s) => parseFloat(s));
    return [r, g, b];
  }
  return null;
}
function luminance([r, g, b]: [number, number, number]) {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(fg: string, bgEffective: string) {
  const f = parseColor(fg);
  const b = parseColor(bgEffective);
  if (!f || !b) return 0;
  const L1 = luminance(f);
  const L2 = luminance(b);
  const [a, c] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (c + 0.05);
}
function effectiveBg(el: Element): string {
  let cur: Element | null = el;
  while (cur) {
    const cs = getComputedStyle(cur);
    const bg = cs.backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      const a = bg.match(/rgba?\(([^)]+)\)/);
      if (a) {
        const parts = a[1].split(",").map((s) => parseFloat(s));
        const alpha = parts.length === 4 ? parts[3] : 1;
        if (alpha > 0.3) return bg;
      } else return bg;
    }
    cur = cur.parentElement;
  }
  return getComputedStyle(document.body).backgroundColor || "rgb(0,0,0)";
}

type Finding = {
  text: string;
  fg: string;
  bg: string;
  ratio: number;
  selector: string;
};

/* ───────────────────────── Page ───────────────────────── */
export default function ContrastTest() {
  const scope = useRef<HTMLDivElement>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [scanned, setScanned] = useState(0);

  const runScan = () => {
    if (!scope.current) return;
    const els = scope.current.querySelectorAll<HTMLElement>(
      "h1,h2,h3,h4,p,span,a,button,label,li,td,th,small,strong,em,div"
    );
    const out: Finding[] = [];
    els.forEach((el) => {
      const txt = (el.textContent || "").trim();
      if (!txt || txt.length > 200) return;
      const onlyChild = el.children.length === 0;
      if (!onlyChild) return;
      const cs = getComputedStyle(el);
      const fg = cs.color;
      const bg = effectiveBg(el);
      const ratio = contrastRatio(fg, bg);
      if (ratio < 4.5) {
        out.push({
          text: txt.slice(0, 80),
          fg,
          bg,
          ratio: Math.round(ratio * 100) / 100,
          selector: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ").slice(0, 2).join(".") : ""),
        });
      }
    });
    setScanned(els.length);
    setFindings(out);
  };

  useEffect(() => {
    const t = setTimeout(runScan, 200);
    return () => clearTimeout(t);
  }, []);

  const groups = useMemo(
    () => [
      { name: "Theme surfaces (dark)", items: ["bg-background", "bg-card", "bg-popover", "bg-muted", "bg-primary", "bg-secondary", "bg-accent", "bg-destructive", "bg-sidebar"] },
      { name: "Dark grays", items: ["bg-black", "bg-slate-900", "bg-slate-800", "bg-gray-900", "bg-zinc-900", "bg-neutral-900", "bg-stone-900"] },
      { name: "Saturated 500–700", items: ["bg-red-600", "bg-orange-600", "bg-amber-700", "bg-green-700", "bg-emerald-600", "bg-teal-600", "bg-sky-600", "bg-blue-600", "bg-indigo-600", "bg-violet-600", "bg-purple-600", "bg-pink-600", "bg-rose-600"] },
      { name: "Light tints", items: ["bg-white", "bg-slate-50", "bg-gray-100", "bg-blue-50", "bg-amber-100", "bg-green-100", "bg-rose-100"] },
    ],
    []
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contrast & Visibility Test</h1>
          <p className="text-sm text-muted-foreground">
            Renders typography on every common surface and runs a WCAG AA (4.5:1) contrast scan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground">
            ← Back
          </Link>
          <button
            onClick={runScan}
            className="px-3 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Re-scan
          </button>
        </div>
      </header>

      {/* Scan results */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">
            Scan results — {findings.length} issues / {scanned} elements
          </h2>
          <span
            className={
              "px-2 py-1 rounded text-xs font-medium " +
              (findings.length === 0 ? "bg-green-600" : "bg-amber-600")
            }
          >
            {findings.length === 0 ? "PASS (AA)" : "Review"}
          </span>
        </div>
        {findings.length === 0 ? (
          <p className="text-sm text-muted-foreground">All sampled text meets WCAG AA (≥ 4.5:1).</p>
        ) : (
          <ul className="space-y-1 max-h-64 overflow-auto text-sm">
            {findings.slice(0, 60).map((f, i) => (
              <li key={i} className="flex items-center gap-3 border-b border-border/50 py-1">
                <span className="font-mono text-xs w-12">{f.ratio}:1</span>
                <span
                  className="inline-block w-4 h-4 rounded border border-border"
                  style={{ background: f.bg }}
                  title={`bg: ${f.bg}`}
                />
                <span
                  className="inline-block w-4 h-4 rounded border border-border"
                  style={{ background: f.fg }}
                  title={`fg: ${f.fg}`}
                />
                <span className="truncate flex-1">{f.text}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[40%]">{f.selector}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sample swatches scoped for scanning */}
      <div ref={scope} className="space-y-6">
        {groups.map((g) => (
          <section key={g.name}>
            <h2 className="text-lg font-semibold mb-3">{g.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.items.map((cls) => (
                <div key={cls} className={`${cls} rounded-lg p-4 border border-border space-y-2`}>
                  <div className="text-xs font-mono opacity-80">{cls}</div>
                  <h3 className="text-base font-semibold">Heading — quick brown fox</h3>
                  <p className="text-sm">
                    Body text on this surface. <a href="#" className="underline">A link</a>.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button className="px-2 py-1 text-xs rounded bg-primary hover:bg-primary/90 text-primary-foreground">
                      Button
                    </button>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                      Badge
                    </span>
                    <a href="#" className="text-xs underline">link</a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
