# Emily Idle - Development Guide

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **pnpm**: 9.15.0+ (specified in packageManager field)
- **Browser**: Modern browser with ES2020 support

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd watch-idle

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dev server runs on `http://127.0.0.1:5177`

## Development Workflow

### Running Development Server

```bash
pnpm dev
```

Features:

- Hot Module Replacement (HMR)
- Automatic page reload
- Source maps enabled
- Dev server at port 5177 (part of test contract)

### Code Quality Commands

```bash
# Format code
pnpm format              # Write changes
pnpm format:check        # Check only (CI)

# Lint
pnpm lint                # Check for issues

# Type check
pnpm typecheck           # TypeScript validation
```

**Important**: Run these before committing:

```bash
pnpm format && pnpm lint && pnpm typecheck
```

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test:unit

# Run specific test file
pnpm test:unit -- tests/interactions.unit.test.ts

# Run with filter
pnpm test:unit -- -t "should calculate income"

# Watch mode (for development)
pnpm exec vitest --config vitest.config.ts tests/interactions.unit.test.ts
```

**Unit Test Configuration**:

- Environment: jsdom
- Setup: `tests/vitest.setup.ts`
- Pattern: `tests/**/*.unit.test.{ts,tsx}`

### E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific spec
pnpm test:e2e -- tests/career-tree-interactions.spec.ts

# Run with grep (filter by test name)
pnpm test:e2e -- -g "should complete career session"

# Run headed (visible browser)
pnpm test:e2e -- --headed

# Run on specific project
pnpm test:e2e -- --project=chromium
pnpm test:e2e -- --project=webkit-mobile-iphone15

# Fast mode (local development)
pnpm test:e2e:fast

# Stable projects (for CI)
pnpm test:e2e:stable-projects

# Manual tests only
pnpm test:e2e:manual
```

**E2E Configuration**:

- Config: `playwright.config.ts`
- Port: 5177 (must match dev server)
- Reuses existing dev server if running

### Full CI Test Suite

```bash
pnpm test:ci:stable
```

Runs: unit tests → E2E stable projects → typecheck

## Build & Deployment

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

Build output goes to `dist/` directory.

### Build Configuration

- **Target**: ES2020
- **Module**: ESM
- **Minification**: Enabled in production
- **Base path**: `/emilyidle/`

## Project Structure Guidelines

### Adding New Components

```typescript
// src/ui/components/MyComponent.tsx
import React from "react";
import type { GameState } from "../../game/state";

interface MyComponentProps {
  state: GameState;
  nowMs: number;
  onAction: () => void;
}

export function MyComponent({ state, nowMs, onAction }: MyComponentProps) {
  return <div>{/* Component JSX */}</div>;
}
```

**Guidelines**:

- Keep files under 300 lines
- Props receive `state` and `nowMs`
- Use selectors to derive data
- Return early for guard conditions

### Adding New Selectors

```typescript
// src/game/selectors/mySelector.ts
import type { GameState } from "../model/types";

export function getMyValue(state: GameState): number {
  // Pure function: no side effects, no Date.now()
  return state.currencyCents * 2;
}
```

**Guidelines**:

- Functions must be pure
- Accept `nowMs` explicitly if time-dependent
- Export from `src/game/selectors/index.ts`

### Adding New Actions

```typescript
// src/game/actions/myAction.ts
import type { GameState } from "../model/types";

export function myAction(state: GameState, amount: number): GameState {
  // Guard: return unchanged if condition not met
  if (amount <= 0) {
    return state;
  }

  // Return new state
  return {
    ...state,
    currencyCents: state.currencyCents + amount,
  };
}
```

**Guidelines**:

- Return same reference if no change
- Always validate inputs
- Don't mutate input state

### Adding New Types

```typescript
// src/game/model/types.ts
export type MyNewType = {
  id: string;
  value: number;
};

export type MyNewId = "option1" | "option2" | "option3";
```

**Guidelines**:

- Use string literal unions for IDs
- Prefer readonly arrays for definitions
- Add JSDoc comments for complex types

## Domain Invariants

### Money Handling

All money values are in **cents** (integers):

```typescript
const CENTS_PER_DOLLAR = 100;

// Correct
const priceCents = 500; // $5.00

// Conversion
const dollars = priceCents / CENTS_PER_DOLLAR; // 5
const formatted = `$${(priceCents / 100).toFixed(2)}`; // "$5.00"
```

### Time Handling

```typescript
// Always pass nowMs explicitly
function getCurrentRate(state: GameState, nowMs: number): number {
  // Don't use Date.now() here
  return calculateRate(state, nowMs);
}

// In React component
const rate = useMemo(() => getCurrentRate(state, nowMs), [state, nowMs]);
```

