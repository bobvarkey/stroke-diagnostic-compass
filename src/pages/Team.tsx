import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEntitlement, isEntitlementActive } from "@/hooks/useEntitlement";
import { allowsWebBilling } from "@/lib/distribution";

interface Member { id: string; email: string; added_at: string; status: "invited" | "pending_confirmation" | "active"; last_sign_in_at: string | null; records: number; last_record_at: string | null }
const LABEL = { invited: "Invite sent", pending_confirmation: "Awaiting email confirmation", active: "Active" } as const;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "Never");

async function call<T>(body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke("enterprise-team", { body });
  if (error) {
    let msg = error.message;
    try { const ctx = (error as { context?: Response }).context; if (ctx) msg = (await ctx.json()).error ?? msg; } catch { /* keep */ }
    throw new Error(msg);
  }
  return data as T;
}

export default function Team() {
  const { user, ents, loading } = useEntitlement();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const owner = ents.some((e) => e.kind === "subscription" && e.plan_code === "stroke_enterprise" && isEntitlementActive(e));

  const load = useCallback(async () => {
    try { setMembers((await call<{ members: Member[] }>({ action: "list" })).members); }
    catch (e) { toast({ title: "Could not load team", description: (e as Error).message, variant: "destructive" }); setMembers([]); }
  }, [toast]);
  useEffect(() => { if (owner) load(); }, [owner, load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await call<{ emailed: boolean }>({ action: "invite", email: email.trim(), redirectTo: `${window.location.origin}/account` });
      toast({ title: r.emailed ? "Invite emailed" : "Added", description: r.emailed ? "They'll get a link to set a password." : "This person already has an account — they just sign in." });
      setEmail(""); load();
    } catch (err) { toast({ title: "Could not invite", description: (err as Error).message, variant: "destructive" }); }
    finally { setBusy(false); }
  };
  const remove = async (m: Member) => {
    if (!confirm(`Remove ${m.email}? They lose access immediately.`)) return;
    await call({ action: "remove", id: m.id }); load();
  };

  if (loading) return <main className="min-h-screen p-4 pt-20 max-w-3xl mx-auto"><p>Loading…</p></main>;
  if (!user || !owner) return (
    <main className="min-h-screen p-4 pt-20 max-w-3xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Team admin</h1>
      <p className="text-muted-foreground">This page is for owners of an active Enterprise Annual plan.</p>
      <Button asChild className="min-h-11"><Link to={user && allowsWebBilling() ? "/pricing" : "/account"}>{user ? allowsWebBilling() ? "See plans" : "Account access" : "Sign in"}</Link></Button>
    </main>
  );

  const count = members?.length ?? 0;
  return (
    <main className="min-h-screen p-4 pt-20 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Team admin <span className="text-muted-foreground font-normal tabular-nums text-lg">({count}/50 seats)</span></h1>
      <form onSubmit={invite} className="glass rounded-xl p-4 space-y-2">
        <h2 className="font-semibold">Send an invite</h2>
        <p className="text-sm text-muted-foreground">They get an email to set their password. Access works once they confirm.</p>
        <div className="flex gap-2">
          <Input type="email" required maxLength={255} placeholder="doctor@hospital.org" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-11" />
          <Button type="submit" className="min-h-11" disabled={busy || count >= 50}>{busy ? "Sending…" : "Invite"}</Button>
        </div>
      </form>
      <section className="glass rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Members & activity</h2><Button size="sm" variant="outline" className="min-h-11" onClick={load}>Refresh</Button></div>
        {members === null ? <p className="text-sm">Loading…</p> : count === 0 ? <p className="text-sm text-muted-foreground">No members yet.</p> : (
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.id} className="py-3 flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 text-sm min-w-0">
                  <p className="font-medium break-all">{m.email}</p>
                  <Badge variant={m.status === "active" ? "default" : "secondary"}>{LABEL[m.status]}</Badge>
                  <p className="text-muted-foreground">Last sign-in: {fmt(m.last_sign_in_at)}</p>
                  <p className="text-muted-foreground">Patient records: {m.records}{m.last_record_at ? ` · last saved ${fmt(m.last_record_at)}` : ""}</p>
                </div>
                <Button size="sm" variant="ghost" className="min-h-11" onClick={() => remove(m)}>Remove</Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
