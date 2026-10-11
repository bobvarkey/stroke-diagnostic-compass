import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EntitlementContext, isEntitlementActive, type Entitlement } from "@/hooks/useEntitlement";
import { STROKE_ENTERPRISE } from "@/lib/planCatalog";

/** Owns the app's single copy of the entitlement record. Every gate reads this same value, so a
 *  checkout or trial started anywhere re-renders the paywall immediately — no reload. */
export function EntitlementProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [ents, setEnts] = useState<Entitlement[] | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setEnts([]); return; }
    const [{ data }, { data: memberUntil }] = await Promise.all([
      supabase.from("user_entitlements").select("kind,status,expires_at,plan_code,amount_minor,currency"),
      supabase.rpc("my_enterprise_access"),
    ]);
    const list = (data as Entitlement[]) ?? [];
    // A seat on someone else's Enterprise plan. Resolved server-side from this account's confirmed
    // email, so it cannot be claimed by editing anything in the browser.
    if (memberUntil) {
      list.push({ kind: "enterprise_member", status: "active", expires_at: memberUntil as string, plan_code: STROKE_ENTERPRISE, amount_minor: null, currency: null });
    }
    setEnts(list);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(() => ({
    user,
    ents: ents ?? [],
    loading: authLoading || ents === null,
    hasPremium: !!ents?.some((e) => isEntitlementActive(e)),
    refresh,
  }), [user, ents, authLoading, refresh]);

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}
