# Epic 4: Career Journey

## Overview

Implements Emily's full career progression from PhD Student through Retirement — the narrative backbone of the 6-hour arc. Each career stage unlocks new watch tiers, higher income, home life content, and personal messages from Ryan. Includes the JLC Q1252501 milestone celebration at PhD completion.

## Epic Goal

Deliver all 6 career stages (PhD → Externship → VA Hospital → Private Practice → Group Practice → Retirement) with stage-specific therapy scenarios, income scaling, watch tier unlocks, and milestone celebrations.

## Dependencies

- Epic 3 (Mini-Game Suite) — requires therapy session mini-game, all watch interaction types

## Architecture References

- Career Progression: 6-stage state machine with XP gates
- Career data: `game/career/constants.ts` (CAREER_XP_PER_STAGE)
- Pattern 1: State Transitions (PROGRESS_CAREER action)
- Pattern 2: Selectors (getCareerProgress, canAdvanceCareer)
- Content Discovery: Milestone triggers for stage transitions

---

## Story 4.1: Career Stage State Machine

**As a** developer,
**I want** the complete 6-stage career state machine with XP thresholds,
**So that** career progression drives the narrative arc.

**Acceptance Criteria:**

**Given** the career data,
**When** I inspect `game/data/careers.ts`,
**Then** all 6 stages are defined: PhD Student, Externship, VA Hospital, Private Practice, Group Practice, Retirement.

**Given** each stage,
**When** I inspect its properties,
**Then** it has: id, title, xpRequired, incomePerSecCents, enjoymentCost, description.

**Given** the career state machine,
**When** Career XP reaches the next stage threshold,
**Then** `canAdvanceCareer(state)` returns true.

**Given** career advancement,
**When** the player advances,
**Then** the ADVANCE_CAREER action updates careerStage and triggers discovery unlocks.

---

## Story 4.2: Externship Stage (Chapter 2)

**As a** player,
**I want** to progress to the Externship stage,
**So that** I experience Emily's growth into supervised practice.

**Acceptance Criteria:**

**Given** I've earned enough Career XP as a PhD Student,
**When** I advance to Externship,
**Then** income increases to Low-Moderate and Enjoyment cost rises slightly.

**Given** the Externship stage,
**When** therapy sessions run,
**Then** patient vignettes reflect supervised practice themes.

**Given** the stage transition,
**When** Externship unlocks,
**Then** Manual watches become available in the market.

---

## Story 4.3: VA Hospital Stage (Chapter 3) & JLC Milestone

**As a** player,
**I want** to reach the VA Hospital stage and receive the special JLC watch,
**So that** Emily's PhD completion is celebrated with a milestone moment.

**Acceptance Criteria:**

**Given** I advance to VA Hospital,
**When** the transition triggers,
**Then** income reaches Moderate level and Automatic watches unlock.

**Given** the PhD completion milestone,
**When** I reach this career stage,
**Then** the JLC Master Ultra Thin Moon Q1252501 (34mm rose gold) is AWARDED (not purchased).

**Given** the JLC award,
**When** it triggers,
**Then** a special celebration screen shows the watch with a personalized message.

**Given** VA Hospital therapy sessions,
**When** I conduct sessions,
**Then** vignettes reflect serving veterans and institutional settings.

---

## Story 4.4: Private Practice Stage (Chapter 4)

**As a** player,
**I want** to advance to Private Practice,
**So that** I experience independence and unlock tourbillon watches.

**Acceptance Criteria:**

**Given** I advance to Private Practice,
**When** the transition triggers,
**Then** income reaches High level and Tourbillon watches unlock.

**Given** Private Practice,
**When** therapy sessions run,
**Then** vignettes reflect building a clientele and entrepreneurship.

**Given** the stage transition,
**When** unlocks trigger,
**Then** premium home features become available.

---

## Story 4.5: Group Practice Stage (Chapter 5)

**As a** player,
**I want** to reach Group Practice,
**So that** I experience collaboration and near-completion of the journey.

**Acceptance Criteria:**

**Given** I advance to Group Practice,
**When** the transition triggers,
**Then** income reaches Very High level.

**Given** Group Practice,
**When** therapy sessions run,
**Then** vignettes reflect collaboration, mentorship, and expansion.

**Given** the stage transition,
**When** unlocks trigger,
**Then** final watch tiers and complete home gallery become available.

---

## Story 4.6: Retirement Stage (Chapter 6)

**As a** player,
**I want** to reach Retirement as the final career stage,
**So that** the journey reaches its satisfying conclusion.

**Acceptance Criteria:**

**Given** I advance to Retirement,
**When** the transition triggers,
**Then** Enjoyment cost drops to zero but income becomes Low (legacy/passive).

**Given** Retirement,
**When** passive Enjoyment is calculated,
**Then** it is Very High (freedom and fulfillment).

**Given** the Retirement stage,
**When** reached,
**Then** it triggers final achievement unlocks and the endgame sequence becomes available.

---

## Story 4.7: Career UI & Progress Display

**As a** player,
**I want** a beautiful Career tab showing my progression,
**So that** I can see how far I've come in Emily's career journey.

**Acceptance Criteria:**

**Given** I navigate to the Career tab,
**When** it renders,
**Then** I see: current stage name, progress bar to next stage, income rate, and session button.

**Given** the career timeline,
**When** I view it,
**Then** I see all 6 stages with completed ones highlighted.

**Given** a stage transition,
**When** it occurs,
**Then** a celebration animation plays with the stage title and description.

**Given** the Career tab on mobile,
**When** it renders,
**Then** the layout is thumb-friendly with clear progress indicators.
