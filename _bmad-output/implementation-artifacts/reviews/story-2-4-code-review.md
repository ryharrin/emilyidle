# Code Review Report: Story 2.4 Extract CSS by Domain

**Story:** 2.4-extract-css-by-domain  
**Status:** review → needs-fix  
**Reviewer:** BMad Code Review Agent  
**Date:** 2026-02-19  
**Total Issues Found:** 8 (1 HIGH, 4 MEDIUM, 3 LOW)

---

## Executive Summary

The CSS extraction by domain has been **successfully implemented** with the correct file structure, import order, and build output. All CSS files are properly created and the build passes. However, there are **documentation discrepancies and scope creep issues** that must be addressed before marking this story complete.

### Key Findings

- ✅ CSS successfully split into domain-specific files
- ✅ Import order is correct (base → components → tabs → modals → animations → mobile)
- ✅ Build output maintained (168.49 kB CSS bundle, gzipped to 31.37 kB)
- ✅ Unit tests pass (340/340)
- ❌ Scope creep: Unrelated selector refactoring included
- ❌ Documentation: File line counts don't match actual implementation
- ❌ Missing documentation in Dev Agent Record

---

## 🔴 HIGH SEVERITY

### Issue H1: Scope Creep - Unrelated Code Changes Not Documented

**Location:** `src/game/selectors/index.ts`, `src/game/selectors/interactions.ts`  
**Finding:**

- `src/game/selectors/index.ts`: 1990 lines modified (massive refactoring)
- `src/game/selectors/interactions.ts`: Deleted (186 lines removed)

**Evidence:**

```bash
src/game/selectors/index.ts        | 1990 +-------------------------------
src/game/selectors/interactions.ts |  186 ----
```

**Impact:** These changes are NOT related to CSS extraction and are not documented in the story's File List. This represents significant scope creep that could introduce bugs.

**Recommendation:** Either:

1. Remove these changes and create a separate story for selector refactoring, OR
2. Update the story documentation to include these changes as intentional scope

**Task to Add:**

```markdown
- [ ] [AI-Review][HIGH] Document or revert selector refactoring changes
  - File: src/game/selectors/index.ts (1990 lines changed)
  - File: src/game/selectors/interactions.ts (deleted)
```

---

## 🟡 MEDIUM SEVERITY

### Issue M1: File Size Discrepancies - Documentation vs Reality

**Location:** Story file AC1 estimates  
**Finding:** Actual file sizes differ significantly from story estimates:

| File                | Expected (Story) | Actual    | Variance |
| ------------------- | ---------------- | --------- | -------- |
| base.css            | ~800 LOC         | 2,548 LOC | +218%    |
| components.css      | ~1,000 LOC       | 955 LOC   | -5% ✓    |
| tabs/career.css     | ~600 LOC         | 2,764 LOC | +361%    |
| tabs/catalog.css    | ~800 LOC         | 1,682 LOC | +110%    |
| tabs/collection.css | ~600 LOC         | 324 LOC   | -46%     |
| modals.css          | ~800 LOC         | 459 LOC   | -43%     |
| animations.css      | ~400 LOC         | 284 LOC   | -29%     |
| mobile.css          | ~400 LOC         | 693 LOC   | +73%     |

**Evidence:**

```bash
$ wc -l src/styles/*.css src/styles/tabs/*.css
     284 src/styles/animations.css
    2548 src/styles/base.css
     955 src/styles/components.css
     693 src/styles/mobile.css
     459 src/styles/modals.css
    2764 src/styles/tabs/career.css
    1682 src/styles/tabs/catalog.css
     324 src/styles/tabs/collection.css
```

**Recommendation:** Update the story documentation to reflect actual file sizes. The estimates in AC1 were wildly inaccurate.

**Task to Add:**

```markdown
- [ ] [AI-Review][MEDIUM] Update story documentation with actual file sizes
```

### Issue M2: CSS Variables Defined Outside base.css

**Location:** `src/styles/modals.css`, `src/styles/tabs/career.css`  
**Finding:** CSS custom properties (--\*) are defined in domain-specific files instead of base.css:

**Evidence:**

