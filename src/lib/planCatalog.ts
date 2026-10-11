/** Which price list a visitor is shown. India is priced in rupees; everywhere else, dollars. */
export type Currency = "INR" | "USD";

export type PlanCode =
  | "stroke_monthly"
  | "stroke_yearly"
  | "stroke_monthly_usd"
  | "stroke_yearly_usd"
  | "stroke_enterprise";

export interface PlanDisplay {
  name: string;
  /** Rendered verbatim on the paywall, in checkout and on the receipt — one string, one price. */
  amount: string;
  period: "month" | "year";
  currency: Currency;
}

/** These amounts mirror the Razorpay plans named in the server catalog. Changing one here without
 *  changing the dashboard plan quotes a price the card is not charged, so they must move together. */
export const PLAN_DISPLAY: Record<PlanCode, PlanDisplay> = {
  stroke_monthly: { name: "Stroke Monthly", amount: "₹500", period: "month", currency: "INR" },
  stroke_yearly: { name: "Stroke Yearly", amount: "₹5,000", period: "year", currency: "INR" },
  stroke_monthly_usd: { name: "Stroke Monthly", amount: "$5", period: "month", currency: "USD" },
  stroke_yearly_usd: { name: "Stroke Yearly", amount: "$50", period: "year", currency: "USD" },
  stroke_enterprise: { name: "Enterprise Annual", amount: "$1,000", period: "year", currency: "USD" },
};

/** Enterprise is quoted in dollars for every region, so it is offered *alongside* whichever
 *  individual list the visitor is shown rather than being switched by `plansFor`.
 *
 *  This exact string is load-bearing: `public.has_active_enterprise()` and the
 *  `enterprise_members` seat policies match on `plan_code = 'stroke_enterprise'`. Renaming it here
 *  without renaming it there silently strips access from every Enterprise seat. */
export const STROKE_ENTERPRISE: PlanCode = "stroke_enterprise";
export const ENTERPRISE_PLAN: PlanCode = STROKE_ENTERPRISE;

/** Must match the cap in `public.enforce_enterprise_seats()` (drizzle 0002). Advertising a seat
 *  count the trigger does not allow is a promise the product cannot keep. */
export const ENTERPRISE_SEATS = 50;

export const monthlyPlan = (currency: Currency): PlanCode =>
  currency === "INR" ? "stroke_monthly" : "stroke_monthly_usd";

export const yearlyPlan = (currency: Currency): PlanCode =>
  currency === "INR" ? "stroke_yearly" : "stroke_yearly_usd";

/** Annual first: it is the default option offered, in both currencies. */
export const plansFor = (currency: Currency): PlanCode[] => [yearlyPlan(currency), monthlyPlan(currency)];

/** Percentage saved by paying yearly, derived from the displayed amounts so the badge can never
 *  drift out of step with the prices. Null if the amounts are unparseable. */
export function annualSavingPercent(currency: Currency): number | null {
  const yearly = Number(PLAN_DISPLAY[yearlyPlan(currency)].amount.replace(/[^\d]/g, ""));
  const monthly = Number(PLAN_DISPLAY[monthlyPlan(currency)].amount.replace(/[^\d]/g, ""));
  if (!monthly || !yearly) return null;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}

export interface RegionSignals {
  timeZone?: string | null;
  languages?: readonly (string | undefined)[] | null;
}

/** Two-way branch: India is the only region with a price list of its own. */
export function currencyForRegion({ timeZone, languages }: RegionSignals): Currency {
  const indiaTz = timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta";
  const indiaLang = (languages ?? []).some((l) => typeof l === "string" && /-IN$/i.test(l));
  return indiaTz || indiaLang ? "INR" : "USD";
}

/**
 * A display hint, nothing more. It chooses which price list to render.
 *
 * The amount actually charged is whatever the plan id the server resolves is denominated in, so
 * this cannot change the price — and the server refuses a plan code whose plan id is unset rather
 * than quietly substituting the other currency's plan.
 */
export function preferredCurrency(): Currency {
  if (typeof navigator === "undefined") return "INR";
  let timeZone: string | null = null;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch { /* fall back to the language tags alone */ }
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return currencyForRegion({ timeZone, languages });
}
