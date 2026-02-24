# Sprint Change Proposal - 2026-02-23

## 1. Issue Summary

The current Epic 2 implementation works mechanically but misses clarity and onboarding goals for Emily's first-play experience. During playtesting/review, the following issues were identified:

- Quartz mini-game interaction is unclear and flavor is weak.
- Enjoyment values are displayed with excessive precision; whole numbers are preferred everywhere.
- Watch purpose is not obvious in collection/details.
- Market purchase path is not discoverable enough for first-time play.
- Career should begin before PhD with no initial income.
- A one-time acceptance-letter onboarding flow is required.
- Mailbox should become a reusable channel for future letters/items.
- Watch purchases should arrive via delivery timing, with occasional real delay reasons.

## 2. Impact Analysis

### Epic Impact

- Epic 2 (Core Loop): Reopened and expanded for onboarding/clarity and mailbox fulfillment behavior.
- Epic 3 (Mini-Game Suite): Quartz interaction updated from Alignment to Calibration flavor and guidance model.
- Epic 4 (Career Journey): Must explicitly integrate pre-PhD onboarding as entry path.

### Story Impact

- Changed in Epic 2: 2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8.
- Changed in Epic 3: 3.5 and 3.6.
- Changed in Epic 4: 4.1 and epic framing text.

### Artifact Conflicts / Updates Required

- Updated now:
  - `_bmad-output/planning-artifacts/epic-2-core-loop.md`
  - `_bmad-output/planning-artifacts/epic-3-mini-game-suite.md`
  - `_bmad-output/planning-artifacts/epic-4-career-journey.md`
  - `_bmad-output/planning-artifacts/epics.md`
  - `_bmad-output/epics.md`
  - `_bmad-output/game-architecture.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Technical Impact

- Domain state/actions:
  - Add mailbox queues and claim-based watch ownership flow.
  - Add pre-PhD onboarding state and one-time completion flag.
  - Ensure deterministic delivery timing using `clockMs`.
- UI:
  - Add explicit market discovery CTA.
  - Add mailbox UI affordance and one-time acceptance-letter task.
  - Replace decimal enjoyment displays with whole-number displays.
  - Replace Quartz Alignment interaction flavor with Quartz Calibration.
- Persistence/migration:
  - Save and load mailbox delivery queues and onboarding completion state.

## 3. Recommended Approach

### Chosen Path

Direct Adjustment (Option 1)

### Rationale

- Existing implementation is structurally sound.
- Problems are primarily onboarding legibility, display conventions, and narrative sequencing.
- No rollback is needed; targeted story updates preserve momentum.

### Effort / Risk / Timeline Impact

- Effort: Medium
- Risk: Medium
- Timeline impact: +1 focused sprint slice inside Epic 2 before starting Epic 3 implementation

## 4. Detailed Change Proposals

### Stories (Epic 2)

#### Story 2.1 - Currency System & Economy Types

OLD:
- Enjoyment/love typed as numbers, with no explicit whole-number display rule.

NEW:
- Enjoyment and love are whole-number units.
- All enjoyment UI values are whole numbers only (total, rate, uncollected, rewards).
- Internal fractional math may exist but must remain deterministic and not leak to UI.

Justification:
- Matches desired readability and removes noisy precision.

#### Story 2.3 - Quartz Alignment Mini-Game

OLD:
- Drag-based alignment with minimal instruction.

NEW:
- Renamed to Quartz Calibration.
- Flavor: calm and calibrate drifting quartz beat to center.
- Explicit Goal/How/Reward guidance in-game.
- Tap-to-calibrate center timing mechanic with Miss/Good/Perfect.
- Generous windows; no fail state.

Justification:
- Improves first-time comprehension and emotional tone.

#### Story 2.4 - PhD Career Stage & Therapy Sessions

OLD:
- Game starts directly at PhD Student.

NEW:
- Game starts in Pre-PhD (zero income).
- Forced one-time mailbox acceptance letter task.
- "Enter Grad School" transitions to PhD Student.
- Onboarding gate is one-time per save.

Justification:
- Aligns career narrative and requested emotional setup.

#### Story 2.5 - Watch Market & Purchase Flow

OLD:
- Buy action immediately grants ownership.

NEW:
- Buy action places an order; watch is not owned until claimed from Mailbox.
- Delivery timing distribution:
  - 75%: 10-20s
  - 20%: 20-60s with reason
  - 5%: 60-120s with reason
- Added discoverability criterion for first-time market CTA.

Justification:
- Clarifies purchase loop and adds personal gift flavor via deliveries.

#### Story 2.6 - Collection Display & Watch Details

OLD:
- Visual details only.

NEW:
- Explicitly show what each watch does:
  - passive contribution
  - interaction type
  - reward framing
- Whole-number enjoyment values in watch effects.

Justification:
- Resolves "what watches do" clarity gap.

#### Story 2.7 - Passive Income & Sim Integration

OLD:
- Passive values shown without precision constraints.

NEW:
- Passive rate/uncollected displays must be whole numbers.

Justification:
- Keeps all enjoyment-related displays consistent.

#### Story 2.8 - Import/Export Save Backup

OLD:
- Save backup scoped to existing state only.

NEW:
- Save/import includes mailbox queues and delivery timers.

Justification:
- Prevents mailbox/order state loss across reloads/imports.

### Stories (Epic 3)

#### Story 3.5 - Enhanced Quartz Alignment

OLD:
- Enhanced Quartz Alignment framing.

NEW:
- Renamed to Enhanced Quartz Calibration.
- Adds explicit flavor/context and center-timing calibrate mechanic language.

Justification:
- Maintains consistency with Epic 2 naming/mechanics.

#### Story 3.6 - Mini-Game Result Screen & Rewards

OLD:
- Reward display clarity, no integer constraint.

NEW:
- Reward values shown as whole numbers.

Justification:
- Consistent numeric language across entire experience.

### Stories (Epic 4)

#### Story 4.1 - Career Stage State Machine

OLD:
- 6-stage system only.

NEW:
- 6-stage career system plus explicit integration with pre-PhD entry state from Epic 2.

Justification:
- Prevents onboarding/career model conflict.

### Architecture

OLD:
- No explicit mailbox delivery queue and no explicit mini-game clarity standard.

NEW:
- Added architecture-level requirements for:
  - mini-game Goal/How/Reward clarity
  - deterministic mailbox delivery scheduling
  - pre-PhD onboarding integration

Justification:
- Aligns system decisions with updated epic requirements.

## 5. Implementation Handoff

### Scope Classification

Moderate

Reason:
- Requires backlog/state update and cross-story reimplementation in an already completed epic.

### Handoff Recipients and Responsibilities

- Product Owner / Scrum Master:
  - Maintain reprioritized story sequence inside Epic 2.
  - Keep Epic 3 blocked until Epic 2 clarity/onboarding changes pass review.
- Development Team:
  - Implement updated Epic 2 stories in sequence.
  - Add/adjust tests for mailbox timers, claim flow, onboarding gate, and display precision.
- QA:
  - Validate first-run onboarding path and no-confusion market discovery.
  - Validate delivery timing buckets and delay-reason messaging.
  - Validate integer-only enjoyment displays.

### Success Criteria

- First-time user can discover Market without external explanation.
- Quartz Calibration is self-explanatory.
- Career starts in pre-PhD and transitions via acceptance letter.
- Watch orders are claimed from mailbox, not instantly owned.
- Delay distribution and reasons behave as specified.
- All enjoyment displays are whole numbers only.
- Save/import preserves mailbox and onboarding states.
