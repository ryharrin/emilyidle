---
phase: 28-wear-one-bonus
plan: 05
subsystem: help
tags: [worn-watch, help, explain]

# Dependency graph
requires:
  - phase: 28-02
    provides: Worn watch enjoyment multiplier + breakdown term
provides:
  - Help section for worn watch bonus
  - ExplainButton wiring for the worn-watch enjoyment breakdown line
affects: [28-06, 28-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ExplainButton targets stable help section ids

key-files:
  modified:
    - src/ui/tabs/StatsTab.tsx
    - src/ui/help/helpContent.ts

# Metrics
completed: 2026-01-29
---

# Phase 28 Plan 05: Worn-watch explanation wiring Summary

Added a dedicated Help topic for the worn-watch bonus and wired an ExplainButton directly onto the worn-watch enjoyment breakdown line (only when present).

## Accomplishments
- Added `HELP_SECTION_IDS.wornWatchBonus` and a "Worn watch bonus" help section listing bucket multipliers and behavior.
- Updated Stats enjoyment breakdown to render `explain-worn-watch-bonus` next to the `id: "worn-watch"` multiplier term.
- Ensured no orphan explain control appears when wear none (term omitted).

## Verification
- `pnpm run typecheck`
- `pnpm run test:e2e -- tests/explanations.spec.ts`

---
*Phase: 28-wear-one-bonus*
*Completed: 2026-01-29*
