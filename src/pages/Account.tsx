import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEntitlement, isEntitlementActive } from "@/hooks/useEntitlement";
import { cancelSubscription, startTrial } from "@/lib/billing";

function SignInForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in"); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/account` } });
    setBusy(false);
    if (error) toast({ title: "Could not continue", description: error.message, variant: "destructive" });
    else if (mode === "up") toast({ title: "Check your email", description: "Confirm your address, then sign in." });
  };
  return (
    <form onSubmit={submit} className="glass rounded-xl p-4 space-y-3">
      <h2 className="font-semibold">{mode === "in" ? "Sign in" : "Create account"}</h2>
      <div className="space-y-1"><Label htmlFor="acc-email">Email</Label><Input id="acc-email" type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-11" /></div>
      <div className="space-y-1"><Label htmlFor="acc-pw">Password</Label><Input id="acc-pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-11" /></div>
      <Button type="submit" disabled={busy} className="w-full min-h-11">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
      <Button type="button" variant="ghost" className="w-full min-h-11" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}</Button>
    </form>
  );
}

export default function Account() {
  const { user, ents, loading, hasPremium, refresh } = useEntitlement();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const sub = ents.find((e) => e.kind === "subscription");
  const trialUsed = ents.some((e) => e.kind === "trial");
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { await fn(); toast({ title: ok }); await refresh(); } catch (e) { toast({ title: "Something went wrong", description: (e as Error).message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen p-4 pt-20 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Account</h1>
      {!user ? <SignInForm /> : (
        <>
          <section className="glass rounded-xl p-4 space-y-2">
            <h2 className="font-semibold">Your account ID</h2>
            <p className="text-sm">{user.email}</p>
            <p className="font-mono text-sm break-all">{user.id}</p>
            <Button size="sm" variant="outline" className="min-h-11" onClick={() => navigator.clipboard.writeText(user.id)}><Copy className="h-4 w-4 mr-1" />Copy</Button>
          </section>
          <section className="glass rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">Access</h2>
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : ents.length === 0 ? <p className="text-sm">No trial, subscription or developer access yet.</p> : ents.map((e) => (
              <p key={e.kind} className="text-sm"><span className="font-semibold capitalize">{e.kind}</span> — {isEntitlementActive(e) ? "active" : e.status}{e.status === "cancelled" ? " (won't renew)" : ""}{e.expires_at ? `, until ${new Date(e.expires_at).toLocaleDateString()}` : ", no expiry"}</p>
            ))}
            <div className="flex flex-wrap gap-2">
              {!hasPremium && !trialUsed && <Button className="min-h-11" disabled={busy} onClick={() => act(startTrial, "Your 3-day trial has started")}>Start 3-day free trial</Button>}
              <Button asChild variant="outline" className="min-h-11"><Link to="/pricing">{sub ? "Change plan" : "See plans"}</Link></Button>
              {sub?.status === "active" && <Button variant="destructive" className="min-h-11" disabled={busy} onClick={() => { if (confirm("Cancel at the end of the current period?")) act(cancelSubscription, "Subscription will end at the period end"); }}>Cancel subscription</Button>}
              <Button asChild variant="outline" className="min-h-11"><Link to="/patients">My patient records</Link></Button>
              <Button variant="ghost" className="min-h-11" onClick={() => supabase.auth.signOut()}>Sign out</Button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
