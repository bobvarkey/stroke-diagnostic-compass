import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEntitlement } from "@/hooks/useEntitlement";
import { allowsWebBilling } from "@/lib/distribution";
import {
  PLAN_DISPLAY, plansFor, annualSavingPercent, monthlyPlan, yearlyPlan,
  startTrial, subscribe, ENTERPRISE_PLAN, ENTERPRISE_SEATS, type PlanCode, type Currency,
} from "@/lib/billing";

const FEATURES = ["Stroke Plan tab with live next steps", "Saved patient records, viewable offline", "All calculators and pathways"];

/** The trial offer and the three plans, in one place so the paywall and /pricing cannot drift.
 *  Prices come from the catalog; the charged amount still comes from the plan id the server holds.
 *  Prices default to USD; visitors in India can flip to ₹ with the toggle. */
export default function PlanCards({ compact = false }: { compact?: boolean }) {
  const { user, ents, hasPremium, refresh } = useEntitlement();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>("USD");
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

  const trial = !hasPremium && (
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
      );
  if (!allowsWebBilling()) return trial || null;

  const enterprise = PLAN_DISPLAY[ENTERPRISE_PLAN];

  return (
    <div className="space-y-4">
      {trial}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">Prices in</span>
        <div className="inline-flex rounded-full border border-border overflow-hidden" role="group" aria-label="Currency">
          {(["USD", "INR"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              aria-pressed={currency === c}
              className={`px-4 min-h-9 text-sm font-semibold transition-colors ${
                currency === c ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "USD" ? "$ USD" : "₹ INR (India)"}
            </button>
          ))}
        </div>
      </div>

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
        <ul className="space-y-1 text-sm">
          {[...FEATURES, `Up to ${ENTERPRISE_SEATS} people, invited by email`, "For hospitals and stroke teams"].map((f) => (
            <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>
          ))}
        </ul>
        <Button variant="outline" className="w-full min-h-11" disabled={!user || busy !== null} onClick={() => choose(ENTERPRISE_PLAN)}>
          {busy === ENTERPRISE_PLAN ? "Opening…" : user ? `Choose ${enterprise.name}` : "Sign in to continue"}
        </Button>
      </section>

      {!compact && (
        <section className="glass rounded-xl p-4 overflow-x-auto">
          <h2 className="text-lg font-bold mb-3">Compare plans</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-2 font-semibold">Feature</th>
                <th className="py-2 px-2 font-semibold">Monthly</th>
                <th className="py-2 px-2 font-semibold">Yearly</th>
                <th className="py-2 pl-2 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 pr-2">Price</td>
                <td className="py-2 px-2 font-bold tabular-nums">{PLAN_DISPLAY[monthlyPlan(currency)].amount}/mo</td>
                <td className="py-2 px-2 font-bold tabular-nums">{PLAN_DISPLAY[yearlyPlan(currency)].amount}/yr</td>
                <td className="py-2 pl-2 font-bold tabular-nums">{enterprise.amount}/yr{currency === "INR" && <span className="block text-xs font-normal text-muted-foreground">USD only</span>}</td>
              </tr>
              {[
                ["People", "1", "1", `Up to ${ENTERPRISE_SEATS}`],
                ["Plan tab, calculators, pathways", "✓", "✓", "✓"],
                ["Offline patient records", "✓", "✓", "✓"],
                ["Team admin page", "—", "—", "✓"],
                ["3-day free trial", "✓", "✓", "—"],
              ].map(([f, ...v]) => (
                <tr key={f}><td className="py-2 pr-2">{f}</td>{v.map((x, i) => <td key={i} className="py-2 px-2">{x}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
