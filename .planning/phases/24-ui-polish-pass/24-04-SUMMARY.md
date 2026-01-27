---
phase: 24-ui-polish-pass
plan: 04
subsystem: ui
tags: [prestige, hierarchy]

# Dependency graph
requires:
  - phase: 24-01
    provides: global button styling + micro-interactions
provides:
  - Workshop/Maison prestige CTAs are primary when actionable

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional primary/secondary styling based on `canPrestige*`"

key-files:
  modified:
    - src/ui/tabs/WorkshopTab.tsx
    - src/ui/tabs/MaisonTab.tsx

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 24 Plan 04: Prestige CTA Hierarchy Summary

**Made the Workshop/Maison reset CTAs visually primary only when they are actionable, while keeping confirm/cancel styling and selectors stable.**

## Accomplishments

- Workshop: non-armed “Reset atelier” is primary when `canPrestigeWorkshop` is true; remains secondary when not.
- Maison: non-armed “Prestige atelier” is primary when `canPrestigeMaison` is true; remains secondary when not.
- Nostalgia primary CTA already followed this pattern; left unchanged.

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run test:unit` (pass)

---
*Phase: 24-ui-polish-pass*
*Completed: 2026-01-27*
