# Story 5.7: Collection Completion Tracking

**Story ID:** 5.7  
**Epic:** 5 - Collection & Prestige  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to see how close I am to completing my collection,  
**So that** I have clear goals driving my progression.

## Acceptance Criteria

1. **Given** the Collection tab, when I view it, then a completion percentage is shown per tier and overall.
2. **Given** a tier, when all watches in it are owned, then a tier completion badge appears.
3. **Given** the full collection, when every watch is owned, then "The Perfect Collection" status is achieved (feeds into endgame).

---

## Technical Requirements

### Completion Tracking
```typescript
export function getCollectionStats(state: GameState) {
  const owned = new Set(state.ownedWatchIds);
  
  const byTier = {
    quartz: { owned: 0, total: 0 },
    manual: { owned: 0, total: 0 },
    automatic: { owned: 0, total: 0 },
    tourbillon: { owned: 0, total: 0 }
  };
  
  WATCHES.forEach(watch => {
    byTier[watch.tier].total++;
    if (owned.has(watch.id)) {
      byTier[watch.tier].owned++;
    }
  });
  
  const totalOwned = Object.values(byTier).reduce((sum, t) => sum + t.owned, 0);
  const totalWatches = WATCHES.length;
  
  return {
    byTier,
    overall: {
      owned: totalOwned,
      total: totalWatches,
      percentage: Math.floor((totalOwned / totalWatches) * 100)
    },
    isComplete: totalOwned === totalWatches
  };
}
```

### Badge Display
```typescript
function TierBadge({ tier, owned, total }: TierStats) {
  const isComplete = owned === total;
  
  return (
    <div className={`tier-badge ${isComplete ? 'complete' : ''}`}>
      <span className="tier-name">{tier}</span>
      <span className="count">{owned}/{total}</span>
      {isComplete && <span className="check">✓</span>}
    </div>
  );
}
```

---

## Implementation

- [ ] Implement getCollectionStats selector
- [ ] Create tier completion badges
- [ ] Add overall completion percentage
- [ ] Show progress in Collection tab
- [ ] Trigger "Perfect Collection" achievement
- [ ] Connect to endgame condition

---

**Depends on:** Story 5.1 (Catalog Data)  
**Required by:** Story 7.5 (Endgame - Perfect Collection condition)

**Status:** ready-for-dev
