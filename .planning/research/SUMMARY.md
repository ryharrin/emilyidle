# Project Research Summary

**Project:** Emily Idle
**Domain:** Idle game UI consolidation (Catalog as sole purchase surface + Vault info embedded)
**Researched:** 2026-02-01
**Confidence:** MEDIUM-HIGH

## Executive Summary

This milestone is a UI consolidation: make the Catalog the single purchase surface while still giving players the Vault context they need to buy confidently (capacity, owned state, equipped state, and upgrade status). The repo already has the right foundations: React/Vite/TypeScript with a thin UI layer over a pure `game/*` domain, and a reusable purchase surface (`CatalogPurchasePanel`) that can be mounted as the canonical shop.

The recommended approach is to keep domain logic and persistence contracts stable, and implement the change as tab composition + navigation/CTA rewiring: mount the Catalog tab as a first-class destination, route every "buy" entry point to it, and remove/disable Vault purchase affordances. Add a compact Vault summary panel inside the Catalog rather than pushing global vault stats into every card.

Key risks are regressions from duplicated computations (two sources of truth), broken deep links/test selectors during component reshuffles, and edge cases around capacity gating + upgrade flows (full vault, return-to-intent). Mitigate by centralizing eligibility/value calculations in selectors/actions, treating `data-testid`/anchor IDs as API, and adding targeted unit + Playwright coverage for the full-vault resolution path and last-tab/deep-link compatibility.

## Key Findings

### Recommended Stack

No stack changes are needed for v3.2; this is a refactor/composition milestone.

**Core technologies:**
- React 18.3.1: UI composition/refactor work already fits the existing component model
- Vite 6.0.0: fast iteration while reshaping tabs and CSS
- TypeScript 5.8.0 (strict): reduces regressions while moving shared props/selectors
- Plain CSS: matches existing styling approach; avoid introducing a second styling system

**Supporting libraries:**
- `lucide-react` 0.563.0: optional, for lightweight card status/gating icons without adopting a UI kit

### Expected Features

**Must have (table stakes):**
- Single purchase surface (Catalog cards only) with clear price + requirements (cash + enjoyment threshold)
- Owned state visible while shopping (owned count + equipped state where applicable)
- Capacity-aware purchasing: disabled Buy when full, with a clear reason and a direct path to resolution (upgrade)
- Vault summary visible while shopping (used/max capacity, upgrade status, optionally vault value)
- Immediate post-purchase UI updates (owned count, capacity, unlock state, CTA state)
- Save compatibility preserved; consolidation must not delete items/upgrades or change meanings silently

**Should have (competitive):**
- Mode-switching or progressive disclosure card layout to keep the unified surface readable
- Purchase intent preservation (after upgrading capacity, return user to the same item/state)
- "Affordable now" quick filter and/or better reasons for ineligible items
- Contribution/benefit explanation on owned cards (especially to reinforce enjoyment-only multipliers)

**Defer (v3.2.x / v4+):**
- Sort/filter quality pass based on playtest friction
- "Capacity coach" UX enhancements (near-full warnings, "X purchases until full")
- Rich inventory management (sell/trade/scrap) unless a new loop depends on it
- List virtualization unless the catalog grows large enough to create measurable jank

### Architecture Approach

Keep the existing boundary: UI moves purchase entry points, domain stays pure and canonical.

**Major components:**
1. `src/App.tsx` - composition root (tab wiring, derived props, persistence, navigation)
2. `src/ui/tabs/CatalogTab.tsx` - becomes the sole purchase surface; wraps `CatalogPurchasePanel` with Vault context
3. `src/ui/tabs/CollectionTab.tsx` - Vault/inventory management only (no purchase UI), routes users to Catalog for buying
4. `src/ui/tabs/CatalogTab.tsx#CatalogPurchasePanel` - canonical purchase list UI (keep it side-effect free; delegate to App)
5. `src/game/state.ts` + `src/game/selectors/*` + `src/game/actions/*` - single source of truth for eligibility/value/owned counts

Key integration/contracts to keep stable:
- Deep-link/scroll anchors (notably `id="catalog-shop"`) used by `App.tsx#navigateTo()`
- `data-testid` attributes referenced by Playwright/Vitest
- Save/load behavior in `src/game/persistence.ts` (no schema/semantic drift for a UI-only milestone)

### Critical Pitfalls

1. **Two sources of truth (ownership/value/eligibility)** - centralize computations into selectors/actions; add unit tests comparing UI affordances to domain eligibility
2. **Two purchase entry points diverge** - remove/hard-disable legacy Vault purchase UI; ensure a single purchase path remains reachable
3. **Lost wayfinding/muscle memory** - keep a clearly labeled "Vault" panel within Catalog; consider a one-time hint that Vault moved
4. **Card cognitive overload** - keep global vault info in one place; keep cards focused on item-level info with progressive disclosure
5. **Capacity edge cases + upgrade loops** - define explicit eligibility rules; add Playwright coverage for full-vault blocked purchase -> upgrade -> return
6. **Selector/test/deep-link breakage** - treat `data-testid` and anchor IDs as public API; migrate in one sweep
7. **Performance regressions** - avoid per-card global aggregations; compute heavy stats once and pass down; profile while ticking

