import { MILESTONES } from "../data/milestones";
import { ACHIEVEMENTS } from "../model/state";
import type { GameState, MilestoneId, AchievementId } from "../model/types";
import { getTotalItemCount, getCollectionValueCents } from "../model/state";
import { formatMoneyFromCents } from "../format";
import { getEnjoymentThresholdLabel } from "./enjoyment";

const MILESTONE_LOOKUP = new Map(MILESTONES.map((milestone) => [milestone.id, milestone]));
const REVEAL_THRESHOLD_RATIO = 0.7;

export type UnlockProgressDetail = {
  label: string;
  current: number;
  threshold: number;
  ratio: number;
};

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getUnlockRevealProgressRatio(rawRatio: number): number {
  return clampNumber(rawRatio / REVEAL_THRESHOLD_RATIO, 0, 1);
}

export function getUnlockVisibilityRatio(state: GameState, milestoneId: MilestoneId): number {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  if (!milestone) {
    return 0;
  }

  if (milestone.requirement.type === "totalItems") {
    const owned = getTotalItemCount(state);
    return milestone.requirement.threshold > 0 ? owned / milestone.requirement.threshold : 0;
  }

  if (milestone.requirement.type === "collectionValue") {
    return milestone.requirement.thresholdCents > 0
      ? getCollectionValueCents(state) / milestone.requirement.thresholdCents
      : 0;
  }

  if (milestone.requirement.type === "catalogDiscovery") {
    const ownedModelCount = Object.values(state.watchModels).filter(
      (count) => typeof count === "number" && count > 0,
    ).length;
    return milestone.requirement.threshold > 0
      ? ownedModelCount / milestone.requirement.threshold
      : 0;
  }

  return 0;
}

export function getMilestoneUnlockProgressDetail(
  state: GameState,
  milestoneId: MilestoneId,
): UnlockProgressDetail {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  if (!milestone) {
    return { label: "", current: 0, threshold: 0, ratio: 0 };
  }

  const requirement = milestone.requirement;
  const threshold =
    requirement.type === "collectionValue" ? requirement.thresholdCents : requirement.threshold;

  const rawCurrent =
    requirement.type === "totalItems"
      ? getTotalItemCount(state)
      : requirement.type === "collectionValue"
        ? getCollectionValueCents(state)
        : requirement.type === "catalogDiscovery"
          ? Object.values(state.watchModels).filter(
              (count) => typeof count === "number" && count > 0,
            ).length
          : 0;

  const current = clampNumber(rawCurrent, 0, threshold);
  const ratio = threshold > 0 ? clampNumber(rawCurrent / threshold, 0, 1) : 0;

  return {
    label: getMilestoneRequirementLabel(milestoneId),
    current,
    threshold,
    ratio,
  };
}

export function getMilestoneEffectSummary(milestoneId: MilestoneId): string {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  return milestone?.description ?? "";
}

export function getMilestoneRequirementLabel(milestoneId: MilestoneId): string {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  if (!milestone) {
    return "";
  }

  if (milestone.requirement.type === "totalItems") {
    return `Own ${milestone.requirement.threshold} total items`;
  }

  if (milestone.requirement.type === "collectionValue") {
    return `Reach ${formatMoneyFromCents(milestone.requirement.thresholdCents)} Memories`;
  }

  return `Discover ${milestone.requirement.threshold} catalog references`;
}

export function shouldShowUnlockTag(state: GameState, milestoneId: MilestoneId): boolean {
  return getUnlockVisibilityRatio(state, milestoneId) >= REVEAL_THRESHOLD_RATIO;
}

