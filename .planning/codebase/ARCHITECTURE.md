# Architecture

**Analysis Date:** 2026-01-21

## Pattern Overview

**Overall:** Client-only React SPA with functional game logic modules

**Key Characteristics:**
- Single-page UI with local in-memory state (`src/App.tsx`)
- Pure, functional state transitions in game domain modules (`src/game/state.ts`)
- Local persistence via browser storage (`src/game/persistence.ts`)

## Layers

**UI Layer:**
- Purpose: Render UI, handle user events, and orchestrate updates
- Contains: React components, tab navigation, view logic
- Depends on: Game domain modules and persistence helpers
- Used by: `src/main.tsx` entry
- Location: `src/App.tsx`, `src/style.css`

**Game Domain Layer:**
- Purpose: Game rules, state transitions, derived values
- Contains: GameState types, selectors, actions, definitions
- Depends on: Catalog data and formatting helpers
- Used by: UI layer and simulation
- Location: `src/game/state.ts`, `src/game/format.ts`, `src/game/catalog.ts`

**Simulation Layer:**
- Purpose: Tick-based updates for idle loop
- Contains: `step()` and tick constants
- Depends on: Game domain selectors/actions
- Used by: UI layer requestAnimationFrame loop
- Location: `src/game/sim.ts`

**Persistence Layer:**
- Purpose: Encode/decode saves and local storage access
- Contains: Save schema, validation, localStorage I/O
- Depends on: GameState model
- Used by: UI layer on load/autosave
- Location: `src/game/persistence.ts`

## Data Flow

**Game Loop:**

1. `src/main.tsx` mounts `<App />` into `#app` (`index.html`).
2. `src/App.tsx` loads save state from localStorage and initializes `GameState`.
3. requestAnimationFrame loop advances simulation via `step()` every `SIM_TICK_MS` (`src/game/sim.ts`).
4. UI actions call domain helpers (buy, prestige, craft) returning new `GameState` (`src/game/state.ts`).
5. Autosave and export/import persist state through `src/game/persistence.ts`.

**State Management:**
- React `useState` holds `GameState` in memory (`src/App.tsx`).
- State transitions are pure functions returning new objects (`src/game/state.ts`).
- localStorage persists save data and user settings (`src/game/persistence.ts`, `src/App.tsx`).

## Key Abstractions

**GameState:**
- Purpose: Single source of truth for game progression
- Examples: `GameState`, `PersistedGameState`
- Pattern: Immutable updates via pure functions (`src/game/state.ts`)

**Save Schema:**
- Purpose: Encode/decode save payloads with versioning
- Examples: SaveV2, SaveDecodeResult
- Pattern: Discriminated union return types (`src/game/persistence.ts`)

**Catalog Entry:**
- Purpose: Metadata + imagery for watch catalog
- Examples: `CatalogEntry`, `CatalogImage`
- Pattern: Static data with attribution (`src/game/catalog.ts`)

## Entry Points

**Web Entry:**
- Location: `index.html` -> `src/main.tsx`
- Triggers: Browser loads the app
- Responsibilities: Bootstraps React app and mounts `<App />`

## Error Handling

**Strategy:** Defensive decoding with error results; UI logs warnings

**Patterns:**
- try/catch around localStorage and JSON parsing (`src/game/persistence.ts`)
- Console warnings for invalid saves or failed persistence (`src/App.tsx`, `src/game/persistence.ts`)

## Cross-Cutting Concerns

**Logging:**
- console.info/warn for save/load status (`src/App.tsx`, `src/game/persistence.ts`)

**Validation:**
- Save payload shape validation before use (`src/game/persistence.ts`)

**Testing Selectors:**
- Stable IDs and `data-testid` attributes for automated tests (`src/App.tsx`)

---

*Architecture analysis: 2026-01-21*
*Update when major patterns change*
