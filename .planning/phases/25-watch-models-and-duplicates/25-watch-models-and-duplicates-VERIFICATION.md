---
phase: 25-watch-models-and-duplicates
verified: 2026-01-28T17:31:07Z
status: passed
score: 6/6 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 4/6
  gaps_closed:
    - "All watch purchasing paths buy specific models (no tier-only purchases)"
    - "Legacy saves with tier-only ownership preserve enjoyment/memories behavior (or are migrated to model ownership)"
  gaps_remaining: []
  regressions: []
---

# Phase 25: Watch Models & Duplicates Verification Report

**Phase Goal:** Watches are specific models and duplicates have diminishing returns.
**Verified:** 2026-01-28T17:31:07Z
**Status:** passed
**Re-verification:** Yes - after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | User sees specific watch models (brand/model) as purchasable items (not generic tiers) | VERIFIED | `src/ui/tabs/CollectionTab.tsx:152` uses `getWatchModels()` and renders brand-grouped model cards |
| 2 | Buying a watch increments owned count for that specific model | VERIFIED | `src/game/actions/index.ts:480` `buyWatchModel()` increments `watchModels[modelId]`; `src/ui/tabs/CollectionTab.tsx:561` buy button calls `buyWatchModel(state, model.id)` |
| 3 | Duplicate reward multiplier is visible to the player and never drops below 0.10x | VERIFIED | `src/game/selectors/duplicates.ts:1` sets `DUPLICATE_REWARD_FLOOR = 0.1`; `src/ui/tabs/CollectionTab.tsx:528` displays `Duplicate: {multiplier}x rewards` |
| 4 | Buying duplicate copies yields reduced enjoyment + memories contributions vs the first copy | VERIFIED | `src/game/selectors/enjoyment.ts:32` and `src/game/model/state.ts:319` apply `getDuplicateRewardSum(owned)`; `tests/enjoyment.unit.test.tsx:121` asserts second-copy delta is smaller |
| 5 | All watch purchasing paths buy specific models (no tier-only purchases) | VERIFIED | Auto-buy purchases models via `buyWatchModel(...)` in `src/App.tsx:925`; no UI call sites reference tier `buyItem(...)` (only the function definition remains in `src/game/actions/index.ts:457`) |
| 6 | Legacy saves with tier-only ownership preserve enjoyment/memories behavior (or are migrated to model ownership) | VERIFIED | `src/game/model/state.ts:410` migrates tier counts into `watchModels` when missing/empty; `tests/enjoyment.unit.test.tsx:71` asserts non-zero enjoyment + memories after load |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/game/data/watchModels.ts` | Deterministic roster derived from catalog entries | VERIFIED | `WATCH_MODELS` is built from `CATALOG_ENTRIES` with stable ids and per-brand reference numbers |
| `src/game/model/types.ts` | State schema includes model ownership | VERIFIED | `GameState.watchModels` and `PersistedGameState.watchModels?` present (`src/game/model/types.ts:184`, `src/game/model/types.ts:213`) |
| `src/game/selectors/duplicates.ts` | Duplicate curve helpers with 0.10 floor | VERIFIED | Floor constant + decay curve + sum helper (`src/game/selectors/duplicates.ts`) |
| `src/game/selectors/watchModels.ts` | Model purchase gating and next-multiplier selector | VERIFIED | `getWatchModelPurchaseGate()` and `getNextDuplicateRewardMultiplier()` present (`src/game/selectors/watchModels.ts`) |
| `src/game/selectors/enjoyment.ts` | Enjoyment rate derives from model ownership + duplicates | VERIFIED | Sums per-model contributions from `state.watchModels` (`src/game/selectors/enjoyment.ts:32`) |
| `src/game/model/state.ts` | Memories/collection value derives from model ownership + duplicates + legacy migration | VERIFIED | `getCollectionValueCents()` uses `watchModels`; `createStateFromSave()` migrates tier-only saves (`src/game/model/state.ts`) |
| `src/ui/tabs/CollectionTab.tsx` | Vault purchase UI is model-based and shows duplicate multiplier | VERIFIED | Brand-grouped list; per-model buy CTA; duplicate multiplier shown (`src/ui/tabs/CollectionTab.tsx`) |
| `src/App.tsx` | Auto-buy purchase path aligns with model purchasing | VERIFIED | Auto-buy loop selects a default model per tier and calls `buyWatchModel` (`src/App.tsx:925`) |
| `tests/duplicate-rewards.unit.test.ts` | Duplicate curve unit coverage | VERIFIED | Asserts monotonic + floor and expected second-copy (~0.70x) |
| `tests/enjoyment.unit.test.tsx` | Duplicate diminishing returns + legacy-save migration coverage | VERIFIED | Includes migration test and duplicate delta test |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/game/data/watchModels.ts` | `src/game/catalog.ts` | `CATALOG_ENTRIES` mapping | WIRED | Model ids come from catalog entry ids (`src/game/data/watchModels.ts:38`) |
| `src/ui/tabs/CollectionTab.tsx` | `src/game/actions/index.ts` | `buyWatchModel()` | WIRED | UI buy button calls `buyWatchModel` (`src/ui/tabs/CollectionTab.tsx:561`) |
| `src/game/actions/index.ts` | `src/game/model/types.ts` | `watchModels` ownership | WIRED | `buyWatchModel` mutates `watchModels` and keeps tier totals in `items` in sync (`src/game/actions/index.ts:491`) |
| `src/game/selectors/enjoyment.ts` | `src/game/selectors/duplicates.ts` | `getDuplicateRewardSum()` | WIRED | Duplicate scaling applied per owned count (`src/game/selectors/enjoyment.ts:53`) |
| `src/game/model/state.ts` | `src/game/selectors/duplicates.ts` | `getDuplicateRewardSum()` | WIRED | Same duplicate curve applied to Memories (`src/game/model/state.ts:340`) |
| `src/App.tsx` | `src/game/actions/index.ts` | auto-buy purchasing | WIRED | Auto-buy calls `buyWatchModel` and stops when gates fail (`src/App.tsx:924`) |
| `src/game/model/state.ts` | `src/game/data/watchModels.ts` | legacy migration | WIRED | Migration chooses deterministic default models per tier from `WATCH_MODELS` (`src/game/model/state.ts:458`) |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
| --- | --- | --- |
| WATCH-01 | SATISFIED | - |
| WATCH-02 | SATISFIED | - |

### Anti-Patterns Found

No blocker stub patterns found in core Phase 25 artifacts.

### Human Verification Recommended

1. Vault duplicate messaging clarity

**Test:** In Vault, buy the same model twice; watch the "Owned" count, "Duplicate: X.XXx" label, and top-line "Enjoyment / sec" and "Memories".
**Expected:** Second purchase increases enjoyment/memories less than the first; duplicate label decreases; purchase highlight triggers and clears.

2. Legacy save migration feel

**Test:** Import an old save that predates `watchModels` (tier-only `items` counts) and confirm vault enjoyment/memories are non-zero immediately.
**Expected:** Enjoyment/sec and Memories remain consistent (no sudden drop to zero) and Vault shows ownership reflected on at least one model per owned tier.

---

_Verified: 2026-01-28T17:31:07Z_
_Verifier: Claude (gsd-verifier)_
