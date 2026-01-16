# Phase 01 — Foundation

Purpose: Establish a stable Vite + TypeScript baseline, implement a minimal playable idle loop, and add persistence so the game is usable across sessions.

## Source context

- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/01-foundation/01-01-PLAN.md`
- `.planning/phases/01-foundation/01-02-PLAN.md`
- `.planning/phases/01-foundation/01-03-PLAN.md`

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
  - **Files**: `src/main.ts`, `src/game/sim.ts`, `src/game/state.ts`
  - **Verification**: `pnpm run typecheck`; `pnpm run build`; manual: currency increases steadily in browser
  - **Parallelizable**: NO

- [x] Render core stats + add a buy action that increases income
  - **Files**: `src/main.ts`, `src/game/state.ts`, `src/game/format.ts`
  - **Verification**: `pnpm run build`; manual: buy disabled when unaffordable; purchase increases income rate
  - **Parallelizable**: YES

### 01-03 — Persistence

- [x] Implement persistence layer with versioned save format
  - **Files**: `src/game/persistence.ts`, `src/game/state.ts`, `src/main.ts`
  - **Verification**: manual: reload retains progress; corrupt save resets safely
  - **Parallelizable**: NO

- [x] Add export/import save (copy/paste)
  - **Files**: `src/main.ts`, `src/game/persistence.ts`
  - **Verification**: manual: export → clear storage → import restores
  - **Parallelizable**: YES

- [x] Human verification checkpoint (Phase 1)
  - **Files**: (none)
  - **Verification**: `pnpm run dev` and complete the manual checklist in `.planning/phases/01-foundation/01-03-PLAN.md`
  - **Parallelizable**: NO

## Plan-wide verification

- [x] `pnpm run typecheck`
- [x] `pnpm run lint`
- [x] `pnpm run build`

## Notes / assumptions

- Roadmap marks Phase 1 complete; `.planning/STATE.md` mentions pending human verification for 01-03. This plan treats Phase 1 as completed to match the repo’s roadmap state.
