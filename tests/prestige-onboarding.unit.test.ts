import { describe, expect, it } from "vitest";

import { createInitialState } from "../src/game/state";
import { detectPrestigeEvent, getPrestigeOnboardingContent } from "../src/ui/prestigeOnboarding";

describe("prestige onboarding detection", () => {
  it("detects a workshop prestige via workshopPrestigeCount delta", () => {
    const prev = createInitialState();
    const next = {
      ...prev,
      workshopPrestigeCount: prev.workshopPrestigeCount + 1,
      workshopBlueprints: prev.workshopBlueprints + 3,
    };

    const event = detectPrestigeEvent(prev, next, 123);
    expect(event).not.toBeNull();
    expect(event?.tier).toBe("workshop");
    expect(event?.gained.blueprints).toBe(3);
  });

  it("detects a maison prestige only when overridden", () => {
    const prev = createInitialState();
    const next = {
      ...prev,
      maisonHeritage: prev.maisonHeritage + 2,
      maisonReputation: prev.maisonReputation + 1,
    };

    expect(detectPrestigeEvent(prev, next, 123)).toBeNull();

    const event = detectPrestigeEvent(prev, next, 123, "maison");
    expect(event).not.toBeNull();
    expect(event?.tier).toBe("maison");
    expect(event?.gained.heritage).toBe(2);
    expect(event?.gained.reputation).toBe(1);
  });

  it("detects a nostalgia prestige via nostalgiaResets delta", () => {
    const prev = createInitialState();
    const next = {
      ...prev,
      nostalgiaResets: prev.nostalgiaResets + 1,
      nostalgiaLastGain: 7,
      nostalgiaPoints: prev.nostalgiaPoints + 7,
    };

    const event = detectPrestigeEvent(prev, next, 123);
    expect(event).not.toBeNull();
    expect(event?.tier).toBe("nostalgia");
    expect(event?.gained.nostalgia).toBe(7);
  });
});

describe("prestige onboarding copy", () => {
  it("returns exactly one recommended CTA and includes gained currency in the body", () => {
    const workshop = getPrestigeOnboardingContent({
      tier: "workshop",
      gained: { blueprints: 3 },
      occurredAtMs: 1,
    });
    expect(workshop.recommended).toEqual(
      expect.objectContaining({ tabId: "workshop", label: expect.any(String) }),
    );
    expect(workshop.body).toContain("+3");

    const maison = getPrestigeOnboardingContent({
      tier: "maison",
      gained: { heritage: 2, reputation: 1 },
      occurredAtMs: 1,
    });
    expect(maison.recommended).toEqual(
      expect.objectContaining({ tabId: "collection", label: expect.any(String) }),
    );
    expect(maison.body).toContain("+2");
    expect(maison.body).toContain("+1");

    const nostalgia = getPrestigeOnboardingContent({
      tier: "nostalgia",
      gained: { nostalgia: 4 },
      occurredAtMs: 1,
    });
    expect(nostalgia.recommended).toEqual(
      expect.objectContaining({ tabId: "nostalgia", label: expect.any(String) }),
    );
    expect(nostalgia.body).toContain("+4");
  });
});
