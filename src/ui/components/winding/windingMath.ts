export type WindingBand = "under" | "good" | "perfect" | "over";

export const WINDING_GOOD_THRESHOLD = 0.3;
export const WINDING_PERFECT_THRESHOLD = 0.7;
export const WINDING_SOFT_PENALTY_THRESHOLD = 0.97;
export const WINDING_HARD_PENALTY_THRESHOLD = 0.985;

export const WINDING_ZONE_MISS_MAX = WINDING_GOOD_THRESHOLD;
export const WINDING_ZONE_GOOD_MAX = WINDING_PERFECT_THRESHOLD;
export const WINDING_ZONE_PERFECT_MAX = WINDING_SOFT_PENALTY_THRESHOLD;

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

export type WindingPenaltyFlags = {
  softPenalty: boolean;
  strictPenalty: boolean;
};

export function getWindingBand(progress01: number): WindingBand {
  const clamped = clamp01(progress01);
  if (clamped >= WINDING_HARD_PENALTY_THRESHOLD) {
    return "over";
  }
  if (clamped >= WINDING_PERFECT_THRESHOLD) {
    return "perfect";
  }
  if (clamped >= WINDING_GOOD_THRESHOLD) {
    return "good";
  }
  return "under";
}

export function getWindingPenaltyFlags(progress01: number): WindingPenaltyFlags {
  const clamped = clamp01(progress01);
  return {
    softPenalty: clamped >= WINDING_SOFT_PENALTY_THRESHOLD,
    strictPenalty: clamped >= WINDING_HARD_PENALTY_THRESHOLD,
  };
}

export function getWindingTension(progress01: number): number {
  const clamped = clamp01(progress01);
  const base = clamp01((clamped - WINDING_GOOD_THRESHOLD) / (1 - WINDING_GOOD_THRESHOLD));
  if (clamped >= WINDING_HARD_PENALTY_THRESHOLD) {
    return clamp01(base + (clamped - WINDING_HARD_PENALTY_THRESHOLD) * 4);
  }
  return base;
}

export function getWindingTensionPercent(progress01: number): number {
  return Math.round(getWindingTension(progress01) * 100);
}

export function getWindingVelocity(progress01: number): number {
  const clamped = clamp01(progress01);
  if (clamped >= WINDING_HARD_PENALTY_THRESHOLD) {
    const normalized =
      (clamped - WINDING_HARD_PENALTY_THRESHOLD) / (1 - WINDING_HARD_PENALTY_THRESHOLD);
    return clamp01(0.85 + normalized * 0.15);
  }
  if (clamped >= WINDING_PERFECT_THRESHOLD) {
    const normalized =
      (clamped - WINDING_PERFECT_THRESHOLD) /
      (WINDING_HARD_PENALTY_THRESHOLD - WINDING_PERFECT_THRESHOLD);
    return clamp01(0.65 + normalized * 0.25);
  }
  const normalized = clamped / WINDING_PERFECT_THRESHOLD;
  return clamp01(0.2 + normalized * 0.45);
}

export function getOutcomeTierFromBand(band: WindingBand): "miss" | "good" | "perfect" {
  if (band === "perfect") {
    return "perfect";
  }
  if (band === "good") {
    return "good";
  }
  return "miss";
}

export function getWindingBandLabel(band: WindingBand): string {
  switch (band) {
    case "under":
      return "Under-wound";
    case "good":
      return "Good wind";
    case "perfect":
      return "Perfect tension";
    case "over":
      return "Over-wound!";
  }
}
