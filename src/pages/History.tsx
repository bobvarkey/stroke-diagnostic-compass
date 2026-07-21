import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Row {
  id: string;
  patient_id: string;
  name: string | null;
  age: number | null;
  sex: string | null;
  updated_at: string;
  created_at: string;
}

export default function HistoryPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_id, name, age, sex, updated_at, created_at")
        .order("updated_at", { ascending: false })
        .limit(200);
      if (!error && data) setRows(data as Row[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(r =>
      r.patient_id.toLowerCase().includes(t) ||
      (r.name?.toLowerCase().includes(t) ?? false) ||
      (r.sex?.toLowerCase() === t)
    );
  }, [rows, q]);

  return (
    <div className="min-h-screen relative bg-background">
      <div className="bg-orb bg-orb-1"/>
      <div className="bg-orb bg-orb-2"/>

      <header className="sticky top-0 z-40 glass-strong border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1"/>Home</Button></Link>
          <h1 className="font-bold text-lg text-gradient-sunset">Patient History</h1>
        </div>
        <div className="h-[2px] bg-gradient-sunset opacity-70"/>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by ID, name, or sex…" className="pl-10 h-11 bg-card/70 backdrop-blur"/>
        </div>

        {loading && <p className="text-sm text-muted-foreground text-center py-8">Loading cases…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No cases match your search.</p>
        )}

        <div className="space-y-2">
          {filtered.map(r => (
            <Card key={r.id} className="p-4 flex items-center gap-3 bg-card/70 backdrop-blur hover:shadow-glow transition">
              <div className="w-10 h-10 rounded-full bg-gradient-sunset flex items-center justify-center">
                <User className="h-5 w-5 text-white"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-sm">{r.patient_id}</span>
                  {r.name && <span className="text-sm text-muted-foreground truncate">{r.name}</span>}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {r.age ? `${r.age}y` : "—"} · {r.sex || "—"} · updated {formatDistanceToNow(new Date(r.updated_at))} ago
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">Case</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
