import { describe, expect, it } from "vitest";

import { createInitialState, getWatchPurchaseGate } from "../src/game/state";

describe("purchase gates", () => {
  it("blocks by enjoyment when enjoyment is below the requirement", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      currencyCents: 1_000_000_000,
      enjoymentCents: 0,
    };

    const gate = getWatchPurchaseGate(seededState, "classic", 1);
    expect(gate.ok).toBe(false);
    if (gate.ok) {
      throw new Error("Expected purchase gate to be blocked by enjoyment");
    }

    expect(gate.blocksBy).toBe("enjoyment");
    expect(gate.enjoymentDeficitCents).toBe(gate.enjoymentRequiredCents);
    expect(gate.cashDeficitCents).toBeUndefined();
  });

  it("blocks by cash when enjoyment is satisfied but cash is insufficient", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      currencyCents: 0,
      enjoymentCents: 1_000_000_000,
    };

    const gate = getWatchPurchaseGate(seededState, "classic", 1);
    expect(gate.ok).toBe(false);
    if (gate.ok) {
      throw new Error("Expected purchase gate to be blocked by cash");
    }

    expect(gate.blocksBy).toBe("cash");
    expect(gate.cashDeficitCents).toBe(gate.cashPriceCents);
    expect(gate.enjoymentDeficitCents).toBeUndefined();
  });
});
