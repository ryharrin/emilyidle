# Phase 57-01 Summary

## Scope
Closed Phase 57 requirements by tightening therapist-session policy behavior and consolidating first-viewport guidance into a single dominant lane.

## Implemented
- Session policy alignment:
  - `src/game/selectors/therapistSessions.ts`
  - `src/game/actions/index.ts`
  - Cooldown no longer acts as a hard availability gate; affordability with rush/premium adjustments is the execution rule.
- Guidance-lane consolidation:
  - `src/ui/components/MissionRail.tsx`
  - `src/ui/tabs/career/CareerPanel.tsx`
  - Mission rail promoted as canonical "what now" lane; secondary diagnostics demoted behind disclosure.
- Test updates for policy and UX contracts:
  - `tests/career-first-economy.unit.test.ts`
  - `tests/rate-breakdowns.unit.test.ts`
  - `tests/help.spec.ts`
  - `tests/explanations.spec.ts`
  - `tests/collection-loop.spec.ts`

## Verification
- `pnpm exec vitest run --config vitest.config.ts tests/career-first-economy.unit.test.ts tests/rate-breakdowns.unit.test.ts` ✅
- `pnpm exec playwright test --project=chromium tests/help.spec.ts tests/explanations.spec.ts` ✅
- `pnpm exec playwright test --project=chromium tests/collection-loop.spec.ts -g "fresh save career session leads into first catalog purchase|buy button disabled when unaffordable"` ✅
- `pnpm -s lint` ✅
- `pnpm -s typecheck` ✅

## Notes
- A follow-up regression surfaced in collection-loop after guidance disclosure changes; fixed by explicitly expanding secondary details before targeting `career-action` in test flow.
- Save/persistence key and schema contracts were not changed in this phase.
