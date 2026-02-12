# UX Clarity Program — PR Checklist Templates (by Agent Track)

Use one checklist block in every PR description. Remove sections that do not apply.

## Track Ownership + Hotspot Rules (applies to all PRs)

- **`src/App.tsx` hotspot owner:** App Shell / Navigation track owner.
- **`src/ui/tabs/CatalogTab.tsx` hotspot owner:** Catalog UX / Economy track owner.
- If your PR touches either hotspot and you are not the owner, pause and request handoff in the master issue before merging.
- If both hotspots are touched, **both owners must approve** before merge.

---

## 1) App Shell / Navigation Track PR Checklist

```md
### App Shell / Navigation Track Checklist
- [ ] Scope is limited to navigation/shell UX clarity outcomes.
- [ ] If `src/App.tsx` changed, I am the assigned hotspot owner (or handoff is documented).
- [ ] No product logic/economy changes introduced.
- [ ] Desktop sanity validated (fresh + seeded state).
- [ ] Mobile sanity validated (fresh + seeded state).
- [ ] Keyboard-only flow validated (Tab/Shift+Tab/Enter/Escape).
- [ ] Linked task ID(s): UXC-___
- [ ] Linked master issue row updated with PR # and status.
```

## 2) Catalog UX / Economy Track PR Checklist

```md
### Catalog UX / Economy Track Checklist
- [ ] Scope is limited to catalog UX clarity or blocker messaging.
- [ ] If `src/ui/tabs/CatalogTab.tsx` changed, I am the assigned hotspot owner (or handoff is documented).
- [ ] No save schema/storage key changes.
- [ ] Catalog CTA hierarchy verified in desktop + mobile.
- [ ] Seeded affordability/gating states validated.
- [ ] Keyboard focus order preserved inside Catalog interactions.
- [ ] Linked task ID(s): UXC-___
- [ ] Linked master issue row updated with PR # and status.
```

## 3) Mobile UX Track PR Checklist

```md
### Mobile UX Track Checklist
- [ ] Scope is limited to mobile readability, touch ergonomics, or progressive disclosure.
- [ ] Touch targets in changed surfaces remain >= 44x44 CSS px.
- [ ] Horizontal/vertical scrolling behavior verified in affected views.
- [ ] No desktop regressions observed in same surfaces.
- [ ] Fresh-save mobile pass complete.
- [ ] Seeded-save mobile pass complete.
- [ ] Linked task ID(s): UXC-___
- [ ] Linked master issue row updated with PR # and status.
```

## 4) Onboarding / Guidance Track PR Checklist

```md
### Onboarding / Guidance Track Checklist
- [ ] Scope is limited to first-session clarity, explanation copy, or guidance rails.
- [ ] No gameplay economy rules altered.
- [ ] Fresh-save first 5 minutes validated (desktop + mobile).
- [ ] Seeded-save guidance states validated (mid/late progression).
- [ ] Keyboard navigation still reaches guidance/help controls.
- [ ] Linked task ID(s): UXC-___
- [ ] Linked master issue row updated with PR # and status.
```

## 5) QA / Validation Track PR Checklist

```md
### QA / Validation Track Checklist
- [ ] Validation matrix rows for this PR are marked Pass/Fail with evidence links.
- [ ] Desktop + mobile + keyboard + seeded-state checks executed.
- [ ] Any failures are documented with repro steps and owner assignment.
- [ ] Rollback triggers evaluated (none met / met and escalated).
- [ ] Linked task ID(s): UXC-___
- [ ] Linked master issue row updated with PR # and status.
```
