# Epic 3: Mini-Game Suite

## Overview

Expands active engagement from a single mini-game (Quartz Alignment, built in Epic 2) to the complete suite of 4 distinct interaction types. Each mini-game has unique input mechanics, visual feel (powered by motion spring physics), and ties into the economy loop. Also adds the Family Check-in interaction for Love generation.

## Epic Goal

Deliver all 4 watch-based mini-games (Quartz Alignment enhancement, Manual Winding, Automatic Movement, Therapy Session enhancement) plus Family Check-in, with polish, visual feedback, and balanced rewards.

## Dependencies

- Epic 2 (Core Loop) — requires economy engine, mini-game shell, interaction dispatch

## Architecture References

- Pattern 6: Mini-Game Pattern (local state + callback dispatch)
- Mini-Game Rendering: DOM-first + Motion for spring physics
- No haptics (visual/audio feedback only per architecture)

---

## Story 3.1: Manual Winding Mini-Game

**As a** player,
**I want** to wind my manual watches through a timing-based hold-and-release game,
**So that** interacting with manual watches feels tactile and meditative.

**Acceptance Criteria:**

**Given** I own a manual watch,
**When** I tap to interact,
**Then** the Manual Winding mini-game opens.

**Given** the game is active,
**When** I hold to wind and release at the optimal point,
**Then** the game evaluates Miss/Good/Perfect based on timing precision.

**Given** the visual feedback,
**When** I wind,
**Then** I see a smooth winding animation with spring physics (motion library).

**Given** the game completes,
**When** results are calculated,
**Then** Enjoyment rewards scale by watch tier × performance.

---

## Story 3.2: Automatic Movement Mini-Game

**As a** player,
**I want** to keep my automatic watch's rotor spinning through a rhythm-tap game,
**So that** interacting with automatic watches feels rhythmic and satisfying.

**Acceptance Criteria:**

**Given** I own an automatic watch,
**When** I tap to interact,
**Then** the Automatic Movement mini-game opens.

**Given** the game is active,
**When** I tap in rhythm (like a metronome),
**Then** the rotor spins and a power reserve fills based on rhythm accuracy.

**Given** my tapping is off-rhythm,
**When** timing is evaluated,
**Then** the power reserve fills more slowly (no fail state, just suboptimal).

**Given** visual feedback,
**When** I tap in rhythm,
**Then** the rotor animation uses spring physics and the power gauge fills smoothly.

---

## Story 3.3: Enhanced Therapy Session Mini-Game

**As a** player,
**I want** therapy sessions to feel authentic with patient vignettes,
**So that** the career system feels meaningful and true to Emily's profession.

**Acceptance Criteria:**

**Given** I start a therapy session,
**When** the session begins,
**Then** a patient presents with a text vignette.

**Given** the patient speaks,
**When** I tap to respond,
**Then** my response is always "That's interesting, tell me more" (authentic therapeutic stance).

**Given** the session progresses,
**When** multiple exchanges complete,
**Then** the session ends with Cash + Career XP rewards.

**Given** different career stages,
**When** I'm at a higher stage,
**Then** patient scenarios become more nuanced (but never harder — just richer).

---

## Story 3.4: Family Check-in Interaction

**As a** player,
**I want** to check in with my family between sessions,
**So that** Love currency accrues and boosts my Enjoyment generation.

**Acceptance Criteria:**

**Given** the Home tab,
**When** I tap the family check-in button,
**Then** a brief, warm family moment plays (text + visual).

**Given** a check-in completes,
**When** rewards are applied,
**Then** Love currency increases, which boosts Enjoyment generation rate.

**Given** a cooldown exists,
**When** I've recently checked in,
**Then** the button shows time remaining before next check-in.

---

## Story 3.5: Enhanced Quartz Alignment

**As a** player,
**I want** the Quartz Alignment game to have progressive difficulty and polished feel,
**So that** it remains engaging as I acquire better watches.

**Acceptance Criteria:**

**Given** a higher-tier quartz watch,
**When** I play the alignment game,
**Then** the difficulty is slightly higher (tighter alignment windows).

**Given** a successful alignment,
**When** Perfect is achieved,
**Then** a celebration animation with spring physics plays.

**Given** the game balance,
**When** difficulty scales,
**Then** timing windows remain generous (gift context — never frustrating).

---

## Story 3.6: Mini-Game Result Screen & Rewards

**As a** player,
**I want** a consistent, beautiful result screen after every mini-game,
**So that** I always understand my rewards regardless of which game I played.

**Acceptance Criteria:**

**Given** I complete any mini-game,
**When** the result screen appears,
**Then** it shows the Miss/Good/Perfect outcome with consistent styling.

**Given** the result screen,
**When** rewards are displayed,
**Then** it clearly shows Enjoyment earned, tier bonus, and any special bonuses.

**Given** tier-based scaling,
**When** rewards are calculated,
**Then** higher-tier watches give proportionally better rewards.

**Given** the result screen on mobile,
**When** it renders,
**Then** touch targets are >= 44px and text is readable.
