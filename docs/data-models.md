# Emily Idle - Data Models

## Overview

This document describes all data models, types, and state structures used in Emily Idle.

## Core State Types

### GameState

The complete game state structure (`src/game/model/types.ts`):

```typescript
type GameState = {
  // Currencies
  currencyCents: number; // Cash in cents
  enjoymentCents: number; // Enjoyment currency
  nostalgiaPoints: number; // Permanent prestige points
  nostalgiaResets: number; // Nostalgia reset count
  nostalgiaEnjoymentEarnedCents: number; // Lifetime enjoyment earned
  nostalgiaLastGain: number; // Last nostalgia gain
  nostalgiaLastPrestigedAtMs: number; // Last prestige timestamp

  // Collection
  wornWatchId: string | null; // Currently worn watch
  items: Record<WatchItemId, number>; // Owned watches by type
  watchModels: Record<string, number>; // Owned specific models
  favoriteWatchIds: string[]; // Favorited watches

  // Upgrades
  upgrades: Record<UpgradeId, number>; // Upgrade levels
  workshopUpgrades: Record<WorkshopUpgradeId, boolean>; // Workshop upgrades
  maisonUpgrades: Record<MaisonUpgradeId, boolean>; // Maison upgrades
  maisonLines: Record<MaisonLineId, boolean>; // Maison lines

  // Prestige
  workshopBlueprints: number; // Workshop currency
  workshopPrestigeCount: number; // Workshop reset count
  maisonHeritage: number; // Maison currency 1
  maisonReputation: number; // Maison currency 2

  // Progress
  unlockedMilestones: MilestoneId[]; // Unlocked milestones
  achievementUnlocks: AchievementId[]; // Unlocked achievements
  catalogTierUnlocks: CatalogTierId[]; // Unlocked catalog tiers

  // Crafting
  craftingParts: number; // Crafting materials
  craftedBoosts: Record<CraftedBoostId, number>; // Crafted boosts

  // Interactions
  interactionNextAvailableAtMsByItem: Partial<Record<WatchItemId, number>>;
  powerReserveByItem: Partial<Record<WatchItemId, number>>;

  // Career
  therapistCareer: TherapistCareerState;

  // Events
  eventStates: Record<EventId, EventState>;

  // Metadata
  lastPurchase: WatchPurchaseSnapshot | null;
  interactionRunsTotal: number;
  interactionPerfectRuns: number;
  interactionPerfectStreak: number;
  interactionBestPerfectStreak: number;
};
```

## Domain Types

### Watch Types

```typescript
type WatchItemId = "quartz" | "automatic" | "manual" | "tourbillon";
type WatchMovement = "quartz" | "manual" | "automatic" | "tourbillon";

type WatchItemDefinition = {
  id: WatchItemId;
  name: string;
  description: string;
  movement: WatchMovement;
  basePriceCents: number; // Starting price
  priceGrowth: number; // Price multiplier per purchase
  incomeCentsPerSec: number; // Passive income
  enjoymentCentsPerSec: number; // Passive enjoyment
  collectionValueCents: number; // Contribution to collection value
  unlockMilestoneId?: MilestoneId; // Required milestone
};
```

**Watch Tiers**:

| Tier       | Name       | Base Income | Base Enjoyment | Interaction    |
| ---------- | ---------- | ----------- | -------------- | -------------- |
| quartz     | Quartz     | Lowest      | Low            | Alignment game |
| automatic  | Automatic  | Low         | Medium         | Automatic game |
| manual     | Manual     | Medium      | High           | Winding game   |
| tourbillon | Tourbillon | Highest     | Highest        | Winding game   |

### Career Types

