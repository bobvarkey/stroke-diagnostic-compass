# Audit: PWA / Billing spec vs. `main` @ ac6d6be

Date: 2026-10-09
Scope: read-only audit of `stroke-diagnostic-compass` on `main` (worktree `C:\Users\bobva\stroke-billing`, commit `ac6d6be`).
Method: six independent read-only auditors, one per spec area. No files modified by the audit.

This document reports **what already exists** and **what is genuinely missing**, which the spec
requires before any fix. Nothing here has been changed yet.

---

## Verdict table

| # | Spec area | Verdict | Most severe gap |
|---|---|---|---|
| 1 | Razorpay Subscriptions path | EXISTS (with defects) | Dedupe row is written **before** the entitlement upsert — a failed write permanently loses a paying customer's access |
| 2 | Webhook reachability | AT RISK | `billing-webhook` is not declared in `supabase/config.toml`; if `verify_jwt` defaults true, every Razorpay call 401s |
| 3 | Entitlements / RLS boundary | PARTIAL | `has_premium_access()` exists but is referenced by **zero** policies and **zero** code — the paywall is the boundary |
| 4 | Paid AI functions | MISSING gate | Any signed-in user can invoke `analyze-document` / `extract-lab-values` and burn the paid API key |
| 5 | Developer access | Recognition EXISTS, **grant MISSING** | The row can only be inserted by hand; no server function exists. `AGENTS.md` describes one that does not exist |
| 6 | Restore by email | **MISSING entirely** | No OTP, magic-link, or reset flow of any kind |
| 7 | Trial | EXISTS | No trial→paid link, no first-charge disclosure, no `start_at` |
| 8 | Pricing | WRONG vs spec | `$50/yr` not `$29.99/yr`; annual is not the default; INR amounts are frontend-only constants |
| 9 | Banner | PARTIAL | Does not hide after checkout without a manual reload |
| 10 | Account page | PARTIAL | No amount, no currency, no human plan name |
| 11 | PWA manifest | EXISTS | Brand mismatch only (`Stroke Companion` vs `StrokeSuite ID`) |
| 12 | SW caching rules | EXISTS — safe | None. Only HTML/JS/CSS precached; no API/auth/payment caching |
| 13 | SW update UX | WRONG | Silent `autoUpdate`, zero update prompt — the app can swap under a clinician mid-entry |
| 14 | Offline / Dexie | PARTIAL | A failed push can be overwritten and stamped `synced`, silently discarding an un-uploaded clinical edit |
| 15 | Auth | EXISTS | Session tokens land in `localStorage` (supabase-js default), not IndexedDB |

**Headline:** the billing *plumbing* is largely built and its security invariants hold
(secrets server-side, service-role-only writers, HMAC over raw body, RLS read-own).
The gaps are concentrated in three places: **the webhook can lose entitlements**,
**the server predicate is not wired to anything**, and **restore/pricing/developer-grant
were never built**.

---

## What already EXISTS (do not rebuild)

**Razorpay Subscriptions — not one-time orders.** `billing-create-subscription/index.ts:17`
POSTs `/v1/subscriptions`; the browser sends only `z.enum(["stroke_monthly","stroke_yearly"])`
(`:4`). Plan id resolves from env (`_shared/billing.ts:8-9`, `:14`); price, currency and user id
are never accepted from the client. `user_id` comes from `requireUser(req)` (`:8`).

**Secrets stay server-side.** `RAZORPAY_KEY_ID` / `_SECRET` / `_WEBHOOK_SECRET` are read via
`Deno.env.get` only. No `VITE_` variable holds a secret. `.env` carries only the Supabase anon key.

**Webhook signature handling is correct in shape.** `billing-webhook/index.ts:9` reads the raw
body with `req.text()` *before* parsing (`:14`); HMAC-SHA256 compared via a constant-time
XOR-accumulate loop (`_shared/billing.ts:41-46`); mismatches return 400 with no write (`:11`).
No user JWT is accepted. `subscription.activated | charged | cancelled | halted | completed`
are all mapped (`:24-28`).

**Checkout verify is separate and grants nothing.** `billing-verify/index.ts:10` states
"Grants NO lasting access — the webhook is the source of truth" and writes nothing.

