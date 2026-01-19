# Phase 05 — Maison Prestige

Purpose: Add the second prestige layer (“Maison”) that resets Workshop + Collection to grant longer-term progression and unlock “brand empire” expansion.

## Source context

- `.sisyphus/plans/04-workshop-prestige.md`
- `.sisyphus/plans/05-maison-prestige.md`
- `.sisyphus/plans/06-balance-content.md`
- `src/game/persistence.ts`

## Tasks

### 05-01 — Prestige 2 reset rules + Maison currency

- [ ] Define Maison reset/persist rules (resets Workshop + Collection)
  - **Files**: `src/game/state.ts`, `src/game/persistence.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Introduce Maison currency (Heritage/Reputation) and gain formula
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

### 05-02 — Maison systems (product lines, permanent expansion unlocks)

- [ ] Add Maison meta-progression systems (new product lines / multipliers)
  - **Files**: `src/game/state.ts`, `src/App.tsx`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add UI to surface Maison goals and long-term progression
  - **Files**: `src/App.tsx`, `src/style.css`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

## Plan-wide verification

- [ ] `pnpm run typecheck`
- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run test:unit`
- [ ] `pnpm run test:e2e`
