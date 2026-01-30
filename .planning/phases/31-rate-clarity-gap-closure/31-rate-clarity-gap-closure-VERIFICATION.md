---
phase: 31-rate-clarity-gap-closure
verified: 2026-01-30T16:08:24Z
status: passed
score: 4/4 must-haves verified
---

# Phase 31: Rate Clarity Gap Closure Verification Report

**Phase Goal:** Rates and rate previews match actual accrual; upgrades no longer claim cash multipliers and instead affect non-cash progression.
**Verified:** 2026-01-30T16:08:24Z
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| - | ----- | ------ | -------- |
| 1 | Events apply consistently to dollars/sec and enjoyment/sec, and sim accrual matches the displayed effective rates. |  VERIFIED | `src/game/sim.ts` uses `getEventIncomeMultiplier()` then applies it to both cash (`getEffectiveCashRateCentsPerSec`) and enjoyment (`getEnjoymentRateCentsPerSec * eventMultiplier`). `src/App.tsx` computes header stats the same way; `src/ui/tabs/StatsTab.tsx` uses `getCashRateBreakdown(state, currentEventMultiplier)` and `getEnjoymentRateBreakdown(state, currentEventMultiplier)`. |
| 2 | Upgrades do not claim to increase dollars/sec; cash remains career-salary driven. |  VERIFIED | `src/game/selectors/index.ts` keeps `getTotalCashRateCentsPerSec()` career-only and defines `getEffectiveCashRateCentsPerSec(state, eventMultiplier)` as salary * event multiplier. `src/ui/tabs/UpgradesTab.tsx` describes upgrade effects as enjoyment; the preview still shows cash rates but does not claim upgrades increase them. |
| 3 | Buying an upgrade produces a measurable enjoyment/sec change and the preview reflects the delta (including events). |  VERIFIED | `src/game/selectors/enjoyment.ts` applies upgrade/workshop/maison/set/catalog/crafted/ability multipliers to enjoyment rate. `src/ui/tabs/UpgradesTab.tsx` computes preview by applying `eventMultiplier` to both before/after rates; `tests/upgrades-preview.unit.test.tsx` asserts an Enjoyment delta chip exists and before/after enjoyment rates differ. |
| 4 | Tests exist covering sim cash accrual under events and sim enjoyment accrual under upgrades/events. |  VERIFIED | `tests/therapist.unit.test.tsx` includes: (a) event-multiplied cash accrual delta check, (b) enjoyment accrual under events with an upgrade, both using `step()` and a rounding-tolerant assertion. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/game/sim.ts` | Sim accrual uses event-aware cash + enjoyment rates |  VERIFIED | Uses `applyEventState(...)`, `getEventIncomeMultiplier(...)`, `getEffectiveCashRateCentsPerSec(...)`, and `getEnjoymentRateCentsPerSec(...) * eventMultiplier` before applying dt. |
| `src/game/selectors/index.ts` | Cash remains salary-driven; effective cash rate + breakdown accept event multiplier |  VERIFIED | `getTotalCashRateCentsPerSec()` returns `getTherapistCashRateCentsPerSec()` only; `getCashRateBreakdown(state, eventMultiplier)` returns total via `getEffectiveCashRateCentsPerSec(state, eventMultiplier)` and includes an explicit `event` multiplier term. |
| `src/game/selectors/enjoyment.ts` | Enjoyment/sec reflects upgrade-driven multipliers |  VERIFIED | Multiplies base enjoyment by composed multipliers (upgrade/workshop/maison/set/catalog/crafted/ability) plus legacy + worn watch multipliers. |
| `src/game/selectors/incomeMultipliers.ts` | Shared multiplier helpers used by selectors |  VERIFIED | Exports multiplier composition helpers used by `getEnjoymentRateCentsPerSec` and `getEnjoymentRateBreakdown`. |
| `src/App.tsx` | Header rates match sim formulas under events |  VERIFIED | Computes `eventMultiplier` and applies it to cash via `getEffectiveCashRateCentsPerSec(state, eventMultiplier)` and to enjoyment via `getEnjoymentRateCentsPerSec(state) * eventMultiplier`. |
| `src/ui/tabs/StatsTab.tsx` | Stats breakdown uses the same event-adjusted totals |  VERIFIED | Calls `getCashRateBreakdown(state, currentEventMultiplier)` and shows the event term when multiplier != 1. |
| `src/ui/tabs/UpgradesTab.tsx` | Upgrade previews are event-truthful and enjoyment-focused |  VERIFIED | `buildRatePreview()` uses `getEffectiveCashRateCentsPerSec(..., eventMultiplier)` and `getEnjoymentRateCentsPerSec(...) * eventMultiplier`; deltas are computed from those numbers. |
| `tests/therapist.unit.test.tsx` | Sim-level tests lock event->cash and upgrade->enjoyment under events |  VERIFIED | Uses `step()` deltas with `applyEventState` + `getEventIncomeMultiplier`; asserts within +/- 1 cent tolerance. |
| `tests/upgrades-preview.unit.test.tsx` | UI test locks preview delta behavior and no cash delta for upgrades |  VERIFIED | Asserts `Enjoyment +` is present and `Cash +` is absent; asserts before/after Enjoyment lines differ. |
| `tests/career-first-economy.unit.test.ts` | Cash stays career-only even with watches/events |  VERIFIED | Asserts total cash rate unchanged by watches; effective rate includes event multiplier; breakdown matches effective. |
| `tests/rate-breakdowns.unit.test.ts` | Breakdown totals match selectors and include event term |  VERIFIED | Asserts cash breakdown includes `event` term and total matches `getEffectiveCashRateCentsPerSec`. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `src/game/sim.ts` | `src/game/selectors/index.ts` | `getEffectiveCashRateCentsPerSec(withEvents, eventMultiplier)` |  WIRED | Cash accrual uses the shared helper and the same `eventMultiplier` computed from `withEvents`. |
| `src/game/sim.ts` | `src/game/selectors/enjoyment.ts` | `getEnjoymentRateCentsPerSec(withEvents) * eventMultiplier` |  WIRED | Enjoyment accrual uses selector rate and applies `eventMultiplier` before dt. |
| `src/App.tsx` | `src/game/selectors/index.ts` | header stats: `getEffectiveCashRateCentsPerSec(state, eventMultiplier)` |  WIRED | Header dollars/sec is event-adjusted and matches sim formula.
| `src/ui/tabs/StatsTab.tsx` | `src/game/selectors/index.ts` | `getCashRateBreakdown(state, currentEventMultiplier)` |  WIRED | Breakdown total is effective cash rate and event term is rendered when active.
| `src/ui/tabs/UpgradesTab.tsx` | `src/game/actions/index.ts` | `buyUpgrade` / `buyWorkshopUpgrade` / `buyMaisonUpgrade` |  WIRED | Preview and purchase paths both flow through the real buy actions; preview uses the resulting `nextState`.
| `tests/therapist.unit.test.tsx` | `src/game/sim.ts` | `step()` |  WIRED | Tests validate sim deltas vs selector-derived expectations under events/upgrades.
| `tests/upgrades-preview.unit.test.tsx` | `src/ui/tabs/UpgradesTab.tsx` | React render + assertions |  WIRED | Validates the preview UI renders a non-zero enjoyment delta and no cash delta.

### Requirements Coverage

| Requirement | Status | Blocking Issue |
| ----------- | ------ | -------------- |
| WATCH-03 traceability de-duplication |  SATISFIED | `.planning/REQUIREMENTS.md` contains a single `WATCH-03` row (Complete). |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `src/game/model/state.ts` | 139 | Copy mentions "cash flow" for a catalog tier bonus |  Warning | Catalog tier bonuses are applied as enjoyment multipliers in selectors; this copy may confuse players about what actually changes. |
| `src/game/model/state.ts` | 153 | Copy mentions "cash lift" for a catalog tier bonus |  Warning | Same mismatch risk as above. |

### Human Verification Suggested

1. **Event rate parity**

**Test:** Trigger an event (e.g. auction-weekend), then compare header Dollars/sec, Stats Dollars/sec breakdown total, and observed cash growth over ~10s.
**Expected:** Header and Stats show the same event-adjusted dollars/sec, and cash increases at roughly that rate.
**Why human:** Confirms live UI timing matches runtime tick behavior.

2. **Upgrade preview parity**

**Test:** With at least one owned watch model and enough cash, view an upgrade card and compare its "Rate preview" enjoyment before/after with the actual enjoyment/sec after purchase.
**Expected:** Enjoyment preview delta matches the post-purchase enjoyment/sec; no cash delta chip appears.
**Why human:** Confirms the end-to-end feel and avoids surprises from UI formatting/rounding.

---

_Verified: 2026-01-30T16:08:24Z_
_Verifier: Claude (gsd-verifier)_
