import { useEffect, useState } from "react";
import { publish } from "@/lib/ivtPlan";
import { readJSON } from "@/lib/strokePlan";
import { EMPTY_PATHWAYS, PATHWAYS_EVENT, PATHWAYS_KEY, type TreatmentPathways } from "@/lib/treatmentPathways";

export function useTreatmentPathways() {
  const [state, setState] = useState<TreatmentPathways>(() => readJSON<TreatmentPathways>(PATHWAYS_KEY) ?? EMPTY_PATHWAYS);
  useEffect(() => {
    const sync = () => setState(readJSON<TreatmentPathways>(PATHWAYS_KEY) ?? EMPTY_PATHWAYS);
    window.addEventListener(PATHWAYS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(PATHWAYS_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const update = <K extends keyof TreatmentPathways>(key: K, value: TreatmentPathways[K]) => {
    const current = readJSON<TreatmentPathways>(PATHWAYS_KEY) ?? EMPTY_PATHWAYS;
    const next = { ...current, [key]: value };
    setState(next);
    publish(PATHWAYS_KEY, PATHWAYS_EVENT, next);
  };
  return { state, update };
}