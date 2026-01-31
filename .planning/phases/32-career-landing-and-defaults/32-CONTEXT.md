# Phase 32: Career Landing & Defaults - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase changes only initial landing + navigation defaults. It must not reshuffle tabs, rename selectors, or change career progression systems.

Primary goal: fresh saves land on Career while preserving deep links and predictable existing-save last-tab behavior.

</domain>

<decisions>
## Implementation Decisions

### Landing policy (MUST)
- Deep link: `/?tab=...` opens that tab for that navigation only.
- Deep links MUST NOT overwrite last-tab persistence (i.e., visiting with `/?tab=...` must not update the stored last tab).
- Existing saves keep last-tab persistence behavior.
- Fresh saves (no existing save) default to Career.

### Precedence order
1. Deep link tab (if valid + visible)
2. Existing save + last-tab (if present + visible)
3. Fresh save default (Career; fall back to Vault if Career is hidden)
4. Final fallback (Vault)

### Constraints
- Preserve deep links (including existing aliases like `tab=catalog`).
- Preserve predictable existing-save behavior (refresh without query params returns to last saved tab).
- Keep UI selectors stable (`id`, `data-testid`) so Playwright and existing tests do not churn.

</decisions>

<specifics>
## Specific Ideas

- Make landing selection testable via a small, pure resolver used by `src/App.tsx`.
- Cover policy with a focused unit test matrix + a Playwright smoke test (localStorage + query param behaviors).

</specifics>

<deferred>
## Deferred Ideas

- Any rework of tab naming, tab ordering, or tab gating belongs in later phases.

</deferred>

---

*Phase: 32-career-landing-and-defaults*
*Context gathered: 2026-01-30*
