# Emily Idle - Architecture Documentation

## Architecture Overview

Emily Idle follows a **functional, domain-driven architecture** with clear separation between pure game logic and UI/React components. The architecture emphasizes immutability, pure functions, and predictable state transitions.

## Architectural Patterns

### 1. Domain-Driven Design (DDD)

The game logic is organized around domain concepts:

- **Model**: Core types and state constructors
- **Data**: Static definitions (items, upgrades, etc.)
- **Selectors**: Derived computations (pure functions)
- **Actions**: State transitions (pure functions)
- **Runtime**: Side effects (RAF, persistence)

### 2. Functional State Management

- Game state is immutable
- State transitions return new state objects
- Selectors are pure functions with no side effects
- Time (`nowMs`) is passed explicitly, never uses `Date.now()` in domain

### 3. Layered Architecture

```
┌─────────────────────────────────────────┐
│           UI Layer (React)              │
│  - Components, Tabs, Modals            │
│  - Hooks for state and side effects    │
├─────────────────────────────────────────┤
│         Runtime Layer                   │
│  - RAF tick loop                       │
│  - Autosave                            │
│  - Persistence                         │
├─────────────────────────────────────────┤
│         Domain Layer                    │
│  - Actions (state transitions)         │
│  - Selectors (derived data)            │
│  - Model (types, constructors)         │
│  - Data (static definitions)           │
└─────────────────────────────────────────┘
```

## Core Domain Architecture

### State Management

**GameState** (in `src/game/model/types.ts`):

```typescript
type GameState = {
  currencyCents: number; // Cash in cents
  enjoymentCents: number; // Enjoyment currency
  nostalgiaPoints: number; // Permanent prestige points
  items: Record<WatchItemId, number>; // Owned watches by type
  watchModels: Record<string, number>; // Owned specific models
  upgrades: Record<UpgradeId, number>; // Upgrade levels
  therapistCareer: TherapistCareerState; // Career progression
  workshopPrestigeCount: number; // Workshop reset count
  maisonHeritage: number; // Maison currency 1
  maisonReputation: number; // Maison currency 2
  // ... additional fields
};
```

### Simulation Loop

**Main Loop** (`src/game/sim.ts`):

- Tick interval: `SIM_TICK_MS = 100` (100ms)
- Max step delta: `MAX_STEP_DT_MS = 1_000` (1 second)
- Steps:
  1. Clamp delta time
  2. Apply power reserve decay
  3. Apply events
  4. Calculate income rate
  5. Apply income and enjoyment accrual
  6. Update tier unlocks
  7. Check achievements

### Selectors Pattern

Selectors are pure functions that derive data from GameState:

```typescript
// Example: src/game/selectors/incomeMultipliers.ts
export function getEffectiveCashRateCentsPerSec(
  state: GameState,
  nowMs: number,
  eventMultiplier: number = 1,
): number {
  const baseRate = getBaseCashRateCentsPerSec(state);
  const upgradeMultiplier = getUpgradeMultiplier(state);
  const workshopMultiplier = getWorkshopMultiplier(state);
  const setBonusMultiplier = getSetBonusMultiplier(state);

  return baseRate * upgradeMultiplier * workshopMultiplier * setBonusMultiplier * eventMultiplier;
}
```

**Key Rule**: Selectors never use `Date.now()` - `nowMs` is passed explicitly.

### Actions Pattern

Actions are pure functions that return new GameState:

```typescript
// Example: src/game/actions/interactions.ts
export function buyWatchModel(state: GameState, modelId: string, nowMs: number): GameState {
  const price = getWatchModelPriceCents(state, modelId);
  if (state.currencyCents < price) {
    return state; // Guard: return unchanged state
  }

  return {
    ...state,
    currencyCents: state.currencyCents - price,
    watchModels: {
      ...state.watchModels,
      [modelId]: (state.watchModels[modelId] ?? 0) + 1,
    },
  };
}
```

**Key Rule**: Actions return the same reference if nothing changed.

## Directory Structure Deep Dive

### src/game/ - Domain Layer

```
src/game/
├── model/
│   ├── types.ts           # All TypeScript types
│   └── state.ts           # State constructors, initial state
├── data/
│   ├── items.ts           # Watch item definitions
│   ├── watchModels.ts     # Catalog watch models
│   ├── upgrades.ts        # Upgrade definitions
│   ├── career*.ts         # Career node definitions
│   ├── milestones.ts      # Milestone definitions
│   └── setBonuses.ts      # Set bonus definitions
├── selectors/
│   ├── index.ts           # Selector exports
│   ├── incomeMultipliers.ts
│   ├── enjoyment.ts
│   ├── interactions.ts
│   ├── careerProgress.ts
│   ├── duplicates.ts
│   └── ...
├── actions/
│   ├── index.ts           # Action exports
│   ├── interactions.ts    # Buy, sell, interact
│   └── therapistCareer.ts # Career actions
├── runtime/
│   ├── useGameRuntime.ts  # Main runtime hook
│   └── isTestEnvironment.ts
├── sim.ts                 # Simulation step
├── persistence.ts         # Save/load system
├── catalog.ts            # Catalog data
├── format.ts             # Formatting utilities
└── state.ts              # Facade (re-exports all)
```

### src/ui/ - UI Layer

