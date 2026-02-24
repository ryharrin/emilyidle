# Story 1.5: Error Boundaries & Reliability

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want the game to never show a white screen, even if something breaks,  
so that the gift experience is never ruined by a crash.

## Acceptance Criteria

1. Given the app root, when a component throws an error, then the root error boundary catches it and shows a friendly fallback.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.5]
2. Given any error boundary fallback, when it renders, then it shows: (1) a plain-language message, (2) an export-save button, (3) a reload button.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.5]
3. Given individual tabs/panels, when a tab-level error occurs, then only that tab shows a fallback; other tabs remain functional.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.5]
4. Given a mini-game area, when a mini-game crashes, then only the mini-game shows a fallback; the rest of the app continues.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.5]

## Tasks / Subtasks

- [x] Add root error boundary (AC: 1, 2)
  - [x] Wrap the application root with `react-error-boundary`.
  - [x] Implement a fallback UI component (e.g., `src/ui/errors/ErrorFallback.tsx`) that:
    - [x] Uses plain language (no stack traces in the primary message).
    - [x] Provides Export Save button.
    - [x] Provides Reload button (hard reload or `location.reload()`).
  - [x] Ensure fallback is touch-friendly (>= 44x44 tap targets).  
    [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.7 touch target requirement]

- [x] Add export-save plumbing (AC: 2)
  - [x] Provide an export function accessible from UI even during partial failures:
    - [x] `exportSave()` should produce a clipboard-friendly string (likely the same serialized JSON used by persistence).
  - [x] Export should never throw; if export fails, show a clear error message.
  - [x] Keep persistence logic domain-pure: export uses `serializeSave(state)` from `src/game/persistence.ts`.  
    [Source: `_bmad-output/game-architecture.md` Data Persistence; Pattern 4]

- [x] Add feature-level boundaries (AC: 3, 4)
  - [x] Create wrapper components for:
    - [x] Tab panels (even if UI shell is not built yet, create placeholders to enforce the pattern).
    - [x] Mini-game area boundary wrapper (placeholder until mini-games exist).
  - [x] Each boundary uses the same fallback component but can override the plain-language message (scope-specific).
  - [x] Confirm an error in one boundary does not unmount others (React tree structure).

- [x] Add minimal “crash test” components to prove boundaries work (AC: 1, 3, 4)
  - [x] In dev mode only, provide a small toggle/button that triggers a controlled throw inside:
    - [x] A tab panel area
    - [x] A mini-game area
  - [x] This is not shipped UI; it is for verifying isolation behavior early.

- [x] Tests (AC: 1, 2)
  - [x] Add `src/ui/errors/ErrorBoundary.unit.test.tsx` verifying:
    - [x] Root boundary renders fallback when a child throws.
    - [x] Fallback contains Export Save and Reload controls.

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- “No white screen” is non-negotiable for this Emily-only gift build.
- Boundaries must be layered:
  - Root boundary: last-resort protection.
  - Feature boundaries: keep the rest of the app alive (tabs, mini-games).
- Export save must be available from *any* fallback so progress is never trapped.

### Technical Requirements

- Library: `react-error-boundary@6.1.1` (already installed in Story 1.1).  
  [Source: `_bmad-output/implementation-artifacts/1-1-project-initialization-and-tooling.md`]
- Fallback must be human-readable and not blamey.
- No time estimates in UX copy or system messages.

### Architecture Compliance

- Reliability pattern: Root + per-tab + mini-games boundaries.  
  [Source: `_bmad-output/game-architecture.md` Reliability / Error Handling]
- Domain errors should be represented via `Result<T>` where possible; boundaries are for unexpected exceptions.  
  [Source: `_bmad-output/game-architecture.md` Pattern 4: Result Type]

### Library / Framework Requirements

- Do not add alternative boundary libraries; use `react-error-boundary`.

### File Structure Requirements

- Suggested files:
  - `src/ui/errors/ErrorFallback.tsx`
  - `src/ui/errors/RootErrorBoundary.tsx` (optional wrapper)
  - `src/ui/errors/FeatureErrorBoundary.tsx` (optional wrapper)
  - `src/ui/errors/ErrorBoundary.unit.test.tsx`
  - Wiring in `src/main.tsx` and/or `src/ui/App.tsx`

### Testing Requirements

- Tests should assert DOM presence of:
  - Plain-language message element
  - Export Save button
  - Reload button

### References

- `_bmad-output/planning-artifacts/epic-1-foundation.md` (Story 1.5 ACs)
- `_bmad-output/game-architecture.md` (Reliability; Result<T> pattern)
- `_bmad-output/implementation-artifacts/1-4-persistence-and-save-system.md` (export/save plumbing)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from sprint backlog ordering (`sprint-status.yaml`)
- ACs sourced from Epic 1 Foundation (Story 1.5)
- Reliability constraints sourced from Game Architecture (root + per-feature boundaries)

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added root and feature-level error boundaries using `react-error-boundary`.
- Implemented a friendly fallback UI with Export Save (clipboard) and Reload actions.
- Added dev-only crash harness buttons to validate error isolation early.
- Added unit tests proving fallback render and boundary isolation.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/1-5-error-boundaries-and-reliability.md`
- `src/ui/errors/ErrorFallback.tsx`
- `src/ui/errors/RootErrorBoundary.tsx`
- `src/ui/errors/FeatureErrorBoundary.tsx`
- `src/ui/errors/exportSave.ts`
- `src/ui/errors/ErrorBoundary.unit.test.tsx`
- `src/ui/App.tsx`

### Change Log

- 2026-02-23: Implemented Story 1.5 layered error boundaries + export/reload fallback + dev crash harness + tests; gates green; status moved to review.
- 2026-02-23: Review fix: show exported save text in fallback when clipboard copy fails; status moved to done.
