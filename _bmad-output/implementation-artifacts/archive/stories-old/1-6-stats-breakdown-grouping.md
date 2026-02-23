# Story 1.6: Stats Breakdown Grouping

Status: ready-for-dev

## Story

As a player,
I want the Stats tab breakdown to show grouped subtotals,
so that I can understand my rate modifiers at a glance.

## Acceptance Criteria

1. **AC1**: Modifiers grouped by category
   - Given I view the Stats tab
     When I look at the breakdown
     Then modifiers are grouped (e.g., Prestige, Upgrades, Events, Base)

2. **AC2**: Each group shows a subtotal
   - Given a group displays
     When I view it
     Then I see a subtotal line for that category

3. **AC3**: Math remains correct
   - Given the breakdown renders
     When I sum subtotals
     Then they equal the total rate shown

4. **AC4**: Mobile-friendly layout
   - Given I view on mobile
     When the breakdown displays
     Then it's compact and scannable (collapsible groups acceptable)

5. **AC5**: Unit tests verify grouping and math
   - Given the tests run
     When they complete
     Then they assert subtotal math and grouping structure

## Tasks / Subtasks

- [ ] Task 1: Add grouping structure to selectors (AC: 1, 3)
  - [ ] Audit current breakdown in `src/game/selectors/index.ts`
  - [ ] Add `groupId` to breakdown terms OR create wrapper that returns grouped structure
  - [ ] Define groups: Prestige, Upgrades, Events, Sets, Base, Other
  - [ ] Calculate subtotals per group
  - [ ] Ensure math: sum(subtotals) == total
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 2: Update StatsTab rendering (AC: 1, 2, 4)
  - [ ] Modify `src/ui/tabs/StatsTab.tsx` to render groups
  - [ ] Add subtotal line per group
  - [ ] Use existing primitives (`.panel`, `.card`, `.stats-grid`)
  - [ ] Make groups collapsible if needed for mobile
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 3: Add unit tests (AC: 3, 5)
  - [ ] Create/extend `tests/rate-breakdowns.unit.test.ts`
  - [ ] Test: Subtotal math matches sum of underlying terms
  - [ ] Test: Grouping doesn't drop or duplicate terms
  - [ ] Test: All groups present and accounted for
  - [ ] Verify: `pnpm -s run test:unit -- tests/rate-breakdowns.unit.test.ts`

## Dev Notes

### Architecture Patterns

- Keep selector logic pure
- Don't change existing rate calculations (only presentation)
- Use existing CSS primitives
- Maintain test coverage

### Source Tree Components

**Modified files:**

- `src/game/selectors/index.ts` - Add grouping structure
- `src/ui/tabs/StatsTab.tsx` - Render grouped breakdown
- `src/style.css` - Group styling (if needed)
- `tests/rate-breakdowns.unit.test.ts` - Add coverage

### Data Structure Options

**Option A: Add groupId to existing terms**

```typescript
interface BreakdownTerm {
  label: string;
  valueCents: number;
  groupId: "prestige" | "upgrades" | "events" | "sets" | "base" | "other";
}
```

**Option B: Return grouped structure**

```typescript
interface GroupedBreakdown {
  groups: Array<{
    id: string;
    label: string;
    terms: BreakdownTerm[];
    subtotalCents: number;
  }>;
  totalCents: number;
}
```

### Testing Standards

- Unit tests must verify:
  1. All terms are assigned to a group
  2. No terms are duplicated across groups
  3. Subtotal math is correct (sum of terms == subtotal)
  4. Total math is correct (sum of subtotals == total)

### References

- Source: `.planning/phases/47-mobile-and-ui-polish/47-06-PLAN.md`

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - Enhancement

### Completion Notes List

- [ ] Don't change existing rate math
- [ ] Ensure subtotal math is correct
- [ ] Add unit test coverage
- [ ] Keep mobile UX compact

### File List

**Modified files:**

- `src/game/selectors/index.ts`
- `src/ui/tabs/StatsTab.tsx`
- `src/style.css`
- `tests/rate-breakdowns.unit.test.ts`