### State Immutability

```typescript
// Correct: Returns new object
function updateState(state: GameState): GameState {
  return {
    ...state,
    currencyCents: state.currencyCents + 100,
  };
}

// Correct: Returns same reference if no change
function maybeUpdate(state: GameState): GameState {
  if (conditionNotMet) {
    return state; // Same reference
  }
  return { ...state /* changes */ };
}

// Wrong: Mutates existing object
function wrongUpdate(state: GameState) {
  state.currencyCents += 100; // Don't do this!
  return state;
}
```

## Testing Patterns

### Unit Test Pattern

```typescript
// tests/myFeature.unit.test.ts
import { describe, it, expect } from "vitest";
import { mySelector } from "../src/game/selectors/mySelector";
import { createInitialState } from "../src/game/model/state";

describe("mySelector", () => {
  it("should calculate value correctly", () => {
    // Given
    const state = createInitialState();

    // When
    const result = mySelector(state);

    // Then
    expect(result).toBe(expectedValue);
  });
});
```

### E2E Test Pattern

```typescript
// tests/myFlow.spec.ts
import { test, expect } from "@playwright/test";

test("should complete user flow", async ({ page }) => {
  // Given: Seed state
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("emily-idle:save", JSON.stringify(seedState));
  });
  await page.reload();

  // When: Perform actions
  await page.click('[data-testid="some-button"]');

  // Then: Assert outcomes
  await expect(page.locator('[data-testid="result"]')).toHaveText("expected");
});
```

## Common Development Tasks

### Adding a New Tab

1. Create component in `src/ui/tabs/MyTab.tsx`
2. Add to `TAB_DEFINITIONS` in `src/ui/navigation/tabMeta.ts`
3. Add case in `App.tsx` switch
4. Add icon if needed

### Adding a New Watch Model

1. Add entry to `src/game/data/watchModels.ts`
2. Add image to `public/catalog/[brand]/[model].jpg`
3. Update `WatchModelDefinition` type if needed
4. Add tests for new model

### Adding a New Career Node

1. Add node definition to appropriate `careerNodes*.ts` file
2. Add effect to `src/game/selectors/therapistNodeEffects.ts`
3. Update UI in `CareerTree.tsx` if visual change
4. Add tests for node logic

### Adding a New Achievement

1. Add to `ACHIEVEMENTS` array in `src/game/model/state.ts`
2. Add requirement type if new
3. Update `applyAchievementUnlocks` in selectors
4. Add achievement unlock logic

## Debugging

### Development Tools

```bash
# Run with dev tools
pnpm dev

# Open browser dev tools
# - React DevTools (if installed)
# - Redux DevTools (shows state changes)
```

### Debug Mode

Add `?dev` to URL for developer features:

- Shows dev panel
- Speed multiplier controls

### Console Logging

```typescript
// Telemetry events (production safe)
console.info("[ux] eventName", detail);

// Debug logging (dev only)
if (import.meta.env.DEV) {
  console.log("Debug info", data);
}
```

### Common Issues

**Issue**: Tests failing with port errors

```bash
# Kill process on port 5177
lsof -ti:5177 | xargs kill -9
```

**Issue**: localStorage quota exceeded

```bash
# Clear site data in browser
# DevTools → Application → Local Storage → Clear
```

**Issue**: Type errors after adding new field

```bash
# Run typecheck to see all errors
pnpm typecheck

# Check PersistedGameState type
# Must match GameState but with optional fields
```

## Performance Guidelines

### Memoization

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => calculateExpensive(state, nowMs), [state, nowMs]);

// Memoize callbacks
const handleClick = useCallback(() => performAction(state), [state]);
```

### Virtualization

For long lists, use `@tanstack/react-virtual`:

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  // Render virtual items
}
```

### Avoiding Re-renders

```typescript
// Stable selector reference
const stableSelector = useCallback((state) => getSpecificValue(state), []);

// Split large components
const MemoizedChild = memo(ChildComponent);
```

## Build & Release

### Pre-commit Checklist

- [ ] `pnpm format:check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:unit` passes
- [ ] `pnpm test:e2e:fast` passes
- [ ] All AGENTS.md conventions followed

### Release Process

1. Run full CI suite
2. Build production: `pnpm build`
3. Test production build: `pnpm preview`
4. Deploy `dist/` to hosting

## Getting Help

### Documentation

- `AGENTS.md` - Project conventions
- `src/game/AGENTS.md` - Game logic conventions
- `src/ui/AGENTS.md` - UI conventions
- `tests/AGENTS.md` - Testing conventions

### IDE Setup

**VS Code**:

- Install ESLint extension
- Install Prettier extension
- Enable "Format on Save"

### Resources

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
