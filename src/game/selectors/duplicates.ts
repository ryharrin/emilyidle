export const DUPLICATE_REWARD_FLOOR = 0.1;

const DUPLICATE_REWARD_DECAY = 0.7;

export function getDuplicateRewardMultiplierForCopy(copyIndex: number): number {
  const normalized = Number.isFinite(copyIndex) ? Math.max(0, Math.floor(copyIndex)) : 0;
  const decayed = Math.pow(DUPLICATE_REWARD_DECAY, normalized);
  const clamped = Math.max(DUPLICATE_REWARD_FLOOR, decayed);
  return Number.isFinite(clamped) ? clamped : DUPLICATE_REWARD_FLOOR;
}

export function getDuplicateRewardMultiplierForNextPurchase(ownedCount: number): number {
  const normalized = Number.isFinite(ownedCount) ? Math.max(0, Math.floor(ownedCount)) : 0;
  return getDuplicateRewardMultiplierForCopy(normalized);
}

export function getDuplicateRewardSum(ownedCount: number): number {
  const normalized = Number.isFinite(ownedCount) ? Math.max(0, Math.floor(ownedCount)) : 0;
  let total = 0;
  for (let i = 0; i < normalized; i += 1) {
    total += getDuplicateRewardMultiplierForCopy(i);
  }
  return total;
}
