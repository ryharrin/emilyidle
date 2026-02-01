---
phase: 35-balance-and-help-clarity
verified: 2026-02-01T04:06:17Z
status: passed
score: 7/7 must-haves verified
re_verification:
  previous_status: human_needed
  previous_score: 6/7
  gaps_closed: []
  gaps_remaining: []
  regressions: []
human_verification: []
---

# Phase 35: Balance & Help Clarity Verification Report

**Phase Goal:** Pacing is smooth; help/copy explains the loop and choices.
**Verified:** 2026-02-01T04:06:17Z
**Status:** passed
**Re-verification:** Yes

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Fresh saves earn 0 cash/sec until the player explicitly starts Career (PhD enrollment), and the Career surface provides an explicit CTA to do so. | ✓ VERIFIED | `src/game/selectors/therapistSalary.ts` gates cash rate on `careerStartId`; `src/game/actions/therapistCareer.ts` provides `enterPhdProgram`; `src/ui/components/CareerNextActionCard.tsx` renders `Enter program` when `cue.id === "start-career"`; unit coverage in `tests/career-salary-window.unit.test.ts`. |
| 2 | Early-career loop is implemented: stipend before track choice, a time-limited salary window, sessions refresh that window, and spending career points extends it. | ✓ VERIFIED | Salary window + refresh/extension logic in `src/game/selectors/therapistSalary.ts` and `src/game/actions/index.ts` (`performTherapistSession` sets `salaryActiveUntilMs` from `getTherapistSalaryActiveWindowMs(state)`); pre-track session policy fallback in `src/game/selectors/therapistSessions.ts` enables session refresh before level 3 without mutating `activeTrackId`; unit coverage in `tests/career-salary-window.unit.test.ts` + `tests/therapist.unit.test.tsx`. |
| 3 | Career UI prioritizes Sessions and stage choices are not overwhelming (only the next stage choice block is shown; locked stages show a teaser). | ✓ VERIFIED | Sessions card is placed near top in `src/ui/tabs/career/CareerPanel.tsx`; next-stage-only rendering in `src/ui/components/CareerStageChoiceBlocks.tsx` via `getTherapistCareerChoiceStatus` + `nextAvailable/nextLocked`; stage gating rules in `src/game/selectors/careerStages.ts`. |
| 4 | In-context ExplainButtons exist for (a) starting career and (b) career stages, and they open the intended Help anchors. | ✓ VERIFIED | Buttons wired via `ExplainButton(sectionId=HELP_SECTION_IDS.careerStart/careerStages)` in `src/ui/components/CareerNextActionCard.tsx` and `src/ui/components/CareerStageChoices.tsx`; Playwright verifies `explain-career-start` and `explain-career-stages` in `tests/explanations.spec.ts`. |
| 5 | Help content explains the early-career loop and choices in player-facing terms (start gate, stipend, salary window, sessions vs cash/sec, stage visibility, respec). | ✓ VERIFIED | Dedicated sections + updated progression copy exist in `src/ui/help/helpContent.ts` (`HELP_SECTION_IDS.careerStart`, `HELP_SECTION_IDS.careerStages`, `HELP_SECTION_IDS.careerProgression`). |
| 6 | Shop vs Catalog surfaces are explained so players are not misled into thinking there are two purchase systems. | ✓ VERIFIED | Help clarifies Shop vs Catalog in `src/ui/help/helpContent.ts` (`catalogFirst`, `catalogShop`); in-UI copy in `src/ui/tabs/CollectionTab.tsx` near `#catalog-shop`; Catalog header copy in `src/ui/tabs/CatalogTab.tsx`; e2e anchor test in `tests/explanations.spec.ts` (`explain-catalog-shop`). |
| 7 | Career pacing feels smooth across stages (no deadlocks; stage unlocks are achievable without grind spikes). | ✓ VERIFIED | Human playtest approved (2026-02-01). |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|---------|----------|--------|---------|
| `src/ui/help/helpContent.ts` | Help sections + stable ids for deep-linking | ✓ VERIFIED | Exists; substantive (205 LOC); exported `HELP_SECTION_IDS` includes `careerStart`/`careerStages` and keeps existing ids like `careerProgression`. |
| `src/ui/help/ExplainButton.tsx` | Explain trigger opens help to section id | ✓ VERIFIED | Exists; substantive; wired through `useHelp().openHelpTo(sectionId)` and used by Career + Catalog surfaces. |
| `src/ui/components/CareerNextActionCard.tsx` | Start-career CTA + explain link | ✓ VERIFIED | Exists; substantive; imported/used by `src/ui/tabs/career/CareerPanel.tsx`. |
| `src/ui/components/CareerStageChoices.tsx` | Career stages surface + explain link | ✓ VERIFIED | Exists; substantive; imported/used by `src/ui/tabs/career/CareerPanel.tsx`. |
| `src/game/selectors/therapistSalary.ts` | Salary gating + salary window behavior | ✓ VERIFIED | Exists; substantive; re-exported/used via `src/game/selectors/index.ts` and referenced by actions for window computations. |
| `src/game/selectors/therapistSessions.ts` | Session policy + supportsSessions gating (incl. pre-track fallback) | ✓ VERIFIED | Exists; substantive; used by `src/game/actions/index.ts` (`performTherapistSession`) and `src/game/selectors/careerNextAction.ts`. |
| `tests/career-salary-window.unit.test.ts` | Regression coverage for salary window | ✓ VERIFIED | Exists; substantive; asserts cash/sec gating, expiry, refresh-by-session (pre-track), and point-based window extension. |
| `tests/therapist.unit.test.tsx` | Regression coverage for pre-track session policy | ✓ VERIFIED | Exists; substantive; asserts sessions are supported pre-track and policy terms are non-zero. |
| `tests/explanations.spec.ts` | Regression coverage for help anchors | ✓ VERIFIED | Exists; substantive; asserts help modal opens with correct active section heading for currencies, catalog shopping, career start, and career stages. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/ui/components/CareerNextActionCard.tsx` | `src/ui/help/helpContent.ts` | `ExplainButton(sectionId={HELP_SECTION_IDS.careerStart})` | ✓ WIRED | Produces `data-testid="explain-career-start"` via `ExplainButton` implementation. |
| `src/ui/components/CareerStageChoices.tsx` | `src/ui/help/helpContent.ts` | `ExplainButton(sectionId={HELP_SECTION_IDS.careerStages})` | ✓ WIRED | Produces `data-testid="explain-career-stages"` via `ExplainButton` implementation. |
| `tests/explanations.spec.ts` | Help modal | `page.getByTestId("explain-...").click()` | ✓ WIRED | Assertions confirm `data-testid="help-active-section"` updates to expected headings. |
| `src/game/selectors/index.ts` | `src/game/selectors/therapistSalary.ts` | `getTherapistCashRateCentsPerSec` re-export + use in breakdown | ✓ WIRED | `getEffectiveCashRateCentsPerSec` flows through `getTherapistCashRateWithWindowCentsPerSec` and shows up in `getCashRateBreakdown`. |
| `src/game/actions/index.ts` | `src/game/selectors/therapistSessions.ts` | `performTherapistSession -> getTherapistSessionPolicy(state)` | ✓ WIRED | `performTherapistSession` computes policy and refuses to proceed if `supportsSessions` is false; pre-track support comes from selector policy resolution. |
| `src/game/selectors/therapistSessions.ts` | `src/game/data/careerTracks.ts` | `TRACK_CHOICE_UNLOCK_LEVEL` | ✓ WIRED | Pre-track fallback only applies while `level < TRACK_CHOICE_UNLOCK_LEVEL`; at/after unlock, `activeTrackId` must be set to support sessions. |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|------------|--------|----------------|
| CAREER-CLAR-01 | ✓ SATISFIED | None found in structural verification. |
| CAREER-BAL-01 | ✓ SATISFIED | Human playtest approved (2026-02-01). |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No TODO/FIXME/placeholder stubs found in phase-critical artifacts; remaining "placeholder" strings are input/image placeholders (non-blocking). |

### Human Verification

Pacing/feel verification approved by human playtest (2026-02-01).

### Verification Evidence Notes

- This report verified existence/substance/wiring by reading code and by re-running checks.
- Automated checks re-run: `pnpm run typecheck`, `pnpm run test:unit`, `pnpm run test:e2e -- tests/explanations.spec.ts`.
- Human/UAT evidence: `.planning/phases/35-balance-and-help-clarity/35-UAT.md` (status: complete) and screenshots under `.planning/uat-artifacts/35/`.

---

_Verified: 2026-02-01T04:06:17Z_
_Verifier: Claude (gsd-verifier)_
