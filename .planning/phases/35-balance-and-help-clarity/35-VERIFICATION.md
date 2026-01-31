---
phase: 35-balance-and-help-clarity
verified: 2026-01-31T05:55:23Z
status: human_needed
score: 6/7 must-haves verified
human_verification:
  - test: "Early-career pacing feels smooth"
    expected: "From a fresh save, progression to track choice and the next stage unlocks without deadlocks or grind spikes; the salary window/session loop feels understandable and motivating."
    why_human: "Pacing 'feel' and grind spikes depend on play experience, not just code wiring."
---

# Phase 35: Balance & Help Clarity Verification Report

**Phase Goal:** Pacing is smooth; help/copy explains the loop and choices.
**Verified:** 2026-01-31T05:55:23Z
**Status:** human_needed
**Re-verification:** No (initial verification)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Fresh saves earn 0 cash/sec until the player explicitly starts Career (PhD enrollment), and the Career surface provides an explicit CTA to do so. | ✓ VERIFIED | `src/game/selectors/therapistSalary.ts` gates cash rate on `careerStartId`; `src/game/actions/therapistCareer.ts` provides `enterPhdProgram`; `src/ui/components/CareerNextActionCard.tsx` renders `Enter program` when `cue.id === "start-career"`; unit coverage in `tests/career-salary-window.unit.test.ts`. |
| 2 | Early-career loop is implemented: stipend before track choice, a time-limited salary window, sessions refresh that window, and spending career points extends it. | ✓ VERIFIED | Salary window + refresh/extension logic in `src/game/selectors/therapistSalary.ts`, `src/game/actions/index.ts` (`performTherapistSession`), and `src/game/actions/therapistCareer.ts` (`spendCareerNode`/`respecCareerNodes`); unit coverage in `tests/career-salary-window.unit.test.ts`. |
| 3 | Career UI prioritizes Sessions and stage choices are not overwhelming (only the next stage choice block is shown; locked stages show a teaser). | ✓ VERIFIED | Sessions card is placed near top in `src/ui/tabs/career/CareerPanel.tsx`; next-stage-only rendering in `src/ui/components/CareerStageChoiceBlocks.tsx` via `getTherapistCareerChoiceStatus` + `nextAvailable/nextLocked`; stage gating rules in `src/game/selectors/careerStages.ts`. |
| 4 | In-context ExplainButtons exist for (a) starting career and (b) career stages, and they open the intended Help anchors. | ✓ VERIFIED | Buttons wired via `ExplainButton(sectionId=HELP_SECTION_IDS.careerStart/careerStages)` in `src/ui/components/CareerNextActionCard.tsx` and `src/ui/components/CareerStageChoices.tsx`; Playwright verifies `explain-career-start` and `explain-career-stages` in `tests/explanations.spec.ts`. |
| 5 | Help content explains the early-career loop and choices in player-facing terms (start gate, stipend, salary window, sessions vs cash/sec, stage visibility, respec). | ✓ VERIFIED | Dedicated sections + updated progression copy exist in `src/ui/help/helpContent.ts` (`HELP_SECTION_IDS.careerStart`, `HELP_SECTION_IDS.careerStages`, `HELP_SECTION_IDS.careerProgression`). |
| 6 | Shop vs Catalog surfaces are explained so players are not misled into thinking there are two purchase systems. | ✓ VERIFIED | Help clarifies Shop vs Catalog in `src/ui/help/helpContent.ts` (`catalogFirst`, `catalogShop`); in-UI copy in `src/ui/tabs/CollectionTab.tsx` near `#catalog-shop`; Catalog header copy in `src/ui/tabs/CatalogTab.tsx`; e2e anchor test in `tests/explanations.spec.ts` (`explain-catalog-shop`). |
| 7 | Career pacing feels smooth across stages (no deadlocks; stage unlocks are achievable without grind spikes). | ? UNCERTAIN | Requires playtesting; cannot be verified structurally. |