## Implications for Roadmap

Suggested phase structure (aligned to dependencies and known repo contracts):

### Phase 1: UX/IA + Copy Contract
**Rationale:** Wayfinding, card density, and upgrade copy all drive perceived correctness; locking these first prevents rework.
**Delivers:** layout decisions (Vault panel placement), card information hierarchy, CTA labels/disabled reasons, and an explicit copy-to-formula mapping for upgrades.
**Addresses:** Vault summary while shopping; clear requirement messaging; avoid muscle-memory break and cognitive overload.
**Avoids:** pitfalls 3, 4, 7.

### Phase 2: Domain Invariants + Compatibility (Minimal)
**Rationale:** UI must reflect a single canonical truth, and eligibility edge cases must be enforced consistently.
**Delivers:** selector/action contracts for purchase eligibility (cash + enjoyment + capacity), upgrade preview derivation rules, golden-save checks/migrations if any semantics must change.
**Addresses:** capacity-aware gating, save compatibility, copy/economy alignment.
**Avoids:** pitfalls 1, 5, 6.

### Phase 3: UI Merge Implementation
**Rationale:** Once rules and IA are fixed, implementation is mostly wiring and component refactors.
**Delivers:** Catalog tab exposed + routable; all buy CTAs route to Catalog; Vault tab no longer contains purchase UI; VaultSummary embedded in Catalog; deep link + last-tab mapping preserved.
**Uses:** existing `CatalogPurchasePanel` as canonical shop; add small UI components (`VaultSummaryPanel`) instead of inflating mode flags.
**Avoids:** pitfalls 2, 6, 9.

### Phase 4: QA, Regression, and Performance Pass
**Rationale:** Consolidation risk is mostly regressions; verify the core flows and guard against tick-driven jank.
**Delivers:** Playwright coverage for "purchase only via Catalog", full-vault blocked path, and last-tab/deep-link behavior; profiling-driven perf fixes; optional P2 sort/filter polish.
**Avoids:** pitfalls 5, 6, 9, 10.

### Phase Ordering Rationale

- Lock UX + copy first to prevent implementation churn and to keep Vault concepts findable after the move.
- Establish domain invariants (eligibility/value/copy contracts) before UI rewiring to prevent two-sources-of-truth drift.
- Implement routing/anchors/test IDs as a single compatibility sweep, since navigation and tests are tightly coupled.
- Verify edge cases and performance last; only add virtualization/sort/filter after you see real friction.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** UX/IA decisions (what lives in the Vault panel vs on cards) benefit from a quick playtest hypothesis + acceptance criteria.
- **Phase 4:** performance/virtualization is data-dependent (catalog size and tick frequency); plan based on profiling.

Phases with standard patterns (skip research-phase):
- **Phase 2:** selector/action invariants + save compatibility are well-understood in this repo.
- **Phase 3:** tab wiring + CTA routing are straightforward given existing `CatalogPurchasePanel` reuse.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Repo already has the needed stack; no new dependencies required (STACK.md)
| Features | MEDIUM | Based on common inventory-limited shop UX patterns; exact affordances need playtest tuning (FEATURES.md)
| Architecture | HIGH | Grounded in direct code structure and existing reuse of `CatalogPurchasePanel` (ARCHITECTURE.md)
| Pitfalls | MEDIUM | Grounded in repo constraints (save/test IDs/tick re-render); exact failure modes depend on implementation choices (PITFALLS.md)

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Exact Vault info scope in Catalog:** decide what is global (panel) vs per-card (owned/equipped/value) to avoid overload while still enabling confident buying.
- **Upgrade copy mapping:** confirm which upgrades are enjoyment-only multipliers and ensure previews derive from selectors (not hardcoded UI strings).
- **Compatibility contracts:** inventory existing deep links/anchors and Playwright selectors to avoid accidental breakage during tab reshuffle.

## Sources

### Primary (HIGH confidence)
- Local codebase inspection: `src/App.tsx`, `src/ui/tabs/CatalogTab.tsx`, `src/ui/tabs/CollectionTab.tsx`, `src/game/state.ts`, `src/game/persistence.ts`
- https://react.dev/ - React reference
- https://vite.dev/ - Vite reference
- https://playwright.dev/ - Playwright reference

### Secondary (MEDIUM confidence)
- Common UX patterns: inventory-limited shops (games) + owned-state indicators (digital storefronts)

---
*Research completed: 2026-02-01*
*Ready for roadmap: yes*
