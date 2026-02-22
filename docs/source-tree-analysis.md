# Emily Idle - Source Tree Analysis

## Directory Structure

```
watch-idle/
├── AGENTS.md                    # Project conventions for AI assistants
├── CLAUDE.md                    # Claude-specific context
├── CONTINUITY.md                # Development continuity notes
├── DESIGN-NOTES.md              # Game design documentation
├── Dockerfile.ci                # CI Docker configuration
├── README.md                    # Project readme
├── capture-screenshots.ts       # Screenshot utility
├── dist/                       # Build output
│   ├── assets/
│   └── index.html
├── docs/                       # Project documentation
├── index.html                  # Entry HTML file
├── package.json               # Dependencies and scripts
├── playwright.config.ts       # E2E test config
├── pnpm-lock.yaml            # Lock file
├── public/                    # Static assets
│   └── catalog/              # Watch images (Wikimedia)
├── src/                       # Source code
│   ├── App.tsx               # Main React component
│   ├── main.tsx              # React entry point
│   ├── main.ts               # Alternative entry (legacy)
│   ├── style.css             # Global styles
│   ├── vite-env.d.ts         # Vite types
│   ├── game/                 # Game domain logic
│   │   ├── AGENTS.md         # Game-specific conventions
│   │   ├── actions/          # State transition functions
│   │   ├── catalog.ts        # Watch catalog definitions
│   │   ├── data/             # Static game data
│   │   ├── format.ts         # Formatting utilities
│   │   ├── model/            # TypeScript types & constructors
│   │   ├── persistence.ts    # Save/load system
│   │   ├── runtime/          # RAF tick & autosave
│   │   ├── selectors/        # Derived data selectors
│   │   ├── sim.ts            # Simulation step
│   │   ├── state.ts          # Domain facade (re-exports)
│   │   └── tierBadges.ts     # Tier badge definitions
│   └── ui/                   # UI components
│       ├── AGENTS.md         # UI-specific conventions
│       ├── catalog/          # Catalog-specific utilities
│       ├── components/       # Reusable UI components
│       ├── help/             # Help system
│       ├── hooks/            # Custom React hooks
│       ├── icons/            # Icon components
│       ├── navigation/       # Navigation logic
│       ├── prestigeSummary.ts # Prestige utilities
│       ├── tabs/             # Tab panel components
│       └── telemetry/        # Analytics events
├── tests/                     # Test files
│   ├── AGENTS.md             # Test conventions
│   ├── *.spec.ts             # Playwright E2E tests
│   ├── *.unit.test.ts        # Vitest unit tests
│   ├── helpers/              # Test utilities
│   ├── vitest.setup.ts       # Test setup
│   └── node-shims.d.ts      # Node type shims
├── tsconfig.json             # TypeScript config
├── vitest.config.ts          # Vitest config
└── .planning/                # GSD planning documents
    ├── MILESTONES.md         # Project milestones
    ├── phases/               # Phase-specific documents
    │   ├── 13-enjoyment-economy-foundation/
    │   ├── 14-therapist-career-economy/
    │   ├── 19-refactor-phase-13-code/
    │   ├── 25-watch-models-and-duplicates/
    │   ├── 27-career-first-economy-and-upgrades-surface/
    │   ├── 31-rate-clarity-gap-closure/
    │   ├── 44-interaction-feedback-rewards/
    │   ├── 47-mobile-and-ui-polish/
    │   ├── 52-ux-redesign-spec/
    │   ├── 55-ux-flow-gameplay-clarity/
    │   └── 57-session-policy-and-guidance-cleanup/
    └── debug/                # Debug documentation
```

## Source Code Breakdown

### Root Configuration Files

| File                   | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `package.json`         | Dependencies, scripts, package metadata   |
| `tsconfig.json`        | TypeScript configuration (ES2020, strict) |
| `vite.config.ts`       | Vite build configuration                  |
| `vitest.config.ts`     | Vitest test configuration                 |
| `playwright.config.ts` | Playwright E2E configuration              |
| `.prettierrc.json`     | Prettier formatting rules                 |
| `index.html`           | HTML entry point                          |
| `AGENTS.md`            | AI assistant conventions                  |

### src/game/ - Domain Logic

#### model/

**Purpose**: Core types and state constructors

| File       | Lines | Description                                         |
| ---------- | ----- | --------------------------------------------------- |
| `types.ts` | ~313  | All TypeScript types (GameState, WatchItemId, etc.) |
| `state.ts` | ~957  | State constructors, initial state, migrations       |

**Key Types**:

- `GameState` - Complete game state
- `WatchItemId` - Watch movement types
- `CareerTrackId` - Career paths
- `AchievementId` - Achievement identifiers
- `EventId` - Event types

#### data/

**Purpose**: Static game data definitions