**No client can write entitlements.** `user_entitlements` has a SELECT-only policy
(`drizzle/migrations/0000_user_entitlements.sql:19`, RLS enabled `:18`, `GRANT SELECT` to
`authenticated` `:16`). All writers are service-role edge functions.

**Trial — one per account, server-side.** Pre-check at `billing-start-trial/index.ts:9-10`
(409 on reuse), hard guarantee by `UNIQUE (user_id, kind)` (`0000:14`, `0001:10`), duration
exactly 72h (`:11`), timestamp from `DEFAULT now()`. Signup itself never charges
(`Account.tsx:19-21`). `payment.failed` is not mapped, so a failed payment cannot mark a
user paid.

**Banner gating + no flash.** `HomePaywall.tsx:9-12` renders "Checking access…" while
`loading` and only shows pricing for a signed-in user with no active entitlement — no
flash on load.

**PWA manifest + caching discipline.** All 7 required manifest fields present
(`vite.config.ts:20-34`); icons verified dimensionally by parsing PNG IHDR (192×192, 512×512).
`globPatterns: ["**/*.{html,js,css}"]` (`:37`) precaches only shell assets. The single runtime
rule matches `request.mode === "navigate"` only (`:41-43`), so Supabase, Razorpay and API
responses are never cached. `registerSW.ts` refuses to register in dev, iframes and preview hosts.

**Offline store.** Real Dexie/IndexedDB store (`patientRecords.ts:18-22`) with all four fields
(`:7-16`), device-first write (`:36` before `:37`), `pending` until confirmed (`:47`),
`sync_status` never set on failure. No Electron/Tauri/SQLite anywhere; Capacitor is a plain
native shell with no conflicting storage plugin.

**Account auth + self-service ID.** Real email sign-in/sign-up (`Account.tsx:19-21`) and the
real `user.id` displayed with a copy button (`:56-58`) — never fabricated.

---

## What is MISSING or WRONG

### A. Highest severity — can lose money or access

**A1. Webhook can permanently drop an entitlement.** `billing-webhook/index.ts:17` inserts the
dedupe row into `razorpay_webhook_events`; `:18` then returns `{ok:true, duplicate:true}` for
*any* insert error; `:34` performs the actual entitlement upsert. If the upsert at `:34` fails
(`:40` → 500), Razorpay retries, hits the already-recorded dedupe row at `:17`, and the retry is
silently swallowed. The customer pays and never receives access.

Related defects in the same function:
- `:18` treats *any* insert error as "duplicate", not just a unique violation.
- `:15` fallback id `evt.event:created_at:sub.id` collides for two same-type events in one second.
- `:34-39` upsert has no ordering/timestamp guard, so a late `subscription.charged` can
  re-activate an already `cancelled`/`halted` subscription.

**A2. Webhook may be unreachable.** `supabase/config.toml` declares `extract-lab-values`,
`stroke-code-caller` and `analyze-document` with `verify_jwt = false`, but **does not declare
`billing-webhook`**. If Supabase's default `verify_jwt = true` applies, Razorpay's JWT-less call
gets a 401 and no entitlement is ever granted. This must be confirmed against the deployed
project and the declaration added regardless.

**A3. The server premium predicate is dead code.** `public.has_premium_access`
(`0000_user_entitlements.sql:22-29` plus `drizzle/schema.ts` stub) is referenced by zero policies
and zero application code. The live decision is made in the browser by `isEntitlementActive`
(`useEntitlement.ts:8-12`). Consequences:
- The paywall is the boundary, which the spec forbids.
- The server copy and the client copy disagree: the client accepts `status='cancelled'`, the
  server does not; neither implements `demo`; the server conflates trial and subscription into
  one anonymous `expires_at > now()` branch with no `kind` check.
- `has_premium_access(_user_id)` never checks `auth.uid() = _user_id` and is never
  `REVOKE`d from PUBLIC — a latent probe of any user's premium status via `rpc()`.

**A4. Premium data surfaces are ungated server-side.**
- `public.patients` is a premium surface (`Patients.tsx:54` gates it client-side only). Its RLS is
  `auth.uid() = created_by` (`20260204001250_...sql:105-117`) with **no entitlement check** — any
  authenticated non-premium user can read and write their own rows via PostgREST.
