# Epic 3: Achievement System Expansion

## Overview

While the base achievement system exists (ACHIEVE-01, ACHIEVE-02 completed in v4.1), this epic expands the roster with new achievement categories and deeper gameplay integrations. It adds long-term goals and bragging-rights milestones that extend playtime.

## Epic Goal

Expand achievements beyond the basic set to include career progression, mini-game mastery, prestige milestones, and collection completion goals.

---

## Epic 3.1: Career Achievement Category

**As a** player,
**I want** achievements for career progression,
**So that** I feel rewarded for advancing my therapist career.

**Acceptance Criteria:**

**Given** I reach career milestones,
**When** I hit thresholds,
**Then** I unlock achievements for:

- First client session completed
- 10/50/100/500 total sessions
- Reaching each career stage (Trainee, Apprentice, etc.)
- Unlocking first specialization
- Maxing out a specialization track

**Given** achievements unlock,
**When** they trigger,
**Then** toast notifications appear with clear messaging.

---

## Epic 3.2: Mini-Game Mastery Achievements

**As a** player,
**I want** achievements for mini-game skill,
**So that** perfect play is recognized and rewarded.

**Acceptance Criteria:**

**Given** I play mini-games,
**When** I demonstrate skill,
**Then** I unlock achievements for:

- First perfect winding
- 10/50/100 perfect windings in a row (streak)
- First perfect automatic service
- First perfect quartz timing
- Master each mini-game type (10 perfects each)
- Mini-game grandmaster (100 total perfects across all types)

**Given** streak achievements exist,
**When** I break a streak,
**Then** progress is preserved (don't lose achievement).

---

## Epic 3.3: Prestige & Nostalgia Achievements

**As a** player,
**I want** achievements for prestige milestones,
**So that** reset decisions feel impactful.

**Acceptance Criteria:**

**Given** I prestige/reset,
**When** I hit milestones,
**Then** I unlock achievements for:

- First workshop prestige
- First maison prestige
- First nostalgia reset
- 5/10/25 total resets across all tiers
- Complete collection at least once
- Speed run: Complete collection in under X hours
- Wealth accumulation: Reach 1M/10M/100M total earned

**Given** these achievements exist,
**When** viewed in the achievement list,
**Then** they show progress counters where applicable.

---

## Epic 3.4: Collection Completion Achievements

**As a** player,
**I want** achievements for collection goals,
**So that** completionists have long-term objectives.

**Acceptance Criteria:**

**Given** I collect watches,
**When** I reach milestones,
**Then** I unlock achievements for:

- First watch owned
- Own 10/25/50/100/All watches
- Complete first brand set
- Complete 5/10 brand sets
- Own one of each tier (Starter, Mid, Lux)
- Own one of each movement type
- Collect first "grail" watch (highest tier)
- Collector: Own every watch in the game

**Given** I view achievements,
**When** collection achievements are locked,
**Then** they show hints (e.g., "Own 10 more watches").

---

## Epic 3.5: Secret/Hidden Achievements

**As a** player,
**I want** secret achievements to discover,
**So that** there are surprises and Easter eggs.

**Acceptance Criteria:**

**Given** secret achievements exist,
**When** I discover them through play,
**Then** I unlock:

- "Speed Demon" - Complete a mini-game in under X seconds
- "Hoarder" - Own 10 watches without equipping any
- "Patient" - Don't play any mini-games for 24 hours
- "Clicker" - Click 1000 times on the crown
- "Lucky" - Get 3 perfects in a row by accident

**Given** secret achievements exist,
**When** they are locked,
**Then** they appear as "???" with cryptic hints.

---

## Requirements Coverage

- **ACHIEVE-02**: Expand achievement roster with new categories (v4.1)
- **STREAK-01**: Award streak bonuses for consecutive perfects (v4.1, foundation)

## Technical Notes

- Reuse existing achievement infrastructure
- Add new achievement IDs to achievement definitions
- Update achievement toast system if needed
- Consider adding rarity tiers (bronze/silver/gold/platinum)
- Progress persistence across saves

## Dependencies

- Story 3.1-3.5 can be worked in parallel
- Story 3.2 (Mini-game) depends on Story 1.1-1.2 if those are implemented
- Story 3.5 (Secrets) can be added incrementally

## Success Criteria

- 30+ new achievements added
- Achievements grouped by category in UI
- Progress tracked and persisted
- Toast notifications on unlock
- No performance degradation
- Mobile-friendly achievement list UI