| File                 | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `items.ts`           | Watch item definitions (quartz, automatic, manual, tourbillon)    |
| `watchModels.ts`     | Specific watch models (100+ entries)                              |
| `upgrades.ts`        | Upgrade definitions                                               |
| `milestones.ts`      | Milestone definitions                                             |
| `setBonuses.ts`      | Set bonus definitions                                             |
| `career.ts`          | Career base data                                                  |
| `careerTracks.ts`    | Career track definitions                                          |
| `careerStages.ts`    | Career stage definitions                                          |
| `careerNodes*.ts`    | Career node definitions (core, va-hospital, outpatient, research) |
| `careerNodeTypes.ts` | Career node type definitions                                      |

#### selectors/

**Purpose**: Derived data computations

| File                     | Purpose                        |
| ------------------------ | ------------------------------ |
| `index.ts`               | Selector exports               |
| `incomeMultipliers.ts`   | Cash rate calculations         |
| `enjoyment.ts`           | Enjoyment rate calculations    |
| `interactions.ts`        | Interaction availability       |
| `careerProgress.ts`      | Career advancement             |
| `careerNextAction.ts`    | Next career action suggestions |
| `careerStages.ts`        | Stage calculations             |
| `careerChoicePreview.ts` | Choice preview data            |
| `duplicates.ts`          | Duplicate reward calculations  |
| `perWatchStats.ts`       | Per-watch statistics           |
| `statsBreakdown.ts`      | Stats breakdown                |
| `collectionInsights.ts`  | Collection analytics           |
| `watchModels.ts`         | Model-specific selectors       |
| `therapist*.ts`          | Therapist career selectors     |

#### actions/

**Purpose**: State transition functions

| File                 | Purpose                     |
| -------------------- | --------------------------- |
| `index.ts`           | Action exports              |
| `interactions.ts`    | Buy, sell, interact actions |
| `therapistCareer.ts` | Career progression actions  |

#### runtime/

**Purpose**: Side effects and game loop

| File                   | Purpose                           |
| ---------------------- | --------------------------------- |
| `useGameRuntime.ts`    | Main runtime hook (RAF, autosave) |
| `isTestEnvironment.ts` | Test environment detection        |

### src/ui/ - User Interface

#### tabs/

**Purpose**: Tab panel components (one per tab)

| File                | Description                    |
| ------------------- | ------------------------------ |
| `CareerTab.tsx`     | Career progression tab         |
| `CatalogTab.tsx`    | Watch catalog browsing         |
| `CollectionTab.tsx` | Collection management          |
| `WorkshopTab.tsx`   | Workshop (prestige layer 1)    |
| `MaisonTab.tsx`     | Maison (prestige layer 2)      |
| `NostalgiaTab.tsx`  | Nostalgia (prestige layer 3)   |
| `StatsTab.tsx`      | Statistics display             |
| `UpgradesTab.tsx`   | Upgrades management            |
| `SaveTab.tsx`       | Save/load operations           |
| `career/`           | Career-specific sub-components |
| `catalog/`          | Catalog-specific components    |

#### components/

**Purpose**: Reusable UI components

**Modals**:

- `WindingMiniGameModal.tsx` - Manual winding mini-game
- `AutomaticMiniGameModal.tsx` - Automatic movement mini-game
- `QuartzMiniGameModal.tsx` - Quartz alignment mini-game
- `PrestigeOnboardingModal.tsx` - Prestige tutorial
- `ConfirmModal.tsx` - Confirmation dialogs

**UI Elements**:

- `StatsHeader.tsx` - Top stats bar
- `MissionRail.tsx` - Mission/challenge display
- `ToastStack.tsx` - Notification toasts
- `NextActionChips.tsx` - Suggested actions
- `EventBanner.tsx` - Event notifications
- `TabDisclosure.tsx` - Tab section disclosure
- `FloatingDelta.tsx` - Animated number deltas
- `CooldownRing.tsx` - Cooldown visualization

**Career Components**:

- `CareerTree.tsx` - Skill tree visualization
- `CareerTimeline.tsx` - Career progress timeline
- `CareerProgressCard.tsx` - Progress summary
- `CareerStageChoices.tsx` - Career choice UI
- `CareerNextActionCard.tsx` - Next action suggestion

**Catalog Components**:

- `catalog/CatalogPurchaseGate.tsx` - Purchase modal
- `catalog/CatalogCardDetailsSheet.tsx` - Detail sheet
- `catalog/WatchComparePanel.tsx` - Comparison view
- `catalog/CatalogDisabledExplanation.tsx` - Unlock requirements

**Collection Components**:

- `CollectionSectionNav.tsx` - Section navigation
- `CollectionInsightsPanel.tsx` - Analytics panel
- `CollectionTierSegments.tsx` - Tier progress

**Winding Components**:

- `winding/WindingCrown.tsx` - Crown visualization
- `winding/useWindingRun.ts` - Winding logic hook
- `winding/windingMath.ts` - Winding calculations

