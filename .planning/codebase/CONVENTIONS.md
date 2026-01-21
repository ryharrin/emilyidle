# Coding Conventions

**Analysis Date:** 2026-01-21

## Naming Patterns

**Files:**
- PascalCase for React components (`src/App.tsx`)
- lower-case module files for domain logic (`src/game/state.ts`, `src/game/sim.ts`)
- Unit tests named `*.unit.test.tsx` (`tests/catalog.unit.test.tsx`)
- E2E tests named `*.spec.ts` (`tests/collection-loop.spec.ts`)

**Functions:**
- camelCase for functions (`loadSaveFromLocalStorage`, `buyItem`) - `src/game/persistence.ts`, `src/game/state.ts`
- No special prefix for async functions (`handleExport`) - `src/App.tsx`
- Event handlers use `handle*` naming (`handleTabKeyDown`, `handleExport`) - `src/App.tsx`

**Variables:**
- camelCase for variables (`saveDirtyRef`, `catalogEntries`) - `src/App.tsx`
- UPPER_SNAKE_CASE for constants (`MAX_FRAME_DELTA_MS`, `SIM_TICK_MS`) - `src/App.tsx`, `src/game/sim.ts`
- No underscore prefix for private values (module scope only)

**Types:**
- PascalCase for types and interfaces (`GameState`, `CatalogEntry`) - `src/game/state.ts`, `src/game/catalog.ts`
- Union string literal types for IDs (`WatchItemId`, `MilestoneId`) - `src/game/state.ts`

## Code Style

**Formatting:**
- Prettier with `.prettierrc.json`
- 100 character line length
- Double quotes for strings
- Semicolons required
- Trailing commas enabled

**Linting:**
- ESLint with `eslint.config.js`
- Uses `@eslint/js` + `typescript-eslint` recommended configs
- Prettier integration via `eslint-config-prettier`
- Run: `pnpm run lint`

## Import Organization

**Order:**
1. External packages (`react`, `@testing-library/react`) - `src/App.tsx`, `tests/catalog.unit.test.tsx`
2. Internal modules (`./game/state`, `../src/App`) - `src/App.tsx`, `tests/workshop.unit.test.tsx`
3. Relative imports for local modules
4. Type-only imports use `import type` - `src/App.tsx`, `src/game/persistence.ts`

**Grouping:**
- Blank lines between import groups (external vs internal)
- No explicit sorting rules detected beyond grouping

**Path Aliases:**
- Not detected

## Error Handling

**Patterns:**
- Return `ok: false` result objects for failures (`SaveDecodeResult`) - `src/game/persistence.ts`
- try/catch around localStorage and JSON parsing - `src/game/persistence.ts`, `src/App.tsx`
- UI logs warnings for invalid saves - `src/App.tsx`

**Error Types:**
- String error messages on failure (`SaveDecodeResult`) - `src/game/persistence.ts`
- No custom Error subclasses detected

## Logging

**Framework:**
- Console logging (`console.info`, `console.warn`) - `src/App.tsx`, `src/game/persistence.ts`

**Patterns:**
- Log save load status and invalid saves
- No structured logger detected

## Comments

**When to Comment:**
- Minimal inline comments; behavior is largely self-documenting

**JSDoc/TSDoc:**
- Not detected

**TODO Comments:**
- Not detected in `src/` or `tests/`

## Function Design

**Size:**
- Large functions in `src/App.tsx`; game logic uses small pure functions in `src/game/state.ts`

**Parameters:**
- Prefer explicit parameters; some functions accept option objects (`createStateFromSave`) - `src/game/state.ts`

**Return Values:**
- Pure functions return new `GameState` objects (`buyItem`, `prestigeWorkshop`) - `src/game/state.ts`

## Module Design

**Exports:**
- Named exports for domain helpers (`src/game/state.ts`)
- Default export for main React component (`src/App.tsx`)

**Barrel Files:**
- Not detected

---

*Convention analysis: 2026-01-21*
*Update when patterns change*
