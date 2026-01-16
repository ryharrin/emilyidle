# Phase 06 — Balance & Content

Purpose: Tune pacing/softcaps and add enough mid/late content that all three layers feel satisfying.

## Source context

- `.planning/ROADMAP.md`
- `.planning/codebase/TESTING.md`

## Tasks

### 06-01 — Balance pass (curves, thresholds, softcaps, pacing)

- [ ] Establish target pacing goals (time-to-first-prestige, etc.)
  - **Files**: `.planning/ROADMAP.md` (reference), `src/game/state.ts` (constants)
  - **Verification**: `pnpm run test:unit`
  - **Parallelizable**: NO

- [ ] Tune curves and thresholds across Collection/Workshop/Maison
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`
  - **Verification**: `pnpm run test:unit`
  - **Parallelizable**: YES

### 06-02 — Content pass (achievements, events, milestone goals)

- [ ] Add achievements (small initial set) with persistence
  - **Files**: `src/game/state.ts`, `src/game/persistence.ts`, `src/main.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Add simple events/milestones to reduce idle monotony
  - **Files**: `src/game/sim.ts`, `src/main.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

## Plan-wide verification

- [ ] `pnpm run typecheck`
- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run test:unit`
- [ ] `pnpm run test:e2e`