export function getAchievementProgressRatio(
  state: GameState,
  achievementId: AchievementId,
): number {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  if (!achievement) {
    return 0;
  }

  const requirement = achievement.requirement;
  if (requirement.type === "totalItems") {
    const owned = getTotalItemCount(state);
    return requirement.threshold > 0 ? owned / requirement.threshold : 0;
  }

  if (requirement.type === "collectionValue") {
    return requirement.thresholdCents > 0
      ? getCollectionValueCents(state) / requirement.thresholdCents
      : 0;
  }

  if (requirement.type === "workshopPrestigeCount") {
    return requirement.threshold > 0 ? state.workshopPrestigeCount / requirement.threshold : 0;
  }

  if (requirement.type === "careerLevel") {
    return requirement.threshold > 0 ? state.therapistCareer.level / requirement.threshold : 0;
  }

  if (requirement.type === "interactionPerfects") {
    return requirement.threshold > 0 ? state.interactionPerfectRuns / requirement.threshold : 0;
  }

  if (requirement.type === "perfectStreak") {
    return requirement.threshold > 0
      ? state.interactionBestPerfectStreak / requirement.threshold
      : 0;
  }

  if (requirement.type === "nostalgiaResets") {
    return requirement.threshold > 0 ? state.nostalgiaResets / requirement.threshold : 0;
  }

  if (requirement.type === "catalogDiscovery") {
    const ownedModelCount = Object.values(state.watchModels).filter(
      (count) => typeof count === "number" && count > 0,
    ).length;
    return requirement.threshold > 0 ? ownedModelCount / requirement.threshold : 0;
  }

  return 0;
}

export function getAchievementRequirementLabel(achievementId: AchievementId): string {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  if (!achievement) {
    return "";
  }

  const requirement = achievement.requirement;
  if (requirement.type === "totalItems") {
    return `Hold ${requirement.threshold} watches in the collection`;
  }

  if (requirement.type === "collectionValue") {
    return `Reach ${formatMoneyFromCents(requirement.thresholdCents)} Memories`;
  }

  if (requirement.type === "workshopPrestigeCount") {
    return `Prestige the Atelier ${requirement.threshold} time${requirement.threshold === 1 ? "" : "s"}`;
  }

  if (requirement.type === "careerLevel") {
    return `Reach career level ${requirement.threshold}`;
  }

  if (requirement.type === "interactionPerfects") {
    return `Land ${requirement.threshold} perfect mini-game outcomes`;
  }

  if (requirement.type === "perfectStreak") {
    return `Build a ${requirement.threshold}-perfect streak`;
  }

  if (requirement.type === "nostalgiaResets") {
    return `Complete ${requirement.threshold} Nostalgia reset${requirement.threshold === 1 ? "" : "s"}`;
  }

  // Career achievements - Story 3.1
  if (requirement.type === "careerSessions") {
    return `Complete ${requirement.threshold} therapy session${requirement.threshold === 1 ? "" : "s"}`;
  }

  if (requirement.type === "careerStageReached") {
    const stageLabels: Record<string, string> = {
      "grad-student": "Grad Student",
      "licensed-associate": "Licensed Associate",
      "specialist-certification": "Specialist",
      "practice-builder": "Practice Builder",
      "private-practice-owner": "Practice Owner",
      retirement: "Retirement",
    };
    return `Reach ${stageLabels[requirement.stageId] ?? requirement.stageId} stage`;
  }

  if (requirement.type === "careerSpecializationUnlocked") {
    return `Unlock ${requirement.count} specialization${requirement.count === 1 ? "" : "s"}`;
  }

  if (requirement.type === "careerTrackCompleted") {
    return `Complete all nodes in a career track`;
  }

  if (requirement.type === "catalogDiscovery") {
    return `Discover ${requirement.threshold} catalog references`;
  }

  return "";
}

