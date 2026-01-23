---
phase: 15-dual-currency-acquisition
verified: 2026-01-23T14:14:13Z
status: passed
score: 10/10 must-haves verified
---

# Phase 15: Dual-Currency Acquisition Verification Report

**Phase Goal:** Gate watch purchases by enjoyment while spending career-earned money.
**Verified:** 2026-01-23T14:14:13Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | A watch purchase is allowed only when cash >= cash price and enjoyment >= enjoyment requirement | ✓ VERIFIED | `src/game/state.ts` exports `getWatchPurchaseGate()` and `buyItem()` early-returns unless `gate.ok` (`src/game/state.ts:1860`, `src/game/state.ts:1940`) |
| 2 | Enjoyment is never spent by buying watches | ✓ VERIFIED | `buyItem()` subtracts only `currencyCents` and does not modify `enjoymentCents` (`src/game/state.ts:1945`) |
| 3 | When both cash and enjoyment are insufficient, the computed purchase block reason prioritizes enjoyment | ✓ VERIFIED | `blocksBy: lacksEnjoyment ? "enjoyment" : "cash"` (`src/game/state.ts:1880`) |
| 4 | Auto-buy cannot buy watches that are enjoyment-locked | ✓ VERIFIED | Auto-buy loop uses `getMaxAffordableItemCount()` and `buyItem()`; `getMaxAffordableItemCount()` returns `0` when `blocksBy === "enjoyment"` (`src/App.tsx:911`, `src/game/state.ts:1906`) |
| 5 | Vault watch purchase buttons are disabled when enjoyment-gated or cash-gated | ✓ VERIFIED | Button `disabled={!unlocked || !singleGate.ok}` and bulk `disabled={!unlocked || bulkQty <= 1 || !bulkGate.ok}` (`src/App.tsx:1265`) |
| 6 | Cash price is always visible; enjoyment requirement appears only when it blocks purchase | ✓ VERIFIED | Buy buttons always render cash via `formatMoneyFromCents(singleGate.cashPriceCents)`; enjoyment message only renders on `blocksBy === "enjoyment"` (`src/App.tsx:1270`, `src/App.tsx:1280`) |
| 7 | When both cash and enjoyment are insufficient, the UI shows only the enjoyment lock messaging | ✓ VERIFIED | UI condition is `singleGate.blocksBy === "enjoyment"`; gate prioritizes enjoyment (Truth 3), so cash-lock messaging is not shown in the combined-failure case (`src/App.tsx:1280`, `src/game/state.ts:1880`) |
| 8 | Enjoyment drops can re-lock purchases without a page refresh | ✓ VERIFIED | Vault cards compute `singleGate` from current `state` each render; any state update (including `enjoymentCents`) re-renders and re-evaluates `singleGate.ok` (`src/App.tsx:1220`) |
| 9 | Unit tests cover the dual-gate purchase rules (enjoyment threshold, cash spend only, enjoyment-priority blocking) | ✓ VERIFIED | `tests/dual-currency.unit.test.tsx` asserts `blocksBy === "enjoyment"`, ok when both met, cash-only spending in `buyItem`, and `getMaxAffordableItemCount === 0` when enjoyment-locked |
| 10 | E2E test asserts enjoyment gating disables a watch purchase even when cash is sufficient | ✓ VERIFIED | `tests/collection-loop.spec.ts` seeds `currencyCents: 1_000_000` and asserts classic buy button disabled + `purchase-gate-classic` visible (`tests/collection-loop.spec.ts:108`) |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/game/state.ts` | Cash purchase curve + enjoyment gate for watch purchases | ✓ VERIFIED | Has `WatchPurchaseGate`, `WATCH_ENJOYMENT_REQUIREMENTS_CENTS`, `getWatchPurchaseGate()`, and gates `canBuyItem()` / `buyItem()` / `getMaxAffordableItemCount()` |
| `src/App.tsx` | Vault UI renders dual-currency purchase gating; auto-buy uses shared helpers | ✓ VERIFIED | Vault cards call `getWatchPurchaseGate(state, item.id, ...)`, render `data-testid={\`purchase-gate-${item.id}\`}`, and auto-buy uses `getMaxAffordableItemCount()` + `buyItem()` |
| `src/style.css` | Lock icon + blocked styling for enjoyment-gated purchases | ✓ VERIFIED | Includes `.purchase-locked` and `.purchase-lock-icon` styling (`src/style.css:250`) |
| `tests/dual-currency.unit.test.tsx` | Unit coverage for gate semantics and buy-item invariants | ✓ VERIFIED | `describe("dual-currency acquisition", ...)` with 4 focused assertions |
| `tests/collection-loop.spec.ts` | E2E coverage for enjoyment-gated buy button + inline reason | ✓ VERIFIED | Asserts `purchase-gate-classic` visible and buy button disabled |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/game/state.ts` | `buyItem()` | Shared `getWatchPurchaseGate()` helper | ✓ WIRED | `buyItem()` calls `getWatchPurchaseGate()` and returns unchanged when `!gate.ok` (`src/game/state.ts:1940`) |
| `src/game/state.ts` | `getMaxAffordableItemCount()` | Returns 0 when enjoyment insufficient | ✓ WIRED | `getMaxAffordableItemCount()` checks `gate.blocksBy === "enjoyment"` and returns 0 (`src/game/state.ts:1911`) |
| `src/App.tsx` | `src/game/state.ts` | Vault UI uses `getWatchPurchaseGate()` | ✓ WIRED | `singleGate`/`bulkGate` computed per item and used for `disabled` + message rendering (`src/App.tsx:1226`) |
| `src/App.tsx` | `buyItem()` / `getMaxAffordableItemCount()` | Auto-buy tick loop | ✓ WIRED | Auto-buy loop chooses qty via `getMaxAffordableItemCount()` and purchases via `buyItem()` (`src/App.tsx:921`) |
| `tests/collection-loop.spec.ts` | `src/App.tsx` | `data-testid="purchase-gate-*"` | ✓ WIRED | Test checks `page.getByTestId("purchase-gate-classic")`; App renders matching test id (`src/App.tsx:1281`) |

### Requirements Coverage

`/.planning/REQUIREMENTS.md` not present in this repo; coverage cannot be mapped.

### Anti-Patterns Found

No Phase-15-blocking stub patterns found in the key artifacts. Notable non-blocking matches:

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `src/App.tsx` | multiple | `placeholder=...` (input placeholders) | ℹ️ Info | Normal UI input attributes, not stubs |
| `src/game/state.ts` | 787, 950 | `return []` | ℹ️ Info | Normal empty-list cases, not purchase gating stubs |

### Optional Human Verification

1. Dual-gate purchase UX

**Test:** In Vault, set cash high and enjoyment low (or spend enjoyment via Career), then try buying Classic.
**Expected:** Buy button disabled; inline lock badge visible; cash price still shown on button.
**Why human:** Confirms runtime state changes and visual clarity.

2. Enjoyment vs cash messaging priority

**Test:** Make both cash and enjoyment insufficient for a gated watch.
**Expected:** Only enjoyment lock badge shows (no separate cash lock messaging).
**Why human:** Confirms combined-failure presentation and copy feels correct.

## Gaps Summary

No gaps found. Core purchase gating is centralized in `getWatchPurchaseGate()` and enforced by both manual purchase and auto-buy, with Vault UI reflecting the gate and tests asserting the critical invariants.

---

_Verified: 2026-01-23T14:14:13Z_
_Verifier: Claude (gsd-verifier)_
