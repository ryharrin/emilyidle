# UX Clarity Program — Merge Train + Rebase Protocol

This runbook keeps parallel UX work moving without merge chaos, especially in shared hotspots.

## Ownership and Conflict Policy

- **Hotspot A (`src/App.tsx`) owner:** App Shell / Navigation track lead.
- **Hotspot B (`src/ui/tabs/CatalogTab.tsx`) owner:** Catalog UX / Economy track lead.
- Non-owners must not merge direct hotspot edits without explicit handoff in the master issue.
- If both hotspots are touched in one PR, approvals are required from both owners.

## Branch and PR Rules

- Branch naming: `lane/<track>-<task-id>`.
- One task ID per PR when possible.
- PR title format: `[UXC-###][track] short description`.
- PR must include the corresponding checklist from `PR-CHECKLIST-TEMPLATES.md`.

## Merge Train Order (explicit)

Apply this order unless the coordination lead documents an exception in the master issue:

1. **Foundation/contract PRs** (tests/docs/contracts, no hotspot edits)
2. **Catalog hotspot PRs** (`src/ui/tabs/CatalogTab.tsx`) — Catalog owner merges
3. **App shell hotspot PRs** (`src/App.tsx`) — App owner merges
4. **Mobile UX PRs** (non-hotspot)
5. **Onboarding/guidance PRs** (non-hotspot)
6. **Final validation + coordination docs PR**

Why this order: it resolves high-conflict files early so downstream tracks rebase once instead of repeatedly.

## Rebase Protocol (before review and before merge)

### Developer steps

```bash
git fetch origin
git rebase origin/main
# resolve conflicts
git add <resolved-files>
git rebase --continue
# run relevant checks
git push --force-with-lease
```

### Rebase timing rules

- Rebase once before requesting review.
- Rebase again if your branch is behind `main` by more than 3 commits.
- Rebase again immediately after any merged hotspot PR that overlaps your touched surfaces.
- Do not merge PRs with unresolved hotspot ownership conflicts.

## Conflict Escalation (10-minute rule)

If a conflict is not resolved in 10 minutes:

1. Post conflict summary in master issue: files, task IDs, competing PRs.
2. Tag hotspot owner + coordination lead.
3. Coordination lead decides: handoff, cherry-pick split, or defer to next train slot.

## Merge Gate Checklist (coordination lead)

- [ ] PR has correct track checklist completed.
- [ ] Task ID linked in master issue.
- [ ] Validation matrix rows updated for affected surfaces.
- [ ] Hotspot ownership policy respected.
- [ ] Merge order slot is correct.
- [ ] Rollback triggers not met.
