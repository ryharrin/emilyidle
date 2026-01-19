# Phase 09 — UI Reveal + Watch-Themed Polish

Purpose: Improve pacing/clarity by hiding future layers/unlocks until they’re close, and add subtle watch-themed UI details without turning the project into a full art pipeline.

## Source context

- `.sisyphus/plans/04-workshop-prestige.md`
- `.sisyphus/plans/05-maison-prestige.md`
- `.sisyphus/plans/07-packaging-polish.md`
- `src/App.tsx`
- `src/style.css`

## Tasks

### 09-01 — Progressive disclosure (hide until “nearly unlocked”)

- [x] Hide Workshop panel until close to first Workshop prestige
  - Suggested approach: show a teaser card once you’re within X% of the threshold (or within N seconds of reaching at current rate)
  - **Files**: `src/App.tsx`, `src/game/state.ts` (helper computations), `src/style.css`
  - **Verification**: `pnpm run test:e2e` (seeded states cover hidden/visible states)
  - **Parallelizable**: NO

- [x] Hide Maison panel until close to first Maison prestige
  - **Files**: `src/App.tsx`, `src/game/state.ts`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: NO

- [x] Hide upcoming unlock tags until the player is near the milestone
  - Suggested approach: show “Unlocking soon…” only when within X% of requirement, otherwise hide completely
  - **Files**: `src/App.tsx`, `src/game/state.ts`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

### 09-02 — Watch-themed UI touches

- [x] Add subtle watch-inspired motifs (without new external deps)
  - Options: “tick” separators, dial-like rings around stats, small crown/gear SVGs, or gradient/texture accents
  - **Files**: `src/style.css`, `src/App.tsx`, possibly `public/*` for small SVG assets
  - **Verification**: `pnpm run build`; manual visual check
  - **Parallelizable**: YES

- [~] Add “vault” / “atelier” language consistency pass
  - **Files**: `src/App.tsx`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

## Plan-wide verification

- [x] `pnpm run lint`
- [x] `pnpm run typecheck`
- [x] `pnpm run build`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`
