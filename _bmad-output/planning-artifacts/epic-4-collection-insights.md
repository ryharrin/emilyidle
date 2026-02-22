# Epic 4: Collection Insights & Analytics

## Overview

While basic collection features exist, this epic adds deeper analytics and insights that help players understand their collection value, track progress, and make informed decisions. It transforms the Collection from a simple list into a rich dashboard.

## Epic Goal

Add collection analytics panels that surface insights like value history, brand distribution, completion progress, and investment returns.

---

## Epic 4.1: Collection Value History

**As a** player,
**I want** to see my collection value over time,
**So that** I understand how my net worth has grown.

**Acceptance Criteria:**

**Given** I view the Collection tab,
**When** I look at the analytics panel,
**Then** I see:

- Current total collection value
- Value change over last hour/day/week
- Simple line graph showing value history
- Session ROI (return on investment from sessions)

**Given** the history exists,
**When** I play over time,
**Then** data is sampled and stored without bloating save file.

---

## Epic 4.2: Brand & Era Breakdown

**As a** player,
**I want** to see my collection distribution by brand and era,
**So that** I understand my collecting patterns.

**Acceptance Criteria:**

**Given** I own watches,
**When** I view analytics,
**Then** I see:

- Pie/bar chart of watches by brand
- Pie/bar chart of watches by era/decade
- Percentage of each tier in collection
- "Specialist" badges (e.g., "Rolex Collector" if >50% Rolex)

**Given** the breakdown exists,
**When** I hover/focus on segments,
**Then** I see counts and values per segment.

---

## Epic 4.3: Set Completion Tracker

**As a** player,
**I want** clear visibility into set bonus progress,
**So that** I know which sets to complete next.

**Acceptance Criteria:**

**Given** sets exist,
**When** I view the Collection,
**Then** I see:

- List of all sets with progress (X/Y collected)
- Visual indicator of sets I'm close to completing
- Estimated value of completing each set
- Quick-link to filter catalog by set needs

**Given** I click on a set,
**When** the action completes,
**Then** I see which watches I'm missing from that set.

---

## Epic 4.4: Watch Performance Analytics

**As a** player,
**I want** to see which watches earn the most,
**So that** I can optimize my collection.

**Acceptance Criteria:**

**Given** watches generate income,
**When** I view analytics,
**Then** I see:

- Top 5 earning watches (all-time)
- Top 5 earning watches (last hour)
- Per-watch efficiency (enjoyment per cost)
- "Best Value" recommendations

**Given** I own watches with different movement types,
**When** I view analytics,
**Then** I can compare movement type efficiency.

---

## Epic 4.5: Collection Milestones & Milestone Rewards

**As a** player,
**I want** collection milestones to celebrate progress,
**So that** collecting feels rewarding.

**Acceptance Criteria:**

**Given** I reach collection milestones,
**When** thresholds are hit,
**Then** I receive:

- Visual milestone celebrations
- Bonus rewards (enjoyment/cash)
- Cosmetic unlocks (collection badges, themes)
- "Hall of Fame" entries for major achievements

**Given** milestones exist,
**When** viewed,
**Then** I see upcoming milestones and their rewards.

---

## Requirements Coverage

- **COLLECT-01**: Collection analytics panels (v4.1, expanded)
- **SETBONUS-01**: Set bonus progress display (v4.1, foundation)
- **VAULT-02**: Collection segmentation (v4.1, foundation)

## Technical Notes

- Analytics require time-series data storage (consider compression)
- Charts: Use lightweight charting (CSS-based or minimal library)
- Performance: Lazy-load analytics, don't compute on every tick
- Mobile: Ensure charts are readable on small screens

## Dependencies

- Story 4.1 requires time-series data persistence (may need save format update)
- Story 4.2, 4.4 can be done with current data
- Story 4.3 builds on existing set bonus system
- Story 4.5 requires achievement/milestone infrastructure

## Success Criteria

- Collection tab has dedicated "Insights" sub-tab
- Analytics load quickly (<100ms)
- Charts work on mobile
- No save bloat (history sampling/compression)
- Players can make better decisions using insights
