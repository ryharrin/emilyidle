## 2026-01-17 Task: 08-collection-integration

- Fixed Maison panel JSX by removing duplicated fragments and restoring the reset fieldset structure in `src/App.tsx`.
- Resolved init order error by defining `canPrestigeMaison` before its first use in `src/App.tsx`.
- Updated Playwright expectations to target specific Maison gain values and avoid strict-mode text collisions.
- Full verification passes: `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test:unit`, `pnpm run test:e2e`.
