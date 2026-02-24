# Epic 2: Core Loop

## Overview

Proves the fundamental gameplay loop with a playable vertical slice: watches generate Enjoyment → career sessions earn Cash → buy better watches. Implements the economy engine, the first mini-game (Quartz Calibration), pre-PhD onboarding, PhD therapy sessions, a mailbox-driven purchase flow, and clear watch effect display.

This is the "first playable" milestone — validates that the core loop is fun and satisfying before expanding content.

## Epic Goal

Deliver a playable Chapter 1 ("First Steps") vertical slice where the player can understand how to play immediately, complete one-time acceptance-letter onboarding, conduct therapy sessions to earn cash, order watches from Market, receive them by Mailbox delivery, and see their collection grow.

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
**Then** currencyCents is an integer (cents), enjoyment is an integer (whole units), and love is an integer (whole units).

**Given** money calculations,
**When** income is applied,
**Then** it uses `rate * dtMs / 1000` formula (cents per second × time).

**Given** the currency display selector,
**When** I call `getCurrencyDisplay(state)`,
**Then** it returns formatted string like `$12.34`.

**Given** currency limits,
**When** values reach MAX_CURRENCY_CENTS (999_999_999),
**Then** they are clamped, not overflowed.

**Given** any on-screen Enjoyment values,
**When** they are displayed (total, passive rate, uncollected, mini-game rewards),
**Then** they are whole numbers only (no decimals).

**Given** passive Enjoyment accrual,
**When** internal fractional math is used,
**Then** fractional state does not leak to UI and accumulation remains deterministic.

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

## Story 2.3: Quartz Calibration Mini-Game

**As a** player,
**I want** to calm and calibrate the quartz beat in a clear, short interaction,
**So that** it feels watch-authentic and I immediately understand how to earn Enjoyment.

**Acceptance Criteria:**

**Given** I own a quartz watch,
**When** I tap to interact,
**Then** the Quartz Calibration mini-game opens in a modal.

**Given** the mini-game opens,
**When** it renders,
**Then** it shows plain-language "Goal", "How to play", and "Reward" guidance.

**Given** the mini-game is active,
**When** the beat dot jitters across a center line and I tap "Calibrate",
**Then** the game evaluates Miss/Good/Perfect based on timing distance from center.

**Given** successful taps,
**When** I continue calibrating,
**Then** jitter visibly reduces and the beat appears calmer.

**Given** the game uses local state,
**When** it completes,
**Then** it calls `onComplete({ perfects, durationMs })` callback (never dispatches directly).

**Given** the modal wrapper,
**When** `onComplete` fires,
**Then** it dispatches `RECORD_INTERACTION` to the reducer with gameType, perfects, duration.

**Given** visual feedback,
**When** I achieve a "Perfect",
**Then** there is satisfying animation (motion spring physics).

**Given** gift context,
**When** difficulty is tuned,
**Then** timing windows remain generous and there is no fail state.

---

## Story 2.4: Pre-PhD Onboarding and PhD Therapy Sessions

**As a** player,
**I want** a one-time acceptance-letter onboarding before therapy income begins,
**So that** Emily's career starts before PhD and then transitions clearly into sessions that earn Cash.

**Acceptance Criteria:**

**Given** the career system,
**When** the game starts,
**Then** I start in a Pre-PhD state with zero income and therapy sessions unavailable.

**Given** first launch,
**When** I open Home,
**Then** a forced one-time Mailbox task appears: "Check acceptance letter".

**Given** I open the acceptance letter,
**When** I confirm "Enter Grad School",
**Then** career state transitions from Pre-PhD to PhD Student and normal progression begins.

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

**Given** onboarding has completed,
**When** I continue this save,
**Then** the acceptance-letter gate never blocks again.

---

## Story 2.5: Watch Market & Purchase Flow

**As a** player,
**I want** to browse available watches and buy them with Cash,
**So that** I can grow my collection.

**Acceptance Criteria:**

**Given** I navigate to the Market tab,
**When** it renders,
**Then** I see available watches with prices, images, and affordability indicators.

**Given** a first-time player,
**When** onboarding guidance is shown,
**Then** Home and/or collection detail includes a clear CTA that points to Market for watch purchases.

**Given** I have enough Cash,
**When** I tap "Buy" on a watch,
**Then** the purchase places an order: Cash is deducted and a Mailbox package is created (watch is not owned yet).

