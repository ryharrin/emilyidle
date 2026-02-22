# BMad Master: Story Development Lifecycle


## Overview


The 
**BMad Master**
 is the orchestration agent that maintains overall project context while delegating actual work to isolated 
**subagents**
. This prevents context pollution and ensures each task executes in a clean environment.


## Architecture


```
┌─────────────────────────────────────────────────────────────────┐
│                      BMad MASTER AGENT                          │
│  - Maintains overall project context                            │
│  - Tracks story lifecycle progress                              │
│  - Orchestrates subagent invocations                            │
│  - Updates sprint status between phases                         │
│  - NEVER executes workflows directly                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TASK TOOL (Subagent Spawner)                 │
│  - Creates isolated execution context                           │
│  - Subagent has NO memory of master conversation                │
│  - Returns result summary to master                             │
│  - Uses subagent_type: "general-purpose" for workflows          │
└─────────────────────────────────────────────────────────────────┘
```


## Story Lifecycle Flow


Each story goes through these phases in order:


```
┌──────────────────────────────────────────────────────────────────┐
│  STORY LIFECYCLE (per story)                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CREATE-STORY (Skill: bmad:bmm:workflows:create-story)        │
│     └─► Subagent details the skeleton story                      │
│     └─► Adds tasks, acceptance criteria, dev notes               │
│     └─► Status: backlog → ready-for-dev                          │
│                                                                  │
│  2. DEV-STORY (Skill: bmad:bmm:workflows:dev-story)              │
│     └─► Subagent implements all tasks/subtasks                   │
│     └─► Follows red-green-refactor cycle                         │
│     └─► Writes tests for each task                               │
│     └─► Status: ready-for-dev → in-progress → review             │
│                                                                  │
│  3. CODE-REVIEW (Skill: bmad:bmm:workflows:code-review)          │
│     └─► Subagent performs adversarial review                     │
│     └─► Finds 3-10 specific issues                               │
│     └─► Adds findings to story file                              │
│     └─► Status: review → changes-required OR done                │
│                                                                  │
│  4. FIX REVIEW FINDINGS (if changes-required)                    │
│     └─► Subagent addresses each finding                          │
│     └─► Re-run tests                                             │
│     └─► Loop back to code-review if needed                       │
│                                                                  │
│  5. TYPECHECK + LINT + TESTS + MIGRATE + GIT (Subagent)          │
│     └─► Subagent runs: bunx tsc --noEmit                         │
│     └─► Subagent runs: bun run lint                              │
│     └─► Subagent runs: bun test                                  │
│     └─► IF schema changes: bun run db:migrate (apply to local)   │
│     └─► Subagent commits and pushes to main                      │
│     └─► Cloudflare auto-deploys to PRODUCTION                    │
│     └─► IF schema changes: bun run db:migrate on PROD (wrangler) │
│     └─► Subagent runs E2E tests against LIVE URL (NOT localhost) │
│     └─► Status: → done                                           │
│                                                                  │
│  6. NEXT STORY                                                   │
│     └─► Master updates sprint-status.yaml                        │
│     └─► Loop to step 1 for next story                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```


## Master Commands


### Invoking a Workflow via Subagent


**CRITICAL: Subagents MUST load and execute the actual BMAD workflow files.**


The BMAD system has workflow YAML files that define the execution flow, and XML instruction files that contain the step-by-step logic. Subagents must:


1. Load the `workflow.yaml` config file
2. Load the `instructions.xml` file referenced in the config
3. Execute ALL steps in exact order as defined in the XML


**CONTEXT INJECTION RULE:**
Every `<Task>` prompt must include explicit instructions to load and execute the BMAD workflow:


```
[CONTEXT]: Epic X, Story Y - Brief description of what's being done


[CONSTRAINTS]: 
- Read AGENTS.md first for project conventions
- Follow Bun/D1/Hono/Drizzle stack


[PATH]: /home/redacted/bmad-testing/01


[WORKFLOW EXECUTION]:
1. Load workflow config: {path}/_bmad/bmm/workflows/4-implementation/{workflow-name}/workflow.yaml
2. Load instructions: {path}/_bmad/bmm/workflows/4-implementation/{workflow-name}/instructions.xml
3. Execute ALL steps in the instructions.xml in exact order
4. Follow the workflow's critical rules and validation gates


[STORY FILE]: _bmad-output/implementation-artifacts/stories/{story-file}.md


[RETURN]: Summary of what was done, files changed, status updates made
```


### Available Workflows for Story Development


