# Requirements: Emily Idle v4.1 Next Wave

**Defined:** 2026-02-05
**Core Value:** Deliver a polished watch-collecting idle loop that feels satisfying and reliable.

## Validated

- ✓ STATS-01 — Catalog now surfaces each watch’s enjoyment rate per row so comparisons are visible without purchase (shipped v4.0)
- ✓ STATS-02 — Per-watch cash rate stays anchored to the therapist career salary and is documented in the row explanation (shipped v4.0)
- ✓ STATS-03 — Enjoyment/cash rates vary by watch, keeping tier-aware totals (shipped v4.0)
- ✓ STATS-04 — Collection call-out explains the equipped watch contribution delta (shipped v4.0)
- ✓ STATS-05 — Stats visible before owning the watch and the UI surfaces them directly in Catalog (shipped v4.0)

## Active

### Sessions & Atelier
- [ ] SESSION-01: Session cost increases per consecutive run instead of a hard cooldown, letting players choose between breaks and speed.
- [ ] SESSION-02: Make the session cooldown timer visually prominent with a circular progress indicator next to the action button.
- [ ] WIND-01: Replace the timing-based winding mini-game with direct drag control, letting players turn the crown with continuous animation.
- [ ] WIND-02: Restrict the winding interaction to non-automatic (quartz/hand-wind) watches to honor movement type distinctions.
- [ ] WIND-03: Enrich the winding animation with layered gauges, spring tension glow, and subtle responsive motion.
- [ ] ATELIER-01: Increase atelier bonuses so the second run feels meaningfully faster and more rewarding than the first.
- [ ] ATELIER-02: Show how much money is needed for the next blueprint inside the atelier UI for clearer planning.
- [ ] POWER-01: Document and modulate the power reserve so the automatic mini-game’s rewards feed into clear game impact.
- [ ] SALARY-01: Surface a visual alert when the career session salary window expires to prevent silent grind stalls.
- [ ] UNLOCK-01: Highlight what unlocks next (new watches, tiers, or bonuses) so players know the next goal.
- [ ] UPGRADE-01: Show each upgrade’s impact on enjoyment/cash (preview effect) before purchasing so players understand value.

### Mobile & UX Polish
- [ ] TAB-01: Add ready-indicator badges on tabs when actions are available (sessions, upgrades, prestige, etc.).
- [ ] TAB-02: Replace multi-row tab pills with a single-row horizontal scroll bar with snap points and swipe gestures.
- [ ] KEY-01: Add keyboard shortcuts (1-8) for tab switching so power users jump instantly between tabs.
- [ ] SETTINGS-01: Restyle Settings fieldsets/legends to match the dark UI polish.
- [ ] TOUCH-01: Ensure every mobile tap target (buttons/CTAs) meets the 44px height minimum.
- [ ] TAB-03: Visually group tabs into primary/progression/system buckets for faster scanning.
- [ ] STATS-01: Break the stats header into logical subgroups so information is easier to scan.
- [ ] SKELETON-01: Add skeleton loading states for tab switches to keep the UI from popping.
- [ ] FILTER-01: Collapse filters behind a single button with the active filter count for compact mobile layouts.
- [ ] HOVER-01: Show watch stats on hover to preview before clicking (desktop enhancement).
- [ ] GLOW-01: Highlight affordable watches with a subtle glow/border.
- [ ] ANIM-01: Animate currency values (count-up) when they change for polish.
- [ ] FLOAT-01: Show floating +X text near actions to confirm results.
- [ ] ONBOARD-01: Add progressive onboarding tooltips when players first encounter new sections.
- [ ] FOCUS-01: Ensure visible keyboard focus states across key UI components.
- [ ] ICON-01: Standardize iconography for currencies, locks, upgrades.
- [ ] VIRTUAL-01: Virtualize long catalog lists for performance on low-end devices.
- [ ] SORT-01: Default the catalog sort order by price ascending for better discovery.
- [ ] HEADER-01: Collapse the stats header details behind an expand affordance to reduce noise.
- [ ] HELP-01: Enhance the help modal’s mobile layout and search experience.
- [ ] VAULT-01: Break the Collection view into sticky sections with in-page navigation.
- [ ] BOTTOM-01: Present catalog details in a bottom sheet on mobile for quicker access.
- [ ] MODAL-01: Increase interaction modal touch targets and add richer animations.
- [ ] NOSTALGIA-01: Make nostalgia resets show as dismissible toast notifications instead of modal-only copies.
- [ ] BREAK-01: Group stat modifiers with subtotals to explain their impact.
- [ ] LIGHT-01: Polish the light theme’s contrast and accessibility.
- [ ] SOFTCAP-01: Remove confusing softcap badges from the primary stats header and relegate details to breakdowns.
- [ ] DISMANTLE-01: Hide the dismantle button until the workshop is unlocked.
- [ ] CAREER-01: Add a career timeline visualization showing progression, milestones, and choice impact.

