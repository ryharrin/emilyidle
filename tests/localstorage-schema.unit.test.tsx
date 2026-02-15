import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import App from "../src/App";
import { createInitialState } from "../src/game/state";

describe("localStorage schema compatibility", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("boots with persisted settings payloads", async () => {
    localStorage.setItem(
      "emily-idle:settings",
      JSON.stringify({
        themeMode: "dark",
        hideCompletedAchievements: true,
        hiddenTabs: [],
        coachmarksDismissed: {},
        confirmNostalgiaUnlocks: true,
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });

  it("boots with persisted navigation payloads and falls back to default tab", async () => {
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: createInitialState(),
      }),
    );
    localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "collection" }));

    render(<App />);

    const careerTab = await screen.findByRole("tab", { name: "Career" });
    await waitFor(() => {
      expect(careerTab.getAttribute("aria-selected")).toBe("true");
    });
  });
});
