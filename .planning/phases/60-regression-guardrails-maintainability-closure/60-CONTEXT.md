# Phase 60: Regression Guardrails + Maintainability Closure Context

## Objective

Close v5.0 with targeted regression guardrails for newly changed surfaces and a concrete
maintainability split in v5-touched oversized modules.

## Scope

- `TEST-01`: add/refresh deterministic guardrails for catalog details, movement-tier semantics, and media contracts.
- `DEBT-01`: split meaningful catalog tab logic into dedicated modules to reduce monolithic growth.

## Inputs

- `.planning/milestones/v5.0-REQUIREMENTS.md`
- `.planning/milestones/v5.0-ROADMAP.md`
- Phase 59 implementation files.

## Guardrails

- No save-schema or localStorage contract changes.
- Preserve stable selectors/test IDs used by existing suites.
- Keep refactors behavior-preserving and covered by targeted verification.
