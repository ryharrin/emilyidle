# Epic 6: Home Life

## Overview

The emotional heart of Emily At Last. Implements the progressive home life system with unlockable family photos, children's drawings, messages from Ryan, and the visual evolution of Emily's personal space across all 6 chapters. This is where the gift becomes deeply personal.

## Epic Goal

Deliver the complete Home Life gallery with family photos, kid drawings (Freddy, Sam, Simi), Ryan's messages, visual home evolution across chapters, and the progressive unlock system tied to milestones.

## Dependencies

- Epic 5 (Collection & Prestige) — requires prestige layers for home expansion unlocks

## Architecture References

- Home Life: Low complexity, gallery of unlockable content
- Content Discovery: Unlock logic lives in discovery system
- Asset Loading: Progressive photos/drawings
- 6-Hour Arc pacing for reveals

---

## Story 6.1: Home Gallery UI & Layout

**As a** player,
**I want** a beautiful Home Life gallery view,
**So that** I can see all my unlocked family content in one warm, personal space.

**Acceptance Criteria:**

**Given** I navigate to the Home tab,
**When** it renders,
**Then** I see a gallery layout with cards for photos, drawings, and messages.

**Given** locked content,
**When** I view it,
**Then** locked slots show as subtle "???" placeholders hinting at future unlocks.

**Given** unlocked content,
**When** I tap a photo or drawing,
**Then** it opens full-screen with context text.

**Given** the gallery on mobile,
**When** it renders,
**Then** the grid is responsive, cards are large enough for emotional impact, and scrolling is smooth.

---

## Story 6.2: Family Photo Unlocks

**As a** player,
**I want** family photos to unlock at career milestones,
**So that** each career achievement is paired with an emotional family moment.

**Acceptance Criteria:**

**Given** Hour 1 milestone,
**When** triggered,
**Then** first family photo unlocks (kids as babies).

**Given** career stage transitions,
**When** each new stage is reached,
**Then** era-appropriate family photos unlock (showing kids at different ages).

**Given** Chapter 5 milestones,
**When** Group Practice is reached,
**Then** the full family gallery is available.

**Given** a photo unlock,
**When** it triggers,
**Then** a gentle reveal animation plays and a toast notification appears.

---

## Story 6.3: Children's Drawings

**As a** player,
**I want** to discover children's artwork from Freddy, Sam, and Simi,
**So that** the kids feel present and real in the game.

**Acceptance Criteria:**

**Given** progression milestones,
**When** drawings unlock,
**Then** Freddy's watch drawing (age 6, crayon, recognizable watch shape) appears.

**Given** further progression,
**When** more drawings unlock,
**Then** Sam's family drawing (age 5, stick figures, "I ❤️ Emily") appears.

**Given** later progression,
**When** Simi's art unlocks,
**Then** Simi's scribble "watch" (age 3, endearing chaos) appears.

**Given** any drawing,
**When** I tap it,
**Then** I see it full-screen with a caption (e.g., "Freddy drew this for you").

---

## Story 6.4: Messages from Ryan

**As a** player,
**I want** to discover personal messages from Ryan at key milestones,
**So that** the game feels like receiving love notes throughout the journey.

**Acceptance Criteria:**

**Given** career stage transitions,
**When** each new stage is reached,
**Then** a message from Ryan about that era unlocks.

**Given** a message,
**When** I tap to read it,
**Then** it appears as intimate text (like a letter) with the stage context.

**Given** the messages collection,
**When** I view them,
**Then** they form a chronological narrative of Emily's journey as seen by Ryan.

---

## Story 6.5: Visual Home Evolution

**As a** player,
**I want** my home space to visually transform across the 6 chapters,
**So that** I can see my life evolving as I progress.

**Acceptance Criteria:**

**Given** Chapter 1 (PhD Student),
**When** the Home tab renders,
**Then** I see a cozy but sparse studio apartment.

**Given** Chapter 3 (VA Hospital),
**When** the Home renders,
**Then** the space has grown: more watches, family photo, meaningful items.

**Given** Chapter 6 (Retirement),
**When** the Home renders,
**Then** a beautiful complete home with museum-quality watch display and full gallery.

**Given** progression between chapters,
**When** the visual updates,
**Then** transitions feel organic (new items appear naturally).

---

## Story 6.6: Watch Display Case

**As a** player,
**I want** a visual watch display case in my home,
**So that** I can see my collection grow in a physical-feeling way.

**Acceptance Criteria:**

**Given** the Home tab,
**When** I view the watch display area,
**Then** owned watches appear in a display case visualization.

**Given** the display case,
**When** new watches are acquired,
**Then** they appear in the case with a subtle animation.

**Given** progression,
**When** my collection grows,
**Then** the display case grows from a single stand to an impressive showcase.
