import { ReactNode } from "react";
import { useEntitlement } from "@/hooks/useEntitlement";
import { SignInForm } from "@/pages/Account";
import PlanCards from "@/components/PlanCards";
import PaywallBackdrop from "@/components/PaywallBackdrop";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";
import { allowsWebBilling } from "@/lib/distribution";

/**
 * Hard paywall on the home page: sign in, start the trial, or buy — all on one screen.
 *
 * Access comes only from server-recorded entitlements, and `<Index />` is not mounted until one
 * exists, so the gated app is never sent to a visitor without access. The backdrop below is a
 * decorative stand-in, never the real app: blurring the app itself would mean shipping gated
 * clinical content to every signed-out visitor and hiding it behind one CSS class.
 */
export default function HomePaywall({ children }: { children: ReactNode }) {
  const { user, loading, hasPremium } = useEntitlement();
  const webBilling = allowsWebBilling();

  if (loading) return <main className="min-h-screen grid place-items-center text-muted-foreground">Checking access…</main>;
  if (hasPremium) return <>{children}</>;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {webBilling && <PaywallBackdrop />}
      <div className="absolute inset-0 bg-background/70" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-md space-y-4 p-4 pt-14 pb-16">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Stroke Companion</h1>
          <p className="text-muted-foreground">
            {webBilling
              ? user ? "Start your free 3-day trial or choose a plan." : "Sign in or create an account to start your free 3-day trial."
              : user ? "Your account access" : "Sign in to your account or start a free 3-day trial."}
          </p>
          {user && <p className="text-sm">Signed in as {user.email}</p>}
        </header>

        <div className="flex justify-center"><SubscriptionStatusBadge /></div>

        {!user && <SignInForm />}

        <PlanCards />
      </div>
    </main>
  );
}
