---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
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
lastStep: 13
project_name: "watch-idle"
user_name: "Ryan"
date: "2026-02-20"
game_type: "idle-incremental"
game_name: "Emily At Last"
---

# Emily At Last - Game Design Document

**Author:** Ryan
**Game Type:** Idle/Incremental
**Target Platform(s):** Mobile Web Browser (Primary), Desktop Web Browser (Secondary)

---

## Target Platform(s)

### Primary Platform

**Mobile Web Browser (Phone)** - Progressive Web App (PWA) capable

Emily At Last is designed primarily for mobile browser play, allowing players to engage with the game anywhere without requiring an app store download. The Vite + React + TypeScript stack supports responsive design that adapts to various screen sizes while maintaining touch-first interactions.

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

**What draws this audience to Emily At Last:**

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

Emily At Last (working title: emily-at-last)

### Core Concept

Emily At Last is a browser-based idle/incremental game that combines watch collection mechanics with a therapist career progression system. Players collect watches across four tiers (quartz, automatic, manual, tourbillon), each generating passive income and enjoyment currency. The unique dual-progression system requires players to balance their growing watch collection with an active therapist career, creating engaging gameplay loops that cater to both idle and active play styles.

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
Emily At Last was created as a personalized gift for Emily, who collects watches and works as a psychologist. The game weaves together her professional identity (therapy career), her hobby (watch collecting), and her family (partner Ryan, children Freddy, Sam, and Simi) into an interactive experience that celebrates who she is.

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

**Why it's unique:** Most games aim for broad appeal. Emily At Last aims for maximum personal resonance. Every watch, every career milestone, every family reference is chosen specifically for Emily.

**Why it matters to Emily:** She will recognize herself in every system. This isn't "a game about watches" - it's "Ryan made a game about MY watch collection."

### 2. Private Gift Context

**What it is:** A digital experience created exclusively for one recipient, not intended for public consumption.

**Why it's unique:** Games are typically commercial products or shared experiences. This is intimate digital art - a private world built for one person to explore.

**Why it matters to Emily:** The exclusivity makes it special. This game exists because someone cared enough to build it just for her.

### 3. Authentic Integration of Dual Identity

**What it is:** Seamless blending of watch collecting (hobby) and psychology career (profession) into complementary game systems.

**Why it's unique:** Most games focus on one theme. Emily At Last celebrates both sides of Emily's identity without compromise.

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

Emily At Last is a gift. It doesn't need to compete because it serves an audience of one, and that one person will love it not despite its specificity, but because of it.

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

## Idle/Incremental Specific Design

### Core Interaction

**Economy Flow:**

1. **Watches recharge** → Mini-games generate **Enjoyment** (hobbies restore us)
2. **Career sessions consume** → Spend Enjoyment to earn **Cash** (work takes energy)
3. **Cash buys watches** → More/better watches → More Enjoyment generation
4. **Family adds Love** → Love boosts Enjoyment (family support helps recharge)

**Primary Interactions:**

**Mini-Games (Active):**

- Winding, alignment, rhythm games
- Higher skill = more Enjoyment
- Quality of watch affects Enjoyment yield (better watches = more Enjoyment)

**Family Interactions (Quick Check-in):**

- Simple "tap to check in" with family
- Generates Love which converts to Enjoyment boost
- Perfect for quick sessions

**Fallback Interaction:**

- "Collect passive income" tap for quick check-ins
- Collects accumulated passive Enjoyment from currently worn watch
- Smaller than active mini-game earnings

**Feedback:**

- Haptic feedback on mobile
- Smooth animations
- Satisfying completion sounds
- Visual celebration for perfect mini-games

### Upgrade Trees

**Cash Purchases:**

- Better watches (higher Enjoyment generation)
- Career tools (higher Cash per session)
- Home improvements (Love generation boost)

**Enjoyment Upgrades:**

- Watch maintenance (better mini-game rewards)
- Family time efficiency (more Love per interaction)

**Structure:**

- Mostly linear progression
- Key choice points: Focus on watch collection vs career advancement
- Example: "Invest in Royal Oak specialization" vs "Expand private practice"

### Automation Systems

**Passive Enjoyment Generation:**

- **Currently worn watch:** Base passive Enjoyment (small but steady)
- **Collection bonus:** Tiny passive from all owned watches
- **Quality matters:** Higher tier watches generate more passive + mini-game potential
- **Emily's favorites:** Royal Oaks, Rolexes, rose gold pieces = bonus passive Enjoyment

**Career Stage Scaling:**

