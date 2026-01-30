---
phase: 30-workshop-atelier-and-docs
plan: 01
subsystem: ui
tags: [react, selectors, atelier, workshop, prestige]

# Dependency graph
requires:
  - phase: 29-interactions-and-mini-games
    provides: Interaction-ready vault loop and prestige foundations
provides:
  - Atelier next-blueprint progress selector with ETA + cash hint
  - Locked dismantle gating in Workshop/Vault with last-copy safety
  - Prestige legacy multiplier tuned for faster second run
affects: [phase-30-docs]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Selector-driven prestige progress helpers for UI readouts"]

key-files:
  created:
    - src/ui/tabs/WorkshopCraftingSection.tsx
    - tests/workshop-atelier.unit.test.ts
  modified:
    - src/game/selectors/enjoyment.ts
    - src/game/selectors/index.ts
    - src/game/actions/index.ts
    - src/ui/tabs/WorkshopTab.tsx
    - src/ui/tabs/CollectionTab.tsx
    - src/ui/tabs/CatalogTab.tsx
    - tests/maison.unit.test.tsx
    - tests/workshop.unit.test.tsx
    - tests/catalog.unit.test.tsx

key-decisions:
  - "Set first Workshop prestige legacy jump to 2.25x to target ~3x faster second run"

patterns-established:
  - "Atelier progress uses selector-computed thresholds + ETA + cash hint"

# Metrics
duration: 17m
completed: 2026-01-30
---

# Phase 30 Plan 01 Summary

**Atelier now surfaces next-blueprint progress with ETA and cash hints, while dismantle is locked until Atelier unlock and protected by last-copy rules.**

## Performance

- **Duration:** 17m
- **Started:** 2026-01-30T03:25:31Z
- **Completed:** 2026-01-30T03:42:46Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Added next-blueprint progress selector with remaining enjoyment, ETA, and cash-earned hint
- Tuned prestige legacy multiplier for a meaningful first-reset acceleration
- Gated dismantle affordances behind Atelier unlock and enforced last-copy safety in actions + UI

## Task Commits

Each task was committed atomically:

1. **Task 1: Add next-Blueprint progress selector + tune prestige legacy pace** - `5802037` (feat)
2. **Task 2: Gate dismantle + add Atelier progress readout in UI** - `37585aa` (feat)

**Plan metadata:** Pending

## Files Created/Modified
- `src/game/selectors/index.ts` - Workshop next-blueprint progress selector + ETA/cash hint
- `src/game/selectors/enjoyment.ts` - Prestige legacy multiplier jump for first reset
- `src/game/actions/index.ts` - Dismantle last-copy protection
- `src/ui/tabs/WorkshopTab.tsx` - Atelier next-blueprint readout + crafting section extraction
- `src/ui/tabs/WorkshopCraftingSection.tsx` - Crafting/dismantle panel with locked state
- `src/ui/tabs/CollectionTab.tsx` - Pass Atelier unlock gating into catalog purchase panel
- `src/ui/tabs/CatalogTab.tsx` - Dismantle locked placeholder + last-copy disable
- `tests/workshop-atelier.unit.test.ts` - Progress/legacy multiplier coverage
- `tests/maison.unit.test.tsx` - Updated prestige legacy expectations
- `tests/workshop.unit.test.tsx` - Dismantle last-copy rule coverage
- `tests/catalog.unit.test.tsx` - Atelier dismantle flow with unlock + last-copy policy

## Decisions Made
- Set the first Workshop prestige legacy jump to 2.25x to support a ~3x faster second run, while keeping the existing cap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extracted workshop crafting panel into its own component to comply with the 300-line module limit**
- **Found during:** Task 2 (Atelier UI updates)
- **Issue:** `WorkshopTab.tsx` exceeded the project’s max file length after adding new UI
- **Fix:** Moved crafting/dismantle section to `WorkshopCraftingSection.tsx`
- **Files modified:** src/ui/tabs/WorkshopTab.tsx, src/ui/tabs/WorkshopCraftingSection.tsx
- **Verification:** `pnpm run typecheck`
- **Committed in:** 37585aa (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor refactor to satisfy repo constraints; no scope change.

## Issues Encountered
- Unit tests failed after tuning prestige and dismantle rules; updated expectations and scenarios to match new behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Atelier UI now exposes progress and locked states; ready for Help content wiring and ExplainButtons.

---
*Phase: 30-workshop-atelier-and-docs*
*Completed: 2026-01-30*
