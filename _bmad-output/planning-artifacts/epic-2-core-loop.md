# Epic 2: Core Loop

## Overview

Proves the fundamental gameplay loop with a playable vertical slice: watches generate Enjoyment → career sessions earn Cash → buy better watches. Implements the economy engine, the first mini-game (Quartz Alignment), PhD career stage with therapy sessions, the watch market, and basic collection display.

This is the "first playable" milestone — validates that the core loop is fun and satisfying before expanding content.

## Epic Goal

Deliver a playable Chapter 1 ("First Steps") vertical slice where the player can interact with quartz watches, conduct therapy sessions to earn cash, purchase new watches, and see their collection grow.

## Dependencies

- Epic 1 (Foundation) — requires GameState, reducer, game loop, persistence, UI shell

## Architecture References

- Economy Flow: Watches → Enjoyment → Career Sessions → Cash → Better Watches
- Currencies: Cash (cents), Enjoyment, Career XP
- Pattern 1: State Transitions (reducer actions)
- Pattern 2: Selectors (derived state)
- Pattern 3: Static Game Data (TS constants)
- Pattern 6: Mini-Game Pattern (local state + callback)

---

## Story 2.1: Currency System & Economy Types

**As a** developer,
**I want** the complete currency system with Cash (cents), Enjoyment, and Love,
**So that** the economy engine has typed, precise values for all transactions.

**Acceptance Criteria:**

**Given** the economy types,
**When** I inspect GameState,
**Then** currencyCents is a number (integer cents), enjoyment is a number, love is a number.

**Given** money calculations,
**When** income is applied,
**Then** it uses `rate * dtMs / 1000` formula (cents per second × time).

**Given** the currency display selector,
**When** I call `getCurrencyDisplay(state)`,
**Then** it returns formatted string like `$12.34`.

**Given** currency limits,
**When** values reach MAX_CURRENCY_CENTS (999_999_999),
**Then** they are clamped, not overflowed.

---

## Story 2.2: Watch Data & Collection Model

**As a** developer,
**I want** the watch catalog data structure with real watches across 4 tiers,
**So that** the collection system has authentic content to work with.

**Acceptance Criteria:**

**Given** the watch data,
**When** I inspect `game/data/watches.ts`,
**Then** each watch has: id (kebab-case), name, priceCents, tier (quartz/manual/automatic/tourbillon), imageUrl, enjoymentRate, and isFavorite flag.

**Given** Chapter 1 scope,
**When** I look at the initial catalog,
**Then** at least 10 quartz watches are defined with proper pricing.

**Given** the collection selectors,
**When** I call `ownedWatches(state)` and `affordableWatches(state)`,
**Then** they return correctly filtered watch arrays.

**Given** Emily's favorites (Royal Oaks, Rolexes, rose gold),
**When** defined in data,
**Then** they have `isFavorite: true` and a passive Enjoyment bonus.

---

## Story 2.3: Quartz Alignment Mini-Game

**As a** player,
**I want** to play a precision alignment game with my quartz watches,
**So that** I earn Enjoyment through skillful interaction.

**Acceptance Criteria:**

**Given** I own a quartz watch,
**When** I tap to interact,
**Then** the Quartz Alignment mini-game opens in a modal.

**Given** the mini-game is active,
**When** I drag to align hands/markers,
**Then** the game evaluates Miss/Good/Perfect based on precision.

**Given** the game uses local state,
**When** it completes,
**Then** it calls `onComplete({ perfects, duration })` callback (never dispatches directly).

**Given** the modal wrapper,
**When** `onComplete` fires,
**Then** it dispatches `RECORD_INTERACTION` to the reducer with gameType, perfects, duration.

**Given** visual feedback,
**When** I achieve a "Perfect",
**Then** there is satisfying animation (motion spring physics).

---

## Story 2.4: PhD Career Stage & Therapy Sessions

**As a** player,
**I want** to conduct therapy sessions as a PhD student to earn Cash,
**So that** I can fund my watch collection.

**Acceptance Criteria:**

**Given** the career system,
**When** the game starts,
**Then** I am at career stage "PhD Student" with appropriate income rate.

**Given** I have enough Enjoyment,
**When** I start a therapy session,
**Then** Enjoyment is consumed and Career XP + Cash are earned.

**Given** the therapy session mini-game,
**When** I engage,
**Then** patients speak text and I tap to continue ("That's interesting, tell me more").

**Given** a cooldown exists,
**When** I complete a session,
**Then** I must wait before the next one.

**Given** the career progress bar,
**When** I inspect it,
**Then** it shows XP toward the next career stage.

---

## Story 2.5: Watch Market & Purchase Flow

**As a** player,
**I want** to browse available watches and buy them with Cash,
**So that** I can grow my collection.

**Acceptance Criteria:**

**Given** I navigate to the Market tab,
**When** it renders,
**Then** I see available watches with prices, images, and affordability indicators.

**Given** I have enough Cash,
**When** I tap "Buy" on a watch,
**Then** the purchase succeeds: Cash is deducted, watch is added to ownedWatchIds.

**Given** I don't have enough Cash,
**When** I view a watch,
**Then** the buy button is disabled with a clear indicator of the remaining cost.

**Given** I already own a watch,
**When** I view it in the market,
**Then** it shows "Owned" instead of a buy button.

---

## Story 2.6: Collection Display & Watch Details

**As a** player,
**I want** to see my watch collection beautifully displayed,
**So that** I feel the satisfaction of building my collection.

**Acceptance Criteria:**

**Given** I navigate to the Collection tab,
**When** it renders,
**Then** I see all owned watches with images, names, and tier indicators.

**Given** I tap on a watch,
**When** the detail view opens,
**Then** I see the full image, name, tier, enjoyment rate, and interaction button.

**Given** the collection grows beyond the viewport,
**When** I scroll,
**Then** @tanstack/react-virtual provides smooth virtualized rendering.

---

## Story 2.7: Passive Income & Sim Integration

**As a** player,
**I want** my watches to generate passive Enjoyment over time,
**So that** the economy flows even during brief check-ins.

**Acceptance Criteria:**

**Given** I own watches,
**When** the sim tick runs,
**Then** passive Enjoyment accrues based on owned watch quality.

**Given** Emily's favorite watches (Royal Oaks, Rolexes, rose gold),
**When** passive income is calculated,
**Then** they generate bonus passive Enjoyment.

**Given** the Home tab,
**When** I look at currency displays,
**Then** I see live-updating Cash, Enjoyment, and income rate values.

**Given** a "Collect passive income" tap,
**When** I tap it on the Home tab,
**Then** accumulated passive Enjoyment is collected (smaller than active mini-game earnings).

---

## Story 2.8: Import/Export Save Backup

**As a** player,
**I want** to export and import my save as a text string,
**So that** I have a gift-grade backup option if storage is ever cleared.

**Acceptance Criteria:**

**Given** I open settings,
**When** I tap "Export Save",
**Then** the save JSON string is copied to clipboard.

**Given** I have a save string,
**When** I tap "Import Save" and paste it,
**Then** it validates, migrates if needed, and loads the state.

**Given** an invalid import string,
**When** import is attempted,
**Then** a friendly error message is shown and current state is preserved.
