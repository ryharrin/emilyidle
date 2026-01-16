# Phase 02 — Collection Loop

Purpose: Make collecting/upgrading feel good and scalable; introduce clearer compounding and pacing before adding the real-image catalog.

## Source context

- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/CONVENTIONS.md`
- `src/game/state.ts`
- `src/game/sim.ts`
- `src/main.ts`

## Tasks

### 02-01 — Watch items + pricing curve + purchase UX

- [x] Define a watch-item catalog for gameplay (not images yet)
  - **Files**: `src/game/state.ts` (or `src/game/catalog.ts` if needed)
  - **Verification**: `pnpm run typecheck`; `pnpm run build`; manual: multiple items show + can be purchased
  - **Parallelizable**: NO

- [x] Implement pricing curves + affordability UX (bulk buy optional)
  - **Files**: `src/game/state.ts`, `src/main.ts`, `src/game/format.ts`
  - **Verification**: manual: buttons disable/enabled correctly; buy updates immediately; no negative currency
  - **Parallelizable**: YES

- [x] Add basic UI structure for the collection screen (list, details, actions)
  - **Files**: `src/main.ts`, `index.html`, `src/style.css`
  - **Verification**: manual: layout remains usable as item count grows
  - **Parallelizable**: NO

### 02-02 — Upgrades and softcaps (diminishing returns)

- [x] Add upgrade system (simple, deterministic)
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`, `src/main.ts`
  - **Verification**: manual: upgrades change rate; gated by affordability
  - **Parallelizable**: NO

- [x] Introduce softcaps / diminishing returns for pacing
  - **Files**: `src/game/sim.ts`, `src/game/state.ts`
  - **Verification**: manual: early growth feels fast; later slows; no hard stalls
  - **Parallelizable**: YES

### 02-03 — Collection value, set bonuses, milestone unlocks

- [x] Track collection value (separate from currency) and derive bonuses
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`
  - **Verification**: manual: value rises with ownership; bonuses apply deterministically
  - **Parallelizable**: NO

- [x] Add set bonuses + milestone unlocks (small initial set)
  - **Files**: `src/game/state.ts`, `src/main.ts`
  - **Verification**: manual: milestones unlock at thresholds; state persists after reload
  - **Parallelizable**: YES

## Plan-wide verification

- [x] `pnpm run typecheck`
- [x] `pnpm run lint`
- [x] `pnpm run build`
- [x] Manual: Collection loop feels compounding (tick → buys → upgrades → milestones)
