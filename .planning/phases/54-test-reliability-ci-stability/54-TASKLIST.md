# Phase 54 Task List

## Tracking Board

- [x] Author context document (`54-CONTEXT.md`)
- [x] Execute `54-01-PLAN.md` (selector disambiguation + strict-mode hardening)
- [x] Execute `54-02-PLAN.md` (desktop/mobile project scoping cleanup)
- [x] Execute `54-03-PLAN.md` (mobile catalog/interaction helper stabilization)
- [x] Execute `54-04-PLAN.md` (runtime determinism + tolerant assertions)
- [x] Execute `54-05-PLAN.md` (catalog media verification hardening)
- [x] Execute `54-06-PLAN.md` (unit async hygiene + act warning cleanup)
- [ ] Execute `54-07-PLAN.md` (CI sequencing policy + regression closeout)
- [ ] Publish phase closeout summary (`54-07-SUMMARY.md`)

## Notes

- This phase targets test and CI reliability only.
- Maintain existing gameplay behavior while improving test determinism and selector quality.
- `54-01-SUMMARY.md` published with strict selector hardening for settings import/export and
  catalog owned-tab targeting, plus desktop/mobile Playwright verification on the targeted specs.
- `54-02-SUMMARY.md` published after verifying desktop/mobile project scoping behavior for
  `career-landing.spec.ts` across Chromium, Pixel 5, and iPhone 12 project matrices.
- `54-03-SUMMARY.md` published with retry-safe catalog interaction modal opening, bounded
  safe-click timing, and mobile career tree track-choice assertion hardening.
- `54-04-SUMMARY.md` published with deterministic/tolerant assertion hardening for settings clear
  save, prestige confirmation, nostalgia prestige toasts, and collection interaction invariants;
  verification passed (`5 passed`; `18 passed, 1 skipped, 0 failed`).
- `54-05-SUMMARY.md` published with explicit `/emilyidle/catalog/` source-contract assertions,
  deterministic subset decode checks, and cross-project catalog image rendering verification passed
  (`1 passed` on Chromium, Pixel 5, and iPhone 12).
- `54-06-SUMMARY.md` published with unit async hygiene cleanup in achievement toast, catalog
  favorites, and winding modal tests; replaced sleep-based waits with state-driven waits and added
  reduced-motion `matchMedia` test setup to remove ValueTicker act-warning noise; verification
  passed (`278 passed`).
- `54-07-PLAN.md` policy/docs updates applied (`package.json` stable test scripts and
  `docs/testing.md` canonical CI/local order guidance), but closeout remains blocked: required
  verification hit transient unit flake on first run (second run passed `278/278`), and
  `pnpm test:e2e` produced multiple failures before stalling in long-tail execution (process had to
  be terminated after emitting failures in `career-map.spec.ts`, `quartz-alignment.spec.ts`,
  `minigame-practice.spec.ts`, `event-calendar.spec.ts`, `catalog-expansion.spec.ts`,
  `selectors-contract.spec.ts`, `uat-screenshots.spec.ts`, `wear-one-bonus.spec.ts`,
  `career-permanent-choices.spec.ts`, and `collection-loop.spec.ts`).
