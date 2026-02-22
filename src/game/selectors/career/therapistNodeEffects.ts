import { CAREER_NODES } from "../../data/career";
import type { GameState, TherapistCareerEffectMultipliers } from "../../model/types";

const BASE_MULTIPLIERS: TherapistCareerEffectMultipliers = {
  salaryMultiplier: 1,
  sessionCashPayoutMultiplier: 1,
  sessionCooldownMultiplier: 1,
  sessionEnjoymentCostMultiplier: 1,
};

export function getTherapistCareerNodeEffectMultipliers(
  state: GameState,
): TherapistCareerEffectMultipliers {
  const spent = state.therapistCareer.spentNodes;

  let salaryMultiplier = 1;
  let sessionCashPayoutMultiplier = 1;
  let sessionCooldownMultiplier = 1;
  let sessionEnjoymentCostMultiplier = 1;

  for (const node of CAREER_NODES) {
    if (!spent[node.id]) {
      continue;
    }
    const effects = node.effects;
    if (!effects) {
      continue;
    }
    if (typeof effects.salaryMultiplier === "number") {
      salaryMultiplier *= effects.salaryMultiplier;
    }
    if (typeof effects.sessionCashPayoutMultiplier === "number") {
      sessionCashPayoutMultiplier *= effects.sessionCashPayoutMultiplier;
    }
    if (typeof effects.sessionCooldownMultiplier === "number") {
      sessionCooldownMultiplier *= effects.sessionCooldownMultiplier;
    }
    if (typeof effects.sessionEnjoymentCostMultiplier === "number") {
      sessionEnjoymentCostMultiplier *= effects.sessionEnjoymentCostMultiplier;
    }
  }

  return {
    ...BASE_MULTIPLIERS,
    salaryMultiplier,
    sessionCashPayoutMultiplier,
    sessionCooldownMultiplier,
    sessionEnjoymentCostMultiplier,
  };
}
