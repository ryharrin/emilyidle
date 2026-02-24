# Story 1.7: UI Shell & Navigation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want a tab-based navigation shell with Home, Collection, Career, and Market tabs,  
so that I can navigate between game areas easily on mobile.

## Acceptance Criteria

1. Given the app loads, when I see the interface, then bottom navigation shows 4 tabs: Home, Collection, Career, Market.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.7]
2. Given I tap a tab, when it activates, then the corresponding panel renders and the tab is highlighted.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.7]
3. Given the UI renders on iPhone 17, when I inspect the layout, then it respects Dynamic Island and safe area insets.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.7]
4. Given the color palette, when I inspect styles, then warm cream backgrounds, rose gold accents, and navy text are used.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.7]
5. Given touch targets, when I inspect interactive elements, then all tap targets are at minimum 44x44pt.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.7]

## Tasks / Subtasks

- [x] Create navigation state + structure (AC: 1, 2)
  - [x] Add a UI-only navigation state (no domain coupling) for current tab:
    - [x] Tab ids: `home`, `collection`, `career`, `market`
  - [x] Add components for panels:
    - [x] `src/ui/tabs/HomeTab.tsx`
    - [x] `src/ui/tabs/CollectionTab.tsx`
    - [x] `src/ui/tabs/CareerTab.tsx`
    - [x] `src/ui/tabs/MarketTab.tsx`
  - [x] Add a bottom nav component with clear active state:
    - [x] `src/ui/components/BottomNav.tsx`

- [x] Implement safe-area aware layout (AC: 3)
  - [x] Add CSS that respects iOS safe areas:
    - [x] padding for `env(safe-area-inset-bottom)` for bottom nav
    - [x] top content padding for `env(safe-area-inset-top)` where appropriate
  - [x] Ensure layout still works on desktop browsers (secondary platform).

- [x] Establish palette + typography tokens (AC: 4)
  - [x] Add CSS variables (single source of truth) for:
    - [x] warm cream background
    - [x] rose gold accent
    - [x] navy text
  - [x] Ensure sufficient contrast for readability (gift-grade polish).

- [x] Enforce 44x44 tap targets (AC: 5)
  - [x] Add CSS rules for buttons/nav items that guarantee minimum size.
  - [x] Ensure icons/labels are still readable within those constraints.

- [x] Wire into `App` shell
  - [x] Replace the current placeholder `src/ui/App.tsx` with the navigation shell:
    - [x] top-level layout (content area + bottom nav)
    - [x] conditional rendering by active tab
  - [x] Keep this story UI-only; no gameplay math or progression logic.

- [x] Tests (AC: 1, 2)
  - [x] Update/extend `src/ui/App.test.tsx` to verify:
    - [x] 4 tabs render
    - [x] clicking a tab changes highlighted state and panel content

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- This is an Emily-only, touch-first experience. Navigation must feel effortless and stable.
- UI is the “face” of an active incremental game; the shell should be clean and calm.
- Do not add complex routing libraries (no React Router) unless absolutely required; local tab state is sufficient.

### Technical Requirements

- Tabs: Home, Collection, Career, Market
- Bottom navigation: always visible, safe-area aware
- Palette: warm cream + rose gold + navy
- Tap targets: >= 44x44pt

### Architecture Compliance

- UI must not embed progression math; call into `src/game/**` only for state/dispatch/selectors when those exist.  
  [Source: `_bmad-output/game-architecture.md` Project Structure]

### Library / Framework Requirements

- Prefer existing deps (React + lucide icons if needed). Do not add routing libraries.

### File Structure Requirements

- Suggested files:
  - `src/ui/App.tsx`
  - `src/ui/components/BottomNav.tsx`
  - `src/ui/tabs/HomeTab.tsx`
  - `src/ui/tabs/CollectionTab.tsx`
  - `src/ui/tabs/CareerTab.tsx`
  - `src/ui/tabs/MarketTab.tsx`
  - `src/ui/App.test.tsx` (expanded)

### Testing Requirements

- Tests should assert visible text or aria labels for each tab.
- Tests should assert active tab switching.

### References

- `_bmad-output/planning-artifacts/epic-1-foundation.md` (Story 1.7 ACs)
- `_bmad-output/gdd.md` (mobile-first intent; touch-first interactions)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from sprint backlog ordering (`sprint-status.yaml`)
- ACs sourced from Epic 1 Foundation (Story 1.7)

### Completion Notes List

- Implemented a safe-area aware tab shell with a sticky bottom nav (Home, Collection, Career, Market).
- Introduced palette + layout tokens (warm cream, rose gold, navy) via global CSS variables.
- Enforced 44x44 minimum tap targets on bottom nav items.
- Updated app tests to verify tab rendering and tab switching.
- Hardened the test environment by ensuring React Testing Library cleanup runs after each test.

### File List

- `_bmad-output/implementation-artifacts/1-7-ui-shell-and-navigation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/index.css`
- `src/test/setup.ts`
- `src/ui/App.css`
- `src/ui/App.test.tsx`
- `src/ui/App.tsx`
- `src/ui/components/BottomNav.tsx`
- `src/ui/tabs/CareerTab.tsx`
- `src/ui/tabs/CollectionTab.tsx`
- `src/ui/tabs/HomeTab.tsx`
- `src/ui/tabs/MarketTab.tsx`

### Change Log

- 2026-02-23: Implemented tab shell + bottom navigation, safe-area layout, palette tokens, and tab-switching tests; gates green; status moved to done.
