---
phase: 22-unlock-clarity-and-next-actions
plan: 05
subsystem: ui
tags: [unlock, catalog, playwright]

# Dependency graph
requires:
  - phase: 22-03
    provides: next unlocks panel wired in Vault
  - phase: 22-04
    provides: catalog empty states with single CTA
provides:
  - Playwright coverage for unlock clarity UX
  - Human-verified unlock clarity UX on desktop and narrow viewport

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Playwright seeds localStorage via page.addInitScript using save v2 payload"
    - "Freeze RAF in e2e when sim ticks would auto-discover catalog entries"

key-files:
  created:
    - tests/unlock-clarity.spec.ts
  modified:
    - tests/help.spec.ts

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 22 Plan 05: Unlock Clarity E2E + Human Verify Summary

**Added Playwright coverage for the highest-value unlock clarity UX guarantees, and performed a visual usability pass at desktop and mobile widths.**

## Accomplishments

- Added `tests/unlock-clarity.spec.ts` with two e2e tests:
  - Vault shows `data-testid="next-unlocks"` with at least one next-unlock row + CTA.
  - Catalog discovered-empty state renders and its CTA returns to the Vault tab.
- Ensured deterministic Catalog empty-state testing by stubbing `window.requestAnimationFrame` / `window.cancelAnimationFrame` in Test B (prevents the runtime sim loop from auto-discovering catalog entries).
- Human verify (visual): confirmed on desktop and narrow viewport (~375px) that:
  - The Next unlocks panel is readable and lists locked systems with clear CTAs.
  - Locked watch + upgrade cards show an always-on unlock requirement row with progress.
  - Catalog empty state explains what to do and offers a single CTA back to Vault.

## Verification

- `pnpm -s run test:e2e` (pass)

---
*Phase: 22-unlock-clarity-and-next-actions*
*Completed: 2026-01-27*
