# Draft: Phase 28 (Wear-One Bonus)

## Phase Boundary (from ROADMAP.md)

- User can select exactly one owned watch to wear; UI indicates which is worn.
- Wearing a watch provides a distinct visible bonus; switching updates bonus immediately.
- Equipping one watch always unequips the previous one (no stacking).
- Bonus integrates into rate breakdowns.

## Decisions (confirmed)

### Where you equip

- Primary equip location: Vault/Collection list.
- Equip interaction: one-click Wear (switches immediately).
- Unowned watches: hide wear control.
- Persistent summary: show a "Worn watch" slot summary card with name/bonus + Change button.

### How it’s indicated

- On list cards: show an "Equipped" badge on the worn watch card.
- Slot summary placement: at the top of the Vault/Collection tab.
- Change interaction: opens a picker modal.
- Wear none: allowed (slot can be empty).

### What the bonus is

- Primary effect: enjoyment rate.
- Authorship: archetypes (a small set of bonus archetypes reused across models).
- Scaling: no scaling (bonus depends only on which watch is worn).
- Breakdown shape: either multiplier term or additive term is acceptable.

### How it shows in breakdowns

- Stats: show worn-watch bonus in enjoyment breakdown only.
- Wear none: omit the worn-watch term entirely when slot is empty.
- Expanded details: one-line numeric effect only.
- Player-facing explanation: via Help section accessed from an ExplainButton.

## Research Findings (local codebase)

- No existing "equipped/worn" watch concept in state today; ownership is count-based.
- Cash/enjoyment rate breakdown patterns exist and can show additive/multiplier terms.

Existing watch-type buckets that can map to bonus archetypes:

- Only 4 watch item ids exist today: `starter`, `classic`, `chronograph`, `tourbillon` (`src/game/data/items.ts`).
- Existing set bonus groupings already use these buckets (`src/game/data/setBonuses.ts`).

Selection UI patterns:

- Existing single-select patterns are implemented as tablists with `aria-selected` (e.g., main tabs in `src/App.tsx`, Catalog owned/unowned toggle in `src/ui/tabs/CatalogTab.tsx`).

Breakdown hook points:

- Breakdown terms are composed in `src/game/selectors/index.ts` (`getEnjoymentRateBreakdown`, `getCashRateBreakdown`).
- Breakdown UI is rendered in `src/ui/tabs/StatsTab.tsx` (expandable `<details>` sections).

## Open Questions

- None (Phase 28 decisions locked).

## Scope Boundaries

- INCLUDE: single equip slot + visible bonus + breakdown integration.
- EXCLUDE: new interaction mini-games (Phase 29), workshop/atelier changes (Phase 30).
