---
phase: 28-wear-one-bonus
plan: 06
subsystem: e2e
tags: [worn-watch, playwright, stats, help]

# Dependency graph
requires:
  - phase: 28-03
    provides: Vault equip UX + modal + test ids
  - phase: 28-05
    provides: Worn-watch help content + ExplainButton wiring
provides:
  - End-to-end coverage for wear-one flow, Stats breakdown visibility, and Help explanation
affects: [28-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - localStorage save seeding via page.addInitScript

key-files:
  created:
    - tests/wear-one-bonus.spec.ts

# Metrics
completed: 2026-01-29
---

# Phase 28 Plan 06: Wear-one Playwright coverage Summary

Added a deterministic Playwright spec that seeds ownership, equips a watch, switches via the picker modal, validates Stats enjoyment breakdown updates, verifies the worn-watch ExplainButton, and then clears the worn slot.

## Verification
- `pnpm run test:e2e`

---
*Phase: 28-wear-one-bonus*
*Completed: 2026-01-29*
