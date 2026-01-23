# Phase 18: Codebase Refactor - Research

**Researched:** 2026-01-23
**Domain:** React + TypeScript app refactor (separating UI, runtime, and game/domain logic)
**Confidence:** HIGH

## Summary

This phase is a structural refactor of an already-working Vite + React + TypeScript idle game. The current implementation concentrates most UI, runtime orchestration (RAF tick + autosave), and UI-only settings in `src/App.tsx`, while `src/game/state.ts` mixes domain types, static definitions, selectors, and state transition functions. Refactoring should reduce file size and coupling without changing behavior.

The hard constraints are test contracts and persistence contracts. Playwright/Vitest depend on stable `id` and `data-testid` selectors and specific accessible names (tab names). Persistence depends on stable localStorage keys and the save payload shape (versioned JSON with `version`, `savedAt`, `lastSimulatedAtMs`, `state`), including the legacy key migration path.

**Primary recommendation:** Refactor by introducing a dedicated “game runtime” hook/module for side effects and splitting the domain layer into `model` + `definitions` + `selectors` + `actions`, while keeping existing exported APIs and DOM selectors stable.

## Standard Stack

This refactor should stay within the repo’s existing stack (no new state libraries):

### Core
| Library | Version (repo) | Purpose | Why Standard |
|---------|-----------------|---------|--------------|
| react | ^18.3.1 | UI rendering + hooks | Existing app runtime; refactor relies on hooks boundaries |
| react-dom | ^18.3.1 | React DOM renderer | Existing app runtime |
| typescript | ^5.8.0 | Type safety | Refactor safety net for module boundaries |
| vite | ^6.0.0 | Build/dev server | Existing bundler; `import.meta.env.BASE_URL` used |

### Supporting
| Library | Version (repo) | Purpose | When to Use |
|---------|-----------------|---------|-------------|
| vitest | ^1.6.0 | Unit tests | Validate domain logic remains identical |
| @playwright/test | ^1.49.1 | E2E tests | Validate DOM selectors + persistence behavior |
| eslint + typescript-eslint | ^9.39.2 / ^8.53.0 | Linting | Catch refactor regressions |
| prettier | ^3.8.0 | Formatting | Keep diffs readable |

## Architecture Patterns

### Recommended Project Structure
Use clear module boundaries: domain (pure), runtime (side effects), UI (React).

```
src/
├── game/
│   ├── model/                 # Types + state shape (no React, no browser APIs)
│   ├── data/                  # Static definitions (items, upgrades, milestones, catalog entries)
│   ├── selectors/             # Derived computations (rates, visibility, labels)
│   ├── actions/               # State transitions (buy/upgrade/prestige/etc.)
│   ├── sim/                   # Tick/step logic
│   ├── persistence/           # Save encode/decode + localStorage (keys MUST remain stable)
│   └── state.ts               # Facade re-export layer to keep import churn low
├── ui/
│   ├── tabs/                  # One component per tab/panel
│   ├── components/            # Shared UI components (cards, panels)
│   └── hooks/                 # UI-only hooks (theme/settings)
└── App.tsx                    # Composition root; wires tabs + runtime hook
```

### Pattern 1: Pure Domain Layer (No Side Effects)
**What:** Keep game logic as pure functions over `GameState` with immutable updates.
**When to use:** All computations and state transitions that should be unit-testable and deterministic.
**Key rule:** Pass time as an argument (e.g., `nowMs`) rather than calling `Date.now()` inside domain functions.

**Example:**
```ts
// Source: src/game/sim.ts
export function step(state: GameState, dtMs: number, nowMs = Date.now()): GameState {
  // ...pure-ish tick; refactor should keep the signature and behavior stable
}
```

### Pattern 2: Runtime Orchestration in a Dedicated Hook/Module
**What:** Encapsulate RAF ticking, autosave cadence, and lifecycle save triggers in a single hook so UI components don’t own orchestration details.
**When to use:** Anything touching `window`, `document`, `localStorage`, `requestAnimationFrame`.
**Key rule:** Preserve the test behavior: the sim loop must be disabled in test environments (`isTestEnvironment()` currently gates it).

**Example:**
```ts
// Source: src/App.tsx (current pattern to preserve)
// Refactor target: src/game/runtime/useGameRuntime.ts (or similar)
type UseGameRuntimeArgs = {
  initialState: () => GameState;
  step: (state: GameState, dtMs: number, nowMs?: number) => GameState;
  load: () => { ok: true; state: GameState } | { ok: false; empty?: true; error?: string };
  persist: (state: GameState, lastSimulatedAtMs: number) => { ok: true } | { ok: false; error: string };
  isTestEnvironment: () => boolean;
};

export function useGameRuntime(args: UseGameRuntimeArgs) {
  // owns: state, stateRef, raf loop, autosave/visibility/pagehide
  // UI reads: state + imperative helpers (import/export) exposed as callbacks
}
```

### Pattern 3: UI Split by Tabs While Keeping Selector Contracts
**What:** Extract each tab into its own component, but keep the outer DOM structure and selectors stable.
**When to use:** `App.tsx` contains multiple distinct panels (Vault, Career, Atelier, Maison, Catalog, Stats, Save).
**Key rule:** Treat selectors and accessible names as public API.

