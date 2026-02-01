---
status: complete
phase: 35-balance-and-help-clarity
source:
  - 35-01-SUMMARY.md
  - 35-02-SUMMARY.md
started: 2026-01-31T05:57:50Z
updated: 2026-02-01T03:38:51Z
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
result: pass
evidence:
  - path: ".planning/uat-artifacts/35/10-career-started-sessions-available.png"
    note: "After entering program, session payout/cooldown show values (not Unavailable) and Run session is enabled before track unlock."
  - path: ".planning/uat-artifacts/35/11-after-pretrack-session.png"
    note: "After running a pre-track session, Career state updates (cooldown/status/XP changes visible)."

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
passed: 7
issues: 0
pending: 0
skipped: 0

## Gaps
