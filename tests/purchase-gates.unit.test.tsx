import { describe, expect, it } from "vitest";

import { createInitialState, getWatchModelPurchaseGate, getWatchModels } from "../src/game/state";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

function getClassicModelId(): string {
  const model = getWatchModels().find((entry) => entry.id === CLASSIC_MODEL_ID);
  if (!model) {
    throw new Error(`Missing automatic watch model: ${CLASSIC_MODEL_ID}`);
  }
  return model.id;
}

describe("purchase gates", () => {
  it("blocks quartz purchases on a fresh save until cash is earned", () => {
    const baseState = createInitialState();
    const quartzModel = getWatchModels().find((model) => model.tierId === "quartz");
    if (!quartzModel) {
      throw new Error("Expected at least one quartz watch model");
    }

    const gate = getWatchModelPurchaseGate(baseState, quartzModel.id);

    expect(gate.ok).toBe(false);
    if (gate.ok) {
      throw new Error("Expected quartz purchase gate to be blocked on a fresh save");
    }

    expect(gate.blocksBy).toBe("cash");
    expect(gate.cashDeficitCents).toBeGreaterThan(0);
  });

  it("blocks by enjoyment when enjoyment is below the requirement", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      currencyCents: 1_000_000_000,
      enjoymentCents: 0,
    };

    const gate = getWatchModelPurchaseGate(seededState, getClassicModelId());
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

    const gate = getWatchModelPurchaseGate(seededState, getClassicModelId());
    expect(gate.ok).toBe(false);
    if (gate.ok) {
      throw new Error("Expected purchase gate to be blocked by cash");
    }

    expect(gate.blocksBy).toBe("cash");
    expect(gate.cashDeficitCents).toBe(gate.cashPriceCents);
    expect(gate.enjoymentDeficitCents).toBeUndefined();
  });
});
