---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: []
documentCounts:
  brainstorming: 0
  research: 0
  notes: 0
workflowType: 'game-brief'
lastStep: 8
project_name: 'watch-idle'
user_name: 'Ryan'
date: '2026-02-23'
game_name: 'Emily At Last'
---

# Game Brief: {{game_name}}

**Date:** {{date}}
**Author:** {{user_name}}
**Status:** Draft for GDD Development

---

## Executive Summary

{{executive_summary}}

---

## Game Vision

### Core Concept

{{core_concept}}

### Elevator Pitch

{{elevator_pitch}}

### Vision Statement

{{vision_statement}}

---

## Target Market

### Primary Audience

{{primary_audience}}

### Secondary Audience

{{secondary_audience}}

### Market Context

{{market_context}}

---

## Game Fundamentals

### Core Gameplay Pillars

{{core_gameplay_pillars}}

### Primary Mechanics

{{primary_mechanics}}

### Player Experience Goals

{{player_experience_goals}}

---

## Scope and Constraints

### Target Platforms

{{target_platforms}}

### Development Timeline

{{development_timeline}}

### Budget Considerations

{{budget_considerations}}

### Team Resources

{{team_resources}}

### Technical Constraints

{{technical_constraints}}

---

## Reference Framework

### Inspiration Games

{{inspiration_games}}

### Competitive Analysis

{{competitive_analysis}}

### Key Differentiators

{{key_differentiators}}

---

## Content Framework

### World and Setting

{{world_setting}}

### Narrative Approach

{{narrative_approach}}

### Content Volume

{{content_volume}}

---

## Art and Audio Direction

### Visual Style

{{visual_style}}

### Audio Style

{{audio_style}}

### Production Approach

{{production_approach}}

---

## Risk Assessment

### Key Risks

{{key_risks}}

### Technical Challenges

{{technical_challenges}}

### Market Risks

{{market_risks}}

### Mitigation Strategies

{{mitigation_strategies}}

---

## Success Criteria

### MVP Definition

{{mvp_definition}}

### Success Metrics

{{success_metrics}}

### Launch Goals

{{launch_goals}}

---

## Next Steps

### Immediate Actions

{{immediate_actions}}

### Research Needs

{{research_needs}}

### Open Questions

{{open_questions}}

---

## Appendices

### A. Research Summary

{{research_summary}}

### B. Stakeholder Input

{{stakeholder_input}}

### C. References

{{references}}

---

_This Game Brief serves as the foundational input for Game Design Document (GDD) creation._

_Next Steps: Use the `workflow gdd` command to create detailed game design documentation._

---

## Game Vision

### Core Concept

Emily At Last is a mobile-first browser incremental game where players actively perform watch and therapy interactions to grow a luxury watch collection, advance a therapist career, and compound long-term progression through prestige systems.

### Elevator Pitch

Emily At Last is an active-first incremental game centered on direct player engagement. Players complete movement-based mini-games, make strategic upgrade and specialization decisions, and steadily expand a curated collection of authentic timepieces while progressing through career milestones. As systems deepen, personalized home-life unlocks and family references transform progression into a meaningful gift journey.

### Vision Statement

Create a polished, emotionally resonant incremental game that makes Emily feel deeply seen and loved by celebrating her identities as watch collector, psychologist, and mother through an active, strategic, and fully satisfying progression arc.

---

## Target Market

### Primary Audience

Emily is the sole intended player of Emily At Last.

**Demographics:**
- One specific player: Emily
- Adult professional in psychology/therapy
- Mobile-first player profile
- Strong personal interest in luxury watches (especially rose-gold pieces)

**Gaming Preferences:**
- Active, short-session play with meaningful interaction
- Clear progression and collection milestones
- Polished, emotionally intentional presentation
- Non-competitive, low-pressure experience

**Motivations:**
- Feeling personally seen and celebrated
- Recognition of her real interests, career, and family
- Satisfaction from completing a curated watch journey
- Emotional connection through bespoke content and references

### Secondary Audience

None. This game is intentionally designed for Emily only and is not intended for any broader audience segment.

### Market Context

Emily At Last is not positioned for a public market. It is a private, personalized gift experience for a single recipient. Design decisions are optimized for emotional resonance, personal relevance, and completion quality for Emily rather than discoverability, genre competition, or commercial viability.

**Comparable References (Design Inspiration Only):**
- Incremental/progression games that validate compounding progression loops
- Emotionally warm, low-pressure progression experiences

**Opportunity (Project Intent):**
- Deliver maximum emotional impact for one player through active incremental systems and deeply personal content
- Success is measured by Emily's emotional response, not by market performance metrics

---

## Game Fundamentals

### Core Gameplay Pillars

1. **Personal Resonance**
Every system should reflect Emily's real interests, identity, and life context so she feels seen and understood.

2. **Emotional Connection**
Progression should deliver moments of surprise, warmth, and love through family references, meaningful milestones, and personal reveals.

3. **Active Incremental Engagement**
Player actions should drive momentum through mini-games, decisions, and strategic tradeoffs rather than passive waiting.

