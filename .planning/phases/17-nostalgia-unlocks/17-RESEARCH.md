# Phase 17: Nostalgia Unlocks - Research

**Researched:** 2026-01-23
**Domain:** Meta-progression (nostalgia points) + permanent item unlocks across nostalgia prestiges
**Confidence:** HIGH

Phase 17 builds directly on Phase 16 ("Nostalgia Prestige Reset"). The Phase 16 plan establishes a meta currency (`nostalgiaPoints`) and a prestige action (`prestigeNostalgia(...)`) that resets run progression while keeping owned watches and long-lived progression. Phase 17 uses those nostalgia points as spendable currency to permanently unlock watch types (e.g., `classic`, `chronograph`, `tourbillon`) so they remain purchasable even when their milestone gates have not been met in a fresh run.

Primary recommendation: model nostalgia unlocks as a persisted `WatchItemId[]` and extend `isItemUnlocked(...)` to treat it as an OR gate alongside milestone unlocks.

## Standard Stack

| Tool/Library | Where | Purpose | Confidence |
|---|---|---|---|
| React + TypeScript (Vite app) | `src/App.tsx` | UI for unlock store and affordances | HIGH |
| Game state module | `src/game/state.ts` | Canonical state shape + helpers (`isItemUnlocked`, purchase functions, prestige logic) | HIGH |
| Save/load via localStorage (save v2) | `src/game/persistence.ts` | Backwards-compatible persistence of new fields; preserve keys (`emily-idle:save`) | HIGH |
| Simulation tick loop | `src/game/sim.ts` | Should not need changes for unlock spending (only Phase 16 uses it for nostalgia accrual) | MEDIUM |
| Tests: Vitest + Playwright | `tests/**/*.unit.test.tsx`, `tests/**/*.spec.ts` | Lock semantics (spend, persistence, UI selectors) | HIGH |

Assumption (locked by Phase 16 plans): Phase 16 introduces/exports:
- `state.nostalgiaPoints` and other nostalgia fields
- `prestigeNostalgia(state, nowMs)`
- `getNostalgiaPrestigeThresholdCents`, `getNostalgiaPrestigeGain`, `canNostalgiaPrestige`

## Architecture Patterns

### Data Model Pattern: Persisted meta fields + optional save parsing

Use the existing pattern used by `unlockedMilestones` and other long-lived arrays:
- Add a new persisted field to `GameState` (e.g., `nostalgiaUnlockedItems: WatchItemId[]`).
- Add the same field to `PersistedGameState` as optional (`nostalgiaUnlockedItems?: string[]`).
- Default to `[]` in `createInitialState()`.
- In `createStateFromSave(...)`, filter incoming strings to known ids (use `WATCH_ITEMS` as the source of truth).
- In `src/game/persistence.ts` `sanitizeState(...)`, pass the raw `record.nostalgiaUnlockedItems` through as `string[]` (missing field must not invalidate old saves).

### Unlock Gating Pattern: OR gate in `isItemUnlocked(...)`

Keep milestone gating intact, but allow nostalgia unlocks to bypass it:
- `isItemUnlocked(state, id)` should return true when:
  - item has no `unlockMilestoneId`, OR
  - `state.unlockedMilestones` contains the milestone, OR
  - `state.nostalgiaUnlockedItems` contains the item id.

This approach automatically updates all existing UI affordances because `src/App.tsx` uses `isItemUnlocked(...)` to disable buy buttons and show “Unlocking soon” tags.

### Purchase Function Pattern: Pure state transitions

Follow the existing buy helpers (`buyWorkshopUpgrade`, `buyMaisonLine`, `buyItem`, `buyUpgrade`):
- `canBuyNostalgiaUnlock(state, itemId)` checks affordability and “not already unlocked”.
- `buyNostalgiaUnlock(state, itemId)` returns `state` unchanged when invalid; otherwise:
  - subtracts cost from `nostalgiaPoints`
  - adds `itemId` to `nostalgiaUnlockedItems`
  - keeps arrays de-duped and ordered deterministically (prefer definition order, not insertion order)

### UI Pattern: Extend the existing Nostalgia tab

