---
phase: 21-explanations-and-rate-transparency
plan: 06
subsystem: tests
tags: [playwright, help, rates, nostalgia]

# Dependency graph
requires:
  - phase: 21-03
    provides: Vault gate Explain trigger
  - phase: 21-04
    provides: Stats rate breakdown disclosures
  - phase: 21-05
    provides: Nostalgia unlock store Explain trigger
provides:
  - Playwright regression coverage for explain triggers + rate breakdown disclosure

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Prefer getByTestId + role selectors; seed saves via addInitScript

key-files:
  created:
    - tests/explanations.spec.ts
  modified: []

key-decisions:
  - "Seed state to reveal the Stats tab via first-drawer progress (10/12 items)"

patterns-established:
  - "explain-* buttons asserted via help-active-section title"
  - "rate breakdown disclosures expanded via summary click"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 21 Plan 06: Explanations E2E Coverage Summary

**Playwright now regression-protects Phase 21 behavior: ExplainButtons deep-link to the correct help sections and the Stats rate breakdown disclosures render.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-27T05:13:32Z
- **Completed:** 2026-01-27T05:13:32Z
- **Tasks:** 1
- **Files created:** 1

## Accomplishments

- Added `tests/explanations.spec.ts` to cover:
  - Currencies Explain trigger in the header.
  - Vault purchase gate Explain trigger for classic enjoyment gating.
  - Stats rate breakdown disclosures for enjoyment and cash.
  - Nostalgia unlock store Explain trigger.

## Verification

- `pnpm -s run test:e2e -- tests/explanations.spec.ts` (pass)

## Decisions Made

Seed state to reveal the Stats tab via first-drawer progress (10/12 items).

## Next Phase Readiness

Ready to mark Phase 21 complete and proceed to Phase 22 (Unlock Clarity & Next Actions).

---
*Phase: 21-explanations-and-rate-transparency*
*Completed: 2026-01-27*