4. **Completable Journey**
The experience should be self-contained with a clear arc, satisfying milestones, and a meaningful ending.

**Pillar Priority:** When pillars conflict, prioritize:
Personal Resonance > Emotional Connection > Active Incremental Engagement > Completable Journey

### Primary Mechanics

- **Collect** watches across tiers (quartz, manual, automatic, tourbillon)
- **Play** movement-based mini-games (timing, precision, rhythm) to generate progression resources
- **Advance** through therapist career stages and session interactions
- **Choose** upgrades, unlock routes, and prestige timing
- **Unlock** home-life content, family photos, and personal milestones

**Core Loop:** Perform active watch/career interactions to earn resources, invest those resources into better watches and progression upgrades, then unlock deeper personal content and stronger systems that expand strategic choices.

### Player Experience Goals

- Feel deeply recognized and emotionally connected
- Experience satisfying, active progression in short sessions
- Enjoy meaningful decisions with visible outcomes
- Build pride through collection completion and career milestones
- Reach a warm, intentional sense of closure at completion

**Emotional Journey:** Curiosity and delight in early progression, growing attachment and pride through mid-game personalization and milestones, then emotional fulfillment and completion as the full personal arc resolves.

---

## Scope and Constraints

### Target Platforms

**Primary:** Mobile web browser (phone), delivered as a PWA-style experience  
**Secondary:** Desktop web browser (support for development/testing and optional play)

### Budget Considerations

This is a self-funded personal gift project. Budget priority is quality of emotional impact, polish, and personal content integration rather than commercial launch spend.

- **Development:** Existing web stack and tooling
- **Assets:** Mix of self-produced and selectively generated/curated content
- **Marketing:** None (not a public release)
- **Platform Fees:** None for primary web delivery
- **External Services:** Keep minimal; avoid unnecessary operational overhead

### Team Resources

Solo development by Ryan, with direct ownership across design, implementation, and content curation.

- **Coverage:** Product vision, game design, engineering, personalization strategy
- **Working Model:** Iterative solo development with milestone-based validation
- **Outsourcing:** Optional only for targeted asset support (if needed)

**Skill Gaps:** Potential bottlenecks may appear in high-volume art/audio production and final-pass polish workload if fully custom assets are required.

### Technical Constraints

- Mobile-first touch interactions with desktop compatibility
- Responsive web implementation using existing React/TypeScript web stack
- Performance target around smooth 60fps feel on modern phones
- Fast initial load and progressive asset handling
- Save persistence via local browser storage
- No requirement for online multiplayer or public backend infrastructure

### Scope Realities

- Audience is exactly one player: Emily
- Success criteria are emotional resonance and completion quality, not market metrics
- Feature choices should favor meaningful personalization over breadth
- Scope should remain bounded to a completable, polished, active incremental journey

---

## Reference Framework

### Inspiration Games

**Increlution**
- Taking: Life-stage progression arc, sense of advancing through meaningful phases
- Not Taking: Abstract/generalized life simulation framing; this project remains deeply personal and bespoke

**Stardew Valley**
- Taking: Warm, low-pressure tone and satisfying progression cadence
- Not Taking: Broad sandbox farming loop or community simulation scope

**Cookie Clicker / AdVenture Capitalist / Melvor-style progression references**
- Taking: Clear compounding progression readability and milestone-based dopamine pacing
- Not Taking: Passive-first identity, mass-audience retention loops, or endless grind orientation

### Competitive Analysis

**Direct Competitors:**
None in practical terms for project intent. This is a private audience-of-one gift, not a market-facing product.

**Competitor Strengths (Reference Category):**
- Established progression loops
- Clear upgrade readability
- Strong session-to-session momentum

**Competitor Weaknesses (Relative to This Goal):**
- Generic content not personally meaningful to Emily
- Designed for broad audience optimization over emotional specificity
- Often passive-first or retention-first rather than active and intentional

### Key Differentiators

1. **Hyper-Personalization**
Every core system maps to Emily's real interests, milestones, and identity.

2. **Private Gift Context**
The experience is intentionally built for one recipient, enabling decisions that prioritize emotional impact over market generalization.

3. **Dual Identity Integration**
Watch collection progression and therapist-career progression are co-equal systems that reinforce each other.

4. **Family-Embedded Progression**
Actual family references, photos, and children's artwork are integrated as meaningful unlocks rather than cosmetic garnish.

5. **Authorial Intent as Feature**
The "Ryan made this specifically for Emily" context is a core value driver, not metadata.

**Unique Value Proposition:**
Emily At Last is an active-first incremental gift experience where every progression milestone is personally authored to make one specific player feel deeply seen and loved.

---

## Content Framework

### World and Setting

Emily At Last is set in a stylized, intimate modern-life arc centered on Emily's watch collection, therapist career progression, and evolving home/family space. The world is grounded and personal rather than fictional-fantasy, with each chapter representing a meaningful stage of life and professional growth.

### Narrative Approach

Hybrid environmental + milestone-driven narrative.

Story is delivered through progression context, unlockable family artifacts, career-stage framing, and personal messages rather than cutscene-heavy scripted storytelling.

