# StrokeSuite ID — Architecture Documentation

## Overview

StrokeSuite ID is a cross-platform mobile app (iOS + Android via Capacitor) providing
clinical decision support for acute stroke care. It uses a clean architecture pattern
with clear separation of concerns.

---

## Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Screens  │  │Components│  │  Hooks   │  │Compliance│ │
│  │ (pages)  │  │(reusable)│  │(useAuth) │  │ Screens  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │              │             │              │       │
├───────┴──────────────┴─────────────┴──────────────┴───────┤
│                       VIEW MODELS                         │
│  (Computed state, local storage sync, debounced saves)    │
├───────────────────────────────────────────────────────────┤
│                      USE CASE LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Clinical Calculators • Algorithms • Decision Trees  │  │
│  └──────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                         │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌───────────────┐  │
│  │  Audit  │ │ Consent  │ │  Auth   │ │ Accessibility │  │
│  │ Service │ │ Service  │ │ (Supabase)│ │  Utilities    │  │
│  └─────────┘ └──────────┘ └─────────┘ └───────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌──────────────────────────┐   │
│  │  Local  │ │ Supabase │ │ Analytics (privacy-first) │   │
│  │ Storage │ │  Client  │ │                          │   │
│  └─────────┘ └──────────┘ └──────────────────────────┘   │
├───────────────────────────────────────────────────────────┤
│                     DATA / DOMAIN LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Types      │  │  Interfaces  │  │  Constants      │  │
│  │ (compliance) │  │  (protocols) │  │  (guidelines)   │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### 1. Presentation Layer (`src/pages/`, `src/components/`, `src/compliance/`)

- **Pages:** Route-level components (Index, Preview, NotFound)
- **Components:** Reusable UI (StrokeWorkupChecklist, calculators, etc.)
- **Compliance:** Privacy, Terms, Disclaimer, Settings, Onboarding screens
- **Hooks:** Auth context, theme, toast, mobile detection

**Rules:**
- No direct data access — use hooks, services, or props
- No business logic — delegate to use cases
- Accessibility attributes required on all interactive elements

### 2. View Model Layer (computed state in components)

- Debounced save patterns for patient data
- LocalStorage sync for form persistence (see `useEffect` in Index.tsx)
- UI state management (expanded sections, active tab, edit mode)

### 3. Use Case Layer (clinical calculators embedded in components)

- 65+ clinical calculators (NIHSS, ASPECTS, tPA eligibility, etc.)
- Decision trees and algorithms
- Visual diagrams and reference guides
- PDF report generation (jspdf)

**Rules:**
- All calculations are deterministic (same input → same output)
- Calculations may become outdated — version-tracked content
- No remote dependencies for core calculations (offline capable)

### 4. Service Layer (`src/services/`)

| Service | Responsibility |
|---------|---------------|
| `auditService.ts` | Records auditable actions, persists locally, queryable |
| `consentService.ts` | Manages consent records (grant/revoke/check) |
| `accessibility.ts` | WCAG contrast validation, focus management, ARIA |
| Supabase client | Auth, database, RLS, storage |

### 5. Domain Layer (`src/types/`)

- `compliance.ts`: All compliance, audit, release gate, and consent types
- Constants: Policy versions, data collection schema, analytics event definitions

---

## Key Design Decisions

### Why Capacitor (not React Native or Flutter)?

The existing codebase is React + TypeScript + Vite. Capacitor wraps web views
with native API access. This allows:
- Same codebase for web preview + iOS + Android
- No rewrite of 65+ clinical components
- Progressive enhancement (native features like camera/OCR when needed)

### Why Supabase for Backend?

- Built-in auth with Row-Level Security
- PostgreSQL for patient data
- SOC 2 compliance
- Self-hostable option
- Real-time subscriptions (future)

### Why Local-First?

- Clinical tools must work offline (hospital WiFi is unreliable)
- Patient data stays on device between syncs
- Reduces server load
- Better privacy (data sent only when necessary)

---

## State Management Pattern

```
┌─────────────────────────────┐
│  Supabase Auth State         │  ← useAuth() hook
│  (User, Profile, Role)      │
├─────────────────────────────┤
│  React Query (TanStack)      │  ← Server state cache
│  (Patient data, sync)        │
├─────────────────────────────┤
│  Local Component State        │  ← Forms, UI state
│  (useState, useReducer)      │
├─────────────────────────────┤
│  localStorage                 │  ← Persistence layer
│  (Consents, audit log,       │
│   form drafts, preferences)  │
└─────────────────────────────┘
```

---

## Privacy-by-Design Mapping

| Data Type | Storage | Encryption | Retention | User Control |
|-----------|---------|------------|-----------|--------------|
| Auth credentials | Supabase | TLS + AES-256 | Until account deletion | Delete account |
| Patient data | Supabase + localStorage | TLS + AES-256 | Until user deletes | Export / delete |
| Audit log | localStorage (local) | None (device-level) | 500 entries max | Clear in settings |
| Consent records | localStorage | None (device-level) | Until revoked | Revoke anytime |
| Analytics (opt-in) | Local + backend | TLS | 12 months | Opt-out toggle |

---

## Testing Strategy

| Test Type | Tool | Coverage Target |
|-----------|------|-----------------|
| Unit tests | Vitest | Services, utilities, types |
| Component tests | Vitest + Testing Library | UI components, compliance screens |
| Accessibility | Custom `runContrastAudit()` | All color pairs, focus states |
| Audit | `auditService.query()` | Logged actions match expected |
| E2E | Playwright (optional) | Critical user flows |

---

## File Structure (Key Paths)

```
src/
├── App.tsx                    # Router, providers, compliance gate
├── main.tsx                   # Entry point
├── types/
│   └── compliance.ts          # All compliance/audit/release types
├── services/
│   ├── auditService.ts        # Audit logging
│   ├── consentService.ts      # Consent management
│   └── accessibility.ts       # WCAG utilities
├── compliance/
│   ├── PrivacyScreen.tsx      # Privacy Policy (versioned)
│   ├── TermsScreen.tsx        # Terms of Use (versioned)
│   ├── DisclaimerScreen.tsx   # Disclaimer (versioned)
│   ├── SettingsScreen.tsx     # Settings + consent management
│   └── ComplianceOnboarding.tsx # First-launch consent flow
├── components/                # 65+ clinical UI components
├── hooks/                     # Auth, toast, mobile
├── pages/                     # Routes
└── integrations/supabase/     # Backend client
```

---

## Change Management

- Policy versions are tracked with semver
- Content updates require re-consent (future)
- Audit log captures policy version changes
- Release checklist gates all store submissions
- All clinical algorithm changes reviewed before release

---

*Document version: 1.0.0 · Last updated: 2026-06-03*