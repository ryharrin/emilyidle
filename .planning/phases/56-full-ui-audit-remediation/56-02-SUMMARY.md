---
phase: 56-full-ui-audit-remediation
plan: 2
subsystem: overlay-orchestration
tags: [cta, overlay, toast, modal, mobile, e2e]
requires:
  - 56-01-SUMMARY.md
provides:
  - Shared action-priority tokens (`primary`, `secondary`, `tertiary`) for CTA styling
  - Single-visible toast queue behavior with explicit queue-depth metadata
  - Blocking/non-blocking overlay role markers and stronger modal-over-toast layering
key-files:
  modified:
    - src/ui/components/ToastStack.tsx
    - src/ui/components/FloatingDelta.tsx
    - src/ui/components/ConfirmModal.tsx
    - src/ui/help/HelpModal.tsx
    - src/style.css
    - tests/achievements-toast.spec.ts
    - tests/modal-interactions.spec.ts
    - tests/settings-clear-save.spec.ts
metrics:
  completed: 2026-02-07
---

# Phase 56 Plan 02 Summary

Implemented global CTA hierarchy and overlay orchestration updates to reduce primary-action interruption and normalize modal behavior.

## Accomplishments
- Added shared CTA priority token classes in CSS (`action-priority-primary`, `action-priority-secondary`, `action-priority-tertiary`) backed by theme-aware CSS variables.
- Standardized modal and toast overlay semantics via `data-overlay-kind` markers:
  - blocking overlays on Help and Confirm modals,
  - non-blocking overlays on toast stack and floating deltas.
- Enforced a single-visible toast display policy while preserving queue depth metadata (`data-overlay-queue-depth`) for diagnostics.
- Raised and normalized modal layering using shared overlay z-index tokens so blocking dialogs render above non-blocking notifications.
- Converted settings clear-save cancel assertion to deterministic non-reset validation (`currencyCents > 900_000`) to avoid runtime-tick drift false failures.

## Verification
- `pnpm test:unit -- tests/achievement-toast.unit.test.tsx tests/notifications-preferences.unit.test.tsx`
- `pnpm test:e2e --project=chromium -- tests/achievements-toast.spec.ts tests/modal-interactions.spec.ts tests/settings-clear-save.spec.ts`
- `pnpm test:e2e --project=chromium-mobile-pixel5 -- tests/achievements-toast.spec.ts tests/modal-interactions.spec.ts`

## Notes
- Playwright `dragging the winding surface resolves the run` remained skipped in both desktop/mobile runs when no eligible manual interaction candidate opened; this is expected test behavior.
- Existing accessibility roles (`status`, `dialog`, `aria-live`, `aria-modal`) remain intact while overlay metadata and CTA priority classes were added.
