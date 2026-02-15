# Suggested commands
## Setup and dev
- `pnpm install`
- `pnpm dev` (Vite dev server on 127.0.0.1:5177)
- `pnpm build`
- `pnpm preview`

## Quality
- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`

## Tests
- `pnpm test:unit`
- `pnpm test:e2e`
- Single unit file: `pnpm test:unit -- tests/<file>.unit.test.tsx`
- Unit by test name: `pnpm test:unit -- -t "<name>"`
- Unit watch (direct vitest): `pnpm exec vitest --config vitest.config.ts tests/<file>.unit.test.tsx`
- Single e2e file: `pnpm test:e2e -- tests/<file>.spec.ts`
- e2e grep: `pnpm test:e2e -- -g "<pattern>"`
- e2e headed: `pnpm test:e2e -- --headed`

## Utility commands (Darwin/macOS)
- `git status`, `git diff`, `git log`
- `ls`, `cd`, `pwd`
- `rg <pattern>` / `rg --files`
- `find <path> -name '<pattern>'`
- `sed -n 'start,endp' <file>`