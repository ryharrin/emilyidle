# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-25)

**Core value:** A satisfying watch-collecting idle loop that saves reliably and stays pleasant to play and maintain.

**Current focus:** v2.1 Onboarding & UX (roadmap ready)

## Current Position

Phase: Not started (ready to plan Phase 20)
Plan: —
Status: Roadmap created
Last activity: 2026-01-26 - v2.1 roadmap created (Phases 20-24)
Progress: ░░░░░░░░░░ 0%
Next Phase: Phase 20 (Help & Iconography)

## Accumulated Context

### Roadmap Evolution
- Phase 12 added: major-updates-01-21
- Milestone v2.0 created: upcoming major changes to game design, 6 phases (Phase 13-18)
- Phase 19 added: Refactor phase 13 code with phase 13 research in mind
- v2.1 roadmap added: Phases 20-24 (Onboarding & UX)
- Milestone v2.0 archived under .planning/milestones/

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

### Deferred Issues
- Planning process gap: `.planning/REQUIREMENTS.md` missing for v2.0 (archived as reconstructed requirements)
- Verification gap: phases 13 and 18 missing verification reports
- Test gap: no dedicated Playwright E2E for therapist session deltas/cooldown

### Blockers/Concerns Carried Forward
- None

### Session Continuity
Last session: 2026-01-25T19:45:25Z
Stopped at: v2.0 milestone archival edits

Resume file: None
