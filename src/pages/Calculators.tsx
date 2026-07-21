import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALL_NAV_ITEMS } from "@/lib/navRegistry";

export default function Calculators() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ALL_NAV_ITEMS.filter(i =>
      !t || i.label.toLowerCase().includes(t) || i.keywords?.some(k => k.toLowerCase().includes(t))
    );
  }, [q]);

  return (
    <div className="min-h-screen relative bg-background">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <header className="sticky top-0 z-40 glass-strong border-b">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1"/>Home</Button></Link>
          <h1 className="font-bold text-lg text-gradient-sunset">Calculator Library</h1>
        </div>
        <div className="h-[2px] bg-gradient-sunset opacity-70"/>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search calculators…" className="pl-10 h-11 bg-card/70 backdrop-blur"/>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <Card
                key={i.id}
                onClick={() => navigate(`/workup?section=${i.id}`)}
                className="p-4 cursor-pointer hover:shadow-glow hover:-translate-y-0.5 transition-all border-border/50 bg-card/70 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <Icon className={`h-5 w-5 ${i.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{i.label}</div>
                    <Badge variant="outline" className="text-[10px] mt-1">{i.parent}</Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
