# Emily Idle (watch-idle) - Project Overview

**Emily Idle** is a Vite + React + TypeScript idle/incremental game about collecting watches and building a therapist career.

## Project Summary

- **Name**: Emily Idle (watch-idle)
- **Type**: Single-player idle/incremental game
- **Platform**: Web browser (desktop and mobile)
- **Tech Stack**: Vite, React 18, TypeScript, pnpm
- **Repository Type**: Monolith (single cohesive codebase)

## Game Concept

Emily Idle combines watch collection mechanics with a therapist career progression system. Players collect watches of different movement types (quartz, automatic, manual, tourbillon), each generating income and enjoyment. The game features multiple prestige layers (Workshop, Maison, Nostalgia) and a detailed career system for the protagonist who works as a therapist.

## Key Features

### Core Gameplay

- **Watch Collection**: Collect watches across four tiers (quartz, automatic, manual, tourbillon)
- **Income Generation**: Passive income from owned watches
- **Interaction Mini-games**: Manual winding, automatic movement, and quartz alignment games
- **Career System**: Therapist career with multiple tracks and specializations
- **Prestige System**: Three-layer prestige system (Workshop, Maison, Nostalgia)

### Game Systems

- **Catalog**: Real-world watch catalog with 100+ entries
- **Upgrades**: Workshop and Maison upgrades
- **Crafting**: Craft boosts using parts
- **Events**: Time-based events with income multipliers
- **Achievements**: 12+ achievements across categories
- **Power Reserve**: Watch power reserve mechanics

## Technology Stack

| Category        | Technology             | Version |
| --------------- | ---------------------- | ------- |
| Framework       | React                  | 18.3.1  |
| Build Tool      | Vite                   | 6.0.0   |
| Language        | TypeScript             | 5.8.0   |
| Package Manager | pnpm                   | 9.15.0  |
| Testing (Unit)  | Vitest                 | 1.6.0   |
| Testing (E2E)   | Playwright             | 1.57.0  |
| Linting         | ESLint                 | 9.39.2  |
| Formatting      | Prettier               | 3.8.0   |
| Icons           | Lucide React           | 0.563.0 |
| Virtualization  | TanStack React Virtual | 3.13.18 |

## Project Structure

```
watch-idle/
├── src/                      # Source code
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Main app component
│   ├── style.css            # Global styles
│   ├── game/                # Game domain logic
│   │   ├── model/           # State types & constructors
│   │   ├── data/            # Static definitions
│   │   ├── selectors/       # Derived computations
│   │   ├── actions/         # State transitions
│   │   ├── runtime/         # RAF tick & autosave
│   │   ├── sim.ts           # Simulation step
│   │   ├── persistence.ts   # Save/load system
│   │   ├── catalog.ts       # Watch catalog data
│   │   └── state.ts         # Domain facade
│   └── ui/                  # UI components
│       ├── tabs/            # Tab panels
│       ├── components/      # Reusable components
│       ├── help/            # Help system
│       ├── navigation/      # Navigation logic
│       └── telemetry/       # Analytics events
├── tests/                   # Test files
│   ├── *.unit.test.ts      # Vitest unit tests
│   └── *.spec.ts           # Playwright E2E tests
├── public/                  # Static assets
│   └── catalog/            # Watch images
├── .planning/              # GSD planning documents
├── docs/                   # Project documentation
└── vite/                   # Vendored Vite reference
```

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server (port 5177)

# Build
pnpm build                  # Production build
pnpm preview               # Preview production build

# Code Quality
pnpm format                # Format with Prettier
pnpm format:check          # Check formatting
pnpm lint                  # Lint with ESLint
pnpm typecheck             # TypeScript check

# Testing
pnpm test:unit             # Run unit tests (Vitest)
pnpm test:e2e              # Run E2E tests (Playwright)
pnpm test:e2e:fast         # Fast E2E tests (local)
pnpm test:ci:stable        # CI test suite
```

## Game Domain Overview

### Currency Systems

- **Cash**: Primary currency for purchases (stored in cents)
- **Enjoyment**: Secondary currency for prestige
- **Blueprints**: Workshop prestige currency
- **Heritage/Reputation**: Maison currencies
- **Nostalgia Points**: Permanent prestige currency

### Watch Movements

| Movement   | Base Income | Base Enjoyment | Interaction         |
| ---------- | ----------- | -------------- | ------------------- |
| Quartz     | Lowest      | Low            | Alignment mini-game |
| Automatic  | Low         | Medium         | Automatic mini-game |
| Manual     | Medium      | High           | Winding mini-game   |
| Tourbillon | Highest     | Highest        | Winding mini-game   |

### Career System

- **Three Tracks**: Private Practice, VA Hospital, Research/Teaching
- **Progression**: Level up by completing therapy sessions
- **Choices**: Modality (CBT, Psychodynamic, ACT), Operating Style, Expansion Focus
- **Rewards**: Cash payouts, career nodes with permanent bonuses

### Prestige Layers

1. **Workshop (Atelier)**: Resets cash, watches, upgrades → Gains blueprints
2. **Maison**: Resets workshop progress → Gains heritage/reputation
3. **Nostalgia**: Resets maison progress → Gains permanent nostalgia points

## Save System

- **Format**: JSON with version 4 (accepts legacy v1/v2/v3)
- **Storage**: localStorage key `emily-idle:save`
- **Legacy**: Also supports `watch-idle:save` key
- **Features**: Offline timer pause, save export/import, clear save

## Documentation

- [Project Overview](./project-overview.md) (this file)
- [Architecture](./architecture.md) - Technical architecture
- [Source Tree Analysis](./source-tree-analysis.md) - Directory structure
- [Development Guide](./development-guide.md) - Development workflow
- [Component Inventory](./component-inventory.md) - UI components
- [Data Models](./data-models.md) - Game state and types

## Planning History

This project uses GSD (Get Shit Done) planning methodology with extensive phase-based development:

- **Phase 13-19**: Foundation and economy systems
- **Phase 25**: Watch models and duplicates
- **Phase 27**: Career system and upgrades
- **Phase 31-44**: UI/UX improvements and interactions
- **Phase 47**: Mobile and UI polish
- **Phase 52**: UX redesign
- **Phase 55**: UX flow and gameplay clarity
- **Phase 57**: Session policy cleanup

See `.planning/` directory for detailed phase documentation.

## License

Private project - All rights reserved.
