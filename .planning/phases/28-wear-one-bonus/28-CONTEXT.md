# Phase 28: Wear-One Bonus - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a single equip slot for watches:

- Player can select exactly one owned watch to wear; UI indicates which is worn.
- Wearing a watch provides a distinct, player-visible bonus.
- Switching the worn watch updates the bonus immediately.
- Equipping one watch unequips the previous (no stacking).
- Bonus integrates into rate breakdowns.

Out of scope for this phase: interaction mini-games (Phase 29) and Workshop/Atelier changes (Phase 30).

</domain>

<decisions>
## Implementation Decisions

### Equip surface (where and how)
- Primary equip location: Vault/Collection list.
- Equip interaction: one-click Wear (switches immediately).
- Unowned watches: hide wear control.
- Slot summary: add a "Worn watch" summary card at the top of the Vault/Collection tab.
- Change control: "Change" opens a picker modal (owned watches).
- Wear none: allowed (slot can be empty).

### Bonus design
- Primary effect: enjoyment rate.
- Authorship: archetypes (reused across models), not unique per model.
- Scaling: no scaling (bonus depends only on which watch is worn).
- Archetype buckets: hybrid approach.
  - Start with the existing watch-id buckets (`starter`, `classic`, `chronograph`, `tourbillon`).
  - Leave room to add cross-cutting archetypes later without changing the Phase 28 contract.

### Visual indication
- On watch cards: show an "Equipped" badge on the worn watch card.

### Rate breakdown integration
- Show the worn-watch bonus in the enjoyment breakdown only.
- If wear none: omit the worn-watch term entirely (no neutral x1.00 line).
- Expanded details: keep it one-line numeric effect (no full formula dump).
- Explanation: use a Help section accessed via ExplainButton.

### Claude's Discretion
- Exact numeric values per archetype (as long as they are visible and stable).
- Exact UI styling for the Equipped badge and slot card (must fit existing card/details patterns).
- Whether the worn bonus appears as a multiplier term or additive term in the enjoyment breakdown (either is acceptable).

</decisions>

<specifics>
## Specific Ideas

Leverage existing codebase patterns:
- Watch type buckets already exist as the 4 `WatchItemId`s in `src/game/data/items.ts`.
- Set bonus groupings already reference these buckets in `src/game/data/setBonuses.ts`.
- Rate breakdown terms are composed in `src/game/selectors/index.ts` and rendered in `src/ui/tabs/StatsTab.tsx` via `<details>`.
- Existing selection patterns use `aria-selected` tablists (e.g., `src/App.tsx`, `src/ui/tabs/CatalogTab.tsx`).
- Explain affordance already exists via `ExplainButton` + `HelpModal`.

External UX refs (optional):
- WAI-ARIA APG Radio Group pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- React Aria RadioGroup: https://react-aria.adobe.com/RadioGroup

</specifics>

<deferred>
## Deferred Ideas

- Cross-cutting worn archetypes (e.g., set-bonus themed like "Dress"/"Diver") — future phase (not Phase 28).

</deferred>

---

*Phase: 28-wear-one-bonus*
*Context gathered: 2026-01-27*
