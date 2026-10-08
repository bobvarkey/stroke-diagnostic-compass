import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEntitlement } from "@/hooks/useEntitlement";

/** Shows children only with server-recorded premium access (trial, subscription or developer). */
export default function PremiumGate({ children, feature }: { children: ReactNode; feature: string }) {
  const { user, loading, hasPremium } = useEntitlement();
  if (loading) return <p className="text-sm text-muted-foreground p-4">Checking access…</p>;
  if (hasPremium) return <>{children}</>;
  return (
    <div className="glass-strong rounded-xl p-6 text-center space-y-3 max-w-md mx-auto">
      <Lock className="h-8 w-8 mx-auto text-primary" />
      <h2 className="text-lg font-bold">{feature} is a Stroke Pro feature</h2>
      <p className="text-sm text-muted-foreground">{user ? "Start your free 3-day trial or choose a plan to unlock it." : "Sign in, then start your free 3-day trial or choose a plan."}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {!user && <Button asChild className="min-h-11"><Link to="/account">Sign in</Link></Button>}
        <Button asChild variant={user ? "default" : "outline"} className="min-h-11"><Link to="/pricing">See plans & free trial</Link></Button>
      </div>
    </div>
  );
}
