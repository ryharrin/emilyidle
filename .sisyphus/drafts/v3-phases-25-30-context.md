# Draft: v3.0 Phases 25-30 Context (Catalog-First Economy & Interactions)

## Source of Truth

- Roadmap: `.planning/ROADMAP.md`
- Current state: `.planning/STATE.md` (Phase 25 next)

## Phases In Scope (fixed)

- Phase 25: Watch Models & Duplicates
- Phase 26: Catalog-First Shop
- Phase 27: Career-First Economy & Upgrades Surface
- Phase 28: Wear-One Bonus
- Phase 29: Interactions & Mini-Games
- Phase 30: Workshop/Atelier + Docs

## Existing Context Files

- Found prior context files for phases 15-20 under `.planning/phases/`.
- No `25-CONTEXT.md` .. `30-CONTEXT.md` found yet.

## Requirements (from roadmap)

### Phase 25: Watch Models & Duplicates

- Watches are purchasable as specific models (brand/model), not generic tiers.
- Buying a watch increments owned count for that model.
- Duplicate copies after the first have diminishing returns on enjoyment/memories gains.

### Phase 26: Catalog-First Shop

- Fresh save lands on Catalog; existing saves open predictably.
- Each catalog entry shows price, owned count, and buy CTA or lock reason.
- Buy from catalog entry; ownership updates immediately in catalog flow.
- Catalog-relevant help tips accessible while browsing/buying.

### Phase 27: Career-First Economy & Upgrades Surface

- Career progression usable from beginning with specialization/path depth.
- Cash earned through career; owning watches does not create a parallel cash faucet.
- Therapist sessions: first costs 0 enjoyment; subsequent spend enjoyment (visible rule).
- Upgrades have dedicated surface/tab separate from catalog purchase flow.
- Before buying an upgrade, user sees effect on cash/enjoyment rates.

### Phase 28: Wear-One Bonus

- User can equip exactly one owned watch; UI indicates worn watch.
- Wearing provides distinct visible bonus; switching updates immediately.
- Equipping one always unequips the previous (no stacking).

### Phase 29: Interactions & Mini-Games

- Winding only for non-automatic watches; automatic watches do not show winding.
- Winding has visible animation, success/failure cues, and communicates rewards.
- Winding is skill/timing-based (input matters beyond a single button).
- Automatic watches have at least one distinct interaction mini-game with communicated rewards.

### Phase 30: Workshop/Atelier + Docs

- Workshop dismantle UI hidden until system unlocked.
- Atelier shows money needed for next blueprint.
- Atelier bonuses tuned so 2nd vault run is meaningfully faster than 1st.
- Help docs explain dual-currency + career progression in detail.
- Help updated to reflect v3.0 catalog-first economy + interaction mechanics.

## Research Findings (pending)

- [Pending] Explore agent: current watch/tier system + purchase flow
- [Pending] Explore agent: career + upgrades + interactions + rate breakdowns

## Open Questions (to resolve via discussion)

- [Phase 25] What diminishing-returns curve + how transparent should it be?
- [Phase 25] How to migrate existing saves from tier-based ownership to model-based ownership?
- [Phase 26] Fresh-save vs existing-save landing behavior details (e.g., remember last tab?)
- [Phase 27] How to communicate "watches don't generate cash" without confusion?
- [Phase 28] What kinds of equip bonuses exist and how shown in rate breakdown?
- [Phase 29] What are the specific mini-games (inputs, duration, failure conditions)?
- [Phase 30] What level of help depth (short, medium, full manual) and where surfaced?

## Discussion Selection

- Phase 25 gray areas selected: duplicate returns curve; model roster + IDs; purchase/ownership display; save migration rules.

## Scope Boundaries

- INCLUDE: Decisions about UX/behavior needed to implement phases 25-30 as written.
- EXCLUDE: Adding new mechanics beyond phases 25-30 (defer as later phases).

## Confirmed Decisions (so far)

### Phase 25: Duplicate Diminishing Returns

- Drop-off feel: Medium (2nd copy still meaningful, clearly worse than 1st).
- Floor: 10% minimum multiplier.
- Applies to: enjoyment + memories gains.
- UI: show exact multiplier at point-of-purchase (e.g., “Duplicate: 0.70x rewards”).

### Phase 25: Model Roster + IDs

- Initial roster size: all catalog entries (everything purchasable as a specific model).
- Stable ID scheme: slug derived from brand/model (and ref #), stable across saves.
- Default display name: include reference #.
- Catalog mapping: 1 model can map to multiple catalog entries (variants/media).

### Phase 25: Purchase / Ownership Display (pre-Phase 26)

- Presentation: group purchasable models by brand (avoid one flat list).
- Row/card content: show owned count + next duplicate multiplier.
- Buy CTA copy: dynamic (“Buy” for 0 owned, “Buy another” for 1+).
- Feedback: inline highlight/animation on the purchased row + owned count visibly increments.

### Phase 25: Save Migration

- No migration needed; backward compatibility for existing saves is not a requirement (game not released yet).

### Phase 26: Landing Behavior (Catalog-First Shop)

- Default landing tab: always open Catalog for existing saves (Catalog is the home screen).
- Fresh save handling: any special "fresh save" forcing is first-session-only (not a long-lived rule).
- After first purchase: stay on Catalog; ownership updates inline.
- Deep links: explicit deep link navigation overrides the default Catalog landing.

### Phase 26: Catalog Entry Layout

- Overall: card grid as primary presentation.
- Density: medium (desktop ~2-3 columns, mobile 1 column).
- Card anatomy: bottom action bar contains price/owned/CTA.
- More detail: expandable card section (inline expand/collapse) rather than a modal.

### Phase 26: Buy + Lock UX

- Confirmation: no confirm modal; single-click purchase.
- Lock/affordability messaging: inline reason under disabled CTA.
- Duplicate preview: show next multiplier only (keep rewards math elsewhere).
- Post-buy feedback: inline updates + small micro-feedback (owned increments, highlight, brief “Purchased”).

### Phase 26: In-Context Help

- Entry point: single Help button at top of Catalog (not per-card explain triggers).
- Surface: open the global Help modal, focused/scrolled to the relevant section.
- Required topics for Phase 26: duplicates + lock reasons.
- Intrusiveness: on-demand only; no proactive tips/coachmarks.

### Phase 27: Career Progression UX

- Start: begin with one default path; specialization choices come after some early steps.
- UI structure: full tree (skill-tree style).
- Specialization choices: locked (not reversible).
- Future visibility: show only the next 1-2 steps; deeper future stays hidden/teased.
- Tree size: small (10-15 nodes) for the Phase 27 launch.
- Node types: mix of passive boosts + nodes that unlock new actions.
- Locked nodes: show silhouettes/placeholder nodes with requirements.
- Entry point: dedicated Career tab available from the beginning.