```typescript
type CareerTrackId = "private-practice" | "va-hospital" | "research-teaching";
type CareerStartId = "phd-program";
type CareerModalityId = "cbt" | "psychodynamic" | "act";
type CareerOperatingStyleId = "boutique" | "high-volume" | "group-practice";
type CareerExpansionFocusId = "referrals" | "media" | "supervision";

type TherapistCareerState = {
  careerStartId: CareerStartId | null;
  salaryActiveUntilMs: number;
  level: number;
  xp: number;
  nextAvailableAtMs: number;
  activeTrackId: CareerTrackId | null;
  primaryTrackId: CareerTrackId | null;
  modalityId: CareerModalityId | null;
  operatingStyleId: CareerOperatingStyleId | null;
  expansionFocusId: CareerExpansionFocusId | null;
  pointsAvailable: number;
  spentNodes: Record<CareerNodeId, boolean>;
  freeSessionAvailable: boolean;
  sessionPremiumCount: number;
  lastSessionAtMs: number;
};

type TherapistCareerEffectMultipliers = {
  salaryMultiplier: number;
  sessionCashPayoutMultiplier: number;
  sessionCooldownMultiplier: number;
  sessionEnjoymentCostMultiplier: number;
};
```

### Upgrade Types

```typescript
type UpgradeId = "polishing-tools" | "assembly-jigs" | "guild-contracts" | "archive-guides";

type UpgradeDefinition = {
  id: UpgradeId;
  name: string;
  description: string;
  basePriceCents: number;
  priceGrowth: number;
  incomeMultiplierPerLevel: number;
  unlockMilestoneId?: MilestoneId;
};

type WorkshopUpgradeId =
  | "etched-ledgers"
  | "vault-calibration"
  | "heritage-templates"
  | "automation-blueprints";

type WorkshopUpgradeDefinition = {
  id: WorkshopUpgradeId;
  name: string;
  description: string;
  blueprintCost: number;
  incomeMultiplier?: number;
  softcapMultiplier?: number;
  softcapExponentBonus?: number;
  unlocks?: { autoBuyEnabled?: boolean };
};

type MaisonCurrency = "heritage" | "reputation";
type MaisonUpgradeId = "atelier-charter" | "heritage-loom" | "global-vitrine";

type MaisonUpgradeDefinition = {
  id: MaisonUpgradeId;
  name: string;
  description: string;
  currency: MaisonCurrency;
  cost: number;
  incomeMultiplier?: number;
  softcapMultiplier?: number;
  collectionBonusMultiplier?: number;
};

type MaisonLineId = "atelier-line" | "heritage-line" | "complication-line";

type MaisonLineDefinition = {
  id: MaisonLineId;
  name: string;
  description: string;
  currency: MaisonCurrency;
  cost: number;
  incomeMultiplier?: number;
  collectionBonusMultiplier?: number;
  workshopBlueprintBonus?: number;
};
```

### Milestone Types

```typescript
type MilestoneId = "collector-shelf" | "showcase" | "atelier" | "archive-curator";

type MilestoneRequirement =
  | { type: "totalItems"; threshold: number }
  | { type: "collectionValue"; thresholdCents: number }
  | { type: "catalogDiscovery"; threshold: number };

type MilestoneDefinition = {
  id: MilestoneId;
  name: string;
  description: string;
  requirement: MilestoneRequirement;
  unlocks: {
    items?: WatchItemId[];
    upgrades?: UpgradeId[];
  };
};
```

### Achievement Types

```typescript
type AchievementId =
  | "first-drawer"
  | "six-figure-vault"
  | "workshop-reforged"
  | "workshop-veteran"
  | "vault-century"
  | "million-memories"
  | "workshop-decade"
  | "catalog-keeper"
  | "career-clinician"
  | "session-maestro"
  | "perfect-pulse"
  | "nostalgia-returnee";

type AchievementRequirement =
  | { type: "totalItems"; threshold: number }
  | { type: "collectionValue"; thresholdCents: number }
  | { type: "workshopPrestigeCount"; threshold: number }
  | { type: "catalogDiscovery"; threshold: number }
  | { type: "careerLevel"; threshold: number }
  | { type: "interactionPerfects"; threshold: number }
  | { type: "perfectStreak"; threshold: number }
  | { type: "nostalgiaResets"; threshold: number };

type AchievementDefinition = {
  id: AchievementId;
  name: string;
  description: string;
  category: "collection" | "prestige" | "career" | "mini-game";
  requirement: AchievementRequirement;
};
```

