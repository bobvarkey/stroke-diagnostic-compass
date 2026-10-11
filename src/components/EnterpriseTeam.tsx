import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const ENTERPRISE_SEATS = 50;

/** Enterprise owners list up to 50 work emails; those people sign up with that email and password to get access. */
export default function EnterpriseTeam({ ownerId }: { ownerId: string }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<{ id: string; email: string }[]>([]);
  const [email, setEmail] = useState("");
  const load = useCallback(async () => {
    const { data } = await supabase.from("enterprise_members").select("id,email").order("created_at");
    setRows(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return toast({ title: "Enter a valid email", variant: "destructive" });
    const { error } = await supabase.from("enterprise_members").insert({ owner_id: ownerId, email: v });
    if (error) toast({ title: "Could not add", description: error.message.includes("50") ? "Your plan allows up to 50 people." : error.message, variant: "destructive" });
    else { setEmail(""); load(); }
  };
  const remove = async (id: string) => { await supabase.from("enterprise_members").delete().eq("id", id); load(); };

  return (
    <section className="glass rounded-xl p-4 space-y-3">
      <h2 className="font-semibold">Enterprise team <span className="tabular-nums text-muted-foreground font-normal">({rows.length}/{ENTERPRISE_SEATS})</span></h2>
      <p className="text-sm text-muted-foreground">Add your team's work emails. Each person creates an account with that email and a password, confirms it, and gets full access.</p>
      <form onSubmit={add} className="flex gap-2">
        <Input type="email" placeholder="doctor@hospital.org" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="min-h-11" />
        <Button type="submit" className="min-h-11" disabled={rows.length >= ENTERPRISE_SEATS}>Add</Button>
      </form>
      <ul className="divide-y divide-border text-sm">
        {rows.map((r) => <li key={r.id} className="py-1 flex items-center justify-between"><span className="break-all">{r.email}</span><Button size="sm" variant="ghost" className="min-h-11" onClick={() => remove(r.id)}>Remove</Button></li>)}
      </ul>
    </section>
  );
}
