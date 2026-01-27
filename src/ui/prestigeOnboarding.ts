import type { GameState } from "../game/state";

export type PrestigeEvent = {
  tier: "workshop" | "maison" | "nostalgia";
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

    if (prestigeTierOverride === "maison") {
      return {
        tier: "maison",
        gained: {
          heritage: clampGain(next.maisonHeritage - prev.maisonHeritage),
          reputation: clampGain(next.maisonReputation - prev.maisonReputation),
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
    tabId: "collection" | "workshop" | "maison" | "nostalgia";
  };
} {
  if (event.tier === "workshop") {
    const gained = clampGain(event.gained.blueprints ?? 0).toLocaleString();
    return {
      title: "Atelier reset complete",
      body: `You gained +${gained} Blueprints. Spend them to install Atelier upgrades for your next run.`,
      recommended: {
        label: "Spend your Blueprints on an Atelier upgrade",
        tabId: "workshop",
      },
    };
  }

  if (event.tier === "maison") {
    const heritage = clampGain(event.gained.heritage ?? 0).toLocaleString();
    const reputation = clampGain(event.gained.reputation ?? 0).toLocaleString();
    return {
      title: "Maison prestige complete",
      body: `You gained +${heritage} Heritage and +${reputation} Reputation. Your vault is reset, but Maison legacy remains.`,
      recommended: {
        label: "Return to Vault and rebuild enjoyment for the next legacy",
        tabId: "collection",
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
