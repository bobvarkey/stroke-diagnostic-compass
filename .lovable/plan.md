## Overview
Rebuild the app shell around a Sunset Blaze visual identity and layer in the requested navigation, search, glossary, and image tooling. Work is scoped to frontend/presentation — no backend or clinical logic changes.

## 1. Sunset Blaze design system
- Add semantic tokens in `src/index.css` for the Sunset Blaze palette: coral `#ff6b35`, amber `#f7931e`, magenta `#e84393`, violet `#6c5ce7`.
- Add `--gradient-sunset`, `--shadow-glow-coral`, and update `--primary`, `--accent`, ring, and orb tokens to draw from these.
- Register the gradient + glow utilities in `tailwind.config.ts` so components can consume them semantically (`bg-gradient-sunset`, `shadow-glow`).
- Keep existing dark/light contrast rules intact.

## 2. Home screen
- New `src/pages/Home.tsx` with:
  - Sticky glass header (backdrop blur, gradient underline, brand mark).
  - Hero: gradient wash, glowing brain-with-stroke illustration generated via imagegen, animated orbs.
  - Front-page search box that filters mini-apps and tabs (fuzzy match over the same registry the sidebar uses); results open the target section.
  - Sections: "Calculator library", "Recent history", "Settings" entry cards.
- Route `/` renders Home; existing workup moves to `/workup`. `src/App.tsx` updated accordingly.

## 3. Calculator library
- `src/pages/Calculators.tsx` lists all calculators (NIHSS, GCS, ASPECTS, CTP, ICH, Cangrelor, Tirofiban, UFH, Meds, etc.) as cards.
- Each card opens the existing component in a full-screen dialog for manual entry; results panel appears inline. Reuses existing calculator components — no duplication.

## 4. History screen
- `src/pages/History.tsx` powered by the existing `patients` table. Search across patient_id, name, notes, and clinical_data keys with debounced query. Sort by updated_at, filter by date range.

## 5. Settings screen
- `src/pages/Settings.tsx`: theme toggle, rounding rules (existing), dose unit prefs, sidebar defaults, glossary toggle, sign-out.

## 6. Collapsible, searchable, colorful sidebar
- Refactor `src/components/AppSidebar.tsx`:
  - Groups become collapsible with `open`/`onOpenChange` bound to state persisted in `localStorage` under `sidebar:groups:v1` and `sidebar:collapsed:v1`.
  - Icons already colorful — extend palette to every item.
  - Add a `SidebarInput` search field at the top. Filter items + subsections by fuzzy match on label/keywords.
  - Highlight matching substrings with `<mark class="bg-gradient-sunset/30">`.
  - While search text is non-empty, blur the main content: apply `backdrop-blur-sm` + dim overlay to `SidebarInset`; clear on blur/empty.
  - Persist sidebar `open` state (from `SidebarProvider`) via localStorage.

## 7. Global acronym glossary
- New `src/data/glossary.ts` with entries (NIHSS, LVO, EVT, mRS, IVT, ASPECTS, DAPT, CVT, SAH, ICH, DOAC, UFH, HIT, TICI, CrCl, LKW, tPA, TNK, PCC, FFP, etc.).
- New `src/components/Acronym.tsx`: wraps text in a Radix `HoverCard` (tooltip with short expansion) + `Popover` on click showing full glossary entry with references.
- `src/components/AutoAcronym.tsx` scans children text nodes and wraps known acronyms — opt-in via a provider so we can enable it inside module bodies without touching every string.

## 8. Zoomable / pannable images
- New `src/components/ZoomableImage.tsx` using pinch/scroll zoom + drag pan (lightweight custom impl on a `<img>` inside a full-screen `Dialog`, no new dep). Click any image → open modal with zoom controls (+ / − / reset), mouse-drag or touch-drag pan, mouse-wheel zoom, ESC to close.
- Replace `<img>` usages in clinical modules (SDH infographic, antiplatelet cheat sheet, vascular anatomy assets, etc.) with `ZoomableImage`.

## Technical notes
- No schema or edge function changes.
- Reuse existing routing (`react-router-dom`) — add `/`, `/workup`, `/calculators`, `/history`, `/settings`.
- Hero brain image generated with imagegen premium (glowing brain with stroke lesion, sunset gradient background).
- All colors flow through semantic tokens — zero hardcoded hex in components.
- localStorage keys namespaced under `stroke-app:` to avoid collisions.

## Out of scope
- No changes to clinical calculation logic.
- No backend/RLS changes.
- No new subscription/payment work.

Approve to proceed and I'll build it end-to-end.