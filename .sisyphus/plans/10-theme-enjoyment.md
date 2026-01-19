# Phase 10 — Theme: “Vault Value” as Enjoyment

Purpose: Reframe the game’s core currency/value language so that progression feels like “enjoyment from the watches” (and related satisfaction/enthusiasm), while still using familiar numeric formatting.

## Source context

- `.sisyphus/plans/02-collection-loop.md`
- `.sisyphus/plans/06-balance-content.md`
- `src/game/format.ts`
- `src/App.tsx`

## Tasks

### 10-01 — Currency naming and UI copy changes

- [x] Rename primary currency display from strictly dollars to “Enjoyment” (or similar)
  - Proposed copy: “Enjoyment” (primary), “Enjoyment / sec” (rate)
  - Keep `$` formatting (confirmed)
  - **Files**: `src/App.tsx`, `src/game/format.ts`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: NO

- [x] Update supporting copy across Workshop/Maison to match the new framing
  - Example: Workshop improves how efficiently you turn your collection into enjoyment
  - Example: Maison increases the long-term enjoyment engine / legacy
  - **Files**: `src/App.tsx`, `src/game/state.ts` (strings/descriptions)
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

### 10-02 — Optional: split “cash” vs “enjoyment” (if desired)

- [x] Decide whether to introduce a second currency (Cash vs Enjoyment)
  - If YES: define conversion rules (buy watches with cash; enjoyment accrues from owning)
  - If NO: keep single-currency but re-theme UI and descriptions
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`, `src/App.tsx`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

## Plan-wide verification

- [x] `pnpm run lint`
- [x] `pnpm run typecheck`
- [x] `pnpm run build`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`

## Open questions

- `$` formatting for “Enjoyment”: KEEP (confirmed)
- Should “collection value” remain dollars, or become a separate “sentimental value” metric?
- Renaming: should the in-game title be “Emily Idle” everywhere (page title, header, save key), or just UI branding?
