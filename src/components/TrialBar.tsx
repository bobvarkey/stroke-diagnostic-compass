import { Link } from "react-router-dom";
import { useEntitlement } from "@/hooks/useEntitlement";
import { trialDaysLeft } from "@/lib/entitlementStatus";

/**
 * Days-left strip for an account that is running on its free trial.
 *
 * Renders nothing at all unless a trial is what the account is actually getting: `trialDaysLeft`
 * shares its precedence with `subscriptionStatus`, so someone who subscribes mid-trial — and still
 * holds the trial row — stops being counted down instead of being nagged by a stale record.
 *
 * Sticky under the workspace header (`h-14`, z-50) so the countdown stays in view while the user
 * works, and it links to the plans so the offer is one tap away before the gate closes. Colours
 * match the `active` tone of SubscriptionStatusBadge so the bar and the badge never disagree.
 */
export default function TrialBar() {
  const { ents, loading } = useEntitlement();
  if (loading) return null;

  const days = trialDaysLeft(ents);
  if (days === null) return null;

  return (
    <div
      role="status"
      className="sticky top-14 z-40 flex items-center gap-2 border-b border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
      <span className="font-semibold">Trial</span>
      <span className="opacity-80">
        {days} day{days === 1 ? "" : "s"} left
      </span>
      <Link
        to="/pricing"
        className="ml-auto font-semibold underline underline-offset-2 hover:opacity-80"
      >
        See plans
      </Link>
    </div>
  );
}
