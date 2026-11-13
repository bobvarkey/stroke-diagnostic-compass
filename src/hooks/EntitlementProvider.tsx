import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { EntitlementContext, isEntitlementActive, type Entitlement } from "@/hooks/useEntitlement";
import { STROKE_ENTERPRISE } from "@/lib/planCatalog";

/** Owns the app's single copy of the entitlement record. It never blocks the app from rendering:
 *  a leftover server session can still refresh entitlements, and a visitor with no session simply
 *  has none. */
export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ents, setEnts] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!user) { setEnts([]); setLoading(false); return; }
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo(() => ({
    user,
    ents,
    loading,
    hasPremium: ents.some((e) => isEntitlementActive(e)),
    refresh,
  }), [user, ents, loading, refresh]);

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}
