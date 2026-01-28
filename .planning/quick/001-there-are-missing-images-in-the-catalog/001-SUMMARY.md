---
phase: quick-001-there-are-missing-images-in-the-catalog
plan: 001
subsystem: testing
tags: [playwright, catalog, assets, wikimedia]

# Dependency graph
requires: []
provides:
  - Playwright catalog image audit that fetches every catalog asset URL
  - Local sync script for catalog image audit and optional download
  - Catalog asset path overrides for accented filenames
affects: [catalog assets, e2e, ci]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Catalog asset audit via text parse + HTTP checks"]

key-files:
  created:
    - tests/catalog-images.spec.ts
    - scripts/catalog/sync-catalog-images.js
  modified:
    - src/game/catalog.ts
    - public/catalog/**

key-decisions:
  - "Selected download option; audit found 0 missing assets after normalization"
  - "Add local path overrides for two accented filenames to avoid dev-server URL resolution issues"

patterns-established:
  - "Use local catalog override map when URL-encoded filenames fail to resolve"

# Metrics
duration: 44m 28s
completed: 2026-01-28
---

# Phase quick-001: There Are Missing Images In The Catalog Summary

**Playwright catalog image audit, sync script, and normalized asset paths to keep catalog images green in CI**

## Performance

- **Duration:** 44m 28s
- **Started:** 2026-01-28T14:50:44Z
- **Completed:** 2026-01-28T15:35:12Z
- **Tasks:** 3
- **Files modified:** 29

## Accomplishments
- Added Playwright spec that requests every catalog image URL and asserts 200 + image content-type
- Added sync script that audits catalog image assets and supports optional download
- Normalized catalog assets and added overrides for accented filenames to resolve dev server path issues

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Playwright E2E that fails on any missing catalog image** - `ae80480` (test)
2. **Task 2: Add a local sync script to detect and optionally download missing catalog images** - `337af40` (feat)
3. **Task 3: Download missing images (decision: download)** - `7a94e58` (fix)

## Files Created/Modified
- `tests/catalog-images.spec.ts` - Playwright audit for catalog assets via request API
- `scripts/catalog/sync-catalog-images.js` - Local audit script with optional downloads and overrides
- `src/game/catalog.ts` - Local path overrides for accented catalog images
- `public/catalog/**` - Normalized filenames and ASCII-safe variants for Wikimedia assets

## Decisions Made
- Selected download option; no missing assets after normalization and overrides
- Added local override mapping for two accented filenames to ensure dev-server URL resolution

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing node_modules to run Playwright**
- **Found during:** Task 1 (E2E verification)
- **Issue:** Playwright not installed in local workspace
- **Fix:** Ran `pnpm install`
- **Files modified:** None (dependency install only)
- **Verification:** `pnpm test:e2e -- tests/catalog-images.spec.ts`
- **Committed in:** N/A (environment fix)

**2. [Rule 1 - Bug] Catalog assets with accented filenames returned HTML instead of images**
- **Found during:** Task 3 (E2E verification)
- **Issue:** Dev server could not resolve two accented catalog filenames, causing image requests to return HTML
- **Fix:** Added local path overrides and ASCII-safe asset variants
- **Files modified:** src/game/catalog.ts, public/catalog/**, scripts/catalog/sync-catalog-images.js, tests/catalog-images.spec.ts
- **Verification:** `node scripts/catalog/sync-catalog-images.js`, `pnpm test:e2e -- tests/catalog-images.spec.ts`
- **Committed in:** 7a94e58 (task commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Required to run verification and keep catalog image URLs resolving in dev.

## Issues Encountered
- Catalog tab was not visible in headless runs with seeded storage; test includes a base-path fallback when tab is absent.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Catalog asset audit and sync script are ready for reuse in CI and future catalog updates
- No blockers

---
*Phase: quick-001-there-are-missing-images-in-the-catalog*
*Completed: 2026-01-28*
