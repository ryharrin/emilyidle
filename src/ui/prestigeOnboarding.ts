import type { GameState } from "../game/state";

export type PrestigeEvent = {
  tier: "workshop" | "nostalgia";
  gained: Record<string, number>;
  occurredAtMs: number;
};

const clampGain = (value: number): number => Math.max(0, Math.floor(value));

export function detectPrestigeEvent(
  prev: GameState,
  next: GameState,
  nowMs: number,
  prestigeTierOverride?: PrestigeEvent["tier"],
): PrestigeEvent | null {
  const occurredAtMs = Math.max(0, Math.floor(nowMs));

  if (prestigeTierOverride) {
    if (prestigeTierOverride === "workshop") {
      return {
        tier: "workshop",
        gained: {
          blueprints: clampGain(next.workshopBlueprints - prev.workshopBlueprints),
        },
        occurredAtMs,
      };
    }

    return {
      tier: "nostalgia",
      gained: {
        nostalgia: clampGain(
          next.nostalgiaLastGain > 0
            ? next.nostalgiaLastGain
            : next.nostalgiaPoints - prev.nostalgiaPoints,
        ),
      },
      occurredAtMs,
    };
  }

  if (next.workshopPrestigeCount === prev.workshopPrestigeCount + 1) {
    return {
      tier: "workshop",
      gained: {
        blueprints: clampGain(next.workshopBlueprints - prev.workshopBlueprints),
      },
      occurredAtMs,
    };
  }

  if (next.nostalgiaResets === prev.nostalgiaResets + 1) {
    return {
      tier: "nostalgia",
      gained: {
        nostalgia: clampGain(
          next.nostalgiaLastGain > 0
            ? next.nostalgiaLastGain
            : next.nostalgiaPoints - prev.nostalgiaPoints,
        ),
      },
      occurredAtMs,
    };
  }

  return null;
}

export function getPrestigeOnboardingContent(event: PrestigeEvent): {
  title: string;
  body: string;
  recommended: {
    label: string;
    tabId: "collection" | "workshop" | "nostalgia";
  };
} {
  if (event.tier === "workshop") {
    const gained = clampGain(event.gained.blueprints ?? 0).toLocaleString();
    return {
      title: "Workshop reset complete",
      body: `You gained +${gained} Blueprints. Spend them to install Workshop upgrades for your next run.`,
      recommended: {
        label: "Spend your Blueprints on a Workshop upgrade",
        tabId: "workshop",
      },
    };
  }

  const nostalgia = clampGain(event.gained.nostalgia ?? 0).toLocaleString();
  return {
    title: "Nostalgia prestige complete",
    body: `You gained +${nostalgia} Nostalgia. Your collection carries forward; rebuild the vault and spend points on permanent unlocks.`,
    recommended: {
      label: "Visit the Unlock store to spend Nostalgia",
      tabId: "nostalgia",
    },
  };
}
