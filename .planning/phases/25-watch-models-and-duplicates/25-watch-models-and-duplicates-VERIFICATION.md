---
phase: 25-watch-models-and-duplicates
verified: 2026-01-28T16:15:03Z
status: gaps_found
score: 4/6 must-haves verified
gaps:
  - truth: "All watch purchasing paths buy specific models (no tier-only purchases)"
    status: failed
    reason: "Auto-buy still purchases tier items via buyItem(), bypassing per-model ownership + duplicate scaling"
    artifacts:
      - path: "src/App.tsx"
        issue: "Auto-buy loop calls buyItem(nextState, item.id, purchaseQty) instead of a model-level purchase"
    missing:
      - "Update auto-buy to purchase watch models (e.g., pick a model id per tier/brand) and call buyWatchModel()"
      - "Or disable auto-buy purchasing until model ownership is seeded/migrated"
      - "Ensure auto-buy updates watchModels so enjoyment/memories and duplicate math reflect purchases"
  - truth: "Legacy saves with tier-only ownership preserve enjoyment/memories behavior (or are migrated to model ownership)"
    status: failed
    reason: "Enjoyment rate and collection value are derived solely from state.watchModels; old saves without watchModels will see 0 contributions from existing tier-owned watches"
    artifacts:
      - path: "src/game/model/state.ts"
        issue: "createStateFromSave() leaves watchModels as {} when missing; no migration from saved.items"
      - path: "src/game/selectors/enjoyment.ts"
        issue: "getEnjoymentRateCentsPerSec() iterates state.watchModels only (no fallback)"
    missing:
      - "Migration strategy in createStateFromSave(): map existing tier counts into model ids (at least a deterministic default per tier)"
      - "Or selector-level fallback so tier-owned watches contribute until the player rebuy/migrates"
      - "A unit test that proves legacy tier-only saves still have non-zero enjoyment/memories rates"
---

# Phase 25: Watch Models & Duplicates Verification Report

**Phase Goal:** Watches are specific models and duplicates have diminishing returns.
**Verified:** 2026-01-28T16:15:03Z
**Status:** gaps_found
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | User sees specific watch models (brand/model) as purchasable items (not generic tiers) | VERIFIED | `src/ui/tabs/CollectionTab.tsx` renders brand sections from `getWatchModels()` and per-model cards |
| 2 | Buying a watch increments owned count for that specific model | VERIFIED | `src/game/actions/index.ts` `buyWatchModel()` increments `state.watchModels[modelId]`; `src/ui/tabs/CollectionTab.tsx` buy button calls `buyWatchModel(state, model.id)` |
| 3 | Duplicate reward multiplier is visible to the player and never drops below 0.10x | VERIFIED | `src/game/selectors/duplicates.ts` clamps to `DUPLICATE_REWARD_FLOOR = 0.1`; `src/ui/tabs/CollectionTab.tsx` displays `Duplicate: {duplicateMultiplier.toFixed(2)}x rewards` |
| 4 | Buying duplicate copies yields reduced enjoyment + memories contributions vs the first copy | VERIFIED | `src/game/selectors/enjoyment.ts` and `src/game/model/state.ts` apply `getDuplicateRewardSum(owned)`; `tests/enjoyment.unit.test.tsx` asserts second purchase delta is smaller |
| 5 | All watch purchasing paths buy specific models (no tier-only purchases) | FAILED | `src/App.tsx` auto-buy loop purchases tier items via `buyItem(...)` (model ownership not updated) |
| 6 | Legacy saves with tier-only ownership preserve enjoyment/memories behavior (or are migrated) | FAILED | `createStateFromSave()` does not migrate `items` to `watchModels`; enjoyment/memories iterate `state.watchModels` only |

**Score:** 4/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/game/data/watchModels.ts` | Deterministic roster derived from catalog entries | VERIFIED | Builds `WATCH_MODELS` from `CATALOG_ENTRIES` with `id: entry.id` and per-brand reference numbers |
| `src/game/model/types.ts` | State schema includes model ownership | VERIFIED | `GameState.watchModels: Record<string, number>` and `PersistedGameState.watchModels?` |
| `src/game/selectors/duplicates.ts` | Duplicate curve helpers with 0.10 floor | VERIFIED | Exponential decay with clamp to floor; copyIndex 0 is 1.0 |
| `src/game/selectors/enjoyment.ts` | Enjoyment rate derives from model ownership + duplicates | VERIFIED | Sums tier enjoyment by model ownership using `getDuplicateRewardSum()` |
| `src/game/model/state.ts` | Collection value (Memories) derives from model ownership + duplicates | VERIFIED | `getCollectionValueCents()` uses model tier value * `getDuplicateRewardSum()` |
| `src/ui/tabs/CollectionTab.tsx` | Vault purchase UI is model-based and shows duplicate multiplier | VERIFIED | Brand-grouped model list; per-model buy CTA; duplicate multiplier label |
| `tests/duplicate-rewards.unit.test.ts` | Duplicate curve unit coverage | VERIFIED | Tests 1.0 first copy, ~0.7 second, monotonic + floor |
| `src/App.tsx` | Auto-buy purchase path aligns with model purchasing | FAILED | Auto-buy uses tier-level `buyItem()` |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/game/data/watchModels.ts` | `src/game/catalog.ts` | `CATALOG_ENTRIES` | WIRED | `WATCH_MODELS` maps from `CATALOG_ENTRIES` and uses `getCatalogEntryTags()` for tier |
| `src/game/actions/index.ts` | `src/game/model/types.ts` | `watchModels` ownership | WIRED | `buyWatchModel()` mutates `state.watchModels` and keeps `state.items[tierId]` in sync |
| `src/game/selectors/enjoyment.ts` | `src/game/selectors/duplicates.ts` | `getDuplicateRewardSum()` | WIRED | Diminishing returns applied per model owned |
| `src/game/model/state.ts` | `src/game/selectors/duplicates.ts` | `getDuplicateRewardSum()` | WIRED | Memories/collection value uses same diminishing returns |
| `src/App.tsx` | `src/game/actions/index.ts` | auto-buy purchasing | NOT_WIRED | Auto-buy calls `buyItem()` (tier purchase), not `buyWatchModel()` |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
| --- | --- | --- |
| WATCH-01 | BLOCKED | Tier-only purchasing still exists via auto-buy (`src/App.tsx`) |
| WATCH-02 | BLOCKED | Tier-only purchases bypass model ownership, so duplicate diminishing returns cannot apply consistently |

### Anti-Patterns Found

No blocker stub patterns found in core phase artifacts. (Catalog search input `placeholder=...` matches a UI placeholder string, not a stub.)

### Human Verification Required

1. Vault model list UX

**Test:** In Vault, scroll brands; buy a model; confirm owned increments and row flashes.
**Expected:** Owned count updates for that model; duplicate multiplier label updates downward on second purchase; row highlight clears.
**Why human:** Layout/scrolling/polish and perceived clarity aren't verifiable from static code.

### Gaps Summary

Phase 25 successfully introduces a catalog-derived watch model roster, model-level ownership, and duplicate diminishing returns applied to enjoyment and Memories, with the Vault UI buying models.

However, at least one in-app purchase path (auto-buy) still buys tier items instead of models, and there is no migration/fallback to preserve enjoyment/memories behavior for legacy saves that only have tier counts.

---

_Verified: 2026-01-28T16:15:03Z_
_Verifier: Claude (gsd-verifier)_
