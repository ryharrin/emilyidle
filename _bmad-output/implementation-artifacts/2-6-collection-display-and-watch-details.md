# Story 2.6: Collection Display & Watch Details

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want to see my watch collection beautifully displayed,  
so that I feel the satisfaction of building my collection.

## Acceptance Criteria

1. Given I navigate to the Collection tab, when it renders, then I see all owned watches with images, names, and tier indicators.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.6]
2. Given I tap on a watch, when the detail view opens, then I see the full image, name, tier, enjoyment rate, and interaction button.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.6]
3. Given the collection grows beyond the viewport, when I scroll, then `@tanstack/react-virtual` provides smooth virtualized rendering.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.6]

## Tasks / Subtasks

- [x] Implement Collection tab list UI (AC: 1, 3)
  - [x] Show owned watches (image + name + tier)
  - [x] Use `@tanstack/react-virtual` for list rendering (with a safe fallback when virtualization cannot measure)

- [x] Implement watch detail view (AC: 2)
  - [x] Detail modal with full image, tier, enjoyment rate
  - [x] Interaction button (quartz alignment for quartz watches)

- [x] Tests
  - [x] UI test for rendering at least one owned watch and opening details

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- Collection must feel good even with long lists; virtualize from the start.
- Detail view is the interaction entry point for mini-games.

### References

- `_bmad-output/planning-artifacts/epic-2-core-loop.md` (Story 2.6 ACs)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Completion Notes List

- Implemented Collection tab with a virtualized list using `@tanstack/react-virtual` for smooth scrolling as collections grow.
- Added watch detail modal showing image, tier, and enjoyment rate, plus quartz interaction entry point.
- Added an integration test covering list rendering and detail open; verified gates.

### File List

- `_bmad-output/implementation-artifacts/2-6-collection-display-and-watch-details.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/ui/tabs/CollectionTab.tsx`
- `src/ui/App.test.tsx`

### Change Log

- 2026-02-23: Implemented collection display + detail view + virtualized rendering; gates green; status moved to done.
