# Dogfood Environment Note (2026-02-27)

Recommendation: run player UX dogfooding against a production-like build by executing `pnpm build` followed by `pnpm preview`, then play through key onboarding and therapy loops in the preview session.

Rationale:
- `build` + `preview` better matches shipped runtime behavior than `pnpm dev`.
- Player-facing copy and lock-state flows are easier to validate end-to-end in this mode.