- `analyze-document` and `extract-lab-values` are auth-only with **no entitlement check**, so any
  signed-in user can invoke the paid `LOVABLE_API_KEY`.
- All clinical module content ships in the client bundle, so it cannot be gated by RLS at all.

### B. Never built

**B1. Developer grant path.** Recognition is correct and UUID-keyed — a row with
`kind='developer', status='active', expires_at IS NULL` (`useEntitlement.ts:10`,
`0000:22-28`). But nothing creates it: no edge function, no admin UI, no SQL script. It is manual
service-role SQL only. `AGENTS.md:14` claims access is granted "by the Razorpay webhook (or
server functions for trial/developer)" — **that is wrong for developer**. The webhook correctly
cannot touch a `developer` row (different `kind`, `onConflict: "user_id,kind"`), so failed charges
never remove it, which is right.

**B2. Restore by email.** Nothing exists — no `resetPasswordForEmail`, `signInWithOtp` or
`verifyOtp` call anywhere; no restore/OTP/recovery endpoint. The only auth methods are password
sign-in and sign-up. `types/compliance.ts:68` has a dead `'auth.password_reset'` enum.

**B3. Annual-as-default.** `Pricing.tsx:46` renders `PLAN_DISPLAY` in declaration order with
monthly first; both cards are equal, with no default, highlight or recommended flag.

**B4. Receipts.** No receipt/invoice code exists, and Razorpay receipts are not surfaced.

### C. Partial / wrong behaviour

**C1. Banner does not hide after checkout.** Every component owns an independent
`useEntitlement` instance (`HomePaywall.tsx:9`, `Pricing.tsx:12`) with local state and no shared
context. On `/`, `HomePaywall` renders `<Pricing/>`; when checkout completes only the *child*
refreshes (`Pricing.tsx:56`, delayed 4s), so the parent stays latched on the paywall until a
reload. The trial path has the same defect (`:39`). No realtime subscription exists anywhere.
This directly violates "without a manual refresh".

**C2. Account page is thin.** Shows `kind` (not `plan_code`), and expiry. `amount_minor` and
`currency` are selected by the hook (`useEntitlement.ts:19`) but never rendered. No line items.

**C3. Silent service-worker update.** `registerType: "autoUpdate"` (`vite.config.ts:15`) plus
`registerSW()` with no `onNeedRefresh`/`onOfflineReady` callbacks (`registerSW.ts:18`; zero hits
repo-wide) means a new SW calls `skipWaiting` + `clientsClaim` and takes over with no prompt and
no defer-until-saved path. There is also no `offline.html` and no offline notice.

**C4. Offline sync can lose an edit.** `patientRecords.ts:55` skips the pull only when
`local.sync_status === "pending" && local.updated_at > sr.updated_at`. If a push failed and the
server copy is newer or equal, `:56` overwrites the un-uploaded local edit and stamps it
`synced` — both losing data and reporting a false sync. Pull errors (`:49`) are also swallowed
with no retry queue.

**C5. Offline locks out paying users.** `useEntitlement` fails closed when offline
(`:19-24` → `hasPremium=false`), so an entitled clinician with no network cannot reach their own
cached records. The local data is also unencrypted, gated only by a React conditional.

**C6. Device-clock expiry.** `isEntitlementActive` compares against `Date.now()`
(`useEntitlement.ts:8-12`), so a rolled-back clock extends perceived access. Server `now()` is
available in `has_premium_access` but unused.

**C7. Pricing contradicts the spec.**
- Spec: outside India, Premium **Annual = $29.99/year** and is the default. Repo has **$50/year**;
  `29.99` appears nowhere.
- `₹500`/`₹5,000` are hardcoded display constants (`src/lib/billing.ts:7-8`); the server catalog
  holds no amounts, so displayed ₹ vs charged ₹ is unguarded and unverifiable.
- No "save 20%" text exists. If added: $5/mo × 12 = $60 vs $50/yr is a **16.7%** saving, not 20%.
  Similarly ₹500 × 12 = ₹6,000 vs ₹5,000/yr is **16.7%**, not 20%.
- Plan IDs are correctly env-sourced, not hardcoded. Good.

