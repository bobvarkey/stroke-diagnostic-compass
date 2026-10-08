export type TabColor =
"blue" | "cyan" | "teal" | "emerald" | "green" | "sky" | "amber" | "orange" | "rose" | "red" | "purple" | "violet" | "pink";

/**
 * Literal class strings per colour so Tailwind's scanner can see every
 * utility. Inactive tabs keep a soft tint plus a matching border; the active
 * tab fills solid with white text, mirroring the main condition tabs. The
 * explicit dark:* active rules keep white text winning over the dark-mode
 * tinted label.
 */
const TAB_TONES: Record<TabColor, string> = {
  blue: "border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:border-blue-600 dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white",
  cyan: "border-cyan-500/40 bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/25 data-[state=active]:border-cyan-600 data-[state=active]:bg-cyan-600 data-[state=active]:text-white dark:data-[state=active]:border-cyan-600 dark:data-[state=active]:bg-cyan-600 dark:data-[state=active]:text-white",
  teal: "border-teal-500/40 bg-teal-500/15 text-teal-700 dark:text-teal-400 hover:bg-teal-500/25 data-[state=active]:border-teal-600 data-[state=active]:bg-teal-600 data-[state=active]:text-white dark:data-[state=active]:border-teal-600 dark:data-[state=active]:bg-teal-600 dark:data-[state=active]:text-white",
  emerald: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:border-emerald-600 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white",
  green: "border-green-500/40 bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 data-[state=active]:border-green-600 data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:border-green-600 dark:data-[state=active]:bg-green-600 dark:data-[state=active]:text-white",
  sky: "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-400 hover:bg-sky-500/25 data-[state=active]:border-sky-600 data-[state=active]:bg-sky-600 data-[state=active]:text-white dark:data-[state=active]:border-sky-600 dark:data-[state=active]:bg-sky-600 dark:data-[state=active]:text-white",
  amber: "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 data-[state=active]:border-amber-600 data-[state=active]:bg-amber-600 data-[state=active]:text-white dark:data-[state=active]:border-amber-600 dark:data-[state=active]:bg-amber-600 dark:data-[state=active]:text-white",
  orange: "border-orange-500/40 bg-orange-500/15 text-orange-700 dark:text-orange-400 hover:bg-orange-500/25 data-[state=active]:border-orange-600 data-[state=active]:bg-orange-600 data-[state=active]:text-white dark:data-[state=active]:border-orange-600 dark:data-[state=active]:bg-orange-600 dark:data-[state=active]:text-white",
  rose: "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-400 hover:bg-rose-500/25 data-[state=active]:border-rose-600 data-[state=active]:bg-rose-600 data-[state=active]:text-white dark:data-[state=active]:border-rose-600 dark:data-[state=active]:bg-rose-600 dark:data-[state=active]:text-white",
  red: "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25 data-[state=active]:border-red-600 data-[state=active]:bg-red-600 data-[state=active]:text-white dark:data-[state=active]:border-red-600 dark:data-[state=active]:bg-red-600 dark:data-[state=active]:text-white",
  purple: "border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-400 hover:bg-purple-500/25 data-[state=active]:border-purple-600 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=active]:border-purple-600 dark:data-[state=active]:bg-purple-600 dark:data-[state=active]:text-white",
  violet: "border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-400 hover:bg-violet-500/25 data-[state=active]:border-violet-600 data-[state=active]:bg-violet-600 data-[state=active]:text-white dark:data-[state=active]:border-violet-600 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white",
  pink: "border-pink-500/40 bg-pink-500/15 text-pink-700 dark:text-pink-400 hover:bg-pink-500/25 data-[state=active]:border-pink-600 data-[state=active]:bg-pink-600 data-[state=active]:text-white dark:data-[state=active]:border-pink-600 dark:data-[state=active]:bg-pink-600 dark:data-[state=active]:text-white",
};

export function tabColor(color: TabColor): string {
  return `rounded-lg border transition-all ${TAB_TONES[color]} data-[state=active]:shadow-lg`;
}
