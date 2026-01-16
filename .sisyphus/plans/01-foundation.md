# Phase 01 — Foundation

Purpose: Establish a stable Vite + TypeScript baseline, implement a minimal playable idle loop, and add persistence so the game is usable across sessions.

## Source context

- `.sisyphus/plans/01-foundation.md`
- `.sisyphus/plans/02-collection-loop.md`
- `.sisyphus/plans/03-catalog-images.md`

## Tasks

### 01-01 — Stack + scaffolding

- [x] Scaffold Vite + TypeScript app
  - **Files**: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/*`
  - **Verification**: `pnpm install`; `pnpm run dev`; `pnpm run build`
  - **Parallelizable**: NO

- [x] Add baseline tooling (Prettier/ESLint/typecheck)
  - **Files**: `package.json`, `.prettierrc.json`, `.prettierignore`, `eslint.config.js`, `tsconfig.json`
  - **Verification**: `pnpm run format:check`; `pnpm run lint`; `pnpm run typecheck`
  - **Parallelizable**: YES

### 01-02 — Minimal playable loop

- [x] Wire deterministic simulation runtime (fixed timestep + accumulator)
  - **Files**: `src/main.tsx`, `src/game/sim.ts`, `src/game/state.ts`
  - **Verification**: `pnpm run typecheck`; `pnpm run build`; manual: currency increases steadily in browser
  - **Parallelizable**: NO

- [x] Render core stats + add a buy action that increases income
  - **Files**: `src/App.tsx`, `src/game/state.ts`, `src/game/format.ts`
  - **Verification**: `pnpm run build`; manual: buy disabled when unaffordable; purchase increases income rate
  - **Parallelizable**: YES

### 01-03 — Persistence

- [x] Implement persistence layer with versioned save format
  - **Files**: `src/game/persistence.ts`, `src/game/state.ts`, `src/App.tsx`
  - **Verification**: manual: reload retains progress; corrupt save resets safely
  - **Parallelizable**: NO

- [x] Add export/import save (copy/paste)
  - **Files**: `src/App.tsx`, `src/game/persistence.ts`
  - **Verification**: manual: export → clear storage → import restores
  - **Parallelizable**: YES

- [x] Human verification checkpoint (Phase 1)
  - **Files**: (none)
  - **Verification**: `pnpm run dev`; verify currency increases and saves persist
  - **Parallelizable**: NO

## Plan-wide verification

- [x] `pnpm run typecheck`
- [x] `pnpm run lint`
- [x] `pnpm run build`

## Notes / assumptions

- Planning lives under `.sisyphus/` (legacy `.planning/` removed).
