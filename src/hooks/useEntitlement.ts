import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Entitlement { kind: string; status: string; expires_at: string | null; plan_code: string | null; amount_minor: number | null; currency: string | null }

/** Premium = server-recorded active developer grant, trial or subscription. Never derived on the client alone. */
export function isEntitlementActive(e: Entitlement, now = Date.now()): boolean {
  if (e.status !== "active" && e.status !== "cancelled") return false;
  if (e.kind === "developer") return e.status === "active" && e.expires_at === null;
  return e.expires_at !== null && new Date(e.expires_at).getTime() > now;
}

export function useEntitlement() {
  const { user, loading: authLoading } = useAuth();
  const [ents, setEnts] = useState<Entitlement[] | null>(null);
  const refresh = useCallback(async () => {
    if (!user) { setEnts([]); return; }
    const { data } = await supabase.from("user_entitlements").select("kind,status,expires_at,plan_code,amount_minor,currency");
    setEnts((data as Entitlement[]) ?? []);
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const loading = authLoading || ents === null;
  const hasPremium = !!ents?.some((e) => isEntitlementActive(e));
  return { user, ents: ents ?? [], loading, hasPremium, refresh };
}
