# Story 5.1: Complete Watch Catalog Data

**Story ID:** 5.1  
**Epic:** 5 - Collection & Prestige  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** developer,  
**I want** the full 100+ watch catalog with all 4 tiers,  
**So that** the collection has authentic depth and progression.

## Acceptance Criteria

1. **Given** the watch data, when I inspect all entries, then there are 100+ watches across Quartz, Manual, Automatic, and Tourbillon tiers.
2. **Given** each watch entry, when I inspect it, then it has: id, name, brand, priceCents, tier, imageUrl, enjoymentRate, passiveRate, isFavorite, unlockCondition.
3. **Given** Emily's favorites, when I filter by isFavorite, then Royal Oaks, Rolexes, and rose gold pieces are highlighted.
4. **Given** tier pricing, when I inspect prices, then Quartz < Manual < Automatic < Tourbillon (exponential scaling).

---

## Technical Requirements

### Watch Data Structure
```typescript
export interface Watch {
  id: string;                    // kebab-case
  name: string;
  brand: string;
  priceCents: number;
  tier: 'quartz' | 'manual' | 'automatic' | 'tourbillon';
  imageUrl: string;
  enjoymentRate: number;         // Per mini-game
  passiveRate: number;           // Per second
  isFavorite: boolean;           // Emily's favorites
  unlockCondition?: string;      // Stage required
}

// 100+ watches defined
export const WATCHES: Watch[] = [
  // Quartz tier (30+ watches)
  { id: 'casio-f91w', name: 'Casio F-91W', brand: 'Casio', priceCents: 2000, tier: 'quartz', ... },
  // ... more quartz
  
  // Manual tier (25+ watches)
  { id: 'seiko-5-snk', name: 'Seiko 5 SNK', brand: 'Seiko', priceCents: 15000, tier: 'manual', ... },
  // ... more manual
  
  // Automatic tier (30+ watches)
  { id: 'rolex-datejust', name: 'Rolex Datejust', brand: 'Rolex', priceCents: 100000, tier: 'automatic', isFavorite: true, ... },
  // ... more automatic
  
  // Tourbillon tier (15+ watches)
  { id: 'ap-royal-oak', name: 'Audemars Piguet Royal Oak', brand: 'AP', priceCents: 500000, tier: 'tourbillon', isFavorite: true, ... },
  // ... more tourbillon
];
```

### Pricing Tiers
- Quartz: $20 - $500
- Manual: $150 - $2,000
- Automatic: $1,000 - $20,000
- Tourbillon: $20,000 - $500,000+

---

## Implementation

- [ ] Define all 100+ watches in data file
- [ ] Organize by tier with proper pricing
- [ ] Mark Emily's favorites (Royal Oak, Rolex, rose gold)
- [ ] Add unlock conditions per tier
- [ ] Create image URLs mapping
- [ ] Verify exponential price scaling

---

**Depends on:** Story 2.2 (Watch Data foundation)  
**Required by:** Story 5.2 (Catalog Loading)

**Status:** ready-for-dev