### Catalog & Collection Depth
- [ ] TAB-04: Show tab-ready indicators on the catalog tabs for available quick actions.
- [ ] SETBONUS-01: Display progress toward each set bonus (e.g., “X/Y watches collected”).
- [ ] PRESTIGE-01: Preview what unlocks at the next prestige threshold to motivate players.
- [ ] TIMELINE-01: Expand the career timeline view with current position and upcoming choices.
- [ ] COMPARE-01: Let players compare two watches side-by-side (stats, price, tier, movement).
- [ ] COLLECT-01: Add collection analytics panels (most valuable watch, brand/era breakdowns).
- [ ] HELP-02: Surfacing help modal keywords/sections specifically for tier badge education.
- [ ] VAULT-02: Segment the Collection into subnav sections (e.g., Starter/Mid/Lux). 

### Quality of Life & Events
- [ ] OFFLINE-01: Calculate and present offline gains capped at a reasonable duration.
- [ ] SAVE-01: Let players export/import save data via file or paste string.
- [ ] UNDO-01: Offer an undo action for the most recent purchase within a short window.
- [ ] FAVE-01: Favorite watches for quick reference and filter by favorites.
- [ ] NOTIF-01: Provide notification preferences for events like achievements, prestige readiness, and sessions.
- [ ] ACHIEVE-01: Add toast notifications when achievements unlock.
- [ ] ACHIEVE-02: Expand the achievement roster with new categories (career, mini-games, prestige, collection).
- [ ] EVENT-01: Surface an event calendar with countdowns and bonus explanations.
- [ ] PRACTICE-01: Add practice mode for mini-games with no rewards.
- [ ] DIFF-01: Implement tier-based difficulty scaling in mini-games.
- [ ] STREAK-01: Award streak bonuses for consecutive perfect mini-game plays.

## Out of Scope

- Multiplayer, social sharing, watch trading, AR, custom watch design, virtual exhibitions, mentorship systems, watch clubs, seasonal events, watch customization — remain explicitly rejected (see NOTES-02-02-26).
- Any feature requiring multiplayer infrastructure is deferred.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SESSION-01 | Phase 48 | Pending |
| SESSION-02 | Phase 48 | Pending |
| WIND-01 | Phase 48 | Pending |
| WIND-02 | Phase 48 | Pending |
| WIND-03 | Phase 48 | Pending |
| ATELIER-01 | Phase 48 | Pending |
| ATELIER-02 | Phase 48 | Pending |
| POWER-01 | Phase 48 | Pending |
| SALARY-01 | Phase 48 | Pending |
| UNLOCK-01 | Phase 48 | Pending |
| UPGRADE-01 | Phase 48 | Pending |
| TAB-01 | Phase 49 | Pending |
| TAB-02 | Phase 49 | Pending |
| KEY-01 | Phase 49 | Pending |
| SETTINGS-01 | Phase 49 | Pending |
| TOUCH-01 | Phase 49 | Pending |
| TAB-03 | Phase 49 | Pending |
| STATS-01 | Phase 49 | Pending |
| SKELETON-01 | Phase 49 | Pending |
| FILTER-01 | Phase 49 | Pending |
| HOVER-01 | Phase 49 | Pending |
| GLOW-01 | Phase 49 | Pending |
| ANIM-01 | Phase 49 | Pending |
| FLOAT-01 | Phase 49 | Pending |
| ONBOARD-01 | Phase 49 | Pending |
| FOCUS-01 | Phase 49 | Pending |
| ICON-01 | Phase 49 | Pending |
| VIRTUAL-01 | Phase 49 | Pending |
| SORT-01 | Phase 49 | Pending |
| HEADER-01 | Phase 49 | Pending |
| HELP-01 | Phase 49 | Pending |
| VAULT-01 | Phase 49 | Pending |
| BOTTOM-01 | Phase 49 | Pending |
| MODAL-01 | Phase 49 | Pending |
| NOSTALGIA-01 | Phase 49 | Pending |
| BREAK-01 | Phase 49 | Pending |
| LIGHT-01 | Phase 49 | Pending |
| SOFTCAP-01 | Phase 49 | Pending |
| DISMANTLE-01 | Phase 49 | Pending |
| CAREER-01 | Phase 49 | Pending |
| SETBONUS-01 | Phase 50 | Pending |
| PRESTIGE-01 | Phase 50 | Pending |
| TIMELINE-01 | Phase 50 | Pending |
| COMPARE-01 | Phase 50 | Pending |
| COLLECT-01 | Phase 50 | Pending |
| HELP-02 | Phase 50 | Pending |
| VAULT-02 | Phase 50 | Pending |
| OFFLINE-01 | Phase 51 | Pending |
| SAVE-01 | Phase 51 | Pending |
| UNDO-01 | Phase 51 | Pending |
| FAVE-01 | Phase 51 | Pending |
| NOTIF-01 | Phase 51 | Pending |
| ACHIEVE-01 | Phase 51 | Pending |
| ACHIEVE-02 | Phase 51 | Pending |
| EVENT-01 | Phase 51 | Pending |
| PRACTICE-01 | Phase 51 | Pending |
| DIFF-01 | Phase 51 | Pending |
| STREAK-01 | Phase 51 | Pending |

**Coverage:**
- v1 requirements: 52 total
- Mapped to phases: 52
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-05 after milestone kickoff*
