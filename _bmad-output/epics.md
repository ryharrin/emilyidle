# Emily At Last - Development Epics

## Epic Overview

| #   | Epic Name             | Scope                                       | Dependencies | Est. Stories |
| --- | --------------------- | ------------------------------------------- | ------------ | ------------ |
| 1   | Foundation            | Core economy, UI framework, save system     | None         | 8-12         |
| 2   | Core Loop             | Onboarding, first mini-game, mailbox purchase | Epic 1       | 10-15        |
| 3   | Mini-Game Suite       | All 4 mini-games with feedback              | Epic 2       | 12-18        |
| 4   | Career Journey        | 6 career stages + pre-PhD integration, JLC milestone | Epic 3       | 15-20        |
| 5   | Collection & Prestige | All watch tiers, prestige layers            | Epic 4       | 15-20        |
| 6   | Home Life             | Family photos, kid drawings, messages       | Epic 5       | 12-16        |
| 7   | Polish & Audio        | All art, music, SFX, animations             | Epics 1-6    | 15-25        |

---

## Epic 1: Foundation

### Goal

Establish the technical foundation and core systems that all other epics build upon.

### Scope

**Includes:**

- React + TypeScript project setup with Vite
- State management architecture (Zustand or Context)
- Save/load system with localStorage/IndexedDB
- Core economy system (Enjoyment, Cash, Love resources)
- Basic UI framework and navigation
- Responsive layout for iPhone 17
- Service worker for PWA capabilities

**Excludes:**

- Mini-games (Epic 3)
- Career content (Epic 4)
- Watch collection data (Epic 5)
- Home life features (Epic 6)
- Art and audio (Epic 7)

### Dependencies

None - this is the foundation epic.

### Deliverable

A playable shell showing resource counters (Enjoyment, Cash, Love), basic navigation between empty screens, and working save/load.

### Stories

1. As a player, I can see my Enjoyment, Cash, and Love resources displayed on screen
2. As a player, my game progress is saved automatically
3. As a player, I can load my saved game when I return
4. As a developer, the project has a scalable state management system
5. As a player, the UI works smoothly on iPhone 17 screen size
6. As a player, I can install the game to my home screen (PWA)
7. As a player, the game handles offline gracefully
8. As a developer, the codebase follows project conventions

---

## Epic 2: Core Loop

### Goal

Prove the core gameplay loop is fun with a complete vertical slice of Chapter 1.

### Scope

**Includes:**

- First mini-game: Quartz Calibration (simplest)
- Pre-PhD onboarding and PhD career stage implementation
- Mailbox-driven watch purchase and delivery system
- Chapter 1 home scene (sparse apartment)
- First family photo unlock
- Core loop validation: Mini-game → Enjoyment → Career → Cash → Purchase

**Excludes:**

- Other mini-games (Epic 3)
- Later career stages (Epic 4)
- Multiple watch tiers (Epic 5)
- Progressive home unlocks (Epic 6)
- Final art/audio (Epic 7)

### Dependencies

Epic 1: Foundation

### Deliverable

A complete vertical slice: Player can play Quartz Calibration, earn Enjoyment, enter grad school from a one-time acceptance letter, run therapy sessions for Cash, order a watch from Market, and claim delivery from Mailbox.

### Stories

1. As a player, I can play the Quartz Calibration mini-game
2. As a player, perfect mini-game performance earns more Enjoyment
3. As a player, I can spend Enjoyment to start a therapy career session
4. As a player, career sessions earn Cash based on performance
5. As a player, I can buy my first watch with earned Cash
6. As a player, owning a watch generates passive Enjoyment
7. As a player, I see Chapter 1 home scene (sparse apartment)
8. As a player, completing Chapter 1 unlocks first family photo
9. As a player, I receive my first message from Ryan
10. As a player, the core loop feels satisfying and want to continue

---

## Epic 3: Mini-Game Suite

### Goal

Implement all four mini-games with satisfying feedback and progression.

### Scope

**Includes:**