#### help/

**Purpose**: In-game help system

| File                | Purpose                   |
| ------------------- | ------------------------- |
| `HelpModal.tsx`     | Help modal component      |
| `helpContent.ts`    | Help content definitions  |
| `helpContext.tsx`   | Help context provider     |
| `helpSearch.ts`     | Help search functionality |
| `ExplainButton.tsx` | Contextual help button    |

#### navigation/

**Purpose**: Navigation logic

| File                    | Purpose                 |
| ----------------------- | ----------------------- |
| `PageTabRail.tsx`       | Tab navigation rail     |
| `landing.ts`            | Landing page resolution |
| `tabReadiness.ts`       | Tab visibility logic    |
| `tabMeta.ts`            | Tab metadata            |
| `TabSwitchSkeleton.tsx` | Loading skeleton        |

#### hooks/

**Purpose**: Custom React hooks

| File                         | Purpose                     |
| ---------------------------- | --------------------------- |
| `useCatalogVirtualizer.ts`   | Catalog list virtualization |
| `useStableCatalogEntries.ts` | Stable catalog data         |

### tests/ - Test Suite

#### Unit Tests (\*.unit.test.ts)

| Test File                                 | Focus Area             |
| ----------------------------------------- | ---------------------- |
| `catalog.unit.test.tsx`                   | Catalog functionality  |
| `interactions.unit.test.ts`               | Interaction logic      |
| `career-*.unit.test.ts`                   | Career system          |
| `persistence.unit.test.ts`                | Save/load              |
| `enjoyment.unit.test.tsx`                 | Enjoyment mechanics    |
| `collection.unit.test.tsx`                | Collection features    |
| `upgrades-preview.unit.test.tsx`          | Upgrade previews       |
| `localstorage-*.unit.test.ts`             | localStorage contracts |
| `catalog-readiness-contract.unit.test.ts` | Catalog readiness      |

#### E2E Tests (\*.spec.ts)

| Test File                          | User Flow             |
| ---------------------------------- | --------------------- |
| `selectors-contract.spec.ts`       | Selector contracts    |
| `career-tree-interactions.spec.ts` | Career progression    |
| `nostalgia-prestige.spec.ts`       | Nostalgia prestige    |
| `catalog-expansion.spec.ts`        | Catalog expansion     |
| `help.spec.ts`                     | Help system           |
| `unlock-clarity.spec.ts`           | Unlock clarity        |
| `mobile-responsive.spec.ts`        | Mobile responsiveness |
| `ui-screenshots.spec.ts`           | Screenshot testing    |

### public/catalog/ - Static Assets

**Purpose**: Watch images (sourced from Wikimedia)

```
public/catalog/
├── [brand]/
│   └── [model].jpg
```

Example: `public/catalog/rolex/submariner.jpg`

## Critical Directories

### For UI Development

- `src/ui/tabs/` - Add new tabs here
- `src/ui/components/` - Add reusable components here
- `src/ui/help/` - Update help content here

### For Game Logic

- `src/game/data/` - Add new items/upgrades here
- `src/game/selectors/` - Add derived computations here
- `src/game/actions/` - Add state transitions here
- `src/game/model/` - Update types here

### For Testing

- `tests/*.unit.test.ts` - Unit tests for logic
- `tests/*.spec.ts` - E2E tests for flows
- `tests/helpers/` - Shared test utilities

### For Documentation

- `AGENTS.md` - AI assistant conventions
- `src/game/AGENTS.md` - Game-specific conventions
- `src/ui/AGENTS.md` - UI-specific conventions
- `tests/AGENTS.md` - Test conventions

## Entry Points

### Application Entry

1. `index.html` → loads `src/main.tsx`
2. `src/main.tsx` → renders `App`
3. `src/App.tsx` → wires tabs + game runtime

### Game Loop Entry

1. `useGameRuntime()` in `App.tsx`
2. RAF loop in `useGameRuntime.ts`
3. `step()` in `sim.ts` every 100ms

### Test Entry

- Unit: `vitest.config.ts` → `tests/vitest.setup.ts`
- E2E: `playwright.config.ts` → `tests/*.spec.ts`

## File Size Guidelines

From AGENTS.md:

- **Target**: <300 lines per code file
- **Large files**: Prefer extraction over expansion
- **Examples of large files**: `App.tsx`, `state.ts` (acceptable, don't expand)

## Import Patterns

```typescript
// External libraries first
import React from "react";

// Internal modules
import { getCashRate } from "./game/selectors";

// Types last
import type { GameState } from "./game/state";
```

Or inline:

```typescript
import type { GameState } from "./game/state";
```

## Related Documentation

- [Architecture](./architecture.md) - Technical architecture
- [Data Models](./data-models.md) - Type definitions
- [Component Inventory](./component-inventory.md) - UI components
- [Development Guide](./development-guide.md) - Setup & workflow
