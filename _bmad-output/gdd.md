---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/component-inventory.md
  - docs/data-models.md
  - docs/development-guide.md
  - docs/source-tree-analysis.md
  - docs/testing.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 8
workflowType: "gdd"
lastStep: 5
project_name: "watch-idle"
user_name: "Ryan"
date: "2026-02-20"
game_type: "idle-incremental"
game_name: "Emily Idle"
---

# Emily Idle - Game Design Document

**Author:** Ryan
**Game Type:** Idle/Incremental
**Target Platform(s):** Mobile Web Browser (Primary), Desktop Web Browser (Secondary)

---

## Target Platform(s)

### Primary Platform

**Mobile Web Browser (Phone)** - Progressive Web App (PWA) capable

Emily Idle is designed primarily for mobile browser play, allowing players to engage with the game anywhere without requiring an app store download. The Vite + React + TypeScript stack supports responsive design that adapts to various screen sizes while maintaining touch-first interactions.

### Secondary Platform

**Desktop Web Browser** - Development and testing environment

While the game is optimized for mobile, full desktop browser support is maintained for development workflow and players who prefer larger screens. The same codebase serves both platforms through responsive design patterns.

### Platform Considerations

**Mobile-First Design:**

- Touch controls as primary input method
- Thumb-friendly UI zones (bottom navigation, large tap targets)
- Responsive breakpoints for various phone sizes
- Portrait orientation optimization
- Safe area insets for notched displays

**Performance Targets:**

- 60fps on mid-range mobile devices (iPhone 12+, Pixel 5+)
- Initial load under 3 seconds on 4G
- Progressive loading of watch catalog assets
- Battery-conscious rendering (requestAnimationFrame optimization)
- Offline capability via service worker (PWA features)

**Browser Compatibility:**

- Modern mobile browsers (Chrome, Safari, Firefox, Samsung Internet)
- ES2020+ JavaScript support required
- CSS Grid and Flexbox layout
- localStorage for save persistence (with backup export)

### Control Scheme

**Primary (Mobile):**

- **Tap** - Select/activate UI elements, purchase items, start interactions
- **Swipe/Scroll** - Navigate lists, scroll content areas
- **Long-press** - Context menus (if applicable)
- **Pinch** - Zoom on detailed views (watch details)

**Secondary (Desktop):**

- **Click** - Equivalent to tap
- **Scroll wheel** - Navigate lists
- **Keyboard shortcuts** - Optional power-user features (space for quick actions, number keys for tabs)

---

## Target Audience

### Demographics

**Primary Player:**

