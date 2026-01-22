# Phase 12 Plan 03 Summary

**Reskinned the catalog and added owned-only watch details (with image loading coverage).**

## Accomplishments
- Reskinned the catalog UI with a replica dealer aesthetic while preserving selectors.
- Added curated collector notes to select owned items; unowned entries stay spoiler-free.
- Fixed catalog image URLs to respect Vite's configured `base` path.
- Added Playwright e2e coverage to catch missing catalog image regressions.

## Commits
- `7552999` feat(12-03): apply catalog reskin styles
- `126586a` feat(12-03): add owned-only watch details
- `2174dc0` fix(12-03): respect vite base for catalog images
- `040d01e` test(12-03): cover catalog image assets in e2e

## Files Created/Modified
- `src/App.tsx` - Catalog header/filter label tweaks to support the reskin.
- `src/style.css` - Dealer-style catalog panel, filter, and card styling.
- `src/game/catalog.ts` - Added `facts` for a handful of entries and fixed image base URL handling.
- `tests/catalog.unit.test.tsx` - Added coverage for unowned entries not rendering collector notes.
- `tests/collection-loop.spec.ts` - Added e2e coverage to assert catalog images load from `/emilyidle/catalog/...`.
- `.planning/phases/12-major-updates-01-21/12-03-SUMMARY.md` - This summary.

## Decisions Made
- Keep collector notes gated to owned entries to preserve discovery.
- Treat image-loading failures as an e2e assertion (status 200 + no fallback data URI).

## Issues Encountered
- Catalog images 404'd under the configured Vite base (`/emilyidle/`) until `BASE_URL` was applied.

## Verification
- `pnpm run test:unit`
- `pnpm run test:e2e -- tests/collection-loop.spec.ts`
- Manual verification approved: catalog styling and photos load.

## Next Step
- Ready for `12-04-PLAN.md`.
