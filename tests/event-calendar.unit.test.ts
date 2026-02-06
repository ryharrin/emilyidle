import { describe, expect, it } from "vitest";

import { createInitialState, getEventCalendar } from "../src/game/state";

describe("event calendar selector", () => {
  it("classifies events into active, upcoming, and ready buckets", () => {
    const nowMs = 10_000;
    const base = createInitialState();
    const state = {
      ...base,
      eventStates: {
        ...base.eventStates,
        "wind-up": {
          activeUntilMs: nowMs + 12_000,
          nextAvailableAtMs: nowMs + 22_000,
          incomeMultiplier: 1.11,
        },
        "auction-weekend": {
          activeUntilMs: 0,
          nextAvailableAtMs: nowMs + 8_000,
          incomeMultiplier: 1.6,
        },
      },
    };

    const calendar = getEventCalendar(state, nowMs);

    expect(calendar.active.map((entry) => entry.id)).toContain("wind-up");
    expect(calendar.upcoming.map((entry) => entry.id)).toContain("auction-weekend");
    expect(calendar.ready.map((entry) => entry.id)).toContain("emily-birthday");

    const activeWindUp = calendar.active.find((entry) => entry.id === "wind-up");
    expect(activeWindUp?.countdownMs).toBe(12_000);
    expect(activeWindUp?.bonusLabel).toBe("Income x1.11");

    const upcomingAuction = calendar.upcoming.find((entry) => entry.id === "auction-weekend");
    expect(upcomingAuction?.countdownMs).toBe(8_000);
    expect(upcomingAuction?.bonusExplanation).toMatch(/cooldown/i);
  });

  it("keeps ready events alphabetically sorted", () => {
    const calendar = getEventCalendar(createInitialState(), 0);
    const readyNames = calendar.ready.map((entry) => entry.name);
    const sorted = [...readyNames].sort((a, b) => a.localeCompare(b));
    expect(readyNames).toEqual(sorted);
  });
});
