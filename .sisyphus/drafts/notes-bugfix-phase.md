# Draft: Bugfixes From NOTES.md

## Requirements (confirmed)
- User wants plans for bug fixes listed in `NOTES.md`.
- User also wants to include/fix additional bugs discovered during planning.

## Requirement Clarification
- Authoritative bug list source: Use current automated test warnings (selected by user).

## What I Observed (repo state)
- Root `NOTES.md` contains a `Bug fixes:` heading, but it is currently empty.
- Automated checks currently pass:
  - `pnpm run test:unit` passes, but prints warnings:
    - React Testing Library warning: `An update to App inside a test was not wrapped in act(...)` (points at `src/App.tsx`).
    - React DOM warning: `The tag <search> is unrecognized in this browser` (points at the catalog filter wrapper in `src/App.tsx`).
  - `pnpm run test:e2e` passes.
  - `pnpm run lint` passes.
  - `pnpm run typecheck` passes.

## Candidate Bugfix Items (proposed)
- Replace non-standard `<search>` element in `src/App.tsx` with standards-compliant markup (`<form role="search">` or similar) while preserving `data-testid`.
- Prevent the requestAnimationFrame simulation loop/autosave loop in `src/App.tsx` from running during Vitest to eliminate `act(...)` warnings.

## Scope Boundaries
- INCLUDE: Bug fixes explicitly listed in `NOTES.md` (once identified) + warnings/bugs discovered during verification runs.
- EXCLUDE (default): New game design work (dual-currency / prestige redesign) and feature work not described as a bug fix.

## Open Questions
- Whether to record implemented bugfixes back into `NOTES.md` once fixed (optional documentation step).
