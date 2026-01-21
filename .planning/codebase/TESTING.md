# Testing Patterns

**Analysis Date:** 2026-01-21

## Test Framework

**Runner:**
- Vitest 1.6
- Config: `vitest.config.ts` and inline `vitest` config in `package.json`

**Assertion Library:**
- Vitest built-in `expect`
- Matchers: `toBe`, `toEqual`, `toContain`, `toHaveCount` (examples in `tests/catalog.unit.test.tsx`)

**Run Commands:**
```bash
pnpm run test:unit                     # Run unit tests (Vitest)
pnpm run test:e2e                      # Run Playwright e2e tests
pnpm run test:unit -- --watch          # Watch mode (Vitest)
pnpm run test:unit -- path/to/file     # Single file
```

## Test File Organization

**Location:**
- Separate `tests/` directory for all tests
- Unit tests: `tests/*.unit.test.tsx`
- E2E tests: `tests/*.spec.ts`

**Naming:**
- Unit: `catalog.unit.test.tsx`, `workshop.unit.test.tsx`
- E2E: `collection-loop.spec.ts`

**Structure:**
```
tests/
  catalog.unit.test.tsx
  workshop.unit.test.tsx
  maison.unit.test.tsx
  collection-loop.spec.ts
  vitest.setup.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

describe("feature", () => {
  beforeEach(() => {
    render(<App />);
  });

  afterEach(() => {
    cleanup();
  });

  it("does something", () => {
    expect(screen.getByRole("tab")).toBeTruthy();
  });
});
```

**Patterns:**
- `beforeEach` for setup, `afterEach` for cleanup (`tests/catalog.unit.test.tsx`)
- Testing Library queries via `screen`, `within`
- E2E tests rely on `data-testid` and role selectors (`tests/collection-loop.spec.ts`)

## Mocking

**Framework:**
- Vitest built-in mocking (not heavily used)

**Patterns:**
- Local storage is seeded directly in tests (`tests/catalog.unit.test.tsx`)
- E2E seeding via `page.addInitScript` (`tests/collection-loop.spec.ts`)

**What to Mock:**
- None explicitly documented; tests prefer real in-memory behavior

**What NOT to Mock:**
- Domain logic functions in `src/game/state.ts` (used directly in unit tests)

## Fixtures and Factories

**Test Data:**
```typescript
const seededState = {
  ...createInitialState(),
  items: { ...baseState.items, chronograph: 2 },
};
```

**Location:**
- Inline in test files (`tests/catalog.unit.test.tsx`, `tests/collection-loop.spec.ts`)

## Coverage

**Requirements:**
- No explicit coverage targets detected

**Configuration:**
- No coverage config or scripts detected in `package.json`

**View Coverage:**
```bash
pnpm run test:unit -- --coverage       # Use Vitest coverage flag if needed
```

## Test Types

**Unit Tests:**
- React UI and domain logic tests in `tests/*.unit.test.tsx`
- Uses jsdom environment (`vitest.config.ts`)

**Integration Tests:**
- Not separated; unit tests cover multiple modules together (e.g., App + state)

**E2E Tests:**
- Playwright in `tests/*.spec.ts`
- Runs against dev server on port 5177 (`playwright.config.ts`)

## Common Patterns

**Async Testing:**
```typescript
const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
expect(cards.length).toBeGreaterThan(0);
```

**Error Testing:**
```typescript
await expect(page.locator(selectors.saveStatus)).toContainText("Paste an exported save string");
```

**Snapshot Testing:**
- Not used in this codebase

---

*Testing analysis: 2026-01-21*
*Update when test patterns change*
