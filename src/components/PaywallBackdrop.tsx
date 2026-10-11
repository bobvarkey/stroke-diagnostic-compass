const CATEGORIES = [
  "Acute Triage", "ICH & Hemorrhage", "Thrombolysis", "Imaging Assist",
  "Risk Scores", "Documentation", "Team Handoff", "Case Review",
];

/**
 * Decorative stand-in for the app, blurred behind the paywall.
 *
 * This is deliberately NOT the real app. `<Index />` is never mounted for a visitor without
 * access, so no gated clinical content reaches the browser in the first place — the blur is
 * presentation, not protection, and nothing here should ever be swapped for the live screens.
 */
export default function PaywallBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 overflow-hidden blur-sm opacity-60">
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="h-9 w-52 rounded-lg bg-muted" />
        <div className="h-3 w-72 rounded bg-muted" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {CATEGORIES.map((c) => (
            <div key={c} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="h-2.5 w-14 rounded bg-primary/40" />
              <p className="text-sm font-semibold text-foreground">{c}</p>
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="h-3 w-40 rounded bg-muted" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/25" />
              <div className="h-2.5 flex-1 rounded bg-muted" />
              <div className="h-2.5 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
