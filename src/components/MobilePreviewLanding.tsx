import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface LandingPreviewProps {
  onOpenAppShell: () => void;
  onShowAuth: () => void;
}

interface CaseFields {
  age?: string;
  gender?: string;
  complaint?: string;
  lkw?: string;
  nihss?: string;
}

const featurePills = [
  { icon: "⚡", label: "Instant Scoring", accent: "from-amber-400 via-amber-300 to-yellow-200" },
  { icon: "🛡️", label: "HIPAA Compliant", accent: "from-cyan-400 via-cyan-300 to-sky-300" },
  { icon: "📖", label: "65 Validated Scales", accent: "from-fuchsia-500 via-fuchsia-400 to-pink-300" },
  { icon: "🌍", label: "Multilingual", accent: "from-emerald-400 via-lime-300 to-emerald-200" },
];

const categoryCards = [
  "Acute Triage",
  "ICH & Hemorrhage",
  "Thrombolysis",
  "Imaging Assist",
  "Risk Scores",
  "Documentation",
  "Team Handoff",
  "Case Review",
];

const assessmentTiles = [
  { label: "NIHSS", subtitle: "Stroke severity", locked: false },
  { label: "GCS", subtitle: "Neurologic status", locked: false },
  { label: "ICH Risk", subtitle: "Hemorrhage guidance", locked: true },
  { label: "LVO Alert", subtitle: "Thrombectomy prep", locked: true },
  { label: "mRS", subtitle: "Disability forecast", locked: false },
  { label: "CT Score", subtitle: "Imaging grading", locked: true },
  { label: "Med Review", subtitle: "Anticoagulation care", locked: true },
  { label: "Summary", subtitle: "Clinical handoff", locked: false },
];

const neonColors = [
  "from-fuchsia-500 to-fuchsia-400",
  "from-cyan-400 to-sky-400",
  "from-pink-500 to-pink-400",
  "from-lime-400 to-emerald-400",
  "from-orange-400 to-amber-400",
  "from-violet-500 to-violet-400",
  "from-red-500 to-rose-400",
  "from-yellow-400 to-amber-300",
];

const parseCaseText = (text: string): CaseFields => {
  const lower = text.toLowerCase();
  const ageMatch = text.match(/(\d{2})\s*(?:yo|years|year)/i);
  const genderMatch = lower.match(/\b(male|female|man|woman|boy|girl)\b/);
  const lkwMatch = text.match(/(?:last known well|lkw|onset)[:\-]?\s*([^\.\n]+)/i);
  const nihssMatch = text.match(/nihss[:\-]?\s*(\d{1,2})/i);
  const complaint = text.split(/[\.\n]/)[0]?.trim() || "";

  return {
    age: ageMatch?.[1] ?? "",
    gender: genderMatch?.[1] ?? "",
    complaint: complaint ? complaint.slice(0, 80) : "",
    lkw: lkwMatch?.[1]?.trim() ?? "",
    nihss: nihssMatch?.[1] ?? "",
  };
};

