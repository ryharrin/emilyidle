# Technology Stack

**Analysis Date:** 2026-01-21

## Languages

**Primary:**
- TypeScript 5.8 - Application and tests in `src/`, `tests/` (`package.json`, `tsconfig.json`)

**Secondary:**
- CSS - Global styles in `src/style.css`
- HTML - Entry document `index.html`
- JSON - Data blobs in `watch-images.json`

## Runtime

**Environment:**
- Browser runtime (React SPA) - `src/App.tsx`, `src/main.tsx`
- Node.js (build/test tooling) - `package.json`, `.github/workflows/pages.yml` (Node 22)

**Package Manager:**
- pnpm 9.15.0 - `package.json`
- Lockfile: `pnpm-lock.yaml` present (also `package-lock.json`)

## Frameworks

**Core:**
- React 18.3 - UI framework - `package.json`, `src/App.tsx`
- Vite 6.0 - Dev server/build - `vite.config.ts`

**Testing:**
- Vitest 1.6 - Unit tests - `vitest.config.ts`, `tests/*.unit.test.tsx`
- Playwright 1.49 - E2E tests - `playwright.config.ts`, `tests/*.spec.ts`

**Build/Dev:**
- TypeScript 5.8 - Typecheck - `tsconfig.json`
- ESLint 9.39 + Prettier 3.8 - Lint/format - `eslint.config.js`, `.prettierrc.json`

## Key Dependencies

**Critical:**
- react 18.3.1 - React runtime - `package.json`
- react-dom 18.3.1 - DOM renderer - `package.json`
- @vitejs/plugin-react 4.3.4 - Vite React integration - `package.json`
- vite 6.0.0 - Build/dev tooling - `package.json`

**Infrastructure:**
- vitest 1.6.0 - Unit testing - `package.json`
- @playwright/test 1.49.1 - Browser testing - `package.json`
- @testing-library/react 16.1.0 - UI test utilities - `package.json`

## Configuration

**Environment:**
- No .env files detected; configuration via code and `import.meta.env` checks - `src/App.tsx`
- localStorage keys for saves/settings - `src/game/persistence.ts`, `src/App.tsx`

**Build:**
- `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `.prettierrc.json`

## Platform Requirements

**Development:**
- Any OS with Node.js + pnpm - `package.json`
- Browser runtime; dev server on 5177 - `package.json`, `playwright.config.ts`

**Production:**
- Static build in `dist/` deployed to GitHub Pages - `.github/workflows/pages.yml`
- Base path `/emilyidle/` configured for Pages - `vite.config.ts`

---

*Stack analysis: 2026-01-21*
*Update after major dependency changes*
