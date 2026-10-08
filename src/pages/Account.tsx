import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Ent { kind: string; status: string; expires_at: string | null; plan_code: string | null; amount_minor: number | null; currency: string | null }

/** Account & access diagnostics: shows the signed-in account ID and server-recorded access. */
export default function Account() {
  const { user } = useAuth();
  const [ents, setEnts] = useState<Ent[] | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase.from("user_entitlements").select("kind,status,expires_at,plan_code,amount_minor,currency").then(({ data }) => setEnts((data as Ent[]) ?? []));
  }, [user]);

  return (
    <main className="min-h-screen p-4 pt-20 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Account</h1>
      {!user ? (
        <p className="text-muted-foreground">Sign in to see your account ID and access.</p>
      ) : (
        <>
          <section className="glass rounded-xl p-4 space-y-2">
            <h2 className="font-semibold">Your account ID</h2>
            <p className="font-mono text-sm break-all">{user.id}</p>
            <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(user.id)}><Copy className="h-4 w-4 mr-1" />Copy</Button>
            <p className="text-sm text-muted-foreground">To get permanent developer access, send this ID to the app builder; it is granted on the server only.</p>
          </section>
          <section className="glass rounded-xl p-4 space-y-2">
            <h2 className="font-semibold">Access</h2>
            {ents === null ? <p className="text-sm text-muted-foreground">Loading…</p> : ents.length === 0 ? <p className="text-sm">No trial, subscription or developer access yet.</p> : ents.map((e) => (
              <p key={e.kind} className="text-sm"><span className="font-semibold capitalize">{e.kind}</span> — {e.status}{e.expires_at ? `, until ${new Date(e.expires_at).toLocaleDateString()}` : ", no expiry"}{e.amount_minor != null && e.currency ? ` · ${(e.amount_minor / 100).toFixed(2)} ${e.currency}` : ""}</p>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
