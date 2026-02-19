# Emily Idle Deep UI/Flow Critique (2026-02-17)

## 1. Test context
- Date: Tuesday, February 17, 2026
- Platform/input mix:
  - Desktop Chromium (mouse + keyboard)
  - Mobile viewport 390x844 (touch-oriented checks)
- Session design:
  - Session A: fresh profile + accelerated long progression loop
  - Session B: seeded late-game progression (Atelier/Maison/Nostalgia coverage)
  - Session C: mobile navigation/readability/recovery pass
- Goal: deep critique of first-time UX, core loop clarity, meta progression clarity, and recovery behavior.
- Evidence artifacts:
  - `/tmp/emilyidle-ui-critique/deep/deep-session-log.txt`
  - `/tmp/emilyidle-ui-critique/deep/deep-session-log-late.txt`
  - `/tmp/emilyidle-ui-critique/deep/deep-session-log-mobile.txt`
  - `/tmp/emilyidle-ui-critique/deep/01-start.png`
  - `/tmp/emilyidle-ui-critique/deep/02-mid.png`
  - `/tmp/emilyidle-ui-critique/deep/03-end.png`
  - `/tmp/emilyidle-ui-critique/deep/04-late-start.png`
  - `/tmp/emilyidle-ui-critique/deep/05-late-end.png`
  - `/tmp/emilyidle-ui-critique/deep/06-mobile-start.png`
  - `/tmp/emilyidle-ui-critique/deep/07-mobile-end.png`

## 2. Gameplay pass coverage (required coverage checklist + evidence)
- Fresh profile flow to first meaningful progression milestone: completed.
  - Evidence: Session A `[00:00:02] FTUE started career via Enter program`; first purchase by `[00:00:03]`.
- Core loop repetition (>=3 earn-spend-feedback cycles): exceeded.
  - Evidence: Session A logged `40` loops, `15` successful sessions, `40` purchases.
- Navigation sweep across primary tabs and return to context: completed across sessions.
  - Evidence:
    - Session A end sweep visited `career,catalog,collection,upgrades,workshop,stats,save`.
    - Session B explicit late-state sweep visited `career,catalog,collection,upgrades,workshop,maison,nostalgia,stats,save`.
- Meta/progression touchpoints (unlock/upgrade/prestige-adjacent): completed.
  - Evidence:
    - Session A: multiple upgrade purchases (`Upgrade ($5.00)`, `($8.00)`, `($12.81)`, `($20.49)`).
    - Session B: Workshop/Maison review reset flows and Nostalgia prestige confirmation modal.
- Recovery checks (>=3): completed and exceeded.
  - Evidence:
    - Session A: help open/close, clear-save confirm/cancel, invalid import feedback.
    - Session B: Workshop reset dismissal attempt, Maison reset dismissal, Nostalgia modal dismissal.
    - Session C: mobile clear-save cancel.

## 3. Top issues (ordered by severity)

### 1) Career progression dead-end state lacks clear resolution path
- Category: Flow continuity
- Priority score: `(4 impact * 4 frequency * 5 confidence) / 2 effort = 40`
- Evidence:
  - Session A from loop 16 onward repeatedly logs `career blocked status='SELECT A TRACK'` while other loops continue.
  - Occurs for 25 consecutive loops (`blockedSessions=25`).
- Root-cause hypothesis:
  - The state transition into track-selection is not paired with a high-prominence, in-context next step, so the player keeps bouncing back to blocked action attempts.
- Specific change:
  - When status is `SELECT A TRACK`, show one primary CTA directly next to the disabled/blocked career action (`Choose track`) and deep-link to the exact selector.
- Expected outcome:
  - Reduced repeated blocked clicks and faster return to intentional progression.
- Verification plan:
  - Re-run accelerated and manual sessions; target a major drop in repeated blocked career attempts.

### 2) Tab labels include duplicated readiness tokens and overloaded text
- Category: Clarity
- Priority score: `(3 impact * 5 frequency * 5 confidence) / 2 effort = 37.5`
- Evidence:
  - Session A: `COLLECTION READY READY: INTERACTIVE WATCH READY`.
  - Session C mobile: `CAREER READY READY: SESSION READY`.
- Root-cause hypothesis:
  - Readiness text is being concatenated directly into tab labels (including duplicates), harming scanability and assistive-tech clarity.
- Specific change:
  - Keep tab labels semantic and short (`Career`, `Collection`, etc.); render readiness as separate badge + optional `aria-live` status message.
- Expected outcome:
  - Faster tab scanning and cleaner navigation comprehension on desktop and mobile.
- Verification plan:
  - Validate that tab text remains concise while readiness is still discoverable and announced once.

### 3) Workshop reset review has unreliable back-out/dismiss behavior
- Category: Recovery
- Priority score: `(4 impact * 3 frequency * 4 confidence) / 2 effort = 24`
- Evidence:
  - Session B: `RECOVERY workshop reset dismissal attempted closed=false` after opening review reset.
  - Maison/Nostalgia dismissals closed successfully in same pass, indicating inconsistency.
