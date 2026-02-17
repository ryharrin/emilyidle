# Emily Idle UI/Flow Critique (2026-02-17)

## 1. Test context
- Build/context: local Vite dev run on Tuesday, February 17, 2026.
- Platform/input: Web desktop, Chromium, mouse + keyboard.
- Player profile: fresh save (first-time player flow).
- Scope: first-time UX + core loop clarity + meta/progression touchpoint.
- Evidence artifacts:
  - `/tmp/emilyidle-ui-critique/session-log.txt`
  - `/tmp/emilyidle-ui-critique/01-fresh-load.png`
  - `/tmp/emilyidle-ui-critique/03-spend-cycle-3.png`
  - `/tmp/emilyidle-ui-critique/99-end-state.png`
  - `/tmp/emilyidle-ui-critique/ui-flow-critique-report.md`

## 2. Gameplay pass coverage (required checklist + evidence)
- Fresh profile flow to meaningful milestone: completed.
  - Evidence: `[00:01] Fresh profile loaded`, `[00:01] career started`, first purchase achieved by `[00:02]`.
- Core loop repetition (3 earn-spend-feedback cycles): completed.
  - Evidence: cycles 1-3 at `[00:01]-[00:04]`, 3 purchases logged.
- Navigation sweep across primary tabs and return: completed.
  - Evidence: `[00:06]-[00:08]` visited 5/5 visible primary tabs, returned to Career at `[00:08]`.
- Meta/progression touchpoint: completed.
  - Evidence: `[00:08] Meta touchpoint: upgrade choice visible ('Upgrade ($5.00)')`.
- Recovery checks (>=3): completed.
  - Evidence: details sheet open/close `[00:05]`, help modal open/close `[00:06]`, clear-save confirm/cancel `[00:08]`.

## 3. Top issues (ordered by severity)

### Issue 1: Primary nav labels are overloaded (`score 30`)
- Evidence: `[00:06]-[00:08]` tab names include strings like `CATALOG READY READY: NEW WATCH AFFORDABLE`.
- Root-cause hypothesis: readiness copy is embedded in tab accessible names, adding noise and duplicated tokens.
- Specific change: keep tab labels short (`Catalog`, `Collection`, `Upgrades`), move readiness detail into a separate `aria-live` status region + compact badge.
- Expected outcome: faster scan and better keyboard/screen-reader navigation.
- Validation plan: rerun sweep and verify tab names stay short while readiness still announced once.

### Issue 2: Core loop handoff is unclear when sessions block (`score 21.3`)
- Evidence: `[00:04] Cycle 3: earn blocked (session unavailable)`; earlier exploratory pass also surfaced status text `NEED MORE ENJOYMENT · TIER RECOVERS IN 30S`.
- Root-cause hypothesis: when `career-action` blocks, the UI explains state but does not elevate one concrete “do this now” action in-place.
- Specific change: when blocked, inject one primary CTA beside the career action (for example `Buy affordable watch` or `Run enjoyment-raising interaction`), with reason-specific copy.
- Expected outcome: less hesitation and fewer context-switch dead-ends.
- Validation plan: track time-to-next-meaningful-action after first block; target lower hesitation and fewer idle pauses.

### Issue 3: Early catalog view is too dense for first-loop decisions (`score 16`)
- Evidence: `/tmp/emilyidle-ui-critique/03-spend-cycle-3.png` shows very high card density and long scroll immediately after onboarding.
- Root-cause hypothesis: too many similar cards surface before the player has a strong filter mental model.
- Specific change: default first-time catalog to a curated “Recommended now” lane; collapse advanced fields by default.
- Expected outcome: quicker first purchase decisions, lower scan fatigue.
- Validation plan: compare first-purchase time and misclick/backtrack counts vs current flow.

## 4. Quick wins (low effort)
- Remove duplicated `READY READY` tokening in tab label composition.
- Add one inline “next best action” CTA when `career-action` is disabled.
- Default first-time catalog sort/filter to a short recommended subset.

## 5. Strategic improvements
- Build a cross-tab “blocked-state router”: when any core action blocks, route player to the best next action with one-click deep link.
- Standardize readiness communication: concise tab labels + consistent badge semantics + single assistive announcement channel.

## 6. Next playtest plan
- Run 3 sessions: first-time desktop, returning desktop, mobile viewport.
- Add metrics: time-to-first-purchase, time-from-first-block-to-next-action, tab-switch count before action recovery.
- Validate that nav readability and blocked-state CTA changes reduce hesitation without hiding strategic depth.

## Note on depth
This report is based on a short, instrumented coverage pass to satisfy the required checklist. It is not equivalent to a 1-2 hour deep exploratory playthrough across later-game systems and extended progression.
