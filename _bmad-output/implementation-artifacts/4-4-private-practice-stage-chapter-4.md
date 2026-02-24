# Story 4.4: Private Practice Stage (Chapter 4)

**Story ID:** 4.4  
**Epic:** 4 - Career Journey  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to advance to Private Practice,  
**So that** I experience independence and unlock tourbillon watches.

## Acceptance Criteria

1. **Given** I advance to Private Practice, when the transition triggers, then income reaches High level and Tourbillon watches unlock.
2. **Given** Private Practice, when therapy sessions run, then vignettes reflect building a clientele and entrepreneurship.
3. **Given** the stage transition, when unlocks trigger, then premium home features become available.

---

## Technical Requirements

### Stage Data
```typescript
{
  id: 'private-practice',
  title: 'Private Practice',
  xpRequired: 2000,
  incomePerSecCents: 100,
  enjoymentCost: 20,
  description: 'Independence, building clientele',
  unlocks: ['tourbillon-tier', 'premium-home']
}
```

### Vignettes
- Entrepreneurship challenges
- Building reputation
- Client relationship themes

---

## Implementation

- [ ] Add Private Practice to career stages
- [ ] Create therapy vignettes
- [ ] Implement tourbillon tier unlock
- [ ] Add premium home features unlock
- [ ] Create Ryan message for this milestone

---

**Depends on:** Story 4.3 (VA Hospital)  
**Required by:** Story 4.5 (Group Practice)

**Status:** ready-for-dev