Phase 16 creates a Nostalgia tab and already establishes stable `data-testid="nostalgia-*"` hooks. Phase 17 should extend that tab:
- Add an “Unlocks” panel listing watch items not yet nostalgia-unlocked.
- Use stable, new test ids like `data-testid="nostalgia-unlocks"`, `data-testid="nostalgia-unlock-card"`, and `data-testid="nostalgia-unlock-buy"`.
- Do not change existing `id` / `data-testid` used by current tests.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Save migration/versioning | A new save format or new localStorage keys | Keep save v2 + add optional fields in `PersistedGameState` + `sanitizeState(...)` | Existing tests and users depend on backwards compatible parsing and stable keys. |
| Unlock gating in the UI | New UI-only unlock logic | Centralize in `src/game/state.ts` `isItemUnlocked(...)` | Ensures UI, simulation, and tests all use one definition. |
| De-duping + ordering | Ad-hoc array pushes | Use `Set` + rebuild array in canonical order (definition order) | Prevents subtle bugs where unlock checks or UI ordering differ between sessions. |

## Common Pitfalls

### Save compatibility regressions
**What goes wrong:** older saves fail `sanitizeState(...)` because new fields are treated as required.
**How to avoid:** keep new nostalgia unlock fields optional in `PersistedGameState` and accept missing/invalid values by defaulting to `[]`.

### Unlock state that disappears after prestige
**What goes wrong:** `prestigeNostalgia(...)` resets or overwrites the unlock list.
**How to avoid:** treat `nostalgiaUnlockedItems` like `nostalgiaPoints`/`unlockedMilestones`/`achievementUnlocks` (persist across runs) and explicitly preserve it in the prestige reset.

### UI gating mismatch
**What goes wrong:** buy buttons still disabled because UI uses `isItemUnlocked(...)` but nostalgia unlocks were implemented elsewhere.
**How to avoid:** implement the OR gate in `isItemUnlocked(...)` so all existing UI paths pick it up.

### Non-deterministic unlock ordering
**What goes wrong:** unlock arrays reorder depending on purchase order, producing flaky UI/tests.
**How to avoid:** store unlocks in canonical order (match `WATCH_ITEMS` order) when writing state.

## Code Examples

### Add nostalgia unlocks to `GameState` / save parsing
```ts
// Source: src/game/state.ts (pattern used by unlockedMilestones)
export type GameState = {
  // ...
  nostalgiaPoints: number;
  nostalgiaUnlockedItems: WatchItemId[];
};

export type PersistedGameState = {
  // ...
  nostalgiaPoints?: number;
  nostalgiaUnlockedItems?: string[];
};

export function createInitialState(): GameState {
  return {
    // ...
    nostalgiaPoints: 0,
    nostalgiaUnlockedItems: [],
  };
}

export function createStateFromSave(saved: PersistedGameState): GameState {
  const nostalgiaUnlockedItems = Array.isArray(saved.nostalgiaUnlockedItems)
    ? saved.nostalgiaUnlockedItems.filter((entry): entry is WatchItemId =>
        WATCH_ITEMS.some((item) => item.id === entry),
      )
    : [];

  return {
    // ...
    nostalgiaUnlockedItems,
  };
}
```

### OR gate in `isItemUnlocked(...)`
```ts
// Source: src/game/state.ts (existing helper)
export function isItemUnlocked(state: GameState, id: WatchItemId): boolean {
  const item = requireWatchItem(id);
  if (!item.unlockMilestoneId) {
    return true;
  }

  return (
    state.unlockedMilestones.includes(item.unlockMilestoneId) ||
    state.nostalgiaUnlockedItems.includes(id)
  );
}
```

### Pure purchase helper for spending nostalgia
```ts
// Source: src/game/state.ts (matches existing buy* pattern)
const NOSTALGIA_UNLOCK_COSTS: Record<Exclude<WatchItemId, "starter">, number> = {
  classic: 1,
  chronograph: 3,
  tourbillon: 6,
};

export function canBuyNostalgiaUnlock(state: GameState, id: WatchItemId): boolean {
  if (id === "starter") return false;
  if (state.nostalgiaUnlockedItems.includes(id)) return false;
  const cost = NOSTALGIA_UNLOCK_COSTS[id];
  return state.nostalgiaPoints >= cost;
}

export function buyNostalgiaUnlock(state: GameState, id: WatchItemId): GameState {
  if (!canBuyNostalgiaUnlock(state, id)) return state;
  const cost = NOSTALGIA_UNLOCK_COSTS[id as Exclude<WatchItemId, "starter">];
  const unlocked = new Set([...state.nostalgiaUnlockedItems, id]);

  return {
    ...state,
    nostalgiaPoints: state.nostalgiaPoints - cost,
    nostalgiaUnlockedItems: WATCH_ITEMS.filter((item) => unlocked.has(item.id)).map((item) => item.id),
  };
}
```
