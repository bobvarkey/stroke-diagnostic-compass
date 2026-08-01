import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "app-font-scale";
export const MIN_SCALE = 0.85;
export const MAX_SCALE = 1.5;
export const DEFAULT_SCALE = 1;

const clamp = (v: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));

export function readFontScale(): number {
  if (typeof window === "undefined") return DEFAULT_SCALE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? Number.parseFloat(raw) : NaN;
  return Number.isFinite(parsed) ? clamp(parsed) : DEFAULT_SCALE;
}

/** Scales the root rem unit so every rem-based size grows proportionally (layout stays intact). */
export function applyFontScale(scale: number) {
  if (typeof document === "undefined") return;
  const value = clamp(scale);
  document.documentElement.style.fontSize = `${value * 100}%`;
  document.documentElement.dataset.fontScale = value.toFixed(2);
}

/** Call once at startup, before first paint, to avoid a flash of unscaled text. */
export function initFontScale() {
  applyFontScale(readFontScale());
}

export function useFontScale() {
  const [scale, setScaleState] = useState<number>(() => readFontScale());

  useEffect(() => {
    applyFontScale(scale);
    window.localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scale]);

  const setScale = useCallback((value: number) => setScaleState(clamp(value)), []);
  const increase = useCallback(() => setScaleState((s) => clamp(Number((s + 0.1).toFixed(2)))), []);
  const decrease = useCallback(() => setScaleState((s) => clamp(Number((s - 0.1).toFixed(2)))), []);
  const reset = useCallback(() => setScaleState(DEFAULT_SCALE), []);

  return { scale, setScale, increase, decrease, reset };
}
