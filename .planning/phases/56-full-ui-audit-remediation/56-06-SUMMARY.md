---
phase: 56-full-ui-audit-remediation
plan: 6
subsystem: upgrades-loop
tags: [upgrades, recommendations, roi, mobile, e2e]
requires:
  - 56-05-SUMMARY.md
provides:
  - Top-three actionable recommendation strip with intent-bucket grouping
  - Default card-level cost/impact/ROI summaries while preserving deep diagnostics
  - Mobile-first collapsible upgrade group flow for Collection, Workshop, and Maison
  - Deterministic upgrade verification coverage across desktop and mobile playwright projects
key-files:
  modified:
    - src/ui/tabs/UpgradesTab.tsx
    - src/style.css
    - tests/upgrades-preview.unit.test.tsx
    - tests/career-upgrades.spec.ts
    - tests/unlock-clarity.spec.ts
    - .planning/phases/56-full-ui-audit-remediation/56-TASKLIST.md
    - .planning/phases/56-full-ui-audit-remediation/56-06-SUMMARY.md
metrics:
  completed: 2026-02-07
---

# Phase 56 Plan 06 Summary

Executed Upgrades prioritization + ROI framing by introducing recommendation-ranked actions,
intent bucket framing, default before/after impact summaries, and grouped collapsible upgrade
sections optimized for mobile scanability.

## Accomplishments
- Refactored `UpgradesTab` upgrade cards to expose standardized decision signals:
  - intent bucket labeling (`Income`, `Enjoyment`, `Automation`, `Meta progression`),
  - default impact rows (`Before -> After`) for cash/enjoyment,
  - ROI/payback summaries in default card state,
  - consistent status chips and de-emphasis states for locked/installed/unaffordable/low-impact cards.
- Added a new top-of-tab recommendation surface (`upgrades-recommendations`) that ranks up to
  three actionable upgrades and groups them by intent bucket for first-viewport prioritization.
- Added grouped `details` disclosures for Collection, Workshop, and Maison upgrade sections to reduce
  uninterrupted mobile scroll depth while preserving deterministic selectors.
- Extended tests to verify recommendation strip visibility, impact/ROI summaries, diagnostics toggle,
  and disclosure defaults in desktop/mobile flows.

## Verification
- `pnpm test:unit -- tests/upgrades-preview.unit.test.tsx tests/unlock-components.unit.test.tsx`
- `pnpm test:e2e --project=chromium -- tests/career-upgrades.spec.ts tests/unlock-clarity.spec.ts`
- `pnpm test:e2e --project=chromium-mobile-pixel5 -- tests/career-upgrades.spec.ts`

## Notes
- Unit command still executes the full Vitest suite under the current script configuration; all tests passed.
- Existing warnings from unrelated `ValueTicker` act-wrapping behavior were observed during full-suite unit runs and did not fail execution.
