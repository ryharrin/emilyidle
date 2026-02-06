# Phase 49: Mobile & UX Polish - Research

**Researched:** 2026-02-06
**Domain:** Mobile navigation + accessibility polish + catalog UX performance + timeline surfacing
**Confidence:** HIGH (repo patterns + existing tests + targeted virtualization research)

## Summary

Phase 49 is a broad UX phase with one notable technical decision: `VIRTUAL-01` needs true list virtualization for catalog scale. The codebase already has strong navigation/modality/test contracts, so most requirements should extend existing patterns instead of introducing new architecture.

The safest approach is:
- Keep behavior deterministic in selectors/actions.
- Keep persistence keys/schema stable.
- Keep `data-testid` and ARIA contracts stable.
- Add one focused dependency for virtualization (`@tanstack/react-virtual`) rather than hand-rolling windowing.

## Discovery Level

- **Level:** 2 (standard research)
- **Why:** New external dependency decision for virtualization (`VIRTUAL-01`) with medium-risk UX/perf implications.

## Standard Stack

### Core (existing)

| Tool | Version | Use in Phase 49 |
|---|---:|---|
| React | 18.3.x | UI composition for nav, modals, tabs, timeline |
| TypeScript | 5.8.x | Selector typing and contract-safe refactors |
| Playwright | 1.49.x | Mobile/UX regression coverage |
| Vitest + Testing Library | 1.6.x / 16.x | Unit contracts for state and component rendering |

### Supporting (recommended)

| Tool | Status | Why |
|---|---|---|
| `@tanstack/react-virtual` | Add | Headless virtualization with predictable React integration and good mobile performance |

Installation (when executing `49-06`):

```bash
pnpm add @tanstack/react-virtual
```

## Architecture Patterns to Reuse

### Pattern 1: Preserve tab semantics while changing visuals
- Keep `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, roving focus.
- Keep current keyboard nav (Arrow/Home/End + Enter/Space) and add numeric shortcuts as additive behavior.

### Pattern 2: Selector-backed readiness and breakdowns
- Readiness badges (`TAB-01`) should be computed from selector/state output, not ad-hoc UI booleans.
- Stats grouping/breakdowns (`STATS-01`, `BREAK-01`, `SOFTCAP-01`) should consume selector helpers and avoid duplicate formulas.

### Pattern 3: Modal/help accessibility baseline
- Reuse focus trap + inert background + keyboard close flow from current `HelpModal` and interaction modals.
- Improve layout and tap target sizes without regressing focus loops.

### Pattern 4: Virtualized catalog rendering
- Use `useVirtualizer` with explicit scroll container and overscan.
- Keep tier-lane semantics and test anchors intact even when rows are virtualized.

## Don’t Hand-Roll

| Problem | Avoid | Use |
|---|---|---|
| Large list windowing | custom manual virtualization math | `@tanstack/react-virtual` |
| Keyboard shortcut routing | scattered key handlers per component | centralized guarded handler in App/nav layer |
| Toast stack state | ad-hoc timeout logic in many tabs | shared toast host component with deterministic queue |

## Common Pitfalls

1. **Shortcut conflicts:** Number key handling can hijack typing in inputs/search fields if target checks are missing.
2. **Selector drift:** UI-only math for badges/breakdowns diverges from domain logic and becomes flaky.
3. **Virtualization regressions:** Losing stable test IDs or changing lane semantics breaks existing e2e contracts.
4. **Persistence contract leaks:** New onboarding/UI preferences can accidentally add new keys and break guardrails.
5. **Motion-only feedback:** Count-up/floating feedback without reduced-motion fallback harms accessibility.

## Sources

### Repo evidence
- `src/App.tsx` (tab wiring, settings persistence, top-level stat readout)
- `src/ui/tabs/CatalogTab.tsx` (filters, card rendering, action affordances)
- `src/ui/help/HelpModal.tsx` (focus trap + keyboard flow)
- `src/ui/tabs/career/CareerPanel.tsx` + `src/ui/tabs/career/CareerMap.tsx` (career progression surfaces)
- `tests/mobile-navigation.spec.ts`, `tests/touch-targets.spec.ts`, `tests/selectors-contract.spec.ts`, `tests/localstorage-keys.unit.test.ts`

### External reference (virtualization)
- Context7 `/tanstack/virtual`: `useVirtualizer` patterns for scroll container, overscan, dynamic measurement.

## Recommendation

Proceed with 10 execute plans split by surface area and dependency waves. Keep all changes additive to selector/accessibility/save contracts and prove each slice with explicit command-level verification.

---

*Phase: 49-mobile-ux-polish*
*Research completed: 2026-02-06*
