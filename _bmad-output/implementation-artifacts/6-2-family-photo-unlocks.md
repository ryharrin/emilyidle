# Story 6.2: Family Photo Unlocks

**Story ID:** 6.2  
**Epic:** 6 - Home Life  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** family photos to unlock at career milestones,  
**So that** each career achievement is paired with an emotional family moment.

## Acceptance Criteria

1. **Given** Hour 1 milestone, when triggered, then first family photo unlocks (kids as babies).
2. **Given** career stage transitions, when each new stage is reached, then era-appropriate family photos unlock (showing kids at different ages).
3. **Given** Chapter 5 milestones, when Group Practice is reached, then the full family gallery is available.
4. **Given** a photo unlock, when it triggers, then a gentle reveal animation plays and a toast notification appears.

---

## Technical Requirements

### Photo Data
```typescript
interface FamilyPhoto {
  id: string;
  title: string;
  imageUrl: string;
  unlockAtStage: CareerStage['id'];
  year: string;  // "2018", "2020", etc.
  description: string;
}

const FAMILY_PHOTOS: FamilyPhoto[] = [
  {
    id: 'photo-babies',
    title: 'First Days',
    imageUrl: '/photos/babies.jpg',
    unlockAtStage: 'phd-student',
    year: '2018',
    description: 'Freddy, Sam, and Simi as babies'
  },
  // ... more photos for each stage
];
```

### Unlock System
```typescript
// Triggered by ADVANCE_CAREER action
case "ADVANCE_CAREER": {
  const newState = { ...state };
  const newStage = action.payload.newStage;
  
  // Unlock photos for this stage
  const newPhotos = FAMILY_PHOTOS
    .filter(p => p.unlockAtStage === newStage)
    .map(p => p.id);
  
  newState.unlockedHomeItems = [...state.unlockedHomeItems, ...newPhotos];
  
  return newState;
}
```

---

## Implementation

- [ ] Define all family photos with metadata
- [ ] Implement photo unlock on career advancement
- [ ] Create unlock notification toast
- [ ] Add reveal animation
- [ ] Organize photos chronologically
- [ ] Add year labels

---

**Depends on:** Story 4.1 (Career Stages)  
**Required by:** Story 6.1 (Gallery UI)

**Status:** ready-for-dev
