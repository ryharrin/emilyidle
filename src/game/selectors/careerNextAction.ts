import type { GameState } from "../model/types";

import { canPerformTherapistSession, getTherapistSessionPolicy } from "./therapistSessions";
import { getTherapistCareerChoiceStatus } from "./careerStages";
import { isTherapistSalaryActive } from "./therapistSalary";
import { formatMoneyFromCents } from "../format";

export type CareerNextActionCue = {
  id:
    | "start-career"
    | "choose-track"
    | "choose-modality"
    | "choose-operating-style"
    | "choose-expansion-focus"
    | "perform-session"
    | "passive-xp";
  label: string;
  detail: string;
};

export function getCareerNextActionCue(state: GameState, nowMs: number): CareerNextActionCue {
  if (state.therapistCareer.careerStartId === null) {
    return {
      id: "start-career",
      label: "Enter the PhD program",
      detail: "Starting your career enables a stipend and unlocks sessions soon.",
    };
  }

  const availableChoice = getTherapistCareerChoiceStatus(state).find((status) => status.available);
  if (availableChoice) {
    switch (availableChoice.stageId) {
      case "licensed-associate":
        return {
          id: "choose-track",
          label: "Choose your primary track",
          detail: "This is permanent and sets your core money loop.",
        };
      case "specialist-certification":
        return {
          id: "choose-modality",
          label: "Choose a modality",
          detail: "Permanent choice: affects salary and session cadence.",
        };
      case "practice-builder":
        return {
          id: "choose-operating-style",
          label: "Choose an operating style",
          detail: "Permanent choice: affects salary and session cadence.",
        };
      case "private-practice-owner":
        return {
          id: "choose-expansion-focus",
          label: "Choose an expansion focus",
          detail: "Permanent choice: affects salary and session cadence.",
        };
      default:
        break;
    }
  }

  const policy = getTherapistSessionPolicy(state, nowMs);
  if (policy.supportsSessions) {
    const seconds = Math.max(0, Math.ceil(policy.cooldownRemainingMs / 1000));

    if (!isTherapistSalaryActive(state, nowMs)) {
      const canPerform = canPerformTherapistSession(state, nowMs);
      return {
        id: "perform-session",
        label: "Run a session to resume salary",
        detail: canPerform
          ? seconds > 0
            ? `Refresh salary now for ${formatMoneyFromCents(policy.effectiveEnjoymentCostCents)} enjoyment (cost tier recovers in ${seconds}s).`
            : "Refresh your salary window."
          : "Build more enjoyment to cover the current session cost.",
      };
    }

    const canPerform = canPerformTherapistSession(state, nowMs);
    if (canPerform) {
      return {
        id: "perform-session",
        label: "Run a session",
        detail:
          seconds > 0
            ? `Run now for ${formatMoneyFromCents(policy.effectiveEnjoymentCostCents)} enjoyment. Cost tier drops in ${seconds}s.`
            : "Sessions give a cash burst and career XP.",
      };
    }

    const detail =
      seconds > 0
        ? `Need ${formatMoneyFromCents(policy.effectiveEnjoymentCostCents)} enjoyment. Cost tier drops in ${seconds}s.`
        : "Need more enjoyment to pay the cost.";
    return {
      id: "perform-session",
      label: "Run a session when ready",
      detail,
    };
  }

  return {
    id: "passive-xp",
    label: "Keep playing",
    detail: "Career XP only comes from running sessions.",
  };
}
