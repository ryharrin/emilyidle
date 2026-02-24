# Story 2.6: Collection Display, Watch Effects, and Watch Details

**Story ID:** 2.6  
**Epic:** 2 - Core Loop  
**Status:** done  
**Created:** 2026-02-23  
**Author:** Game Dev Scrum Master (Max)

---

## Story Foundation

### User Story
**As a** player,  
**I want** to see my watch collection beautifully displayed,  
**So that** I feel the satisfaction of building my collection.

### Acceptance Criteria

**Given** I navigate to the Collection tab,  
**When** it renders,  
**Then** I see all owned watches with images, names, tier indicators, and what each watch does.

**Given** I tap on a watch,  
**When** the detail view opens,  
**Then** I see: full image, name, tier, passive Enjoyment contribution, interaction type, reward framing.

**Given** watch effects are shown,  
**When** enjoyment-related values are displayed,  
**Then** they are whole numbers only (no decimals).

**Given** the collection grows beyond the viewport,  
**When** I scroll,  
**Then** @tanstack/react-virtual provides smooth virtualized rendering.

---

## DEV AGENT GUARDRAILS

### Technical Requirements

#### 1. Collection Selectors
```typescript
// src/game/selectors/collection.ts
export function ownedWatches(state: GameState): Watch[] {
  return WATCHES.filter(w => state.ownedWatchIds.includes(w.id));
}

export function getWatchEffects(watchId: string) {
  const watch = WATCHES.find(w => w.id === watchId);
  return {
    passiveEnjoyment: Math.floor(watch.passiveRate),
    interactionType: watch.tier,
    rewardDescription: getRewardDescription(watch.tier)
  };
}
```

#### 2. Virtualization Setup
```typescript
// Collection tab with react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

function CollectionTab() {
  const owned = useGameState(ownedWatches);
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: owned.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Height of each row
  });
  
  // Render virtualized list
}
```

---

## Implementation Checklist

- [ ] Create CollectionTab component
- [ ] Implement ownedWatches selector
- [ ] Add watch card components with images
- [ ] Create WatchDetail modal/view
- [ ] Display passive enjoyment (whole numbers)
- [ ] Show interaction type per watch
- [ ] Add tier indicators
- [ ] Implement react-virtual virtualization
- [ ] Add scroll performance optimization

---

## Dependencies

**Requires:** Story 2.2 (Watch Data), Story 2.5 (Purchase Flow)  
**Required By:** Story 5.2 (Progressive Catalog Loading)

---

**Status:** ready-for-dev
