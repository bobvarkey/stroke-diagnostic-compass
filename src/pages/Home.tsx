import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Calculator, History, Settings, ArrowRight, Sparkles, Stethoscope, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALL_NAV_ITEMS } from "@/lib/navRegistry";
import heroBrain from "@/assets/hero-brain.jpg";

export default function Home() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return ALL_NAV_ITEMS.filter(
      i => i.label.toLowerCase().includes(t) || i.keywords?.some(k => k.toLowerCase().includes(t))
    ).slice(0, 8);
  }, [q]);

  const openItem = (id: string) => navigate(`/workup?section=${id}`);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Sticky glass header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-sunset flex items-center justify-center shadow-glow">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gradient-sunset">StrokeSuite</span>
          </Link>
          <nav className="flex items-center gap-1 text-xs">
            <Link to="/calculators"><Button variant="ghost" size="sm"><Calculator className="h-3.5 w-3.5 mr-1"/>Calculators</Button></Link>
            <Link to="/history"><Button variant="ghost" size="sm"><History className="h-3.5 w-3.5 mr-1"/>History</Button></Link>
            <Link to="/settings"><Button variant="ghost" size="sm"><Settings className="h-3.5 w-3.5 mr-1"/>Settings</Button></Link>
            <Link to="/workup"><Button size="sm" className="bg-gradient-sunset border-0 shadow-glow ml-2">Open App <ArrowRight className="h-3.5 w-3.5 ml-1"/></Button></Link>
          </nav>
        </div>
        <div className="h-[2px] bg-gradient-sunset opacity-70" />
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 pt-12 pb-16 grid lg:grid-cols-2 gap-8 items-center">
        <div className="relative z-10">
          <Badge className="bg-gradient-sunset border-0 mb-4"><Sparkles className="h-3 w-3 mr-1"/>AHA 2026 · LAI 2026</Badge>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            The complete <span className="text-gradient-sunset">stroke clinical</span> companion.
          </h1>
          <p className="text-muted-foreground text-lg mb-6 max-w-xl">
            NIHSS, ASPECTS, CTP, LVO decisions, medication dosing, and evidence-based algorithms — all at the bedside.
          </p>

          {/* Front-page search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search calculators, mini-apps, tabs…"
              className="pl-10 h-12 text-base bg-card/70 backdrop-blur border-border/60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) openItem(results[0].id);
              }}
            />
            {results.length > 0 && (
              <Card className="absolute z-30 mt-2 w-full p-1 max-h-80 overflow-auto shadow-glow">
                {results.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => openItem(r.id)}
                      className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/30 text-left"
                    >
                      <Icon className={`h-4 w-4 ${r.color}`} />
                      <span className="flex-1 truncate">{r.label}</span>
                      <span className="text-[10px] text-muted-foreground">{r.parent}</span>
                    </button>
                  );
                })}
              </Card>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Link to="/workup"><Button size="lg" className="bg-gradient-sunset border-0 shadow-glow"><Zap className="h-4 w-4 mr-2"/>Launch Workup</Button></Link>
            <Link to="/calculators"><Button size="lg" variant="outline">Browse Calculators</Button></Link>
          </div>
        </div>

        {/* Glowing hero image */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-sunset blur-3xl opacity-30 rounded-full" />
          <img
            src={heroBrain}
            alt="Glowing brain with stroke lesion"
            width={1536}
            height={1024}
            className="relative rounded-2xl border border-border/40 shadow-glow"
          />
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid md:grid-cols-3 gap-4">
        <FeatureCard to="/calculators" icon={<Calculator className="h-5 w-5" />} title="Calculator Library" desc="NIHSS, ASPECTS, ICH, CTP, weight-based dosing, and more." accent="from-primary to-accent" />
        <FeatureCard to="/history" icon={<History className="h-5 w-5" />} title="History & Search" desc="Every patient case, searchable, sortable, and exportable." accent="from-accent to-secondary" />
        <FeatureCard to="/settings" icon={<Settings className="h-5 w-5" />} title="Settings" desc="Theme, rounding rules, glossary, and preferences." accent="from-secondary to-primary" />
      </section>
    </div>
  );
}

function FeatureCard({ to, icon, title, desc, accent }: { to: string; icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <Link to={to}>
      <Card className="p-5 hover:shadow-glow transition-all hover:-translate-y-1 h-full border-border/50 bg-card/70 backdrop-blur">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white mb-3`}>
          {icon}
        </div>
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </Card>
    </Link>
  );
}
