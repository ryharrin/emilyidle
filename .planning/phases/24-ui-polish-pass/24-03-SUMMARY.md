---
phase: 24-ui-polish-pass
plan: 03
subsystem: ui
tags: [ui, hierarchy]

# Dependency graph
requires:
  - phase: 24-01
    provides: global button styling + focus/motion primitives
provides:
  - Vault card metadata de-emphasized for scanability
  - Career primary action reads as primary CTA

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "De-emphasize card-header right-hand metadata with `.muted`"
    - "Primary CTA uses default button styling (no `.secondary`)"

key-files:
  modified:
    - src/ui/tabs/CollectionTab.tsx
    - src/ui/tabs/CareerTab.tsx

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 24 Plan 03: Vault + Career Hierarchy Summary

**Improved hierarchy on the two highest-traffic tabs by muting secondary metadata and promoting the primary Career action.**

## Accomplishments

- Added `className="muted"` to card-header right-hand metadata across high-volume Vault lists (watches, upgrades, events, set bonuses, tier cards).
- Made the Career “Run session” action primary by removing the `.secondary` class (kept disabled logic + testids unchanged).

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run test:unit` (pass)

---
*Phase: 24-ui-polish-pass*
*Completed: 2026-01-27*