**Given** an order is placed,
**When** delivery is scheduled,
**Then** the delivery delay distribution is:
- 75%: 10-20 seconds
- 20%: 20-60 seconds with a delay reason (for example, weather or customs)
- 5%: 60-120 seconds with a delay reason

**Given** I don't have enough Cash,
**When** I view a watch,
**Then** the buy button is disabled with a clear indicator of the remaining cost.

**Given** a watch package is delivered,
**When** I open and claim the package in Mailbox,
**Then** the watch is added to ownedWatchIds.

**Given** I already own a watch,
**When** I view it in the market,
**Then** it shows "Owned" instead of a buy button.

---

## Story 2.6: Collection Display, Watch Effects, and Watch Details

**As a** player,
**I want** to see my watch collection beautifully displayed,
**So that** I feel the satisfaction of building my collection.

**Acceptance Criteria:**

**Given** I navigate to the Collection tab,
**When** it renders,
**Then** I see all owned watches with images, names, and tier indicators, plus a clear summary of what each watch does.

**Given** I tap on a watch,
**When** the detail view opens,
**Then** I see full image, name, tier, passive Enjoyment contribution, interaction type, and reward framing.

**Given** watch effects are shown,
**When** enjoyment-related values are displayed,
**Then** they are whole numbers only (no decimals).

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

**Given** passive stats are shown in UI,
**When** values are rendered,
**Then** passive rate and uncollected amounts are whole-number displays only.

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
**Then** it validates, migrates if needed, and loads state including mailbox queues and delivery timers.

**Given** an invalid import string,
**When** import is attempted,
**Then** a friendly error message is shown and current state is preserved.

---

## Story 2.9: Cooldown Calculation Bug Fix

**As a** player,
**I want** cooldown timers to work correctly,
**So that** interactions have proper pacing and I can't exploit the game economy.

**Acceptance Criteria:**

**Given** I have just performed an action with a cooldown,
**When** I view the cooldown timer,
**Then** it should display a value under 60 seconds,
**And** it should count down accurately.

**Given** the game has been running for any amount of time,
**When** a cooldown is triggered,
**Then** the calculation should use the correct time delta,
**And** should not produce values like 1771887708s.

**Given** I have an active cooldown,
**When** I save and reload the game,
**Then** the cooldown should continue from the correct remaining time.

**Technical Requirements:**
- Audit all cooldown calculations in codebase
- Ensure timestamps use consistent reference (Date.now() or performance.now())
- Add bounds checking (cooldown should never exceed 300 seconds)
- Add unit tests for edge cases (negative values, overflow, persistence)

**Files to Review:**
- `src/game/economy.ts` - Check cooldown logic
- `src/game/selectors/` - Review cooldown selectors
- `src/game/types.ts` - Verify cooldown type definitions

---

## Story 2.10: Mail Notification System

**As a** player,
**I want** prominent notifications when mail arrives and an indicator showing unopened mail count,
**So that** I never miss important deliveries or messages.

**Acceptance Criteria:**

**Given** a watch package or letter is delivered to my mailbox,
**When** the delivery completes,
**Then** a prominent toast notification appears with message type and sender,
**And** the toast auto-dismisses after 3-5 seconds or on tap.

**Given** I have unopened mail in my mailbox,
**When** I view the navigation bar,
**Then** the Mail button displays a badge with the count of unopened items.

**Given** I have unopened mail,
**When** I open and read all mail items,
**Then** the badge disappears from the Mail button.

**Given** I purchase a watch from the market,
**When** the order is placed,
**Then** the package sender is one of: Ethan, Jason007, Lena, or Michael Travis,
**And** the dealer name appears in the delivery notification and package details.

**Given** mail arrives,
**When** the notification displays,
**Then** acceptance letters have a special visual treatment,
**And** watch packages show dealer name and watch preview,
**And** system messages have distinct styling.

**Technical Requirements:**
- Create `MailToast` component for notifications
- Add badge indicator on `BottomNav` Mail button
- Track `unopenedMailCount` in GameState
- Add `dealerName` field to package objects (4 dealers: Ethan, Jason007, Lena, Michael Travis)
- Extend toast system for mail notifications

**Files to Modify:**
- `src/ui/components/BottomNav.tsx` - Add badge indicator
- `src/ui/tabs/MailTab.tsx` - Handle read status
- `src/game/economy.ts` - Assign dealer on purchase
- `src/ui/components/UnlockToasts.tsx` - Extend for mail toasts

