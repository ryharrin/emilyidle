# UX Clarity Program — Validation Matrix + Rollback Criteria

Use this matrix during PR validation and before each merge-train release cut.

## Validation Matrix

Record one row per task/PR pair.

| Task ID | PR | Surface | State Type | Device/Mode | What to Validate | Result (Pass/Fail) | Evidence Link | Owner |
|---|---|---|---|---|---|---|---|---|
| UXC-___ | #___ | Career / Catalog / Collection / etc. | Fresh save | Desktop (Chromium) | Primary CTA is clear, no overlap, expected first action visible |  |  |  |
| UXC-___ | #___ | Career / Catalog / Collection / etc. | Seeded save | Desktop (Chromium) | Mid/late progression messaging is accurate and actionable |  |  |  |
| UXC-___ | #___ | Career / Catalog / Collection / etc. | Fresh save | Mobile (Pixel 5 or iPhone 12) | No clipping, touch targets >=44px, sticky controls usable |  |  |  |
| UXC-___ | #___ | Career / Catalog / Collection / etc. | Seeded save | Mobile (Pixel 5 or iPhone 12) | Gated/affordability/next-step cues remain readable and actionable |  |  |  |
| UXC-___ | #___ | Global nav + modal/help flow | Fresh save | Keyboard-only (desktop) | Tab order, focus trap/restore, Enter/Space/Escape behavior valid |  |  |  |
| UXC-___ | #___ | Catalog interactions | Seeded save | Keyboard-only (desktop) | Catalog list/details/buttons are reachable and operable without mouse |  |  |  |

### Minimum required coverage per PR

- 1 desktop row (fresh or seeded) for each changed surface.
- 1 mobile row (fresh or seeded) for each changed surface.
- 1 keyboard row for any changed navigational/modal surface.
- 1 seeded-state row for any change affecting affordability/gating/progression messaging.

## Rollback Criteria (concrete triggers)

Rollback is **mandatory** if any trigger below is met after merge:

1. **Hotspot regression:** `src/App.tsx` or `src/ui/tabs/CatalogTab.tsx` change causes broken primary navigation, broken purchase CTA, or inaccessible tab content.
2. **Accessibility break:** Keyboard trap, focus loss to background while modal is open, or inability to reach primary CTA via keyboard.
3. **Mobile usability break:** Any primary action in changed surface is clipped/obscured or touch target falls below 44x44 CSS px.
4. **Seeded-state logic break:** Seeded save cannot load, or seeded affordability/gating messages are incorrect/missing for changed surfaces.
5. **Validation debt breach:** Two or more required matrix rows for a merged PR are Fail without approved mitigation.

## Rollback Procedure

1. Coordination lead marks master issue status as `ROLLBACK-IN-PROGRESS`.
2. Revert offending PR(s) in reverse merge order.
3. Re-run required matrix rows for reverted surfaces.
4. Re-open task IDs with follow-up owner and conflict notes.
