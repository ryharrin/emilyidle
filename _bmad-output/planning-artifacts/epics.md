# Emily At Last - All Epics

This document indexes all epics for the Emily At Last complete rebuild. Each epic is detailed in its own file. Epics are derived from the authoritative GDD (`gdd.md`) and Architecture (`game-architecture.md`).

---

## Epic Index

| Epic       | Name                                                     | Focus                                      | Stories | Status  |
| ---------- | -------------------------------------------------------- | ------------------------------------------ | ------- | ------- |
| **Epic 1** | [Foundation](./epic-1-foundation.md)                     | Project scaffolding & architecture seams   | 9       | Backlog |
| **Epic 2** | [Core Loop](./epic-2-core-loop.md)                       | Economy, first mini-game, first playable   | 8       | Backlog |
| **Epic 3** | [Mini-Game Suite](./epic-3-mini-game-suite.md)           | All 4 watch mini-games + Family Check-in   | 6       | Backlog |
| **Epic 4** | [Career Journey](./epic-4-career-journey.md)             | 6 career stages, narrative arc, milestones | 7       | Backlog |
| **Epic 5** | [Collection & Prestige](./epic-5-collection-prestige.md) | 100+ watches, 4 tiers, 3 prestige layers   | 7       | Backlog |
| **Epic 6** | [Home Life](./epic-6-home-life.md)                       | Family photos, drawings, Ryan's messages   | 6       | Backlog |
| **Epic 7** | [Polish & Audio](./epic-7-polish-audio.md)               | Audio, animations, achievements, endgame   | 8       | Backlog |

---

## Quick Navigation

### Epic 1: Foundation (9 stories)

- 1.1 Project Initialization & Tooling
- 1.2 GameState Type & Reducer
- 1.3 Game Loop & Simulation Tick
- 1.4 Persistence & Save System
- 1.5 Error Boundaries & Reliability
- 1.6 PWA Configuration & Offline Support
- 1.7 UI Shell & Navigation
- 1.8 Content Discovery System Skeleton
- 1.9 Logging & Debug Infrastructure

### Epic 2: Core Loop (8 stories)

- 2.1 Currency System & Economy Types
- 2.2 Watch Data & Collection Model
- 2.3 Quartz Alignment Mini-Game
- 2.4 PhD Career Stage & Therapy Sessions
- 2.5 Watch Market & Purchase Flow
- 2.6 Collection Display & Watch Details
- 2.7 Passive Income & Sim Integration
- 2.8 Import/Export Save Backup

### Epic 3: Mini-Game Suite (6 stories)

- 3.1 Manual Winding Mini-Game
- 3.2 Automatic Movement Mini-Game
- 3.3 Enhanced Therapy Session Mini-Game
- 3.4 Family Check-in Interaction
- 3.5 Enhanced Quartz Alignment
- 3.6 Mini-Game Result Screen & Rewards

### Epic 4: Career Journey (7 stories)

- 4.1 Career Stage State Machine
- 4.2 Externship Stage (Chapter 2)
- 4.3 VA Hospital Stage (Chapter 3) & JLC Milestone
- 4.4 Private Practice Stage (Chapter 4)
- 4.5 Group Practice Stage (Chapter 5)
- 4.6 Retirement Stage (Chapter 6)
- 4.7 Career UI & Progress Display

### Epic 5: Collection & Prestige (7 stories)

- 5.1 Complete Watch Catalog Data
- 5.2 Progressive Catalog Loading & Images
- 5.3 Tier Unlock Progression
- 5.4 Workshop Prestige Layer
- 5.5 Maison Prestige Layer
- 5.6 Nostalgia Prestige Layer
- 5.7 Collection Completion Tracking

### Epic 6: Home Life (6 stories)

- 6.1 Home Gallery UI & Layout
- 6.2 Family Photo Unlocks
- 6.3 Children's Drawings
- 6.4 Messages from Ryan
- 6.5 Visual Home Evolution
- 6.6 Watch Display Case

### Epic 7: Polish & Audio (8 stories)

- 7.1 Audio System & Music
- 7.2 Sound Effects
- 7.3 Animation Polish Pass
- 7.4 Achievement System
- 7.5 Endgame & Victory Sequence
- 7.6 Credits & Personal Touches
- 7.7 Performance & Battery Optimization
- 7.8 Final Integration Testing

---

## Planning Context

### Source Documents

- **GDD**: `_bmad-output/gdd.md` (~1500 lines, all 14 steps complete)
- **Architecture**: `_bmad-output/game-architecture.md` (~1031 lines, all 9 steps complete)

### Epic Dependencies (sequential build order)

```
Epic 1 (Foundation)
  └─> Epic 2 (Core Loop)
        └─> Epic 3 (Mini-Game Suite)
              └─> Epic 4 (Career Journey)
                    └─> Epic 5 (Collection & Prestige)
                          └─> Epic 6 (Home Life)
                                └─> Epic 7 (Polish & Audio)
```

### Priority

All epics are sequential — each builds on the previous. Epic 1 must complete first.

### Total Story Count

- Epic 1: 9 stories
- Epic 2: 8 stories
- Epic 3: 6 stories
- Epic 4: 7 stories
- Epic 5: 7 stories
- Epic 6: 6 stories
- Epic 7: 8 stories
- **Total: 51 stories across 7 epics**

---

_Epic planning completed: 2026-02-23 (fresh build from GDD + Architecture)_
