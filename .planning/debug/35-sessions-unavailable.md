# Debug: Phase 35 Sessions Unavailable After Career Start

## Symptom

After starting the career (entering the PhD program), the Career tab shows therapist sessions as unavailable:

- Session cost: "Sessions unavailable"
- Session payout: "Unavailable"
- Cooldown: "Unavailable"

Evidence:
- `.planning/uat-artifacts/35/09-career-started-session-state.png`

## Expected (per Phase 35 intent)

Career sessions should be runnable in the early-career loop so that running a session can refresh/extend the salary window.

## Likely Root Cause

`src/game/selectors/therapistSessions.ts` requires an active career track:

- `doesActiveCareerTrackSupportSessions()` returns false when `therapistCareer.activeTrackId` is null.

But `src/game/actions/therapistCareer.ts` `enterPhdProgram()` starts the career without setting `activeTrackId`, and track selection is locked until level 3.

So immediately after starting the career, sessions are treated as unsupported.

## Fix Direction (Recommended)

Allow "pre-track" sessions while:

- `careerStartId !== null`
- career stage is not `retirement`
- `activeTrackId === null`
- level < `TRACK_CHOICE_UNLOCK_LEVEL`

…by using a selector-level fallback track for session policy computation (do not mutate `activeTrackId` during program entry).

This keeps the level-3 track choice meaningful and avoids unintentionally unlocking track-gated nodes early.

## Key Files

- `src/game/selectors/therapistSessions.ts`
- `src/game/actions/therapistCareer.ts`
- `src/game/data/careerTracks.ts`
