---
phase: 56-full-ui-audit-remediation
plan: 7
subsystem: prestige-meta-loop
tags: [workshop, maison, nostalgia, prestige, onboarding, e2e]
requires:
  - 56-06-SUMMARY.md
provides:
  - Standardized Current/Next/Delta reset framing for Workshop, Maison, and Nostalgia prestige reviews
  - Explicit carry-forward vs reset messaging in prestige onboarding and in-tab reset reviews
  - Recovery-time guidance surfaced with existing progression selectors in each prestige panel
  - Consistent confirm/cancel affordance labels across meta reset flows
key-files:
  modified:
    - src/ui/prestigeSummary.ts
    - src/ui/components/PrestigeSummary.tsx
    - src/ui/prestigeOnboarding.ts
    - src/ui/components/PrestigeOnboardingModal.tsx
    - src/ui/tabs/WorkshopTab.tsx
    - src/ui/tabs/MaisonTab.tsx
    - src/ui/tabs/NostalgiaTab.tsx
    - src/style.css
    - tests/prestige-summary.unit.test.tsx
    - tests/prestige-onboarding.unit.test.ts
    - tests/prestige-confirmation.spec.ts
    - tests/nostalgia-prestige.spec.ts
    - tests/help.spec.ts
    - .planning/phases/56-full-ui-audit-remediation/56-TASKLIST.md
    - .planning/phases/56-full-ui-audit-remediation/56-07-SUMMARY.md
metrics:
  completed: 2026-02-07
---

# Phase 56 Plan 07 Summary

Executed Workshop/Maison/Nostalgia meta-loop messaging alignment by standardizing prestige review
surfaces to Current/Next/Delta framing, adding explicit carry-forward vs reset guidance, and
normalizing reset affordance wording across desktop and mobile flows.

## Accomplishments
- Refactored prestige summary contracts and rendering:
  - `build*PrestigeSummary` now emits `current`, `next`, and `delta` sections.
  - `PrestigeSummary` renders `Current run`, `Next run keeps`, and `Delta` cards with stable
    section test IDs.
- Improved prestige onboarding clarity:
  - `getPrestigeOnboardingContent` now includes `carryForward`, `resets`, and `recoveryHint`.
  - `PrestigeOnboardingModal` now surfaces carry-forward and reset lists in one scan and preserves
    a clear recommended action CTA.
- Added recovery guidance to in-tab prestige review flows:
  - Workshop and Maison now show reset progress ratio plus ETA using existing progression selectors
    (`getPrestigeUnlockProgressDetail`, `getEnjoymentRateCentsPerSec`).
  - Nostalgia preview now shows ETA and explicit persistence/reset messaging.
- Normalized reset affordances:
  - Workshop, Maison, and Nostalgia reset reviews now use aligned labels (`Review reset`,
    `Confirm reset`, `Keep current run`) and consistent review copy.
- Updated E2E assertions to reflect deterministic post-reset state semantics and updated labels.

## Verification
- `pnpm test:unit -- tests/prestige-summary.unit.test.tsx tests/nostalgia-unlocks.unit.test.tsx tests/prestige-onboarding.unit.test.ts`
- `pnpm test:e2e --project=chromium -- tests/prestige-confirmation.spec.ts tests/nostalgia-unlocks.spec.ts tests/nostalgia-prestige.spec.ts`
- `pnpm test:e2e --project=chromium-mobile-pixel5 -- tests/prestige-confirmation.spec.ts tests/nostalgia-unlocks.spec.ts`

## Notes
- Desktop prestige confirmation assertions were hardened to check persisted reset-state values,
  avoiding brittle exact-currency string expectations after reset.
- Existing unrelated `ValueTicker` act-wrapping warnings remain in the full Vitest run but did not
  fail execution.
