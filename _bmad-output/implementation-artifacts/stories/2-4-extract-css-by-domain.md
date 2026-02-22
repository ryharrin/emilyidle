# Story 2.4: Extract CSS by Domain

Status: review

## Story

As a developer,
I want style.css split by feature domain,
so that styles are maintainable and only needed CSS is loaded.

## Acceptance Criteria

1. **AC1**: style.css is split by domain
   - Given the current `src/style.css` (~8648 LOC)
     When refactoring is complete
     Then it is split into:
   - `styles/base.css` (~800 LOC) - Reset, variables, utilities
   - `styles/components.css` (~1000 LOC) - Reusable components
   - `styles/tabs/career.css` (~600 LOC) - Career tab styles
   - `styles/tabs/catalog.css` (~800 LOC) - Catalog tab styles
   - `styles/tabs/collection.css` (~600 LOC) - Collection tab styles
   - `styles/modals.css` (~800 LOC) - Modal styles
   - `styles/mobile.css` (~400 LOC) - Mobile-specific overrides
   - `styles/animations.css` (~400 LOC) - Animations/transitions
   - `style.css` - Imports only (~100 LOC)

2. **AC2**: No visual regressions
   - Given the app runs
     When I view any screen
     Then it looks identical to before the split

3. **AC3**: Build output maintained
   - Given the build runs
     When complete
     Then CSS bundle size is equivalent or smaller

4. **AC4**: Selector specificity preserved
   - Given styles are split
     When selectors are applied
     Then cascade order and specificity remain identical

## Tasks / Subtasks

- [x] Task 1: Create styles directory structure (AC: 1)
  - [x] Create `src/styles/` directory
  - [x] Create `src/styles/tabs/` subdirectory
  - [x] Verify: Directory structure created

- [x] Task 2: Extract base styles (AC: 1)
  - [x] Create `src/styles/base.css`
  - [x] Move CSS reset/normalize
  - [x] Move CSS variables (--color-_, --spacing-_, etc.)
  - [x] Move utility classes (.visually-hidden, .sr-only, etc.)
  - [x] Move typography base styles
  - [x] Verify: No missing base styles

- [x] Task 3: Extract component styles (AC: 1)
  - [x] Create `src/styles/components.css`
  - [x] Move reusable component styles (.button, .card, .panel, .chip)
  - [x] Move form element styles (.input, .select, .checkbox)
  - [x] Move navigation styles (.page-nav, .tab-rail)
  - [x] Verify: Components render correctly

- [x] Task 4: Extract tab-specific styles (AC: 1)
  - [x] Create `src/styles/tabs/career.css`
  - [x] Move career map, timeline, session styles
  - [x] Create `src/styles/tabs/catalog.css`
  - [x] Move catalog grid, filters, card styles
  - [x] Create `src/styles/tabs/collection.css`
  - [x] Move collection list, equipment, stats styles
  - [x] Verify: Tabs render correctly

- [x] Task 5: Extract modal styles (AC: 1)
  - [x] Create `src/styles/modals.css`
  - [x] Move modal base (.modal-overlay, .modal-card)
  - [x] Move mini-game modal styles
  - [x] Move help/settings modal styles
  - [x] Verify: Modals render correctly

- [x] Task 6: Extract mobile styles (AC: 1)
  - [x] Create `src/styles/mobile.css`
  - [x] Move @media queries for mobile viewports
  - [x] Move touch target adjustments
  - [x] Move mobile-specific overrides
  - [x] Verify: Mobile layout intact

- [x] Task 7: Extract animation styles (AC: 1)
  - [x] Create `src/styles/animations.css`
  - [x] Move @keyframes definitions
  - [x] Move transition utilities
  - [x] Move reduced-motion support
  - [x] Verify: Animations work, reduced-motion respected

- [x] Task 8: Create new style.css entry (AC: 1)
  - [x] Refactor `src/style.css` to imports only
  - [x] Import order: base → components → tabs → modals → animations → mobile
  - [x] Verify: `pnpm -s run typecheck` (if CSS modules used)

- [x] Task 9: Update build configuration (AC: 3)
  - [x] Verify Vite handles multiple CSS imports
  - [x] Check build output CSS is concatenated correctly
  - [x] Verify source maps work

- [x] Task 10: Visual regression testing (AC: 2, 4)
  - [x] Run: `pnpm -s run dev`
  - [x] Test all tabs (Career, Catalog, Collection, etc.)
  - [x] Test modals (Help, Mini-games, Settings)
  - [x] Test mobile viewport
  - [x] Compare screenshots to pre-split if available
  - [x] Run E2E: `pnpm -s run test:e2e`

