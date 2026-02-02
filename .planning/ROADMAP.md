# Roadmap: Emily Idle

## Overview

Emily Idle evolves by shipping coherent player-visible improvements in continuous phases. Milestone v3.2 focuses on consolidating the Catalog/Vault experience so purchasing happens directly from catalog cards with collection context embedded.

## Milestones

- ✅ **v3.1 Career Depth & Landing** - Phases 32-36 (shipped 2026-02-01)
- 🚧 **v3.2 Catalog/Vault Consolidation** - Phases 37-41 (planned)
- 📋 **v4.0 Watch Interactions & Catalog Polish** - Planned (see `.planning/MILESTONES.md`)

## Phases

**Phase Numbering:**
- Integer phases (37, 38, ...): Planned milestone work
- Decimal phases (e.g. 38.1): Urgent insertions (marked with INSERTED)

- [x] **Phase 37: Catalog Purchase Surface** - Catalog cards become the only purchase flow.
- [x] **Phase 38: Catalog Lock + Disabled Explanations** - Locked/disabled states are visible and explained in-place.
- [x] **Phase 39: Collection Info Embedded in Catalog** - Capacity/value and "Collection" naming are integrated into catalog.
- [x] **Phase 40: Upgrade Status + Copy Alignment** - Upgrade status is visible in catalog and all upgrade copy/previews match enjoyment-only behavior.
- [ ] **Phase 41: Stability & Regression Guardrails** - Consolidation ships without save/key/selector/image regressions.

## Phase Details

### Phase 37: Catalog Purchase Surface
**Goal**: Players can buy watches exclusively from catalog cards with clear actionable affordances.
**Depends on**: Phase 36
**Requirements**: CAT-01, CAT-04
**Success Criteria** (what must be TRUE):
  1. Player can complete a watch purchase directly from a catalog card (no separate Vault/Collection purchase button).
  2. Catalog clearly distinguishes actionable (affordable) cards from non-actionable cards at a glance.
  3. Any previous Vault/Collection purchase entry point is removed or non-existent in the UI.
**Plans**: 2 plans

Plans:
- [x] 37-01-PLAN.md — Promote Catalog tab as the shop surface; remove embedded Vault shop; update help/tests
- [x] 37-02-PLAN.md — Add actionable vs non-actionable catalog card affordances (CAT-04)

### Phase 38: Catalog Lock + Disabled Explanations
**Goal**: Players can see undiscovered/disabled watches in the catalog and understand why purchase is unavailable.
**Depends on**: Phase 37
**Requirements**: CAT-02, CAT-03
**Success Criteria** (what must be TRUE):
  1. Undiscovered watches appear in the catalog greyed out with a lock icon (not fully hidden).
  2. When a purchase action is disabled, the catalog provides a clear "Why can't I buy?" explanation in context.
  3. The explanation points to the specific gating reason (e.g. locked/undiscovered, insufficient resources).
**Plans**: 5 plans

Plans:
- [x] 38-01-PLAN.md — Add lock overlay + in-context "Why can't I buy?" explainer without changing buy/gate semantics
- [x] 38-02-PLAN.md — Style lock/explanation affordances in both themes without regressing actionable visuals
- [x] 38-03-PLAN.md — Add unit + e2e regression coverage for lock/explanation selectors and gating semantics

### Phase 39: Collection Info Embedded in Catalog
**Goal**: Players can understand collection context (capacity/value) while shopping, with consistent "Collection" naming.
**Depends on**: Phase 38
**Requirements**: VLT-01, VLT-02, VLT-04
**Success Criteria** (what must be TRUE):
  1. Catalog UI shows current/max collection capacity in the shopping context.
  2. Catalog UI shows current collection value in the shopping context.
  3. The tab label and player-facing copy consistently use "Collection" instead of "Vault".
**Plans**: 5 plans

Plans:
- [x] 39-01-PLAN.md — Show collection capacity/value in Catalog header
- [x] 39-02-PLAN.md — Rename UI/help "Vault" -> "Collection" (no selector changes)
- [x] 39-03-PLAN.md — Rename domain display strings (milestones/achievements/upgrades)
- [x] 39-04-PLAN.md — Update tests for Collection naming
- [x] 39-05-PLAN.md — Add catalog context pill regression coverage

### Phase 40: Upgrade Status + Copy Alignment
**Goal**: Players can see upgrade status while shopping, and upgrade UI copy/previews accurately reflect enjoyment-only behavior.
**Depends on**: Phase 39
**Requirements**: VLT-03, UPG-01, UPG-02, UPG-03
**Success Criteria** (what must be TRUE):
  1. Catalog surface shows upgrade status without requiring a separate upgrades surface.
  2. Upgrade copy does not claim cash multipliers and clearly describes enjoyment-only multipliers.
  3. Upgrade previews match actual enjoyment accrual behavior the player experiences after purchase.
**Plans**: 3 plans

Plans:
- [x] 40-01-PLAN.md — Add Catalog upgrade status summary in the shopping header
- [x] 40-02-PLAN.md — Scrub upgrade-related UI/help copy to enjoyment-only language
- [x] 40-03-PLAN.md — Adjust upgrade previews so they don’t imply cash changes

### Phase 41: Stability & Regression Guardrails
**Goal**: Consolidation ships without breaking existing saves, storage, selectors, or catalog images.
**Depends on**: Phase 40
**Requirements**: TEC-01, TEC-02, TEC-03, TEC-04
**Success Criteria** (what must be TRUE):
  1. Existing saves load and play continues normally after updating (no save format changes, no data loss).
  2. localStorage keys and data structures remain unchanged for existing players.
  3. Existing UI selectors (`id`, `data-testid`) remain stable so automated tests can locate the same elements.
  4. Catalog images load correctly everywhere they are shown in the consolidated UI.
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 37. Catalog Purchase Surface | v3.2 | 2/2 | Complete | 2026-02-02 |
| 38. Catalog Lock + Disabled Explanations | v3.2 | 3/3 | Complete | 2026-02-02 |
| 39. Collection Info Embedded in Catalog | v3.2 | 5/5 | Complete | 2026-02-02 |
| 40. Upgrade Status + Copy Alignment | v3.2 | 3/3 | Complete | 2026-02-02 |
| 41. Stability & Regression Guardrails | v3.2 | 0/TBD | Not started | - |
