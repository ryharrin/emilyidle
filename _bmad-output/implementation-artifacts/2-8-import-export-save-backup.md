# Story 2.8: Import/Export Save Backup

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want to export and import my save as a text string,  
so that I have a gift-grade backup option if storage is ever cleared.

## Acceptance Criteria

1. Given I open settings, when I tap "Export Save", then the save JSON string is copied to clipboard.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.8]
2. Given I have a save string, when I tap "Import Save" and paste it, then it validates, migrates if needed, and loads the state.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.8]
3. Given an invalid import string, when import is attempted, then a friendly error message is shown and current state is preserved.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.8]

## Tasks / Subtasks

- [x] Add settings entry point (AC: 1, 2, 3)
  - [x] Add a small Settings button on Home tab (or equivalent)
  - [x] Open a modal/panel

- [x] Implement export flow (AC: 1)
  - [x] Export current state using existing serialization
  - [x] Copy to clipboard and show success message (with on-screen fallback if clipboard fails)

- [x] Implement import flow (AC: 2, 3)
  - [x] Paste text
  - [x] Validate + migrate using existing `loadSave`
  - [x] Load state on success
  - [x] Show friendly error on failure without changing current state

- [x] Tests
  - [x] Unit test for import helper (valid vs invalid)

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- This is a personal gift app, but backups should still be handled carefully and politely.
- Import must never crash the UI; failures are recoverable and non-destructive.

### References

- `_bmad-output/planning-artifacts/epic-2-core-loop.md` (Story 2.8 ACs)
- `_bmad-output/implementation-artifacts/1-4-persistence-and-save-system.md` (save serialization/migration)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Completion Notes List

- Implemented a Settings modal with export/import backup tooling.
- Export copies the serialized save to clipboard (with a visible fallback text area if clipboard fails).
- Import validates + migrates using existing save loader; invalid imports show a friendly error and do not alter current state.
- Added unit tests for export/import helpers and a UI test asserting invalid import error.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/2-8-import-export-save-backup.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/saveBackup.ts`
- `src/game/saveBackup.unit.test.ts`
- `src/ui/App.test.tsx`
- `src/ui/settings/SettingsModal.tsx`
- `src/ui/tabs/HomeTab.tsx`

### Change Log

- 2026-02-23: Implemented import/export save backup in Settings; gates green; status moved to done.
