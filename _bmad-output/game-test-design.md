# Emily At Last - Test Design Document

**Author**: Ryan (via BMAD Game QA Agent)  
**Date**: 2026-02-23  
**Game Type**: Active Incremental / Watch Collection  
**Platform**: Mobile Web (PWA), Desktop Web

---

## 1. Executive Summary

This document outlines comprehensive test scenarios for "Emily At Last," an active incremental watch collection game where players progress through a clinical psychology career while collecting watches that generate passive enjoyment.

---

## 2. Risk Assessment

| Risk Area | Impact | Likelihood | Priority |
|-----------|--------|------------|----------|
| Save data loss | Critical | Low | P0 |
| Economy exploits | High | Medium | P0 |
| Career progression blockers | High | Low | P0 |
| Mini-game failures | Medium | Medium | P1 |
| UI navigation bugs | Medium | Medium | P1 |
| Performance on mobile | Medium | Low | P2 |

---

## 3. Test Categories

### 3.1 Core Gameplay Loop (P0)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| CG-01 | Player starts new game, receives acceptance letter | E2E | P0 |
| CG-02 | Player completes onboarding, enters PhD stage | E2E | P0 |
| CG-03 | Player runs therapy session, earns currency | E2E | P0 |
| CG-04 | Player earns enough to buy watch | E2E | P0 |
| CG-05 | Watch purchased, package arrives after delay | E2E | P0 |
| CG-06 | Watch adds to collection, generates passive enjoyment | E2E | P0 |

### 3.2 Progression & Economy (P0)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| PE-01 | Currency caps at 999,999,999 | Unit | P0 |
| PE-02 | Enjoyment accumulates passively from watches | Unit | P0 |
| PE-03 | Love multiplier affects passive enjoyment | Unit | P0 |
| PE-04 | Career XP accumulates correctly | Unit | P0 |
| PE-05 | Career stage advances at XP thresholds | Unit | P0 |
| PE-06 | Therapy session costs enjoyment, rewards cash/XP | Unit | P0 |

### 3.3 Mini-Games (P1)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| MG-01 | Quartz calibration - Miss/Good/Perfect grading | Unit | P1 |
| MG-02 | Manual winding - hold timing | Unit | P1 |
| MG-03 | Automatic movement - rhythm tapping | Unit | P1 |
| MG-04 | Therapy session - patient vignette progression | Unit | P1 |
| MG-05 | Family check-in cooldown enforcement | Unit | P1 |

### 3.4 Persistence (P0)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| PS-01 | Save persists to localStorage | E2E | P0 |
| PS-02 | Load restores exact state | E2E | P0 |
| PS-03 | Export/Import save string works | E2E | P0 |
| PS-04 | Invalid save shows error, preserves state | E2E | P0 |
| PS-05 | Version migration handles old saves | Unit | P0 |

### 3.5 UI/UX (P1)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| UI-01 | All 5 tabs navigate correctly | E2E | P1 |
| UI-02 | Mail tab shows unread count badge | E2E | P1 |
| UI-03 | Collection virtualizes large lists | E2E | P1 |
| UI-04 | Market shows affordability states | E2E | P1 |
| UI-05 | Career progress displays correctly | E2E | P1 |

### 3.6 Prestige Systems (P2)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| PR-01 | Workshop prestige resets progress | Unit | P2 |
| PR-02 | Maison prestige requires workshop completion | Unit | P2 |
| PR-03 | Nostalgia unlocks at milestones | Unit | P2 |

### 3.7 Home Life / Gallery (P2)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| HL-01 | Family photos unlock on career stage | Unit | P2 |
| HL-02 | Children's drawings unlock at milestones | Unit | P2 |
| HL-03 | Ryan messages appear in mail | Unit | P2 |
| HL-04 | Home scene evolves with progression | Unit | P2 |

---

## 4. Test Coverage Matrix

| Feature | Unit Tests | E2E Tests | Coverage |
|---------|------------|-----------|-----------|
| Game State/Reducer | 120+ | 0 | ✅ Full |
| Selectors | 40+ | 0 | ✅ Full |
| Persistence | 10+ | 4 | ✅ Full |
| Mini-games | 50+ | 0 | ⚠️ Partial |
| UI Components | 20+ | 6 | ⚠️ Partial |
| Integration | 0 | 0 | ❌ Missing |

---

## 5. Recommended Additional Tests

### High Priority

1. **E2E: Complete Player Journey**
   - Start → Onboarding → Earn money → Buy watch → Passive income → Career progress
   - Currently: Covered by 6 basic E2E tests

2. **E2E: Watch Purchase Flow**
   - Check affordability → Buy → Shipping notification → Package arrives → Open → Collection

3. **E2E: Career Progression**
   - Complete sessions → Earn XP → Advance stages → Unlock new watches

### Medium Priority

4. **E2E: Mail System**
   - Acceptance letter → Shipping notification → Package arrived

5. **E2E: Family Interactions**
   - Check-in cooldown → Family moments → Love increases

6. **Performance: Large Collection**
   - 100+ watches should virtualize smoothly

### Lower Priority

7. **Cross-browser**: Test on Chrome, Safari, Firefox mobile
8. **Accessibility**: Screen reader navigation
9. **Offline**: PWA works offline after first load

---

## 6. Test Execution Strategy

### Local Development
```bash
# Unit tests
pnpm test

# E2E tests
pnpm exec playwright test

# All tests
pnpm test && pnpm exec playwright test
```

### CI Pipeline
1. Unit tests on every PR
2. E2E tests on main branch
3. Lighthouse performance audit

---

## 7. Known Test Gaps

| Gap | Current State | Recommended Action |
|-----|---------------|-------------------|
| Mini-game visual tests | Manual | Add screenshot comparison |
| Performance profiling | None | Add Lighthouse CI |
| Cross-browser | Single browser | Add BrowserStack/CI multi-browser |
| Accessibility audit | None | Add axe-core integration |

---

## 8. Test Data Requirements

### Fixtures Needed
- `save-states/new-game.json` - Fresh start
- `save-states/onboarding-complete.json` - After first acceptance letter
- `save-states/mid-game.json` - Multiple watches owned
- `save-states/late-game.json` - Near endgame

### Mock Data
- Therapy vignettes (all stages)
- Watch catalog (all tiers)
- Family moments
- Ryan messages

---

## 9. Appendix: Test ID Convention

- **CG-XXX**: Core Gameplay
- **PE-XXX**: Progression/Economy  
- **MG-XXX**: Mini-Games
- **PS-XXX**: Persistence
- **UI-XXX**: UI/UX
- **PR-XXX**: Prestige
- **HL-XXX**: Home Life
- **AC-XXX**: Accessibility
- **PB-XXX**: Performance
