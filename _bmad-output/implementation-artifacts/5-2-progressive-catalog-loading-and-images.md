# Story 5.2: Progressive Catalog Loading & Images

**Story ID:** 5.2  
**Epic:** 5 - Collection & Prestige  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** the watch catalog to load smoothly with beautiful images,  
**So that** browsing my collection feels premium and responsive.

## Acceptance Criteria

1. **Given** the catalog contains 100+ watches, when I browse the collection, then @tanstack/react-virtual virtualizes the list for smooth performance.
2. **Given** watch images, when they load, then skeleton placeholders show until the image is ready.
3. **Given** an image format, when served, then WebP is used with fallback support.
4. **Given** the current view, when I browse, then current + nearby images are preloaded; distant images lazy-load.

---

## Technical Requirements

### Virtualization
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function WatchCatalog() {
  const watches = useGameState(allWatchesSelector);
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: watches.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5  // Preload 5 items before/after viewport
  });
  
  return (
    <div ref={parentRef}>
      {virtualizer.getVirtualItems().map(item => (
        <WatchCard 
          key={watches[item.index].id}
          watch={watches[item.index]}
          style={{ height: item.size }}
        />
      ))}
    </div>
  );
}
```

### Image Loading
```typescript
function WatchImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="watch-image-container">
      {!loaded && <Skeleton className="watch-skeleton" />}
      <picture>
        <source srcSet={`${src}.webp`} type="image/webp" />
        <img
          src={`${src}.jpg`}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      </picture>
    </div>
  );
}
```

---

## Implementation

- [ ] Implement react-virtual virtualization
- [ ] Create WatchCard component
- [ ] Add skeleton placeholders
- [ ] Implement WebP with JPEG fallback
- [ ] Add preloading for nearby images
- [ ] Optimize scroll performance

---

**Depends on:** Story 5.1 (Catalog Data)  
**Required by:** Story 5.7 (Completion Tracking)

**Status:** ready-for-dev