- **Age:** 25-45 (matching Emily's demographic)
- **Occupation:** Working professional (psychology field or similar)
- **Location:** English-speaking regions (initially)
- **Device:** Smartphone primary computing device
- **Income:** Middle to upper-middle class (can afford watch collecting hobby)

**Secondary Audiences:**

- Idle/incremental game enthusiasts
- Watch collectors and enthusiasts
- People interested in psychology/therapy themes
- Gift recipients seeking meaningful personalization

### Gaming Experience

**Casual to Mid-Core** - "The Thoughtful Collector"

Players have some gaming experience but don't identify as "gamers." They appreciate:

- Games that respect their time (progress while away)
- Meaningful progression without requiring constant attention
- Aesthetic polish and thematic coherence
- Emotional resonance and personalization
- Short session compatibility (2-5 minute check-ins)

Not looking for:

- Competitive multiplayer
- Complex mechanics requiring guides
- Pay-to-win mechanics
- Daily obligations or FOMO-driven design

### Genre Familiarity

**Genre Aware but Not Expert**

Target players likely have passing familiarity with idle/incremental games (Cookie Clicker, Clicker Heroes) through cultural osmosis or brief experimentation. They understand:

- Passive resource generation concept
- Upgrade purchasing
- Prestige/reset mechanics

However, they may not be familiar with:

- Optimal build orders
- Complex prestige layering
- Save-scumming or advanced strategies

The game teaches through gentle onboarding rather than assuming expertise.

### Session Length

**Micro-Sessions with Optional Deep Dives**

- **Typical session:** 2-5 minutes (checking income, buying upgrades, starting career session)
- **Medium session:** 10-15 minutes (engaging with mini-games, planning prestige)
- **Deep session:** 30+ minutes (rare, for significant milestones or new features)

Designed for "check-in" gameplay that respects busy schedules. The game progresses meaningfully even with minimal daily engagement.

### Player Motivations

**What draws this audience to Emily Idle:**

1. **Collection Satisfaction** - Completing the watch catalog, seeing rare pieces acquired
2. **Progress Visibility** - Clear growth from session to session
3. **Thematic Resonance** - Personal connection to watches and psychology career
4. **Emotional Connection** - Gift context creates sentimental value (seeing family references)
5. **Low Pressure** - No competitive elements, play at own pace
6. **Aesthetic Appreciation** - Beautiful watch images and polished UI
7. **Completionism** - Achievements, catalog completion, career milestones

**Avoiding Frustration:**

- No hard time gates requiring specific login times
- No exclusive limited-time content
- No forced social features
- No paywalls blocking core progression

---

## Executive Summary

### Game Name

Emily Idle (working title: watch-idle)

### Core Concept

Emily Idle is a browser-based idle/incremental game that combines watch collection mechanics with a therapist career progression system. Players collect watches across four tiers (quartz, automatic, manual, tourbillon), each generating passive income and enjoyment currency. The unique dual-progression system requires players to balance their growing watch collection with an active therapist career, creating engaging gameplay loops that cater to both idle and active play styles.

The game features a three-layer prestige system (Workshop, Maison, Nostalgia) that provides long-term progression through permanent bonuses and unlocks. Real-world watch models from the catalog create an authentic collection experience, while mini-game interactions (winding, automatic movement, quartz alignment) add active engagement during play sessions.

### Game Type

**Type:** Idle/Incremental  
**Framework:** This GDD uses the idle-incremental template with type-specific sections for core interaction, upgrade trees, automation systems, prestige mechanics, number balancing, and meta-progression.

### Target Experience

Players should experience:

- Satisfying progression curves with exponential growth
- Meaningful choices in upgrade paths and career specializations
- Balanced active/idle gameplay (mini-games for engagement, automation for idle)
- Long-term goals through multi-layer prestige system
- Collection satisfaction from acquiring rare/timepiece watches
- Integration of career narrative with collection mechanics
- Emotional connection through personalized home life system

### Key Differentiators

1. **Dual Progression**: Watch collection (passive) + Career system (active)
2. **Real Watch Catalog**: 100+ authentic timepieces with Emily's favorites highlighted (Royal Oaks, Rolexes, rose gold)
3. **Therapy Career**: Unique profession mechanic with three specialization tracks
4. **Movement-Based Interactions**: Different mini-games for each watch type
5. **Home Life Feature**: Personal space that evolves with unlockable family photos and children's artwork
6. **Personal Touches**: Subtle Easter eggs and references meaningful to Emily

### Gift Context

This game is being created as a personalized gift for Emily, who collects watches and works as a psychologist. The design incorporates her specific interests, family (partner Ryan, children Freddy (6), Sam (almost 5), and Simi (3)), and creates a meaningful experience that reflects her passions and loved ones.

---

## Goals and Context

### Project Goals

**Primary Goal: Emotional Connection**  
Create a personalized interactive experience that makes Emily feel deeply seen, understood, and loved. Success is measured by her emotional response - enjoyment, surprise, and ideally, tears of feeling cherished.

**Secondary Goal: Craftsmanship**  
Demonstrate care and attention to detail through polished gameplay, thoughtful integration of her interests, and quality execution. The game should feel like a premium gift, not a rough prototype.

**Scope Goal: Personal Gift**  
This game is designed exclusively for Emily. It is not intended for public release, commercial distribution, or other players. The hyper-personalization (family references, specific watch preferences, career details) is a feature, not a limitation.

### Success Metrics

- **Emotional Impact:** Does Emily feel genuinely moved when she recognizes the personal details?
- **Engagement:** Does she want to keep playing and discovering new references?
- **Recognition:** Does she see herself reflected in the game systems and content?

**Note:** Traditional metrics (downloads, revenue, retention) are irrelevant. This is a gift, not a product.

### Background and Rationale

**Motivation:**  
Emily Idle was created as a personalized gift for Emily, who collects watches and works as a psychologist. The game weaves together her professional identity (therapy career), her hobby (watch collecting), and her family (partner Ryan, children Freddy, Sam, and Simi) into an interactive experience that celebrates who she is.

**Timing:**  
The game represents a significant investment of time and technical skill, demonstrating the depth of care and attention Ryan has for Emily's interests and passions.

**Personal Touch:**  
Every system in the game reflects real aspects of Emily's life:

- The watch catalog features her favorite brands (Royal Oak, Rolex) and materials (rose gold)
- The career system mirrors her psychology profession
- The home life feature includes her actual family members
- Subtle references acknowledge her journey and identity

This isn't just a game about idle mechanics - it's a love letter expressed through code, art, and game design.

---

## Unique Selling Points (USPs)

### 1. Hyper-Personalization

**What it is:** A game built from the ground up around ONE specific person's interests, relationships, and identity.

**Why it's unique:** Most games aim for broad appeal. Emily Idle aims for maximum personal resonance. Every watch, every career milestone, every family reference is chosen specifically for Emily.

**Why it matters to Emily:** She will recognize herself in every system. This isn't "a game about watches" - it's "Ryan made a game about MY watch collection."

### 2. Private Gift Context

**What it is:** A digital experience created exclusively for one recipient, not intended for public consumption.

**Why it's unique:** Games are typically commercial products or shared experiences. This is intimate digital art - a private world built for one person to explore.

**Why it matters to Emily:** The exclusivity makes it special. This game exists because someone cared enough to build it just for her.

### 3. Authentic Integration of Dual Identity

**What it is:** Seamless blending of watch collecting (hobby) and psychology career (profession) into complementary game systems.

**Why it's unique:** Most games focus on one theme. Emily Idle celebrates both sides of Emily's identity without compromise.

**Why it matters to Emily:** She doesn't have to choose which part of herself to engage with - the game honors all of who she is.

### 4. Family as Game Elements

**What it is:** Real family members (Ryan, Freddy, Sam, Simi) integrated into the game through unlockable photos, children's artwork, and home life features.

**Why it's unique:** Games rarely incorporate actual personal relationships in meaningful ways. This isn't generic "family" - it's HER family.

**Why it matters to Emily:** Seeing her children's drawings and family photos in the game creates emotional touchpoints that generic content never could.

### 5. The "Ryan Made This" Factor

**What it is:** Knowledge that her partner invested significant time, technical skill, and creative energy specifically for her.

**Why it's unique:** The gift IS the USP. The game mechanics matter, but the fact that Ryan built this matters more.

**Why it matters to Emily:** Every tap, every watch acquired, every achievement unlocked is a reminder of being deeply loved.

---

## Competitive Positioning

**This game has no competition.**

Not because it's better than other idle games, but because it's not competing. Cookie Clicker, AdVenture Capitalist, and Melvor Idle serve different purposes - they're products for mass consumption.

Emily Idle is a gift. It doesn't need to compete because it serves an audience of one, and that one person will love it not despite its specificity, but because of it.

The "competition" isn't other games - it's other gifts. And a handmade, personalized game that reflects deep understanding of someone's passions is hard to beat.

---

## Core Gameplay

### Game Pillars

**Pillar 1: Personal Resonance**  
Every system should make Emily feel seen, understood, and celebrated for who she is.

**Pillar 2: Completable Journey**  
A self-contained experience with a beginning, middle, and satisfying end. ~6 hour total playtime.

**Pillar 3: Active Engagement**  
Meaningful decisions and interactions, not just waiting. Player skill and choices matter.

**Pillar 4: Dual Identity Celebration**  
Honor both watch collector AND psychologist identities through integrated systems.

**Pillar 5: Emotional Connection**  
Create moments of surprise, delight, and feeling deeply loved.

**Pillar Prioritization:** When pillars conflict, prioritize in this order:  
Personal Resonance > Emotional Connection > Completable Journey > Active Engagement > Dual Identity Celebration

_(Example: If an active gameplay element would reduce emotional impact, emotional impact wins.)_

### Core Gameplay Loop

**Structure: Active Incremental with Continuous Progression**

**The 6-Hour Arc:**

- **Hour 1: Foundation** ("First Steps") - Initial collection, basic career, first family photo
- **Hour 2: Growth** ("Building Momentum") - First prestige (Workshop), specialization choice, more kid drawings
- **Hour 3: Deepening** ("Going Further") - Second prestige (Maison), advanced mini-games, home life expands
- **Hour 4: Mastery** ("The Grind") - Final prestige (Nostalgia), high-tier watches, deeper personal references
- **Hour 5: Completion** ("Almost There") - Final career milestones, complete collection within reach
- **Hour 6: The Finish** ("Complete") - Final achievements, complete home gallery, personalized ending

**Core Loop (Active Play):**

1. **Earn Currency** - Through active mini-games (not passive waiting)
   - Wind manual watches (timing game)
   - Align quartz movements (precision game)
   - Shake automatic watches (rhythm game)
   - Complete therapy sessions (dialogue/choice game)

2. **Make Meaningful Choices** - What to buy, when to prestige, which career path
   - Limited resources require real decisions
   - Different paths create different experiences
   - Choices affect unlock timing and emotional reveals

3. **Unlock Content** - New watches, career milestones, home life features
   - Each unlock reveals new personal references
   - Home life unlocks family photos/kid art progressively
   - Achievements tied to Emily's actual interests

4. **Strategize** - Plan optimal progression route
   - Which prestige layer first?
   - Which career specialization?
   - Which watches to prioritize?

5. **Experience Emotional Beats** - Narrative moments tied to progression
   - "First Royal Oak acquired" - special message
   - Career level milestones unlock "notes from family"
   - Home life reveals happen at specific points

**Loop Timing:**

- **Decision cycle:** Every 2-5 minutes (meaningful choice point)
- **Mini-game:** 30 seconds - 2 minutes (active engagement)
- **Total experience:** ~6 hours (one continuous journey)

**What Makes Each Hour Different:**

- New watches added to collection
- Career progression unlocks new abilities
- Achievement milestones reached
- Home life decorations unlocked progressively
- Prestige layers accessible at specific points
- Emotional reveals deepen as play continues

### Win/Loss Conditions

**Victory Condition: The Complete Collection**

Emily "completes" the game by:

1. **Collecting all watches** from her favorite brands (Royal Oak, Rolex, rose gold pieces highlighted)
   - **Special Milestone:** Jaeger-LeCoultre Master Ultra Thin Moon Q1252501 (34mm rose gold) - Awarded upon PhD completion, featuring moon phase complication celebrating Emily's achievement
2. **Maxing out career** - Reaching top level with all specializations unlocked
3. **Completing all prestige layers** - Workshop → Maison → Nostalgia
4. **Unlocking full home life** - All family photos and children's drawings displayed
5. **Achieving "The Perfect Collection"** - Special endgame achievement

**Ending Sequence:**

- Personalized message from Ryan acknowledging completion
- "Family photo" scene with all unlocked elements visible
- Credits with personal touches and acknowledgments
- Optional save file showing "Complete" status

**No Failure States:**

- Cannot "lose" - only progress at different speeds
- All content is unlockable with time and engagement
- No game over, no penalties, no frustration mechanics

---

## Game Mechanics

### Primary Mechanics

**Core Design Philosophy:** Every mechanic serves emotional connection and personal resonance.

#### Mini-Games (Active Engagement)

**1. Manual Winding - Timing**

- **Input:** Hold to wind, release at optimal point
- **Skill:** Timing-based precision
- **Feel:** Tactile, satisfying, meditative
- **Reward:** Currency based on precision

**2. Quartz Alignment - Precision**

- **Input:** Drag to align hands/markers
- **Skill:** Steady hand, careful placement
- **Feel:** Clean, focused, zen-like
- **Challenge:** Different difficulty per watch tier

**3. Automatic Movement - Rhythm** _(replaces shake/tilt)_

- **Input:** Tap in rhythm (like a metronome)
- **Skill:** Finding optimal tempo
- **Visual:** Rotor spins, power reserve fills
- **Benefit:** No awkward phone shaking in professional settings

**4. Therapy Session - Simple Presence**

- **Input:** Patient speaks, single tap to continue
- **Response:** "That's interesting, tell me more"
- **Philosophy:** Focus on being present, not solving puzzles
- **Authentic:** Matches actual therapeutic stance - listening without judgment
- **Reward:** Career XP + cash payout

#### Currency Systems

**Primary Currencies:**

1. **Cash (cents)** - Primary buying power for watches and upgrades
2. **Enjoyment** - Secondary for prestige/unlocks and home life
3. **Career XP** - Progression through career stages

**Prestige Currencies:**

- **Blueprints** (Workshop prestige)
- **Heritage** (Maison prestige)
- **Nostalgia Points** (Nostalgia prestige - permanent)

#### Watch Collection Mechanics

**Four Tiers:**

- **Quartz** - Lowest income, easiest mini-game (alignment)
- **Manual** - Low income, winding mini-game (requires daily engagement)
- **Automatic** - Medium income, rhythm mini-game (self-winding sophistication)
- **Tourbillon** - High income, complex mini-game (masterpiece tier)

**Unlock Progression:**

- Start with basic quartz
- Unlock manual winding at early career stage
- Automatic watches at mid-career (higher tier, more sophisticated)
- Tourbillon at late career
- **JLC Q1252501** (34mm rose gold) at PhD completion milestone

#### Career System (Simplified)

**One Track: Emily's Career Journey** (Inspired by Increlution's life progression)

