---
phase: 56-full-ui-audit-remediation
plan: 8
subsystem: stats-settings-scanability
tags: [stats, settings, safety, mobile, e2e]
requires:
  - 56-07-SUMMARY.md
provides:
  - First-viewport stats diagnostics board for rates, active events, and next trigger context
  - Settings intent grouping for backup/import, preferences, notifications, tab visibility, and danger controls
  - Stronger destructive-action isolation with dedicated danger-zone treatment
  - Desktop and mobile verification coverage updates for stats diagnostics and clear-save safety flow
key-files:
  modified:
    - src/ui/tabs/StatsTab.tsx
    - src/ui/tabs/SaveTab.tsx
    - src/style.css
    - tests/event-calendar.spec.ts
    - tests/explanations.spec.ts
    - tests/settings-clear-save.spec.ts
    - .planning/phases/56-full-ui-audit-remediation/56-TASKLIST.md
    - .planning/phases/56-full-ui-audit-remediation/56-08-SUMMARY.md
metrics:
  completed: 2026-02-07
---

# Phase 56 Plan 08 Summary

Executed Stats/Settings scanability + safety pass by elevating first-viewport diagnostics in Stats
and restructuring Settings into intent-grouped sections with isolated destructive controls.

## Accomplishments
- Reworked `StatsTab` top-of-panel hierarchy to prioritize immediate diagnostics:
  - added a priority board with stable anchors (`stats-priority-board`, `stats-priority-rates`,
    `stats-priority-events`, `stats-priority-trigger`),
  - surfaced next trigger timing/context from event calendar projections,
  - moved long-form supporting diagnostics into lower disclosure stacks.
- Reorganized `SaveTab` settings flow into explicit action groups:
  - `Save safety` for export backup,
  - `Import / restore` for text/file restore paths,
  - separate `Preferences`, `Audio`, `Notifications`, and `Visible tabs`,
  - isolated `Danger zone` for clear-save with stronger visual separation.
- Extended style system to support new stats and settings structure:
  - added priority-board and diagnostics-stack treatment,
  - added section variant styling and light-theme parity,
  - added responsive behavior for reduced first-load scroll depth on mobile.
- Updated E2E contract coverage for new anchors and safety grouping:
  - stats/event tests now assert first-viewport priority diagnostics,
  - settings tests assert save-safety and danger-zone grouping,
  - mobile clear-save action path uses deterministic direct button activation to avoid
    touch-emulation hit-test drift while preserving behavioral assertions.

## Verification
- `pnpm exec vitest run --config vitest.config.ts tests/rate-breakdowns.unit.test.ts tests/notifications-preferences.unit.test.tsx`
- `pnpm test:e2e --project=chromium -- tests/event-calendar.spec.ts tests/settings-clear-save.spec.ts tests/explanations.spec.ts`
- `pnpm test:e2e --project=chromium-mobile-pixel5 -- tests/settings-clear-save.spec.ts`

## Notes
- The `pnpm test:unit -- ...` script still expands to the full suite in this repo; targeted verification
  was run via direct `vitest run` invocation to keep `56-08` scope deterministic.
