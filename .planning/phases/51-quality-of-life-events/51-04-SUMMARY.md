---
phase: 51-quality-of-life-events
plan: 4
subsystem: gameplay
tags: [achievements, events, selectors, stats, collection]
requires:
  - phase: 51-03
    provides: persisted notification channels and toast plumbing
provides:
  - Expanded achievement categories across career/mini-games/prestige/collection
  - Selector-backed event calendar with active/upcoming state and countdown context
affects:
  - phase: 51-05
    provides: event/achievement context for mini-game progression messaging
tech-stack:
  added: []
  patterns:
    - Keep event and achievement projections selector-driven so UI surfaces remain deterministic.
key-files:
  created:
    - tests/achievements-categories.unit.test.ts
    - tests/event-calendar.unit.test.ts
    - tests/event-calendar.spec.ts
  modified:
    - src/game/model/types.ts
    - src/game/model/state.ts
    - src/game/selectors/index.ts
    - src/ui/tabs/StatsTab.tsx
    - src/ui/tabs/CollectionTab.tsx
key-decisions:
  - Define new achievements additively to preserve save compatibility and existing unlock IDs.
  - Expose event status/countdown from selectors instead of deriving timing in UI components.
patterns-established:
  - Stats and Collection now share a consistent event/achievement vocabulary anchored in domain selectors.
metrics:
  completed: 2026-02-06
---

# Phase 51-04 Summary

**Achievement breadth and event timing clarity are now expanded, with deterministic selector models feeding both Stats and Collection surfaces.**

## Accomplishments

- Added broader achievement coverage for career progression, mini-game outcomes, prestige behavior, and collection depth (`ACHIEVE-02`).
- Implemented event calendar projections and Stats tab rendering with active/upcoming buckets, countdown text, and bonus explanations (`EVENT-01`).
- Extended Collection/Stats surfaces to consume event/achievement context without duplicating domain logic.
- Added unit/e2e guardrails covering category coverage and event calendar transitions.

## Task Commits

- Consolidated implementation landed in follow-up checkpoint `613eff8`.

## Verification

- `pnpm test:unit -- tests/achievements-categories.unit.test.ts tests/event-calendar.unit.test.ts`
- `pnpm test:e2e -- tests/event-calendar.spec.ts`

## Next Phase Readiness

Mini-game practice/difficulty/streak work (51-05) now has the achievement/event scaffolding needed for final QoL closure.
