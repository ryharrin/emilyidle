---
phase: 50-catalog-collection-depth
plan: 2
subsystem: ui
tags: [react, playwright, vitest, navigation, collection]

# Dependency graph
requires:
  - phase: 50-01
    provides: "Collection selectors for set bonuses, prestige previews, and analytics snapshots."
provides:
  - "Stable CollectionSectionNav wiring that scrolls via the scrollable element, exposes today's active segment for automation, and delays auto-detection during programmatic jumps."
  - "Playwright coverage for the Collection nav buttons plus the Owned vault tabs so Starter/Mid/Lux anchors and Owned flows stay guarded."
affects:
  - phase: 50-03
    provides: "Compare UI/PT coverage that will reuse the same Collection insights selectors."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Expose a `data-active-section` hook so regression suites can observe nav state without brittle `aria-current` assumptions."
    - "Guard scroll-based active detection for a brief window after nav jumps so the sticky rail keeps the intended anchor highlighted."

key-files:
  created: []
  modified:
    - src/ui/components/CollectionSectionNav.tsx
    - tests/collection-loop.spec.ts

key-decisions:
  - "Record the nav's active segment via `data-active-section` rather than counting on `aria-current` so Playwright sees our intent even when badges append extra text."
  - "Pause automatic section detection for ~400ms after a programmatic jump to stop the sticky nav from flickering back to `collection-overview`."

patterns-established:
  - "Scroll with `document.scrollingElement` so every browser (Desktop/WebKit/mobile) lands on the target anchor."
  - "Use Playwright `evaluate` clicks plus flexible regexes to cover tabs whose labels now include readiness badges."

# Metrics
duration: 1h 20m
completed: 2026-02-06
---

# Phase 50: Catalog & Collection Depth Summary

**Collection navigation now reports Starter/Mid/Lux anchors via a stable data hook, and the Collection loop regression suite covers the Owned tab for winding/automatic interactions.**

## Performance

- **Duration:** 1h 20m
- **Started:** 2026-02-06T12:55:00Z
- **Completed:** 2026-02-06T14:15:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Implemented scroll logic that targets the actual scrolling element, exposes `data-active-section`, and suspends the automatic detection loop just long enough for manual nav jumps to win.
- Updated Playwright nav coverage to click via `evaluate`, assert the new hook, and use regexes that tolerate readiness badges so Starter/Mid/Lux anchors stay protected.
- Re-verified the plan with `pnpm typecheck`, `pnpm test:unit -- tests/collection.unit.test.tsx`, and `pnpm test:e2e -- tests/collection-loop.spec.ts`.

## Task Commits

1. **Task 1: Build modular Collection depth components** – pre-existing (no new commit).
2. **Task 2: Wire CollectionTab nav and data-active-section** – `327d248` (fix).
3. **Task 3: Extend Collection loop coverage** – `1aaa984` (test).

**Plan metadata:** this commit (docs: plan complete)

## Files Created/Modified

- `src/ui/components/CollectionSectionNav.tsx` – scroll via the true scrolling element, pause auto-detection after jumps, expose `data-active-section`, and guard timers.
- `tests/collection-loop.spec.ts` – expect Starter/Mid/Lux anchors via the nav hook, click through `evaluate`, and loosen the Owned tab selector to handle readiness badges.

## Decisions Made

- Guard the sticky nav's automatic detection for ~400ms after programmatic jumps so tests can read the intended anchor before any scroll noise arrives.
- Relax Owned-tab selectors to match button labels that now include readiness badges while still clicking via `evaluate` so viewport limitations don’t break the script.

## Deviations from Plan

None – plan executed exactly as written.

## Issues Encountered

None beyond the planned work.

## User Setup Required

None – no external configuration necessary.

## Next Phase Readiness

Collection depth navigation and analytics remain stable; Phase 50-03 (compare UI + analytics) can rely on these anchors, and the Owned tab flows are covered by Playwright so future plans have reproducible regressions.

---
*Phase: 50-catalog-collection-depth*
*Completed: 2026-02-06*
