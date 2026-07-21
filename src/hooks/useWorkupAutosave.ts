import { useEffect, useRef, useState } from "react";

export type WorkupSnapshot = {
  checkedItems: string[];
  strokeHistoryFactors: Record<string, boolean>;
  demographics: Record<string, unknown>;
  calculatedScores: Record<string, unknown>;
  expandedSections: string[];
  activeTab: string;
  activeSectionId: string;
  savedAt: string;
};

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface Options {
  patientId: string;
  snapshot: WorkupSnapshot;
  /** DB writer — called with the merged clinical_data payload */
  onPersist?: (data: { workup: WorkupSnapshot }) => Promise<void> | void;
  /** Skip DB persistence (e.g. demo patient) but still keep localStorage */
  disableRemote?: boolean;
  debounceMs?: number;
}

const key = (patientId: string) => `stroke-workup:${patientId || "default"}`;

/** Load a saved snapshot from localStorage; falls back to null if absent/invalid. */
export function loadWorkupSnapshot(patientId: string): WorkupSnapshot | null {
  try {
    const raw = localStorage.getItem(key(patientId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkupSnapshot;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Debounced autosave for the workup checklist.
 * - Writes to localStorage on every change (fast, refresh-safe).
 * - Calls `onPersist` after `debounceMs` for cross-device sync via DB.
 */
export function useWorkupAutosave({
  patientId,
  snapshot,
  onPersist,
  disableRemote,
  debounceMs = 1500,
}: Options) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const firstRun = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip the initial mount save — hydration should not mark the state dirty.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setStatus("saving");

    // 1) Immediate local persistence (survives refresh even before debounce fires)
    try {
      const payload: WorkupSnapshot = { ...snapshot, savedAt: new Date().toISOString() };
      localStorage.setItem(key(patientId), JSON.stringify(payload));
    } catch (err) {
      console.warn("[autosave] localStorage write failed", err);
    }

    // 2) Debounced remote persistence for cross-device sync
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        if (!disableRemote && onPersist) {
          await onPersist({
            workup: { ...snapshot, savedAt: new Date().toISOString() },
          });
        }
        setLastSaved(new Date());
        setStatus("saved");
      } catch (err) {
        console.error("[autosave] remote save failed", err);
        setStatus("error");
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(snapshot), patientId, disableRemote]);

  return { status, lastSaved };
}