```
src/ui/
├── tabs/                  # Tab panel components
│   ├── CareerTab.tsx
│   ├── CatalogTab.tsx
│   ├── CollectionTab.tsx
│   ├── WorkshopTab.tsx
│   ├── MaisonTab.tsx
│   ├── NostalgiaTab.tsx
│   ├── StatsTab.tsx
│   ├── UpgradesTab.tsx
│   └── SaveTab.tsx
├── components/            # Reusable components
│   ├── MissionRail.tsx
│   ├── StatsHeader.tsx
│   ├── ToastStack.tsx
│   ├── ConfirmModal.tsx
│   ├── *MiniGameModal.tsx # Mini-game modals
│   └── ...
├── help/                  # Help system
│   ├── HelpModal.tsx
│   ├── helpContent.ts
│   └── helpContext.tsx
├── navigation/            # Navigation logic
│   ├── PageTabRail.tsx
│   ├── landing.ts
│   └── tabReadiness.ts
└── telemetry/             # Analytics
    ├── events.ts
    └── emitter.ts
```

## Key Technical Decisions

### 1. Monetary Values in Cents

All money values are stored as integers (cents) to avoid floating-point errors:

```typescript
const CENTS_PER_DOLLAR = 100;
const priceCents = priceDollars * CENTS_PER_DOLLAR;
```

### 2. Time Handling

- All timestamps in milliseconds
- `nowMs` passed explicitly to all selectors/actions
- No `Date.now()` in domain code
- Offline timer pause on save/load

### 3. State Immutability

```typescript
// Good: Creates new object
return { ...state, currencyCents: newValue };

// Bad: Mutates existing object
state.currencyCents = newValue;
```

### 4. Type Safety

- Strict TypeScript (`strict: true`)
- Discriminated unions for results
- No `any` types
- Type-only imports: `import type { ... }`

### 5. Persistence Strategy

- Save version 4 (JSON)
- Legacy support for v1/v2/v3
- localStorage with keys:
  - `emily-idle:save` (current)
  - `emily-idle:settings`
  - `emily-idle:navigation`
  - `emily-idle:help`

## Component Architecture

### App.tsx Structure

```typescript
function App() {
  // Game state from runtime
  const { nowMs, state, setState } = useGameRuntime({...});

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>("career");
  const [activeInteraction, setActiveInteraction] = useState(...);

  // Derived values via selectors
  const cashRate = useMemo(() =>
    getEffectiveCashRateCentsPerSec(state, nowMs),
    [state, nowMs]
  );

  // Event handlers
  const handlePurchase = (nextState: GameState) => {
    setState(nextState);
    markSaveDirty();
  };

  return (
    <div className="app">
      <StatsHeader stats={...} />
      <PageTabRail activeTab={activeTab} ... />
      <main>
        {activeTab === "career" && <CareerTab ... />}
        {activeTab === "catalog" && <CatalogTab ... />}
        {/* ... */}
      </main>
    </div>
  );
}
```

### Tab Components

Each tab receives:

- `state: GameState` - Current game state
- `nowMs: number` - Current timestamp
- Event handlers for actions

Example:

```typescript
interface CareerTabProps {
  state: GameState;
  nowMs: number;
  onRunSession: () => void;
  onChooseTrack: (trackId: CareerTrackId) => void;
}
```

## Testing Architecture

### Unit Tests (Vitest)

- Location: `tests/*.unit.test.ts`
- Environment: jsdom
- Focus: Selectors, actions, state transitions
- Pattern: Given → When → Then

### E2E Tests (Playwright)

- Location: `tests/*.spec.ts`
- Environment: Real browser
- Focus: User flows, UI interactions
- Pattern: Seed state → Interact → Assert

## Performance Considerations

### Optimizations

1. **Memoization**: `useMemo` for expensive selectors
2. **Virtualization**: `@tanstack/react-virtual` for long lists
3. **Batching**: RAF-based tick with 100ms intervals
4. **Lazy Loading**: Tabs render on-demand
5. **Stable References**: State returns same ref if unchanged

### Avoided Anti-Patterns

- No prop drilling (use context/selectors)
- No inline object creation in render
- No `Date.now()` in render/selectors
- No mutations in actions

## Build & Deployment

### Build Configuration

- **Bundler**: Vite 6
- **Target**: ES2020
- **Module**: ESM (`"type": "module"`)
- **Output**: `dist/` (static files)

### Deployment

- Static hosting (no server required)
- Base path: `/emilyidle/`
- All state client-side in localStorage

## Extension Points

### Adding New Watch Types

1. Add to `WATCH_ITEMS` in `src/game/data/items.ts`
2. Add models to `src/game/data/watchModels.ts`
3. Update `WatchItemId` type
4. Add selector in `src/game/selectors/`

### Adding New Career Tracks

1. Define nodes in `src/game/data/careerNodes*.ts`
2. Update `CAREER_TRACKS` in `src/game/data/careerTracks.ts`
3. Add effects to `src/game/selectors/therapistNodeEffects.ts`

### Adding New Prestige Layer

1. Add currency fields to `GameState`
2. Add threshold/gain selectors
3. Add prestige action
4. Update UI tab for new layer

## Related Documentation

- [Source Tree Analysis](./source-tree-analysis.md) - File structure
- [Data Models](./data-models.md) - Type definitions
- [Component Inventory](./component-inventory.md) - UI components
- [Development Guide](./development-guide.md) - Setup & workflow