**Stages:**

1. **PhD Student** - Learning, first clients, dissertation stress
2. **Externship** - Supervised practice, finding her voice
3. **VA Hospital** - Serving veterans, institutional setting
4. **Private Practice** - Independence, building clientele
5. **Group Practice** - Collaboration, mentorship, growth
6. **Retirement** - Legacy, wisdom, freedom

**Each Stage Unlocks:**

- New watch tiers
- Higher income rates
- Home life content (photos from that era)
- Personal messages from Ryan about that time
- Career-specific patient scenarios

**Session Mechanics:**

- Cooldown between sessions (short)
- Simple "presence" gameplay (not complex dialogue)
- Authentic to therapeutic relationship
- Rewards based on stage progression

#### Home Life System

**Progressive Unlocks (6-Hour Arc):**

- **Hour 1:** First family photo (kids as babies)
- **Hour 2:** Kid drawings from early years
- **Hour 3:** Home customization opens, watch display case
- **Hour 4:** "PhD Celebration" scene with JLC Q1252501 unlock
- **Hour 5:** Full family gallery, career milestone photos
- **Hour 6:** Personalized ending with Ryan's message

**Home Life Content:**

- **Family Photos:** Unlock at career milestones showing kids at different ages
- **Kid Drawings:** Children's artwork displayed (watches, family, etc.)
- **Watch Display:** Collection visualization
- **Messages from Ryan:** Notes about each career stage
- **Visual Evolution:** Home grows from simple apartment to beautiful space

