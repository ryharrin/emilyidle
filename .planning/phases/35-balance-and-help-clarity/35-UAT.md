---
status: passed
phase: 35-balance-and-help-clarity
source:
  - 35-01-SUMMARY.md
  - 35-02-SUMMARY.md
started: 2026-01-31T05:57:50Z
updated: 2026-01-31T09:41:00Z
---

## Current Test

number: 1
name: Fresh-save career start clarity
expected: |
  On a fresh save, Career is the landing surface and cash/sec is 0 until the player starts their career.
  The "Enter program" (start career) CTA is visible, and an ExplainButton near it opens Help focused on "Starting your career".
awaiting: complete

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

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0

## Gaps

[]