export default function MobilePreviewLanding({ onOpenAppShell, onShowAuth }: LandingPreviewProps) {
  const { toast } = useToast();
  const pricingRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState("");
  const [rawText, setRawText] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [parsedFields, setParsedFields] = useState<CaseFields>({});
  const [lockedTile, setLockedTile] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTextChange = (value: string) => {
    setRawText(value);
    setParsedFields(parseCaseText(value));
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) return;
    setImageName(file.name);
    const sampleText = `${file.name} 72yo female with right-sided weakness, lkw 08:10, NIHSS 8.`;
    setParsedFields(parseCaseText(sampleText));
    toast({ title: "Image selected", description: "Fields were auto-extracted from the case sheet preview." });
  };

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      toast({ title: "Enter feedback first", variant: "destructive" });
      return;
    }
    toast({ title: "Feedback sent", description: "Your free-text note was delivered to the publisher anonymously." });
    setFeedback("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.35),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.2),_transparent_24%)]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle,_rgba(236,72,153,0.28),_transparent_45%)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle,_rgba(56,189,248,0.24),_transparent_40%)] blur-3xl" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pb-16 pt-8">
        <section className="min-h-[92vh] flex flex-col justify-between gap-8">
          <div className="pt-6">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 shadow-[0_0_120px_rgba(236,72,153,0.35)]">
                <span className="text-6xl leading-none">🧠</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500/30 via-cyan-400/20 to-transparent blur-3xl" />
              </div>

              <div className="space-y-4 px-2">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  Every <span className="text-white">Telegram message.</span> One Interface, <span className="text-white">On your wrist!</span>
                </h1>
                <p className="mx-auto max-w-md text-sm text-slate-300 sm:text-base">
                  A neon-first mobile preview for stroke decision support, with instant scoring, secure workflow, and a pro assessment shell.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 shadow-xl shadow-fuchsia-500/10">
                <span className="text-amber-300">⭐⭐⭐⭐⭐</span>
                <span className="font-semibold text-white">49 ratings</span>
              </div>

              <div className="w-full grid gap-3">
                <Button variant="outline" size="lg" className="w-full border-white/20 text-white/90" onClick={scrollToPricing}>
                  View Pro Plans
                </Button>
                <Button size="lg" className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-slate-950 shadow-2xl shadow-fuchsia-500/20" onClick={onOpenAppShell}>
                  Open App Shell
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">Secure. Fast. Mobile.</span>
              <button onClick={onShowAuth} className="text-slate-200 underline underline-offset-4 decoration-fuchsia-400/30 hover:text-white">
                Sign in for full access
              </button>
            </div>
            <div className="animate-bounce text-3xl">⬇️</div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {featurePills.map((pill) => (
            <div key={pill.label} className="glass-strong rounded-3xl border-white/10 p-4 text-center">
              <div className={`mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br ${pill.accent} text-slate-950 shadow-lg shadow-slate-950/10`}>
                <span className="text-xl">{pill.icon}</span>
              </div>
              <h3 className="text-sm font-semibold text-white">{pill.label}</h3>
            </div>
          ))}
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 text-center text-sm text-slate-300">
          <div className="glass rounded-3xl p-4 border-white/10 bg-white/5">
            <p className="text-3xl font-bold text-white">54+</p>
            <p className="mt-2">Clinical modules</p>
          </div>
          <div className="glass rounded-3xl p-4 border-white/10 bg-white/5">
            <p className="text-3xl font-bold text-white">9</p>
            <p className="mt-2">Language engines</p>
          </div>
          <div className="glass rounded-3xl p-4 border-white/10 bg-white/5">
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="mt-2">Validated references</p>
          </div>
          <div className="glass rounded-3xl p-4 border-white/10 bg-white/5">
            <p className="text-3xl font-bold text-white">Free</p>
            <p className="mt-2">Preview experience</p>
          </div>
        </section>

        <section ref={pricingRef} className="mt-10 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">Pro Pricing</p>
              <h2 className="text-2xl font-semibold text-white">Annual subscription preview</h2>
            </div>
            <Badge variant="secondary" className="rounded-full bg-fuchsia-500 text-white px-3 py-1 text-xs font-semibold">
              RECOMMENDED
            </Badge>
          </div>

          <div className="glass-strong rounded-[2rem] border-white/10 p-6 bg-slate-900/90 shadow-2xl shadow-fuchsia-500/20">
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pro</p>
                <p className="text-5xl font-black text-white">$19.99<span className="text-lg font-medium text-slate-400">/yr</span></p>
                <p className="text-sm text-slate-400 line-through">$29.99</p>
              </div>

              <div className="grid gap-3">
                {['Secure workflows', 'Fuchsia checkmark reporting', 'Unlimited pro tiles', 'Priority updates'].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-slate-100">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-300">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          {categoryCards.map((name) => (
            <div key={name} className="glass rounded-3xl border-white/10 p-4 text-sm text-slate-100">
              <div className="mb-3 inline-flex rounded-3xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                {name}
              </div>
              <p className="font-semibold text-white">{name} workflow</p>
            </div>
          ))}
        </section>

        <section className="mt-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">App shell demo</p>
              <h2 className="text-2xl font-semibold text-white">Assessment grid preview</h2>
            </div>
            <Badge variant="outline" className="rounded-full border-white/10 text-white/80 px-3 py-1 text-xs font-semibold">
              Mobile-first
            </Badge>
          </div>

          <div className="glass-strong rounded-[2rem] border-white/10 p-4 bg-slate-900/85">
            <div className="mb-4 flex items-center justify-between rounded-3xl bg-black/40 px-4 py-3 text-sm text-slate-300 shadow-inner">
              <div>
                <p className="font-semibold text-white">Upgrade to Pro</p>
                <p className="text-xs text-slate-500">All locked tiles open premium stroke support</p>
              </div>
              <Button size="sm" variant="ghost" className="text-white/90" onClick={scrollToPricing}>
                View plan
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {assessmentTiles.map((tile, index) => (
                <button
                  key={tile.label}
                  type="button"
                  onClick={() => {
                    if (tile.locked) {
                      setLockedTile(tile.label);
                      setPaywallOpen(true);
                    } else {
                      toast({ title: `${tile.label} opened`, description: "Your tile is ready for instant scoring." });
                    }
                  }}
                  className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${neonColors[index % neonColors.length]} p-4 text-left shadow-2xl shadow-slate-950/20 transition-all duration-200 hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-200/80">{tile.subtitle}</p>
                      <h3 className="mt-3 text-xl font-semibold text-white">{tile.label}</h3>
                    </div>
                    {tile.locked && (
                      <span className="rounded-full border border-white/20 bg-black/40 px-2 py-1 text-xs uppercase tracking-[0.2em] text-fuchsia-200">
                        🔒 PRO
                      </span>
                    )}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="glass-strong rounded-3xl border-white/10 p-5 bg-slate-900/85">
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Free text interpreter</p>
              <h2 className="text-2xl font-semibold text-white">Upload a case sheet or paste text</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Paste free text</label>
                <textarea
                  value={rawText}
                  onChange={(event) => handleTextChange(event.target.value)}
                  rows={5}
                  className="mt-2 w-full resize-none rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
                  placeholder="e.g. 72yo female, right-sided weakness, onset 08:10, NIHSS 8"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300">Attach case sheet image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageSelect(event.target.files?.[0] ?? null)}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 file:rounded-full file:border-none file:bg-fuchsia-500/20 file:px-4 file:py-2 file:text-slate-50"
                />
                {imageName && <p className="mt-2 text-xs text-slate-400">Selected: {imageName}</p>}
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-3xl border-white/10 p-5 bg-slate-900/85">
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Autopopulated fields</p>
              <h2 className="text-2xl font-semibold text-white">Case fields</h2>
            </div>
            <div className="grid gap-3">
              {[
                { label: "Age", value: parsedFields.age },
                { label: "Gender", value: parsedFields.gender },
                { label: "Complaint", value: parsedFields.complaint },
                { label: "Last known well", value: parsedFields.lkw },
                { label: "NIHSS", value: parsedFields.nihss },
              ].map((field) => (
                <div key={field.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
                  <p className="text-slate-400 uppercase tracking-[0.2em] text-[10px]">{field.label}</p>
                  <p className="mt-2 text-base font-medium text-white">{field.value || "Not found yet"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 glass-strong rounded-[2rem] border-white/10 bg-slate-900/90 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Publisher feedback</p>
              <h2 className="text-2xl font-semibold text-white">Send anonymous comments</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              placeholder="Share goals, pain points, or what you’d like the publisher to improve..."
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Anonymous feedback goes directly to the publisher.</p>
              <Button size="lg" className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950" onClick={handleSubmitFeedback}>
                Send Feedback
              </Button>
            </div>
          </div>
        </section>
      </div>

      {paywallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 px-4 py-8">
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/50">
            <div className="absolute right-4 top-4">
              <button onClick={() => setPaywallOpen(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Premium access</p>
              <h3 className="text-2xl font-semibold text-white">Unlock {lockedTile}</h3>
              <p className="text-sm text-slate-300">Upgrade to Pro for locked workflows, structured reporting, and priority support.</p>
              <Button size="lg" className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-slate-950" onClick={() => {
                setPaywallOpen(false);
                scrollToPricing();
              }}>
                View Pro Plans
              </Button>
              <Button variant="outline" size="lg" className="w-full text-white/90 border-white/10" onClick={() => setPaywallOpen(false)}>
                Continue browsing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