- Manual Winding mini-game (timing-based)
- Quartz Calibration mini-game (beat-centering)
- Automatic Movement mini-game (rhythm-based)
- Therapy Session mini-game (simple presence)
- Visual and haptic feedback for all games
- Difficulty scaling by watch tier
- Skill-based reward system

**Excludes:**

- Career stage content (Epic 4)
- Full watch collection (Epic 5)
- Home life progression (Epic 6)
- Final polish (Epic 7)

### Dependencies

Epic 2: Core Loop (proves mini-game concept)

### Deliverable

All four mini-games playable with satisfying feedback. Each feels distinct and appropriate to its watch type. Performance affects Enjoyment yield.

### Stories

1. As a player, I can play the Manual Winding mini-game
2. As a player, timing my release affects winding quality
3. As a player, I can play the Automatic Movement rhythm mini-game
4. As a player, finding the right tempo maximizes power generation
5. As a player, I can play the Therapy Session mini-game
6. As a player, being present with patients feels meaningful
7. As a player, each mini-game has satisfying visual feedback
8. As a player, haptic feedback enhances mobile experience
9. As a player, higher tier watches have more complex mini-games
10. As a player, skill improvement is visible over time
11. As a player, I want to perfect each mini-game
12. As a player, mini-game variety prevents monotony

---

## Epic 4: Career Journey

### Goal

Implement the full career progression from PhD to Retirement.

### Scope

**Includes:**

- All 6 career stages: PhD, Externship, VA, Private Practice, Group Practice, Retirement (entered from a pre-PhD onboarding state)
- Stage progression mechanics and requirements
- Unique patient scenarios per stage
- JLC Q1252501 milestone at PhD completion
- Career session variety and narrative
- Income scaling by career stage

**Excludes:**

- Mini-game mechanics (Epic 3)
- Full watch collection (Epic 5)
- Home life features (Epic 6)
- Audio/voice (Epic 7)

### Dependencies

Epic 3: Mini-Game Suite (career requires Enjoyment from mini-games)

### Deliverable

Complete career journey playable through all 6 stages. Each stage feels distinct. JLC milestone is emotionally satisfying.

### Stories

1. As a player, I progress from PhD Student to Externship
2. As a player, each career stage has unique patient types
3. As a player, VA Hospital stage serves veteran patients
4. As a player, Private Practice brings independence
5. As a player, Group Practice involves collaboration
6. As a player, completing PhD unlocks JLC Q1252501 milestone
7. As a player, the JLC milestone feels like a celebration
8. As a player, Retirement stage offers peaceful reflection
9. As a player, career income scales appropriately by stage
10. As a player, I see my professional growth reflected
11. As a player, patient scenarios feel authentic
12. As a player, I feel proud of my career progression

---

## Epic 5: Collection & Prestige

### Goal

Implement the complete watch collection system with prestige layers.

### Scope

**Includes:**

- All 4 watch tiers: Quartz, Manual, Automatic, Tourbillon
- 100+ watch catalog with Emily's favorites highlighted
- Purchase and collection management
- Prestige layers: Workshop → Maison → Nostalgia
- Prestige unlocks and permanent bonuses
- Watch display and organization
- Collection completion tracking

**Excludes:**

- Mini-game mechanics (Epic 3)
- Career stages (Epic 4)
- Home life display (Epic 6)
- Final art (Epic 7)

### Dependencies

Epic 4: Career Journey (career earns Cash for watches)

### Deliverable

Full collection system: Can purchase watches across all tiers, prestige layers unlock sequentially, collection feels complete and satisfying.

### Stories

1. As a player, I can purchase watches from all four tiers
2. As a player, Royal Oak watches are highlighted as favorites
3. As a player, I can view my complete watch collection
4. As a player, higher tier watches cost significantly more
5. As a player, I unlock Workshop prestige layer
6. As a player, prestige unlocks new watch tiers and bonuses
7. As a player, I progress through Maison prestige layer
8. As a player, I reach Nostalgia prestige (final layer)
9. As a player, permanent bonuses improve future progression
10. As a player, I can see collection completion percentage
11. As a player, acquiring grail watches feels special
12. As a player, I want to complete the full collection

---

