import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEntitlement } from "@/hooks/useEntitlement";
import PlanCards from "@/components/PlanCards";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";
import { allowsWebBilling } from "@/lib/distribution";

/** Standalone pricing route. The clinical app is not gated by this page. */
export default function Pricing() {
  const { hasPremium } = useEntitlement();

  if (!allowsWebBilling()) return (
    <main className="min-h-screen p-4 pt-20 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Your access</h1>
      <SubscriptionStatusBadge />
      <Button asChild className="min-h-11"><Link to="/">Open Stroke Companion</Link></Button>
    </main>
  );

  return (
    <main className="min-h-screen p-4 pt-20 max-w-3xl mx-auto space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stroke Pro</h1>
        <p className="text-muted-foreground">Plans are listed here. Checkout stays on the server.</p>
        <SubscriptionStatusBadge />
        {hasPremium && <p className="text-sm font-semibold text-primary">You already have access — thank you!</p>}
      </header>

      <PlanCards />

      <p className="text-xs text-muted-foreground text-center">
        Payments are handled securely by Razorpay when a server session already exists.
      </p>
    </main>
  );
}
