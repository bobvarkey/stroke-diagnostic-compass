import { ReactNode } from "react";
import { useEntitlement } from "@/hooks/useEntitlement";
import { SignInForm } from "@/pages/Account";
import Pricing from "@/pages/Pricing";
import { PLAN_DISPLAY } from "@/lib/billing";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";

/** Hard paywall on the home page: sign in, then trial or paid plan. Access comes only from server-recorded entitlements. */
export default function HomePaywall({ children }: { children: ReactNode }) {
  const { user, loading, hasPremium, ents } = useEntitlement();
  if (loading) return <main className="min-h-screen grid place-items-center text-muted-foreground">Checking access…</main>;
  if (hasPremium) return <>{children}</>;
  if (user) return (
    <>
      <div className="pt-20 px-4"><p className="text-center text-sm mb-1">Signed in as {user.email}</p><SubscriptionStatusBadge ents={ents} /></div>
      <Pricing />
    </>
  );
  return (
    <main className="min-h-screen p-4 pt-16 max-w-md mx-auto space-y-4">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stroke Companion</h1>
        <p className="text-muted-foreground">Sign in or create an account to start your free 3-day trial.</p>
        <p className="text-sm">Then {PLAN_DISPLAY.stroke_monthly.inr}/month, {PLAN_DISPLAY.stroke_yearly.inr}/year, or Enterprise {PLAN_DISPLAY.stroke_enterprise.usd}/year</p>
      </header>
      <SignInForm />
    </main>
  );
}