### Event Types

```typescript
type EventId = "auction-weekend" | "emily-birthday" | "wind-up";

type EventTrigger =
  | { type: "collectionValue"; thresholdCents: number }
  | { type: "manual" }
  | { type: "calendarDate"; month: number; day: number; timezone: "local" };

type EventDefinition = {
  id: EventId;
  name: string;
  description: string;
  trigger: EventTrigger;
  durationMs: number;
  cooldownMs: number;
  incomeMultiplier: number;
};

type EventState = {
  activeUntilMs: number;
  nextAvailableAtMs: number;
  incomeMultiplier?: number;
};
```

### Catalog Types

```typescript
type CatalogEntryId = string;
type CatalogTierId = "quartz" | "automatic" | "manual" | "tourbillon";

type CatalogEntry = {
  id: CatalogEntryId;
  name: string;
  brand: string;
  tierId: CatalogTierId;
  year?: number;
  isWomens?: boolean;
  styleTags?: string[];
  image?: CatalogImage;
  movement?: CatalogMovementDetails;
  passport?: CatalogPassportMetadata;
};

type CatalogTierBonusDefinition = {
  id: CatalogTierId;
  name: string;
  description: string;
  requiredCount: number;
  incomeMultiplier: number;
};
```

### Set Bonus Types

```typescript
type SetBonusId =
  | "quartz-set"
  | "precision-set"
  | "complication-set"
  | "oyster-society"
  | "crown-chronicle"
  | "seamaster-society"
  | "dress-circle"
  | "diver-crew"
  | "collector-quartet";

type SetBonusDefinition = {
  id: SetBonusId;
  name: string;
  description: string;
  requirements: Partial<Record<WatchItemId, number>>;
  incomeMultiplier: number;
};
```

### Crafting Types

```typescript
type CraftedBoostId = "polished-tools" | "heritage-springs" | "artisan-jig";
```

### Interaction Types

```typescript
type InteractionMiniGameMode = "normal" | "practice";
```

## Persistence Types

### PersistedGameState

Serializable version of GameState (all fields optional):

```typescript
type PersistedGameState = {
  currencyCents?: number;
  enjoymentCents?: number;
  nostalgiaPoints?: number;
  // ... all fields optional
};
```

### Save Format

```typescript
type SaveV4 = {
  version: 4;
  savedAt: string; // ISO date string
  lastSimulatedAtMs: number; // Last simulation timestamp
  generation: number; // Save generation (for clear)
  state: GameState;
};

type SaveDecodeResult =
  | { ok: true; save: SaveV4; migratedFromVersion?: 1 | 2 | 3 }
  | { ok: false; error: string };
```

## UI Types

### Tab Navigation

```typescript
type TabId =
  | "career"
  | "catalog"
  | "collection"
  | "workshop"
  | "maison"
  | "nostalgia"
  | "stats"
  | "upgrades"
  | "save";

type TabDefinition = {
  id: TabId;
  label: string;
  icon: React.ComponentType;
};
```

### Catalog Filters

```typescript
type CatalogFilterState = {
  search: string;
  brand: string;
  style: "all" | "womens";
  sort: "default" | "brand" | "year" | "tier";
  era: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown";
  type: "all" | "gmt" | "manual" | "dress" | "diver";
  tab: "unowned" | "owned";
  viewMode: "novice" | "expert";
};
```

### Settings

```typescript
type ThemeMode = "system" | "light" | "dark";

type NotificationPreferences = {
  sessionsReady: boolean;
  prestigeReady: boolean;
  achievements: boolean;
  events: boolean;
};

type Settings = {
  themeMode: ThemeMode;
  hideCompletedAchievements: boolean;
  hiddenTabs: TabId[];
  coachmarksDismissed: Record<string, boolean>;
  confirmNostalgiaUnlocks: boolean;
  notificationPreferences: NotificationPreferences;
};
```

