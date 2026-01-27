# Architecture Research

**Domain:** Idle/incremental game — catalog-first economy + interactions
**Researched:** 2026-01-27
**Confidence:** MEDIUM (based on direct code reads; design intent inferred)

## Standard Architecture

### System Overview

Current architecture is already "clean-ish": pure domain in `src/game/*`, UI in `src/ui/*`, runtime/persistence isolated.

For v3.0, keep that split, but introduce a new "catalog-as-inventory" subdomain and an "activities" subsystem.

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ UI (React)                                                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│ App.tsx                                                                        │
│  - owns runtime hook + persistence triggering + tab composition                │
│  - owns modal routing (today: wind modal)                                      │
│                                                                               │
│ Tabs                                                                           │
│  - CollectionTab: show owned inventory + equip + interact entrypoints          │
│  - CatalogTab: marketplace + archive views; buys happen here                   │
│  - CareerTab / WorkshopTab / MaisonTab / NostalgiaTab: prestige/upgrades       │
├───────────────────────────────────────────────────────────────────────────────┤
│ Domain Facade                                                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│ src/game/state.ts (re-exports model/data/selectors/actions)                    │
├───────────────────────────────────────────────────────────────────────────────┤
│ Pure Domain                                                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│ model/                                                                         │
│  - types.ts: GameState/PersistedGameState                                      │
│  - state.ts: createInitialState/createStateFromSave + model-level helpers      │
│ data/                                                                          │
│  - items.ts: current tier items + gates                                        │
│  - (new) catalog-economy.ts: map catalog entries -> gameplay archetype/stats   │
│ selectors/                                                                     │
│  - index.ts: derived computations (income, gates, discovery, etc.)             │
│  - (new) inventory.ts: owned/equipped selectors + tagging/type gating          │
│  - (new) activities.ts: canStart/resolve costs/payouts/cooldowns               │
│ actions/                                                                       │
│  - index.ts: state transitions (buy, prestige, sessions)                       │
│  - (new) inventory.ts: buyCatalogWatch/equipWatch/sell/scrap                   │
│  - (new) activities.ts: start/resolve mini-games (pure transitions)            │
│ runtime/                                                                       │
│  - useGameRuntime: tick + autosave                                             │
│ sim.ts: step() tick loop                                                       │
│ persistence.ts: save decode/encode + sanitize                                  │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `src/App.tsx` | Composition root; owns runtime hook, persistence triggers, modal routing | Keeps game state in hook; passes `state` + `onPurchase` down |
| `src/ui/tabs/CatalogTab.tsx` | "Catalog-first" purchase surface + archive browsing | Adds buy/equip CTA per entry; filters/search remain local UI state |
| `src/ui/tabs/CollectionTab.tsx` | Owned inventory + equip + interact entrypoints | Lists owned watches; delegates to activity modals |
| `src/game/data/*` | Static definitions | Catalog metadata stays in `catalog.ts`; gameplay mapping lives separately |
| `src/game/selectors/*` | Derived values and gates | Computes price, unlock visibility, activity eligibility, multipliers |
| `src/game/actions/*` | Pure state transitions | Buy/equip/activities return new `GameState` |
| `src/game/persistence.ts` + `src/game/model/state.ts` | Save sanitization + migration | Accepts old shapes, produces valid current `GameState` |

## Recommended Project Structure

Add new code as new modules rather than further bloating existing large files (notably `src/App.tsx`, `src/game/selectors/index.ts`, `src/game/actions/index.ts`).

```
src/game/
├── catalog.ts                  # existing: licensing metadata + tags + image URLs
├── data/
│   ├── items.ts                # existing: tier archetypes + legacy gates
│   ├── catalogEconomy.ts       # NEW: derive purchasable watch stats from catalog entry tags
│   └── activities.ts           # NEW: mini-game definitions (ids, types, tuning)
├── model/
│   ├── types.ts                # MODIFY: add inventory/equip/activity state
│   └── state.ts                # MODIFY: createInitialState + createStateFromSave migration
├── selectors/
│   ├── index.ts                # MODIFY: re-export new selector modules + integrate multipliers
│   ├── inventory.ts            # NEW: owned/equipped helpers + watch-type classification
│   └── activities.ts           # NEW: gates (cooldown/cost/watch-type) + payouts
├── actions/
│   ├── index.ts                # MODIFY: re-export new action modules
│   ├── inventory.ts            # NEW: buyCatalogWatch/equipCatalogWatch/scrapCatalogWatch
│   └── activities.ts           # NEW: applyActivityResult/startActivity/etc
└── persistence.ts              # MODIFY: sanitize/migrate new fields + optional version bump
```

### Structure Rationale

- Keep `catalog.ts` "real-world metadata only": licensing/attribution concerns stay separate from gameplay tuning.
- Introduce an inventory slice: v3.0 adds "own specific models" + "equip exactly one"; this is a coherent boundary.
- Introduce an activities slice: mini-games + gating/costs/cooldowns are cross-cutting; centralizing prevents one-off state shapes.

## Architectural Patterns

### Pattern 1: "Archetype + Instance" (Catalog Entry -> Gameplay Archetype)

**What:** Treat each catalog entry as a "watch model instance" but derive its gameplay stats from an archetype (tier/type tags), instead of hand-defining stats for every entry.

**When to use:** When "all catalog entries are purchasable" but tuning must stay tractable.

**Trade-offs:** Less bespoke per-watch balancing; faster to expand catalog; consistent economy.