| Workflow | Path | Purpose | When to Use |
|----------|------|---------|-------------|
| 
**create-story**
 | `_bmad/bmm/workflows/4-implementation/create-story/` | Detail skeleton stories with tasks, AC, dev notes | Before dev, when story lacks tasks/AC |
| 
**dev-story**
 | `_bmad/bmm/workflows/4-implementation/dev-story/` | Implement all tasks following red-green-refactor | After story is ready-for-dev |
| 
**code-review**
 | `_bmad/bmm/workflows/4-implementation/code-review/` | Adversarial review finding 3-10 issues | After implementation (review status) |
| 
**quick-dev**
 | `_bmad/bmm/workflows/bmad-quick-flow/quick-dev/` | Lightweight implementation | Simple changes without full flow |


### Workflow File Structure


Each workflow has:
```
workflow-name/
├── workflow.yaml      # Config: paths, variables, settings
├── instructions.xml   # Step-by-step execution logic
├── template.md        # Output template (optional)
└── checklist.md       # Validation checklist (optional)
```


**Key Workflow Rules (from instructions.xml):**
- Execute ALL steps in exact numerical order
- Do NOT skip steps or stop for "milestones"
- HALT only on explicit HALT conditions
- Update sprint-status.yaml when status changes
- Mark tasks complete ONLY when ALL validation gates pass


## Sprint Status Tracking


The Master updates `_bmad-output/implementation-artifacts/sprint-status.yaml` between phases:


```yaml
development_status:
  epic-9:
    status: in-progress


  # Story statuses flow through these states:
  9-1-design-audit-logs-schema: done        # Completed
  9-2-create-auditlogger-service: review    # Being reviewed
  9-3-implement-middleware: in-progress     # Being developed
  9-4-create-diff-generator: ready-for-dev  # Detailed, ready
  9-5-build-async-log-writer: backlog       # Not yet detailed
```


## Epic End-to-End Flow


```
For each EPIC:
  For each STORY in epic:
    1. create-story (subagent)
    2. dev-story (subagent)
    3. code-review (subagent)
    4. fix findings if needed (subagent)
    5. typecheck + lint + test + git (master)
    6. mark done, next story
  End stories
  7. EPIC INTEGRATION GATE (Requirement: ./epic-integration-instructions.md)
     └─► Run E2E tests: `bun run test:e2e`
     └─► Validate end-to-end functionality against PRODUCTION
     └─► Produce epic-<n>-integration-gate.md
     └─► MUST include raw test output as evidence (see epic-integration-instructions.md)
     └─► Result: PASS (Proceed) or FAIL (Fix)
  Mark epic done
  Run retrospective (optional)
End epics
```


## Key Principles


1. 
**Master = Orchestrator Only**
: Never execute workflow steps directly. Master ONLY reads instructions/config and delegates ALL work (including typecheck/lint/test/git) to subagents to preserve context.
2. 
**Subagent = Isolated Executor**
: Each subagent starts fresh, no shared context
3. 
**Task Tool = Bridge**
: Creates subagent with `subagent_type: "general-purpose"`
4. 
**Continuous Flow**
: Don't stop for milestones within a story
5. 
**Full Lifecycle**
: Every story goes through create → dev → review → done
6. 
**Adversarial Review**
: Code review MUST find issues, never "looks good"


## Example Master Session


```
User: Let's work on Epic 9


Master: 🧙 The Master shall orchestrate Epic 9 development.
        Epic 9 has 6 stories. Starting with Story 1.


        Invoking create-story subagent...
        [Task tool → subagent executes → returns result]


        ✅ Story 9.1 detailed. Invoking dev-story subagent...
        [Task tool → subagent executes → returns result]


        ✅ Story 9.1 implemented. Invoking code-review subagent...
        [Task tool → subagent executes → returns result]


        ⚠️ Review found 8 issues (1 Critical). Invoking fix subagent...
        [Task tool → subagent executes → returns result]


        Invoking verification subagent (typecheck, lint, test, git)...
        [Task tool → subagent executes → returns result]


        ✅ Story 9.1 DONE. Moving to Story 9.2...
```


## What Master Does vs Subagents


| Action | Who |
|--------|-----|
| Read instructions/config files | Master |
| Track todos and progress | Master |
| Decide next step | Master |
| CREATE-STORY workflow | Subagent |
| DEV-STORY workflow | Subagent |
| CODE-REVIEW workflow | Subagent |
| FIX FINDINGS | Subagent |
| Typecheck + Lint + Test + Migrate + Git | Subagent |
| Epic Integration Gate | Subagent |


---