---

## Story 2.11: Package Tracking System

**As a** player,
**I want** to track my watch packages as they travel from China to my location with realistic tracking updates and countdown timers,
**So that** waiting for deliveries feels engaging and authentic.

**Acceptance Criteria:**

**Given** I have a package in transit,
**When** I view the tracking details,
**Then** I see a countdown timer showing time until delivery,
**And** the timer updates every second.

**Given** Emily is in PhD, Externship, or VA Hospital career stage,
**When** a package is shipped from China,
**Then** tracking updates through: Shenzhen, China → Port of Oakland → Oakland Distribution Center → Emily's address in Oakland, CA.

**Given** Emily is in Private Practice or Group Practice career stage,
**When** a package is shipped from China,
**Then** tracking updates through: Shenzhen, China → Port of Long Beach/Seattle → Chicago Hub → Ann Arbor Distribution → Emily's address in Ann Arbor, MI.

**Given** Emily is in Retirement stage,
**When** the stage begins,
**Then** the player chooses their retirement location,
**And** packages route to that location using pre-generated tracking stops.

**Given** Emily retires to a location other than California or Michigan,
**When** packages are shipped,
**Then** tracking uses generic pre-generated locations appropriate to that region.

**Given** a package is in transit,
**When** I view tracking,
**Then** I see current location and status,
**And** the progress bar shows % complete based on journey stage.

**Technical Requirements:**
- Create `PackageTrackingCard`, `TrackingDetailView`, `TrackingProgressBar` components
- Add `inTransitPackages` to GameState with tracking info
- Track `playerRetirementLocation` for retirement stage
- Define location routes: Oakland CA, Ann Arbor MI, and generic generators
- Update tracking on each sim tick

**Files to Create/Modify:**
- `src/ui/components/PackageTracking.tsx` - New component
- `src/ui/tabs/MailTab.tsx` - Add tracking section
- `src/game/career.ts` - Add retirement location selection
- `src/game/economy.ts` - Initialize tracking on purchase
- `src/game/selectors/` - Add tracking selectors

---

## Story 2.12: Consecutive Sessions with Scaling Cost

**As a** player,
**I want** to run multiple therapy sessions without waiting for cooldown, with each consecutive session costing more enjoyment,
**So that** I can play more actively when I want to, while maintaining economic balance.

**Acceptance Criteria:**

**Given** the normal cooldown system,
**When** a player waits for the full cooldown period,
**Then** the next session costs the base amount of enjoyment (no premium).

**Given** a player has completed a therapy session,
**When** they attempt another session before the cooldown expires,
**Then** the system detects this as a consecutive session and increments the counter.

**Given** the consecutive session counter is N (where N ≥ 1),
**When** calculating the cost for the next session,
**Then** the cost = baseCost × (1 + 0.5 × N), increasing by 50% per consecutive session.

**Given** the player has performed consecutive sessions,
**When** time passes without performing another session (2 minutes per decay step),
**Then** the consecutive session counter decays and cost returns toward base.

**Given** the player has chained multiple sessions,
**When** they reach the maximum allowed consecutive sessions (10),
**Then** the system prevents further sessions until cost decays.

**Given** a player performs a consecutive session with scaled cost,
**When** rewards are calculated,
**Then** cash and XP rewards remain at base values (only cost scales, not reward).

**Technical Requirements:**
- Add `ConsecutiveSessionState` to GameState with count, lastSessionTime, decayStartedAt
- Cost calculation: base × (1 + multiplier × count), multiplier = 0.5
- Decay: counter reduces by 1 every 2 minutes of real time
- Max consecutive: 10 sessions hard limit
- Create `ConsecutiveSessionIndicator` component showing count, scaled cost, decay timer
- Update CareerTab and HomeTab with consecutive mode UI

**Files to Create/Modify:**
- `src/game/types.ts` - Add ConsecutiveSessionState type
- `src/game/career.ts` - Add cost calculation and decay functions
- `src/game/reducer.ts` - Handle consecutive session actions
- `src/game/constants.ts` - Add CONSECUTIVE_CONFIG
- `src/ui/tabs/CareerTab.tsx` - Add consecutive session indicator
- `src/ui/tabs/HomeTab.tsx` - Show consecutive mode in career section
- `src/ui/components/ConsecutiveSessionIndicator.tsx` - New component
- `src/game/selectors/consecutiveSessions.ts` - New selectors
