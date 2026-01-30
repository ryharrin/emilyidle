---
phase: 27-career-first-economy-and-upgrades-surface
verified: 2026-01-30T04:29:11Z
status: passed
score: 4/4 must-haves verified
---

# Phase 27: Career-First Economy & Upgrades Surface Verification Report

**Phase Goal:** Cash economy is career-driven; upgrades are separated and transparent.
**Verified:** 2026-01-30T04:29:11Z
**Status:** passed
**Re-verification:** No (initial verification)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Cash is earned through career progression; watch ownership does not create a parallel cash faucet. | ✓ VERIFIED | `src/game/selectors/index.ts` defines `getTotalCashRateCentsPerSec(state)` as `getTherapistCashRateCentsPerSec(state)`; `src/game/sim.ts` uses `getTotalCashRateCentsPerSec(withEvents)` without applying event multiplier. Unit test asserts watches/events do not change cash rate: `tests/career-first-economy.unit.test.ts`. |
| 2 | Therapist sessions: first session costs 0 enjoyment; subsequent sessions spend enjoyment and rule is visible before committing. | ✓ VERIFIED | Selector/UI: `src/game/selectors/index.ts` `getTherapistSessionCostLabel` returns `"Free first session"` when `freeSessionAvailable`; `src/ui/tabs/CareerTab.tsx` shows `sessionCostNote` with free-first + follow-up cost copy before the action button. Action enforcement: `src/game/actions/index.ts` `performTherapistSession` sets `cost = 0` when free and flips `freeSessionAvailable` to `false`. Reset wiring sets `freeSessionAvailable: true` in `prestigeNostalgia` and `createInitialState`: `src/game/actions/index.ts`, `src/game/model/state.ts`. |
| 3 | Upgrades are accessible from a dedicated surface/tab; Vault routes upgrade browsing to that surface. | ✓ VERIFIED | Navigation includes Upgrades tab: `src/App.tsx` `TAB_DEFINITIONS` includes `{ id: "upgrades", label: "Upgrades" }` and mounts `<UpgradesTab ... />`. Vault/Collection provides a dedicated callout that navigates to Upgrades: `src/ui/tabs/CollectionTab.tsx` renders `data-testid="upgrades-callout"` with `onNavigate("upgrades")`. |
| 4 | Upgrade cards show before/after or delta previews for cash/enjoyment impact. | ✓ VERIFIED | `src/ui/tabs/UpgradesTab.tsx` computes `preview = buildRatePreview(state, buy*(state,...))`, renders delta chips (`renderDeltaChips`) and explicit Before/After values in `Rate preview` details for cash + enjoyment, across cash/workshop/maison groups. Playwright asserts preview shows Before/After: `tests/career-upgrades.spec.ts`. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/game/selectors/index.ts` | Career-only cash rate + session cost labeling | ✓ VERIFIED | `getTotalCashRateCentsPerSec` returns therapist salary only; `getTherapistSessionCostLabel` + `canPerformTherapistSession` enforce free-first semantics. |
| `src/game/sim.ts` | Tick loop uses career cash rate; events affect enjoyment only | ✓ VERIFIED | Cash income uses `getTotalCashRateCentsPerSec(withEvents)`; enjoyment uses `eventMultiplier`. |
| `src/game/actions/index.ts` | Session action spends 0 enjoyment for first session and toggles flag | ✓ VERIFIED | `performTherapistSession` uses `isFreeSession` to set `cost = 0` then clears `freeSessionAvailable`. |
| `src/game/model/state.ts` | Fresh state + save load default includes `freeSessionAvailable: true` | ✓ VERIFIED | `createInitialState()` sets `freeSessionAvailable: true`; `createStateFromSave()` defaults to true when missing. |
| `src/App.tsx` | Dedicated Upgrades tab exists and is mounted | ✓ VERIFIED | `TAB_DEFINITIONS` includes `upgrades`; renders `<UpgradesTab ... />`. |
| `src/ui/tabs/CollectionTab.tsx` | Vault routes upgrades browsing to Upgrades surface | ✓ VERIFIED | Renders `data-testid="upgrades-callout"` with CTA `onNavigate("upgrades")`. |
| `src/ui/tabs/UpgradesTab.tsx` | Upgrade cards include preview deltas and before/after | ✓ VERIFIED | Uses `buyUpgrade`/`buyWorkshopUpgrade`/`buyMaisonUpgrade` for pure preview; renders delta chips + `Rate preview` details. |
| `src/ui/tabs/CareerTab.tsx` | Session cost rule visible before committing | ✓ VERIFIED | Displays `sessionCostNote` and `Session cost` label before `Run session` button. |
| `tests/career-first-economy.unit.test.ts` | Regression coverage for career-only cash + free-first sessions | ✓ VERIFIED | Asserts cash rate unchanged by watches/events; asserts first session costs 0 enjoyment and cooldown blocks. |
| `tests/career-upgrades.spec.ts` | E2E confirms Career/Upgrades surfaces + preview markers | ✓ VERIFIED | Navigates tabs and expands `Rate preview` to assert `Before`/`After` render. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/game/sim.ts` | `src/game/selectors/index.ts` | `getTotalCashRateCentsPerSec(withEvents)` | ✓ WIRED | Cash tick path depends on career-only selector output. |
| `src/ui/tabs/CareerTab.tsx` | `src/game/selectors/index.ts` | `getTherapistSessionCostLabel` + `getTherapistSessionPolicy` | ✓ WIRED | UI renders the rule/cost before action. |
| `src/ui/tabs/CareerTab.tsx` | `src/game/actions/index.ts` | `performTherapistSession(state, Date.now())` | ✓ WIRED | Button triggers the action; action enforces free-first cost. |
| `src/ui/tabs/UpgradesTab.tsx` | `src/game/actions/index.ts` | `buy*` actions for preview + purchase | ✓ WIRED | Preview uses `nextState = buy*(state, ...)` and compares rates before purchase. |
| `src/ui/tabs/CollectionTab.tsx` | `src/App.tsx` | `onNavigate("upgrades")` | ✓ WIRED | Vault CTA routes users to the dedicated Upgrades surface. |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
| --- | --- | --- |
| ECON-01 | ✓ SATISFIED | - |
| ECON-02 | ✓ SATISFIED | - |
| CAREER-02 | ✓ SATISFIED | - |
| NAV-01 | ✓ SATISFIED | - |
| CLAR-05 | ✓ SATISFIED | - |

### Anti-Patterns Found

None detected in the core Phase 27 artifacts (no TODO/FIXME/placeholder/not implemented/return-null patterns found in the checked files).

### Notes on Human Evidence

UAT is marked complete with 6/6 passing checks in `.planning/phases/27-career-first-economy-and-upgrades-surface/27-UAT.md`, including coverage for Career/Upgrades navigation, session rule visibility, Vault routing, and upgrade preview deltas.

---

_Verified: 2026-01-30T04:29:11Z_
_Verifier: Claude (gsd-verifier)_
