# Epic 5: Watch Lore & Discovery System

## Overview

A new feature that adds depth to the watch-collecting theme through lore, stories, and discovery mechanics. Each watch has history, and collecting unlocks stories that enrich the idle loop with narrative depth.

## Epic Goal

Transform watch collection from pure stats into a journey of discovery, where each watch has a story and collecting unlocks lore that educates and entertains.

---

## Epic 5.1: Watch Lore Entries

**As a** player,
**I want** each watch to have lore/history text,
**So that** collecting feels like learning about real watches.

**Acceptance Criteria:**

**Given** watches exist,
**When** I view watch details,
**Then** I see:

- Brief history of the watch model
- Notable features or innovations
- Why it's significant in watchmaking
- Fun facts or trivia

**Given** lore exists,
**When** displayed,
**Then** it is:

- Accurate (based on real watch history)
- Concise (2-3 paragraphs max)
- Thematically appropriate for the idle game

---

## Epic 5.2: Discovery Unlock System

**As a** player,
**I want** lore to unlock as I collect,
**So that** discovery is rewarding.

**Acceptance Criteria:**

**Given** I don't own a watch,
**When** I view it in catalog,
**Then** lore is hidden/replaced with "?" hints.

**Given** I purchase a watch,
**When** it enters my collection,
**Then** its lore unlocks permanently.

**Given** lore is unlocked,
**When** I view it later,
**Then** it remains accessible in Collection tab.

---

## Epic 5.3: Collection Stories & Themes

**As a** player,
**I want** collecting certain watches to unlock themed stories,
**So that** there's narrative cohesion.

**Acceptance Criteria:**

**Given** I collect related watches,
**When** I complete a theme,
**Then** I unlock:

- "The Story of Dive Watches" (collect 3+ dive watches)
- "The Evolution of Chronographs" (collect chronographs from different eras)
- "Swiss Masters" (collect iconic Swiss brands)
- "Complications Explained" (collect watches with complications)

**Given** stories exist,
**When** unlocked,
**Then** they appear in a "Stories" section of Collection tab.

---

## Epic 5.4: Watchmaker Profiles

**As a** player,
**I want** to learn about famous watchmakers,
**So that** I understand the human side of horology.

**Acceptance Criteria:**

**Given** I collect watches from certain brands,
**When** I reach thresholds,
**Then** I unlock profiles:

- Hans Wilsdorf (Rolex)
- Ferdinand Adolph Lange (A. Lange & Söhne)
- Georges-Auguste Leschot (pioneer of interchangeable parts)
- Abraham-Louis Breguet (inventor of tourbillon)

**Given** profiles exist,
**When** viewed,
**Then** I see:

- Brief biography
- Key contributions to watchmaking
- Signature innovations

---

## Epic 5.5: Movement Education System

**As a** player,
**I want** to learn about watch movements,
**So that** I appreciate the mechanics.

**Acceptance Criteria:**

**Given** I own watches with different movements,
**When** I interact with them,
**Then** I gradually unlock:

- "Quartz Revolution" - History of quartz movements
- "Automatic Magic" - How automatic winding works
- "Manual Mastery" - The art of hand-wound movements
- "Tourbillon Triumph" - Complexity of tourbillons

**Given** I unlock movement knowledge,
**When** I view help,
**Then** I see deeper explanations of movement types.

---

## Requirements Coverage

- **New Feature**: Watch lore adds educational/narrative depth
- **Extends**: Catalog/Collection depth without first-viewport clutter

## Technical Notes

- Lore content: Requires research/writing (historical accuracy)
- Data storage: Add `lore` field to WatchItemDefinition
- Unlock system: Simple boolean flags in save state
- Progression: Consider gating some stories behind collection thresholds

## Dependencies

- Story 5.1 (Lore entries) must be done first
- Story 5.2 (Discovery) depends on 5.1
- Story 5.3, 5.4, 5.5 can be done in parallel after 5.2
- Requires content writing (can be parallelized with dev)

## Content Strategy

- Start with 20-30 most iconic watches
- Focus on variety (different brands, eras, movements)
- Keep entries factual but accessible
- Avoid overwhelming players with too much text

## Success Criteria

- 50+ watches have lore entries
- 5+ themed stories to discover
- 4+ watchmaker profiles
- Players report enjoying the educational aspect
- No negative impact on game performance
- Mobile-friendly display (collapsible/carded)
