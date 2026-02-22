// Career selectors barrel - re-exports from existing career modules
export * from "../careerStages";
export * from "../careerChoicePreview";
export * from "../careerProgress";
export * from "../careerNextAction";

// Therapist career modules (now co-located in career directory)
export * from "./therapistPolicy";
export * from "./therapistSalary";
export * from "./therapistSessions";
export * from "./therapistEconomySummary";
export * from "./therapistNodeEffects";
export * from "./therapistConstants";

// Additional career-specific helpers that aren't in other modules
import type { GameState, CareerTrackId } from "../../model/types";

export function getTherapistCareer(state: GameState) {
  return state.therapistCareer;
}

export function getActiveCareerTrackId(state: GameState): CareerTrackId | null {
  return state.therapistCareer.activeTrackId;
}