| Stage                | Cash/Session | Enjoyment Cost | Passive Enjoyment |
| -------------------- | ------------ | -------------- | ----------------- |
| **PhD**              | Low          | Low            | Very Low          |
| **Externship**       | Low-Mod      | Low-Mod        | Low               |
| **VA**               | Moderate     | Moderate       | Moderate          |
| **Private Practice** | High         | High           | Good              |
| **Group Practice**   | Very High    | Very High      | High              |
| **Retirement**       | Low          | Zero           | Very High         |

This mirrors real career arc - early grinding, mid-career peak demands/earnings, late career coasting.

### Prestige and Reset Mechanics

**Soft Prestige (No Reset):**
Sequential unlocks without losing progress:

**Workshop (Hour 2):**

- Unlocks manual and automatic watches
- Basic income multipliers
- First home life expansion

**Maison (Hour 4):**

- Unlocks tourbillon watches
- Better multipliers
- Premium home features

**Nostalgia (Hour 6/Endgame):**

- Permanent bonuses unlocked
- "Museum quality" collection status
- Final home life gallery complete

**Why Soft Prestige:**
A gift shouldn't feel like work. Emily always moves forward, never backward.

### Number Balancing

**6-Hour Pacing:**

- **Hour 1:** PhD stage, basic quartz, first family photo
- **Hour 2:** Externship, manual watches, Workshop prestige
- **Hour 3:** VA, automatic watches, **JLC Q1252501 milestone** (PhD completion celebration)
- **Hour 4:** Private Practice, tourbillon, Maison prestige
- **Hour 5:** Group Practice, nearing completion
- **Hour 6:** Retirement, Nostalgia prestige, ending sequence

**Key Milestones:**

- **JLC Q1252501:** Awarded (not purchased) at Hour 3 - celebrating PhD completion
- **First Royal Oak:** Mid-game unlock (Hours 3-4)
- **Complete Collection:** Endgame achievement (Hour 6)

**Economy Targets:**

- Early game: Grind with basic watches, many career sessions needed
- Mid game: Better watches = more Enjoyment = fewer sessions needed for same Cash
- Late game: High-tier watches generate massive Enjoyment, career sessions very rewarding

### Meta-Progression

**Primary Experience:**

- One perfect 6-hour playthrough
- Designed for emotional impact
- No pressure to replay

**Optional Replay:**

- Keep home life gallery unlocked (emotional rewards persist)
- Can make different career choices
- Faster progression on subsequent plays
- **Not required:** The gift is complete after one playthrough

**This is a gift, not a service.** The goal is one perfect experience that makes Emily feel deeply loved.

---

## Progression and Balance

### Player Progression

{{player_progression}}

### Difficulty Curve

{{difficulty_curve}}

### Economy and Resources

**Resources:**

- **Enjoyment** - Generated by watches/family, consumed by career sessions
- **Cash** - Earned from career, spent on watches
- **Love** - Generated by family interactions, boosts Enjoyment generation

**Economy Flow:**
Watches (mini-games) → Enjoyment → Career Sessions → Cash → Better Watches

Quality affects Enjoyment generation - better watches provide more recharge per interaction.

---

## Progression and Balance

### Player Progression

**Progression Types:**

1. **Collection Progression** - Gathering watches across all four tiers (Quartz → Manual → Automatic → Tourbillon)
2. **Career Progression** - Moving through authentic career stages (PhD → Externship → VA → Private Practice → Group Practice → Retirement)
3. **Home Life Progression** - Unlocking family photos and children's drawings at milestones
4. **Skill Progression** - Optional improvement in mini-game performance

**Primary Driver:** Career stage advancement provides the narrative arc, while watch collection provides completion goals. Both progress simultaneously.

**Progression Pacing:**

- Meaningful unlocks every 15-20 minutes
- Major milestones (new career stage, prestige layer) every hour
- Visual home changes reflect progress continuously
- Accelerating sense of growth as better watches unlock

**Visible Progression:**

- Career stage indicator with progress bar
- Watch collection checklist with visual catalog
- Home life gallery showing unlocked photos/artwork
- Passive income rate display (grows with progress)

### Difficulty Curve

**Pattern: Gentle Exponential + Sawtooth (Prestige Releases)**

**Early Game (Hours 1-2):**

- Generous timing windows on mini-games
- Simple patterns, forgiving mechanics
- Low resource pressure
- Focus on learning and discovery

**Mid Game (Hours 3-4):**

- Moderate challenge increase
- Tighter timing windows
- More complex mini-game patterns
- Prestige unlocks provide "breathers" (new tools, temporary relief)

**Late Game (Hours 5-6):**