## Epic 6: Home Life

### Goal

Implement the emotional heart of the game - family photos, kid drawings, and Ryan's messages.

### Scope

**Includes:**

- Progressive home unlock system across 6 hours
- Family photo gallery (Ryan, Emily, kids at different ages)
- Kid drawings (Freddy age 6, Sam age 5, Simi age 3)
- Ryan's personal messages at milestones
- Visual home evolution (apartment → beautiful home)
- Home Life Gallery UI and interactions
- Emotional beat timing and pacing

**Excludes:**

- Core mechanics (Epics 1-3)
- Career progression (Epic 4)
- Collection mechanics (Epic 5)
- Final art production (Epic 7)

### Dependencies

Epic 5: Collection & Prestige (home life rewards progression)

### Deliverable

Complete home life experience: All family photos and drawings unlockable, Ryan's messages integrated, home evolves visually, emotional beats hit at right moments.

### Stories

1. As a player, I unlock family photos as I progress
2. As a player, I see Freddy, Sam, and Simi at different ages
3. As a player, kid drawings appear as unlockable artwork
4. As a player, I receive personal messages from Ryan
5. As a player, messages reference specific milestones
6. As a player, my home visually evolves with each chapter
7. As a player, Chapter 6 home feels complete and beautiful
8. As a player, I can tap photos to see them full size
9. As a player, family content makes me feel loved
10. As a player, home life unlocks are paced emotionally
11. As a player, the gallery feels like a digital scrapbook
12. As a player, I want to unlock all family content

---

## Epic 7: Polish & Audio

### Goal

Bring the game to premium quality with complete art, music, and polish.

### Scope

**Includes:**

- All 6 home scene artworks (Chapter 1-6)
- Watch renders and collection display art
- Family photo integration (provided by Ryan)
- Kid drawing integration (provided by Ryan)
- 8-10 music tracks (chapter themes + menu/ending)
- 40-50 sound effects (UI, mini-games, unlocks)
- UI animations and transitions
- Haptic feedback implementation
- Final visual polish and bug fixes

**Excludes:**

- New features (should be complete in Epics 1-6)
- Core mechanics changes
- Scope expansion

### Dependencies

Epics 1-6: All gameplay features complete

### Deliverable

Premium complete experience: All art assets integrated, music and SFX playing, animations smooth, haptics working, game feels polished and emotionally resonant.

### Stories

1. As a player, I see beautiful home scene art for each chapter
2. As a player, watch renders look premium and detailed
3. As a player, family photos integrate seamlessly
4. As a player, I hear music that matches each chapter's mood
5. As a player, sound effects enhance interactions
6. As a player, UI animations feel smooth and premium
7. As a player, haptic feedback adds tactile satisfaction
8. As a player, Chapter 1 music feels uncertain but hopeful
9. As a player, Chapter 6 music feels complete and emotional
10. As a player, the game runs at smooth 60fps
11. As a player, there are no bugs or glitches
12. As a player, the game feels like a premium gift

---

## Epic Dependencies Graph

```
Epic 1: Foundation
    ↓
Epic 2: Core Loop (proves gameplay)
    ↓
Epic 3: Mini-Game Suite
    ↓
Epic 4: Career Journey
    ↓
Epic 5: Collection & Prestige
    ↓
Epic 6: Home Life
    ↓
Epic 7: Polish & Audio (depends on all)
```

## Estimated Timeline

- Epic 1: 1-2 sprints
- Epic 2: 2-3 sprints
- Epic 3: 2-3 sprints
- Epic 4: 3-4 sprints
- Epic 5: 3-4 sprints
- Epic 6: 2-3 sprints
- Epic 7: 3-4 sprints

**Total: 16-23 sprints** (approximately 4-6 months with 2-week sprints)

## Definition of Done (Game Complete)

- [ ] All 7 epics complete
- [ ] Game playable from start to finish (6-hour experience)
- [ ] All emotional beats land correctly
- [ ] JLC Q1252501 milestone feels special
- [ ] Emily can complete the game in one continuous session
- [ ] Game makes Emily cry (the good kind)
