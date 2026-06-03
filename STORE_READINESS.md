# Store Readiness Guide — StrokeSuite ID

> How to configure App Store Connect and Google Play Console for a Medical / Health
> clinical decision support app that does NOT claim medical device status.

---

## Apple App Store

### App Store Connect — Privacy

Open **App Store Connect → My Apps → [App] → App Privacy**.

Set each data type to match the table below:

| Data Type | Collected? | Linked to User? | Purpose |
|-----------|-----------|----------------|---------|
| Name / Account ID | Yes (username) | Yes | Account creation, authentication |
| Email Address | No (username proxy) | No | Not directly collected |
| Health / Medical Data | Yes (patient data) | Yes | Core app functionality |
| Usage Data | Optional | No | Analytics (opt-in) |
| Diagnostics / Crash Data | Yes | No | Performance monitoring, crash reporting |
| Device ID | Yes | No | Analytics, crash reporting |
| Product Interaction | Optional | No | Analytics (opt-in) |

**Privacy Policy URL:** `https://strokesuite.app/privacy`

**App Tracking Transparency:** Not applicable (no tracking for advertising).

**Sign in with Apple:** Recommended if implemented.

### App Store Connect — Pricing & Availability

- **Price:** Free (or as determined by developer)
- **Availability:** All territories (or as desired)

### App Store Connect — App Information

- **Category:** Medical
- **Secondary Category:** (leave blank or Education)
- **Age Rating:** 12+ (medical reference content, no explicit material)
  - *Consider 17+ if patient cases with identifiable details can be shared*

### App Store Connect — Version Information

- **Keywords:** stroke, neurology, NIHSS, ASPECTS, clinical decision support, tPA, thrombectomy, cerebrovascular
- **Support URL:** `https://strokesuite.app/support`
- **Marketing URL:** `https://strokesuite.app`

### Screenshot Requirements

- Provide 6.7" and 6.5" screenshots for iPhone
- Provide 12.9" and 11" screenshots for iPad (if iPad version exists)
- No placeholder data in screenshots
- Show real app UI with sample clinical data
- Include a screenshot of the disclaimer/compliance screen

### Export Compliance

- Select **"Yes"** for contains encryption
- Select **"Yes, but exempt"** (uses standard HTTPS/TLS only, no custom crypto)
- Or select "No" if app does not include encryption

---

## Google Play Store

### Play Console — Data Safety

Open **Play Console → [App] → App content → Data safety**.

Fill each section:

| Category | Data Type | Collected? | Shared? | Used For |
|----------|-----------|-----------|---------|----------|
| **Personal Info** | Name (username) | Yes | No | App functionality |
| **Personal Info** | User IDs | Yes | No | App functionality, analytics |
| **Health & Fitness** | Health data (clinical) | Yes | No | App functionality |
| **Device IDs** | Device or other IDs | Yes | No | Analytics, fraud prevention |
| **App Activity** | App interactions | Optional | No | Analytics (opt-in) |
| **App Activity** | Crash logs | Yes | No | Analytics |
| **App Activity** | Diagnostics | Yes | No | Analytics |

### Play Console — App Content

**Health & Fitness App Declaration:**

- Check: "Yes, my app is a health and fitness app"
- Data types: Health data (clinical) — collected
- Commitment: Data encrypted in transit and at rest, deletion available

**Target Audience:**

- Age: 18+ only (healthcare professionals)
- Content: Medical/health reference

**Rating Questionnaire:**

- Complete the content rating questionnaire honestly
- Indicate medical reference content

### Play Console — Store Listing

**Short Description (80 chars max):**
> Clinical stroke decision support for healthcare professionals.

**Full Description:**
> StrokeSuite ID is a clinical decision support tool for healthcare professionals involved in acute stroke care. Features include:
>
> • NIHSS Calculator with serial tracking
> • ASPECTS scoring (anterior & posterior circulation)
> • tPA eligibility checklist with contraindications
> • Thrombolytic and antithrombotic dosing calculators
> • LVO decision dashboard and EVT eligibility
> • Stroke code system and acute algorithm
> • Comprehensive workup checklist
> • ICH scores, SAH scales, CVT management
> • And 50+ more clinical calculators
>
> DISCLAIMER:
> This app is NOT a medical device. It is NOT cleared by the FDA, EMA, or CDSCO. It is a clinical reference and educational tool. All clinical decisions must be made by qualified healthcare professionals using independent clinical judgment.
>
> Privacy Policy: https://strokesuite.app/privacy
> Terms of Use: https://strokesuite.app/terms

### Graphic Assets

- **Icon:** 512x512px, transparent or white background preferred
- **Feature Graphic:** 1024x500px
- **Screenshots:** 2-8 phone screenshots, 2-8 tablet screenshots if applicable
- **Promo Video:** Optional, 30s max

---

## Consistency Checklist

Ensure copy is **identical** across these surfaces:

| Surface | Primary Message | Disclaimers |
|---------|----------------|-------------|
| App Store description | Clinical decision support tool | Not a medical device |
| Play Store description | Clinical decision support tool | Not a medical device |
| In-app onboarding | Reference/educational tool | Not a substitute for clinical judgment |
| Privacy Policy | Discloses all data collection | Third-party sharing |
| Terms of Use | Professional use, no medical advice | Limitation of liability |
| Disclaimer screen | Not FDA cleared | Cross-check guidelines |
| In-app Settings legal links | Links to above | Version shown |

---

## Pre-Submission Checklist

### Before App Store Upload (via Xcode / Transporter)

- [ ] Build uses distribution certificate (not development)
- [ ] Version and build numbers incremented
- [ ] All `console.log` statements removed from production bundle
- [ ] Debug flags set to `false`
- [ ] App icon and all asset catalogs present
- [ ] Launch screen configured
- [ ] Push notification entitlements (if used) are set up
- [ ] Associated domains (if used) verified

### Before Play Store Upload (via Android Studio / aab)

- [ ] Build is signed with production keystore
- [ ] `versionCode` and `versionName` in `build.gradle` correctly set
- [ ] ProGuard/R8 rules applied
- [ ] No debug logs or test API keys
- [ ] `.aab` file generated (not `.apk`)
- [ ] Play App Signing configured

### After Submission

- [ ] App review email/in-app contact ready for reviewer questions
- [ ] Demo credentials prepared (if reviewer account type needed)
- [ ] Backup reviewer contact designated
- [ ] Monitoring for review outcome (24-48h typical for updates)
- [ ] Plan for rejection: fix and resubmit within 24h

---

## Post-Release Monitoring (First 7 Days)

- [ ] Crash-free rate > 99.5%
- [ ] No ANR (Android Not Responding) reports
- [ ] Privacy/consent flows working as expected
- [ ] User feedback reviewed daily
- [ ] No unexpected data collection detected
- [ ] Load times < 2s on average connection
- [ ] Offline mode functioning correctly

---

*Document version: 1.0.0 · Last updated: 2026-06-03*