- Root-cause hypothesis:
  - Workshop reset review uses a dismissal pattern or button state inconsistent with Maison/Nostalgia reset surfaces.
- Specific change:
  - Standardize reset modal controls and close affordances across all prestige tiers; ensure keyboard Escape and explicit cancel always work.
- Expected outcome:
  - Predictable back-out behavior and lower user anxiety around reset previews.
- Verification plan:
  - Add parity e2e checks for Workshop/Maison/Nostalgia: open review, cancel, confirm return to same context.

### 4) Collection section navigation is vulnerable to mixed-control confusion
- Category: Navigation
- Priority score: `(3 impact * 3 frequency * 4 confidence) / 2 effort = 18`
- Evidence:
  - Session A collection traversal repeatedly logs section sequence including `Got it`, indicating coachmark control is interleaved in the section navigation interaction path.
- Root-cause hypothesis:
  - Onboarding/coachmark controls visually occupy the same interaction lane as persistent section navigation controls.
- Specific change:
  - Isolate coachmark CTA from section-nav control group and delay/relocate until after first stable section focus.
- Expected outcome:
  - Fewer accidental dismissals and fewer wrong-path taps in Collection.
- Verification plan:
  - Measure first-visit section switch success rate and misclick rate before/after layout separation.

## 4. Quick wins (1-3 low-effort fixes)
- Remove duplicated `READY READY` text from primary tab labels; keep readiness as separate badge text.
- Add a direct `Choose track` primary action whenever Career status is `SELECT A TRACK`.
- Normalize prestige review dismissal controls (`Keep current run`/cancel/Escape) across Workshop/Maison/Nostalgia.

## 5. Strategic improvements (system-level flow/UI changes)
- Build a unified blocked-state resolver system:
  - Any blocked action should surface one explicit next action, reason text, and deep-link target.
- Introduce a navigation semantics contract:
  - Primary tab labels remain static; dynamic readiness state lives in badges and status channels only.
- Create cross-tier reset UX primitives:
  - Shared modal shell, shared recovery controls, and shared telemetry events for open/cancel/confirm.

## 6. Next playtest plan
- Run a longer manual deep pass focused on qualitative hesitation windows (not automation-driven) in 3 phases:
  - 30-minute FTUE + early loop qualitative observation.
  - 30-minute midgame branch/track and upgrade decision behavior.
  - 30-minute late-game prestige decision/recovery confidence checks.
- Instrument and compare:
  - blocked-action repeat count
  - time from block to next meaningful action
  - tab-switch count before resolution
  - reset-preview cancel success rate
- Add targeted validation e2e tests for:
  - `SELECT A TRACK` CTA visibility and deep-link behavior.
  - workshop dismissal parity with maison/nostalgia.
  - no duplicated readiness tokens in tab accessible names.

## Note on depth
This deep pass substantially expanded coverage versus the earlier quick pass, including accelerated long-loop progression plus seeded late-game and mobile sessions. It is still a compressed, instrumented evaluation rather than a literal 1-2 hour continuous human-in-the-loop session.

## Addendum: Manual-Observed Follow-up Session

### Session metadata
- Artifact log: `/tmp/emilyidle-ui-critique/manual-long/manual-long-log.txt`
- Artifact screenshots:
  - `/tmp/emilyidle-ui-critique/manual-long/01-fresh-start.png`
  - `/tmp/emilyidle-ui-critique/manual-long/02-fresh-mid.png`
  - `/tmp/emilyidle-ui-critique/manual-long/03-late-end.png`
  - `/tmp/emilyidle-ui-critique/manual-long/04-mobile-end.png`
- Observed duration in this run: `69s` (`[00:01:09] SUMMARY elapsedSeconds=69 ...`).

### Key additional evidence
- Repeated career block copy observed in slower pacing:
  - `NEED MORE ENJOYMENT · TIER RECOVERS IN ...` appears repeatedly after early loops while purchases remain available.
- Collection navigation repeatedly interleaves with coachmark CTA:
  - Section traversal includes `Overview`, `Got it`, `Milestones` in repeated cycles.
- Late-state recovery checks reaffirmed:
  - Workshop review reset opened, dismissal attempted.
  - Maison review reset opened/canceled.
  - Nostalgia modal opened/canceled.
- Mobile pass reaffirmed no horizontal overflow but still shows dynamic/long tab labels in some states.

### Impact on prioritization
- Existing top priorities remain unchanged:
  1. Career blocked-state guidance (`SELECT A TRACK` / `NEED MORE ENJOYMENT`) needs stronger direct CTA routing.
  2. Tab readiness wording should be separated from primary tab labels.
  3. Reset flow dismissal consistency should be unified across Workshop/Maison/Nostalgia.
