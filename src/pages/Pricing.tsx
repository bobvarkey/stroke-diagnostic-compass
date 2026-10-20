import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEntitlement } from "@/hooks/useEntitlement";
import PlanCards from "@/components/PlanCards";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";
import HomePaywall from "@/components/HomePaywall";
import { allowsWebBilling } from "@/lib/distribution";

/** Standalone pricing route. Renders the same PlanCards as the home paywall, so the two agree. */
export default function Pricing() {
  const { user, hasPremium } = useEntitlement();

  if (!allowsWebBilling()) return (
    <HomePaywall>
      <main className="min-h-screen p-4 pt-20 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Your access</h1>
        <SubscriptionStatusBadge />
        <Button asChild className="min-h-11"><Link to="/">Open Stroke Companion</Link></Button>
      </main>
    </HomePaywall>
  );

  return (
    <main className="min-h-screen p-4 pt-20 max-w-3xl mx-auto space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stroke Pro</h1>
        <p className="text-muted-foreground">Start with a free 3-day trial. Cancel anytime.</p>
        <SubscriptionStatusBadge />
        {hasPremium && <p className="text-sm font-semibold text-primary">You already have access — thank you!</p>}
      </header>

      {!user && (
        <div className="glass rounded-xl p-4 text-center space-y-2">
          <p>Sign in first to start a trial or subscribe.</p>
          <Button asChild className="min-h-11"><Link to="/account">Sign in</Link></Button>
        </div>
      )}

      <PlanCards />

      <p className="text-xs text-muted-foreground text-center">
        Payments are handled securely by Razorpay. Manage or cancel from your <Link to="/account" className="underline">Account</Link> page.
      </p>
    </main>
  );
}
