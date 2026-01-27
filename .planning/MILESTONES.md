# Project Milestones: Emily Idle

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
