## 2026-01-17 Task: 08-collection-integration

- Fixed Maison panel JSX by removing duplicated fragments and restoring the reset fieldset structure in `src/App.tsx`.
- Resolved init order error by defining `canPrestigeMaison` before its first use in `src/App.tsx`.
- Updated Playwright expectations to target specific Maison gain values and avoid strict-mode text collisions.
- Full verification passes: `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test:unit`, `pnpm run test:e2e`.

## 2026-01-19 Task: 08-collection-integration

- Mirrored all Wikimedia catalog images into `public/catalog/` and updated mapping to always serve local assets.
- Downloaded new catalog assets via scripted fetch plus targeted curl retries for rate-limited files.

## 2026-01-19 Task: 08-02 catalog integration analysis

- GameState tracks catalog discovery via `discoveredCatalogEntries` (IDs of matching `CATALOG_ENTRIES`) and tier unlocks via `catalogTierUnlocks`, so any new gameplay hooks can reuse these arrays without new persistence.
- Progress is computed in `getCatalogTierProgress` by scanning discovered entries for tier tags, `updateCatalogTierUnlocks` flips in `CATALOG_TIER_BONUSES` when `requiredCount` thresholds are reached, and `getCatalogTierIncomeMultiplier` multiplies income during `getRawIncomeRateCentsPerSec` alongside set/collection/workshop/maison/ability multipliers.
- `buyItem`, `buyUpgrade`, and `step()` all call `discoverCatalogEntries(getCatalogEntryIdsForItems(...))`, so catalog unlock events already coincide with purchases and each sim tick, enabling easy insertion of additional rewards or UI state observers when entries/tiers change.
- Any catalog-themed gameplay should respect the existing `tests/catalog.unit.test.tsx` selectors (`catalog-tier-panel`, `catalog-tier-card`, `catalog-grid`, `catalog-card`, owned/unowned tabs and filters) when adding UI cues or triggers tied to tier progress.

## 2026-01-20 Task: 08-01 attribution check

- Catalog cards display `entry.image.attribution` and the Sources & Licenses panel lists each entry’s attribution and license links in `src/App.tsx`, so attribution remains intact even with local image URLs.

## 2026-01-20 Task: 08-02 gameplay meaning

- Added milestone `archive-curator` (discover 12 catalog references) to unlock the new `archive-guides` upgrade, tying catalog discovery directly to progression.
- Introduced the `archive-guides` upgrade to the main upgrade list, gated by `archive-curator`, for an income boost rooted in catalog progress.
- Added achievement `catalog-keeper` to reward deeper catalog discovery.
- Catalog tier panel now surfaces Archive curator progress and unlock messaging inside the Collection tab.
- Added the Archive shelf collection-book section to the Catalog tab, showing discovered counts and entries in a dedicated grid.
- Updated catalog-related saved payloads in unit tests to include `archive-guides`.

## 2026-01-20 Task: 08-03 persistence & migration

- Extended save sanitization to capture `catalogTierUnlocks` in `src/game/persistence.ts` so catalog tier progress persists explicitly across saves.
- Catalog discovery counts used for archive-curator/keeper milestones now persist through `discoveredCatalogEntries`, with upgrades initialized in test payloads to include the new `archive-guides` key.
