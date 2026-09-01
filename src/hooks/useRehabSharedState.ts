import { useCallback, useEffect, useState } from "react";

export interface RehabSharedState {
  /** Functional Ambulation Category 0-5 */
  fac: number | null;
  /** Chedoke-McMaster arm stage 1-7 */
  cmsa: number | null;
  /** modified Rankin Scale 0-6 */
  mrs: number | null;
  /** Trunk control: unsafe unsupported sitting observed */
  unsafeUnsupportedSitting: boolean;
  /** Speech / swallow / cognition screen results */
  dysphagiaSuspected: boolean;
  communicationImpairment: boolean;
  cognitiveImpairment: boolean;
  /** Complex rehabilitation problems */
  pusherScreenPositive: boolean;
  neglectScreenPositive: boolean;
  apraxiaScreenPositive: boolean;
  shoulderPain: boolean;
  shoulderSubluxation: boolean;
  fatigueSignificant: boolean;
  depressionScreenPositive: boolean;
}

export const DEFAULT_REHAB_STATE: RehabSharedState = {
  fac: null,
  cmsa: null,
  mrs: null,
  unsafeUnsupportedSitting: false,
  dysphagiaSuspected: false,
  communicationImpairment: false,
  cognitiveImpairment: false,
  pusherScreenPositive: false,
  neglectScreenPositive: false,
  apraxiaScreenPositive: false,
  shoulderPain: false,
  shoulderSubluxation: false,
  fatigueSignificant: false,
  depressionScreenPositive: false,
};

const KEY = "stroke-companion:rehab-shared-state";
const EVENT = "rehab-shared-state-change";

function read(): RehabSharedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_REHAB_STATE;
    return { ...DEFAULT_REHAB_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REHAB_STATE;
  }
}

/**
 * Lightweight cross-tab shared state for the Recovery and Pathway modules.
 * Persists to localStorage and syncs every mounted consumer via a window event.
 */
export function useRehabSharedState() {
  const [state, setState] = useState<RehabSharedState>(() =>
    typeof window === "undefined" ? DEFAULT_REHAB_STATE : read()
  );

  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<RehabSharedState>) => {
    const next = { ...read(), ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    setState(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { state, update };
}
