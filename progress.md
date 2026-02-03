Original prompt: I've been building a web based game in this repo. Catch yourself up on what it is and where it is in the development process

## Snapshot (2026-02-02)

- Game: **Emily Idle** — a Vite + React + TypeScript idle/incremental game themed around luxury watch collecting.
- Major shipped milestone: **v3.2 Catalog/Vault Consolidation** (shipped 2026-02-02).
- Current milestone: **v4.0 Watch Interactions & Catalog Polish** (planned/in progress).
- Current focus: **Phase 42: Winding Refresh** (plans drafted; ready to execute).

## Where the plan lives

- `.planning/STATE.md` — Phase 42 is current position; v4.0 plans are drafted; ready to execute Phase 42.
- `.planning/ROADMAP.md` — v4.0 phases 42–47.
- `.planning/REQUIREMENTS.md` — v4.0 requirements (WATCH-01..06, CAT-05..10, STATS-01..05, MOBILE-01..09).
- `.planning/phases/42-winding-refresh/42-CONTEXT.md` — decisions for Phase 42 (keep timing mechanic; add crown animation + penalty zone).
- v4.0 phase plan files:
  - Phase 42: `.planning/phases/42-winding-refresh/42-01-PLAN.md`, `.planning/phases/42-winding-refresh/42-02-PLAN.md`
  - Phase 43: `.planning/phases/43-new-watch-mini-games/43-01-PLAN.md` → `43-03-PLAN.md`
  - Phase 44: `.planning/phases/44-interaction-feedback-and-rewards/44-01-PLAN.md` → `44-02-PLAN.md`
  - Phase 45: `.planning/phases/45-per-watch-stats-surfaces/45-01-PLAN.md` → `45-02-PLAN.md`
  - Phase 46: `.planning/phases/46-catalog-expansion-tiered-variety/46-01-PLAN.md` → `46-02-PLAN.md`
  - Phase 47: `.planning/phases/47-mobile-and-ui-polish/47-01-PLAN.md` → `47-06-PLAN.md`

## Current game shape (high level)

- Tabs: Career, Collection, Catalog, Upgrades, Atelier (Workshop), Maison, Nostalgia, Stats, Settings.
- Economy: enjoyment (primary) + cash (therapy sessions/salary windows) + memories/collection value + nostalgia points for permanent unlocks.
- Interactions/mini-games present:
  - Winding (manual) modal (`src/ui/components/WindingMiniGameModal.tsx`).
  - Automatic rotor balancing (`src/ui/components/AutomaticMiniGameModal.tsx`).
  - Quartz set-time (`src/ui/components/QuartzMiniGameModal.tsx`).
- Runtime: RAF-driven simulation tick (100ms) + autosave via `useGameRuntime` (`src/game/runtime/useGameRuntime.ts`).
- Persistence: localStorage save v2 key `emily-idle:save` + legacy `watch-idle:save` migration (`src/game/persistence.ts`).

## Notes / risks

- Repo is currently in a detached HEAD state at `main` commit `b03a9d8`. Create a feature branch before committing changes.
- `.planning/v3.2-MILESTONE-AUDIT.md` notes ESLint is not green due to pre-existing lint errors (so lint isn’t a reliable gate right now).

## Next TODOs

- Execute Phase 42 starting with `.planning/phases/42-winding-refresh/42-01-PLAN.md`, then `.planning/phases/42-winding-refresh/42-02-PLAN.md`.
- Resolve any open questions for Phase 43 date/strap eligibility before implementation (`.planning/phases/43-new-watch-mini-games/43-CONTEXT.md`).
