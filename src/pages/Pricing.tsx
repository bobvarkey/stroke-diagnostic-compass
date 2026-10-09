import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEntitlement } from "@/hooks/useEntitlement";
import { PLAN_DISPLAY, PLAN_ORDER, annualSavingPercent, startTrial, subscribe } from "@/lib/billing";

const FEATURES = ["Stroke Plan tab with live next steps", "Saved patient records, viewable offline", "All calculators and pathways"];

export default function Pricing() {
  const { user, hasPremium, ents, refresh } = useEntitlement();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const trialUsed = ents.some((e) => e.kind === "trial");

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try { await fn(); } catch (e) { toast({ title: "Something went wrong", description: (e as Error).message, variant: "destructive" }); }
    finally { setBusy(null); }
  };

  return (
    <main className="min-h-screen p-4 pt-20 max-w-3xl mx-auto space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stroke Pro</h1>
        <p className="text-muted-foreground">Start with a free 3-day trial. Cancel anytime.</p>
        {hasPremium && <p className="text-sm font-semibold text-primary">You already have access — thank you!</p>}
      </header>

      {!user ? (
        <div className="glass rounded-xl p-4 text-center space-y-2">
          <p>Sign in first to start a trial or subscribe.</p>
          <Button asChild className="min-h-11"><Link to="/account">Sign in</Link></Button>
        </div>
      ) : !trialUsed && !hasPremium && (
        <div className="glass-strong rounded-xl p-4 text-center space-y-2">
          <p className="font-semibold">Try everything free for 3 days</p>
          <Button className="min-h-11" disabled={busy !== null} onClick={() => run("trial", async () => { await startTrial(); await refresh(); toast({ title: "Your 3-day trial has started" }); })}>
            {busy === "trial" ? "Starting…" : "Start 3-day free trial"}
          </Button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {PLAN_ORDER.map((code) => {
          const p = PLAN_DISPLAY[code];
          const recommended = code === "stroke_yearly";
          const saving = annualSavingPercent();
          return (
            <section key={code} className={`glass rounded-xl p-5 space-y-3 ${recommended ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{p.name}</h2>
                {recommended && (
                  <span className="text-xs font-semibold rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                    Recommended{saving ? ` · save ${saving}%` : ""}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold tabular-nums">{p.inr}<span className="text-sm font-normal text-muted-foreground"> / {p.period}</span></p>
              <p className="text-sm text-muted-foreground">{p.usd} / {p.period} outside India</p>
              <ul className="space-y-1 text-sm">{FEATURES.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>)}</ul>
              <Button className="w-full min-h-11" disabled={!user || busy !== null} onClick={() => run(code, () => subscribe(code, async (ok) => {
                toast({ title: ok ? "Payment received" : "Payment not confirmed", description: ok ? "Access unlocks as soon as Razorpay confirms (usually seconds)." : "If you were charged, access will unlock once Razorpay confirms." });
                setTimeout(refresh, 4000);
              }))}>
                {busy === code ? "Opening…" : `Choose ${p.name}`}
              </Button>
            </section>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center">Payments are handled securely by Razorpay. Manage or cancel from your <Link to="/account" className="underline">Account</Link> page.</p>
    </main>
  );
}
