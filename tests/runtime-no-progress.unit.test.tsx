import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";

import { useGameRuntime } from "../src/game/runtime/useGameRuntime";
import { createInitialState } from "../src/game/state";
import type { SaveLoadResult, SavePersistResult } from "../src/game/persistence";
import type { GameState } from "../src/game/state";

vi.mock("../src/game/runtime/isTestEnvironment", () => ({
  isTestEnvironment: () => false,
}));

function setVisibilityState(value: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value,
  });
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: value === "hidden",
  });
}

function RuntimeHarness(props: {
  loadSave: () => SaveLoadResult;
  persistSave: (state: GameState, lastSimulatedAtMs?: number) => SavePersistResult;
  step: (state: GameState, dtMs: number, nowMs?: number) => GameState;
  onState: (state: GameState) => void;
}) {
  const { state } = useGameRuntime({
    initialState: createInitialState,
    step: props.step,
    loadSave: props.loadSave,
    clearSave: () => ({ ok: true }),
    persistSave: props.persistSave,
    devSettings: {
      enabled: false,
      speedMultiplier: 1,
    },
  });

  useEffect(() => {
    props.onState(state);
  }, [props, state]);

  return null;
}

describe("runtime no-progress invariant", () => {
  let frameQueue: FrameRequestCallback[];

  const runFrame = (timeMs: number) => {
    const callback = frameQueue.shift();
    expect(callback).toBeDefined();
    act(() => {
      callback?.(timeMs);
    });
  };

  beforeEach(() => {
    frameQueue = [];
    setVisibilityState("visible");
    vi.spyOn(Date, "now").mockReturnValue(0);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
      frameQueue.push(callback);
      return frameQueue.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setVisibilityState("visible");
  });

  it("does not progress while hidden and does not catch up on immediate resume", async () => {
    let latestState = createInitialState();
    const persistedSimTimes: number[] = [];

    const step = vi.fn((state: GameState, dtMs: number, nowMs = 0): GameState => {
      const currentEventState = state.eventStates["auction-weekend"];
      return {
        ...state,
        currencyCents: state.currencyCents + dtMs,
        enjoymentCents: state.enjoymentCents + dtMs,
        interactionNextAvailableAtMsByItem: {
          ...state.interactionNextAvailableAtMsByItem,
          quartz: nowMs + 2_000,
        },
        eventStates: {
          ...state.eventStates,
          "auction-weekend": {
            ...currentEventState,
            activeUntilMs: nowMs + 5_000,
            nextAvailableAtMs: nowMs + 9_000,
          },
        },
      };
    });

    render(
      <RuntimeHarness
        loadSave={() => ({ ok: false, empty: true })}
        persistSave={(_, lastSimulatedAtMs) => {
          persistedSimTimes.push(lastSimulatedAtMs ?? -1);
          return { ok: true };
        }}
        step={step}
        onState={(state) => {
          latestState = state;
        }}
      />,
    );

    runFrame(100);
    runFrame(200);

    await waitFor(() => {
      expect(step).toHaveBeenCalledTimes(1);
      expect(latestState.currencyCents).toBe(100);
      expect(latestState.enjoymentCents).toBe(300);
    });

    const stateAfterVisibleTick = {
      currencyCents: latestState.currencyCents,
      enjoymentCents: latestState.enjoymentCents,
      cooldownMs: latestState.interactionNextAvailableAtMsByItem.quartz,
      eventActiveUntilMs: latestState.eventStates["auction-weekend"]?.activeUntilMs,
      eventNextAvailableAtMs: latestState.eventStates["auction-weekend"]?.nextAvailableAtMs,
    };

    setVisibilityState("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    runFrame(10_000);
    runFrame(20_000);

    expect(step).toHaveBeenCalledTimes(1);
    expect(latestState.currencyCents).toBe(stateAfterVisibleTick.currencyCents);
    expect(latestState.enjoymentCents).toBe(stateAfterVisibleTick.enjoymentCents);
    expect(latestState.interactionNextAvailableAtMsByItem.quartz).toBe(stateAfterVisibleTick.cooldownMs);
    expect(latestState.eventStates["auction-weekend"]?.activeUntilMs).toBe(
      stateAfterVisibleTick.eventActiveUntilMs,
    );
    expect(latestState.eventStates["auction-weekend"]?.nextAvailableAtMs).toBe(
      stateAfterVisibleTick.eventNextAvailableAtMs,
    );

    expect(persistedSimTimes.length).toBeGreaterThan(0);

    setVisibilityState("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    runFrame(20_100);
    expect(step).toHaveBeenCalledTimes(1);
    expect(latestState.currencyCents).toBe(stateAfterVisibleTick.currencyCents);

    runFrame(20_200);

    await waitFor(() => {
      expect(step).toHaveBeenCalledTimes(2);
      expect(latestState.currencyCents).toBe(200);
      expect(latestState.enjoymentCents).toBe(400);
    });
  });
});