**Story Delivery:** Chapter transitions, milestone text, home gallery reveals, and contextual written notes/messages.

### Content Volume

- Six progression chapters tied to career stages
- Multi-tier watch collection progression
- Home-life unlock track (photos, children's artwork, milestone content)
- Lightweight text narrative layer integrated into progression events
- Polished UI/audio feedback layer supporting active interactions

---

## Art and Audio Direction

### Visual Style

Clean, elegant, premium mobile-first visual direction with warm, personal tone.  
Palette emphasizes cream/rose-gold with deep accent tones, balancing luxury-watch aesthetics and cozy emotional readability.

**References:** Luxury watch app presentation language, warm cozy progression-game tone, minimalist premium UI patterns.

### Audio Style

Lo-fi/ambient/jazz-influenced background direction with calm, premium tactile SFX for interactions and unlock moments.  
No full voice acting; text-first delivery maintains intimacy and production control.

### Production Approach

Solo-led production with selective external/AI-assisted asset generation where helpful.  
Prioritize high-impact assets first (core UI, key watch visuals, milestone home/gallery content), then expand polish pass iteratively.  
Keep implementation web-native and mobile-first to match delivery target.

---

## Risk Assessment

### Key Risks

1. Content production overload (art/audio/personalized assets)
2. Mobile web performance regressions as asset volume grows
3. Scope creep from adding polish/features beyond core emotional arc
4. Integration risk for personalized content quality consistency
5. Final-pass QA risk on target-device experience (iPhone-first expectations)

### Technical Challenges

- Maintaining smooth interaction performance with increasing visual/audio assets
- Managing browser storage and persistence reliability for progression data
- Ensuring touch ergonomics and responsive behavior across mobile states
- Keeping load times low while supporting premium presentation

### Market Risks

Traditional market risk is intentionally de-prioritized (private gift, single recipient).  
Primary "market-equivalent" risk is missing emotional resonance for the intended player.

### Mitigation Strategies

- Enforce scope gates: "Does this improve Emily's emotional experience directly?"
- Sequence production by emotional impact: milestone-critical content first
- Run frequent mobile performance checks during asset integration
- Use fallback tiers for assets/audio (must-have vs nice-to-have)
- Maintain a completion-first plan: ship a polished, complete core journey before optional embellishments

---

## Executive Summary

Emily At Last is an active-first incremental game where Emily grows a luxury watch collection and therapist career through meaningful interactions, strategic progression, and deeply personal milestone reveals.

**Target Audience:** Emily (single intended player)

**Core Pillars:** Personal Resonance; Emotional Connection; Active Incremental Engagement; Completable Journey

**Key Differentiators:** Hyper-personalization, private gift context, dual identity integration, family-embedded progression, authorial intent as core feature

**Platform:** Mobile web browser (primary), desktop web browser (secondary)

**Success Vision:** Emily feels deeply seen and loved, completes the full journey, and experiences strong emotional impact from the personalized details.

---

## Success Criteria

### MVP Definition

Minimum playable version that proves the full emotional/gameplay concept:

- Core active loop functioning end-to-end:
  - Watch interactions/mini-games generate progression resources
  - Career sessions consume/convert resources into advancement
  - Progression purchases/unlocks are meaningful
- At least one fully playable chapter with:
  - Watch collection interaction
  - Career progression interaction
  - One personalized home/family unlock
- Stable save/load persistence
- Mobile-first usability and smooth interaction quality
- Clear path to completion state (even if reduced content breadth)

### Success Metrics

- **Emotional Impact (Primary):** Emily explicitly recognizes personal references and feels emotionally moved
  - Measurement: direct recipient feedback after first full session
- **Completion Quality:** Emily can complete the intended journey without blockers
  - Measurement: successful end-to-end playthrough on target device
- **Experience Clarity:** Progression and goals are understandable without external explanation
  - Measurement: observed or reported confusion points are minimal
- **Technical Quality:** Stable runtime, acceptable responsiveness, reliable saves
  - Measurement: no critical bugs; no progression-loss events in repeated tests

### Launch Goals

- Deliver a polished private build for Emily (not public release)
- Ensure emotional milestones and key personal references are present and functional
- Validate the full journey from first interaction to final completion moment

---

## Next Steps

### Immediate Actions

1. Convert this brief into detailed implementation structure via GDD refinement pass
2. Build/validate MVP vertical slice (one complete chapter + core loop + save/load)
3. Lock high-impact personalized content list (must-have vs nice-to-have)
4. Run target-device QA pass focused on performance, touch flow, and persistence
5. Prepare final emotional milestone sequence and completion moment polish

### Research Needs

- Best asset-production workflow for premium watch/home visuals under solo constraints
- Efficient audio pipeline for calm ambient loops + tactile SFX
- Mobile web performance strategy as asset count scales
- Backup/recovery UX for save reliability in browser context

### Open Questions

- Which exact chapter boundary defines "MVP complete" for your internal gate?
- Which personalized reveals are absolutely mandatory for first playable?
- Do you want a strictly linear chapter flow or selective milestone flexibility?
- What is the final acceptance checklist before presenting to Emily?
