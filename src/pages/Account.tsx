import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEntitlement, isEntitlementActive } from "@/hooks/useEntitlement";
import { useAuth } from "@/hooks/useAuth";
import { cancelSubscription, startTrial, grantDeveloper, formatAmount, PLAN_DISPLAY, type PlanCode } from "@/lib/billing";
import { clearLocalRecords } from "@/lib/patientRecords";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";

/** Human label for an entitlement row: the plan's display name where we know it, else the kind. */
const planName = (code: string | null, kind: string) =>
  code && code in PLAN_DISPLAY ? PLAN_DISPLAY[code as PlanCode].name : kind.charAt(0).toUpperCase() + kind.slice(1);

export function SignInForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); const [token, setToken] = useState("");
  const [mode, setMode] = useState<"in" | "up" | "restore" | "phone">("in");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);

  // E.164: one leading + then digits only. The number identifies the account; it grants nothing.
  const e164 = "+" + phone.replace(/\D/g, "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "phone") {
        if (!codeSent) {
          const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
          if (error) throw error;
          setCodeSent(true);
          toast({ title: "Check your messages", description: `Enter the code we sent to ${e164}.` });
        } else {
          const { error } = await supabase.auth.verifyOtp({ phone: e164, token: token.trim(), type: "sms" });
          if (error) throw error;
          toast({ title: "Signed in" });
        }
        return;
      }
      if (mode === "restore") {
        if (!codeSent) {
          // One-time code, to an existing account only. shouldCreateUser:false means this path can
          // never register a new user — only the real owner of the address can complete it.
          const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
          if (error) throw error;
          setCodeSent(true);
          toast({ title: "Check your email", description: "Enter the one-time code we just sent." });
        } else {
          const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: "email" });
          if (error) throw error;
          toast({ title: "Signed in", description: "Your account and access are restored." });
        }
        return;
      }
      const { error } = mode === "in"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/account` } });
      if (error) throw error;
      if (mode === "up") toast({ title: "Check your email", description: "Confirm your address, then sign in." });
    } catch (err) {
      toast({ title: "Could not continue", description: (err as Error).message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const switchTo = (m: "in" | "up" | "restore" | "phone") => { setMode(m); setCodeSent(false); setToken(""); };
  const needsCode = codeSent && (mode === "restore" || mode === "phone");
  const heading = mode === "in" ? "Sign in"
    : mode === "up" ? "Create account"
    : mode === "phone" ? (codeSent ? "Enter your text code" : "Sign in with a mobile number")
    : codeSent ? "Enter your one-time code" : "Restore access";

  return (
    <form onSubmit={submit} className="glass rounded-xl p-4 space-y-3">
      <h2 className="font-semibold">{heading}</h2>
      {mode === "restore" && !codeSent && (
        <p className="text-sm text-muted-foreground">We'll email a one-time code to the address on your account.</p>
      )}
      {mode === "phone" && !codeSent && (
        <p className="text-sm text-muted-foreground">We'll text a one-time code. Include the country code.</p>
      )}

      {mode === "phone" ? (
        <div className="space-y-1">
          <Label htmlFor="acc-phone">Mobile number</Label>
          <Input id="acc-phone" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="min-h-11" disabled={codeSent} placeholder="Country code + number" />
        </div>
      ) : (
        <div className="space-y-1"><Label htmlFor="acc-email">Email</Label><Input id="acc-email" type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-11" disabled={codeSent} /></div>
      )}

      {(mode === "in" || mode === "up") && (
        <div className="space-y-1"><Label htmlFor="acc-pw">Password</Label><Input id="acc-pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-11" /></div>
      )}

      {needsCode && (
        <div className="space-y-1">
          <Label htmlFor="acc-otp">One-time code</Label>
          <Input id="acc-otp" inputMode="numeric" autoComplete="one-time-code" required maxLength={10} value={token} onChange={(e) => setToken(e.target.value)} className="min-h-11 font-mono tracking-widest" />
        </div>
      )}

      <Button type="submit" disabled={busy} className="w-full min-h-11">
        {busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : needsCode ? "Verify code" : mode === "phone" ? "Text me a code" : "Email me a code"}
      </Button>

      {mode === "in" && (
        <>
          <Button type="button" variant="ghost" className="w-full min-h-11" onClick={() => switchTo("up")}>New here? Create an account</Button>
          <Button type="button" variant="ghost" className="w-full min-h-11" onClick={() => switchTo("restore")}>Restore access with a one-time code</Button>
          <Button type="button" variant="ghost" className="w-full min-h-11" onClick={() => switchTo("phone")}>Sign in with a mobile number</Button>
        </>
      )}
      {mode !== "in" && (
        <Button type="button" variant="ghost" className="w-full min-h-11" onClick={() => switchTo("in")}>Back to sign in</Button>
      )}
    </form>
  );
}

export default function Account() {
  const { user, ents, loading, hasPremium, refresh } = useEntitlement();
  const { isAdmin } = useAuth();
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
      <SubscriptionStatusBadge />
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
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : ents.length === 0 ? <p className="text-sm">No trial, subscription or developer access yet.</p> : ents.map((e) => {
              const amount = formatAmount(e.amount_minor, e.currency);
              return (
                <p key={e.kind} className="text-sm">
                  <span className="font-semibold">{planName(e.plan_code, e.kind)}</span> — {isEntitlementActive(e) ? "active" : e.status}
                  {e.status === "cancelled" ? " (won't renew)" : ""}
                  {amount ? `, ${amount}` : ""}
                  {e.expires_at ? `, until ${new Date(e.expires_at).toLocaleDateString()}` : ", no expiry"}
                </p>
              );
            })}
            <div className="flex flex-wrap gap-2">
              {!hasPremium && !trialUsed && <Button className="min-h-11" disabled={busy} onClick={() => act(startTrial, "Your 3-day trial has started")}>Start 3-day free trial</Button>}
              <Button asChild variant="outline" className="min-h-11"><Link to="/pricing">{sub ? "Change plan" : "See plans"}</Link></Button>
              {sub?.status === "active" && <Button variant="destructive" className="min-h-11" disabled={busy} onClick={() => { if (confirm("Cancel at the end of the current period?")) act(cancelSubscription, "Subscription will end at the period end"); }}>Cancel subscription</Button>}
              <Button asChild variant="outline" className="min-h-11"><Link to="/patients">My patient records</Link></Button>
              <Button variant="ghost" className="min-h-11" onClick={async () => { await supabase.auth.signOut(); await clearLocalRecords(); }}>Sign out</Button>
            </div>
          </section>

          <section className="glass rounded-xl p-4 space-y-2">
            <h2 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Developer access</h2>
            <p className="text-sm text-muted-foreground">
              Permanent developer access is a server-recorded grant keyed to the account ID above. It is
              never set in the browser, by email address, or by a local flag.
            </p>
            {isAdmin ? (
              <>
                <p className="text-sm">You are an admin, so you can grant it to your own account.</p>
                <Button className="min-h-11" disabled={busy} onClick={() => act(() => grantDeveloper(user.id), "Developer access granted")}>
                  Grant developer access to this account
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm">To grant it, an operator runs this against the project's database (service role — not runnable from the app):</p>
                <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-x-auto"><code>{`insert into user_entitlements (user_id, kind, status, expires_at)
values ('${user.id}', 'developer', 'active', null)
on conflict (user_id, kind)
do update set status = 'active', expires_at = null;`}</code></pre>
                <p className="text-sm text-muted-foreground">Copy the account ID above and use it in place of the quoted value.</p>
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}
