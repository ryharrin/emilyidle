# Emily Idle - All Epics

This document indexes all BMad epics for the Emily Idle project. Each epic is detailed in its own file.

---

## Epic Index

| Epic       | Name                                                                      | Focus                                    | Status      |
| ---------- | ------------------------------------------------------------------------- | ---------------------------------------- | ----------- |
| **Epic 1** | [Missing Interactions & Economy Polish](./epic-1-interactions-economy.md) | Gameplay features from Phases 43, 44, 47 | In Progress |
| **Epic 2** | [Module Splitting & Maintainability](./epic-2-maintainability.md)         | Technical debt from DEBT-01              | Backlog     |
| **Epic 3** | [Achievement System Expansion](./epic-3-achievement-expansion.md)         | Extended achievements                    | Backlog     |
| **Epic 4** | [Collection Insights & Analytics](./epic-4-collection-insights.md)        | Collection analytics dashboard           | Backlog     |
| **Epic 5** | [Watch Lore & Discovery System](./epic-5-watch-lore-system.md)            | Narrative/lore feature                   | Backlog     |

---

# Epic 1: Missing Interactions & Economy Polish

## Overview

This epic implements the features that were planned in Phases 43, 44, and 47 but never executed. These features add depth to the gameplay loop and improve mobile UX.

## Epic Goal

Complete the interaction mini-game suite (date + strap), implement tier-based reward scaling for meaningful progression, and polish mobile navigation for better usability.

---

## Epic 1.1: Set-Date Mini-Game

**As a** watch collector,
**I want** to set the date on my classic and chronograph watches via a mini-game,
**So that** I have more ways to interact with my collection.

**Acceptance Criteria:**

**Given** I own a classic or chronograph watch,
**When** I open the interaction menu,
**Then** I see a "Set date" option.

**Given** I select "Set date",
**When** I play the mini-game,
**Then** I can stop a date wheel on a target to earn Miss/Good/Perfect rewards.

**Given** I complete the mini-game,
**Then** I receive enjoyment rewards and a cooldown is applied.

---

## Epic 1.2: Strap-Change Mini-Game

**As a** watch collector,
**I want** to change straps on my watches via a mini-game,
**So that** I can customize my collection and earn rewards.

**Acceptance Criteria:**

**Given** I own any watch,
**When** I open the interaction menu,
**Then** I see a "Change strap" option.

**Given** I select "Change strap",
**When** I play the mini-game,
**Then** I align a strap pin into a lug slot for Miss/Good/Perfect rewards.

**Given** I complete the mini-game,
**Then** I receive enjoyment rewards and a cooldown is applied.

---

## Epic 1.3: Tier-Based Reward Scaling

**As a** player,
**I want** higher-tier watches to give better interaction rewards,
**So that** owning luxury watches feels meaningful.

**Acceptance Criteria:**

**Given** I complete an interaction with a tourbillon watch,
**When** rewards are calculated,
**Then** I receive more enjoyment/reserve/cash than with a starter watch.

**Given** I achieve a "Perfect" outcome,
**When** rewards are calculated,
**Then** I receive proportionally better rewards than "Good" or "Miss".

**Given** the reward calculation runs,
**Then** it uses a centralized resolver that scales by tier × performance.

---

## Epic 1.4: Consistent Interaction Result UI

**As a** player,
**I want** all interaction modals to show results consistently,
**So that** I understand my rewards regardless of which mini-game I played.

**Acceptance Criteria:**

**Given** I complete any mini-game (winding, automatic, quartz, date, strap),
**When** the result screen appears,
**Then** it shows Miss/Good/Perfect with consistent styling.

**Given** the result screen displays,
**Then** it clearly shows the reward amount and type.

**Given** the modal renders on mobile,
**Then** touch targets remain >= 44px and text is readable.

---

## Epic 1.5: Catalog In-Page Subnav

**As a** mobile player,
**I want** to jump to different catalog sections without excessive scrolling,
**So that** I can navigate the catalog efficiently on small screens.

**Acceptance Criteria:**

**Given** I'm viewing the Catalog tab on mobile,
**When** I look at the top of the tab,
**Then** I see a horizontal subnav with jump links.

**Given** I tap a subnav link,
**When** the page scrolls,
**Then** it respects reduced-motion preferences.

**Given** sections exist in the catalog,
**Then** I can jump to: Unowned, Owned, Filters, and Tier sections.

---

## Epic 1.6: Stats Breakdown Grouping

**As a** player,
**I want** the Stats tab breakdown to show grouped subtotals,
**So that** I can understand my rate modifiers at a glance.

**Acceptance Criteria:**

**Given** I view the Stats tab,
**When** I look at the breakdown,
**Then** modifiers are grouped by category (Prestige, Upgrades, Events, etc.).

**Given** a group displays,
**Then** it shows a subtotal line for that category.

**Given** the math is calculated,
**Then** subtotals sum correctly to the total rate.

---

## Requirements Coverage

- **WATCH-03**: Set-date mini-game (Phase 43)
- **WATCH-04**: Strap-change mini-game (Phase 43)
- **WATCH-05**: Consistent result UI (Phase 44)
- **WATCH-06**: Tier/performance reward scaling (Phase 44)
- **MOBILE-04**: Catalog subnav (Phase 47)
- **MOBILE-08**: Stats grouping (Phase 47)

## Dependencies

- Story 1.3 (Reward Scaling) should be completed before Story 1.4 (Result UI)
- Stories 1.1 and 1.2 can be worked in parallel
- Stories 1.5 and 1.6 are independent UI polish and can be done anytime

## Technical Notes

- Watch tier flags needed: `supportsDateSetting` for classic/chronograph
- New modals: `DateMiniGameModal.tsx`, `StrapMiniGameModal.tsx`
- New actions: `applyDateReward()`, `applyStrapChangeReward()`
- Reward resolver: `resolveInteractionReward(tier, performance, outcome)`
- Stats grouping: Add `groupId` to breakdown terms or return grouped structure
- Subnav: Horizontal chip list with `scrollIntoView` anchors
