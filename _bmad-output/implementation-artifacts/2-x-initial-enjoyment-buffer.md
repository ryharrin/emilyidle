# Story 2.x: Initial Enjoyment Buffer

**Story ID:** 2.x  
**Epic:** 2 - Core Loop  
**Status:** complete
**Created:** 2026-02-23  
**Author:** Game Dev

---

## Story Foundation

### User Story
**As a** player starting the game,  
**I want** enough initial enjoyment to run therapy sessions immediately after onboarding,  
**So that** I'm not stuck unable to earn money to buy my first watch.

### Problem Discovered
Player starts with 0 enjoyment and 0 watches (no passive income). Cannot run therapy sessions (cost: 5 enjoyment) and has no way to gain enjoyment. Stuck!

### Fix Applied
- Added 10 initial enjoyment to `initialGameState` in `src/game/types.ts`
- Enough for 2 therapy sessions after completing onboarding
- Each PhD session gives $75, cheapest watch is $25

### Acceptance Criteria

**Given** a new game save,  
**When** I complete onboarding and reach PhD Student stage,  
**Then** I have 10 enjoyment available to run therapy sessions.

**Given** I run 2 therapy sessions,  
**When** I earn $150 total,  
**Then** I can afford the cheapest watch ($25).

---

## DEV AGENT GUARDRAILS

### Technical Requirements

#### 1. Initial Game State
- File: `src/game/types.ts`
- Changed `initialGameState.enjoyment` from `0` to `10`
- No other changes required - this is a data change only

### Testing
- All 205 existing tests pass
- No new tests required as this is a data fix

---

## Verification

- [x] Tests pass: `pnpm test` shows 205/205 passing
- [x] Player can complete onboarding and run therapy sessions immediately
- [x] Player can earn enough to buy first watch within 2-3 sessions
