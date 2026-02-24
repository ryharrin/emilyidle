# Story 5.3: Tier Unlock Progression

**Story ID:** 5.3  
**Epic:** 5 - Collection & Prestige  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** watch tiers to unlock as I progress through my career,  
**So that** my collection grows richer as I advance.

## Acceptance Criteria

1. **Given** I start the game, when I view the market, then only Quartz watches are available.
2. **Given** I reach Externship, when Manual watches unlock, then they appear in the market with a "New" indicator.
3. **Given** I reach VA Hospital, when Automatic watches unlock, then they appear in the market.
4. **Given** I reach Private Practice, when Tourbillon watches unlock, then they appear as the premium tier.
5. **Given** locked tiers, when I view them in the catalog, then they show as silhouettes with unlock requirements.

---

## Technical Requirements

### Tier Unlock Mapping
```typescript
const TIER_UNLOCKS: Record<string, CareerStage['id']> = {
  'quartz': 'phd-student',
  'manual': 'externship',
  'automatic': 'va-hospital',
  'tourbillon': 'private-practice'
};

export function isTierUnlocked(
  tier: string,
  currentStage: CareerStage['id']
): boolean {
  const requiredStage = TIER_UNLOCKS[tier];
  const stageOrder = CAREER_STAGES.map(s => s.id);
  return stageOrder.indexOf(currentStage) >= stageOrder.indexOf(requiredStage);
}
```

### Locked Tier Display
```typescript
function LockedTierCard({ tier }: { tier: string }) {
  const requiredStage = TIER_UNLOCKS[tier];
  
  return (
    <div className="locked-tier">
      <div className="silhouette" />
      <p>Unlock at {CAREER_STAGES.find(s => s.id === requiredStage)?.title}</p>
    </div>
  );
}
```

---

## Implementation

- [ ] Define tier unlock mapping
- [ ] Implement isTierUnlocked selector
- [ ] Create LockedTierCard component
- [ ] Add "New" indicators for newly unlocked tiers
- [ ] Filter market by unlocked tiers
- [ ] Show silhouettes for locked tiers

---

**Depends on:** Story 4.1 (Career Stages)  
**Required by:** Story 5.1 (Catalog Data)

**Status:** ready-for-dev
