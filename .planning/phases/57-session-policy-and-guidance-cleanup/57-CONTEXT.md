# Phase 57: Session Policy Completion + Guidance Cleanup Context

**Gathered:** 2026-02-11
**Status:** Ready for plan execution

## Boundary

Close out v5.0 phase-57 requirements by validating and tightening the therapist-session policy
and consolidating next-step guidance hierarchy.

This phase is policy-clarity and guidance-surface alignment work. It does not add new currencies,
change persistence schema/version, or expand progression systems.

## Scope

- `SESSION-03`: confirm the hard cooldown lockout is not a session availability gate.
- `SESSION-04`: keep escalating premium/rush-cost feedback explicit and deterministic.
- `GUIDE-01`: make one canonical guidance lane for "what to do now" and reduce duplicate or
  conflicting near-term guidance copy.

## Validation Inputs

- `.planning/milestones/v5.0-REQUIREMENTS.md`
- `.planning/milestones/v5.0-ROADMAP.md`
- `.planning/research/V5.0-GAP-AUDIT-2026-02-11.md`
- `NOTES-02-07-26.yaml` (reconciled 2026-02-11)
- Current behavior evidence:
  - `src/game/selectors/therapistSessions.ts`
  - `src/game/actions/index.ts`
  - `src/App.tsx`
  - `src/ui/components/MissionRail.tsx`
  - `src/ui/tabs/career/CareerPanel.tsx`

## Locked Decisions

- Session eligibility remains affordability-driven (`canPerformTherapistSession`) rather than
  cooldown-lock driven.
- Cooldown can remain visible as pacing context and/or rush-fee input as long as it does not block
  session execution when cost is payable.
- Mission rail is the primary shell-level guidance surface.
- Existing save keys/version contracts remain unchanged.

## Candidate Risk Areas

- Guidance duplication between mission rail, tab readiness badges, and career near-term blocks can
  produce noisy or contradictory intent cues.
- Session cost copy can drift if policy values are recomputed in UI instead of selector outputs.
- E2E expectations can become brittle if guidance copy changes without test-anchor stabilization.

## Out of Scope

- Movement-tier metadata contract changes (`DATA-01`).
- Catalog filter-density and affordability visual restyling (`FILTER-02`, `CATALOG-11`).
- Module split/debt closure work (`DEBT-01`).

---
*Phase: 57-session-policy-and-guidance-cleanup*
*Context gathered: 2026-02-11*
