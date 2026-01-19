# Phase 11 Notes

This file exists because `.sisyphus/plans/unfinished-workstreams.md` references it as the original Phase 11 spec source.

All Phase 11 work is also represented (and tracked) in `.sisyphus/plans/unfinished-workstreams.md`. When updating requirements or completion status, prefer updating the consolidated plan.

## Scope

Phase 11 focuses on UX/navigation, catalog expansions, new events (calendar + manual), lightweight stats/lore, and small passive bonuses.

## Phase 11 Tasks (canonical list)

These tasks are mirrored from the Phase 11 section in `.sisyphus/plans/unfinished-workstreams.md`.

- 11-01 — Rename “Sentimental value” to “Memories” (UI-only)
- 11-02 — Catalog tabs: Owned vs Unowned (remove View select)
- 11-03 — Main UI navigation: ARIA tabs (Vault/Atelier/Maison/Catalog/Stats/Save)
- 11-04 — Audio: SFX + BGM toggles (default OFF; persisted; no playback wiring)
- 11-05 — Catalog expansion: add brands + entries (e.g., Omega, Cartier)
- 11-06 — Women’s watches: `womens` tag + Style filter
- 11-07 — Catalog sorting + filtering: Era + Type + Sort
- 11-08 — Stats dashboard (derived metrics only)
- 11-09 — Achievements: add 3 new achievements
- 11-10 — Catalog info boxes: `facts` rendered via `<details>`
- 11-11 — Language consistency pass: "Vault / Atelier / Maison" strings (UI-only)
- 11-12 — Trusted dealers panel + disclaimer
- 11-13 — Emily’s birthday event (annual calendar date)
- 11-14 — Mini-game MVP: “Wind the watch” manual event
- 11-15 — Watch abilities: 2 passive bonuses (cash-only)
- 11-16 — Lore: 3 chapters unlocked by milestones

## Verification

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run test:unit`
- `pnpm run test:e2e`
- `pnpm run build`
