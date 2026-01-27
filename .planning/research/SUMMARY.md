# Project Research Summary

**Project:** Emily Idle (watch-idle)
**Domain:** Browser-based idle/incremental game — v3.0 "Catalog-First Economy & Interactions"
**Researched:** 2026-01-27
**Confidence:** MEDIUM-HIGH

## Executive Summary

v3.0 is a structural shift: the Catalog becomes the primary shop/progression surface (default landing + purchase CTAs), while the economy and interactions evolve from coarse tier items into explicit watch models with ownership, equip-one bonuses, and short repeatable activities/mini-games. The most robust approach keeps domain logic pure and centralized (selectors/actions), treats catalog metadata and gameplay tuning as separate layers, and introduces inventory + activities as first-class subdomains rather than scattering logic across UI components.

Recommended approach: preserve the existing architecture split (UI vs `src/game/*`), add an inventory slice for model ownership/equip, add an activities slice for interactions, and derive per-model gameplay stats from lightweight archetypes/tags (not bespoke tuning per catalog entry). This keeps the catalog scalable, the economy testable, and UI changes mostly about moving purchase affordances to the catalog.

Key risks are semantic save drift (old saves load but feel wrong), double-application/missed application of costs/rewards in the sim loop, and conflating discovered with owned once the catalog becomes the shop. Mitigate with migration invariants + golden saves, centralizing rate-based earnings (apply once), keeping discrete costs in actions only, and maintaining separate state for discovery vs ownership vs equip.

## Key Findings

### Recommended Stack

Keep the current stack; v3.0 is primarily a domain/model refactor plus UI surface shift, not a platform rewrite. Add optional libraries only if they unlock concrete risk reduction or scalability.

Core technologies:
- React 18.3.1: UI + catalog-first purchase surface.
- Vite 6.0.0: build/dev server.
- TypeScript 5.8.0: safe domain modeling for itemization, diminishing returns, equip rules, and migrations.

Selective adds (only if needed):
- zod 4.3.6: runtime validation for save migration + invariants.
- @tanstack/react-virtual 3.13.18: virtualization if the catalog grows large enough to cause perf issues.
- xstate 5.26.0: only if mini-games become multi-step/interruptible and state logic becomes complex.

### Expected Features

Must have (table stakes):
- Catalog-first default view + purchase CTAs on catalog entries (owned counts, locked/unlocked clarity).
- Explicit watch models (beyond 4 tiers) with stable IDs and deterministic mapping to catalog entries.
- Career-first cash loop that is reliable early (no deadlocks) with transparent session cost/payout rules.
- Diminishing returns on duplicates (v1) with UI transparency.
- Wear-one-watch (equip slot) with a visible, immediate bonus (vault still produces).

Should have (competitive):
- Interactions vary by model/type/tags; interactions can drive discovery.
- Owned vs discovered vs locked remain distinct and meaningful.
- Model sets/collections as goals once core economy is stable.

Defer (v3.0.x / v4+):
- Dealer rotations, deeper interaction tables, automatics mini-game (after validating v1 activities + economy).
- Maintenance/condition systems and market simulation (high tuning risk).

### Architecture Approach

The existing separation is strong enough; v3.0 should extend it by adding inventory + activities modules and avoiding monolithic growth in `selectors/index.ts` and `actions/index.ts`.

Major components:
1. `src/game/data/catalogEconomy.ts` — derive gameplay stats/prices from catalog tags/archetypes.
2. `src/game/selectors/inventory.ts` + `src/game/actions/inventory.ts` — ownership/equip rules and purchase gates.
3. `src/game/selectors/activities.ts` + `src/game/actions/activities.ts` + `src/game/data/activities.ts` — interaction gating/cooldowns/rewards as data.
4. `src/game/persistence.ts` + `src/game/model/state.ts` — migration seam; new fields with defaults; golden-save verification.
5. UI (`src/ui/tabs/CatalogTab.tsx`, `src/ui/tabs/CollectionTab.tsx`, `src/App.tsx`) — move purchase surface, add equip/interaction entrypoints, keep UI state ephemeral.

### Critical Pitfalls

1. Economy semantic drift breaks saves.
2. Session costs vs non-negative currency semantics.
3. Double-application/missed application in sim loop.
4. Discovery/ownership conflation.
5. ID churn orphaning inventories.
6. Equip-one bonus stacking/reset bugs.
7. Mini-game reroll exploits / nondeterminism.

## Implications for Roadmap

Front-load save safety + domain boundaries, then shift UI surfaces, then layer interactions, and only then do major economy rebalance/balancing.

### Phase 1: Save-Safe v3 State + Migration Scaffolding
Rationale: biggest irreversible risk is player trust via broken/"wrong" saves.

### Phase 2: Catalog Economy Mapping (Archetype + Instance)
Rationale: defines what a watch model means economically without UI changes.

### Phase 3: Inventory Slice + Catalog-First Purchase Surface
Rationale: ship the headline (catalog-first shop) once domain primitives exist.

### Phase 4: Wear-One Equip + Visible Bonus
Rationale: high-salience mechanic that anchors interactions.

### Phase 5: Activities Framework + First New Mini-Game
Rationale: shared gating/cooldown/reward patterns prevent bespoke state per interaction.

### Phase 6: Career-First Economy Rules + Balancing Pass
Rationale: easiest to validate after migration + UI surfaces are stable.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Grounded in current repo versions; optional deps are scoped. |
| Features | MEDIUM | Genre norms; tuning is design-dependent. |
| Architecture | MEDIUM | Based on current code structure; implementation will validate boundaries. |
| Pitfalls | MEDIUM | Rooted in persistence/sim patterns; mitigations are standard. |

## Gaps to Address

- Exact v3.0 economy targets (rates, time-to-first-afford, prestige pacing).
- Catalog model ID source of truth (existing catalog entry IDs vs curated subset).
- Discovery rules under catalog-first shop (gate purchases vs informational).
- Mini-game reward structure (deterministic vs random) to choose persistence/seed strategy.

## Sources

- Internal repo: `src/game/persistence.ts`, `src/game/model/state.ts`, `src/game/model/types.ts`, `src/game/sim.ts`, `src/ui/tabs/CatalogTab.tsx`, `src/ui/tabs/CollectionTab.tsx`, `src/ui/tabs/CareerTab.tsx`, `src/game/selectors/index.ts`, `src/game/actions/index.ts`
- Package verification: https://registry.npmjs.org/zod/latest, https://registry.npmjs.org/@tanstack/react-virtual/latest, https://registry.npmjs.org/xstate/latest

---
*Research completed: 2026-01-27*
*Ready for roadmap: yes*
