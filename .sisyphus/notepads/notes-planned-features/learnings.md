# Learnings (notes-planned-features)

Append-only. Record conventions, patterns, and gotchas discovered while executing `.sisyphus/plans/notes-planned-features.md`.

## 2026-01-27T02:59:55Z Task: verification sweep

- Baseline verification passes: `pnpm -s run typecheck`, `pnpm -s run lint`, `pnpm -s run test:unit`, `pnpm -s run test:e2e`, `pnpm -s run build`.
- "Near unlock" reveal behavior is already aligned to 80% and unit-tested in `tests/maison.unit.test.tsx` (0.79 vs 0.8 boundaries).
- Theme mode toggles via `document.documentElement` `data-theme` + CSS `[data-theme="light"]` overrides; confirmed via Playwright script that body background color changes.
- GitHub Pages deploy is already wired in `.github/workflows/pages.yml` and Playwright e2e runs against the configured base path.
