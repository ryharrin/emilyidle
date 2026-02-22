# Bug Report: OpenCode Commands Missing "bmad-" Prefix in TUI

## Summary

When installing BMad Method with OpenCode IDE support, the generated commands in `.opencode/command/*.md` have the `bmad-` prefix in the filename but **not** in the frontmatter `name:` field. This causes commands to appear without the prefix in the OpenCode TUI command palette, making them hard to discover and use.

## Environment

- **BMad Method Version:** v6.x (latest)
- **IDE:** OpenCode
- **Installation Method:** `npx bmad-method install`
- **OS:** macOS (Darwin)

## Current Behavior

Commands are registered in OpenCode as:

- `/help` (should be `/bmad-help`)
- `/create-prd` (should be `/bmad-bmm-create-prd`)
- `/dev-story` (should be `/bmad-bmm-dev-story`)
- `/quick-spec` (should be `/bmad-bmm-quick-spec`)

## Expected Behavior

Commands should appear with their full prefixed names:

- `/bmad-help`
- `/bmad-bmm-create-prd`
- `/bmad-bmm-dev-story`
- `/bmad-bmm-quick-spec`
- `/bmad-gds-*`
- `/bmad-tea-*`

## Root Cause

The command files are generated with the `bmad-` prefix in the filename (e.g., `bmad-help.md`, `bmad-bmm-create-prd.md`), but the frontmatter `name:` field lacks this prefix.

### Example from `bmad-help.md`:

```yaml
---
name: "help" # ← Missing "bmad-" prefix
---
```

Should be:

```yaml
---
name: "bmad-help" # ← Should match filename
---
```

## Impact

1. **Command Discovery:** When typing `/` in the TUI, BMad commands are mixed with other commands instead of being grouped under `/bmad`
2. **Documentation Mismatch:** The BMad documentation references commands as `/bmad-help`, `/bmad-bmm-*`, etc., which don't exist in the TUI
3. **User Confusion:** Users can't easily find BMad commands by typing `/bmad`

## Steps to Reproduce

1. Install BMad: `npx bmad-method install`
2. Select OpenCode as IDE
3. Open OpenCode TUI in the project
4. Type `/` to open command palette
5. Observe commands appear as `/help`, `/create-prd`, etc. instead of `/bmad-help`, `/bmad-bmm-create-prd`, etc.

## Suggested Fix

Update the command generation template in the BMad installer to include the full prefixed name in the frontmatter:

**File:** `.opencode/command/bmad-help.md`

```yaml
---
name: "bmad-help" # Change from 'help' to 'bmad-help'
description: "Get unstuck by showing what workflow steps come next..."
---
```

**File:** `.opencode/command/bmad-bmm-create-prd.md`

```yaml
---
name: "bmad-bmm-create-prd" # Change from 'create-prd' to 'bmad-bmm-create-prd'
description: "Create a comprehensive PRD..."
---
```

This should be applied to all 64+ generated command files.

## Workaround (Temporary)

Manually edit each `.opencode/command/bmad-*.md` file to update the `name:` field to include the `bmad-` prefix, then restart OpenCode. Note: This will be overwritten on the next `npx bmad-method install`.

## Additional Context

- OpenCode uses the `name:` field from frontmatter as the actual command name, not the filename
- This issue affects all BMad modules (BMM, GDS, TEA)
- The filename correctly has the prefix (e.g., `bmad-bmm-create-prd.md`), so the installer template just needs to use the filename (without extension) as the `name:` value
