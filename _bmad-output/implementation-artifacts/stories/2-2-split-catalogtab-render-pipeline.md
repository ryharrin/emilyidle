# Story 2.2: Split CatalogTab Render Pipeline

Status: review

## Story

As a developer,
I want CatalogTab split into focused submodules,
so that catalog rendering is maintainable and testable.

## Acceptance Criteria

1. **AC1**: CatalogTab is split into focused modules
   - Given the current `src/ui/tabs/CatalogTab.tsx` (~2599 LOC)
     When refactoring is complete
     Then it is split into:
   - `catalog/CatalogGrid.tsx` (~400 LOC) - Grid/list rendering
   - `catalog/CatalogFilters.tsx` (~300 LOC) - Filter controls
   - `catalog/CatalogCard.tsx` (~300 LOC) - Individual card component
   - `catalog/CatalogDetails.tsx` (~400 LOC) - Detail sheet
   - `catalog/useCatalogState.ts` (~300 LOC) - State management hook
   - `catalog/catalogSelectors.ts` (~200 LOC) - Catalog-specific selectors
   - `CatalogTab.tsx` (~300 LOC) - Composition only

2. **AC2**: All existing tests pass
   - Given the split is complete
     When tests run
     Then all existing catalog tests pass

3. **AC3**: No functional changes
   - Given the app runs
     When I browse the catalog
     Then all features work identically

4. **AC4**: Component interfaces are clear
   - Given the new components
     When I review the code
     Then each component has a well-defined interface (props/return types)

## Tasks / Subtasks

- [x] Task 1: Create catalog directory structure (AC: 1)
  - [x] Create `src/ui/tabs/catalog/` directory
  - [x] Create `src/ui/tabs/catalog/index.ts` barrel file
  - [x] Verify: Directory structure created

- [x] Task 2: Extract CatalogGrid component (AC: 1)
  - [x] Create `src/ui/tabs/catalog/CatalogGrid.tsx` (~294 LOC)
  - [x] Move grid/list rendering logic (virtualized list, lanes)
  - [x] Move movement section grouping (CATALOG_MOVEMENT_SECTIONS)
  - [x] Keep stable selectors (`data-testid="catalog-grid"`, etc.)
  - [x] Export CatalogGrid with props interface
  - [x] Verify: `pnpm -s run typecheck` (pre-existing errors only)

- [x] Task 3: Extract CatalogFilters component (AC: 1)
  - [x] Create `src/ui/tabs/catalog/CatalogFilters.tsx` (~488 LOC)
  - [x] Move filter panel, toggles, active count badge
  - [x] Move filter state management (controlled by parent)
  - [x] Keep collapsible behavior and mobile layout
  - [x] Export CatalogFilters with props interface
  - [x] Verify: `pnpm -s run typecheck` (pre-existing errors only)

- [x] Task 4: Extract CatalogCard component (AC: 1)
  - [x] Create `src/ui/tabs/catalog/CatalogCard.tsx` (~453 LOC)
  - [x] Move individual card rendering
  - [x] Move tier badge, lock overlay, purchase button
  - [x] Keep stable card selectors
  - [x] Export CatalogCard with props interface
  - [x] Verify: `pnpm -s run typecheck` (pre-existing errors only)

- [x] Task 5: Extract CatalogDetails component (AC: 1)
  - [x] Create `src/ui/tabs/catalog/CatalogDetails.tsx` (~247 LOC)
  - [x] Move detail sheet/bottom sheet rendering
  - [x] Move watch metadata display
  - [x] Keep portal and focus management
  - [x] Export CatalogDetails with props interface
  - [x] Verify: `pnpm -s run typecheck` (pre-existing errors only)

- [x] Task 6: Extract useCatalogState hook (AC: 1)
  - [x] Create `src/ui/tabs/catalog/useCatalogState.ts` (~177 LOC)
  - [x] Move catalog view state (grid vs list, sort, filter state)
  - [x] Move URL query param synchronization
  - [x] Keep localStorage persistence if any
  - [x] Export useCatalogState
  - [x] Verify: `pnpm -s run typecheck` (pre-existing errors only)

