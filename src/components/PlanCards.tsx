import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEntitlement } from "@/hooks/useEntitlement";
import {
  PLAN_DISPLAY, plansFor, preferredCurrency, annualSavingPercent,
  startTrial, subscribe, ENTERPRISE_PLAN, type PlanCode,
} from "@/lib/billing";

const FEATURES = ["Stroke Plan tab with live next steps", "Saved patient records, viewable offline", "All calculators and pathways"];

/** The trial offer and the three plans, in one place so the paywall and /pricing cannot drift.
 *  Prices come from the catalog; the charged amount still comes from the plan id the server holds. */
export default function PlanCards({ compact = false }: { compact?: boolean }) {
  const { user, ents, hasPremium, refresh } = useEntitlement();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const currency = preferredCurrency();
  const trialUsed = ents.some((e) => e.kind === "trial");
  const saving = annualSavingPercent(currency);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast({ title: "Something went wrong", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const choose = (code: PlanCode) =>
    run(code, () =>
      subscribe(code, async (ok) => {
        toast({
          title: ok ? "Payment received" : "Payment not confirmed",
          description: ok
            ? "Access unlocks as soon as Razorpay confirms (usually seconds)."
            : "If you were charged, access will unlock once Razorpay confirms.",
        });
        setTimeout(refresh, 4000);
      }),
    );

  const card = (code: PlanCode, recommended: boolean) => {
    const p = PLAN_DISPLAY[code];
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
        <p className="text-2xl font-bold tabular-nums">
          {p.amount}<span className="text-sm font-normal text-muted-foreground"> / {p.period}</span>
        </p>
        {!compact && <ul className="space-y-1 text-sm">{FEATURES.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>)}</ul>}
        <Button className="w-full min-h-11" disabled={!user || busy !== null} onClick={() => choose(code)}>
          {busy === code ? "Opening…" : user ? `Choose ${p.name}` : "Sign in to continue"}
        </Button>
      </section>
    );
  };

  const enterprise = PLAN_DISPLAY[ENTERPRISE_PLAN];

  return (
    <div className="space-y-4">
      {!hasPremium && (
        <div className="glass-strong rounded-xl p-4 text-center space-y-2">
          <p className="font-semibold">Try everything free for 3 days</p>
          {trialUsed ? (
            <p className="text-sm text-muted-foreground">Your free trial has been used.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">No card needed. Cancel anytime.</p>
              <Button
                className="min-h-11"
                disabled={!user || busy !== null}
                onClick={() => run("trial", async () => { await startTrial(); await refresh(); toast({ title: "Your 3-day trial has started" }); })}
              >
                {busy === "trial" ? "Starting…" : user ? "Start 3-day free trial" : "Sign in to start your free trial"}
              </Button>
            </>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {plansFor(currency).map((code) => card(code, PLAN_DISPLAY[code].period === "year"))}
      </div>

      <section className="glass rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-xl font-bold">{enterprise.name}</h2>
          <span className="text-xs text-muted-foreground">Billed in USD, worldwide</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">
          {enterprise.amount}<span className="text-sm font-normal text-muted-foreground"> / {enterprise.period}</span>
        </p>
        <p className="text-sm text-muted-foreground">Same access as the plans above today — team seat management is not built yet.</p>
        <Button variant="outline" className="w-full min-h-11" disabled={!user || busy !== null} onClick={() => choose(ENTERPRISE_PLAN)}>
          {busy === ENTERPRISE_PLAN ? "Opening…" : user ? `Choose ${enterprise.name}` : "Sign in to continue"}
        </Button>
      </section>
    </div>
  );
}
