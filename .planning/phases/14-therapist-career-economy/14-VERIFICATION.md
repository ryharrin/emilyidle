---
phase: 14-therapist-career-economy
verified: 2026-01-23T03:41:48Z
status: passed
score: 5/5 must-haves verified
---

# Phase 14: Therapist Career Economy Verification Report

**Phase Goal:** Add therapist career progression to generate money alongside enjoyment.
**Verified:** 2026-01-23T03:41:48Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Therapist career progression state exists (level, XP, cooldown) | ✓ VERIFIED | `src/game/state.ts:155` defines `TherapistCareerState`; `src/game/state.ts:957` seeds defaults in `createInitialState()`; `src/game/state.ts:989` restores defaults via `createStateFromSave()` |
| 2 | Money generation includes therapist passive salary, alongside enjoyment tick | ✓ VERIFIED | `src/game/state.ts:1610` implements `getTherapistCashRateCentsPerSec()` and `getTotalCashRateCentsPerSec()`; `src/game/sim.ts:17` uses `getTotalCashRateCentsPerSec()` for `currencyCents` and `getEnjoymentRateCentsPerSec()` for `enjoymentCents` |
| 3 | Player can run therapist sessions that spend enjoyment to award cash + XP and enforce cooldown | ✓ VERIFIED | `src/game/state.ts:1739` implements `canPerformTherapistSession()`; `src/game/state.ts:1749` implements `performTherapistSession()` (deducts enjoyment, adds cash, adds XP, updates `nextAvailableAtMs`) |
| 4 | Therapist career state persists through save/load and is backward compatible | ✓ VERIFIED | `src/game/persistence.ts:30` sanitizes `therapistCareer` fields and passes into `createStateFromSave()`; `tests/therapist.unit.test.tsx:81` covers round-trip + missing-field defaults |
| 5 | Career UI exposes therapist career and is progress-gated (fresh save tab list unchanged) | ✓ VERIFIED | `src/App.tsx:647` gates `career` tab on `unlockedMilestones.includes("collector-shelf")`; `src/App.tsx:1508` renders Career tabpanel with `data-testid` anchors and wired action; `tests/catalog.unit.test.tsx:19` asserts Career hidden on fresh save; `tests/catalog.unit.test.tsx:96` asserts Career visible with seeded progress |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/game/state.ts` | Therapist career state, selectors, session action | ✓ VERIFIED | Substantive implementation (2k+ LOC); exports career selectors + actions; no stub patterns found in therapist-related functions |
| `src/game/sim.ts` | Simulation composes vault cash + therapist cash | ✓ VERIFIED | Uses `getTotalCashRateCentsPerSec()` to compute `earnedCents`; still adds enjoyment separately |
| `src/game/persistence.ts` | Save/load sanitizes therapist career fields | ✓ VERIFIED | Sanitizes nested `therapistCareer` fields and defaults via `createStateFromSave()`; save version unchanged (`CURRENT_SAVE_VERSION = 2`) |
| `src/App.tsx` | Career tab UI, gating, action wiring, cash/sec display alignment | ✓ VERIFIED | Career tab gated via milestone; session button calls `performTherapistSession(...)` through existing `handlePurchase(...)`; cash/sec display uses `getTotalCashRateCentsPerSec(...)` |
| `tests/therapist.unit.test.tsx` | Unit coverage for session, salary, leveling, persistence | ✓ VERIFIED | Covers session rewards + cooldown, leveling threshold, salary included in `step(...)`, persistence round-trips |
| `tests/catalog.unit.test.tsx` | Unit coverage for Career tab gating + anchors | ✓ VERIFIED | Asserts Career hidden on fresh save and visible when seeded to unlock milestone; checks `career-panel`, `career-status`, `career-action` |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/game/sim.ts` | `src/game/state.ts` | `getTotalCashRateCentsPerSec(...)` | WIRED | `step(...)` uses `getTotalCashRateCentsPerSec(withEvents, eventMultiplier)` for currency accrual (`src/game/sim.ts:17`) |
| `src/App.tsx` | `src/game/state.ts` | `getTotalCashRateCentsPerSec(...)` | WIRED | Stats calculation uses the same total cash rate selector that sim uses (`src/App.tsx:581`) |
| `src/App.tsx` | `src/game/state.ts` | `performTherapistSession(...)` in click handler | WIRED | Career action button calls `handlePurchase(performTherapistSession(state, Date.now()))` (`src/App.tsx:1580`) |
| Career unlock | Milestones engine | `unlockedMilestones.includes("collector-shelf")` | WIRED | Milestone exists and is awarded based on `totalItems >= 5` (`src/game/state.ts:448`); UI checks `unlockedMilestones` (`src/App.tsx:647`) |

### Requirements Coverage

No `.planning/REQUIREMENTS.md` found; requirement-level coverage not applicable.

### Anti-Patterns Found

No blocker stub patterns found in phase-touched artifacts.
Non-blocking note: `placeholder="..."` strings in `src/App.tsx` are normal input placeholders (not stubs).

### Human Verification Suggested

1. Career unlock and session loop
   - Test: start fresh, buy 5 starter watches (unlock `collector-shelf`), confirm Career tab appears; run a session.
   - Expected: session spends enjoyment, grants cash, updates XP/level, and disables button during cooldown.
   - Why human: UI flow timing and clarity are not fully provable via static checks.

## Gaps Summary

No structural gaps detected. Therapist career is implemented with state, deterministic simulation wiring, persistence handling, and UI exposure with unit coverage.

_Verified: 2026-01-23T03:41:48Z_
_Verifier: Claude (gsd-verifier)_
