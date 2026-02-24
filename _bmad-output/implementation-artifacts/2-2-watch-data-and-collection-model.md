# Story 2.2: Watch Data & Collection Model

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want the watch catalog data structure with real watches across 4 tiers,  
so that the collection system has authentic content to work with.

## Acceptance Criteria

1. Given the watch data, when I inspect `src/game/data/watches.ts`, then each watch has: `id` (kebab-case), `name`, `priceCents`, `tier` (quartz/manual/automatic/tourbillon), `imageUrl`, `enjoymentRate`, and `isFavorite` flag.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.2]
2. Given Chapter 1 scope, when I look at the initial catalog, then at least 10 quartz watches are defined with proper pricing.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.2]
3. Given the collection selectors, when I call `ownedWatches(state)` and `affordableWatches(state)`, then they return correctly filtered watch arrays.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.2]
4. Given Emily's favorites (Royal Oaks, Rolexes, rose gold), when defined in data, then they have `isFavorite: true` and a passive Enjoyment bonus.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.2]

## Tasks / Subtasks

- [x] Add watch data model + initial catalog (AC: 1, 2, 4)
  - [x] Create `src/game/data/watches.ts` with:
    - [x] Watch type definition
    - [x] A catalog constant exporting all watches
    - [x] At least 10 quartz watches
    - [x] Favorites flagged `isFavorite: true` (Royal Oaks, Rolexes, rose gold)
    - [x] Passive Enjoyment bonus representation for favorites (derived rule via multiplier)

- [x] Add selectors for collection/market filtering (AC: 3)
  - [x] Implement `ownedWatches(state)` selector.
  - [x] Implement `affordableWatches(state)` selector.

- [x] Tests (AC: 2, 3)
  - [x] Unit tests ensuring:
    - [x] At least 10 quartz watches exist
    - [x] selectors filter correctly

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- Data is static and lives in `src/game/data/**`.
- IDs are kebab-case and stable (used as save keys).
- Keep image URLs pointing at `public/` assets (no network dependency).

### Architecture Compliance

- Static game data pattern (TS constants) and selectors pattern.  
  [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Architecture References]

### References

- `_bmad-output/planning-artifacts/epic-2-core-loop.md` (Story 2.2 ACs)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from Epic 2 Core Loop.

### Completion Notes List

- Added watch catalog data model + initial data (10+ quartz watches) using local `public/catalog/**` images.
- Flagged favorites (Royal Oak, Rolex, rose gold) as `isFavorite: true` and applied a passive enjoyment bonus via a multiplier in domain helpers.
- Implemented `ownedWatches(state)` and `affordableWatches(state)` selectors with unit tests.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/2-2-watch-data-and-collection-model.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/data/watches.ts`
- `src/game/data/watches.unit.test.ts`
- `src/game/watchSelectors.ts`
- `src/game/watchSelectors.unit.test.ts`

### Change Log

- 2026-02-23: Implemented watch catalog + selectors + tests; gates green; status moved to done.
