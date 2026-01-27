---
phase: 23-prestige-confirmation-and-re-onboarding
plan: 03
subsystem: ui
tags: [prestige, onboarding, playwright]

# Dependency graph
requires:
  - phase: 23-02
    provides: prestige summaries wired into confirmations
provides:
  - Post-prestige onboarding modal with one recommended next action
  - Playwright coverage proving safe back-out + onboarding for Workshop/Maison/Nostalgia
affects:
  - 24-01

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Detect prestige events at the App purchase boundary via detectPrestigeEvent(prev,next,now,override)"
    - "Prestige CTAs pass tier metadata so Maison prestige requires no heuristics"
    - "Playwright specs freeze RAF to keep currency/enjoyment comparisons deterministic"

key-files:
  created:
    - src/ui/prestigeOnboarding.ts
    - src/ui/components/PrestigeOnboardingModal.tsx
    - tests/prestige-onboarding.unit.test.ts
    - tests/prestige-confirmation.spec.ts
  modified:
    - src/App.tsx
    - tests/nostalgia-prestige.spec.ts
    - src/style.css

key-decisions:
  - "Maison prestige detection is override-only; tier metadata is required to avoid brittle heuristics"
  - "Modal cards are scrollable to keep confirmation actions reachable on small viewports"

patterns-established:
  - "After any prestige, surface a single recommended next action without changing persisted state"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 23 Plan 03: Post-Prestige Onboarding + E2E Coverage Summary

**After any prestige (Atelier/Maison/Nostalgia), the game now shows an immediate re-onboarding modal with one recommended next action, and Playwright proves cancel/back-out safety.**

## Accomplishments

- Added `detectPrestigeEvent` + `getPrestigeOnboardingContent` in `src/ui/prestigeOnboarding.ts` with unit coverage.
- Added `PrestigeOnboardingModal` (global overlay) in `src/ui/components/PrestigeOnboardingModal.tsx`.
- Wired onboarding detection into the App-level purchase boundary (`src/App.tsx`), driven by `{ prestigeTier }` metadata.
- Added `tests/prestige-confirmation.spec.ts` to verify cancel leaves currency/enjoyment unchanged and confirm triggers onboarding.
- Extended `tests/nostalgia-prestige.spec.ts` with cancel/back-out and onboarding modal assertions.

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run test:unit -- tests/prestige-onboarding.unit.test.ts` (pass)
- `pnpm -s run test:e2e` (pass)

---
*Phase: 23-prestige-confirmation-and-re-onboarding*
*Completed: 2026-01-27*
