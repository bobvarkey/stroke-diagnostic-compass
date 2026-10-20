# Store launch without Razorpay

## Focused audit
- **FAIL:** Store launches currently share the website’s Razorpay paywall, pricing page and purchase links.
- **PASS:** Access is based on server-recorded trial, subscription, enterprise or developer entitlements; preserve those checks.
- **WARNING:** Apple/Google purchase and restore flows are not implemented. Hiding Razorpay alone does not make the app store-ready.
- **UNKNOWN:** Capacitor is configured, but the actual store packaging method has not been confirmed. No AppBuild integration was found.
- No application code, billing configuration, packages or production data have been changed during this review.

## Proposed experience
- App Store and Google Play versions open an account/access screen without Razorpay prices, checkout buttons or external purchase prompts.
- Keep sign-in, existing access status and the existing one-time 3-day trial. Eligible accounts enter the workspace normally.
- Accounts without access remain restricted; removing the payment display does not unlock premium content.
- Website and browser-installed versions retain their current Razorpay paywall, prices and checkout.
- Do not add Apple/Google billing, new packages, or publish anything in this change.

## Technical details and files
Use the existing Capacitor native-runtime API, not phone screen size, user agent, URL parameters or a user-editable access flag. If store packaging uses AppBuild instead, its documented launch signal must be confirmed before implementation.

| Proposed file | Change and protection |
|---|---|
| `src/lib/distribution.ts` (new) | Central presentation-only native-runtime detection; never grants entitlements. |
| `src/components/HomePaywall.tsx` | Native account/access presentation without Razorpay; preserve website presentation and access checks. |
| `src/components/PlanCards.tsx` | Prevent plan purchases from rendering in native launches; keep web plans unchanged. |
| `src/pages/Pricing.tsx` | Native access screen instead of Razorpay pricing, including direct navigation. |
| `src/pages/Account.tsx` | Suppress Razorpay purchase/change/cancel controls in native launches; retain sign-in, status, trial and records. |
| `src/components/PremiumGate.tsx` | Native access wording without an external purchase prompt; retain premium checks. |
| `src/pages/Team.tsx` | Remove native purchase prompts while preserving team eligibility. |
| `src/lib/billing.ts` | Reject native Razorpay checkout before subscription creation or script loading; leave website payment behavior unchanged. |
| `src/test/distribution.test.ts` (new) | Test iOS/Android purchase suppression and browser billing availability. |
| `AGENTS.md`, `roadmap.md` | Record the presentation boundary and verification tasks. |

## Validation and configuration
- Run focused tests for native purchase suppression and unchanged entitlement rules.
- Check web paywall/pricing and native-mode home, pricing, account and team screens, including direct links.
- Confirm native attempts do not create Razorpay subscriptions or load checkout scripts.
- No backend or payment-dashboard changes are required for hiding Razorpay.
- Actual store-package testing remains necessary. Apple/Google billing and any required dashboard configuration remain a separate task.

## Approval
Approve this limited change to hide Razorpay in the existing Capacitor store launches, without changing website billing or granting free access.