## Type Relationships

```
GameState (root)
├── Currencies
│   ├── currencyCents: number
│   ├── enjoymentCents: number
│   ├── nostalgiaPoints: number
│   └── ...
├── Collection
│   ├── wornWatchId: string | null
│   ├── items: Record<WatchItemId, number>
│   ├── watchModels: Record<string, number>
│   └── favoriteWatchIds: string[]
├── Career
│   └── therapistCareer: TherapistCareerState
│       ├── careerStartId: CareerStartId | null
│       ├── activeTrackId: CareerTrackId | null
│       ├── modalityId: CareerModalityId | null
│       └── ...
├── Upgrades
│   ├── upgrades: Record<UpgradeId, number>
│   ├── workshopUpgrades: Record<WorkshopUpgradeId, boolean>
│   └── maisonUpgrades: Record<MaisonUpgradeId, boolean>
├── Progress
│   ├── unlockedMilestones: MilestoneId[]
│   ├── achievementUnlocks: AchievementId[]
│   └── catalogTierUnlocks: CatalogTierId[]
└── Events
    └── eventStates: Record<EventId, EventState>
```

## State Initialization

### Initial State Creation

```typescript
// From src/game/model/state.ts
export function createInitialState(): GameState {
  return {
    currencyCents: 0,
    enjoymentCents: 200, // Starting enjoyment
    nostalgiaPoints: 0,
    nostalgiaResets: 0,
    // ... defaults for all fields
  };
}
```

### State from Save

```typescript
export function createStateFromSave(saved: PersistedGameState): GameState {
  // Validates and migrates saved data
  // Returns complete GameState
}
```

## Selector Patterns

### Input Types

```typescript
// Pure function: accepts GameState
type Selector<T> = (state: GameState) => T;

// Time-dependent selector
type TimeSelector<T> = (state: GameState, nowMs: number) => T;
```

### Example Selectors

```typescript
// Simple selector
function getTotalItems(state: GameState): number {
  return Object.values(state.items).reduce((a, b) => a + b, 0);
}

// Time-dependent selector
function getSessionCooldownRemaining(state: GameState, nowMs: number): number {
  return Math.max(0, state.therapistCareer.nextAvailableAtMs - nowMs);
}

// Derived selector using other selectors
function getEffectiveIncomeRate(state: GameState, nowMs: number): number {
  const baseRate = getBaseIncomeRate(state);
  const multiplier = getIncomeMultiplier(state, nowMs);
  return baseRate * multiplier;
}
```

## Action Patterns

### Input Types

```typescript
// State transition function
type Action = (state: GameState, ...args: any[]) => GameState;
```

### Example Actions

```typescript
function buyWatch(state: GameState, modelId: string, nowMs: number): GameState {
  const price = getPrice(state, modelId);

  // Guard: return unchanged if can't afford
  if (state.currencyCents < price) {
    return state;
  }

  // Return new state
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

## Type Safety Guidelines

### 1. Use String Literal Unions

```typescript
// Good
type Status = "active" | "inactive" | "pending";

// Bad
type Status = string;
```

### 2. Use Discriminated Unions

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

### 3. Prefer readonly Arrays

```typescript
// Good
const UPGRADES: ReadonlyArray<UpgradeDefinition> = [...];

// Acceptable
const UPGRADES: UpgradeDefinition[] = [...];
```

### 4. Use Type-only Imports

```typescript
import type { GameState } from "./model/types";
```

## Adding New Types

1. Add to `src/game/model/types.ts`
2. Add definition to appropriate data file
3. Update selectors if needed
4. Update actions if needed
5. Update PersistedGameState if serializable
6. Add tests
7. Update documentation

## Related Documentation

- [Architecture](./architecture.md) - Technical architecture
- [Source Tree Analysis](./source-tree-analysis.md) - File structure
- [Component Inventory](./component-inventory.md) - UI components
- [Development Guide](./development-guide.md) - Development workflow
