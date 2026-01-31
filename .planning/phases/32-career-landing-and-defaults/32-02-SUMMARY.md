---
phase: 32-career-landing-and-defaults
plan: 02
subsystem: ui
tags: [navigation, landing, deep-link, persistence, playwright]

# Dependency graph
requires:
  - phase: 32-career-landing-and-defaults
    plan: 01
    provides: Pure landing resolver + unit matrix
provides:
  - Career-first landing wired into App + e2e regression coverage
affects: [navigation, onboarding, tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - App initial landing delegates to resolveLandingTab()

key-files:
  created:
    - tests/career-landing.spec.ts
    - .planning/phases/32-career-landing-and-defaults/32-02-SUMMARY.md
  modified:
    - src/App.tsx
    - tests/catalog.unit.test.tsx
    - tests/career-landing.unit.test.ts
    - tests/collection-loop.spec.ts

key-decisions:
  - Fresh saves now default to Career when visible
  - Deep link selection remains non-persisting; last-tab persistence behavior unchanged for existing saves

# Metrics
duration: 28m
completed: 2026-01-30
---

# Phase 32 Plan 02: Wire Career Landing Summary

**Initial landing now follows Phase 32 policy (Career-first for fresh saves) and is covered by Playwright.**

## Accomplishments

- Wired `src/App.tsx` initial landing to `resolveLandingTab()`
- Added `tests/career-landing.spec.ts` to cover fresh-save landing + deep-link non-persistence
- Updated existing unit/e2e tests that assumed Vault-first landing

## Verification

- `pnpm run typecheck`
- `pnpm run test:unit`
- `pnpm run test:e2e`

## Next

Run 32-03 verification checkpoint (desktop + mobile) and capture any UX issues.

---
*Phase: 32-career-landing-and-defaults*
*Completed: 2026-01-30*
