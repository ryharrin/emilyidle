# Story 1.5: Catalog In-Page Subnav

Status: ready-for-dev

## Story

As a mobile player,
I want to jump to different catalog sections without excessive scrolling,
so that I can navigate the catalog efficiently on small screens.

## Acceptance Criteria

1. **AC1**: Horizontal subnav visible on mobile
   - Given I'm viewing the Catalog tab on mobile
     When I look at the top of the tab
     Then I see a horizontal subnav with jump links

2. **AC2**: Jump links scroll to sections
   - Given I tap a subnav link
     When the action completes
     Then the page scrolls to the corresponding section

3. **AC3**: Respects reduced-motion preferences
   - Given I have reduced-motion enabled
     When I tap a jump link
     Then scrolling is instant (no animation)

4. **AC4**: Existing anchors remain stable
   - Given existing deep-links like `catalog-shop`
     When the subnav is added
     Then those anchors continue to work

5. **AC5**: Touch-friendly targets
   - Given I use the subnav on mobile
     When I tap a link
     Then the hit target is >= 44px

## Tasks / Subtasks

- [ ] Task 1: Define section anchors (AC: 4)
  - [ ] Audit current catalog structure
  - [ ] Identify existing anchors (e.g., `catalog-shop`)
  - [ ] Define new anchors if needed:
    - `catalog-unowned` (purchase grid)
    - `catalog-owned` (owned watches)
    - `catalog-filters` (filter controls)
    - `catalog-tier-{id}` (tier sections)
  - [ ] Verify anchors don't break existing selectors

- [ ] Task 2: Implement subnav component (AC: 1, 5)
  - [ ] Create horizontal chip list subnav in `CatalogTab.tsx`
  - [ ] Position near top of tab
  - [ ] Style with existing primitives (`.chip`, `.button`)
  - [ ] Ensure touch targets >= 44px
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 3: Wire jump links (AC: 2, 3)
  - [ ] Add click handlers that call `scrollIntoView({ behavior: 'smooth' })`
  - [ ] Check `prefers-reduced-motion` and use `'auto'` if enabled
  - [ ] Map each chip to corresponding section anchor
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 4: Verify existing functionality (AC: 4)
  - [ ] Run existing catalog tests
  - [ ] Verify: `pnpm -s run test:e2e -- tests/catalog.spec.ts` (or equivalent)

## Dev Notes

### Architecture Patterns

- Keep markup minimal
- Don't change existing `data-testid` selectors
- Use existing CSS primitives
- Respect accessibility preferences

### Source Tree Components

**Modified files:**

- `src/ui/tabs/CatalogTab.tsx` - Add subnav and anchors
- `src/style.css` - Subnav styling

**Anchor strategy:**

- Keep `catalog-shop` stable (existing)
- Add `catalog-unowned` for unowned watches section
- Add `catalog-owned` for owned watches section
- Add `catalog-filters` for filter controls
- Keep tier section anchors as-is

### Testing Standards

- Manual QA on mobile viewport (Pixel 5, iPhone 12)
- Verify jump links work
- Verify reduced-motion respected
- Verify existing selectors still pass

### References

- Source: `.planning/phases/47-mobile-and-ui-polish/47-04-PLAN.md`

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - UI polish

### Completion Notes List

- [ ] Keep existing selectors stable
- [ ] Respect reduced-motion
- [ ] Ensure mobile-friendly touch targets
- [ ] Test on actual mobile viewports

### File List

**Modified files:**

- `src/ui/tabs/CatalogTab.tsx`
- `src/style.css`