**Interactivity:**

- Tap photos to view full size with context
- Read messages from Ryan
- See watch collection displayed
- Visual progression reflects Emily's journey

### Controls and Input

**Touch-First Design:**

- **Tap:** Select, activate, continue, simple interactions
- **Hold + Release:** Winding mini-game
- **Drag:** Alignment mini-game
- **Rhythm Taps:** Automatic movement mini-game
- **Swipe/Scroll:** Navigation, lists

**No Complex Inputs:**

- No multi-touch gestures
- No shake/tilt (to avoid awkwardness)
- No precise drawing
- Simple, accessible, comfortable

**Accessibility:**

- Large tap targets (44pt minimum)
- Clear visual feedback
- Forgiving timing windows
- No required keyboard shortcuts

---

{{GAME_TYPE_SPECIFIC_SECTIONS}}

---

## Progression and Balance

### Player Progression

{{player_progression}}

### Difficulty Curve

{{difficulty_curve}}

### Economy and Resources

{{economy_resources}}

---

## Level Design Framework

### Level Types

{{level_types}}

### Level Progression

{{level_progression}}

---

## Art and Audio Direction

### Art Style

{{art_style}}

### Audio and Music

{{audio_music}}

---

## Technical Specifications

### Performance Requirements

{{performance_requirements}}

### Platform-Specific Details

{{platform_details}}

### Asset Requirements

{{asset_requirements}}

---

## Development Epics

### Epic Structure

{{epics}}

---

## Success Metrics

### Technical Metrics

{{technical_metrics}}

### Gameplay Metrics

{{gameplay_metrics}}

---

## Out of Scope

{{out_of_scope}}

---

## Assumptions and Dependencies

{{assumptions_and_dependencies}}
