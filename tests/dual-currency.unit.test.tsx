import { describe, expect, it } from "vitest";

import {
  buyItem,
  createInitialState,
  getItemPriceCents,
  getMaxAffordableItemCount,
  getWatchPurchaseGate,
  type MilestoneId,
} from "../src/game/state";

describe("dual-currency acquisition", () => {
  it("prioritizes enjoyment when both requirements fail", () => {
    const state = createInitialState();
    const gate = getWatchPurchaseGate(state, "classic", 1);

    expect(gate.ok).toBe(false);
    if (gate.ok) {
      throw new Error("Expected enjoyment gate when enjoyment is missing");
    }
    expect(gate.blocksBy).toBe("enjoyment");
  });

  it("allows purchases when cash and enjoyment are met", () => {
    const baseState = createInitialState();
    const baselineGate = getWatchPurchaseGate(baseState, "classic", 1);
    const price = getItemPriceCents(baseState, "classic", 1);

    const state = {
      ...baseState,
      currencyCents: price,
      enjoymentCents: baselineGate.enjoymentRequiredCents,
    };

    const gate = getWatchPurchaseGate(state, "classic", 1);
    expect(gate.ok).toBe(true);
  });

  it("spends cash but keeps enjoyment intact", () => {
    const baseState = createInitialState();
    const baselineGate = getWatchPurchaseGate(baseState, "classic", 1);
    const price = getItemPriceCents(baseState, "classic", 1);

    const unlockedMilestones: MilestoneId[] = ["collector-shelf"];
    const state = {
      ...baseState,
      currencyCents: price,
      enjoymentCents: baselineGate.enjoymentRequiredCents,
      unlockedMilestones,
    };

    const nextState = buyItem(state, "classic", 1);

    expect(nextState.currencyCents).toBe(state.currencyCents - price);
    expect(nextState.enjoymentCents).toBe(state.enjoymentCents);
  });

  it("returns zero affordable count when enjoyment-locked", () => {
    const baseState = createInitialState();
    const unlockedMilestones: MilestoneId[] = ["collector-shelf"];
    const state = {
      ...baseState,
      currencyCents: 1_000_000,
      enjoymentCents: 0,
      unlockedMilestones,
    };

    expect(getMaxAffordableItemCount(state, "classic")).toBe(0);
  });
});
