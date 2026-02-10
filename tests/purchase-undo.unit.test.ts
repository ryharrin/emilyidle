import { describe, expect, it } from "vitest";

import { createInitialState, getWatchModels } from "../src/game/state";
import { buyWatchModelWithUndo, undoLastPurchase } from "../src/game/actions";

function getStarterModelId(): string {
  const [model] = getWatchModels();
  if (!model) {
    throw new Error("No watch models defined");
  }
  return model.id;
}

function seedResources(state: ReturnType<typeof createInitialState>) {
  return {
    ...state,
    currencyCents: state.currencyCents + 1_000_000,
    enjoymentCents: state.enjoymentCents + 1_000_000,
  };
}

describe("purchase undo", () => {
  it("reverts the most recent purchase within the validity window", () => {
    const baseState = seedResources(createInitialState());
    const modelId = getStarterModelId();
    const baseModelCount = baseState.watchModels[modelId] ?? 0;
    const nowMs = 1_000_000;

    const afterPurchase = buyWatchModelWithUndo(baseState, modelId, nowMs);
    expect(afterPurchase.watchModels[modelId]).toBeGreaterThan(baseModelCount);
    expect(afterPurchase.lastPurchase).not.toBeNull();

    const afterUndo = undoLastPurchase(afterPurchase, nowMs + 5_000);
    expect(afterUndo.watchModels[modelId]).toBe(baseModelCount);
    expect(afterUndo.currencyCents).toBe(baseState.currencyCents);
    expect(afterUndo.lastPurchase).toBeNull();
  });

  it("ignores undo attempts outside the window", () => {
    const baseState = seedResources(createInitialState());
    const modelId = getStarterModelId();
    const nowMs = 1_000_000;

    const afterPurchase = buyWatchModelWithUndo(baseState, modelId, nowMs);
    const afterExpired = undoLastPurchase(afterPurchase, nowMs + 20_000);

    expect(afterExpired).toEqual(afterPurchase);
    expect(afterExpired.lastPurchase).not.toBeNull();
  });

  it("rejects undo when inventory cannot cover the reversal", () => {
    const baseState = seedResources(createInitialState());
    const modelId = getStarterModelId();
    const nowMs = 1_000_000;

    const afterPurchase = buyWatchModelWithUndo(baseState, modelId, nowMs);
    const mutatedState = {
      ...afterPurchase,
      watchModels: {
        ...afterPurchase.watchModels,
        [modelId]: 0,
      },
      items: {
        ...afterPurchase.items,
        [afterPurchase.lastPurchase?.tierId ?? "quartz"]: 0,
      },
    };

    const afterFailedUndo = undoLastPurchase(mutatedState, nowMs + 1_000);
    expect(afterFailedUndo).toEqual(mutatedState);
  });
});
