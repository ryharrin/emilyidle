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

export function getWindingTension(progress01: number): number {
  const clamped = clamp01(progress01);
  const base = clamp01((clamped - 0.3) / 0.7);
  if (clamped > 0.95) {
    return clamp01(base + (clamped - 0.95) * 4);
  }
  return base;
}

export function getWindingTensionPercent(progress01: number): number {
  return Math.round(getWindingTension(progress01) * 100);
}

export function getWindingVelocity(progress01: number): number {
  const clamped = clamp01(progress01);
  if (clamped >= 0.95) {
    const normalized = (clamped - 0.95) / 0.05;
    return clamp01(0.85 + normalized * 0.15);
  }
  if (clamped >= 0.7) {
    const normalized = (clamped - 0.7) / 0.25;
    return clamp01(0.65 + normalized * 0.25);
  }
  const normalized = clamped / 0.7;
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
