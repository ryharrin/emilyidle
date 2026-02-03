export type WindingBand = "under" | "good" | "perfect" | "over";

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

export function getWindingBand(progress01: number): WindingBand {
  const clamped = clamp01(progress01);
  if (clamped > 0.95) {
    return "over";
  }
  if (clamped >= 0.7) {
    return "perfect";
  }
  if (clamped >= 0.3) {
    return "good";
  }
  return "under";
}

export function getWindingVelocity(progress01: number): number {
  const clamped = clamp01(progress01);
  if (clamped >= 0.95) {
    return Math.min(1.2, 1 + (clamped - 0.95) * 4);
  }
  if (clamped >= 0.7) {
    const normalized = (clamped - 0.7) / (0.95 - 0.7);
    return 0.8 + normalized * 0.2;
  }
  return clamp01(clamped / 0.7);
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
