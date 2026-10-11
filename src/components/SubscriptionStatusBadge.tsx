import { Badge } from "@/components/ui/badge";
import { isEntitlementActive, type Entitlement } from "@/hooks/useEntitlement";
import { PLAN_DISPLAY, type PlanCode } from "@/lib/billing";

export type SubStatus = "developer" | "active" | "trial" | "paused" | "expired" | "none";

/** Summarises server-recorded entitlements into one visible status. */
export function subscriptionStatus(ents: Entitlement[], now = Date.now()): { status: SubStatus; until: string | null; plan: string | null } {
  const dev = ents.find((e) => e.kind === "developer" && isEntitlementActive(e, now));
  if (dev) return { status: "developer", until: null, plan: null };
  const sub = ents.find((e) => e.kind === "subscription");
  const plan = sub?.plan_code ? PLAN_DISPLAY[sub.plan_code as PlanCode]?.name ?? sub.plan_code : null;
  if (sub && isEntitlementActive(sub, now)) return { status: "active", until: sub.expires_at, plan };
  const member = ents.find((e) => e.kind === "enterprise_member" && isEntitlementActive(e, now));
  if (member) return { status: "active", until: member.expires_at, plan: "Enterprise team member" };
  const trial = ents.find((e) => e.kind === "trial");
  if (trial && isEntitlementActive(trial, now)) return { status: "trial", until: trial.expires_at, plan: "Free trial" };
  if (sub && (sub.status === "paused" || sub.status === "halted")) return { status: "paused", until: sub.expires_at, plan };
  if (sub || trial) return { status: "expired", until: (sub ?? trial)!.expires_at, plan };
  return { status: "none", until: null, plan: null };
}

const LABEL: Record<SubStatus, string> = { developer: "Developer access", active: "Active", trial: "Trial", paused: "Paused", expired: "Expired", none: "No plan" };
const STYLE: Record<SubStatus, string> = {
  developer: "bg-primary text-primary-foreground",
  active: "bg-primary text-primary-foreground",
  trial: "bg-secondary text-secondary-foreground",
  paused: "bg-accent text-accent-foreground",
  expired: "bg-destructive text-destructive-foreground",
  none: "bg-muted text-muted-foreground",
};

export default function SubscriptionStatusBadge({ ents }: { ents: Entitlement[] }) {
  const s = subscriptionStatus(ents);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm" role="status">
      <Badge className={`${STYLE[s.status]} px-3 py-1 text-sm`}>{LABEL[s.status]}</Badge>
      {s.plan && <span className="font-medium">{s.plan}</span>}
      {s.until && <span className="text-muted-foreground">{s.status === "expired" ? "ended" : s.status === "paused" ? "paused since" : "until"} {new Date(s.until).toLocaleDateString()}</span>}
    </div>
  );
}
