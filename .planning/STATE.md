# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** A satisfying watch-collecting idle loop that saves reliably and stays pleasant to play and maintain.

**Current focus:** v3.2 Phase 39 (Collection Info Embedded in Catalog)

## Current Position

Phase: 39 of 41 (Collection Info Embedded in Catalog)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-02-02 — Phase 38 verified (status: passed)
Progress: ████░░░░░░ 40%
Next Phase: Phase 39 (Plan 01)

## Accumulated Context

### Roadmap Evolution
- Phase 12 added: major-updates-01-21
- Milestone v2.0 created: upcoming major changes to game design, 6 phases (Phase 13-18)
- Phase 19 added: Refactor phase 13 code with phase 13 research in mind
- v2.1 roadmap added: Phases 20-24 (Onboarding & UX)
- Milestone v2.0 archived under .planning/milestones/
- Milestone v3.0 kickoff: catalog-first economy + interactions (phases 25-30)
- Milestone v3.0 archived under .planning/milestones/ (phases 25-31)

### Decisions
| Phase | Decision | Rationale |
| --- | --- | --- |
| 12-01 | None - followed plan as specified | No deviations |
| 12-02 | None - followed plan as specified | No deviations |
| 12-03 | Keep collector notes gated to owned entries | Preserve discovery + avoid spoilers |
| 12-03 | Use Playwright to assert catalog images load under base URL | Prevent regressions when `base` changes |
| 12-04 | None - followed plan as specified | No deviations |
| 12-05 | None - followed plan as specified | No deviations |
| 12-06 | None - followed plan as specified | No deviations |
| 12-07 | No functional changes required; validated existing UI via unit tests | Coachmarks + dev controls already existed |
| 12-08 | Approved Wind Session design spike and implemented scaled rewards | 5 rounds, tension, Push/Steady choice |
| 12-09 | Added prestige legacy multiplier for workshop resets and maison heritage | Always-on compounding boost |
| 12-10 | Aligned GitHub Pages deploy workflow and verified /emilyidle build output | Pages artifact upload v4 |
| 13-01 | Use explicit per-watch enjoyment rates and sum owned watches | Stable per-watch display and tier-driven enjoyment economy |
| 13-02 | Make enjoyment the primary Collection currency in UI and stats | Align player-facing copy with enjoyment-first economy |
| 14-01 | Therapist earnings are hybrid: passive salary + cooldown sessions; salary affected by events but not the vault softcap | Keeps vault math stable while making "cash / sec" reflect both faucets |
| 14-02 | Gate Career tab via milestone unlock and add stable UI anchors | Preserve fresh-save tabs while exposing therapist progression |
| 15-01 | None - followed plan as specified | No deviations |
| 15-02 | None - followed plan as specified | No deviations |
| 15-03 | None - followed plan as specified | No deviations |
| 16-01 | Set nostalgia prestige threshold to 12,000,000 enjoyment cents with sqrt gain | Diminishing returns keeps rewards monotonic |
| 18-01 | None - followed plan as specified | No deviations |
| 25-02 | None - followed plan as specified | No deviations |
| 25-03 | None - followed plan as specified | No deviations |
| 25-04 | None - followed plan as specified | No deviations |
| quick-001 | Add local overrides for accented catalog filenames | Keep dev server image URLs resolving |
| quick-001 | Selected download option; audit found no missing assets | Confirmed catalog assets already present |
| 26-06 | Keep catalog sources/dealers in shared panel | Preserve access after tab consolidation |
| 27-06 | Start fresh saves with 1 career point and passive career XP | Avoid progression deadlock before track unlock |
| 29-06 | None - followed plan as specified | No deviations |
| 30-01 | Set first workshop prestige legacy jump to 2.25x | Target ~3x faster second run while keeping cap |
| 30-04 | None - followed plan as specified (checkpoint approved via UAT evidence) | Verified via 30-UAT.md artifacts |
| 31-01 | Reframe upgrades to affect enjoyment (not dollars) and apply events to both enjoyment + cash | Close v3.0 audit gaps while keeping career-first cash economy |
| 35-02 | None - followed plan as specified | No deviations |
| 36-01 | None - followed plan as specified | No deviations |
| 35-03 | None - followed plan as specified | No deviations |
| 37-01 | Catalog tab is hideable via Settings preferences | Align hidden tab behavior with new Catalog surface |
| 38-01 | None - followed plan as specified | No deviations |

### Deferred Issues
- Planning process gap: `.planning/REQUIREMENTS.md` missing for v2.0 (archived as reconstructed requirements)
- Verification gap: phases 13 and 18 missing verification reports
- Test gap: no dedicated Playwright E2E for therapist session deltas/cooldown

### Blockers/Concerns Carried Forward

**v3.2 Catalog/Vault Consolidation (Intermediate):**
- Catalog cards should be the sole purchase flow for watches.
- Vault information needs to be merged into the Catalog surface.
- Upgrade copy and previews must not claim cash multipliers if cash accrual is career-salary driven.

**v4.0 Watch Interactions & Catalog Polish (from NOTES.md):**
- Winding mini-game needs more interactive control and visual animation (NOTES.md planned feature)
- Additional automatic watch mini-games needed: setting time/date, changing strap (NOTES.md planned feature)
- Catalog needs more watch brands and models (NOTES.md planned feature)
- Undiscovered watches should be greyed out with lock icon, not hidden (NOTES.md bug fix)
- Fix missing images for certain watch models in catalog (NOTES.md bug fix)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | There are missing images in the catalog. Create an e2e test that checks for any missing images. Also, find and download any missing images, save them to the repo. | 2026-01-28 | 893f9f2 | [001-there-are-missing-images-in-the-catalog](./quick/001-there-are-missing-images-in-the-catalog/) |

### Session Continuity
Last session: 2026-02-02T06:27:18Z
Stopped at: Completed 38-02-PLAN.md

Resume file: None
