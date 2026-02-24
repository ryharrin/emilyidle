# Story 2.3: Quartz Calibration Mini-Game

**Story ID:** 2.3  
**Epic:** 2 - Core Loop  
**Status:** done  
**Created:** 2026-02-23  
**Author:** Game Dev Scrum Master (Max)

---

## Story Foundation

### User Story
**As a** player,  
**I want** to calm and calibrate the quartz beat in a clear, short interaction,  
**So that** it feels watch-authentic and I immediately understand how to earn Enjoyment.

### Business Context
This is the first mini-game in the game and sets the pattern for all future mini-games. It must demonstrate the Goal/How/Reward clarity pattern and provide satisfying spring-physics feedback. This validates the core engagement loop: mini-games → Enjoyment → Career → Cash → Watches.

### Acceptance Criteria (BDD Format)

**Given** I own a quartz watch,  
**When** I tap to interact,  
**Then** the Quartz Calibration mini-game opens in a modal.

**Given** the mini-game opens,  
**When** it renders,  
**Then** it shows plain-language "Goal", "How to play", and "Reward" guidance.

**Given** the mini-game is active,  
**When** the beat dot jitters across a center line and I tap "Calibrate",  
**Then** the game evaluates Miss/Good/Perfect based on timing distance from center.

**Given** successful taps,  
**When** I continue calibrating,  
**Then** jitter visibly reduces and the beat appears calmer.

**Given** the game uses local state,  
**When** it completes,  
**Then** it calls `onComplete({ perfects, durationMs })` callback (never dispatches directly).

**Given** the modal wrapper,  
**When** `onComplete` fires,  
**Then** it dispatches `RECORD_INTERACTION` to the reducer with gameType, perfects, duration.

**Given** visual feedback,  
**When** I achieve a "Perfect",  
**Then** there is satisfying animation (motion spring physics).

**Given** gift context,  
**When** difficulty is tuned,  
**Then** timing windows remain generous and there is no fail state.

---

## DEV AGENT GUARDRAILS

### Technical Requirements (MUST FOLLOW)

#### 1. Pattern 6: Mini-Game Implementation
```typescript
// ui/mini-games/QuartzCalibrationGame.tsx
import { motion } from "motion/react";

interface QuartzCalibrationGameProps {
  onComplete: (result: { perfects: number; durationMs: number }) => void;
}

export function QuartzCalibrationGame({ onComplete }: QuartzCalibrationGameProps) {
  // Local state only - no global state access
  const [beatPosition, setBeatPosition] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [startTime] = useState(Date.now());
  const [jitterAmount, setJitterAmount] = useState(50);
  
  // Game loop with RAF for smooth animation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      const time = Date.now() / 1000;
      const jitter = Math.sin(time * 3) * jitterAmount;
      setBeatPosition(jitter);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [jitterAmount]);
  
  const handleCalibrate = () => {
    const distanceFromCenter = Math.abs(beatPosition);
    if (distanceFromCenter < 10) {
      setPerfects(p => p + 1);
      setJitterAmount(j => Math.max(j - 5, 10));
    }
  };
  
  const handleComplete = () => {
    onComplete({ perfects, durationMs: Date.now() - startTime });
  };
  
  return (
    <div className="quartz-calibration-game">
      <GameInstructions />
      <motion.div
        className="beat-dot"
        animate={{ x: beatPosition }}
        transition={{ type: "spring", stiffness: 300 }}
      />
      <button onClick={handleCalibrate}>Calibrate</button>
      <button onClick={handleComplete}>Finish</button>
    </div>
  );
}
```

#### 2. Mini-Game Shell Pattern
```typescript
// ui/mini-games/MiniGameShell.tsx
export function MiniGameShell({ gameType, onComplete, children }: MiniGameShellProps) {
  const dispatch = useGameDispatch();
  
  const handleGameEnd = (result: InteractionResult) => {
    dispatch({
      type: "RECORD_INTERACTION",
      payload: { gameType, perfects: result.perfects, durationMs: result.durationMs }
    });
    onComplete?.(result);
  };
  
  return (
    <Modal isOpen>
      <div className="mini-game-shell">
        {React.cloneElement(children, { onComplete: handleGameEnd })}
      </div>
    </Modal>
  );
}
```

#### 3. Reducer Integration
```typescript
// src/game/reducer.ts
case "RECORD_INTERACTION": {
  const { gameType, perfects } = action.payload;
  const baseEnjoyment = perfects * 10;
  return { ...state, enjoyment: state.enjoyment + baseEnjoyment };
}
```

---

## Architecture Compliance

### Pattern Enforcement

| Pattern | Requirement | Implementation |
|---------|------------|----------------|
| **Pattern 6** | Mini-Game | Local state + callback dispatch |
| **Pattern 1** | State Transitions | RECORD_INTERACTION action |

### File Structure

```
src/ui/mini-games/
  ├── MiniGameShell.tsx
  ├── QuartzCalibrationGame.tsx
  └── components/
      └── GameInstructions.tsx
```

---

## Implementation Checklist

### Core Mini-Game
- [ ] Create QuartzCalibrationGame component
- [ ] Implement beat jitter animation (RAF loop)
- [ ] Add Miss/Good/Perfect rating logic
- [ ] Implement jitter reduction on success
- [ ] Add spring physics animations

### Integration
- [ ] Create MiniGameShell wrapper
- [ ] Add RECORD_INTERACTION action handler
- [ ] Implement reward calculation

### Tests
- [ ] Unit tests for timing evaluation
- [ ] Unit tests for reward calculation
- [ ] Integration test for complete flow

---

## Dependencies

### Requires
- Story 2.1: Currency System (enjoyment rewards)
- Story 2.2: Watch Data (quartz watch detection)

### Required By
- Story 3.5: Enhanced Quartz Calibration
- Story 3.6: Mini-Game Result Screen

---

## Story Completion Status

**Status:** ready-for-dev  
**Analysis Complete:** 2026-02-23  
**Next Step:** Run `dev-story` workflow for implementation.
