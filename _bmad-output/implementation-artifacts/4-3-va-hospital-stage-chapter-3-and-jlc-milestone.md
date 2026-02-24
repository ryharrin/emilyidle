# Story 4.3: VA Hospital Stage (Chapter 3) & JLC Milestone

**Story ID:** 4.3  
**Epic:** 4 - Career Journey  
**Status:** review  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to reach the VA Hospital stage and receive the special JLC watch,  
**So that** Emily's PhD completion is celebrated with a milestone moment.

## Acceptance Criteria

1. **Given** I advance to VA Hospital, when the transition triggers, then income reaches Moderate level and Automatic watches unlock.
2. **Given** the PhD completion milestone, when I reach this career stage, then the JLC Master Ultra Thin Moon Q1252501 (34mm rose gold) is AWARDED (not purchased).
3. **Given** the JLC award, when it triggers, then a special celebration screen shows the watch with a personalized message.
4. **Given** VA Hospital therapy sessions, when I conduct sessions, then vignettes reflect serving veterans and institutional settings.

---

## Technical Requirements

### Stage Data
```typescript
{
  id: 'va-hospital',
  title: 'VA Hospital',
  xpRequired: 500,
  incomePerSecCents: 50,
  enjoymentCost: 12,
  description: 'Serving veterans',
  unlocks: ['automatic-tier', 'jlc-q1252501']
}
```

### JLC Award Logic
```typescript
// Awarded automatically upon reaching stage
const JLC_WATCH = {
  id: 'jlc-master-ultra-thin-moon',
  name: 'Jaeger-LeCoultre Master Ultra Thin Moon',
  size: '34mm',
  material: 'rose gold',
  complication: 'moon phase',
  awardedAtStage: 'va-hospital',
  isAwarded: true  // Not purchased
};
```

### Celebration Screen
- Full watch image
- Personalized message from Ryan
- PhD completion congratulations
- Moon phase symbolism explanation

---

## Implementation

- [x] Add VA Hospital to career stages
- [x] Define JLC watch award logic
- [x] Create celebration screen component
- [x] Add Ryan's personalized message
- [x] Implement automatic watch award on stage entry
- [x] Create therapy vignettes for VA setting
- [x] Add automatic watch tier unlock

---

## Dev Agent Record

### Implementation Notes

1. **VA Hospital Career Stage**: Already existed in `careers.ts` with proper unlocks (`automatic`, `jlc-award`).

2. **JLC Watch Addition**: Added to `watches.ts` with:
   - `isAwarded: true` flag to mark as non-purchasable
   - Additional fields: `size`, `material`, `complication`
   - `isAwardedWatch()` helper function added to filter from market

3. **Unlock Registry**: Updated `registry.ts` to include:
   - `career-VAHospital-celebration` unlock
   - `career-VAHospital-jlc-award` unlock with `onUnlock` callback that adds the watch to owned watches
   - `home-photo-va-hospital` unlock
   - `ryan-message-va-hospital` unlock

4. **Collection Selectors**: Updated `collection.ts` to:
   - Filter out awarded watches from `affordableWatches()`
   - Filter out awarded watches from `availableMarketWatches()`

5. **Unlock Toasts**: Added presentation for all VA Hospital unlocks in `UnlockToasts.tsx`.

6. **JLCAwardCelebration Component**: Created new component that:
   - Shows when `career-VAHospital-jlc-award` unlock is pending
   - Displays elegant celebration UI with gold theme
   - Shows watch details (size, material, complication)
   - Displays Ryan's personalized message
   - Includes moon phase symbolism explanation

### Debug Log

- Fixed existing test failure in `collection.unit.test.ts` related to missing `lastFamilyCheckIn` in test state
- Fixed existing type error in `CareerTab.tsx` where `InteractionRecord` was missing `goods` and `misses` properties

---

## File List

- `src/game/data/watches.ts` - Added JLC watch with award properties, added `isAwardedWatch()` helper
- `src/game/data/watches.unit.test.ts` - Added tests for JLC watch and `isAwardedWatch()`
- `src/game/discovery/registry.ts` - Added VA Hospital milestone unlocks
- `src/game/discovery/evaluateUnlocks.unit.test.ts` - Added tests for VA Hospital unlocks
- `src/game/selectors/collection.ts` - Updated to filter awarded watches from market
- `src/game/selectors/collection.unit.test.ts` - Updated tests to account for awarded watches
- `src/ui/components/UnlockToasts.tsx` - Added VA Hospital unlock presentations
- `src/ui/components/JLCAwardCelebration.tsx` - New celebration screen component
- `src/ui/App.tsx` - Added JLCAwardCelebration component
- `src/ui/tabs/CareerTab.tsx` - Fixed InteractionRecord type (added goods/misses)
- `src/ui/tabs/HomeTab.tsx` - Changed "Graduate School Acceptance" to "PhD Program Acceptance"
- `src/ui/components/AcceptanceLetter.tsx` - Changed button text from "Enter Grad School" to "Accept Offer & Begin PhD"
- `src/ui/debug/DebugPanel.tsx` - Made debug panel draggable
- `src/game/types.ts` - Changed initial state to start with no watches owned
- `src/ui/tabs/CollectionTab.tsx` - Added empty state message when no watches owned
- `src/ui/App.test.tsx` - Updated tests to reflect new starting state

---

## Change Log

- **2026-02-23**: Implemented VA Hospital stage and JLC milestone (Story 4.3)
  - Added JLC Master Ultra Thin Moon to watch catalog as awarded watch
  - Added unlock registry entries for VA Hospital milestones
  - Created JLCAwardCelebration component with Ryan's personalized message
  - Updated collection selectors to exclude awarded watches from purchase
  - All tests pass (205 tests)

- **2026-02-23**: Bug fixes after user review
  - Changed "Graduate School Acceptance" modal title to "PhD Program Acceptance"
  - Changed "Enter Grad School" button to "Accept Offer & Begin PhD"
  - Made debug panel draggable (was blocking menu)
  - Changed fresh save to start with no watches owned - player must earn money from career first
  - Added empty state message to Collection tab when no watches owned

---

**Depends on:** Story 4.2 (Externship)  
**Required by:** Story 4.4 (Private Practice)

**Status:** review
