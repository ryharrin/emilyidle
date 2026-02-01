# Project Milestones: Emily Idle

## v4.0 Watch Interactions & Catalog Polish (Planned)

**Goal:** Deepen watch interaction mini-games and polish the catalog experience.

**Target Features (from NOTES.md):**
- Winding mini-game: More interactive control with visual winding animation
- Additional automatic watch mini-games: Setting time/date, changing strap
- Catalog expansion: More watch brands and models
- Catalog visibility fixes: Undiscovered watches greyed out with lock icon (not hidden)
- Fix missing catalog images for certain watch models

**Bug Fixes:**
- Undiscovered watches visibility (greyed out vs hidden)
- Missing catalog images

**Status:** Planning phase - requirements and roadmap to be defined

**Depends on:** v3.2 Catalog/Vault Consolidation (optional intermediate milestone)

---

## v3.1 Career Depth & Landing (Shipped: 2026-02-01)

**Delivered:** Career becomes the default landing with staged progression, permanent choices, progress guidance, and a clearer salary window + sessions loop.

**Phases completed:** 32-36 (13 plans total)

**Key accomplishments:**
- Fresh saves land on Career by default; deep links override without overwriting last-tab persistence.
- Added 5+ career stages with permanent, persisted choices and clear before/after previews.
- Added progress bar + next unlock callout and a next-action cue.
- Restored early-career sessions pre-track so the salary window refresh loop works immediately after entering the program.
- Tightened help deep-links for career start/stages and clarified Shop vs Catalog purchase language.
- Fixed quartz set-time alignment and added regression coverage (desktop + mobile).

**Stats:**
- 209 files changed
- +11,629 / -922 lines (TypeScript/TSX/CSS + tests)
- 5 phases, 13 plans, 26 tasks
- 2 days (2026-01-30 -> 2026-02-01)

**Git range:** `v3.0` -> `v3.1`

**What's next:** Start v3.2 focused on consolidating Catalog/Vault surfaces and making watch purchasing + vault info feel unified.

---

## v3.0 Catalog-First Economy & Interactions (Shipped: 2026-01-30)

**Delivered:** Catalog-first purchase flow with a career-first cash economy, model-based watches, interactions mini-games, and clearer workshop/atelier pacing.

**Phases completed:** 25-31 (41 plans total)

**Key accomplishments:**
- Moved watch ownership to real model IDs with duplicate diminishing returns and legacy migration.
- Made the Vault embed catalog shopping as the primary purchase flow with in-context help.
- Reworked the cash economy to be career-driven (salary + sessions) and separated upgrades into a dedicated surface.
- Added wear-one watch selection with persistent equip state and a visible rate breakdown line.
- Added movement-gated interactions (winding/automatic/quartz) with distinct mini-games, rewards, cooldowns, and mobile-friendly modals.
- Tightened Workshop/Atelier clarity + Help deep-links, then closed rate-clarity gaps (events apply to cash + enjoyment; upgrades affect enjoyment only; previews match accrual).

**Stats:**
- 359 files changed
- +21,683 / -1,176 lines (TypeScript/TSX/CSS + tests)
- 7 phases, 41 plans, 78 tasks
- 3 days (2026-01-27 -> 2026-01-30)

**Git range:** `ae2f0f5b` -> `3830d58`

**What's next:** Start v3.1 focused on a deeper Career progression + making Career the default landing view.

---

## v2.0 Upcoming Major Changes to Game Design (Shipped: 2026-01-25)

**Delivered:** Enjoyment-first economy with dual-currency purchases, nostalgia prestige/unlocks, and a modularized codebase.

**Phases completed:** 13-18 (23 plans total)

**Key accomplishments:**
- Shifted the core Collection economy to enjoyment with tier-based per-watch enjoyment rates and enjoyment-first UI copy.
- Added therapist career progression (passive salary + cooldown sessions spending enjoyment for cash/XP) with persistence + unit coverage.
- Implemented dual-currency watch purchasing (cash spent, enjoyment as threshold gate) with Vault lock messaging/styling and regression tests.
- Added nostalgia prestige (per-run enjoyment tracking, diminishing-returns nostalgia gain, reset semantics) with modal/results UI and unit/e2e coverage.
- Added nostalgia unlocks (strict order + reverse refunds) that permanently bypass milestone gates, with store UI + persistence + tests.
- Refactored game architecture into model/data/selectors/actions modules; extracted tab panels and runtime orchestration; validated via lint/typecheck/unit/e2e/build.

**Stats:**
- 95 files changed
- +13,277 / -3,910 lines (TypeScript/TSX/CSS + tests)
- 6 phases, 23 plans, ~40 tasks (from plan summaries)
- 1 day (2026-01-22 -> 2026-01-23) based on milestone commit range

**Git range:** `3a36301` -> `10d5f15`

**What's next:** Define v2.1+ requirements and plan Phase 19 (phase-13 refactor + tests).

---

## v2.1 Onboarding & UX (Shipped: 2026-01-27)

**Delivered:** Improved onboarding clarity and player-facing explanations, plus a consistent UI polish pass to reduce early-game confusion.

**Phases completed:** 20-24

**Key accomplishments:**
- Added a global Help/Glossary entry point and consistent help/lock/prestige icon language.
- Surfaced point-of-use explanations for enjoyment gates vs cash spend and nostalgia unlock order.
- Improved unlock clarity and "next actions" UX (lock reasons, progress to next unlocks, catalog empty-state CTAs).
- Standardized prestige confirmation and post-prestige re-onboarding.
- Completed a UI polish pass focused on hierarchy, responsiveness, and micro-interactions.

**What's next:** Start v3.0 requirements and roadmap for the NOTES backlog (catalog-first economy + deeper watch interactions).

---