- [x] Task 7: Extract catalogSelectors (AC: 1)
  - [x] Create `src/ui/tabs/catalog/catalogSelectors.ts` (~215 LOC)
  - [x] Move catalog-specific selector logic
  - [x] Move filtered/sorted entry computation
  - [x] Keep imports from main selectors/index.ts
  - [x] Export catalogSelectors
  - [x] Verify: `pnpm -s run typecheck` (pre-existing errors only)

- [x] Task 8: Refactor CatalogTab.tsx (AC: 1, 3, 4)
  - [x] CatalogTab.tsx refactored to composition layer
  - [x] Import and compose: CatalogFilters, CatalogGrid, CatalogDetails
  - [x] Use useCatalogState for state management
  - [x] Wire callbacks between components
  - [x] Update barrel exports
  - [x] Verify: `pnpm -s run typecheck` (pre-existing errors only)

- [x] Task 9: Run catalog test suite (AC: 2)
  - [x] Run: `pnpm -s run test:unit -- tests/catalog.unit.test.tsx`
  - [x] All 79 catalog tests pass

- [x] Task 10: Run full test suite (AC: 2)
  - [x] Run: `pnpm -s run test:unit`
  - [x] All 340 unit tests pass

## Dev Notes

### Architecture Patterns

- **Component composition**: CatalogTab becomes orchestration layer
- **Custom hook**: useCatalogState manages local catalog state
- **Selector colocation**: Catalog-specific selectors near components
- **Stable selectors**: Preserve all data-testid attributes

### Source Tree Changes

**New directory:**

```
src/ui/tabs/catalog/
├── index.ts                    # Barrel exports
├── CatalogGrid.tsx             # Grid rendering (~294 LOC)
├── CatalogFilters.tsx          # Filter controls (~488 LOC)
├── CatalogCard.tsx             # Individual card (~453 LOC)
├── CatalogDetails.tsx          # Detail sheet (~247 LOC)
├── useCatalogState.ts        # State hook (~177 LOC)
├── catalogSelectors.ts         # Local selectors (~215 LOC)
└── catalogPresentation.ts      # Existing presentation constants
```

**Modified:**

- `src/ui/tabs/CatalogTab.tsx` - Refactored to composition layer

### Component Interfaces

**CatalogGrid:**

```typescript
interface CatalogGridProps {
  entries: CatalogEntry[];
  allEntries: CatalogEntry[];
  state: GameState;
  isCompact: boolean;
  isExpertMode: boolean;
  showFacts: boolean;
  showLaneLayout: boolean;
  favoriteIds: ReadonlySet<string>;
  expandedCards: Record<string, boolean>;
  purchaseHighlights: Record<string, boolean>;
  nowMs?: number;
  effectiveCashRateCentsPerSec: number;
  effectiveEnjoymentRateCentsPerSec: number;
  craftingPartsPerWatch: Record<string, number>;
  atelierUnlocked: boolean;
  filterSignature: string;
  detailsSheetTarget: { entryId: string } | null;
  onPurchase: (nextState: GameState) => void;
  onToggleExpand: (entryId: string, isOpen: boolean) => void;
  onOpenDetails: (entryId: string, trigger: HTMLButtonElement | null) => void;
  onInteract?: (itemId: WatchItemId) => void;
}
```

**CatalogFilters:**

```typescript
interface CatalogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  style: "all" | "womens";
  onStyleChange: (value: "all" | "womens") => void;
  sort: "default" | "brand" | "year" | "tier";
  onSortChange: (value: "default" | "brand" | "year" | "tier") => void;
  era: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown";
  onEraChange: (value: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown") => void;
  type: "all" | "gmt" | "manual" | "dress" | "diver";
  onTypeChange: (value: "all" | "gmt" | "manual" | "dress" | "diver") => void;
  isCompact: boolean;
  onToggleDensity: () => void;
  isExpertMode: boolean;
  onToggleViewMode: () => void;
  quickPreset: CatalogQuickPreset;
  onQuickPresetChange: (value: CatalogQuickPreset) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  tab: CatalogTabId;
  focusedTab: CatalogTabId;
  onTabChange: (value: CatalogTabId) => void;
  onTabFocus: (value: CatalogTabId) => void;
  onTabKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  activeFilterCount: number;
  brands: ReadonlyArray<string>;
  resultsCount: number;
  unownedReady: boolean;
  ownedReady: boolean;
  embeddedInVault?: boolean;
  showHelp?: boolean;
  showUndo?: boolean;
  canUndoLastPurchase?: boolean;
  undoStatus?: "available" | "expired" | "idle";
  undoRemainingMs?: number;
  undoExpiredMsAgo?: number;
  lastPurchaseModelId?: string | null;
  onUndo?: () => void;
}
```

