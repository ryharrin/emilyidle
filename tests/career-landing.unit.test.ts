import { describe, expect, it } from "vitest";

import { resolveLandingTab } from "../src/ui/navigation/landing";

describe("career landing", () => {
  it("always opens Career first when visible", () => {
    const result = resolveLandingTab({
      search: "?tab=stats",
      hasSave: true,
      navigationState: { lastTabId: "save" },
      isVisible: () => true,
    });

    expect(result).toEqual({ tabId: "career", source: "system" });
  });

  it("ignores saved last-tab and deep links for initial landing", () => {
    const result = resolveLandingTab({
      search: "?tab=save",
      hasSave: true,
      navigationState: { lastTabId: "catalog" },
      isVisible: () => true,
    });

    expect(result).toEqual({ tabId: "career", source: "system" });
  });

  it("falls back to Collection only when Career is hidden", () => {
    const result = resolveLandingTab({
      search: "",
      hasSave: true,
      navigationState: { lastTabId: "save" },
      isVisible: (tabId) => tabId !== "career",
    });

    expect(result).toEqual({ tabId: "collection", source: "system" });
  });
});
