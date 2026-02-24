# Story 6.1: Home Gallery UI & Layout

**Story ID:** 6.1  
**Epic:** 6 - Home Life  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** a beautiful Home Life gallery view,  
**So that** I can see all my unlocked family content in one warm, personal space.

## Acceptance Criteria

1. **Given** I navigate to the Home tab, when it renders, then I see a gallery layout with cards for photos, drawings, and messages.
2. **Given** locked content, when I view it, then locked slots show as subtle "???" placeholders hinting at future unlocks.
3. **Given** unlocked content, when I tap a photo or drawing, then it opens full-screen with context text.
4. **Given** the gallery on mobile, when it renders, then the grid is responsive, cards are large enough for emotional impact, and scrolling is smooth.

---

## Technical Requirements

### Gallery Layout
```typescript
function HomeGallery() {
  const unlockedItems = useGameState(unlockedHomeItemsSelector);
  const allItems = HOME_LIFE_ITEMS;
  
  return (
    <div className="home-gallery">
      {allItems.map(item => (
        unlockedItems.includes(item.id) 
          ? <UnlockedCard key={item.id} item={item} />
          : <LockedCard key={item.id} />
      ))}
    </div>
  );
}

function UnlockedCard({ item }: { item: HomeLifeItem }) {
  return (
    <motion.div 
      className="gallery-card"
      whileTap={{ scale: 0.98 }}
    >
      <img src={item.imageUrl} alt={item.title} />
      <h3>{item.title}</h3>
    </motion.div>
  );
}

function LockedCard() {
  return (
    <div className="gallery-card locked">
      <span className="placeholder">???</span>
    </div>
  );
}
```

---

## Implementation

- [ ] Create HomeGallery component
- [ ] Implement responsive grid layout
- [ ] Create UnlockedCard component
- [ ] Create LockedCard with ??? placeholder
- [ ] Add full-screen viewer modal
- [ ] Optimize for mobile touch
- [ ] Add smooth scroll behavior

---

**Depends on:** Story 2.6 (Collection Display pattern)  
**Required by:** Stories 6.2-6.6 (all home content)

**Status:** ready-for-dev
