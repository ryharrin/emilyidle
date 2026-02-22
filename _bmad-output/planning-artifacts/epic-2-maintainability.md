# Epic 2: Module Splitting & Maintainability

## Overview

This epic addresses the technical debt identified in v5.0 DEBT-01: splitting oversized modules to reduce regression risk and improve testability. The codebase has several files that exceed maintainable LOC thresholds.

## Epic Goal

Split monolithic files into focused modules with clear boundaries, improving maintainability without losing functionality or test coverage.

---

## Epic 2.1: Split App.tsx Orchestration

**As a** developer,
**I want** App.tsx split into focused modules,
**So that** UI orchestration is maintainable and less prone to merge conflicts.

**Acceptance Criteria:**

**Given** the current `src/App.tsx` (~2283 LOC),
**When** refactoring is complete,
**Then** it is split into:

- `AppShell.tsx` - Root layout and shell
- `AppProviders.tsx` - Context providers composition
- `AppTabs.tsx` - Tab state and navigation
- `AppModals.tsx` - Modal orchestration
- `useAppRuntime.ts` - Game runtime hook

**Given** the split is complete,
**When** tests run,
**Then** all existing tests pass without modification.

---

## Epic 2.2: Split CatalogTab Render Pipeline

**As a** developer,
**I want** CatalogTab split into focused submodules,
**So that** catalog rendering is maintainable and testable.

**Acceptance Criteria:**

**Given** the current `src/ui/tabs/CatalogTab.tsx` (~2599 LOC),
**When** refactoring is complete,
**Then** it is split into:

- `catalog/CatalogGrid.tsx` - Grid/list rendering
- `catalog/CatalogFilters.tsx` - Filter controls
- `catalog/CatalogCard.tsx` - Individual card component
- `catalog/CatalogDetails.tsx` - Detail sheet
- `catalog/useCatalogState.ts` - State management hook
- `catalog/catalogSelectors.ts` - Catalog-specific selectors

**Given** the split is complete,
**When** tests run,
**Then** all existing catalog tests pass.

---

## Epic 2.3: Split Game Selectors Index

**As a** developer,
**I want** the monolithic selectors index split by domain,
**So that** selector logic is organized and tree-shakeable.

**Acceptance Criteria:**

**Given** the current `src/game/selectors/index.ts` (~1874 LOC),
**When** refactoring is complete,
**Then** it is split into:

- `selectors/career/` - Career-related selectors
- `selectors/collection/` - Collection-related selectors
- `selectors/economy/` - Currency/enjoyment selectors
- `selectors/interactions/` - Interaction selectors (already exists, expand)
- `selectors/prestige/` - Prestige/atelier selectors
- `selectors/index.ts` - Re-exports only (barrel file)

**Given** the split is complete,
**When** tests run,
**Then** all selector unit tests pass.

---

## Epic 2.4: Extract CSS by Domain

**As a** developer,
**I want** style.css split by feature domain,
**So that** styles are maintainable and only needed CSS is loaded.

**Acceptance Criteria:**

**Given** the current `src/style.css` (~8648 LOC),
**When** refactoring is complete,
**Then** it is split into:

- `styles/base.css` - Reset, variables, utilities
- `styles/components.css` - Reusable components
- `styles/tabs/career.css` - Career tab styles
- `styles/tabs/catalog.css` - Catalog tab styles
- `styles/tabs/collection.css` - Collection tab styles
- `styles/modals.css` - Modal styles
- `styles/mobile.css` - Mobile-specific overrides
- `style.css` - Imports only (or build-time concatenation)

**Given** the split is complete,
**When** the app builds,
**Then** styles are functionally equivalent (no visual regressions).

---

## Requirements Coverage

- **DEBT-01**: Split oversized touched modules (v5.0 Phase 60)

## Technical Notes

- **No functional changes**: Pure refactoring, behavior must remain identical
- **Preserve exports**: Maintain backward compatibility via barrel files
- **Test coverage**: All existing tests must pass
- **Incremental**: Can be done module-by-module
- **Code review critical**: Each split should be reviewed for correctness

## Dependencies

- Story 2.1, 2.2, 2.3, 2.4 are independent and can be worked in parallel
- Recommend order: 2.3 (selectors) → 2.1 (App) → 2.2 (Catalog) → 2.4 (CSS)

## Success Criteria

- All original files under 500 LOC
- No test regressions
- No visual regressions
- Bundle size neutral or improved
- Developer experience improved (faster navigation, clearer structure)
