# Emily Idle - Project Documentation Index

**Emily Idle** is a Vite + React + TypeScript idle/incremental game about collecting watches and building a therapist career.

---

## Quick Reference

| Attribute            | Value                            |
| -------------------- | -------------------------------- |
| **Project Type**     | Game (Idle/Incremental)          |
| **Primary Language** | TypeScript                       |
| **Framework**        | React 18 + Vite 6                |
| **Package Manager**  | pnpm 9.15.0                      |
| **Architecture**     | Functional, Domain-Driven        |
| **Repository Type**  | Monolith                         |
| **Test Framework**   | Vitest (unit) + Playwright (e2e) |

---

## Quick Links

- 🎮 **Play the Game**: Run `pnpm dev` → http://127.0.0.1:5177
- 📁 **Source**: `/src/`
- 🧪 **Tests**: `/tests/`
- 📋 **Planning**: `/.planning/`

---

## Generated Documentation

### Core Documentation

| Document                                          | Purpose                                            | Last Updated |
| ------------------------------------------------- | -------------------------------------------------- | ------------ |
| [Project Overview](./project-overview.md)         | High-level project summary, features, tech stack   | 2026-02-19   |
| [Architecture](./architecture.md)                 | Technical architecture, patterns, decisions        | 2026-02-19   |
| [Source Tree Analysis](./source-tree-analysis.md) | Complete directory structure and file organization | 2026-02-19   |
| [Development Guide](./development-guide.md)       | Setup, commands, workflow, testing                 | 2026-02-19   |
| [Component Inventory](./component-inventory.md)   | All UI components cataloged by category            | 2026-02-19   |
| [Data Models](./data-models.md)                   | Game state types, domain models                    | 2026-02-19   |

### Project Configuration

| Document                              | Purpose                               |
| ------------------------------------- | ------------------------------------- |
| [AGENTS.md](../AGENTS.md)             | Project conventions for AI assistants |
| [CLAUDE.md](../CLAUDE.md)             | Claude-specific context               |
| [CONTINUITY.md](../CONTINUITY.md)     | Development continuity notes          |
| [DESIGN-NOTES.md](../DESIGN-NOTES.md) | Game design documentation             |

### Subtree Documentation

| Location                                    | Purpose                  |
| ------------------------------------------- | ------------------------ |
| [src/AGENTS.md](../src/AGENTS.md)           | React UI conventions     |
| [src/game/AGENTS.md](../src/game/AGENTS.md) | Game logic conventions   |
| [src/ui/AGENTS.md](../src/ui/AGENTS.md)     | UI component conventions |
| [tests/AGENTS.md](../tests/AGENTS.md)       | Testing conventions      |

---

## Getting Started

### 1. Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 2. Development Commands

```bash
# Development
pnpm dev                    # Dev server on port 5177

# Code Quality
pnpm format                 # Format code
pnpm lint                   # Lint code
pnpm typecheck              # Type check

# Testing
pnpm test:unit              # Unit tests (Vitest)
pnpm test:e2e               # E2E tests (Playwright)
pnpm test:ci:stable         # Full CI suite

# Build
pnpm build                  # Production build
pnpm preview                # Preview production build
```

### 3. Project Structure

```
src/
├── main.tsx              # React entry
├── App.tsx               # Main app component
├── game/                 # Game domain logic
│   ├── model/           # Types & state
│   ├── data/            # Static definitions
│   ├── selectors/       # Derived data
│   ├── actions/         # State transitions
│   ├── runtime/         # RAF tick & autosave
│   ├── sim.ts           # Simulation step
│   ├── persistence.ts   # Save/load
│   └── state.ts         # Domain facade
└── ui/                   # UI components
    ├── tabs/            # Tab panels
    ├── components/      # Reusable components
    ├── help/            # Help system
    └── navigation/      # Navigation
```

---

## Game Overview

### Core Loop

1. **Collect Watches**: Purchase watches to generate income
2. **Earn Income**: Passive income from owned watches
3. **Build Career**: Complete therapy sessions for cash
4. **Prestige**: Reset for permanent bonuses

### Currency Systems

| Currency       | Purpose                         |
| -------------- | ------------------------------- |
| **Cash**       | Primary currency for purchases  |
| **Enjoyment**  | Secondary currency for prestige |
| **Blueprints** | Workshop prestige currency      |
| **Heritage**   | Maison prestige currency 1      |
| **Reputation** | Maison prestige currency 2      |
| **Nostalgia**  | Permanent prestige points       |

