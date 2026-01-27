---
phase: 22-unlock-clarity-and-next-actions
plan: 03
subsystem: ui
tags: [vault, unlocks, progress, navigation]

# Dependency graph
requires:
  - phase: 22-01
    provides: Unlock progress detail helpers
  - phase: 22-02
    provides: UnlockHint + NextUnlockPanel UI primitives
provides:
  - Collection-visible Next unlocks panel for upcoming systems
  - Always-on lock requirement rows for locked watch and upgrade cards
  - App-level navigate+scroll helper (`onNavigate`) for single-CTA navigation
affects:
  - 22-04
  - 22-05

# Tech tracking
tech-stack:
  added: []
  patterns:
    - `navigateTo(tabId, scrollTargetId?)` uses activateTab + double-rAF before scrollIntoView

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/ui/tabs/CollectionTab.tsx
    - src/ui/tabs/CatalogTab.tsx
    - src/ui/tabs/StatsTab.tsx
    - src/ui/tabs/WorkshopTab.tsx
    - src/ui/tabs/MaisonTab.tsx
    - src/ui/tabs/NostalgiaTab.tsx
    - src/ui/tabs/CareerTab.tsx

key-decisions:
  - "Keep gating logic unchanged; only surface existing requirement/progress in UI"

patterns-established:
  - "Collection tab renders NextUnlockPanel with CTAs that scroll to #collection-list"
  - "Locked cards render UnlockHint rows with stable test ids locked-item-hint-* / locked-upgrade-hint-*"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 22 Plan 03: Collection Unlock Clarity Integration Summary

**Wired unlock clarity UX into the always-visible Collection tab: a Next unlocks panel, always-on lock requirement rows, and a reusable navigate+scroll helper passed into tabs.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-27T05:41:30Z
- **Completed:** 2026-01-27T05:41:30Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added `navigateTo(tabId, scrollTargetId?)` in `src/App.tsx` using `activateTab` + double `requestAnimationFrame` before `scrollIntoView`.
- Plumbed `onNavigate` into major tabs for Phase 22/24 empty state CTAs.
- Added `NextUnlockPanel` near the top of Collection, showing upcoming systems with a single CTA per entry.
- Added always-on lock explanation rows for locked watch and upgrade cards, including progress and stable test ids.

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run lint` (pass)
- `pnpm -s run test:unit` (pass)

## Decisions Made

- Kept existing gating rules untouched; surfaced progress via selector helpers.

## Next Phase Readiness

Ready for 22-04 (Catalog empty states with a single next-action CTA).

---
*Phase: 22-unlock-clarity-and-next-actions*
*Completed: 2026-01-27*
