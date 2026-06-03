# Release Checklist — StrokeSuite ID

**Version:** 1.0.0 | **Build:** 1 | **Date:** 2026-06-03

---

## 🟢 Accessibility Gates

| # | Gate | Status | Notes |
|---|------|--------|-------|
| A1 | All core screens pass WCAG AA contrast (4.5:1 normal text) | ☐ | Run `accessibility.runContrastAudit()` |
| A2 | All form inputs have visible labels | ☐ | |
| A3 | Focus indicators visible on all interactive elements | ☐ | CSS `focus-visible` styles applied |
| A4 | Skip-to-content navigation available | ☐ | Keyboard users |
| A5 | Screen reader announcements for dynamic content | ☐ | `announceToScreenReader()` calls |
| A6 | Dark/light theme contrast validated | ☐ | Both themes pass AA |
| A7 | No critical accessibility defects | ☐ | **BLOCKER IF FAIL** |
| A8 | `prefers-reduced-motion` respected | ☐ | |
| A9 | `prefers-contrast: more` respected | ☐ | |
| A10 | Touch targets >= 44x44px on mobile | ☐ | Apple HIG, Material Design |

## 🔵 Privacy Gates

| # | Gate | Status | Notes |
|---|------|--------|-------|
| P1 | Privacy Policy screen available and versioned | ☐ | v1.0.0 |
| P2 | Data collection map matches actual app behavior | ☐ | Survey all data fields |
| P3 | No undisclosed data collection | ☐ | **BLOCKER IF FAIL** |
| P4 | Analytics collection is opt-in (default off) | ☐ | |
| P5 | Consent records are persisted and auditable | ☐ | |
| P6 | Data export flow works end-to-end | ☐ | Settings → Export |
| P7 | Account deletion flow works end-to-end | ☐ | Settings → Delete |
| P8 | Privacy disclosures match store listings | ☐ | App Store & Play Store |
| P9 | Third-party data sharing disclosed | ☐ | Supabase only |

## 🟡 Consent Gates

| # | Gate | Status | Notes |
|---|------|--------|-------|
| C1 | Onboarding consent flow collects all required consents | ☐ | |
| C2 | No pre-checked consent boxes | ☐ | **BLOCKER IF FAIL** |
| C3 | Consent can be revoked in Settings at any time | ☐ | |
| C4 | Policy version changes trigger re-consent | ☐ | |
| C5 | Consent audit trail is recorded | ☐ | |

## 🔴 Security Gates

| # | Gate | Status | Notes |
|---|------|--------|-------|
| S1 | All API traffic uses HTTPS/TLS 1.3 | ☐ | |
| S2 | Data encrypted at rest (AES-256) | ☐ | Supabase default |
| S3 | Authentication requires minimum 8-char password with complexity | ☐ | |
| S4 | Session tokens expire appropriately | ☐ | |
| S5 | Audit logging for sensitive actions enabled | ☐ | |
| S6 | Row-level security enforced on all tables | ☐ | Supabase RLS |
| S7 | No secrets/keys in client-side code | ☐ | |

## 🟠 Content & Claims Gates

| # | Gate | Status | Notes |
|---|------|--------|-------|
| K1 | No "guaranteed," "perfect accuracy," or similar unsupported claims | ☐ | **BLOCKER IF FAIL** |
| K2 | All clinical content cites published guidelines or literature | ☐ | |
| K3 | Disclaimer screens use clear, non-legalistic language | ☐ | |
| K4 | Onboarding copy consistent with store listing and policy copy | ☐ | |
| K5 | High-risk/regulated content reviewed by clinical reviewer | ☐ | |
| K6 | Store listing does not claim medical device status | ☐ | **BLOCKER IF FAIL** |

## 🟣 Store Compliance Gates (Apple App Store)

| # | Gate | Status | Notes |
|---|------|--------|-------|
| AS1 | App Store Connect privacy answers match app behavior | ☐ | |
| AS2 | Privacy Policy URL entered in App Store Connect | ☐ | |
| AS3 | Terms of Use URL entered in App Store Connect | ☐ | |
| AS4 | App category correctly set (Medical / Health & Fitness) | ☐ | |
| AS5 | Age rating accurately reflects content | ☐ | 17+ for medical reference? |
| AS6 | Screenshots show real app UI | ☐ | |
| AS7 | No placeholder text in production screenshots | ☐ | |
| AS8 | Export compliance (EAR) declared | ☐ | |

## 🟣 Store Compliance Gates (Google Play Store)

| # | Gate | Status | Notes |
|---|------|--------|-------|
| GP1 | Data Safety section matches actual data collection | ☐ | |
| GP2 | Health & Fitness app declaration completed | ☐ | |
| GP3 | Target audience and content ratings accurate | ☐ | |
| GP4 | No misleading health/medical claims in listing | ☐ | **BLOCKER IF FAIL** |
| GP5 | Privacy Policy accessible from Play Console | ☐ | |
| GP6 | App binary uses targetSdkVersion >= 34 | ☐ | |

## ⚪ Pre-Submission Final Checks

| # | Gate | Status | Notes |
|---|------|--------|-------|
| F1 | Build is signed with production certificate | ☐ | |
| F2 | Debug code, logs, and dev tools removed | ☐ | |
| F3 | Version numbers consistent across config | ☐ | |
| F4 | No console.log statements in production JS | ☐ | |
| F5 | Splash screen and icon are final | ☐ | |
| F6 | Offline fallback states work correctly | ☐ | |
| F7 | Error boundaries catch unhandled errors | ☐ | |
| F8 | Rate limiting applied to auth endpoints | ☐ | |
| F9 | Feature flags disable in-development features | ☐ | |
| F10 | Release notes drafted and reviewed | ☐ | |

---

## Sign-off

**Release Manager:** _________________ **Date:** _________________

**Clinical Reviewer:** _________________ **Date:** _________________

**Legal Reviewer:** _________________ **Date:** _________________

---

*This checklist is version-controlled. All items must be ☐ (checked) or explicitly waived with documented reason before submission.*