- Challenging but not frustrating
- High skill ceiling for optimal play
- Satisfying mastery of all systems
- Final prestige (Nostalgia) brings everything together

**Challenge Scaling:**

- Mini-games gradually increase complexity
- Resource demands scale with career stage
- Player skill improvement offsets difficulty increase
- Optional "perfect" performances for bonus rewards

**Accessibility:**

- Generous timing windows (gift context - shouldn't frustrate)
- No fail states, only suboptimal outcomes
- Can always progress, skill just accelerates progress
- Clear visual feedback on performance

### Economy and Resources

**Resource Types:**

1. **Enjoyment** (Energy Resource)
   - Generated by: Watch mini-games, family interactions
   - Consumed by: Career therapy sessions
   - Purpose: Limits career grinding, encourages watch engagement

2. **Cash** (Currency Resource)
   - Generated by: Career therapy sessions
   - Spent on: New watches, upgrades, home improvements
   - Purpose: Purchase progression, collection building

3. **Love** (Bonus Resource)
   - Generated by: Family check-in interactions
   - Effect: Boosts Enjoyment generation rate
   - Purpose: Emotional connection, rewards engagement with family system

**Economy Flow:**

```
Watches (mini-games) → Enjoyment
                           ↓
                    Career Sessions → Cash
                           ↓
                    Better Watches
```

**Key Economic Principles:**

- Work takes energy (Enjoyment cost)
- Hobbies restore energy (Enjoyment generation)
- Family support boosts energy (Love multiplier)
- Better tools improve efficiency (quality matters)

**Scaling:**

- Early: Low Enjoyment generation, need frequent mini-games
- Mid: Moderate generation, can sustain longer career sessions
- Late: High generation, efficient work/play balance
- Endgame: Very high passive Enjoyment, focus shifts to collection completion

---

## Level Design Framework

### Level Types

**Hub Structure with Sequential Chapters**

**Central Hub: Home Base**

- Emily's personal space that evolves throughout the journey
- Access to all other areas
- Visual representation of progress (photos, watch display, decor)
- Emotional anchor of the experience

**Connected Areas:**

- **Watch Collection** - View, interact with, and manage watch collection
- **Career Office** - Conduct therapy sessions, advance career
- **Market** - Purchase new watches and upgrades
- **Home Life Gallery** - Family photos, kid drawings, personal touches

**Career Stages as Chapters:**

Each career stage represents a chapter in Emily's journey of becoming:

1. **Chapter 1: "First Steps"** (PhD Student)
   - Theme: Learning, foundation building, uncertainty
   - Unlocks: Basic quartz watches, first family photo
   - Visual: Simple apartment, sparse decor

2. **Chapter 2: "Finding Her Voice"** (Externship)
   - Theme: Supervised practice, building confidence
   - Unlocks: Manual watches, early career tools
   - Visual: More professional space

3. **Chapter 3: "Service"** (VA Hospital)
   - Theme: Giving back, serving community
   - Unlocks: Automatic watches, **JLC Q1252501 milestone**
   - Visual: Institutional but meaningful setting

4. **Chapter 4: "Independence"** (Private Practice)
   - Theme: Standing on her own, entrepreneurship
   - Unlocks: Tourbillon watches, premium home features
   - Visual: Beautiful personal office

5. **Chapter 5: "Growth"** (Group Practice)
   - Theme: Collaboration, mentorship, expansion
   - Unlocks: Final watch tiers, complete home gallery
   - Visual: Professional suite, established presence

6. **Chapter 6: "At Last"** (Retirement)
   - Theme: Completion, freedom, legacy
   - Unlocks: Final achievements, complete collection
   - Visual: Beautiful home, museum-quality display

### Level Progression

**Sequential Chapter Unlock:**

- Chapters unlock by completing career stage requirements
- Each chapter must be experienced to progress
- No skipping - the journey is the gift

**Within-Chapter Progress:**

- Mini-goals: Collect specific watches, reach income targets
- Milestones: Unlock home life content at 25%, 50%, 75%, 100%
- Freedom: Player chooses which watches to prioritize within tier

**Visual Progression:**

- Home base transforms to reflect current chapter
- Photos from each era appear as milestones reached
- Watch display grows from single piece to full collection
- Lighting/atmosphere shifts (hustle early, serenity late)

**Pacing:**

- Chapter 1: ~45 minutes (learning, establishing)
- Chapter 2: ~45 minutes (building skills)
- Chapter 3: ~60 minutes (major milestone - JLC unlock)
- Chapter 4: ~60 minutes (accelerating growth)
- Chapter 5: ~60 minutes (nearing completion)
- Chapter 6: ~30 minutes (ending, reflection, "At Last")

**Total: 6 hours of continuous becoming**

---

## Art and Audio Direction

### Art Style

**Visual Direction: Clean, Elegant, Premium UI**

**Style Approach:**

- Vector/Flat with warm texture - Clean shapes but not sterile
- Premium luxury aesthetic - Like a high-end watch app meets cozy game
- Intimate and personal - Supporting the gift context
- Mobile-optimized - Readable on small screens, thumb-friendly

**Color Palette:**

- **Primary:** Warm cream/off-white backgrounds (elegant, calm, timeless)
- **Secondary:** Rose gold, champagne gold (Emily's stated preferences)
- **Accents:** Deep navy, forest green (classic horology colors)
- **Highlights:** Soft blues, gentle purples (subtle trans pride nod)
- **Watch Specific:** Metallic silvers, golds, bronzes for watch renders

**Visual References:**

- **Alto's Adventure** - Clean, elegant, atmospheric minimalism
- **Monument Valley** - Premium geometric aesthetic, sophisticated
- **Assemble with Care** - Intimate object interaction, tactile feel
- **Luxury Watch Apps** - Breguet, Vacheron Constantin interface elegance
- **Cozy Games** - Stardew Valley warmth, Animal Crossing comfort

**Key Visual Elements:**

- **Watch Renders:** High-quality images from catalog, elegant presentation
- **Home View:** Isometric or flat perspective, evolves with progression
- **UI Panels:** Card-based, generous spacing, premium feel
- **Typography:** Elegant serif for headers, clean sans-serif for body
- **Animations:** Smooth, satisfying, never jarring (luxury product feel)

### Audio and Music

**Music Style: Lo-Fi / Ambient / Jazz-Influenced**

**Musical Direction:**

- Calm, sophisticated, background-appropriate
- Supports 6-hour play without fatigue
- Like a cozy coffee shop or elegant lounge atmosphere
- Emotional progression across chapters

**Chapter Music Arc:**

- **Chapters 1-2 (Early):** Gentle, slightly uncertain tones, sparse arrangements
- **Chapters 3-4 (Mid):** Building confidence, richer instrumentation, warmth
- **Chapters 5-6 (Late):** Complete, satisfying, emotionally resonant
- **Chapter 6 "At Last":** Simple, beautiful piano or solo instrument, resolution

**Sound Design:**

- **Tactile, Premium Sounds:** Physical watch mechanism feel
- **Winding:** Satisfying clicks and smooth mechanical sounds
- **Mini-Games:** Gentle feedback tones, never harsh
- **Unlocks:** Subtle chimes or pleasant notification sounds
- **Haptic Feedback:** Mobile vibration for interactions (optional)

**Audio References:**

- **Stardew Valley** - Peaceful, looping, never annoying
- **Jazz Café playlists** - Sophisticated background ambiance
- **ASMR/Lo-Fi** - Calm, focus-supporting
- **Luxury product videos** - Subtle, premium audio design

**Voice/Dialogue:**

- **No Full Voice Acting** - Text-based only (more intimate, like letters)
- **Ryan's Messages:** Appear as written text, personal touch
- **Therapy Sessions:** Text dialogue choices, patient vignettes
- **Home Life:** Silent visual storytelling through photos/artwork

### Aesthetic Goals

**How Art and Audio Support Game Pillars:**

1. **Personal Resonance:**
   - Warm color palette creates welcoming atmosphere
   - Rose gold accents reflect Emily's preferences
   - Premium feel matches her sophisticated taste

2. **Emotional Connection:**
   - Music evolves with story progression
   - Gentle, supportive audio never frustrates
   - Visual home evolution mirrors emotional journey

3. **Completable Journey:**
   - Clean UI prevents overwhelm
   - Consistent aesthetic across 6 hours
   - Visual progression keeps engagement

4. **Active Engagement:**
   - Satisfying tactile sounds reward interaction
   - Smooth animations make actions feel good
   - Premium feel elevates simple interactions

5. **Dual Identity Celebration:**
   - Elegant watches (collector identity)
   - Professional office spaces (psychologist identity)
   - Trans pride color nods (identity celebration)

### Art Asset Generation Prompts

**For AI Image Generation Tools (Midjourney, DALL-E, Stable Diffusion)**

#### Home Base Scenes (6 Chapters)

**Chapter 1: "First Steps" (PhD Student)**

```
A cozy but sparse studio apartment, warm cream walls, soft natural lighting from a window. A small desk with psychology textbooks, a single basic quartz watch on a simple stand. Minimal decor, youthful energy, slightly cluttered with study materials. Warm afternoon light, cozy but modest. Rose gold accent lamp. Photography style: clean, elegant, premium lifestyle photography. Aspect ratio: 9:16 for mobile.
```

**Chapter 2: "Finding Her Voice" (Externship)**

```
A slightly upgraded apartment, more professional feel. Bookshelf with psychology references, diploma frame visible but empty (in progress). Small watch collection display (3-5 watches). Cleaner desk, therapy books organized. Warm evening lighting, more settled feel. Plants starting to appear. Cream and rose gold color palette. Photography style: elegant interior design, warm and inviting. 9:16 aspect ratio.
```

**Chapter 3: "Service" (VA Hospital)**

```
A modest but meaningful space. VA-related items subtly present. Watch collection growing (8-10 watches including one prominent Jaeger-LeCoultre Master Ultra Thin Moon in 34mm rose gold). Desk more professional. Framed photo of family starting to appear. Warm afternoon light, sense of purpose. Navy and rose gold accents. Photography style: documentary lifestyle, meaningful moments. 9:16 aspect ratio.
```

**Chapter 4: "Independence" (Private Practice)**

```
A beautiful home office, independent practice feel. Large watch display case (15-20 watches), including Royal Oaks and Rolexes. Professional therapy setup visible. Multiple family photos on walls. Plants, books, warmth. Golden hour lighting, success and comfort. Cream, rose gold, forest green palette. Photography style: Architectural Digest quality, aspirational. 9:16 aspect ratio.
```

**Chapter 5: "Growth" (Group Practice)**

```
An elegant professional suite. Impressive watch collection display (25-30 watches). Established presence, success visible. Gallery wall of family photos at different ages. Sophisticated decor, warmth maintained. Soft evening light, achievement and contentment. Premium materials, tasteful luxury. Photography style: luxury interior, warm sophistication. 9:16 aspect ratio.
```

**Chapter 6: "At Last" (Retirement)**

```
A beautiful, complete home. Museum-quality watch display with full collection (30+ watches including grail pieces). Gallery walls of family memories. Comfortable, serene, achieved. Soft morning light, peace and fulfillment. Every element from previous chapters visible, evolved, perfected. Rose gold accents throughout. Photography style: dream home feature, emotional resonance. 9:16 aspect ratio.
```

#### Watch Assets

**Empty Watch Display Case**

```
A premium watch display case, cream velvet interior, rose gold accents. Soft museum-quality lighting from above. Empty slots waiting to be filled. Elegant, minimalist, luxurious. Close-up detail shot. Photography style: luxury product photography. 16:9 aspect ratio.
```

**Royal Oak Style Watch**

```
A beautiful Audemars Piguet Royal Oak style watch, 34mm, rose gold case and bracelet, white dial, iconic octagonal bezel. Floating against soft cream gradient background. Studio lighting, reflections on polished surfaces. Ultra-detailed, macro photography style. Luxury watch advertisement quality. 1:1 aspect ratio.
```

**JLC Master Ultra Thin Moon**

```
Jaeger-LeCoultre Master Ultra Thin Moon, 34mm, rose gold case, silver dial with moon phase complication at 6 o'clock. Elegant, sophisticated, feminine proportions. Floating against soft gradient background. Warm studio lighting, subtle reflections. Luxury watch photography. Macro detail visible. 1:1 aspect ratio.
```

**Rolex Datejust Style**

```
Rolex Datejust style watch, 31mm, rose gold and steel, champagne dial with diamond markers. Classic, timeless, elegant. Floating against soft cream background. Studio lighting, premium feel. Luxury watch advertisement. Macro detail. 1:1 aspect ratio.
```

#### Career Office Scenes

**PhD Student Office**

```
A university office, modest, textbooks stacked, desk with laptop and papers. Inspirational psychology quotes on wall. Window with campus view. Warm afternoon light. Aspirational but grounded. Single plant. Clean but lived-in. Photography style: academic lifestyle. 16:9 aspect ratio.
```

**Private Practice Office**

```
A beautiful therapy office, comfortable couch, warm lighting, plants, bookshelves with psychology references. Welcoming, professional, safe. Emily's diplomas on wall. Soft afternoon light. Cream and warm wood tones. Photography style: architectural interior, calm and inviting. 16:9 aspect ratio.
```

#### Family Photos

**Ryan and Emily Portrait**

```
A loving couple portrait, Ryan (early 30s) and Emily (late 20s), casual elegant attire, warm smiles, natural lighting. Outdoor or cozy indoor setting. Genuine affection visible. Warm color palette. Photography style: candid couple photography, lifestyle portrait. Soft focus background. 4:5 aspect ratio.
```

**Family Photo - All Five**

```
Family portrait: Ryan, Emily, Freddy (6), Sam (almost 5), Simi (3). Casual, happy, authentic moment. Soft natural lighting. Warm, loving atmosphere. Everyone smiling. Home setting or outdoor. Photography style: family lifestyle photography, genuine emotions. 4:5 or 16:9 aspect ratio.
```

**Freddy (Age 6)**

```
Freddy age 6: Bright smile, showing front teeth gap, energetic, holding a toy watch. Natural outdoor light. Joyful. 4:5 aspect ratio.
```

**Sam (Age 5)**

```
Sam age 5: Sweet smile, slightly shy, soft features. Gentle lighting. Innocent and kind. 4:5 aspect ratio.
```

**Simi (Age 3)**

```
Simi age 3: Adorable toddler, big eyes, playful expression. Soft focus background. Cuteness overload. 4:5 aspect ratio.
```

#### Kid Drawings (As If Drawn by Kids)

**Freddy's Watch Drawing**

```
A crayon drawing of a watch on white paper. Age 6 skill level - recognizable watch shape with hands, numbers 1-12 written carefully, maybe "Freddy" signed at bottom. Crayon colors: blue, red, yellow. Some coloring outside lines. Charming, earnest effort. Scanned paper texture. 1:1 aspect ratio.
```

**Sam's Family Drawing**

```
A crayon drawing of "My Family" on white paper. Age 5 skill level - five stick figures (mommy biggest, daddy next, three kids), all holding hands. Sun in corner, grass at bottom, house with triangle roof. "I ❤️ Emily" written in wobbly letters. Multiple crayon colors. 1:1 aspect ratio.
```

**Simi's Art**

```
A crayon scribble on white paper that Simi insists is "a watch". Age 3 skill level - energetic scribbles in circular-ish pattern, maybe some lines, mostly abstract. "Simi" written by adult helper. Pure toddler energy visible. Multiple colors overlapping. Endearing chaos. 1:1 aspect ratio.
```

#### UI Mockups

**Main Game Screen**

```
Mobile game UI mockup, iPhone 17 proportions. Clean, elegant interface. Top: Currency displays (Enjoyment, Cash). Center: Main interaction area showing a watch to interact with. Bottom: Navigation tabs (Home, Collection, Career, Market). Color palette: cream background, rose gold accents, navy text. Typography: elegant serif headers, clean sans-serif body. Minimalist, premium, uncluttered. Flat design with subtle shadows. 9:16 aspect ratio.
```

**Mini-Game Screen - Winding**

```
Mobile game screen showing manual watch winding mini-game. Circular watch face with winding crown visible. Hand winding animation frames implied. Timing gauge around edge. "Hold to wind" instruction. Warm cream background, rose gold watch elements. Clean UI, satisfying visual feedback. Premium product feel. 9:16 aspect ratio.
```

**Home Gallery View**

```
Mobile screen showing "Home Life Gallery" view. Grid of family photos and kid drawings. Some slots locked with "???" indicating unlockable content. Soft shadows, card-based layout. Warm, personal, emotional. Scrolling interface implied. Cream background, rose gold accents on frames. 9:16 aspect ratio.
```

**Chapter Completion Screen**

```
Celebratory screen: "Chapter 3 Complete: Service". Beautiful typography, Jaeger-LeCoultre watch reward displayed prominently. "Next: Independence" teaser. Warm, emotional, satisfying. Confetti or particle effects implied. Rose gold accents. Premium achievement screen feel. 9:16 aspect ratio.
```

#### App Icon

```
iOS app icon for "Emily At Last". Features a stylized watch and heart combined. Rose gold and cream color scheme. Premium, elegant, personal. Simple, recognizable, app store ready. 1024x1024 square, will be masked to rounded corners by system. Flat design with subtle depth.
```

#### Music Generation Prompts

**Chapter 1 Theme - "First Steps"**

```
Lo-fi hip hop, gentle piano melody, soft rain sounds, 85 BPM, nostalgic but hopeful. Warm Rhodes keyboard, subtle vinyl crackle. Evokes: beginning of a journey, uncertainty, potential. Instrumental, no vocals. Loop-able 3-4 minutes.
```

**Chapter 6 Theme - "At Last"**

```
Solo piano, simple and beautiful, 70 BPM, emotional resolution. Warm, satisfying, complete. Like the end of a beautiful film. Bittersweet but ultimately joyful. Clear, pure tones. Finality and peace. Instrumental, no vocals. 3-4 minutes, seamless loop.
```

---

## Technical Specifications

### Performance Requirements

**Target Device: Emily's iPhone 17**

Since this is a gift for a single recipient, technical requirements are optimized specifically for Emily's device rather than broad compatibility.

**Frame Rate Target:**

- 60fps smooth performance
- Battery-conscious rendering (requestAnimationFrame)
- Pause when tab inactive to preserve battery

**Resolution:**

- Optimized for iPhone 17 screen size
- Responsive design handles minor variations
- Portrait orientation primary
- Support for Dynamic Island and safe areas

**Load Times:**

- Initial load: Under 2 seconds on WiFi/5G
- Progressive loading for watch catalog images
- Service worker for offline capability and caching

### Platform-Specific Details

**Platform: iOS Safari (iPhone 17)**

**Browser Requirements:**

- Safari (latest iOS)
- WebKit features fully supported
- No legacy browser concerns

**Technical Stack:**

- **Framework:** Vite + React + TypeScript (existing project)
- **State Management:** React context or Zustand
- **Storage:** localStorage for saves, IndexedDB for large data
- **PWA Features:** Service worker, manifest.json, offline capability

**iOS Safari Considerations:**

- Touch targets: 44x44pt minimum
- No hover states (touch-only)
- Haptic feedback via Vibration API
- Respect safe areas (Dynamic Island, home indicator)
- Web App capable (add to home screen)
- Audio requires user interaction (standard web audio)

**Performance Optimization:**

- Lazy loading for watch images
- WebP format with fallbacks
- Code splitting for routes
- CSS animations preferred over JavaScript

### Asset Requirements

**Art Assets:**

**Watch Images:**

- Source: Existing catalog (100+ real watches)
- Format: WebP with JPEG fallback
- Sizes: Optimized for iPhone 17 retina display
- Thumbnails and detail views

**UI Graphics:**

- Icons: SVG (scalable, crisp on retina)
- Backgrounds: CSS gradients and simple textures
- Family content: Photos and drawings (provided by Ryan)
- Animations: CSS transitions and transforms

**Audio Assets:**

**Music:**

- 6 chapter themes + menu + ending (8-10 tracks)
- Format: AAC or MP3 (iOS native support)
- Length: 3-5 minutes each, seamless looping
- Style: Lo-fi, ambient, elegant

**Sound Effects:**

- 40-50 total sounds (UI, mini-games, unlocks)
- Format: AAC or WAV
- Tactile, premium feel (watch mechanism inspired)

**External Assets:**

**Third-Party:**

- Font: Elegant serif + clean sans (Google Fonts or Adobe)
- Icons: Phosphor or Heroicons
- Music: Commissioned or licensed lo-fi/ambient

**Custom Content:**

- Family photos (Ryan provides)
- Children's drawings (Ryan provides)
- Personal messages (Ryan writes)
- Watch catalog (already exists in project)

### Technical Constraints

**iOS Safari Limitations:**

- localStorage: ~5MB limit (sufficient for saves)
- Audio autoplay: Requires user gesture (tap to start)
- Background processing: Limited when tab inactive
- Web App storage: Can request persistent storage

**Single-User Optimization:**
Since this targets only Emily's iPhone 17:

- No Android testing required
- No legacy iOS support needed
- Can use latest WebKit features
- Performance tuning specific to A19 chip capabilities

**Architecture Note:**
Detailed technical architecture (component structure, state patterns, build config) will be defined in the Architecture workflow following GDD completion.

---

## Development Epics

### Epic Structure

#### Epic Overview

| #   | Epic Name             | Scope                                       | Dependencies | Est. Stories |
| --- | --------------------- | ------------------------------------------- | ------------ | ------------ |
| 1   | Foundation            | Core economy, UI framework, save system     | None         | 8-12         |
| 2   | Core Loop             | First mini-game, PhD career, basic purchase | Epic 1       | 10-15        |
| 3   | Mini-Game Suite       | All 4 mini-games with feedback              | Epic 2       | 12-18        |
| 4   | Career Journey        | All 6 career stages, JLC milestone          | Epic 3       | 15-20        |
| 5   | Collection & Prestige | All watch tiers, prestige layers            | Epic 4       | 15-20        |
| 6   | Home Life             | Family photos, kid drawings, messages       | Epic 5       | 12-16        |
| 7   | Polish & Audio        | All art, music, SFX, animations             | Epics 1-6    | 15-25        |

#### Recommended Sequence

1. **Epic 1: Foundation** - Core systems and infrastructure
2. **Epic 2: Core Loop** - Prove gameplay with vertical slice (Chapter 1)
3. **Epic 3: Mini-Game Suite** - Expand interactions
4. **Epic 4: Career Journey** - Full career progression
5. **Epic 5: Collection & Prestige** - Complete collection mechanics
6. **Epic 6: Home Life** - Emotional content and personal touches
7. **Epic 7: Polish & Audio** - Premium presentation and final polish

**Rationale:** Prove core loop early (Epics 1-2), then expand content breadth (3-6), finally polish to premium quality (7).

#### Vertical Slice

**First Playable Milestone (End of Epic 2):**

- Working economy (Enjoyment/Cash)
- One mini-game (quartz alignment)
- PhD career stage with basic sessions
- Can buy first watch
- Chapter 1 home scene
- Save/load working

**Goal:** Validate that the core "watches generate Enjoyment → career sessions earn Cash → buy better watches" loop is fun and satisfying.

**Detailed Epics:** See `epics.md` for complete story breakdowns.

---

## Success Metrics

### Technical Metrics

**Target Device: Emily's iPhone 17**

Since this is a gift for a single recipient, technical success is binary - it works perfectly on Emily's device or it doesn't.

| Metric           | Target             | Measurement Method                  |
| ---------------- | ------------------ | ----------------------------------- |
| Frame Rate       | 60fps consistent   | Safari DevTools performance monitor |
| Load Time        | <2 seconds initial | Lighthouse audit                    |
| Battery Usage    | <5% per hour       | iOS Battery settings                |
| Crash Rate       | 0%                 | Manual testing                      |
| Save Reliability | 100% persistence   | Manual testing                      |
| Memory Usage     | <100MB             | Safari DevTools                     |

**Testing Approach:**

- Extensive testing on iPhone 17 before gifting
- No crash tolerance (gift must work perfectly)
- Save/load tested repeatedly
- Performance validated across 6-hour play session

### Gameplay Metrics

**For a Single-Player Gift Game:**

Traditional metrics (downloads, retention, revenue) don't apply. Instead, success is measured by emotional impact.

**Core Success Indicators:**

| Indicator        | Target    | Measurement                                                 |
| ---------------- | --------- | ----------------------------------------------------------- |
| Completion       | 100%      | Emily finishes full 6-hour experience                       |
| Recognition      | Immediate | Emily notices personal references (watches, family, career) |
| Emotional Impact | High      | Emily feels deeply moved (ideally: tears of joy)            |
| Sharing          | Likely    | Emily wants to show family/friends                          |
| Replay           | Optional  | Emily may replay, but one perfect experience is success     |

**Playtesting Metrics (Before Gifting):**

| Metric                       | Target            | Method                                         |
| ---------------------------- | ----------------- | ---------------------------------------------- |
| Completion without confusion | 100%              | Beta tester completes without questions        |
| Mini-game satisfaction       | Positive feedback | Testers enjoy interactions                     |
| Progression clarity          | Understood        | Testers understand economy without explanation |
| Pacing appropriateness       | Feels right       | 6-hour arc doesn't drag or rush                |

### Qualitative Success Criteria

**The Ultimate Metric:**

- **Emily cries (happy tears)** when she realizes the depth of personalization and love embedded in every system

**Secondary Indicators:**

- Emily mentions specific personal details ("You remembered I love Royal Oaks!")
- Emily shares discoveries with Ryan ("I found the drawing from Freddy!")
- Emily feels profoundly seen and deeply loved
- The game becomes a treasured memory and emotional touchstone
- Emily understands the "Emily At Last" title significance

**Signs of Success:**

- Extended play sessions (losing track of time)
- Laughter at playful references
- Awe at the JLC Q1252501 milestone
- Joy at family photo unlocks
- Pride at career achievements
- Satisfaction at collection completion

**Non-Goals (Irrelevant for Private Gift):**

- Download numbers or install count
- Revenue or monetization metrics
- Daily active users (DAU)
- Retention rates (Day 1, Day 7, Day 30)
- Social media mentions or viral spread
- App store ratings or reviews
- Competitive rankings

**Success Review:**

- Primary review: Emily's emotional reaction upon receiving
- Secondary review: Her feedback after completing
- Tertiary review: Long-term emotional impact (weeks/months later)

**Success Statement:**
"Emily At Last is successful when Emily feels deeply and completely loved, recognizing herself in every watch, career milestone, and family reference, culminating in tears of joy at the realization that someone built an entire world just for her."

---

## Out of Scope

{{out_of_scope}}

---

## Assumptions and Dependencies

{{assumptions_and_dependencies}}
