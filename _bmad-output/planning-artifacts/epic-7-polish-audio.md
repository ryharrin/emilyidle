# Epic 7: Polish & Audio

## Overview

Final polish pass bringing Emily At Last to gift-grade quality. Implements audio (music + SFX), refined animations, the endgame sequence, achievement system, and the personalized ending. This epic transforms a working game into a premium emotional experience.

## Epic Goal

Deliver audio implementation (chapter themes + SFX), polished animations throughout, the complete achievement system, the endgame/victory sequence with personalized message, and credits.

## Dependencies

- Epics 1-6 — all game systems must be functional before polish

## Architecture References

- Audio: howler.js 2.2.x, user-gesture-gated, deferred implementation
- Audio Interface: `playSfx(id)`, `setMusic(track)`, `setEnabled(boolean)`
- Animations: Motion for spring physics, CSS for transitions
- No haptics (confirmed per architecture)

---

## Story 7.1: Audio System & Music

**As a** player,
**I want** ambient music that evolves across chapters,
**So that** the atmosphere deepens my emotional experience.

**Acceptance Criteria:**

**Given** the audio system,
**When** implemented,
**Then** it uses howler.js with the thin interface: `playSfx(id)`, `setMusic(track)`, `setEnabled(boolean)`.

**Given** iOS Safari,
**When** audio is first requested,
**Then** it is gated behind a user gesture (tap to start).

**Given** chapter progression,
**When** the player advances chapters,
**Then** music transitions smoothly between chapter themes.

**Given** settings,
**When** the player toggles audio off,
**Then** all audio stops and the preference persists.

---

## Story 7.2: Sound Effects

**As a** player,
**I want** premium, tactile sound effects for interactions,
**So that** every tap and mini-game feels satisfying.

**Acceptance Criteria:**

**Given** mini-game interactions,
**When** I wind, align, tap rhythm, or complete a session,
**Then** appropriate mechanical/premium sounds play.

**Given** unlock events,
**When** a watch, photo, or achievement unlocks,
**Then** a pleasant chime or notification sound plays.

**Given** UI interactions,
**When** I tap buttons or navigate tabs,
**Then** subtle UI feedback sounds play (optional per settings).

---

## Story 7.3: Animation Polish Pass

**As a** player,
**I want** smooth, satisfying animations throughout the game,
**So that** the experience feels premium and luxurious.

**Acceptance Criteria:**

**Given** number changes (currency, XP),
**When** values update,
**Then** numbers animate smoothly (counting up/down).

**Given** tab transitions,
**When** I switch tabs,
**Then** content transitions smoothly (no jarring cuts).

**Given** purchase confirmations,
**When** I buy a watch,
**Then** a satisfying acquisition animation plays.

**Given** progress bars,
**When** they fill,
**Then** they animate with spring physics.

---

## Story 7.4: Achievement System

**As a** player,
**I want** achievements to celebrate milestones throughout my journey,
**So that** I have visible markers of my accomplishments.

**Acceptance Criteria:**

**Given** the achievement system,
**When** conditions are met,
**Then** achievements unlock via the discovery system.

**Given** achievement categories,
**When** I view them,
**Then** they span: Collection, Career, Mini-Games, Home Life, and Secret/Hidden.

**Given** an achievement unlock,
**When** it triggers,
**Then** a toast notification with the achievement name, icon, and description appears.

**Given** a hidden/secret achievement,
**When** not yet unlocked,
**Then** it appears as "???" in the list.

---

## Story 7.5: Endgame & Victory Sequence

**As a** player,
**I want** a beautiful, emotional ending when I complete the game,
**So that** the 6-hour journey has a satisfying, tear-inducing climax.

**Acceptance Criteria:**

**Given** all victory conditions are met (complete collection, max career, all prestige, full home),
**When** the endgame triggers,
**Then** a special "At Last" sequence begins.

**Given** the ending sequence,
**When** it plays,
**Then** it shows: personalized message from Ryan, "family photo" scene with all unlocked elements, and credits.

**Given** the personalized message,
**When** displayed,
**Then** it acknowledges Emily's completion and expresses the love that built the game.

**Given** the save file after completion,
**When** inspected,
**Then** it shows "Complete" status.

---

## Story 7.6: Credits & Personal Touches

**As a** player,
**I want** credits with personal acknowledgments,
**So that** the game feels like a complete, handmade gift.

**Acceptance Criteria:**

**Given** the credits sequence,
**When** it plays,
**Then** it scrolls with personal touches and acknowledgments.

**Given** the credits content,
**When** I read them,
**Then** they acknowledge the love, effort, and meaning behind the gift.

**Given** the Chapter 6 "At Last" title,
**When** it appears,
**Then** Emily understands the title's significance.

---

## Story 7.7: Performance & Battery Optimization

**As a** player,
**I want** the game to run smoothly for 6 hours without killing my battery,
**So that** I can complete the experience without frustration.

**Acceptance Criteria:**

**Given** a 6-hour play session on iPhone 17,
**When** performance is measured,
**Then** 60fps is maintained consistently.

**Given** battery usage,
**When** measured over an hour,
**Then** consumption is <5% per hour.

**Given** memory usage,
**When** monitored,
**Then** it stays <100MB throughout.

**Given** initial load,
**When** measured on WiFi/5G,
**Then** time to interactive is <2 seconds.

---

## Story 7.8: Final Integration Testing

**As a** developer,
**I want** end-to-end testing of the complete 6-hour arc,
**So that** the gift experience is verified as crash-free and emotionally coherent.

**Acceptance Criteria:**

**Given** a fresh save,
**When** I play through all 6 chapters (with debug fast-forward),
**Then** every unlock triggers at the correct moment.

**Given** the pacing,
**When** tested end-to-end,
**Then** major milestones occur at approximately the target hours.

**Given** error boundaries,
**When** tested with deliberate failures,
**Then** no white screens occur; fallbacks work.

**Given** persistence,
**When** the app is reloaded at every chapter boundary,
**Then** state is perfectly restored.
