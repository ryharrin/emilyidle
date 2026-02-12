---
name: UX Clarity Program Master Issue
about: Coordination board for UX clarity task IDs, PRs, ownership, status, validation, and merge slots
title: "[UX Clarity] Master Coordination — <milestone/date>"
labels: ["coordination", "ux-clarity"]
assignees: []
---

## Purpose

Use this issue as the single source of truth for UX clarity execution state across tracks.

## Coordination Roles

- **Coordination Lead:** @<handle>
- **App.tsx Hotspot Owner (App Shell/Nav):** @<handle>
- **CatalogTab.tsx Hotspot Owner (Catalog UX/Economy):** @<handle>
- **Mobile Validation Owner:** @<handle>
- **Keyboard/A11y Validation Owner:** @<handle>

## Task + PR Board

| Task ID | Track | Owner | Status | PR | Depends On | Files/Hotspots | Validation Rows | Merge Slot | Notes |
|---|---|---|---|---|---|---|---|---|---|
| UXC-001 | App Shell/Nav | @ | Planned/In Progress/In Review/Merged/Blocked | # | UXC-___ | `src/App.tsx` / none | Desktop-Fresh, Mobile-Fresh, Keyboard-Fresh | 3 |  |
| UXC-002 | Catalog UX/Economy | @ | Planned/In Progress/In Review/Merged/Blocked | # | UXC-___ | `src/ui/tabs/CatalogTab.tsx` / none | Desktop-Seeded, Mobile-Seeded, Keyboard-Seeded | 2 |  |
| UXC-003 | Mobile UX | @ | Planned/In Progress/In Review/Merged/Blocked | # | UXC-___ | none | Mobile-Fresh, Mobile-Seeded | 4 |  |
| UXC-004 | Onboarding/Guidance | @ | Planned/In Progress/In Review/Merged/Blocked | # | UXC-___ | none | Desktop-Fresh, Mobile-Fresh | 5 |  |

## Merge Train Order (for this issue)

1. Foundation/contract
2. Catalog hotspot (`src/ui/tabs/CatalogTab.tsx`)
3. App hotspot (`src/App.tsx`)
4. Mobile UX
5. Onboarding/Guidance
6. Final validation/docs

## Validation Status Snapshot

- Desktop: ☐ Pending ☐ Pass ☐ Fail
- Mobile: ☐ Pending ☐ Pass ☐ Fail
- Keyboard-only: ☐ Pending ☐ Pass ☐ Fail
- Seeded-state: ☐ Pending ☐ Pass ☐ Fail

## Rollback Decision Log

- Trigger met? ☐ No ☐ Yes
- If yes, which trigger(s):
- Reverted PR(s):
- Follow-up task IDs:
- Owner(s):
