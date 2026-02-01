---
phase: 33-career-stages-and-permanent-choices
verified: 2026-02-01T03:53:31Z
status: passed
score: 6/6 must-haves verified
---

# Phase 33: Career Stages & Permanent Choices Verification Report

**Phase Goal (from** `.planning/ROADMAP.md`**):** Career has 5+ stages with persisted permanent choices and clear previews.
**Verified:** 2026-02-01T03:53:31Z
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Career progression exposes 5+ stages derived from therapist career level. | VERIFIED | `src/game/data/careerStages.ts` defines stages/unlock levels; `src/game/selectors/careerStages.ts` implements `getTherapistCareerStageId`; `tests/career-stages.unit.test.ts` asserts threshold mapping. |
| 2 | Each stage after the first offers a permanent, one-way choice (track/modality/style/focus). | VERIFIED | One-way enforcement in `src/game/actions/therapistCareer.ts` (`selectPrimaryCareerTrack`, `chooseCareerModality`, `chooseCareerOperatingStyle`, `chooseCareerExpansionFocus`); availability logic in `src/game/selectors/careerStages.ts` (`getTherapistCareerChoiceStatus`). |
| 3 | Choices have before/after previews (salary + session terms) visible in the UI. | VERIFIED | Preview computation in `src/game/selectors/careerChoicePreview.ts` (`getCareerChoicePreview`); rendering uses stable test IDs in `src/ui/components/CareerStageChoicePreview.tsx`; used in stage UI via `src/ui/tabs/career/CareerMap.tsx`. |
| 4 | Permanent choices persist in saves; older saves load; existing `activeTrackId` becomes locked `primaryTrackId`. | VERIFIED | Persisted optional fields in `src/game/model/types.ts` (`PersistedGameState.therapistCareer.*Id?`); decode path `src/game/persistence.ts` sanitizes optional fields; migration + pinning in `src/game/model/state.ts` (`createStateFromSave` migrates `activeTrackId -> primaryTrackId` and pins `activeTrackId`); unit coverage in `tests/career-permanent-choices.unit.test.ts`. |
| 5 | Cash remains career-driven; stage choices only modify therapist salary/sessions (no new cash sources). | VERIFIED | `src/game/selectors/index.ts` keeps `getTotalCashRateCentsPerSec()` == therapist cash; stage multipliers flow into salary/sessions via `src/game/selectors/therapistSalary.ts` + `src/game/selectors/therapistSessions.ts` using `getTherapistCareerEffectMultipliers` from `src/game/selectors/careerStages.ts`. |
| 6 | Automated coverage exists for thresholds, permanence, previews, and persistence across refresh. | VERIFIED | `tests/career-stages.unit.test.ts`, `tests/career-permanent-choices.unit.test.ts`, and Playwright `tests/career-permanent-choices.spec.ts` (asserts preview deltas + locked state persists after reload). |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|---------|----------|--------|---------|
| `src/game/model/types.ts` | Persisted permanence fields exist | VERIFIED | `TherapistCareerState` includes `primaryTrackId/modalityId/operatingStyleId/expansionFocusId`; persisted fields are optional in `PersistedGameState`. |
| `src/game/model/state.ts` | Defaults + migration + pinning | VERIFIED | `createInitialState()` initializes fields to `null`; `createStateFromSave()` migrates + pins. |
| `src/game/persistence.ts` | Save sanitization accepts optional fields | VERIFIED | `sanitizeState()` passes through optional therapistCareer permanence fields when present and calls `createStateFromSave(persisted)`. |
| `src/game/data/careerStages.ts` | Stage thresholds + choice definitions | VERIFIED | `CAREER_STAGES` and choice sets defined with non-1 `salaryMultiplier` values for previewability. |
| `src/game/selectors/careerStages.ts` | Stage selectors + effect multipliers | VERIFIED | `getTherapistCareerStageId`, `getTherapistCareerChoiceStatus`, `getTherapistCareerEffectMultipliers`. |
| `src/game/selectors/careerChoicePreview.ts` | Before/after preview selector exists | VERIFIED | `getCareerChoicePreview()` computes salary + session terms before/after. |
| `src/game/actions/therapistCareer.ts` | One-way actions for permanent choices | VERIFIED | Actions guard by level, id validity, and "already chosen" invariants. |
| `src/ui/tabs/career/CareerMap.tsx` | Stage UI exposes options + previews with stable test IDs | VERIFIED | Uses `testId` anchors (`career-stages-card`, `career-stage-current`, `career-choice-option-*`) and renders previews per option. |
| `tests/career-stages.unit.test.ts` | Stage threshold coverage | VERIFIED | Asserts mapping boundaries including retirement. |
| `tests/career-permanent-choices.unit.test.ts` | Permanence + migration + preview delta coverage | VERIFIED | Covers migration and one-way enforcement; asserts preview delta. |
| `tests/career-permanent-choices.spec.ts` | E2E preview + persistence across refresh | VERIFIED | Seeds save, chooses options, checks preview delta, reload persistence. |
| `src/ui/components/CareerStageChoices.tsx` | Stage card component (per plan) | ORPHANED | Exists and renders `career-stages-card`, but current stage UI appears to be implemented via `src/ui/tabs/career/CareerMap.tsx` and this component is not referenced from `src/ui/**`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/game/persistence.ts` | `src/game/model/state.ts` | `createStateFromSave(persisted)` | VERIFIED | `sanitizeState()` returns `createStateFromSave(persisted)`. |
| `src/game/model/state.ts` | `src/game/model/types.ts` | `TherapistCareerState` fields | VERIFIED | `createInitialState()` and `createStateFromSave()` set all permanence fields. |
| `src/ui/tabs/career/CareerPanel.tsx` | `src/ui/tabs/career/CareerMap.tsx` | render `<CareerMap .../>` | VERIFIED | Stage UI is mounted when `activeView === "stages"`. |
| `src/ui/tabs/career/CareerMap.tsx` | `src/game/selectors/careerChoicePreview.ts` | `getCareerChoicePreview()` | VERIFIED | Previews computed per option and rendered in-node.
| `src/game/selectors/therapistSalary.ts` | `src/game/selectors/careerStages.ts` | `getTherapistCareerEffectMultipliers()` | VERIFIED | Salary uses multipliers.
| `src/game/selectors/therapistSessions.ts` | `src/game/selectors/careerStages.ts` | `getTherapistCareerEffectMultipliers()` | VERIFIED | Session terms use multipliers.
| `tests/career-permanent-choices.spec.ts` | `src/ui/tabs/career/CareerMap.tsx` | `data-testid` anchors | VERIFIED | E2E uses `career-stages-card`, `career-choice-option-*`, and `career-choice-locked-*` ids. |

### Requirements Coverage (Phase 33)

| Requirement | Status | Blocking Issue |
|------------|--------|----------------|
| CAREER-STAGE-01 | SATISFIED | - |
| CAREER-STAGE-02 | SATISFIED | - |
| CAREER-STAGE-03 | SATISFIED | - |

### Anti-Patterns Found

No phase-blocking stub patterns found in the verified implementation paths.

Notable maintenance issue:

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/ui/components/CareerStageChoices.tsx` | 1 | Orphaned component | WARNING | Potential confusion/duplication; does not appear to be part of the live stage UI wiring. |

### Human Verification (Recommended)

1. Career stage map clarity (desktop + mobile)

**Test:** Open Career - Stages, pan/zoom the map, inspect option cards and before/after preview readability.
**Expected:** Map interactions feel usable; previews are clearly labeled and legible; locked state is obvious.
**Why human:** UX clarity and interaction feel are not fully verifiable via static checks.

## Gaps Summary

No goal-blocking gaps found. The only inconsistency is an apparently unused `CareerStageChoices` component while the actual stage UI is implemented via `CareerMap`.

---

_Verified: 2026-02-01T03:53:31Z_
_Verifier: Claude (gsd-verifier)_
