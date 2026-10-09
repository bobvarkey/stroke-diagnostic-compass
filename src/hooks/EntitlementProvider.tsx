import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EntitlementContext, isEntitlementActive, type Entitlement } from "@/hooks/useEntitlement";

/** Owns the app's single copy of the entitlement record. Every gate reads this same value, so a
 *  checkout or trial started anywhere re-renders the paywall immediately — no reload. */
export function EntitlementProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [ents, setEnts] = useState<Entitlement[] | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setEnts([]); return; }
    const { data } = await supabase.from("user_entitlements").select("kind,status,expires_at,plan_code,amount_minor,currency");
    setEnts((data as Entitlement[]) ?? []);
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
