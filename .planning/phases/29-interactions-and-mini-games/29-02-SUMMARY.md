---
phase: 29-interactions-and-mini-games
plan: 02
subsystem: ui
tags: [winding, interactions, modal, cooldown, tests]

# Dependency graph
requires:
  - phase: 29-interactions-and-mini-games
    plan: 01
provides:
  - Timing-bar winding mini-game modal (Miss/Good/Perfect)
  - Vault interaction button labels + cooldown disabled reason + stable test ids

# Tech tracking
tech-stack:
  added: []
  patterns:
    - modal reuse via existing nostalgia modal shell
    - interaction gating via movement + per-item cooldown selector

key-files:
  created:
    - src/ui/components/WindingMiniGameModal.tsx

# Metrics
completed: 2026-01-30
---

# Phase 29 Plan 02: Winding timing mini-game Summary

Replaced the legacy Steady/Push wind session with a short timing-bar winding mini-game.

- Manual watch tiers now show a specific "Wind crown" interaction and open the new modal.
- Automatic/quartz tiers show distinct labels but remain disabled (coming soon) while we implement their interactions in subsequent plans.
- Cooldown state is surfaced per tier with a visible "Cooldown {Ns}" disabled reason.

## Verification
- `pnpm run typecheck`
- `pnpm run test:unit`

---
*Phase: 29-interactions-and-mini-games*
*Completed: 2026-01-30*