Concrete selector contracts to preserve (tests depend on these):
- `id`s: `collection`, `career`, `workshop`, `maison`, `catalog`, `stats`, `save` panels; `${tabId}-tab` tab button ids.
- Stats `id`s: `#currency`, `#income`, `#collection-value`, `#softcap`, `#enjoyment`, `#enjoyment-rate`.
- List `id`s: `#collection-list`, `#upgrade-list`, `#milestone-list`, `#set-bonus-list`.
- `data-testid`s used in tests: `catalog-grid`, `catalog-card`, `catalog-filters`, `catalog-results-count`, `workshop-panel`, `maison-panel`, `career-panel`, `set-bonus-list`, plus many others in `tests/**/*.spec.ts` and `tests/**/*.unit.test.tsx`.

### Anti-Patterns to Avoid
- **Changing export surface unintentionally:** Prefer `src/game/state.ts` as a facade that re-exports the existing function names while you reorganize internals.
- **Introducing new state libraries:** This phase is about separation, not a state management migration.
- **Letting `import.meta.env` leak into domain logic:** Keep `import.meta.env.BASE_URL` usage in UI/asset helpers (currently in `src/game/catalog.ts` via `getCatalogImageUrl`).
- **Over-splitting causing circular imports:** Keep a strict dependency direction: `model` <- `data` <- (`selectors`,`actions`,`sim`) and UI depends on all of them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Save migrations | A new migration framework | Existing `createStateFromSave` + versioned save payload | Save compatibility is already encoded; expanding scope adds risk |
| Persistence keys | New keys or a new storage schema | Keep `emily-idle:save`, `watch-idle:save`, `emily-idle:audio`, `emily-idle:settings` | Tests and existing players rely on them |
| State management overhaul | Redux/Zustand/custom store | Continue with React state + pure game functions (or `useReducer` if helpful) | Refactor goal is separation, not a paradigm shift |
| Deep cloning utilities | JSON stringify/parse cloning | Immutable updates with object/record spreads (existing pattern) | JSON cloning breaks types and can be slow/buggy |

**Key insight:** For this phase, behavioral compatibility (selectors + save format) is the product; any refactor that expands scope beyond “move code without changing meaning” increases risk and planning complexity.

## Common Pitfalls

### Pitfall 1: Breaking Playwright selectors and accessibility contracts
**What goes wrong:** E2E tests fail because `id`s/`data-testid`s change or tab labels change.
**Why it happens:** Components get rewritten and IDs/testids are “cleaned up.”
**How to avoid:** Treat selectors as API; keep a checklist of all selectors referenced in `tests/**/*.spec.ts`.
**Warning signs:** Large diffs in JSX attributes; failing tests like “locator resolved to 0 elements.”

### Pitfall 2: Breaking localStorage contracts
**What goes wrong:** Autosave/import/export tests fail; old saves no longer load.
**Why it happens:** Keys or payload shape change during refactor.
**How to avoid:** Keep these stable:
- Keys: `emily-idle:save`, `watch-idle:save`, `emily-idle:audio`, `emily-idle:settings`
- Save payload shape: `{ version: 2, savedAt, lastSimulatedAtMs, state }`
**Warning signs:** Failures around `decodeSavePayload`, seeded saves not loading, or missing save after load.

### Pitfall 3: Accidentally enabling the sim loop in tests
**What goes wrong:** Vitest becomes flaky/hangs due to RAF loop running under jsdom.
**Why it happens:** `isTestEnvironment()` check gets moved/removed.
**How to avoid:** Keep a single `isTestEnvironment()` helper used by runtime orchestration, and keep the logic equivalent to current.
**Warning signs:** Tests timing out, CPU spikes during unit tests.

### Pitfall 4: Circular dependencies after splitting modules
**What goes wrong:** TypeScript build errors or runtime undefined imports.
**Why it happens:** `state` pulls in `catalog`, `catalog` pulls in `state`, etc.
**How to avoid:** Move shared types “down” into `model/` and keep `catalog` data separate from UI helpers.
**Warning signs:** TS errors about import cycles or `Cannot access 'X' before initialization`.

## Code Examples

### Facade Module to Minimize Import Churn
This enables internal re-org without forcing `App.tsx` and tests to update all imports at once.

```ts
// Source: recommended approach for src/game/state.ts
export type { GameState, WatchItemId, UpgradeId } from "./model/types";

export { createInitialState, createStateFromSave } from "./model/state";

export {
  getWatchItems,
  getUpgrades,
  getMilestones,
  // ...selectors
} from "./selectors";

export {
  buyItem,
  buyUpgrade,
  prestigeWorkshop,
  // ...actions
} from "./actions";
```

### Preserve `import.meta.env.BASE_URL` Usage for Catalog Images

```ts
// Source: src/game/catalog.ts
const LOCAL_CATALOG_ROOT = `${import.meta.env.BASE_URL}catalog/`;

export function getCatalogImageUrl(entry: CatalogEntry): string {
  // must keep returning /emilyidle/catalog/... in production
}
```

### Selector Contract Audit Helper (Planning Aid)

```ts
// Source: tests/collection-loop.spec.ts (examples)
// Keep these IDs/testids stable through the refactor:
// - #currency, #income, #collection-value, #softcap
// - #collection-list, #upgrade-list, #milestone-list, #set-bonus-list
// - data-testid="workshop-panel", data-testid="maison-panel", ...
```
