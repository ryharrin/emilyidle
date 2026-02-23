# Epic 5: Collection & Prestige

## Overview

Completes the watch collection system with all 4 tiers and 100+ real watches, implements the 3-layer soft prestige system (Workshop → Maison → Nostalgia), and adds the full catalog browsing experience with progressive image loading.

## Epic Goal

Deliver the complete watch catalog with tier-based progression, the 3 sequential soft-prestige layers (no-reset, always forward), and collection completion tracking.

## Dependencies

- Epic 4 (Career Journey) — requires all career stages for tier unlocking gates

## Architecture References

- Watch Collection: 100+ real watches, 4 tiers, progressive image loading
- Prestige: Soft prestige (no reset), 3 sequential layers
- Currencies: Blueprints (Workshop), Heritage (Maison), Nostalgia Points
- Asset Loading: @tanstack/react-virtual for catalog, lazy-load images, skeleton placeholders

---

## Story 5.1: Complete Watch Catalog Data

**As a** developer,
**I want** the full 100+ watch catalog with all 4 tiers,
**So that** the collection has authentic depth and progression.

**Acceptance Criteria:**

**Given** the watch data,
**When** I inspect all entries,
**Then** there are 100+ watches across Quartz, Manual, Automatic, and Tourbillon tiers.

**Given** each watch entry,
**When** I inspect it,
**Then** it has: id, name, brand, priceCents, tier, imageUrl, enjoymentRate, passiveRate, isFavorite, and unlockCondition.

**Given** Emily's favorites,
**When** I filter by isFavorite,
**Then** Royal Oaks, Rolexes, and rose gold pieces are highlighted.

**Given** tier pricing,
**When** I inspect prices,
**Then** Quartz < Manual < Automatic < Tourbillon (exponential scaling).

---

## Story 5.2: Progressive Catalog Loading & Images

**As a** player,
**I want** the watch catalog to load smoothly with beautiful images,
**So that** browsing my collection feels premium and responsive.

**Acceptance Criteria:**

**Given** the catalog contains 100+ watches,
**When** I browse the collection,
**Then** @tanstack/react-virtual virtualizes the list for smooth performance.

**Given** watch images,
**When** they load,
**Then** skeleton placeholders show until the image is ready.

**Given** an image format,
**When** served,
**Then** WebP is used with fallback support.

**Given** the current view,
**When** I browse,
**Then** current + nearby images are preloaded; distant images lazy-load.

---

## Story 5.3: Tier Unlock Progression

**As a** player,
**I want** watch tiers to unlock as I progress through my career,
**So that** my collection grows richer as I advance.

**Acceptance Criteria:**

**Given** I start the game,
**When** I view the market,
**Then** only Quartz watches are available.

**Given** I reach Externship,
**When** Manual watches unlock,
**Then** they appear in the market with a "New" indicator.

**Given** I reach VA Hospital,
**When** Automatic watches unlock,
**Then** they appear in the market.

**Given** I reach Private Practice,
**When** Tourbillon watches unlock,
**Then** they appear as the premium tier.

**Given** locked tiers,
**When** I view them in the catalog,
**Then** they show as silhouettes with unlock requirements.

---

## Story 5.4: Workshop Prestige Layer

**As a** player,
**I want** to unlock the Workshop prestige at Hour 2,
**So that** I gain permanent bonuses and new content without losing progress.

**Acceptance Criteria:**

**Given** I've reached the Workshop unlock condition,
**When** I unlock it,
**Then** Blueprints currency becomes available.

**Given** Workshop is active,
**When** I spend Blueprints,
**Then** I unlock: basic income multipliers, manual/automatic watches, first home life expansion.

**Given** soft prestige design,
**When** Workshop unlocks,
**Then** NO progress is reset — everything carries forward.

---

## Story 5.5: Maison Prestige Layer

**As a** player,
**I want** to unlock the Maison prestige at Hour 4,
**So that** I gain access to premium content and stronger multipliers.

**Acceptance Criteria:**

**Given** I've reached the Maison unlock condition,
**When** I unlock it,
**Then** Heritage currency becomes available.

**Given** Maison is active,
**When** I spend Heritage,
**Then** I unlock: tourbillon watches, better multipliers, premium home features.

**Given** soft prestige,
**When** Maison unlocks,
**Then** Workshop bonuses remain; nothing resets.

---

## Story 5.6: Nostalgia Prestige Layer

**As a** player,
**I want** to unlock the Nostalgia prestige as the final layer,
**So that** my collection reaches "museum quality" status.

**Acceptance Criteria:**

**Given** I've reached the Nostalgia unlock condition (Hour 6/endgame),
**When** I unlock it,
**Then** Nostalgia Points currency becomes available.

**Given** Nostalgia is active,
**When** I spend Nostalgia Points,
**Then** permanent bonuses unlock and "museum quality" collection status is achieved.

**Given** the final prestige layer,
**When** fully invested,
**Then** the final home life gallery completes.

---

## Story 5.7: Collection Completion Tracking

**As a** player,
**I want** to see how close I am to completing my collection,
**So that** I have clear goals driving my progression.

**Acceptance Criteria:**

**Given** the Collection tab,
**When** I view it,
**Then** a completion percentage is shown per tier and overall.

**Given** a tier,
**When** all watches in it are owned,
**Then** a tier completion badge appears.

**Given** the full collection,
**When** every watch is owned,
**Then** "The Perfect Collection" status is achieved (feeds into endgame).
