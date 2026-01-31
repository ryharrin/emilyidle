---
phase: 32-career-landing-and-defaults
plan: 01
subsystem: ui
tags: [navigation, landing, deep-link, persistence, tests]

# Dependency graph
requires:
  - phase: 31-rate-clarity-gap-closure
    provides: Baseline v3.0 UX + stable navigation behavior
provides:
  - Pure landing selection resolver + unit-locked landing policy
affects: [navigation, onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure landing resolver module used by App routing

key-files:
  created:
    - src/ui/navigation/landing.ts
    - tests/career-landing.unit.test.ts
    - .planning/phases/32-career-landing-and-defaults/32-01-SUMMARY.md
  modified: []

key-decisions:
  - Encoded landing precedence: deep link > existing save last-tab > fresh save default (Career)

patterns-established:
  - "resolveLandingTab() is pure and unit-testable"

# Metrics
duration: 6m
completed: 2026-01-30
---

# Phase 32 Plan 01: Career Landing Resolver Summary

**Defined a testable landing policy as a pure resolver and locked the behavior with unit tests.**

## Accomplishments

- Added `src/ui/navigation/landing.ts` with `resolveLandingTab()` and `resolveTabAlias()` (includes `tab=catalog` alias)
- Added `tests/career-landing.unit.test.ts` covering deep-link precedence, alias handling, and fresh-save defaults

## Verification

- `pnpm run typecheck`
- `pnpm run test:unit`

## Next

Proceed to 32-02 to wire `resolveLandingTab()` into `src/App.tsx` and add Playwright coverage.

---
*Phase: 32-career-landing-and-defaults*
*Completed: 2026-01-30*