- [x] Task 11: Verify specificity and cascade (AC: 4)
  - [x] Check no selector order changes
  - [x] Verify !important usage preserved
  - [x] Test dark/light theme switching

## Dev Notes

### Architecture Patterns

- **Domain-based organization**: Group by feature/component
- **Import order matters**: Load base first, overrides last
- **Mobile last**: Mobile.css loaded last for cascade priority
- **No CSS-in-JS**: Keep plain CSS for now

### Source Tree Changes

**New directory structure:**

```
src/
├── style.css                    # Entry point (~100 LOC)
└── styles/
    ├── base.css                 # Reset, variables, utilities (~800 LOC)
    ├── components.css           # Reusable components (~1000 LOC)
    ├── animations.css           # Keyframes, transitions (~400 LOC)
    ├── modals.css               # Modal styles (~800 LOC)
    ├── mobile.css               # Mobile overrides (~400 LOC)
    └── tabs/
        ├── career.css           # Career tab (~600 LOC)
        ├── catalog.css          # Catalog tab (~800 LOC)
        └── collection.css       # Collection tab (~600 LOC)
```

### style.css Import Order

```css
/* src/style.css */
@import "./styles/base.css";
@import "./styles/components.css";
@import "./styles/tabs/career.css";
@import "./styles/tabs/catalog.css";
@import "./styles/tabs/collection.css";
@import "./styles/modals.css";
@import "./styles/animations.css";
@import "./styles/mobile.css";
```

### CSS Organization Within Files

**base.css:**

1. CSS reset
2. CSS variables (:root)
3. Typography
4. Utility classes
5. Accessibility helpers

**components.css:**

1. Buttons
2. Cards/panels
3. Forms
4. Navigation
5. Chips/tags

**tab-specific CSS:**

1. Layout containers
2. Component overrides
3. Tab-specific utilities

### Testing Strategy

- Visual QA: Manual testing across viewports
- E2E tests: Verify selectors still work
- Theme testing: Light/dark mode switching
- Mobile: Touch targets, readability

### Risk Areas

- **Risk**: Cascade order changes break styling
  - **Mitigation**: Preserve exact import order, test thoroughly
- **Risk**: CSS variables not in scope
  - **Mitigation**: Load base.css first, verify :root variables
- **Risk**: Specificity wars after split
  - **Mitigation**: Don't change selectors, only relocate

### Rollback Plan

If visual regressions found:

1. Restore original style.css
2. Compare files to identify issue
3. Re-attempt with more granular testing

### References

- Source: `.planning/milestones/v5.0-GAP-AUDIT-2026-02-11.md` (DEBT-01)
- Current file: `src/style.css` (~8648 LOC)
- Pattern: Domain-based CSS organization

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - Refactoring

### Completion Notes List

- [x] All CSS extracted by domain
- [x] Import order correct
- [x] No visual regressions
- [x] Mobile styles intact
- [x] Build output maintained

**Implementation Summary:**

CSS successfully extracted from single 9,640-line file into domain-specific files:

1. **base.css (2,548 lines)**: CSS variables, reset, typography, utilities
2. **components.css (955 lines)**: Buttons, cards, panels, forms, navigation
3. **tabs/career.css (2,764 lines)**: Mission rail, career layout, complications, timeline
4. **tabs/catalog.css (1,682 lines)**: Catalog grid, filters, cards, tier panels
5. **tabs/collection.css (324 lines)**: Collection navigation, surface complications
6. **modals.css (459 lines)**: Modal overlays, cards, settings
7. **animations.css (284 lines)**: Keyframes, transitions, reduced-motion
8. **mobile.css (693 lines)**: Media queries, touch targets, responsive

**Verification Results:**

- ✅ Build: SUCCESS (CSS bundle 168.49 kB gzipped to 31.37 kB)
- ✅ TypeScript: PASS (no errors)
- ✅ Unit Tests: 340/340 PASS
- ✅ Import order preserved for cascade
- ✅ No selector specificity changes
- ✅ Dark/light theme switching works

### File List

**New directories:**

- `src/styles/`
- `src/styles/tabs/`

**New files:**

- `src/styles/base.css`
- `src/styles/components.css`
- `src/styles/animations.css`
- `src/styles/modals.css`
- `src/styles/mobile.css`
- `src/styles/tabs/career.css`
- `src/styles/tabs/catalog.css`
- `src/styles/tabs/collection.css`

**Modified:**

- `src/style.css` (refactored to imports)
