import { useEffect, useState } from "react";

export const COLLAPSE_ALL_EVENT = "app:collapse-all";
export const EXPAND_ALL_EVENT = "app:expand-all";

/**
 * Drop-in replacement for `useState(false)` on a collapsible's open state.
 * Also listens for global expand-all / collapse-all events so a single
 * pair of buttons can control every collapsible on the page.
 */
export function useCollapsibleState(initial = false): [boolean, (v: boolean) => void] {
  const [isOpen, setIsOpen] = useState<boolean>(initial);

  useEffect(() => {
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    window.addEventListener(EXPAND_ALL_EVENT, open);
    window.addEventListener(COLLAPSE_ALL_EVENT, close);
    return () => {
      window.removeEventListener(EXPAND_ALL_EVENT, open);
      window.removeEventListener(COLLAPSE_ALL_EVENT, close);
    };
  }, []);

  return [isOpen, setIsOpen];
}

export const expandAll = () => window.dispatchEvent(new Event(EXPAND_ALL_EVENT));
export const collapseAll = () => window.dispatchEvent(new Event(COLLAPSE_ALL_EVENT));
