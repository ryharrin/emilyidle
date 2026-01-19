## 2026-01-15 Task: 02-collection-loop

- Expanded `GameState` to track item counts, upgrade levels, and milestones.
- Catalog definitions live in `src/game/state.ts` with unlock gates tied to milestones.
- Income now uses `getEffectiveIncomeRateCentsPerSec` with a softcap helper.
- UI rebuilt in `src/main.ts` to render collection, upgrades, milestones, and set bonuses dynamically.
- Save sanitization now rebuilds state via `createStateFromSave`.
- Playwright runs use `playwright.config.ts` with `baseURL` set to `http://localhost:5177` (current dev server port).

## 2026-01-15 Task: phase-plan-updates

- Phase 03 now includes a mandatory UI framework migration step (React or similar).
- Phases 03–07 verification now require both Vitest unit tests and Playwright UI tests.

## 2026-01-16 Task: 03-catalog-ui

- Catalog UI pulls from `getCatalogEntries()` in `src/game/state.ts`.
- Catalog entries are filtered via text search + brand selection with memoization.
- Sources/Licenses panel lists source + license links for each image.

## 2026-01-16 Task: catalog-discovery-wiring

- Added `discoveredCatalogEntries` to save/load flow via `createStateFromSave` + `sanitizeState`.
- Discovery helpers live in `src/game/state.ts` and sync during `buyItem`, `buyUpgrade`, and `step()`.
- Catalog tests must set the View filter to `All references` for predictable search/brand filtering.
