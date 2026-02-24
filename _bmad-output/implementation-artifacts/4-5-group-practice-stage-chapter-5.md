# Story 4.5: Group Practice Stage (Chapter 5)

**Story ID:** 4.5  
**Epic:** 4 - Career Journey  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to reach Group Practice,  
**So that** I experience collaboration and near-completion of the journey.

## Acceptance Criteria

1. **Given** I advance to Group Practice, when the transition triggers, then income reaches Very High level.
2. **Given** Group Practice, when therapy sessions run, then vignettes reflect collaboration, mentorship, and expansion.
3. **Given** the stage transition, when unlocks trigger, then final watch tiers and complete home gallery become available.

---

## Technical Requirements

### Stage Data
```typescript
{
  id: 'group-practice',
  title: 'Group Practice',
  xpRequired: 8000,
  incomePerSecCents: 200,
  enjoymentCost: 35,
  description: 'Collaboration, mentorship, growth',
  unlocks: ['all-tiers', 'complete-home']
}
```

### Vignettes
- Mentoring junior psychologists
- Collaborative practice
- Professional growth themes

---

## Implementation

- [ ] Add Group Practice to career stages
- [ ] Create therapy vignettes
- [ ] Unlock all watch tiers
- [ ] Enable complete home gallery
- [ ] Create Ryan message

---

**Depends on:** Story 4.4 (Private Practice)  
**Required by:** Story 4.6 (Retirement)

**Status:** ready-for-dev
