---
phase: 29-interactions-and-mini-games
plan: 04
subsystem: interactions
tags: [quartz, modal, gating, tests]

# Dependency graph
requires:
  - phase: 29-interactions-and-mini-games
    plan: 03
provides:
  - Quartz time-setting mini-game + cash reward
  - Completed movement-type interaction routing (manual/automatic/quartz)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - interaction routing by watch movement
    - modal reuse via existing nostalgia modal shell

key-files:
  created:
    - src/ui/components/QuartzMiniGameModal.tsx

# Metrics
completed: 2026-01-30
---

# Phase 29 Plan 04: Quartz interaction + complete gating Summary

Added a Quartz-specific time-setting mini-game and completed movement-type interaction routing so each watch type has exactly one appropriate interaction.

- Quartz watches now open `QuartzMiniGameModal` (deterministic dial alignment) and award a small cash burst with Miss/Good/Perfect feedback.
- Vault interaction buttons now correctly route to winding (manual), rotor (automatic), or time-setting (quartz).
- Unit tests include a quartz smoke test that verifies a persisted cash increase.

## Verification
- `pnpm run typecheck`
- `pnpm run test:unit`

---
*Phase: 29-interactions-and-mini-games*
*Completed: 2026-01-30*