**C8. Minor.** Manifest `name: "Stroke Companion"` (`vite.config.ts:21`) disagrees with the HTML
brand "StrokeSuite ID" (`index.html:17,24`). `src/components/AuthScreen.tsx` is a dead
username-based login imported nowhere. `React Query` is wired (`App.tsx:65`) with zero `useQuery`
call sites — the documented server-state cache does not exist.

**C9. Pre-existing, non-premium.** `20260204001250_...sql:97` lets any authenticated user insert a
role (including `admin`) while `user_roles` is empty. `handle_new_user` normally closes this, but
it is a genuine bootstrap weakness. It does not grant premium entitlement.

---

## The three appendix items — NOT done, and why

The pasted text ends with three requests that contradict its own main body and the repo's
`AGENTS.md` ("prevents client-forged entitlements"):

1. Add an email + UUID whitelist to `src/lib/webBilling.ts` and `SubscriptionContext.tsx`.
2. Insert a permanent `web_subscriptions` row for an address with expiry 2099.
3. Add a paywall bypass.

None of those files exist (`src/lib/billing.ts`, `src/hooks/useEntitlement.ts` are the real ones),
and all three are client-side access grants. **Not implemented.** The legitimate version the main
body already sanctions is item **F5** below — a server-side `developer` entitlement keyed to the
real auth UUID, granted admin-only, with nothing in the client.

---

## Fix plan

### Unblocked — no user input required

| # | Fix | Files |
|---|---|---|
| F1 | Webhook: record dedupe **after** the upsert succeeds; treat only unique-violation as duplicate; add an ordering guard so a late `charged` cannot revive a cancelled sub; make the fallback event id collision-safe | `supabase/functions/billing-webhook/index.ts` |
| F2 | Declare `billing-webhook` with `verify_jwt = false` | `supabase/config.toml` |
| F3 | One shared entitlement context so the banner hides immediately after checkout, and the gate can refresh | new `src/hooks/useEntitlementContext.tsx`, `useEntitlement.ts`, `HomePaywall.tsx`, `Pricing.tsx`, `App.tsx` |
| F4 | Account: render `plan_code`, `amount_minor`, `currency` | `src/pages/Account.tsx` |
| F5 | Admin-only `developer` grant (server function + SQL), plus the diagnostic instructions; correct the false claim in `AGENTS.md:14` | new `supabase/functions/billing-grant-developer/`, `AGENTS.md`, `Account.tsx` |
| F6 | Require premium on `analyze-document` and `extract-lab-values` | both functions |
| F7 | Fix the false-`synced` overwrite and add a retry queue | `src/lib/patientRecords.ts` |
| F8 | SW update prompt (`onNeedRefresh`) + an offline notice | `src/lib/registerSW.ts`, `vite.config.ts`, new update component |
| F9 | Wire `has_premium_access` into RLS on `patients`; fix its `kind` conflation, add `demo`, `REVOKE` from PUBLIC, bind to `auth.uid()` | new migration |
| F10 | One-time-code restore flow | new function + `Account.tsx` |
| F11 | Manifest name → "StrokeSuite ID" | `vite.config.ts` |

F9 is the one that needs care: adding an entitlement predicate to `patients` RLS can lock out
existing non-paying users who currently have data. It should ship with that consequence stated
explicitly, not silently.

### Blocked on you

- **The real INR prices and Razorpay Plan IDs** — I will not invent INR amounts. Until these
  arrive, the INR strings stay as they are.
- **`$29.99/yr` vs `$50/yr` and whether annual is the default** — determines what `Pricing.tsx`
  and the banner say, and whether a "save X%" claim may appear at all.
- **Your developer auth user id** — needed to insert the F5 grant. It is *not* fabricated, and I
  will not hardcode it. If you do not have it, it is displayed on `/account` after you register.

---

## Test status

Not yet run. The worktree has no `node_modules` installed, so `lint` / `typecheck` / `knip` / the
Vitest suite cannot execute there until dependencies are installed. The spec's required matrix —
developer sign-in, unpaid block, authorized trial, failed charge, bad webhook signature, RLS
write rejected, banner hide, offline reopen — will be reported per item once the fixes land.

Existing tests on `main`: `src/test/{entitlement,auditService,consentService}.test.ts`.

## Webhook URL

`https://mudqzllcgiyivtlycrms.supabase.co/functions/v1/billing-webhook`
(project id from `supabase/config.toml:1`). Not yet confirmed as deployed.
