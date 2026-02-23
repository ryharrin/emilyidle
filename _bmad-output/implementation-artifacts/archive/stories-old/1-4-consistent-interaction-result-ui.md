# Story 1.4: Consistent Interaction Result UI

Status: ready-for-dev

## Story

As a player,
I want all interaction modals to show results consistently,
so that I understand my rewards regardless of which mini-game I played.

## Acceptance Criteria

1. **AC1**: All modals show clear Miss/Good/Perfect outcome
   - Given I complete any mini-game
     When the result screen appears
     Then I see a clear outcome title (Miss/Good/Perfect)

2. **AC2**: All modals show reward result consistently
   - Given I complete any mini-game
     When the result screen appears
     Then I see the reward in a consistent format (e.g., "+X enjoyment", "+$Y cash")

3. **AC3**: Consistent styling across all modals
   - Given I view result screens
     When comparing different mini-games
     Then they use shared CSS classes and visual language

4. **AC4**: Mobile-friendly touch targets
   - Given I view results on mobile
     When I interact with the modal
     Then buttons are >= 44px and text is readable

5. **AC5**: Help content reflects all interaction types
   - Given I view Interactions help
     Then I see documentation for winding, automatic, quartz, date, and strap interactions

## Tasks / Subtasks

- [ ] Task 1: Audit current modal result UIs (AC: 1-3)
  - [ ] Review `WindingMiniGameModal.tsx` result section
  - [ ] Review `AutomaticMiniGameModal.tsx` result section
  - [ ] Review `QuartzMiniGameModal.tsx` result section
  - [ ] Document current inconsistencies

- [ ] Task 2: Create shared outcome styling (AC: 3)
  - [ ] Add `.interaction-outcome` base class in `src/style.css`
  - [ ] Define consistent styles for:
    - Outcome title (Miss/Good/Perfect)
    - Reward display
    - Cooldown message
    - Action button
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 3: Standardize each modal's result UI (AC: 1, 2, 4)
  - [ ] Update `WindingMiniGameModal.tsx` to use shared styles
  - [ ] Update `AutomaticMiniGameModal.tsx` to use shared styles
  - [ ] Update `QuartzMiniGameModal.tsx` to use shared styles
  - [ ] Update `DateMiniGameModal.tsx` (Story 1.1) to use shared styles
  - [ ] Update `StrapMiniGameModal.tsx` (Story 1.2) to use shared styles
  - [ ] Ensure touch targets >= 44px
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 4: Update help content (AC: 5)
  - [ ] Update `src/ui/help/helpContent.ts` to document all interaction types
  - [ ] Mention that rewards vary by tier and precision

- [ ] Task 5: Capture modal screenshots (Optional)
  - [ ] Extend `tests/ui-screenshots.spec.ts` to capture interaction modal results
  - [ ] Capture desktop and mobile variants
  - [ ] Verify: `pnpm -s run test:e2e -- tests/ui-screenshots.spec.ts`

## Dev Notes

### Architecture Patterns

- Don't introduce new component library
- Use existing CSS primitives (`.panel`, `.card`, `.button`)
- Keep selectors stable
- Respect reduced-motion preferences

### Source Tree Components

**Modified files:**

- `src/style.css` - Add `.interaction-outcome` shared styles
- `src/ui/components/WindingMiniGameModal.tsx` - Standardize result UI
- `src/ui/components/AutomaticMiniGameModal.tsx` - Standardize result UI
- `src/ui/components/QuartzMiniGameModal.tsx` - Standardize result UI
- `src/ui/components/DateMiniGameModal.tsx` - Use shared styles (from Story 1.1)
- `src/ui/components/StrapMiniGameModal.tsx` - Use shared styles (from Story 1.2)
- `src/ui/help/helpContent.ts` - Update documentation
- `tests/ui-screenshots.spec.ts` - Add screenshot coverage

### Testing Standards

- Visual consistency verified via screenshots (optional)
- Unit tests ensure reward display matches calculation
- Manual QA on mobile viewport

### References

- Pattern reference: Existing modal implementations
- Source: `.planning/phases/44-interaction-feedback-and-rewards/44-02-PLAN.md`

## Dependencies

**Must be completed after:**

- Story 1.1 (Set-date mini-game) - Need DateMiniGameModal to exist
- Story 1.2 (Strap-change mini-game) - Need StrapMiniGameModal to exist
- Story 1.3 (Reward scaling) - Need reward values to be meaningful

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - UI polish

### Completion Notes List

- [ ] Don't create new component library
- [ ] Use existing CSS primitives
- [ ] Ensure mobile readability
- [ ] Update help content

### File List

**Modified files:**

- `src/style.css`
- `src/ui/components/WindingMiniGameModal.tsx`
- `src/ui/components/AutomaticMiniGameModal.tsx`
- `src/ui/components/QuartzMiniGameModal.tsx`
- `src/ui/components/DateMiniGameModal.tsx`
- `src/ui/components/StrapMiniGameModal.tsx`
- `src/ui/help/helpContent.ts`
- `tests/ui-screenshots.spec.ts` (optional)
