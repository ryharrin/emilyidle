# Prompt: Run Full Emily Idle UI/Flow Critique Cycle End-to-End

You are a coding + QA gameplay agent. Execute a complete UI/UX flow critique cycle for **Emily Idle** in this repository, based on actual gameplay evidence, and produce actionable findings.

## Primary objective
Run the full critique cycle again from scratch and produce a comprehensive evidence-backed report that includes:
1. A checklist-complete baseline pass
2. A deep multi-session pass (fresh progression + late-game seeded + mobile)
3. A manual-style extended pass
4. A strict **30-minute real-time fresh-profile pass** focused on prestige-tier trajectory and gating
5. Prioritized issue list with severity scoring and concrete fixes

Do not skip gameplay execution. Recommendations must be blocked until evidence is collected.

## Repository and project context
- Repo root: `/home/ryharrin/src/emilyidle`
- Game: Vite + React + TypeScript idle/incremental game
- Primary source: `src/`
- Tests: `tests/`
- Existing reports:
  - `docs/ui-flow-critique-2026-02-17.md`
  - `docs/ui-flow-critique-deep-2026-02-17.md`
  - `docs/ui-flow-critique-real-time-30m-2026-02-17.md`
- Use current AGENTS guidance in repo and subfolders.

## Skill/process requirements
Follow the `critique-game-ui-flow` style workflow:
- Define test scope assumptions explicitly
- Execute required coverage before giving recommendations
- Capture timestamped evidence for all required checklist categories
- Use severity formula for prioritization:
  - `priority_score = (impact * frequency * confidence) / effort`
  - each factor scored 1-5

Use these references when preparing findings:
- `/home/ryharrin/.codex/skills/critique-game-ui-flow/references/playtest-checklist.md`
- `/home/ryharrin/.codex/skills/critique-game-ui-flow/references/heuristics-rubric.md`

## Non-negotiable coverage bar
In at least one executed pass, show evidence for:
- Fresh profile: first load -> first meaningful milestone
- Core loop: >=3 earn-spend-feedback cycles
- Navigation sweep: every visible primary tab, then return to prior context
- Meta/progression touchpoint: unlock/upgrade/prestige-adjacent action
- Recovery checks: >=3 (help/modal close, cancel flows, invalid input handling, etc.)

If a coverage item is unreachable, log exact blocker and attempted paths.

## Execution plan to run
### Phase A: Baseline pass (short, checklist complete)
- Start from fresh localStorage/sessionStorage.
- Run a focused pass to satisfy required coverage.
- Capture:
  - timestamped step log
  - start/mid/end screenshots
  - explicit blockers (if any)

### Phase B: Deep multi-session pass
Run 3 sessions:
1. **Accelerated progression session**
   - Fresh profile
   - Heavy looping to surface midgame flow issues
   - Full tab sweeps and repeated recoveries
2. **Seeded late-game session**
   - Seed known late-game state to ensure Workshop/Maison/Nostalgia surfaces are exercised
   - Validate reset review/cancel behaviors per tier
3. **Mobile session**
   - viewport around 390x844
   - check tab readability, overflow, navigation reachability, recovery actions

### Phase C: Manual-style extended pass
- Slower pacing than stress loop
- Revisit key friction points from A/B
- Re-run recovery and navigation checks to confirm repeatability

### Phase D: Real-time 30-minute pass (strict)
- Fresh profile only
- **No simulated time skipping**
- Run for full 30 minutes wall-clock
- Log per-minute checkpoint with:
  - cash/income/enjoyment snapshot
  - workshop/maison/nostalgia visibility state
  - whether reset review/confirm modal surfaces are reachable
- End with explicit trajectory verdict for each prestige tier:
  - Workshop: whether it became visible/actionable in-session
  - Maison: whether progression toward visibility is evident (do not assume it should be reachable in 30m)
  - Nostalgia: whether progression toward visibility is evident (do not assume it should be reachable in 30m)

## Commands and tooling expectations
- Start dev server on port 5177 if needed.
- Use Playwright-based scripted gameplay to collect reproducible, timestamped evidence.
- Prefer creating temporary specs/configs under `/tmp/ui-critique` and artifacts under `/tmp/emilyidle-ui-critique`.
- Keep gameplay scripts non-destructive (do not wipe repo files).

## Evidence artifact requirements
Produce and retain:
- Raw logs for each phase
- Screenshots for each phase (start/mid/end where applicable)
- Final summary metrics for each phase
- A single consolidated report file in `docs/`

Use a new report filename with today’s date suffix, for example:
- `docs/ui-flow-critique-full-cycle-YYYY-MM-DD.md`

## Report structure (required)
Use this structure exactly:
1. Test context
2. Gameplay pass coverage (required checklist + evidence)
3. Top issues (ordered by severity)
4. Quick wins (1-3)
5. Strategic improvements
6. Next playtest plan
7. 30-minute real-time prestige trajectory and gating result
8. Appendices (artifact paths + run summaries)

## Top-issues format (required for each issue)
For each top issue include:
- Category (clarity/feedback/hierarchy/navigation/consistency/accessibility/flow continuity)
- Priority score with full factor math
- Observed evidence (timestamped)
- Root-cause hypothesis
- Specific UI/flow change
- Expected player outcome
- Verification plan

## Specific questions you must answer in final report
1. What exact blocker most reduced progression depth?
2. At what timestamps did that blocker first appear and how often did it repeat?
3. In real-time 30 minutes, what prestige trajectory was observed for Workshop, Maison, and Nostalgia?
4. If Maison/Nostalgia are not reached, what is the earliest gating state observed and where should UX intervene?
5. What is the single highest-leverage fix and where in code should it be implemented?

## Code-level follow-up guidance
If you recommend a blocker fix, include target files/functions, for example:
- `src/ui/tabs/career/CareerPanel.tsx`
- `src/ui/components/CareerNextActionCard.tsx`
- related selectors in `src/game/selectors/careerNextAction.ts`

Do not implement code changes unless explicitly asked; focus on critique + recommendations.

## Output expectations
- Final response should include:
  - concise executive summary
  - key quantitative outcomes
  - link/path to full report file
  - link/path to raw logs and screenshots
- Be precise with timestamps and concrete labels.
- Avoid generic design advice; every recommendation must map to observed behavior.

## Start now
Execute the full cycle end-to-end and persist all artifacts.
