import { ReactNode } from "react";
import { useEntitlement } from "@/hooks/useEntitlement";
import { SignInForm } from "@/pages/Account";
import Pricing from "@/pages/Pricing";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";
import { PLAN_DISPLAY } from "@/lib/billing";

/** Hard paywall on the home page: sign in, then trial or paid plan. Access comes only from server-recorded entitlements. */
export default function HomePaywall({ children }: { children: ReactNode }) {
  const { user, loading, hasPremium } = useEntitlement();
  if (loading) return <main className="min-h-screen grid place-items-center text-muted-foreground">Checking access…</main>;
  if (hasPremium) return <>{children}</>;
  if (user) return <Pricing />;
  return (
    <main className="min-h-screen p-4 pt-16 max-w-md mx-auto space-y-4">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stroke Companion</h1>
        <p className="text-muted-foreground">Sign in or create an account to start your free 3-day trial.</p>
        <p className="text-sm">Then {PLAN_DISPLAY.stroke_monthly.inr}/month or {PLAN_DISPLAY.stroke_yearly.inr}/year</p>
      </header>
      <div className="flex justify-center"><SubscriptionStatusBadge /></div>
      <SignInForm />
    </main>
  );
}
