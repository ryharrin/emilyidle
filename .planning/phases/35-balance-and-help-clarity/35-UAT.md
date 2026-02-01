---
status: diagnosed
phase: 35-balance-and-help-clarity
source:
  - 35-01-SUMMARY.md
  - 35-02-SUMMARY.md
started: 2026-01-31T05:57:50Z
updated: 2026-02-01T03:01:20Z
---

## Current Test

[testing complete]

## Tests

### 1. Fresh-save career start clarity
expected: Fresh save lands on Career; cash/sec is 0 until career start; start CTA + ExplainButton make the reason and next step obvious
result: pass

### 2. Salary window loop and sessions UX
expected: After starting career, salary window concept is visible/understandable; sessions appear at top and running a session refreshes the salary window without confusing cash/sec math
result: pass

### 3. Shop vs Catalog surface clarity
expected: Player can tell Shop is the purchase flow and Catalog is the archive/reference surface; copy does not imply two separate purchase systems
result: pass

### 4. Salary window refresh via session
expected: After starting a career, Career shows a clear "salary window" concept and running a session visibly refreshes/extends it
result: issue
reported: "I'm unable to run sessions for some reason. It says sessions unavailable"
severity: major

### 5. Career start ExplainButton opens correct Help section
expected: The ExplainButton near the start-career CTA opens Help focused on the "Starting your career" section (not just generic Help)
result: pass

### 6. Stage choices ExplainButton opens correct Help section
expected: When stage choices are visible, the ExplainButton near them opens Help focused on stage choices / permanent choices
result: pass

### 7. Retirement disables sessions
expected: At the retirement stage, the UI makes it clear sessions are disabled and the player cannot start a session
result: pass

## Summary

total: 7
passed: 6
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "After starting a career, Career shows a clear salary window concept and running a session visibly refreshes/extends it"
  status: failed
  reason: "User reported: I'm unable to run sessions for some reason. It says sessions unavailable"
  severity: major
  test: 4
  artifacts:
    - path: ".planning/uat-artifacts/35/09-career-started-session-state.png"
      issue: "Session cost/payout/cooldown show Unavailable and label says Sessions unavailable after starting career"
    - path: ".planning/uat-artifacts/35/03-career-started.png"
      issue: "After entering program, sessions UI is present but appears unavailable"
    - path: ".planning/uat-artifacts/35/05-after-session.png"
      issue: "After session attempt screenshot (may remain blocked if sessions are unavailable)"
  root_cause: "Sessions are gated on therapistCareer.activeTrackId, but entering the PhD program starts the career without setting a track; track choice unlocks at level 3, so sessions show as unavailable immediately after career start."
  missing:
    - "Allow pre-track sessions (fallback track/session policy) until track unlock at level 3"
    - "Ensure salary window refresh loop is achievable before level 3"
  debug_session: ".planning/debug/35-sessions-unavailable.md"
