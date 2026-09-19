import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculator option buttons on the dark shell.
 * Selected = solid accent + white text (avoids light fill + inherited light labels).
 * Idle = light text on the dark card; dark text if placed on a light teaching panel.
 */
export function calculatorOptionClass(selected: boolean, accent: "red" | "rose" | "violet" = "red") {
  const selectedMap = {
    red: "border-red-600 bg-red-600 text-white",
    rose: "border-rose-600 bg-rose-600 text-white",
    violet: "border-violet-600 bg-violet-600 text-white",
  } as const;
  const idleHover = {
    red: "hover:border-red-300 dark:hover:border-red-600",
    rose: "hover:border-rose-300 dark:hover:border-rose-600",
    violet: "hover:border-violet-300 dark:hover:border-violet-600",
  } as const;
  return cn(
    selected ? selectedMap[accent] : cn("border-slate-200 dark:border-slate-600 text-foreground", idleHover[accent]),
  );
}
