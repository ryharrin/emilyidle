# Emily Idle Real-Time 30-Minute Progression Report (2026-02-17)

## Scope
- Session type: fresh-profile real-time progression (no simulated time skips)
- Duration: exactly 30 minutes
- Platform/input: desktop Chromium, mouse + keyboard
- Goal: measure practical progression depth and determine how far prestige tiers are reachable in 30 minutes.

## Evidence
- Raw log: `/tmp/emilyidle-ui-critique/real-time-30m/real-time-30m-log.txt`
- Start screenshot: `/tmp/emilyidle-ui-critique/real-time-30m/01-start.png`
- End screenshot: `/tmp/emilyidle-ui-critique/real-time-30m/02-end.png`

## Timeline highlights
- `[00:00:02]` Career started via `Enter program`.
- Early loops: sessions could run initially, with purchases and a few upgrades completed.
- Around minute 2 onward: state shifted into repeated `SELECT A TRACK` block on Career action.
- Minute checkpoints from 0 through 29 consistently reported:
  - `workshop=hidden`
  - `maison=hidden`
  - `nostalgia=hidden`

## Final 30-minute summary (from log)
- `[00:30:01] SUMMARY loops=657 sessionsRun=15 blockedCareer=642 purchases=45 upgradesBought=3`
- `[00:30:01] SUMMARY prestigeReach workshopSeen=false workshopReviewSeen=false maisonSeen=false maisonReviewSeen=false nostalgiaSeen=false nostalgiaModalSeen=false`

## Prestige-tier progression result
- Workshop tier: **not reached** (tab never became visible).
- Maison tier: **not reached** (tab never became visible).
- Nostalgia tier: **not reached** (tab never became visible).

## Observed progression blocker
- Dominant blocker in this run: Career repeatedly entered `SELECT A TRACK` and remained unresolved for most of the session.
- This blocked effective progression depth despite ongoing passive accrual and occasional catalog purchases.

## Conclusion
In a strict real-time 30-minute fresh run, the session did **not** progress into any prestige tier (Workshop/Maison/Nostalgia). Progression was largely constrained by unresolved Career track-selection gating.

## Proposed blocker fix: `SELECT A TRACK`
- Add a direct primary CTA in the Career execution lane when the next action cue is `choose-track`.
- Implementation target: `src/ui/tabs/career/CareerPanel.tsx`.
- Behavior:
  - When `nextActionCue.id === "choose-track"`, replace or augment `Run session` with `Choose track`.
  - CTA action should call `openProgressDetails()` and focus the first available track option.
  - Update status text from `Select a track` to `Choose track now`.
- Rationale:
  - Prevents repeated blocked clicks on session controls by surfacing the corrective action in the same interaction zone.
- Validation plan:
  - Add e2e regression: force `choose-track` state, assert `Choose track` CTA is visible, clickable, and lands on track options.
