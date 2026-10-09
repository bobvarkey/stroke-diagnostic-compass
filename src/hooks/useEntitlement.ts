import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface Entitlement { kind: string; status: string; expires_at: string | null; plan_code: string | null; amount_minor: number | null; currency: string | null }

/** Premium = server-recorded active developer grant, trial or subscription. Never derived on the client alone. */
export function isEntitlementActive(e: Entitlement, now = Date.now()): boolean {
  if (e.status !== "active" && e.status !== "cancelled") return false;
  if (e.kind === "developer") return e.status === "active" && e.expires_at === null;
  return e.expires_at !== null && new Date(e.expires_at).getTime() > now;
}

export interface EntitlementState {
  user: User | null;
  ents: Entitlement[];
  loading: boolean;
  hasPremium: boolean;
  /** Re-reads the server record. Shared, so a checkout on one screen opens every gate. */
  refresh: () => Promise<void>;
}

/** One provider for the whole app. Separate per-component copies of this state are what left the
 *  home paywall latched after a successful checkout until a manual reload. */
export const EntitlementContext = createContext<EntitlementState | null>(null);

export function useEntitlement(): EntitlementState {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error("useEntitlement must be used inside <EntitlementProvider>");
  return ctx;
}