### Watch Tiers

| Tier       | Base Income | Enjoyment | Interaction    |
| ---------- | ----------- | --------- | -------------- |
| Quartz     | Lowest      | Low       | Alignment game |
| Automatic  | Low         | Medium    | Automatic game |
| Manual     | Medium      | High      | Winding game   |
| Tourbillon | Highest     | Highest   | Winding game   |

### Career System

- **Three Tracks**: Private Practice, VA Hospital, Research/Teaching
- **Progression**: Level up via therapy sessions
- **Specializations**: Modality, Operating Style, Expansion Focus
- **Rewards**: Cash payouts, permanent bonuses

### Prestige Layers

1. **Workshop**: Reset watches/upgrades → Gain blueprints
2. **Maison**: Reset workshop → Gain heritage/reputation
3. **Nostalgia**: Reset maison → Gain permanent nostalgia points

---

## Architecture Highlights

### Key Patterns

- **Domain-Driven Design**: Clear separation of game logic from UI
- **Functional State**: Immutable state transitions
- **Pure Selectors**: No side effects, explicit time passing
- **Layered Architecture**: Model → Selectors → Actions → Runtime → UI

### Critical Conventions

- **Money in Cents**: All monetary values are integers (cents)
- **Time Explicit**: `nowMs` passed explicitly, no `Date.now()` in domain
- **Immutability**: State transitions return new objects
- **Type Safety**: Strict TypeScript, discriminated unions

### Simulation Loop

```
RAF Loop (useGameRuntime)
  ↓
Accumulate time
  ↓
Step every 100ms (SIM_TICK_MS)
  ↓
Apply income/enjoyment
  ↓
Check events/achievements
  ↓
Mark save dirty
  ↓
Autosave every 2s
```

---

## Testing Strategy

### Unit Tests (Vitest)

- **Focus**: Selectors, actions, state transitions
- **Location**: `tests/*.unit.test.ts`
- **Environment**: jsdom

```bash
pnpm test:unit -- tests/interactions.unit.test.ts
```

### E2E Tests (Playwright)

- **Focus**: User flows, UI interactions
- **Location**: `tests/*.spec.ts`
- **Port**: 5177 (dev server)

```bash
pnpm test:e2e -- tests/career-tree-interactions.spec.ts
```

---

## Development Workflow

### Before Committing

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:unit
```

### Phase-Based Planning

This project uses GSD planning methodology:

| Phase | Focus                          |
| ----- | ------------------------------ |
| 13-19 | Foundation and economy systems |
| 25    | Watch models and duplicates    |
| 27    | Career system and upgrades     |
| 31-44 | UI/UX improvements             |
| 47    | Mobile and UI polish           |
| 52    | UX redesign                    |
| 55    | UX flow and gameplay clarity   |
| 57    | Session policy cleanup         |

See `.planning/phases/` for detailed documentation.

---

## Common Tasks

### Adding a New Watch

1. Add model to `src/game/data/watchModels.ts`
2. Add image to `public/catalog/[brand]/[model].jpg`
3. Update tests

### Adding a Career Node

1. Define node in `src/game/data/careerNodes*.ts`
2. Add effects to `src/game/selectors/therapistNodeEffects.ts`
3. Update UI

### Adding an Achievement

1. Add to `ACHIEVEMENTS` in `src/game/model/state.ts`
2. Add unlock logic in selectors
3. Add UI notification

---

## Resources

### External Documentation

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)

### Project Metadata

- **Save Key**: `emily-idle:save`
- **Legacy Key**: `watch-idle:save`
- **Dev Server**: `127.0.0.1:5177`
- **Base Path**: `/emilyidle/`

---

## AI Assistant Context

This documentation is designed for AI-assisted development. Key files:

1. **AGENTS.md** - Read first for project conventions
2. **docs/index.md** (this file) - Navigate to specific docs
3. **docs/architecture.md** - Understand technical patterns
4. **docs/data-models.md** - Reference type definitions

When working on this project:

- Follow AGENTS.md conventions
- Keep files under 300 lines
- Money values are in cents
- Pass `nowMs` explicitly
- Return new state objects (immutable)
- Write tests for new features
- Update documentation

---

## Support

For questions or issues:

- Check AGENTS.md for conventions
- Review existing code patterns
- Run tests to verify behavior
- Update this documentation if needed

---

_Documentation generated: 2026-02-19_  
_Workflow: document-project v1.2.0_  
_Scan Level: Deep_
