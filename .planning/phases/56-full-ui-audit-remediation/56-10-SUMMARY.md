---
phase: 56-full-ui-audit-remediation
plan: 10
subsystem: career-session-clarity-upgrades-cleanup
tags: [career, cooldown, session-cost, upgrades, ux-clarity]
requires:
  - 56-09-SUMMARY.md
provides:
  - Cooldown-rush sessions gated by affordability instead of cooldown lockout
  - Clear run-now session cost composition in Career (session cost + rush fee)
  - Reduced duplicated guidance in Career action surfaces
  - Removal of Upgrades recommendation card block
key-files:
  modified:
    - .planning/phases/56-full-ui-audit-remediation/56-10-PLAN.md
    - src/game/selectors/therapistSessions.ts
    - src/game/selectors/careerNextAction.ts
    - src/game/actions/index.ts
    - src/ui/tabs/career/CareerPanel.tsx
    - src/ui/components/CareerNextActionCard.tsx
    - src/ui/tabs/UpgradesTab.tsx
    - src/style.css
    - tests/career-first-economy.unit.test.ts
    - tests/therapist-session-delta.spec.ts
    - tests/career-upgrades.spec.ts
    - tests/upgrades-preview.unit.test.tsx
metrics:
  completed: 2026-02-09
  verification:
    - lint
    - typecheck
    - targeted-unit
    - targeted-e2e
---

# Phase 56 Plan 10 Summary

Implemented the gameplay/UX fix bundle for therapist session cooldown behavior and upgrades
surface cleanup.

## Accomplishments
- Session policy now exposes and uses `effectiveEnjoymentCostCents`, `cooldownRemainingMs`,
  `cooldownRushMultiplier`, and `cooldownRushExtraCents` as first-class values in affordability
  and UI copy paths.
- Career next-action logic now reports rush-available states explicitly and no longer carries
  contradictory cooldown messaging.
- Career panel now includes a dedicated run-now cost line near the session CTA:
  - `Run now total: <total> (<session cost> + <rush fee>)` when rush applies.
  - `Run now total: <total> (<session cost>)` outside rush windows.
- Session helper copy was condensed to reduce repeated instruction text across surfaces.
- Upgrades “Top opportunities / Recommended next upgrades” card block was removed, along with
  associated tests that previously asserted that panel.

## Verification
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:unit -- tests/career-first-economy.unit.test.ts tests/upgrades-preview.unit.test.tsx`
- `pnpm test:e2e -- tests/therapist-session-delta.spec.ts tests/career-upgrades.spec.ts`
- `pnpm test:e2e --project=chromium-mobile-pixel5 -- tests/therapist-session-delta.spec.ts`

All commands completed successfully.

## Behavioral Outcomes
- Running sessions during cooldown is possible when enjoyment is sufficient for the run-now total.
- Insufficient-enjoyment cooldown states remain blocked and now communicate rush cost context.
- Career surfaces are less repetitive while preserving actionable guidance.
- Upgrades no longer shows the removed recommendation card content.