export function getAchievementUnlockProgressDetail(
  state: GameState,
  achievementId: AchievementId,
): UnlockProgressDetail {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  if (!achievement) {
    return { label: "", current: 0, threshold: 0, ratio: 0 };
  }

  const requirement = achievement.requirement;

  // Calculate threshold based on requirement type
  let threshold = 0;
  if (requirement.type === "collectionValue") {
    threshold = requirement.thresholdCents;
  } else if ("threshold" in requirement) {
    threshold = requirement.threshold;
  } else if (requirement.type === "careerStageReached") {
    // Map stage to level requirement
    const stageLevels: Record<string, number> = {
      "grad-student": 1,
      "licensed-associate": 3,
      "specialist-certification": 6,
      "practice-builder": 10,
      "private-practice-owner": 15,
      retirement: 20,
    };
    threshold = stageLevels[requirement.stageId] ?? 1;
  } else if (requirement.type === "careerSpecializationUnlocked") {
    threshold = requirement.count;
  } else if (requirement.type === "careerTrackCompleted") {
    threshold = 1; // Binary: either completed or not
  }

  const rawCurrent =
    requirement.type === "totalItems"
      ? getTotalItemCount(state)
      : requirement.type === "collectionValue"
        ? getCollectionValueCents(state)
        : requirement.type === "workshopPrestigeCount"
          ? state.workshopPrestigeCount
          : requirement.type === "careerLevel"
            ? state.therapistCareer.level
            : requirement.type === "interactionPerfects"
              ? state.interactionPerfectRuns
              : requirement.type === "perfectStreak"
                ? state.interactionBestPerfectStreak
                : requirement.type === "nostalgiaResets"
                  ? state.nostalgiaResets
                  : requirement.type === "catalogDiscovery"
                    ? Object.values(state.watchModels).filter(
                        (count) => typeof count === "number" && count > 0,
                      ).length
                    : requirement.type === "careerSessions"
                      ? state.therapistCareer.totalSessions
                      : requirement.type === "careerStageReached"
                        ? state.therapistCareer.level
                        : requirement.type === "careerSpecializationUnlocked"
                          ? ((career) =>
                              (career.modalityId ? 1 : 0) +
                              (career.operatingStyleId ? 1 : 0) +
                              (career.expansionFocusId ? 1 : 0))(state.therapistCareer)
                          : requirement.type === "careerTrackCompleted"
                            ? 0 // Binary achievement, handled in isAchievementMet
                            : 0;

  const current = clampNumber(rawCurrent, 0, threshold);
  const ratio = threshold > 0 ? clampNumber(rawCurrent / threshold, 0, 1) : 0;

  return {
    label: getAchievementRequirementLabel(achievementId),
    current,
    threshold,
    ratio,
  };
}

export function getAchievementEffectSummary(achievementId: AchievementId): string {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  return achievement?.description ?? "";
}

const PRESTIGE_UNLOCK_EFFECT_SUMMARIES: Record<"workshop" | "maison" | "nostalgia", string> = {
  workshop: "Prestige the Atelier to earn Blueprints and unlock Workshop bonuses.",
  maison: "Prestige again for Heritage, Reputation, and Maison perks.",
  nostalgia: "Prestige for Nostalgia to gain permanent Nostalgia points.",
};

// Import from prestige
import {
  getWorkshopPrestigeThresholdCents,
  getMaisonPrestigeThresholdCents,
  getNostalgiaPrestigeThresholdCents,
} from "./prestige";

export function getPrestigeUnlockProgressDetail(
  state: GameState,
  prestigeId: "workshop" | "maison" | "nostalgia",
): UnlockProgressDetail {
  // These will be resolved by the main barrel
  const threshold =
    prestigeId === "workshop"
      ? getWorkshopPrestigeThresholdCents()
      : prestigeId === "maison"
        ? getMaisonPrestigeThresholdCents()
        : getNostalgiaPrestigeThresholdCents();

  const rawCurrent =
    prestigeId === "workshop"
      ? state.enjoymentCents
      : prestigeId === "maison"
        ? state.enjoymentCents + state.workshopBlueprints * threshold
        : state.nostalgiaEnjoymentEarnedCents;
  const current = clampNumber(rawCurrent, 0, threshold);
  const ratio = threshold > 0 ? clampNumber(rawCurrent / threshold, 0, 1) : 0;

  return {
    label: `Reach ${getEnjoymentThresholdLabel(threshold)}`,
    current,
    threshold,
    ratio,
  };
}

export function getPrestigeUnlockEffectSummary(
  prestigeId: "workshop" | "maison" | "nostalgia",
): string {
  return PRESTIGE_UNLOCK_EFFECT_SUMMARIES[prestigeId];
}