```css
/* In modals.css (should be in base.css): */
--toast-accent: rgba(167, 184, 208, 0.8);

/* In career.css (should be in base.css): */
--career-map-scale: 1;
--career-canvas-surface: rgba(9, 14, 24, 0.78);
--career-panel-surface: rgba(14, 20, 32, 0.82);
```

**Impact:** This violates the architectural pattern of keeping CSS variables in base.css for maintainability. Future theme changes will require hunting through multiple files.

**Recommendation:** Move all CSS variable definitions to base.css or document why they remain in domain files.

**Task to Add:**

```markdown
- [ ] [AI-Review][MEDIUM] Audit and consolidate CSS variables to base.css
  - Check: src/styles/modals.css (7 --toast-accent variants)
  - Check: src/styles/tabs/career.css (11 --career-\* variables)
```

### Issue M3: collection.css Significantly Undersized

**Location:** `src/styles/tabs/collection.css`  
**Finding:** Collection styles are only 324 lines vs expected 600 lines. This is the smallest tab CSS file but Collection tab is feature-rich.

**Evidence:**

```bash
324 src/styles/tabs/collection.css  # Expected: ~600
2764 src/styles/tabs/career.css     # Expected: ~600
1682 src/styles/tabs/catalog.css     # Expected: ~800
```

**Impact:** Potential missing styles or styles incorrectly placed in other files.

**Recommendation:** Verify collection tab styles are complete and not scattered in other files.

**Task to Add:**

```markdown
- [ ] [AI-Review][MEDIUM] Verify collection.css contains all collection tab styles
```

### Issue M4: Dev Agent Record Incomplete

**Location:** Story file Dev Agent Record section  
**Finding:** The Dev Agent Record does not document the selector refactoring changes (1990 lines changed in index.ts, deletion of interactions.ts).

**Evidence:** File List only mentions CSS files:

```markdown
**Modified:**

- `src/style.css` (refactored to imports)
```

**Recommendation:** Update Dev Agent Record to document ALL modified files or revert the selector changes.

**Task to Add:**

```markdown
- [ ] [AI-Review][MEDIUM] Update Dev Agent Record File List with all changed files
```

---

## 🟢 LOW SEVERITY

### Issue L1: Missing Reduced-Motion in animations.css

**Location:** `src/styles/animations.css`  
**Finding:** No `@media (prefers-reduced-motion: reduce)` rules in animations.css. Reduced motion support is only in mobile.css.

**Evidence:**

```bash
$ grep "prefers-reduced-motion" src/styles/animations.css
# No results

$ grep "prefers-reduced-motion" src/styles/mobile.css
@media (prefers-reduced-motion: reduce) { ... }
```

**Impact:** Animations defined in animations.css don't have explicit reduced-motion fallbacks in the same file.

**Recommendation:** Add reduced-motion rules to animations.css for better organization, or document why this is acceptable.

**Task to Add:**

```markdown
- [ ] [AI-Review][LOW] Add reduced-motion support to animations.css
```

### Issue L2: Import Path Uses Relative Not Absolute

**Location:** `src/style.css`  
**Finding:** CSS imports use relative paths (`./styles/...`) which could be less clear than absolute paths.

**Evidence:**

```css
@import "./styles/base.css";
@import "./styles/components.css";
```

**Recommendation:** Consider using Vite path aliases for cleaner imports, or document why relative paths are preferred.

**Task to Add:**

```markdown
- [ ] [AI-Review][LOW] Evaluate using path aliases for CSS imports
```

### Issue L3: Line Count Estimates Were Arbitrary

**Location:** Story AC1  
**Finding:** The line count estimates in Acceptance Criteria 1 were not based on actual analysis and were significantly off (some by 300%+).

**Recommendation:** For future refactoring stories, either:

1. Omit specific line count targets
2. Base estimates on actual pre-analysis of the source file
3. Use range estimates (e.g., "~500-1000 lines") instead of specific numbers

**Task to Add:**

```markdown
- [ ] [AI-Review][LOW] Document lesson learned: avoid specific LOC estimates for refactoring
```

---

## Acceptance Criteria Verification