**Score:** 6/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|---------|----------|--------|---------|
| `src/ui/help/helpContent.ts` | Help sections + stable ids for deep-linking | ✓ VERIFIED | Exists; substantive (205 LOC); exported `HELP_SECTION_IDS` includes `careerStart`/`careerStages` and keeps existing ids like `careerProgression`. |
| `src/ui/help/ExplainButton.tsx` | Explain trigger opens help to section id | ✓ VERIFIED | Exists; substantive; wired through `useHelp().openHelpTo(sectionId)` and used by Career + Catalog surfaces. |
| `src/ui/components/CareerNextActionCard.tsx` | Start-career CTA + explain link | ✓ VERIFIED | Exists; substantive; imported/used by `src/ui/tabs/career/CareerPanel.tsx`. |
| `src/ui/components/CareerStageChoices.tsx` | Career stages surface + explain link | ✓ VERIFIED | Exists; substantive; imported/used by `src/ui/tabs/career/CareerPanel.tsx`. |
| `src/game/selectors/therapistSalary.ts` | Salary gating + salary window behavior | ✓ VERIFIED | Exists; substantive; re-exported/used via `src/game/selectors/index.ts` and referenced by actions for window computations. |
| `tests/career-salary-window.unit.test.ts` | Regression coverage for salary window | ✓ VERIFIED | Exists; substantive; asserts cash/sec gating, expiry, refresh-by-session, and point-based window extension. |
| `tests/explanations.spec.ts` | Regression coverage for help anchors | ✓ VERIFIED | Exists; substantive; asserts help modal opens with correct active section heading for currencies, catalog shopping, career start, and career stages. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/ui/components/CareerNextActionCard.tsx` | `src/ui/help/helpContent.ts` | `ExplainButton(sectionId={HELP_SECTION_IDS.careerStart})` | ✓ WIRED | Produces `data-testid="explain-career-start"` via `ExplainButton` implementation. |
| `src/ui/components/CareerStageChoices.tsx` | `src/ui/help/helpContent.ts` | `ExplainButton(sectionId={HELP_SECTION_IDS.careerStages})` | ✓ WIRED | Produces `data-testid="explain-career-stages"` via `ExplainButton` implementation. |
| `tests/explanations.spec.ts` | Help modal | `page.getByTestId("explain-...").click()` | ✓ WIRED | Assertions confirm `data-testid="help-active-section"` updates to expected headings. |
| `src/game/selectors/index.ts` | `src/game/selectors/therapistSalary.ts` | `getTherapistCashRateCentsPerSec` re-export + use in breakdown | ✓ WIRED | `getEffectiveCashRateCentsPerSec` flows through `getTherapistCashRateWithWindowCentsPerSec` and shows up in `getCashRateBreakdown`. |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|------------|--------|----------------|
| CAREER-CLAR-01 | ✓ SATISFIED | None found in structural verification. |
| CAREER-BAL-01 | ? NEEDS HUMAN | Pacing smoothness requires playtesting across stages. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No TODO/FIXME/placeholder stubs found in phase-critical artifacts; remaining "placeholder" strings are input/image placeholders (non-blocking). |

### Human Verification Required

### 1. Early-career pacing feels smooth

**Test:** Start a fresh save and play from Career start through (at least) PhD enrollment, first sessions, and the first stage/track choice unlock.
**Expected:** No deadlocks; progression is achievable without a grind spike; the salary window + session refresh loop feels motivating and understandable.
**Why human:** "Smooth pacing" is experiential and depends on tuning thresholds and how the loop feels minute-to-minute.

### Verification Evidence Notes

- This report verified existence/substance/wiring by reading code and tests.
- External verification evidence provided in the prompt (not re-run here): `pnpm run typecheck`, `pnpm run test:unit`, `pnpm run test:e2e`.

---

_Verified: 2026-01-31T05:55:23Z_
_Verifier: Claude (gsd-verifier)_