Example (pseudo):

```ts
type WatchArchetypeId = "starter" | "classic" | "chronograph" | "tourbillon";

type CatalogWatchStats = {
  archetype: WatchArchetypeId;
  basePriceCents: number;
  incomeCentsPerSec: number;
  enjoymentCentsPerSec: number;
  scrapParts: number;
  equipBonus?: { type: "incomeMultiplier"; value: number };
};
```

### Pattern 2: "Pure Action, Derived Gate"

**What:** UI queries selectors for eligibility (price, enjoyment gate, cooldown), then calls a pure action that re-checks and returns either unchanged state or next state.

**When to use:** Purchases, equip, and every activity/mini-game resolution.

**Trade-offs:** Some duplication; big win in testability and save safety.

```ts
const gate = getCatalogWatchPurchaseGate(state, catalogEntryId);
if (!gate.ok) return state;
return buyCatalogWatch(state, catalogEntryId);
```

### Pattern 3: "Activities as First-Class Definitions"

**What:** Define mini-games as data: id, required watch types/tags, costs, cooldown, rewards; implement shared selectors/actions.

**When to use:** Multiple mini-games gated by watch type.

**Trade-offs:** Slight upfront abstraction; prevents N bespoke states and UI forks.

## Data Flow

### Purchase + Equip

```
[CatalogTab Buy Button]
    ↓
selectors: getCatalogWatchPurchaseGate(state, entryId)
    ↓
actions: buyCatalogWatch(state, entryId)
    ↓
App.onPurchase(nextState) → persistNow("purchase", nextState)
```

### Interact / Mini-game

```
[CollectionTab Interact] or [CatalogTab Interact]
    ↓
App opens Activity modal (activityId + context: equipped watch or chosen watch)
    ↓
selectors: canStartActivity(state, activityId, watchId, nowMs) + cost breakdown
    ↓
actions: applyActivityResult(state, activityId, watchId, outcome, nowMs)
    ↓
(optional) actions: activateManualEvent(...) for temporary buffs
    ↓
App.onPurchase(nextState) → persistNow("purchase", nextState)
```

## Save Migration Strategy Impacts

### Current Save Pipeline (observed)

- `persistence.ts` encodes `SaveV2` with `state: GameState`.
- On decode, `sanitizeState()` reconstructs a persisted shape by picking known fields, then calls `createStateFromSave(persisted)` (in `src/game/model/state.ts`).

This is already a robust migration seam: unknown fields are ignored; missing fields default.

### v3 changes that stress saves

- Replacing tier-based `items: Record<WatchItemId, number>` with specific-model ownership
- Adding `equippedWatchId`
- Adding new mini-game/activity state (cooldowns/results)
- Changing economy rules (cash sources + gating + session costs)

### Recommended migration approach (minimize risk)

1. Avoid destructive field renames in-place.
2. Introduce new fields with defaults in `createStateFromSave`:
   - `ownedCatalogWatches: CatalogEntryId[]` or `Record<CatalogEntryId, number>`
   - `equippedCatalogWatchId: CatalogEntryId | null`
   - `activityStates: Record<ActivityId, { nextAvailableAtMs: number; ... }>`
3. Only bump save version if you truly break shape.
4. Migration of legacy tier counts should be non-lossy:
   - Do not fabricate many owned models.
   - Keep legacy tier holdings contributing until players naturally transition.
   - Consider a one-time conversion UI later if retiring legacy.
5. Add unit tests around decode/migrate paths.

## Integration Points

### New vs modified modules/components

Modify (domain):
- `src/game/model/types.ts`
- `src/game/model/state.ts`
- `src/game/persistence.ts`
- `src/game/selectors/index.ts`

Add (domain):
- `src/game/data/catalogEconomy.ts`
- `src/game/selectors/inventory.ts`
- `src/game/actions/inventory.ts`
- `src/game/data/activities.ts`
- `src/game/selectors/activities.ts`
- `src/game/actions/activities.ts`

Modify (UI):
- `src/ui/tabs/CatalogTab.tsx`
- `src/ui/tabs/CollectionTab.tsx`
- `src/App.tsx`

## Build Order (minimize risk)

1. Add new state fields + migrations first (save safety).
2. Introduce catalog-economy derivation (no UI changes yet).
3. Add inventory actions/selectors (minimal UI).
4. Move purchase surface to CatalogTab.
5. Refactor CollectionTab to inventory-first.
6. Generalize activities (wind session -> activity framework).
7. Economy rule changes last (after surfaces and migration are stable).

## Scaling Considerations

- Avoid O(N) catalog scans every tick; replace heuristic matching with explicit ids.
- Add virtualization only if catalog size/perf warrants it.

## Anti-Patterns

- Keep fuzzy mapping from owned watches to catalog discovery after switching to model IDs.
- Add bespoke mini-game state slices per activity.
- Let UI-only state leak into `GameState`.

## Sources

- Internal code (direct reads):
  - `src/App.tsx`
  - `src/game/persistence.ts`
  - `src/game/model/types.ts`
  - `src/game/model/state.ts`
  - `src/game/selectors/index.ts`
  - `src/game/actions/index.ts`
  - `src/ui/tabs/CollectionTab.tsx`
  - `src/ui/tabs/CatalogTab.tsx`

---
*Architecture research for: v3.0 Catalog-First Economy & Interactions*
*Researched: 2026-01-27*
