# Roadmap: Emily Idle

## Overview

Milestone v4.0 deepens watch interactions with new/expanded mini-games, surfaces per-watch stats for clearer decisions, expands catalog variety across progression tiers, and completes a mobile-first UI polish pass.

## 📋 Milestone v4.0: Watch Interactions & Catalog Polish (Planned)

**Milestone Goal:** Enhanced watch mini-games with visual polish, catalog expansion with more variety, and improved mobile UX.

## Phases

**Phase Numbering:** Continuous across milestones; v4.0 starts at Phase 42 (v3.2 ended at Phase 41).

- [ ] **Phase 42: Winding Refresh** - Winding feels more interactive and visibly animated.
- [ ] **Phase 43: New Watch Mini-Games** - Add set-time/date and strap-change interactions.
- [ ] **Phase 44: Interaction Feedback & Rewards** - Consistent outcomes and tier-scaled rewards across mini-games.
- [ ] **Phase 45: Per-Watch Stats Surfaces** - Show individual watch enjoyment/cash rates and equipped contribution.
- [ ] **Phase 46: Catalog Expansion (Tiered Variety)** - Add new watches across low/mid/lux tiers with complete assets.
- [ ] **Phase 47: Mobile & UI Polish** - Touch-friendly navigation, modals, help search, and stats breakdown polish.

## Phase Details

### Phase 42: Winding Refresh

**Goal**: Players can wind watches with richer control and a visible winding animation.
**Depends on**: Phase 41
**Requirements**: WATCH-01
**Success Criteria** (what must be TRUE):
  1. Player can start the winding interaction and sees a winding animation that responds to their input.
  2. Player controls how much they wind by choosing when to stop (timing/amount), and the UI clearly reflects progress plus perceived pace/tension feedback while winding.
**Plans**: 2 plans

Plans:
- [x] 42-01-PLAN.md — Implement Phase 42 winding bands + crown/tension animation + a11y/mobile behavior
- [ ] 42-02-PLAN.md — Add regression tests for band boundaries and re-verify unit/e2e winding flow

### Phase 43: New Watch Mini-Games

**Goal**: Players can perform additional watch interactions (time/date/strap) when their watch supports them.
**Depends on**: Phase 42
**Requirements**: WATCH-02, WATCH-03, WATCH-04
**Success Criteria** (what must be TRUE):
  1. Player can play a set-time mini-game on quartz watches using interactive controls.
  2. Player can play a set-date mini-game on watches where date-setting is appropriate.
  3. Player can play a strap-changing mini-game and receives clear visual feedback during the interaction.
**Plans**: TBD

### Phase 44: Interaction Feedback & Rewards

**Goal**: All mini-games communicate success/failure clearly and reward outcomes scale with watch tier and precision.
**Depends on**: Phase 43
**Requirements**: WATCH-05, WATCH-06
**Success Criteria** (what must be TRUE):
  1. Every interaction mini-game ends in an unambiguous success or failure state with visible feedback.
  2. Player can see the reward result for an interaction (what they got and why), including on failure.
  3. Higher-tier watches and more precise play produce observably higher rewards than lower-tier or sloppy play.
**Plans**: TBD

### Phase 45: Per-Watch Stats Surfaces

**Goal**: Players can compare watches by per-watch rates and understand the equipped watch's contribution.
**Depends on**: Phase 44
**Requirements**: STATS-01, STATS-02, STATS-03, STATS-04, STATS-05
**Success Criteria** (what must be TRUE):
  1. Catalog shows each watch's enjoyment rate and cash rate without requiring purchase.
  2. Rates vary meaningfully between watches (players can find differences within and across tiers).
  3. Collection view shows an equipped watch contribution breakdown so players can tell what it adds.
**Plans**: TBD

### Phase 46: Catalog Expansion (Tiered Variety)

**Goal**: Players have a broader catalog across early/mid/late progression with complete assets and tier-appropriate stats.
**Depends on**: Phase 45
**Requirements**: CAT-05, CAT-06, CAT-07, CAT-08, CAT-09, CAT-10
**Success Criteria** (what must be TRUE):
  1. Player can browse and discover new low-end, mid-tier, and luxury watches in the catalog.
  2. Catalog variety spans affordable to luxury price points (no single-tier monotony).
  3. New watches display correct images and metadata, and their rates feel appropriate for their tier.
**Plans**: TBD

### Phase 47: Mobile & UI Polish

**Goal**: Mobile players can navigate, read, and complete core actions comfortably with touch-friendly UI.
**Depends on**: Phase 46
**Requirements**: MOBILE-01, MOBILE-02, MOBILE-03, MOBILE-04, MOBILE-05, MOBILE-06, MOBILE-07, MOBILE-08, MOBILE-09
**Success Criteria** (what must be TRUE):
  1. On mobile, tab navigation is horizontally scrollable with snap behavior and remains sticky while scrolling.
  2. Settings panel fieldsets/legends and checkbox groups look intentionally styled (not default browser controls).
  3. Collection/Catalog content is grouped into sections with an in-page subnav that moves between sections.
  4. Help modal supports search and remains usable on mobile via a sticky header and improved chip layout.
  5. Interaction modals and other primary actions meet a minimum 44px touch target standard and provide clearer mobile feedback.
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 42. Winding Refresh | v4.0 | 1/2 | In progress | 42-01-SUMMARY.md |
| 43. New Watch Mini-Games | v4.0 | 0/TBD | Not started | - |
| 44. Interaction Feedback & Rewards | v4.0 | 0/TBD | Not started | - |
| 45. Per-Watch Stats Surfaces | v4.0 | 0/TBD | Not started | - |
| 46. Catalog Expansion (Tiered Variety) | v4.0 | 0/TBD | Not started | - |
| 47. Mobile & UI Polish | v4.0 | 0/TBD | Not started | - |
