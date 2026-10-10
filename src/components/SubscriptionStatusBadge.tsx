import { useEntitlement } from "@/hooks/useEntitlement";
import { subscriptionStatus, type StatusTone } from "@/lib/entitlementStatus";

const TONE: Record<StatusTone, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  paused: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  expired: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  none: "border-border bg-muted/50 text-muted-foreground",
};

const DOT: Record<StatusTone, string> = {
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  expired: "bg-rose-500",
  none: "bg-muted-foreground",
};

/** Reads the server-recorded entitlement and shows it in one line. Display only — it grants
 *  nothing, and it stays hidden while the record is loading so it never flashes a wrong answer. */
export default function SubscriptionStatusBadge({ className = "" }: { className?: string }) {
  const { ents, loading } = useEntitlement();
  if (loading) return null;

  const { label, detail, tone } = subscriptionStatus(ents);
  return (
    <div
      role="status"
      aria-label={`Subscription status: ${label}${detail ? `, ${detail}` : ""}`}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${TONE[tone]} ${className}`}
    >
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} />
      <span className="font-semibold">{label}</span>
      {detail && <span className="opacity-80">· {detail}</span>}
    </div>
  );
}