**CatalogCard:**

```typescript
interface CatalogCardProps {
  entry: CatalogEntry;
  state: GameState;
  isCompact: boolean;
  isExpertMode: boolean;
  isHighlighted: boolean;
  isExpanded: boolean;
  isDetailsOpen: boolean;
  isFavorite: boolean;
  showFacts: boolean;
  nowMs?: number;
  effectiveCashRateCentsPerSec: number;
  effectiveEnjoymentRateCentsPerSec: number;
  craftingPartsPerWatch: Record<string, number>;
  atelierUnlocked: boolean;
  onPurchase: (nextState: GameState) => void;
  onToggleExpand: (isOpen: boolean) => void;
  onOpenDetails: (trigger: HTMLButtonElement | null) => void;
  onInteract?: (itemId: WatchItemId) => void;
}
```

### Testing Strategy

- Unit tests: All 79 catalog tests pass
- Full test suite: All 340 unit tests pass
- E2E tests: Not run (focused on refactoring, no functional changes)
- Build: Successful

### Risk Areas

- **Risk**: Filter state synchronization breaks
  - **Mitigation**: Preserved all filter state logic, tests pass
- **Risk**: Virtualized list performance degrades
  - **Mitigation**: Preserved windowing logic exactly
- **Risk**: Detail sheet focus management breaks
  - **Mitigation**: Kept focus trap logic intact

### References

- Source: `.planning/milestones/v5.0-GAP-AUDIT-2026-02-11.md` (DEBT-01)
- Original file: `src/ui/tabs/CatalogTab.tsx` (~2344 LOC)
- New structure: Feature-based component organization

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - Pure refactoring, no functional changes

### Completion Notes List

- [x] Component interfaces defined
- [x] All data-testid preserved
- [x] Filter state sync working
- [x] Virtualized list performance maintained
- [x] Mobile layout intact
- [x] All 79 catalog tests pass
- [x] All 340 unit tests pass
- [x] Build succeeds

### File List

**New files:**

- `src/ui/tabs/catalog/index.ts` (14 LOC)
- `src/ui/tabs/catalog/CatalogGrid.tsx` (294 LOC)
- `src/ui/tabs/catalog/CatalogFilters.tsx` (488 LOC)
- `src/ui/tabs/catalog/CatalogCard.tsx` (453 LOC)
- `src/ui/tabs/catalog/CatalogDetails.tsx` (247 LOC)
- `src/ui/tabs/catalog/useCatalogState.ts` (177 LOC)
- `src/ui/tabs/catalog/catalogSelectors.ts` (215 LOC)

**Modified:**

- `src/ui/tabs/CatalogTab.tsx` - Refactored to composition layer

## Change Log

- 2026-02-19: Created catalog directory structure and barrel exports
- 2026-02-19: Extracted CatalogGrid component with virtualization
- 2026-02-19: Extracted CatalogFilters component with all filter controls
- 2026-02-19: Extracted CatalogCard component with full card rendering
- 2026-02-19: Extracted CatalogDetails component for detail sheet
- 2026-02-19: Extracted useCatalogState hook for state management
- 2026-02-19: Extracted catalogSelectors for catalog-specific logic
- 2026-02-19: Refactored CatalogTab.tsx to use new components
- 2026-02-19: All 79 catalog tests pass
- 2026-02-19: All 340 unit tests pass
- 2026-02-19: Build successful
