# Story 4.7: Career UI & Progress Display

**Story ID:** 4.7  
**Epic:** 4 - Career Journey  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** a beautiful Career tab showing my progression,  
**So that** I can see how far I've come in Emily's career journey.

## Acceptance Criteria

1. **Given** I navigate to the Career tab, when it renders, then I see: current stage name, progress bar to next stage, income rate, and session button.
2. **Given** the career timeline, when I view it, then I see all 6 stages with completed ones highlighted.
3. **Given** a stage transition, when it occurs, then a celebration animation plays with the stage title and description.
4. **Given** the Career tab on mobile, when it renders, then the layout is thumb-friendly with clear progress indicators.

---

## Technical Requirements

### Career Tab Components
```typescript
function CareerTab() {
  const state = useGameState();
  const progress = getCareerProgress(state);
  const canAdvance = canAdvanceCareer(state);
  
  return (
    <div className="career-tab">
      <CurrentStageDisplay stage={state.career.stage} />
      <ProgressBar value={progress} />
      <IncomeDisplay rate={getCurrentIncomeRate(state)} />
      <CareerTimeline 
        stages={CAREER_STAGES}
        currentStage={state.career.stage}
      />
      <StartSessionButton 
        disabled={!canStartSession(state)}
        onClick={handleStartSession}
      />
    </div>
  );
}
```

### Stage Transition Animation
```typescript
function StageCelebration({ stage }: { stage: CareerStage }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <h2>{stage.title}</h2>
      <p>{stage.description}</p>
    </motion.div>
  );
}
```

---

## Implementation

- [ ] Create CareerTab component
- [ ] Implement progress bar
- [ ] Create career timeline visualization
- [ ] Add current stage display
- [ ] Show income rate
- [ ] Implement session start button
- [ ] Create stage transition celebration
- [ ] Mobile-optimized layout

---

**Depends on:** Story 4.1 (Career State Machine)  
**Required by:** Story 3.3 (Therapy Session integration)

**Status:** ready-for-dev
