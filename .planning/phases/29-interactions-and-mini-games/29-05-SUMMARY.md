---
phase: 29-interactions-and-mini-games
plan: 05
subsystem: tests
tags: [playwright, interactions, stable-selectors]

# Dependency graph
requires:
  - phase: 29-interactions-and-mini-games
    plan: 04
provides:
  - E2E coverage for winding and automatic interactions using stable test ids

# Tech tracking
tech-stack:
  added: []
  patterns:
    - interaction e2e uses `vault-interact-*` selectors
    - test-only interaction acceleration via `window.__EMILY_IDLE_TEST_MODE__`

key-files:
  modified:
    - tests/collection-loop.spec.ts

# Metrics
completed: 2026-01-30
---

# Phase 29 Plan 05: Interaction automated coverage Summary

Updated Playwright e2e coverage to exercise the new interaction flow using stable `data-testid` selectors.

- Winding e2e now opens `WindingMiniGameModal`, completes deterministically, asserts enjoyment increases, and asserts cooldown disables the interaction.
- Automatic e2e opens `AutomaticMiniGameModal` (accelerated in test mode), asserts power reserve is persisted, asserts enjoyment-rate increase, and asserts cooldown messaging.

## Verification
- `pnpm run test:unit`
- `pnpm run test:e2e`

---
*Phase: 29-interactions-and-mini-games*
*Completed: 2026-01-30*