| AC                                  | Status     | Notes                                            |
| ----------------------------------- | ---------- | ------------------------------------------------ |
| AC1: Split by domain                | ✅ PASS    | All 8 CSS files created with correct structure   |
| AC2: No visual regressions          | ⚠️ PARTIAL | Unit tests pass, but E2E tests not run (timeout) |
| AC3: Build output maintained        | ✅ PASS    | 168.49 kB → 31.37 kB gzipped                     |
| AC4: Selector specificity preserved | ✅ PASS    | No selector order changes detected               |

### E2E Test Status

**Not Completed:** E2E tests timed out after 180s. Story claims E2E tests were run, but this was not verified.

**Recommendation:** Run E2E tests separately and document results.

---

## Task Completion Audit

| Task                               | Claimed | Verified | Status                      |
| ---------------------------------- | ------- | -------- | --------------------------- |
| Task 1: Create directory structure | [x]     | ✅       | Complete                    |
| Task 2: Extract base styles        | [x]     | ✅       | Complete                    |
| Task 3: Extract component styles   | [x]     | ✅       | Complete                    |
| Task 4: Extract tab styles         | [x]     | ✅       | Complete                    |
| Task 5: Extract modal styles       | [x]     | ✅       | Complete                    |
| Task 6: Extract mobile styles      | [x]     | ✅       | Complete                    |
| Task 7: Extract animation styles   | [x]     | ✅       | Complete (but see Issue L1) |
| Task 8: Create style.css entry     | [x]     | ✅       | Complete                    |
| Task 9: Update build config        | [x]     | ✅       | Complete (verified)         |
| Task 10: Visual regression testing | [x]     | ⚠️       | E2E not verified            |
| Task 11: Verify specificity        | [x]     | ✅       | Complete                    |

**Note:** Task 10 claims E2E tests were run, but the E2E test command timed out during review. This needs verification.

---

## Recommendations

### Immediate Actions Required

1. **Address HIGH severity issue:** Document or revert the selector refactoring changes
2. **Update documentation:** Fix line count estimates to match reality
3. **Verify E2E tests:** Run and document E2E test results
4. **Audit CSS variables:** Consider moving to base.css for consistency

### Quality Improvements

1. Add reduced-motion support to animations.css
2. Consider using CSS path aliases
3. Document the actual file sizes and structure in the story

---

## Review Follow-ups (AI)

Add to story Tasks/Subtasks:

```markdown
### Review Follow-ups (AI-Review 2026-02-19)

- [ ] [AI-Review][HIGH] Document or revert selector refactoring changes
  - src/game/selectors/index.ts (1990 lines changed)
  - src/game/selectors/interactions.ts (deleted, 186 lines)
- [ ] [AI-Review][MEDIUM] Update story documentation with actual file sizes
  - base.css: 2,548 lines (not 800)
  - career.css: 2,764 lines (not 600)
  - catalog.css: 1,682 lines (not 800)
  - collection.css: 324 lines (not 600)
  - mobile.css: 693 lines (not 400)
- [ ] [AI-Review][MEDIUM] Audit and consolidate CSS variables to base.css
  - Move --toast-accent variants from modals.css
  - Move --career-\* variables from career.css
- [ ] [AI-Review][MEDIUM] Verify collection.css contains all collection tab styles
  - File is 324 lines, expected ~600
  - Verify no styles misplaced in other files
- [ ] [AI-Review][MEDIUM] Update Dev Agent Record File List
  - Add src/game/selectors/index.ts
  - Add src/game/selectors/interactions.ts (deleted)
- [ ] [AI-Review][LOW] Add reduced-motion support to animations.css
  - Currently only in mobile.css
- [ ] [AI-Review][LOW] Evaluate using path aliases for CSS imports
  - Currently using relative paths
- [ ] [AI-Review][LOW] Run and document E2E test results
  - Story claims completion but not verified
```

---

## Summary

**Status:** Story implementation is functionally complete but has documentation and scope issues.

**Decision:** Request fixes for HIGH and MEDIUM issues before marking complete.

**Fix Count:** 8 issues found, 0 fixed  
**Action Items:** 8 created  
**Recommendation:** Address scope creep (Issue H1) before approval.
