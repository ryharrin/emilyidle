---
phase: 22-unlock-clarity-and-next-actions
plan: 02
subsystem: ui
tags: [unlocks, progress, components]

# Dependency graph
requires:
  - phase: 22-01
    provides: Unlock progress detail helpers
provides:
  - Reusable UnlockHint primitive (reason + progress + optional CTA)
  - Reusable NextUnlockPanel for upcoming unlocks
  - Reusable EmptyStateCTA for single-action empty states
affects:
  - 22-03
  - 22-04

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Shared unlock hint UI uses existing teaser progress bar styles

key-files:
  created:
    - src/ui/components/UnlockHint.tsx
    - src/ui/components/NextUnlockPanel.tsx
    - src/ui/components/EmptyStateCTA.tsx
    - tests/unlock-components.unit.test.tsx
  modified:
    - src/style.css

key-decisions:
  - "Use simple, panel-aligned markup (cards + card-stack) to match existing UI styling"

patterns-established:
  - "next unlocks panel uses data-testid next-unlocks and next-unlock-{id} rows"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 22 Plan 02: Shared Unlock Components Summary

**Added shared UI primitives for unlock clarity: a reusable UnlockHint row, a Next unlocks panel, and a single-CTA empty state component.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-27T05:29:27Z
- **Completed:** 2026-01-27T05:29:27Z
- **Tasks:** 2
- **Files created:** 4
- **Files modified:** 1

## Accomplishments

- Implemented `UnlockHint` to render requirement text, current/threshold progress, percent complete, a progress bar, and an optional CTA.
- Implemented `NextUnlockPanel` to render a panel of upcoming unlock hints with stable test ids.
- Implemented `EmptyStateCTA` for consistent empty state messaging with one clear action.
- Added minimal CSS for unlock hint spacing/layout and unit tests proving rendering + CTA wiring.

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run lint` (pass)
- `pnpm -s run test:unit` (pass)

## Decisions Made

- Kept the components fully reusable (no imports from `src/App.tsx`).

## Next Phase Readiness

Ready for 22-03 (integrate next unlocks panel + lock reasons into Vault).

---
*Phase: 22-unlock-clarity-and-next-actions*
*Completed: 2026-01-27*
